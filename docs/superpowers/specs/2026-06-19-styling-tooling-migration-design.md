# ポートフォリオサイト 周辺パッケージ移行 設計書

**日付**: 2026-06-19
**対象**: `yui666a.me`（個人ポートフォリオ / Astro）
**ブランチ**: `rebuild-astro`

## 背景と動機

既存の Astro サイトの土台（コンポーネント構造・型付きデータ層・自前 i18n）は十分に使える状態にある。
そのため**ゼロからの再構築はせず、既存 `src/` を活かしながら**、以下を達成する：

1. **スタイリング基盤の整備** — 素 CSS（`global.css` + 各 `<style>`）を体系的な手法へ移行
2. **学習・実験** — モダンな周辺パッケージ（UnoCSS / Paraglide / Biome）を採用して学ぶ
3. **コードベースの整理** — 品質ツール導入・構成整理

デザインそのものの刷新は目的ではない。**見た目は概ね維持**したままのリファクタ移行とする。

## スコープ

- **やる**: スタイリング移行、i18n ライブラリ移行、Lint/Format 導入、構成整理
- **やらない**: デザイン刷新、データ内容の変更、Three.js 演出の作り替え、新機能追加
- **退避済み**: `legacy_2022/`（参照用にそのまま温存）

## 確定スタック

| 項目 | 現状 | 移行後 |
|---|---|---|
| フレームワーク | Astro 6 | **維持** |
| スタイリング | 素 CSS（`global.css` + 各 `<style>`） | **UnoCSS（`presetWind4` 中心）** |
| i18n | 自前 `t()` + JSON 辞書 | **Paraglide JS**（`@inlang/paraglide-astro`） |
| ルーティング (i18n) | Astro 組み込み（`/`=ja, `/en/`=en） | **維持** |
| Lint / Format | なし（`astro check` のみ） | **Biome 単体**（`.astro`/`.ts`/`.json`/CSS） |
| Hero 背景 | Three.js | **島として維持**（`client:` 化を整理） |
| テスト | Vitest | **維持**（移行に追従して更新） |
| パッケージマネージャ | pnpm | **維持** |

### 選定理由（要点）
- **UnoCSS / `presetWind4`**: Tailwind v4 互換でユーティリティ知識が学習資産になる。`@unocss/astro` で純 `.astro` でも利用可。Headless UI は用途がないため見送り（必要時に島単位で後付け可能）。
- **Paraglide JS**: コンパイラ型で**型安全なメッセージ関数** (`m.nav_about()`)、補間・複数形ネイティブ対応、クライアント tree-shake が最小。自前 `t()` の弱点（型が効かない・補間なし）を解消。2 ロケール小規模のためサーバーバンドル肥大の懸念は無視できる。
- **Biome**: v2.3+ で `.astro` のフォーマット・リントに対応（experimental だが実用域）。Oxfmt は `.astro` 未対応のため不採用。フォーマッタ+リンタ一体で構成がシンプル。

## アーキテクチャ（移行後のデータフロー）

```
data/*.ts ──→ Component.astro ──→ ページ (index.astro / en/index.astro)
                   ↑                        ↑
        m.*() (Paraglide, 型安全)   UnoCSS utility classes
                                            ↑
                              uno.config.ts (theme = デザイントークン)
```

- **データ層** (`src/data/*.ts`): 流用。`title.ja/.en` 構造は維持（テストもこれに依存）。
- **文言**: Paraglide のメッセージ関数で型安全に解決。
- **見た目**: UnoCSS ユーティリティクラス。デザイントークンは `uno.config.ts` の `theme` に集約。

## 各移行の具体方針

