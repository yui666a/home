import type { LocalizedText } from './works';

export type Experiment = {
  slug: string; // /{lang}/playground/{slug}
  title: LocalizedText;
  summary: LocalizedText;
  publishedAt: string; // YYYY-MM
  tags: string[];
};

export const experiments: Experiment[] = [
  {
    slug: 'html-in-canvas',
    title: { ja: 'HTML in Canvas', en: 'HTML in Canvas' },
    summary: {
      ja: '3D に浮かぶ本物の HTML。文字が選べて、リンクが押せる。',
      en: 'Real HTML floating in 3D. Select the text, click the links.',
    },
    publishedAt: '2026-11',
    tags: ['Chrome 157', 'WebGL'],
  },
  {
    slug: 'ar',
    title: { ja: 'AR名刺', en: 'AR Business Card' },
    summary: {
      ja: '名刺をカメラに映すとリンクが浮かぶ。',
      en: 'Point a camera at the card and links appear.',
    },
    publishedAt: '2026-07',
    tags: ['MindAR', 'three.js'],
  },
  {
    slug: 'particles',
    title: { ja: 'Particle Network', en: 'Particle Network' },
    summary: {
      ja: '粒子を近接線でつなぐ。マウスで視点が傾く。',
      en: 'Particles linked by proximity. The view tilts with your mouse.',
    },
    publishedAt: '2026-06',
    tags: ['three.js'],
  },
];
