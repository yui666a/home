import type { LocalizedText } from './works';

// スキルの習熟度。表示ラベルは labels.ts の skillLevelLabel を参照。
export type SkillLevel = 'usable' | 'practical' | 'expert';

export type SkillItem = {
  name: string;
  level: SkillLevel;
  logo?: string; // public/img/logo 配下
};

export type SkillCategory = {
  category: LocalizedText;
  items: SkillItem[];
};

export const skills: SkillCategory[] = [
  {
    category: { ja: '言語', en: 'Languages' },
    items: [
      // TODO: typescript.svg のロゴ画像が未配置。配置したら logo を追加する。
      { name: 'TypeScript / JavaScript', level: 'practical' },
      { name: 'Python', level: 'practical', logo: '/img/logo/python.svg' },
      { name: 'HTML / CSS', level: 'practical', logo: '/img/logo/html5.svg' },
      { name: 'Java', level: 'usable', logo: '/img/logo/java.svg' },
      { name: 'Swift', level: 'usable', logo: '/img/logo/swift.svg' },
    ],
  },
  {
    category: { ja: 'フレームワーク', en: 'Frameworks' },
    items: [
      { name: 'React', level: 'practical', logo: '/img/logo/react.svg' },
      // TODO: astro.svg / nodejs.svg のロゴ画像が未配置。
      { name: 'Astro', level: 'practical' },
      { name: 'Node.js', level: 'practical' },
      { name: 'WordPress', level: 'practical', logo: '/img/logo/wordpress.svg' },
      { name: 'Ruby on Rails', level: 'usable', logo: '/img/logo/ruby_on_rails.svg' },
      { name: 'Unity', level: 'usable', logo: '/img/logo/unity.svg' },
    ],
  },
  {
    category: { ja: 'データ / 基盤', en: 'Data / Infra' },
    items: [
      // TODO: bigquery.svg のロゴ画像が未配置。
      { name: 'SQL / BigQuery', level: 'usable' },
    ],
  },
];

export const skillLevelLabel: Record<SkillLevel, LocalizedText> = {
  usable: { ja: '使える', en: 'Familiar' },
  practical: { ja: '実務レベル', en: 'Professional' },
  expert: { ja: '専門', en: 'Expert' },
};
