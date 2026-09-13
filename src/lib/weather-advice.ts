// 天氣智慧建議引擎（純函式，可於伺服器或瀏覽器執行）。
//
// 目的：不輸出「溫度＋天氣文字」這種還要遊客自己解讀的資訊，而是直接把數值
// 轉成可執行的建議——穿什麼、怎麼安排、帶什麼，有風險才另外提醒。
//
// 設計原則：
//   1. 白話優先：「紫外線強」而不是「紫外線指數 8」，不出現相對溼度等術語。
//   2. 動態渲染：條件不符的建議一律不產生，不把整份規則庫堆到頁面上。
//   3. 風險優先：判定為安全風險時抑制正向玩樂建議，改為調整行程。
//   4. 機率不等於事實：降雨機率只寫「有機會」，不寫「一定會下雨」。
//   5. 場景導向：本站是開放海岸，因此納入浪高、水溫與潮汐的專屬判斷。

import type { WeatherCurrent, WeatherDay, WeatherHour } from './weather-server';

export type AdviceTone = 'good' | 'fair' | 'caution' | 'poor';
export type AdviceGroupId = 'dress' | 'plan' | 'items';
export type RiskLevel = 'danger' | 'warning';

export interface AdviceItem {
  text: string;
  /** 可選的延伸連結（例如導向潮汐表） */
  href?: string;
  linkLabel?: string;
}

export interface AdviceGroup {
  id: AdviceGroupId;
  emoji: string;
  label: string;
  items: AdviceItem[];
}

export interface RiskNote {
  level: RiskLevel;
  title: string;
  text: string;
}

export interface ComfortWindow {
  /** 例如「今日 17:00–19:00」 */
  label: string;
  note: string;
}

export interface MarineContext {
  waveHeight: number | null;
  seaTemp: number | null;
  nextHighTime: string | null;
  nextHighHeightM: number | null;
  nextLowTime: string | null;
  nextLowHeightM: number | null;
  /** 距下一次滿潮的分鐘數 */
  minutesToHigh: number | null;
  /** 距下一次乾潮的分鐘數 */
  minutesToLow: number | null;
}

export interface AdviceInput {
  current: WeatherCurrent;
  today: WeatherDay;
  tomorrow?: WeatherDay;
  /** 自目前時刻起算的逐時預報（建議 12 小時） */
  next12: WeatherHour[];
  /** 目前所在整點的降雨機率 */
  rainNow: number;
  /** 日落時間 HH:MM */
  sunset?: string | null;
  marine?: MarineContext | null;
}

export interface WeatherAdvice {
  tone: AdviceTone;
  toneLabel: string;
  /** 一句話總結，說明「現在該怎麼做」 */
  headline: string;
  /** 條件標籤，供快速掃讀，例如「晴」「紫外線強」「風力 5 級」 */
  chips: string[];
  groups: AdviceGroup[];
  risks: RiskNote[];
  window: ComfortWindow | null;
}

// ── 天氣代碼分類（WMO） ────────────────────────────────────────────────

const DRIZZLE = new Set([51, 53, 55, 56, 57]);
const RAIN_LIGHT = new Set([61, 80]);
const RAIN_MODERATE = new Set([63, 66, 67, 81]);
const RAIN_HEAVY = new Set([65, 82]);
const THUNDER = new Set([95, 96, 99]);
const SNOW = new Set([71, 73, 75, 77, 85, 86]);
const FOG = new Set([45, 48]);
const CLEAR = new Set([0, 1]);
const CLOUDY = new Set([2, 3]);

/** 蒲福風級（0–12），供對照與文案使用 */
export function beaufort(ms: number): number {
  const edges = [0.3, 1.6, 3.4, 5.5, 8.0, 10.8, 13.9, 17.2, 20.8, 24.5, 28.5, 32.7];
  let level = 0;
  while (level < edges.length && ms >= edges[level]) level += 1;
  return level;
}

/** 風力級距的門檻（公尺／秒）：與網站其他頁面的公開說法一致 */
export const WIND_THRESHOLD = {
  /** 蒲福 5 級：開始有感、帽子容易被吹走 */
  breezy: 8,
  /** 蒲福 6 級：明顯偏強，下層階梯浪花易濺上 */
  strong: 12,
  /** 蒲福 8 級：大風，建議調整行程 */
  gale: 17.2,
  gustStrong: 18,
  gustGale: 20.8,
} as const;

