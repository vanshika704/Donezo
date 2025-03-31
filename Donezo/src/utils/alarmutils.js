// // Store tasks in IndexedDB
// export function storeTasksInDB(tasks) {
//     return new Promise((resolve) => {
//       const request = indexedDB.open('tasksDB', 1);
      
//       request.onupgradeneeded = (event) => {
//         const db = event.target.result;
//         if (!db.objectStoreNames.contains('tasks')) {
//           db.createObjectStore('tasks', { keyPath: 'id' });
//         }
//       };
  
//       request.onsuccess = (event) => {
//         const db = event.target.result;
//         const tx = db.transaction('tasks', 'readwrite');
//         const store = tx.objectStore('tasks');
        
//         // Clear old tasks
//         store.clear().onsuccess = () => {
//           // Add new tasks
//           tasks.forEach(task => store.put(task));
//           resolve();
//         };
//       };
//     });
//   }
  
//   // Check and trigger alarms
//   export async function checkAlarms(tasks, setTasks) {
//     const now = new Date();
//     const updatedTasks = tasks.map(task => {
//       if (task.time && new Date(task.time) <= now && !task.completed) {
//         // Trigger notification if permission granted
//         if (Notification.permission === 'granted') {
//           new Notification(`Alarm: ${task.text}`);
//         }
//         return { ...task, completed: true };
//       }
//       return task;
//     });
  
//     // Update state and DB
//     setTasks(updatedTasks);
//     await storeTasksInDB(updatedTasks);
//   }
  
//   // Schedule background sync
//   export function scheduleBackgroundSync() {
//     if ('serviceWorker' in navigator && 'SyncManager' in window) {
//       navigator.serviceWorker.ready
//         .then(registration => registration.sync.register('check-alarms'))
//         .catch(console.error);
//     }
//   }

// alarm.js
import { showNotification, storeTasksInDB } from "./notifications";
import { getTasksFromDB } from './notifications';

export async function checkAlarms(tasks, setTasks) {
  const now = new Date();
  const updatedTasks = tasks.map(task => {
    if (task.time && new Date(task.time) <= now && !task.completed) {
      showNotification(`Alarm: ${task.text}`, {
        body: 'Your scheduled task is due now!'
      });
      return { ...task, completed: true };
    }
    return task;
  });

  // Update state and DB
  if (setTasks) setTasks(updatedTasks);
  await storeTasksInDB(updatedTasks);
  scheduleBackgroundSync();
}

export function scheduleBackgroundSync() {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready
      .then(registration => registration.sync.register('check-alarms'))
      .catch(console.error);
  } else {
    // Fallback for browsers without background sync
    console.log('Background sync not supported, using fallback');
  }
}

export function setupAlarmCheckInterval() {
  // Check alarms every minute
  setInterval(() => {
    getTasksFromDB().then(tasks => checkAlarms(tasks));
  }, 60000);
}