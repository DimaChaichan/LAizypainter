import {defineConfig} from 'vite'
import preact from '@preact/preset-vite'
import {viteStaticCopy} from "vite-plugin-static-copy";
import {viteExternalsPlugin} from "vite-plugin-externals";
import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js";

export default defineConfig({
    build: {
        assetsDir: ".",
        rollupOptions: {
            input: "/src/main.tsx",
            output: {
                dir: "dist",
                entryFileNames: "index.js",
                assetFileNames: `[name].[ext]`
            }
        },
    },
    plugins: [
        preact(),
        viteStaticCopy({
            targets: [
                {
                    src: 'plugin/*',
                    dest: ''
                },
                {
                    src: 'src/assets/*',
                    dest: 'assets'
                }
            ]
        }),
        cssInjectedByJsPlugin(),
        viteExternalsPlugin({
                uxp: 'require("uxp")',
                photoshop: 'require("photoshop")',
            },
            {
                useWindow: false
            }),
    ],
})
