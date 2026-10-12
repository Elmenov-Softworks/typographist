import { prepareMinus } from '#src/text/typography/prepare-minus.util.js';
import type { TextRule } from '#src/text/typography/text-rule.types.js';

export const createChineseDashes = () => {
  const rules: TextRule[] = [
    {
      id: 'common/dash/minus',
      category: 'dashes',
      order: 300,
      defaults: {},
      prepare: prepareMinus,
    },
    {
      id: 'zh/dash/range',
      category: 'dashes',
      order: 310,
      defaults: {},
      prepare: () => (text, context) => {
        const prefix = context?.precedingCharacter ?? '';
        const suffix = context?.followingCharacter ?? '';
        const result = (prefix + text + suffix).replace(
          /(?<![\p{L}\p{M}\p{N}_+.,/\u00ad-])(\d+)-(\d+)(?![\p{L}\p{M}\p{N}_+.,/\u00ad-])/gu,
          '$1—$2',
        );

        return result.slice(prefix.length, result.length - suffix.length);
      },
    },
  ];

  return rules;
};
