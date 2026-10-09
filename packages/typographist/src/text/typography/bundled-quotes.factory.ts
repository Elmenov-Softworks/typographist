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
          String.raw`([^\s${quoteGlyphs}][ \t\u00a0\u202f]+|[^\s${quoteGlyphs}]|(?<![${closingGlyphs}])[${closingGlyphs}])([${closingGlyphs}]+)(?=[ \r\n\t\u00a0!?.:;#*,…)\]\\]|$)`,
          'gim',
        );

        const quotationGlyphs = left + right + '«‹»›„“‟”"';
        const hasQuotes = new RegExp(`[${quotationGlyphs.replace(/[\\\]\-^]/g, '\\$&')}]`, 'u');

        const setSpacing = (text: string, directions: ReadonlyMap<number, 'opening' | 'closing'>) => {
          if (!settings.spacing) {
            return text;
          }

          const openingTargets = new Uint8Array(text.length);
          const closingTargets = new Uint8Array(text.length);
          let openingContent = false;
          let closingContent = false;

          for (let offset = 0; offset < text.length; offset++) {
            const before = text.charAt(offset);
            const reverse = text.length - offset - 1;
            const after = text.charAt(reverse);

            if (!/[\t \u00a0\u202f]/u.test(before) && !right.includes(before)) {
              closingContent = !/\s/u.test(before) && !quotationGlyphs.includes(before);
            }

            if (!/[\t \u00a0\u202f]/u.test(after) && !left.includes(after)) {
              openingContent = !/\s/u.test(after) && !quotationGlyphs.includes(after);
            }

            closingTargets[offset] = closingContent ? 1 : 0;
            openingTargets[reverse] = openingContent ? 1 : 0;
          }

          const openingAt = (offset: number) =>
            left.includes(text.charAt(offset)) && (!identicalOuter || directions.get(offset) === 'opening');
          const closingAt = (offset: number) =>
            right.includes(text.charAt(offset)) && (!identicalOuter || directions.get(offset) === 'closing');
          const parts: string[] = [];
          let copied = 0;

          for (let offset = 0; offset < text.length; offset++) {
            const character = text.charAt(offset);

            if (character === ' ') {
              if (
                (offset > 0 && openingAt(offset - 1) && openingTargets[offset] === 1) ||
                (offset + 1 < text.length && closingAt(offset + 1) && closingTargets[offset] === 1)
              ) {
                parts.push(text.slice(copied, offset), '\u202f');
                copied = offset + 1;
              }
            } else if (offset > 0 && !/\s/u.test(character) && !/\s/u.test(text.charAt(offset - 1))) {
              if (
                (openingAt(offset - 1) && openingTargets[offset] === 1) ||
                (closingAt(offset) && closingTargets[offset - 1] === 1)
              ) {
                parts.push(text.slice(copied, offset), '\u202f');
                copied = offset;
              }
            }
          }

          if (copied === 0) {
            return text;
          }

          parts.push(text.slice(copied));

          return parts.join('');
        };

        return (text) => {
          if (!hasQuotes.test(text)) {
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
