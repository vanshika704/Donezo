
// import { showNotification, storeTasksInDB } from "./notifications";
// import { getTasksFromDB } from './notifications';

// export async function checkAlarms(tasks, setTasks) {
//   const now = new Date();
//   const updatedTasks = tasks.map(task => {
//     if (task.time && new Date(task.time) <= now && !task.completed) {
//       // Show browser notification
//       showNotification(`Alarm: ${task.text}`, {
//         body: 'Your scheduled task is due now!'
//       });

//       // Speak the task out loud
//       speakTask(task.text);

//       return { ...task, completed: true };
//     }
//     return task;
//   });

//   // Update state and DB
//   if (setTasks) setTasks(updatedTasks);
//   await storeTasksInDB(updatedTasks);
//   scheduleBackgroundSync();
// }

// /**
//  * Uses the Web Speech API to speak the task aloud.
//  * @param {string} text - The task text to be spoken.
//  */
// function speakTask(text) {
//   if ('speechSynthesis' in window) {
//     const utterance = new SpeechSynthesisUtterance();
//     utterance.text = `Reminder: ${text}`;
//     utterance.volume = 1; // Max volume
//     utterance.rate = 1; // Normal speed
//     utterance.pitch = 1; // Normal pitch

//     // Try to use a pleasant voice if available
//     const voices = window.speechSynthesis.getVoices();
//     const preferredVoice = voices.find(voice => 
//       voice.name.includes('Google') || voice.lang.includes('en-US')
//     );
//     if (preferredVoice) {
//       utterance.voice = preferredVoice;
//     }

//     window.speechSynthesis.speak(utterance);
//   } else {
//     console.warn('Text-to-speech not supported in this browser');
//   }
// }

// export function scheduleBackgroundSync() {
//   if ('serviceWorker' in navigator && 'SyncManager' in window) {
//     navigator.serviceWorker.ready
//       .then(registration => registration.sync.register('check-alarms'))
//       .catch(console.error);
//   } else {
//     console.log('Background sync not supported, using fallback');
//   }
// }

// export function setupAlarmCheckInterval() {
//   // Initialize speech voices (needed for some browsers)
//   if ('speechSynthesis' in window) {
//     window.speechSynthesis.onvoiceschanged = () => {
//       console.log('Voices loaded');
//     };
//   }

//   // Check alarms every minute
//   setInterval(() => {
//     getTasksFromDB().then(tasks => checkAlarms(tasks));
//   }, 60000);
// }

////////////////////////////////////////////////////
// import { showNotification, storeTasksInDB, getTasksFromDB } from "./notifications";

// // Global variable to track alarm state
// let alarmCheckInterval;
// let isSpeaking = false;

// export async function checkAlarms(tasks, setTasks) {
//   try {
//     const now = new Date();
//     let shouldUpdate = false;
//     const updatedTasks = tasks.map(task => {
//       if (task.time && new Date(task.time) <= now && !task.completed) {
//         shouldUpdate = true;
        
//         // Show notification
//         showNotification(`Alarm: ${task.text}`, {
//           body: 'Your scheduled task is due now!',
//           vibrate: [200, 100, 200, 100, 200] // Mobile vibration pattern
//         });

//         // Speak the task (with mobile-friendly handling)
//         if (!isSpeaking) {
//           speakTask(task.text);
//         }

//         return { ...task, completed: true };
//       }
//       return task;
//     });

//     // Only update if changes were made
//     if (shouldUpdate) {
//       if (setTasks) setTasks(updatedTasks);
//       await storeTasksInDB(updatedTasks);
//       await scheduleBackgroundSync();
//     }

//   } catch (error) {
//     console.error('Alarm check failed:', error);
//     // Fallback: Try again after short delay
//     setTimeout(() => checkAlarms(tasks, setTasks), 5000);
//   }
// }

// /**
//  * Enhanced text-to-speech with mobile support and error handling
//  */
// function speakTask(text) {
//   if (!('speechSynthesis' in window)) {
//     console.warn('Text-to-speech not supported');
//     return;
//   }

//   // Cancel any ongoing speech
//   window.speechSynthesis.cancel();
//   isSpeaking = true;

//   const utterance = new SpeechSynthesisUtterance();
//   utterance.text = `Reminder: ${text}`;
//   utterance.volume = 1;
//   utterance.rate = 0.9; // Slightly slower for clarity
//   utterance.pitch = 1.1; // Slightly higher pitch for alerts

//   // Handle voice selection across devices
//   const voices = window.speechSynthesis.getVoices();
//   const preferredVoice = voices.find(voice => 
//     voice.name.includes('Google') || 
//     voice.name.includes('Samantha') || // iOS default
//     voice.lang.includes('en-US')
//   );

