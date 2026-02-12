---
trigger: always_on
---

# IDE 設定與程式碼規範

請遵循以下 VS Code 設定與專案規範：

## 格式化 (Prettier)

- **預設格式化工具**: 使用 Prettier (`esbenp.prettier-vscode`)。
- **適用語言**: JavaScript, JSON, CSS, HTML。
- **Format on Save**: 提供程式碼時，請確保符合 Prettier 格式（因為使用者開啟了存檔自動格式化）。

## Linting (ESLint & Stylelint)

- **自動修正**: 專案設定了 `source.fixAll.eslint` 和 `source.fixAll.stylelint` 為 `explicit`。
- **要求**: 請確保提供的程式碼通過 ESLint 和 Stylelint 檢查，並儘可能修復相關警告。

## 原始設定參考 (.vscode/settings.json)

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.fixAll.stylelint": "explicit"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```
