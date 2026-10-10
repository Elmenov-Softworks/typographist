import type { Typographist } from '@elmenov-softworks/typographist';
import { createContext, createElement, memo, useContext, useEffect, useMemo, useRef } from 'react';

import { prepareProvider } from '@/provider/prepare-provider.factory.js';
import type { TypographistProviderProps, TypographistTextProps } from '@/typographist.types.js';

const FormatterContext = createContext<Typographist<string> | null>(null);

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

  return createElement(FormatterContext.Provider, { value: prepared.formatter }, children);
};

export const useTypographist = (text: string, locale?: string) => {
  const formatter = useContext(FormatterContext);

  if (formatter === null) {
    throw new Error('useTypographist requires a TypographistProvider');
  }

  return useMemo(() => formatter.format(text, locale), [formatter, text, locale]);
};

export const TypographistText = memo(({ text, locale }: TypographistTextProps<string>) =>
  useTypographist(text, locale),
);