### A. UnoCSS への移行
- `@unocss/astro` を `astro.config.mjs` の integration に追加、`uno.config.ts` を作成。
- プリセット: `presetWind4` 主軸。アイコン使用時は `presetIcons` 追加検討。
- `global.css` の CSS 変数（色・余白・タイポ）を `uno.config.ts` の `theme` へ移植。
- グローバルに残すべきもの（リセット、ベースレイヤー、フォント定義）は `global.css` に最小限残す。
- 各 `.astro` の `<style>` を**1 コンポーネントずつ**ユーティリティ化し、都度見た目を確認。
- `HeroBackground`（Three.js）はロジックを触らず、ラッパーの見た目のみユーティリティ化。

### B. Paraglide JS への移行
- `@inlang/paraglide-astro` を integration に追加、`project.inlang/` 設定を作成。
- `ja.json`/`en.json` を Paraglide メッセージ形式へ変換 → ビルド時に型付き関数を生成。
- 各コンポーネントの `t(locale, 'nav.about')` → `m.nav_about()` に置換。
- 自前 `src/i18n/utils.ts`（`t`/`getDict`/`otherLocale`）は撤去。ロケール切替は Paraglide API / Astro 標準で対応。
- ネストキー (`nav.about`) → Paraglide のフラットキー (`nav_about`) への変換を移植時に吸収。
- Astro 標準 i18n ルーティングは維持し、Paraglide のロケール検出と整合させる。

### C. Biome 導入
- `biome.json` を作成。`.astro`/`.ts`/`.json`/CSS を対象。
- `package.json` に `lint` / `format` スクリプト追加。
- 既存コードに一度適用（整形差分は単独コミット）。

### D. 整理
- ツール設定ファイル（`uno.config.ts`, `biome.json`, `project.inlang/`）をルートに集約。
- 移行で不要になるファイル（`src/i18n/utils.ts` 等）は最終ステップで削除。

## 実装ステップ（段階移行）

各ステップ終了時に **`pnpm build` と `pnpm test` が緑**であることを保証する。各ステップは独立コミット。

| # | ステップ | 内容 | 完了条件 |
|---|---|---|---|
| 0 | 準備 | 現状の build/test がパスすることを確認（ベースライン） | 緑を確認 |
| 1 | Biome 導入 | `biome.json`、`lint`/`format` スクリプト、全体適用（整形差分は単独コミット） | lint/format 通る |
| 2 | UnoCSS 導入 | `@unocss/astro` + `uno.config.ts`（`presetWind4`）、トークンを `theme` へ移植 | ビルド通る・見た目維持 |
| 3 | スタイル移行 | 各 `.astro` の `<style>` を順次 UnoCSS 化（1 つずつ）。Hero はラッパーのみ | 各移行後に見た目確認 |
| 4 | Paraglide 導入 | `@inlang/paraglide-astro` + `project.inlang/`、辞書をメッセージへ変換 | 型付き `m.*()` 生成 |
| 5 | i18n 置換 | `t()` → `m.*()`、`utils.ts` 撤去、ルーティング整合 | ビルド通る・両言語表示 OK |
| 6 | 仕上げ | 不要ファイル削除、テスト確認（必要なら i18n 存在チェック追加）、最終整形 | build / test 緑 |

## テスト方針

- 既存 `tests/data.test.ts` はデータ層（works/skills/timeline）のみを検証し、i18n の `t()` に依存しない。
  → i18n 移行では基本そのまま緑を保てる。`title.ja/.en` 構造は変更しない。
- 移行に追従してテストを更新（i18n のメッセージ存在チェックを追加する場合はステップ 6 で対応）。

## リスクと対応

| リスク | 対応 |
|---|---|
| Paraglide × Astro 標準 i18n の役割競合 | ルーティング=Astro / 文言=Paraglide と分担。検出ロジックの競合をステップ 5 で確認 |
| UnoCSS 移行中の見た目崩れ | 1 コンポーネントずつ移行・確認で局所化 |
| 各ツールの `.astro` 対応の experimental 性 | ステップごとに build/test で検証。問題時はコミット単位で切り戻し |
| 移行途中の不整合 | 各ステップを独立コミットし、常に緑を保つ |
