<script setup lang="ts">
/** Button (`.btn` in the screens). One primary per view; link when `href` is set. Icons: <AuIcon :size="14">. */
const { variant = 'secondary', size = 'md', href, type = 'button', disabled = false } = defineProps<{
  variant?: 'primary' | 'secondary';
  size?: 'md' | 'sm';
  href?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}>();

const variants = {
  primary: 'border-ink bg-ink text-surface-200 hover:opacity-90 active:opacity-80',
  secondary: 'border-border bg-surface-200 text-ink hover:bg-surface-hover active:bg-surface-hover',
} as const;
const sizes = {
  md: 'h-8.5 px-3.5 text-meta',
  sm: 'h-7 px-2.5 text-count',
} as const;
</script>

<template>
  <a
    v-if="href" :href="href"
    class="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border font-medium no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
    :class="[variants[variant], sizes[size]]"
  ><slot /></a>
  <button
    v-else :type="type" :disabled="disabled"
    class="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md border font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:cursor-not-allowed disabled:opacity-50"
    :class="[variants[variant], sizes[size]]"
  ><slot /></button>
</template>
