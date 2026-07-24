// WMO 天氣代碼對照與提醒邏輯（繁體中文），供 /weather/ 前端使用

export type WxInfo = { label: string; emoji: string };

const WMO: Record<number, WxInfo> = {
  0: { label: '晴天', emoji: '☀️' },
  1: { label: '晴時多雲', emoji: '🌤️' },
  2: { label: '多雲', emoji: '⛅' },
  3: { label: '陰天', emoji: '☁️' },
  45: { label: '有霧', emoji: '🌫️' },
  48: { label: '霧凇', emoji: '🌫️' },
  51: { label: '毛毛雨', emoji: '🌦️' },
  53: { label: '毛毛雨', emoji: '🌦️' },
  55: { label: '毛毛雨（強）', emoji: '🌦️' },
  56: { label: '凍毛毛雨', emoji: '🌧️' },
  57: { label: '凍毛毛雨', emoji: '🌧️' },
  61: { label: '小雨', emoji: '🌧️' },
  63: { label: '中雨', emoji: '🌧️' },
  65: { label: '大雨', emoji: '🌧️' },
  66: { label: '凍雨', emoji: '🌧️' },
  67: { label: '凍雨', emoji: '🌧️' },
  71: { label: '小雪', emoji: '🌨️' },
  73: { label: '中雪', emoji: '🌨️' },
  75: { label: '大雪', emoji: '🌨️' },
  77: { label: '雪粒', emoji: '🌨️' },
  80: { label: '陣雨', emoji: '🌦️' },
  81: { label: '陣雨', emoji: '🌦️' },
  82: { label: '強陣雨', emoji: '🌧️' },
  85: { label: '陣雪', emoji: '🌨️' },
  86: { label: '強陣雪', emoji: '🌨️' },
  95: { label: '雷雨', emoji: '⛈️' },
  96: { label: '雷雨伴冰雹', emoji: '⛈️' },
  99: { label: '強雷雨伴冰雹', emoji: '⛈️' },
};

export function weatherInfo(code: number): WxInfo {
  return WMO[code] ?? { label: '未知', emoji: '❓' };
}

export type Alert = { level: 'danger' | 'warning'; text: string };

// 針對雷雨、強風、高溫給出繁體中文提醒
export function buildAlerts(input: {
  weatherCode: number;
  windMs: number;
  gustMs: number;
  apparentTemp: number;
  todayWeatherCode?: number;
  todayGustMax?: number;
  todayTempMax?: number;
}): Alert[] {
  const alerts: Alert[] = [];
  const thunder = [95, 96, 99];

  if (thunder.includes(input.weatherCode) || (input.todayWeatherCode !== undefined && thunder.includes(input.todayWeatherCode))) {
    alerts.push({
      level: 'danger',
      text: '雷雨提醒：可能有雷擊與強陣風，請勿在海邊或空曠處逗留，並遠離魚鱗天梯下層階梯。',
    });
  }

  const gust = Math.max(input.gustMs, input.todayGustMax ?? 0);
  if (input.windMs >= 10 || gust >= 14) {
    alerts.push({
      level: 'warning',
      text: `強風提醒：平均風速約每秒 ${Math.round(input.windMs)} 公尺、陣風可達每秒 ${Math.round(gust)} 公尺，海邊體感更強，請勿靠近溼滑的下層階梯。`,
    });
  }

  const heat = Math.max(input.apparentTemp, input.todayTempMax ?? -99);
  if (heat >= 36) {
    alerts.push({
      level: input.apparentTemp >= 38 ? 'danger' : 'warning',
      text: `高溫提醒：體感溫度約 ${Math.round(input.apparentTemp)}°C，請補充水分、做好防曬，避開正午時段。`,
    });
  }

  return alerts;
}
