# Webpack to Vite Migration Design

## Overview

Migrate the d3-flame-graph build system from webpack to Vite while maintaining full feature parity.

## Build Outputs

The migration must produce identical outputs:

| Output                                   | Source                           |
| ---------------------------------------- | -------------------------------- |
| `dist/d3-flamegraph.js`                  | src/flamegraph.js                |
| `dist/d3-flamegraph.min.js`              | src/flamegraph.js (minified)     |
| `dist/d3-flamegraph-colorMapper.js`      | src/colorMapper.js               |
| `dist/d3-flamegraph-colorMapper.min.js`  | src/colorMapper.js (minified)    |
| `dist/d3-flamegraph-tooltip.js`          | src/tooltip.js                   |
| `dist/d3-flamegraph-tooltip.min.js`      | src/tooltip.js (minified)        |
| `dist/d3-flamegraph.css`                 | src/flamegraph.css (copy)        |
| `dist/templates/bundle.js`               | src/templates/base/template.js   |
| `dist/templates/d3-flamegraph-base.html` | src/templates/base/template.html |

## Configuration

### Multi-Entry Build

Use Vite's `rollupOptions.input` to define 4 entry points:

```
src/flamegraph.js        → dist/d3-flamegraph.js
src/colorMapper.js       → dist/d3-flamegraph-colorMapper.js
src/tooltip.js           → dist/d3-flamegraph-tooltip.js
src/templates/base/template.js → dist/templates/bundle.js
```

### UMD Library Configuration

| Entry          | Library Name                    | Export  |
| -------------- | ------------------------------- | ------- |
| flamegraph.js  | `flamegraph`                    | default |
| colorMapper.js | `['flamegraph', 'colorMapper']` | -       |
| tooltip.js     | `['flamegraph', 'tooltip']`     | -       |

Use `output.globals` to map `d3` imports to global `d3` object.

### CSS Handling

Use `vite-plugin-static-copy` to copy `flamegraph.css` to dist, or use a simple post-build script.

### HTML Template Generation

For `dist/templates/d3-flamegraph-base.html`:

- Use `vite-plugin-html-inject` or similar, or
- Pre-build script to copy and inject version from package.json

### Dev Server

Configure `server.static` to serve:

- `examples/` directory
- `dist/` directory

Port: 3000 (already configured)

## Package Scripts Changes

| Old (webpack)                                                      | New (vite)   |
| ------------------------------------------------------------------ | ------------ |
| `NODE_OPTIONS=--openssl-legacy-provider webpack --mode production` | `vite build` |
| `vite` (already working)                                           | `vite`       |

## Dependencies Changes

### Remove

- clean-webpack-plugin
- copy-webpack-plugin
- css-loader
- html-webpack-plugin
- style-loader
- terser-webpack-plugin
- webpack
- webpack-cli
- react-dev-utils (unused?)

### Add

- vite-plugin-static-copy (for CSS copying)

### Keep

- vite (already installed)
- eslint, jest, babel (for testing/linting)

## Implementation Notes

- Vite uses esbuild for minification by default (faster than terser)
- UMD builds require explicit `format: 'umd'` in rollupOptions
- Library entry points need `fileName` function to generate correct output names
- Template HTML generation may need a custom plugin or script
