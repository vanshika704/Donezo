
import { useState } from 'react';
import parseTimeFromText from '../utils/timeParser';



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