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
      defaults: { left, right, spacing: false },
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

        const spacingPairs = Array.from(settings.spacing ? left : '').map((character, index) => ({
          opening: new RegExp(`${character.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^\\u202f])`, 'g'),
          closing: new RegExp(`([^\\u202f])${right.charAt(index).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g'),
          removeOpening: new RegExp(`${character.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[ \u202f\u00a0]`, 'g'),
          removeClosing: new RegExp(
            `[ \u202f\u00a0]${right.charAt(index).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
            'g',
          ),
        }));

        const setSpacing = (text: string, directions: ReadonlyMap<number, 'opening' | 'closing'>) => {
          if (!settings.spacing) {
            return text;
          }

          if (left.charAt(0) !== right.charAt(0)) {
            for (const [index, pair] of spacingPairs.entries()) {
              text = text
                .replace(pair.opening, (_match: string, after: string) => left.charAt(index) + '\u202f' + after)
                .replace(pair.closing, (_match: string, before: string) => before + '\u202f' + right.charAt(index));
            }

            return text;
          }

          let characters: { character: string; direction: null | 'opening' | 'closing' }[] = Array.from(text).map(
            (character) => ({
              character,
              direction: null,
            }),
          );
          let offset = 0;

          for (const character of characters) {
            character.direction = directions.get(offset) ?? null;
            offset += character.character.length;
          }

          for (let depth = 0; depth < left.length; depth++) {
            for (const direction of ['opening', 'closing'] as const) {
              const spaced: typeof characters = [];

              for (let index = 0; index < characters.length; index++) {
                const before = characters[index];
                const after = characters[index + 1];

                if (before === undefined) {
                  continue;
                }

                spaced.push(before);

                if (after === undefined) {
                  continue;
                }

                const quote = direction === 'opening' ? before : after;
                const neighbor = direction === 'opening' ? after : before;
                const glyph = direction === 'opening' ? left.charAt(depth) : right.charAt(depth);

                if (quote.direction === direction && quote.character === glyph && neighbor.character !== '\u202f') {
                  spaced.push({ character: '\u202f', direction: null }, after);
                  index++;
                }
              }

              characters = spaced;
            }
          }

          return characters.map(({ character }) => character).join('');
        };

        return (text) => {
          if (settings.spacing && !/[«‹»›„“‟”"]/u.test(text)) {
            return text;
          }

          const outerLeft = left.charAt(0);
          const outerRight = right.charAt(0);
          const directions = new Map<number, 'opening' | 'closing'>();
          const identicalOuter = outerLeft === outerRight;
          if (settings.spacing && !identicalOuter) {
            for (const [index, pair] of spacingPairs.entries()) {
              text = text
                .replace(pair.removeOpening, () => left.charAt(index))
                .replace(pair.removeClosing, () => right.charAt(index));
            }
          }

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
            return setSpacing(normalized, directions);
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

          return setSpacing(result, directions);
        };
      },
    },
  ];

  return rules;
};
