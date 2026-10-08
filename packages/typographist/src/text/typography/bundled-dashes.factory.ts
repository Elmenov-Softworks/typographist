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
  }

  return rules;
};
