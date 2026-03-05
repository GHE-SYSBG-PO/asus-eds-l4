import { decorateBlock, loadBlock } from './aem.js';

export function isAuthorUe() {
  return window?.top?.location?.href?.includes('@asustek/aem/universal-editor');
}

// Recursively collect all field names, excluding container component name values
export const getAllFieldNames = (fields) => {
  const names = [];
  function traverseFields(fieldArray, arr) {
    fieldArray.forEach((field) => {
      // Skip container components with multi=true (multi-row components need special handling)
      if (field.component === 'container' && field.multi) {
        arr.push(field.name);
      } else if (field.component === 'container' && Array.isArray(field.fields)) {
        // Recursively process container fields but exclude the container's own name
        traverseFields(field.fields, arr);
      } else if (field.component !== 'tab' && field.name) {
        // Add field name to result if it's not a tab component and has a name property
        arr.push(field.name);
      }
    });
  }
  traverseFields(fields, names);
  return names;
};

// Cache for block definition data to avoid repeated fetches
let blockDef = null;

/**
 * 從 blockDef 中動態提取指定容器的 select 字段及其有效值
 * @param {string} containerName - 容器名稱（如 'textItems1'）
 * @returns {Map<string, Set>} - {fieldName: Set<validValues>} 映射表
 */
const extractSelectFieldsMap = (containerName) => {
  const selectFieldsMap = new Map();

  if (!blockDef || !blockDef.length) {
    return selectFieldsMap;
  }

  // 找到 'line-info' 或其他相關 model
  const model = blockDef.find((item) => {
    if (!item.fields) return false;
    // 搜索該 model 是否包含指定的容器
    return item.fields.some((field) => field.name === containerName);
  });

  if (!model || !model.fields) {
    return selectFieldsMap;
  }

  // 找到容器字段定義
  const containerField = model.fields.find((field) => field.name === containerName);

  if (!containerField || !containerField.fields) {
    return selectFieldsMap;
  }

  // 遍歷容器內的所有字段，提取 select 字段的選項值
  containerField.fields.forEach((field) => {
    if (field.component === 'select' && field.options) {
      const validValues = new Set(field.options.map((opt) => opt.value));
      selectFieldsMap.set(field.name, validValues);
    }
  });

  return selectFieldsMap;
};

/**
 * Loads block definition JSON and extracts field order
 * @param {string} modelId - The ID of the model in the JSON
 * @returns {Promise<Array<string>>} - Array of field names in order
 */
export const getBlockFieldOrder = async (modelId) => {
  try {
    // Load block definition data if not already cached
    if (!blockDef) {
      const response = await fetch(`${window.hlx.codeBasePath}/component-models.json`);

      // Handle HTTP errors
      if (!response.ok) {
        // eslint-disable-next-line no-console
        console.warn(`没有找到ID： ${modelId}的Fields。`);
        return [];
      }
      // Parse and cache the JSON data
      blockDef = await response.json();
    }

    // Find the model with matching ID
    const model = blockDef.find((item) => item.id === modelId);

    // Extract field names if model and fields exist
    if (model && model.fields) {
      return getAllFieldNames(model.fields);
    }

    return [];
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(`Error loading block field order for ${modelId}:`, error);
    return [];
  }
};

/**
 * Parses configuration from a block element
 * @param {HTMLElement} block - The block element containing configuration rows
 * @param {Object} defaults - Default configuration object e.g.: Key: { html: '', text: '' }
 * @param {string} blockName - Optional block name (e.g., 'hot-products') to auto-load field order
 * @returns {Promise<Object>} - Parsed configuration object merged with defaults
 */
