# i18n / lint スタック再調整 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Astro は維持したまま、i18n を Paraglide(CDN依存) から Astro 標準 i18n + 自前辞書へ、lint/format を Biome(.astro 誤検知) から ESLint + Prettier へ置き換える。

**Architecture:** 翻訳辞書を `src/i18n/ui.ts` の型付き TypeScript オブジェクトに集約し、`t(locale, key)` で引く。ページは `src/pages/[lang]/index.astro` の動的ルートに集約し、全言語 prefix(`/ja/`・`/en/`)で配信、`/` は `/ja/` へリダイレクト。lint は ESLint flat config + eslint-plugin-astro、format は Prettier + prettier-plugin-astro。

**Tech Stack:** Astro 6, TypeScript 6, UnoCSS, Vitest 4, ESLint 9(flat config), Prettier 3, pnpm 10

## Global Constraints

- パッケージマネージャは **pnpm**。ネットワーク制限環境のためインストールは可能な限り `pnpm install --offline` を先に試し、失敗時のみ通常インストール。
- ロケールは `'ja' | 'en'` の2つのみ。`defaultLocale` は `ja`。
- URL 戦略は **全言語 prefix**：`/ja/`・`/en/`。`/` は `/ja/` へ静的リダイレクト。
- 翻訳キーは既存の13個を維持：`nav_about` `nav_skills` `nav_works` `nav_links` `nav_playground` `hero_name` `hero_role` `hero_tagline` `about_heading` `skills_heading` `works_heading` `links_heading` `lang_switch_to`。
- 翻訳テキストの内容は現状の値をそのまま移植（仮データ含む）。`hero_tagline` の TODO もそのまま。
- 各タスク完了時、変更に関係する範囲で `pnpm build` / `pnpm test` / `astro check` / `pnpm lint`(該当タスク以降) を緑に保つ。
- コミットメッセージは Conventional Commits（`feat:`/`fix:`/`refactor:`/`chore:`/`docs:`/`test:`）。

### 翻訳テキスト（移植元の正データ）

`ja` / `en` の順で記載。これを Task 1 の辞書にそのまま使う。

| key | ja | en |
|---|---|---|
| nav_about | About | About |
| nav_skills | Skills | Skills |
| nav_works | Works | Works |
| nav_links | Links | Links |
| nav_playground | Playground | Playground |
| hero_name | 相曽 結 | AISO, Hitoshi |
| hero_role | Software Engineer | Software Engineer |
| hero_tagline | TODO(未確定): 自分を表す一言 | TODO(未確定): a one-line tagline |
| about_heading | About | About |
| skills_heading | Skills | Skills |
| works_heading | Works | Works |
| links_heading | Links | Links |
| lang_switch_to | EN | JP |

---

## File Structure

**新規作成**
- `src/i18n/ui.ts` — 翻訳辞書(`ja`/`en`)と `t(locale, key)` ヘルパ。`Locale` 型もここへ集約。
- `src/pages/[lang]/index.astro` — 動的ルート。`getStaticPaths` で ja/en を生成。
- `eslint.config.js` — ESLint flat config。
- `.prettierrc` — Prettier 設定。
- `.prettierignore` — Prettier 除外。

**修正**
- `astro.config.mjs` — paraglideVitePlugin 削除、`prefixDefaultLocale: true`、`redirects` 追加。
- `src/layouts/Base.astro` 他コンポーネント — `m()` → `t()`、import 差し替え。
- `src/i18n/utils.ts` — `Locale` 型を `ui.ts` へ移し、再エクスポート or 削除。
- `tests/i18n.test.ts` — 自前辞書ベースのテストへ書き換え。
- `package.json` — 依存差し替え、scripts 変更。

**削除**
- `src/pages/index.astro`, `src/pages/en/index.astro`（`[lang]` へ集約）
- `project.inlang/`, `messages/`, `.inlang/`, `src/paraglide/`
- `biome.json`
- 依存: `@inlang/paraglide-js`, `@biomejs/biome`

---

## フェーズ A：i18n 移行

### Task A1: 自前翻訳辞書 `src/i18n/ui.ts` の作成

**Files:**
- Create: `src/i18n/ui.ts`
- Modify: `src/i18n/utils.ts`
- Test: `tests/i18n.test.ts`（書き換え）

**Interfaces:**
- Produces:
  - `export type Locale = 'ja' | 'en'`
  - `export const locales: readonly Locale[]`
  - `export const ui: Record<Locale, Record<MessageKey, string>>`
  - `export type MessageKey`（13キーの union）
  - `export function t(locale: Locale, key: MessageKey): string`

