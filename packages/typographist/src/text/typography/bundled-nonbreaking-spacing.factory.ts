import type { TextRule } from '@/text/typography/text-rule.types.js';

export const createBundledNonbreakingSpacing = (locale: string) => {
  if (locale !== 'en' && locale !== 'ru') {
    return [];
  }

  const rules: TextRule[] = [
    {
      id: 'common/nbsp/beforeShortLastNumber',
      category: 'nonbreakingSpacing',
      order: 510,
      defaults: { lengthLastNumber: 2 },
      prepare: ({ lengthLastNumber }) => {
        if (typeof lengthLastNumber !== 'number' || !Number.isSafeInteger(lengthLastNumber) || lengthLastNumber < 1) {
          throw new TypeError('lengthLastNumber must be a positive safe integer');
        }

        const letters = locale === 'ru' ? 'а-яё' : 'a-z';
        const closingQuotes = locale === 'ru' ? '»“‘' : '”’';
        const shortLastNumber = new RegExp(
          `([${letters}${letters.toUpperCase()}]) (?=\\d{1,${String(lengthLastNumber)}}[-+−%'"${closingQuotes})]?([.!?…]( [${letters.toUpperCase()}]|$)|$))`,
          'gm',
        );

        return (text) => text.replace(shortLastNumber, '$1\u00a0');
      },
    },
    {
      id: 'common/nbsp/afterSectionMark',
      category: 'nonbreakingSpacing',
      order: 510,
      defaults: {},
      prepare: () => {
        const replacement = locale === 'ru' ? '§\u202f' : '§\u00a0';

        return (text) => text.replace(/§[ \u00a0\u2009]?(?=\d|I|V|X)/g, replacement);
      },
    },
    {
      id: 'common/nbsp/afterParagraphMark',
      category: 'nonbreakingSpacing',
      order: 510,
      defaults: {},
      prepare: () => (text) => text.replace(/¶ ?(?=\d)/g, '¶\u00a0'),
    },
  ];

  if (locale === 'ru') {
    rules.push({
      id: 'ru/nbsp/beforeParticle',
      category: 'nonbreakingSpacing',
      order: 515,
      defaults: {},
      prepare: () => (text) =>
        text
          .replace(/([А-ЯЁа-яё]) (ли|ль|же|ж|бы|б)(?=[,;:?!"‘“»])/g, '$1\u00a0$2')
          .replace(/([А-ЯЁа-яё])[ \u00a0](ли|ль|же|ж|бы|б)[ \u00a0]/g, '$1\u00a0$2 '),
    });
  }

  return rules;
};