export const getBlockConfigs = async (block, defaults = {}, blockName = '') => {
  const config = { ...defaults };

  if (!block || !block.children || !block.children.length) {
    return config;
  }

  const rows = [...block.children];

  if (blockName) {
    try {
      // Load field order from block definition
      const fieldOrder = await getBlockFieldOrder(blockName);

      // Use field order or fallback to default keys
      const finalFieldOrder = fieldOrder.length > 0 ? fieldOrder : Object.keys(defaults);

      if (finalFieldOrder.length > 0) {
        rows.forEach((row, index) => {
          if (index < finalFieldOrder.length) {
            const cell = row.children[0];
            const fieldName = finalFieldOrder[index];

            // Process row if it has content or default value exists
            if (cell || config[fieldName]) {
              // Extract value from cell or use default
              let value = cell?.textContent.trim() || (config[fieldName] || '');
              let html = '';
              if (isAuthorUe()) {
                html = cell?.innerHTML.trim() || (config[fieldName] || '');
              } else {
                html = row?.innerHTML.trim() || (config[fieldName] || '');
              }

              // Handle image elements when text content is empty
              if (value === '') {
                const img = cell.querySelector('img');
                if (img && img.src) {
                  value = img.src;
                }
              }

              if (value !== '') {
                // Try to parse as number if it looks like a number
                const numValue = Number(value);
                const isNumeric = !Number.isNaN(numValue) && String(numValue) === value;

                config[fieldName] = {
                  html,
                  text: isNumeric ? numValue : value,
                };
              }
            }
          }
        });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn(`Error processing block configs for ${blockName}:`, error);
    }
  }

  return config;
};

/**
 * Retrieves field value from configuration object
 * @param {Object} obj - Configuration object containing field data
 * @returns {Function} - Function that takes key and type parameters to retrieve specific field values
 *
 * @example
 * const config = { title: { text: 'Hello', html: '<p>Hello</p>' } };
 * const getValue = getFieldValue(config);
 * console.log(getValue('title')); // 'Hello'
 * console.log(getValue('title', 'html')); // '<p>Hello</p>'
 */
export const getFieldValue = (obj) => {
  const config = obj || {};
  return (key, type = 'text') => (config?.[key]?.[type] === undefined ? '' : config?.[key]?.[type]);
};

/**
 * Promise utility function that resolves or rejects based on a condition
 *
 * @param {*} condition - The condition to evaluate
 * @param {*} successValue - Value to resolve with when condition is truthy (default: undefined)
 * @param {*} failureValue - Value to reject with when condition is falsy (default: undefined)
 * @returns {Promise<*>} - Resolves with successValue when condition is truthy, rejects with failureValue otherwise
 *
 * @example
 * // Basic usage
 * handleDecide(user.isAuthenticated)
 *   .then(() => console.log('User is authenticated'))
 *   .catch(() => console.log('User is not authenticated'));
 *
 * @example
 * // With custom values
 * handleDecide(user.age >= 18, 'Access granted', 'Access denied')
 *   .then(message => console.log(message))
 *   .catch(message => console.error(message));
 *
 * @example
 * // Chaining with other promises
 * handleDecide(apiStatus === 'online')
 *   .then(() => fetchData())
 *   .catch(() => showOfflineMessage());
 */
export const handleDecide = (
  condition,
  successValue = undefined,
  failureValue = undefined,
) => new Promise((resolve, reject) => {
  // Resolve with successValue (or condition itself if successValue is undefined)
  if (condition) {
    resolve(successValue ?? condition);
  } else {
    reject(failureValue ?? condition);
  }
});

/**
 * Handles nested block execution for 'block'.js files.
 * @param {HTMLElement} block - The parent block element containing nested blocks.
 * @returns {void}
 *
 * @description
 * This function specifically handles scenarios where a block contains other blocks.
 * It identifies and properly initializes these nested sub-blocks.
 *
 * Key features:
 * - Identifies nested block markers starting with 'L4--nested-block--'.
 * - Adds appropriate CSS classes to nested blocks and executes initialization.
 * - Preserves the original structure of non-nested rows.
 */
export const nestBlockExecuteJs = async (block, clear = true) => {
  if (!block?.children?.length) return;
  const rows = [...block.children];
  // Clear all child elements to rebuild the structure
  if (clear) {
    block.innerHTML = '';
  }
  // Define the prefix used to identify nested block markers
  const NESTED_BLOCK_PREFIX = 'L4--nested-block--';
  // eslint-disable-next-line no-restricted-syntax
  for (const row of rows) {
    // Only process rows with two or more child elements (potential nested blocks)
    if (row.children.length >= 2) {
      const childElements = [...row.children];
      const blockName = childElements[childElements.length - 1].textContent.trim();
      // Check if the row is a nested block marker
      if (blockName.startsWith(NESTED_BLOCK_PREFIX)) {
        // <div> <div>1</div> <div>2</div> </div>  --->  <div> <div><div>1</div></div> <div><div>2</div></div> </div>
        childElements.forEach((element) => {
          const innerDiv = document.createElement('div');
          innerDiv.innerHTML = element.innerHTML; // Preserve original HTML content
          element.innerHTML = ''; // Clear the original element
          element.appendChild(innerDiv); // Append the new div
        });

        // Add the block class to the row
        row.classList.add(blockName.substring(NESTED_BLOCK_PREFIX.length));

        const wrapperDiv = document.createElement('div');
        wrapperDiv.appendChild(row);
        // Decorate the block for initialization
        decorateBlock(row);
        block.appendChild(wrapperDiv);
        // Load and execute the nested block's JavaScript
        // eslint-disable-next-line no-await-in-loop
        await loadBlock(row);
      } else {
        // If not a nested block, simply append the row back to the block
        block.appendChild(row);
      }
    }
  }
};

/**
 * Parses HTML strings containing "L4TagMulti-" markers and converts them into structured data.
 *
 * @param {HTMLElement} htmlString - An HTML element containing multiple lines of data (typically a container with multiple <p> tags).
 * @returns {Array<Object>} - Returns an array where each element is an object. The key is the extracted field name, and the value contains the corresponding HTML and text content.
 *
 * @description
 * The primary purpose of this function is to parse HTML and extract content grouped by "L4TagMulti-" markers.
 * Each "L4TagMulti-" marker indicates the start of a new field, and subsequent content is collected under that field until the next marker is encountered.
 * The function ultimately returns a structured array for further processing.
 *
 * Example Input:
 * <div>
 *   <p><p>L4TagMulti-title</p></p>
 *   <p><p>This is the title content</p></p>
 *   <p><p>L4TagMulti-description</p></p>
 *   <p><p>This is the description content</p></p>
 * </div>
 *
 * Example Output:
 * [
 *   { title: { html: '<p>This is the title content</p>', text: 'This is the title content' } },
 *   { description: { html: '<p>This is the description content</p>', text: 'This is the description content' } }
 * ]
 */
export const parseL4TagMulti = (htmlString) => {
  const paragraphs = htmlString.querySelectorAll(':scope p');
  const result = [];
  let currentKey = null;
  let currentHtml = '';
  let currentText = '';
  const tag = 'L4TagMulti-';

  paragraphs.forEach((p) => {
    const textContent = p.textContent.trim(); // Get the plain text content of the current <p> tag

    // Check if it's a new field marker (starting with "L4TagMulti-")
    if (textContent.startsWith(tag)) {
      if (currentKey) {
        result.push({
          [currentKey]: {
            html: currentHtml.trim(), // Save the HTML content of the current field
            text: currentText.trim(), // Save the plain text content of the current field
          },
        });
      }

      currentKey = textContent.replace(tag, '');
      currentHtml = ''; // Reset HTML content
      currentText = ''; // Reset text content
    } else if (currentKey) {
      const img = p.querySelector('img');
      if (img && img.src) {
        currentText += img.src;
      }
      currentHtml += p.outerHTML;
      currentText += textContent;
    }
  });

  // Handle the last field (since it won't be automatically saved after the loop ends)
  if (currentKey) {
    result.push({
      [currentKey]: {
        html: currentHtml.trim(),
        text: currentText.trim(),
      },
    });
  }

  const arr = [];
  for (let index = 0; index < result.length; index += 1) {
    Object.entries(result[index]).forEach(([element]) => {
      // If the result array is empty, or the last object does not contain the current field name, create a new object
      if (!arr[arr.length - 1]) {
        arr.push({
          [element]: result[index][element],
        });
      } else if (!arr[arr.length - 1]?.[element]) {
        arr[arr.length - 1][element] = result[index][element];
      } else {
        arr.push({
          [element]: result[index][element],
        });
      }
    });
  }

  return arr;
};

/**
 * Parses block elements containing "L4TagMulti-" markers and extracts multi-line configuration data.
 *
 * @param {HTMLElement} block - A block element containing multiple child elements, each potentially containing "L4TagMulti-" markers.
 * @returns {Array<Array<Object>>} - Returns a two-dimensional array where each sub-array corresponds to the parsed result of a child element containing "L4TagMulti-" markers.
 *
 * @description
 * This function traverses all child elements of the provided block element, filters out those containing "L4TagMulti-" markers,
 * parses their content using the [parseL4TagMulti] function, and aggregates the results into an array.
 *
 * Main steps:
 * 1. Traverse all child elements of the block.
 * 2. Check if the `outerHTML` of each child element contains the "L4TagMulti-" marker.
 * 3. If it does, call the [parseL4TagMulti] function to parse the content of that child element.
 * 4. Push the parsed result into the result array.
 * 5. Return the final aggregated result array.
 *
 * Example Input:
 * <div>
 *   <div><p><p>L4TagMulti-title</p></p><p><p>This is the title content</p></p></div>
 *   <div><p><p>L4TagMulti-description</p></p><p><p>This is the description content</p></p></div>
 * </div>
 *
 * Example Output:
 * [
 *   [
 *     { title: { html: '<p>This is the title content</p>', text: 'This is the title content' } }
 *   ],
 *   [
 *     { description: { html: '<p>This is the description content</p>', text: 'This is the description content' } }
 *   ]
 * ]
 */
export const getBlockRepeatConfigs = (block) => {
  const arr = [];

  // Convert all child elements of the block into an array and iterate over them
  [...block.children].forEach((item) => {
    // Check if the `outerHTML` of the current child element contains the "L4TagMulti-" marker
    if (item.outerHTML.includes('L4TagMulti-')) {
      // If it does, call the [parseL4TagMulti] function to parse the content of this child element
      arr.push(parseL4TagMulti(item));
    }
  });

  return arr;
};

/**
 * Processes inline //[id=VALUE]content// marker syntax within an HTML container.
 *
 * Syntax:
 *   //[id=VALUE]content//
 *   - Delimited by opening and closing //
 *   - [id=VALUE] sets the id attribute on the parent element
 *   - content is the text that remains after processing
 *
 * Example:
 *   <sup>//[id=100]some link//</sup>  →  <sup id="100">some link</sup>
 *
 * @param {HTMLElement} container - The container element to process
 */
export const processInlineIdSyntax = (container) => {
  if (!container) return;

  const DETECT = /\/\/\[id=/;
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  let node = walker.nextNode();

  while (node) {
    if (DETECT.test(node.textContent)) {
      textNodes.push(node);
    }
    node = walker.nextNode();
  }

  const pattern = /\/\/\[id=([^\]]+)\]([\s\S]*?)\/\//g;

  textNodes.forEach((textNode) => {
    const parent = textNode.parentElement;
    const originalText = textNode.textContent;
    let newText = originalText;

    pattern.lastIndex = 0;
    let match = pattern.exec(originalText);
    while (match !== null) {
      const [fullMatch, id, content] = match;
      parent.id = id;
      // Use a function to avoid $ being interpreted as a replacement pattern
      newText = newText.replace(fullMatch, () => content);
      match = pattern.exec(originalText);
    }

    if (newText !== originalText) {
      textNode.textContent = newText;
    }
  });
};

/**
 * Get current product line from DOM
 * @returns {string} Product line (asus/proart/rog/tuf)
 */
export const getProductLine = () => document.querySelector('.l4-pdp')?.dataset.product || 'asus';

/**
 * Get current theme mode from DOM
 * @returns {string} Theme mode (light/dark)
 */
export const getThemeMode = () => document.querySelector('.l4-pdp')?.dataset.mode || 'light';

/**
 * Sets up animation logic for elements with the class `.g-block-animation`.
 * Observes when these elements enter the viewport and applies animations to their child elements.
 * @param {HTMLElement} block - The parent block element containing animated elements.
 */
export const setupAnimation = (block) => {
  const containers = block.querySelectorAll('.g-block-animation');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        let delay = 100;
        const spans = entry.target.querySelectorAll(':scope > span');
        spans.forEach((span) => {
          delay += 100;
          setTimeout(() => {
            if (span?.style) {
              span.style.opacity = 1;
              span.style.transform = 'translateZ(0px) translateY(0px)';
            }
          }, delay);
        });
        const imgs = entry.target.querySelectorAll(':scope > img');
        imgs.forEach((img) => {
          delay += 100;
          setTimeout(() => {
            if (img?.style) {
              img.style.opacity = 1;
              img.style.transform = 'translateZ(0px) translateY(0px)';
            }
          }, delay);
        });
        const divs = entry.target.querySelectorAll(':scope > div');
        divs.forEach((div) => {
          delay += 100;
          setTimeout(() => {
            if (div?.style) {
              div.style.opacity = 1;
              div.style.transform = 'translateZ(0px) translateY(0px)';
            }
          }, delay);
        });
      }
    });
  });

  containers.forEach((item) => {
    observer.observe(item);
  });
};

