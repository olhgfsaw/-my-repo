<script setup lang="ts">
import { computed } from 'vue';
/** Page title (one per screen) + mono meta line joined with " · ". */
const { title, meta } = defineProps<{ title: string; meta?: string | string[] }>();
const metaText = computed(() => (meta ? ([] as string[]).concat(meta).join(' · ') : ''));
</script>

<template>
  <header class="flex flex-col gap-1.5">
    <h1 class="m-0 text-display text-balance text-ink">{{ title }}</h1>
    <div v-if="metaText" class="font-mono text-meta tabular-nums text-ink-muted">{{ metaText }}</div>
  </header>
</template>
