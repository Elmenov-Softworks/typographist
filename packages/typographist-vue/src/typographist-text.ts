import { defineComponent } from 'vue';

import { useTypographist } from '@/use-typographist.js';

export const TypographistText = defineComponent({
  name: 'TypographistText',
  props: {
    text: { type: String, required: true },
    locale: { type: String, required: false, default: undefined },
  },
  setup(props) {
    const formatted = useTypographist(
      () => props.text,
      () => props.locale,
    );
    return () => formatted.value;
  },
});
