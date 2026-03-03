import { defineConfig } from "vitest/config";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
    test: {
        environment: "jsdom",
        include: ["test/**/*.js"],
        globals: true,
        environmentOptions: {
            jsdom: {
                pretendToBeVisual: true,
            },
        },
    },
    resolve: {
        alias: {
            "d3-flamegraph": resolve(__dirname, "lib/flamegraph.js"),
        },
    },
});
