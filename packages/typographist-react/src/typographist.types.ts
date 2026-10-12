import type { Locale, TypographistConfig } from '@elmenov-softworks/typographist';
import type { ReactNode } from 'react';

/** Configuration and content for a React typography provider. */
export type TypographistProviderProps<TCustomLocale extends string = never> = {
  /** Formatter configuration; omission uses bundled English and Russian rules with English as the default. */
  config?: TypographistConfig<TCustomLocale>;
  /** Content rendered within the provider without an added wrapper. */
  children?: ReactNode;
};

/** Source text and per-render overrides for TypographistText. */
export type TypographistTextProps<TCustomLocale extends string = never> = {
  /** Literal source text, preserved exactly when disabled. */
  text: string;
  /** Locale for this text only; omission uses the nearest provider's default. */
  locale?: Locale | TCustomLocale;
  /** Skips formatting and locale lookup. Defaults to false; a provider is still required. */
  disabled?: boolean;
};
