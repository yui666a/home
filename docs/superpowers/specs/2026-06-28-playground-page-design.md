# playground ページ 設計

**日付**: 2026-06-28
**ブランチ**: `feature/playground`
**関連**: report.md 表 #1（playground ページ未実装 → CTAクリックで404）

## 目的

Nav / Hero の「Playground」リンクが遷移先ページを持たず 404 になる問題を解消する。あわせて、ポートフォリオのサブ目的「自己表現・遊び場（技術的な実験やビジュアル表現で自分らしさを出す）」の入り口として、既存の Three.js 粒子ネットワークを**全画面で見せる**枠を用意する。

今回は「1つの粒子ネットワークを全画面表示 ＋ 戻る導線」のみの最小実装とする。中身（複数実験のギャラリー化、高度なインタラクション）は将来別途。

## ルーティング

- `src/pages/[lang]/playground.astro` を新設する。
- `getStaticPaths` で `locales`（ja / en）を展開し、`/ja/playground` `/en/playground` を生成する（`index.astro` と同じパターン）。

## コンポーネント構成

### PlaygroundCanvas.astro（新規・playground専用）

既存 `HeroBackground.astro` をベースにするが、**HeroBackground 自体には一切手を加えない**（report.md で「Three.js 不可侵」と検証された安定資産のため）。playground は遊び場として独立して育てる方針で、コードの重複は許容する。

背景前提を外し、全画面のインタラクティブ表示にする:

- canvas の id を `playground-canvas` にする（`hero-bg` との衝突回避）。
- `aria-hidden` / `pointer-events-none` / 下部フェードマスクを**外す**。
- canvas を `position: fixed; inset: 0`（全画面）に置く。
- 粒子数は見せ場として背景（70）より増やす（目安 110〜130）。
- accent 色は `#3a8d7f`（サイトのティールに統一）。
- `prefers-reduced-motion: reduce` のときは描画しない配慮を踏襲する。

### ページ UI

- 全画面 3D キャンバスの上に「← 戻る / ← Back」リンクのみを重ねる。
  - `position: fixed`、左上に配置。
  - リンク先は各言語のトップ（`getRelativeLocaleUrl(locale, '')`）。
  - i18n: `playground_back` キーを追加（ja「← 戻る」/ en「← Back」）。
- Nav は表示しない（没入優先）。
- ページ全体は `overflow: hidden`（全画面、スクロールバーなし）。

### レイアウト

- `Base.astro` は使う（メタ情報 / lang / フォント適用のため）。
- ただし Nav・各セクションは出さず、PlaygroundCanvas と Back リンクのみを置く。

## データフロー

- 静的生成のみ。ビルド時に locales を展開して2ページを生成する。
- クライアントでは PlaygroundCanvas の `<script>` が Three.js を初期化し、`requestAnimationFrame` でアニメーションする。外部データ取得は無い。

## エラー処理・配慮

- WebGL 非対応 / 取得失敗時もページ自体は表示される（canvas が描画されないだけ）。Back リンクは常に機能する。
- `prefers-reduced-motion` 時はアニメーションを止める。

## テスト

- 既存の i18n テスト（`tests/i18n.test.ts`）に `playground_back` キーが ja/en 両方に存在することが含まれる形にする（既存テストが全キーの ja/en 一致を検証していれば自動でカバーされる。検証範囲を確認し、不足なら最小限の追加をする）。
- `pnpm exec astro check` 0 errors / `pnpm build` 成功 / ブラウザで `/ja/playground` `/en/playground` の全画面表示と Back 導線を確認する。

## スコープ外（将来）

- 複数の実験を切り替えるギャラリー機能。
- クリック等の高度なインタラクション。
- playground 専用の凝った演出。
