import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
process.env.RAYON_NUM_THREADS ??= '1';
export default defineConfig({ plugins: [react()], test: { environment: 'jsdom', setupFiles: ['./src/test-setup.ts'], maxWorkers: 1, fileParallelism: false, exclude: ['node_modules/**', 'dist/**'] } });
