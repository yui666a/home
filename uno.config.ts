import presetWind4 from '@unocss/preset-wind4';
import { defineConfig } from 'unocss';

export default defineConfig({
  presets: [presetWind4()],
  theme: {
    // 値は global.css の CSS 変数を正本とし、ここでは参照だけを持つ。
    // 固定値を書くとユーティリティ側が変数の上書きに追従せず、
    // Hero のトーン反転のような局所的な配色変更が効かなくなる。
    colors: {
      bg: 'var(--bg)',
      fg: 'var(--fg)',
      muted: 'var(--muted)',
      line: 'var(--line)',
      accent: 'var(--accent)',
    },
    // フォントファミリーは global.css の --font-sans が正本(body に適用)。
    // presetWind4 の theme.font とは重複するため、ここでは定義しない。
  },
  // presetWind4 v66 は theme.maxWidth を解釈しないため、max-w-content をルールで定義する(=--maxw: 720px)
  rules: [
    ['max-w-content', { 'max-width': '720px' }],
    ['max-w-wide', { 'max-width': '1040px' }],
  ],
  // 現行の余白スケール(8pxベース)を任意値ではなくショートカット可能にしておく
  shortcuts: {
    // セクション縦余白(=--s-7: 6rem)
    'section-y': 'py-[6rem]',
    // 1カラム読みやすい幅 + 左右パディング(=--pad)
    container: 'w-full max-w-content mx-auto px-[clamp(1.25rem,5vw,2rem)]',
    // 一覧・グリッド系の広いコンテナ
    'container-wide': 'w-full max-w-wide mx-auto px-[clamp(1.25rem,5vw,2rem)]',
  },
});
