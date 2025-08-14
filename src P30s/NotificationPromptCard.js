import React, { useState } from 'react';
import { X, Bell } from 'lucide-react';

const NotificationPromptCard = ({ isDarkMode, isOpen, onClose, onEnable }) => {
  const [isEnabling, setIsEnabling] = useState(false);

  const handleEnable = async () => {
    setIsEnabling(true);
    try {
      await onEnable();
    } finally {
      setIsEnabling(false);
    }
  };

  // تابع جدید برای مدیریت کلیک روی "بعداً"
  const handleLater = () => {
    // ذخیره فلگ در localStorage
    localStorage.setItem('notificationDismissed', 'true');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
      <div className={`w-full max-w-sm ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 relative`}>
        <button
          onClick={handleLater}
          className="absolute top-4 left-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            فعال‌سازی اعلان‌ها
          </h2>
          <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`} dir="rtl">
            برای دریافت آخرین اخبار و سیگنال‌ها، اعلان‌ها را فعال کنید
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleEnable}
            disabled={isEnabling}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 px-4 rounded-xl font-medium transition-colors"
          >
            {isEnabling ? 'در حال فعال‌سازی...' : 'فعال‌سازی اعلان‌ها'}
          </button>
          
          <button
            onClick={handleLater}
            className={`w-full ${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-800'} py-2 transition-colors`}
          >
            بعداً
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPromptCard;