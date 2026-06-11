import type { LocalizedText } from './works';

export type SkillItem = {
  name: string;
  logo?: string; // public/img/logo 配下
  // TODO(未確定): 習熟度表示を入れるか後で決定 (例: level?: 'practice'|'work')
};

export type SkillCategory = {
  category: LocalizedText;
  items: SkillItem[];
};

export const skills: SkillCategory[] = [
  {
    category: { ja: '言語', en: 'Languages' },
    items: [
      { name: 'HTML/CSS/JS', logo: '/img/logo/html5.svg' },
      { name: 'Python', logo: '/img/logo/python.svg' },
      { name: 'Swift', logo: '/img/logo/swift.svg' },
      { name: 'Java', logo: '/img/logo/java.svg' },
    ],
  },
  {
    category: { ja: 'フレームワーク', en: 'Frameworks' },
    items: [
      { name: 'React', logo: '/img/logo/react.svg' },
      { name: 'Ruby on Rails', logo: '/img/logo/ruby_on_rails.svg' },
      { name: 'Unity', logo: '/img/logo/unity.svg' },
      { name: 'WordPress', logo: '/img/logo/wordpress.svg' },
    ],
  },
];