/** 是否已達「需要提醒」的等級（供 TodayStatus 等模組共用，避免各頁標準不一） */
export function hasWeatherWarning(input: {
  windMs: number;
  gustMs: number;
  weatherCode: number;
  todayWeatherCode?: number;
  todayGustMax?: number;
}): boolean {
  return (
    input.windMs >= WIND_THRESHOLD.strong ||
    input.gustMs >= WIND_THRESHOLD.gustStrong ||
    (input.todayGustMax ?? 0) >= WIND_THRESHOLD.gustStrong ||
    THUNDER.has(input.weatherCode) ||
    (input.todayWeatherCode !== undefined && THUNDER.has(input.todayWeatherCode)) ||
    RAIN_HEAVY.has(input.weatherCode)
  );
}

/** 暴雨或雷雨在接下來幾小時內是否可能出現（用於「行程保留彈性」的提醒） */
function upcomingRainProb(hours: WeatherHour[], count: number): number {
  return hours.slice(0, count).reduce((max, h) => Math.max(max, h.precipProb), 0);
}

// ── 規則累積器 ────────────────────────────────────────────────────────

interface RawItem extends AdviceItem {
  priority: number;
}

function finalize(raw: RawItem[], limit: number): AdviceItem[] {
  const seen = new Set<string>();
  return [...raw]
    .sort((a, b) => b.priority - a.priority)
    .filter((it) => {
      if (seen.has(it.text)) return false;
      seen.add(it.text);
      return true;
    })
    .slice(0, limit)
    .map(({ text, href, linkLabel }) => ({ text, href, linkLabel }));
}

// ── 主函式 ────────────────────────────────────────────────────────────

