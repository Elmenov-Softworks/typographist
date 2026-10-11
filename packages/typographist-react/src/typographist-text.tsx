import { memo } from 'react';

import type { TypographistTextProps } from '@/typographist.types.js';
import { useTypographist } from '@/use-typographist.js';

export const TypographistText = memo(({ text, locale }: TypographistTextProps<string>) => {
  const formatted = useTypographist(text, locale);

  return <>{formatted}</>;
});
