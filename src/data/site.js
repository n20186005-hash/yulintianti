// 全站基本設定（無資料庫、純靜態）
export const SITE = {
  name: '南寮魚鱗天梯',
  fullName: '南寮魚鱗天梯｜南寮漁港旅遊指南',
  slogan: '看海、追夕陽，玩懂南寮',
  url: 'https://yulintianti.com',
  lang: 'zh-Hant-TW',
  locale: 'zh_TW',
  themeColor: '#163B4D',
  defaultOgImage: '/images/harbor-hero.jpg',
  // 魚鱗天梯座標（結構化資料與地圖標記用）
  geo: { lat: 24.8522, lng: 120.9237 },
  // 手機「立即導航」的目的地（Google 地圖「南寮魚鱗天梯」地點）
  nav: {
    name: '南寮魚鱗天梯',
    address: '300新竹市北區新港路',
    lat: 24.8522637,
    lng: 120.9237228,
  },
};

// 全站統一的導航連結：使用 Google 地圖地點的精確座標，避免同名地點誤判
export const NAV_DEST_URL =
  'https://www.google.com/maps/dir/?api=1&destination=' +
  encodeURIComponent(`${SITE.nav.lat},${SITE.nav.lng}`);

// 頂部主選單（六個主要入口）
export const NAV = [
  { label: '魚鱗天梯', href: '/yulin-tianti/' },
  { label: '今日狀況', href: '/today/' },
  { label: '交通停車', href: '/transport/' },
  { label: '南寮景點', href: '/nanliao-harbor/' },
  { label: '行程攻略', href: '/itineraries/' },
  { label: '美食地圖', href: '/food/' },
];

// 頁尾連結分組
export const FOOTER_NAV = [
  {
    title: '出發前必看',
    links: [
      { label: '今日狀況', href: '/today/' },
      { label: '潮汐表', href: '/tide/' },
      { label: '日落時間', href: '/sunset/' },
      { label: '天氣與海象', href: '/weather/' },
      { label: '停車攻略', href: '/parking/' },
      { label: '交通方式', href: '/transport/' },
    ],
  },
  {
    title: '南寮景點',
    links: [
      { label: '魚鱗天梯', href: '/yulin-tianti/' },
      { label: '南寮漁港', href: '/nanliao-harbor/' },
      { label: '波光市集', href: '/boguang-market/' },
      { label: '親子沙灘', href: '/family-beach/' },
      { label: '國際風箏賽場', href: '/kite-field/' },
      { label: '17公里海岸線', href: '/17km-coastline/' },
      { label: '景點地圖', href: '/map/' },
    ],
  },
  {
    title: '行程與美食',
    links: [
      { label: '兩小時夕陽版', href: '/itineraries/two-hours/' },
      { label: '親子半日遊', href: '/itineraries/family/' },
      { label: '單車一日遊', href: '/itineraries/one-day/' },
      { label: '雨天備案', href: '/itineraries/rainy-day/' },
      { label: '海鮮餐廳', href: '/food/' },
      { label: '拍照位置', href: '/photo-spots/' },
    ],
  },
  {
    title: '關於本站',
    links: [
      { label: '關於本站', href: '/about/' },
      { label: '編輯政策', href: '/editorial-policy/' },
      { label: '資料來源', href: '/sources/' },
      { label: '圖片授權', href: '/image-credits/' },
      { label: '隱私權政策', href: '/privacy/' },
      { label: '免責聲明', href: '/disclaimer/' },
      { label: '聯絡我們', href: '/contact/' },
    ],
  },
];

// 品牌色彩（同步於 global.css 的 CSS 變數）
export const COLORS = {
  deepSea: '#163B4D',
  coastBlue: '#6C9AAA',
  sunsetOrange: '#E99A59',
  beachSand: '#E9DFD0',
  scaleGrey: '#F1F0EB',
  bodyDark: '#243137',
};
