import React from 'react';

const MessageSkeleton = ({ isDarkMode }) => {
  return (
    <>
      {/* پیام از طرف کاربر */}
      <div className="flex w-full justify-end mb-4">
        <div className={`max-w-[80%] rounded-2xl p-4 animate-pulse ${
          isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
        }`}>
          <div className={`h-4 w-48 rounded ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
          }`}></div>
          <div className="flex justify-end gap-2 mt-2">
            <div className={`h-3 w-16 rounded ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
            }`}></div>
          </div>
        </div>
      </div>

      {/* پیام از طرف ادمین */}
      <div className="flex w-full justify-start mb-4">
        <div className={`max-w-[80%] rounded-2xl p-4 animate-pulse ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
        }`}>
          <div className={`h-4 w-64 rounded ${
            isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
          }`}></div>
          <div className="flex justify-end gap-2 mt-2">
            <div className={`h-3 w-16 rounded ${
              isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
            }`}></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MessageSkeleton;