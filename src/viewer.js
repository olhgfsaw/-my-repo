import { initComments, isCommentMode, attachCanvasSlot, refreshPins } from './comments.js';

// Aurelia design viewer — lists every /artifacts/**/*.html file and previews it in an iframe.
const sources = import.meta.glob('/artifacts/**/*.html', { query: '?raw', import: 'default', eager: true });

const HOME = '/artifacts/pages/home.html';
const KIT = '/artifacts/_all-components.html';

const GROUPS = [
  { name: 'Screens', test: (p) => p.startsWith('/artifacts/pages/') },
  { name: 'UI Kit', test: (p) => p === KIT },
  { name: 'Components', test: (p) => p.startsWith('/artifacts/components/') },
  { name: 'Other', test: () => true },
];

const items = Object.entries(sources)
  .map(([path, raw]) => {
    const t = /<title>([^<]*)<\/title>/i.exec(raw);
    const title = (t ? t[1] : path.split('/').pop()).replace(/^Aurelia CRM — /, '');
    return { path, raw, title, group: GROUPS.find((g) => g.test(path)).name };
  })
  .sort((a, b) => a.title.localeCompare(b.title)); // screen titles start with "01 ·", "02 ·" …

const $ = (id) => document.getElementById(id);
const frame = $('frame'), wrap = $('frame-wrap'), code = $('code');
const canvasWrap = $('canvas-wrap'), canvasGrid = $('canvas-grid'), canvasZoomGroup = $('canvas-zoom-group');
const cZoomVal = $('c-zoom-val'), wheelToggleBtn = $('c-wheel-toggle');

const store = {
  get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
};
const savedDark = store.get('au.dark');

const state = {
  path: null,
  width: store.get('au.width') || '100%',
  mode: store.get('au.mode') || 'preview',
  canvasZoom: Number(store.get('au.canvasZoom')) || 0.3,
  wheelZoom: store.get('au.wheelZoom') !== '0', // Default: true (wheel zooms)
  // Follow the OS until the user picks a theme in the viewer.
  dark: savedDark === null ? window.matchMedia('(prefers-color-scheme: dark)').matches : savedDark === '1',
};

/** Artboard width in Canvas mode. Desktop = the 1440px frame the screens were designed at. */
const baseWidth = () => (state.width === '375px' ? 375 : state.width === '768px' ? 768 : 1440);

function renderNav(filter = '') {
  const q = filter.trim().toLowerCase();
  const nav = $('nav');
  nav.innerHTML = '';
  for (const g of GROUPS) {
    const list = items.filter((i) => i.group === g.name && (!q || (i.title + i.path).toLowerCase().includes(q)));
    if (!list.length) continue;
    const h = document.createElement('div');
    h.className = 'px-2 pt-4 pb-1 text-label text-ink-faint';
    h.textContent = g.name;
    nav.append(h);
    for (const i of list) {
      const a = document.createElement('a');
      a.href = '#' + i.path;
      a.textContent = i.title;
      const on = state.mode !== 'canvas' && i.path === state.path;
      a.className = 'block truncate rounded-sm px-2.5 py-1.5 text-body no-underline text-ink ' +
        (on ? 'bg-surface-hover font-medium' : 'hover:bg-surface-hover');
      if (on) a.setAttribute('aria-current', 'page');
      nav.append(a);
    }
  }
  $('count').textContent = items.length + ' artifacts';
}

/** The viewer and every preview share one explicit theme: data-theme="light" | "dark". */
function setTheme(doc) {
  if (doc && doc.documentElement) doc.documentElement.dataset.theme = state.dark ? 'dark' : 'light';
}

function applyTheme() {
  setTheme(document);
  try { setTheme(frame.contentDocument); } catch { /* not loaded yet */ }
  canvasGrid?.querySelectorAll('iframe').forEach((f) => {
    try { setTheme(f.contentDocument); } catch { /* not loaded yet */ }
  });
  $('theme').setAttribute('aria-pressed', String(state.dark));
  $('theme-label').textContent = state.dark ? 'Light' : 'Dark';
}

function setPressed(attr, value) {
  document.querySelectorAll(`[data-${attr}]`).forEach((b) => {
    const on = b.dataset[attr] === value;
    b.classList.toggle('vw-seg__item--on', on);
    b.setAttribute('aria-pressed', String(on));
  });
}

