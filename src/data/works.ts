export type LocalizedText = { ja: string; en: string };

export type Work = {
  slug: string;
  title: LocalizedText;
  summary: LocalizedText;
  tags: string[];
  url: string;
  thumbnail?: string; // public 配下のパス。未設定ならプレースホルダ
};

// 成果物は随時追加していく。
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
