<script setup lang="ts">
import { computed } from 'vue';
import type { SparkTone } from './types';

const { data, width = 64, height = 22, tone = 'neutral', label = 'Trend' } = defineProps<{
  data: number[];
  width?: number;
  height?: number;
  tone?: SparkTone;
  /** Accessible name, e.g. "Activity trend for Triage agent". */
  label?: string;
}>();

const strokes = {
  success: 'stroke-success-line',
  warning: 'stroke-warning-line',
  neutral: 'stroke-neutral-line',
  danger: 'stroke-danger',
} as const;

const path = computed(() => {
  if (data.length < 2) return '';
  const min = Math.min(...data);
  const range = Math.max(...data) - min || 1;
  const pad = 1.5;
  return 'M' + data
    .map((v, i) => `${((i / (data.length - 1)) * width).toFixed(1)} ${(pad + (1 - (v - min) / range) * (height - pad * 2)).toFixed(1)}`)
    .join(' L');
});
</script>

<template>
  <svg
    class="block overflow-visible" :width="width" :height="height" :viewBox="`0 0 ${width} ${height}`"
    :role="path ? 'img' : undefined" :aria-label="path ? label : undefined" :aria-hidden="path ? undefined : 'true'"
  >
    <path v-if="path" :d="path" fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" :class="strokes[tone]" />
  </svg>
</template>
