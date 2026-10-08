import type { TextRule } from '@/text/typography/text-rule.types.js';

export const createBundledDashes = (locale: string) => {
  if (locale !== 'en' && locale !== 'ru') {
    return [];
  }

  const rules: TextRule[] = [
    {
      id: locale === 'ru' ? 'ru/dash/main' : 'en-US/dash/main',
      category: 'dashes',
      order: 305,
      defaults: {},
      prepare: () => (text) => text.replace(/[ \u00a0](--?|‒|–|—)([ \u00a0\n])/g, '\u00a0—$2'),
    },
  ];

  return rules;
};
