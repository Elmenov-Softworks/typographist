import type { TextRule } from '@/text/typography/text-rule.types.js';

export const createBundledQuotes = (locale: string) => {
  if (locale !== 'en' && locale !== 'ru') {
    return [];
  }

  const left = locale === 'ru' ? '«„‚' : '“‘';
  const right = locale === 'ru' ? '»“‘' : '”’';
  const opening = /(^|[ \n\t\u00a0[(])([«‹»›„“‟”"]+)(?=\S)/gim;
  const closing = /(\S)([«‹»›„“‟”"]+)(?=[ \n\t\u00a0!?.:;#*,…)\]\\]|$)/gim;

  const rules: TextRule[] = [
    {
      id: 'common/punctuation/quote',
      category: 'quotes',
      order: 410,
      defaults: {},
      prepare: () => (text) => {
        const outerLeft = left.charAt(0);
        const outerRight = right.charAt(0);
        const normalized = text
          .replace(
            opening,
            (_match: string, before: string, quotes: string) => before + outerLeft.repeat(quotes.length),
          )
          .replace(
            closing,
            (_match: string, before: string, quotes: string) => before + outerRight.repeat(quotes.length),
          );
        const leftCount = normalized.split(outerLeft).length - 1;
        const rightCount = normalized.split(outerRight).length - 1;
        const maxLevel = leftCount === rightCount ? left.length : Math.min(left.length, 2);
        let level = 0;
        let result = '';

        for (const character of normalized) {
          if (character === outerLeft) {
            result += left.charAt(Math.min(level, maxLevel - 1));
            level = Math.min(level + 1, maxLevel);
          } else if (character === outerRight) {
            level = Math.max(0, level - 1);
            result += right.charAt(level);
          } else {
            if (character === '"') {
              level = 0;
            }

            result += character;
          }
        }

        return result;
      },
    },
  ];

  return rules;
};
