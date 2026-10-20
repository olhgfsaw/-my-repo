# Aurelia — design system reference (for people and AI agents)

This repository is the **source of truth for the look of Aurelia CRM** (company in the examples: *Meridian Supply*). Use it when you build or change UI in any framework.
Read this file first, then open the screen you need.

- **Stack of the reference:** static HTML + plain CSS — `src/style.css` = `src/tokens.css` (CSS variables) + `src/components.css` (shell and component classes). No Tailwind preflight in the screens, so they render exactly as designed.
- **Tailwind v4 theme for apps:** `src/theme.css` maps every token to utilities (`bg-surface-200`, `text-ink-muted`, `rounded-xl`, `text-stat` …).
- **Production components:** Vue 3 SFCs in `vue/` (`Au*`, `<script setup lang="ts">`, Tailwind utilities). Same names, props and look as the Aurelia components.
- **Origin:** the screens and tokens come from the Claude Design canvas *Aurelia CRM*; raw tokens are kept in `design/aurelia/tokens.json`.
- **Language of UI copy:** English. Names, companies and numbers in the screens are sample data — wire real data in production.

---

## 1. Tokens

All tokens are CSS variables on `:root` (`src/tokens.css`), named exactly as in `tokens.json`: `var(--surface-200)`, `var(--ink-muted)`, `var(--radius-xl)`.
In Tailwind they are `--color-<name>` utilities (`bg-surface-200`, `text-ink-muted`, `border-border-subtle`).

**Themes.** Light by default; dark follows the OS (`prefers-color-scheme`) unless `<html data-theme="light">`, and `<html data-theme="dark">` forces dark. Every semantic token switches by itself — components never need `dark:` variants.

### Colours

| Token | Light | Dark | Use |
|---|---|---|---|
| `surface-000` | #ecebea | #0f0f0e | app shell behind every panel, window edge |
| `surface-100` | #f5f5f4 | #161615 | workspace background (main column) |
| `surface-150` | #f0f0ee | #1a1a18 | sidebar and icon rail |
| `surface-200` | #ffffff | #1e1e1c | cards (KPI, agents, tables) — always on `surface-100` |
| `surface-hover` | #e8e7e5 | #262624 | hover and active nav item on `surface-150`; bar track |
| `border-subtle` | #ebeae8 | #262624 | card outline, divider inside a card |
| `border` | #dcdbd8 | #33322f | control outline, panel divider |
| `ink` | #1c1c1a | #f1f0ed | body text, KPI values, names; primary button fill (15.6:1 on surface-100) |
| `ink-muted` | #6b6a66 | #a3a19c | secondary text: labels, roles, meta (≥4.7:1 everywhere) |
| `ink-faint` | #86847f | #8a8883 | nav counters, group headings, rail icons — 3.3:1, **duplicate info only** |
| `agent-mark` | #141413 | #f1f0ed | agent avatar background — the only dark mass of the UI; logo |
| `agent-mark-ink` | #ffffff | #141413 | pixel glyph on `agent-mark` |
| `success` | #2e7a4c | #7fd69c | Running, positive delta (5.2:1 on surface-200) |
| `success-bg` | #e6f3ea | #173322 | Running pill background |
| `success-line` | #3f9d63 | #5fbf80 | sparkline and Running dot (not text) |
| `warning` | #97590a | #f2b956 | “Waiting approval” text (4.9:1 on warning-bg) |
| `warning-bg` | #fcefd9 | #34270f | waiting pill / agent event background |
| `warning-line` | #d99a2b | #e0a540 | sparkline and waiting dot (not text) |
| `danger` | #c23f2b | #f08470 | negative delta, error, overdue (5.2:1 on surface-200) |
| `danger-bg` | #fbe8e4 | #3a1a15 | error / overdue pill background |
| `neutral-line` | #a3a19c | #75736e | Idle dot and sparkline; early pipeline stages |
| `notify` | #bd5a10 | #f39a3c | counter badge on the rail (pending approvals) |
| `on-notify` | #ffffff | #1a1a18 | number on `notify` |
| `chrome` | #d6c7c6 | #3a3232 | dusty-pink window frame around the shell — never inside content |
| `focus` | #1c1c1a | #f1f0ed | 2px focus ring with 2px offset |

There is no brand hue: the UI is warm neutrals + `ink`. Colour is reserved for **status**.

### Typography — Geist (text) and Geist Mono (data), Google Fonts, weights 400/500/600

| Style | Tailwind | Size / line | Weight | Use |
|---|---|---|---|---|
| greeting / page title | `text-display` | 32 / 40, −0.02em | 600 | h1, one per screen (`.h1`) |
| title | `text-title` | 15 / 20 | 600 | card and section titles, agent names (`.h3`) |
| body | `text-body` | 14 / 20 | 400 | nav items, table cells, activity |
| meta | `text-meta` | 13 / 18 | 400 | labels, roles, KPI captions — `ink-muted` |
| label | `text-label` | 12 / 16 | 500 | status pills, nav group headings |
| stat (mono) | `text-stat font-mono` | 24 / 30, −0.01em | 500 | KPI values |
| data (mono) | `text-meta font-mono` | 13 / 18 | 400 | times, dates, percentages, page meta line (`.meta`) |
| count (mono) | `text-count font-mono` | 12 / 16 | 400 | nav counters; deltas use `text-delta` 11 / 14 |

