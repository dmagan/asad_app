// MessageInput.js
import React, { useState } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';

const MessageInput = ({ isDarkMode, onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-transparent">
      <div className={`mx-4 mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <form onSubmit={handleSubmit} className="flex items-center gap-2 p-2">
          <button 
            type="button"
            className={`p-2 rounded-full transition-colors ${
              isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <Paperclip size={20} />
          </button>
          
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="پیام خود را بنویسید..."
            className={`flex-1 p-2 text-sm bg-transparent focus:outline-none ${
              isDarkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-500'
            }`}
            style={{ direction: 'rtl' }}
          />
          
          <button 
            type="button"
            className={`p-2 rounded-full transition-colors ${
              isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            <Smile size={20} />
          </button>
          
          <button 
            type="submit"
            className={`p-2 rounded-full transition-colors ${
              message.trim() 
                ? 'text-[#f7d55d]'
                : isDarkMode ? 'text-gray-600' : 'text-gray-400'
            } ${
              message.trim() && (isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100')
            }`}
            disabled={!message.trim()}
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessageInput;