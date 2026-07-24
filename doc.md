[![2026新竹景點推薦！南寮漁港、內灣老街、小叮噹科學園區一日遊攻略](https://images.openai.com/static-rsc-4/BFLgAfsgAZ37JTlkfP_UhN0YMFySSnnk0RptJoo24ieKksjFjwFeT8PFeGZ2gyOB-nweYPyJXWQ01QGBUkGzs-_qMigTxuIEXob3DvgGr0BShbEH1RkWs6JWdYUO8mlAjLOTQHzdHf62Mh4HO02rglEHgdnCH7o27kvjmaxxcdQ?purpose=inline)](https://www.elle.com/tw/life/hot-news/g70297031/hsinchu-tourist-spots/?utm_source=chatgpt.com)

# Yulintianti.com 完整建站方案

## 一、先確定網站定位

`Yulintianti.com` 適合面向臺灣繁體中文使用者，名稱直接對應「魚鱗天梯」，容易記憶，也沒有連字號或難拼字母。

但它存在一個天然限制：

> 網域看起來像「魚鱗天梯單景點站」，而真正有流量空間的是整個南寮漁港與新竹17公里海岸線。

因此，網站不應只做一篇魚鱗天梯介紹，而應採用以下品牌架構。

### 建議品牌組合

**網站名稱：**

> 南寮魚鱗天梯

**完整名稱：**

> 南寮魚鱗天梯｜南寮漁港旅遊指南

**品牌標語：**

> 看海、追夕陽，玩懂南寮

**首頁定位：**

> 提供南寮魚鱗天梯的今日天氣、潮汐、夕陽時間、停車、交通、拍照位置，以及南寮漁港一日遊資訊。

魚鱗天梯本身是新竹漁港海岸改造的一部分，兼具消波、護岸和休憩功能；市府旅遊內容也通常把它與南寮漁港、17公里海岸線、波光市集等一起規劃，因此把網站擴展成「南寮海岸旅遊指南」是合理的，不會顯得離題。([新竹市政府香山濕地生態網][1])

---

# 二、域名如何使用

## 主域名設定

統一使用：

```text
https://yulintianti.com/
```

推薦以裸域名為主：

```text
www.yulintianti.com
```

永久301跳轉至：

```text
yulintianti.com
```

所有頁面必須做到：

* 強制HTTPS
* URL全部小寫
* 每頁設定唯一Canonical
* 不同尾斜線版本統一
* HTTP、WWW和Pages.dev測試域名全部301跳轉
* 不讓Cloudflare Pages預設域名被Google收錄

如果尚未完成購買，應在註冊商或ICANN Lookup再次確認當下註冊狀態；搜尋引擎沒有找到網站，不代表網域一定尚未被註冊。ICANN目前使用RDAP提供即時註冊資料查詢。([ICANN查询][2])

## 建議保護的延伸資產

預算允許時，可額外保護：

```text
nanliaotianti.tw
```

但不需要另外經營，直接301至`.com`即可。

信箱建議：

```text
editor@yulintianti.com
partner@yulintianti.com
```

---

# 三、網站真正的差異化

目前「南寮魚鱗天梯」「南寮漁港一日遊」搜尋結果中，常見內容仍是旅遊部落格、景點合集和一次性遊記，主要回答怎麼去、拍什麼、吃什麼。([波比看世界][3])

`Yulintianti.com` 不應複製這種模式，而應做成：

> **內容型景點指南＋每日旅遊決策工具**

核心問題不是只有「魚鱗天梯是什麼」，而是：

* 今天適合去嗎？
* 今天幾點看夕陽？
* 現在風會不會太大？
* 幾點漲潮、退潮？
* 退潮時還值得去嗎？
* 車停哪裡最方便？
* 帶小孩可以怎麼玩？
* 玩兩小時還是安排半日遊？
* 魚鱗天梯附近還有什麼？

這種即時決策能力，才是網站與一般旅遊文章最大的區別。

---

# 四、網站資訊架構

## 頂部選單

建議只保留六個主要入口：

```text
魚鱗天梯
今日狀況
交通停車
南寮景點
行程攻略
美食地圖
```

手機版右側固定放一個：

```text
立即導航
```

## 完整URL架構

```text
/
├── /yulin-tianti/
├── /today/
├── /sunset/
├── /tide/
├── /weather/
├── /parking/
├── /transport/
├── /map/
│
├── /nanliao-harbor/
├── /boguang-market/
├── /family-beach/
├── /kite-field/
├── /bike-route/
├── /17km-coastline/
│
├── /food/
│   ├── /seafood/
│   ├── /snacks/
│   ├── /cafes/
│   └── /family-restaurants/
│
├── /itineraries/
│   ├── /two-hours/
│   ├── /half-day/
│   ├── /one-day/
│   ├── /family/
│   ├── /couples/
│   ├── /sunset/
│   └── /rainy-day/
│
├── /photo-spots/
├── /events/
├── /news/
├── /guides/
│
├── /about/
├── /editorial-policy/
├── /sources/
├── /contact/
├── /privacy/
└── /disclaimer/
```

URL建議使用短英文或固定拼音，不建議使用繁體中文URL，避免複製分享時變成大量編碼字串。

---

# 五、首頁完整結構

## 1. 首屏Hero

### H1標題

> 南寮魚鱗天梯：今日天氣、潮汐、夕陽與停車攻略

### 副標題

> 出發前先查看南寮風速、降雨、漲退潮和日落時間，再安排魚鱗天梯、南寮漁港與17公里海岸線行程。

### 四個主要按鈕

```text
查看今日狀況
查看潮汐
停車與導航
安排半日遊
```

主圖使用16:9夕陽照片，但文字區不要直接壓在複雜天空上，應加深色漸層以確保可讀性。

---

## 2. 今日適合去嗎

這是整個網站最重要的模組。

建議顯示：

```text
今日旅遊建議：適合前往

日落時間      18:42
降雨機率      20%
平均風速      每秒6公尺
下一次乾潮    13:28
下一次滿潮    19:51
資料更新      10:30
```

狀態分成三種即可：

* **適合前往**
* **可以前往，但風較強／可能下雨**
* **不建議前往**

不要使用過度精確的「91分」之類分數，因為使用者容易誤解成安全保證。

### 建議判斷邏輯

先判斷安全條件：

```text
有陸上強風、大雨、颱風或海象警示
→ 直接顯示不建議前往
```

沒有警示後，再判斷：

```text
天氣狀況      30%
風速          25%
降雨機率      15%
夕陽可見度    15%
潮汐          10%
假日人流       5%
```

中央氣象署目前提供未來一個月潮汐預報API，也提供沿海72小時的風力、浪高、海流、天氣和當日潮汐資訊，足以支撐這個模組。([opendata.cwa.gov.tw][4])

頁面上要清楚標示：

> 潮汐及海象為預報資料，實際狀況可能不同。請遵守現場封鎖、警示及工作人員指示。

---

## 3. 快速資訊卡

首頁緊接著放：

| 資訊   | 顯示內容           |
| ---- | -------------- |
| 地址   | 新竹市北區新港北路      |
| 門票   | 免費             |
| 建議停留 | 30至60分鐘        |
| 最佳時間 | 日落前60至90分鐘     |
| 適合族群 | 情侶、親子、攝影、單車    |
| 無障礙  | 上層步道可觀景，下層階梯不便 |
| 寵物   | 戶外空間，請繫牽繩      |
| 夜間   | 不建議進入靠海下層      |

地址和景點工程性質可直接以新竹市政府資料為主要來源。([新竹市政府香山濕地生態網][1])

---

## 4. 互動地圖

地圖不是只放一個Google Maps iframe，而應標示：

* 魚鱗天梯實際入口
* 最佳夕陽拍照點
* 上層無障礙觀景位置
* 第一停車場
* 第二停車場
* 機車停車區
* 公車站
* 洗手間
* 波光市集
* 竹風漁市
* 親子沙灘
* 國際風箏賽場
* 腳踏車租借
* 17公里海岸線入口

低成本方案：

> MapLibre＋OpenStreetMap顯示地圖，Google Maps只提供外部導航按鈕。

這樣可以避免首頁載入大型Google地圖腳本，也比較容易自行加入路線和自訂標記。

---

## 5. 三種推薦路線

首頁直接提供三張行程卡。

### 兩小時夕陽版

```text
波光市集
→ 國際風箏賽場
→ 魚鱗天梯
→ 看夕陽
```

### 親子半日版

```text
旅客服務中心
→ 親子沙灘
→ 放風箏
→ 魚鱗天梯
→ 晚餐
```

### 單車一日版

```text
南寮租車
→ 魚鱗天梯
→ 港南運河
→ 香山濕地
→ 返回南寮
```

新竹市官方將南寮漁港視為17公里海岸線的重要起點和海岸觀光節點，因此單車內容可以成為網站的重要第二流量入口。([旅游局][5])

---

# 六、首批核心內容

## P0：上線必須完成

| 頁面   | 建議SEO標題                  |
| ---- | ------------------------ |
| 首頁   | 南寮魚鱗天梯｜今日天氣、潮汐、夕陽與停車攻略   |
| 魚鱗天梯 | 南寮魚鱗天梯完整攻略｜地址、拍照、潮汐與注意事項 |
| 今日狀況 | 南寮魚鱗天梯今天適合去嗎？天氣、風速與夕陽    |
| 潮汐   | 南寮魚鱗天梯潮汐表｜今日漲潮與退潮時間      |
| 夕陽   | 南寮魚鱗天梯日落時間｜最佳觀賞與拍照時間     |
| 停車   | 南寮魚鱗天梯停車攻略｜停車場位置與步行路線    |
| 交通   | 新竹火車站到南寮魚鱗天梯交通方式         |
| 地圖   | 南寮漁港景點地圖｜停車、洗手間與拍照位置     |
| 半日遊  | 南寮漁港半日遊｜魚鱗天梯、波光市集與夕陽     |
| 親子   | 南寮漁港親子一日遊｜玩沙、放風箏與用餐      |

## P1：擴大南寮搜尋流量

* 南寮漁港完整攻略
* 波光市集營業時間與店家整理
* 南寮親子沙灘開放時間
* 國際風箏賽場攻略
* 南寮腳踏車租借比較
* 17公里海岸線騎行攻略
* 南寮漁港海鮮餐廳整理
* 魚鱗天梯最佳拍照位置
* 魚鱗天梯漲潮與退潮差異
* 南寮漁港雨天備案
* 南寮附近咖啡店
* 南寮漁港晚上值得去嗎

## P2：建立長期流量

* 新竹海線一日遊
* 南寮到香山濕地路線
* 新竹看夕陽景點比較
* 南寮風箏節攻略
* 南寮漁港活動日曆
* 帶長輩玩南寮的路線
* 南寮無障礙旅遊資訊
* 南寮寵物友善景點
* 南寮婚紗與攝影攻略
* 每月日落時間整理

---

# 七、繁體中文與臺灣用語

全站使用：

```html
<html lang="zh-Hant-TW">
```

採用臺灣常用詞：

| 建議使用   | 不建議   |
| ------ | ----- |
| 停車場    | 停车场   |
| 腳踏車    | 自行车   |
| 公車     | 公交車   |
| 大眾運輸   | 公共交通  |
| 洗手間、廁所 | 衛生間   |
| 一日遊    | 一日游   |
| 導航     | 导航    |
| 漲潮、退潮  | 涨潮、退潮 |
| 營業時間   | 营业时间  |
| 親子景點   | 亲子景点  |

日期格式：

```text
2026年7月24日
```

時間格式：

```text
18:42
```

距離：

```text
1.2公里
```

不要同時混用「臺」「台」，建議正文統一使用「臺灣」，但固定地名及一般搜尋詞可自然使用「台灣」。

---

# 八、SEO策略

## 首頁Title

```text
南寮魚鱗天梯｜今日天氣、潮汐、夕陽與停車攻略
```

控制在約28至32個中文字以內，不需要把所有附近景點都塞進去。

## 首頁Description

```text
南寮魚鱗天梯旅遊指南，整理今日天氣、風速、潮汐、日落時間、停車、交通、拍照位置，以及南寮漁港親子與半日遊行程。
```

## 首頁H1

```text
南寮魚鱗天梯：今天適合去嗎？
```

Title負責完整關鍵字，H1負責吸引點擊後的使用者。

## 關鍵字群組

### 景點核心

```text
南寮魚鱗天梯
魚鱗天梯
新竹魚鱗天梯
南寮魚鱗天梯
南寮漁港魚鱗天梯
```

### 出發決策

```text
魚鱗天梯今天適合去嗎
魚鱗天梯潮汐
魚鱗天梯夕陽時間
魚鱗天梯風大
魚鱗天梯下雨
魚鱗天梯開放時間
```

### 交通需求

```text
魚鱗天梯停車
魚鱗天梯怎麼去
南寮漁港停車
新竹火車站到南寮
南寮公車
```

### 行程需求

```text
南寮漁港一日遊
南寮漁港親子
南寮景點
南寮美食
17公里海岸線
新竹海線一日遊
```

---

# 九、每篇文章的統一模板

每個景點頁都應按照固定順序：

```text
一句話結論
今天的狀況
基本資料
值得去嗎
最佳時間
潮汐與天氣
交通方式
停車資訊
現場設施
親子與無障礙
拍照位置
安全提醒
附近美食
周邊順遊
常見問題
資料來源
最後更新時間
```

文章開頭不要先寫三百字抒情文，應直接回答：

> 魚鱗天梯適合安排在日落前一小時抵達，單獨停留約30至60分鐘，建議搭配南寮漁港與波光市集一起遊覽。

## 強化E-E-A-T的方法

每篇加入：

* 實際到訪日期
* 原創現場照片
* 拍照時間
* 當時天氣
* 當時潮汐
* 停車場實走距離
* 嬰兒車實際可通行範圍
* 資料來源
* 編輯者姓名
* 最後查核日期

照片說明範例：

```text
拍攝於2026年7月，日落前約45分鐘，當時接近乾潮。
```

這種資訊比大量通用AI文字更有價值。

---

# 十、結構化資料

## 魚鱗天梯頁

使用：

```text
TouristAttraction
Place
GeoCoordinates
ImageObject
Article
BreadcrumbList
```

## 南寮漁港總覽頁

使用：

```text
TouristDestination
includesAttraction
touristType
```

## 行程頁

使用：

```text
TouristTrip
ItemList
```

## 風箏節或期間活動

使用：

```text
Event
```

Schema.org將單一景點定義為`TouristAttraction`，包含多個相關景點的區域可用`TouristDestination`，行程則可使用`TouristTrip`。([Schema.org][6])

Google搜尋不保證所有Schema都會顯示富媒體結果，因此：

* `Article`
* `BreadcrumbList`
* `Event`

按照Google規格測試；其他旅遊類型主要用於補充語意。部署前使用Rich Results Test和Schema Markup Validator檢查。([Google for Developers][7])

不要添加虛假的五星評分，也不要把網路評論加工成自己的`aggregateRating`。

---

# 十一、視覺與品牌設計

## Logo方向

圖形可以由三個元素構成：

1. 半圓夕陽
2. 層疊魚鱗
3. 海浪曲線

Logo下方文字：

```text
南寮魚鱗天梯
NANLIAO YULIN TIANTI
```

不要使用新竹市政府標誌、官方色帶、政府機關章或「官方」字樣。

## 建議色彩

```text
深海藍    #163B4D
海岸藍    #6C9AAA
夕陽橘    #E99A59
沙灘米    #E9DFD0
魚鱗灰    #F1F0EB
正文深灰  #243137
```

## 字體

```css
font-family:
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  "Noto Sans TC",
  "PingFang TC",
  "Microsoft JhengHei",
  sans-serif;
```

標題可以使用較粗的Noto Sans TC，不需要另外載入花俏中文字體。

## 圖片規格

| 用途     |     建議尺寸 |
| ------ | -------: |
| 首頁Hero | 1600×900 |
| OG圖片   | 1200×630 |
| 景點橫圖   | 1280×720 |
| 列表縮圖   |  800×600 |
| Logo   |      SVG |
| App圖示  |  512×512 |

全部輸出AVIF或WebP，保留JPEG備援，並使用`srcset`。

---

# 十二、技術方案

考慮到網站以內容、SEO和少量即時資料為主，建議：

```text
Astro
Tailwind CSS
Cloudflare Pages
Cloudflare Workers
Cloudflare R2
Markdown / MDX
```

## 專案結構

```text
src/
├── pages/
├── components/
│   ├── TodayStatus.astro
│   ├── TideCard.astro
│   ├── SunsetCard.astro
│   ├── ParkingMap.astro
│   └── SourceBlock.astro
├── content/
│   ├── attractions/
│   ├── itineraries/
│   ├── food/
│   └── guides/
├── lib/
│   ├── cwa.ts
│   ├── sunset.ts
│   ├── status-score.ts
│   └── schema.ts
└── data/
    ├── places.json
    ├── parking.json
    └── notices.json
```

## 動態資料流程

```text
中央氣象署API
        ↓
Cloudflare Worker
        ↓
驗證與統一資料格式
        ↓
Cloudflare Cache / KV
        ↓
首頁今日狀況模組
```

建議快取：

| 資料   | 快取時間 |
| ---- | ---: |
| 天氣   | 30分鐘 |
| 沿海風浪 | 30分鐘 |
| 潮汐   |  6小時 |
| 日落時間 | 24小時 |
| 官方公告 |  1小時 |
| 景點文章 | 靜態生成 |

API失敗時不要顯示成即時資料，改成：

> 即時資料暫時無法更新。最後成功更新時間：今日08:30。

並提供中央氣象署官方資料入口。

---

# 十三、地圖資料模型

每個地點統一儲存：

```json
{
  "name": "南寮魚鱗天梯",
  "slug": "yulin-tianti",
  "category": "attraction",
  "latitude": 24.8522,
  "longitude": 120.9237,
  "address": "新竹市北區新港北路",
  "recommendedStayMinutes": 45,
  "familyFriendly": true,
  "wheelchairAccess": "upper-area-only",
  "parkingNearby": true,
  "toiletNearby": true,
  "lastVerifiedAt": "2026-07-24"
}
```

停車場資料另外記錄：

```json
{
  "name": "南寮漁港第一停車場",
  "latitude": 0,
  "longitude": 0,
  "vehicleTypes": ["car", "motorcycle"],
  "pricingText": "以現場公告為準",
  "walkMinutesToStairs": 8,
  "lastVerifiedAt": "2026-07-24"
}
```

對可能變動的價格、營業時間和交通班次，不要永久寫死，必須帶有`lastVerifiedAt`。

---

# 十四、商業化方式

這個站不適合一上線就塞滿AdSense。

## 第一階段：建立信任

前兩至三個月以：

* 原創內容
* 即時工具
* 地圖
* 行程
* 搜尋流量

為主。

廣告最多放：

* 文章正文後一個
* 內容列表中一個
* 桌面側欄一個

首屏、今日狀況和安全提醒附近不要放廣告。

## 第二階段：在地合作

更適合的收入來源：

* 腳踏車租借
* 電動輔助車
* 海鮮餐廳
* 咖啡店
* 親子餐廳
* 新竹住宿
* 攝影服務
* 風箏與戶外用品
* 在地活動
* 行程平台
* eSIM及交通聯盟

可建立：

```text
南寮腳踏車租借比較
魚鱗天梯附近餐廳
南寮親子友善餐廳
新竹海線住宿推薦
```

付費內容必須標記：

```text
合作推薦
贊助內容
廣告
```

## 第三階段：使用者工具

後續可以增加：

* 收藏行程
* 產生半日遊路線
* 天氣轉好提醒
* 夕陽條件提醒
* 現場人流回報
* 停車狀況回報
* LINE旅遊提醒

但不要在第一版就開放匿名評論，否則容易出現垃圾內容和商家爭議。

---

# 十五、站點信任與法律頁面

頁尾必須清楚顯示：

> Yulintianti.com為獨立旅遊資訊網站，並非南寮魚鱗天梯、新竹漁港或新竹市政府官方網站。開放狀況、交通、潮汐及活動資訊可能隨時變更，請以主管機關及現場公告為準。

另外建立：

* 關於本站
* 編輯政策
* 資料來源
* 更正資訊
* 圖片授權
* 隱私權政策
* Cookie說明
* 廣告與合作揭露
* 安全免責聲明

不要將網站命名為：

```text
南寮魚鱗天梯官網
魚鱗天梯官方網站
新竹市南寮旅遊官方站
```

---

# 十六、90天執行計畫

## 第1至14天：完成基本站

完成：

* 品牌與Logo
* 首頁
* 魚鱗天梯主頁
* 停車
* 交通
* 潮汐
* 夕陽
* 南寮漁港
* 半日遊
* 親子行程
* 基本地圖
* 法律頁面

同步設定：

* Google Search Console
* GA4或Cloudflare Web Analytics
* Sitemap
* robots.txt
* Canonical
* OG圖片
* 結構化資料

## 第15至30天：建立差異化

上線：

* 今日適合前往模組
* CWA天氣和海象資料
* 一個月潮汐頁
* 日落時間頁
* 停車步行圖
* 最佳拍照點
* 手機導航按鈕

## 第31至60天：擴展內容

新增：

* 波光市集
* 親子沙灘
* 風箏賽場
* 腳踏車
* 17公里海岸線
* 美食分類
* 雨天備案
* 長輩行程
* 寵物行程
* 無障礙資訊

## 第61至90天：推廣與變現測試

開始：

* 聯絡腳踏車租借店
* 聯絡餐廳與咖啡店
* 製作Instagram短圖文
* 製作Facebook社團實用貼文
* 推出LINE旅遊提醒
* 測試住宿與行程聯盟
* 製作季節活動頁面

---

# 十七、最終落地配置

我建議直接採用以下版本：

```text
網域：
yulintianti.com

品牌：
南寮魚鱗天梯

完整名稱：
南寮魚鱗天梯｜南寮漁港旅遊指南

品牌標語：
看海、追夕陽，玩懂南寮

首頁H1：
南寮魚鱗天梯：今天適合去嗎？

核心功能：
天氣＋風速＋潮汐＋夕陽＋停車＋導航

內容範圍：
魚鱗天梯
南寮漁港
波光市集
親子沙灘
國際風箏賽場
17公里海岸線
附近美食與行程

技術：
Astro＋Tailwind＋Cloudflare Pages＋Workers

第一階段頁數：
15至20頁

主要市場：
臺灣繁體中文使用者

英文版：
第二階段再增加，不作為初期重點
```

`Yulintianti.com` 最好的發展方向不是做成一個普通景點介紹頁，而是成為使用者出發前會打開的「南寮今日旅行工具」。只要首頁真正解決今天是否適合去、幾點看夕陽、潮汐如何、車停哪裡這四個問題，網站就具備比一般旅遊部落格更清楚的長期價值。

[1]: https://ssw.hccg.gov.tw/viewpoint/10?utm_source=chatgpt.com "魚鱗天梯"
[2]: https://lookup.icann.org/?utm_source=chatgpt.com "ICANN Lookup"
[3]: https://bobbytravel.tw/hsinchu-harbor/?utm_source=chatgpt.com "【新竹】南寮漁港攻略：波光市集、魚鱗天梯、美食餐廳"
[4]: https://opendata.cwa.gov.tw/dist/opendata-swagger.html?utm_source=chatgpt.com "Opendata API 線上說明文件 - 氣象資料開放平臺"
[5]: https://tourism.hccg.gov.tw/chtravel/app/data/view?detailno=&id=39&module=hotnews&serno=1e9f3a3e-6f45-4b88-861f-23f2d0ef8d6a&utm_source=chatgpt.com "中秋連假輕旅行邀您來新竹17公里海岸線騎單車品美食"
[6]: https://schema.org/TouristDestination?utm_source=chatgpt.com "TouristDestination - Schema.org Type"
[7]: https://developers.google.com/search/docs/appearance/structured-data/breadcrumb?utm_source=chatgpt.com "How To Add Breadcrumb (BreadcrumbList) Markup"
