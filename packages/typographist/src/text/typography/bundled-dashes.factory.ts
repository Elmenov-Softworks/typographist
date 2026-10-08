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

  if (locale === 'ru') {
    rules.push({
      id: 'ru/dash/directSpeech',
      category: 'dashes',
      order: 310,
      defaults: {},
      prepare: () => (text, context) =>
        text
          .replace(/(["»‘“,])[ |\u00a0]?(--?|‒|–|—)[ |\u00a0]/g, '$1\u00a0— ')
          .replace(/^(--?|‒|–|—)[ \u00a0]/gm, (match: string, _dash: string, offset: number) =>
            offset === 0 && context?.startsLine === false ? match : '—\u00a0',
          )
          .replace(/([.…?!])[ \u00a0](--?|‒|–|—)[ \u00a0]/g, '$1 —\u00a0'),
    });

    rules.push({
      id: 'ru/dash/centuries',
      category: 'dashes',
      order: 310,
      defaults: { dash: '–' },
      prepare: ({ dash }) => {
        if (typeof dash !== 'string' || !/^(?:--?|‒|–|—|−)$/.test(dash)) {
          throw new TypeError('dash must be a supported dash or minus glyph');
        }

        const range =
          /(?<![\p{L}\p{M}\p{N}_-])([XIV]+)[ \u00a0]?(?:--?|‒|–|—)[ \u00a0]?([XIV]+)(?![\p{L}\p{M}\p{N}_-])/gu;

        return (text) => text.replace(range, `$1${dash}$2`);
      },
    });

    rules.push({
      id: 'ru/dash/weekday',
      category: 'dashes',
      order: 310,
      defaults: { dash: '–' },
      prepare: ({ dash }) => {
        if (typeof dash !== 'string' || !/^(?:--?|‒|–|—|−)$/.test(dash)) {
          throw new TypeError('dash must be a supported dash or minus glyph');
        }

        const weekday = '(понедельник|вторник|среда|четверг|пятница|суббота|воскресенье)';
        const range = new RegExp(
          `(?<![\\p{L}\\p{M}\\p{N}_-])${weekday} ?(?:--?|‒|–|—) ?${weekday}(?![\\p{L}\\p{M}\\p{N}_-])`,
          'giu',
        );

        return (text) => text.replace(range, `$1${dash}$2`);
      },
    });

    rules.push({
      id: 'ru/dash/month',
      category: 'dashes',
      order: 310,
      defaults: { dash: '–' },
      prepare: ({ dash }) => {
        if (typeof dash !== 'string' || !/^(?:--?|‒|–|—|−)$/.test(dash)) {
          throw new TypeError('dash must be a supported dash or minus glyph');
        }

        const months = [
          'январь|февраль|март|апрель|май|июнь|июль|август|сентябрь|октябрь|ноябрь|декабрь',
          'январе|феврале|марте|апреле|мае|июне|июле|августе|сентябре|октябре|ноябре|декабре',
        ];
        const ranges = months.map(
          (names) =>
            new RegExp(
              `(?<![\\p{L}\\p{M}\\p{N}_-])(${names}) ?(?:--?|‒|–|—) ?(${names})(?![\\p{L}\\p{M}\\p{N}_-])`,
              'giu',
            ),
        );

        return (text) => {
          for (const range of ranges) {
            text = text.replace(range, `$1${dash}$2`);
          }

          return text;
        };
      },
    });
  }

  return rules;
};
