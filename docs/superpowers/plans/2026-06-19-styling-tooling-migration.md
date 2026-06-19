# スタイリング/i18n/品質ツール移行 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 既存 Astro ポートフォリオの見た目を維持したまま、スタイリングを UnoCSS、i18n を Paraglide JS、Lint/Format を Biome へ移行する。

**Architecture:** 既存 `src/`（コンポーネント構造・型付きデータ層）を流用。各 `.astro` のインラインスタイル/`<style>` を UnoCSS ユーティリティ + `uno.config.ts` の `theme` トークンへ置換し、自前 i18n (`t()`) を Paraglide のメッセージ関数 (`m.*()`) へ置換する。各ステップ後に build/test が緑であることを保証し、独立コミットする。

**Tech Stack:** Astro 6, UnoCSS 66 (`presetWind4`), Paraglide JS 2 (`@inlang/paraglide-astro` 0.4), Biome 2.5, Three.js 0.184, Vitest 4, pnpm.

## Global Constraints

- パッケージマネージャは **pnpm** を使う（`pnpm add` / `pnpm add -D`）。
- 各タスク完了時に `pnpm build` と `pnpm test` が **両方緑**であること。
- **見た目を変えない**（デザイン刷新ではなくリファクタ移行）。色・余白・タイポは現行 `global.css` の値を厳密に踏襲する。
- デザイントークンの値（verbatim）:
  - 色: `--bg:#fbfbf9` / `--fg:#1a1a1a` / `--muted:#6b6b6b` / `--line:#e6e5e0` / `--accent:#2f6df0`
  - 幅: `--maxw:720px` / `--pad: clamp(1.25rem, 5vw, 2rem)`
  - 余白(8pxベース): `--s-1:0.5rem` `--s-2:0.75rem` `--s-3:1rem` `--s-4:1.5rem` `--s-5:2.5rem` `--s-6:4rem` `--s-7:6rem`
  - フォント: `--font-sans: "Inter","Noto Sans JP",system-ui,-apple-system,"Hiragino Kaku Gothic ProN",sans-serif` / `--leading:1.8`
- ロケールは **ja / en** のみ。ルーティングは Astro 標準（`/`=ja, `/en/`=en, `prefixDefaultLocale:false`）を維持。
- `legacy_2022/` は触らない。

---

## Task 1: Biome 導入とベースライン整形

**Files:**
- Create: `biome.json`
- Modify: `package.json`（scripts に `lint` / `format` 追加）

**Interfaces:**
- Consumes: なし
- Produces: `pnpm lint`（チェックのみ）, `pnpm format`（書き込み）コマンド。後続タスクはこれで整形・検査する。

- [ ] **Step 1: ベースライン確認**

Run: `pnpm build && pnpm test`
Expected: 両方成功（移行前の緑を確認）。失敗する場合は先に原因を解消する。

- [ ] **Step 2: Biome を導入**

Run: `pnpm add -D @biomejs/biome`

- [ ] **Step 3: `biome.json` を作成**

`.astro` は Biome v2.3+ で experimental 対応のためフォーマット対象に含めつつ、未対応構文での事故を避けるためフォーマットは有効・一部リントルールは緩める。

```json
{
  "$schema": "https://biomejs.dev/schemas/2.5.0/schema.json",
  "vcs": { "enabled": true, "clientKind": "git", "useIgnoreFile": true },
  "files": {
    "includes": ["src/**/*", "tests/**/*", "*.ts", "*.mjs", "*.json"]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": { "recommended": true }
  },
  "javascript": {
    "formatter": { "quoteStyle": "single", "semicolons": "always" }
  },
  "assist": { "actions": { "source": { "organizeImports": "on" } } }
}
```

- [ ] **Step 4: `package.json` に scripts を追加**

`scripts` ブロックに以下 2 行を追加する（既存の `test` 行の後など）:

```json
    "lint": "biome check .",
    "format": "biome check --write ."
```

- [ ] **Step 5: 全体に整形を適用**

