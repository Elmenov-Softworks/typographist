import { createMemo, useContext } from 'solid-js';
import type { Accessor } from 'solid-js';

import { FormatterContext } from '@/provider/formatter-context.js';

/**
 * Returns reactive formatted text, using the nearest provider's default locale when no override is supplied.
 * Disabled defaults to false; true preserves the current source without formatting or locale lookup.
 * Throws when no provider is present, including when disabled.
 */
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
