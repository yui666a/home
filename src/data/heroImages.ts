import sharp from 'sharp';
import path from 'node:path';

/** Hero 背景 1 枚ぶんのメタ情報。tone は文字色をどちらに寄せるかの判定結果。 */
export interface HeroImageTone {
  /** src/assets/hero からの相対ファイル名 */
  file: string;
  /** テキストが乗る領域の知覚輝度 (0=黒, 1=白) */
  luma: number;
  /** 暗い写真は文字を白に反転する */
  tone: 'light' | 'dark';
}

/**
 * テキストが乗る領域の明度でトーンを分ける閾値。
 * 実測では明るい写真が 0.38〜0.43、夜景が 0.19 に落ちたため、
 * その谷にあたる 0.30 を境界に置く。
 */
const DARK_THRESHOLD = 0.3;

/** Rec.709 の係数で知覚輝度を求める。単純な RGB 平均では緑の寄与を過小評価するため。 */
function perceivedLuma(channels: { mean: number }[]): number {
  const [r, g, b] = channels;
  return (0.2126 * r.mean + 0.7152 * g.mean + 0.0722 * b.mean) / 255;
}

/**
 * 画像の明度を測ってトーンを判定する。
 *
 * 全体平均ではなく左下領域だけを測るのは、空が明るい写真で
 * 平均が引き上げられ、文字が乗る足元の暗さを取りこぼすため。
 */
export async function analyzeHeroImage(absPath: string): Promise<HeroImageTone> {
  const meta = await sharp(absPath).metadata();
  const width = Math.max(1, Math.floor((meta.width ?? 1) * 0.62));
  const height = Math.max(1, Math.floor((meta.height ?? 1) * 0.55));
  const top = Math.max(0, (meta.height ?? 1) - height);

  const cropped = await sharp(absPath).extract({ left: 0, top, width, height }).toBuffer();
  const luma = perceivedLuma((await sharp(cropped).stats()).channels);

  return {
    file: path.basename(absPath),
    luma,
    tone: luma < DARK_THRESHOLD ? 'dark' : 'light',
  };
}

/**
 * src/assets/hero の絶対パスを解決する。
 *
 * import.meta.url を基準にしない: ビルド時この処理は dist/.prerender/ 配下に
 * バンドルされて実行されるため、モジュール位置からの相対パスでは src/ を見失う。
 * 解析は常にプロジェクトルートで走るので cwd を基準にする。
 */
export function heroAssetPath(file: string): string {
  return path.join(process.cwd(), 'src', 'assets', 'hero', file);
}
