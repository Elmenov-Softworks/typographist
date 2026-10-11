import type { FormattingCategory, TextRuleSettings } from '#src/text/typography/text-rule.types.js';
import type { TypographistConfig } from '#src/typographist/typographist-config.types.js';
import { createBundledTextRules } from '#src/text/typography/bundled-text-rules.factory.js';

const defaultCategories: readonly FormattingCategory[] = [
  'quotes',
  'dashes',
  'punctuation',
  'nonbreakingSpacing',
  'hyphenation',
];

const bundledDefaults = new Map<string, { locale: string; settings: TextRuleSettings }[]>();

for (const locale of ['en', 'ru']) {
  for (const rule of createBundledTextRules(locale)) {
    const defaults = bundledDefaults.get(rule.id) ?? [];
    defaults.push({ locale, settings: rule.defaults });
    bundledDefaults.set(rule.id, defaults);
  }
}

const equalEntries = <TValue>(left: readonly TValue[], right: readonly TValue[]) => {
  if (left === right) {
    return true;
  }

  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index++) {
    if (index in left !== index in right || !Object.is(left[index], right[index])) {
      return false;
    }
  }

  return true;
};

const equalSettings = (left: TextRuleSettings, right: TextRuleSettings) => {
  const keys = Object.keys(left);

  return (
    keys.length === Object.keys(right).length &&
    keys.every((key) => Object.hasOwn(right, key) && Object.is(left[key], right[key]))
  );
};

const settingsHaveComparableShape = (settings: unknown) => {
  if (settings === undefined) {
    return true;
  }

  if (typeof settings !== 'object' || settings === null || Array.isArray(settings)) {
    return false;
  }

  return Object.values(settings).every(
    (overrides: unknown) => typeof overrides === 'object' && overrides !== null && !Array.isArray(overrides),
  );
};

const configHasComparableShape = <TCustomLocale extends string>(config: TypographistConfig<TCustomLocale>) => {
  const input: unknown = config;

  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return false;
  }

  const locale: unknown = config.locale;
  const cacheSize: unknown = config.cacheSize;
  const useFast: unknown = config.useFast;

  return (
    locale !== null &&
    cacheSize !== null &&
    useFast !== null &&
    [
      config.categories,
      config.excludedWords,
      config.protectedContent,
      config.textLocales,
      config.textRules,
      config.rules,
    ].every((collection) => collection === undefined || Array.isArray(collection)) &&
    settingsHaveComparableShape(config.settings)
  );
};

export const configEquivalent = <TCustomLocale extends string>(
  left: TypographistConfig<TCustomLocale>,
  right: TypographistConfig<TCustomLocale>,
  registrationLocales: readonly string[],
) => {
  if (left === right) {
    return true;
  }

  if (!configHasComparableShape(right)) {
    return false;
  }

  const hasTextLocales = (left.textLocales?.length ?? 0) > 0 || (right.textLocales?.length ?? 0) > 0;

  if (
    (left.locale ?? 'en') !== (right.locale ?? 'en') ||
    (left.useFast ?? false) !== (right.useFast ?? false) ||
    !Object.is(left.cacheSize ?? 64, right.cacheSize ?? 64) ||
    (hasTextLocales && (left.categories === undefined) !== (right.categories === undefined)) ||
    !equalEntries(left.categories ?? defaultCategories, right.categories ?? defaultCategories) ||
    !equalEntries(left.excludedWords ?? [], right.excludedWords ?? []) ||
    !equalEntries(left.protectedContent ?? [], right.protectedContent ?? []) ||
    !equalEntries(left.textLocales ?? [], right.textLocales ?? []) ||
    !equalEntries(left.textRules ?? [], right.textRules ?? []) ||
    !(
      left.rules === right.rules ||
      (left.rules !== undefined && right.rules !== undefined && equalEntries(left.rules, right.rules))
    )
  ) {
    return false;
  }

  if (left.settings === right.settings) {
    return true;
  }

  const leftSettings = left.settings ?? {};
  const rightSettings = right.settings ?? {};
  const settingIds = new Set([...Object.keys(leftSettings), ...Object.keys(rightSettings)]);

  if (settingIds.size === 0) {
    return true;
  }

  const declaredRules = [...(left.textRules ?? []), ...(left.textLocales ?? []).flatMap((locale) => locale.textRules)];
  const registeredLocales = new Set(registrationLocales.map((locale) => locale.toLowerCase()));

  return [...settingIds].every((id) => {
    const bundledRuleDefaults = bundledDefaults.get(id);
    const defaults = [
      ...(bundledRuleDefaults ?? [])
        .filter(({ locale }) => registeredLocales.has(locale))
        .map(({ settings }) => settings),
      ...declaredRules.filter((rule) => rule.id === id).map((rule) => rule.defaults),
    ];
    const leftRule = leftSettings[id];
    const rightRule = rightSettings[id];

    if (defaults.length === 0) {
      const validationDefaults = bundledRuleDefaults?.at(-1)?.settings;

      if (validationDefaults === undefined) {
        return leftRule !== undefined && rightRule !== undefined && equalSettings(leftRule, rightRule);
      }

      return [leftRule, rightRule].every((settings) =>
        Object.entries(settings ?? {}).every(
          ([name, value]) =>
            Object.hasOwn(validationDefaults, name) && typeof validationDefaults[name] === typeof value,
        ),
      );
    }

    return defaults.every((defaults) => equalSettings({ ...defaults, ...leftRule }, { ...defaults, ...rightRule }));
  });
};
