import { createMemo, useContext } from 'solid-js';
import type { Accessor } from 'solid-js';

import { FormatterContext } from '@/provider/formatter-context.js';

export const useTypographist = (text: Accessor<string>, locale?: Accessor<string | undefined>) => {
  const formatter = useContext(FormatterContext);

  if (formatter === undefined) {
    throw new Error('useTypographist requires a TypographistProvider');
  }

  const source = createMemo(text);
  const effectiveLocale = createMemo(() => locale?.());

  return createMemo(() => formatter().format(source(), effectiveLocale()));
};
