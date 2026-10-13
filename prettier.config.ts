import type { Config } from 'prettier';

const config: Config = {
  singleQuote: true,
  semi: true,
  tabWidth: 2,
  useTabs: false,
  trailingComma: 'all',
  arrowParens: 'always',
  printWidth: 120,
  endOfLine: 'lf',
  overrides: [{ files: 'llms.txt', options: { parser: 'markdown' } }],
};

export default config;
