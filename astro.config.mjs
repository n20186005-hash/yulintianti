// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

import { SITE } from './src/data/site.js';

// 靜態輸出為主，僅天氣／今日狀況等模組改以伺服器島嶼（Server Island）於邊緣即時渲染，
// 部署目標為 Cloudflare Workers（見 wrangler.jsonc）。
export default defineConfig({
  site: SITE.url,
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  adapter: cloudflare({
    // 圖片於建置期轉換，執行期不依賴 Node 影像服務
    imageService: 'compile',
  }),
  integrations: [
    mdx(),
    sitemap({
      i18n: undefined,
      changefreq: 'weekly',
      lastmod: new Date(),
      // 離線頁與 404 不需收錄
      filter: (page) => !page.includes('/offline') && !page.includes('/404'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
