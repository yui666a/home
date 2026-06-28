export type LocalizedText = { ja: string; en: string };

export type Affiliation = {
  slug: string;
  name: LocalizedText; // ロゴの alt に使う社名
  url: string;
  logo: string; // public 配下のパス。常に表示する
};

// 所属（過去・現在）。ロゴのみを淡々と並べる。
export const affiliations: Affiliation[] = [
  {
    slug: 'buysell-technologies',
    name: {
      ja: '株式会社BuySell Technologies',
      en: 'BuySell Technologies Co., Ltd.',
    },
    url: 'https://buysell-technologies.com/',
    logo: '/img/logo/buysell-technologies.svg',
  },
  {
    slug: 'style-arts',
    name: { ja: '株式会社スタイルアーツ', en: 'Style Arts Co., Ltd.' },
    url: 'https://style-arts.jp/',
    logo: '/img/logo/style-arts.png',
  },
];
