import { defineConfig } from 'vite'
import { resolve } from 'path'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/colorMapper.js'),
      name: 'flamegraph.colorMapper',
      formats: ['umd'],
      fileName: (format) => `d3-flamegraph-colorMapper.min.js`
    },
    rollupOptions: {
      external: ['d3'],
      output: {
        format: 'umd',
        exports: 'named',
        globals: { d3: 'd3' }
      }
    },
    minify: 'terser'
  }
})