# AR名刺 (MindAR + three.js) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** カメラに名刺を映すと、名前・肩書きとリンクアイコンが3Dで浮かび、タップで外部リンクへ遷移するAR名刺ページ `/ja/ar`・`/en/ar` を作る。

**Architecture:** 画像マーカー追従は MindAR (`mindar-image-three.prod.js`)、3D描画は three.js。Astro 専用ページの `<script>` で初期化し React は使わない。表示内容は `src/data/ar-card.ts` に一元化し、整形ロジックは純粋関数として vitest でテスト。AR描画自体は実機手動確認。

**Tech Stack:** Astro 6, TypeScript, three.js `@0.184`, mind-ar `@1.2.5` (`mindar-image-three`), UnoCSS, vitest, i18n (ja/en)。

## Global Constraints

- ページは i18n 構成 `src/pages/[lang]/ar.astro` → `/ja/ar`, `/en/ar`。`prefixDefaultLocale: true`。
- React / @astrojs/react は導入しない。Astro 素の `<script>` を使う。
- three.js は既存 `three@^0.184.0` を使用 (mind-ar の peer は `three >=0.136.0` で互換確認済み)。
- MindAR three.js ビルドの import パス: `mind-ar/dist/mindar-image-three.prod.js`、export 名は `MindARThree`。
- `MindARThree` の主要API (実ビルドで確認済み):
  - `new MindARThree({ container, imageTargetSrc, uiLoading?, uiScanning?, uiError?, maxTrack?, filterMinCF?, filterBeta? })`
  - インスタンス: `.renderer` (THREE.WebGLRenderer), `.scene` (THREE.Scene), `.camera` (THREE.Camera), `.start(): Promise<void>`, `.stop()`
  - `.addAnchor(targetIndex: number): { group: THREE.Group, onTargetFound: () => void, onTargetLost: () => void }`
- 名前は `相曽 結`、肩書きは `Software Engineer` (`src/i18n/ui.ts` の `hero_name`/`hero_role` と整合)。
- AR上のリンクは現行 `src/components/Links.astro` を正とする: GitHub `https://github.com/yui666a`, Qiita `https://qiita.com/yui666a`, Zenn `https://zenn.dev/yui666a`, X `https://x.com/yui_ai0216`。旧Twitter/IG/FB URLは踏襲しない。
- テキストは TextGeometry でなく Canvas テクスチャ方式 (日本語OK・軽量)。
- タップ判定は touch/click + THREE.Raycaster。
- スコープ外: VRMアバター、WebXR、多言語名刺画像。

---

### Task 1: AR表示データと整形ロジック (`ar-card.ts`)

表示内容の単一データソースと、純粋関数 (テスト対象)。three.js/DOM に依存しない。

**Files:**
- Create: `src/data/ar-card.ts`
- Test: `tests/ar-card.test.ts`

**Interfaces:**
- Consumes: なし
- Produces:
  - `export type ArLink = { id: string; label: string; url: string; icon: string }`
  - `export type ArCard = { name: string; role: string; links: ArLink[] }`
  - `export const arCard: ArCard`
  - `export function isSafeExternalUrl(url: string): boolean` — `https:` のみ true (それ以外/相対/`javascript:` は false)
  - `export function iconPath(link: ArLink): string` — `link.icon` を `/ar/icons/<icon>` に解決 (先頭スラッシュ重複は1つに正規化)

- [ ] **Step 1: Write the failing test**

