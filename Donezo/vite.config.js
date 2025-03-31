import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest', // ← Add this line
      srcDir: 'public',            // ← Add this
      filename: 'sw.js',  
      includeAssets: ['favicon.ico', 'alarm.mp3', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Voice To-Do Alarm',
        short_name: 'VoiceAlarm',
        description: 'Voice-controlled reminder app with alarms',
        start_url: '/',
        display: 'standalone',
        background_color: '#11161F', // Changed to match theme_color
        theme_color: '#11161F',
        icons: [
          {
            src: '/icon-192.png', // Added leading slash
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable' // Added for better PWA support
          },
          {
            src: '/icon-512.png', // Added leading slash
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5000000,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,mp3,woff2}'], // Expanded file types
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i, // Added common external cache
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            urlPattern: /\/alarm\.mp3$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'audio-cache',
              expiration: {
                maxEntries: 1,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      },
      devOptions: {
       
        type: 'module',
        navigateFallback: 'index.html'
      }
    })
  ],
  // Add these base configurations
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
   
  },
  publicDir: 'public'
});