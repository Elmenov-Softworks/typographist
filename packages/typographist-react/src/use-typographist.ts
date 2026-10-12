import { useContext, useMemo } from 'react';

import { FormatterContext } from '@/provider/formatter-context.js';

/** Formats source text with the nearest provider; disabled skips formatting and locale lookup. */
export const useTypographist = (text: string, locale?: string, disabled = false) => {
  const provider = useContext(FormatterContext);

  if (provider === null) {
    throw new Error('useTypographist requires a TypographistProvider');
  }

  const { formatter, defaultLocale } = provider;
  const effectiveLocale = disabled ? null : (locale ?? defaultLocale);

  return useMemo(
    () => (effectiveLocale === null ? text : formatter.format(text, effectiveLocale)),
    [formatter, text, effectiveLocale],
  );
};
