import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Register service worker & handle messages
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('ServiceWorker registration successful');

      // Register background sync (only if supported)
      if ('SyncManager' in window) {
        await registration.sync.register('check-alarms');
        console.log('Background sync registered');
      }

      // Listen for messages (play sound when receiving 'playSound' event)
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'playSound') {
          playAlarmSound(event.data.url);
        }
      });
    } catch (err) {
      console.log('ServiceWorker registration failed:', err);
    }
  });
}

// Function to play alarm sound
function playAlarmSound(url) {
  const audio = new Audio(url);
  audio.play().catch(e => console.log('Audio playback failed:', e));
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
