<script setup lang="ts">
import type { TypographistConfig } from '@elmenov-softworks/typographist';
import { provide, shallowRef, watch } from 'vue';

import { formatterKey } from '@/provider/formatter-context.js';
import { prepareProvider } from '@elmenov-softworks/typographist/internal/provider';

const props = defineProps<{ config?: TypographistConfig<string> }>();
const defaultConfig = {};
const formatter = shallowRef(prepareProvider(props.config === undefined ? defaultConfig : props.config));

provide(formatterKey, formatter);

watch(
  () => props.config,
  (config) => {
    formatter.value = prepareProvider(config === undefined ? defaultConfig : config, formatter.value);
  },
);
</script>

<template>
  <slot />
</template>
