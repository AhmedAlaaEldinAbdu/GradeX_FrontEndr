import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import copy from 'rollup-plugin-copy';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
     copy({
      targets: [
        { src: 'public/web.config', dest: 'dist' } // copy to dist root
      ],
      hook: 'writeBundle', // after build
      copyOnce: true
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@gradex': path.resolve(__dirname, 'src'),
    },
  },
});
