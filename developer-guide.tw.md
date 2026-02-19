# ASUS EDS L4 Frontend Developer Guide (前端開發指南)

這份文件整合了來自 ASUS L4 EDS 專案開發者的架構規範與實作檢核表經驗，旨在成為你每日開發的隨手參考。

---

## 🚀 1. Quick Start (快速開始)

### 環境準備
*   **Node.js**: `v20.19.5` (請使用 `.nvmrc`)
*   **套件安裝**: `npm install` (若遇到問題請用 `npm ci`)

### 常用指令
*   **啟動開發伺服器**: `npm run dev` (同時啟動 AEM Proxy, SASS, Tailwind)
*   **Linting (檢查程式碼)**: `npm run lint`
*   **Lint Fix (自動修正)**: `npm run lint:fix`

### 技術堆棧 (Tech Stack)
*   **Core**: Vanilla JavaScript (ES Modules) - **No Frameworks (React/Vue)**
*   **Styling**:
    *   **Tailwind CSS (v4)**: 用於 Utility Classes (Padding, Margin, Typography).
    *   **SCSS**: 用於複雜元件樣式與 BEM 結構.
    *   **CSS Variables**: 用於 Theming (Dark/Light Mode, Brand Colors).
*   **Architecture**: AEM Edge Delivery Services (Boilerplate)

