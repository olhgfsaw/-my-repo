<script setup lang="ts">
import { STATUS_LABELS, type AgentStatus } from './types';

/** Status pill: dot + word. The default slot replaces the label (e.g. "Due 10-17"). */
const { status = 'idle' } = defineProps<{ status?: AgentStatus }>();

const tones = {
  running: { pill: 'bg-success-bg text-success px-2.25', dot: 'bg-success-line' },
  waiting: { pill: 'bg-warning-bg text-warning px-2.25', dot: 'bg-warning-line' },
  error: { pill: 'bg-danger-bg text-danger px-2.25', dot: 'bg-danger' },
  idle: { pill: 'bg-transparent text-ink-muted px-0.5', dot: 'bg-neutral-line' },
} as const;
</script>

<template>
  <span role="status" class="inline-flex h-5.5 items-center gap-1.5 whitespace-nowrap rounded-pill text-label" :class="tones[status].pill">
    <span aria-hidden="true" class="size-1.5 flex-none rounded-full" :class="tones[status].dot" />
    <slot>{{ STATUS_LABELS[status] }}</slot>
  </span>
</template>
