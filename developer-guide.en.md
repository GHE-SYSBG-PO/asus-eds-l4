# ASUS EDS L4 Frontend Developer Guide

This document consolidates architectural guidelines and implementation checklists from developers' experience in project ASUS L4 EDS, designed to be a daily reference for your development work.

---

## 🚀 1. Quick Start

### Environment Setup
*   **Node.js**: `v20.19.5` (Please use `.nvmrc`)
*   **Package Installation**: `npm install` (Use `npm ci` if you encounter issues)

### Common Commands
*   **Start Development Server**: `npm run dev` (Starts AEM Proxy, SASS, Tailwind)
*   **Linting (Code Check)**: `npm run lint`
*   **Lint Fix (Auto-fix)**: `npm run lint:fix`

### Tech Stack
*   **Core**: Vanilla JavaScript (ES Modules) - **No Frameworks (React/Vue)**
*   **Styling**:
    *   **Tailwind CSS (v4)**: used for Utility Classes (Padding, Margin, Typography).
    *   **SCSS**: used for complex component styling and BEM structure.
    *   **CSS Variables**: used for Theming (Dark/Light Mode, Brand Colors).
*   **Architecture**: AEM Edge Delivery Services (Boilerplate)

### Key Design References
*   **ASUS Zenbook Duo 2024 (UX8406):** [Link](https://www.asus.com/us/laptops/for-home/zenbook/asus-zenbook-duo-2024-ux8406/)
    *   *Reference Components:* ID 7, ID 14, ID 18.
*   **ASUS Vivobook S 14 OLED (M5406):** [Link](https://www.asus.com/laptops/for-home/vivobook/asus-vivobook-s-14-oled-m5406/)
    *   *Reference Components:* ID 6, ID 13.
*   **ROG G700 (2025):** [Link](https://rog.asus.com/us/desktops/full-tower/rog-g700-2025-gm700/)
    *   *Reference:* ID 41, Dark Mode.
---

## 🛠 2. Developer Tooling & Standards

### 2.1 Node Version Management

#### Version Requirement
*   **Must use Node.js v20.19.5**
*   All developers must consistently use this version to ensure environment consistency.

#### Environment Configuration
*   **Prerequisite**: Install `nvm` (Node Version Manager). (Reference [nvm official docs](https://github.com/nvm-sh/nvm))
*   **.nvmrc File**: The project root already contains an `.nvmrc` file configured for `v20.19.5`.

#### Version Check Process (npm run dev)
When running `npm run dev`, the system automatically checks the current Node version:
*   ✅ **Pass/Auto-switch**: If v20.19.5 is installed, the system automatically switches and starts.
*   ❌ **Fail**: If v20.19.5 is not installed, the system prompts installation and prevents startup.

#### Troubleshooting (AEM CLI)
If Node v20.19.5 is installed but the project fails to start:
1.  Run `aem up` to check status.
2.  If an error occurs, run `npm install -g @adobe/aem-cli` to install AEM CLI.
3.  Re-run `npm run dev`.

### 2.2 Git Commit Standards (Husky)

This project has **Husky** pre-commit hooks configured to run automatically on every `git commit`:

#### 1. Code Quality Check (Lint)
*   Automatically runs `npm run lint` to check JS/JSON/SCSS.
*   ❌ **Fail**: If errors exist, **the commit will be automatically blocked**. You must fix them and retry.

#### 2. JSON Auto-Sync (Build)
*   If `_*.json` model files under `blocks/` are modified:
    1.  Automatically runs `npm run build:json`.
    2.  Automatically adds the generated global configuration (`component-models.json`) to the current commit.
*   **Benefit**: Ensures configuration files stay in sync with models without manual build steps.

#### FAQ (Git Deployment Fails)
If you receive a Git deployment failure notification:
1.  Check Lint results and file formatting.
2.  Fix issues and re-commit.
3.  Verify CI/CD pipeline shows green status.

---

## 📐 3. Architectural Rules

### 3.1 Block Isolation Principle
*   **Sandboxing**: Each Block (Component) should be treated as an isolated sandbox.
    *   ❌ **Don't**: Directly select or modify DOM of Block B from Block A.
    *   ✅ **Do**: Communicate via `CustomEvent`.

### 3.2 DOM Decoration (Decorator Pattern)
*   AEM EDS does not send HTML, but sends **content structure**.
*   All DOM modifications (adding Wrappers, Buttons, Icons) **must** be done inside the `decorate(block)` function.
*   **Error Barrier**: The `decorate` function should be wrapped in `try-catch` to block single component errors from causing a white screen on the whole page.

---

## 🛠 4. Implementation Patterns

### 4.1 Creating a New Block
1.  **Create Files**:
    *   `blocks/my-block/my-block.js`
    *   `blocks/my-block/my-block.css`
2.  **Create Model**:
    *   `models/my-block.json` (Corresponds to Universal Editor fields)

### 4.2 Handling RWD Images
Use the `createOptimizedPicture` helper (from `aem.js`) to generate responsive images (`<picture>` tag, WebP, Lazy Loading).

```javascript
import { createOptimizedPicture } from '../../scripts/aem.js';

const picture = createOptimizedPicture(src, alt, eager, [{ width: '750' }]);
block.append(picture);
```

### 4.3 Handling Theming
(See Section 5)

### 4.4 Dialog & Tab Guidelines

1.  **Basic/Advanced Settings**:
    *   When Figma requirements mention `+config level: Basic/Advanced`, **do not** create a Toggle switch.
    *   **Rule**: Consolidate all Advanced settings directly into the **Advanced Tab**.

2.  **Color Group Tab**:
    *   **Rule**: The last Tab of all components must be **Color Group**.
    *   This Tab should exclusively contain Color Group related options.

3.  **Gradient Color Input Format**:
    *   **Rule**: When providing users with gradient color input, require two hex values separated by a **comma**, **without** the `#` symbol.
    *   **Example**: `000000,ffffff`
    *   **Reference**: ID 6 BTN (`containerBgColorDefault`).

4.  **Repeatable vs Multifields Definition**:
    *   **Repeatable**: Implementation must use **Block / Block Item** structure (ex: OOTB cards).
    *   **Multifields**: Implementation must use **Container** structure with `Multi = true` (JSON Array).

### 4.5 Inline ID Syntax (ID Attribute Extension)

To allow Authors to specify an `id` attribute for specific text or elements without modifying the DOM structure (usually for anchor links or special CSS styles), we provide the `processInlineIdSyntax` utility function.

**Syntax Format:**
Use the format `//[id=VALUE]CONTENT//` within the text content.
*   `VALUE`: The desired ID name to set.
*   `CONTENT`: The text content to display.
*   **Note**: Must be enclosed with `//`.

**Example:**
*   Author input: `//[id=faq-section]FAQ//`
*   Render result: `<p id="faq-section">FAQ</p>` (Depending on the tag and container, the ID will be added to the parent element of the text node)

**Code Implementation (Text Block Example):**

Call this utility at the end of the Block's `decorate` function:

```javascript
import { processInlineIdSyntax } from '../../scripts/utils.js';

export default function decorate(block) {
  // ... other decoration logic ...

  // Enable Inline ID processing
  processInlineIdSyntax(block);
}
```

**Use Cases:**
*   **Text Block**: Allows marketers to set Anchor Points in long articles.
*   **Heading**: Set specific IDs for external link jumps.

---

## 🎨 5. Theming Engine & CSS Architecture Guideline

> This guide is consolidated from the development practices recorded in Story 2.1: Theming Engine & CSS Architecture (ASUS-42).

### 5.1 Overview
This section defines how to implement the Theming Engine and CSS Architecture to support dynamic switching for multiple brands (ROG, TUF, ASUS) while avoiding style conflicts.

### 5.2 Architecture Design

#### Core Principles
- **BEM Naming Convention**: Follow BEM (Block Element Modifier) architecture.
- **CSS Variable System**: Use CSS custom properties for dynamic theme switching.
- **Brand Isolation**: Ensure style isolation between brands via data attributes.

### 5.3 Implementation

#### 1. Data Attribute Binding

**Author Environment**: Bind to the `<body>` element.
```html
<body data-product="rog" data-mode="light">
```
*   **Reason**: Adding a Section in Author mode removes custom attributes from the main tag, so binding to body is mandatory.

**Non-Author Environment (Publish)**: Bind to the `<main>` element.
```html
<main data-product="rog" data-mode="light">
```

#### 2. Dialog Page Properties
Configurable in Page Properties within the Dialog:
- **Product Line**: Select the corresponding brand.
- **Color Group**: Specify the color set for that brand.

#### 3. CSS Variable Loading (Auto Loading)
CSS automatically matches when `data-product` and `data-mode` are set:

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

#### 4. Dynamic Color Update
Update attributes via JS for instant theme switching:
```javascript
// Dynamic switching
document.body.setAttribute('data-product', 'tuf');
document.body.setAttribute('data-mode', 'dark');
```

### 5.4 Acceptance Criteria
- [ ] Author Environment: Attributes bound to `<body>`.
- [ ] Publish Environment: Attributes bound to `<main>`.
- [ ] Page Properties support productline / color group configuration.
- [ ] Page colors update instantly without delay when attributes change dynamically.

---

## 🔍 6. EDS Block Development Guidelines

> This guide is consolidated from the development practices recorded in Story 2.2: EDS Model Implementation Practice (ASUS-43).

### 6.1 Global Component Naming Convention

**Components** - Global components extracted from business logic must follow strict naming conventions:
- Internal field names (name) for all global components must start with a lowercase `g`, followed by CamelCase.
- **Example:** `gBtnFont`, `gIconSize`, `gPaddingValue`

**Block & Component Label Naming Rules:**
- Must align with configuration item naming in the Spec document, including case.
- Ensure consistency between development and requirements documentation.

### 6.2 SCSS Convention

**Rule:** Developers should only work in `.scss` files. CSS files are auto-generated and should not be manually modified.

**Isolation Requirement:** To prevent style conflicts with the host environment, every SCSS file must be wrapped in an isolation namespace:
```scss
.l4-pdp {
  // Write your styles here
  .my-block { ... }
}
```

### 6.3 Fetching Data in Decorate Function

**Process:**
- Use the utility method `getBlockConfigs` in the `decorate` function to fetch data.
- Pass in default configuration (`DEFAULT_CONFIG`) and component name.
- Use `getFieldValue` to transform data format.

**Code Structure:**
```javascript
const blockData = getBlockConfigs(componentName, DEFAULT_CONFIG);
const transformedData = getFieldValue(blockData);
```

### 6.4 moveInstrumentation - DOM Structure Alignment

**Key Rule:** The generated DOM structure must strictly match the hierarchy defined in the AEM Dialog.

**Critical Steps:**
1.  Create a DOM structure that perfectly matches the AEM Dialog hierarchy.
2.  Call the `moveInstrumentation` function on the corresponding DOM element to transfer attributes.
3.  This ensures editing operations work in the Author environment.

**Example - Dialog Hierarchy:**
If the Dialog config shows:
```
├── Container
│   ├── Select
│   ├── Text
│   └── Reference
```

The default rendered HTML structure must be:
```html
<div data-aue-xxx...>
  <div data-aue-xxx></div>
  <div data-aue-xxx></div>
  <div data-aue-xxx></div>
</div>
```

**Important:** Generate new HTML following this exact structure and transfer all attributes using `moveInstrumentation`. Failure to do so will cause issues in the AEM authoring interface.

### 6.5 Mandatory Flag Field Settings (Container Nesting)

Flag fields must be embedded following fixed rules in two scenarios:

**Scenario A: Component Nested in Container (Non-repeating)**
*   **Condition**: Component nested in container, no loop needed.
*   **Implementation**: Add a hidden Flag field as the **last element** in the component model.
    ```json
    {
      "component": "text",
      "name": "L4TagNestedBlock",
      "value": "L4--nested-block--text-block",
      "hidden": true
    }
    ```

**Scenario B: Component Nested in Container (Multi-repeating)**
*   **Condition**: Component nested in container, multiple repetitions needed.
*   **Implementation**: When container fields form a repeatable list (`multi = true`), insert a hidden tag before **each repeatable field**:
    ```
    L4TagMulti-{name}
    ```

---

### 6.6 Button Style Implementation

When a component includes a button and requires both **Text Link Style & Button Style**:
*   **Rule**: The Button Style must support the exact same customization options as **ID 6 BTN**.
*   **Shared Component**: The CSS, JS, and Model Definition for Button Style have been centralized as a shared component in the `components/button` directory.
*   **Reference**: Please refer to **ID 1 (Text Block)** for implementation and usage details.

### 6.7 Common Pitfalls ⚠️
*   **Condition Logic**:
    *   ❌ **Don't**: Use nested fields (inside a Container) for `visible` condition logic.
    *   ✅ **Do**: Only use **first-level** JSON fields for condition logic.
*   **Special Characters (`#`)**:
    *   **Issue**: Text Components containing two `#` signs (e.g., `#000, #fff`) cause content to be cleared.
    *   **Workaround**: Temporarily remove `#`, use `000, fff` instead.


---

## ✅ 7. Daily Development Checklist

### 7.1 Core Implementation & Structure
- [ ] **DOM Structure**: HTML semantics are correct; class naming follows BEM or project standards.
- [ ] **Dialog Properties**:
    - [ ] **Tab Classification**: Separate **Basic** (Settings) and **Advanced** (Styling).
    - [ ] **Naming Consistency**: Property names align with design specs (e.g., `+alignment`, `+category`, `+bg_color`).
    - [ ] **Style Defaults**: All style-related params **must** have defaults in code. Dialog dropdowns should **not** be pre-selected; keep them unselected (Code-level default).
- [ ] **Dynamic Content**:
    - [ ] **Empty State**: If a field is empty (e.g., Title, Body, CTA), the element should be hidden and take no space.
    - [ ] **Show/Hide Logic**: If Dialog supports Toggle, ensure elements show/hide correctly. Hidden elements must use `display: none` (not `visibility: hidden`) to take no space.
    - [ ] **Multifield Limits**: Verify functionality if limits exist (e.g., max 6 Tabs).

### 7.2 Responsive Web Design (RWD)
- [ ] **Multi-device Adaptation**: Verify layout matches design specs on **Desktop**, **Tablet**, and **Mobile**.
    - [ ] **Desktop**: Default expanded or horizontal.
    - [ ] **Tablet**: Adaptive width, adjust column ratio if needed.
    - [ ] **Mobile**: Usually vertical stack; check padding/margin.
- [ ] **Device-specific Settings**: If specified (e.g., ID 5 Media Block), ensure different assets/params (size, align) can be set for D/T/M.

### 7.3 Style System & Theming
- [ ] **Product Line**:
    - [ ] Support fonts/border-radius for ROG / TUF / ProArt / ASUS lines.
- [ ] **Color Group**:
    - [ ] **Variant 1 (Dark Mode)**: Check text color/contrast on dark background.
    - [ ] **Variant 2 (Light Mode)**: Check text color on light background.
- [ ] **Typography**:
    - [ ] **Advanced Settings**: Verify font size, color, weight adjustments via Dialog (per Spec).

### 7.4 Alignment & Layout
- [ ] **Global Alignment**:
    - [ ] Verify alignment settings for D/T/M (e.g., Desktop Center, Mobile Left).
- [ ] **Container Compatibility**: If component can be placed in a Container (ex: **Container (ID 12)**):
    - [ ] Display is correct, no layout breakage.
    - [ ] Works correctly in **Mobile Stack** state.
    - [ ] Background color and Padding behavior are correct.

### 7.5 Interaction & Motion
- [ ] **Entrance Animation**:
    - [ ] **Scroll Trigger**: Triggered when scrolled into Viewport.
    - [ ] **Effect**: Slide Up + Fade In (or specified effect).
    - [ ] **Toggle**: Verify `+motion (on/off)` in Dialog controls animation.
- [ ] **Hover Effects**:
    - [ ] **Links/Buttons**: Correct style change on hover (e.g., underline, darker color).
    - [ ] **Interactive Elements**: Motion on hover for cards/menu items (e.g., Slide out).
- [ ] **Complex Interactions** (if applicable):
    - [ ] **Carousel/Tabs**:
        - [ ] Click switching works smoothly.
        - [ ] Swipe (Touch) support on Mobile.
        - [ ] Auto-play / Pause / Loop logic (Video or Carousel).
    - [ ] **Accordion**:
        - [ ] Expand/Collapse animation is smooth.
        - [ ] Icon state (Chevron/Plus/Minus) switches correctly.

### 7.6 Media & Links
- [ ] **Media Assets**:
    - [ ] **Images**: Support Upload; **Must** fill Alt Text (Accessibility).
    - [ ] **Videos**: Support Auto-play / Loop; ensure Muted behavior (Browser Policy).
    - [ ] **Lazy Loading**: Images/Videos default to Lazy Load unless LCP element.
- [ ] **CTA (Call to Action)**:
    - [ ] **Text Link v.s. Button**: Text Link vs Button styles switchable; Button type must match ID 5 customization capabilities.

### 7.7 Data & Accessibility
- [ ] **Accessibility (A11y)**:
    - [ ] **Semantic HTML**: Use correct tags (e.g., `<nav>`, `<button>`, `<article>`, `<ul>`).
    - [ ] **ARIA Roles**: Interactive components (Tabs, Accordion, Carousel) have correct ARIA attributes.
    - [ ] **Keyboard Nav**: Operable via keyboard (Tab, Enter, Space).
- [ ] **Analytics (Tracking)**:
    - [ ] Verify `data-track` attributes on main interactive elements (CTA, Tabs, Play) if required.

### 7.8 Validation & Code Quality
- [ ] **Verify Acceptance Criteria**: Confirm all User Story ACs are met.
- [ ] **AEM Author Page**:
    - [ ] Create test page in AEM Author.
    - [ ] Test WYSIWYG editor behavior.
    - [ ] Test all Dialog option combinations.
- [ ] **Programmatic Checklist**:
    - [ ] **Console Errors**: No red errors.
    - [ ] **Performance**: Check CLS (Layout Shift) and LCP.
    - [ ] **Linting**: Pass project ESLint / Stylelint checks (`npm run lint`).

---

