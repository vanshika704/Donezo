

// import { useState } from 'react';
// import { parseTimeFromText } from '../utils/timeParser';

// export default function VoiceInput({ onAddTask }) {
//   const [text, setText] = useState('');
//   const [isListening, setIsListening] = useState(false);
//   const [recognition, setRecognition] = useState(null);

//   const startListening = () => {
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRecognition) {
//       alert('Speech recognition not supported in your browser. Try Chrome or Edge.');
//       return;
//     }

//     const recognition = new SpeechRecognition();
//     recognition.continuous = false;
//     recognition.interimResults = false;
//     recognition.lang = 'en-US';

//     recognition.onstart = () => {
//       setIsListening(true);
//     };

//     recognition.onresult = (event) => {
//       const transcript = event.results[0][0].transcript;
//       setText(transcript);
//     };

//     recognition.onerror = (event) => {
//       console.error('Speech recognition error', event.error);
//       setIsListening(false);
//     };

//     recognition.onend = () => {
//       setIsListening(false);
//     };

//     recognition.start();
//     setRecognition(recognition);
//   };

//   const stopListening = () => {
//     if (recognition) {
//       recognition.stop();
//     }
//   };

//   const toggleListening = () => {
//     isListening ? stopListening() : startListening();
//   };

//   const handleAddTask = () => {
//     if (text.trim()) {
//       const { cleanedText, time } = parseTimeFromText(text);
//       onAddTask(cleanedText, time);
//       setText('');
//     }
//   };

//   return (
//     <div className="space-y-4">
//       <div className="flex items-center space-x-4">
//         <button
//           onClick={toggleListening}
//           className={`rounded-full w-16 h-16 flex items-center justify-center text-2xl transition-all ${
//             isListening 
//               ? 'bg-danger text-white shadow-lg transform scale-110' 
//               : 'bg-primary text-white hover:bg-blue-600'
//           }`}
//           type="button"
//           aria-label={isListening ? 'Stop listening' : 'Start listening'}
//         >
//           {isListening ? '🛑' : '🎤'}
//         </button>
        
//         <input
//           type="text"
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//           placeholder="Say or type your reminder..."
//           className="flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
//           onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
//         />
//       </div>
      
//       <p className="text-sm text-gray-500 dark:text-gray-400">
//         Example: "Remind me to workout at 7 PM" or "Call mom in 30 minutes"
//       </p>
      
//       {text && (
//         <button 
//           onClick={handleAddTask} 
//           className="w-full py-2 px-4 bg-secondary hover:bg-green-600 text-white rounded-lg transition-colors"
//           type="button"
//         >
//           Add Reminder
//         </button>
//       )}
//     </div>
//   );
// }
import { useState } from 'react';
import { parseTimeFromText } from '../utils/timeParser';

export default function VoiceInput({ onAddTask }) {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition not supported in your browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e) => setText(e.results[0][0].transcript);
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const handleSubmit = () => {
    if (text.trim()) {
      const { cleanedText, time } = parseTimeFromText(text);
      onAddTask(cleanedText, time);
      setText('');
    }
  };

  return (
    <div className="mb-4">
      <div className="flex">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Speak or type a reminder..."
          className="flex-grow p-2 border rounded-l"
        />
        <button
          onClick={startListening}
          className={`px-4 ${isListening ? 'bg-red-500' : 'bg-blue-500'} text-white rounded-r`}
        >
          {isListening ? '🛑' : '🎤'}
        </button>
      </div>
      <button
        onClick={handleSubmit}
        disabled={!text.trim()}
        className="w-full mt-2 p-2 bg-green-500 text-white rounded disabled:opacity-50"
      >
        Add Reminder
      </button>
    </div>
  );
}