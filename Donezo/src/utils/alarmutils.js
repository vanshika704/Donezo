
// import { showNotification, storeTasksInDB } from "./notifications";
// import { getTasksFromDB } from './notifications';

// export async function checkAlarms(tasks, setTasks) {
//   const now = new Date();
//   const updatedTasks = tasks.map(task => {
//     if (task.time && new Date(task.time) <= now && !task.completed) {
//       showNotification(`Alarm: ${task.text}`, {
//         body: 'Your scheduled task is due now!'
//       });
//       return { ...task, completed: true };
//     }
//     return task;
//   });

//   // Update state and DB
//   if (setTasks) setTasks(updatedTasks);
//   await storeTasksInDB(updatedTasks);
//   scheduleBackgroundSync();
// }

// export function scheduleBackgroundSync() {
//   if ('serviceWorker' in navigator && 'SyncManager' in window) {
//     navigator.serviceWorker.ready
//       .then(registration => registration.sync.register('check-alarms'))
//       .catch(console.error);
//   } else {
//     // Fallback for browsers without background sync
//     console.log('Background sync not supported, using fallback');
//   }
// }

// export function setupAlarmCheckInterval() {
//   // Check alarms every minute
//   setInterval(() => {
//     getTasksFromDB().then(tasks => checkAlarms(tasks));
//   }, 60000);
// }

import { showNotification, storeTasksInDB } from "./notifications";
import { getTasksFromDB } from './notifications';

export async function checkAlarms(tasks, setTasks) {
  const now = new Date();
  const updatedTasks = tasks.map(task => {
    if (task.time && new Date(task.time) <= now && !task.completed) {
      // Show browser notification
      showNotification(`Alarm: ${task.text}`, {
        body: 'Your scheduled task is due now!'
      });

      // Speak the task out loud
      speakTask(task.text);

      return { ...task, completed: true };
    }
    return task;
  });

  // Update state and DB
  if (setTasks) setTasks(updatedTasks);
  await storeTasksInDB(updatedTasks);
  scheduleBackgroundSync();
}

/**
 * Uses the Web Speech API to speak the task aloud.
 * @param {string} text - The task text to be spoken.
 */
function speakTask(text) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance();
    utterance.text = `Reminder: ${text}`;
    utterance.volume = 1; // Max volume
    utterance.rate = 1; // Normal speed
    utterance.pitch = 1; // Normal pitch

    // Try to use a pleasant voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') || voice.lang.includes('en-US')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    window.speechSynthesis.speak(utterance);
  } else {
    console.warn('Text-to-speech not supported in this browser');
  }
}

export function scheduleBackgroundSync() {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready
      .then(registration => registration.sync.register('check-alarms'))
      .catch(console.error);
  } else {
    console.log('Background sync not supported, using fallback');
  }
}

export function setupAlarmCheckInterval() {
  // Initialize speech voices (needed for some browsers)
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      console.log('Voices loaded');
    };
  }

  // Check alarms every minute
  setInterval(() => {
    getTasksFromDB().then(tasks => checkAlarms(tasks));
  }, 60000);
}