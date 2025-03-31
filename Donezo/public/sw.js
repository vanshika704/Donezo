
// const CACHE_NAME = 'alarm-cache-v1';
// const ASSETS = [
//   '/',
//   '/alarm.mp3',
//   '/icon-192x192.png',
//   '/badge-72x72.png',
//   '/manifest.json'
// ];

// self.addEventListener('install', (event) => {
//   event.waitUntil(
//     caches.open(CACHE_NAME)
//       .then(cache => cache.addAll(ASSETS))
//       .then(() => self.skipWaiting())
//   );
// });

// self.addEventListener('activate', (event) => {
//   event.waitUntil(self.clients.claim());
// });

// self.addEventListener('fetch', (event) => {
//   event.respondWith(
//     caches.match(event.request)
//       .then(response => response || fetch(event.request))
//   );
// });

// self.addEventListener('sync', (event) => {
//   if (event.tag === 'check-alarms') {
//     event.waitUntil(checkAlarmsInBackground());
//   }
// });

// async function checkAlarmsInBackground() {
//   const now = new Date();
//   const db = await openDB();
//   const tasks = await getAllTasks(db);
  
//   const triggeredTasks = tasks.filter(task => 
//     task.time && new Date(task.time) <= now && !task.completed
//   );

//   if (triggeredTasks.length > 0) {
//     // Use self.clients instead of just clients
//     const windowClients = await self.clients.matchAll({
//       includeUncontrolled: true,
//       type: 'window'
//     });

//     triggeredTasks.forEach(task => {
//       self.registration.showNotification(`Alarm: ${task.text}`, {
//         body: 'Your scheduled task is due now!',
//         icon: '/icon-192x192.png',
//         vibrate: [200, 100, 200],
//         tag: 'alarm-notification'
//       });
      
//       // Notify all open clients to play sound
//       windowClients.forEach(client => {
//         client.postMessage({
//           type: 'playSound',
//           url: '/alarm.mp3'
//         });
//       });
//     });

//     // Update tasks in DB
//     const updatedTasks = tasks.map(task => 
//       triggeredTasks.some(t => t.id === task.id) 
//         ? { ...task, completed: true } 
//         : task
//     );
    
//     await updateTasks(db, updatedTasks);
//   }
// }

// // IndexedDB Helper Functions (unchanged)
// function openDB() {
//   return new Promise((resolve, reject) => {
//     const request = indexedDB.open('tasksDB', 1);
    
//     request.onupgradeneeded = (event) => {
//       const db = event.target.result;
//       if (!db.objectStoreNames.contains('tasks')) {
//         db.createObjectStore('tasks', { keyPath: 'id' });
//       }
//     };
    
//     request.onsuccess = () => resolve(request.result);
//     request.onerror = () => reject(request.error);
//   });
// }

// function getAllTasks(db) {
//   return new Promise((resolve, reject) => {
//     const tx = db.transaction('tasks', 'readonly');
//     const store = tx.objectStore('tasks');
//     const request = store.getAll();
    
//     request.onsuccess = () => resolve(request.result || []);
//     request.onerror = () => reject(request.error);
//   });
// }

// function updateTasks(db, tasks) {
//   return new Promise((resolve, reject) => {
//     const tx = db.transaction('tasks', 'readwrite');
//     const store = tx.objectStore('tasks');
    
//     store.clear().onsuccess = () => {
//       const requests = tasks.map(task => store.put(task));
//       Promise.all(requests)
//         .then(() => resolve())
//         .catch(err => reject(err));
//     };
//   });
// }

const CACHE_NAME = 'alarm-cache-v1';
const ASSETS = [
  '/',
  '/alarm.mp3',
  '/icon-192.png',
  '/badge-72.png',
  '/manifest.json'
];

// Install event - Caches necessary assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting()) // Activate immediately
      .catch(err => console.error('Cache installation failed:', err))
  );
});

// Activate event - Removes old caches and claims clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }))
    ).then(() => self.clients.claim())
  );
});

// Fetch event - Serves cached assets first, then fetches from network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(err => console.error('Fetch error:', err))
  );
});

// Background sync event - Checks and triggers alarms
self.addEventListener('sync', (event) => {
  if (event.tag === 'check-alarms') {
    event.waitUntil(checkAlarmsInBackground());
  }
});

// Function to check and trigger alarms
async function checkAlarmsInBackground() {
  try {
    const now = new Date();
    const db = await openDB();
    const tasks = await getAllTasks(db);

    const triggeredTasks = tasks.filter(task => 
      task.time && new Date(task.time) <= now && !task.completed
    );

    if (triggeredTasks.length > 0) {
      const windowClients = await self.clients.matchAll({
        includeUncontrolled: true,
        type: 'window'
      });

      triggeredTasks.forEach(task => {
        self.registration.showNotification(`Alarm: ${task.text}`, {
          body: 'Your scheduled task is due now!',
          icon: '/icon-192.png',
          vibrate: [200, 100, 200],
          tag: `alarm-${task.id}`
        });

        // Notify all open clients to play sound
        windowClients.forEach(client => {
          client.postMessage({
            type: 'playSound',
            url: '/alarm.mp3'
          });
        });
      });

      // Mark tasks as completed
      const updatedTasks = tasks.map(task => 
        triggeredTasks.some(t => t.id === task.id) 
          ? { ...task, completed: true } 
          : task
      );

      await updateTasks(db, updatedTasks);
    }
  } catch (error) {
    console.error('Error in background alarm check:', error);
  }
}

// IndexedDB Helper Functions

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('tasksDB', 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('tasks')) {
        db.createObjectStore('tasks', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('IndexedDB opening failed'));
  });
}

function getAllTasks(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('tasks', 'readonly');
    const store = tx.objectStore('tasks');
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(new Error('Fetching tasks failed'));
  });
}

function updateTasks(db, tasks) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('tasks', 'readwrite');
    const store = tx.objectStore('tasks');

    store.clear().onsuccess = () => {
      const requests = tasks.map(task => store.put(task));
      Promise.all(requests)
        .then(() => resolve())
        .catch(err => reject(new Error('Updating tasks failed',err)));
    };
  });
}