Run: `pnpm format`
Expected: 既存ファイルが整形される。`.astro` で意図しない崩れが出た場合は、その差分のみ手動で戻すか `biome.json` の `overrides` で当該ファイルのフォーマットを無効化する。

- [ ] **Step 6: build / test が緑であることを確認**

Run: `pnpm build && pnpm test`
Expected: 両方成功。

- [ ] **Step 7: Commit**

```bash
git add biome.json package.json src tests
git commit -m "chore: Biome を導入し全体を整形"
```

---

## Task 2: UnoCSS 導入とデザイントークン定義

**Files:**
- Create: `uno.config.ts`
- Modify: `astro.config.mjs`（integration 追加）
- Modify: `src/layouts/Base.astro:2`（`uno.css` の import 追加）

**Interfaces:**
- Consumes: なし
- Produces: `uno.config.ts` の `theme` トークン。後続タスクはこれを参照してユーティリティクラスを書く。トークン名は以下に固定する:
  - 色: `bg` `fg` `muted` `line` `accent`（例: `bg-bg` `text-fg` `text-muted` `border-line` `text-accent`）
  - フォント: `font-sans`
  - 最大幅: `max-w-content`（=720px）

- [ ] **Step 1: UnoCSS を導入**

Run: `pnpm add -D unocss @unocss/astro @unocss/preset-wind4`

- [ ] **Step 2: `uno.config.ts` を作成**

現行 `global.css` のトークンを verbatim で移植する。

```ts
import { defineConfig } from 'unocss';
import presetWind4 from '@unocss/preset-wind4';

export default defineConfig({
  presets: [presetWind4()],
  theme: {
    colors: {
      bg: '#fbfbf9',
      fg: '#1a1a1a',
      muted: '#6b6b6b',
      line: '#e6e5e0',
      accent: '#2f6df0',
    },
    fontFamily: {
      sans: '"Inter","Noto Sans JP",system-ui,-apple-system,"Hiragino Kaku Gothic ProN",sans-serif',
    },
    maxWidth: {
      content: '720px',
    },
  },
  // 現行の余白スケール(8pxベース)を任意値ではなくショートカット可能にしておく
  shortcuts: {
    // セクション縦余白(=--s-7: 6rem)
    'section-y': 'py-[6rem]',
    // 1カラム読みやすい幅 + 左右パディング(=--pad)
    container: 'w-full max-w-content mx-auto px-[clamp(1.25rem,5vw,2rem)]',
  },
});
```

- [ ] **Step 3: `astro.config.mjs` に integration を追加**

ファイル先頭の import に追記し、`integrations` 配列を追加する。

```js
import { defineConfig } from 'astro/config';
import UnoCSS from '@unocss/astro';

export default defineConfig({
  site: 'https://yui666a.me',
  base: '/',
  integrations: [UnoCSS({ injectReset: false })],
  i18n: {
    defaultLocale: 'ja',
    locales: ['ja', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
```

（`injectReset: false`: 既存 `global.css` のリセットを使い続け、見た目を変えないため。）

- [ ] **Step 4: `Base.astro` で `uno.css` を import**

`src/layouts/Base.astro` の frontmatter（2 行目）、`import '../styles/global.css';` の直後に追加:

```astro
import 'virtual:uno.css';
```

- [ ] **Step 5: build が通ることを確認**

Run: `pnpm build`
Expected: 成功。まだクラスを使っていないので見た目は不変。

- [ ] **Step 6: dev で見た目が不変なことを確認**

Run: `pnpm dev`（手動で `http://localhost:4321/` と `/en/` を開く）
Expected: 移行前と同一の見た目。確認後 dev を停止。

- [ ] **Step 7: Commit**

```bash
git add uno.config.ts astro.config.mjs src/layouts/Base.astro package.json pnpm-lock.yaml
git commit -m "feat: UnoCSS(presetWind4) を導入しデザイントークンを定義"
```

---

## Task 3: グローバルCSS を UnoCSS 前提に整理

**Files:**
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: Task 2 の `uno.config.ts` トークン
- Produces: `.reveal` / `.reveal.is-visible` クラス（Base.astro のスクリプトが参照）と base 要素スタイルは `global.css` に残す。`.container` `section` `.muted` は後続でユーティリティ化するため**この段階では残す**（互換維持）。

