import type { TextRule } from '@/text/typography/text-rule.types.js';

export const createBundledNonbreakingSpacing = (locale: string) => {
  if (locale !== 'en' && locale !== 'ru') {
    return [];
  }

  const rules: TextRule[] = [
    {
      id: 'common/nbsp/beforeShortLastWord',
      category: 'nonbreakingSpacing',
      order: 510,
      defaults: { lengthLastWord: 3 },
      prepare: ({ lengthLastWord }) => {
        if (typeof lengthLastWord !== 'number' || !Number.isSafeInteger(lengthLastWord) || lengthLastWord < 1) {
          throw new TypeError('lengthLastWord must be a positive safe integer');
        }

        const letters = locale === 'ru' ? 'а-яё' : 'a-z';
        const lastWord = new RegExp(
          `([${letters}\\d]) ([${letters}${letters.toUpperCase()}]{1,${String(lengthLastWord)}}[.!?…])( [${letters.toUpperCase()}]|$)`,
          'g',
        );

        return (text) => text.replace(lastWord, '$1\u00a0$2$3');
      },
    },
    {
      id: 'common/nbsp/dpi',
      category: 'nonbreakingSpacing',
      order: 510,
      defaults: {},
      prepare: () => (text) => text.replace(/(\d) ?(lpi|dpi)(?!\w)/, '$1\u00a0$2'),
    },
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
      id: 'ru/nbsp/ps',
      category: 'nonbreakingSpacing',
      order: 510,
      defaults: {},
      prepare: () => (text) =>
        text.replace(
          /(^|\s)([pз]\.)[ \u00a0]?(?:([pз]\.)[ \u00a0]?)?([sы]\.)(:?) /gim,
          (_match, boundary: string, first: string, second: string | undefined, last: string, colon: string) =>
            `${boundary}${first}\u00a0${second === undefined ? '' : `${second}\u00a0`}${last}${colon} `,
        ),
    });

    rules.push({
      id: 'ru/nbsp/rubleKopek',
      category: 'nonbreakingSpacing',
      order: 510,
      defaults: {},
      prepare: () => (text) => text.replace(/(\d) ?(?=(руб|коп)\.)/g, '$1\u00a0'),
    });

    rules.push({
      id: 'ru/nbsp/year',
      category: 'nonbreakingSpacing',
      order: 510,
      defaults: {},
      prepare: () => (text) => text.replace(/(^|\D)(\d{4}) ?г([ ,;.\n]|$)/g, '$1$2\u00a0г$3'),
    });

    rules.push({
      id: 'ru/nbsp/see',
      category: 'nonbreakingSpacing',
      order: 510,
      defaults: {},
      prepare: () => (text) =>
        text.replace(
          /(^|\s|\()(см|им)\.[ \u00a0]?([а-яё0-9a-z]+)([\s.,?!]|$)/gi,
          (_match, boundary: string, abbreviation: string, word: string, suffix: string) =>
            `${boundary === '\u00a0' ? ' ' : boundary}${abbreviation}.\u00a0${word}${suffix}`,
        ),
    });

    rules.push({
      id: 'ru/nbsp/page',
      category: 'nonbreakingSpacing',
      order: 510,
      defaults: {},
      prepare: () => (text) =>
        text.replace(/(^|[)\s])(стр|гл|рис|илл?|ст|п|c)\. *(\d+)([\s.,?!;:]|$)/gim, '$1$2.\u00a0$3$4'),
    });

    rules.push({
      id: 'ru/nbsp/ooo',
      category: 'nonbreakingSpacing',
      order: 510,
      defaults: {},
      prepare: () => (text) => text.replace(/(^|[^a-яёA-ЯЁ])(ООО|ОАО|ЗАО|НИИ|ПБОЮЛ) /g, '$1$2\u00a0'),
    });

    rules.push({
      id: 'ru/nbsp/mln',
      category: 'nonbreakingSpacing',
      order: 510,
      defaults: {},
      prepare: () => (text) => text.replace(/(\d) ?(тыс|млн|млрд|трлн)(\.|\s|$)/gi, '$1\u00a0$2$3'),
    });

    rules.push({
      id: 'ru/nbsp/centuries',
      category: 'nonbreakingSpacing',
      order: 510,
      defaults: {},
      prepare: () => (text) =>
        text
          .replace(/(^|\s)([VIX]+)[ \u00a0]?(в\.?)(?=[,;:?!"‘“»]|$)/gm, '$1$2\u00a0$3')
          .replace(
            /(^|\s)([VIX]+(?:--?|‒|–|—)[VIX]+)[ \u00a0]?(в\.?(?:[ \u00a0]?в\.?)?)(?=[,;:?!"‘“»]|$)/gm,
            '$1$2\u00a0$3',
          ),
    });

    rules.push({
      id: 'ru/nbsp/dayMonth',
      category: 'nonbreakingSpacing',
      order: 510,
      defaults: {},
      prepare: () => (text) =>
        text.replace(/(\d{1,2}) (янв|фев|мар|апр|ма[ейя]|июн|июл|авг|сен|окт|ноя|дек)/gi, '$1\u00a0$2'),
    });

    rules.push({
      id: 'ru/nbsp/abbr',
      category: 'nonbreakingSpacing',
      order: 510,
      defaults: {},
      prepare: () => {
        const abbreviation = /(^|\s)([а-яё]{1,3})\. ?([а-яё]{1,3})\./g;
        const domainSuffixes = ['рф', 'ру', 'рус', 'орг', 'укр', 'бг', 'срб'];
        const insertSpace = (match: string, boundary: string, first: string, second: string) => {
          if ((first === 'дд' && second === 'мм') || domainSuffixes.includes(second)) {
            return match;
          }

          return `${boundary}${first}.\u00a0${second}.`;
        };

        return (text) => text.replace(abbreviation, insertSpace).replace(abbreviation, insertSpace);
      },
    });

    rules.push({
      id: 'ru/nbsp/addr',
      category: 'nonbreakingSpacing',
      order: 510,
      defaults: {},
      prepare: () => (text) =>
        text
          .replace(/(\s|^)(дом|д\.|кв\.|под\.|п-д) *(\d+)/gi, '$1$2\u00a0$3')
          .replace(/(\s|^)(мкр-н|мк-н|мкр\.|мкрн)\s/gi, '$1$2\u00a0')
          .replace(/(\s|^)(эт\.) *(-?\d+)/gi, '$1$2\u00a0$3')
          .replace(/(\s|^)(\d+) +(этаж)([^а-яё]|$)/gi, '$1$2\u00a0$3$4')
          .replace(/(\s|^)(литер)\s([А-Я]|$)/gi, '$1$2\u00a0$3')
          .replace(
            /(\s|^)(обл|кр|ст|пос|с|д|ул|пер|пр|пр-т|просп|пл|бул|б-р|наб|ш|туп|оф|комн?|уч|вл|влад|стр|кор)\. *([а-яёa-z\d]+)/gi,
            '$1$2.\u00a0$3',
          )
          .replace(/(\D[ \u00a0]|^)г\. ?([А-ЯЁ])/gm, '$1г.\u00a0$2'),
    });

    rules.push({
      id: 'ru/nbsp/afterNumberSign',
      category: 'nonbreakingSpacing',
      order: 510,
      defaults: {},
      prepare: () => (text) => text.replace(/№[ \u00a0\u2009]?(\d|п\/п)/g, '№\u202f$1'),
    });

    rules.push({
      id: 'ru/nbsp/initials',
      category: 'nonbreakingSpacing',
      order: 510,
      defaults: {},
      prepare: () => (text) =>
        text.replace(
          /(^|[(\u00a0\u202f «„‚"])([А-ЯЁ])\.[\u00a0\u202f ]?([А-ЯЁ])\.[\u00a0\u202f ]?([А-ЯЁ][а-яё]+)/gm,
          '$1$2.\u00a0$3.\u00a0$4',
        ),
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
