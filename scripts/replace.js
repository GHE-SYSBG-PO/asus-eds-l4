/**
 * 配置字串取代規則
 * 每一個物件包含:
 * @property {RegExp} reg - 要比對的正規表達式
 * @property {string|Function} replacement - 取代的字串或 callback 函式
 */
const regexRules = [
  {
    reg: /(Iris®<.+?>X|Iris X|Iris®\sX)(e)/g,
    replacement: "$1<sup class='sign-xe'>$2</sup>",
  },
  {
    reg: />!>([^"][^"]*?)<!</g,
    replacement: "<span class='colorful-text'>$1</span>",
  },
  {
    reg: /<\[\[([^"][^"]*?)\]\]>/g,
    replacement: "<span class='text-italic'>$1</span>",
  },
  {
    // 以中刮號將字串標記，ex: [[字串  字串 123456]]
    // https://regex101.com/r/igKky8/10
    reg: /\[\[\[([^"][^"]*?)\]\]\]/g,
    replacement: "<span class='no__wrap'>[$1]</span>",
  },
  {
    reg: /\[\[([^"][^"]*?)\]\]/g,
    replacement: "<span class='no__wrap'>$1</span>",
  },
  {
    // - http://graphemica.com/
    reg: /™/g,
    replacement: "<sup role='img' aria-label='trademark' class='sign-tm'>™</sup>",
  },
  {
    reg: /®/g,
    replacement: "<sup role='img' aria-label='registered' class='sign-reg'>®</sup>",
  },
  {
    reg: /©/g,
    replacement: "<sup role='img' aria-label='copyright' class='sign-cr'>©</sup>",
  },
  {
    reg: /°/g,
    replacement: "<sup role='img' aria-label='degree' class='sign-deg'>°</sup>",
  },
  {
    reg: /<<degree>>/g,
    replacement: '°',
  },
  {
    reg: /<<\*>>/g,
    replacement: "<sup role='img' aria-label='star' class='sign-star'>*</sup>",
  },
  {
    // - footnoteNormal = "<[6, 7]>" || "<[6]>" || "<[666666]>" || "<[666,7,6,4,6,7-8]>"
    reg: /<\[([\d]{0,}.[,|\d|\s|-]{0,})\]>/g,
    replacement: (match, $1) => `<sup class='footnote-num'>${$1}</sup>`,
  },
  {
    // - footnote = "<<6, 7>>" || "<<6>>" || "<<666666>>" || "<<666,7,6,4,6,7-8>>"
    reg: /<<([\d]{0,}.[,|\d|\s|-]{0,})>>/g,
    replacement: (match, $1) => (
      $1.split(',')
        .map((num) => {
          const number = num.trim();
          return `<sup class='footnote-num'><span aria-hidden='true'>${number}</span><a href='#footnote-${number}' class='footnote-${number}' aria-label='Footnote ${number}'></a></sup>`;
        })
        .join("<span class='footnote-number-comma'>,</span>")
    ),
  },
];

/**
 * 針對傳入的字串，進行特定符號 (TM, R 等) 及標記轉換為 HTML Sup 等標籤。
 * 如果提供 replaceWords，會額外將字串裡的 `@key@` 替換為 `replaceWords[key]` 的內容。
 *
 * @param {string} text - 原始字串
 * @param {Record<string, string>} [replaceWords] - (Optional) 自訂要替換的物件，會取代所有 '@key@' 為屬性值
 * @returns {string} - 處理過後的字串（已轉換各式標記和字元）
 */
export default function replaceSupString(text, replaceWords) {
  if (typeof text !== 'string') return text;

  let newString = text;

  // 執行基本的取代規則
  regexRules.forEach((rule) => {
    newString = newString.replace(rule.reg, rule.replacement);
  });

  // 取代額外自訂的 words
  if (replaceWords) {
    Object.keys(replaceWords).forEach((wordKey) => {
      newString = newString.replace(new RegExp(`@${wordKey}@`, 'g'), replaceWords[wordKey]);
    });
  }

  return newString;
}