- [ ] **Step 1: 失敗するテストを書く**

`tests/i18n.test.ts` を全置換：

```ts
import { describe, expect, it } from 'vitest';
import { type Locale, locales, type MessageKey, t, ui } from '../src/i18n/ui';

describe('i18n 自前辞書', () => {
  it('ja と en が同じキー集合を持つ', () => {
    const keysOf = (loc: Locale) => Object.keys(ui[loc]).sort();
    expect(keysOf('ja')).toEqual(keysOf('en'));
  });

  it('t() が locale に応じた文字列を返す', () => {
    expect(t('ja', 'nav_works')).toBe('Works');
    expect(t('ja', 'hero_name')).toBe('相曽 結');
    expect(t('en', 'hero_name')).toBe('AISO, Hitoshi');
  });

  it('言語切替ラベルが相手の言語を指す', () => {
    expect(t('ja', 'lang_switch_to')).toBe('EN');
    expect(t('en', 'lang_switch_to')).toBe('JP');
  });

  it('locales は ja と en を含む', () => {
    expect([...locales].sort()).toEqual(['en', 'ja']);
  });

  it('全 locale × 全 key が空でない文字列', () => {
    const keys = Object.keys(ui.ja) as MessageKey[];
    for (const loc of locales) {
      for (const k of keys) {
        expect(typeof t(loc, k)).toBe('string');
        expect(t(loc, k).length).toBeGreaterThan(0);
      }
    }
  });
});
```

- [ ] **Step 2: テスト実行して失敗を確認**

Run: `pnpm vitest run tests/i18n.test.ts`
Expected: FAIL（`src/i18n/ui` が解決できない）

- [ ] **Step 3: `src/i18n/ui.ts` を実装**

```ts
// 翻訳辞書。ロケールは ja/en の2つ。キーは ui.ja の形から型推論される。
export type Locale = 'ja' | 'en';

export const locales = ['ja', 'en'] as const satisfies readonly Locale[];

export const defaultLocale: Locale = 'ja';

export const ui = {
  ja: {
    nav_about: 'About',
    nav_skills: 'Skills',
    nav_works: 'Works',
    nav_links: 'Links',
    nav_playground: 'Playground',
    hero_name: '相曽 結',
    hero_role: 'Software Engineer',
    hero_tagline: 'TODO(未確定): 自分を表す一言',
    about_heading: 'About',
    skills_heading: 'Skills',
    works_heading: 'Works',
    links_heading: 'Links',
    lang_switch_to: 'EN',
  },
  en: {
    nav_about: 'About',
    nav_skills: 'Skills',
    nav_works: 'Works',
    nav_links: 'Links',
    nav_playground: 'Playground',
    hero_name: 'AISO, Hitoshi',
    hero_role: 'Software Engineer',
    hero_tagline: 'TODO(未確定): a one-line tagline',
    about_heading: 'About',
    skills_heading: 'Skills',
    works_heading: 'Works',
    links_heading: 'Links',
    lang_switch_to: 'JP',
  },
} as const;

export type MessageKey = keyof (typeof ui)['ja'];

export function t(locale: Locale, key: MessageKey): string {
  return ui[locale][key];
}
```

- [ ] **Step 4: `src/i18n/utils.ts` を `ui.ts` 再エクスポートへ変更**

`Locale` 型の二重定義を避けるため、`utils.ts` は `ui.ts` から再エクスポートするだけにする（既存 import パスを壊さない）：

```ts
// ロケール型は src/i18n/ui.ts に集約。後方互換のため再エクスポートする。
export type { Locale } from './ui';
```

- [ ] **Step 5: テスト実行して成功を確認**

Run: `pnpm vitest run tests/i18n.test.ts`
Expected: PASS（5 tests）

- [ ] **Step 6: 型チェック**

Run: `pnpm astro check`
Expected: this task 由来の新規エラーなし（既存の Paraglide 参照エラーは後続タスクで解消されるため、`src/i18n/` と `tests/i18n.test.ts` にエラーが無ければ可）

- [ ] **Step 7: コミット**

```bash
git add src/i18n/ui.ts src/i18n/utils.ts tests/i18n.test.ts
git commit -m "feat: 自前型付き i18n 辞書 ui.ts を追加し i18n テストを移行"
```

---

### Task A2: コンポーネントの `m()` → `t()` 置換

**Files:**
- Modify: `src/components/Nav.astro`, `src/components/Hero.astro`, `src/components/About.astro`, `src/components/Skills.astro`, `src/components/Works.astro`, `src/components/Links.astro`

