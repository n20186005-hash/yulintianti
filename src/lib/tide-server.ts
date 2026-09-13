// 伺服器端潮汐與海象資料存取模組。
// 僅在伺服器／邊緣執行（由伺服器島嶼呼叫），不會進入前端 bundle。
// 取回後於邊緣節點快取，降低上游請求量；任何失敗都回傳 null，由呼叫端優雅降級。

import { SITE } from '../data/site.js';

export interface MarineHour {
  /** 當地時間 YYYY-MM-DDTHH:MM */
  time: string;
  date: string;
  hour: number;
  /** 自當日 00:00 起的分鐘數 */
  minutes: number;
  /** 潮位（公尺，相對平均海平面） */
  level: number;
  waveHeight: number;
  waveDirection: number;
  seaTemp: number;
}

export interface TideEvent {
  type: 'high' | 'low';
  /** YYYY-MM-DD */
  date: string;
  /** HH:MM */
  time: string;
  heightM: number;
  /** epoch ms，僅供排序與前後比較 */
  at: number;
}

export interface MoonInfo {
  /** 0（新月）～1（下一個新月） */
  phase: number;
  name: string;
  emoji: string;
  /** 受照面比例 0～1 */
  illumination: number;
}

export interface TideDay {
  date: string;
  /** 0=週日 */
  weekday: number;
  events: TideEvent[];
  highMax: number;
  lowMin: number;
  /** 當日潮差（公尺） */
  rangeM: number;
  /** 是否為大潮（潮差接近本期相對高點） */
  spring: boolean;
  moon: MoonInfo;
}

export type TideTrend = 'rising' | 'falling' | 'high' | 'low' | 'unknown';

export interface TideBundle {
  current: {
    time: string;
    level: number | null;
    trend: TideTrend;
    trendLabel: string;
    /** 每小時潮位變化率（公尺／小時），正為漲潮 */
    ratePerHour: number | null;
  };
  waveHeight: number | null;
  waveDirection: number | null;
  seaTemp: number | null;
  /** 自目前時刻起算的 24 小時潮位 */
  next24: MarineHour[];
  days: TideDay[];
  today: TideDay | null;
  nextHigh: TideEvent | null;
  nextLow: TideEvent | null;
  fetchedAt: string;
}

const MARINE_ENDPOINT = 'https://marine-api.open-meteo.com/v1/marine';

// 潮汐屬低速變化量，快取 30 分鐘即可維持準確度
const CACHE_TTL_MS = 30 * 60 * 1000;
const CACHE_TTL_SECONDS = 1800;

function buildEndpoint(): string {
  const params = new URLSearchParams({
    latitude: String(SITE.geo.lat),
    longitude: String(SITE.geo.lng),
    hourly: [
      'sea_level_height_msl',
      'wave_height',
      'wave_direction',
      'sea_surface_temperature',
    ].join(','),
    current: ['sea_level_height_msl', 'wave_height', 'wave_direction', 'sea_surface_temperature'].join(','),
    timezone: 'Asia/Taipei',
    // 多取前一日，讓「今日」的第一次滿潮／乾潮也能被完整辨識
    past_days: '1',
    forecast_days: '7',
  });
  return `${MARINE_ENDPOINT}?${params.toString()}`;
}

const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
const numOrNull = (v: unknown): number | null =>
  typeof v === 'number' && Number.isFinite(v) ? v : null;

/** 台北時區的現在時刻（YYYY-MM-DDTHH:MM） */
export function nowInTaipeiISO(now: Date = new Date()): string {
  return new Date(now.getTime() + 8 * 3600 * 1000).toISOString().slice(0, 16);
}

/** 台北時區的今日日期（YYYY-MM-DD） */
export function todayInTaipei(now: Date = new Date()): string {
  return nowInTaipeiISO(now).slice(0, 10);
}

// —— 月相：用來解釋大潮／小潮的成因 ——
const SYNODIC_MONTH = 29.530588853;
// 參考點：2000-01-06 18:14 UTC 的新月
const REF_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);

const MOON_NAMES = ['新月', '眉月', '上弦月', '盈凸月', '滿月', '虧凸月', '下弦月', '殘月'];
const MOON_EMOJI = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];

export function moonInfo(dateYMD: string): MoonInfo {
  const t = Date.parse(`${dateYMD}T12:00:00Z`);
  if (!Number.isFinite(t)) {
    return { phase: 0, name: '—', emoji: '🌑', illumination: 0 };
  }
  let phase = (((t - REF_NEW_MOON) / 86400000) % SYNODIC_MONTH) / SYNODIC_MONTH;
  if (phase < 0) phase += 1;

  const illumination = (1 - Math.cos(2 * Math.PI * phase)) / 2;
  const idx = Math.round(phase * 8) % 8;
  return { phase, name: MOON_NAMES[idx], emoji: MOON_EMOJI[idx], illumination };
}

