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
      id: 'common/space/delRepeatN',
      category: 'spacing',
      order: 209,
      defaults: { maxConsecutiveLineBreaks: 2 },
      prepare: ({ maxConsecutiveLineBreaks }) => {
        if (
          typeof maxConsecutiveLineBreaks !== 'number' ||
          !Number.isSafeInteger(maxConsecutiveLineBreaks) ||
          maxConsecutiveLineBreaks < 1
        ) {
          throw new TypeError('maxConsecutiveLineBreaks must be a positive safe integer');
        }

        const repeatedLineBreaks = /\n+/g;

        return (text) =>
          text.replace(repeatedLineBreaks, (lineBreaks) => lineBreaks.slice(0, maxConsecutiveLineBreaks));
      },
    },
    {
      id: 'common/space/squareBracket',
      category: 'spacing',
      order: 210,
      defaults: {},
      prepare: () => (text) => text.replace(/(\[) +/g, '[').replace(/ +\]/g, ']'),
    },
    {
      id: 'common/space/delBeforePunctuation',
      category: 'spacing',
      order: 210,
      defaults: {},
      prepare: () => (text) => text.replace(/(^|[^!?:;,.…]) ([!?:;,])(?!\))/g, '$1$2'),
    },
    {
      id: 'common/space/delBeforePercent',
      category: 'spacing',
      order: 210,
      defaults: {},
      prepare: () => (text) => text.replace(/(\d)( |\u00a0)(%|‰|‱)/g, '$1$3'),
    },
    {
      id: 'common/space/bracket',
      category: 'spacing',
      order: 210,
      defaults: {},
      prepare: () => (text) => text.replace(/(\() +/g, '(').replace(/ +\)/g, ')'),
    },
  ];

  return rules;
};
