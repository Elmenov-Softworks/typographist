import { createMemo, useContext } from 'solid-js';
import type { Accessor } from 'solid-js';

import { FormatterContext } from '@/provider/formatter-context.js';

/** Returns reactive formatted text, or the current source while disabled. Requires a provider. */
export const useTypographist = (
  text: Accessor<string>,
  locale?: Accessor<string | undefined>,
  disabled?: Accessor<boolean>,
) => {
  const formatter = useContext(FormatterContext);

  if (formatter === undefined) {
    throw new Error('useTypographist requires a TypographistProvider');
  }

  const source = createMemo(text);
  const effectiveDisabled = createMemo(() => disabled?.() ?? false);
  const effectiveLocale = createMemo(() => {
    if (effectiveDisabled()) {
      return null;
    }

    return locale?.() ?? formatter().defaultLocale;
  });

  return createMemo(() => {
    const currentLocale = effectiveLocale();
    if (currentLocale === null) {
      return source();
    }

    return formatter().formatter.format(source(), currentLocale);
  });
};