**Interfaces:**
- Consumes: `t(locale, key)` from `src/i18n/ui.ts`（Task A1）

各ファイルで共通の変換ルール：
1. `import { m } from '../paraglide/messages.js';` を `import { t } from '../i18n/ui';` に置換。
2. `m.KEY({}, { locale })` を `t(locale, 'KEY')` に置換。

- [ ] **Step 1: `Nav.astro` を変換**

import 行を差し替え、テンプレート内の5箇所を変換：
- `{m.nav_about({}, { locale })}` → `{t(locale, 'nav_about')}`
- `{m.nav_skills({}, { locale })}` → `{t(locale, 'nav_skills')}`
- `{m.nav_works({}, { locale })}` → `{t(locale, 'nav_works')}`
- `{m.nav_links({}, { locale })}` → `{t(locale, 'nav_links')}`
- `{m.lang_switch_to({}, { locale })}` → `{t(locale, 'lang_switch_to')}`

- [ ] **Step 2: `Hero.astro` を変換**

import 行を差し替え、テンプレート内の4箇所を変換（`playHref` は Task A4 で扱うので**ここでは触らない**）：
- `{m.hero_name({}, { locale })}` → `{t(locale, 'hero_name')}`
- `{m.hero_role({}, { locale })}` → `{t(locale, 'hero_role')}`
- `{m.hero_tagline({}, { locale })}` → `{t(locale, 'hero_tagline')}`
- `{m.nav_playground({}, { locale })}` → `{t(locale, 'nav_playground')}`

- [ ] **Step 3: `About.astro` / `Skills.astro` / `Works.astro` / `Links.astro` を変換**

それぞれ import 行を差し替え、heading 1箇所ずつ変換：
- About: `{m.about_heading({}, { locale })}` → `{t(locale, 'about_heading')}`
- Skills: `{m.skills_heading({}, { locale })}` → `{t(locale, 'skills_heading')}`
- Works: `{m.works_heading({}, { locale })}` → `{t(locale, 'works_heading')}`
- Links: `{m.links_heading({}, { locale })}` → `{t(locale, 'links_heading')}`

- [ ] **Step 4: paraglide 参照が消えたことを確認**

Run: `grep -rn "paraglide" src/ | grep -v "src/paraglide/"`
Expected: 出力なし（astro.config.mjs はまだ残るが src/ 配下のコンポーネント参照はゼロ）

- [ ] **Step 5: 型チェック**

Run: `pnpm astro check`
Expected: コンポーネント由来の `m`/paraglide エラーが消えている

- [ ] **Step 6: コミット**

```bash
git add src/components/
git commit -m "refactor: 各コンポーネントの m() を自前 t() に置換"
```

---

### Task A3: `astro.config.mjs` を全言語 prefix + redirect へ更新し paraglide を撤去

**Files:**
- Modify: `astro.config.mjs`

**Interfaces:**
- Produces: `/` → `/ja/` リダイレクト、`prefixDefaultLocale: true`

- [ ] **Step 1: `astro.config.mjs` を全置換**

```js
import UnoCSS from '@unocss/astro';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://yui666a.me',
  base: '/',
  integrations: [UnoCSS({ injectReset: false })],
  i18n: {
    defaultLocale: 'ja',
    locales: ['ja', 'en'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
  redirects: {
    '/': '/ja/',
  },
});
```

- [ ] **Step 2: コミット**

```bash
git add astro.config.mjs
git commit -m "refactor: astro i18n を全言語 prefix 化し paraglide plugin を撤去"
```

注: この時点でビルドはまだ通らない（`pages/index.astro` 等が古い構造のまま）。Task A4 で解消する。

---

### Task A4: ページを `[lang]/index.astro` 動的ルートへ集約

**Files:**
- Create: `src/pages/[lang]/index.astro`
- Delete: `src/pages/index.astro`, `src/pages/en/index.astro`
- Modify: `src/components/Hero.astro`（playHref を getRelativeLocaleUrl 化）

**Interfaces:**
- Consumes: `locales`, `Locale` from `src/i18n/ui.ts`
- Produces: `/ja/`・`/en/` の2ページ

- [ ] **Step 1: `src/pages/[lang]/index.astro` を作成**

タイトル/説明は言語別。`getStaticPaths` で2ロケールを生成し、`lang` を型安全に取り出す：

