import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'generateSW',
      includeAssets: ['alarm.mp3', '*.png', '*.json'],
      manifest: {
        name: 'Voice To-Do Alarm',
        short_name: 'VoiceAlarm',
        description: 'Voice-controlled reminder app with alarms',
        start_url: '/',
        display: 'standalone',
        background_color: '#11161F',
        theme_color: '#11161F',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: /\/alarm\.mp3$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'audio-cache'
            }
          }
        ]
      }
    })
  ],
  base: '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});