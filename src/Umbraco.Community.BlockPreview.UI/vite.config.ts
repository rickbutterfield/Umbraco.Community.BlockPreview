import { defineConfig, Plugin } from 'vite';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

// Use the project version (version.json at the repo root) as the cache-bust token.
// It is bumped for every release, so the ?v= query changes each version and browsers
// re-fetch the entry bundle. Reading public/umbraco-package.json instead left ?v= frozen
// at a stale value, so upgrades served cached JS.
function getVersion(): string {
    const versionJsonPath = resolve(__dirname, '../../version.json');
    return JSON.parse(readFileSync(versionJsonPath, 'utf-8')).version;
}

function cacheBustImports(): Plugin {
    return {
        name: 'cache-bust-imports',
        generateBundle(_, bundle) {
            const version = getVersion();

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
            // Transform umbraco-package.json after it's copied from public/.
            // Always (re)set ?v= to the current project version so the entry bundle URL
            // changes on every release.
            const version = getVersion();
            const distPath = resolve(__dirname, '../Umbraco.Community.BlockPreview/wwwroot/App_Plugins/Umbraco.Community.BlockPreview/umbraco-package.json');
            const json = JSON.parse(readFileSync(distPath, 'utf-8'));

            // Keep the manifest version in sync with version.json (the build's
            // UpdatePackageManifestVersion target re-sets this to the same value at pack time).
            json.version = version;

            for (const ext of json.extensions || []) {
                if (ext.js) {
                    ext.js = `${ext.js.replace(/\?v=.*$/, '')}?v=${version}`;
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