### Key Design References (設計參考網站)
*   **ASUS Zenbook Duo 2024 (UX8406):** [Link](https://www.asus.com/us/laptops/for-home/zenbook/asus-zenbook-duo-2024-ux8406/)
    *   *Reference Components:* ID 7, ID 14, ID 18.
*   **ASUS Vivobook S 14 OLED (M5406):** [Link](https://www.asus.com/laptops/for-home/vivobook/asus-vivobook-s-14-oled-m5406/)
    *   *Reference Components:* ID 6, ID 13.
*   **ROG G700 (2025):** [Link](https://rog.asus.com/us/desktops/full-tower/rog-g700-2025-gm700/)
    *   *Reference:* ID 41, Dark Mode.

---

## 🛠 2. Developer Tooling & Standards (開發者工具與標準指南)

### 2.1 Node 版本管理

#### 版本要求
*   **必須使用 Node.js v20.19.5 版本**
*   所有開發者必須統一使用此版本，以確保環境一致性

#### 環境配置
*   **前置準備**: 需要先安裝 `nvm` (Node Version Manager) 工具 (參考 [nvm 官方文檔](https://github.com/nvm-sh/nvm))
*   **.nvmrc 文件**: 項目根目錄已包含 `.nvmrc` 文件，配置內容為 `v20.19.5`

#### 版本檢測流程 (npm run dev)
當執行 `npm run dev` 時，系統會自動檢測當前 Node 版本：
*   ✅ **通過/自動切換**: 若已安裝 v20.19.5，系統會自動切換並啟動。
*   ❌ **失敗**: 若未安裝 v20.19.5，系統會提示安裝並阻止啟動。

#### 特殊情況處理 (AEM CLI)
若 Node v20.19.5 已安裝但項目未啟動：
1.  執行 `aem up` 檢查狀態。
2.  若報錯，執行 `npm install -g @adobe/aem-cli` 安裝 AEM CLI。
3.  重新執行 `npm run dev`。

### 2.2 Git 提交標準 (Husky)

本項目配置了 **Husky** 預提交鉤子，每次 `git commit` 時自動執行：

#### 1. 代碼質量檢查 (Lint)
*   自動執行 `npm run lint` 檢查 JS/JSON/SCSS。
*   ❌ **失敗**: 若有錯誤，**提交會被自動阻止**，需修復後重試。

#### 2. JSON 自動同步 (Build)
*   若修改了 `blocks/` 下的 `_*.json` 模型文件：
    1.  自動執行 `npm run build:json`。
    2.  將生成的全局配置 (`component-models.json`) 自動加入本次提交。
*   **優勢**: 確保配置文件時刻與模型同步，無需手動構建。

#### 常見問題 (Git 部署失敗)
若收到 Git 部署失敗通知：
1.  檢查 Lint 結果與文件格式。
2.  修復問題後重新提交。
3.  確認 CI/CD 管道顯示綠色狀態。

---

## 📐 3. Architectural Rules (核心架構規範)

### 3.1 Block 隔離原則 (Isolation)
*   **Sandboxing**: 每個 Block (Component) 應視為獨立的沙盒。
    *   ❌ **Don't**: 在 Block A 直接選取或修改 Block B 的 DOM。
    *   ✅ **Do**: 透過 `CustomEvent` 進行通訊。

### 3.2 DOM Decoration (裝飾模式)
*   **Error Barrier**: `decorate` 函式內部應使用 `try-catch` 包覆，避免單一元件錯誤導致整頁白屏。

---

## 🛠 4. Implementation Patterns (實作模式)

### 4.1 建立新 Block
1.  **建立檔案**:
    *   `blocks/my-block/my-block.js`
    *   `blocks/my-block/my-block.css`
2.  **建立 Model**:
    *   `models/my-block.json` (對應 Universal Editor 欄位)

### 4.2 處理 RWD 圖片
使用 `createOptimizedPicture` helper (from `aem.js`) 來生成響應式圖片 (`<picture>` tag, WebP, Lazy Loading)。

```javascript
import { createOptimizedPicture } from '../../scripts/aem.js';

const picture = createOptimizedPicture(src, alt, eager, [{ width: '750' }]);
block.append(picture);
```

### 4.3 處理 Theming
(請見第 5 章)

### 4.4 Dialog 與 Tab 設定規範

1.  **Basic/Advanced 設定**:
    *   當需求 Figma 中提到 `+config level: Basic/Advanced` 時，**不需要**特別製作一個 Basic/Advanced toggle。
    *   **規則**: 請將所有的 Advanced Dialog 選項，全部集中放置到 **Advanced Tab** 中即可。

2.  **Color Group Tab**:
    *   **規則**: 所有的元件的最後一個 Tab 需是 **Color Group**。
    *   請將 Color Group 選項單獨放置在該 Tab 中即可。

3.  **Gradient Color 輸入格式**:
    *   **規則**: 當提供 user 輸入漸層色時，讓 user 輸入兩個 hex values，中間以 **逗號** 分隔，**不需要** 輸入 `#`。
    *   **範例**: `000000,ffffff`
    *   **參考**: ID 6 BTN (`containerBgColorDefault`)。

4.  **Repeatable vs Multifields 定義**:
    *   **Repeatable**: 當看見 Repeatable 時，ex: +card(Repeatable)，意思是以 **Block / Block Item** (Row/Column) 結構來提供輸入。
    *   **Multifields**: 當看見 Multifields 時，ex: +card(Multifields)，意思是使用 **Container** `Multi = true` (JSON Array) 來提供 user 輸入。

### 4.5 Inline ID Syntax (ID 屬性擴充)

為了讓作者 (Authors) 能在不修改 DOM 結構的情況下，為特定的文字或元素指定 `id` 屬性 (通常用於錨點連結或 CSS 特殊樣式)，我們提供了 `processInlineIdSyntax` 工具函式。

**語法格式:**
在文字內容中使用 `//[id=VALUE]CONTENT//` 的格式。
*   `VALUE`: 欲設定的 ID 名稱。
*   `CONTENT`: 顯示的文字內容。
*   **注意**: 必須成對使用 `//` 包覆。

**範例:**
*   作者輸入: `//[id=faq-section]常見問答//`
*   渲染結果: `<p id="faq-section">常見問答</p>` (視標籤與容器而定，ID 會被加在該文字節點的父元素上)

**程式碼實作 (Text Block 範例):**

在 Block 的 `decorate` 函式最後呼叫此工具：

```javascript
import { processInlineIdSyntax } from '../../scripts/utils.js';

export default function decorate(block) {
  // ... 其他裝飾邏輯 ...

  // 啟用 Inline ID 處理
  processInlineIdSyntax(block);
}
```

**使用場景:**
*   **Text Block**: 允許行銷人員在長篇文章中設定錨點 (Anchor Points)。
*   **Heading**: 設定特定的 ID 以供外部連結跳轉。

---

## 🎨 5. Theming Engine & CSS Architecture 開發指南

> 本指南整理自 Story 2.1: Theming Engine & CSS Architecture (ASUS-42) (https://adobe-japac-ps.atlassian.net/browse/ASUS-42) 的開發實踐記錄

### 5.1 概述
本章節定義了如何實現主題引擎和 CSS 架構，以支持多品牌（ROG、TUF、ASUS）的動態切換，同時避免樣式衝突。

### 5.2 架構設計 (Architecture Design)

#### 核心原則
- **BEM 命名規範**：遵循 BEM（Block Element Modifier）架構。
- **CSS 變數系統**：使用 CSS 自訂屬性實現動態主題切換。
- **品牌隔離**：透過數據屬性確保各品牌樣式互不影響。

### 5.3 實現方案 (Implementation)

#### 1. 資料屬性綁定

**Author 環境（編輯環境）**: 在 `<body>` 元素上綁定。
```html
<body data-product="rog" data-mode="light">
```
*   **原因**: Author 模式新增 Section 會移除 main 標籤自訂屬性，故必須綁定在 body。

**非 Author 環境（發佈環境）**: 在 `<main>` 元素上綁定。
```html
<main data-product="rog" data-mode="light">
```

#### 2. Dialog 頁面屬性設定
在 Dialog 的 Page 屬性中可配置：
- **Product Line**（產品線）：選擇對應的品牌。
- **Color Group**（色彩組）：指定該品牌對應的色彩集合。

#### 3. CSS 變數載入 (Auto Loading)
當 `data-product` 和 `data-mode` 設定後，CSS 自動匹配：

```css
:root[data-product="rog"][data-mode="light"] {
  --color-primary: #ff0000;
  --color-secondary: #ffffff;
}

:root[data-product="tuf"][data-mode="light"] {
  --color-primary: #ffb81c;
  --color-secondary: #000000;
}
```

#### 4. 動態色彩更新 (Dynamic Update)
透過 JS 修改屬性，實現無刷新換膚：
```javascript
// 動態切換
document.body.setAttribute('data-product', 'tuf');
document.body.setAttribute('data-mode', 'dark');
```

### 5.4 驗收標準 (Acceptance Criteria)
- [ ] Author 環境：屬性綁定於 `<body>`。
- [ ] Publish 環境：屬性綁定於 `<main>`。
- [ ] Page Properties 支援 productline / color group 配置。
- [ ] 動態切換屬性時，頁面顏色立即更新無視覺延遲。

---

## 🔍 6. EDS Block Development Guidelines (進階開發規範)

> 本指南整理自 Story 2.2: EDS Model Implementation Practice (ASUS-43) (https://adobe-japac-ps.atlassian.net/browse/ASUS-43) 的開發實踐記錄

### 6.1 全局組件命名約定

**組件（Components）** - 從業務程式碼中抽離出來的全局組件必須遵循嚴格的命名約定：
- 所有全局組件的內部字段名稱（name）必須以小寫 `g` 開頭，後跟駝峰式命名
- **示例：** `gBtnFont`、`gIconSize`、`gPaddingValue`

**區塊和組件標籤命名規則：**
- 必須與需求文檔中的配置項命名對齊，包括大小寫
- 確保開發和需求文檔之間的一致性

### 6.2 SCSS 約定

**規則：** 開發者應該只在 SCSS 檔案中工作。CSS 檔案將自動生成，不應手動修改。

**隔離要求：** 為了防止與嵌入項目的樣式衝突，每個 SCSS 檔案必須用隔離命名空間包裝：
```scss
.l4-pdp {
  // 在此編寫您的樣式
}
```

這確保所有組件保持樣式隔離，防止意外的級聯效應。

### 6.3 在 Decorate 函數中獲取數據

**流程：**
- 在 decorate 函數中使用公共方法 `getBlockConfigs` 獲取數據
- 傳入默認配置（`DEFAULT_CONFIG`）和組件名稱
- 使用 `getFieldValue` 轉換數據格式

**程式碼結構：**
```javascript
const blockData = getBlockConfigs(componentName, DEFAULT_CONFIG);
const transformedData = getFieldValue(blockData);
```

### 6.4 moveInstrumentation - DOM 結構對齊

**關鍵規則：** 創建 DOM 結構時必須嚴格按照 AEM Dialog 中定義的層級關係。

**關鍵步驟：**
1. 創建與 AEM Dialog 層級關係完全匹配的 DOM 結構
2. 在對應的 DOM 元素上調用 `moveInstrumentation` 函數以轉移屬性
3. 這確保作者環境中的編輯操作生效

**示例 - Dialog 層級結構：**

當 Dialog 配置顯示如下的層級結構時：
```
├── Container（容器）
│   ├── Select（選擇器）
│   ├── Text（文本）
│   └── Reference（參考）
```

默認呈現的 HTML 結構必須是：
```html
<div data-aue-xxx...>
  <div data-aue-xxx></div>
  <div data-aue-xxx></div>
  <div data-aue-xxx></div>
</div>
```

**關鍵細節圖片示例：**
![Dialog 層級結構示例](https://adobe-japac-ps.atlassian.net/secure/attachment/20260211-052135.png)

![HTML 結構示例](https://adobe-japac-ps.atlassian.net/secure/attachment/20260211-052733.png)

**重要提示：** 父級和子級的這些 div 將綁定許多內置屬性。這些屬性至關重要。在 decorate 函數中生成新的 HTML 時：
- 必須遵循上述確切結構
- 必須使用 `moveInstrumentation` 轉移所有屬性
- 不這樣做將在 AEM 製作界面中造成各種問題

### 6.5 必要的 Flag 字段設置

在對話框組件開發中有兩種情況需要按照固定規則嵌入 Flag 字段：

#### 情景 1：組件嵌套在容器中（非重複）

**條件：** 組件需要嵌套在容器內，且不需要循環

**實現方法：** 在組件 models 的最後一個元素中嵌入隱藏的 Flag 字段。沒有這個，容器功能將不會生效。
```json
{
  "component": "text",
  "name": "L4TagNestedBlock",
  "value": "L4--nested-block--text-block",
  "hidden": true
}
```

**程式碼示例參考：** 查看原始票據附件中的 ID 1 程式碼示例
![ID 1 程式碼示例](https://adobe-japac-ps.atlassian.net/secure/attachment/20260211-053720.png)

#### 情景 2：組件嵌套在容器中（多重重複）

**條件：** 組件需要嵌套在容器內，且需要多次重複

**實現方法：** 當業務場景涉及容器字段形成可重複列表，且 `multi = true` 和 `valueType = string[]` 時，在每個字段前插入隱藏標籤，遵循以下模式：
```
L4TagMulti-{name}
```

**程式碼示例參考：** 查看原始票據附件中的 ID 69 程式碼示例
![ID 69 程式碼示例](https://adobe-japac-ps.atlassian.net/secure/attachment/20260211-054002.png)


### 6.6 Button Style 實作規範

當開發的元件中有按鈕，且被要求需具有 **Text Link Style & Button Style** 時：
*   **規則**: Button Style 必須具有與 **ID 6 BTN** 完全相同的客製化選項。
*   **共用元件**: Button Style 的 CSS, JS, 與 Model Definition 已經被做成共用元件，位於 `components/button` 目錄中。
*   **實作參考**: 請參考 **ID 1 (Text Block)** 的實作方式來引入與使用。

### 6.7 常見陷阱 (Common Pitfalls) ⚠️
*   **條件判斷 (Condition Logic)**：
    *   ❌ **錯誤**：使用 Container 內部的子欄位做 `visible` 條件判斷。
    *   ✅ **正確**：只能使用 **JSON 第一層級** 的欄位做條件判斷。
*   **特殊字符 (`#`)**：
    *   **問題**：Text Component 若包含兩個 `#` (e.g., `#000, #fff`) 會導致內容被清空。
    *   **解法**：暫時移除 `#`，使用 `000, fff` 代替。

---

## ✅ 7. Daily Development Checklist (開發檢核表)

### 7.1 核心實作與結構 (Core Implementation & Structure)
- [ ] **DOM 結構**: 確認 HTML 結構語意正確，class 命名符合 BEM 或專案規範。
- [ ] **Dialog 屬性**:
    - [ ] **Tab 分類**: 區分 **Basic** (基礎設定) 與 **Advanced** (進階樣式)。
    - [ ] **命名一致性**: 屬性名稱需對應設計規範 (e.g., `+alignment`, `+category`, `+bg_color`)。
    - [ ] **Style Defaults (樣式預設值)**: 所有樣式相關參數 **必須**在程式碼中設定預設值。Dialog 下拉選單中**不應**預先選取 (Pre-selected)，應保持未選取狀態 (Code-level default)。
- [ ] **Dynamic Content (動態內容)**:
    - [ ] **空值隱藏**: 若作者未填寫某欄位 (e.g., Title, Body, CTA)，該元素應自動隱藏且不佔據版面空間。
    - [ ] **Show/Hide 邏輯**: 若 Dialog 支援手動開關 (Toggle)，切換時需正確顯示或隱藏元素，且當設定為 hidden 時，該元素**不應佔據**版面空間 (使用 `display: none` 而非 `visibility: hidden`)。
    - [ ] **Multifield Limits**: 若有數量限制 (e.g., Tab max 6)，確認功能正常。

### 7.2 響應式設計 (RWD - Responsive Web Design)
- [ ] **多裝置適配**: 確認在 **Desktop (桌機)**、**Tablet (平板)**、**Mobile (手機)** 三種斷點下，佈局符合設計規範。
    - [ ] **Desktop**: 預設展開或橫向排列。
    - [ ] **Tablet**: 適應寬度，可能調整欄位比例。
    - [ ] **Mobile**: 通常轉為垂直堆疊 (Vertical Stack)，並確認間距合理。
- [ ] **裝置專屬設定**: 若設計規範提及 (e.g., ID 5 Media Block)，需確認可分別針對 D/T/M 上傳不同資源或設定不同參數 (大小、對齊)。

### 7.3 樣式系統 (Style System & Theming)
- [ ] **Product Line (產品線風格)**:
    - [ ] 支援 ROG / TUF / ProArt / ASUS 等不同產品線的字體或圓角設定。
- [ ] **Color Group (色彩模式)**:
    - [ ] **Variant 1 (Dark Mode)**: 確認深色背景下的文字顏色與對比度正確。
    - [ ] **Variant 2 (Light Mode)**: 確認淺色背景下的文字顏色 (通常為預設)。
- [ ] **Typography (排版)**:
    - [ ] **Advanced Settings**: 確認可由 Dialog 調整字體大小、顏色、粗細 (依照 Spec 提供的選項，如 16/18/20px 等)。

### 7.4 對齊與佈局 (Alignment & Layout)
- [ ] **Global Alignment**:
    - [ ] 確認可針對 D/T/M 分別設定對齊方式 (如 Desktop 置中，Mobile 靠左)。
- [ ] **Container Compatibility (容器相容性)** 若元件允許被放入容器中 (ex:**Container (ID 12)**)，需確認:
    - [ ] 是否正常顯示，無跑版。
    - [ ] 在 **Mobile Stack** 狀態下是否正常。
    - [ ] 背景色與 Padding 行為正確。

### 7.5 互動與動效 (Interaction & Motion)
- [ ] **Entrance Animation (進場動畫)**:
    - [ ] **Scroll Trigger**: 捲動到視窗內 (Viewport) 時觸發。
    - [ ] **Effect**: 執行 Slide Up + Fade In (或其他指定效果)。
    - [ ] **Toggle**: 確認 Dialog 中的 `+motion (on/off)` 可控制動畫啟用/停用。
- [ ] **Hover Effects**:
    - [ ] **Links/Buttons**: 滑鼠懸停時有正確的樣式變化 (e.g., 底線、顏色變深)。
    - [ ] **Interactive Elements**: 卡片或選單項目懸停時的動效 (e.g., Slide out)。
- [ ] **Complex Interactions** (若適用):
    - [ ] **Carousel/Tabs**: 
        - [ ] 確認切換 (Click) 順暢。
        - [ ] 確認 Swipe (Touch) 支援 (Mobile)。
        - [ ] 確認 Auto-play / Pause / Loop 邏輯 (Video 或 Carousel)。
    - [ ] **Accordion**: 
        - [ ] 確認展開/收合動畫順暢。
        - [ ] 確認 Icon (Chevron/Plus/Minus) 狀態切換正確。

### 7.6 媒體與連結 (Media & Links)
- [ ] **Media Assets**:
    - [ ] **Images**: 支援 Upload，並**必須**填寫 Alt Text (Accessibility)。
    - [ ] **Videos**: 支援 Auto-play / Loop 設定，確認靜音播放 (Muted) 行為符合瀏覽器政策。
    - [ ] **Lazy Loading**: 圖片與影片應預設 Lazy Load，除非是 LCP 元素。
- [ ] **CTA (Call to Action)**:
    - [ ] **Text Link v.s. Button**: 確認可切換樣式，當為 Button 類型時需保持與 ID 5 相同的客製化能力。

### 7.7 數據與無障礙 (Data & Accessibility)
- [ ] **Accessibility (A11y)**:
    - [ ] **Semantic HTML**: 使用正確的標籤 (e.g., `<nav>`, `<button>`, `<article>`, `<ul>`).
    - [ ] **ARIA Roles**: 互動元件 (Tabs, Accordion, Carousel) 需有正確的 ARIA 屬性 (e.g., `aria-expanded`, `aria-selected`, `role="tablist"`).
    - [ ] **Keyboard Nav**: 確保可使用鍵盤操作 (Tab, Enter, Space)。
- [ ] **Analytics (Tracking)**:
    - [ ] 確認主要互動元件 (CTA, Tabs, Video Play) 埋設正確的 `data-track` 屬性 (若專案有規範)。

### 7.8 驗收與程式碼品質 (Validation & Code Quality)
- [ ] **Verify Acceptance Criteria**: 逐條確認 User Story 中的 AC 是否通過。
- [ ] **AEM Author Page**:
    - [ ] 在 AEM Author 環境建立專屬測試頁面。
    - [ ] 測試 WYSIWYG 編輯器行為。
    - [ ] 測試 Dialog 所有選項組合。
- [ ] **Programmatic Checklist**:
    - [ ] **Console Errors**: 無紅色錯誤訊息。
    - [ ] **Performance**: 檢查 CLS (Layout Shift) 與 LCP。
    - [ ] **Linting**: 通過專案的 ESLint / Stylelint 檢查。

---


