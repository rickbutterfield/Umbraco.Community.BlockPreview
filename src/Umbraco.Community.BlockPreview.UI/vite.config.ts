import { defineConfig, Plugin } from 'vite';
import { glob } from 'glob';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

function cacheBustImports(): Plugin {
    return {
        name: 'cache-bust-imports',
        generateBundle(_, bundle) {
            // Read version from umbraco-package.json
            const packageJsonPath = resolve(__dirname, 'public/umbraco-package.json');
            const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
            const version = packageJson.version;

            for (const file of Object.values(bundle)) {
                if (file.type === 'chunk' && file.code) {
                    // Add query string to local .js imports
                    file.code = file.code.replace(
                        /from\s+['"](\.[^'"]+\.js)['"]/g,
                        `from '$1?v=${version}'`
                    );
                    file.code = file.code.replace(
                        /import\s+['"](\.[^'"]+\.js)['"]/g,
                        `import '$1?v=${version}'`
                    );
                }
            }
        },
        writeBundle() {
            // Transform umbraco-package.json after it's copied from public/
            const distPath = resolve(__dirname, '../Umbraco.Community.BlockPreview/wwwroot/App_Plugins/Umbraco.Community.BlockPreview/umbraco-package.json');
            const json = JSON.parse(readFileSync(distPath, 'utf-8'));

            for (const ext of json.extensions || []) {
                if (ext.js && !ext.js.includes('?v=')) {
                    ext.js = `${ext.js}?v=${json.version}`;
                }
            }

            writeFileSync(distPath, JSON.stringify(json, null, 2));
        }
    };
}

export default defineConfig({
    build: {
        target: 'es2022',
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
                entryFileNames: '[name].js',
                chunkFileNames: '[name]-[hash].js',
            },
        },
    },
    plugins: [cacheBustImports()],
});
