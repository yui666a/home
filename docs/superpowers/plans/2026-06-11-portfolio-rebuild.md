# ポートフォリオ作り直し Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 5年前の素のHTML/CSS/JS製ポートフォリオを、Astro製の「信頼感ある名刺(トップ1ページ) + 技術力を見せるPlayground(別ページ)」へ、JP/EN完全対応で作り直す。

**Architecture:** Astro static build を GitHub Pages (`yui666a.me`) へ配信。トップは1カラム中央寄せ・JSほぼゼロのコンポーネント群。Playground のみ Three.js を Astro Island (`client:visible`) として隔離。Works/Skills はデータ駆動。i18n は Astro 標準ルーティング (`/` ⇄ `/en/`)。

**Tech Stack:** Astro, TypeScript, Three.js (Playground のみ), Vitest (テスト), GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-06-11-portfolio-rebuild-design.md`

---

## File Structure

新規に作るファイルと責務:

```
/ (リポジトリルート)
├── legacy_2022/                  … 旧サイト一式を退避(削除しない)
├── package.json                  … Astro/Three.js/Vitest 依存
├── astro.config.mjs              … site, base, i18n 設定
├── tsconfig.json
├── vitest.config.ts
├── public/
│   ├── CNAME                     … yui666a.me (ルートのCNAMEから移設)
│   ├── img/                      … 流用画像 (顔写真・ロゴ)
│   └── models/                   … 流用3D資産 (Playground用, 任意)
├── src/
│   ├── i18n/
│   │   ├── ja.json               … 日本語文言
│   │   ├── en.json               … 英語文言
│   │   └── utils.ts              … 言語判定・文言取得ヘルパ
│   ├── data/
│   │   ├── works.ts              … 実績データ(型 + 配列)
│   │   └── skills.ts             … スキルデータ(型 + 配列)
│   ├── layouts/
│   │   └── Base.astro            … <html>骨格・meta・グローバルCSS読込
│   ├── components/
│   │   ├── Nav.astro             … 簡易ナビ + 言語切替
│   │   ├── Hero.astro
│   │   ├── About.astro
│   │   ├── Skills.astro          … skills.ts を描画
│   │   ├── Works.astro           … works.ts をカードグリッド描画
│   │   ├── Links.astro           … GitHub/Qiita/Zenn/X/Mail
│   │   └── PlaygroundCanvas.astro… Three.js を内包する島 (client:visible)
│   ├── styles/
│   │   └── global.css            … リセット + デザイントークン(色・タイポ・余白)
│   └── pages/
│       ├── index.astro           … 日本語トップ
│       ├── playground.astro      … 日本語Playground
│       └── en/
│           ├── index.astro       … 英語トップ
│           └── playground.astro  … 英語Playground
└── tests/
    ├── i18n.test.ts              … 文言取得ヘルパのテスト
    └── data.test.ts              … works/skills データ整合性テスト
```

未確定事項(仮値で進める): Heroの肩書/一言, Skills習熟度表示, 差し色, Playgroundの中身。
→ 仮値をコード内に置き、`// TODO(未確定):` コメントで明示する。

---

## Task 1: 旧サイトを legacy_2022 へ退避し、ルートをクリーンにする

**Files:**
- Move: `index.html`, `pc.html`, `sp.html`, `index2.js`, `README.md`, `css/`, `js/`, `ar/`, `img/` → `legacy_2022/`
- Keep at root: `CNAME`, `.gitignore`, `docs/`, `.git/`

- [ ] **Step 1: legacy_2022 ディレクトリを作り、旧資産を git mv で退避**

`git mv` を使うことで履歴を保持する(削除ではない)。

```bash
mkdir -p legacy_2022
git mv index.html pc.html sp.html index2.js README.md css js ar img legacy_2022/
```

- [ ] **Step 2: 退避結果を確認**

Run: `ls -la && echo "---" && ls legacy_2022/`
Expected: ルートに `index.html` 等が無くなり、`legacy_2022/` 配下に全て移動している。ルートには `CNAME`, `.gitignore`, `docs/`, `legacy_2022/` が残る。

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: 旧サイトを legacy_2022 へ退避(削除せず履歴保持)"
```

---

## Task 2: Astro プロジェクトを初期化する

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`(追記)

