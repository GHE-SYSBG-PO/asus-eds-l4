# Create Model Rule

此文件定義了在專案中建立新模組 (Block) 的標準流程與規範。由 Agent 在產生程式碼時參照使用。

## 1. 模組結構 (Module Structure)

所有新的 Block 應建立於 `blocks/` 目錄下，每個 Block 擁有獨立的資料夾。

**路徑範例**: `blocks/<block-name>/`

**必要檔案**:
1.  `blocks/<block-name>/<block-name>.js`: 主要邏輯與裝飾 (Decorate) 程式碼。
2.  `blocks/<block-name>/<block-name>.css`: 樣式表。
3.  `blocks/<block-name>/_<block-name>.json`: 定義 Sidekick/UE 的資料模型 (Model Definition)。

---

## 2. 檔案內容規範

### 2.1 JSON Model Definition (`_<block-name>.json`)

此檔案負責定義 Block 在編輯器中的結構。必須包含 `definitions` 與 `models` 兩個主要區塊。

**基本結構**:
```json
{
  "definitions": [
    {
      "title": "Block Title (Display Name)",
      "id": "<block-name>",
      "plugins": {
        "xwalk": {
          "page": {
            "resourceType": "core/franklin/components/block/v1/block",
            "template": {
              "name": "Block Name",
              "model": "<block-name>"
            }
          }
        }
      }
    }
  ],
  "models": [
    {
      "id": "<block-name>",
      "fields": [
        // 在此定義欄位
      ]
    }
  ],
  "filters": []
}
```

**常用欄位類型 (Field Types)**:

*   **Text (文字)**:
    ```json
    {
      "component": "text",
      "valueType": "string",
      "name": "title",
      "label": "Title",
      "value": ""
    }
    ```
*   **Image / Reference (圖片/參照)**:
    ```json
    {
      "component": "reference",
      "valueType": "string",
      "name": "image",
      "label": "Image",
      "multi": false
    }
    ```
*   **Rich Text (多行文字/HTML)**:
    ```json
    {
      "component": "richtext",
      "name": "description",
      "label": "Description",
      "valueType": "string"
    }
    ```
*   **Select (下拉選單)**:
    ```json
    {
      "component": "select",
      "name": "theme",
      "label": "Theme",
      "options": [
        { "name": "Light", "value": "light" },
        { "name": "Dark", "value": "dark" }
      ]
    }
    ```

### 2.2 JavaScript Logic (`<block-name>.js`)

負責處理 Block 的 DOM 結構轉換 (Decoration)。

**基本結構**:
```javascript
import { getMetadata } from '../../scripts/aem.js';

export default async function decorate(block) {
  // 1. 讀取內容
  // const rows = [...block.children];

  // 2. 建立新的 DOM 結構
  // const wrapper = document.createElement('div');

  // 3. 清空並重新附加
  // block.textContent = '';
  // block.append(wrapper);
}
```

### 2.3 CSS Styles (`<block-name>.css`)

定義 Block 的樣式。

**基本結構**:
```css
.<block-name> {
  /* Main block styles */
}

.<block-name> img {
  /* Image styles */
}
```

---

## 3. 開發流程注意事項

1.  **Build Model**: 每次新增或修改 `_<block-name>.json` 後，**必須** 及其它 JSON 合併。通常這由 CI/CD 處理，但在本地開發時，若需要驗證 Sidekick 顯示，可能需要手動觸發相應的 script (參考 `package.json` 中的 `build:json`)。
2.  **Naming**: Block 名稱應使用 kebab-case (例如 `hero`, `product-list`)。
3.  **Pug**: 此專案**不使用** Pug 樣板引擎，請完全依賴 JavaScript 進行 DOM 操作。

