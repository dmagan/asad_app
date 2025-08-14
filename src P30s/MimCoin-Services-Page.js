import React, { useState, useEffect } from 'react';
import { ArrowLeftCircle, Play, ShoppingCart, DoorOpen, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import PaymentCard from './PaymentCard'; 
import { PRODUCT_PRICES } from './config';
import VideoPlayer from './VideoPlayer';

const MimCoinServicesPage = ({ isDarkMode, isOpen, onClose }) => {
  const [showCard, setShowCard] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [showPaymentCard, setShowPaymentCard] = useState(false);
  const [addedToHistory, setAddedToHistory] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [isRenewal, setIsRenewal] = useState(false);
  const [renewingProduct, setRenewingProduct] = useState(null);
  const [hasMimCoinSubscription, setHasMimCoinSubscription] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [videoUrl] = useState('https://iamvakilet.ir/learn/mimcoin.mp4');




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
      window.history.pushState({ mimCoinPage: true }, '', location.pathname);
      setAddedToHistory(true);
    }
  
    // افزودن event listener برای popstate
    window.addEventListener('popstate', handleBackButton);
    
    // تمیزکاری event listener
    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [isOpen, addedToHistory, location.pathname]);

  // این useEffect را اضافه کنید
  useEffect(() => {
    const checkMimCoinStatus = () => {
      const userToken = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      
      if (userToken) {
        const purchasedProductsStr = localStorage.getItem('purchasedProducts');
        
        if (purchasedProductsStr) {
          try {
            const purchasedProducts = JSON.parse(purchasedProductsStr);
            const mimCoinSubscription = purchasedProducts.find(p => 
              p.title && p.title.includes(' میم کوین باز') && p.status === 'active'
            );
            
            setHasMimCoinSubscription(!!mimCoinSubscription);
          } catch (error) {
          }
        }
      }
    };
    
    checkMimCoinStatus();
  }, []);



  const closeCard = () => {
    setIsExiting(true);
    setTimeout(() => {
      setShowCard(false);
      setIsExiting(false);
      setAddedToHistory(false);
      onClose();
    }, 300);
  };

  // تابع جدید برای باز کردن کارت پرداخت
  const handlePurchase = () => {
    // بررسی وضعیت لاگین کاربر
    const userToken = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
    
    if (!userToken) {
      // اگر کاربر لاگین نیست، به صفحه لاگین هدایت می‌شود
      navigate('/login');
      return;
    }
    
    // اگر کاربر لاگین است، کارت پرداخت را نمایش می‌دهیم
    setShowPaymentCard(true);
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
             کانال میم کوین باز
          </h2>
        </div>

        {/* Main Content Area */}
        <div className="absolute top-16 bottom-0 left-0 right-0 flex flex-col overflow-hidden">
          {/* Header area with MimCoin Card (Fixed) */}
          <div className="relative header-area">



            
            {/* Gradient transition overlay */}
            <div className="absolute bottom[-30px] left-0 right-0 pointer-events-none z-[5]" style={{
              height: '40px',
              background: isDarkMode 
                ? 'linear-gradient(to bottom, rgba(17,24,39,1), rgba(17,24,39,0))'
                : 'linear-gradient(to bottom, rgba(243,244,246,1), rgba(243,244,246,0))'
            }}></div>
          </div>
            
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto pb-24 scrollable-content">
            <div className="px-4 space-y-4">
            
{/* کادر اول */}
<div className="p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
  <h3 className="text-lg font-bold mb-3 text-yellow-400 text-right">📌 چرا این کانال راه‌اندازی شد؟</h3>
  <div className="space-y-3 pr-4 text-right text-sm leading-relaxed">
    <p>
      در دو سال اخیر، بازار کریپتو پر از دستکاری‌های سازمان‌یافته بود. سرمایه‌گذاران بزرگ (مثل ونچر کپیتال‌ها) سودهای اصلی را بردند، و فرصت از دست مردم عادی گرفته شد.
    </p>
    <p>
      اما در همین شرایط، میم‌کوین‌ها تبدیل به تنها شانسی شدند که افراد عادی می‌توانند رشد سرمایه‌ای واقعی داشته باشند.
    </p>
  </div>
</div>

{/* کادر دوم */}
<div className="p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
  <h3 className="text-lg font-bold mb-3 text-yellow-400 text-right">✅ ما چه کردیم؟</h3>
  <div className="space-y-3 pr-4 text-right text-sm leading-relaxed">
    <p>
      ما در این مدت بیش از <span className="text-yellow-400 font-bold">۳۵ موقعیت قوی</span> شکار کردیم،
    </p>
    <p>
      📈 با سودهایی تا <span className="text-green-400 font-bold">۲۵۰ برابر</span>
    </p>
    <p>
      📈 و چندین موقعیت با سود <span className="text-green-400 font-bold">۸ تا ۱۰۰ برابر</span>
    </p>
    <p>
      این تجربه باعث شد تصمیم بگیریم کانالی جدا با هزینه‌ای بسیار کم برای ارائه این خدمات راه‌اندازی کنیم — مخصوص کسانی که می‌خواهند فقط روی میم‌کوین‌ها تمرکز کنند.
    </p>
  </div>
</div>

{/* کادر سوم */}
<div className="p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
  <h3 className="text-lg font-bold mb-3 text-yellow-400 text-right">🎯 این کانال برای کیست؟</h3>
  <div className="space-y-3 pr-4 text-right text-sm leading-relaxed">
    <p>مناسب کسانی که:</p>
    <ul className="list-disc list-inside space-y-2 pr-4 text-right text-sm">
      <li>سرمایه و صبر زیادی ندارند</li>
      <li>فقط دنبال سود از میم‌کوین‌ها هستند</li>
      <li>می‌خواهند با ریسک کنترل‌شده، سود بالا بگیرند</li>
    </ul>
    <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3 mt-3">
      <p className="text-red-300 font-medium">
        ولی مهمه بدونی: بازار میم‌کوین پر از پامپ و دامپ هست. ما هیچ موقعیت شانسی یا بدون تحلیل نمی‌ذاریم.
        هر میم کوین قبل از معرفی، باید از فیلتر دقیق ما رد بشه.
      </p>
    </div>
  </div>
</div>

{/* خدمات ارائه شده */}
<div className="p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
  <h3 className="text-lg font-bold mb-3 text-yellow-400 text-right">💼 خدماتی که دریافت می‌کنید:</h3>
  <ul className="list-disc list-inside space-y-2 pr-4 text-right text-sm">
    <li>سیگنال دقیق میم‌کوین‌ها</li>
    <li>معرفی واچ‌لیست‌ها</li>
    <li>معرفی میم کوین‌های تازه بازار</li>
    <li>آموزش ابتدایی تا متوسط</li>
    <li>مدیریت سرمایه و ساخت لوپ مالی و رشد حساب</li>
  </ul>
</div>


{/* چرا قیمت ارزون */}
<div className="p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
  <h3 className="text-lg font-bold mb-3 text-yellow-400 text-right">💰 چرا قیمت اینقدر ارزونه؟</h3>
  <div className="space-y-3 pr-4 text-right text-sm leading-relaxed">
    <p>
      چون می‌دونیم خیلی‌ها مخصوصاً در افغانستان و ایران توان اشتراک در گروه VIP ما رو ندارن.
    </p>
    <p>ما این پلن رو راه انداختیم تا:</p>
    <ol className="list-decimal list-inside space-y-2 pr-4 text-right text-sm">
      <li>شما هم سود کنید</li>
      <li>صادقانه از کار ما سود میکنی، بعداً خدمات بیشتر از ما میخری وگرنه ۱۵ دلار پولی نیست.</li>
      <li>اگر دلت خواست، از سودهایی که گرفتی، یه درصد دلخواه هم برامون بفرستی (کاملاً اختیاری) به ما انرژی میدین تا با قدرت موقعیت ناب دیگر پیدا کنیم.</li>
    </ol>
  </div>
</div>

{/* مشورت آخر */}
<div className="p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
  <h3 className="text-lg font-bold mb-3 text-yellow-400 text-right">✍️ مشورت آخر</h3>
  <div className="space-y-3 pr-4 text-right text-sm leading-relaxed">
    <p>
      حداقل سه ماه کنار ما باش تا نتیجه واقعی ببینی.
    </p>
    <p>
      چون همیشه بازار فرصت نمی‌ده، ولی وقتی بده… باید داخل بازی باشی!
    </p>
  </div>
</div>
              
              {/* Course Price */}
              {!hasMimCoinSubscription && (
                <div className="p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold mb-2 text-yellow-400 text-right">قیمت کانال:</h3>
                      <p className="text-2xl font-bold text-green-500">{PRODUCT_PRICES.MEM_COIN} دلار</p>
                    </div>
                    <div className="bg-yellow-500/20 text-yellow-400 rounded-xl p-2 text-sm">
                      <p>اشتراک ماهانه</p>
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
          
          {isRenewal && (
            <div className="absolute bottom-20 left-4 right-4 p-4 rounded-xl bg-[#141e35] text-white mt-2 mb-4" dir="rtl">
              <p className="text-sm">
                شما در حال تمدید <span className="text-yellow-500 font-bold">{renewingProduct?.title}</span> هستید.
                این تمدید به مدت زمان باقی‌مانده اشتراک فعلی شما اضافه خواهد شد.
              </p>
            </div>
          )}

          {/* Fixed Button at Bottom */}
          <div className="absolute bottom-6 left-4 right-4 z-10">
            <button 
              onClick={hasMimCoinSubscription 
                ? () => navigate('/mimcoin')
                : () => handlePurchase({ 
                    title: "کانال میم کوین", 
                    price: PRODUCT_PRICES.MEM_COIN, 
                    months: 6 
                  })
              }
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 rounded-xl transition-colors shadow-lg flex items-center justify-center"
              dir="rtl"
            >
              <span>
                {hasMimCoinSubscription ? 'ورود به کانال میم کوین باز' : (isRenewal ? 'تمدید اشتراک' : 'خرید کانال میم کوین باز')}
              </span>
              {/* نمایش آیکون متفاوت بر اساس وضعیت اشتراک */}
              {hasMimCoinSubscription 
                ? <DoorOpen size={24} className="mr-2" /> 
                : <ShoppingCart size={24} className="mr-2" />
              }
            </button>
          </div>
        </div>
      </div>
      
      {/* Payment Card Component */}
      {showPaymentCard && (
        <PaymentCard
          isDarkMode={isDarkMode}
          onClose={() => setShowPaymentCard(false)}
          productTitle="کانال میم کوین"
          price={PRODUCT_PRICES.MEM_COIN}
        />
      )}

      {/* Video Player */}
      {showVideo && (
        <VideoPlayer
          videoUrl={videoUrl}
          title="ویدیو معرفی آموزش میم کوین"
          isDarkMode={isDarkMode}
          onClose={() => setShowVideo(false)}
        />
      )}
    </div>
  );
};

export default MimCoinServicesPage;