```ts
// tests/ar-card.test.ts
import { describe, it, expect } from 'vitest';
import { arCard, isSafeExternalUrl, iconPath, type ArLink } from '../src/data/ar-card';

describe('ar-card data', () => {
  it('name と role が空でない', () => {
    expect(arCard.name.length).toBeGreaterThan(0);
    expect(arCard.role.length).toBeGreaterThan(0);
  });

  it('全リンクが https かつ id 重複なし', () => {
    const ids = new Set<string>();
    for (const l of arCard.links) {
      expect(isSafeExternalUrl(l.url)).toBe(true);
      expect(l.icon.length).toBeGreaterThan(0);
      expect(ids.has(l.id)).toBe(false);
      ids.add(l.id);
    }
  });
});

describe('isSafeExternalUrl', () => {
  it('https は true', () => {
    expect(isSafeExternalUrl('https://github.com/yui666a')).toBe(true);
  });
  it('http / javascript / 相対 は false', () => {
    expect(isSafeExternalUrl('http://example.com')).toBe(false);
    expect(isSafeExternalUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeExternalUrl('/foo')).toBe(false);
    expect(isSafeExternalUrl('not a url')).toBe(false);
  });
});

describe('iconPath', () => {
  it('/ar/icons/ 配下に解決する', () => {
    const l: ArLink = { id: 'x', label: 'X', url: 'https://x.com/yui_ai0216', icon: 'x.svg' };
    expect(iconPath(l)).toBe('/ar/icons/x.svg');
  });
  it('先頭スラッシュ付き icon でも二重にしない', () => {
    const l: ArLink = { id: 'x', label: 'X', url: 'https://x.com/yui_ai0216', icon: '/x.svg' };
    expect(iconPath(l)).toBe('/ar/icons/x.svg');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run tests/ar-card.test.ts`
Expected: FAIL (Cannot find module '../src/data/ar-card')

- [ ] **Step 3: Write minimal implementation**

```ts
// src/data/ar-card.ts
export type ArLink = { id: string; label: string; url: string; icon: string };
export type ArCard = { name: string; role: string; links: ArLink[] };

export const arCard: ArCard = {
  name: '相曽 結',
  role: 'Software Engineer',
  links: [
    { id: 'github', label: 'GitHub', url: 'https://github.com/yui666a', icon: 'github.svg' },
    { id: 'qiita', label: 'Qiita', url: 'https://qiita.com/yui666a', icon: 'qiita.svg' },
    { id: 'zenn', label: 'Zenn', url: 'https://zenn.dev/yui666a', icon: 'zenn.svg' },
    { id: 'x', label: 'X', url: 'https://x.com/yui_ai0216', icon: 'x.svg' },
  ],
};

export function isSafeExternalUrl(url: string): boolean {
  try {
    return new URL(url).protocol === 'https:';
  } catch {
    return false;
  }
}

export function iconPath(link: ArLink): string {
  const name = link.icon.replace(/^\/+/, '');
  return `/ar/icons/${name}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run tests/ar-card.test.ts`
Expected: PASS (3 describe / 7 assertions green)

- [ ] **Step 5: Commit**

```bash
git add src/data/ar-card.ts tests/ar-card.test.ts
git commit -m "feat: AR名刺の表示データと整形ロジックを追加"
```

---

### Task 2: Canvasテクスチャ生成ユーティリティ (`text-texture.ts`)

文字列から `HTMLCanvasElement` を作る純粋ロジック (DOM Canvas を使うが three 非依存)。テキストの折返しと余白計算をテスト。vitest 環境を jsdom にする必要があるため、まず環境を確認・設定する。

**Files:**
- Create: `src/scripts/text-texture.ts`
- Test: `tests/text-texture.test.ts`
- Modify: `vitest.config.ts` (environment を jsdom に。未設定なら追加)

**Interfaces:**
- Consumes: なし
- Produces:
  - `export type TextStyle = { font: string; color: string; padding: number; lineHeight: number }`
  - `export function measureLines(ctx: CanvasRenderingContext2D, lines: string[]): { width: number; height: number }` — 各行の最大幅と総高 (lineHeight×行数) を返す純粋計算
  - `export function createTextCanvas(lines: string[], style: TextStyle): HTMLCanvasElement` — 行配列を描画した canvas を返す

- [ ] **Step 1: 既存 vitest 環境を確認**

Run: `cat vitest.config.ts`
確認: `environment` 指定があるか。`jsdom` でなければ Step 2 で変更する。

- [ ] **Step 2: jsdom を devDependency に追加し vitest を jsdom 環境に**

```bash
pnpm add -D jsdom
```

```ts
// vitest.config.ts (environment 行を追加/変更)
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
  },
});
```
注: 既存 `vitest.config.ts` に他設定がある場合は `test.environment: 'jsdom'` を既存オブジェクトにマージすること。

- [ ] **Step 3: Write the failing test**

```ts
// tests/text-texture.test.ts
import { describe, it, expect } from 'vitest';
import { measureLines, createTextCanvas, type TextStyle } from '../src/scripts/text-texture';

