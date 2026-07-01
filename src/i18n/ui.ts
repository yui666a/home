// 翻訳辞書。ロケールは ja/en の2つ。キーは ui.ja の形から型推論される。
export type Locale = 'ja' | 'en';

export const locales = ['ja', 'en'] as const satisfies readonly Locale[];

export const defaultLocale: Locale = 'ja';

export const ui = {
  ja: {
    nav_about: 'About',
    nav_skills: 'Skills',
    nav_works: 'Works',
    nav_affiliations: 'Affiliations',
    nav_links: 'Links',
    nav_playground: 'Playground',
    hero_name: '相曽 結',
    hero_role: 'Software Engineer',
    hero_tagline: 'となりの人が、ちょっと楽になるように。',
    about_heading: 'About',
    skills_heading: 'Skills',
    works_heading: 'Works',
    works_view_site: 'サイトを見る',
    works_close: '閉じる',
    affiliations_heading: 'Affiliations',
    links_heading: 'Links',
    contributions_heading: 'Contributions',
    contributions_caption: '直近1年で {count} contributions',
    contributions_tip: '{date} に {count} contributions',
    contributions_tip_zero: '{date} は contributions なし',
    lapras_heading: 'LAPRAS Score',
    lapras_engineering: 'エンジニアリング',
    lapras_business: 'ビジネス',
    lapras_influence: '影響力',
    lapras_source: 'LAPRAS で詳しく見る',
    playground_back: '← 戻る',
    lang_switch_to: 'EN',
  },
  en: {
    nav_about: 'About',
    nav_skills: 'Skills',
    nav_works: 'Works',
    nav_affiliations: 'Affiliations',
    nav_links: 'Links',
    nav_playground: 'Playground',
    hero_name: 'AISO, Hitoshi',
    hero_role: 'Software Engineer',
    hero_tagline: 'Building someone\'s "a little easier."',
    about_heading: 'About',
    skills_heading: 'Skills',
    works_heading: 'Works',
    works_view_site: 'View site',
    works_close: 'Close',
    affiliations_heading: 'Affiliations',
    links_heading: 'Links',
    contributions_heading: 'Contributions',
    contributions_caption: '{count} contributions in the last year',
    contributions_tip: '{count} contributions on {date}',
    contributions_tip_zero: 'No contributions on {date}',
    lapras_heading: 'LAPRAS Score',
    lapras_engineering: 'Engineering',
    lapras_business: 'Business',
    lapras_influence: 'Influence',
    lapras_source: 'View on LAPRAS',
    playground_back: '← Back',
    lang_switch_to: 'JP',
  },
} as const;

export type MessageKey = keyof (typeof ui)['ja'];

export function t(locale: Locale, key: MessageKey): string {
  return ui[locale][key];
}