export function buildAdvice(input: AdviceInput, options: { compact?: boolean } = {}): WeatherAdvice {
  const { current, today, tomorrow, next12, rainNow, sunset, marine } = input;
  const limit = options.compact ? 2 : 4;

  const code = current.weatherCode;
  const raining = DRIZZLE.has(code) || RAIN_LIGHT.has(code) || RAIN_MODERATE.has(code) || RAIN_HEAVY.has(code) || THUNDER.has(code) || current.precipitation >= 0.1;
  const heavyRain = RAIN_HEAVY.has(code) || THUNDER.has(code);
  const moderateRain = RAIN_MODERATE.has(code) || heavyRain;
  const thunder = THUNDER.has(code) || THUNDER.has(today.weatherCode);
  const fog = FOG.has(code);
  const snow = SNOW.has(code);
  const clear = CLEAR.has(code);
  const cloudy = CLOUDY.has(code);

  const tempMax = today.tempMax;
  const tempMin = today.tempMin;
  const diurnal = tempMax - tempMin;
  const uv = today.uvMax;
  const rainToday = Math.max(today.precipProb, rainNow);
  const rainSoon = upcomingRainProb(next12, 3);
  const windMs = current.windSpeed;
  const gustMs = Math.max(current.windGust, today.gustMax);
  const gale = windMs >= WIND_THRESHOLD.gale || gustMs >= WIND_THRESHOLD.gustGale;
  const strongWind = windMs >= WIND_THRESHOLD.strong || gustMs >= WIND_THRESHOLD.gustStrong;
  const breezy = windMs >= WIND_THRESHOLD.breezy;
  const hot = tempMax >= 32;
  const veryHot = tempMax >= 35;
  const muggy = current.apparent >= 32 && current.humidity >= 70;
  const cold = tempMax <= 10;
  const chilly = current.apparent <= 12;
  const wave = marine?.waveHeight ?? null;
  const seaTemp = marine?.seaTemp ?? null;
  const nextHighTime = marine?.nextHighTime ?? null;
  const nextLowTime = marine?.nextLowTime ?? null;
  const minutesToHigh = marine?.minutesToHigh ?? null;
  const minutesToLow = marine?.minutesToLow ?? null;
  const bigWave = wave !== null && wave >= 2.5;
  const roughWave = wave !== null && wave >= 1.5;

  // 安全風險優先：一旦成立，正向的玩樂建議會被抑制
  const severe = thunder || RAIN_HEAVY.has(code) || gale || bigWave || veryHot;

  const dress: RawItem[] = [];
  const plan: RawItem[] = [];
  const items: RawItem[] = [];
  const risks: RiskNote[] = [];
  const chips: string[] = [];

  const addDress = (text: string, priority: number) => dress.push({ text, priority });
  const addPlan = (text: string, priority: number, link?: { href: string; linkLabel: string }) =>
    plan.push({ text, priority, ...link });
  const addBring = (text: string, priority: number) => items.push({ text, priority });

  // ── 風險提醒（置頂顯示，優先級最高） ──────────────────────────────

  if (thunder) {
    risks.push({
      level: 'danger',
      title: '雷雨提醒',
      text: '有雷擊與瞬間強陣風風險，請勿在海邊空曠處、下層階梯或消波塊旁停留，也不要在大樹或金屬欄杆旁躲雨，建議改走室內行程。',
    });
  }

  if (heavyRain) {
    risks.push({
      level: 'warning',
      title: '降雨偏強',
      text: '雨勢明顯，階梯與石面相當溼滑，且低窪處可能積水，建議避免戶外久留並留意行程是否受影響。',
    });
  }

  if (bigWave || gale) {
    risks.push({
      level: gale || (wave !== null && wave >= 3) ? 'danger' : 'warning',
      title: gale ? '強風與大浪' : '浪況偏強',
      text: [
        gale ? `平均風速約每秒 ${Math.round(windMs)} 公尺（約 ${beaufort(windMs)} 級），陣風可達每秒 ${Math.round(gustMs)} 公尺。` : '',
        wave !== null ? `浪高約 ${wave.toFixed(1)} 公尺。` : '',
        '請遠離浪區、消波塊與溼滑的下層階梯，以安全為優先。',
      ]
        .filter(Boolean)
        .join(''),
    });
  }

  if (strongWind && !gale) {
    risks.push({
      level: 'warning',
      title: '風勢偏強',
      text: `平均風速約每秒 ${Math.round(windMs)} 公尺（約 ${beaufort(windMs)} 級）、陣風約每秒 ${Math.round(gustMs)} 公尺，海邊體感更強，浪花可能濺上階梯，請待在上層步道並留意隨身物品被吹落。`,
    });
  }

  if (veryHot || uv >= 11) {
    risks.push({
      level: 'warning',
      title: veryHot ? '高溫提醒' : '紫外線極強',
      text: veryHot
        ? `白天高溫約 ${Math.round(tempMax)}°C，正午前後曝曬容易中暑，請避開 11:00–14:00 並隨時補充水分。`
        : `紫外線達極強等級，短時間曝曬就可能曬傷，請確實防曬並避免正午長時間待在無遮蔭處。`,
    });
  }

  if (fog) {
    risks.push({
      level: 'warning',
      title: '能見度較差',
      text: '目前有霧，看海的視野受限，開車請開霧燈並放慢速度；若專程為了海景前來，建議改天。',
    });
  }

  if (snow) {
    risks.push({
      level: 'warning',
      title: '低溫與結冰',
      text: '有降雪或結冰可能，地面溼滑，請注意保暖與腳步，並避免靠近溼滑的階梯邊緣。',
    });
  }

  // ── 降水相關 ─────────────────────────────────────────────────────

  if (moderateRain) {
    addPlan('目前降雨明顯，戶外與海上活動建議先暫緩；階梯與石面溼滑，可行時改走室內市集、美食或雨天備案。', 95);
    addDress('建議穿防水外套或兩件式雨衣，鞋子選防滑、不建議拖鞋。', 90);
    addBring('雨衣（風大時比長柄傘安全）', 90);
  } else if (raining) {
    addPlan('目前有短暫降雨，階梯與石面溼滑，行走請放慢腳步。', 88);
    addPlan('露天項目體驗會打折，可先逛市集、等雨停再拍海景。', 70);
    addDress('建議穿防潑水外套，鞋子選防滑包覆款。', 82);
    addBring('折疊傘或輕便雨衣', 84);
  }

  if (!raining && rainSoon >= 60) {
    addPlan('未來幾小時降雨機率高，建議先安排室內備案，雨停再回到海邊。', 86);
    addBring('折疊傘', 80);
  }

  if (!raining && rainToday >= 60) {
    addPlan('今天降雨機率偏高，戶外行程建議保留彈性、不要把時間排太緊。', 78);
    addBring('折疊傘或輕便雨衣', 74);
  } else if (!raining && rainToday >= 30) {
    addPlan('有機會出現短暫陣雨，雨具放車上備用即可。', 48);
  }

  // ── 高溫、紫外線、悶熱 ───────────────────────────────────────────

  if (veryHot) {
    // 正午相關建議只在白天成立；入夜後改由「明日」的文案承接
    if (current.isDay) addPlan('高溫時段不要久待無遮蔭處，建議改到傍晚前往。', 92);
    addBring('充足飲水、電解質與遮陽帽', 92);
    addDress('選擇輕薄、透氣、淺色的衣物。', 84);
  } else if (hot) {
    if (current.isDay) {
      addPlan('氣溫偏高，建議避開 11:00–14:00，改在傍晚時段前往。', 88);
      addPlan('縮短連續戶外時間，中間找遮蔭處休息。', 66);
    }
    addDress('選擇輕薄透氣的淺色衣物，例如排汗衫。', 80);
    addBring('充足飲水', 82);
  }

  if (muggy) {
    addPlan('體感悶熱，建議放慢行程節奏、多補充水分。', 60);
    // 高溫時段的穿搭建議已強調透氣，避免重複
    if (!hot) addDress('挑透氣排汗材質，避免悶熱的緊身衣物。', 62);
  }

  // 防曬只在白天有意義，入夜後不再提醒
  if (current.isDay && uv >= 11) {
    addBring('防曬乳、太陽眼鏡、遮陽帽', 96);
    addDress('建議加薄長袖或防曬外套，減少直接曝曬。', 78);
  } else if (current.isDay && uv >= 5) {
    addBring(uv >= 8 ? '防曬乳、太陽眼鏡、遮陽帽' : '帽子與防曬乳', 80);
    addDress('準備一件薄外套兼作防曬。', 56);
  }

  if (current.isDay && cloudy && uv >= 8) {
    addBring('陰天仍有紫外線，防曬不可省略。', 58);
  }

  // ── 低溫與溫差 ───────────────────────────────────────────────────

  if (diurnal > 8) {
    addDress('早晚溫差大，建議備一件可隨時增減的外套。', 76);
  }
  if (cold) {
    addDress('氣溫偏低，建議厚外套加圍巾，並減少長時間吹風。', 90);
    addBring('暖暖包與保溫瓶', 60);
  } else if (chilly) {
    addDress('海邊體感偏冷，建議防風保暖外套。', 74);
  }

  // ── 風勢 ─────────────────────────────────────────────────────────

  if (breezy) {
    addPlan('海邊風力偏大，建議留在上層步道，下層階梯浪花容易濺上來。', 84);
    addDress('建議穿防風外套；避免寬鬆長裙與沒有綁帶的帽子。', 78);
    if (!moderateRain) addBring('帽子請選有綁帶的款式', 62);
  } else if (!severe && current.isDay) {
    addPlan('風勢緩和，階梯與步道都能好好走。', 40);
  }

  // ── 晴／陰天 ─────────────────────────────────────────────────────

  let sunsetPlanAdded = false;

  if (current.isDay && clear && !severe && rainToday < 60) {
    addPlan(
      '天氣晴朗，很適合看海與夕陽，建議在日落前 60–90 分鐘抵達。',
      72,
      { href: '/sunset/', linkLabel: '看日落時間' }
    );
    sunsetPlanAdded = true;
  } else if (current.isDay && cloudy && !severe) {
    addPlan('雲層偏多、沒有暴曬，光線柔和很好拍照，也適合慢慢逛。', 68);
  }

  if (!current.isDay) {
    addPlan('目前已入夜，光線不足時不建議走到下層階梯，可安排明日日落前再來。', 70);
  }

  // ── 海岸專屬：浪況、水溫、潮汐 ───────────────────────────────────

  if (wave !== null) {
    const waveText = `浪高約 ${wave.toFixed(1)} 公尺`;
    if (roughWave && !bigWave) {
      addPlan(`${waveText}，下層階梯與礁石一帶請保持距離。`, 86);
    } else if (wave < 1.5 && !severe && rainToday < 60) {
      addPlan(`${waveText}，浪況平穩，適合拍攝海浪層次與觀察潮間帶。`, 64);
    }
  }

  if (seaTemp !== null) {
    if (seaTemp <= 22) {
      addPlan(`海水約 ${seaTemp.toFixed(0)}°C 偏涼，不建議長時間泡水或赤腳久站。`, 64);
    } else if (seaTemp >= 28) {
      addPlan(`海水約 ${seaTemp.toFixed(0)}°C 偏暖，戲水請注意補充水分與防曬。`, 58);
    }
  }

  if (minutesToHigh !== null && minutesToHigh <= 180 && nextHighTime) {
    addPlan(
      `下一次滿潮在 ${nextHighTime}，在沙灘或礁石活動請預留 30 分鐘回程。`,
      94,
      { href: '/tide/', linkLabel: '看潮汐' }
    );
  } else if (minutesToLow !== null && minutesToLow <= 240 && nextLowTime) {
    if (!severe && rainToday < 60) {
      addPlan(
        `乾潮約在 ${marine.nextLowTime}，前後 1 小時是觀察潮間帶的好時機。`,
        68,
        { href: '/tide/', linkLabel: '看潮汐' }
      );
    }
  }

  if (!severe && sunset && current.isDay && !sunsetPlanAdded) {
    addPlan(`日落時間約 ${sunset}，抓前 1 小時到可同時看海景與夕陽。`, 52);
  }

  // ── 總結、標籤與舒適時段 ─────────────────────────────────────────

  if (raining) chips.push(RAIN_HEAVY.has(code) ? '大雨' : moderateRain ? '下雨' : '短暫降雨');
  else if (rainToday >= 60) chips.push(`降雨機率 ${Math.round(rainToday)}%`);
  else if (rainToday >= 30) chips.push('有機會陣雨');
  else chips.push(clear ? '晴' : cloudy ? '多雲' : '天氣穩定');

  if (tempMax >= 32 || tempMin >= 26) chips.push(`${Math.round(tempMax)}°C 偏高`);
  else if (tempMax <= 14) chips.push(`${Math.round(tempMax)}°C 偏冷`);
  else chips.push(`${Math.round(tempMin)}–${Math.round(tempMax)}°C`);

  if (current.isDay && uv >= 8) chips.push('紫外線強');
  else if (current.isDay && uv >= 5) chips.push('紫外線中等');

  const windLevel = beaufort(windMs);
  const gustLevel = beaufort(gustMs);
  if (severe || strongWind) {
    // 陣風明顯強於平均風時一併標示，避免低估現場風勢
    chips.push(gustLevel - windLevel >= 2 ? `風力 ${windLevel} 級、陣風 ${gustLevel} 級` : `風力 ${windLevel} 級`);
  } else if (breezy) chips.push('風偏大');
  else chips.push('風勢緩和');

  if (muggy) chips.push('悶熱');
  if (wave !== null && roughWave) chips.push('浪高偏大');

  let headline: string;
  if (severe) {
    headline = '目前有安全風險，建議調整行程或改期，並避開靠海的礁石與下層階梯。';
  } else if (moderateRain) {
    headline = '今天降雨明顯，建議改走室內備案，等雨勢緩和再回海邊。';
  } else if (raining) {
    headline = '目前有短暫降雨，路面溼滑，帶上雨具並放慢腳步就好。';
  } else if (strongWind) {
    headline = '風勢偏強，海浪濺上階梯的機率高，建議待在上層步道。';
  } else if (!current.isDay) {
    headline = '目前已入夜，海邊光線不足，建議改在明日日落前 1 小時左右前往。';
  } else if (veryHot || hot) {
    headline = '氣溫偏高，建議避開正午、改在傍晚前往。';
  } else if (rainSoon >= 60 || rainToday >= 60) {
    headline = '今天有機會下雨，行程建議保留彈性並備妥雨具。';
  } else if (breezy) {
    headline = '天氣大致穩定但風偏大，記得帶件防風外套。';
  } else if (uv >= 8) {
    headline = '天氣不錯、紫外線偏強，做好防曬並建議傍晚前往。';
  } else if (clear) {
    headline = '天氣穩定，適合在日落前來看海與夕陽。';
  } else if (cloudy) {
    headline = '雲層偏多、沒有暴曬，光線柔和適合拍照。';
  } else {
    headline = '天氣大致穩定，可依原計畫前往，出發前再看一次即時預報。';
  }

  const tone: AdviceTone = severe
    ? 'poor'
    : risks.length > 0 || rainToday >= 60 || strongWind
      ? 'caution'
      : clear || cloudy
        ? 'good'
        : 'fair';

  const toneLabels: Record<AdviceTone, string> = {
    good: '適合前往',
    fair: '大致可以前往',
    caution: '可以前往，請留意',
    poor: '建議改期',
  };
  // 入夜後條件再好也拍不到夕陽，標籤改以「明日」表述，避免誤導
  const toneLabel = !current.isDay && tone === 'good' ? '適合明日前往' : toneLabels[tone];

  return {
    tone,
    toneLabel,
    headline,
    chips: chips.slice(0, 5),
    groups: [
      { id: 'dress', emoji: '👕', label: '出行穿搭', items: finalize(dress, limit) },
      { id: 'plan', emoji: '🧭', label: '遊玩安排', items: finalize(plan, limit) },
      { id: 'items', emoji: '🎒', label: '隨身物品', items: finalize(items, limit) },
    ],
    risks,
    window: pickComfortWindow(next12, today, tomorrow, sunset ?? null),
  };
}

