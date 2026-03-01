import esbuild from 'esbuild';

const watch = process.argv.includes('--watch');

const shared = {
  entryPoints: ['src/index.js'],
  bundle: true,
  minify: true,
  sourcemap: true,
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