function normalizeHours(raw: any): MarineHour[] {
  const h = raw?.hourly ?? {};
  const times: string[] = h.time ?? [];
  return times
    .map((t, i) => {
      const time = String(t).slice(0, 16);
      return {
        time,
        date: time.slice(0, 10),
        hour: Number(time.slice(11, 13)),
        minutes: Number(time.slice(11, 13)) * 60 + Number(time.slice(14, 16)),
        level: num(h.sea_level_height_msl?.[i]),
        waveHeight: num(h.wave_height?.[i]),
        waveDirection: num(h.wave_direction?.[i]),
        seaTemp: num(h.sea_surface_temperature?.[i]),
      };
    })
    .filter((x) => Number.isFinite(x.minutes));
}

/**
 * 由逐時潮位找出滿潮與乾潮。
 * 以相鄰三點做二次內插，取得比逐時取樣更精確的潮時與潮高
 * （逐時資料直接取極值會有最多半小時的誤差）。
 */
function findExtrema(hours: MarineHour[]): TideEvent[] {
  const out: TideEvent[] = [];

  for (let i = 1; i < hours.length - 1; i++) {
    const prev = hours[i - 1];
    const cur = hours[i];
    const next = hours[i + 1];

    const isHigh = cur.level > prev.level && cur.level >= next.level;
    const isLow = cur.level < prev.level && cur.level <= next.level;
    if (!isHigh && !isLow) continue;

    // y(x) = y1 + a·x + b·x²（x 以「小時」為單位，極值落在 [-0.5, 0.5]）
    const a = (next.level - prev.level) / 2;
    const b = (prev.level - 2 * cur.level + next.level) / 2;
    let offset = b !== 0 ? -a / (2 * b) : 0;
    if (!Number.isFinite(offset) || Math.abs(offset) > 0.5) offset = 0;

    const height = cur.level + a * offset + b * offset * offset;

    // 以 UTC 做純時間加減，避免執行環境時區影響
    const at = Date.parse(`${cur.time}:00Z`) + offset * 3600000;
    const iso = new Date(at).toISOString();

    out.push({
      type: isHigh ? 'high' : 'low',
      date: iso.slice(0, 10),
      time: iso.slice(11, 16),
      heightM: Math.round(height * 100) / 100,
      at,
    });
  }

  return out;
}

function groupDays(events: TideEvent[], fromDate: string): TideDay[] {
  const dates = [...new Set(events.map((e) => e.date))]
    .filter((d) => d >= fromDate)
    .sort();
  if (dates.length === 0) return [];

  const days: TideDay[] = dates.map((date) => {
    const dayEvents = events.filter((e) => e.date === date).sort((x, y) => x.at - y.at);
    const highs = dayEvents.filter((e) => e.type === 'high');
    const lows = dayEvents.filter((e) => e.type === 'low');
    const highMax = highs.length ? Math.max(...highs.map((e) => e.heightM)) : 0;
    const lowMin = lows.length ? Math.min(...lows.map((e) => e.heightM)) : 0;
    return {
      date,
      weekday: new Date(`${date}T12:00:00Z`).getUTCDay(),
      events: dayEvents,
      highMax,
      lowMin,
      rangeM: Math.round((highMax - lowMin) * 100) / 100,
      spring: false,
      moon: moonInfo(date),
    };
  });

  // 大潮／小潮以本期潮差的相對高低判定（大潮出現在朔望前後）
  const complete = days.filter((d) => d.events.length >= 3);
  const ranges = (complete.length ? complete : days).map((d) => d.rangeM);
  const maxRange = Math.max(...ranges);
  const minRange = Math.min(...ranges);
  const threshold = (maxRange + minRange) / 2;
  for (const d of days) d.spring = d.events.length >= 3 && d.rangeM >= threshold;

  return days;
}

/** 在逐時資料中線性內插出任意時刻的潮位 */
function interpolate(hours: MarineHour[], iso: string): { level: number; rate: number } | null {
  if (hours.length < 2) return null;
  const t = Date.parse(`${iso}:00Z`);
  if (!Number.isFinite(t)) return null;

  for (let i = 0; i < hours.length - 1; i++) {
    const t0 = Date.parse(`${hours[i].time}:00Z`);
    const t1 = Date.parse(`${hours[i + 1].time}:00Z`);
    if (t >= t0 && t <= t1) {
      const ratio = (t - t0) / (t1 - t0);
      const level = hours[i].level + (hours[i + 1].level - hours[i].level) * ratio;
      return { level, rate: hours[i + 1].level - hours[i].level };
    }
  }
  return null;
}

