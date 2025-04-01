

// import { useState } from 'react';
// import { parseTimeFromText } from '../utils/timeparser'; // Correct path

// export default function VoiceInput({ onAddTask }) {
//   const [text, setText] = useState('');
//   const [isListening, setIsListening] = useState(false);

//   const startListening = () => {
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRecognition) {
//       alert('Speech recognition not supported in your browser.');
//       return;
//     }

//     const recognition = new SpeechRecognition();
//     recognition.lang = 'en-US';
//     recognition.interimResults = false;

//     recognition.onstart = () => setIsListening(true);
//     recognition.onresult = (e) => setText(e.results[0][0].transcript);
//     recognition.onerror = () => setIsListening(false);
//     recognition.onend = () => setIsListening(false);

//     recognition.start();
//   };

//   const handleSubmit = () => {
//     if (text.trim()) {
//       const { cleanedText, time } = parseTimeFromText(text);
//       onAddTask(cleanedText, time);
//       setText('');
//     }
//   };

//   return (
//     <div className="mb-4">
//       <div className="flex">
//         <input
//           type="text"
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//           placeholder="Speak or type a reminder..."
//           className="flex-grow p-2 border rounded-l"
//         />
//         <button
//           onClick={startListening}
//           className={`px-4 ${isListening ? 'bg-red-500' : 'bg-blue-500'} text-white rounded-r`}
//         >
//           {isListening ? '🛑' : '🎤'}
//         </button>
//       </div>
//       <button
//         onClick={handleSubmit}
//         disabled={!text.trim()}
//         className="w-full mt-2 p-2 bg-green-500 text-white rounded disabled:opacity-50"
//       >
//         Add Reminder
//       </button>
//     </div>
//   );
// }

import { useState } from 'react';
import { addMinutes, addHours, setHours, setMinutes, isToday } from 'date-fns';

// Time parsing utility functions
const TIME_PATTERNS = [
  // Exact times (3 PM, 3:30 PM)
  /(\d{1,2})(?::(\d{2}))?\s*(AM|PM|am|pm)/i,
  // 24-hour times (15:30)
  /(\d{1,2}):(\d{2})/,
  // Relative times (in 30 minutes, in 2 hours)
  /in\s+(\d+)\s+(minute|hour)s?/i,
  // Special times (noon, midnight)
  /(noon|midnight)/i
];

function parseTimeFromText(text) {
  let time = null;
  let cleanedText = text.trim();

  for (const pattern of TIME_PATTERNS) {
    const match = cleanedText.match(pattern);
    if (!match) continue;

    const fullMatch = match[0];
    cleanedText = cleanedText.replace(fullMatch, '').trim();

    try {
      if (pattern === TIME_PATTERNS[0]) { // AM/PM format
        let hours = parseInt(match[1]);
        const minutes = match[2] ? parseInt(match[2]) : 0;
        const period = match[3].toLowerCase();
        
        if (period === 'pm' && hours < 12) hours += 12;
        if (period === 'am' && hours === 12) hours = 0;
        
        time = setHours(setMinutes(new Date(), minutes), hours);
      } 
      else if (pattern === TIME_PATTERNS[1]) { // 24-hour format
        const hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        time = setHours(setMinutes(new Date(), minutes), hours);
      }
      else if (pattern === TIME_PATTERNS[2]) { // Relative time
        const amount = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        time = new Date();
        
        if (unit === 'minute') time = addMinutes(time, amount);
        else if (unit === 'hour') time = addHours(time, amount);
      }
      else if (pattern === TIME_PATTERNS[3]) { // Special times
        time = new Date();
        if (match[1].toLowerCase() === 'noon') {
          time = setHours(time, 12);
        } else { // midnight
          time = setHours(time, 0);
        }
      }

      if (time && time < new Date() && isToday(time)) {
        time = addHours(time, 24);
      }

      if (time) break;
    } catch (e) {
      console.error('Error parsing time:', e);
    }
  }

  return { cleanedText, time };
}

// VoiceInput component
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