const style: TextStyle = { font: '48px sans-serif', color: '#fff', padding: 16, lineHeight: 56 };

describe('measureLines', () => {
  it('総高は lineHeight × 行数', () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    ctx.font = style.font;
    const { height } = measureLines(ctx, ['相曽 結', 'Software Engineer']);
    expect(height).toBe(style ? 56 * 2 : 0); // lineHeight をテスト側で渡さない版: measureLines は lineHeight を引数に取らないため別実装
  });
});

describe('createTextCanvas', () => {
  it('canvas を返し、padding 分のサイズ余白を持つ', () => {
    const canvas = createTextCanvas(['相曽 結'], style);
    expect(canvas).toBeInstanceOf(HTMLCanvasElement);
    expect(canvas.width).toBeGreaterThan(style.padding * 2);
    expect(canvas.height).toBeGreaterThanOrEqual(style.lineHeight + style.padding * 2);
  });
});
```

注: jsdom の canvas 2d コンテキストは `node-canvas` 無しだと `measureText` が 0 を返すことがある。そのため `measureLines` は `lineHeight` を引数で受け取り高さ計算を決定的にする。テストを下記に置き換えて Step 4 へ進む。

```ts
// tests/text-texture.test.ts (確定版)
import { describe, it, expect } from 'vitest';
import { measureLines, createTextCanvas, type TextStyle } from '../src/scripts/text-texture';

const style: TextStyle = { font: '48px sans-serif', color: '#ffffff', padding: 16, lineHeight: 56 };

describe('measureLines', () => {
  it('総高は lineHeight × 行数 + padding×2', () => {
    const r = measureLines(['相曽 結', 'Software Engineer'], style);
    expect(r.height).toBe(56 * 2 + 16 * 2);
  });
  it('幅は最低でも padding×2 を超える', () => {
    const r = measureLines(['x'], style);
    expect(r.width).toBeGreaterThan(16 * 2);
  });
});