/**
 * Handles the execution of animations based on document readiness.
 * Ensures animations are triggered only after the document is fully loaded.
 * @param {HTMLElement} block - The parent block element containing animated elements.
 */
export const handleMotion = (block) => {
  // Check if the document is still loading
  if (document.readyState === 'loading') {
    // If still loading, wait for the DOMContentLoaded event
    block.addEventListener('DOMContentLoaded', () => {
      setupAnimation(block);
    });
  } else {
    // If already loaded, execute the animation setup immediately
    setTimeout(() => {
      setupAnimation(block);
    }, 0);
  }
};

/**
 * 解析基於 data-aue-prop 屬性的多字段結構（新格式）
 * 例如：data-aue-prop="textItems1/0/titleRichtext" 表示 textItems1[0].titleRichtext
 * 也支援讀取沒有 data-aue-prop 但位於多字段項中的 select 字段（動態從 blockDef 讀取選項）
 * @param {HTMLElement} block - 包含多個子元素的 block 元素
 * @param {string} containerName - 多字段容器的名稱（如 'textItems1'）
 * @returns {Array<Object>} - 返回解析後的多字段數據數組
 */
export const getBlockRepeatConfigsByDataAueProps = (block, containerName) => {
  // 存储多字段数据的对象，key 是索引，value 是该项的字段对象
  const itemsMap = {};

  // 動態獲取該容器的 select 字段及其有效值
  const selectFieldsMap = extractSelectFieldsMap(containerName);

  // DEBUG：打印 select field map
  // eslint-disable-next-line no-console
  console.log(`[getBlockRepeatConfigsByDataAueProps] Container: ${containerName}, selectFieldsMap:`, selectFieldsMap);

  // 策略 1：優先讀取所有 data-aue-prop 元素並按索引分組
  const auePropElements = block.querySelectorAll('[data-aue-prop]');

  // eslint-disable-next-line no-console
  console.log(`[getBlockRepeatConfigsByDataAueProps] Found ${auePropElements.length} data-aue-prop elements`);

  // DEBUG：打印所有 data-aue-prop 值的模式
  const auePropValues = [...auePropElements].map((el) => el.getAttribute('data-aue-prop'));
  // eslint-disable-next-line no-console
  console.log('[getBlockRepeatConfigsByDataAueProps] Sample data-aue-prop values:', auePropValues.slice(0, 10));

  auePropElements.forEach((element) => {
    const aueProp = element.getAttribute('data-aue-prop');
    const propMatch = aueProp.match(new RegExp(`${containerName}/(\\d+)/(\\w+)$`));

    if (propMatch) {
      const [, itemIndex, fieldName] = propMatch;
      const index = parseInt(itemIndex, 10);

      // 初始化該項
      if (!itemsMap[index]) {
        itemsMap[index] = {};
      }

      const html = element.innerHTML.trim();
      const text = element.textContent.trim();

      // 跳過占位符值（L4TagMulti-*）
      if (!text.startsWith('L4TagMulti-')) {
        itemsMap[index][fieldName] = {
          html,
          text,
        };

        // eslint-disable-next-line no-console
        console.log(`  → Item ${index}.${fieldName}: "${text.substring(0, 50)}"`);
      }
    }
  });

  // 策略 2：讀取有 L4TagMulti-* 占位符的 select 字段
  // 對每個有 L4TagMulti-* 標籤的占位符，查找其後面緊跟著的無屬性 <p> 標籤
  const placeholderElements = block.querySelectorAll('[data-aue-prop*="L4TagMulti-"]');

  // eslint-disable-next-line no-console
  console.log(`[getBlockRepeatConfigsByDataAueProps] Found ${placeholderElements.length} L4TagMulti- placeholder elements`);

  placeholderElements.forEach((placeholder) => {
    const aueProp = placeholder.getAttribute('data-aue-prop');

    // 從 placeholder 的 data-aue-prop 解析出 item index 和字段名
    // 例如：textItems1/1/L4TagMulti-side → itemIndex=1, fieldName=side
    const match = aueProp.match(new RegExp(`${containerName}/(\\d+)/L4TagMulti-(\\w+)$`));

    if (!match) return;

    const [, itemIndex, fieldName] = match;
    const index = parseInt(itemIndex, 10);

    // 初始化該項
    if (!itemsMap[index]) {
      itemsMap[index] = {};
    }

    // 查找這個 placeholder 後面緊跟著的下一個無屬性的 <p> 標籤
    let nextElement = placeholder.nextElementSibling;
    while (nextElement) {
      // 如果是 <p> 標籤且沒有 data-aue-prop，就是實際值
      if (nextElement.tagName === 'P' && !nextElement.hasAttribute('data-aue-prop')) {
        const pText = nextElement.textContent.trim();

        // 跳過分隔符
        if (pText && pText !== 'hr' && pText !== '<hr>') {
          itemsMap[index][fieldName] = {
            html: nextElement.outerHTML,
            text: pText,
          };
          // eslint-disable-next-line no-console
          console.log(`  → Item ${index}.${fieldName} (from placeholder follow): "${pText}"`);
        }
        break;
      }

      // 如果遇到有 data-aue-prop 的元素且屬於不同 item，停止查找
      if (nextElement.hasAttribute('data-aue-prop')) {
        const nextAueProp = nextElement.getAttribute('data-aue-prop');
        const nextIndexMatch = nextAueProp.match(new RegExp(`${containerName}/(\\d+)/`));
        if (nextIndexMatch && parseInt(nextIndexMatch[1], 10) !== index) {
          break;
        }
      }

      nextElement = nextElement.nextElementSibling;
    }
  });

  // 策略 3：處理沒有 L4TagMulti- 占位符的 select 字段
  // （Item 沒有被編輯過時，select 值直接作為無屬性 <p> 出現在容器開頭）
  // 遍歷所有包含該容器的 data-aue-prop 元素
  const containerStartElements = block.querySelectorAll(`[data-aue-prop^="${containerName}/"]`);
  const itemIndexSetFromProps = new Set();

  containerStartElements.forEach((el) => {
    const aueProp = el.getAttribute('data-aue-prop');
    const indexMatch = aueProp.match(new RegExp(`${containerName}/(\\d+)/`));
    if (indexMatch) {
      itemIndexSetFromProps.add(parseInt(indexMatch[1], 10));
    }
  });

  // eslint-disable-next-line no-console
  console.log('[getBlockRepeatConfigsByDataAueProps] Item indices from data-aue-prop:', itemIndexSetFromProps);

  // 對每個 item index，查找其容器並掃描開頭的 select 值
  itemIndexSetFromProps.forEach((itemIndex) => {
    // 初始化該項
    if (!itemsMap[itemIndex]) {
      itemsMap[itemIndex] = {};
    }

    // 找到該 item 的第一個 data-aue-prop 元素
    const firstItemElement = block.querySelector(`[data-aue-prop^="${containerName}/${itemIndex}/"]`);
    if (!firstItemElement) return;

    // 向上找到包含這個 item 所有元素的容器（通常是 <div>）
    let container = firstItemElement.parentElement;
    while (container && !container.classList.contains('line-info')) {
      // 檢查容器內是否所有該 item 的元素都被包含
      const itemElements = container.querySelectorAll(`[data-aue-prop^="${containerName}/${itemIndex}/"]`);
      if (itemElements.length > 0) {
        break;
      }
      container = container.parentElement;
    }

    if (!container) return;

    // eslint-disable-next-line no-console
    console.log(`  → Scanning Item ${itemIndex} container for orphan select values`);

    // 掃描容器內的所有直接子 <p> 標籤（沒有 data-aue-prop 的）
    const orphanParagraphs = container.querySelectorAll(':scope > p');
    orphanParagraphs.forEach((p) => {
      if (!p.hasAttribute('data-aue-prop')) {
        const pText = p.textContent.trim();

        // 跳過分隔符
        if (!pText || pText === 'hr' || pText === '<hr>') return;

        // 遍歷 select 字段映射表，檢查這個值是否屬於某個 select 字段
        selectFieldsMap.forEach((validValues, fieldName) => {
          // 如果值匹配且該字段還未被賦值，就存儲
          if (validValues.has(pText) && !itemsMap[itemIndex][fieldName]) {
            itemsMap[itemIndex][fieldName] = {
              html: p.outerHTML,
              text: pText,
            };
            // eslint-disable-next-line no-console
            console.log(`  → Item ${itemIndex}.${fieldName} (from orphan <p>): "${pText}"`);
          }
        });
      }
    });
  });

  // eslint-disable-next-line no-console
  console.log('[getBlockRepeatConfigsByDataAueProps] Final itemsMap:', itemsMap);

  // 將對象轉換為數組（保留順序）
  const sortedIndices = Object.keys(itemsMap).map(Number).sort((a, b) => a - b);
  return sortedIndices.map((index) => itemsMap[index]);
};

