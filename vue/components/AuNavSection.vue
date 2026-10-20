<script setup lang="ts">
import { ref } from 'vue';
/** Collapsible group of AuNavItem (e.g. "Stage", "Segment"). */
const { title, defaultOpen = true } = defineProps<{ title: string; defaultOpen?: boolean }>();
const open = ref(defaultOpen);
</script>

<template>
  <div class="mt-3 flex flex-col gap-0.5">
    <button
      type="button" :aria-expanded="open"
      class="flex cursor-pointer items-center gap-1.5 rounded-sm px-2.5 py-1 text-label text-ink-faint hover:text-ink active:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      @click="open = !open"
    >
      <svg viewBox="0 0 10 10" aria-hidden="true" class="size-2.5 transition-transform" :class="!open && '-rotate-90'">
        <path d="M2 3.5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      {{ title }}
    </button>
    <slot v-if="open" />
  </div>
</template>