- [ ] **Step 1: `global.css` のうちトークン定義(`:root`)はそのまま残す確認**

`:root` の CSS 変数は `HeroBackground.astro` など一部がまだ参照しうるため**削除しない**。本タスクは「重複の整理」ではなく「現状維持の確認」のみ行い、ファイルは変更しない。

理由: トークンは `uno.config.ts` と `global.css` に二重定義となるが、移行完了（Task 8）まで両者を保持して安全に進める。

- [ ] **Step 2: build / test 確認**

Run: `pnpm build && pnpm test`
Expected: 両方成功。

> 注: このタスクは「グローバルCSSを今は触らない」という明示的な判断を記録するための no-op タスク。コミットは不要。次タスクへ進む。

---

## Task 4: Nav と SectionHeading の UnoCSS 化

**Files:**
- Modify: `src/components/Nav.astro`
- Modify: `src/components/SectionHeading.astro`

**Interfaces:**
- Consumes: `uno.config.ts` トークン（`text-muted` `border-line` 等）, `container` shortcut
- Produces: なし（見た目維持のリファクタ）

- [ ] **Step 1: `Nav.astro` のインラインスタイルをユーティリティ化**

`src/components/Nav.astro` の `<nav>` 以下を以下に置換（frontmatter は変更しない）:

```astro
<nav class="container flex justify-between items-center py-[1.5rem]">
  <a
    href={locale === 'ja' ? '/' : '/en/'}
    class="font-bold tracking-[0.12em] no-underline text-[0.95rem]"
  >AISO</a>
  <div class="flex gap-[1.5rem] items-center text-[0.85rem]">
    <a href="#about" class="no-underline text-muted">{t(locale, 'nav.about')}</a>
    <a href="#skills" class="no-underline text-muted">{t(locale, 'nav.skills')}</a>
    <a href="#works" class="no-underline text-muted">{t(locale, 'nav.works')}</a>
    <a href="#links" class="no-underline text-muted">{t(locale, 'nav.links')}</a>
    <a
      href={otherHref}
      class="border border-line px-[0.7rem] py-[0.25rem] rounded-full no-underline text-[0.8rem] tracking-[0.05em]"
    >{t(locale, 'lang.switchTo')}</a>
  </div>
</nav>
```

- [ ] **Step 2: `SectionHeading.astro` をユーティリティ化**

`src/components/SectionHeading.astro` の `<h2>` 以下を置換:

```astro
<h2 class="flex items-baseline gap-[0.7rem] mb-[1.5rem]">
  <span class="text-accent [font-variant-numeric:tabular-nums]">{num}</span>
  <span class="w-[1.6rem] h-px bg-line self-center"></span>
  <span>{label}</span>
</h2>
```

- [ ] **Step 3: 見た目確認**

Run: `pnpm dev`（`/` と `/en/` で Nav の表示・言語切替リンクを確認）
Expected: 移行前と同一。確認後停止。

- [ ] **Step 4: build / test 確認**

Run: `pnpm build && pnpm test`
Expected: 両方成功。

- [ ] **Step 5: Commit**

```bash
git add src/components/Nav.astro src/components/SectionHeading.astro
git commit -m "refactor: Nav と SectionHeading を UnoCSS 化"
```

---

## Task 5: Hero と HeroBackground の UnoCSS 化

**Files:**
- Modify: `src/components/Hero.astro`
- Modify: `src/components/HeroBackground.astro`

**Interfaces:**
- Consumes: `uno.config.ts` トークン, `container` shortcut
- Produces: なし。Three.js のロジック（`<script>`）と accent 色 `#2f6df0` は変更しない。

- [ ] **Step 1: `Hero.astro` のインラインスタイルをユーティリティ化**

`src/components/Hero.astro` の frontmatter は変更せず、`<div>` 以下を置換:

