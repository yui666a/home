# Playground ギャラリー 設計

- 日付: 2026-11-08
- ブランチ: `feature/playground-gallery`
- 対象: `home`（Astro 6 + UnoCSS + three.js r184、i18n ja/en、GitHub Pages `yui666a.me`）

## 目的

`/{lang}/playground` を、ブラウザで試した実験を世間に共有する場所にする。実験ごとに固有の URL を持たせ、一覧ページから辿れるようにする。実験は今後も増えるため、追加の手間は「実験ページを作り、一覧データに 1 件足す」だけに抑える。

一覧ページ自体にも HTML-in-Canvas（Chrome 157 で stable）を使い、ページを眺めるだけで「このサイトは実験をしている」ことが伝わるようにする。

## ゴール

- `/{lang}/playground` が実験の一覧になる
- 最初の実験として次の 3 本を載せる
  - 粒子ネットワーク: `/{lang}/playground/particles`
  - HTML-in-Canvas: `/{lang}/playground/html-in-canvas`
  - AR 名刺: `/{lang}/playground/ar`
- 一覧のカードのサムネの中で、各実験の軽量版が動く
- Chrome 157 以降では、ホバー中のカードが canvas 上で歪む

## 非ゴール

- 4 本目以降の実験（「何か他の面白いもの」）は今回作らない
- 非対応ブラウザ向けの HTML-in-Canvas ポリフィル（`three-html-render` など）は入れない。非対応ブラウザには素の HTML を見せる
- 実験ごとのソースコード表示や解説記事は持たない
- タグによる絞り込み、並べ替え、ページ送りは持たない

## アンチゴール

- 非対応ブラウザで、一覧のカードが見えない・押せない状態になること。HTML-in-Canvas は上乗せの演出であり、無くても一覧は完全に機能しなければならない
- 一覧ページが重くなり、スクロールやホバーがカクつくこと
- 演出によって、カード内の文字選択、リンク、キーボード操作、スクリーンリーダーの読み上げが壊れること

## ページ構成

### 一覧ページ `/{lang}/playground`

トップページと地続きの明るいトーン（`--bg` 生成り、`--accent` ティール）で作る。Nav は出さず、左上の「← 戻る」でトップへ戻る導線は現行のまま維持する。

- 見出し「Playground」と一行の説明文
- 実験カードのグリッド。デスクトップは 3 列、狭い画面では 1 列
- 各カードは実験ページへのリンクで、次を持つ
  - 動くサムネ（縦横比 4:3）
  - 公開年月（`YYYY.MM`）
  - タイトル
  - 一文の説明
  - 技術タグ（例: `three.js`、`Chrome 157`、`MindAR`）
- 並び順は公開年月の新しい順

### 動くサムネ

各実験は、一覧のサムネ用に軽量なアニメーションを 1 つ持つ。

- サムネに WebGL は使わない。一覧に WebGL コンテキストが並ぶとブラウザの同時コンテキスト上限と負荷に当たるため。CSS アニメーションか 2D canvas で作る
- 画面外のサムネはアニメーションを止める（`IntersectionObserver` などで判定する）
- `prefers-reduced-motion: reduce` のときは静止させる
- 想定するサムネ
  - 粒子ネットワーク: 点と近接線が流れる 2D 表現
  - HTML-in-Canvas: 名刺風の小さな HTML カードがゆっくり傾く
  - AR 名刺: 名刺の枠をスキャンしているような表現

### ホバー演出（HTML-in-Canvas）

Chrome 157 以降でだけ、カードを canvas に取り込んでポインター位置を中心に歪ませる。ホバーしていないときとホバーを外したあとは、見た目が素の HTML と区別できない状態に戻す。

