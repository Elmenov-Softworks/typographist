import { memo } from 'react';

import type { TypographistTextProps } from '@/typographist.types.js';
import { useTypographist } from '@/use-typographist.js';

/** Renders source text without a wrapper, preserving it exactly when disabled. */
export const TypographistText = memo(({ text, locale, disabled }: TypographistTextProps<string>) => {
  const formatted = useTypographist(text, locale, disabled);

  return <>{formatted}</>;
});
