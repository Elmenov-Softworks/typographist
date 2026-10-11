<script setup lang="ts">
import { useTypographist } from '@/use-typographist.js';

const props = defineProps<{ text: string; locale?: string }>();
const formatted = useTypographist(
  () => props.text,
  () => props.locale,
);
</script>

<template>{{ formatted }}</template>
