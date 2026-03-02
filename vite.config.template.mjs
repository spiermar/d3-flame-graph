import { defineConfig } from 'vite'
import { resolve } from 'path'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    outDir: 'dist/templates',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'src/templates/base/template.js'),
      output: {
        format: 'iife',
        entryFileNames: 'bundle.js'
      }
    }
  }
})