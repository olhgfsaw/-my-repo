<script setup lang="ts">
/** Breadcrumb: last item is the current page. */
const { items } = defineProps<{ items: string[] }>();
</script>

<template>
  <nav aria-label="Breadcrumb" class="flex flex-wrap items-center gap-2 text-meta text-ink-muted">
    <template v-for="(item, i) in items" :key="i">
      <span v-if="i > 0" aria-hidden="true" class="text-ink-faint">/</span>
      <span :aria-current="i === items.length - 1 ? 'page' : undefined" :class="i === items.length - 1 && 'font-medium text-ink'">{{ item }}</span>
    </template>
  </nav>
</template>
