import { defineConfig } from 'vite'
import { resolve } from 'path'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    copyPublicDir: false,
    lib: {
      entry: resolve(__dirname, 'lib/flamegraph.js'),
      name: 'flamegraph',
      formats: ['umd', 'es'],
      fileName: (format) => `d3-flamegraph.${format}.js`
    },
    rollupOptions: {
      external: ['d3'],
      output: {
        format: 'umd',
        exports: 'named',
        globals: { d3: 'd3' }
      },
    },
    minify: false
  },
  server: {
    port: 3000
  },
  optimizeDeps: {
    include: ["d3"],
  },
})