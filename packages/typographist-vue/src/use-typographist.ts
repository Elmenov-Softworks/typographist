import { computed, inject, toValue } from 'vue';
import type { MaybeRefOrGetter } from 'vue';

import { formatterKey } from '@/provider/formatter-context.js';

/** Returns reactive formatted text, or the current source while disabled. Requires a provider. */
export const useTypographist = (
  text: MaybeRefOrGetter<string>,
  locale?: MaybeRefOrGetter<string | undefined>,
  disabled: MaybeRefOrGetter<boolean> = false,
) => {
  const formatter = inject(formatterKey);

  if (formatter === undefined) {
    throw new Error('useTypographist requires a TypographistProvider');
  }

  const effectiveText = computed(() => toValue(text));
  const effectiveLocale = computed(() => toValue(locale) ?? formatter.value.defaultLocale);

  const effectiveDisabled = computed(() => toValue(disabled));

  return computed(() => {
    if (effectiveDisabled.value) {
      return effectiveText.value;
    }

    return formatter.value.formatter.format(effectiveText.value, effectiveLocale.value);
  });
};
