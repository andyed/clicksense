import esbuild from 'esbuild';
import { readFileSync } from 'node:fs';

const watch = process.argv.includes('--watch');

// Version-stamp: read version from package.json, stamp today's build date.
// esbuild `define` replaces the bare identifiers __CLICKSENSE_VERSION__ /
// __CLICKSENSE_BUILD__ at build time; the typeof guard in posthog.js then
// constant-folds to the injected literals.
const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));
const define = {
  __CLICKSENSE_VERSION__: JSON.stringify(pkg.version),
  __CLICKSENSE_BUILD__: JSON.stringify(new Date().toISOString().slice(0, 10)),
};

const shared = {
  entryPoints: ['src/index.js'],
  bundle: true,
  minify: true,
  sourcemap: true,
  define,
};

// ESM — for import in modern projects
await esbuild.build({
  ...shared,
  outfile: 'dist/clicksense.esm.js',
  format: 'esm',
});

// IIFE — for <script> tag inclusion, exposes window.ClickSense
await esbuild.build({
  ...shared,
  outfile: 'dist/clicksense.js',
  format: 'iife',
  globalName: 'ClickSenseLib',
  footer: {
    // Hoist exports to window for easy script-tag usage:
    //   <script src="clicksense.js"></script>
    //   <script>
    //     new ClickSenseLib.ClickSense({ onCapture: ... })
    //   </script>
    js: '',
  },
});

// CJS — for Node/require (test harnesses, SSR)
await esbuild.build({
  ...shared,
  outfile: 'dist/clicksense.cjs.js',
  format: 'cjs',
});

console.log('Built: dist/clicksense.js (IIFE), dist/clicksense.esm.js (ESM), dist/clicksense.cjs.js (CJS)');
