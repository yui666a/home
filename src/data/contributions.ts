// GitHub のコントリビューション(草)をビルド時に取得する。
// 非公式API (jogruber) が date/count/level(0-4) を返す。
// ネットワーク制限やAPI障害でも build を止めないよう、失敗時は空配列を返す。

const GITHUB_USER = 'yui666a';
const API = `https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=last`;

export type ContributionDay = {
  date: string; // YYYY-MM-DD
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

export type Contributions = {
  total: number;
  days: ContributionDay[];
};

export async function fetchContributions(): Promise<Contributions> {
  try {
    const res = await fetch(API, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data = (await res.json()) as {
      total: { lastYear: number };
      contributions: ContributionDay[];
    };
    return { total: data.total.lastYear, days: data.contributions };
  } catch (e) {
    // フォールバック: 草は出さない（セクション側で空表示にする）
    console.warn(`[contributions] fetch failed, skipping grass: ${String(e)}`);
    return { total: 0, days: [] };
  }
}
