/**
 * Hero に出す写真のキャプション。
 *
 * キーは src/assets/hero/ のファイル名。ここに無い写真はキャプションなしで表示する
 * (撮影地が思い出せない写真を足すために、必須にはしない)。
 */
export interface HeroCaption {
  /** 撮影地。日本語ロケール向け */
  placeJa: string;
  /** 撮影地。英語ロケール向け */
  placeEn: string;
  /** 撮影年 */
  year: string;
}

export const heroCaptions: Record<string, HeroCaption> = {
  '01-dorm-courtyard-laundry.jpg': {
    placeJa: 'とある寮',
    placeEn: 'A dormitory',
    year: '2022',
  },
  '02-backlit-lawn-house.jpg': {
    placeJa: 'Ashtabula, Ohio',
    placeEn: 'Ashtabula, Ohio',
    year: '2018',
  },
  '03-tree-lined-street-night.jpg': {
    placeJa: '東京・丸の内',
    placeEn: 'Marunouchi, Tokyo',
    year: '2021',
  },
  '04-illuminated-bridge-night.jpg': {
    placeJa: '新潟・長岡',
    placeEn: 'Nagaoka, Niigata',
    year: '2020',
  },
};
