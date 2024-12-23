const env = (prod, dev) => (process.env.NODE_ENV === 'production' ? prod : dev);
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './client-web/tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'prettier'],
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'prettier',
    'prettier/@typescript-eslint',
  ],
  ignores: ['**/node_modules/**', '**/dist**', '.eslintrc.js'],
  env: {
    node: true,
    jest: true,
  },
  rules: {
    quotes: ['error', 'single', { avoidEscape: true }],
    'no-console': env(1, 0),
    'no-debugger': env(1, 0),
    // 'jest/no-focused-tests': 'warn',
    // 'jest/no-identical-title': 'error',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': [
      env(2, 1),
      {
        argsIgnorePattern: '^_',
      },
    ],
    'no-multiple-empty-lines': 'error',
  },
};
