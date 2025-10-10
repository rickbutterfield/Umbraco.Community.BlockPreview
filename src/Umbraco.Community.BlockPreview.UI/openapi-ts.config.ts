import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
    debug: true,
    input: 'http://localhost:26293/umbraco/swagger/block-preview/swagger.json',
    output: {
        path: 'src/api',
    },
    plugins: [
        {
            name: '@hey-api/client-fetch',
            exportFromIndex: true,
            throwOnError: true,
        },
        {
            name: '@hey-api/typescript',
            enums: 'typescript'
        },
        {
            name: '@hey-api/sdk',
            asClass: true,
            classNameBuilder: (name) => `${name}Service`,
            responseStyle: 'fields',
        }
    ]
});