import { defineConfig } from "vite";

export default defineConfig({
    build: {
        lib: {
            entry: "src/index.ts",
            formats: ["es"],
        },
        outDir: "../Umbraco.Community.BlockPreview/wwwroot/App_Plugins/Umbraco.Community.BlockPreview", 
        emptyOutDir: true,
        sourcemap: true,
        rollupOptions: {
            external: [/^@umbraco/],
            onwarn: () => { },
            output: {
                chunkFileNames: '[name].js',
            }
        },
    },
});
