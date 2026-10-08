import { createAlphabetNormalizer } from '@/languages/analysis/alphabet-normalizer.factory.js';
import { prepareExceptionTable } from '@/languages/exceptions/exception-table.util.js';
import type { LanguageRules } from '@/rules/language-rules.types.js';

export const prepareLanguage = (rules: LanguageRules) => {
  if (typeof rules.alphabet !== 'string' || rules.alphabet.length === 0) {
    throw new TypeError('Rules require a nonempty alphabet');
  }

  if (/[\p{Cs}]/u.test(rules.alphabet)) {
    throw new TypeError('Rules alphabet must contain Unicode scalar values');
  }

  for (const value of [rules.leftMin, rules.rightMin]) {
    if (!Number.isSafeInteger(value) || value < 1) {
      throw new RangeError(`Locale ${rules.locale} requires positive safe integer minima`);
    }
  }

  const { leftMin, rightMin, exceptions: entries = [] } = rules;
  const normalize = createAlphabetNormalizer(rules.alphabet);
  const exceptions = prepareExceptionTable(entries, normalize);

  return { normalize, leftMin, rightMin, exceptionBreaks: exceptions.lookup };
};
