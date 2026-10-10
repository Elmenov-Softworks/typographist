import { computed, inject, toValue } from 'vue';
import type { MaybeRefOrGetter } from 'vue';

import { formatterKey } from '@/provider/formatter-context.js';

export const useTypographist = (text: MaybeRefOrGetter<string>, locale?: MaybeRefOrGetter<string | undefined>) => {
  const formatter = inject(formatterKey);

  if (formatter === undefined) {
    throw new Error('useTypographist requires a TypographistProvider');
  }

  const effectiveText = computed(() => toValue(text));
  const effectiveLocale = computed(() => toValue(locale) ?? formatter.value.defaultLocale);

  return computed(() => formatter.value.formatter.format(effectiveText.value, effectiveLocale.value));
};
