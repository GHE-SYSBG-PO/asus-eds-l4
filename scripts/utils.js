import { loadCSS, decorateBlock, loadBlock } from './aem.js';

// 递归循环获取所有字段名称，不包括component为container的组件name值
export const getAllFieldNames = (fields) => {
  const names = [];
  function traverseFields(fieldArray, arr) {
    fieldArray.forEach((field) => {
      // 如果当前字段是container组件、"multi"为true是说明是多行的组件，需要用其他方式去处理
      if (field.component === 'container' && field.multi) return;
      if (field.component === 'container' && Array.isArray(field.fields)) {
        // 如果当前字段是container组件且有fields属性，则递归处理其子字段
        // 但不添加container本身的name值
        traverseFields(field.fields, arr);
      } else if (field.component !== 'tab' && field.name) {
        // 如果不是container组件，且有name属性，则添加到结果数组中
        arr.push(field.name);
      }
    });
  }
  traverseFields(fields, names);
  return names;
};

// 读取JSON数据
let blockDef = null;

/**
 * Loads block definition JSON and extracts field order
 * @param {string} modelId  - json中models的id
 * @returns {Promise<Array<string>>} - Array of field names in order
 */
export const getBlockFieldOrder = async (modelId) => {
  try {
    if (!blockDef) {
      const response = await fetch(`${window.hlx.codeBasePath}/component-models.json`);
      if (!response.ok) {
        // eslint-disable-next-line no-console
        console.warn(`没有找到ID： ${modelId}的Fields。`);
        return [];
      }
      // 读取JSON数据
      blockDef = await response.json();
    }
    // 找到id相同的model
    const model = blockDef.find((item) => item.id === modelId);
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
 * @param {Object} defaults - Default configuration object 例如： Key: { html: '', text: '' }
 * @param {string} blockName - Optional block name (e.g., 'hot-products') to auto-load field order
 * @returns {Promise<Object>} - Parsed configuration object merged with defaults
 */
export const getBlockConfigs = async (block, defaults = {}, blockName = '') => {
  const config = { ...defaults };

  if (!block || !block.children || !block.children.length) {
    return config;
  }

  let rows = [...block.children];
  // console.log('rows', rows)

  if (blockName) {
    // Universal Editor format - load field order and map by position
    const fieldOrder = await getBlockFieldOrder(blockName);

    // Fallback to defaults keys if JSON fetch failed (e.g., on author instance)
    const finalFieldOrder = fieldOrder.length > 0 ? fieldOrder : Object.keys(defaults);
    // console.log('finalFieldOrder', finalFieldOrder)
    if (finalFieldOrder.length > 0) {
      // L4TagMulti-有该标识，说明row中是多行数据，过滤掉
      rows = rows.filter((row) => !row?.innerHTML?.includes('L4TagMulti-'));
      rows.forEach((row, index) => {
        if (index < finalFieldOrder.length) {
          const cell = row.children[0];
          // 如果这行是非空值或者有默认值defaults有传默认值
          if (cell || config[finalFieldOrder[index]]) {
            const fieldName = finalFieldOrder[index];
            // 拿user输入的值。没有时，用配置的默认值
            console.log(row?.innerHTML.trim())
            let value = cell?.textContent.trim() || (config[fieldName] || '');
            const html = row?.innerHTML.trim() || (config[fieldName] || '');
            // If text content is empty, check for image/picture elements
            if (value === '') {
              const img = cell.querySelector('img');
              if (img && img.src) {
                value = img.src;
              }
            }

            if (value !== '') {
              // Try to parse as number if it looks like a number
              const numValue = Number(value);
              if (!Number.isNaN(numValue) && value !== '') {
                config[fieldName] = {
                  html,
                  text: numValue,
                };
              } else {
                config[fieldName] = {
                  html,
                  text: value,
                };
              }
            }
          }
        }
      });
    }
  }

  return config;
};

/**
 * 通过配置对象获取值
 * @param {*} obj 配置对象
 * @returns 返回对应字段的值
 */
export const getFieldValue = (obj) => {
  const config = obj || {};
  return (key, type = 'text') => config?.[key]?.[type] || '';
};

/**
 * 根据条件决定是否执行后续操作的 Promise 工具函数
 *
 * @param {*} condition - 需要判断的条件值
 * @param {*} successValue - 条件为真时 resolve 的值，默认为 undefined
 * @param {*} failureValue - 条件为假时 reject 的值，默认为 undefined
 * @returns {Promise<*>} - 当条件为真时 resolve，否则 reject
 *
 * @example
 * // 基本用法
 * handleDecide(someCondition)
 *   .then(() => console.log('条件为真'))
 *   .catch(() => console.log('条件为假'));
 *
 * @example
 * // 传递自定义值
 * handleDecide(userIsLoggedIn, 'Welcome!', 'Please login')
 *   .then(msg => console.log(msg))
 *   .catch(msg => console.error(msg));
 */
export const handleDecide = (
  condition,
  successValue = undefined,
  failureValue = undefined,
) => new Promise((resolve, reject) => {
  // 根据条件真假分别执行 resolve 或 reject
  if (condition) {
    resolve(successValue || condition); // 条件为真，执行成功分支
  } else {
    reject(failureValue || condition); // 条件为假，执行失败分支
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
 * 处理嵌套block执行‘block’.js文件
 * @param {HTMLElement} block - 包含嵌套block的父级block元素
 * @returns {void}
 *
 * @description
 * 该函数专门处理block嵌套的场景，当一个block内部包含其他block时，
 * 会识别并正确初始化这些嵌套的子block。
 *
 * 主要功能：
 * - 识别以 'L4--nested-block--' 开头的嵌套区块标记
 * - 为嵌套区块添加相应样式类并执行初始化
 * - 保持非嵌套行的原始结构
 */
export const nestBlockExecuteJs = (block) => {
  if (!block?.children?.length) return;
  const rows = [...block.children];
  // 清空所有子元素
  block.innerHTML = '';
  // 标识
  const tag = 'L4--nested-block--';
  rows.forEach((row) => {
    // 指的那些有2个div以上的处理，但是这种情况可能是block套block
    if (row.children.length >= 2) {
      const childElements = [...row.children];
      const blockName = childElements[childElements.length - 1].textContent.trim();
      // 判断是否为嵌套blocl标记
      if (blockName.startsWith('L4--nested-block--')) {
        // eslint-disable-next-line max-len
        // 把<div> <div>1</div> <div>2</div> </div>转为<div> <div><div>1</div></div> <div><div>2</div></div> </div>
        childElements.forEach((element) => {
          const html = element.innerHTML;
          const div = document.createElement('div');
          div.append(html);
          element.append(div);
        });

        // 给row添加block的类
        row.classList.add(blockName.substring(tag.length));

        const div = document.createElement('div');
        div.appendChild(row);
        // 定义block
        decorateBlock(row);
        block.appendChild(div);
        // 处理block套block的js执行
        loadBlock(row);
      } else {
        // 处理单子元素的行，直接添加回去
        block.appendChild(row);
      }
    }
  });
};

/**
 * 解析包含 "L4TagMulti-" 标记的 HTML 字符串，将其转换为结构化数据。
 *
 * @param {HTMLElement} htmlString - 包含多行数据的 HTML 元素（通常是包含多个 <p> 标签的容器）
 * @returns {Array<Object>} - 返回一个数组，每个元素是一个对象，键为提取的字段名，值为对应的 HTML 和文本内容
 *
 * @description
 * 该函数的主要作用是从 HTML 中解析出以 "L4TagMulti-" 开头的标记，并将这些标记后的内容分组。
 * 每个 "L4TagMulti-" 标记表示一个新的字段开始，后续的内容会被收集到该字段下，直到遇到下一个标记。
 * 最终返回一个结构化的数组，方便后续处理。
 *
 * 示例输入：
 * <div>
 *   <p><p>L4TagMulti-title</p></p>
 *   <p><p>这是标题内容</p></p>
 *   <p><p>L4TagMulti-description</p></p>
 *   <p><p>这是描述内容</p></p>
 * </div>
 *
 * 示例输出：
 * [
 *   { title: { html: '<p>这是标题内容</p>', text: '这是标题内容' } },
 *   { description: { html: '<p>这是描述内容</p>', text: '这是描述内容' } }
 * ]
 */
export const parseL4TagMulti = (htmlString) => {
  // 获取所有符合条件的 <p> 标签（即嵌套在两层 <p> 中的元素）
  const paragraphs = htmlString.querySelectorAll(':scope > p');

  // 存储最终解析结果的数组
  const result = [];

  // 当前正在处理的字段名（key）
  let currentKey = null;

  // 当前字段对应的 HTML 内容和纯文本内容
  let currentHtml = '';
  let currentText = '';

  // 遍历所有 <p> 标签，逐个解析内容
  paragraphs.forEach((p) => {
    const textContent = p.textContent.trim(); // 获取当前 <p> 标签的纯文本内容

    // 判断是否是新的字段标记（以 "L4TagMulti-" 开头）
    if (textContent.startsWith('L4TagMulti-')) {
      // 如果当前已有字段（currentKey 不为空），说明上一个字段已结束，需要保存到结果中
      if (currentKey) {
        result.push({
          [currentKey]: {
            html: currentHtml.trim(), // 保存当前字段的 HTML 内容
            text: currentText.trim(), // 保存当前字段的纯文本内容
          },
        });
      }

      // 提取新的字段名（去掉 "L4TagMulti-" 前缀）
      currentKey = textContent.replace('L4TagMulti-', '');
      currentHtml = ''; // 重置 HTML 内容
      currentText = ''; // 重置文本内容
    } else if (currentKey) {
      // 如果当前已有字段名，则继续收集该字段的内容

      // 检查是否有图片元素，如果有则提取图片的 src 地址作为文本内容的一部分
      const img = p.querySelector('img');
      if (img && img.src) {
        currentText += img.src;
      }

      // 将当前 <p> 标签的完整 HTML 和文本内容追加到当前字段中
      currentHtml += p.outerHTML;
      currentText += textContent;
    }
  });

  // 处理最后一个字段（因为循环结束后不会自动保存最后一个字段）
  if (currentKey) {
    result.push({
      [currentKey]: {
        html: currentHtml.trim(),
        text: currentText.trim(),
      },
    });
  }

  // 对结果进行二次整理，将相同字段名的数据合并到同一个对象中
  const arr = [];
  for (let index = 0; index < result.length; index += 1) {
    Object.entries(result[index]).forEach(([element]) => {
      // 如果结果数组为空，或者最后一个对象中没有当前字段名，则新建一个对象
      if (!arr[arr.length - 1]) {
        arr.push({
          [element]: result[index][element],
        });
      } else if (!arr[arr.length - 1]?.[element]) {
        // 如果最后一个对象中没有当前字段名，则添加该字段
        arr[arr.length - 1][element] = result[index][element];
      } else {
        // 如果最后一个对象中已有当前字段名，则新建一个对象
        arr.push({
          [element]: result[index][element],
        });
      }
    });
  }

  // 返回最终整理后的数组
  return arr;
};

/**
 * 解析包含 "L4TagMulti-" 标记的 block 元素，提取并处理其中的多行配置数据。
 *
 * @param {HTMLElement} block - 包含多个子元素的 block 元素，每个子元素可能包含 "L4TagMulti-" 标记
 * @returns {Array<Array<Object>>} - 返回一个二维数组，每个子数组对应一个包含 "L4TagMulti-" 标记的子元素的解析结果
 *
 * @description
 * 该函数的作用是遍历传入的 block 元素的所有子元素，筛选出包含 "L4TagMulti-" 标记的子元素，
 * 并调用函数对其进行解析，最终将解析结果汇总成一个数组返回。
 *
 * 主要步骤：
 * 1. 遍历 block 的所有子元素。
 * 2. 检查每个子元素的 outerHTML 是否包含 "L4TagMulti-" 标记。
 * 3. 如果包含，则调用函数解析该子元素的内容。
 * 4. 将解析结果 push 到结果数组中。
 * 5. 返回最终的结果数组。
 *
 * 示例输入：
 * <div>
 *   <div><p><p>L4TagMulti-title</p></p><p><p>这是标题内容</p></p></div>
 *   <div><p><p>L4TagMulti-description</p></p><p><p>这是描述内容</p></p></div>
 * </div>
 *
 * 示例输出：
 * [
 *   [
 *     { title: { html: '<p>这是标题内容</p>', text: '这是标题内容' } }
 *   ],
 *   [
 *     { description: { html: '<p>这是描述内容</p>', text: '这是描述内容' } }
 *   ]
 * ]
 */
export const getBlockRepeatConfigs = (block) => {
  // 初始化结果数组，用于存储所有匹配子元素的解析结果
  const arr = [];

  // 将 block 的所有子元素转换为数组并遍历
  [...block.children].forEach((item) => {
    // 检查当前子元素的 outerHTML 是否包含 "L4TagMulti-" 标记
    if (item.outerHTML.includes('L4TagMulti-')) {
      // 如果包含，则调用 parseL4TagMulti 函数解析该子元素的内容
      arr.push(parseL4TagMulti(item));
    }
  });

  // 返回最终的解析结果数组
  return arr;
};
