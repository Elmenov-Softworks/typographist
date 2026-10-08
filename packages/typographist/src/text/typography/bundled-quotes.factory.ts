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
      defaults: { left, right },
      prepare: (settings) => {
        if (
          typeof settings.left !== 'string' ||
          typeof settings.right !== 'string' ||
          settings.left.length < 1 ||
          settings.left.length > 3 ||
          settings.left.length !== settings.right.length ||
          settings.left.charAt(0) === settings.right.charAt(0) ||
          /[\s\p{L}\p{N}\p{Cs}]/u.test(settings.left + settings.right)
        ) {
          throw new TypeError(
            'Quotation pairs must contain one to three punctuation characters at matching depths and distinct outer glyphs',
          );
        }

        const left = settings.left;
        const right = settings.right;

        return (text) => {
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

          if (left.charAt(1) === '' || left.charAt(1) === outerLeft) {
            return normalized;
          }

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
        };
      },
    },
  ];

  return rules;
};
