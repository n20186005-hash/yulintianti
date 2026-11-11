import places from './places.json';
import { SITE } from './site.js';

// 精確的魚鱗天梯地點頁已有分享連結；其他景點採名稱＋城市搜尋，
// 不使用魚鱗天梯座標冒充其他景點的 Google Place ID。
const names: Record<string, string> = {
  'nanliao-harbor': '新竹漁港 南寮漁港 新竹市',
  'boguang-market': '波光市集 新竹市北區',
  'family-beach': '南寮親子沙灘 新竹市',
  'kite-field': '新竹漁港國際風箏賽場 新竹市',
  '17km-coastline': '新竹十七公里海岸線自行車道 南寮',
};

export function attractionNavigation(slug: string) {
  const place = places.find((p) => p.slug === slug);
  if (!place) return null;
  return {
    name: place.name,
    address: place.address,
    url: slug === 'yulin-tianti'
      ? SITE.mapsUrl
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(names[slug] ?? `${place.name} 新竹市`)}`,
  };
}
