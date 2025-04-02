
import { getTasksFromDB, showNotification, storeTasksInDB } from "./notifications";

/////////////////////////////////////////////////////////////////////
let alarmCheckInterval;
let isSpeaking = false;
let voicesLoaded = false;

// Voice initialization with retry
function loadVoices() {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis?.getVoices();
    if (voices?.length > 0) {
      voicesLoaded = true;
      resolve();
    } else {
      const checkVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        if (availableVoices.length > 0) {
          voicesLoaded = true;
          resolve();
        } else {
          setTimeout(checkVoices, 100);
        }
      };
      window.speechSynthesis.onvoiceschanged = checkVoices;
      checkVoices();
    }
  });
}

// Mobile-optimized alarm checking
export async function checkAlarms(tasks, setTasks) {
  const now = new Date();
  const updatedTasks = [];
  let needsUpdate = false;

  for (const task of tasks) {
    if (!task.time || task.completed) {
      updatedTasks.push(task);
      continue;
    }

    const taskTime = new Date(task.time);
    const isDue = taskTime <= now;

    if (isDue) {
      needsUpdate = true;
      try {
        await showNotification(`Alarm: ${task.text}`, {
          body: 'Your scheduled task is due now!',
          vibrate: [200, 100, 200, 100, 200],
          requireInteraction: true
        });

        if (!isSpeaking) {
          await speakTask(task.text);
        }
      } catch (error) {
        console.error('Notification failed:', error);
      }

      updatedTasks.push({ ...task, completed: true });
    } else {
      updatedTasks.push(task);
    }
  }

  if (needsUpdate) {
    if (setTasks) setTasks(updatedTasks);
    await storeTasksInDB(updatedTasks);
    await scheduleBackgroundSync();
  }
}

// Reliable text-to-speech with error handling
async function speakTask(text) {
  if (!('speechSynthesis' in window)) return;

  try {
    if (!voicesLoaded) await loadVoices();
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(`Reminder: ${text}`);
    utterance.volume = 1;
    utterance.rate = 0.9;
    utterance.pitch = 1.1;

    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.includes('en')) || voices[0];
    if (voice) utterance.voice = voice;

    isSpeaking = true;
    utterance.onend = utterance.onerror = () => {
      isSpeaking = false;
    };

    window.speechSynthesis.speak(utterance);
  } catch (error) {
    console.error('Speech synthesis failed:', error);
    isSpeaking = false;
  }
}

// Background sync with retry
export async function scheduleBackgroundSync() {
  if (!('serviceWorker' in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    if ('sync' in registration) {
      await registration.sync.register('alarm-sync');
    } else {
      // Fallback for browsers without background sync
      setTimeout(checkAlarms, 30000);
    }
  } catch (error) {
    console.error('Sync registration failed:', error);
    setTimeout(scheduleBackgroundSync, 60000);
  }
}

// Interval management with visibility awareness
export function setupAlarmCheckInterval(setTasks) {
  if ('speechSynthesis' in window) loadVoices();

  // Clear existing interval
  if (alarmCheckInterval) clearInterval(alarmCheckInterval);

  // Initial check
  getTasksFromDB().then(tasks => checkAlarms(tasks, setTasks));

  // Set new interval with visibility awareness
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      // More frequent checks when visible
      alarmCheckInterval = setInterval(() => {
        getTasksFromDB().then(tasks => checkAlarms(tasks, setTasks));
      }, 30000);
    } else {
      // Less frequent checks when hidden
      clearInterval(alarmCheckInterval);
      alarmCheckInterval = setInterval(() => {
        getTasksFromDB().then(tasks => checkAlarms(tasks, setTasks));
      }, 60000);
    }
  };

  // Set initial interval
  handleVisibilityChange();
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Cleanup function
  return () => {
    clearInterval(alarmCheckInterval);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };
}