import { defineConfig } from 'vite'
import { resolve } from 'path'
import path from 'path'

const __dirname = path.dirname(import.meta.url)

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/flamegraph.js'),
      name: 'flamegraph',
      formats: ['umd'],
      fileName: 'd3-flamegraph'
    },
    rollupOptions: {
      external: ['d3'],
      output: {
        format: 'umd',
        name: 'flamegraph',
        exports: 'named',
        globals: { d3: 'd3' }
      }
    }
  },
  server: {
    static: [
      { dir: 'examples', base: '/' },
      { dir: 'dist', base: '/' }
    ],
    port: 3000
  }
})