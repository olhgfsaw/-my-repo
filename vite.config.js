import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

// Every HTML file in /artifacts becomes its own page in the build,
// so the viewer's iframe URLs work the same in dev and in production.
const root = import.meta.dirname;
const artifacts = readdirSync(resolve(root, 'artifacts'), { recursive: true })
  .filter((f) => f.endsWith('.html'))
  .reduce((acc, f) => {
    const rel = `artifacts/${f.split('\\').join('/')}`;
    acc[rel.replace(/\.html$/, '')] = resolve(root, rel);
    return acc;
  }, {});

export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: { index: resolve(root, 'index.html'), ...artifacts },
    },
  },
});