- [ ] **Step 1: Astro を最小構成でセットアップ**

対話を避けるため手動で依存を入れる。

```bash
npm init -y
npm install astro
npm install -D typescript @astrojs/check
```

- [ ] **Step 2: package.json の scripts を設定**

`package.json` の `"scripts"` を以下に置き換える:

```json
"scripts": {
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "check": "astro check",
  "test": "vitest run"
}
```

- [ ] **Step 3: astro.config.mjs を作成 (GitHub Pages + i18n)**

独自ドメイン `yui666a.me` を使うので `base` は `/`(ルート)。i18n は ja デフォルト、en をサブパスに。

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://yui666a.me',
  base: '/',
  i18n: {
    defaultLocale: 'ja',
    locales: ['ja', 'en'],
    routing: {
      prefixDefaultLocale: false, // ja は / に、en は /en/ に
    },
  },
});
```

- [ ] **Step 4: tsconfig.json を作成**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "legacy_2022"]
}
```

- [ ] **Step 5: .gitignore に Astro 成果物を追記**

`.gitignore` に以下を追記(既存の `.DS_Store`, `.superpowers/` は残す):

```
node_modules/
dist/
.astro/
```

- [ ] **Step 6: ビルドが通る最小 index を置いて確認**

`src/pages/index.astro` を仮作成:

```astro
---
---
<html lang="ja"><body><h1>WIP</h1></body></html>
```

Run: `npm run build`
Expected: `dist/` が生成され、エラーなく完了する。

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: Astro プロジェクトを初期化 (i18n + GitHub Pages 設定)"
```

---

## Task 3: 流用資産を public/ へ配置し、CNAME を移設する

**Files:**
- Create: `public/img/` (legacy_2022 から流用分をコピー)
- Move: `CNAME` → `public/CNAME`
- Create: `public/models/`(任意, 3D流用時)

- [ ] **Step 1: 流用する画像を public/img/ へコピー**

退避済みの `legacy_2022/` からコピー(legacy側は残す)。

```bash
mkdir -p public/img/logo
cp legacy_2022/img/aiso-shaped.jpeg public/img/
cp legacy_2022/img/logo/*.svg legacy_2022/img/logo/*.png public/img/logo/
```

- [ ] **Step 2: CNAME を public/ へ移設**

Astro は `public/` の中身を `dist/` 直下へ出力するので、CNAME がデプロイ成果物のルートに入る。

```bash
git mv CNAME public/CNAME
```

- [ ] **Step 3: 配置を確認**

Run: `cat public/CNAME && ls public/img public/img/logo`
Expected: `public/CNAME` に `yui666a.me`、`public/img/logo/` にロゴ群、`public/img/aiso-shaped.jpeg` がある。

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: 流用画像を public/ へ配置し CNAME を移設"
```

---

## Task 4: i18n の文言データとヘルパを作る (TDD)

**Files:**
- Create: `src/i18n/ja.json`, `src/i18n/en.json`, `src/i18n/utils.ts`
- Create: `vitest.config.ts`
- Test: `tests/i18n.test.ts`

- [ ] **Step 1: vitest を導入**

```bash
npm install -D vitest
```

`vitest.config.ts` を作成:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { environment: 'node', include: ['tests/**/*.test.ts'] },
});
```

- [ ] **Step 2: 文言JSONを作成(同じキー構造で ja/en)**

`src/i18n/ja.json`:

```json
{
  "nav": { "about": "About", "skills": "Skills", "works": "Works", "links": "Links", "playground": "Playground" },
  "hero": { "name": "相曽 結", "role": "Software Engineer", "tagline": "TODO(未確定): 自分を表す一言" },
  "about": { "heading": "About" },
  "skills": { "heading": "Skills" },
  "works": { "heading": "Works" },
  "links": { "heading": "Links" },
  "lang": { "switchTo": "EN" }
}
```

`src/i18n/en.json`:

```json
{
  "nav": { "about": "About", "skills": "Skills", "works": "Works", "links": "Links", "playground": "Playground" },
  "hero": { "name": "AISO, Hitoshi", "role": "Software Engineer", "tagline": "TODO(未確定): a one-line tagline" },
  "about": { "heading": "About" },
  "skills": { "heading": "Skills" },
  "works": { "heading": "Works" },
  "links": { "heading": "Links" },
  "lang": { "switchTo": "JP" }
}
```

- [ ] **Step 3: 失敗するテストを書く**

`tests/i18n.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { getDict, t, otherLocale } from '../src/i18n/utils';

