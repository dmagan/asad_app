import React, { useState, useEffect } from 'react';
import { ArrowLeftCircle, Bell, BellOff, Volume2 } from 'lucide-react';

const SettingsPage = ({ isDarkMode, isOpen, onClose }) => {
  const [showCard, setShowCard] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  
  // وضعیت تنظیمات نوتیفیکیشن
  const [generalNotifications, setGeneralNotifications] = useState(true);
  const [vipNotifications, setVipNotifications] = useState(true);
  const [mimCoinNotifications, setMimCoinNotifications] = useState(true);
  const [supportNotifications, setSupportNotifications] = useState(true);
  
  // بررسی وضعیت لاگین کاربر
  const isUserLoggedIn = () => {
    const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
    return !!token;
  };
  
  // تشخیص A2HS در iOS
  const isIOSA2HS = () => {
    return window.navigator.standalone === true;
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setShowCard(true);
      }, 100);
      
      // بارگیری تنظیمات از localStorage
      loadSettings();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleBackButton = (event) => {
      if (isOpen) {
        event.preventDefault();
        closeCard();
        return false;
      }
    };

    window.addEventListener('popstate', handleBackButton);
    
    if (isOpen) {
      window.history.pushState(null, '', window.location.pathname);
    }
    
    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [isOpen]);

  const loadSettings = () => {
    const generalPref = localStorage.getItem('generalNotifications');
    const vipPref = localStorage.getItem('vipNotifications');
    const mimCoinPref = localStorage.getItem('mimCoinNotifications');
    const supportPref = localStorage.getItem('supportNotifications');
    
    if (generalPref !== null) setGeneralNotifications(generalPref === 'true');
    if (vipPref !== null) setVipNotifications(vipPref === 'true');
    if (mimCoinPref !== null) setMimCoinNotifications(mimCoinPref === 'true');
    if (supportPref !== null) setSupportNotifications(supportPref === 'true');
  };

  const saveSettings = (key, value) => {
    localStorage.setItem(key, value.toString());
  };

  const closeCard = () => {
    setIsExiting(true);
    setTimeout(() => {
      setShowCard(false);
      setIsExiting(false);
      onClose();
    }, 300);
  };

  const handleGeneralNotificationToggle = async () => {
    // اگر کاربر لاگین نکرده، هیچ کاری نکن
    if (!isUserLoggedIn()) {
      return;
    }
    
    const currentStatus = getNotificationStatus();
    
    // اگر اعلان‌ها قبلاً granted شده، دیگه نمیشه خاموشش کرد
    if (currentStatus.permission === 'granted' && generalNotifications) {
      // نمایش پیام که نمیشه خاموش کرد
      return;
    }
    
    const newState = !generalNotifications;
    setGeneralNotifications(newState);
    saveSettings('generalNotifications', newState);
    
    if (newState) {
      // فعال‌سازی اعلان‌ها از تنظیمات
      if (window.handleEnableNotificationsFromSettings) {
        const success = await window.handleEnableNotificationsFromSettings();
        if (success) {
          // اگر موفق بود، state رو به روز کن
          setGeneralNotifications(true);
          saveSettings('generalNotifications', true);
        }
      }
    }
  };

  const getNotificationStatus = () => {
    if (window.getNotificationStatus) {
      return window.getNotificationStatus();
    }
    return { permission: 'default', isDismissed: false };
  };

  const renderNotificationStatus = () => {
    const status = getNotificationStatus();
    
    if (status.permission === 'granted') {
      return (
        <div className="flex items-center gap-2 text-green-500">
          <Bell size={16} />
          <span className="text-sm">فعال</span>
        </div>
      );
    } else if (status.permission === 'denied') {
      return (
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-red-500 mb-1">
            <BellOff size={16} />
            <span className="text-sm">مسدود شده</span>
          </div>
          <p className="text-xs text-gray-500" dir="rtl">
            برای فعال‌سازی: تنظیمات Safari → وب‌سایت‌ها → اعلان‌ها
          </p>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2 text-yellow-500">
          <Bell size={16} />
          <span className="text-sm">غیرفعال</span>
        </div>
      );
    }
  };

  // تابع کمکی برای رندر کردن تاگل iOS style
