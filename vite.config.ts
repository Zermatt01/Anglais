import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Installable PWA (ARC-01, docs/ARCHITECTURE.md §11). Updates are never
    // forced: the app shows a banner and reloads only on request (D-018).
    VitePWA({
      registerType: 'prompt',
      // Registration is done by the app itself (virtual:pwa-register/react),
      // never by an injected inline script, which the CSP would block.
      injectRegister: false,
      includeAssets: ['favicon.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        id: '/',
        name: 'Anglais — entraînement professionnel',
        short_name: 'Anglais',
        description: 'Entraînement à l’anglais professionnel : entretiens d’embauche et e-mails.',
        lang: 'fr',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#fbf8f1',
        background_color: '#fbf8f1',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      // The whole app is precached (scripts, styles and index.html by default,
      // plus the manifest, its icons and `includeAssets`): everything works
      // offline except the AI and the synchronization.
      workbox: {
        // Any in-app address opened offline gets the app shell.
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
});
