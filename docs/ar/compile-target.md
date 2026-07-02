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
