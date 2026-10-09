import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';

const rawPort = process.env.PORT || '3000';

const port = Number(rawPort) || 3000;

const basePath = process.env.BASE_PATH;

if (false) {
  throw new Error(
    'BASE_PATH environment variable is required but was not provided.',
  );
}

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== 'production' &&
    process.env.REPL_ID !== undefined
      ? [
          await import('@replit/vite-plugin-cartographer').then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, '..'),
            }),
          ),
          await import('@replit/vite-plugin-dev-banner').then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@assets': path.resolve(
        import.meta.dirname,
        '..',
        '..',
        'attached_assets',
      ),
    },
    dedupe: ['react', 'react-dom'],
  },
  root: path.resolve(import.meta.dirname),
  envPrefix: ['VITE_', 'ADMIN_', 'FIXED_ADMIN_'],
  define: {
    'process.env.ADMIN_EMAIL': JSON.stringify(process.env.ADMIN_EMAIL || process.env.VITE_ADMIN_EMAIL || process.env.FIXED_ADMIN_EMAIL || process.env.VITE_FIXED_ADMIN_EMAIL || 'diraceadmin@gmail.com'),
    'process.env.ADMIN_PASSWORD': JSON.stringify(process.env.ADMIN_PASSWORD || process.env.VITE_ADMIN_PASSWORD || process.env.FIXED_ADMIN_PASSWORD || process.env.VITE_FIXED_ADMIN_PASSWORD || 'diraceadminonly'),
  },
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
    fs: {
      strict: true,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  },
  preview: {
    port,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
