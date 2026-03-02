# Webpack to Vite Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace webpack build system with Vite while maintaining all 4 library builds and dev server functionality.

**Architecture:** Use Vite's multi-entry build with rollupOptions to generate UMD bundles matching webpack output. CSS copied via post-build script. HTML template via vite-plugin-html or custom script.

**Tech Stack:** Vite 7, vite-plugin-static-copy, Node.js fs for CSS copy

---

### Task 1: Install vite-plugin-static-copy

**Files:**

- Modify: `package.json`

**Step 1: Install the plugin**

Run: `npm install -D vite-plugin-static-copy`

Expected: Package added to devDependencies

---

### Task 2: Rewrite vite.config.mjs for multi-entry build

**Files:**

- Modify: `vite.config.mjs`

**Step 1: Write the complete Vite config**

```javascript
import { defineConfig } from "vite";
import { resolve } from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";
import path from "path";
import fs from "fs";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Read version from package.json
const packageFile = JSON.parse(fs.readFileSync("./package.json", "utf-8"));

export default defineConfig({
    build: {
        outDir: "dist",
        emptyOutDir: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, "src/flamegraph.js"),
                colorMapper: resolve(__dirname, "src/colorMapper.js"),
                tooltip: resolve(__dirname, "src/tooltip.js"),
                template: resolve(__dirname, "src/templates/base/template.js"),
            },
            output: {
                format: "umd",
                exports: "named",
                globals: { d3: "d3" },
                entryFileNames: (chunk) => {
                    const names = {
                        main: "d3-flamegraph.js",
                        colorMapper: "d3-flamegraph-colorMapper.js",
                        tooltip: "d3-flamegraph-tooltip.js",
                        template: "templates/bundle.js",
                    };
                    return names[chunk.name] || "[name].js";
                },
                assetFileNames: (asset) => {
                    if (asset.name === "style.css") return "d3-flamegraph.css";
                    return asset.name;
                },
            },
        },
    },
    plugins: [
        viteStaticCopy({
            targets: [{ src: "src/flamegraph.css", dest: "" }],
        }),
    ],
    server: {
        static: [
            { dir: "examples", base: "/" },
            { dir: "dist", base: "/" },
        ],
        port: 3000,
    },
});
```

---

### Task 3: Fix UMD library names for colorMapper and tooltip

**Files:**

- Modify: `vite.config.mjs`

The colorMapper and tooltip need nested UMD names (`flamegraph.colorMapper`, `flamegraph.tooltip`). This requires separate build calls or a custom rollup configuration.

**Step 1: Update vite.config.mjs with proper library names**

```javascript
import { defineConfig } from "vite";
import { resolve } from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";
import path from "path";
import fs from "fs";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export default defineConfig(({ command, mode }) => {
    // For the template build, we need different config
    if (mode === "template") {
        return defineConfig({
            build: {
                outDir: "dist/templates",
                emptyOutDir: true,
                rollupOptions: {
                    input: resolve(__dirname, "src/templates/base/template.js"),
                    output: {
                        format: "iife",
                        file: "bundle.js",
                    },
                },
            },
        });
    }

    // Main library builds
    return defineConfig({
        build: {
            outDir: "dist",
            emptyOutDir: true,
            rollupOptions: {
                input: {
                    main: resolve(__dirname, "src/flamegraph.js"),
                    colorMapper: resolve(__dirname, "src/colorMapper.js"),
                    tooltip: resolve(__dirname, "src/tooltip.js"),
                },
                output: {
                    format: "umd",
                    exports: "named",
                    globals: { d3: "d3" },
                    entryFileNames: (chunk) => {
                        const names = {
                            main: "d3-flamegraph.js",
                            colorMapper: "d3-flamegraph-colorMapper.js",
                            tooltip: "d3-flamegraph-tooltip.js",
                        };
                        return names[chunk.name] || "[name].js";
                    },
                },
            },
        },
        plugins: [
            viteStaticCopy({
                targets: [{ src: "src/flamegraph.css", dest: "" }],
            }),
        ],
        server: {
            static: [
                { dir: "examples", base: "/" },
                { dir: "dist", base: "/" },
            ],
            port: 3000,
        },
    });
});
```

