/* eslint-disable no-undef */
module.exports = {
  extends: [
    'turbo',
    'prettier',
    'next',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    "react/jsx-key": "off",
    "indent": ["warn", 2],
    "no-empty-function": "off",
    "@typescript-eslint/no-empty-function": "warn",
    "react/no-unescaped-entities": "warn",
    "@next/next/no-html-link-for-pages": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
  },
  plugins: [
    '@typescript-eslint',
  ],
};
