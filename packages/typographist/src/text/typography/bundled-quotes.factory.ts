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
        const outerLeft = left.charAt(0);
        const outerRight = right.charAt(0);
        const identicalOuter = outerLeft === outerRight;
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

        const nestingQuotes = new RegExp(
          '[' + (outerLeft + outerRight + '"').replace(/[\\\]\-^]/g, '\\$&') + ']',
          'gu',
        );

        const spacingQuotes = new RegExp('[' + (left + right).replace(/[\\\]\-^]/g, '\\$&') + ']', 'gu');

        const setSpacing = (text: string, directions: ReadonlyMap<number, 'opening' | 'closing'>) => {
          if (!settings.spacing) {
            return text;
          }

          const whitespace = /\s/u;
          const gap = (character: string) =>
            character === ' ' || character === '\t' || character === '\u00a0' || character === '\u202f';
          // Reuse skipped quote runs as boundaries advance, keeping nested spacing linear.
          let openingEnd = -1;
          let openingContent = false;
          let lastClosingOffset = -1;
          let closingContent = false;

          const openingContentAt = (offset: number) => {
            if (offset > openingEnd) {
              openingEnd = offset;

              while (
                openingEnd < text.length &&
                (gap(text.charAt(openingEnd)) || left.includes(text.charAt(openingEnd)))
              ) {
                openingEnd += 1;
              }

              const character = text.charAt(openingEnd);
              openingContent =
                openingEnd < text.length && !whitespace.test(character) && !quotationGlyphs.includes(character);
            }

            return openingContent;
          };

          const closingContentAt = (offset: number) => {
            let position = offset;

            while (
              position > lastClosingOffset &&
              (gap(text.charAt(position)) || right.includes(text.charAt(position)))
            ) {
              position -= 1;
            }

            if (position > lastClosingOffset) {
              const character = text.charAt(position);
              closingContent = !whitespace.test(character) && !quotationGlyphs.includes(character);
            }

            lastClosingOffset = offset;

            return closingContent;
          };
          const parts: string[] = [];
          let copied = 0;
          let lastBoundary = -1;
          const bind = (offset: number, replaced: number) => {
            if (offset === lastBoundary) {
              return;
            }

            parts.push(text.slice(copied, offset), '\u202f');
            copied = offset + replaced;
            lastBoundary = offset;
          };

          for (const match of text.matchAll(spacingQuotes)) {
            const offset = match.index;
            const character = match[0];

            if (offset > 0 && right.includes(character) && (!identicalOuter || directions.get(offset) === 'closing')) {
              const before = text.charAt(offset - 1);

              if ((before === ' ' || !whitespace.test(before)) && closingContentAt(offset - 1)) {
                bind(before === ' ' ? offset - 1 : offset, before === ' ' ? 1 : 0);
              }
            }

            if (
              offset + 1 < text.length &&
              left.includes(character) &&
              (!identicalOuter || directions.get(offset) === 'opening')
            ) {
              const after = text.charAt(offset + 1);

              if ((after === ' ' || !whitespace.test(after)) && openingContentAt(offset + 1)) {
                bind(offset + 1, after === ' ' ? 1 : 0);
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
          const result = normalized.replace(nestingQuotes, (character: string, offset: number) => {
            const direction = directions.get(offset);

            if (identicalOuter ? direction === 'opening' : character === outerLeft) {
              const quote = left.charAt(Math.min(level, maxLevel - 1));
              level = Math.min(level + 1, maxLevel);

              return quote;
            } else if (identicalOuter ? direction === 'closing' : character === outerRight) {
              level = Math.max(0, level - 1);

              return right.charAt(level);
            }

            if (character === '"') {
              level = 0;
            }

            return character;
          });

          return setSpacing(result, directions);
        };
      },
    },
  ];

  return rules;
};
