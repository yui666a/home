// LAPRAS のスコアをビルド時に取得する。
// 公開ポートフォリオの JSON が e/b/i の3スコアを返す。
// ネットワーク制限や API 障害でも build を止めないよう、失敗時は null を返す。

const LAPRAS_SHARE_ID = 'YXVLCA2';
const API = `https://lapras.com/public/${LAPRAS_SHARE_ID}.json`;

export type LaprasScores = {
  engineering: number; // e_score
  business: number; // b_score
  influence: number; // i_score
};

export async function fetchLaprasScores(): Promise<LaprasScores | null> {
  try {
    const res = await fetch(API, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = (await res.json()) as {
      e_score: number;
      b_score: number;
      i_score: number;
    };
    return {
      engineering: data.e_score,
      business: data.b_score,
      influence: data.i_score,
    };
  } catch (e) {
    // フォールバック: カードを出さない（セクション側で非表示にする）
    console.warn(`[lapras] fetch failed, skipping card: ${String(e)}`);
    return null;
  }
}