const renderToggle = (isEnabled, onToggle, disabled = false) => (
  <button
    role="switch"
    aria-checked={isEnabled}
    onClick={disabled ? undefined : onToggle}
    disabled={disabled}
    className={`
      relative inline-flex flex-shrink-0
      h-[31px] w-[51px] p-[2px]
      transition-colors duration-200 ease-in-out
      rounded-full
      overflow-hidden
      focus:outline-none focus:ring-2 focus:ring-offset-2
      ${disabled
        ? 'bg-[#D1D16] cursor-not-allowed'
        : isEnabled
          ? 'bg-[#34C759] focus:ring-[#34C759]/50'
          : 'bg-[#E5E5EA] focus:ring-[#E5E5EA]/50'}
    `}
  >
    <span
      className={`
        absolute top-[2px] left-[2px]
        h-[27px] w-[27px]
        bg-white rounded-full shadow
        transition-transform duration-200 ease-in-out
        ${isEnabled ? 'translate-x-5' : 'translate-x-0'}
      `}
    />
  </button>
);


  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/40 overflow-hidden transition-opacity duration-300"
      style={{ 
        opacity: isExiting ? 0 : (showCard ? 1 : 0),
        pointerEvents: showCard ? 'auto' : 'none',
        transition: 'opacity 0.3s ease-out'
      }}
    >
      <div 
        className={`fixed inset-0 w-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} shadow-lg transition-transform duration-300 ease-out`}
        style={{ 
          transform: isExiting 
            ? 'translateX(100%)' 
            : `translateX(${showCard ? '0' : '100%'})`,
          transition: 'transform 0.3s cubic-bezier(0.17, 0.67, 0.24, 0.99), opacity 0.3s ease-out'
        }}
      >
        {/* Header */}
        <div className={`h-16 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} flex items-center px-4 relative border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <button
            onClick={closeCard} 
            className={`absolute left-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}
          >
            <ArrowLeftCircle className="w-8 h-8" />
          </button>
          <h2 className={`w-full text-center text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            تنظیمات
          </h2>
        </div>

        {/* Main Content */}
        <div className="absolute top-16 bottom-0 left-0 right-0 overflow-y-auto">
          <div className="p-4 space-y-6">
            
{/* بخش اعلان‌های کلی - فقط اگر granted نشده یا غیرفعال باشه */}
{isUserLoggedIn() && getNotificationStatus().permission !== 'denied' && !(getNotificationStatus().permission === 'granted' && generalNotifications) && (
  <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                  <div className="flex items-center justify-between mb-4" dir="rtl">
                <div className="flex items-center gap-3">
                  <Bell className={`w-6 h-6 ${isDarkMode ? 'text-white' : 'text-gray-700'}`} />
                  <div>
                    <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      اعلان‌های کلی
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {!isUserLoggedIn() 
                        ? 'برای تنظیم اعلان‌ها ابتدا وارد شوید'
                        : getNotificationStatus().permission === 'granted' && generalNotifications 
                          ? 'اعلان‌ها فعال است (غیرقابل تغییر)'
                          : 'فعال/غیرفعال کردن تمام اعلان‌ها'
                      }
                    </p>
                  </div>
                </div>
{renderToggle(
  getNotificationStatus().isDismissed ? false : generalNotifications, 
  handleGeneralNotificationToggle,
  !isUserLoggedIn() || (getNotificationStatus().permission === 'granted' && generalNotifications)
)}
              </div>
              
              {/* وضعیت فعلی اعلان‌ها */}
              <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`} dir="rtl">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    وضعیت فعلی:
                  </span>
                  {renderNotificationStatus()}
                </div>
