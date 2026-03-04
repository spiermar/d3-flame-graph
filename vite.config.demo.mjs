import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    root: "src",
    publicDir: "../public",
    build: {
        outDir: "../demo",
        emptyOutDir: true,
    },
    server: {
        port: 3000,
    },
});
