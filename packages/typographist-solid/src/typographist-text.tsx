import { escape, isServer, ssr } from 'solid-js/web';

import type { TypographistTextProps } from '@/typographist.types.js';
import { useTypographist } from '@/use-typographist.js';

/** Renders literal text without a wrapper; disabled preserves the current source. */
export const TypographistText = (props: TypographistTextProps) => {
  const formatted = useTypographist(
    () => props.text,
    () => props.locale,
    () => props.disabled ?? false,
  );
  if (isServer) {
    return <>{ssr(escape(formatted()))}</>;
  }

  return <>{formatted()}</>;
};
