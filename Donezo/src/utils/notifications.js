// // notification.js
// export function showNotification(title, options = {}) {
//   if (!('Notification' in window)) {
//     console.log('This browser does not support notifications.');
//     return;
//   }

//   const defaultOptions = {
//     icon: '/icon-192x192.png',
//     badge: '/badge-72x72.png',
//     vibrate: [200, 100, 200],
//     ...options
//   };

//   if (Notification.permission === 'granted') {
//     new Notification(title, defaultOptions);
//     playAlarmSound();
//   } else if (Notification.permission !== 'denied') {
//     Notification.requestPermission().then(permission => {
//       if (permission === 'granted') {
//         new Notification(title, defaultOptions);
//         playAlarmSound();
//       }
//     });
//   }
// }

// export function playAlarmSound() {
//   // Try Web Audio API first
//   if (window.AudioContext || window.webkitAudioContext) {
//     try {
//       const audioContext = new (window.AudioContext || window.webkitAudioContext)();
//       const request = new XMLHttpRequest();
//       request.open('GET', '/alarm.mp3', true);
//       request.responseType = 'arraybuffer';

//       request.onload = function() {
//         audioContext.decodeAudioData(request.response, function(buffer) {
//           const source = audioContext.createBufferSource();
//           source.buffer = buffer;
//           source.connect(audioContext.destination);
//           source.start(0);
//         });
//       };
//       request.send();
//       return;
//     } catch (e) {
//       console.error('Web Audio API failed:', e);
//     }
//   }

//   // Fallback to HTML5 Audio
//   const audio = new Audio('/alarm.mp3');
//   audio.play().catch(e => console.log('Audio playback failed:', e));
// }

// export async function storeTasksInDB(tasks) {
//   return new Promise((resolve, reject) => {
//     const request = indexedDB.open('tasksDB', 1);
    
//     request.onupgradeneeded = (event) => {
//       const db = event.target.result;
//       if (!db.objectStoreNames.contains('tasks')) {
//         db.createObjectStore('tasks', { keyPath: 'id' });
//       }
//     };

//     request.onsuccess = (event) => {
//       const db = event.target.result;
//       const tx = db.transaction('tasks', 'readwrite');
//       const store = tx.objectStore('tasks');
      
//       store.clear().onsuccess = () => {
//         tasks.forEach(task => store.put(task));
//         resolve();
//       };
//     };

//     request.onerror = (event) => {
//       reject(event.target.error);
//     };
//   });
// }

// export async function getTasksFromDB() {
//   return new Promise((resolve, reject) => {
//     const request = indexedDB.open('tasksDB', 1);
    
//     request.onsuccess = (event) => {
//       const db = event.target.result;
//       const tx = db.transaction('tasks', 'readonly');
//       const store = tx.objectStore('tasks');
//       const request = store.getAll();
      
//       request.onsuccess = () => resolve(request.result || []);
//       request.onerror = () => reject(request.error);
//     };

//     request.onerror = (event) => {
//       reject(event.target.error);
//     };
//   });
// }

let audioContext;
let audioSource;
let fallbackAudio; // For HTML5 Audio

export function showNotification(title, options = {}) {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications.');
    return;
  }

  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'playSound') {
      playAlarmSound(); // Play sound when triggered from SW
    }
  });

  const defaultOptions = {
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [200, 100, 200],
    ...options
  };

  if (Notification.permission === 'granted') {
    const notification = new Notification(title, defaultOptions);
    playAlarmSound();

    notification.onclick = () => {
      stopAlarmSound(); // Stop sound when user clicks on notification
      notification.close();
    };
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        const notification = new Notification(title, defaultOptions);
        playAlarmSound();
        
        notification.onclick = () => {
          stopAlarmSound();
          notification.close();
        };
      }
    });
  }
}
// Add these to your notifications.js file

export function scheduleBackgroundSync() {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then(registration => {
      registration.sync.register('sync-tasks').catch(err => {
        console.log('Background Sync registration failed:', err);
      });
    });
  }
}

export function checkAlarms(tasks, setTasks) {
  const now = new Date();
  tasks.forEach(task => {
    if (task.time && !task.completed) {
      const taskTime = new Date(task.time);
      if (now >= taskTime) {
        showNotification(`Reminder: ${task.text}`);
        // Update task as completed
        setTasks(prevTasks => 
          prevTasks.map(t => 
            t.id === task.id ? {...t, completed: true} : t
          )
        );
      }
    }
  });
}

export function playAlarmSound() {
  stopAlarmSound(); // Ensure no previous sound is playing

  if (window.AudioContext || window.webkitAudioContext) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const request = new XMLHttpRequest();
      request.open('GET', '/alarm.mp3', true);
      request.responseType = 'arraybuffer';

      request.onload = function () {
        audioContext.decodeAudioData(request.response, function (buffer) {
          audioSource = audioContext.createBufferSource();
          audioSource.buffer = buffer;
          audioSource.connect(audioContext.destination);
          audioSource.loop = false; // No looping, play once
          audioSource.start(0);
        });
      };
      request.send();
      return;
    } catch (e) {
      console.error('Web Audio API failed:', e);
    }
  }

  // Fallback to HTML5 Audio
  fallbackAudio = new Audio('./alarm.mp3');
  fallbackAudio.play().catch(e => console.log('Audio playback failed:', e));
}

export function stopAlarmSound() {
  if (audioSource) {
    try {
      audioSource.stop();
    } catch (err) {
      console.warn('Audio source stop error:', err);
    }
    audioSource = null;
  }

  if (fallbackAudio) {
    fallbackAudio.pause();
    fallbackAudio.currentTime = 0;
    fallbackAudio = null;
  }

  if (audioContext) {
    audioContext.close().catch(() => {});
    audioContext = null;
  }
}

// IndexedDB Handling
export async function storeTasksInDB(tasks) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('tasksDB', 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('tasks')) {
        db.createObjectStore('tasks', { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      const tx = db.transaction('tasks', 'readwrite');
      const store = tx.objectStore('tasks');

      store.clear().onsuccess = () => {
        tasks.forEach(task => store.put(task));
        resolve();
      };
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

export async function getTasksFromDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('tasksDB', 1);

    request.onsuccess = (event) => {
      const db = event.target.result;
      const tx = db.transaction('tasks', 'readonly');
      const store = tx.objectStore('tasks');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}
