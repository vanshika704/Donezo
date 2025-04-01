
// import { useEffect } from 'react';
// import VoiceInput from './components/VoiceInput';
// import useLocalStorage from './hooks/uselocalstorage';

// import productivityImage  from './assets/ai-generated-8876528_1280.png';
// import { storeTasksInDB } from './utils/notifications';
// import { checkAlarms, scheduleBackgroundSync } from './utils/alarmutils';
// import TaskList from './components/TaskList';
// export default function App() {
//   const [tasks, setTasks] = useLocalStorage('voice-todo-tasks', []);

//   // Add new task
//   const addTask = (text, time) => {
//     const newTask = { id: Date.now(), text, time, completed: false };
//     const updatedTasks = [...tasks, newTask];
//     setTasks(updatedTasks);
//     storeTasksInDB(updatedTasks);
//     scheduleBackgroundSync();
//   };

//   // Delete task
//   const deleteTask = (id) => {
//     const updatedTasks = tasks.filter(task => task.id !== id);
//     setTasks(updatedTasks);
//     storeTasksInDB(updatedTasks);
//   };

//   // Check alarms every minute
//   useEffect(() => {
//     const interval = setInterval(() => checkAlarms(tasks, setTasks), 60000);
//     return () => clearInterval(interval);
//   }, [tasks, setTasks]);

//   // Register service worker and notifications
//   useEffect(() => {
//     if ('serviceWorker' in navigator) {
//       navigator.serviceWorker.register('./sw.js')
//         .then(reg => console.log('SW registered:', reg))
//         .catch(err => console.log('SW registration failed:', err));
//     }

//     if ('Notification' in window) {
//       Notification.requestPermission();
//     }

//     checkAlarms(tasks, setTasks);
//   }, []);

//   return (
//     <div className="min-h-screen bg-gray-900 text-gray-100">
//       {/* Gradient overlay */}
//       <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20 pointer-events-none"></div>
      
//       {/* Main layout */}
//       <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
//         {/* Left side - Branding and image */}
//         <div className="lg:w-1/2 flex flex-col">
//           <h1 className="text-5xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
//             Donezo
//           </h1>
          
//           <p className="text-lg text-gray-300 mb-8">
//             Your voice-powered task manager with colorful reminders
//           </p>
          
//           <div className="relative rounded-2xl overflow-hidden border-2 border-purple-500/30 flex-1 max-h-[550px]">
//             <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10"></div>
//             <img 
//               src={productivityImage}  
//               alt="Productivity illustration"
//               className="w-full h-screen object-cover opacity-90"
//             />
//             <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
//               <p className="text-lg text-purple-200">
//                 "Speak your tasks, we'll handle the rest"
//               </p>
//             </div>
//           </div>
//         </div>
        
//         {/* Right side - Task manager */}
//         <div className="lg:w-1/2 mt-29">
//           <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 shadow-xl shadow-purple-900/10">
//             <div className="mb-8">
//               <h2 className="text-2xl font-bold mb-2 text-white flex items-center">
//                 <span className="w-4 h-4 rounded-full bg-pink-500 mr-2 animate-pulse"></span>
//                 Add New Task
//               </h2>
//               <VoiceInput onAddTask={addTask} />
//             </div>
            
//             <div className="mb-4 flex items-center justify-between ">
//               <h2 className="text-2xl font-bold text-white flex items-center">
//                 <span className="w-4 h-4 rounded-full bg-blue-500 mr-2"></span>
//                 Your Tasks
//               </h2>
//               <span className="px-3 py-1 rounded-full bg-purple-900/50 text-purple-200 text-sm">
//                 {tasks.length} {tasks.length === 1 ? 'item' : 'items'}
//               </span>
//             </div>
            
//             {/* <div className="space-y-4">
//               <TaskList tasks={tasks} onDelete={deleteTask} />
//             </div> */}
//             <div className="space-y-4">
//             <div 
//   className="max-h-[250px] overflow-y-auto pr-2 scrollbar-thin scrollbar-track-gray-800/50"
//   style={{
//     scrollbarColor: '#ec4899 #27242FFF',
//   }}
// >
//   <TaskList tasks={tasks} onDelete={deleteTask} />
// </div>
// </div>
//             {tasks.length === 0 && (
//               <div className="text-center py-12">
//                 <div className="text-gray-500 mb-4">
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
//                   </svg>
//                 </div>
//                 <p className="text-gray-400">No tasks yet. Add one with your voice!</p>
//                 <p className="text-sm text-gray-500 mt-2">Try saying "Remind me to call mom at 3pm"</p>
//               </div>
//             )}
//           </div>
          
//           {/* Colorful footer */}
//           <div className="mt-6 flex items-center justify-center gap-2">
//             {['bg-pink-500', 'bg-purple-500', 'bg-blue-500', 'bg-cyan-500'].map((color, i) => (
//               <div key={i} className={`w-3 h-3 rounded-full ${color} opacity-80`}></div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
import { useEffect, useState } from 'react';
import VoiceInput from './components/VoiceInput';
import useLocalStorage from './hooks/uselocalstorage';
import productivityImage from './assets/ai-generated-8876528_1280.png';
import { stopAlarmSound, storeTasksInDB } from './utils/notifications';
import { checkAlarms, scheduleBackgroundSync } from './utils/alarmutils';
import TaskList from './components/TaskList';

