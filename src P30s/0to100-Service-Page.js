import React, { useState, useEffect } from 'react';
import { ArrowLeftCircle, Play, ShoppingCart, DoorOpen, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import PaymentCard from './PaymentCard'; // کامپوننت کارت پرداخت را import می‌کنیم
import { Store } from 'react-notifications-component';
import ZeroTo100 from './0to100';
import { PRODUCT_PRICES } from './config';
import VideoPlayer from './VideoPlayer'; // این خط رو اضافه کن


const ZeroTo100ServicePage = ({ isDarkMode, isOpen, onClose }) => {
  // تمام state ها را داخل کامپوننت تعریف می‌کنیم
  const [showCard, setShowCard] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [showPaymentCard, setShowPaymentCard] = useState(false);
  const [has0to100Course, setHas0to100Course] = useState(false);
  const [addedToHistory, setAddedToHistory] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [has0to100Subscription, setHas0to100Subscription] = useState(false);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);
  const [showActualZeroTo100Page, setShowActualZeroTo100Page] = useState(false); // این خط باید اینجا باشد
  const [showVideo, setShowVideo] = useState(false);
const [videoUrl] = useState('https://persiancryptosource.com/video/learn/0ta100.mp4'); // این خط رو اضافه کن

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setShowCard(true);
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    // Handle back button behavior for both browser and Android
    const handleBackButton = (event) => {
      if (showPaymentCard) {
        // اگر کارت پرداخت باز است، ابتدا آن را ببندیم
        event.preventDefault();
        setShowPaymentCard(false);
        return false;
      }
      
      if (isOpen) {
        event.preventDefault();
        closeCard();
        return false;
      }
    };
  
    // Listen for the popstate event (back button)
    window.addEventListener('popstate', handleBackButton);
    
    // Push a new history state to capture Android back button
    if (isOpen) {
      window.history.pushState(null, '', window.location.pathname);
    }
    
    // Push another history state if payment card is shown
    if (showPaymentCard) {
      window.history.pushState(null, '', window.location.pathname);
    }
    
    // Clean up the event listener
    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [isOpen, onClose, showPaymentCard]);

  // بررسی وضعیت خرید دوره صفر تا صد کاربر - بهبود یافته
  useEffect(() => {
    // بررسی سریع وضعیت دوره با اولویت دادن به localStorage
    const checkCourseStatus = () => {
      setIsCheckingSubscription(true);

      // بررسی وجود اطلاعات کاربر
      const userToken = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      if (!userToken) {
        setHas0to100Course(false);
        setHas0to100Subscription(false);
        setIsCheckingSubscription(false);
        return;
      }
      
      // بررسی سریع از localStorage - اولویت اول
      const purchasedProductsStr = localStorage.getItem('purchasedProducts');
      if (purchasedProductsStr) {
        try {
          const purchasedProducts = JSON.parse(purchasedProductsStr);
          
          // بررسی سریع برای هر سه فرمت نوشتن عنوان دوره
          const zeroTo100Course = purchasedProducts.find(p => 
            p.title && 
            typeof p.title === 'string' && 
            (
              p.title.includes('صفر تا صد') || 
              p.title.includes('0 تا 100') || 
              p.title.includes('۰ تا ۱۰۰')
            ) && 
            p.status === 'active'
          );
          
          const hasActiveSubscription = !!zeroTo100Course;
          
          setHas0to100Course(hasActiveSubscription);
          setHas0to100Subscription(hasActiveSubscription);
          setIsCheckingSubscription(false);
          
          // اگر اشتراک در localStorage پیدا شد، نیازی به API call نیست
          if (hasActiveSubscription) {
            return;
          }
        } catch (parseError) {
        }
      }
      
      // اگر در localStorage پیدا نشد یا مشکلی وجود داشت، به صورت async از API بررسی کنیم
      // بدون منتظر ماندن، UI را فعال می‌کنیم
      setIsCheckingSubscription(false);
      
      // بررسی API به صورت async - اولویت دوم
      fetch('https://p30s.com/wp-json/pcs/v1/user-purchases', {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Accept': 'application/json'
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error("خطا در دریافت اطلاعات از API");
        }
        return response.json();
      })
      .then(data => {
        if (data.success && Array.isArray(data.purchases)) {
          // ذخیره اطلاعات جدید
          localStorage.setItem('purchasedProducts', JSON.stringify(data.purchases));
          localStorage.setItem('lastProductCheck', new Date().getTime().toString());
          sessionStorage.setItem('purchasedProducts', JSON.stringify(data.purchases));
          
          // بررسی وضعیت دوره صفر تا صد
          const zeroTo100Course = data.purchases.find(p => 
            p.title && 
            typeof p.title === 'string' && 
            (
              p.title.includes('صفر تا صد') || 
              p.title.includes('0 تا 100') || 
              p.title.includes('۰ تا ۱۰۰')
            ) && 
            p.status === 'active'
          );
          
          const hasActiveSubscription = !!zeroTo100Course;
          
          setHas0to100Course(hasActiveSubscription);
          setHas0to100Subscription(hasActiveSubscription);
        }
      })
      .catch(error => {
      });
    };
    
    checkCourseStatus();
  }, []);

  const closeCard = () => {
    setIsExiting(true);
    setTimeout(() => {
      setShowCard(false);
      setIsExiting(false);
      
      // Always call onClose to inform parent component
      onClose();
      
      // Force URL to be '/' when returning to home if needed
      if (location.pathname !== '/') {
        navigate('/', { replace: true });
      }
    }, 300);
  };

  // تابع بهبود یافته برای بررسی لاگین بودن کاربر و هدایت به خرید یا صفحه دوره
