---
description: 根據 AEM URL 產生 Github PR 用的 Before/After 網址文案
---
當使用者執行這個 workflow 並提供 AEM Universal Editor 的網址時，你必須解析該網址，並產生可以直接複製貼上到 PR 的 Before/After 測試網址文案。

1. 解析提供的網址，格式通常如下：
   `https://author-<...>.adobeaemcloud.com/ui#/@asustek/aem/universal-editor/canvas/author-<...>.adobeaemcloud.com/content/asus-l4<PATH>.html?ref=<BRANCH>`

2. 提取出其中的 `<PATH>` 和 `<BRANCH>`：
   - `<PATH>` 是 `/content/asus-l4` 之後到 `.html` 之前的部分。例如：`/language-master/en/components/id-26-line-info/dev`
   - `<BRANCH>` 是 `ref` 參數的值。例如：`feat-line-info-26`

3. 根據提取的資訊，產生以下格式的文案：
   - Before: `https://dev--asus-eds-l4-dev--ghe-sysbg-po.aem.page/`
   - After: `https://<BRANCH>--asus-eds-l4-dev--ghe-sysbg-po.aem.page<PATH>?ref=<BRANCH>`

4. 以純文字 (`text`) 的 code block 輸出結果，讓使用者可以一鍵複製。不需要提供額外的解釋或說明。

Example:
如果輸入的網址是：
https://author-p165753-e1767020.adobeaemcloud.com/ui#/@asustek/aem/universal-editor/canvas/author-p165753-e1767020.adobeaemcloud.com/content/asus-l4/language-master/en/components/id-26-line-info/dev.html?ref=feat-line-info-26

則回答：
```text
- Before: https://dev--asus-eds-l4-dev--ghe-sysbg-po.aem.page/
- After: https://feat-line-info-26--asus-eds-l4-dev--ghe-sysbg-po.aem.page/language-master/en/components/id-26-line-info/dev?ref=feat-line-info-26
```