export default function App() {
  const [tasks, setTasks] = useLocalStorage('voice-todo-tasks', []);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isPWA, setIsPWA] = useState(window.matchMedia('(display-mode: standalone)').matches);

  // Add new task with enhanced mobile support
  const addTask = async (text, time) => {
    const newTask = { 
      id: Date.now(), 
      text, 
      time: time?.toISOString(), 
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    
    try {
      await storeTasksInDB(updatedTasks);
      await scheduleBackgroundSync();
      
      // Request notification permission if not granted
      if (Notification.permission !== 'granted') {
        await Notification.requestPermission();
      }
      
      // For iOS, show special instructions
      if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        if (!isPWA && Notification.permission !== 'granted') {
          alert('For best experience with alarms, please add this app to your home screen and enable notifications.');
        }
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  // Delete task with confirmation
  const deleteTask = (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      const updatedTasks = tasks.filter(task => task.id !== id);
      setTasks(updatedTasks);
      storeTasksInDB(updatedTasks).catch(console.error);
    }
  };

  // Check network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  // Add to your useEffect for service worker:
useEffect(() => {
  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => {
        // Enable periodic background sync
        if ('periodicSync' in reg) {
          reg.periodicSync.register('alarm-check', {
            minInterval: 60 * 60 * 1000 // 1 hour
          });
        }
      });
  }

  // Listen for messages from service worker
  navigator.serviceWorker?.addEventListener('message', (event) => {
    if (event.data.type === 'stopAlarm') {
      stopAlarmSound();
    }
  });
}, []);

  // Check alarms and setup service worker
  useEffect(() => {
    // Initial alarm check
    checkAlarms(tasks, setTasks);
    
    // Setup periodic checking
    const alarmInterval = setInterval(() => {
      checkAlarms(tasks, setTasks);
    }, 60000);
    
    // Register service worker
    const registerSW = async () => {
      try {
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.register('./sw.js');
          console.log('Service Worker registered');
          
          // Check for updates every hour
          setInterval(async () => {
            await reg.update();
          }, 3600000);
        }
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    };
    
    registerSW();
    
    return () => clearInterval(alarmInterval);
  }, [tasks, setTasks]);

  // PWA installation prompt
  useEffect(() => {
    let deferredPrompt;
    
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      deferredPrompt = e;
      
      // Show install button or prompt after delay
      setTimeout(() => {
        if (!isPWA && window.confirm('Install this app for better alarm functionality?')) {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then((choice) => {
            if (choice.outcome === 'accepted') {
              setIsPWA(true);
            }
          });
        }
      }, 10000);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isPWA]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 relative overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-pink-900/20 pointer-events-none"></div>
      
      {/* Offline indicator */}
      {!isOnline && (
        <div className="absolute top-4 left-0 right-0 flex justify-center z-50">
          <div className="bg-red-600/90 text-white px-4 py-2 rounded-full shadow-lg flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
            Offline Mode - Alarms may not work
          </div>
        </div>
      )}
      
      {/* PWA install reminder for iOS */}
      {/iPhone|iPad|iPod/i.test(navigator.userAgent) && !isPWA && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center z-50 px-4">
          <div className="bg-purple-600/90 text-white px-4 py-3 rounded-xl shadow-lg max-w-md">
            <p className="font-medium">For best experience:</p>
            <p className="text-sm">Tap <span className="font-bold">Share</span> → <span className="font-bold">Add to Home Screen</span></p>
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 relative z-10">
        {/* Left side - Branding and image */}
        <div className="lg:w-1/2 flex flex-col">
          <h1 className="text-5xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
            Donezo
          </h1>
          
          <p className="text-lg text-gray-300 mb-8">
            Your voice-powered task manager with colorful reminders
          </p>
          
          <div className="relative rounded-2xl overflow-hidden border-2 border-purple-500/30 flex-1 max-h-[550px]">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10"></div>
            <img 
              src={productivityImage}  
              alt="Productivity illustration"
              className="w-full h-full object-cover opacity-90"
              loading="lazy"
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-lg text-purple-200">
                "Speak your tasks, we'll handle the rest"
              </p>
            </div>
          </div>
        </div>
        
        {/* Right side - Task manager */}
        <div className="lg:w-1/2   mt-28">
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 shadow-xl shadow-purple-900/10">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2 text-white flex items-center">
                <span className="w-4 h-4 rounded-full bg-pink-500 mr-2 animate-pulse"></span>
                Add New Task
              </h2>
              <VoiceInput onAddTask={addTask} />
            </div>
            
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <span className="w-4 h-4 rounded-full bg-blue-500 mr-2"></span>
                Your Tasks
              </h2>
              <span className="px-3 py-1 rounded-full bg-purple-900/50 text-purple-200 text-sm">
                {tasks.length} {tasks.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            
            <div 
              className="max-h-[250px] overflow-y-auto pr-2 scrollbar-thin scrollbar-track-gray-800/50"
              style={{ scrollbarColor: '#ec4899 #27242FFF' }}
            >
              <TaskList tasks={tasks} onDelete={deleteTask} />
            </div>
            
            {tasks.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-gray-400">No tasks yet. Add one with your voice!</p>
                <p className="text-sm text-gray-500 mt-2">Try saying "Remind me to call mom at 3pm"</p>
              </div>
            )}
          </div>
          
          {/* Colorful footer */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {['bg-pink-500', 'bg-purple-500', 'bg-blue-500', 'bg-cyan-500'].map((color, i) => (
              <div key={i} className={`w-3 h-3 rounded-full ${color} opacity-80`}></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}