```astro
<div class="relative overflow-hidden">
  <HeroBackground />
  <header class="container relative z-[1] pt-[6rem] pb-[4rem] min-h-[64vh] flex flex-col justify-center">
    <h1 class="text-[clamp(2.6rem,8vw,4rem)] mb-[1rem] tracking-[-0.03em]">{t(locale, 'hero.name')}</h1>
    <p class="text-muted text-[1.05rem] font-medium tracking-[0.02em] mb-[0.75rem]">{t(locale, 'hero.role')}</p>
    <p class="text-[1.05rem] max-w-[34em] mb-[2.5rem]">{t(locale, 'hero.tagline')}</p>
    <a
      href={playHref}
      class="inline-flex items-center gap-[0.5rem] border border-accent text-accent px-[1.2rem] py-[0.6rem] rounded-full no-underline text-[0.95rem] font-medium w-fit backdrop-blur-[4px]"
    >
      <span class="text-[0.8em]">▶</span> {t(locale, 'nav.playground')}
    </a>
  </header>
</div>
```

- [ ] **Step 2: `HeroBackground.astro` の `<style>` をユーティリティ化**

`<canvas>` 行を以下に置換し、`<style>` ブロック全体を削除する（マスクは任意値ユーティリティで表現）。`<script>` ブロックは**一切変更しない**。

置換後の `<canvas>`:

```astro
<canvas
  id="hero-bg"
  aria-hidden="true"
  class="absolute inset-0 w-full h-full z-0 pointer-events-none [mask-image:linear-gradient(to_bottom,#000_60%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,#000_60%,transparent_100%)]"
></canvas>
```

削除する `<style>` ブロック（8〜20 行目）:

```css
<style>
  #hero-bg { ... }
</style>
```

- [ ] **Step 3: 見た目・アニメーション確認**

Run: `pnpm dev`（Hero の粒子背景アニメーション、下端フェード、CTAボタンを確認。`prefers-reduced-motion` も DevTools で確認できれば確認）
Expected: 移行前と同一の挙動。確認後停止。

- [ ] **Step 4: build / test 確認**

Run: `pnpm build && pnpm test`
Expected: 両方成功。

- [ ] **Step 5: Commit**

```bash
git add src/components/Hero.astro src/components/HeroBackground.astro
git commit -m "refactor: Hero と HeroBackground を UnoCSS 化"
```

---

## Task 6: About / Skills / Works / Links の UnoCSS 化

**Files:**
- Modify: `src/components/About.astro`
- Modify: `src/components/Skills.astro`
- Modify: `src/components/Works.astro`
- Modify: `src/components/Links.astro`

**Interfaces:**
- Consumes: `uno.config.ts` トークン, `container` / `section-y` shortcut
- Produces: なし。各 `<section>` の `container reveal` クラスと `id` は維持（Nav アンカーと reveal スクリプトが依存）。

- [ ] **Step 1: `About.astro` をユーティリティ化**

`<section>` 以下を置換（frontmatter・TODO コメントは維持）:

```astro
<section id="about" class="container reveal section-y">
  <h2>{t(locale, 'about.heading')}</h2>
  <!-- TODO(未確定): プロフィール本文・経歴タイムラインを後で詰める -->
  <p class="max-w-[34em] leading-[1.9]">奈良工業高等専門学校 → 長岡技術科学大学 情報・経営システム工学</p>
</section>
```

> 注: 現行 `global.css` の `section { padding-block: var(--s-7); }` を `section-y` shortcut で明示する。`section + section { border-top }` の罫線は global.css 側に残るため、ここでは追加しない。

- [ ] **Step 2: `Skills.astro` をユーティリティ化**

`<section>` 以下を置換:

```astro
<section id="skills" class="container reveal section-y">
  <h2>{t(locale, 'skills.heading')}</h2>
  {skills.map((cat) => (
    <div class="mb-[2.5rem]">
      <h3 class="text-[0.9rem] font-semibold text-muted mb-[1rem]">{locale === 'ja' ? cat.category.ja : cat.category.en}</h3>
      <ul class="list-none p-0 m-0 flex flex-wrap gap-[0.75rem_1.5rem]">
        {cat.items.map((item) => (
          <li class="flex items-center gap-[0.5rem] text-[0.95rem]">
            {item.logo && <img src={item.logo} alt={item.name} width="22" height="22" class="inline" />}
            <span>{item.name}</span>
          </li>
        ))}
      </ul>
    </div>
  ))}
</section>
```

