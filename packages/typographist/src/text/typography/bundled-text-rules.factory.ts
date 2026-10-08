import type { TextRule } from '@/text/typography/text-rule.types.js';
import { createBundledDashes } from '@/text/typography/bundled-dashes.factory.js';
import { createBundledNonbreakingSpacing } from '@/text/typography/bundled-nonbreaking-spacing.factory.js';
import { createBundledPunctuation } from '@/text/typography/bundled-punctuation.factory.js';
import { createBundledQuotes } from '@/text/typography/bundled-quotes.factory.js';
import { createBundledSpacing } from '@/text/typography/bundled-spacing.factory.js';

const createLocaleRules = (locale: string) => [
  ...createBundledSpacing(locale),
  ...createBundledDashes(locale),
  ...createBundledPunctuation(locale),
  ...createBundledQuotes(locale),
  ...createBundledNonbreakingSpacing(locale),
];

export const createBundledTextRules = (locale: string, additionalRules: readonly TextRule[] = []) => {
  const rules = [...createLocaleRules(locale), ...additionalRules];
  const ids = new Set(rules.map((rule) => rule.id));

  // Keep other bundled IDs available for settings validation without supplying locale capabilities.
  for (const rule of [...createLocaleRules('en'), ...createLocaleRules('ru')]) {
    if (!ids.has(rule.id)) {
      rules.push({ ...rule, locales: [] });
      ids.add(rule.id);
    }
  }

  return rules;
};
