import type { TypographistConfig } from '@elmenov-softworks/typographist';
import type { JSX } from 'solid-js';

export type TypographistProviderProps = {
  config?: TypographistConfig<string>;
  children?: JSX.Element;
};

export type TypographistTextProps = {
  text: string;
  locale?: string | undefined;
  /** Skips formatting and locale lookup while retaining the provider requirement. Defaults to false. */
  disabled?: boolean;
};
