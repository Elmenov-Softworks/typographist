import { Typographist, TypographistRules } from '@elmenov-softworks/typographist';
import type { TypographistConfig } from '@elmenov-softworks/typographist';

import { configEquivalent } from '@/provider/config-equivalent.util.js';

export const prepareProvider = <TCustomLocale extends string = never>(
  config: TypographistConfig<TCustomLocale>,
  previous: {
    config: TypographistConfig<TCustomLocale>;
    formatter: Typographist<TCustomLocale>;
    registrationLocales: readonly string[];
    defaultLocale: string;
  } | null = null,
) => {
  if (previous !== null && configEquivalent(previous.config, config, previous.registrationLocales)) {
    return previous;
  }

  const compiledRegistrations: ReturnType<TypographistRules['compile']>[] = [];
  const rules = config.rules?.map((plugin) => {
    if (!(plugin instanceof TypographistRules)) {
      return plugin;
    }

    return new (class extends TypographistRules {
      override compile(useFast: boolean) {
        const compiled = plugin.compile(useFast);
        compiledRegistrations.push(compiled);

        return compiled;
      }
    })();
  });
  const formatter = new Typographist<TCustomLocale>(rules === undefined ? config : { ...config, rules });

  const registrationLocales = rules === undefined ? ['en', 'ru'] : compiledRegistrations.map(({ locale }) => locale);

  registrationLocales.push(...(config.textLocales ?? []).map(({ locale }) => locale));

  return { config, formatter, registrationLocales, defaultLocale: config.locale ?? 'en' };
};
