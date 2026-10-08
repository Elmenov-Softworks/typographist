import type { TextRule } from '@/text/typography/text-rule.types.js';

export const createBundledDashes = (locale: string) => {
  if (locale !== 'en' && locale !== 'ru') {
    return [];
  }

  const rules: TextRule[] = [
    {
      id: 'common/dash/minus',
      category: 'dashes',
      order: 300,
      defaults: {},
      prepare: () => (text) =>
        text.replace(/(^|[\s([{])-(\d+(?:[.,/]\d+)*)(?![.,/]\d)(?=$|[\s)\]},;!?]|\.(?=\s|$))/g, '$1−$2'),
    },
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
      id: 'ru/dash/years',
      category: 'dashes',
      order: 310,
      defaults: { dash: '–' },
      prepare: ({ dash }) => {
        if (typeof dash !== 'string' || !/^(?:--?|‒|–|—|−)$/.test(dash)) {
          throw new TypeError('dash must be a supported dash or minus glyph');
        }

        const range =
          /(?<![\p{L}\p{M}\p{N}_-])(\d{4})[ \u00a0]?(?:--?|‒|–|—)[ \u00a0]?(\d{4})(?=[ \u00a0]?г(?:г?\.?|од(?:а|у|ом|ы|ов|ам|ами|ах)?)(?![\p{L}\p{M}\p{N}_-]))/gu;

        return (text) =>
          text.replace(range, (match: string, from: string, to: string) =>
            Number(from) < Number(to) ? `${from}${dash}${to}` : match,
          );
      },
    });

    rules.push({
      id: 'ru/dash/time',
      category: 'dashes',
      order: 310,
      defaults: { dash: '–' },
      prepare: ({ dash }) => {
        if (typeof dash !== 'string' || !/^(?:--?|‒|–|—|−)$/.test(dash)) {
          throw new TypeError('dash must be a supported dash or minus glyph');
        }

        const range = /(^| |\n)(\d?\d:[0-5]\d)(?:--?|‒|–|—)(\d?\d:[0-5]\d)(?=[\u00a0 ,.?:!]|$)/g;

        return (text) => text.replace(range, `$1$2${dash}$3`);
      },
    });

    rules.push({
      id: 'ru/dash/decade',
      category: 'dashes',
      order: 310,
      defaults: { dash: '–' },
      prepare: ({ dash }) => {
        if (typeof dash !== 'string' || !/^(?:--?|‒|–|—|−)$/.test(dash)) {
          throw new TypeError('dash must be a supported dash or minus glyph');
        }

        const range = /(^|\s)((?:\d{3}|\d)0)(?:--?|‒|–|—)((?:\d{3}|\d)0)(-е[ \u00a0])(?=г\.?[ \u00a0]?г|год)/g;

        return (text) => text.replace(range, `$1$2${dash}$3$4`);
      },
    });

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
      id: 'ru/dash/daysMonth',
      category: 'dashes',
      order: 310,
      defaults: { dash: '–' },
      prepare: ({ dash }) => {
        if (typeof dash !== 'string' || !/^(?:--?|‒|–|—|−)$/.test(dash)) {
          throw new TypeError('dash must be a supported dash or minus glyph');
        }

        const range =
          /(^|\s)([123]?\d)(?:--?|‒|–|—)([123]?\d)[ \u00a0](января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)/g;

        return (text) => text.replace(range, `$1$2${dash}$3\u00a0$4`);
      },
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