**Every number, date, amount and counter is Geist Mono with tabular figures** (`.mono`, `font-mono tabular-nums`).

### Spacing, radius, shadow
- Spacing (`--space-*`, = Tailwind 4px scale): `1` 4px dot↔text · `2` 8px icon↔label · `3` 12px avatar↔name, card inner steps · `4` 16px grid gap, KPI padding · `5` 20px card padding · `6` 24px between page sections · `8` 32px workspace padding.
- Radius: `sm` 6px nav item · `md` 10px controls, rail button, inputs · `lg` 14px KPI card · `xl` 18px cards, shell · `pill` 999px pills, badges, avatars.
- Shadow: only `--shadow-card` (`0 1px 2px rgba(20,20,19,.04)`, none in dark) on cards. Separation is done with surfaces and `border-subtle`.

---

## 2. Layout rules and patterns

- **Window:** `.frame` (20px padding on `chrome`) → `.shell` (rounded 18px, `surface-150`, 1px `border`).
- **Shell:** `.rail` 56px icon rail (logo + 9 sections, active `.rail-btn.on` = raised white tile, badge for pending approvals) → `.side` 248px contextual sidebar (h2, `.nav` items with mono counters, `.group` headings, stage `.dot`s) → `.main` workspace (`surface-100`, padding 20/32/32, `gap` 24).
- **Top bar** (`.top`): breadcrumbs left (`Meridian Supply / <b>Page</b>`), tools right (search 240px with `⌘K`, segmented control, **one primary button** last). Bottom border `border-subtle`.
- **Page header:** `.h1` + mono `.meta` line joined with “ · ”.
- **Grids:** KPI row `.g4` of `.stat`; `.g3`, `.g2` for card grids; `.split` = wide column (`.wide`, ≥520px) + narrow column (`.narrow`, ≥300px) that wrap.
- **Cards:** `.card` (`surface-200`, `border-subtle`, radius 18, padding 20, gap 16). Card header `.sec-head` = `.h3` + small button/segmented control. Divider inside a card: `.rule`.
- **Tables:** `.tbl-wrap` (scrolls horizontally, `min-width: 820px`); headers 12px `ink-faint`; rows 12px/16px padding; money and dates in `td.num` (mono, right-aligned); row hover `surface-100`.
- **Status = colour + word.** `.pill.ok` Running / Closed won · `.pill.wait` Waiting approval / Negotiation / due today · `.pill.bad` Error / Overdue · `.pill.idle` Idle · `.pill.tag` neutral label (segment, stage). Never colour alone.
- **Pipeline stages:** Qualified, Discovery → `neutral-line`; Proposal → `ink-muted`; Negotiation → `ink`; Closed won → `success-line`; Closed lost → `danger`.
- **Agents** are first-class: avatar = `agent-mark` circle with a pixel glyph; card shows role, status pill, current activity, mode (*Act autonomously* / *Act with approval*), success rate, actions today and a 64×22 sparkline in the status tone. Agent actions that need a human go to **Approvals** and show the `notify` badge.
- **Deltas:** `.up` green / `.down` red mean *good* / *bad*, not direction (sales cycle −3 d is `.up`).
- **Responsive (≤760px):** rail becomes a horizontal scroll row, sidebar stacks above content, `.g4`/`.g3` → 2 columns, `.g2` → 1, workspace padding 16, no frame.
- **Focus:** 2px `focus` outline, 2px offset, on every interactive element.
- **Icons:** stroke icons on a 24 grid, 1.5px stroke, `currentColor`; 18px on the rail, 16px in nav and buttons. No emoji.

---

## 3. File map

