import type { TypographistConfig } from '@elmenov-softworks/typographist';
import type { JSX } from 'solid-js';

/** Configuration and content for a Solid typography provider. */
export type TypographistProviderProps = {
  /** Formatter configuration; omission uses bundled English and Russian rules with English as the default. */
  config?: TypographistConfig<string>;
  /** Content rendered within the provider without an added wrapper. */
  children?: JSX.Element;
};

/** Reactive source text and overrides for TypographistText. */
export type TypographistTextProps = {
  /** Literal source text, preserved exactly when disabled. */
  text: string;
  /** Locale for this text only; omission uses the nearest provider's default. */
  locale?: string | undefined;
  /** Skips formatting and locale lookup while retaining the provider requirement. Defaults to false. */
  disabled?: boolean;
};