function setCanvasZoom(z) {
  state.canvasZoom = Math.min(Math.max(Number(z), 0.15), 1.5);
  store.set('au.canvasZoom', String(state.canvasZoom));
  if (cZoomVal) cZoomVal.textContent = Math.round(state.canvasZoom * 100) + '%';

  const baseW = baseWidth();
  const zoom = state.canvasZoom;

  // Smooth scaling without reloading iframes
  if (canvasGrid && canvasGrid.children.length > 0) {
    canvasGrid.querySelectorAll('.canvas-card').forEach((card) => {
      const slot = card.querySelector('.canvas-slot');
      const frameInner = card.querySelector('.canvas-frame-inner');
      const iframe = card.querySelector('iframe');
      const fullH = Number(iframe?.dataset.height) || 1040;
      if (slot && frameInner) {
        slot.style.width = `${Math.round(baseW * zoom)}px`;
        slot.style.height = `${Math.round(fullH * zoom)}px`;
        frameInner.style.transform = `scale(${zoom})`;
      }
    });
  } else if (state.mode === 'canvas') {
    renderCanvas();
  }
  refreshPins();
}

function renderCanvas() {
  if (!canvasGrid) return;

  // Screens to show on canvas: all screens + UI kit
  const canvasItems = items.filter((i) => i.group === 'Screens' || i.path === KIT);

  const baseW = baseWidth();
  const initialH = 1040;
  const zoom = state.canvasZoom;

  canvasGrid.innerHTML = '';
  canvasItems.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'canvas-card flex flex-col gap-2 transition-transform';

    const header = document.createElement('div');
    header.className = 'flex items-center justify-between px-1 text-count select-none';
    header.innerHTML = `
      <div class="flex min-w-0 items-center gap-2">
        <span class="flex size-5 flex-none items-center justify-center rounded-pill bg-agent-mark font-mono text-delta text-agent-mark-ink">${index + 1}</span>
        <span class="truncate text-label text-ink">${item.title}</span>
        <span class="vw-badge">${item.group}</span>
      </div>
      <div class="flex flex-none items-center gap-2">
        <span class="screen-res-badge font-mono text-ink-muted">${baseW}px</span>
        <button type="button" class="cursor-pointer text-label text-ink hover:underline" data-focus="${item.path}">Focus ⤢</button>
        <a href="${item.path}" target="_blank" rel="noopener" class="text-ink-muted hover:text-ink" aria-label="Open ${item.title} in a new tab">↗</a>
      </div>
    `;

    // Slot wrapper — sized to full content height, non-clickable preview, double-click to preview
    const slot = document.createElement('div');
    slot.className = 'canvas-slot group relative cursor-pointer overflow-hidden rounded-lg border border-border bg-surface-200 shadow-(--shadow-card) transition-all hover:border-ink';
    slot.style.width = `${Math.round(baseW * zoom)}px`;
    slot.style.height = `${Math.round(initialH * zoom)}px`;
    slot.title = 'Double-click to open in Preview mode';
    slot.addEventListener('dblclick', () => {
      if (isCommentMode()) return;
      state.path = item.path;
      state.mode = 'preview';
      location.hash = '#' + state.path;
      render();
    });

    // Inner frame with pointer-events: none (prevents clicks inside the screen)
    const frameInner = document.createElement('div');
    frameInner.className = 'canvas-frame-inner pointer-events-none select-none';
    frameInner.style.width = `${baseW}px`;
    frameInner.style.height = `${initialH}px`;
    frameInner.style.transform = `scale(${zoom})`;
    frameInner.style.transformOrigin = 'top left';

    const iframe = document.createElement('iframe');
    iframe.src = item.path;
    iframe.title = item.title;
    iframe.loading = 'lazy';
    iframe.className = 'w-full border-0 pointer-events-none select-none';
    iframe.style.width = `${baseW}px`;
    iframe.style.height = `${initialH}px`;

    // Expand the iframe to its full natural height (no internal scrollbars)
    function syncFullHeight() {
      try {
        const doc = iframe.contentDocument;
        if (!doc) return;
        setTheme(doc);
        if (doc.documentElement) {
          doc.documentElement.style.overflow = 'hidden';
          doc.documentElement.style.height = 'auto';
        }
        if (doc.body) {
          doc.body.style.overflow = 'hidden';
          doc.body.style.height = 'auto';
        }
        const fullH = Math.max(
          doc.documentElement ? doc.documentElement.scrollHeight : 0,
          doc.body ? doc.body.scrollHeight : 0,
          600
        );
        iframe.dataset.height = String(fullH);
        frameInner.style.height = `${fullH}px`;
        iframe.style.height = `${fullH}px`;
        slot.style.height = `${Math.round(fullH * state.canvasZoom)}px`;
        const resEl = card.querySelector('.screen-res-badge');
        if (resEl) resEl.textContent = `${baseW} × ${fullH}`;
      } catch (e) {}
    }

    iframe.addEventListener('load', () => {
      syncFullHeight();
      setTimeout(syncFullHeight, 150);
      setTimeout(syncFullHeight, 500);
    });

    frameInner.appendChild(iframe);
    slot.appendChild(frameInner);
    attachCanvasSlot(slot, item.path, iframe, baseW);
    card.appendChild(header);
    card.appendChild(slot);
    canvasGrid.appendChild(card);
  });

  // Attach focus clicks
  canvasGrid.querySelectorAll('[data-focus]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      state.path = btn.dataset.focus;
      state.mode = 'preview';
      location.hash = '#' + state.path;
      render();
    });
  });

  if (cZoomVal) cZoomVal.textContent = Math.round(state.canvasZoom * 100) + '%';
  refreshPins();
}

