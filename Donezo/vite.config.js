// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';
// import { VitePWA } from 'vite-plugin-pwa';
// import tailwindcss from '@tailwindcss/vite';
// export default defineConfig({
//   plugins: [
//     react(),
//     tailwindcss(),
//     VitePWA({
//       registerType: 'autoUpdate',
//       strategies: 'generateSW',
//       includeAssets: ['alarm.mp3', '*.png', '*.json'],
//       manifest: {
//         name: 'Voice To-Do Alarm',
//         short_name: 'VoiceAlarm',
//         description: 'Voice-controlled reminder app with alarms',
//         start_url: '/',
//         display: 'standalone',
//         background_color: '#11161F',
//         theme_color: '#11161F',
//         icons: [
//           {
//             src: '/icon-192.png',
//             sizes: '192x192',
//             type: 'image/png'
//           },
//           {
//             src: '/icon-512.png',
//             sizes: '512x512',
//             type: 'image/png'
//           }
//         ]
//       },
//       workbox: {
//         navigateFallback: '/index.html',
//         runtimeCaching: [
//           {
//             urlPattern: /\/alarm\.mp3$/,
//             handler: 'CacheFirst',
//             options: {
//               cacheName: 'audio-cache'
//             }
//           }
//         ]
//       }
//     })
//   ],
//   base: '/',
//   build: {
//     outDir: 'dist',
//     emptyOutDir: true
//   }
// });
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
      strategies: 'generateSW',
      includeAssets: ['alarm.mp3', '*.png', '*.json'],
      manifest: {
        name: 'Alarm App',
        short_name: 'Alarms',
        description: 'Reliable alarm notifications',
        start_url: '/',
        display: 'standalone',
        background_color: '#111827',
        theme_color: '#111827',
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
          },
          {
            src: '/icon-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: /\/api/,
            handler: 'NetworkFirst'
          },
          {
            urlPattern: /\.(mp3|png|json)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'assets-cache'
            }
          }
        ]
      }
    })
  ],
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});