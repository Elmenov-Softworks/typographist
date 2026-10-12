import type { Locale, TypographistConfig } from '@elmenov-softworks/typographist';
import type { ReactNode } from 'react';

export type TypographistProviderProps<TCustomLocale extends string = never> = {
  config?: TypographistConfig<TCustomLocale>;
  children?: ReactNode;
};

export type TypographistTextProps<TCustomLocale extends string = never> = {
  text: string;
  locale?: Locale | TCustomLocale;
  /** Skips formatting and locale lookup. Defaults to false; a provider is still required. */
  disabled?: boolean;
};