function updateWheelToggleBtn() {
  if (!wheelToggleBtn) return;
  wheelToggleBtn.classList.toggle('vw-seg__item--on', state.wheelZoom);
  wheelToggleBtn.textContent = state.wheelZoom ? 'Wheel: Zoom' : 'Wheel: Scroll';
}

function render() {
  store.set('au.mode', state.mode);

  if (state.mode === 'canvas') {
    $('title').textContent = 'Canvas · All screens';
    $('crumb').textContent = 'Overview · Simultaneous view';
    $('open').href = '/#canvas';
    wrap.classList.add('hidden');
    code.classList.add('hidden');
    canvasWrap.classList.remove('hidden');
    canvasZoomGroup.classList.remove('hidden');
    setPressed('width', state.width);
    setPressed('mode', 'canvas');
    updateWheelToggleBtn();
    renderCanvas();
    renderNav($('search').value);
    return;
  }

  // Normal preview / code mode
  const item = items.find((i) => i.path === state.path) || items[0];
  if (!item) return;
  state.path = item.path;
  $('title').textContent = item.title;
  $('crumb').textContent = item.group + ' · ' + item.path.replace('/artifacts/', '');
  $('open').href = item.path;
  if (frame.dataset.src !== item.path) {
    frame.dataset.src = item.path;
    frame.src = item.path;
  }
  code.querySelector('code').textContent = item.raw;
  wrap.style.width = state.width;
  wrap.classList.toggle('hidden', state.mode !== 'preview');
  code.classList.toggle('hidden', state.mode !== 'code');
  canvasWrap.classList.add('hidden');
  canvasZoomGroup.classList.add('hidden');
  setPressed('width', state.width);
  setPressed('mode', state.mode);
  renderNav($('search').value);
  refreshPins();
}

function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => (t.style.opacity = '0'), 1600);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = Object.assign(document.createElement('textarea'), { value: text });
    document.body.append(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
}

async function copyHtml() {
  if (state.mode === 'canvas') {
    await copyText(window.location.origin + '/#canvas');
    toast('Canvas URL copied');
    return;
  }
  const item = items.find((i) => i.path === state.path);
  if (!item) return;
  await copyText(new DOMParser().parseFromString(item.raw, 'text/html').body.innerHTML.trim());
  toast('Body HTML copied');
}

// Screens link to each other. When a link is clicked inside the preview,
// follow it in the viewer too, so the title, code and pins match the screen.
frame.addEventListener('load', () => {
  applyTheme();
  let p = null;
  try { p = frame.contentWindow?.location.pathname; } catch { /* cross-origin */ }
  if (p && p !== state.path && items.some((i) => i.path === p)) {
    frame.dataset.src = p;
    location.hash = '#' + p;
  }
});

window.addEventListener('hashchange', () => {
  const h = decodeURIComponent(location.hash.slice(1));
  if (h === 'canvas') {
    state.mode = 'canvas';
  } else if (h) {
    state.path = h;
    if (state.mode === 'canvas') state.mode = 'preview';
  }
  render();
});

$('search').addEventListener('input', (e) => renderNav(e.target.value));
$('theme').addEventListener('click', () => {
  state.dark = !state.dark;
  store.set('au.dark', state.dark ? '1' : '0');
  applyTheme();
});
$('copy').addEventListener('click', copyHtml);

$('sidebar-canvas').addEventListener('click', () => {
  state.mode = 'canvas';
  location.hash = '#canvas';
  render();
});

// Canvas zoom buttons
$('c-zoom-in')?.addEventListener('click', () => setCanvasZoom(state.canvasZoom + 0.05));
$('c-zoom-out')?.addEventListener('click', () => setCanvasZoom(state.canvasZoom - 0.05));
$('c-zoom-fit')?.addEventListener('click', () => {
  const stageW = $('stage').clientWidth - 64;
  const cols = stageW > 1200 ? 3 : (stageW > 800 ? 2 : 1);
  const fitZoom = Math.min((stageW / cols - 32) / baseWidth(), 0.6);
  setCanvasZoom(Math.max(fitZoom, 0.15));
});
$('c-zoom-100')?.addEventListener('click', () => setCanvasZoom(1.0));

// Toggle wheel behavior (Zoom vs Scroll)
wheelToggleBtn?.addEventListener('click', () => {
  state.wheelZoom = !state.wheelZoom;
  store.set('au.wheelZoom', state.wheelZoom ? '1' : '0');
  updateWheelToggleBtn();
  toast(state.wheelZoom ? 'Mouse wheel zooms canvas' : 'Mouse wheel scrolls canvas');
});

// Mouse wheel zoom, centred on the cursor
canvasWrap?.addEventListener(
  'wheel',
  (e) => {
    if (state.mode !== 'canvas') return;
    const isZooming = e.ctrlKey || e.metaKey || state.wheelZoom;
    if (!isZooming) return;

    e.preventDefault();

    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    const oldZoom = state.canvasZoom;
    const newZoom = Math.min(Math.max(oldZoom * zoomFactor, 0.15), 1.5);
    if (Math.abs(newZoom - oldZoom) < 0.001) return;

    // Anchor point under cursor
    const rect = canvasWrap.getBoundingClientRect();
    const mouseX = e.clientX - rect.left + canvasWrap.scrollLeft;
    const mouseY = e.clientY - rect.top + canvasWrap.scrollTop;

    setCanvasZoom(newZoom);

    const ratio = newZoom / oldZoom;
    canvasWrap.scrollLeft = mouseX * ratio - (e.clientX - rect.left);
    canvasWrap.scrollTop = mouseY * ratio - (e.clientY - rect.top);
  },
  { passive: false }
);

// Click-and-drag pan on canvas
let isPanning = false;
let startX = 0, startY = 0;
let scrollStartLeft = 0, scrollStartTop = 0;

canvasWrap?.addEventListener('mousedown', (e) => {
  if (state.mode !== 'canvas' || isCommentMode()) return;
  if (e.button !== 0 || e.target.closest('button, a, input, select')) return;
  isPanning = true;
  startX = e.clientX;
  startY = e.clientY;
  scrollStartLeft = canvasWrap.scrollLeft;
  scrollStartTop = canvasWrap.scrollTop;
  canvasWrap.classList.remove('cursor-grab');
  canvasWrap.classList.add('cursor-grabbing');
});

window.addEventListener('mousemove', (e) => {
  if (!isPanning || state.mode !== 'canvas') return;
  e.preventDefault();
  canvasWrap.scrollLeft = scrollStartLeft - (e.clientX - startX);
  canvasWrap.scrollTop = scrollStartTop - (e.clientY - startY);
});

window.addEventListener('mouseup', () => {
  if (!isPanning) return;
  isPanning = false;
  canvasWrap?.classList.remove('cursor-grabbing');
  canvasWrap?.classList.add('cursor-grab');
});

document.querySelectorAll('[data-width]').forEach((b) =>
  b.addEventListener('click', () => {
    state.width = b.dataset.width;
    store.set('au.width', state.width);
    render();
  })
);

document.querySelectorAll('[data-mode]').forEach((b) =>
  b.addEventListener('click', () => {
    state.mode = b.dataset.mode;
    if (state.mode === 'canvas') {
      location.hash = '#canvas';
    } else if (location.hash === '#canvas') {
      location.hash = '#' + (state.path || HOME);
    }
    render();
  })
);

const initialHash = decodeURIComponent(location.hash.slice(1));
if (initialHash === 'canvas') {
  state.mode = 'canvas';
} else if (initialHash) {
  state.path = initialHash;
} else {
  state.path = HOME;
}

initComments({ $, state, items, frame, canvasGrid, canvasWrap, toast });
render();
applyTheme();
