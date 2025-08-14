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
  const [selectedSubscription, setSelectedSubscription] = useState(null);

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
    const checkMimCoinStatus = async () => {
  const userToken = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
  
  if (userToken) {
    // بررسی localStorage
    const purchasedProductsStr = localStorage.getItem('purchasedProducts');
    
    if (purchasedProductsStr) {
      try {
        const purchasedProducts = JSON.parse(purchasedProductsStr);
        const mimCoinSubscription = purchasedProducts.find(p => {
          const title = p.title?.toLowerCase() || '';
          const isActive = p.status === 'active';
          
          const isMimCoin = (
            title.includes('میم کوین') ||
            title.includes('mim coin') ||
            title.includes('mimcoin') ||
            title.includes('کانال میم کوین') ||
            title.includes('میم‌کوین') ||
            title.includes('میم')
          );
          
          return isMimCoin && isActive;
        });
        
        if (mimCoinSubscription) {
          setHasMimCoinSubscription(true);
          return;
        }
      } catch (error) {
      }
    }
    
    // اگر در localStorage نبود، از API بررسی کن
    try {
      const response = await fetch('https://siwoxelo.myhostpoint.ch/wp-json/pcs/v1/user-purchases', {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.purchases) {
          // بروزرسانی localStorage با اطلاعات جدید
          const formattedPurchases = data.purchases.map(purchase => ({
            title: purchase.title,
            status: purchase.status,
            date: purchase.date,
            isVIP: purchase.isVIP || false
          }));
          
          localStorage.setItem('purchasedProducts', JSON.stringify(formattedPurchases));

          // دوباره چک کن
          const mimCoinProduct = formattedPurchases.find(p => {
            const title = p.title?.toLowerCase() || '';
            const isActive = p.status === 'active';
            
            const isMimCoin = (
              title.includes('میم کوین') ||
              title.includes('mim coin') ||
              title.includes('mimcoin') ||
              title.includes('کانال میم کوین') ||
              title.includes('میم‌کوین') ||
              title.includes('میم')
            );
            
            return isMimCoin && isActive;
          });

          setHasMimCoinSubscription(!!mimCoinProduct);
        }
      }
    } catch (error) {
      console.error('خطا در بررسی اشتراک میم کوین:', error);
    }
  }
};
    
    checkMimCoinStatus();
  }, []);



  const closeCard = React.useCallback(() => {
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


  // تابع جدید برای باز کردن کارت پرداخت
// تابع جدید برای باز کردن کارت پرداخت
const handlePurchase = async (subscription) => {
  // بررسی وضعیت لاگین کاربر
  const userToken = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
  
  if (!userToken) {
    // اگر کاربر لاگین نیست، به صفحه لاگین هدایت می‌شود
    navigate('/login');
    return;
  }
  
  // قبل از نمایش پنل پرداخت، اشتراک‌های کاربر را دوباره چک کنیم
  try {
    const response = await fetch('https://siwoxelo.myhostpoint.ch/wp-json/pcs/v1/user-purchases', {
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.success && Array.isArray(data.purchases)) {
        // بروزرسانی localStorage
        localStorage.setItem('purchasedProducts', JSON.stringify(data.purchases));
        
        // بررسی اشتراک میم کوین
        const hasMimCoin = data.purchases.some(p => {
          const title = p.title?.toLowerCase() || '';
          const isActive = p.status === 'active';
          
          const isMimCoin = (
            title.includes('میم کوین') ||
            title.includes('mim coin') ||
            title.includes('mimcoin') ||
            title.includes('کانال میم کوین') ||
            title.includes('میم‌کوین') ||
            title.includes('میم')
          );
          
          return isMimCoin && isActive;
        });
        
        if (hasMimCoin) {
  localStorage.setItem('purchasedProducts', JSON.stringify(data.purchases));
  localStorage.setItem('lastProductCheck', new Date().getTime().toString());
  sessionStorage.setItem('purchasedProducts', JSON.stringify(data.purchases));

navigate('/mimcoin/channel', { replace: false });
  return;
}

      }
    }
    
    // اگر اشتراک نداشت، پنل پرداخت را نمایش می‌دهیم
    setSelectedSubscription(subscription);
    setShowPaymentCard(true);
    
  } catch (error) {
    console.error('خطا در بررسی اشتراک‌ها:', error);
    // در صورت خطا، پنل پرداخت را نمایش می‌دهیم
    setSelectedSubscription(subscription);
    setShowPaymentCard(true);
  }
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
              
              {/* Pricing Options - فقط اگر اشتراک میم کوین نداشته باشد نمایش داده می‌شود */}
{!hasMimCoinSubscription && (
  <div className="p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
    <h3 className="text-lg font-bold mb-3 text-yellow-400 text-right">گزینه‌های اشتراک</h3>
<div className="space-y-4">
  <div 
    className="border border-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-800 transition-colors"
    onClick={() => handlePurchase({ 
      title: "کانال میم کوین ۱ ماهه", 
      price: PRODUCT_PRICES.MEM_COIN.ONE_MONTH, 
      months: 1 
    })}
  >
    <h4 className="font-bold text-lg">اشتراک ۱ ماهه</h4>
    <p className="text-yellow-500 text-lg mt-1">{PRODUCT_PRICES.MEM_COIN.ONE_MONTH} دلار</p>
  </div>
  
  <div 
    className="border border-gray-700 rounded-lg p-3 cursor-pointer hover:bg-gray-800 transition-colors"
    onClick={() => handlePurchase({ 
      title: "کانال میم کوین ۳ ماهه", 
      price: PRODUCT_PRICES.MEM_COIN.THREE_MONTHS, 
      months: 3 
    })}
  >
    <h4 className="font-bold text-lg">اشتراک ۳ ماهه</h4>
    <p className="text-yellow-500 text-lg mt-1">{PRODUCT_PRICES.MEM_COIN.THREE_MONTHS} دلار</p>
  </div>
  
  <div 
    className="border border-gray-700 rounded-lg p-3 bg-gray-800 cursor-pointer hover:bg-gray-700 transition-colors"
    onClick={() => handlePurchase({ 
      title: "کانال میم کوین ۶ ماهه", 
      price: PRODUCT_PRICES.MEM_COIN.SIX_MONTHS, 
      months: 6 
    })}
  >
    <div className="flex justify-between items-center">
      <h4 className="font-bold text-lg">اشتراک ۶ ماهه</h4>
      <span className="bg-yellow-500 text-gray-900 text-xs rounded-full px-2 py-1">پیشنهاد ویژه</span>
    </div>
    <p className="text-yellow-500 text-lg mt-1">{PRODUCT_PRICES.MEM_COIN.SIX_MONTHS} دلار</p>
    <p className="text-gray-400 text-sm mt-1">صرفه‌جویی ۳۳٪ نسبت به خرید ماهانه</p>
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
      title: "کانال میم کوین ۱ ماهه", 
      price: PRODUCT_PRICES.MEM_COIN.ONE_MONTH, 
      months: 1 
    })
}

              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 rounded-xl transition-colors shadow-lg flex items-center justify-center"
              dir="rtl"
            >
              <span>
                {hasMimCoinSubscription ? 'ورود به کانال میم کوین باز-' : (isRenewal ? 'تمدید اشتراک' : 'خرید کانال میم کوین باز')}
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
          title="ویدیو معرفی آموزش میم کوین"
          isDarkMode={isDarkMode}
          onClose={() => setShowVideo(false)}
        />
      )}
    </div>
  );
};

export default MimCoinServicesPage;