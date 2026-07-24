// 以 NOAA 演算法計算日出／日落時間（純函式，可於建置期與瀏覽器端使用）
// 回傳為當地時間字串（Asia/Taipei, UTC+8）

const TW_OFFSET = 8; // 台灣時區固定 UTC+8，無日光節約

function toRad(d: number) {
  return (d * Math.PI) / 180;
}
function toDeg(r: number) {
  return (r * 180) / Math.PI;
}

// 回傳當日日出/日落的「當地小時（含小數）」；若永晝/永夜回傳 null
function calcSunEvent(date: Date, lat: number, lng: number, sunset: boolean): number | null {
  const start = Date.UTC(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start;
  const dayOfYear = Math.floor(diff / 86400000);

  const zenith = 90.833; // 官方日出日落，含大氣折射與太陽半徑
  const lngHour = lng / 15;
  const t = sunset
    ? dayOfYear + (18 - lngHour) / 24
    : dayOfYear + (6 - lngHour) / 24;

  const M = 0.9856 * t - 3.289; // 太陽平近點角
  let L =
    M + 1.916 * Math.sin(toRad(M)) + 0.02 * Math.sin(toRad(2 * M)) + 282.634;
  L = ((L % 360) + 360) % 360;

  let RA = toDeg(Math.atan(0.91764 * Math.tan(toRad(L))));
  RA = ((RA % 360) + 360) % 360;
  const Lquadrant = Math.floor(L / 90) * 90;
  const RAquadrant = Math.floor(RA / 90) * 90;
  RA = (RA + (Lquadrant - RAquadrant)) / 15;

  const sinDec = 0.39782 * Math.sin(toRad(L));
  const cosDec = Math.cos(Math.asin(sinDec));

  const cosH =
    (Math.cos(toRad(zenith)) - sinDec * Math.sin(toRad(lat))) /
    (cosDec * Math.cos(toRad(lat)));
  if (cosH > 1 || cosH < -1) return null;

  const H = sunset ? toDeg(Math.acos(cosH)) : 360 - toDeg(Math.acos(cosH));
  const Hh = H / 15;
  const T = Hh + RA - 0.06571 * t - 6.622;
  let UT = T - lngHour;
  UT = ((UT % 24) + 24) % 24;

  let local = UT + TW_OFFSET;
  local = ((local % 24) + 24) % 24;
  return local;
}

function hoursToHHMM(h: number | null): string {
  if (h === null) return '--:--';
  let hh = Math.floor(h);
  let mm = Math.round((h - hh) * 60);
  if (mm === 60) {
    mm = 0;
    hh = (hh + 1) % 24;
  }
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

export function getSunset(date: Date, lat: number, lng: number): string {
  return hoursToHHMM(calcSunEvent(date, lat, lng, true));
}
export function getSunrise(date: Date, lat: number, lng: number): string {
  return hoursToHHMM(calcSunEvent(date, lat, lng, false));
}

// 最佳觀賞窗口：日落前 60~90 分鐘到日落後 20 分鐘
export function getGoldenWindow(date: Date, lat: number, lng: number) {
  const s = calcSunEvent(date, lat, lng, true);
  if (s === null) return null;
  return {
    start: hoursToHHMM(s - 1.25),
    sunset: hoursToHHMM(s),
    end: hoursToHHMM(s + 0.33),
  };
}
