import type { TextRule } from '@/text/typography/text-rule.types.js';

export const createBundledSpacing = (locale: string) => {
  if (locale !== 'en' && locale !== 'ru') {
    return [];
  }

  const rules: TextRule[] = [];

  if (locale === 'ru') {
    rules.unshift({
      id: 'ru/space/afterHellip',
      category: 'spacing',
      order: 210,
      defaults: {},
      prepare: () => (text) =>
        text.replace(/([а-яё])(\.\.\.|…)([А-ЯЁ])/g, '$1$2 $3').replace(/([?!]\.\.)([а-яёa-z])/gi, '$1 $2'),
    });
  }

  const referenceOrder = ['ru/space/afterHellip'];

  return rules.sort(
    (left, right) => left.order - right.order || referenceOrder.indexOf(left.id) - referenceOrder.indexOf(right.id),
  );
};