</div>
            </div>
)}
            {/* بخش اعلان‌های اختصاصی - فقط برای کاربران لاگین شده */}
{isUserLoggedIn() && getNotificationStatus().permission === 'granted' && (
  <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                    <h3 className={`font-bold text-lg mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`} dir="rtl">
                  اعلان‌های اختصاصی
                </h3>
                
                <div className="space-y-4">
                  {/* اعلان‌های VIP */}
                  <div className="flex items-center justify-between" dir="rtl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">V</span>
                      </div>
                      <div>
                        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          اعلان‌های VIP
                        </p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          پیام‌های کانال VIP
                        </p>
                      </div>
                    </div>
                    {renderToggle(
                      vipNotifications, 
                      () => {
                        const newState = !vipNotifications;
                        setVipNotifications(newState);
                        saveSettings('vipNotifications', newState);
                      },
                      !generalNotifications
                    )}
                  </div>

                  {/* اعلان‌های میم کوین */}
                  <div className="flex items-center justify-between" dir="rtl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">M</span>
                      </div>
                      <div>
                        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          اعلان‌های میم کوین باز
                        </p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          پیام‌های کانال میم کوین
                        </p>
                      </div>
                    </div>
                    {renderToggle(
                      mimCoinNotifications, 
                      () => {
                        const newState = !mimCoinNotifications;
                        setMimCoinNotifications(newState);
                        saveSettings('mimCoinNotifications', newState);
                      },
                      !generalNotifications
                    )}
                  </div>

                  {/* اعلان‌های پشتیبانی */}
                  <div className="flex items-center justify-between" dir="rtl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <Volume2 size={16} className="text-white" />
                      </div>
                      <div>
                        <p className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          اعلان‌های پشتیبانی
                        </p>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          پاسخ‌های تیکت‌های پشتیبانی
                        </p>
                      </div>
                    </div>
                    {renderToggle(
                      supportNotifications, 
                      () => {
                        const newState = !supportNotifications;
                        setSupportNotifications(newState);
                        saveSettings('supportNotifications', newState);
                      },
                      !generalNotifications
                    )}
                  </div>
                </div>
              </div>
            )}

{/* راهنمای فعال‌سازی دستی - فقط برای کاربران لاگین شده */}
{isUserLoggedIn() && getNotificationStatus().permission === 'denied' && (
  <div className={`p-4 rounded-xl ${isDarkMode ? 'border-red-700' : 'border-red-200'}`}>
    <h4 className={`font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-red-700'}`} dir="rtl">
      فعال‌سازی نوتیفیکیشن
    </h4>
    <div className={`text-sm space-y-4 ${isDarkMode ? 'text-white' : 'text-red-600'}`} dir="rtl">
      
      <div>
        <p className="font-medium mb-2">۱. تنظیمات گوشی را باز کنید</p>
      </div>
      
      <div>
        <p className="font-medium mb-2">۲. بر روی گزینه Notifications ضربه بزنید</p>
        <div className="mt-2 flex justify-center">
          <img 
            src="/notificationHelp/1.jpg" 
            alt="مرحله ۱ - انتخاب Notifications" 
            className="max-w-full h-auto rounded-lg shadow-sm"
            style={{ maxHeight: '300px' }}
          />
        </div>
      </div>
      
      <div>
        <p className="font-medium mb-2">۳. سپس در بین اپ‌های نصب شده PCS را پیدا کنید و بر روی آن ضربه بزنید (برنامه‌ها بر اساس حروف الفبا مرتب شده‌اند)</p>
        <div className="mt-2 flex justify-center">
          <img 
            src="/notificationHelp/2.jpg" 
            alt="مرحله ۲ - انتخاب PCS" 
            className="max-w-full h-auto rounded-lg shadow-sm"
            style={{ maxHeight: '300px' }}
          />
        </div>
      </div>
      
      <div>
        <p className="font-medium mb-2">۴. در بالای صفحه کلید Allow Notifications را فعال کنید</p>
        <div className="mt-2 flex justify-center">
          <img 
            src="/notificationHelp/3.jpg" 
            alt="مرحله ۳ - فعال‌سازی Allow Notifications" 
            className="max-w-full h-auto rounded-lg shadow-sm"
            style={{ maxHeight: '300px' }}
          />
        </div>
      </div>
      
    </div>
  </div>
)}
{/* نوت در مورد تنظیمات */}


{/* پیام برای کاربران غیرلاگین */}
{!isUserLoggedIn() && (
  <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'} border ${isDarkMode ? 'border-blue-700' : 'border-blue-200'}`}>
    <p className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-700'}`} dir="rtl">
      💡 برای دسترسی به تمام تنظیمات اعلان‌ها، لطفاً ابتدا وارد حساب کاربری خود شوید.
    </p>
  </div>
)}          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;