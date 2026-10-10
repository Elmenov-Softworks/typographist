import type { FormattingCategory, TextRuleSettings, TypographistConfig } from '@elmenov-softworks/typographist';

const defaultCategories: readonly FormattingCategory[] = [
  'quotes',
  'dashes',
  'punctuation',
  'nonbreakingSpacing',
  'hyphenation',
];

const bundledDefaults: Readonly<Record<string, readonly TextRuleSettings[]>> = {
  'common/dash/minus': [{}],
  'ru/dash/years': [{ dash: '–' }],
  'ru/dash/time': [{ dash: '–' }],
  'ru/dash/decade': [{ dash: '–' }],
  'ru/dash/directSpeech': [{}],
  'ru/dash/daysMonth': [{ dash: '–' }],
  'ru/dash/centuries': [{ dash: '–' }],
  'ru/dash/weekday': [{ dash: '–' }],
  'ru/dash/month': [{ dash: '–' }],
  'common/punctuation/hellip': [{}],
  'common/punctuation/apostrophe': [{}],
  'common/nbsp/beforeShortLastWord': [{ lengthLastWord: 3 }],
  'common/nbsp/dpi': [{}],
  'common/nbsp/beforeShortLastNumber': [{ lengthLastNumber: 2 }],
  'common/nbsp/afterShortWordByList': [{}],
  'common/nbsp/afterShortWord': [{ lengthShortWord: 2 }],
  'common/nbsp/afterSectionMark': [{}],
  'common/nbsp/afterNumber': [{}],
  'common/nbsp/afterParagraphMark': [{}],
  'ru/nbsp/ps': [{}],
  'ru/nbsp/rubleKopek': [{}],
  'ru/nbsp/year': [{}],
  'ru/nbsp/see': [{}],
  'ru/nbsp/page': [{}],
  'ru/nbsp/ooo': [{}],
  'ru/nbsp/mln': [{}],
  'ru/nbsp/centuries': [{}],
  'ru/nbsp/dayMonth': [{}],
  'ru/nbsp/abbr': [{}],
  'ru/nbsp/addr': [{}],
  'ru/nbsp/afterNumberSign': [{}],
  'ru/nbsp/initials': [{}],
  'ru/nbsp/m': [{}],
  'ru/nbsp/years': [{}],
  'ru/nbsp/beforeParticle': [{}],
  'ru/dash/main': [{}],
  'en-US/dash/main': [{}],
  'common/punctuation/quote': [
    { left: '“‘', right: '”’', spacing: true },
    { left: '«„‚', right: '»“‘', spacing: true },
  ],
};

const equalEntries = <TValue>(left: readonly TValue[], right: readonly TValue[]) =>
  left.length === right.length &&
  Array.from(left).every((value, index) => index in left === index in right && Object.is(value, right[index]));

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
  if (!configHasComparableShape(left) || !configHasComparableShape(right)) {
    return false;
  }

  const leftSettings = left.settings ?? {};
  const rightSettings = right.settings ?? {};
  const settingIds = new Set([...Object.keys(leftSettings), ...Object.keys(rightSettings)]);
  const declaredRules = [...(left.textRules ?? []), ...(left.textLocales ?? []).flatMap((locale) => locale.textRules)];
  const registeredLocales = new Set(registrationLocales.map((locale) => locale.toLowerCase()));
  const quoteDefaults = bundledDefaults['common/punctuation/quote'] ?? [];
  const registeredQuoteDefaults = quoteDefaults.filter((_, index) =>
    registrationLocales.some((locale) => locale.toLowerCase() === (index === 0 ? 'en' : 'ru')),
  );
  const hasTextLocales = (left.textLocales?.length ?? 0) > 0 || (right.textLocales?.length ?? 0) > 0;

  return (
    (left.locale ?? 'en') === (right.locale ?? 'en') &&
    (left.useFast ?? false) === (right.useFast ?? false) &&
    Object.is(left.cacheSize ?? 64, right.cacheSize ?? 64) &&
    (!hasTextLocales || (left.categories === undefined) === (right.categories === undefined)) &&
    equalEntries(left.categories ?? defaultCategories, right.categories ?? defaultCategories) &&
    equalEntries(left.excludedWords ?? [], right.excludedWords ?? []) &&
    equalEntries(left.protectedContent ?? [], right.protectedContent ?? []) &&
    equalEntries(left.textLocales ?? [], right.textLocales ?? []) &&
    equalEntries(left.textRules ?? [], right.textRules ?? []) &&
    (left.rules === right.rules ||
      (left.rules !== undefined && right.rules !== undefined && equalEntries(left.rules, right.rules))) &&
    [...settingIds].every((id) => {
      const defaults = [
        ...(id === 'common/punctuation/quote'
          ? registeredQuoteDefaults
          : (bundledDefaults[id] ?? []).filter(() =>
              id.startsWith('ru/')
                ? registeredLocales.has('ru')
                : id.startsWith('en-US/')
                  ? registeredLocales.has('en')
                  : registeredLocales.has('en') || registeredLocales.has('ru'),
            )),
        ...declaredRules.filter((rule) => rule.id === id).map((rule) => rule.defaults),
      ];
      const leftRule = leftSettings[id];
      const rightRule = rightSettings[id];

      if (id === 'common/punctuation/quote' && defaults.length === 0) {
        const validationDefaults = quoteDefaults[0] ?? {};
        return [leftRule, rightRule].every((settings) =>
          Object.entries(settings ?? {}).every(
            ([name, value]) =>
              Object.hasOwn(validationDefaults, name) && typeof validationDefaults[name] === typeof value,
          ),
        );
      }

      if (defaults.length === 0) {
        return leftRule !== undefined && rightRule !== undefined && equalSettings(leftRule, rightRule);
      }

      return defaults.every((defaults) => equalSettings({ ...defaults, ...leftRule }, { ...defaults, ...rightRule }));
    })
  );
};