/**
 * 從 block 中手動解析 Advanced 設置值（沒有 data-aue-prop 的欄位）
 * @param {HTMLElement} block - 區塊元素
 * @param {Map} selectFieldsMap - Advanced 容器的 select 欄位映射表
 * @param {Array} colorFieldOrder - 顏色欄位的優先順序
 * @returns {Object} 解析後的 Advanced 值
 */
export const parseAdvancedFieldsFromBlock = (block, selectFieldsMap, colorFieldOrder = []) => {
  const children = [...block.children];
  const advancedFields = {};

  // DEBUG: Log available select fields
  // eslint-disable-next-line no-console
  console.log('Available select fields from blockDef:', Array.from(selectFieldsMap.keys()));

  // 找出沒有 data-aue-prop 但內容不為空的 div
  const candidateElements = children.filter((child) => {
    const hasDataAue = child.querySelector('[data-aue-prop]');
    const hasContent = child.textContent.trim();
    const isEmptyDiv = !hasContent || hasContent === '';
    return hasContent && !hasDataAue && !isEmptyDiv;
  });

  // DEBUG: Log found candidates
  // eslint-disable-next-line no-console
  console.log('Advanced Fields Candidates:', candidateElements.map((el) => el.textContent.trim()));

  // 先處理 select 欄位，再處理顏色欄位
  const selectValues = [];
  const colorValues = [];

  candidateElements.forEach((element) => {
    let value = element.textContent.trim();

    // 特殊處理：如果是 button 連結（顏色欄位），提取 href 的值
    const buttonLink = element.querySelector('a.button');
    if (buttonLink) {
      value = buttonLink.getAttribute('href') || buttonLink.getAttribute('title') || value;
      // 移除 # 符號如果存在
      if (value.startsWith('#')) {
        value = value.substring(1);
      }
    }

    // 檢查是否為 select 欄位的值
    let isSelectValue = false;
    selectFieldsMap.forEach((validValues) => {
      if (validValues.has(value)) {
        isSelectValue = true;
      }
    });

    if (isSelectValue) {
      selectValues.push({
        value,
        element,
      });
    } else {
      // 檢查是否為顏色格式（hex, rgb, 或顏色名稱）
      const isColorValue = /^#?[0-9a-fA-F]{3,6}$|^rgb|^hsl|^[a-z]+$/i.test(value) || buttonLink;
      if (isColorValue) {
        colorValues.push({
          value,
          element,
        });
      }
    }
  });

  // 按照 selectFieldsMap 的順序處理 select 欄位
  const selectFieldNames = Array.from(selectFieldsMap.keys());
  let selectIndex = 0;

  selectValues.forEach(({ value, element }) => {
    // 找到對應的欄位名稱
    let matchedFieldName = null;

    // 從當前索引開始尋找匹配的欄位
    for (let i = selectIndex; i < selectFieldNames.length; i += 1) {
      const fieldName = selectFieldNames[i];
      if (selectFieldsMap.get(fieldName).has(value) && !advancedFields[fieldName]) {
        matchedFieldName = fieldName;
        selectIndex = i + 1; // 更新索引到下一個欄位
        break;
      }
    }

    // 如果沒找到，從頭再找一遍
    if (!matchedFieldName) {
      for (let i = 0; i < selectIndex; i += 1) {
        const fieldName = selectFieldNames[i];
        if (selectFieldsMap.get(fieldName).has(value) && !advancedFields[fieldName]) {
          matchedFieldName = fieldName;
          break;
        }
      }
    }

    if (matchedFieldName) {
      advancedFields[matchedFieldName] = {
        text: value,
        html: element.innerHTML.trim(),
      };

      // DEBUG: Log matched values
      // eslint-disable-next-line no-console
      console.log(`Matched ${matchedFieldName}: ${value}`);
    }
  });

  // 按照 colorFieldOrder 順序處理顏色欄位
  colorValues.forEach(({ value, element }, index) => {
    if (index < colorFieldOrder.length) {
      const colorFieldName = colorFieldOrder[index];
      if (!advancedFields[colorFieldName]) {
        advancedFields[colorFieldName] = {
          text: value,
          html: element.innerHTML.trim(),
        };

        // DEBUG: Log color values
        // eslint-disable-next-line no-console
        console.log(`Assigned color ${colorFieldName}: ${value}`);
      }
    }
  });

  return advancedFields;
};
