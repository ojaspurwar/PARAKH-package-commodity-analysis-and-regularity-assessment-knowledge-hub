import path from 'path';
import fs from 'node:fs';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';

// Replit injects PORT / BASE_PATH / REPL_ID. Locally we fall back to sensible
// defaults so `pnpm dev` (or the root `pnpm run dev`) just works.
const isReplit = process.env.REPL_ID !== undefined;
const isReplitDev = isReplit && process.env.NODE_ENV !== 'production';

const rawPort = process.env.PORT;
const port = rawPort ? Number(rawPort) : isReplit ? 22321 : 5173;

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH || '/';

// Where the API server lives during local development. Vite proxies every
// `/api` request there so the browser only ever talks to one origin.
const apiOrigin = process.env.API_ORIGIN || 'http://localhost:5000';

// Local HTTPS (camera access on phones needs https:// or localhost). The dev
// runner (scripts/dev.mjs --https) generates a self-signed cert and passes the
// paths here — when present, Vite serves over TLS.
const tlsKeyPath = process.env.TLS_KEY_PATH;
const tlsCertPath = process.env.TLS_CERT_PATH;
const httpsOptions =
  tlsKeyPath && tlsCertPath
    ? { key: fs.readFileSync(tlsKeyPath), cert: fs.readFileSync(tlsCertPath) }
    : undefined;

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    ...(isReplitDev
      ? [
          runtimeErrorOverlay(),
          ...(await import('@replit/vite-plugin-cartographer').then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, '..'),
            }),
          )),
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
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'wouter',
      'lucide-react',
      '@tanstack/react-query',
      '@workspace/api-client-react',
    ],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
    https: httpsOptions,
    fs: {
      strict: true,
    },
    // Local development only: on Replit the platform gateway routes /api to
    // the API artifact, so no proxy is needed (and must not be added).
    proxy: isReplit
      ? undefined
      : {
          '/api': {
            target: apiOrigin,
            changeOrigin: false,
          },
        },
  },
  preview: {
    port,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
