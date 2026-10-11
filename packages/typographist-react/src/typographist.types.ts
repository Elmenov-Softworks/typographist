import type { Locale, TypographistConfig } from '@elmenov-softworks/typographist';
import type { ReactNode } from 'react';

export type TypographistProviderProps<TCustomLocale extends string = never> = {
  config?: TypographistConfig<TCustomLocale>;
  children?: ReactNode;
};

export type TypographistTextProps<TCustomLocale extends string = never> = {
  text: string;
  locale?: Locale | TCustomLocale;
};
