import type { TypographistTextProps } from '@/typographist.types.js';
import { useTypographist } from '@/use-typographist.js';

export const TypographistText = (props: TypographistTextProps) => {
  const formatted = useTypographist(
    () => props.text,
    () => props.locale,
  );
  return <>{formatted()}</>;
};
