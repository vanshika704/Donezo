
// let audioContext;
// let audioSource;
// let fallbackAudio; // For HTML5 Audio

// export function showNotification(title, options = {}) {
//   if (!('Notification' in window)) {
//     console.log('This browser does not support notifications.');
//     return;
//   }

//   navigator.serviceWorker.addEventListener('message', (event) => {
//     if (event.data && event.data.type === 'playSound') {
//       playAlarmSound(); // Play sound when triggered from SW
//     }
//   });

//   const defaultOptions = {
//     icon: '/icon-192x192.png',
//     badge: '/badge-72x72.png',
//     vibrate: [200, 100, 200],
//     ...options
//   };

//   if (Notification.permission === 'granted') {
//     const notification = new Notification(title, defaultOptions);
//     playAlarmSound();

//     notification.onclick = () => {
//       stopAlarmSound(); // Stop sound when user clicks on notification
//       notification.close();
//     };
//   } else if (Notification.permission !== 'denied') {
//     Notification.requestPermission().then(permission => {
//       if (permission === 'granted') {
//         const notification = new Notification(title, defaultOptions);
//         playAlarmSound();
        
//         notification.onclick = () => {
//           stopAlarmSound();
//           notification.close();
//         };
//       }
//     });
//   }
// }

// export function playAlarmSound() {
//   stopAlarmSound(); // Ensure no previous sound is playing

//   if (window.AudioContext || window.webkitAudioContext) {
//     try {
//       audioContext = new (window.AudioContext || window.webkitAudioContext)();
//       const request = new XMLHttpRequest();
//       request.open('GET', '/alarm.mp3', true);
//       request.responseType = 'arraybuffer';

//       request.onload = function () {
//         audioContext.decodeAudioData(request.response, function (buffer) {
//           audioSource = audioContext.createBufferSource();
//           audioSource.buffer = buffer;
//           audioSource.connect(audioContext.destination);
//           audioSource.loop = false; // No looping, play once
//           audioSource.start(0);
//         });
//       };
//       request.send();
//       return;
//     } catch (e) {
//       console.error('Web Audio API failed:', e);
//     }
//   }

//   // Fallback to HTML5 Audio
//   fallbackAudio = new Audio('/alarm.mp3');
//   fallbackAudio.play().catch(e => console.log('Audio playback failed:', e));
// }

// export function stopAlarmSound() {
//   if (audioSource) {
//     try {
//       audioSource.stop();
//     } catch (err) {
//       console.warn('Audio source stop error:', err);
//     }
//     audioSource = null;
//   }

//   if (fallbackAudio) {
//     fallbackAudio.pause();
//     fallbackAudio.currentTime = 0;
//     fallbackAudio = null;
//   }

//   if (audioContext) {
//     audioContext.close().catch(() => {});
//     audioContext = null;
//   }
// }

// // IndexedDB Handling
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
// Audio state management


///////////////////////////////////////////
// let audioContext;
// let audioSource;
// let fallbackAudio;
// let isPlaying = false;

// // Notification sound management
// export function showNotification(title, options = {}) {
//   if (!('Notification' in window)) {
//     console.warn('Notifications not supported');
//     return;
//   }

//   // Default notification options
//   const defaultOptions = {
//     icon: '/icon-192x192.png',
//     badge: '/badge-72x72.png',
//     vibrate: [200, 100, 200, 100, 200], // Extended vibration pattern
//     ...options
//   };

//   const handleNotificationClick = (notification) => {
//     stopAlarmSound();
//     notification.close();
//     focusAppWindow();
//   };

//   const displayNotification = () => {
//     const notification = new Notification(title, defaultOptions);
//     playAlarmSound();
    
//     notification.onclick = () => handleNotificationClick(notification);
//     notification.onclose = stopAlarmSound;
    
//     // Auto-close after 30 seconds if not already closed
//     setTimeout(() => {
//       if (notification.close) {
//         notification.close();
//       }
//     }, 30000);
//   };

//   if (Notification.permission === 'granted') {
//     displayNotification();
//   } else if (Notification.permission !== 'denied') {
//     Notification.requestPermission().then(permission => {
//       if (permission === 'granted') {
//         displayNotification();
//       }
//     });
//   }
// }

// // Improved audio playback with mobile support
// export function playAlarmSound() {
//   // Prevent multiple simultaneous playbacks
//   if (isPlaying) return;
//   isPlaying = true;

