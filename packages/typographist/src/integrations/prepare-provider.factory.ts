import type { Locale } from '#src/rules/locale.types.js';
import { Typographist } from '#src/typographist/typographist.js';
import { TypographistRules } from '#src/rules/typographist-rules.js';
import type { TypographistConfig } from '#src/typographist/typographist-config.types.js';

import { configEquivalent } from '#src/integrations/config-equivalent.util.js';

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

  const input: unknown = config;

  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    new Typographist<TCustomLocale>(config);
  }

  const compiledRegistrations: ReturnType<TypographistRules['compile']>[] = [];
  const configuredRules = config.rules;
  const rules = Array.isArray(configuredRules)
    ? configuredRules.map((plugin: TypographistRules<Locale | TCustomLocale>) => {
        if (!(plugin instanceof TypographistRules)) {
          return plugin;
        }

        return new (class extends TypographistRules<Locale | TCustomLocale> {
          override compile(useFast: boolean) {
            const compiled = plugin.compile(useFast);
            compiledRegistrations.push(compiled);

            return compiled;
          }
        })();
      })
    : configuredRules;
  const formatter = new Typographist<TCustomLocale>(rules === undefined ? config : { ...config, rules });

  const registrationLocales =
    rules === undefined
      ? ['en', 'ru', 'es', 'fr', 'de', 'pt', 'it', ...(config.textLocales === undefined ? ['zh'] : [])]
      : compiledRegistrations.map(({ locale }) => locale);

  registrationLocales.push(...(config.textLocales ?? []).map(({ locale }) => locale));

  return { config, formatter, registrationLocales, defaultLocale: config.locale ?? 'en' };
};