describe('createTextCanvas', () => {
  it('HTMLCanvasElement を返す', () => {
    const canvas = createTextCanvas(['相曽 結'], style);
    expect(canvas).toBeInstanceOf(HTMLCanvasElement);
    expect(canvas.width).toBeGreaterThan(0);
    expect(canvas.height).toBe(56 + 16 * 2);
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `pnpm vitest run tests/text-texture.test.ts`
Expected: FAIL (Cannot find module '../src/scripts/text-texture')

- [ ] **Step 5: Write minimal implementation**

```ts
// src/scripts/text-texture.ts
export type TextStyle = { font: string; color: string; padding: number; lineHeight: number };

export function measureLines(lines: string[], style: TextStyle): { width: number; height: number } {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  let maxWidth = 0;
  if (ctx) {
    ctx.font = style.font;
    for (const line of lines) {
      const w = ctx.measureText(line).width;
      if (w > maxWidth) maxWidth = w;
    }
  }
  const width = Math.ceil(maxWidth) + style.padding * 2 + 1; // +1 で 0幅環境でも padding×2 を必ず超える
  const height = style.lineHeight * lines.length + style.padding * 2;
  return { width, height };
}

export function createTextCanvas(lines: string[], style: TextStyle): HTMLCanvasElement {
  const { width, height } = measureLines(lines, style);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.font = style.font;
    ctx.fillStyle = style.color;
    ctx.textBaseline = 'top';
    lines.forEach((line, i) => {
      ctx.fillText(line, style.padding, style.padding + i * style.lineHeight);
    });
  }
  return canvas;
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `pnpm vitest run tests/text-texture.test.ts`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/scripts/text-texture.ts tests/text-texture.test.ts vitest.config.ts package.json pnpm-lock.yaml
git commit -m "feat: Canvasテクスチャ生成ユーティリティを追加"
```

---

### Task 3: i18n 文言とアイコンアセット

ARページの UI 文言を辞書に追加し、リンクアイコンの SVG を `public/ar/icons/` に置く。

**Files:**
- Modify: `src/i18n/ui.ts` (ja/en に `ar_*` キーを追加)
- Create: `public/ar/icons/github.svg`, `public/ar/icons/qiita.svg`, `public/ar/icons/zenn.svg`, `public/ar/icons/x.svg`
- Test: `tests/i18n.test.ts` は既存。新キーを ja/en 両方に入れることで既存「同じキー集合」テストを壊さないことを確認する。

**Interfaces:**
- Consumes: なし
- Produces: `ui.ja.ar_loading`, `ui.ja.ar_scan_hint`, `ui.ja.ar_camera_denied`, `ui.ja.ar_unsupported`, `ui.ja.ar_motion_permission`, `ui.ja.ar_title` (en も同キー)

- [ ] **Step 1: i18n キーを ja に追加**

`src/i18n/ui.ts` の `ja` オブジェクトに追記:

```ts
    ar_title: 'AR名刺',
    ar_loading: '読み込み中です。少々お待ちください。',
    ar_scan_hint: 'カメラで名刺を映してください',
    ar_camera_denied: 'カメラの使用が許可されませんでした。ブラウザの設定を確認してください。',
    ar_unsupported: 'このブラウザはカメラARに対応していません。',
    ar_motion_permission: 'モーションセンサーを許可',
```

- [ ] **Step 2: 同じキーを en に追加**

`src/i18n/ui.ts` の `en` オブジェクトに追記:

```ts
    ar_title: 'AR Business Card',
    ar_loading: 'Loading, please wait a moment.',
    ar_scan_hint: 'Point your camera at the business card',
    ar_camera_denied: 'Camera access was denied. Please check your browser settings.',
    ar_unsupported: 'This browser does not support camera AR.',
    ar_motion_permission: 'Allow motion sensors',
```

- [ ] **Step 3: アイコン SVG を作成**

各ファイルは単色塗りのシンプルな SVG (背景透過、64×64 viewBox)。下記をそのまま作成。

```xml
<!-- public/ar/icons/github.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><rect width="64" height="64" rx="14" fill="#ffffff"/><text x="32" y="42" font-size="34" text-anchor="middle" font-family="sans-serif" fill="#181717">GH</text></svg>
```
```xml
<!-- public/ar/icons/qiita.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><rect width="64" height="64" rx="14" fill="#ffffff"/><text x="32" y="42" font-size="34" text-anchor="middle" font-family="sans-serif" fill="#55c500">Q</text></svg>
```
```xml
<!-- public/ar/icons/zenn.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><rect width="64" height="64" rx="14" fill="#ffffff"/><text x="32" y="42" font-size="34" text-anchor="middle" font-family="sans-serif" fill="#3ea8ff">Z</text></svg>
```
```xml
<!-- public/ar/icons/x.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><rect width="64" height="64" rx="14" fill="#ffffff"/><text x="32" y="44" font-size="38" text-anchor="middle" font-family="sans-serif" fill="#000000">X</text></svg>
```
注: 本番では正式ロゴ画像に差し替え可能。まずは動作確認用のプレースホルダ。

- [ ] **Step 4: 既存 i18n テストが新キーで壊れないことを確認**

Run: `pnpm vitest run tests/i18n.test.ts`
Expected: ja/en のキー集合一致テストが、追加した6キーを含めて引き続き PASS (このworktree既存の master 由来失敗があれば、その差分は今回追加分と無関係。新規追加キーが ja/en 両方に存在することだけ確認する)。

- [ ] **Step 5: Commit**

```bash
git add src/i18n/ui.ts public/ar/icons
git commit -m "feat: AR名刺のi18n文言とリンクアイコンを追加"
```

---

### Task 4: ターゲット画像コンパイル手順ドキュメント + プレースホルダ `.mind`

`.mind` ファイルの生成手順を残し、動作確認用に MindAR 公式サンプルターゲットを置く。本番名刺画像は後で差し替える。

**Files:**
- Create: `docs/ar/compile-target.md`
- Create: `public/ar/business-card.mind` (動作確認用プレースホルダ)

**Interfaces:**
- Consumes: なし
- Produces: `/ar/business-card.mind` (ページが `imageTargetSrc` で参照するパス)

- [ ] **Step 1: 手順ドキュメントを作成**

```markdown
<!-- docs/ar/compile-target.md -->
# AR名刺ターゲット (.mind) の作り方

MindAR は追従対象の画像をあらかじめ `.mind` 形式にコンパイルする必要がある。

## 手順
1. 名刺画像 (特徴点の多い、コントラストのはっきりした画像が望ましい) を用意する。
2. MindAR の Image Targets Compiler をブラウザで開く:
   https://hiukim.github.io/mind-ar-js-doc/tools/compile
3. 画像をドラッグ&ドロップし、"Start" でコンパイル。
4. 生成された `targets.mind` をダウンロードし、`public/ar/business-card.mind` として置き換える。

## 注意
- 複数ターゲットをまとめると `addAnchor(index)` の index が画像順に対応する。名刺は1枚なので index 0。
- 現在 `public/ar/business-card.mind` は動作確認用プレースホルダ。本番名刺画像で再生成すること。
```

- [ ] **Step 2: 動作確認用 .mind を配置**

MindAR 公式サンプル (`https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/image-tracking/assets/card-example/card.mind`) を取得して置く:

```bash
mkdir -p public/ar
curl -fsSL "https://cdn.jsdelivr.net/gh/hiukim/mind-ar-js@1.2.5/examples/image-tracking/assets/card-example/card.mind" -o public/ar/business-card.mind
ls -la public/ar/business-card.mind
```
Expected: ファイルが数十KB以上で作成される (0バイトや HTML ならフォールバック: リポジトリ `legacy_2022/ar/img/front.png` をコンパイラに通すまでは index.astro 側でエラーUIが出る前提で進めてよい)。

- [ ] **Step 3: Commit**

```bash
git add docs/ar/compile-target.md public/ar/business-card.mind
git commit -m "docs: ターゲット.mindの生成手順と動作確認用ファイルを追加"
```

---

### Task 5: MindAR + three.js 初期化ロジック (`ar-business-card.ts`)

ARシーンの構築本体。コンテナ要素を受け取り、MindAR を起動して名前テキストとリンクアイコンをアンカーに乗せ、タップで遷移する。three.js / MindAR / DOM に依存するため自動テストはせず、エクスポート関数のシグネチャを固定し手動確認する。

**Files:**
- Create: `src/scripts/ar-business-card.ts`

**Interfaces:**
- Consumes: `arCard`, `isSafeExternalUrl`, `iconPath` from `../data/ar-card`; `createTextCanvas`, `type TextStyle` from `./text-texture`; `MindARThree` from `mind-ar/dist/mindar-image-three.prod.js`; `THREE` from `three`
- Produces:
  - `export type ArHandle = { stop: () => void }`
  - `export async function startArBusinessCard(opts: { container: HTMLElement; targetSrc: string; onError: (kind: 'denied' | 'unsupported' | 'unknown') => void; onReady: () => void }): Promise<ArHandle | null>`

- [ ] **Step 1: 実装を書く**

```ts
// src/scripts/ar-business-card.ts
import * as THREE from 'three';
import { MindARThree } from 'mind-ar/dist/mindar-image-three.prod.js';
import { arCard, isSafeExternalUrl, iconPath, type ArLink } from '../data/ar-card';
import { createTextCanvas, type TextStyle } from './text-texture';

export type ArHandle = { stop: () => void };

type ErrorKind = 'denied' | 'unsupported' | 'unknown';

const TEXT_STYLE: TextStyle = {
  font: 'bold 64px sans-serif',
  color: '#ffffff',
  padding: 24,
  lineHeight: 76,
};

// canvas からテクスチャ貼り plane を作る。plane の幅は 1 を基準に縦横比を維持。
function makeTextPlane(lines: string[]): THREE.Mesh {
  const canvas = createTextCanvas(lines, TEXT_STYLE);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const aspect = canvas.height / canvas.width;
  const geometry = new THREE.PlaneGeometry(1, aspect);
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
  return new THREE.Mesh(geometry, material);
}

// アイコン plane。userData.url にリンク先を持たせ raycaster で拾う。
function makeIconPlane(link: ArLink, loader: THREE.TextureLoader): THREE.Mesh {
  const texture = loader.load(iconPath(link));
  texture.colorSpace = THREE.SRGBColorSpace;
  const geometry = new THREE.PlaneGeometry(0.22, 0.22);
  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData.url = link.url;
  return mesh;
}

export async function startArBusinessCard(opts: {
  container: HTMLElement;
  targetSrc: string;
  onError: (kind: ErrorKind) => void;
  onReady: () => void;
}): Promise<ArHandle | null> {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    opts.onError('unsupported');
    return null;
  }

  const mindarThree = new MindARThree({
    container: opts.container,
    imageTargetSrc: opts.targetSrc,
  });
  const { renderer, scene, camera } = mindarThree;
  const anchor = mindarThree.addAnchor(0);

  // 名前 + 肩書き
  const namePlane = makeTextPlane([arCard.name, arCard.role]);
  namePlane.position.set(0, 0.35, 0);
  namePlane.scale.set(0.9, 0.9, 0.9);
  anchor.group.add(namePlane);

  // リンクアイコンを横並び
  const loader = new THREE.TextureLoader();
  const iconMeshes: THREE.Mesh[] = [];
  const gap = 0.26;
  const startX = -((arCard.links.length - 1) * gap) / 2;
  arCard.links.forEach((link, i) => {
    if (!isSafeExternalUrl(link.url)) return;
    const icon = makeIconPlane(link, loader);
    icon.position.set(startX + i * gap, -0.2, 0);
    anchor.group.add(icon);
    iconMeshes.push(icon);
  });

  // タップ判定
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const onTap = (clientX: number, clientY: number) => {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(iconMeshes, false);
    const url = hits[0]?.object.userData.url as string | undefined;
    if (url && isSafeExternalUrl(url)) {
      window.open(url, '_blank', 'noopener');
    }
  };
  const clickHandler = (e: MouseEvent) => onTap(e.clientX, e.clientY);
  const touchHandler = (e: TouchEvent) => {
    const t = e.changedTouches[0];
    if (t) onTap(t.clientX, t.clientY);
  };
  renderer.domElement.addEventListener('click', clickHandler);
  renderer.domElement.addEventListener('touchend', touchHandler);

  try {
    await mindarThree.start();
    opts.onReady();
  } catch (err) {
    const name = (err as { name?: string })?.name;
    opts.onError(name === 'NotAllowedError' ? 'denied' : 'unknown');
    return null;
  }

  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });

  return {
    stop: () => {
      renderer.setAnimationLoop(null);
      renderer.domElement.removeEventListener('click', clickHandler);
      renderer.domElement.removeEventListener('touchend', touchHandler);
      mindarThree.stop();
    },
  };
}
```

- [ ] **Step 2: 型チェックが通ることを確認**

Run: `pnpm exec tsc --noEmit -p tsconfig.json 2>&1 | grep -i ar-business-card || echo "no ar-business-card type errors"`
Expected: "no ar-business-card type errors" (mind-ar に型が無く `MindARThree` が暗黙 any になる場合は次 Step で型宣言を追加)

- [ ] **Step 3: mind-ar の型が無ければアンビエント宣言を追加**

Step 2 で `mindar-image-three.prod.js` の型エラーが出た場合のみ、以下を作成:

```ts
// src/scripts/mind-ar.d.ts
declare module 'mind-ar/dist/mindar-image-three.prod.js' {
  import type * as THREE from 'three';
  export class MindARThree {
    constructor(opts: {
      container: HTMLElement;
      imageTargetSrc: string;
      maxTrack?: number;
      uiLoading?: string | boolean;
      uiScanning?: string | boolean;
      uiError?: string | boolean;
      filterMinCF?: number;
      filterBeta?: number;
    });
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.Camera;
    start(): Promise<void>;
    stop(): void;
    addAnchor(targetIndex: number): {
      group: THREE.Group;
      onTargetFound: () => void;
      onTargetLost: () => void;
    };
  }
}
```
再実行: `pnpm exec tsc --noEmit -p tsconfig.json 2>&1 | grep -i "ar-business-card\|mind-ar" || echo "clean"`
Expected: "clean"

- [ ] **Step 4: Commit**

```bash
git add src/scripts/ar-business-card.ts src/scripts/mind-ar.d.ts 2>/dev/null; git add src/scripts/ar-business-card.ts
git commit -m "feat: MindAR+three.jsのAR名刺シーン初期化を実装"
```

---

### Task 6: ARページ (`ar.astro`)

専用ページ。ローディング/エラー/モーション許可の UI と、`ar-business-card.ts` を呼ぶ `<script>`。i18n 対応。

**Files:**
- Create: `src/pages/[lang]/ar.astro`

**Interfaces:**
- Consumes: `startArBusinessCard` from `../../scripts/ar-business-card`; i18n util (既存 `src/i18n/utils.ts` の `useTranslations`/`getStaticPaths` パターンを既存ページに合わせる)
- Produces: ルート `/ja/ar`, `/en/ar`

- [ ] **Step 1: 既存ページの i18n パターンを確認**

Run: `cat src/pages/[lang]/playground.astro`
確認: `getStaticPaths`, `Astro.params.lang`, 翻訳関数の取得方法。これに倣う。

- [ ] **Step 2: ページを作成**

既存 `playground.astro` の getStaticPaths / 翻訳取得方法に合わせて以下を作成 (下記は一般形。`useTranslations` 等の名称は Step 1 で確認した実際のものに合わせること):

```astro
---
import Base from '../../layouts/Base.astro';
import { useTranslations } from '../../i18n/utils';
import { locales } from '../../i18n/ui';

export function getStaticPaths() {
  return locales.map((lang) => ({ params: { lang } }));
}

const { lang } = Astro.params;
const t = useTranslations(lang as 'ja' | 'en');
const targetSrc = `${import.meta.env.BASE_URL}ar/business-card.mind`.replace(/\/{2,}/g, '/');
---

<Base title={t('ar_title')}>
  <div id="ar-root" class="fixed inset-0 bg-black">
    <div id="ar-container" class="absolute inset-0"></div>

    <div id="ar-loading" class="absolute inset-0 flex items-center justify-center text-center text-white p-6">
      <p>{t('ar_loading')}<br />{t('ar_scan_hint')}</p>
    </div>

    <div id="ar-error" class="absolute inset-0 hidden items-center justify-center text-center text-white p-6">
      <p id="ar-error-msg"></p>
    </div>

    <button
      id="ar-motion"
      class="absolute bottom-6 left-1/2 -translate-x-1/2 hidden rounded bg-white/90 px-4 py-2 text-black"
    >
      {t('ar_motion_permission')}
    </button>
  </div>
</Base>

<script
  define:vars={{
    targetSrc,
    msgDenied: t('ar_camera_denied'),
    msgUnsupported: t('ar_unsupported'),
  }}
>
  import { startArBusinessCard } from '../../scripts/ar-business-card';

  const container = document.getElementById('ar-container');
  const loading = document.getElementById('ar-loading');
  const errorBox = document.getElementById('ar-error');
  const errorMsg = document.getElementById('ar-error-msg');
  const motionBtn = document.getElementById('ar-motion');

  function showError(text) {
    if (loading) loading.classList.add('hidden');
    if (errorMsg) errorMsg.textContent = text;
    if (errorBox) {
      errorBox.classList.remove('hidden');
      errorBox.classList.add('flex');
    }
  }

  // iOS のモーション許可が要る場合のみボタンを出す
  const DOE = /** @type {any} */ (window).DeviceOrientationEvent;
  if (DOE && typeof DOE.requestPermission === 'function' && motionBtn) {
    motionBtn.classList.remove('hidden');
    motionBtn.addEventListener('click', () => {
      DOE.requestPermission().catch(() => {});
      motionBtn.classList.add('hidden');
    });
  }

  if (container) {
    startArBusinessCard({
      container,
      targetSrc,
      onReady: () => loading && loading.classList.add('hidden'),
      onError: (kind) => showError(kind === 'denied' ? msgDenied : msgUnsupported),
    }).catch(() => showError(msgUnsupported));
  }
</script>
```
注: Astro の `<script>` 内 import はバンドルされる。`define:vars` で渡せるのは文字列等のみ (関数不可) のため翻訳済みテキストを渡している。

- [ ] **Step 3: Astro の型/ビルドチェック**

Run: `pnpm exec astro check 2>&1 | tail -20`
Expected: ar.astro 起因の新規エラーが無い (既存ページ由来の警告は無視)。エラーが出たら Step 1 で確認した実際の i18n API 名に修正。

- [ ] **Step 4: 本番ビルドが通ることを確認**

Run: `pnpm build 2>&1 | tail -20`
Expected: ビルド成功。`dist/ja/ar/index.html` と `dist/en/ar/index.html` が生成される。

Run: `ls dist/ja/ar/index.html dist/en/ar/index.html`
Expected: 両ファイルが存在。

- [ ] **Step 5: Commit**

```bash
git add src/pages/[lang]/ar.astro
git commit -m "feat: AR名刺ページ /ja/ar /en/ar を追加"
```

---

### Task 7: ナビゲーション導線と手動確認

ARページへの導線を足し、実機/ブラウザで手動確認する。

**Files:**
- Modify: `src/components/Links.astro` または `src/components/Nav.astro` (既存の導線パターンに合わせて1箇所、ARページへのリンクを追加)

**Interfaces:**
- Consumes: なし
- Produces: トップから `/{lang}/ar` への遷移リンク

- [ ] **Step 1: 導線を追加**

Run: `cat src/components/Nav.astro`
確認後、既存のリンク追加パターンに合わせて AR名刺へのリンクを1つ追加 (i18n の `ar_title` をラベルに、href は `${import.meta.env.BASE_URL}{lang}/ar` 相当 — 既存リンクの作り方に倣う)。

- [ ] **Step 2: ビルド確認**

Run: `pnpm build 2>&1 | tail -5`
Expected: 成功。

- [ ] **Step 3: AR関連の全テストがグリーン**

Run: `pnpm vitest run tests/ar-card.test.ts tests/text-texture.test.ts`
Expected: PASS (両ファイル全green)

- [ ] **Step 4: 手動確認 (dev サーバ + カメラ)**

Run: `pnpm dev` を起動し、`https://localhost:4321/ja/ar` を **HTTPS** で開く (getUserMedia は localhost か https 必須。Astro dev は http なので、カメラ確認はデプロイ先 `https://yui666a.me/ja/ar` か、`astro dev --host` + 端末の https トンネルで行う)。
確認項目:
  - ローディング表示が出る → カメラ許可後に消える
  - 名刺 (動作確認用は MindAR の card サンプル印刷/画面表示) を映すと名前テキストとアイコンが乗る
  - アイコンをタップすると該当リンクが新規タブで開く
  - カメラ拒否時にエラーメッセージが出る

注: 自動テスト不可の領域。確認結果をスクリーンショットで残すこと。

- [ ] **Step 5: Commit**

```bash
git add src/components/Nav.astro
git commit -m "feat: AR名刺ページへの導線を追加"
```

---

## Self-Review

**Spec coverage:**
- 追従=MindAR(three.js直) → Task 4,5 ✓
- 描画=three@0.184 → Task 5 (互換確認済み, mind-ar peer three>=0.136) ✓
- Astro `<script>`/React不使用 → Task 6 ✓
- `/ja/ar`,`/en/ar` → Task 6 ✓
- 名前/肩書きテキスト(Canvasテクスチャ) → Task 2,5 ✓
- リンクアイコン(タップ遷移) → Task 1,3,5 ✓
- 単一データソース ar-card.ts → Task 1 ✓
- エラー/許可/非対応UX → Task 6 ✓
- iOSモーション許可 → Task 6 ✓
- .mind生成手順 → Task 4 ✓
- 純粋関数を vitest → Task 1,2 ✓
- 導線 → Task 7 ✓
- スコープ外(VRM/WebXR/多言語画像) → どのタスクにも含めない ✓

**Placeholder scan:** Task 2 のテストは「確定版」を最終形として明示。Task 6 は既存i18n API名の確認を Step 1 に明示。Task 5 の型宣言は条件付き(型エラー時のみ)で手順明確。プレースホルダ無し。

**Type consistency:** `ArLink`/`ArCard`/`isSafeExternalUrl`/`iconPath` (Task1) → Task5 で同名利用 ✓。`createTextCanvas`/`TextStyle`/`measureLines` (Task2) → Task5 で同名利用 ✓。`startArBusinessCard` シグネチャ (Task5) → Task6 で同じ引数 (`container/targetSrc/onError/onReady`) で呼び出し ✓。`MindARThree` API は実ビルドで確認した `.renderer/.scene/.camera/.start/.stop/.addAnchor(0)→{group}` に一致 ✓。
