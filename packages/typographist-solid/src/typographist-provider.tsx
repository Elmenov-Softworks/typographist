import { createMemo } from 'solid-js';

import { FormatterContext } from '@/provider/formatter-context.js';
import { prepareProvider } from '@/provider/prepare-provider.factory.js';
import type { TypographistProviderProps } from '@/typographist.types.js';

export const TypographistProvider = (props: TypographistProviderProps) => {
  let prepared = prepareProvider(props.config ?? {});
  const formatter = createMemo(() => {
    const replacement = prepareProvider(props.config ?? {}, prepared);
    prepared = replacement;
    return replacement;
  });

  return <FormatterContext.Provider value={formatter}>{props.children}</FormatterContext.Provider>;
};
