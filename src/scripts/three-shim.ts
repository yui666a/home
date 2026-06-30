// MindAR の prod ビルド (mindar-image-three.prod.js) は three r150 で
// 削除された `sRGBEncoding` を named import している。three@0.184 には存在せず
// バンドル時に解決できないため、本物の three を全て re-export しつつ、
// 旧名 `sRGBEncoding` を現行 `SRGBColorSpace` の別名として補う。
// 追加の export なので、既存の three 利用箇所には影響しない。
export * from 'three';
export { SRGBColorSpace as sRGBEncoding } from 'three';