describe('i18n utils', () => {
  it('ja と en が同じキー集合を持つ', () => {
    const ja = getDict('ja');
    const en = getDict('en');
    expect(Object.keys(ja).sort()).toEqual(Object.keys(en).sort());
    expect(Object.keys(ja.nav).sort()).toEqual(Object.keys(en.nav).sort());
  });

  it('t() がネストキーを解決する', () => {
    expect(t('ja', 'nav.works')).toBe('Works');
    expect(t('en', 'hero.name')).toBe('AISO, Hitoshi');
  });

  it('otherLocale() が言語を反転する', () => {
    expect(otherLocale('ja')).toBe('en');
    expect(otherLocale('en')).toBe('ja');
  });
});
```

- [ ] **Step 4: テストが失敗することを確認**

Run: `npm test`
Expected: FAIL — `getDict`/`t`/`otherLocale` が未定義。

- [ ] **Step 5: utils.ts を実装**

`src/i18n/utils.ts`:

```ts
import ja from './ja.json';
import en from './en.json';

export type Locale = 'ja' | 'en';
const dicts = { ja, en } as const;

export function getDict(locale: Locale) {
  return dicts[locale];
}

export function t(locale: Locale, key: string): string {
  const parts = key.split('.');
  let cur: unknown = dicts[locale];
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      throw new Error(`i18n key not found: ${key} (${locale})`);
    }
  }
  if (typeof cur !== 'string') throw new Error(`i18n key not a string: ${key}`);
  return cur;
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'ja' ? 'en' : 'ja';
}
```

`tsconfig.json` に JSON import 許可が無ければ `"resolveJsonModule": true` を `compilerOptions` に足す(strict拡張には含まれるが明示する場合)。

- [ ] **Step 6: テストが通ることを確認**

Run: `npm test`
Expected: PASS (3 tests)

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: i18n 文言データと取得ヘルパを追加 (TDD)"
```

---

## Task 5: Works / Skills のデータ層を作る (TDD)

**Files:**
- Create: `src/data/works.ts`, `src/data/skills.ts`
- Test: `tests/data.test.ts`

- [ ] **Step 1: 失敗するテストを書く**

`tests/data.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { works } from '../src/data/works';
import { skills } from '../src/data/skills';

describe('works data', () => {
  it('各 work は必須フィールドを持つ', () => {
    expect(works.length).toBeGreaterThan(0);
    for (const w of works) {
      expect(w.slug).toMatch(/^[a-z0-9-]+$/);
      expect(w.title.ja).toBeTruthy();
      expect(w.title.en).toBeTruthy();
      expect(Array.isArray(w.tags)).toBe(true);
      expect(w.url).toMatch(/^https?:\/\//);
    }
  });
  it('slug は一意', () => {
    const slugs = works.map((w) => w.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe('skills data', () => {
  it('各カテゴリは name と items を持つ', () => {
    expect(skills.length).toBeGreaterThan(0);
    for (const c of skills) {
      expect(c.category.ja).toBeTruthy();
      expect(c.category.en).toBeTruthy();
      expect(c.items.length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `npm test`
Expected: FAIL — `works`/`skills` モジュールが無い。

- [ ] **Step 3: works.ts を実装(型 + 仮データ)**

`src/data/works.ts`:

```ts
export type LocalizedText = { ja: string; en: string };

export type Work = {
  slug: string;
  title: LocalizedText;
  summary: LocalizedText;
  tags: string[];
  url: string;
  thumbnail?: string; // public 配下のパス。未設定ならプレースホルダ
};

// TODO(未確定): 実際の成果物に差し替える。下記は構造確認用の仮データ。
export const works: Work[] = [
  {
    slug: 'ar-meishi',
    title: { ja: 'AR名刺', en: 'AR Business Card' },
    summary: {
      ja: 'WebARで3Dモデルが立ち上がる名刺。',
      en: 'A business card that pops up a 3D model via WebAR.',
    },
    tags: ['WebAR', 'A-Frame', 'Three.js'],
    url: 'https://yui666a.me/',
  },
];
```

- [ ] **Step 4: skills.ts を実装(型 + 仮データ)**

`src/data/skills.ts`:

```ts
import type { LocalizedText } from './works';

