<script setup lang="ts">
import { computed } from 'vue';
/**
 * Change of a KPI. Green when the change is good, red when bad.
 * `goodWhen="down"` for metrics where lower is better (sales cycle, load).
 */
const { value, unit = '', goodWhen = 'up', label } = defineProps<{
  value: number;
  unit?: string;
  goodWhen?: 'up' | 'down';
  /** Text to show instead of the formatted value. */
  label?: string;
}>();

const text = computed(() => label ?? `${value > 0 ? '+' : value < 0 ? '-' : ''}${Math.abs(value)}${unit}`);
const tone = computed(() => {
  if (value === 0) return 'text-ink-muted';
  const good = goodWhen === 'up' ? value > 0 : value < 0;
  return good ? 'text-success' : 'text-danger';
});
</script>

<template>
  <span class="font-mono text-delta tabular-nums" :class="tone">{{ text }}</span>
</template>
