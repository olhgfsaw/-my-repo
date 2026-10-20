// Rebuilds vue/styles/aurelia.css from src/tokens.css + src/theme.css,
// so the vue/ folder stays self-contained when it is copied into an app.
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const strip = (file) => readFileSync(resolve(root, file), 'utf8').replace(/^\/\*[\s\S]*?\*\/\s*/, '');

const out = `/* Aurelia design system — Tailwind CSS v4 theme for the Vue components.
   Import once in your app entry:  @import "./aurelia/styles/aurelia.css";
   Generated from src/tokens.css + src/theme.css by \`npm run sync:vue\` — do not edit by hand. */
@import "tailwindcss";

/* ---- tokens (src/tokens.css) ---- */
${strip('src/tokens.css')}
/* ---- Tailwind theme (src/theme.css) ---- */
${strip('src/theme.css')}`;

writeFileSync(resolve(root, 'vue/styles/aurelia.css'), out);
console.log('vue/styles/aurelia.css updated');
