import { prepareMinus } from '#src/text/typography/prepare-minus.util.js';
import type { TextRule } from '#src/text/typography/text-rule.types.js';

export const createAlphabeticTypography = (locale: string) => {
  if (!['es', 'fr', 'de', 'pt', 'it'].includes(locale)) {
    return [];
  }

  const rules: TextRule[] = [
    {
      id: `${locale}/dash/minus`,
      category: 'dashes',
      order: 300,
      defaults: {},
      prepare: prepareMinus,
    },
    {
      id: `${locale}/dash/main`,
      category: 'dashes',
      order: 305,
      defaults: {},
      prepare: () => (text) => text.replace(/([ \u00a0])(?:--?|‒|–|—)(?=[ \u00a0])/g, locale === 'de' ? '$1–' : '$1—'),
    },
    {
      id: `${locale}/dash/range`,
      category: 'dashes',
      order: 310,
      defaults: {},
      prepare: () => (text, context) => {
        const prefix = context?.precedingCharacter ?? '';
        const suffix = context?.followingCharacter ?? '';
        const result = (prefix + text + suffix).replace(
          /(?<![\p{L}\p{M}\p{N}_+.,/\u00ad-])(\d+)-(\d+)(?![\p{L}\p{M}\p{N}_+.,/\u00ad-])/gu,
          (match: string, from: string, to: string, offset: number) =>
            offset < prefix.length || offset + match.length > prefix.length + text.length ? match : `${from}–${to}`,
        );

        return result.slice(prefix.length, result.length - suffix.length);
      },
    },
    {
      id: `${locale}/punctuation/apostrophe`,
      category: 'punctuation',
      order: 400,
      defaults: {},
      prepare: () => (text) => text.replace(/(?<=[\p{L}\p{M}])'(?=\p{L})/gu, '’'),
    },
  ];

  if (locale === 'fr') {
    rules.push({
      id: 'fr/nbsp/punctuation',
      category: 'nonbreakingSpacing',
      order: 510,
      defaults: {},
      prepare: () => (text) =>
        text.replace(/([^\s:;!?]) ([;!?])/gu, '$1\u202f$2').replace(/([^\s:;!?]) :/gu, '$1\u00a0:'),
    });
  }

  return rules;
};
