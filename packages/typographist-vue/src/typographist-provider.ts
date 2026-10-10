import type { TypographistConfig } from '@elmenov-softworks/typographist';
import { defineComponent, provide, shallowRef } from 'vue';

import { formatterKey } from '@/provider/formatter-context.js';
import { prepareProvider } from '@/provider/prepare-provider.factory.js';

export const TypographistProvider = defineComponent(
  (props: { config?: TypographistConfig<string> }, { slots }) => {
    let prepared = prepareProvider(props.config === undefined ? {} : props.config);
    const formatter = shallowRef(prepared);
    provide(formatterKey, formatter);

    return () => {
      const replacement = prepareProvider(props.config === undefined ? {} : props.config, prepared);
      prepared = replacement;
      formatter.value = replacement;
      return slots.default?.();
    };
  },
  { name: 'TypographistProvider', props: { config: { type: Object, default: () => ({}) } } },
);
