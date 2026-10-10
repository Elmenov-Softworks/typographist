import { computed, inject, toValue } from 'vue';
import type { MaybeRefOrGetter } from 'vue';

import { formatterKey } from '@/provider/formatter-context.js';

export const useTypographist = (text: MaybeRefOrGetter<string>, locale?: MaybeRefOrGetter<string | undefined>) => {
  const formatter = inject(formatterKey);

  if (formatter === undefined) {
    throw new Error('useTypographist requires a TypographistProvider');
  }

  return computed(() => formatter.value.format(toValue(text), toValue(locale)));
};