// تابع بهبود یافته برای بررسی لاگین بودن کاربر و هدایت به خرید یا صفحه دوره
const handlePurchase = () => {
  
  // بررسی وضعیت لاگین
  const userToken = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
  
  if (!userToken) {
    // اگر کاربر لاگین نیست، به صفحه لاگین هدایت می‌شود
    navigate('/login');
    return;
  }
  
  // اگر در حال بررسی هستیم، صبر کنیم
  if (isCheckingSubscription) {
    Store.addNotification({
      title: <div dir="rtl">در حال بررسی</div>,
      message: <div dir="rtl">لطفاً صبر کنید، در حال بررسی وضعیت اشتراک...</div>,
      type: "info",
      insert: "top",
      container: "center",
      animationIn: ["animate__animated", "animate__flipInX"],
      animationOut: ["animate__animated", "animate__flipOutX"],
      dismiss: { duration: 3000 }
    });
    return;
  }
  
  // اگر کاربر دوره را خریداری کرده، مستقیماً به صفحه دوره هدایت شود
  if (has0to100Course) {
    
    // به جای استفاده از navigate، مستقیماً کامپوننت اصلی دوره را نمایش دهیم
    setShowActualZeroTo100Page(true);
    return;
  }
  
  // نمایش پنل پرداخت بدون بررسی مجدد از API
  setSelectedSubscription({
  title: " آموزش ۰ تا ۱۰۰ کریپتو",
  price: PRODUCT_PRICES.ZERO_TO_100
});
  setShowPaymentCard(true);
}
  
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
            آموزش ۰ تا ۱۰۰ کریپتو
          </h2>
        </div>

        {/* Main Content Area */}
        <div className="absolute top-16 bottom-0 left-0 right-0 flex flex-col overflow-hidden">
{/* Header area with Course Cover Card (Fixed) */}
<div className="relative header-area">
  {/* Course Cover Card */}
  <div className="p-4">
    <div className="bg-[#141e35] rounded-3xl relative overflow-hidden border border-gray-500" style={{ minHeight: "180px" }}>
      {/* تصویر کاور */}
      <img 
        src="/0ta100.png" 
        alt="Zero to 100 Cover" 
        className="w-full h-full object-cover absolute inset-0"
      />
      
