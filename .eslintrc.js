module.exports = {
  root: true,
  extends: [
    'airbnb-base',
    'plugin:json/recommended',
    'plugin:xwalk/recommended',
  ],
  env: {
    browser: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    allowImportExportEverywhere: true,
    sourceType: 'module',
    requireConfigFile: false,
  },
  rules: {
    'import/extensions': ['error', { js: 'always' }],
    'linebreak-style': ['error', 'unix'],
    'no-param-reassign': [2, { props: false }],
    'no-nested-ternary': 'off',
    'no-shadow': 'off',
    'no-use-before-define': ['error', { functions: false, classes: true, variables: true }],
    'no-underscore-dangle': 'off',
    'xwalk/max-cells': ['error', { max: 50 }],
    'no-console': 'off',
    'max-len': ['error', { code: 150, ignoreUrls: true }],
    'consistent-return': 'off',
  },
};
