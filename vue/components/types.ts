/** Agent / process status. Always rendered as colour + word. */
export type AgentStatus = 'running' | 'idle' | 'waiting' | 'error';

/** Colour of a trend line. */
export type SparkTone = 'success' | 'warning' | 'neutral' | 'danger';

export const STATUS_LABELS = {
  running: 'Running',
  idle: 'Idle',
  waiting: 'Waiting approval',
  error: 'Error',
} as const satisfies Record<AgentStatus, string>;

export const STATUS_TONE = {
  running: 'success',
  idle: 'neutral',
  waiting: 'warning',
  error: 'danger',
} as const satisfies Record<AgentStatus, SparkTone>;
