import { defineConfig } from 'vite';

export default defineConfig({
  base: '/bullet/',  // GitHub Pages에서 사용할 base 경로
  build: {
    outDir: 'dist',
  },
});
