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
      id: 'common/nbsp/afterShortWordByList',
      category: 'nonbreakingSpacing',
      order: 510,
      defaults: {},
      prepare: () => {
        const words =
          locale === 'ru'
            ? 'а|без|в|во|если|да|до|для|за|и|или|из|к|ко|как|ли|на|но|не|ни|о|об|обо|от|по|про|при|под|с|со|то|у'
            : 'a|an|and|as|at|bar|but|by|for|if|in|nor|not|of|off|on|or|out|per|pro|so|the|to|up|via|yet';
        const listedWord = new RegExp(`(^|[ \\u00a0(«‹»›„“‟”"])(${words}) `, 'gim');

        return (text) => text.replace(listedWord, '$1$2\u00a0').replace(listedWord, '$1$2\u00a0');
      },
    },
    {
      id: 'common/nbsp/afterShortWord',
      category: 'nonbreakingSpacing',
      order: 510,
      defaults: { lengthShortWord: 2 },
      prepare: ({ lengthShortWord }) => {
        if (typeof lengthShortWord !== 'number' || !Number.isSafeInteger(lengthShortWord) || lengthShortWord < 1) {
          throw new TypeError('lengthShortWord must be a positive safe integer');
        }

        const letters = locale === 'ru' ? 'а-яё' : 'a-z';
        const shortWord = new RegExp(`(^|[ \\u00a0(«‹»›„“‟”"])([${letters}]{1,${String(lengthShortWord)}}) `, 'gim');

        return (text) => text.replace(shortWord, '$1$2\u00a0').replace(shortWord, '$1$2\u00a0');
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
      id: 'common/nbsp/afterNumber',
      category: 'nonbreakingSpacing',
      order: 510,
      defaults: {},
      prepare: () => {
        const letters = locale === 'ru' ? 'а-яё' : 'a-z';
        const numberBeforeWord = new RegExp(`(^|\\s)(\\d{1,5}) ([${letters}]+)`, 'gi');

        return (text) => text.replace(numberBeforeWord, '$1$2\u00a0$3');
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
      id: 'ru/nbsp/afterNumberSign',
      category: 'nonbreakingSpacing',
      order: 510,
      defaults: {},
      prepare: () => (text) => text.replace(/№[ \u00a0\u2009]?(\d|п\/п)/g, '№\u202f$1'),
    });

    rules.push({
      id: 'ru/nbsp/m',
      category: 'nonbreakingSpacing',
      order: 515,
      defaults: {},
      prepare: () => (text) =>
        text.replace(
          /(^|[\s,.(])(\d+)[ \u00a0]?(мм?|см|км|дм|гм|mm?|km|cm|dm)([23²³])?([\s).!?,;]|$)/gm,
          (_match, boundary: string, number: string, unit: string, exponent: string | undefined, suffix: string) =>
            `${boundary}${number}\u00a0${unit}${exponent ?? ''}${suffix === '\u00a0' ? ' ' : suffix}`,
        ),
    });

    rules.push({
      id: 'ru/nbsp/years',
      category: 'nonbreakingSpacing',
      order: 515,
      defaults: {},
      prepare: () => (text) =>
        text.replace(
          /(^|\D)(\d{4})(--?|‒|–|—)(\d{4})[ \u00a0]?(?=г\.?([ \u00a0]?г\.)?(?:[,;:?!"‘“»\s]|$))/gm,
          '$1$2$3$4\u00a0',
        ),
    });

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
