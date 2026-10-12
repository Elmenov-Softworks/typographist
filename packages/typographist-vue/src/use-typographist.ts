import { computed, inject, toValue } from 'vue';
import type { MaybeRefOrGetter } from 'vue';

import { formatterKey } from '@/provider/formatter-context.js';

/**
 * Returns computed formatted text, using the nearest provider's default locale when no override is supplied.
 * Disabled defaults to false; true preserves the current source without formatting or locale lookup.
 * Throws when no provider is present, including when disabled.
 */
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