//   stopAlarmSound(); // Clean up any existing audio

//   // Try Web Audio API first
//   if (window.AudioContext || window.webkitAudioContext) {
//     try {
//       const AudioContextClass = window.AudioContext || window.webkitAudioContext;
//       audioContext = new AudioContextClass();
      
//       fetch('/alarm.mp3')
//         .then(response => response.arrayBuffer())
//         .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
//         .then(buffer => {
//           audioSource = audioContext.createBufferSource();
//           audioSource.buffer = buffer;
//           audioSource.connect(audioContext.destination);
//           audioSource.loop = false;
//           audioSource.start(0);
          
//           audioSource.onended = () => {
//             isPlaying = false;
//             cleanupAudioResources();
//           };
//         })
//         .catch(e => {
//           console.error('Web Audio API error:', e);
//           fallbackToHTML5Audio();
//         });
      
//       return;
//     } catch (e) {
//       console.error('Web Audio initialization failed:', e);
//     }
//   }

//   // Fallback to HTML5 Audio
//   fallbackToHTML5Audio();
// }

// function fallbackToHTML5Audio() {
//   try {
//     fallbackAudio = new Audio('/alarm.mp3');
//     fallbackAudio.preload = 'auto';
    
//     fallbackAudio.play()
//       .then(() => {
//         fallbackAudio.onended = () => {
//           isPlaying = false;
//           cleanupAudioResources();
//         };
//       })
//       .catch(e => {
//         console.error('HTML5 Audio playback failed:', e);
//         isPlaying = false;
//       });
//   } catch (e) {
//     console.error('HTML5 Audio initialization failed:', e);
//     isPlaying = false;
//   }
// }

// export function stopAlarmSound() {
//   if (isPlaying) {
//     if (audioSource) {
//       try {
//         audioSource.stop();
//       } catch (e) {
//         console.warn('Error stopping audio source:', e);
//       }
//     }

//     if (fallbackAudio) {
//       fallbackAudio.pause();
//       fallbackAudio.currentTime = 0;
//     }

//     isPlaying = false;
//     cleanupAudioResources();
//   }
// }

// function cleanupAudioResources() {
//   if (audioContext) {
//     audioContext.close().catch(() => {});
//     audioContext = null;
//   }
//   audioSource = null;
//   fallbackAudio = null;
// }

// function focusAppWindow() {
//   if ('clients' in self) {
//     self.clients.matchAll({ type: 'window' }).then(clientList => {
//       if (clientList.length > 0) {
//         clientList[0].focus();
//       } else if ('openWindow' in self.clients) {
//         self.clients.openWindow('/');
//       }
//     });
//   }
// }

// // Enhanced IndexedDB operations with transactions
// export async function storeTasksInDB(tasks) {
//   return new Promise((resolve, reject) => {
//     const request = indexedDB.open('tasksDB', 2); // Version bump for schema changes

//     request.onupgradeneeded = (event) => {
//       const db = event.target.result;
//       if (!db.objectStoreNames.contains('tasks')) {
//         const store = db.createObjectStore('tasks', { keyPath: 'id' });
//         store.createIndex('byTime', 'time', { unique: false });
//       }
//     };

//     request.onsuccess = (event) => {
//       const db = event.target.result;
//       const tx = db.transaction('tasks', 'readwrite');
//       const store = tx.objectStore('tasks');

//       // Clear existing tasks
//       const clearRequest = store.clear();

//       clearRequest.onsuccess = () => {
//         // Store all new tasks
//         const putPromises = tasks.map(task => {
//           return new Promise((res, rej) => {
//             const putRequest = store.put(task);
//             putRequest.onsuccess = res;
//             putRequest.onerror = rej;
//           });
//         });

//         Promise.all(putPromises)
//           .then(() => resolve())
//           .catch(reject);
//       };

//       clearRequest.onerror = () => reject(clearRequest.error);
//     };

//     request.onerror = (event) => {
//       reject(event.target.error);
//     };
//   });
// }

// export async function getTasksFromDB() {
//   return new Promise((resolve, reject) => {
//     const request = indexedDB.open('tasksDB', 2);

//     request.onsuccess = (event) => {
//       const db = event.target.result;
//       const tx = db.transaction('tasks', 'readonly');
//       const store = tx.objectStore('tasks');
//       const getAllRequest = store.getAll();

