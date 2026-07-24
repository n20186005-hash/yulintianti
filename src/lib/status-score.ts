// 今日是否適合前往的判斷邏輯（純函式）
// 先判斷安全條件，再依權重計分。不輸出「幾分」給使用者，只回三種狀態。

export type Conditions = {
  warning: boolean; // 強風、大雨、颱風或海象警示
  weatherScore: number; // 0-100 天氣狀況（晴朗高）
  windMs: number; // 平均風速（公尺/秒）
  rainProb: number; // 降雨機率 0-100
  sunsetVisible: number; // 夕陽可見度 0-100
  tideScore: number; // 潮汐條件 0-100（滿潮景觀較佳）
  holidayCrowd: number; // 假日人流 0-100（越少越好）
};

export type StatusLevel = 'good' | 'caution' | 'avoid';

export type StatusResult = {
  level: StatusLevel;
  label: string;
  reason: string;
};

// 風速轉分數：<5 佳、5~8 尚可、>10 差
function windToScore(ms: number): number {
  if (ms <= 5) return 100;
  if (ms >= 12) return 0;
  return Math.round(100 - ((ms - 5) / 7) * 100);
}

export function evaluateStatus(c: Conditions): StatusResult {
  if (c.warning) {
    return {
      level: 'avoid',
      label: '不建議前往',
      reason: '目前有強風、大雨或海象警示，請勿靠近下層階梯，以安全為優先。',
    };
  }

  const weights = {
    weather: 0.3,
    wind: 0.25,
    rain: 0.15,
    sunset: 0.15,
    tide: 0.1,
    crowd: 0.05,
  };

  const score =
    c.weatherScore * weights.weather +
    windToScore(c.windMs) * weights.wind +
    (100 - c.rainProb) * weights.rain +
    c.sunsetVisible * weights.sunset +
    c.tideScore * weights.tide +
    c.holidayCrowd * weights.crowd;

  if (c.windMs >= 9 || c.rainProb >= 60) {
    return {
      level: 'caution',
      label: '可以前往，但風較強／可能下雨',
      reason: '建議攜帶擋風外套，留意海邊陣風，勿靠近溼滑的下層階梯。',
    };
  }

  if (score >= 70) {
    return {
      level: 'good',
      label: '適合前往',
      reason: '天氣與海象條件良好，適合安排在日落前一小時抵達看夕陽。',
    };
  }
  if (score >= 50) {
    return {
      level: 'caution',
      label: '可以前往，但風較強／可能下雨',
      reason: '條件普通，出發前再確認一次即時天氣與風速。',
    };
  }
  return {
    level: 'avoid',
    label: '不建議前往',
    reason: '目前條件較差，建議改期或安排室內備案。',
  };
}

export const STATUS_STYLE: Record<StatusLevel, { bg: string; dot: string; text: string }> = {
  good: { bg: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500', text: 'text-emerald-800' },
  caution: { bg: 'bg-amber-50 border-amber-200', dot: 'bg-amber-500', text: 'text-amber-800' },
  avoid: { bg: 'bg-rose-50 border-rose-200', dot: 'bg-rose-500', text: 'text-rose-800' },
};
