import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeftCircle, Play, ShoppingCart, DoorOpen } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import PaymentCard from './PaymentCard'; 
import { PRODUCT_PRICES } from './config'; 
import VideoPlayer from './VideoPlayer'; // ایمپورت کامپوننت ویدیو پلیر

const VIPPage = ({ isDarkMode, isOpen, onClose }) => {
  const [showCard, setShowCard] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [showPaymentCard, setShowPaymentCard] = useState(false); 
  const [selectedSubscription, setSelectedSubscription] = useState(null); 
  const [addedToHistory, setAddedToHistory] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [isRenewal, setIsRenewal] = useState(false);
  const [renewingProduct, setRenewingProduct] = useState(null);
  const [hasVIPSubscription, setHasVIPSubscription] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState('https://persiancryptosource.com/video//earn/vip.mp4'); // آدرس ویدیو پیش‌فرض

  useEffect(() => {
    // بررسی آیا کاربر در حال تمدید اشتراک است یا خیر
    const renewalInfo = sessionStorage.getItem('renewProduct');
    if (renewalInfo) {
      try {
        const productInfo = JSON.parse(renewalInfo);
        setRenewingProduct(productInfo);
        setIsRenewal(true);
        
        // پاک کردن اطلاعات بعد از استفاده
        sessionStorage.removeItem('renewProduct');
      } catch (e) {
        console.error('خطا در پردازش اطلاعات تمدید:', e);
      }
    }
  }, []);


  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setShowCard(true);
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    // بهبود مدیریت دکمه بک
    const handleBackButton = (event) => {
      if (isOpen) {
        event.preventDefault();
        closeCard();
        return;
      }
    };


  
    // افزودن یک entry به history stack برای بهبود کارکرد دکمه بک اندروید
    if (isOpen && !addedToHistory) {
      window.history.pushState({ vipPage: true }, '', location.pathname);
      setAddedToHistory(true);
    }
  
    // افزودن event listener برای popstate
    window.addEventListener('popstate', handleBackButton);
    
    // تمیزکاری event listener
    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [isOpen, addedToHistory, location.pathname]);

  // بررسی وضعیت اشتراک VIP کاربر
  useEffect(() => {
    // بررسی وضعیت اشتراک VIP کاربر
    const checkVIPStatus = () => {
      // بررسی وجود اطلاعات کاربر در localStorage یا sessionStorage
      const userToken = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      
      if (userToken) {
        // بررسی محصولات خریداری شده از localStorage
        const purchasedProductsStr = localStorage.getItem('purchasedProducts');
        
        if (purchasedProductsStr) {
          try {
            const purchasedProducts = JSON.parse(purchasedProductsStr);
            // بررسی وجود اشتراک VIP فعال
            const vipSubscription = purchasedProducts.find(p => 
              p.isVIP && p.status === 'active'
            );
            
            setHasVIPSubscription(!!vipSubscription);
          } catch (error) {
            console.error('خطا در پردازش اطلاعات محصولات:', error);
          }
        }
      }
    };
    
    checkVIPStatus();
  }, []);

  const closeCard = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setShowCard(false);
      setIsExiting(false);
      
      if (onClose) {
        onClose();
      } else if (location.pathname !== '/') {
        navigate('/', { replace: true });
      }
    }, 300);
  }, [onClose, navigate, location.pathname]);

  
