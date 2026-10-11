import { useEffect, useMemo, useRef } from 'react';

import { FormatterContext } from '@/provider/formatter-context.js';
import { prepareProvider } from '@elmenov-softworks/typographist/internal/provider';
import type { TypographistProviderProps } from '@/typographist.types.js';

const defaultConfig = {};

export const TypographistProvider = <TCustomLocale extends string = never>({
  config = defaultConfig,
  children,
}: TypographistProviderProps<TCustomLocale>) => {
  const committed = useRef<ReturnType<typeof prepareProvider<TCustomLocale>> | null>(null);
  const prepared = useMemo(() => prepareProvider(config, committed.current), [config]);

  // Abandoned concurrent renders must not replace the last committed configuration.
  useEffect(() => {
    committed.current = prepared;
  }, [prepared]);

  return <FormatterContext.Provider value={prepared}>{children}</FormatterContext.Provider>;
};
