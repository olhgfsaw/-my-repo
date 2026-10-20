# Aurelia design system

Aurelia CRM: 10 reference screens, UI kit, tokens and Vue 3 components, with a local viewer.

```bash
pnpm install   # or npm install
pnpm dev       # http://localhost:5173
pnpm build     # static site in dist/
pnpm preview
```

**Viewer:** pick a screen on the left; switch Mobile / Tablet / Desktop, Light / Dark, Preview / Canvas / Code; "Copy HTML" copies the page body. Links inside a screen work like a prototype — the viewer follows them.

**Deploy:** Vercel and Cloudflare Pages detect Vite — build command `pnpm build`, output directory `dist`.

- `DESIGN_SYSTEM.md` — tokens, rules and file map (start here, also for AI agents).
- `artifacts/pages/` — the 10 screens: Home, Pipeline board, Deals list, Deal detail, Approvals, Contacts, Company account, Tasks and calendar, Forecast, Agent fleet.
- `artifacts/_all-components.html` — UI kit: colours, type, spacing, every component and its states.
- `src/tokens.css` · `src/components.css` · `src/style.css` — what the screens load (plain CSS). `src/theme.css` — Tailwind v4 theme for apps.
- `vue/` — production Vue 3 components (`AuButton`, `AuStatCard`, `AuAgentCard`, …). After changing tokens run `pnpm sync:vue`.
- `CLAUDE_PROMPT.md` — master prompt for building these screens in the frontend repo.

## Shared comments (pins)

Pins are stored in Upstash Redis through the serverless function `api/comments.js`; everyone who opens the site sees the same pins (refresh every 60 s and when you return to the tab).

1. Vercel → your project → **Storage** (or Marketplace) → **Upstash Redis** → free plan → connect to the project. Vercel adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` itself.
2. Optional: add `COMMENTS_WRITE_KEY` (Project → Settings → Environment Variables) — then writing needs this key (asked once in the browser); reading stays open. Without it anyone with the link can write.
3. Redeploy. If the storage is not connected, the viewer silently falls back to `localStorage` and says so once.

Local dev: `vercel env pull .env.local && vercel dev` (plain `pnpm dev` has no `/api`, so it uses `localStorage`). See `.env.example`.
