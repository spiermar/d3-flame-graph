import { defineConfig } from 'vite'
import { resolve } from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/flamegraph.js'),
      name: 'flamegraph',
      formats: ['umd'],
      fileName: (format) => `d3-flamegraph.min.js`
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
  },
  plugins: [
    viteStaticCopy({
      targets: [
        { src: 'src/flamegraph.css', dest: '', rename: 'd3-flamegraph.css' }
      ]
    })
  ]
})