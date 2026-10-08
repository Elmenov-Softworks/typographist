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
      defaults: { left, right, removeDuplicateQuotes: locale === 'ru' },
      prepare: (settings) => {
        if (
          typeof settings.left !== 'string' ||
          typeof settings.right !== 'string' ||
          settings.left.length < 1 ||
          settings.left.length > 3 ||
          settings.left.length !== settings.right.length ||
          /[\s\p{L}\p{N}\p{Cs}]/u.test(settings.left + settings.right)
        ) {
          throw new TypeError('Quotation pairs must contain one to three punctuation characters at matching depths');
        }

        const left = settings.left;
        const right = settings.right;

        return (text) => {
          const outerLeft = left.charAt(0);
          const outerRight = right.charAt(0);
          const directions = new Map<number, 'opening' | 'closing'>();
          const identicalOuter = outerLeft === outerRight;
          const normalized = text
            .replace(opening, (_match: string, before: string, quotes: string, offset: number) => {
              if (identicalOuter) {
                for (let index = 0; index < quotes.length; index++) {
                  directions.set(offset + before.length + index, 'opening');
                }
              }

              return before + outerLeft.repeat(quotes.length);
            })
            .replace(closing, (_match: string, before: string, quotes: string, offset: number) => {
              if (identicalOuter) {
                for (let index = 0; index < quotes.length; index++) {
                  directions.set(offset + before.length + index, 'closing');
                }
              }

              return before + outerRight.repeat(quotes.length);
            });

          if (left.charAt(1) === '' || left.charAt(1) === outerLeft) {
            if (!settings.removeDuplicateQuotes) {
              return normalized;
            }

            if (!identicalOuter) {
              return normalized.split(outerLeft.repeat(2)).join(outerLeft).split(outerRight.repeat(2)).join(outerRight);
            }

            if (left.length > 1) {
              return normalized;
            }

            let result = '';

            for (let index = 0; index < normalized.length; index++) {
              result += normalized.charAt(index);
              const direction = directions.get(index);

              if (direction !== undefined && directions.get(index + 1) === direction) {
                index++;
              }
            }

            return result;
          }

          const leftCount = identicalOuter
            ? [...directions.values()].filter((direction) => direction === 'opening').length
            : normalized.split(outerLeft).length - 1;
          const rightCount = identicalOuter ? directions.size - leftCount : normalized.split(outerRight).length - 1;
          const maxLevel = leftCount === rightCount ? left.length : Math.min(left.length, 2);
          let level = 0;
          let result = '';

          let offset = 0;

          for (const character of normalized) {
            const direction = directions.get(offset);

            if (identicalOuter ? direction === 'opening' : character === outerLeft) {
              result += left.charAt(Math.min(level, maxLevel - 1));
              level = Math.min(level + 1, maxLevel);
            } else if (identicalOuter ? direction === 'closing' : character === outerRight) {
              level = Math.max(0, level - 1);
              result += right.charAt(level);
            } else {
              if (character === '"') {
                level = 0;
              }

              result += character;
            }

            offset += character.length;
          }

          return result;
        };
      },
    },
  ];

  return rules;
};
