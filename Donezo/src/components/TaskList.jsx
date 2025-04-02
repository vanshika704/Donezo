

import { format, isToday, isTomorrow } from 'date-fns';
import { stopAlarmSound } from '../utils/notifications';

export default function TaskList({ tasks, onDelete }) {
  const formatTime = (date) => {
    const dateObj = new Date(date); // Ensure it's a Date object
    if (isToday(dateObj)) return `Today at ${format(dateObj, 'h:mm a')}`;
    if (isTomorrow(dateObj)) return `Tomorrow at ${format(dateObj, 'h:mm a')}`;
    return format(dateObj, 'MMM d, h:mm a');
  };
  

  const handleDelete = (id) => {
    onDelete(id);
    stopAlarmSound(); // Stop alarm when a task is deleted
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Reminders</h2>
      {tasks.length === 0 ? (
        <div className="text-center py-2">No reminders</div>
      ) : (
        <ul className="space-y-3">
          {tasks.map(task => (
            <li 
              key={task.id} 
              className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-100"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-800">{task.text}</p>
                {task.time && (
                  <p className="text-sm text-gray-500 mt-1">
                    <span className="inline-flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatTime(new Date(task.time))}
                    </span>
                  </p>
                )}
              </div>
              <button
                onClick={() => handleDelete(task.id)}
                className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors duration-150"
                aria-label="Delete reminder"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
