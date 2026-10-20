// Pin comments for the Aurelia design viewer.
// Works in Preview (one iframe) and Canvas (many scaled iframes).
// Comments are shared through /api/comments (Upstash Redis). If the API is not available
// (plain `vite` dev, storage not configured) they fall back to localStorage.
// They are exported as a ready-to-paste prompt for Claude.
const STORAGE_KEY = 'au.comments';
const API = '/api/comments';
const POLL_MS = 60000;

let ctx = null;
let active = false;
let remote = false; // true once the shared API answered successfully
let comments = loadLocal();
let editing = null; // { draft?: comment, id?: string }

function loadLocal() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}
function cacheLocal() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
}
function rerender() {
  syncToolbar();
  refreshPins();
}

function authorName() {
  let name = localStorage.getItem('au.author');
  if (!name) {
    name = (window.prompt('Your name (shown next to your comments):') || '').trim().slice(0, 40) || 'Anonymous';
    localStorage.setItem('au.author', name);
  }
  return name;
}

async function request(method, { id, all, body } = {}) {
  const url = id ? `${API}?id=${encodeURIComponent(id)}` : all ? `${API}?all=1` : API;
  const send = () => {
    const headers = { 'content-type': 'application/json' };
    const key = localStorage.getItem('au.commentsKey');
    if (key) headers['x-comments-key'] = key;
    return fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  };
  let res = await send();
  if (res.status === 401) {
    const key = (window.prompt('Team key is required to write comments:') || '').trim();
    if (!key) throw new Error('unauthorized');
    localStorage.setItem('au.commentsKey', key);
    res = await send();
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.status === 204 ? null : res.json();
}

/** Pull the shared list. Silently stays in local mode if the API is unavailable. */
async function pull() {
  try {
    const data = await request('GET');
    if (!Array.isArray(data)) throw new Error('not an API response');
    if (!remote) {
      remote = true;
      // First contact with the server: upload comments that were made in local mode.
      const known = new Set(data.map((c) => c.id));
      const local = comments.filter((c) => !known.has(c.id));
      await Promise.allSettled(local.map((c) => request('POST', { body: c })));
      data.push(...local);
    }
    comments = data.sort((a, b) => a.createdAt - b.createdAt);
    cacheLocal();
    rerender();
  } catch {
    if (remote) ctx.toast('Shared comments are offline — showing the last copy');
    remote = false;
  }
}

/** Apply a change locally right away, then sync it. A failed sync is reverted by a fresh pull. */
async function persist(method, args) {
  cacheLocal();
  rerender();
  if (!remote) return;
  try {
    await request(method, args);
  } catch {
    ctx.toast('Could not save to the shared storage');
    await pull();
  }
}

export const isCommentMode = () => active;

function describe(el) {
  if (!el) return { selector: '', text: '' };
  const parts = [];
  let n = el;
  for (let i = 0; n && n.nodeType === 1 && n.tagName !== 'BODY' && i < 3; i += 1, n = n.parentElement) {
    let s = n.tagName.toLowerCase();
    if (n.id) s += `#${n.id}`;
    const cls = [...n.classList].filter((c) => !c.includes('[')).slice(0, 2);
    if (cls.length) s += `.${cls.join('.')}`;
    parts.unshift(s);
  }
  const text = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 60);
  return { selector: parts.join(' > '), text };
}

function titleOf(path) {
  return ctx.items.find((i) => i.path === path)?.title || path;
}

/* ------------------------------ pins rendering ------------------------------ */

function makePin(c, index, left, top) {
  const pin = document.createElement('button');
  pin.type = 'button';
  pin.title = c.author ? `${c.author}: ${c.text}` : c.text;
  pin.setAttribute('aria-label', `Comment ${index + 1}: ${c.text}`);
  pin.className =
    'pointer-events-auto absolute flex size-6 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-2 border-surface-200 bg-notify font-mono text-delta font-semibold text-on-notify shadow-(--shadow-card) hover:scale-110 active:scale-95';
  pin.style.left = `${left}px`;
  pin.style.top = `${top}px`;
  pin.textContent = String(index + 1);
  pin.addEventListener('click', (e) => { e.stopPropagation(); openModal({ id: c.id }); });
  pin.addEventListener('mousedown', (e) => e.stopPropagation());
  return pin;
}