{/* Play Button Overlay */}
<div className="absolute inset-0 flex items-center justify-center">
  <button 
    onClick={() => setShowVideo(true)}
    className="w-16 h-16 rounded-full bg-white/70 flex items-center justify-center z-10 hover:bg-white/90 transition-colors"
  >
    <Play size={36} className="text-black-500 ml-1" />
  </button>
</div>
    </div>
  </div>
  
  {/* Gradient transition overlay - گرادینت جدید */}
  <div className="absolute bottom-[-30px] left-0 right-0 pointer-events-none z-[5]" style={{
    height: '30px',
    background: isDarkMode 
      ? 'linear-gradient(to bottom, rgba(17,24,39,1), rgba(17,24,39,0))'
      : 'linear-gradient(to bottom, rgba(243,244,246,1), rgba(243,244,246,0))'
  }}></div>
</div>
          
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto pb-24">
            <div className="px-4 space-y-4">
              {/* Introduction section */}
              <div className="p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
                <h3 className="text-lg font-bold mb-3 text-yellow-500 text-right">سر فصل های آموزش صفر تا صد</h3>
                <div className="text-sm text-right mb-4">
                  <h3 className="text-white-400 font-bold mb-2">مهم: جهت جلوگیری از هرگونه کپی ناقص نام سرفصل ها و استراتژی های مهم در سرفصل ها ذکر نمیشود. محتوا های اصلی را داخل دوره مشاهده میکنید.</h3>
                </div>
              </div>
              
              {/* Introduction section */}
              <div className="p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
                <h3 className="text-lg font-bold mb-3 text-yellow-400 text-right">مقدمه:</h3>
                <ul className="list-disc list-inside space-y-1 pr-4 text-right">
                  <li>کریپتو و فلسفه آن چیست ؟</li>
                  <li>توکن و کوین چیست ؟</li>
                  <li>بلاکچین چیست ؟</li>
                  <li>تریدر کیست و چرا ترید ؟</li>
                  <li>مفاهیم و اصطلاحات تریدینگ</li>
                  <li>روش های درآمد زایی در کریپتو</li>
                  <li>عوامل موفقیت در کریپتو</li>
                  <li>روش های کلاهبرداری</li>
                  <li>امنیت در کریپتو</li>
                  <li>اصطلاحات بازار</li>
                  <li>اصطلاحات معامله گری و اصطلاحات بلاکچین</li>
                </ul>
              </div>
              
              {/* Roadmap section */}
              <div className="p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
                <h3 className="text-lg font-bold mb-3 text-yellow-400 text-right">نقشه راه:</h3>
                <ul className="list-disc list-inside space-y-1 pr-4 text-right">
                  <li>نصب صرافی و آموزش کامل(۲ صرافی متفاوت)</li>
                  <li>نصب و آموزش تمامی ولت ها</li>
                  <li>آموزش کامل تریدینگ ویو</li>
                  <li>آموزش دیبانک</li>
                  <li>آموزش سایت های مانیتورینگ</li>
                  <li>آموزش سایت های انچین</li>
                  <li>بررسی و آموزش سایت های فاندامنتال</li>
                  <li>و...</li>
                </ul>
              </div>
              
              {/* Technical concepts section */}
              <div className="p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
                <h3 className="text-lg font-bold mb-3 text-yellow-400 text-right">مفاهیم تکنیکال:</h3>
                <ul className="list-disc list-inside space-y-1 pr-4 text-right">
                  <li>آموزش ...</li>
                  <li>پرایس اکشن</li>
                  <li>اصطلاحات تکنیکال</li>
                  <li>کندل شناسی</li>
                  <li>مفهوم پولبک</li>
                  <li>فشار خرید و فروش ( مومنتوم )</li>
                  <li>استراتژی کانال</li>
                  <li>بریک اوت</li>
                  <li>تریدینگ رنج</li>
                  <li>استراتژی اینتری پرایس</li>
                  <li>موج شماری</li>
                  <li>انواع فیبوناچی</li>
                  <li>والیوم پروفایل</li>
                  <li>واگرایی</li>
                  <li>مووینگ اورج</li>
                  <li>و...</li>
                </ul>
              </div>
              
              {/* Psychology section */}
              <div className="p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
                <h3 className="text-lg font-bold mb-3 text-yellow-400 text-right">سر فصل های روانشناسی:</h3>
                <ul className="list-disc list-inside space-y-1 pr-4 text-right">
                  <li>عوامل شکست در تریدینگ</li>
                  <li>عوامل موفقیت در کریپتو</li>
                  <li>از بین بردن ترس</li>
                  <li>شکست طمع</li>
                  <li>دید بیزنس به کریپتو</li>
                  <li>صبر عامل موفقیت</li>
                  <li>و...</li>
                </ul>
              </div>
              
              {/* Final note */}
              <div className="p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
                <p className="text-gray-300 text-right italic">برای آموزش کامل‌تر و جزئیات بیشتر در دوره با ما همراه باشید</p>
              </div>
              
              {/* Course Price */}
              <div className="p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
              <div className="p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
              <div className="p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
  <div className="flex justify-between items-center">
    <div>
      <h3 className="text-lg font-bold mb-2 text-yellow-400 text-right">قیمت دوره آموزشی:</h3>
      <p className="text-2xl font-bold text-green-500">{PRODUCT_PRICES.ZERO_TO_100} دلار</p>
    </div>
    <div className="bg-yellow-500/20 text-yellow-400 rounded-xl p-2 text-sm">
      <p>دسترسی نامحدود</p>
      <p>آپدیت دائمی</p>
    </div>
  </div>
