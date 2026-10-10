import { escape, isServer, ssr } from 'solid-js/web';

import type { TypographistTextProps } from '@/typographist.types.js';
import { useTypographist } from '@/use-typographist.js';

export const TypographistText = (props: TypographistTextProps) => {
  const formatted = useTypographist(
    () => props.text,
    () => props.locale,
  );
  if (isServer) {
    return <>{ssr(escape(formatted()))}</>;
  }

  return <>{formatted()}</>;
};
