// セクション番号の一元管理。表示順に 01 から採番する。
// 見出しは SectionHeading に num として渡す。
export const sectionNo = {
  about: '01',
  skills: '02',
  works: '03',
  affiliations: '04',
  contributions: '05',
  lapras: '06',
  links: '07',
} as const;

export type SectionKey = keyof typeof sectionNo;