```astro
---
import { type Locale, locales } from '../../i18n/ui';
import Base from '../../layouts/Base.astro';
import Nav from '../../components/Nav.astro';
import Hero from '../../components/Hero.astro';
import About from '../../components/About.astro';
import Skills from '../../components/Skills.astro';
import Works from '../../components/Works.astro';
import Links from '../../components/Links.astro';

export function getStaticPaths() {
  return locales.map((lang) => ({ params: { lang } }));
}

const lang = Astro.params.lang as Locale;

const meta = {
  ja: { title: '相曽 結 | Portfolio', description: '相曽 結のポートフォリオ' },
  en: { title: 'AISO, Hitoshi | Portfolio', description: 'Portfolio of AISO, Hitoshi' },
} as const;
---
<Base locale={lang} title={meta[lang].title} description={meta[lang].description}>
  <Nav locale={lang} />
  <Hero locale={lang} />
  <About locale={lang} />
  <Skills locale={lang} />
  <Works locale={lang} />
  <Links locale={lang} />
</Base>
```

- [ ] **Step 2: 旧ページを削除**

```bash
git rm src/pages/index.astro src/pages/en/index.astro
```

- [ ] **Step 3: `Hero.astro` の playHref を getRelativeLocaleUrl 化**

frontmatter の手動分岐を Astro ヘルパへ置換。import を追加し、`playHref` の定義行を変更：

```astro
import { getRelativeLocaleUrl } from 'astro:i18n';
```
```astro
const playHref = getRelativeLocaleUrl(locale, 'playground');
```

（`locale === 'ja' ? '/playground/' : '/en/playground/'` の行を上記に置換。リンク先は `/ja/playground/`・`/en/playground/` を指す。ページ未作成のため 404 のままだが手動分岐は除去される。）

- [ ] **Step 4: クリーンビルドで2ページ生成を確認**

Run: `pnpm build 2>&1 | grep -E "index.html|page\(s\)|Complete|error"`
Expected: `/ja/index.html` と `/en/index.html` が生成され、`page(s) built`、エラーなし

- [ ] **Step 5: リダイレクト生成を確認**

Run: `test -f dist/index.html && grep -l "0;url=/ja/" dist/index.html`
Expected: `dist/index.html` が存在し、`/ja/` への meta refresh を含む（Astro の静的 redirects 出力）

- [ ] **Step 6: テストと型チェック**

Run: `pnpm test && pnpm astro check`
Expected: test 全 PASS、astro check エラーなし

- [ ] **Step 7: コミット**

```bash
git add src/pages/ src/components/Hero.astro
git commit -m "refactor: ページを [lang] 動的ルートへ集約し言語別リンクを astro:i18n 化"
```

---

### Task A5: Paraglide / inlang の残骸を撤去

**Files:**
- Delete: `project.inlang/`, `messages/`, `.inlang/`, `src/paraglide/`
- Modify: `package.json`（`@inlang/paraglide-js` 削除）, `.gitignore`（`src/paraglide/` 行削除）

- [ ] **Step 1: 依存を package.json から削除**

`dependencies` から `"@inlang/paraglide-js": "^2.20.0",` の行を削除。

- [ ] **Step 2: ディレクトリ/ファイルを削除**

```bash
git rm -r project.inlang messages .inlang
rm -rf src/paraglide
```
（`src/paraglide/` は gitignore 済みで未追跡のため `rm -rf`。）

- [ ] **Step 3: `.gitignore` から paraglide 行を削除**

`# Paraglide 生成物` と `src/paraglide/` の2行を削除。

- [ ] **Step 4: ロックファイル更新（オフライン優先）**

Run: `pnpm install --offline 2>&1 | tail -3 || pnpm install 2>&1 | tail -3`
Expected: `@inlang/paraglide-js` が削除される

- [ ] **Step 5: paraglide 参照が完全に消えたことを確認**

Run: `grep -rn "paraglide\|inlang" src/ astro.config.mjs package.json tests/ 2>/dev/null | grep -v node_modules`
Expected: 出力なし

- [ ] **Step 6: フルビルド・テスト**

Run: `pnpm build && pnpm test && pnpm astro check`
Expected: すべて成功、`/ja/`・`/en/` 生成

- [ ] **Step 7: コミット**

```bash
git add -A
git commit -m "chore: Paraglide/inlang の依存と生成設定を撤去"
```

---

## フェーズ B：lint/format 移行

### Task B1: Biome を撤去し ESLint + Prettier を導入

**Files:**
- Create: `eslint.config.js`, `.prettierrc`, `.prettierignore`
- Delete: `biome.json`
- Modify: `package.json`（依存・scripts）

**Interfaces:**
- Produces: `pnpm lint`(eslint .), `pnpm format`(prettier --write .)