function renderPreviewPins() {
  const layer = ctx.$('preview-pins');
  layer.innerHTML = '';
  if (ctx.state.mode !== 'preview') return;
  const win = ctx.frame.contentWindow;
  const sx = win ? win.scrollX : 0;
  const sy = win ? win.scrollY : 0;
  comments.forEach((c, i) => {
    if (c.path === ctx.state.path) layer.append(makePin(c, i, c.x - sx, c.y - sy));
  });
}

function renderCanvasPins() {
  if (ctx.state.mode !== 'canvas') return;
  const zoom = ctx.state.canvasZoom;
  ctx.canvasGrid.querySelectorAll('.canvas-slot').forEach((slot) => {
    let layer = slot.querySelector(':scope > .pin-layer');
    if (!layer) {
      layer = document.createElement('div');
      layer.className = 'pin-layer pointer-events-none absolute inset-0';
      slot.append(layer);
    }
    layer.innerHTML = '';
    comments.forEach((c, i) => {
      if (c.path === slot.dataset.path) layer.append(makePin(c, i, c.x * zoom, c.y * zoom));
    });
  });
}

export function refreshPins() {
  if (!ctx) return;
  renderPreviewPins();
  renderCanvasPins();
}

/* ------------------------------ placing pins ------------------------------ */

function startDraft({ path, x, y, viewport, el }) {
  const d = describe(el);
  openModal({
    draft: { id: crypto.randomUUID(), path, x: Math.round(x), y: Math.round(y), viewport, selector: d.selector, elementText: d.text, text: '' },
  });
}

function onPreviewClick(e) {
  if (!active || ctx.state.mode !== 'preview') return;
  const layer = ctx.$('preview-pins');
  const rect = layer.getBoundingClientRect();
  const vx = e.clientX - rect.left;
  const vy = e.clientY - rect.top;
  const win = ctx.frame.contentWindow;
  const doc = ctx.frame.contentDocument;
  startDraft({
    path: ctx.state.path,
    x: vx + (win?.scrollX || 0),
    y: vy + (win?.scrollY || 0),
    viewport: Math.round(rect.width),
    el: doc?.elementFromPoint(vx, vy),
  });
}

/** Called by the viewer for every canvas artboard. */
export function attachCanvasSlot(slot, path, iframe, baseW) {
  slot.dataset.path = path;
  slot.addEventListener('click', (e) => {
    if (!active) return;
    const rect = slot.getBoundingClientRect();
    const zoom = ctx.state.canvasZoom;
    const x = (e.clientX - rect.left) / zoom;
    const y = (e.clientY - rect.top) / zoom;
    startDraft({ path, x, y, viewport: baseW, el: iframe.contentDocument?.elementFromPoint(x, y) });
  });
}

/* ------------------------------ modal ------------------------------ */

function openModal(target) {
  editing = target;
  const existing = target.id ? comments.find((c) => c.id === target.id) : null;
  const c = existing || target.draft;
  ctx.$('cm-screen').textContent = `${titleOf(c.path)} · ${c.viewport}px`;
  ctx.$('cm-element').textContent = c.selector ? `${c.selector}${c.elementText ? ` — "${c.elementText}"` : ''}` : `x:${c.x} y:${c.y}`;
  ctx.$('cm-input').value = c.text;
  ctx.$('cm-delete').classList.toggle('hidden', !existing);
  ctx.$('comment-modal').classList.remove('hidden');
  ctx.$('cm-input').focus();
}

function closeModal() {
  editing = null;
  ctx.$('comment-modal').classList.add('hidden');
}

function saveModal() {
  const text = ctx.$('cm-input').value.trim();
  if (!editing || !text) { ctx.$('cm-input').focus(); return; }
  let saved;
  if (editing.draft) {
    saved = { ...editing.draft, text, author: authorName(), createdAt: Date.now() };
    comments.push(saved);
  } else {
    saved = comments.find((x) => x.id === editing.id);
    if (saved) saved.text = text;
  }
  closeModal();
  if (saved) persist('POST', { body: saved });
}

function deleteModal() {
  const id = editing?.id;
  comments = comments.filter((c) => c.id !== id);
  closeModal();
  if (id) persist('DELETE', { id });
}

/* ------------------------------ mode + toolbar ------------------------------ */

function syncToolbar() {
  const n = comments.length;
  ctx.$('comments-badge').textContent = String(n);
  ctx.$('btn-copy-comments').classList.toggle('hidden', n === 0);
  ctx.$('btn-clear-comments').classList.toggle('hidden', n === 0);
}

