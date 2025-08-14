import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeftCircle, Play, ShoppingCart, DoorOpen, Lock } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Store } from 'react-notifications-component';
import PaymentCard from './PaymentCard';
import { PRODUCT_PRICES } from './config';
import VideoPlayer from './VideoPlayer';

const TradeProPage = ({ isDarkMode, isOpen, onClose }) => {
  const [showCard, setShowCard] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [addedToHistory, setAddedToHistory] = useState(false);
  const [showPaymentCard, setShowPaymentCard] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [showVideo, setShowVideo] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState('');
  const [currentVideoTitle, setCurrentVideoTitle] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  
  // قیمت ثابت ۷۵۰ دلار
  const [currentPrice] = useState(750);
  const [hasTradeProAccess, setHasTradeProAccess] = useState(false);

  const modules = [
    {
      id: 1,
      title: 'مقدمه و آشنایی با دوره',
      description: 'معرفی دوره ترید حرفه‌ای و آشنایی با مباحث',
      icon: '📘',
      free: true,
      videos: [
        {
          id: 'intro-1',
          title: 'معرفی دوره ترید حرفه‌ای',
          duration: '15:20',
          url: 'https://iamvakilet.ir/learn/tradepro-intro.mp4',
          thumbnail: '/tradepro/intro-thumbnail.jpg'
        }
      ]
    },
    {
      id: 2,
      title: 'تحلیل تکنیکال پیشرفته',
      description: 'آموزش تکنیک‌های پیشرفته تحلیل نمودار',
      icon: '📊',
      free: false,
      videos: [
        {
          id: 'technical-1',
          title: 'ساختار قیمت و الگوهای نموداری',
          duration: '45:30',
          url: 'https://iamvakilet.ir/learn/technical-1.mp4',
          thumbnail: '/tradepro/technical-1.jpg'
        },
        {
          id: 'technical-2',
          title: 'استراتژی‌های مبتنی بر زمان',
          duration: '38:15',
          url: 'https://iamvakilet.ir/learn/technical-2.mp4',
          thumbnail: '/tradepro/technical-2.jpg'
        },
        {
          id: 'technical-3',
          title: 'تشخیص نقاط ورود و خروج',
          duration: '52:40',
          url: 'https://iamvakilet.ir/learn/technical-3.mp4',
          thumbnail: '/tradepro/technical-3.jpg'
        }
      ]
    },
    {
      id: 3,
      title: 'مدیریت ریسک حرفه‌ای',
      description: 'تکنیک‌های پیشرفته مدیریت سرمایه و ریسک',
      icon: '🛡️',
      free: false,
      videos: [
        {
          id: 'risk-1',
          title: 'محاسبه دقیق حجم پوزیشن',
          duration: '33:10',
          url: 'https://iamvakilet.ir/learn/risk-1.mp4',
          thumbnail: '/tradepro/risk-1.jpg'
        },
        {
          id: 'risk-2',
          title: 'تکنیک‌های پیشرفته حد ضرر و حد سود',
          duration: '42:50',
          url: 'https://iamvakilet.ir/learn/risk-2.mp4',
          thumbnail: '/tradepro/risk-2.jpg'
        }
      ]
    },
    {
      id: 4,
      title: 'روانشناسی معاملات',
      description: 'مدیریت ذهن و احساسات در معاملات',
      icon: '🧠',
      free: false,
      videos: [
        {
          id: 'psych-1',
          title: 'کنترل احساسات در معاملات پرفشار',
          duration: '36:20',
          url: 'https://iamvakilet.ir/learn/psych-1.mp4',
          thumbnail: '/tradepro/psych-1.jpg'
        },
        {
          id: 'psych-2',
          title: 'ذهنیت برنده و تکنیک‌های حفظ تمرکز',
          duration: '41:15',
          url: 'https://iamvakilet.ir/learn/psych-2.mp4',
          thumbnail: '/tradepro/psych-2.jpg'
        }
      ]
    },
    {
      id: 5,
      title: 'استراتژی‌های معاملاتی',
      description: 'روش‌های مختلف ترید در بازارهای مختلف',
      icon: '📈',
      free: false,
      videos: [
        {
          id: 'strat-1',
          title: 'اسکالپینگ و دی‌تریدینگ',
          duration: '39:30',
          url: 'https://iamvakilet.ir/learn/strat-1.mp4',
          thumbnail: '/tradepro/strat-1.jpg'
        },
        {
          id: 'strat-2',
          title: 'سوینگ تریدینگ و پوزیشن‌گیری میان‌مدت',
          duration: '47:05',
          url: 'https://iamvakilet.ir/learn/strat-2.mp4',
          thumbnail: '/tradepro/strat-2.jpg'
        },
        {
          id: 'strat-3',
          title: 'استراتژی‌های اختصاصی ترید ارزهای دیجیتال',
          duration: '58:20',
          url: 'https://iamvakilet.ir/learn/strat-3.mp4',
          thumbnail: '/tradepro/strat-3.jpg'
        }
      ]
    }
  ];

  // بررسی وضعیت دسترسی کاربر
  const [hasAccess, setHasAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAccessStatus = async () => {
      setIsChecking(true);
      // بررسی ورود کاربر
      const userToken = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      
      if (!userToken) {
        setHasAccess(false);
        setIsChecking(false);
        return;
      }
      
      // بررسی محصولات خریداری شده کاربر
      try {
        const purchasedProductsStr = localStorage.getItem('purchasedProducts');
        
        if (purchasedProductsStr) {
          const purchasedProducts = JSON.parse(purchasedProductsStr);
          
          // بررسی دسترسی به دوره ترید حرفه‌ای
          const hasTradeProAccess = purchasedProducts.some(p => 
            p.title && 
            p.title.toLowerCase().includes('ترید حرفه‌ای') && 
            p.status === 'active'
          );
          
          setHasAccess(hasTradeProAccess);
        } else {
          setHasAccess(false);
        }
      } catch (error) {
        console.error('خطا در بررسی وضعیت دسترسی:', error);
        setHasAccess(false);
      }
      
      setIsChecking(false);
    };
    
    checkAccessStatus();
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
      window.history.pushState({ tradeProPage: true }, '', location.pathname);
      setAddedToHistory(true);
    }
    
    // افزودن event listener برای popstate
    window.addEventListener('popstate', handleBackButton);
    
    // تمیزکاری event listener
    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [isOpen, addedToHistory, location.pathname]);

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

  const handleVideoClick = (video, moduleItem) => {
    // اگر ماژول رایگان است یا کاربر دسترسی دارد
    if (moduleItem.free || hasAccess) {
      setCurrentVideoUrl(video.url);
      setCurrentVideoTitle(video.title);
      setShowVideo(true);
    } else {
      // کاربر دسترسی ندارد، نمایش پیام خرید
      Store.addNotification({
        title: (
          <div dir="rtl" style={{ textAlign: 'right', paddingRight: '15px' }}>
            خرید دوره آموزشی
          </div>
        ),
        message: (
          <div dir="rtl" style={{ textAlign: 'right' }}>
            برای مشاهده این ویدیو باید آموزش ترید حرفه‌ای را خریداری کنید.
          </div>
        ),
        type: "info",
        insert: "top",
        container: "center",
        animationIn: ["animate__animated", "animate__flipInX"],
        animationOut: ["animate__animated", "animate__flipOutX"],
        dismiss: { duration: 5000, showIcon: true, pauseOnHover: true }
      });
      
      // نمایش پنل پرداخت
      handlePurchase();
    }
  };

  const handlePurchase = () => {
    // بررسی وضعیت لاگین
    const userToken = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
    
    if (!userToken) {
      // اگر کاربر لاگین نیست، به صفحه لاگین هدایت می‌شود
      navigate('/login');
      return;
    }
    
    // نمایش پنل پرداخت با قیمت فعلی
    setShowPaymentCard(true);
  };

  const handleModuleClick = (module) => {
    setSelectedModule(module.id === selectedModule ? null : module.id);
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
            آموزش ترید حرفه‌ای
          </h2>
        </div>

        {/* Main Content Area */}
        <div className="absolute top-16 bottom-0 left-0 right-0 flex flex-col overflow-hidden">

          {/* Price Header - بدون کانت‌داون */}
          <div className="relative header-area">
            <div className="p-4">
              <div className="bg-[#141e35] rounded-xl relative overflow-hidden border border-gray-500 p-4" style={{ minHeight: "180px" }}>
                {/* Gradient background */}
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] to-[#141e35]"></div>
                </div>
                
                {/* Content */} 
                <div className="relative z-10 flex flex-col items-center justify-center text-white text-center">
                  <div className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300 drop-shadow-[0_0_20px_rgba(234,179,8,0.7)]" style={{ fontFamily: "'Segoe UI', 'Helvetica Neue', 'Arial', sans-serif" }}>
                    ${currentPrice}
                  </div>
                  
                  <span className="text-3xl font-extrabold mt-2">قیمت دوره</span>
                  
                  <p className="text-sm bg-blue-500/90 text-white font-bold px-4 py-2 rounded-lg mt-4">
                    آموزش ترید حرفه‌ای - دسترسی مادام‌العمر
                  </p>
                </div>
              </div>
            </div>
            
            {/* Gradient transition overlay */}
            <div className="absolute bottom-[-30px] left-0 right-0 pointer-events-none z-[5]" style={{
              height: '31px',
              background: isDarkMode 
                ? 'linear-gradient(to bottom, rgba(17,24,39,1), rgba(17,24,39,0))'
                : 'linear-gradient(to bottom, rgba(243,244,246,1), rgba(243,244,246,0))'
            }}></div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto pb-24 scrollable-content">
            <div className="px-4 space-y-4">
              {/* مقدمه */}
              <div className="p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
                <h3 className="text-lg font-bold mb-3 text-yellow-400 text-right">فرصتی طلایی و تکرار نشدنی</h3>
                <p className="text-right mb-3">
                  اگر واقعاً می‌خواهی از ترید یک مسیر درآمدی پایدار بسازی، و از ضرر های پی در پی خسته شدی و دوره های زیادی را اشتراک کردی ولی نتیجه صفر، دیگر وقتش رسیده که آموزش‌های سطحی را کنار بگذاری.
                </p>
                <p className="text-right">
                  دوره ترید حرفه‌ای یکی از کامل‌ترین و کاربردی‌ترین منابع آموزش بازارهای مالی برای فارسی‌زبان‌هاست. دوره‌ای که تمام جزئیات آن توسط تیمی طراحی شده که خودشان در بازار، حرفه‌ای معامله می‌کنند. مهم‌تر از همه به این بازار به دید بزنس نگاه می‌کنند نه قمار، با علم و استراتیژی معامله می‌کنند نه با شیر یا خط.
                </p>
              </div>
              
              {/* محتوای دوره */}
              <div className="p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
                <h3 className="text-lg font-bold mb-3 text-yellow-400 text-right">در این دوره آموزشی، بدون حاشیه، مستقیم می‌روی سر اصل ماجرا:</h3>
                <ul className="list-disc list-inside space-y-1 pr-4 text-right">
                  <li>آموزش تحلیل فاندامنتال از منابع اصلی جهانی و معرفی دقیق‌ترین وب‌سایت‌ها و ابزارهای حرفه‌ای</li>
                  <li>استراتژی‌های معاملاتی واقعی که توسط تیم ما در بازار استفاده می‌شود بدون نسخه‌برداری از منابع عمومی</li>
                  <li>نکات پیشرفته در مدیریت سرمایه، روانشناسی، تحلیل تکنیکال و رفتارشناسی بازار</li>
                  <li>تحلیل کامل دیتای آنچین برای شناسایی حرکات هوشمند پول</li>
                  <li>معرفی ارزهای با پتانسیل رشد بالا پیش از آنکه ترند شوند</li>
                  <li>آموزش کاربردی از مفاهیم اقتصاد کلان و تاثیر آن‌ها بر بازار کریپتو</li>
                </ul>
                <p className="text-right mt-3">
                  و ده‌ها محتوای تخصصی دیگر که فقط در این دوره آموزشی ارائه می‌شود، آن هم با زبانی ساده و قابل‌درک، اما کاملاً حرفه‌ای.
                </p>
              </div>
              
              {/* نکته مهم */}
              <div className="p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
                <h3 className="text-lg font-bold mb-3 text-yellow-400 text-right">نکته مهم</h3>
                <p className="text-gray-300 text-right">
                  به دلیل حفظ کیفیت و جلوگیری از کپی‌برداری، سرفصل‌های کامل محرمانه است و فقط در اختیار شرکت‌کنندگان قرار می‌گیرد.
                </p>
              </div>
              
              {/* قیمت دوره - فقط اگر کاربر دسترسی ندارد نمایش داده شود */}
              {!hasAccess && (
                <div className="p-4 rounded-xl bg-[#141e35] text-white" dir="rtl">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold mb-2 text-yellow-400 text-right">قیمت دوره آموزشی:</h3>
                      <p className="text-2xl font-bold text-green-500">${currentPrice}</p>
                      <p className="text-sm text-gray-300 mt-1">
                        دسترسی کامل به آموزش ترید حرفه‌ای
                      </p>
                    </div>
                  </div>
                  <div className="bg-yellow-500/20 text-yellow-400 rounded-xl p-2 text-sm mt-4">
                    <p>دسترسی مادام‌العمر / آپدیت دائمی</p>
                  </div>
                </div>
              )}
            </div>
          </div>
                    
          {/* Gradient Overlay */}
          <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-[4]" style={{
            height: '90px',
            background: 'linear-gradient(to top, rgba(0,0,0,80), rgba(0,0,0,0))'
          }}></div>

          {/* Fixed Button at Bottom */}
          <div className="absolute bottom-6 left-4 right-4 z-10">
            <button 
              onClick={hasAccess 
                ? () => navigate('/tradepro-course')
                : handlePurchase
              }
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 rounded-xl transition-colors shadow-lg text-center flex items-center justify-center"
              dir="rtl"
            >
              <span>{hasAccess ? 'ورود به آموزش ترید حرفه‌ای' : 'خرید آموزش ترید حرفه‌ای'}</span>
              {hasAccess 
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
          productTitle="دوره ترید حرفه‌ای"
          price={currentPrice.toString()}
          months={12}
        />
      )}

      {/* Video Player */}
      {showVideo && (
        <VideoPlayer
          videoUrl={currentVideoUrl}
          title={currentVideoTitle}
          isDarkMode={isDarkMode}
          onClose={() => setShowVideo(false)}
        />
      )}
    </div>
  );
};

export default TradeProPage;