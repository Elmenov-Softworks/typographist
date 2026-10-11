import type { TextRule } from '#src/text/typography/text-rule.types.js';

export const createBundledPunctuation = (locale: string) => {
  if (locale !== 'en' && locale !== 'ru') {
    return [];
  }

  const rules: TextRule[] = [];

  rules.push(
    {
      id: 'common/punctuation/hellip',
      category: 'punctuation',
      order: 410,
      defaults: {},
      prepare: () => (text) => text.replace(/(^|[^.])\.{3}(\.?)(?=[^.]|$)/g, '$1…$2'),
    },
    {
      id: 'common/punctuation/apostrophe',
      category: 'punctuation',
      order: 410,
      defaults: {},
      prepare: () => {
        const apostrophe = locale === 'ru' ? /([а-яё])'([а-яё])/gi : /([a-z])'([a-z])/gi;

        return (text) => text.replace(apostrophe, '$1’$2');
      },
    },
  );

  return rules;
};
