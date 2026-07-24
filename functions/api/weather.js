// Cloudflare Pages Function：代理 Open-Meteo 天氣資料
// - 無需 API Key、無需環境變數
// - 邊緣快取 15 分鐘（900 秒）
// 路徑：/api/weather

const LAT = 24.8522; // 南寮魚鱗天梯
const LNG = 120.9237;
const CACHE_SECONDS = 900;

const UPSTREAM =
  'https://api.open-meteo.com/v1/forecast?' +
  new URLSearchParams({
    latitude: String(LAT),
    longitude: String(LNG),
    current:
      'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_gusts_10m,wind_direction_10m',
    hourly: 'precipitation_probability',
    daily:
      'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max',
    timezone: 'Asia/Taipei',
    forecast_days: '3',
    wind_speed_unit: 'ms',
    forecast_hours: '24',
  }).toString();

export async function onRequest(context) {
  const { request } = context;
  const cache = caches.default;

  // 以固定 URL 作為快取鍵（忽略查詢字串），確保命中率
  const cacheKey = new Request(new URL('/api/weather', request.url).toString(), {
    method: 'GET',
  });

  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  let upstreamRes;
  try {
    upstreamRes = await fetch(UPSTREAM, {
      cf: { cacheTtl: CACHE_SECONDS, cacheEverything: true },
      headers: { accept: 'application/json' },
    });
  } catch (err) {
    return json({ error: 'fetch_failed', message: String(err) }, 502);
  }

  if (!upstreamRes.ok) {
    return json({ error: 'upstream_error', status: upstreamRes.status }, 502);
  }

  const data = await upstreamRes.json();

  const response = json(
    { ...data, _cachedAt: new Date().toISOString(), _source: 'open-meteo.com' },
    200,
    {
      'cache-control': `public, max-age=${CACHE_SECONDS}, s-maxage=${CACHE_SECONDS}`,
    }
  );

  // 寫入邊緣快取（不阻塞回應）
  context.waitUntil(cache.put(cacheKey, response.clone()));
  return response;
}

function json(body, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'access-control-allow-origin': '*',
      ...extraHeaders,
    },
  });
}
