<script setup lang="ts">
import AuAgentAvatar from './AuAgentAvatar.vue';
import AuSparkline from './AuSparkline.vue';
import AuStatusPill from './AuStatusPill.vue';
import { STATUS_TONE, type AgentStatus } from './types';

const {
  name, role, status = 'idle', activity, mode = 'approval', successRate, actionsToday, trend = [],
} = defineProps<{
  name: string;
  role: string;
  status?: AgentStatus;
  /** What the agent is doing right now. */
  activity: string;
  mode?: 'autonomous' | 'approval';
  /** Already formatted, e.g. "96.8%". */
  successRate: string;
  actionsToday?: number;
  trend?: number[];
}>();
</script>

<template>
  <article :aria-label="name" class="flex min-w-0 flex-col gap-4 rounded-xl border border-border-subtle bg-surface-200 p-5 shadow-(--shadow-card)">
    <div class="flex items-start gap-3">
      <AuAgentAvatar :name="name" />
      <div class="min-w-0 flex-1">
        <div class="truncate text-title text-ink">{{ name }}</div>
        <div class="truncate text-meta text-ink-muted">{{ role }}</div>
      </div>
      <AuStatusPill :status="status" />
    </div>
    <div class="text-body text-ink">{{ activity }}</div>
    <div class="mt-2 flex items-end justify-between gap-3 border-t border-border-subtle pt-4">
      <div class="text-meta text-ink-muted">
        <div>{{ mode === 'autonomous' ? 'Act autonomously' : 'Act with approval' }}</div>
        <div>
          Success <b class="font-mono font-medium tabular-nums text-ink">{{ successRate }}</b>
          <template v-if="actionsToday !== undefined"> · <b class="font-mono font-medium tabular-nums text-ink">{{ actionsToday }}</b> today</template>
        </div>
      </div>
      <AuSparkline :data="trend" :tone="STATUS_TONE[status]" :label="`Activity trend for ${name}`" />
    </div>
  </article>
</template>