// تابع جدید برای بررسی لاگین بودن کاربر و هدایت به خرید
const handlePurchase = (subscription) => {
  // بررسی وضعیت لاگین
  const userToken = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
  
  if (!userToken) {
    // اگر کاربر لاگین نیست، به صفحه لاگین هدایت می‌شود
    navigate('/login');
    return;
  }
  
  // قبل از نمایش پنل پرداخت، اشتراک‌های کاربر را دوباره چک کنیم
  const checkSubscriptions = async () => {
    try {
      const response = await fetch('https://p30s.com/wp-json/pcs/v1/user-purchases', {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && Array.isArray(data.purchases)) {
          // به‌روزرسانی localStorage و sessionStorage
          localStorage.setItem('purchasedProducts', JSON.stringify(data.purchases));
          localStorage.setItem('lastProductCheck', new Date().getTime().toString());
          sessionStorage.setItem('purchasedProducts', JSON.stringify(data.purchases));
          
          // بررسی اشتراک VIP
          const hasVIP = data.purchases.some(p => p.isVIP && p.status === 'active');
          
          if (hasVIP) {
            // کاربر اشتراک VIP دارد، مستقیم به کانال VIP هدایت می‌شود
            navigate('/chat');
            return;
          }
        }
      }
      
      // اگر اشتراک VIP نداشت یا خطایی رخ داد، پنل پرداخت را نمایش می‌دهیم
      setSelectedSubscription(subscription);
      setShowPaymentCard(true);
      
    } catch (error) {
      console.error('خطا در بررسی اشتراک‌ها:', error);
      // در صورت خطا، پنل پرداخت را نمایش می‌دهیم
      setSelectedSubscription(subscription);
      setShowPaymentCard(true);
    }
  };
  
  checkSubscriptions();
};

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
            خرید VIP
          </h2>
        </div>

        {/* Main Content Area */}
        <div className="absolute top-16 bottom-0 left-0 right-0 flex flex-col overflow-hidden">
          {/* Header area with VIP Card (Fixed) */}
          <div className="relative header-area">
            {/* VIP Card */}
            <div className="p-4">
              <div className="bg-[#141e35] rounded-3xl relative overflow-hidden border border-gray-500" style={{ minHeight: "180px" }}>
                {/* تصویر کاور */}
                <img 
                  src="/cover-vip.jpg" 
                  alt="VIP Cover" 
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
          <div className="flex-1 overflow-y-auto pb-24 scrollable-content">
          <div className="px-4 space-y-4">
              {/* Trading Signals */}
              <div className="p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
                <h3 className="text-lg font-bold mb-3 text-yellow-500 text-right">خدمات VIP عبارتند از :</h3>

                <h3 className="text-lg font-bold mb-3 text-yellow-400 text-right">سیگنال‌های معاملاتی</h3>
                <ul className="list-disc list-inside space-y-2 text-right">
                  <li>معرفی میم کوین های پامپی</li>
                  <li>بستن سبد برای بولران (Alt کوین های انفجاری)</li>
                </ul>
              </div>
              
              {/* Investment Opportunities */}
              <div className="p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
                <h3 className="text-lg font-bold mb-3 text-yellow-400 text-right">فرصت‌های سرمایه‌گذاری</h3>
                <ul className="list-disc list-inside space-y-2 text-right">
                  <li>عرضه اولیه (پیش از لانچ)</li>
                  <li>ایردراپ‌هایی که بدون سرمایه به درآمد عالی می‌رسند</li>
                </ul>
              </div>
              
              {/* Market Analysis */}
              <div className="p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
                <h3 className="text-lg font-bold mb-3 text-yellow-400 text-right">تحلیل و آموزش</h3>
                <ul className="list-disc list-inside space-y-2 text-right">
                  <li>تحلیل مارکت و آپدیت مارکت</li>
                  <li>مدیریت سرمایه</li>
                  <li>آموزش پایه</li>
                  <li>روانشناسی مارکت</li>
                </ul>
                <p className="text-gray-300 text-right mt-2">و هر آن چیزی که در کریپتو موجب سود شما می‌شوند.</p>
              </div>
              
              {/* Pricing Options */}
             {/* Pricing Options - فقط اگر اشتراک VIP نداشته باشد نمایش داده می‌شود */}
             {!hasVIPSubscription && (
  <div className="p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
    <h3 className="text-lg font-bold mb-3 text-yellow-400 text-right">گزینه‌های اشتراک</h3>
    <div className="space-y-4">
      <div 
        className="border border-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-800 transition-colors"
        onClick={() => handlePurchase({ 
          title: "اشتراک VIP شش ماهه", 
          price: PRODUCT_PRICES.VIP.SIX_MONTHS, 
          months: 6 
        })}
      >
        <h4 className="font-bold text-lg">اشتراک شش ماهه</h4>
        <p className="text-yellow-500 text-lg mt-1">{PRODUCT_PRICES.VIP.SIX_MONTHS} دلار</p>
        <p className="text-gray-400 text-sm mt-1">مناسب برای آشنایی با خدمات VIP</p>
      </div>
      
      <div 
        className="border border-gray-700 rounded-lg p-3 bg-gray-800 cursor-pointer hover:bg-gray-700 transition-colors"
        onClick={() => handlePurchase({ 
          title: "اشتراک VIP یکساله", 
          price: PRODUCT_PRICES.VIP.YEARLY, 
          months: 12 
        })}
      >
        <div className="flex justify-between items-center">
          <h4 className="font-bold text-lg">اشتراک یکساله </h4>
          <span className="bg-yellow-500 text-gray-900 text-xs rounded-full px-2 py-1">پیشنهاد ویژه</span>
        </div>
        <p className="text-yellow-500 text-lg mt-1">{PRODUCT_PRICES.VIP.YEARLY} دلار</p>
        <p className="text-gray-400 text-sm mt-1">صرفه‌جویی ۲۵٪ نسبت به خرید ماهانه</p>
      </div>
      
      <div 
        className="border border-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-800 transition-colors"
        onClick={() => handlePurchase({ 
          title: "اشتراک VIP دوساله", 
          price: PRODUCT_PRICES.VIP.TWO_YEARS, 
          months: 24 
        })}
      >
        <h4 className="font-bold text-lg">اشتراک دوساله</h4>
        <p className="text-yellow-500 text-lg mt-1">{PRODUCT_PRICES.VIP.TWO_YEARS} دلار</p>
        <p className="text-gray-400 text-sm mt-1">صرفه‌جویی ۵۰٪ نسبت به خرید ماهانه</p>
      </div>
    </div>
  </div>
)}
            </div>
          </div>
          
          {/* Gradient Overlay */}
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-[5]" style={{
            height: '90px',
            background: 'linear-gradient(to top, rgba(0,0,0,100), rgba(0,0,0,0))'
          }}></div>

{/* Fixed Button at Bottom */}
<div className="absolute bottom-6 left-4 right-4 z-10">
  <button 
    dir="rtl"
    onClick={hasVIPSubscription 
      ? () => navigate('/chat') 
: () => handlePurchase({ title: "اشتراک VIP شش ماهه", price: PRODUCT_PRICES.VIP.SIX_MONTHS, months: 6 })
    }
    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 rounded-xl transition-colors shadow-lg text-center flex items-center justify-center"
  >
    <span>
      {hasVIPSubscription ? 'ورود به کانال VIP' : 'خرید اشتراک'}
    </span>
    {/* نمایش آیکون متفاوت بر اساس وضعیت اشتراک در سمت چپ */}
    {hasVIPSubscription 
      ? <DoorOpen size={24} className="mr-2" /> 
      : <ShoppingCart size={24} className="mr-2" />
    }
  </button>
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

      {/* Video Player */}
      {showVideo && (
        <VideoPlayer
          videoUrl={videoUrl}
          title="ویدیو معرفی خدمات VIP"
          isDarkMode={isDarkMode}
          onClose={() => setShowVideo(false)}
        />
      )}
    </div>
  );
};

export default VIPPage;