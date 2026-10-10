import type { FormattingCategory, TextRuleSettings, TypographistConfig } from '@elmenov-softworks/typographist';

const defaultCategories: readonly FormattingCategory[] = [
  'quotes',
  'dashes',
  'punctuation',
  'nonbreakingSpacing',
  'hyphenation',
];

const equalEntries = <TValue>(left: readonly TValue[], right: readonly TValue[]) =>
  left.length === right.length && left.every((value, index) => Object.is(value, right[index]));

const equalSettings = (left: TextRuleSettings, right: TextRuleSettings) => {
  const keys = Object.keys(left);

  return (
    keys.length === Object.keys(right).length &&
    keys.every((key) => Object.hasOwn(right, key) && Object.is(left[key], right[key]))
  );
};

export const configEquivalent = <TCustomLocale extends string>(
  left: TypographistConfig<TCustomLocale>,
  right: TypographistConfig<TCustomLocale>,
) => {
  const leftSettings = left.settings ?? {};
  const rightSettings = right.settings ?? {};
  const settingIds = Object.keys(leftSettings);

  return (
    (left.locale ?? 'en') === (right.locale ?? 'en') &&
    (left.useFast ?? false) === (right.useFast ?? false) &&
    Object.is(left.cacheSize ?? 64, right.cacheSize ?? 64) &&
    equalEntries(left.categories ?? defaultCategories, right.categories ?? defaultCategories) &&
    equalEntries(left.excludedWords ?? [], right.excludedWords ?? []) &&
    equalEntries(left.protectedContent ?? [], right.protectedContent ?? []) &&
    equalEntries(left.textLocales ?? [], right.textLocales ?? []) &&
    equalEntries(left.textRules ?? [], right.textRules ?? []) &&
    (left.rules === right.rules ||
      (left.rules !== undefined && right.rules !== undefined && equalEntries(left.rules, right.rules))) &&
    settingIds.length === Object.keys(rightSettings).length &&
    settingIds.every((id) => {
      const leftRule = leftSettings[id];
      const rightRule = rightSettings[id];

      return leftRule !== undefined && rightRule !== undefined && equalSettings(leftRule, rightRule);
    })
  );
};
