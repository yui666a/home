import type { LocalizedText } from './works';

export type TimelineEntry = {
  period: string;          // 表示用の期間 (例: "2020 –")
  title: LocalizedText;    // 所属・肩書
  detail?: LocalizedText;  // 補足 (任意)
};

// TODO(未確定): 実際の職歴・活動に差し替える。下記は構造確認用の仮データ。
export const timeline: TimelineEntry[] = [
  {
    period: '2020 –',
    title: { ja: '長岡技術科学大学', en: 'Nagaoka University of Technology' },
    detail: { ja: '情報・経営システム工学', en: 'Information & Management Systems Engineering' },
  },
  {
    period: '2014 – 2020',
    title: { ja: '奈良工業高等専門学校', en: 'National Institute of Technology, Nara College' },
    detail: { ja: '情報工学科', en: 'Dept. of Information Engineering' },
  },
];
