import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const packageFile = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8')
)

const templateHtml = fs.readFileSync(
    path.join(__dirname, '../src/templates/base/template.html'),
    'utf-8'
)
const processedHtml = templateHtml.replace(
    '__TEMPLATE_VERSION__',
    packageFile.version
)

fs.writeFileSync(
    path.join(__dirname, '../dist/templates/d3-flamegraph-base.html'),
    processedHtml
)
console.log('Generated d3-flamegraph-base.html')