//   if (preferredVoice) {
//     utterance.voice = preferredVoice;
//   } else if (voices.length > 0) {
//     utterance.voice = voices[0]; // Fallback to first available voice
//   }

//   // Error handling
//   utterance.onerror = (event) => {
//     console.error('Speech synthesis error:', event.error);
//     isSpeaking = false;
//   };

//   utterance.onend = () => {
//     isSpeaking = false;
//   };

//   // Mobile devices may require user interaction
//   try {
//     window.speechSynthesis.speak(utterance);
//   } catch (error) {
//     console.warn('Speech failed, may need user interaction:', error);
//     isSpeaking = false;
//   }
// }

// /**
//  * More reliable background sync with retry logic
//  */
// export async function scheduleBackgroundSync() {
//   if (!('serviceWorker' in navigator)) return;

//   try {
//     const registration = await navigator.serviceWorker.ready;
    
//     if ('sync' in registration) {
//       await registration.sync.register('check-alarms');
//       console.log('Background sync registered');
//     } else {
//       // Fallback for browsers without background sync
//       console.log('Using periodic checks instead of background sync');
//     }
//   } catch (error) {
//     console.error('Background sync registration failed:', error);
    
//     // Retry after delay
//     setTimeout(scheduleBackgroundSync, 10000);
//   }
// }

// /**
//  * Improved interval-based alarm checking with cleanup
//  */
// export function setupAlarmCheckInterval(setTasks) {
//   // Initialize speech synthesis voices
//   if ('speechSynthesis' in window) {
//     const loadVoices = () => {
//       if (window.speechSynthesis.getVoices().length > 0) {
//         console.log('Voices loaded');
//       } else {
//         setTimeout(loadVoices, 100);
//       }
//     };
//     loadVoices();
//   }

//   // Clear any existing interval
//   if (alarmCheckInterval) {
//     clearInterval(alarmCheckInterval);
//   }

//   // Initial check
//   getTasksFromDB().then(tasks => checkAlarms(tasks, setTasks));

//   // Set up periodic checking
//   alarmCheckInterval = setInterval(() => {
//     getTasksFromDB().then(tasks => checkAlarms(tasks, setTasks));
//   }, 60000); // Check every minute

//   // Return cleanup function
//   return () => {
//     if (alarmCheckInterval) {
//       clearInterval(alarmCheckInterval);
//     }
//     if ('speechSynthesis' in window) {
//       window.speechSynthesis.cancel();
//     }
//   };
// }

// /**
//  * Additional utility for immediate alarm testing
//  */
// export async function testAlarmNotification() {
//   const testTask = {
//     id: 'test-' + Date.now(),
//     text: 'This is a test alarm',
//     time: new Date().toISOString(),
//     completed: false
//   };

//   await checkAlarms([testTask]);
// }
/////////////////////////////////////////////////////////////////////
import { showNotification } from "./notifications.js";
import { getTasksFromDB, storeTasksInDB } from "./notifications.js";

// Global state
let alarmCheckInterval;
let isSpeaking = false;
let voicesLoaded = false;

// Voice initialization
function loadVoices() {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis?.getVoices();
    if (voices?.length > 0) {
      voicesLoaded = true;
      resolve();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        voicesLoaded = true;
        resolve();
      };
    }
  });
}

// Enhanced alarm checking
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
      showNotification(`Alarm: ${task.text}`, {
        body: 'Your scheduled task is due now!',
        vibrate: [200, 100, 200, 100, 200]
      });

      if (!isSpeaking) {
        await speakTask(task.text);
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

// Robust text-to-speech
async function speakTask(text) {
  if (!('speechSynthesis' in window)) return;

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
}

// Reliable background sync
export async function scheduleBackgroundSync() {
  if (!('serviceWorker' in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    if ('sync' in registration) {
      await registration.sync.register('alarm-sync');
    }
  } catch (error) {
    console.error('Sync failed:', error);
    setTimeout(scheduleBackgroundSync, 30000);
  }
}

// Interval management
export function setupAlarmCheckInterval(setTasks) {
  if ('speechSynthesis' in window) loadVoices();

  // Clear existing interval
  if (alarmCheckInterval) clearInterval(alarmCheckInterval);

  // Initial check
  getTasksFromDB().then(tasks => checkAlarms(tasks, setTasks));

  // Set new interval
  alarmCheckInterval = setInterval(() => {
    getTasksFromDB().then(tasks => checkAlarms(tasks, setTasks));
  }, 60000);

  // Cleanup function
  return () => {
    clearInterval(alarmCheckInterval);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };
}

// Test utility
export async function testAlarm() {
  await checkAlarms([{
    id: 'test-' + Date.now(),
    text: 'Test alarm',
    time: new Date().toISOString(),
    completed: false
  }]);
}