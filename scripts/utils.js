import { loadCSS, decorateBlock, loadBlock } from './aem.js';

export function isAuthorEnvironment() {
  if (window?.location?.origin?.includes('author')) {
    return true;
  }
  return false;
}

// Recursively collect all field names, excluding container component name values
export const getAllFieldNames = (fields) => {
  const names = [];
  function traverseFields(fieldArray, arr) {
    fieldArray.forEach((field) => {
      // Skip container components with multi=true (multi-row components need special handling)
      if (field.component === 'container' && field.multi) return;

      if (field.component === 'container' && Array.isArray(field.fields)) {
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

  let rows = [...block.children];

  if (blockName) {
    try {
      // Load field order from block definition
      const fieldOrder = await getBlockFieldOrder(blockName);

      // Use field order or fallback to default keys
      const finalFieldOrder = fieldOrder.length > 0 ? fieldOrder : Object.keys(defaults);

      if (finalFieldOrder.length > 0) {
        // Filter out multi-row data marked with L4TagMulti-
        rows = rows.filter((row) => !row?.innerHTML?.includes('L4TagMulti-'));
        rows.forEach((row, index) => {
          if (index < finalFieldOrder.length) {
            const cell = row.children[0];
            const fieldName = finalFieldOrder[index];

            // Process row if it has content or default value exists
            if (cell || config[fieldName]) {
              // Extract value from cell or use default
              let value = cell?.textContent.trim() || (config[fieldName] || '');
              let html = '';
              if (isAuthorEnvironment()) {
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
                const isNumeric = !Number.isNaN(numValue) && value !== '';

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
  return (key, type = 'text') => config?.[key]?.[type] || '';
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
 * Loads and decorates a section block (e.g., container-2cols).
 * @param {Element} section The section element
 * @param {string} name The section block name
 */
const loadSectionBlock = async (section, name) => {
  try {
    loadCSS(`${window.hlx.codeBasePath}/blocks/${name}/${name}.css`);
    const mod = await import(`${window.hlx.codeBasePath}/blocks/${name}/${name}.js`);
    if (mod.default) {
      await mod.default(section);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Failed to load section block ${name}`, error);
  }
};

/**
 * Loads and decorates all column section blocks within the main element.
 * @param {Element} main The main container element containing section blocks
 * @returns {Promise<void>} A promise that resolves when all column sections are loaded
 */
export const loadSectionBlockJs = async (main) => {
  // Load section blocks (sections with their own JS/CSS)
  const columnsSections = main.querySelectorAll('.section.container-2cols');
  await Promise.all([...columnsSections].map((section) => loadSectionBlock(section, 'container-2cols')));
};

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
export const nestBlockExecuteJs = (block) => {
  if (!block?.children?.length) return;
  const rows = [...block.children];
  // Clear all child elements to rebuild the structure
  block.innerHTML = '';
  // Define the prefix used to identify nested block markers
  const NESTED_BLOCK_PREFIX = 'L4--nested-block--';
  rows.forEach((row) => {
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
        loadBlock(row);
      } else {
        // If not a nested block, simply append the row back to the block
        block.appendChild(row);
      }
    }
  });
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
