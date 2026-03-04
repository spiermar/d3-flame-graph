import { defineConfig } from "vite";
import { resolve } from "path";
import path from "path";
import { fileURLToPath } from "url";
import { libInjectCss } from "vite-plugin-lib-inject-css";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    root: "src",
    publicDir: "../public",
    build: {
        outDir: "../dist",
        emptyOutDir: false,
        copyPublicDir: false,
        cssCodeSplit: true,
        lib: {
            entry: resolve(__dirname, "lib/flamegraph.js"),
            name: "flamegraph",
            formats: ["umd", "es"],
            fileName: (format) => `d3-flamegraph.${format}.min.js`,
        },
        rollupOptions: {
            external: [
                "d3",
                "d3-array",
                "d3-dispatch",
                "d3-ease",
                "d3-format",
                "d3-hierarchy",
                "d3-scale",
                "d3-selection",
                "d3-transition",
            ],
            output: {
                format: "umd",
                exports: "named",
                globals: {
                    d3: "d3",
                    "d3-array": "d3",
                    "d3-dispatch": "d3",
                    "d3-ease": "d3",
                    "d3-format": "d3",
                    "d3-hierarchy": "d3",
                    "d3-scale": "d3",
                    "d3-selection": "d3",
                    "d3-transition": "d3",
                },
            },
        },
        minify: true,
    },
    plugins: [libInjectCss()],
    server: {
        port: 3000,
    },
    optimizeDeps: {
        include: ["d3"],
    },
});