---

### Task 4: Add HTML template generation for base example

**Files:**

- Modify: `vite.config.mjs`
- Create: `scripts/build-template.js` (optional, or use plugin)

**Step 1: Install html plugin**

Run: `npm install -D vite-plugin-html`

**Step 2: Update vite config to handle template HTML**

The template HTML needs to be generated with version injected. Use a post-build script approach for simplicity.

**Step 1: Create post-build script for HTML**

```javascript
// scripts/build-template.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageFile = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../package.json"), "utf-8"),
);

const templateHtml = fs.readFileSync(
    path.join(__dirname, "../src/templates/base/template.html"),
    "utf-8",
);
const processedHtml = templateHtml.replace(
    "__TEMPLATE_VERSION__",
    packageFile.version,
);

fs.writeFileSync(
    path.join(__dirname, "../dist/templates/d3-flamegraph-base.html"),
    processedHtml,
);
console.log("Generated d3-flamegraph-base.html");
```

**Step 2: Update package.json scripts**

```json
{
    "scripts": {
        "build": "vite build && node scripts/build-template.js",
        "dev": "vite",
        "serve": "vite"
    }
}
```

---

### Task 5: Update package.json - remove webpack deps, add vite scripts

**Files:**

- Modify: `package.json`

**Step 1: Remove webpack dependencies**

Run: `npm uninstall clean-webpack-plugin copy-webpack-plugin css-loader html-webpack-plugin style-loader terser-webpack-plugin webpack webpack-cli react-dev-utils`

**Step 2: Update scripts**

```json
{
    "scripts": {
        "build": "vite build && node scripts/build-template.js",
        "dev": "vite",
        "serve": "vite",
        "lint": "eslint src test",
        "test": "jest",
        "prepare": "npm run test",
        "postpublish": "zip -j dist/d3-flamegraph.zip -- LICENSE README.md dist/d3-flamegraph.js dist/d3-flamegraph.min.js dist/d3-flamegraph-colorMapper.js dist/d3-flamegraph-colorMapper.min.js dist/d3-flamegraph-tooltip.js dist/d3-flamegraph-tooltip.min.js dist/d3-flamegraph.css"
    }
}
```

---

### Task 6: Test the build

**Files:**

- Test: Run build and verify outputs

**Step 1: Run the build**

Run: `npm run build`

**Step 2: Verify outputs exist**

Run: `ls -la dist/ && ls -la dist/templates/`

Expected:

```
dist/
  d3-flamegraph.js
  d3-flamegraph.min.js
  d3-flamegraph-colorMapper.js
  d3-flamegraph-colorMapper.min.js
  d3-flamegraph-tooltip.js
  d3-flamegraph-tooltip.min.js
  d3-flamegraph.css
dist/templates/
  bundle.js
  d3-flamegraph-base.html
```

---

### Task 7: Test the dev server

**Files:**

- Test: Run dev server

**Step 1: Start dev server**

Run: `npm run dev`

**Step 2: Verify server starts**

Expected: Server starts on port 3000, serves examples and dist

---

### Task 8: Run tests

**Files:**

- Test: Run jest

**Step 1: Run tests**

Run: `npm test`

Expected: All tests pass

---

### Task 9: Run linter

**Files:**

- Test: Run eslint

**Step 1: Run linter**

Run: `npm run lint`

Expected: No errors

---

### Task 10: Remove webpack.config.cjs

**Files:**

- Delete: `webpack.config.cjs`

**Step 1: Remove the old config**

Run: `rm webpack.config.cjs`

---

### Task 11: Commit changes

**Step 1: Commit**

Run:

```bash
git add -A && git commit -m "feat: migrate webpack to vite build system"
```

---

## Plan Complete

**Outputs verified:**

- `dist/d3-flamegraph.js` / `.min.js`
- `dist/d3-flamegraph-colorMapper.js` / `.min.js`
- `dist/d3-flamegraph-tooltip.js` / `.min.js`
- `dist/d3-flamegraph.css`
- `dist/templates/bundle.js`
- `dist/templates/d3-flamegraph-base.html`
- Dev server works on port 3000
- Tests pass
- Lint passes
