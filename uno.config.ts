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
  },
  // presetWind4 v66 は theme.maxWidth を解釈しないため、max-w-content をルールで定義する(=--maxw: 720px)
  rules: [['max-w-content', { 'max-width': '720px' }]],
  // 現行の余白スケール(8pxベース)を任意値ではなくショートカット可能にしておく
  shortcuts: {
    // セクション縦余白(=--s-7: 6rem)
    'section-y': 'py-[6rem]',
    // 1カラム読みやすい幅 + 左右パディング(=--pad)
    container: 'w-full max-w-content mx-auto px-[clamp(1.25rem,5vw,2rem)]',
  },
});