</div>
</div>
</div>
            </div>
          </div>
          
          {/* Gradient Overlay */}
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-[5]" style={{
            height: '90px',
            background: 'linear-gradient(to top, rgba(0,0,0,100), rgba(0,0,0,0))'
          }}></div>

          {/* Fixed Button at Bottom */}
          <div className="absolute bottom-6 left-4 right-4 z-10">
            {isCheckingSubscription ? (
              <button 
                className="w-full bg-gray-500 text-white font-bold py-4 rounded-xl transition-colors shadow-lg flex items-center justify-center"
                dir="rtl"
                disabled
              >
                <span>در حال بررسی...</span>
              </button>
            ) : (
              <button 
                onClick={handlePurchase}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 rounded-xl transition-colors shadow-lg flex items-center justify-center"
                dir="rtl"
              >
                <span>
                  {has0to100Course ? 'ورود به آموزش  ۰ تا ۱۰۰' : ' ثبت نام در دوره آموزشی'}
                </span>
                {/* نمایش آیکون متفاوت بر اساس وضعیت اشتراک */}
                {has0to100Course 
                  ? <DoorOpen size={24} className="mr-2" /> 
                  : <ShoppingCart size={24} className="mr-2" />
                }
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Payment Card Component */}
      {showPaymentCard && selectedSubscription && (
        <PaymentCard
          isDarkMode={isDarkMode}
          onClose={() => setShowPaymentCard(false)}
          productTitle={selectedSubscription.title}
          price={selectedSubscription.price}
          months={selectedSubscription.months}
        />
      )}
      
   {/* ZeroTo100 Component - اضافه کردن این بخش */}
      {showActualZeroTo100Page && (
        <ZeroTo100
          isDarkMode={isDarkMode}
          isOpen={showActualZeroTo100Page}
          onClose={() => setShowActualZeroTo100Page(false)}
        />
      )}

      {/* Video Player */}
      {showVideo && (
        <VideoPlayer
          videoUrl={videoUrl}
          title="ویدیو معرفی آموزش ۰ تا ۱۰۰"
          isDarkMode={isDarkMode}
          onClose={() => setShowVideo(false)}
        />
      )}
    </div>
  );
};

export default ZeroTo100ServicePage;