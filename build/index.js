require('esbuild').build({
  entryPoints: ['../src/index.js'],
  bundle: true,
  minify: true,
  sourcemap: true,
  banner: '/* JET NGN UI Framework Copyright 2021 Ecor Ventures, LLC */',
  outfile: '../dist/jet.min.js',
}).catch(() => process.exit(1))
