import React, { useState, useEffect } from 'react';
import { Monitor, Smartphone } from 'lucide-react';

// تابع تشخیص دستگاه
const detectDevice = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
  // تشخیص موبایل یا تبلت به صورت کلی
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  return {
    isMobile,
    isDesktop: !isMobile
  };
};

const DesktopWarning = ({ isDarkMode }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState(null);

  // غیرفعال کردن کلیک راست
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // اضافه کردن event listener برای غیرفعال کردن کلیک راست
    document.addEventListener('contextmenu', handleContextMenu);
    
    // پاکسازی event listener
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  useEffect(() => {
    // تشخیص دستگاه بعد از لود شدن کامپوننت
    const device = detectDevice();
    setDeviceInfo(device);
    
    // نمایش هشدار اگر دستگاه دسکتاپ باشد
    if (device.isDesktop) {
      // تاخیر کوتاه برای اطمینان از لود شدن صفحه
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // اگر موبایل یا تبلت باشد یا هنوز اطلاعات دستگاه بررسی نشده باشد، چیزی نمایش نده
  if (!deviceInfo || !deviceInfo.isDesktop || !isVisible) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-[1000] bg-black flex items-center justify-center"
      // جلوگیری از انتخاب متن
      style={{ userSelect: 'none' }}
    >
      <div className="relative w-full max-w-md mx-auto">
        <div className={`p-8 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-xl mx-4 shadow-lg`}>
          <div className="flex justify-center mb-8 mt-4">
            <Monitor size={64} className="text-red-500" />
          </div>

          <div className="space-y-6 text-center" dir="rtl">
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>توجه!</h2>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              این برنامه فقط برای استفاده در گوشی‌های هوشمند و تبلت طراحی شده است.
            </p>
            <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              لطفاً با گوشی یا تبلت خود به این سایت مراجعه کنید.
            </p>
            <div className="flex justify-center mt-4">
              <Smartphone size={48} className="text-blue-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesktopWarning;