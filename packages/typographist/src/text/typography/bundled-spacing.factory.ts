import type { TextRule } from '@/text/typography/text-rule.types.js';

export const createBundledSpacing = (locale: string) => {
  if (locale !== 'en' && locale !== 'ru') {
    return [];
  }

  const rules: TextRule[] = [
    {
      id: 'common/space/afterExclamationMark',
      category: 'spacing',
      order: 210,
      defaults: {},
      prepare: () => (text) => text.replace(/!([^).…!;?\s[\]«‹»›„“‟”"])/g, '! $1'),
    },
    {
      id: 'common/space/afterQuestionMark',
      category: 'spacing',
      order: 210,
      defaults: {},
      prepare: () => (text) => text.replace(/\?([^).…!;?\s[\]«‹»›„“‟”"])/g, '? $1'),
    },
    {
      id: 'common/space/afterComma',
      category: 'spacing',
      order: 210,
      defaults: {},
      prepare: () => {
        const afterComma = locale === 'ru' ? /(.),([^)",:.?\s/\\»“‘])/g : /(.),([^)",:.?\s/\\”’])/g;

        return (text) =>
          text.replace(afterComma, (match: string, before: string, after: string) =>
            /\d/.test(before) && /\d/.test(after) ? match : `${before}, ${after}`,
          );
      },
    },
    {
      id: 'common/space/afterColon',
      category: 'spacing',
      order: 210,
      defaults: {},
      prepare: () => (text) => text.replace(/(\D):([^)",:.?\s/\\])/g, '$1: $2'),
    },
  ];

  if (locale === 'ru') {
    rules.unshift({
      id: 'ru/space/afterHellip',
      category: 'spacing',
      order: 210,
      defaults: {},
      prepare: () => (text) =>
        text.replace(/([а-яё])(\.\.\.|…)([А-ЯЁ])/g, '$1$2 $3').replace(/([?!]\.\.)([а-яёa-z])/gi, '$1 $2'),
    });
    rules.unshift({
      id: 'ru/space/year',
      category: 'spacing',
      order: 210,
      defaults: {},
      prepare: () => (text) => text.replace(/(^| |\u00a0)(\d{3,4})(год([ауе]|ом)?)([^а-яё]|$)/g, '$1$2 $3$5'),
    });
  }

  const referenceOrder = [
    'ru/space/year',
    'ru/space/afterHellip',
    'common/space/afterExclamationMark',
    'common/space/afterQuestionMark',
    'common/space/afterComma',
    'common/space/afterColon',
  ];

  return rules.sort(
    (left, right) => left.order - right.order || referenceOrder.indexOf(left.id) - referenceOrder.indexOf(right.id),
  );
};
