import React, { useState, useEffect } from 'react';
import { Share, SquarePlus, ChevronsDown, X } from 'lucide-react';

// توابع تشخیص دستگاه
const detectDevice = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
  // تشخیص iOS (آیفون و آیپد)
  const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
  
  return {
    isIOS
  };
};

// برای ذخیره وضعیت نمایش پیام در localStorage با تاریخ
export const setPromptAsSeen = () => {
  localStorage.setItem('iosPromptLastShown', new Date().getTime().toString());
};

export const shouldShowPrompt = () => {
  const lastShown = localStorage.getItem('iosPromptLastShown');
  
  // اگر هرگز نمایش داده نشده، باید نمایش دهیم
  if (!lastShown) return true;
  
  // محاسبه زمان گذشته از آخرین نمایش
  const now = new Date().getTime();
  const timeSinceLastShown = now - parseInt(lastShown);
  
  // تنظیم زمان: هر 24 ساعت دوباره نمایش دهد
  const oneDayInMs = 24 * 60 * 60 * 1000;
  
  // اگر بیش از 24 ساعت گذشته، دوباره نمایش دهیم
  return timeSinceLastShown > oneDayInMs;
};

// کامپوننت اصلی IOSInstallPrompt
const IOSInstallPrompt = ({ isDarkMode, onClose }) => {
  const handleClose = () => {
    setPromptAsSeen();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black bg-opacity-85 flex items-center justify-center">
      <div className="relative w-full max-w-md mx-auto">
        {/* دکمه بستن */}
        <button className="absolute top-4 right-7 w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-white rounded-full" onClick={handleClose}>
          <X size={20} />
        </button>

        {/* محتوای اصلی */}
        <div className="p-6 bg-gray-900 bg-opacity-90 rounded-md mx-4">
          {/* لوگو */}
          <div className="flex justify-center mb-8 mt-4">
            <img src="/Logo-App2.png" alt="PCS Logo" className="w-24 h-24" />
          </div>

          {/* مراحل نصب */}
          <div className="space-y-6 text-right" dir="rtl">
            <p className="text-white">
              ۱- در نوار پایین گوشی روی کلید{' '}
              <span className="inline-flex items-center justify-center bg-gray-300 w-8 h-8 rounded text-blue-500">
                <Share size={24} />
              </span>{' '}
              کلیک کنید.
            </p>

            <p className="text-white">
              ۲- منوی باز شده را به بالا اسکرول کنید و روی کلید{' '}
              <span className="inline-flex items-center justify-center bg-gray-200 text-black text-xs px-2 py-1 rounded mx-1">
                <SquarePlus size={16} /> Add to Home Screen
              </span>{' '}
              کلیک کنید.
            </p>

            <p className="text-white">
              ۳- در پایان در بالای صفحه سمت راست روی کلید{' '}
              <span className="inline-flex items-center justify-center bg-gray-300 w-16 h-6 rounded text-blue-500 ml-2">
                <strong className="font-black">Add</strong>
              </span>{' '}
              کلیک کنید.
            </p>

            <p className="text-white">
             توجه : می بایست از مروگر سافاری استفاده کنید{' '}
            </p>
          </div>
        </div>

        {/* فلش پایین — انیمیشن بالا/پایین */}
        <div className="fixed bottom-0 left-0 right-0 flex justify-center animate-bounce z-50">
          <ChevronsDown size={64} className="text-white" />
        </div>
      </div>
    </div>
  );
};

// کامپوننت اصلی که فقط برای iOS پیام نمایش می‌دهد
const DeviceDetectionWrapper = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState(null);

  useEffect(() => {
    // تشخیص دستگاه بعد از لود شدن کامپوننت
    const device = detectDevice();
    setDeviceInfo(device);
    
// بررسی اینکه آیا در صفحه buy یا tiktok-check هستیم یا نه
    const currentPath = window.location.pathname;
    
    // اگر در صفحه buy یا tiktok-check هستیم، پیام را نمایش نده
    if (currentPath === '/buy' || currentPath === '/tiktok-check') {
      return;
    }    
    // نمایش پیام فقط اگر دستگاه iOS باشد و زمان نمایش مجدد رسیده باشد
    if (device.isIOS && shouldShowPrompt()) {
      setShowPrompt(true);
    }
  }, []);

  const handleClose = () => {
    setShowPrompt(false);
  };

  if (!showPrompt || !deviceInfo) return null;

  // نمایش پیام فقط برای iOS
  return deviceInfo.isIOS ? (
    <IOSInstallPrompt onClose={handleClose} />
  ) : null;
};

export default DeviceDetectionWrapper;