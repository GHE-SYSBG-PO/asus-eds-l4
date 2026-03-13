import replaceSupString from './replace.js';

const testStrings = [
  // 1. Iris Xe 系列
  '配備 Intel Iris® Graphics Xe 或是 Iris Xe 顯示晶片',

  // 2. 漸層/彩色文字 (>!>...<!<)
  '這產品擁有>!>絕佳的效能<!<與設計',

  // 3. 斜體文字 (<[[...]]>)
  '我們稱之為 <[[Zen]]> 精神',

  // 4. 中括號保留 + no__wrap ([[[...]]])
  '顯示額外資訊 [[[包含中括號文字]]]',

  // 5. 單純 no__wrap ([[...]])
  '此特色功能支援 [[不折行文字保留]]',

  // 6~9. 商標與特殊符號 (™, ®, ©, °)
  'ASUS™ Zenbook® 創新技術 © 2026，支援螢幕 360° 翻轉',

  // 10. degree 轉換 (<<degree>>)
  '翻轉 360<<degree>> 螢幕角度',

  // 11. 星號註記 (<<*>>)
  '效能測試注意事項<<*>>',

  // 12. 註腳純數字標記 (<[1, 2]>)
  '官方數據參考<[1]>以及附註<[2, 3]>與<[4-6]>',

  // 13. 註腳錨點連結 (<<1, 2>>)
  '詳細說明請見底下<<1>>、<<2, 3>>或是<<4-6>>',

  // 14. 自訂詞彙替換 (@key@)
  '官方售價 @price@ 起，活動只到 @date@',
];

const testReplaceWords = {
  price: 'NT$39,900',
  date: '2026/12/31',
};

const total = testStrings.length;

console.log('=== 開始測試 replace.js ===\n');

testStrings.forEach((text, index) => {
  const result = replaceSupString(text, testReplaceWords);
  console.log(`測試項目 [${index + 1}/${total}]:`);
  console.log(`原始字串 : ${text}`);
  console.log(`替換結果 : ${result}`);
  console.log('-----------------------------------');
});

console.log('\n=== 測試完成 ===');
