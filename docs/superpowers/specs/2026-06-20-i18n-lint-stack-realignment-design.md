# i18n / lint スタック再調整 設計

**日付**: 2026-06-20
**対象**: Astro ポートフォリオの i18n と lint/format ツールを、Astro と相性の良い構成へ揃え直す

---

## 背景・動機

Astro ポートフォリオの再構築過程で、フレームワーク本体ではなく **周辺ツール選定**に起因する摩擦が2点表面化した。

1. **i18n（Paraglide / inlang）が CDN 依存**
   メッセージ変換プラグインを jsdelivr CDN から実行時 fetch する構成で、ネットワーク制限環境ではメッセージが 0 件になりビルドが壊れうる。直近で「CDN プラグインをローカルへベンダリング」して暫定回避済みだが、そもそも Paraglide のルーティング機能は使っておらず、**13 キー×2 言語の型付き辞書としてしか使っていない**。オーバースペックかつ脆い。

2. **Biome が `.astro` を完全サポートしない**
   Biome は `.astro` のテンプレート部（`---` の外）を解析しないため、frontmatter の import / 変数がテンプレートで使われていても「未使用」と誤検知する。直近で `.astro` override により誤検知を抑制済みだが、これは Biome 側の構造的限界の回避にすぎない。

いずれも **Astro 本体の問題ではなく、ツール選定の問題**。フレームウォークは Astro のまま維持し、i18n と lint/format を Astro エコシステムの定石構成へ揃え直す。

## ゴール / 非ゴール

**ゴール**
- ビルドが外部 CDN・浮動バージョンに依存しない i18n に置き換える。
- `.astro` を正しく解析できる lint/format に置き換え、誤検知抑制の override を不要にする。
- 既存の見た目・機能（UnoCSS、Three.js 背景、各コンポーネント、Vitest 7 件）を壊さない。

**非ゴール**
- playground ページ（Three.js）の本実装。今回は対象外。
- 翻訳テキストの内容拡充（仮データのままで可）。

---

## 設計

### 1. i18n：Paraglide → Astro 標準 i18n + 自前辞書

Astro 標準 i18n が提供するのは **ルーティングとロケール検出**であり、翻訳辞書そのものは提供しない（辞書は自前で持つのが Astro の定石）。よって「Astro i18n ルーティング + 自前 TypeScript 辞書」の組み合わせとする。

**辞書**
- `src/i18n/ui.ts` に `ja` / `en` の翻訳を TypeScript オブジェクトで保持。キーは `as const` で型付けし、`t(locale, key)` ヘルパで引く。存在しないキーは型エラーになる（タイポ検出）。
- 移植するキーは現状の 13 個：`nav_about` / `nav_skills` / `nav_works` / `nav_links` / `nav_playground`、`hero_name` / `hero_role` / `hero_tagline`、`about_heading` / `skills_heading` / `works_heading` / `links_heading`、`lang_switch_to`。
- `src/i18n/utils.ts` の `Locale` 型（`'ja' | 'en'`）は維持し、辞書と同居させる。

**ルーティング**
- `astro.config.mjs` に下記を設定：
  ```js
  i18n: {
    locales: ['ja', 'en'],
    defaultLocale: 'ja',
    routing: { prefixDefaultLocale: true },
  }
  ```
- URL 戦略は **全言語 prefix**：`/ja/`・`/en/`。`/` は `/ja/` へリダイレクトする。リダイレクトは `astro.config.mjs` の `redirects: { '/': '/ja/' }` で静的に張る（静的ビルドで確実に出力されるため）。

**ページ構成**
- 現状の `src/pages/index.astro`（ja）と `src/pages/en/index.astro`（en）は内容がほぼ重複しているため、`src/pages/[lang]/index.astro` の動的ルート 1 ファイルへ集約する。`getStaticPaths` で `ja` / `en` を生成し、`lang` を各コンポーネントへ props で渡す（現状の props 伝播パターンを踏襲）。

**言語別リンク**
- Hero の `playHref`（`locale === 'ja' ? '/playground/' : '/en/playground/'` の手動分岐）を、Astro の `getRelativeLocaleUrl(locale, 'playground')` に置換。リンク先は `/ja/playground/`・`/en/playground/`（ページ未作成のため 404 のままだが、壊れた手動分岐は除去される）。

**コンポーネント置換**
- 各コンポーネントの `import { m } from '../paraglide/messages.js'` と `m.key({}, { locale })` を、`import { t } from '../i18n/ui'` と `t(locale, 'key')` に置換。対象：`Nav` / `Hero` / `About` / `Skills` / `Works` / `Links`（および `Base` レイアウト）。

**撤去**
- 依存：`@inlang/paraglide-js`
- ディレクトリ / ファイル：`project.inlang/`、`messages/`、`.inlang/`、`src/paraglide/`（生成物・gitignore 済み）
- `astro.config.mjs` の `paraglideVitePlugin`（`vite.plugins`）

### 2. lint / format：Biome → ESLint + Prettier

Astro 公式推奨の定番構成へ移行する。`.astro` を専用パーサで解析するため、今回の誤検知は構造的に発生しなくなる。

**ESLint**
- `eslint` + `eslint-plugin-astro` + `typescript-eslint`。
- `eslint.config.js`（flat config）で `.astro` を `astro-eslint-parser` で解析。`.ts` / `.mjs` は `typescript-eslint` パーサ。
- 誤検知抑制のための override は不要になる（テンプレート部まで解析されるため `noUnusedImports` / `noUnusedVariables` が正しく判定される）。

**Prettier**
- `prettier` + `prettier-plugin-astro`。
- `.prettierrc` で現状の Biome フォーマット設定を踏襲：シングルクォート、セミコロンあり、インデント スペース 2、行幅 100。

**package.json scripts**
- `lint`: `eslint .`
- `format`: `prettier --write .`

**撤去**
- 依存：`@biomejs/biome`
- ファイル：`biome.json`

**config-protection フックとの関係**
- 現状フックは `biome.json` を保護対象にしているが、本作業で Biome を削除するため保護対象自体が消える。新設の `eslint.config.js` / `.prettierrc` が同フックの保護対象に含まれるかは作業時に確認する。

### 3. playground

本実装は対象外（非ゴール）。i18n 移行に伴い Hero のリンク生成のみ `getRelativeLocaleUrl` ベースへ変わる。404 解消は別タスク。

---

## テスト戦略

- 既存の Vitest 7 件を維持し、移行で壊れないことを各段階で確認する。
- 自前辞書の `t()` ヘルパに最小のユニットテストを追加（キー解決、未知ロケール/キーの扱い）。
- 各段階で次の 4 つを緑に保つ：`pnpm build`（静的生成）、`astro check`（型）、`pnpm lint`、`pnpm test`。

## 作業順序（段階移行）

1. **i18n 移行**：自前辞書化 → `[lang]` 動的ルート集約 → 各コンポーネントの `m()` → `t()` 置換 → Paraglide / inlang 撤去。
2. **lint/format 移行**：Biome 撤去 → ESLint + Prettier 導入 → 整形。
3. **検証**：build / check / lint / test 全緑。

## リスク・留意点

- `[lang]` 動的ルート集約で `getStaticPaths` の戻り値と props の型を合わせる必要がある。型は `astro check` で担保。
- 全言語 prefix 化で `/` のブックマークや既存 URL が `/ja/` へ変わる。個人ポートフォリオのため影響は限定的だが、リダイレクトは必ず張る。
- ESLint flat config と `eslint-plugin-astro` のバージョン整合に注意（Astro 6 系・TypeScript 6 系との組み合わせ）。
