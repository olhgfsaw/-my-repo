<script setup lang="ts">
/** KPI card. Put an <AuDelta> into the `delta` slot. */
const { label, value } = defineProps<{
  label: string;
  value: string | number;
}>();
</script>

<template>
  <div class="flex min-w-0 flex-col gap-3 rounded-lg border border-border-subtle bg-surface-200 px-4.5 pt-4 pb-4.5 shadow-(--shadow-card)">
    <div class="text-meta text-ink-muted">{{ label }}</div>
    <div class="flex items-baseline gap-1 font-mono text-stat tabular-nums text-ink">
      <span>{{ value }}</span>
      <slot name="delta" />
    </div>
  </div>
</template>
