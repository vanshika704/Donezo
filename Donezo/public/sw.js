
// const CACHE_NAME = 'alarm-cache-v4';
// const ASSETS = [
//   '/',
//   '/index.html',
//   '/alarm.mp3',
//   '/icon-192.png',
//   '/badge-72.png',
//   '/manifest.json'
// ];

// // ==================== CORE SERVICE WORKER SETUP ====================
// self.addEventListener('install', (event) => {
//   event.waitUntil(
//     caches.open(CACHE_NAME)
//       .then(cache => cache.addAll(ASSETS))
//       .then(() => self.skipWaiting())
//   );
// });

// self.addEventListener('activate', (event) => {
//   event.waitUntil(
//     caches.keys().then(keys => 
//       Promise.all(keys.map(key => key !== CACHE_NAME && caches.delete(key)))
//       .then(() => self.clients.claim())
//   ));
// });

// self.addEventListener('fetch', (event) => {
//   // Handle navigation requests
//   if (event.request.mode === 'navigate') {
//     event.respondWith(
//       fetch(event.request).catch(() => caches.match('/index.html'))
//     );
//     return;
//   }

//   // Handle asset requests
//   event.respondWith(
//     caches.match(event.request)
//       .then(response => response || fetch(event.request))
//   );
// });

// // ==================== NOTIFICATION SYSTEM ====================
// self.addEventListener('push', (event) => {
//   const data = event.data?.json() || { 
//     title: 'Reminder', 
//     body: 'You have a pending task!',
//     icon: '/icon-192.png'
//   };

//   event.waitUntil(
//     self.registration.showNotification(data.title, {
//       body: data.body,
//       icon: data.icon || '/icon-192.png',
//       badge: '/badge-72.png',
//       vibrate: [200, 100, 200],
//       data: { url: data.url || '/' }
//     })
//   );
// });

// self.addEventListener('notificationclick', (event) => {
//   event.notification.close();
//   event.waitUntil(
//     self.clients.matchAll({ type: 'window' })
//       .then(clientList => {
//         if (clientList.length > 0) {
//           return clientList[0].focus();
//         }
//         return self.clients.openWindow(event.notification.data.url || '/');
//       })
//   );
// });

// // ==================== ALARM SYSTEM ====================
// self.addEventListener('sync', (event) => {
//   if (event.tag === 'check-alarms') {
//     event.waitUntil(
//       checkAlarmsInBackground()
//         .catch(err => {
//           console.error('Sync failed:', err);
//           // Fallback: Schedule retry
//           return self.registration.sync.register('check-alarms');
//         })
//     );
//   }
// });

// async function checkAlarmsInBackground() {
//   const db = await openDB();
//   const tasks = await getAllTasks(db);
//   const now = new Date();

//   const triggeredTasks = tasks.filter(task => 
//     task.time && new Date(task.time) <= now && !task.completed
//   );

//   if (triggeredTasks.length > 0) {
//     // Show notifications
//     triggeredTasks.forEach(task => {
//       self.registration.showNotification(`Alarm: ${task.text}`, {
//         body: 'Your scheduled task is due now!',
//         icon: '/icon-192.png',
//         badge: '/badge-72.png',
//         vibrate: [200, 100, 200],
//         tag: `alarm-${task.id}`,
//         data: { taskId: task.id }
//       });
//     });

//     // Play sound on all clients
//     const clients = await self.clients.matchAll();
//     clients.forEach(client => {
//       client.postMessage({
//         type: 'playSound',
//         url: '/alarm.mp3'
//       });
//     });

//     // Mark tasks as completed
//     const updatedTasks = tasks.map(task => 
//       triggeredTasks.some(t => t.id === task.id) 
//         ? { ...task, completed: true } 
//         : task
//     );
    
//     await updateTasks(db, updatedTasks);
//   }
// }

// // ==================== MESSAGE HANDLING ====================
// self.addEventListener('message', (event) => {
//   if (event.data.type === 'trigger-notification') {
//     self.registration.showNotification(event.data.title, {
//       body: event.data.body,
//       icon: '/icon-192.png'
//     });
//   }
// });

// // ==================== INDEXEDDB HELPERS ====================
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
//     request.onerror = () => reject('DB open failed');
//   });
// }

// function getAllTasks(db) {
//   return new Promise((resolve, reject) => {
//     const tx = db.transaction('tasks', 'readonly');
//     const store = tx.objectStore('tasks');
//     const request = store.getAll();

//     request.onsuccess = () => resolve(request.result || []);
//     request.onerror = () => reject('Failed to get tasks');
//   });
// }

// function updateTasks(db, tasks) {
//   return new Promise((resolve, reject) => {
//     const tx = db.transaction('tasks', 'readwrite');
//     const store = tx.objectStore('tasks');

//     store.clear().onsuccess = () => {
//       Promise.all(tasks.map(task => store.put(task)))
//         .then(resolve)
//         .catch(reject);
//     };
//   });
// }

const CACHE_NAME = 'alarm-cache-v5';
const ASSETS = [
  '/',
  '/index.html',
  '/alarm.mp3',
  '/notification.mp3',
  '/icon-192.png',
  '/badge-72.png',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.map(key => key !== CACHE_NAME && caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Background alarm checker
const checkAlarms = async () => {
  const db = await openDB();
  const tasks = await getAllTasks(db);
  const now = new Date();

  tasks.forEach(task => {
    if (task.time && new Date(task.time) <= now && !task.completed) {
      self.registration.showNotification(`Alarm: ${task.text}`, {
        body: 'Your task is due!',
        icon: '/icon-192.png',
        vibrate: [200,100,200,100,200],
        tag: `alarm-${task.id}`,
        data: { taskId: task.id }
      });
    }
  });
};

// Check every minute
setInterval(checkAlarms, 60000);

// Stop alarm when notification clicked
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll()
      .then(clients => {
        if (clients.length) clients[0].focus();
        else self.clients.openWindow('/');
        // Send stop command
        clients.forEach(client => 
          client.postMessage({ type: 'stopAlarm' })
        );
      })
  );
});

// IndexedDB helpers
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('tasksDB', 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('tasks')) {
        db.createObjectStore('tasks', { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject('DB error');
  });
};

const getAllTasks = (db) => {
  return new Promise((resolve) => {
    const tx = db.transaction('tasks', 'readonly');
    const store = tx.objectStore('tasks');
    store.getAll().onsuccess = e => resolve(e.target.result || []);
  });
};