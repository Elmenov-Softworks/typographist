import { createContext, createElement, memo, useContext, useEffect, useMemo, useRef } from 'react';

import { prepareProvider } from '@/provider/prepare-provider.factory.js';
import type { TypographistProviderProps, TypographistTextProps } from '@/typographist.types.js';

const FormatterContext = createContext<ReturnType<typeof prepareProvider<string>> | null>(null);

export const TypographistProvider = <TCustomLocale extends string = never>({
  config = {},
  children,
}: TypographistProviderProps<TCustomLocale>) => {
  const committed = useRef<ReturnType<typeof prepareProvider<TCustomLocale>> | null>(null);
  const prepared = useMemo(() => prepareProvider(config, committed.current), [config]);

  // Abandoned concurrent renders must not replace the last committed configuration.
  useEffect(() => {
    committed.current = prepared;
  }, [prepared]);

  return createElement(FormatterContext.Provider, { value: prepared }, children);
};

export const useTypographist = (text: string, locale?: string) => {
  const provider = useContext(FormatterContext);

  if (provider === null) {
    throw new Error('useTypographist requires a TypographistProvider');
  }

  const { formatter, defaultLocale } = provider;
  const effectiveLocale = locale ?? defaultLocale;

  return useMemo(() => formatter.format(text, effectiveLocale), [formatter, text, effectiveLocale]);
};

export const TypographistText = memo(({ text, locale }: TypographistTextProps<string>) =>
  useTypographist(text, locale),
);