- [ ] **Step 1: 依存を入れ替え**

`package.json` の `devDependencies` から `"@biomejs/biome": "^2.5.0",` を削除し、以下を追加：

```json
"eslint": "^9.18.0",
"eslint-plugin-astro": "^1.3.1",
"typescript-eslint": "^8.20.0",
"prettier": "^3.4.2",
"prettier-plugin-astro": "^0.14.1",
```

Run: `pnpm install --offline 2>&1 | tail -3 || pnpm install 2>&1 | tail -3`
Expected: ESLint/Prettier 一式が入り、biome が消える。（オフラインで未取得なら通常インストールへフォールバック。）

- [ ] **Step 2: `biome.json` を削除**

```bash
git rm biome.json
```
注: `biome.json` は config-protection フックの保護対象。削除自体は `git rm`(Bash) で行うためフックに当たらない。新規作成する `eslint.config.js`/`.prettierrc` がフック保護対象に当たる場合は Bash の heredoc で書く。

- [ ] **Step 3: `eslint.config.js`（flat config）を作成**

```js
import eslintPluginAstro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['dist/', 'node_modules/', '.astro/'],
  },
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
];
```

- [ ] **Step 4: `.prettierrc` を作成（旧 Biome 整形を踏襲）**

```json
{
  "singleQuote": true,
  "semi": true,
  "tabWidth": 2,
  "printWidth": 100,
  "plugins": ["prettier-plugin-astro"],
  "overrides": [{ "files": "*.astro", "options": { "parser": "astro" } }]
}
```

- [ ] **Step 5: `.prettierignore` を作成**

```
dist/
node_modules/
.astro/
pnpm-lock.yaml
```

- [ ] **Step 6: scripts を更新**

`package.json` の scripts を変更：
- `"lint": "biome check ."` → `"lint": "eslint ."`
- `"format": "biome check --write ."` → `"format": "prettier --write ."`

- [ ] **Step 7: フォーマット適用**

Run: `pnpm format 2>&1 | tail -5`
Expected: 対象ファイルが整形される（差分が出ても可）

- [ ] **Step 8: lint 実行**

Run: `pnpm lint 2>&1 | tail -20`
Expected: exit 0。`.astro` の frontmatter import/変数の誤検知が**出ない**こと（テンプレート部まで解析されるため）。本物の指摘が出た場合は内容を確認し、誤検知でなければ修正する。

- [ ] **Step 9: 全体検証**

Run: `pnpm lint; echo "lint:$?"; pnpm build >/dev/null 2>&1; echo "build:$?"; pnpm test >/dev/null 2>&1; echo "test:$?"; pnpm astro check >/dev/null 2>&1; echo "check:$?"`
Expected: 全て `:0`

- [ ] **Step 10: コミット**

```bash
git add -A
git commit -m "refactor: lint/format を Biome から ESLint + Prettier へ移行"
```

---

## フェーズ C：最終検証

### Task C1: 全グリーン確認とクリーンアップ

**Files:**
- 確認のみ（必要なら微修正）

- [ ] **Step 1: クリーンビルドから全チェック**

Run:
```bash
rm -rf dist && pnpm build >/dev/null 2>&1; echo "build:$?"
pnpm test >/dev/null 2>&1; echo "test:$?"
pnpm lint >/dev/null 2>&1; echo "lint:$?"
pnpm astro check >/dev/null 2>&1; echo "check:$?"
```
Expected: 全て `:0`

- [ ] **Step 2: 生成物の URL 構造を確認**

Run: `find dist -name "*.html" | sort`
Expected: `dist/index.html`(redirect), `dist/ja/index.html`, `dist/en/index.html`

- [ ] **Step 3: 撤去漏れの最終 grep**

Run: `grep -rn "biome\|paraglide\|inlang" . --include="*.json" --include="*.mjs" --include="*.js" --include="*.ts" --include="*.astro" 2>/dev/null | grep -v node_modules | grep -v pnpm-lock`
Expected: 出力なし（docs/ の設計・計画内の言及を除く。出た場合は docs 配下のみであることを確認）

- [ ] **Step 4: 設計ドキュメントとの突き合わせ**

spec(`docs/superpowers/specs/2026-06-20-i18n-lint-stack-realignment-design.md`)のゴールが全て満たされているか目視確認。未達があれば対応。

- [ ] **Step 5: 最終コミット（差分があれば）**

```bash
git add -A
git commit -m "chore: i18n/lint スタック再調整の最終クリーンアップ" || echo "no changes"
```