export type SkillItem = {
  name: string;
  logo?: string; // public/img/logo 配下
  // TODO(未確定): 習熟度表示を入れるか後で決定 (例: level?: 'practice'|'work')
};

export type SkillCategory = {
  category: LocalizedText;
  items: SkillItem[];
};

export const skills: SkillCategory[] = [
  {
    category: { ja: '言語', en: 'Languages' },
    items: [
      { name: 'HTML/CSS/JS', logo: '/img/logo/html5.svg' },
      { name: 'Python', logo: '/img/logo/python.svg' },
      { name: 'Swift', logo: '/img/logo/swift.svg' },
      { name: 'Java', logo: '/img/logo/java.svg' },
    ],
  },
  {
    category: { ja: 'フレームワーク', en: 'Frameworks' },
    items: [
      { name: 'React', logo: '/img/logo/react.svg' },
      { name: 'Ruby on Rails', logo: '/img/logo/ruby_on_rails.svg' },
      { name: 'Unity', logo: '/img/logo/unity.svg' },
      { name: 'WordPress', logo: '/img/logo/wordpress.svg' },
    ],
  },
];
```

- [ ] **Step 5: テストが通ることを確認**

Run: `npm test`
Expected: PASS (全テスト)

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: Works/Skills のデータ層を追加 (型 + 仮データ, TDD)"
```

---

## Task 6: グローバルCSS(デザイントークン)と Base レイアウトを作る

**Files:**
- Create: `src/styles/global.css`, `src/layouts/Base.astro`

- [ ] **Step 1: global.css を作成(リセット + トークン)**

ミニマル・洗練トーン。差し色は仮で青。1カラム中央寄せの最大幅を定義。

`src/styles/global.css`:

```css
:root {
  --bg: #fbfbf9;          /* オフホワイト */
  --fg: #1a1a1a;          /* ほぼ黒 */
  --muted: #6b6b6b;
  --accent: #2f6df0;      /* TODO(未確定): 差し色1色。仮で青 */
  --maxw: 760px;          /* 1カラム読みやすい幅 */
  --space: 1.5rem;
  --font-sans: system-ui, -apple-system, "Helvetica Neue", "Hiragino Kaku Gothic ProN", "Noto Sans JP", sans-serif;
}
* { box-sizing: border-box; }
html { font-size: 17px; }
body {
  margin: 0; background: var(--bg); color: var(--fg);
  font-family: var(--font-sans); line-height: 1.7;
  -webkit-font-smoothing: antialiased;
}
a { color: inherit; }
img { max-width: 100%; height: auto; display: block; }
.container { max-width: var(--maxw); margin: 0 auto; padding: 0 var(--space); }
section { padding: 4rem 0; }
h1, h2 { line-height: 1.25; font-weight: 700; }
.muted { color: var(--muted); }
```

- [ ] **Step 2: Base.astro を作成**

`src/layouts/Base.astro`:

```astro
---
import '../styles/global.css';
import type { Locale } from '../i18n/utils';
interface Props { locale: Locale; title: string; description?: string; }
const { locale, title, description = '' } = Astro.props;
---
<!DOCTYPE html>
<html lang={locale}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
  </head>
  <body>
    <slot />
  </body>
</html>
```

- [ ] **Step 3: ビルド確認**

Run: `npm run build`
Expected: エラーなく完了。

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: グローバルCSS(デザイントークン)と Base レイアウトを追加"
```

---

## Task 7: Nav と各セクションコンポーネントを作る

**Files:**
- Create: `src/components/Nav.astro`, `Hero.astro`, `About.astro`, `Skills.astro`, `Works.astro`, `Links.astro`

各コンポーネントは `locale: Locale` を Props で受け取り、`t(locale, ...)` で文言を出す。

- [ ] **Step 1: Nav.astro (簡易ナビ + 言語切替)**

```astro
---
import { t, otherLocale, type Locale } from '../i18n/utils';
interface Props { locale: Locale; }
const { locale } = Astro.props;
const other = otherLocale(locale);
const otherHref = other === 'ja' ? '/' : '/en/';
---
<nav class="container" style="display:flex;justify-content:space-between;align-items:center;padding-top:1.25rem;">
  <a href={locale === 'ja' ? '/' : '/en/'} style="font-weight:700;text-decoration:none;">AISO</a>
  <div style="display:flex;gap:1rem;align-items:center;font-size:0.9rem;">
    <a href="#about">{t(locale, 'nav.about')}</a>
    <a href="#skills">{t(locale, 'nav.skills')}</a>
    <a href="#works">{t(locale, 'nav.works')}</a>
    <a href="#links">{t(locale, 'nav.links')}</a>
    <a href={otherHref} style="border:1px solid var(--fg);padding:0.15rem 0.5rem;border-radius:4px;text-decoration:none;">{t(locale, 'lang.switchTo')}</a>
  </div>