- [ ] **Step 3: `Works.astro` をユーティリティ化**

`<section>` 以下を置換:

```astro
<section id="works" class="container reveal section-y">
  <h2>{t(locale, 'works.heading')}</h2>
  <div class="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-[1rem]">
    {works.map((w) => (
      <a
        href={w.url}
        target="_blank"
        rel="noopener"
        class="border border-line rounded-[12px] p-[1.5rem] no-underline block bg-white transition-[border-color] duration-150"
      >
        <h3 class="mt-0 mb-[0.75rem] text-[1.05rem] tracking-[-0.01em]">{locale === 'ja' ? w.title.ja : w.title.en}</h3>
        <p class="text-muted mt-0 mb-[1rem] text-[0.9rem] leading-[1.6]">{locale === 'ja' ? w.summary.ja : w.summary.en}</p>
        <div class="flex flex-wrap gap-[0.4rem]">
          {w.tags.map((tag) => (
            <span class="text-[0.72rem] text-muted border border-line px-[0.55rem] py-[0.15rem] rounded-full">{tag}</span>
          ))}
        </div>
      </a>
    ))}
  </div>
</section>
```

- [ ] **Step 4: `Links.astro` をユーティリティ化**

`<section>` 以下を置換（frontmatter の links 配列・TODO は維持）:

```astro
<section id="links" class="container reveal section-y">
  <h2>{t(locale, 'links.heading')}</h2>
  <ul class="list-none p-0 m-0 flex flex-wrap gap-[1.5rem]">
    {links.map((l) => (
      <li>
        <a href={l.url} target="_blank" rel="noopener" class="text-[0.95rem] no-underline border-b border-line pb-[0.15rem]">{l.label}</a>
      </li>
    ))}
  </ul>
</section>
```

- [ ] **Step 5: 見た目確認**

Run: `pnpm dev`（`/` と `/en/` で全セクションの見た目・reveal アニメ・Works カード・Links を確認）
Expected: 移行前と同一。確認後停止。

- [ ] **Step 6: build / test 確認**

Run: `pnpm build && pnpm test`
Expected: 両方成功。

- [ ] **Step 7: Commit**

```bash
git add src/components/About.astro src/components/Skills.astro src/components/Works.astro src/components/Links.astro
git commit -m "refactor: About/Skills/Works/Links を UnoCSS 化"
```

---

## Task 7: Paraglide JS 導入とメッセージ移植

**Files:**
- Create: `project.inlang/settings.json`
- Create: `messages/ja.json`
- Create: `messages/en.json`
- Modify: `astro.config.mjs`（paraglide integration 追加）
- Modify: `.gitignore`（生成物 `src/paraglide/` を無視）

**Interfaces:**
- Consumes: なし
- Produces: ビルド時に `src/paraglide/messages.js` が生成され、`import { m } from '../paraglide/messages'` から型付き関数 `m.nav_about()` `m.hero_name()` 等が使える。キー命名規則（フラット、`_` 区切り）:
  - `nav_about` `nav_skills` `nav_works` `nav_links` `nav_playground`
  - `hero_name` `hero_role` `hero_tagline`
  - `about_heading` `skills_heading` `works_heading` `links_heading`
  - `lang_switchTo`

- [ ] **Step 1: Paraglide を導入**

Run: `pnpm add @inlang/paraglide-js && pnpm add -D @inlang/paraglide-astro`

- [ ] **Step 2: `project.inlang/settings.json` を作成**

```json
{
  "$schema": "https://inlang.com/schema/project-settings",
  "baseLocale": "ja",
  "locales": ["ja", "en"],
  "modules": [
    "https://cdn.jsdelivr.net/npm/@inlang/plugin-message-format@latest/dist/index.js"
  ],
  "plugin.inlang.messageFormat": {
    "pathPattern": "./messages/{locale}.json"
  }
}
```

