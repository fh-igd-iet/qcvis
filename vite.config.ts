import { fileURLToPath, URL } from "url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import svgLoader from "vite-svg-loader";
import { visualizer } from "rollup-plugin-visualizer";
import topLevelAwait from "vite-plugin-top-level-await";
import { createHtmlPlugin } from "vite-plugin-html";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        vueJsx(),
        svgLoader(),
        topLevelAwait(),
        createHtmlPlugin({
            minify: true,
        }),
    ],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
    build: {
        rollupOptions: {
            plugins: [visualizer()],
        },
    },
});
