import { Typographist } from '@elmenov-softworks/typographist';
import type { TypographistConfig } from '@elmenov-softworks/typographist';

import { configEquivalent } from '@/provider/config-equivalent.util.js';

export const prepareProvider = <TCustomLocale extends string = never>(
  config: TypographistConfig<TCustomLocale>,
  previous: { config: TypographistConfig<TCustomLocale>; formatter: Typographist<TCustomLocale> } | null = null,
) => {
  if (previous !== null && configEquivalent(previous.config, config)) {
    return previous;
  }

  const formatter = new Typographist(config);

  return { config, formatter };
};