- [ ] **Step 3: `messages/ja.json` を作成**

現行 `src/i18n/ja.json` の値を verbatim でフラットキーへ移植する。

```json
{
  "$schema": "https://inlang.com/schema/inlang-message-format",
  "nav_about": "About",
  "nav_skills": "Skills",
  "nav_works": "Works",
  "nav_links": "Links",
  "nav_playground": "Playground",
  "hero_name": "相曽 結",
  "hero_role": "Software Engineer",
  "hero_tagline": "TODO(未確定): 自分を表す一言",
  "about_heading": "About",
  "skills_heading": "Skills",
  "works_heading": "Works",
  "links_heading": "Links",
  "lang_switchTo": "EN"
}
```

- [ ] **Step 4: `messages/en.json` を作成**

現行 `src/i18n/en.json` の値を verbatim でフラットキーへ移植する。

```json
{
  "$schema": "https://inlang.com/schema/inlang-message-format",
  "nav_about": "About",
  "nav_skills": "Skills",
  "nav_works": "Works",
  "nav_links": "Links",
  "nav_playground": "Playground",
  "hero_name": "AISO, Hitoshi",
  "hero_role": "Software Engineer",
  "hero_tagline": "TODO(未確定): a one-line tagline",
  "about_heading": "About",
  "skills_heading": "Skills",
  "works_heading": "Works",
  "links_heading": "Links",
  "lang_switchTo": "JP"
}
```

- [ ] **Step 5: `astro.config.mjs` に paraglide integration を追加**

import と integrations を追記:

```js
import { defineConfig } from 'astro/config';
import UnoCSS from '@unocss/astro';
import { paraglide } from '@inlang/paraglide-astro';

export default defineConfig({
  site: 'https://yui666a.me',
  base: '/',
  integrations: [
    UnoCSS({ injectReset: false }),
    paraglide({ project: './project.inlang', outdir: './src/paraglide' }),
  ],
  i18n: {
    defaultLocale: 'ja',
    locales: ['ja', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
```

- [ ] **Step 6: `.gitignore` に生成物を追加**

`.gitignore` の末尾に追記:

```
# Paraglide 生成物
src/paraglide/
```

- [ ] **Step 7: build で生成を確認**

Run: `pnpm build`
Expected: 成功し、`src/paraglide/messages.js` 等が生成される。`ls src/paraglide/` で確認。

- [ ] **Step 8: Commit**

```bash
git add project.inlang messages astro.config.mjs .gitignore package.json pnpm-lock.yaml
git commit -m "feat: Paraglide JS を導入しメッセージを移植"
```

---

## Task 8: i18n 呼び出しを Paraglide へ置換し自前実装を撤去

**Files:**
- Modify: `src/components/Nav.astro`
- Modify: `src/components/Hero.astro`
- Modify: `src/components/About.astro`
- Modify: `src/components/Skills.astro`
- Modify: `src/components/Works.astro`
- Modify: `src/components/Links.astro`
- Modify: `src/layouts/Base.astro`（`Locale` 型の import 元を変更）
- Modify: `src/pages/index.astro` / `src/pages/en/index.astro`（`locale` の扱いは維持、型 import のみ）
- Create: `src/i18n/locale.ts`（`Locale` 型と `otherLocale` を残す受け皿）
- Delete: `src/i18n/utils.ts` / `src/i18n/ja.json` / `src/i18n/en.json`

**Interfaces:**
- Consumes: Task 7 の `m.*()`、`setLocale`（`../paraglide/runtime`）
- Produces: `src/i18n/locale.ts` が `export type Locale = 'ja' | 'en'` と `export function otherLocale(locale: Locale): Locale` を提供。`Locale` 型はこれまで `../i18n/utils` から来ていたが、以後はここから import する。

- [ ] **Step 1: `src/i18n/locale.ts` を作成**

`utils.ts` から翻訳ロジックを除いた、型とヘルパーだけを残す。

```ts
export type Locale = 'ja' | 'en';

export function otherLocale(locale: Locale): Locale {
  return locale === 'ja' ? 'en' : 'ja';
}
```

