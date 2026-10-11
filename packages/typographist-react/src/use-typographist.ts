import { useContext, useMemo } from 'react';

import { FormatterContext } from '@/provider/formatter-context.js';

export const useTypographist = (text: string, locale?: string) => {
  const provider = useContext(FormatterContext);

  if (provider === null) {
    throw new Error('useTypographist requires a TypographistProvider');
  }

  const { formatter, defaultLocale } = provider;
  const effectiveLocale = locale ?? defaultLocale;

  return useMemo(() => formatter.format(text, effectiveLocale), [formatter, text, effectiveLocale]);
};
