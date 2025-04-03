

const CACHE_NAME = 'alarm-cache-v6';
const ASSETS = [
  '/',
  '/index.html',
  '/alarm.mp3',
  '/notification.mp3',
  '/icon-192.png',
  '/badge-72.png',
  '/manifest.json'
];

// Enhanced install handler
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Improved activate handler
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.map(key => key !== CACHE_NAME && caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

// Robust alarm checking with push fallback
const checkAlarms = async () => {
  try {
    const db = await openDB();
    const tasks = await getAllTasks(db);
    const now = new Date();
    const dueTasks = tasks.filter(task => 
      task.time && new Date(task.time) <= now && !task.completed
    );

    if (dueTasks.length > 0) {
      // Show notification for each due task
      dueTasks.forEach(task => {
        self.registration.showNotification(`Alarm: ${task.text}`, {
          body: 'Your task is due!',
          icon: '/icon-192.png',
          badge: '/badge-72.png',
          vibrate: [200,100,200,100,200],
          tag: `alarm-${task.id}`,
          data: { taskId: task.id },
          requireInteraction: true
        });
      });

      // Inform all clients to play alarm sound
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'alarmTriggered',
          tasks: dueTasks
        });
      });

      // Mark tasks as completed
      const tx = db.transaction('tasks', 'readwrite');
      const store = tx.objectStore('tasks');
      dueTasks.forEach(task => {
        store.put({ ...task, completed: true });
      });
    }
  } catch (error) {
    console.error('Alarm check failed:', error);
  }
};

// Message handler for foreground checks
self.addEventListener('message', (event) => {
  if (event.data.type === 'checkAlarmsNow') {
    checkAlarms();
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' })
      .then(clients => {
        if (clients.length > 0) {
          clients[0].focus();
        } else {
          self.clients.openWindow('/');
        }
      })
  );
});

// Background sync handler
self.addEventListener('sync', (event) => {
  if (event.tag === 'alarm-sync') {
    event.waitUntil(checkAlarms());
  }
});

// IndexedDB helpers
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('tasksDB', 2);
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