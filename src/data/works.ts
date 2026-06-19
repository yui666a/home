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
