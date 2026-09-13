// 伺服器端氣象資料存取模組。
// 僅在伺服器／邊緣執行（由伺服器島嶼呼叫），不會進入前端 bundle。
// 取回後於邊緣節點快取，降低上游請求量；任何失敗都回傳 null，由呼叫端優雅降級。

import { SITE } from '../data/site.js';

export interface WeatherCurrent {
  time: string;
  temperature: number;
  apparent: number;
  humidity: number;
  precipitation: number;
  weatherCode: number;
  cloudCover: number;
  windSpeed: number;
  windGust: number;
  windDirection: number;
  isDay: boolean;
}

export interface WeatherHour {
  time: string;
  hour: number;
  temperature: number;
  precipProb: number;
  weatherCode: number;
  windSpeed: number;
  windGust: number;
  cloudCover: number;
}

export interface WeatherDay {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  precipProb: number;
  precipSum: number;
  windMax: number;
  gustMax: number;
  sunrise: string;
  sunset: string;
  uvMax: number;
}

export interface WeatherBundle {
  current: WeatherCurrent;
  hours: WeatherHour[];
  days: WeatherDay[];
  fetchedAt: string;
}

const FORECAST_ENDPOINT = 'https://api.open-meteo.com/v1/forecast';

// 快取 15 分鐘：兼顧「即時感」與上游請求量
const CACHE_TTL_MS = 15 * 60 * 1000;
const CACHE_TTL_SECONDS = 900;

function buildEndpoint(): string {
  const params = new URLSearchParams({
    latitude: String(SITE.geo.lat),
    longitude: String(SITE.geo.lng),
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'weather_code',
      'cloud_cover',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
    ].join(','),
    hourly: [
      'temperature_2m',
      'precipitation_probability',
      'weather_code',
      'wind_speed_10m',
      'wind_gusts_10m',
      'cloud_cover',
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_probability_max',
      'precipitation_sum',
      'wind_speed_10m_max',
      'wind_gusts_10m_max',
      'sunrise',
      'sunset',
      'uv_index_max',
    ].join(','),
    timezone: 'Asia/Taipei',
    // Open-Meteo 預設為 km/h，本站一律以公尺／秒呈現
    wind_speed_unit: 'ms',
    precipitation_unit: 'mm',
    forecast_days: '7',
  });
  return `${FORECAST_ENDPOINT}?${params.toString()}`;
}

const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
const str = (v: unknown): string => (typeof v === 'string' ? v : '');

function normalize(raw: any): WeatherBundle {
  const c = raw?.current ?? {};
  const h = raw?.hourly ?? {};
  const d = raw?.daily ?? {};

  const hours: WeatherHour[] = (h.time ?? []).map((t: string, i: number) => ({
    time: t,
    hour: Number(String(t).slice(11, 13)),
    temperature: num(h.temperature_2m?.[i]),
    precipProb: num(h.precipitation_probability?.[i]),
    weatherCode: num(h.weather_code?.[i]),
    windSpeed: num(h.wind_speed_10m?.[i]),
    windGust: num(h.wind_gusts_10m?.[i]),
    cloudCover: num(h.cloud_cover?.[i]),
  }));

  const days: WeatherDay[] = (d.time ?? []).map((t: string, i: number) => ({
    date: str(t),
    weatherCode: num(d.weather_code?.[i]),
    tempMax: num(d.temperature_2m_max?.[i]),
    tempMin: num(d.temperature_2m_min?.[i]),
    precipProb: num(d.precipitation_probability_max?.[i]),
    precipSum: num(d.precipitation_sum?.[i]),
    windMax: num(d.wind_speed_10m_max?.[i]),
    gustMax: num(d.wind_gusts_10m_max?.[i]),
    sunrise: str(d.sunrise?.[i]),
    sunset: str(d.sunset?.[i]),
    uvMax: num(d.uv_index_max?.[i]),
  }));

  return {
    current: {
      time: str(c.time),
      temperature: num(c.temperature_2m),
      apparent: num(c.apparent_temperature),
      humidity: num(c.relative_humidity_2m),
      precipitation: num(c.precipitation),
      weatherCode: num(c.weather_code),
      cloudCover: num(c.cloud_cover),
      windSpeed: num(c.wind_speed_10m),
      windGust: num(c.wind_gusts_10m),
      windDirection: num(c.wind_direction_10m),
      isDay: c.is_day === 1,
    },
    hours,
    days,
    fetchedAt: new Date().toISOString(),
  };
}

// 同一隔離環境內的即時快取（Workers 會重用隔離環境，命中率高）
let memory: { at: number; data: WeatherBundle } | null = null;

export async function getWeather(): Promise<WeatherBundle | null> {
  if (memory && Date.now() - memory.at < CACHE_TTL_MS) return memory.data;

  try {
    const res = await fetch(buildEndpoint(), {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
      // 邊緣節點快取（非 Cloudflare 執行環境會忽略此選項）
      cf: { cacheTtl: CACHE_TTL_SECONDS, cacheEverything: true },
    } as RequestInit);

    if (!res.ok) throw new Error(`weather ${res.status}`);

    const data = normalize(await res.json());
    memory = { at: Date.now(), data };
    return data;
  } catch {
    // 取用上一次成功的資料，避免整個模組空白
    return memory?.data ?? null;
  }
}

/** 目前所在的整點索引（對應 hours 陣列） */
export function currentHourIndex(bundle: WeatherBundle): number {
  const target = bundle.current.time.slice(0, 13);
  const idx = bundle.hours.findIndex((h) => h.time.slice(0, 13) === target);
  return idx >= 0 ? idx : 0;
}

/** 目前整點的降雨機率；缺值時退回今日最高降雨機率 */
export function rainProbNow(bundle: WeatherBundle): number {
  const idx = currentHourIndex(bundle);
  const v = bundle.hours[idx]?.precipProb;
  if (typeof v === 'number' && v > 0) return v;
  return bundle.days[0]?.precipProb ?? 0;
}

/** 由目前時刻起算的逐時預報 */
export function nextHours(bundle: WeatherBundle, count: number): WeatherHour[] {
  const start = currentHourIndex(bundle);
  return bundle.hours.slice(start, start + count);
}

/** 今天是否為週末（以台北時區判定） */
export function isWeekendInTaipei(): boolean {
  const wd = new Date(Date.now() + 8 * 3600 * 1000).getUTCDay();
  return wd === 0 || wd === 6;
}
