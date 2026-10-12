<script setup lang="ts">
import { useTypographist } from '@/use-typographist.js';

const props = defineProps<{
  text: string;
  locale?: string;
  /** Render source text without formatting or locale lookup. */
  disabled?: boolean;
}>();
const formatted = useTypographist(
  () => props.text,
  () => props.locale,
  () => props.disabled,
);
</script>

<template>{{ formatted }}</template>