- 段階的な強化として作る。サーバーが出力する HTML は素のカードのグリッドで、JS が対応を検出したときだけ canvas で包む
- 対応の検出は canvas に `content="drawable"` を設定し、`canvas.content === 'drawable'` を確かめる公式の方法で行う
- canvas は `content="drawable"`、カードの要素に `drawable` 属性を付け、`paint` イベントの中で `drawElementImage()` を呼ぶ
- 演出はポインターを中心とした波紋（短冊状に切って横にずらす変位）を基本とする。強さや種類の調整は実装者に任せる
- 演出中の短冊描画は `preserveElementGeometry` で当たり判定を素の位置に固定し、歪みでホバーが途切れないようにする
- `devicePixelContentBoxSize` で canvas の解像度を物理ピクセルに合わせ、文字がぼやけないようにする
- `prefers-reduced-motion: reduce` のときは canvas で包まない
- タッチ端末（`hover: none`）では演出しない

### 実験ページ（共通）

全画面の体験として作る。左上に「← Playground」の導線だけを置き、一覧ページへ戻す。Nav は出さない。

### 粒子ネットワーク `/{lang}/playground/particles`

現在 `/{lang}/playground` で表示している `PlaygroundCanvas.astro` の粒子ネットワークを、そのままこのページへ移す。挙動は変えない。

### HTML-in-Canvas `/{lang}/playground/html-in-canvas`

粒子ネットワークの空間の中に、名刺のような HTML カードを 3D で浮かべる。カードは名前、肩書き、tagline、外部リンク（GitHub など）を持つ普通の HTML で、three.js の板ポリゴンのテクスチャへ `texElementSubImage2D()` で転送する。`THREE.HTMLTexture` は r187 時点でも旧 API の `layoutsubtree` と `texElementImage2D` に依存しており、Chrome 157 の現行 API に合わないため使わない。

- カードはゆっくり揺れ、マウスで傾く
- 3D 上のカードで、文字選択とリンクのクリックがそのまま効くこと自体を見せ場にする
- クリックと文字選択の当たり判定は、板の変換行列を毎フレーム `updateElementGeometry()` に渡して合わせる
- ホバー中はカードの揺れを止め、文字をドラッグ選択できるようにする
- 名前・肩書き・tagline は `src/i18n/ui.ts` の既存キー、リンクは既存の Links セクションのデータを使い、文言を二重に持たない
- 非対応ブラウザでは、同じカードを素の HTML として中央に置き、「Chrome 157 以降で 3D 表示になります」と添える

### AR 名刺 `/{lang}/playground/ar`

未マージの PR #12（`/{lang}/ar`）の実装を、このパスへ移してからマージする。`/{lang}/ar` はまだ公開されていないため、リダイレクトは置かない。

- PR #12 が Nav に追加している AR 名刺への導線は外し、入口を一覧ページに一本化する
- Works セクションの「AR名刺」の `url` は、`/ja/playground/ar` に向ける

## 実験一覧のデータ

`src/data/experiments.ts` に一覧を 1 つの配列で持ち、一覧ページはこれを描画する。型は既存の `src/data/works.ts` と同じく `LocalizedText` で ja/en を持つ。

各実験が持つもの:

- `slug`（URL の末尾。`/^[a-z0-9-]+$/`、一意）
- `title`、`summary`（ja/en）
- `publishedAt`（`YYYY-MM`）
- `tags`（文字列の配列）

サムネのコンポーネントとデータの結び付け方は実装者に任せる。

`tests/data.test.ts` の works と同じ形で、slug の形式と一意性、ja/en の欠けを検査するテストを足す。

## i18n

UI 文言（一覧の説明文、「← Playground」、非対応ブラウザ向けの案内など）は `src/i18n/ui.ts` に足す。実験ごとのタイトルと説明は `experiments.ts` に持つ。

## 進め方

2 段階で入れる。

1. 一覧の箱を作り、粒子ネットワークと AR 名刺を引っ越す。この段階の一覧はホバー演出なしで公開できる状態にする
2. HTML-in-Canvas の実験ページと、一覧のホバー演出を入れる

## 実装者に任せること

- ホバー演出の具体的な歪みの式とパラメータ
- 各サムネの具体的なアニメーション
- 実験ページ間で共通化する範囲（戻る導線の部品化など）
- HTML-in-Canvas ページのカメラ・揺れ・粒子数などの見た目の調整
