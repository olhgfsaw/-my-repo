<script setup lang="ts">
/**
 * Sidebar item (sits on surface-150). Link when `href` is set, otherwise a button.
 * Icon: <template #icon><AuIcon name="Deals" :size="16" /></template>
 * vue-router: <RouterLink custom v-slot="{ href, isActive, navigate }"><AuNavItem :href="href" :active="isActive" @click="navigate" … /></RouterLink>
 */
const { label, count, active = false, add = false, href } = defineProps<{
  label: string;
  count?: number | string;
  active?: boolean;
  /** Muted "+ Add view" style. */
  add?: boolean;
  href?: string;
}>();
const emit = defineEmits<{ click: [event: MouseEvent] }>();
</script>

<template>
  <a
    v-if="href" :href="href" :aria-current="active ? 'page' : undefined"
    class="flex h-8 w-full items-center gap-2 rounded-sm px-2.5 text-body no-underline hover:bg-surface-hover active:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
    :class="[active && 'bg-surface-hover', add ? 'text-ink-muted' : 'text-ink']"
    @click="emit('click', $event)"
  >
    <span v-if="$slots.icon" aria-hidden="true" class="flex size-4 flex-none text-ink-muted"><slot name="icon" /></span>
    <span class="min-w-0 flex-1 truncate">{{ label }}</span>
    <span v-if="count !== undefined" class="font-mono text-count tabular-nums text-ink-faint">{{ count }}</span>
  </a>
  <button
    v-else type="button" :aria-current="active ? 'page' : undefined"
    class="flex h-8 w-full cursor-pointer items-center gap-2 rounded-sm px-2.5 text-left text-body hover:bg-surface-hover active:bg-surface-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
    :class="[active && 'bg-surface-hover', add ? 'text-ink-muted' : 'text-ink']"
    @click="emit('click', $event)"
  >
    <span v-if="$slots.icon" aria-hidden="true" class="flex size-4 flex-none text-ink-muted"><slot name="icon" /></span>
    <span class="min-w-0 flex-1 truncate">{{ label }}</span>
    <span v-if="count !== undefined" class="font-mono text-count tabular-nums text-ink-faint">{{ count }}</span>
  </button>
</template>