//       getAllRequest.onsuccess = () => resolve(getAllRequest.result || []);
//       getAllRequest.onerror = () => reject(getAllRequest.error);
//     };

//     request.onerror = (event) => {
//       reject(event.target.error);
//     };
//   });
// }

// // Additional utility for PWA
// export function registerServiceWorker() {
//   if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('/sw.js')
//       .then(registration => {
//         console.log('ServiceWorker registration successful');
        
//         // Handle updates
//         registration.addEventListener('updatefound', () => {
//           const newWorker = registration.installing;
//           newWorker.addEventListener('statechange', () => {
//             if (newWorker.state === 'installed') {
//               if (navigator.serviceWorker.controller) {
//                 console.log('New content available; please refresh.');
//               }
//             }
//           });
//         });
//       })
//       .catch(error => {
//         console.error('ServiceWorker registration failed:', error);
//       });
//   }
// }
/////////////////////////////////////////
let audioContext;
let audioSource;
let fallbackAudio;
let isPlaying = false;

// ================ IndexedDB Helpers ================
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('tasksDB', 2);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('tasks')) {
        db.createObjectStore('tasks', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// ================ Audio Functions ================
function fallbackToHTML5Audio() {
  fallbackAudio = new Audio('/alarm.mp3');
  fallbackAudio.play()
    .catch(e => console.error('Audio play failed:', e))
    .finally(() => {
      fallbackAudio.onended = () => {
        isPlaying = false;
        cleanupAudio();
      };
    });
}

function cleanupAudio() {
  if (audioContext) {
    audioContext.close().catch(() => {});
    audioContext = null;
  }
  audioSource = null;
  fallbackAudio = null;
}

// Mobile-friendly audio playback
export function playAlarmSound() {
  if (isPlaying) return;
  isPlaying = true;

  // Try Web Audio API first
  if (window.AudioContext || window.webkitAudioContext) {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioContextClass();
      
      fetch('/alarm.mp3')
        .then(response => response.arrayBuffer())
        .then(buffer => audioContext.decodeAudioData(buffer))
        .then(decoded => {
          audioSource = audioContext.createBufferSource();
          audioSource.buffer = decoded;
          audioSource.connect(audioContext.destination);
          audioSource.start(0);
          audioSource.onended = () => {
            isPlaying = false;
            cleanupAudio();
          };
        })
        .catch(() => fallbackToHTML5Audio());
    } catch (e) {
      console.error('Web Audio init failed:', e);
      fallbackToHTML5Audio();
    }
  } else {
    fallbackToHTML5Audio();
  }
}

export function stopAlarmSound() {
  if (isPlaying) {
    if (audioSource) {
      try {
        audioSource.stop();
      } catch (e) {
        console.warn('Error stopping audio source:', e);
      }
    }

    if (fallbackAudio) {
      fallbackAudio.pause();
      fallbackAudio.currentTime = 0;
    }

    isPlaying = false;
    cleanupAudio();
  }
}

// ================ Notification Functions ================
export function showNotification(title, options = {}) {
  if (!('Notification' in window)) return;

  const notification = new Notification(title, {
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [200, 100, 200],
    ...options
  });

  playAlarmSound();

  notification.onclick = () => {
    stopAlarmSound();
    notification.close();
    if ('clients' in self) {
      self.clients.matchAll({ type: 'window' }).then(clientList => {
        if (clientList.length > 0) {
          clientList[0].focus();
        }
      });
    }
  };

  notification.onclose = stopAlarmSound;
}

// ================ Database Functions ================
export async function storeTasksInDB(tasks) {
  try {
    const db = await openDB();
    const tx = db.transaction('tasks', 'readwrite');
    const store = tx.objectStore('tasks');
    await Promise.all(tasks.map(task => store.put(task)));
  } catch (error) {
    console.error('Error storing tasks:', error);
    throw error;
  }
}

export async function getTasksFromDB() {
  try {
    const db = await openDB();
    const tx = db.transaction('tasks', 'readonly');
    const store = tx.objectStore('tasks');
    return new Promise((resolve) => {
      store.getAll().onsuccess = (e) => resolve(e.target.result || []);
    });
  } catch (error) {
    console.error('Error getting tasks:', error);
    return [];
  }
}