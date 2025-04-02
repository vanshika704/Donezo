let audioContext;
let audioSource;
let fallbackAudio;
let isPlaying = false;

// Mobile-friendly audio playback
export function playAlarmSound() {
  if (isPlaying) return;
  isPlaying = true;

  // Create audio context on user interaction
  const initAudio = () => {
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
  };

  // On mobile, we need user interaction to play audio
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    // Create and click a transparent button
    const button = document.createElement('button');
    button.style.position = 'fixed';
    button.style.opacity = '0';
    button.style.height = '1px';
    button.style.width = '1px';
    button.onclick = initAudio;
    document.body.appendChild(button);
    button.click();
    setTimeout(() => document.body.removeChild(button), 1000);
  } else {
    initAudio();
  }
}

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
  if (fallbackAudio) {
    fallbackAudio.pause();
    fallbackAudio.currentTime = 0;
    fallbackAudio = null;
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

// Enhanced notification with permission handling
export async function showNotification(title, options = {}) {
  if (!('Notification' in window)) return;

  // Request permission if not granted
  if (Notification.permission !== 'granted') {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;
  }

  // Add default options
  const notificationOptions = {
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    vibrate: [200, 100, 200],
    ...options
  };

  // Play alarm sound (will handle mobile restrictions)
  playAlarmSound();

  // Show notification
  const notification = new Notification(title, notificationOptions);

  // Notification handlers
  notification.onclick = () => {
    stopAlarmSound();
    notification.close();
    if ('clients' in self) {
      self.clients.matchAll({ type: 'window' }).then(clientList => {
        if (clientList.length > 0) {
          clientList[0].focus();
        } else {
          self.clients.openWindow('/');
        }
      });
    }
  };

  notification.onclose = () => {
    stopAlarmSound();
  };

  return notification;
}

// IndexedDB operations with error handling
export async function storeTasksInDB(tasks) {
  try {
    const db = await openDB();
    const tx = db.transaction('tasks', 'readwrite');
    const store = tx.objectStore('tasks');
    await Promise.all(tasks.map(task => store.put(task)));
    return true;
  } catch (error) {
    console.error('Error storing tasks:', error);
    return false;
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

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('tasksDB', 2);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('tasks')) {
        db.createObjectStore('tasks', { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
