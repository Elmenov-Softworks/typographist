import type { TextRule } from '@/text/typography/text-rule.types.js';

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
      prepare: () =>
        locale === 'ru'
          ? (text) => text.replace(/(^|[^.])\.{3,4}(?=[^.]|$)/g, '$1…')
          : (text) => text.replace(/(^|[^.])\.{3}(\.?)(?=[^.]|$)/g, '$1…$2'),
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
