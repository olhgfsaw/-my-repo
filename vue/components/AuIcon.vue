<script setup lang="ts">
import { computed } from 'vue';
import { ICONS, type IconName } from './icons';

const { name, size = 18, strokeWidth = 1.5, label } = defineProps<{
  name: IconName;
  /** 18 on the rail, 16 in nav and buttons. */
  size?: number;
  strokeWidth?: number;
  /** Accessible name; omit for decorative icons. */
  label?: string;
}>();

const d = computed(() => ICONS[name] ?? ICONS.More);
</script>

<template>
  <svg
    class="block shrink-0"
    :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    :stroke-width="strokeWidth" stroke-linecap="round" stroke-linejoin="round"
    :role="label ? 'img' : undefined" :aria-label="label" :aria-hidden="label ? undefined : 'true'"
  ><path :d="d" /></svg>
</template>
