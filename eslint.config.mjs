import js from "@eslint/js";

export default [
    js.configs.recommended,
    {
        ignores: ["dist/**"],
    },
    {
        files: ["**/*.js"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                window: "readonly",
            },
        },
        rules: {
            indent: ["error", 4],
            quotes: ["error", "double", { avoidEscape: true }],
            "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
        },
    },
    {
        files: ["test/**/*.js"],
        languageOptions: {
            globals: {
                describe: "readonly",
                it: "readonly",
                expect: "readonly",
                beforeEach: "readonly",
                afterEach: "readonly",
                vi: "readonly",
                document: "readonly",
                MouseEvent: "readonly",
            },
        },
    },
    {
        files: ["src/**/*.js"],
        languageOptions: {
            globals: {
                document: "readonly",
                console: "readonly",
                d3: "readonly",
                location: "readonly",
                history: "readonly",
                clear: "readonly",
                setTimeout: "readonly",
            },
        },
    },
];
