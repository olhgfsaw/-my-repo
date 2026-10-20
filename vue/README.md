# Aurelia — Vue 3 components

Production versions of the components shown in `artifacts/`. Vue 3.5+, `<script setup lang="ts">`, Tailwind CSS v4.1+.

1. Copy this folder into your app (e.g. `src/aurelia/`).
2. Import the theme once: `@import "./aurelia/styles/aurelia.css";` — it contains `@import "tailwindcss"`, the tokens and the theme. If your CSS already imports Tailwind, import `src/tokens.css` + `src/theme.css` from this repo instead.
3. `import { AuButton, AuStatCard } from '@/aurelia'` — or register all with `app.use(Aurelia)`.

| Component | Screen markup | Notes |
|---|---|---|
| `AuButton` | `.btn`, `.btn.primary`, `.btn.sm` | `variant`, `size`, `href` |
| `AuStatusPill` | `.pill.ok/.wait/.bad/.idle` | `status`: running · waiting · error · idle; slot overrides the word |
| `AuDelta` | `.up` / `.down` | `value`, `unit`, `goodWhen: 'down'` for lower-is-better |
| `AuStatCard` | `.stat` | `label`, `value`, `#delta` slot |
| `AuSparkline` | `svg .spark` | `data`, `tone`, `label` |
| `AuAgentAvatar` | `.agent` | glyph derived from `name` |
| `AuAgentCard` | agent card | `name`, `role`, `status`, `activity`, `mode`, `successRate`, `actionsToday`, `trend` |
| `AuRailButton` | `.rail-btn` + `.badge` | `label`, `active`, `badge`, `href`; put `<AuIcon>` inside |
| `AuNavItem`, `AuNavSection` | `.nav`, `.group` | `label`, `count`, `active`, `add`, `href`; `#icon` slot |
| `AuBreadcrumb`, `AuPageHeader` | `.crumbs`, `.h1` + `.meta` | `items` · `title`, `meta` |
| `AuIcon` | rail icons | `name` from `ICON_NAMES`, `size` 18 / 16 |

Props are documented in each `.vue` file and in `../DESIGN_SYSTEM.md`. The components import `computed`/`ref` from `vue` so they work outside Nuxt; in Nuxt you can drop those imports.
