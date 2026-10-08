import type { TextRule } from '@/text/typography/text-rule.types.js';

export const createBundledSpacing = (locale: string) => {
  if (locale !== 'en' && locale !== 'ru') {
    return [];
  }

  const rules: TextRule[] = [
    {
      id: 'common/space/replaceTab',
      category: 'spacing',
      order: 205,
      defaults: {},
      prepare: () => (text) => text.replace(/\t/g, '    '),
    },
    {
      id: 'common/space/delTrailingBlanks',
      category: 'spacing',
      order: 207,
      defaults: {},
      prepare: () => (text) => text.replace(/[ \t]+\n/g, '\n'),
    },
    {
      id: 'common/space/delRepeatSpace',
      category: 'spacing',
      order: 209,
      defaults: {},
      prepare: () => (text) => text.replace(/([^\n \t])[ \t]{2,}(?![\n \t])/g, '$1 '),
    },
    {
      id: 'common/space/squareBracket',
      category: 'spacing',
      order: 210,
      defaults: {},
      prepare: () => (text) => text.replace(/(\[) +/g, '[').replace(/ +\]/g, ']'),
    },
  ];

  return rules;
};
