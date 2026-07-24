# 南寮魚鱗天梯｜南寮漁港旅遊指南

獨立的南寮旅遊資訊網站（`yulintianti.com`）。以 **Astro + Tailwind CSS v4 + Markdown/MDX** 建置，靜態輸出，部署於 **Cloudflare Pages**。無資料庫、無登入、無線上預訂、只用系統字體。

> 本站為獨立網站，並非官方網站。此聲明僅顯示於每頁頁尾。

## 開發

```bash
pnpm install
pnpm dev        # 本機開發 http://localhost:4321
pnpm build      # 產生靜態網站到 dist/
pnpm preview    # 預覽 dist/
```

## 專案結構

```
src/
├── pages/            # 路由（工具頁、法律頁、集合的動態路由）
│   ├── index.astro           # 首頁（Hero + 今日狀況 + 地圖 + 路線）
│   ├── [slug].astro          # 景點頁（根路徑：/yulin-tianti/ 等）
│   ├── today/tide/sunset/... # 每日決策工具頁
│   ├── itineraries/ food/ guides/  # 集合列表 + [slug]
│   └── about/privacy/disclaimer... # 信任與法律頁
├── content/          # Markdown/MDX 內容（attractions/itineraries/food/guides）
├── components/       # Seo、Header、Footer、TodayStatus、TideTable、PlaceMap…
├── layouts/          # BaseLayout、ArticleLayout
├── lib/              # sunset(天文計算)、tide、status-score、schema(JSON-LD)、format
├── data/             # site、places、parking、tide、notices、image-credits
└── styles/global.css # Tailwind v4 + 品牌色 + 系統字體
```

## SEO

- 每頁唯一 `<title>`、`description`、`canonical`（小寫、含尾斜線）。
- Open Graph / Twitter Card；`<html lang="zh-Hant-TW">`。
- 結構化資料：`TouristAttraction` / `TouristDestination` / `TouristTrip` / `Article` / `BreadcrumbList` / `FAQPage` / `WebSite` / `Organization`。
- `@astrojs/sitemap` 產生 `sitemap-index.xml`；`public/robots.txt` 指向 sitemap。
- `public/_headers` 讓 `*.pages.dev` 測試網域 `noindex`，並為靜態資產設長快取。
- `public/_redirects` 將 `www` 301 轉至裸網域。

部署後請用 Google [Rich Results Test](https://search.google.com/test/rich-results) 與 Schema Markup Validator 檢查。

## 資料與即時性

- **即時天氣**：`/weather/` 的即時天氣卡（`src/components/LiveWeather.astro`）向 `/api/weather`
  取資料。該端點是 **Cloudflare Pages Function**（`functions/api/weather.js`），代理
  [Open-Meteo](https://open-meteo.com/en/docs)、邊緣快取 15 分鐘，**無需 API Key 或環境變數**。
  顯示即時溫度、體感、降雨機率、風速、陣風、風向、溼度與三日預報，並針對
  **雷雨、強風、高溫**顯示繁體中文提醒（邏輯見 `src/lib/weather.ts`）。載入失敗時退回中央氣象署連結。
- **日落／日出**：`src/lib/sunset.ts` 以天文演算法計算（Asia/Taipei），並在瀏覽器端以使用者當日日期校正。
- **潮汐**：`src/data/tide.json` 為代表性每日示意資料，頁面明確標示並連向中央氣象署。
- **今日狀況**：`src/lib/status-score.ts` 為判斷邏輯；可將 `/api/weather` 的即時資料接入 `TodayStatus`。
- **導航目的地**：全站「立即導航」使用 `NAV_DEST_URL`（`src/data/site.js`），
  指向 Google 地圖「南寮魚鱗天梯」（24.8522637, 120.9237228）。

### 本機測試 Pages Function

`astro dev` / `astro preview` 不會執行 Pages Functions。請用 wrangler 同時跑靜態資產與函式：

```bash
pnpm build
npx wrangler pages dev dist        # 造訪 http://localhost:8788/weather/ 與 /api/weather
```

## 圖片

`public/images/` 內為新竹漁港（南寮漁港）等**真實照片**，來自 Wikimedia Commons，採 CC BY / CC BY-SA 授權，
作者與出處列於 `/image-credits/`（資料：`src/data/image-credits.json`）。

## 部署到 Cloudflare Pages

1. 推上 Git 儲存庫，於 Cloudflare Pages 連結專案。
2. Build command：`pnpm build`；Build output：`dist`。
3. 綁定自訂網域 `yulintianti.com`，並設定 `www` → 裸網域 301（`_redirects` 已備）。
4. 流量分析：於 Cloudflare 開啟 **Web Analytics** 取得 token，填入 `BaseLayout.astro` 內已備好的
   beacon 註解即可（無 Cookie）；或改用 GA4。

## 後續（doc.md 規劃）

- 圖片輸出 AVIF/WebP 並加 `srcset`（可改用 `astro:assets` 的 `<Picture>`）。
- 接入中央氣象署即時天氣／海象／潮汐。
- 擴充 P1／P2 內容與在地合作頁。