- [ ] **Step 2: 各コンポーネントで Paraglide を呼ぶよう置換**

Paraglide のメッセージはロケールを引数で受け取れる（`m.nav_about({}, { locale })`）。各コンポーネントの frontmatter で import を差し替え、本文の `t(locale, 'x.y')` を `m.x_y({}, { locale })` へ置換する。

`Nav.astro` frontmatter:

```astro
---
import { m } from '../paraglide/messages';
import { otherLocale, type Locale } from '../i18n/locale';
interface Props { locale: Locale; }
const { locale } = Astro.props;
const other = otherLocale(locale);
const otherHref = other === 'ja' ? '/' : '/en/';
---
```

`Nav.astro` 本文の `{t(locale, 'nav.about')}` 等を順に置換:
- `{t(locale, 'nav.about')}` → `{m.nav_about({}, { locale })}`
- `{t(locale, 'nav.skills')}` → `{m.nav_skills({}, { locale })}`
- `{t(locale, 'nav.works')}` → `{m.nav_works({}, { locale })}`
- `{t(locale, 'nav.links')}` → `{m.nav_links({}, { locale })}`
- `{t(locale, 'lang.switchTo')}` → `{m.lang_switchTo({}, { locale })}`

`Hero.astro` frontmatter:

```astro
---
import { m } from '../paraglide/messages';
import type { Locale } from '../i18n/locale';
import HeroBackground from './HeroBackground.astro';
interface Props { locale: Locale; }
const { locale } = Astro.props;
const playHref = locale === 'ja' ? '/playground/' : '/en/playground/';
---
```

`Hero.astro` 本文の置換:
- `{t(locale, 'hero.name')}` → `{m.hero_name({}, { locale })}`
- `{t(locale, 'hero.role')}` → `{m.hero_role({}, { locale })}`
- `{t(locale, 'hero.tagline')}` → `{m.hero_tagline({}, { locale })}`
- `{t(locale, 'nav.playground')}` → `{m.nav_playground({}, { locale })}`

`About.astro` frontmatter:

```astro
---
import { m } from '../paraglide/messages';
import type { Locale } from '../i18n/locale';
interface Props { locale: Locale; }
const { locale } = Astro.props;
---
```

`About.astro` 本文: `{t(locale, 'about.heading')}` → `{m.about_heading({}, { locale })}`

`Skills.astro` frontmatter（`skills` の import は維持）:

```astro
---
import { m } from '../paraglide/messages';
import type { Locale } from '../i18n/locale';
import { skills } from '../data/skills';
interface Props { locale: Locale; }
const { locale } = Astro.props;
---
```

`Skills.astro` 本文: `{t(locale, 'skills.heading')}` → `{m.skills_heading({}, { locale })}`

`Works.astro` frontmatter（`works` の import は維持）:

```astro
---
import { m } from '../paraglide/messages';
import type { Locale } from '../i18n/locale';
import { works } from '../data/works';
interface Props { locale: Locale; }
const { locale } = Astro.props;
---
```

`Works.astro` 本文: `{t(locale, 'works.heading')}` → `{m.works_heading({}, { locale })}`

`Links.astro` frontmatter（links 配列・TODO は維持）:

```astro
---
import { m } from '../paraglide/messages';
import type { Locale } from '../i18n/locale';
interface Props { locale: Locale; }
const { locale } = Astro.props;
// TODO(未確定): 実際のURLに差し替える
const links = [
  { label: 'GitHub', url: 'https://github.com/yui666a' },
  { label: 'Qiita', url: 'https://qiita.com/' },
  { label: 'Zenn', url: 'https://zenn.dev/' },
  { label: 'X', url: 'https://x.com/' },
  { label: 'Mail', url: 'mailto:haiso666@gmail.com' },
];
---
```

`Links.astro` 本文: `{t(locale, 'links.heading')}` → `{m.links_heading({}, { locale })}`

- [ ] **Step 3: `Base.astro` の型 import 元を変更**

`src/layouts/Base.astro` の frontmatter で `import type { Locale } from '../i18n/utils';` を以下に変更:

```astro
import type { Locale } from '../i18n/locale';
```

- [ ] **Step 4: ページの型整合を確認**

`src/pages/index.astro` / `src/pages/en/index.astro` は `const locale = 'ja' as const;` 形式で型 import に依存していないため変更不要。念のため `grep` で旧 import が残っていないか確認する。

Run: `grep -rn "i18n/utils" src/`
Expected: 出力なし（全て置換済み）。

- [ ] **Step 5: 自前 i18n ファイルを削除**

```bash
git rm src/i18n/utils.ts src/i18n/ja.json src/i18n/en.json
```

- [ ] **Step 6: build / test 確認**

Run: `pnpm build && pnpm test`
Expected: 両方成功。`m.*()` の型エラーが出た場合はキー名を Task 7 の命名規則と照合して修正。

- [ ] **Step 7: dev で両言語表示を確認**

Run: `pnpm dev`（`/` で日本語、`/en/` で英語、言語切替リンクの遷移を確認）
Expected: 移行前と同一の文言・遷移。確認後停止。

- [ ] **Step 8: Commit**

```bash
git add src
git commit -m "refactor: i18n を Paraglide(m.*) へ置換し自前実装を撤去"
```

---

## Task 9: テスト更新と最終整形

**Files:**
- Modify: `tests/data.test.ts`（必要なら i18n メッセージの存在チェックを追加）
- Create: `tests/i18n.test.ts`（メッセージの ja/en キー一致を検証）

**Interfaces:**
- Consumes: `messages/ja.json` `messages/en.json`
- Produces: なし

- [ ] **Step 1: メッセージのキー一致テストを書く（失敗させる）**

`tests/i18n.test.ts` を作成。ja/en が同じキー集合を持つことを検証する（`$schema` キーは除外）。

```ts
import { describe, it, expect } from 'vitest';
import ja from '../messages/ja.json';
import en from '../messages/en.json';

const keysOf = (obj: Record<string, unknown>) =>
  Object.keys(obj).filter((k) => k !== '$schema').sort();

describe('i18n messages', () => {
  it('ja と en は同じキー集合を持つ', () => {
    expect(keysOf(ja)).toEqual(keysOf(en));
  });

  it('全メッセージが空でない文字列', () => {
    for (const obj of [ja, en]) {
      for (const [k, v] of Object.entries(obj)) {
        if (k === '$schema') continue;
        expect(typeof v).toBe('string');
        expect((v as string).length).toBeGreaterThan(0);
      }
    }
  });
});
```

- [ ] **Step 2: テストが通ることを確認**

Run: `pnpm test`
Expected: 既存の data テスト + 新規 i18n テストが全て PASS（Task 7 でキーを揃えているため最初から通る想定。もし FAIL したらキーの不一致を `messages/*.json` で修正）。

- [ ] **Step 3: 全体整形**

Run: `pnpm format`
Expected: 差分が出れば整形される。

- [ ] **Step 4: 最終 build / test / lint 確認**

Run: `pnpm build && pnpm test && pnpm lint`
Expected: すべて成功。

- [ ] **Step 5: Commit**

```bash
git add tests
git commit -m "test: i18n メッセージのキー一致テストを追加"
```

---

## Self-Review メモ（実装者向け確認事項）

- **トークン二重定義**: `global.css` の `:root` と `uno.config.ts` の `theme` は移行完了後も両方残す。`HeroBackground.astro` の accent はトークン化せずハードコード `#2f6df0` のまま（JS内のため。無理に共通化しない=YAGNI）。
- **`section + section` の罫線**: `global.css` の `section + section { border-top }` はユーティリティ化せず global に残す（セレクタの性質上ユーティリティ化が冗長になるため）。
- **見た目の最終確認**: Task 9 完了後、`/` と `/en/` を並べて移行前スクリーンショットと比較すると確実。
- **Paraglide のロケール引数**: 本計画は `m.key({}, { locale })` 形式で明示的にロケールを渡す方針（Astro の SSG で各ページが固定ロケールを持つため、グローバル状態に依存せず安全）。