</nav>
```

- [ ] **Step 2: Hero.astro**

```astro
---
import { t, type Locale } from '../i18n/utils';
interface Props { locale: Locale; }
const { locale } = Astro.props;
const playHref = locale === 'ja' ? '/playground/' : '/en/playground/';
---
<header class="container" style="padding:5rem 0 3rem;">
  <h1 style="font-size:2.4rem;margin:0 0 0.5rem;">{t(locale, 'hero.name')}</h1>
  <p class="muted" style="font-size:1.1rem;margin:0 0 0.25rem;">{t(locale, 'hero.role')}</p>
  <p style="margin:0 0 1.5rem;">{t(locale, 'hero.tagline')}</p>
  <a href={playHref} style="display:inline-block;border:1px solid var(--accent);color:var(--accent);padding:0.5rem 1rem;border-radius:6px;text-decoration:none;">▶ {t(locale, 'nav.playground')}</a>
</header>
```

- [ ] **Step 3: About.astro**

```astro
---
import { t, type Locale } from '../i18n/utils';
interface Props { locale: Locale; }
const { locale } = Astro.props;
---
<section id="about" class="container">
  <h2>{t(locale, 'about.heading')}</h2>
  <!-- TODO(未確定): プロフィール本文・経歴タイムラインを後で詰める -->
  <p class="muted">奈良工業高等専門学校 → 長岡技術科学大学 情報・経営システム工学</p>
</section>
```

- [ ] **Step 4: Skills.astro (skills.ts を描画)**

```astro
---
import { t, type Locale } from '../i18n/utils';
import { skills } from '../data/skills';
interface Props { locale: Locale; }
const { locale } = Astro.props;
---
<section id="skills" class="container">
  <h2>{t(locale, 'skills.heading')}</h2>
  {skills.map((cat) => (
    <div style="margin-bottom:1.5rem;">
      <h3 style="font-size:1rem;">{locale === 'ja' ? cat.category.ja : cat.category.en}</h3>
      <ul style="list-style:none;padding:0;display:flex;flex-wrap:wrap;gap:1rem;">
        {cat.items.map((item) => (
          <li style="display:flex;align-items:center;gap:0.4rem;">
            {item.logo && <img src={item.logo} alt={item.name} width="24" height="24" style="display:inline;" />}
            <span>{item.name}</span>
          </li>
        ))}
      </ul>
    </div>
  ))}
</section>
```

- [ ] **Step 5: Works.astro (works.ts をカードグリッド)**

```astro
---
import { t, type Locale } from '../i18n/utils';
import { works } from '../data/works';
interface Props { locale: Locale; }
const { locale } = Astro.props;
---
<section id="works" class="container">
  <h2>{t(locale, 'works.heading')}</h2>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1rem;">
    {works.map((w) => (
      <a href={w.url} target="_blank" rel="noopener" style="border:1px solid #e2e2dd;border-radius:8px;padding:1rem;text-decoration:none;display:block;">
        <h3 style="margin:0 0 0.4rem;font-size:1.05rem;">{locale === 'ja' ? w.title.ja : w.title.en}</h3>
        <p class="muted" style="margin:0 0 0.6rem;font-size:0.9rem;">{locale === 'ja' ? w.summary.ja : w.summary.en}</p>
        <div style="display:flex;flex-wrap:wrap;gap:0.3rem;">
          {w.tags.map((tag) => (
            <span style="font-size:0.75rem;background:#efeee9;padding:0.1rem 0.5rem;border-radius:4px;">{tag}</span>
          ))}
        </div>
      </a>
    ))}
  </div>
