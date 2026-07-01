# AR名刺 作り直し設計 (MindAR + three.js)

- 日付: 2026-07-01
- ステータス: 設計確定 → 実装計画へ
- 対象リポジトリ: `home` (Astro 6 + UnoCSS, i18n ja/en, GitHub Pages `yui666a.me`)

## 背景

2022年に AR.js + A-Frame の NFT (Natural Feature Tracking) で作った AR 名刺がある
(`legacy_2022/ar/`)。名刺画像そのものをマーカーにし、カメラに映すと名前テキストと
SNS アイコン (Twitter / Instagram / Facebook) が浮かび、タップで各 SNS に遷移する体験だった。
ただし marker / model のホストに今は死んでいる Heroku CORS プロキシと raw.githack を使っており、
そのままでは動かない。

これをモダンなスタックで作り直す。

### 技術選定の経緯 (重要)

- 当初 `@react-three/xr` を想定していたが、これは **WebXR のラッパー**であり、
  「画像をマーカーにして追従する」機能を持たない。WebXR の Image Tracking 仕様は存在するが、
  2026 年時点で対応ブラウザがほぼ無い (iOS Safari 非対応、Chrome 系で実験フラグ)。
  → 今「カメラに名刺を映すと動く」を確実に実現する用途では不採用。
- ブラウザベースの画像マーカー追従で現役の選択肢は実質 **MindAR** のみ
  (AR.js はさらに停滞、8th Wall / Zappar は商用有料)。
  MindAR は最新リリースが v1.2.5 / 2024-01 で約 2 年更新が止まっているが、
  ライブラリとしては現状動作する。これを承知の上で採用する。
- `react-three-mind` (MindAR×R3F ブリッジ) は古くパフォーマンス問題があるため不採用。
  React に依存せず、MindAR の **three.js 直 (`mindar-image-three`)** を使う。

## 採用方針

- **追従:** MindAR Image Tracking (three.js ビルド `mindar-image-three`)
- **描画:** three.js `@0.184`(既存 dependency をそのまま使用)
- **統合:** Astro 専用ページ `src/pages/[lang]/ar.astro` の `<script>`
  (Astro がクライアントバンドル) で初期化。**React は使わない (A 方式)**。
- **ページ:** `/ja/ar`, `/en/ar`
- **ターゲット:** 新規に用意する名刺画像をコンパイルした `.mind` ファイル。
  実装初期は MindAR 公式サンプル画像か旧名刺画像で動作確認し、本番画像は後で差し替える。

## ファイル構成

```
src/pages/[lang]/ar.astro        # 専用ページ。骨格 + <script> 初期化 + ローディング/許可UI + i18n
src/scripts/ar-business-card.ts  # MindAR + three.js 初期化ロジック (ページから import)
src/data/ar-card.ts              # 表示内容(名前・肩書き・リンク)の単一データソース + 純粋関数
public/ar/business-card.mind     # コンパイル済みターゲット (新名刺画像から生成)
public/ar/icons/*.png            # SNS/リンクアイコンのテクスチャ
docs/ar/compile-target.md        # .mind の生成手順メモ (再生成できるように)
```

### 責務分離

- **`ar.astro`** — HTML 骨格、ローディング表示、iOS モーション許可ボタン、非対応環境の案内、
  i18n テキスト適用。three.js / MindAR の詳細は知らない。
- **`ar-business-card.ts`** — MindAR アンカー生成、three.js シーン構築、
  テキスト/アイコンのメッシュ生成、raycaster によるタップ判定 → 外部リンク遷移。AR 描画の全責務。
- **`ar-card.ts`** — 名前・肩書き・リンク (label / url / icon) を型付きで一元管理。
  リンク整形などのロジックは純粋関数として切り出す。i18n の UI 文言は `src/i18n/ui.ts` に寄せる。

## データ

- 名前: `相曽 結` (`ui.hero_name` と整合)
- 肩書き: `Software Engineer` (`ui.hero_role`)
- リンク (既存 `src/components/Links.astro` を正とする):
  - GitHub `https://github.com/yui666a`
  - Qiita `https://qiita.com/yui666a`
  - Zenn `https://zenn.dev/yui666a`
  - X `https://x.com/yui_ai0216`
- 旧実装の Twitter/Instagram/Facebook URL は古いので踏襲しない。現行リンクに揃える。
- AR 上に出すリンクは視認性のため 3〜4 個程度に絞る (実装計画で確定)。

## データフロー

```
カメラ映像
  → MindAR 画像追従 (business-card.mind)
  → アンカー (名刺の上) に three.js グループを配置
      ├─ 名前/肩書き: Canvas にテキスト描画 → テクスチャ化 → plane に貼付 (日本語OK・軽量)
      └─ リンクアイコン: plane + texture、raycaster でタップ判定 → location.href で外部遷移
```

- テキストは `TextGeometry` (日本語フォントが重い) ではなく **Canvas テクスチャ方式**を採用。
- タップ判定は旧実装の fuse cursor ではなく、**素直な touch/click + raycaster** (モバイル前提)。

## エラー処理 / UX

- ライブラリ読込中はローディング表示 (旧「読み込み中…名刺を映してください」を踏襲、i18n 化)。
- カメラ権限拒否時のフォールバックメッセージ。
- iOS Safari のモーションセンサー許可ボタン (旧 `request_permission` 相当)。
  MindAR では多くの場合不要だが、必要になった場合に出せるようにしておく。
- `navigator.mediaDevices.getUserMedia` 非対応環境向けの案内文。

## テスト

- MindAR / three.js は WebGL + カメラ依存で自動テストが困難。
- **`ar-card.ts` のデータ整形・リンク生成ロジックを純粋関数に切り出し vitest で単体テスト**。
- AR 描画自体は手動確認 (`/run` 相当、実機カメラ)。

## スコープ外 (YAGNI)

- VRM / 3D アバター (旧コメントアウト分) — 入れない。
- WebXR / `@react-three/xr` — 今回は採用しない (将来別途検討)。
- 多言語ごとの名刺画像切り替え — ターゲット画像は 1 枚。
- `legacy_2022/ar/` の巨大バイナリ群 (aframe-*.js, *.glb 等) — 触らない。新実装は独立。

## 依存追加

- `mind-ar` (MindAR image tracking, three.js ビルドを使用) を `dependencies` に追加。
- three.js は既存の `three@^0.184.0` をそのまま使用 (MindAR の three.js ビルドと
  バージョン整合が取れるか実装初期に確認。問題あれば MindAR 推奨版に合わせる)。