```
index.html                     viewer shell (not part of the design)
src/tokens.css                 ALL tokens + dark theme (plain CSS)
src/components.css             shell + screen classes (part 1) and au-* component classes (part 2)
src/style.css                  what every screen loads = tokens + components
src/theme.css                  Tailwind v4 @theme mapping for apps
src/viewer.css, viewer.js      viewer chrome and logic
src/comments.js, api/          pin comments (shared via Upstash Redis)
design/aurelia/tokens.json     raw tokens as exported from the design system
artifacts/
  _all-components.html         UI kit: colours, type, spacing, every component and its states
  pages/
    home.html                  01 Home: greeting, KPI row, pipeline by stage, today's tasks, agent fleet
    pipeline.html              02 Pipeline board: kanban columns (.board .col .col-head) with deal cards (.deal)
    deals.html                 03 Deals list: filter chips, table with selection, stage pills, amounts
    deal.html                  04 Deal detail: stage stepper (.steps), agent suggestion, activity timeline (.tl), details list (.kv), products
    approvals.html             05 Approvals: queue of agent actions (.q .qi), proposed change (.diff), note, approve / reject
    contacts.html              06 Contacts: contact health KPIs, contacts table with engagement pills
    company.html               07 Company account: account numbers, revenue bars (.bars), about (.kv), people, signals
    tasks.html                 08 Tasks and calendar: week calendar (.week .day .ev), open tasks with due pills
    forecast.html              09 Forecast: forecast KPIs, cumulative bookings chart vs quota (.chart), by rep, deals at risk
    agents.html                10 Agent fleet: fleet numbers, agent cards, guardrails with switches (.rule-row .sw), activity log (.log)
vue/                           Vue 3 components (production code), see vue/README.md
scripts/sync-vue-styles.mjs    regenerates vue/styles/aurelia.css from src/tokens.css + src/theme.css
```

Every screen links to the others through the rail and sidebar — the set works as a clickable prototype (open `home.html`).

### Where to find what

| Need | Look at | Class / Vue component |
|---|---|---|
| Buttons (primary, secondary, small) | `_all-components.html` → Buttons, any `.top` | `.btn`, `.btn.primary`, `.btn.sm` / `AuButton` |
| Chips, segmented control, search | `_all-components.html`, `deals.html`, `tasks.html` | `.chip(.on)`, `.seg > span(.on)`, `.search` + `.kbd` |
| Status pills | `_all-components.html` → Status, any table | `.pill.ok/.wait/.bad/.idle/.tag` / `AuStatusPill` |
| KPI cards + deltas | `home.html`, every screen's number row | `.g4 > .stat` (`.lab`, `.val`, `.up/.down`) / `AuStatCard` + `AuDelta` |
| Sparkline | agent cards | `svg .spark` / `AuSparkline` |
| Agent avatar and card | `home.html`, `agents.html` | `.agent`, `.card` pattern / `AuAgentAvatar`, `AuAgentCard` |
| Icon rail | every screen | `.rail > .rail-btn(.on)` + `.badge` / `AuRailButton` + `AuIcon` |
| Sidebar navigation | every screen | `.side > .nav(.on)` (`.l`, `.n`), `.group`, `.dot` / `AuNavItem`, `AuNavSection` |
| Breadcrumbs, page header | every screen | `.crumbs`, `.h1` + `.meta` / `AuBreadcrumb`, `AuPageHeader` |
| Progress bars | `home.html` (pipeline by stage) | `.bar > span` |
| Tables | `deals.html`, `contacts.html` | `.tbl-wrap > table`, `td.num`, `.av` |
| Kanban | `pipeline.html` | `.board`, `.col`, `.col-head`, `.deal` (page styles) |
| Stepper, timeline, key-value list | `deal.html` | `.steps .step`, `.tl`, `.kv` (page styles) |
| Approval queue and diff | `approvals.html` | `.q .qi`, `.diff` (page styles) |
| Charts | `forecast.html`, `company.html` | inline SVG `.chart`, `.bars` (page styles) |
| Calendar | `tasks.html` | `.week .day .dh .ev` (page styles) |
| Switches, activity log | `agents.html` | `.rule-row .sw`, `.log` (page styles) |
| Raw component markup (au-*) | `_all-components.html` → Aurelia components | `.au-pill`, `.au-stat`, `.au-agent`, `.au-nav`, `.au-rail` … |

“Page styles” = a small `<style>` block in the head of that screen; shared classes live in `src/components.css`.

### How to port a screen to a framework
1. Open the screen in `artifacts/pages/` and the matching parts in `_all-components.html`.
2. Shell (`.rail`, `.side`, `.top`) goes to the app layout; replace blocks with the Vue components listed above.
3. Translate classes and inline styles to Tailwind utilities 1:1 — they use only tokens and the spacing scale: `background: var(--surface-200)` → `bg-surface-200`, `color: var(--ink-muted)` → `text-ink-muted`, `padding: 20px` → `p-5`, `border-radius: var(--radius-xl)` → `rounded-xl`, `font: 500 24px/30px var(--font-mono)` → `font-mono text-stat`, `box-shadow: var(--shadow-card)` → `shadow-(--shadow-card)`.
4. Replace sample data with real data.

### Review → build flow with an AI agent
1. Reviewer opens the viewer (Preview or Canvas), presses `C` (or **Comment**) and clicks an element to drop a numbered pin with a comment.
2. **Copy for AI** copies all pins as a structured prompt (screen, element selector, text, position).
3. Paste it into Claude in the frontend repo. Claude follows `CLAUDE_PROMPT.md` (project rules, 4 states, lint/typecheck/build, deploy-ready output).

Comments are shared by the whole team through `/api/comments` (Upstash Redis, see README → “Shared comments”). Without the API (plain `vite` dev or storage not configured) they fall back to the reviewer's browser (`localStorage`).