</section>
```

- [ ] **Step 6: Links.astro**

```astro
---
import { t, type Locale } from '../i18n/utils';
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
<section id="links" class="container">
  <h2>{t(locale, 'links.heading')}</h2>
  <ul style="list-style:none;padding:0;display:flex;flex-wrap:wrap;gap:1rem;">
    {links.map((l) => (
      <li><a href={l.url} target="_blank" rel="noopener">{l.label}</a></li>
    ))}
  </ul>
</section>
```

- [ ] **Step 7: ビルド確認**

Run: `npm run build`
Expected: エラーなく完了(まだページに組み込んでいないので未使用警告は出ないが、import エラーが無いこと)。

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: Nav と各セクションコンポーネント(Hero/About/Skills/Works/Links)を追加"
```

---

## Task 8: トップページ(ja/en)を組み立てる

**Files:**
- Modify: `src/pages/index.astro` (Task2の仮版を置き換え)
- Create: `src/pages/en/index.astro`

- [ ] **Step 1: 日本語トップ index.astro**

```astro
---
import Base from '../layouts/Base.astro';
import Nav from '../components/Nav.astro';
import Hero from '../components/Hero.astro';
import About from '../components/About.astro';
import Skills from '../components/Skills.astro';
import Works from '../components/Works.astro';
import Links from '../components/Links.astro';
const locale = 'ja' as const;
---
<Base locale={locale} title="相曽 結 | Portfolio" description="相曽 結のポートフォリオ">
  <Nav locale={locale} />
  <Hero locale={locale} />
  <About locale={locale} />
  <Skills locale={locale} />
  <Works locale={locale} />
  <Links locale={locale} />
</Base>
```

- [ ] **Step 2: 英語トップ en/index.astro**

```astro
---
import Base from '../../layouts/Base.astro';
import Nav from '../../components/Nav.astro';
import Hero from '../../components/Hero.astro';
import About from '../../components/About.astro';
import Skills from '../../components/Skills.astro';
import Works from '../../components/Works.astro';
import Links from '../../components/Links.astro';
const locale = 'en' as const;
---
<Base locale={locale} title="AISO, Hitoshi | Portfolio" description="Portfolio of AISO, Hitoshi">
  <Nav locale={locale} />
  <Hero locale={locale} />
  <About locale={locale} />
  <Skills locale={locale} />
  <Works locale={locale} />
  <Links locale={locale} />
</Base>
```

- [ ] **Step 3: dev サーバで目視確認**

Run: `npm run dev` を起動し、ブラウザで `http://localhost:4321/` と `http://localhost:4321/en/` を開く。
Expected: 両言語でトップが縦に並び、言語切替リンクで相互に飛べる。Playgroundボタンが見える(リンク先はまだ無くても可)。確認後 Ctrl+C で停止。

- [ ] **Step 4: ビルド確認**