export function setCommentMode(on) {
  active = on;
  const btn = ctx.$('btn-comment-mode');
  btn.setAttribute('aria-pressed', String(on));
  btn.classList.toggle('vw-btn--primary', on);
  ctx.$('comment-mode-label').textContent = on ? 'Click a screen…' : 'Comment';
  const layer = ctx.$('preview-pins');
  layer.classList.toggle('pointer-events-none', !on);
  layer.classList.toggle('cursor-crosshair', on);
  ctx.canvasWrap.classList.toggle('cursor-crosshair', on);
  ctx.canvasWrap.classList.toggle('cursor-grab', !on);
}

/* ------------------------------ AI prompt ------------------------------ */

export function buildPrompt() {
  const byScreen = new Map();
  comments.forEach((c, i) => {
    if (!byScreen.has(c.path)) byScreen.set(c.path, []);
    byScreen.get(c.path).push({ c, n: i + 1 });
  });
  const lines = [
    '# Task: apply design feedback and build the screens in this project',
    '',
    'Source of truth: `.design-system/` (read `.design-system/DESIGN_SYSTEM.md` first).',
    'Follow the master rules in `.design-system/CLAUDE_PROMPT.md` (project rules, 4 states, verification, deploy-ready build).',
    'The pins below reference elements of the HTML reference screens. Adapt them to our project architecture — do not copy raw HTML.',
    '',
    `## Feedback (${comments.length})`,
  ];
  for (const [path, list] of byScreen) {
    lines.push('', `### ${titleOf(path)} — \`${path.replace(/^\//, '')}\``);
    for (const { c, n } of list) {
      lines.push(`${n}. ${c.text}${c.author ? ` — ${c.author}` : ''}`);
      if (c.selector) lines.push(`   - element: \`${c.selector}\`${c.elementText ? ` ("${c.elementText}")` : ''}`);
      lines.push(`   - position: x=${c.x}, y=${c.y} at ${c.viewport}px viewport`);
    }
  }
  lines.push('', '## Definition of done', 'Run lint + typecheck + `nuxt build`; report using the format from CLAUDE_PROMPT.md.');
  return lines.join('\n');
}

async function copyPrompt() {
  const text = buildPrompt();
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = Object.assign(document.createElement('textarea'), { value: text });
    document.body.append(ta); ta.select(); document.execCommand('copy'); ta.remove();
  }
  ctx.toast(`Prompt copied · ${comments.length} comment(s)`);
}

/* ------------------------------ init ------------------------------ */

export function initComments(context) {
  ctx = context;
  ctx.$('btn-comment-mode').addEventListener('click', () => setCommentMode(!active));
  ctx.$('btn-copy-comments').addEventListener('click', copyPrompt);
  ctx.$('btn-clear-comments').addEventListener('click', () => {
    const scope = remote ? 'for the whole team' : 'locally';
    if (!window.confirm(`Delete all ${comments.length} comments ${scope}?`)) return;
    comments = [];
    persist('DELETE', { all: true });
  });
  ctx.$('cm-save').addEventListener('click', saveModal);
  ctx.$('cm-cancel').addEventListener('click', closeModal);
  ctx.$('cm-close').addEventListener('click', closeModal);
  ctx.$('cm-delete').addEventListener('click', deleteModal);
  ctx.$('comment-modal').addEventListener('mousedown', (e) => { if (e.target === e.currentTarget) closeModal(); });
  ctx.$('cm-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) saveModal();
  });
  ctx.$('preview-pins').addEventListener('click', onPreviewClick);
  ctx.frame.addEventListener('load', () => {
    ctx.frame.contentWindow?.addEventListener('scroll', renderPreviewPins, { passive: true });
    renderPreviewPins();
  });
  window.addEventListener('resize', renderPreviewPins);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (editing) closeModal(); else if (active) setCommentMode(false);
      return;
    }
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '');
    if (!typing && !editing && !e.metaKey && !e.ctrlKey && e.key.toLowerCase() === 'c') setCommentMode(!active);
  });
  syncToolbar();
  pull().then(() => {
    if (!remote) ctx.toast('Comments are stored in this browser only (shared storage is not configured)');
  });
  setInterval(() => { if (!document.hidden) pull(); }, POLL_MS);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) pull(); });
}
