import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        testTimeout: 15000,
        hookTimeout: 15000,
        include: ['__tests__/**/*.test.js'],
        // Sequential execution to avoid port conflicts
        sequence: {
            concurrent: false,
        },
        fileParallelism: false,
    },
});