// ── 舒適時段 ─────────────────────────────────────────────────────────

const hourOf = (iso: string): number => Number(iso.slice(11, 13));

function pickComfortWindow(
  hours: WeatherHour[],
  today: WeatherDay,
  tomorrow: WeatherDay | undefined,
  sunset: string | null
): ComfortWindow | null {
  if (hours.length < 2) return null;

  const inDaylight = (h: WeatherHour): { ok: boolean; label: string } => {
    const date = h.time.slice(0, 10);
    const day = date === today.date ? today : date === tomorrow?.date ? tomorrow : null;
    if (!day || !day.sunrise || !day.sunset) return { ok: false, label: '' };
    const sr = hourOf(day.sunrise);
    const ss = hourOf(day.sunset);
    return { ok: h.hour >= sr && h.hour <= ss, label: date === today.date ? '今日' : '明日' };
  };

  const score = (h: WeatherHour): number => {
    const temp = h.temperature;
    const tempPenalty = temp > 29 ? (temp - 29) * 5 : temp < 16 ? (16 - temp) * 5 : 0;
    const windPenalty = h.windSpeed > WIND_THRESHOLD.breezy ? (h.windSpeed - WIND_THRESHOLD.breezy) * 5 : 0;
    return 100 - h.precipProb * 1.1 - tempPenalty - windPenalty;
  };

  let best: { i: number; total: number; label: string } | null = null;
  for (let i = 0; i < hours.length - 1; i += 1) {
    const a = hours[i];
    const b = hours[i + 1];
    const da = inDaylight(a);
    const db = inDaylight(b);
    if (!da.ok || !db.ok || da.label !== db.label) continue;
    const total = score(a) + score(b);
    if (!best || total > best.total) best = { i, total, label: da.label };
  }
  if (!best) return null;

  const a = hours[best.i];
  const b = hours[best.i + 1];
  const start = `${String(a.hour).padStart(2, '0')}:00`;
  const end = `${String((b.hour + 1) % 24).padStart(2, '0')}:00`;
  const rainPeak = Math.max(a.precipProb, b.precipProb);
  const windPeak = Math.max(a.windSpeed, b.windSpeed);

  const notes: string[] = [];
  if (rainPeak >= 60) notes.push('屆時降雨機率仍偏高，出發前再確認');
  else if (rainPeak >= 30) notes.push('仍有短暫陣雨機會');
  else notes.push('降雨機率較低');
  if (windPeak >= WIND_THRESHOLD.strong) notes.push('風力偏強需防風');
  else if (windPeak >= WIND_THRESHOLD.breezy) notes.push('風稍大');
  if (sunset && a.time.slice(0, 10) === today.date) {
    const ss = hourOf(`0000-00-00T${sunset}`);
    if (b.hour >= ss - 1 && a.hour <= ss) notes.push('接近日落時段');
  }

  return { label: `${best.label} ${start}–${end}`, note: notes.join('、') };
}
