import tideData from '../data/tide.json';

export type TideEvent = { type: 'high' | 'low'; time: string; heightM: number };
export type TideDay = { date: string; events: TideEvent[] };

export const tide = tideData as {
  source: string;
  station: string;
  datum: string;
  lastVerifiedAt: string;
  days: TideDay[];
};

// 取得指定日期（YYYY-MM-DD）的潮汐，找不到就回傳第一天
export function getTideForDate(dateISO: string): TideDay {
  return tide.days.find((d) => d.date === dateISO) ?? tide.days[0];
}

// 由「現在時間（HH:MM）」找出下一次滿潮與乾潮
export function getNextTides(day: TideDay, nowHHMM: string) {
  const upcoming = day.events.filter((e) => e.time >= nowHHMM);
  const nextHigh =
    upcoming.find((e) => e.type === 'high') ??
    day.events.find((e) => e.type === 'high');
  const nextLow =
    upcoming.find((e) => e.type === 'low') ??
    day.events.find((e) => e.type === 'low');
  return { nextHigh, nextLow };
}
