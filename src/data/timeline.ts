import type { LocalizedText } from './works';

export type TimelineEntry = {
  period: string; // 表示用の期間 (例: "2020 –")
  title: LocalizedText; // 所属・肩書
  detail?: LocalizedText; // 補足 (任意)
};

export const timeline: TimelineEntry[] = [
  {
    period: '2024 –',
    title: { ja: '株式会社BuySell Technologies', en: 'BuySell Technologies Co., Ltd.' },
    detail: { ja: 'Software Engineer', en: 'Software Engineer' },
  },
  {
    period: '2022 – 2024',
    title: {
      ja: '長岡技術科学大学 大学院',
      en: 'Nagaoka University of Technology, Graduate School',
    },
    detail: {
      ja: '情報・経営システム工学専攻 修士課程 修了',
      en: "Master's, Information & Management Systems Engineering",
    },
  },
  {
    period: '2020 – 2022',
    title: { ja: '長岡技術科学大学', en: 'Nagaoka University of Technology' },
    detail: { ja: '情報・経営システム工学 学士', en: "Bachelor's, Information & Management Systems Engineering" },
  },
  {
    period: '2014 – 2020',
    title: { ja: '奈良工業高等専門学校', en: 'National Institute of Technology, Nara College' },
    detail: { ja: '情報工学科', en: 'Dept. of Information Engineering' },
  },
];
