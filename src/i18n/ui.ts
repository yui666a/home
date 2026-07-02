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
    ar_title: 'AR名刺',
    ar_loading: '読み込み中です。少々お待ちください。',
    ar_scan_hint: 'カメラで名刺を映してください',
    ar_camera_denied: 'カメラの使用が許可されませんでした。ブラウザの設定を確認してください。',
    ar_unsupported: 'このブラウザはカメラARに対応していません。',
    ar_motion_permission: 'モーションセンサーを許可',
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
    ar_title: 'AR Business Card',
    ar_loading: 'Loading, please wait a moment.',
    ar_scan_hint: 'Point your camera at the business card',
    ar_camera_denied: 'Camera access was denied. Please check your browser settings.',
    ar_unsupported: 'This browser does not support camera AR.',
    ar_motion_permission: 'Allow motion sensors',
    lang_switch_to: 'JP',
  },
} as const;

export type MessageKey = keyof (typeof ui)['ja'];

export function t(locale: Locale, key: MessageKey): string {
  return ui[locale][key];
}