Run: `npm run build`
Expected: `dist/index.html` と `dist/en/index.html` が生成される。

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: トップページ(ja/en)を組み立て"
```

---

## Task 9: Playground ページと Three.js 島を作る

**Files:**
- Create: `src/components/PlaygroundCanvas.astro`
- Create: `src/pages/playground.astro`, `src/pages/en/playground.astro`
- Modify: `package.json` (three 追加)

- [ ] **Step 1: three を導入**

```bash
npm install three
npm install -D @types/three
```

- [ ] **Step 2: PlaygroundCanvas.astro (Three.js を島として内包)**

最小の「回転する立方体」で器を作る。中身(AR名刺流用等)は後で差し替え。

```astro
---
// TODO(未確定): 表示する3Dの中身。まずは器として回転キューブ。
---
<div id="pg-canvas" style="width:100%;height:70vh;"></div>
<script>
  import * as THREE from 'three';
  const el = document.getElementById('pg-canvas')!;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, el.clientWidth / el.clientHeight, 0.1, 100);
  camera.position.z = 3;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(el.clientWidth, el.clientHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  el.appendChild(renderer.domElement);
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const mat = new THREE.MeshStandardMaterial({ color: 0x2f6df0, roughness: 0.3 });
  const cube = new THREE.Mesh(geo, mat);
  scene.add(cube);
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(2, 2, 3);
  scene.add(dir);
  function tick() {
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.013;
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();
  addEventListener('resize', () => {
    camera.aspect = el.clientWidth / el.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(el.clientWidth, el.clientHeight);
  });
</script>
```

注: Astro の `<script>` はデフォルトでバンドル＆遅延読込される。Three.js はこのページにのみ含まれ、トップには載らない。

- [ ] **Step 3: playground.astro (ja)**

```astro
---
import Base from '../layouts/Base.astro';
import Nav from '../components/Nav.astro';
import PlaygroundCanvas from '../components/PlaygroundCanvas.astro';
const locale = 'ja' as const;
---
<Base locale={locale} title="Playground | 相曽 結">
  <Nav locale={locale} />
  <section class="container">
    <h2>Playground</h2>
    <p class="muted">技術的な実験と遊びの場。<!-- TODO(未確定): 説明文 --></p>
  </section>
  <PlaygroundCanvas />
</Base>
```

- [ ] **Step 4: en/playground.astro**

```astro
---
import Base from '../../layouts/Base.astro';
import Nav from '../../components/Nav.astro';
import PlaygroundCanvas from '../../components/PlaygroundCanvas.astro';
const locale = 'en' as const;
---
<Base locale={locale} title="Playground | AISO, Hitoshi">
  <Nav locale={locale} />
  <section class="container">
    <h2>Playground</h2>
    <p class="muted">A space for technical experiments and play.</p>
  </section>
  <PlaygroundCanvas />
</Base>
```

- [ ] **Step 5: dev で 3D 表示を確認**

Run: `npm run dev` → `http://localhost:4321/playground/` を開く。
Expected: 青い立方体が回転して表示される。トップ(`/`)を開いて three が読み込まれていない(Networkで three チャンクがトップに無い)ことを確認。確認後停止。

- [ ] **Step 6: ビルド確認**

Run: `npm run build`
Expected: `dist/playground/index.html`, `dist/en/playground/index.html` が生成される。

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: Playground ページと Three.js 島(回転キューブの器)を追加"
```

---

## Task 10: GitHub Pages デプロイ設定と最終確認

**Files:**
- Create: `.github/workflows/deploy.yml`
- Create: `README.md` (ルート, 新規)

- [ ] **Step 1: GitHub Actions デプロイワークフローを作成**

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [master]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

注: GitHub リポジトリ設定で Pages の Source を「GitHub Actions」に切り替える必要がある(手動・実装後にユーザーが設定)。

- [ ] **Step 2: ルート README.md を作成**

```markdown
# yui666a.me

相曽 結 のポートフォリオサイト。Astro 製、GitHub Pages 配信。

## 開発

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # dist/ に静的出力
npm test         # vitest
```

## 構成

- トップ(1ページ): `src/pages/index.astro`(ja), `src/pages/en/index.astro`(en)
- Playground(3D): `src/pages/playground.astro`(ja/en)
- 文言: `src/i18n/ja.json`, `en.json`
- データ: `src/data/works.ts`, `skills.ts`
- 旧サイト: `legacy_2022/`(保管)
```

- [ ] **Step 3: 全テスト + ビルドの最終確認**

Run: `npm test && npm run build && npm run check`
Expected: テスト全通過、ビルド成功、astro check で型エラーなし。`dist/CNAME` に `yui666a.me` が含まれることも確認: `cat dist/CNAME`

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "ci: GitHub Pages デプロイワークフローと README を追加"
```

- [ ] **Step 5: (ユーザー操作) Pages 設定とデプロイ確認**

ユーザーが GitHub リポジトリの Settings → Pages → Source を「GitHub Actions」に設定し、master へ push。Actions が緑になり `https://yui666a.me` で新サイトが表示されることを確認する。

---

## 完成の確認基準 (Spec §12 と対応)

- [ ] トップが軽快に表示され、スクロールで Hero→About→Skills→Works→Links が把握できる (Task 8)
- [ ] `/` ⇄ `/en/` の言語切替が破綻しない (Task 4, 7, 8)
- [ ] Playground で3Dが動く (Task 9)
- [ ] Works がデータファイル追記だけで増える構造 (Task 5)
- [ ] 旧サイトは削除せず legacy_2022 に保管 (Task 1)
- [ ] CNAME 維持で yui666a.me が保たれる (Task 3, 10)
