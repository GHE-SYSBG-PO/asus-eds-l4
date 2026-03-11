Branch: feat/nav-hero-3

UE Branch Url:
```
npm run dev
```

https://author-p165753-e1767020.adobeaemcloud.com/ui#/@asustek/aem/universal-editor/canvas/author-p165753-e1767020.adobeaemcloud.com/content/asus-l4/language-master/en/components/id-3-nav-hero/dev.html?ref=feat-nav-hero-3


Dev Branch Url:
http://localhost:3000/components/id-3-nav-hero/dev?ref=feat-nav-hero-3


---

## Nav Hero 外部控制 API

### 1. 手動顯示 / 隱藏（Custom Event）

其他區塊或腳本可以透過 dispatch 自訂事件來控制 nav-hero 的顯示與隱藏。

**隱藏 nav-hero：**
```js
document.body.dispatchEvent(new Event('nav-hero-hidden'));
```

**顯示 nav-hero：**
```js
document.body.dispatchEvent(new Event('nav-hero-show'));
```

> 觸發後會在 `.nav-hero` 元素上加上或移除 `is-hidden` class，透過 `opacity: 0` 隱藏整個側邊導航。

---

### 2. 碰撞自動隱藏（Collision Detection）

如果頁面上有某些區塊（例如全寬 Banner、CTA 等）在視覺上會與 nav-hero 重疊，可以在該區塊加上 `.nav-hero-collision` class，nav-hero 就會在滾動時自動偵測碰撞，並在重疊時隱藏自己。

**使用方式：**

在需要避免重疊的元素上加上 `nav-hero-collision` class：

```html
<div class="my-fullwidth-banner nav-hero-collision">
  <!-- 全寬 Banner 內容 -->
</div>
```

**運作原理：**
- nav-hero 會在每次 `scroll` 和 `resize` 時，用 `getBoundingClientRect()` 檢查自身與所有 `.nav-hero-collision` 元素是否有矩形重疊。
- 若偵測到重疊 → 在 `.nav-hero` 加上 `is-collision-hidden` class（透過 CSS `opacity: 0` 隱藏）。
- 若無重疊 → 移除 `is-collision-hidden` class，恢復顯示。
- `.nav-hero-collision` 元素可以是動態載入的，不需要在 nav-hero 初始化前就存在。
