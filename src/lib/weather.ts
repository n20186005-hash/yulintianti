// WMO 天氣代碼對照（繁體中文），供天氣模組使用。
// 注意：天氣相關的「建議」與「風險提醒」邏輯統一放在 weather-advice.ts，
// 本檔只負責代碼轉文字，避免同一組門檻散落在多個檔案。

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