const TREND_LABEL: Record<TideTrend, string> = {
  rising: '漲潮中',
  falling: '退潮中',
  high: '接近滿潮',
  low: '接近乾潮',
  unknown: '—',
};

function trendOf(level: number, rate: number, day: TideDay | null): TideTrend {
  const span = day ? Math.max(0.1, day.highMax - day.lowMin) : 1;
  // 變化率小於潮差的 4%／小時視為接近乾滿潮的停滯段
  if (Math.abs(rate) < span * 0.04) {
    const mid = day ? (day.highMax + day.lowMin) / 2 : level;
    return level >= mid ? 'high' : 'low';
  }
  return rate > 0 ? 'rising' : 'falling';
}

// 同一隔離環境內的即時快取（Workers 會重用隔離環境，命中率高）
let memory: { at: number; data: TideBundle } | null = null;

export async function getTide(now: Date = new Date()): Promise<TideBundle | null> {
  if (memory && Date.now() - memory.at < CACHE_TTL_MS) return memory.data;

  try {
    const res = await fetch(buildEndpoint(), {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
      // 邊緣節點快取（非 Cloudflare 執行環境會忽略此選項）
      cf: { cacheTtl: CACHE_TTL_SECONDS, cacheEverything: true },
    } as RequestInit);

    if (!res.ok) throw new Error(`marine ${res.status}`);

    const raw = await res.json();
    const hours = normalizeHours(raw);
    if (hours.length < 24) throw new Error('marine payload too short');

    const nowISO = nowInTaipeiISO(now);
    const todayDate = nowISO.slice(0, 10);

    const events = findExtrema(hours);
    const days = groupDays(events, todayDate);
    const today = days.find((d) => d.date === todayDate) ?? null;

    const cur = raw?.current ?? {};
    // 逐時資料僅到整點，因此以內插值代表「現在」的潮位，比直接取整點值更貼近現況
    const sampled = interpolate(hours, nowISO);
    const level = sampled?.level ?? numOrNull(cur.sea_level_height_msl) ?? null;
    const rate = sampled?.rate ?? null;
    const trend = level !== null && rate !== null ? trendOf(level, rate, today) : 'unknown';

    const nowMsValue = Date.parse(`${nowISO}:00Z`);
    const upcoming = events.filter((e) => e.at > nowMsValue);
    const nextHigh = upcoming.find((e) => e.type === 'high') ?? null;
    const nextLow = upcoming.find((e) => e.type === 'low') ?? null;

    // 曲線自「現在」所在的整點起算，共 25 個點（24 小時）
    let startIdx = 0;
    for (let i = 0; i < hours.length; i++) {
      if (hours[i].time <= nowISO) startIdx = i;
      else break;
    }

    const bundle: TideBundle = {
      current: {
        time: nowISO.slice(11, 16),
        level,
        trend,
        trendLabel: TREND_LABEL[trend],
        ratePerHour: rate === null ? null : Math.round(rate * 100) / 100,
      },
      waveHeight: numOrNull(cur.wave_height) ?? numOrNull(hours[startIdx]?.waveHeight),
      waveDirection: numOrNull(cur.wave_direction) ?? numOrNull(hours[startIdx]?.waveDirection),
      seaTemp: numOrNull(cur.sea_surface_temperature) ?? numOrNull(hours[startIdx]?.seaTemp),
      next24: hours.slice(startIdx, startIdx + 25),
      days,
      today,
      nextHigh,
      nextLow,
      fetchedAt: new Date().toISOString(),
    };

    memory = { at: Date.now(), data: bundle };
    return bundle;
  } catch {
    // 取用上一次成功的資料，避免整個模組空白
    return memory?.data ?? null;
  }
}

/** 由現在時刻到指定潮汐事件的倒數分鐘數 */
export function minutesUntil(event: TideEvent | null, now: Date = new Date()): number | null {
  if (!event) return null;
  const nowMs = Date.parse(`${nowInTaipeiISO(now)}:00Z`);
  const diff = Math.round((event.at - nowMs) / 60000);
  return Number.isFinite(diff) ? diff : null;
}

/** 例：3 小時 25 分 */
export function formatCountdown(minutes: number | null): string {
  if (minutes === null) return '—';
  if (minutes <= 0) return '即將發生';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} 分鐘後`;
  if (m === 0) return `${h} 小時後`;
  return `${h} 小時 ${m} 分後`;
}
