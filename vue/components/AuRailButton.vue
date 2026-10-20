<script setup lang="ts">
import { computed } from 'vue';

/**
 * Icon button of the 56px rail. Put an <AuIcon :size="18"> into the default slot.
 * `badge` = pending count (e.g. approvals); it is announced in the accessible name.
 */
const { label, active = false, badge, href } = defineProps<{
  label: string;
  active?: boolean;
  badge?: number;
  href?: string;
}>();
const emit = defineEmits<{ click: [event: MouseEvent] }>();

const name = computed(() => (badge ? `${label}, ${badge} pending` : label));
const classes = computed(() => [
  'relative grid size-9 cursor-pointer place-items-center rounded-md',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
  active
    ? 'bg-surface-200 text-ink shadow-(--shadow-card) outline-1 outline-border-subtle'
    : 'text-ink-faint hover:bg-surface-hover hover:text-ink active:bg-surface-hover active:text-ink',
]);
const badgeClass = 'absolute -top-0.75 -right-0.75 h-4 min-w-4 rounded-pill bg-notify px-1 text-center font-mono text-badge text-on-notify ring-2 ring-surface-150';
</script>

<template>
  <a v-if="href" :href="href" :aria-label="name" :title="label" :aria-current="active ? 'page' : undefined" :class="classes" @click="emit('click', $event)">
    <slot />
    <span v-if="badge" aria-hidden="true" :class="badgeClass">{{ badge }}</span>
  </a>
  <button v-else type="button" :aria-label="name" :title="label" :aria-current="active ? 'page' : undefined" :class="classes" @click="emit('click', $event)">
    <slot />
    <span v-if="badge" aria-hidden="true" :class="badgeClass">{{ badge }}</span>
  </button>
</template>
