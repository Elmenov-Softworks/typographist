import type { TextRule } from '@/text/typography/text-rule.types.js';

export const createBundledQuotes = (locale: string) => {
  if (locale !== 'en' && locale !== 'ru') {
    return [];
  }

  const left = locale === 'ru' ? '«„‚' : '“‘';
  const right = locale === 'ru' ? '»“‘' : '”’';

  const rules: TextRule[] = [
    {
      id: 'common/punctuation/quote',
      category: 'quotes',
      order: 410,
      defaults: { left, right, spacing: true },
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
        const identicalOuter = left.charAt(0) === right.charAt(0);
        const openingGlyphs = '«‹»›„“‟”"' + (identicalOuter ? left.replace(/[\\\]\-^]/g, '\\$&') : '');
        const closingGlyphs = '«‹»›„“‟”"' + (identicalOuter ? right.replace(/[\\\]\-^]/g, '\\$&') : '');
        const quoteGlyphs = openingGlyphs + closingGlyphs;
        const opening = new RegExp(
          String.raw`(^|[ \r\n\t\u00a0[(])([${openingGlyphs}]+)(?=[ \t\u00a0\u202f]*[^\s${quoteGlyphs}])`,
          'gim',
        );
        const closing = new RegExp(
          String.raw`([^\s${quoteGlyphs}][ \t\u00a0\u202f]+|\S)([${closingGlyphs}]+)(?=[ \r\n\t\u00a0!?.:;#*,…)\]\\]|$)`,
          'gim',
        );

        const setSpacing = (text: string, directions: ReadonlyMap<number, 'opening' | 'closing'>) => {
          if (!settings.spacing) {
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

                if (
                  (left.charAt(0) === right.charAt(0) && quote.direction !== direction) ||
                  quote.character !== glyph ||
                  /[^\S ]/u.test(neighbor.character)
                ) {
                  continue;
                }

                const step = direction === 'opening' ? 1 : -1;
                const inwardGlyphs = direction === 'opening' ? left : right;
                let targetIndex = direction === 'opening' ? index + 1 : index;
                let target = characters[targetIndex];

                while (
                  target !== undefined &&
                  (/[\t \u00a0\u202f]/u.test(target.character) || inwardGlyphs.includes(target.character))
                ) {
                  targetIndex += step;
                  target = characters[targetIndex];
                }

                if (
                  target === undefined ||
                  /\s/u.test(target.character) ||
                  (left + right + '«‹»›„“‟”"').includes(target.character)
                ) {
                  continue;
                }

                if (neighbor.character === ' ') {
                  if (direction === 'opening') {
                    spaced.push({ character: '\u202f', direction: null });
                    index++;
                  } else {
                    spaced[spaced.length - 1] = { character: '\u202f', direction: null };
                  }
                } else {
                  spaced.push({ character: '\u202f', direction: null });
                }
              }

              characters = spaced;
            }
          }

          return characters.map(({ character }) => character).join('');
        };

        return (text) => {
          if (
            settings.spacing &&
            !/[«‹»›„“‟”"]/u.test(text) &&
            !Array.from(left + right).some((glyph) => text.includes(glyph))
          ) {
            return text;
          }

          const outerLeft = left.charAt(0);
          const outerRight = right.charAt(0);
          const directions = new Map<number, 'opening' | 'closing'>();
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
                  const position = offset + before.length + index;

                  if (!directions.has(position)) {
                    directions.set(position, 'closing');
                  }
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
