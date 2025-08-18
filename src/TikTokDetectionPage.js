import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleArrowLeft, MessageCircle, Video } from 'lucide-react';

const TikTokDetectionPage = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const [isTikTokWebView, setIsTikTokWebView] = useState(false);

  // تابع برای برگشت به صفحه قبلی
  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

// تشخیص TikTok WebView بدون لودینگ
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    // تشخیص TikTok WebView بر اساس User Agent
    const isTikTok = 
      userAgent.includes('tiktok') || 
      userAgent.includes('musically') ||
      userAgent.includes('bytedance') ||
      // بررسی‌های اضافی برای TikTok
      (userAgent.includes('android') && userAgent.includes('webkit') && 
       (window.TiktokJSBridge || window.webkit?.messageHandlers?.TiktokJSBridge)) ||
      // برای iOS
      (userAgent.includes('iphone') && 
       (window.TiktokJSBridge || window.webkit?.messageHandlers?.TiktokJSBridge));

    // موقتاً برای طراحی، همیشه TikTok فرض می‌کنیم
    setIsTikTokWebView(true); // همیشه true برای طراحی
    
    // redirect غیرفعال شده برای طراحی
     if (!isTikTok) {
       window.location.href = 'https://t.me/Asadmindset_TeamSupport';
     }

    // جلوگیری از نمایش "Add to Home Screen" prompt در این صفحه
    window.shouldPreventIOSPrompt = true;
    
    // تمیز کردن در cleanup
    return () => {
      delete window.shouldPreventIOSPrompt;
    };
  }, []);

  // تابع باز کردن تلگرام
  const openTelegram = () => {
    window.open('https://t.me/Asadmindset_TeamSupport', '_blank');
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* محتوای اصلی */}
      <div className="p-4">
        {/* فقط محتوای TikTok نمایش داده می‌شود */}
        <div className="space-y-4">
          {/* راهنمای فعال‌سازی دستی - کپی شده از SettingsPage */}
          <div className={`p-4 rounded-xl ${isDarkMode ? 'border-red-700' : 'border-red-200'}`}>
            <h4 className={`font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-red-700'}`} dir="rtl">
              شما در محیط تیک تاک هستید برای باز کردن تلگرام 
            </h4>
            <div className={`text-sm space-y-4 ${isDarkMode ? 'text-white' : 'text-red-600'}`} dir="rtl">
              
              <div>
                <p className="font-medium mb-2">۱.  در بالای صفحه سمت راست بر روی ... کلیک کنید</p>
              </div>
              
              <div>
                <div className="mt-2 flex justify-center">
                  <img 
                    src="/notificationHelp/tiktok1.jpg" 
                    alt="مرحله ۱ - انتخاب Notifications" 
                    className="max-w-full h-auto rounded-lg shadow-sm"
                    style={{ maxHeight: '300px' }}
                  />
                </div>
              </div>
              
              <div>
                <p className="font-medium mb-2">۲. سپس در پایین صفحه بر روی کلید Open in  browser کلیک کنید</p>
                <div className="mt-2 flex justify-center">
                  <img 
                    src="/notificationHelp/tiktok2.jpg" 
                    alt="مرحله ۲ - انتخاب PCS" 
                    className="max-w-full h-auto rounded-lg shadow-sm"
                    style={{ maxHeight: '300px' }}
                  />
                </div>
              </div>
       
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TikTokDetectionPage;