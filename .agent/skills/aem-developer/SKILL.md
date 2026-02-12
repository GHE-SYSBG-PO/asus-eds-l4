---
name: aem-developer
description: Standards and guidelines for developing AEM blocks, including structure, JSON models, accessibility, and preferred libraries.
---

# AEM Developer Skill

This skill defines the standard process and specifications for creating new modules (Blocks) in the project. It serves as the primary reference for the Agent when generating code.

## 1. Module Structure

All new Blocks should be created under the `blocks/` directory, with each Block having its own independent folder.

**Naming Convention**: Block names should use kebab-case (e.g., `hero`, `product-list`).

**Path Example**: `blocks/<block-name>/`

**Required Files**:
1.  `blocks/<block-name>/<block-name>.js`: Main logic and decoration code.
2.  `blocks/<block-name>/<block-name>.css`: Stylesheet.
3.  `blocks/<block-name>/_<block-name>.json`: Data model definition for Sidekick/UE.

---

## 2. File Content Specifications

### 2.1 JSON Model Definition (`_<block-name>.json`)

This file defines the Block's structure in the editor. It must contain two main sections: `definitions` and `models`.

**Reference Structure**:
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
        // Define fields here
      ]
    }
  ],
  "filters": []
}
```

**Common Field Types**:

*   **Text**:
    ```json
    {
      "component": "text",
      "valueType": "string",
      "name": "title",
      "label": "Title",
      "value": ""
    }
    ```
*   **Image / Reference**:
    ```json
    {
      "component": "reference",
      "valueType": "string",
      "name": "image",
      "label": "Image",
      "multi": false
    }
    ```
*   **Rich Text**:
    ```json
    {
      "component": "richtext",
      "name": "description",
      "label": "Description",
      "valueType": "string"
    }
    ```
*   **Select**:
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

Responsible for DOM structure transformation (Decoration) of the Block.

*   **No Pug**: Do NOT use Pug template engine. Use pure JavaScript for DOM manipulation.
*   **Imports**: Standard import is `import { getMetadata } from '../../scripts/aem.js';`.

**Basic Structure**:
```javascript
import { getMetadata } from '../../scripts/aem.js';

export default async function decorate(block) {
  // 1. Read content
  // const rows = [...block.children];

  // 2. Create new DOM structure
  // const wrapper = document.createElement('div');

  // 3. Clear and re-append
  // block.textContent = '';
  // block.append(wrapper);
}
```

### 2.3 CSS Styles (`<block-name>.css`)

Defines the Block's styles. Use BEM-like naming where appropriate.

**Basic Structure**:
```css
.<block-name> {
  /* Main block styles */
}

.<block-name> img {
  /* Image styles */
}
```

---

## 3. Best Practices & Standards

### 3.1 Accessibility (A11y)
*   **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible (tabindex, keydown listeners).
*   **Semantic HTML**: Use proper semantic tags (`<button>`, `<nav>`, `<article>`) instead of generic `<div>` where possible.
*   **ARIA**: Use ARIA attributes (`aria-label`, `aria-expanded`, `role`) to enhance screen reader support, especially for custom interactive components.
*   **Focus Management**: Manage focus visibility and flow, ensuring focus indicators are visible.

### 3.2 Libraries & Sliders
*   **Swiper.js**: Use Swiper.js for ALL slider and carousel implementations.
    *   **Do not** write custom slider logic.
    *   Ensure Swiper is properly initialized within the `decorate` function.
    *   Load Swiper styles and scripts only when needed.

### 3.3 Development Process
1.  **Build Model**: After creating or modifying `_<block-name>.json`, ensure it's valid. (In local dev, `npm run build:json` may be needed).
2.  **Naming**: Always stick to the `<block-name>` convention for classes and file names to ensure auto-loading works correctly.
