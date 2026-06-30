import { esbuildPlugin } from '@web/dev-server-esbuild';
import { playwrightLauncher } from '@web/test-runner-playwright';

export default {
    rootDir: '.',
    files: ['./src/**/*.test.ts', '!**/node_modules/**'],
    nodeResolve: {
        // The @umbraco-cms/backoffice package ships a complete `exports` map
        // pointing at dist-cms, so subpath imports resolve automatically.
        exportConditions: ['browser', 'development', 'default'],
        browser: true,
    },
    browsers: [playwrightLauncher({ product: 'chromium' })],
    plugins: [
        esbuildPlugin({
            ts: true,
            tsconfig: './tsconfig.json',
            target: 'auto',
            json: true,
        }),
    ],
    testRunnerHtml: (testFramework) =>
        `<html lang="en-us">
            <head>
                <meta charset="UTF-8" />
            </head>
            <body>
                <script type="module" src="${testFramework}"></script>
            </body>
        </html>`,
};
