<script setup lang="ts">
import { computed } from 'vue';
/** Agent mark: a mirrored 3×3 pixel glyph derived from the name (same name → same glyph). */
const { name = 'agent', size = 32 } = defineProps<{ name?: string; size?: number }>();

function hash(s: string): number {
  let x = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    x ^= s.charCodeAt(i);
    x = Math.imul(x, 16777619);
  }
  return x >>> 0;
}

const cells = computed(() => {
  const bits = hash(String(name));
  const u = size / 9;
  const out: { x: number; y: number }[] = [];
  for (let r = 0; r < 3; r += 1) {
    for (let c = 0; c < 2; c += 1) {
      const on = r === 1 && c === 1 ? 1 : (bits >> (r * 2 + c)) & 1;
      if (!on) continue;
      const y = size / 2 - u * 2.5 + r * u * 2;
      out.push({ x: size / 2 - u * 2.5 + c * u * 2, y });
      if (c === 0) out.push({ x: size / 2 + u * 1.5, y });
    }
  }
  return { u, out };
});
</script>

<template>
  <span aria-hidden="true" class="inline-grid flex-none place-items-center rounded-pill bg-agent-mark" :style="{ width: `${size}px`, height: `${size}px` }">
    <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`">
      <rect
        v-for="(cell, i) in cells.out" :key="i" class="fill-agent-mark-ink"
        :x="cell.x" :y="cell.y" :width="cells.u" :height="cells.u" :rx="cells.u / 4"
      />
    </svg>
  </span>
</template>
