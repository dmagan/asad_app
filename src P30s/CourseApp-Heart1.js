import React, { useState, useEffect, useRef } from 'react';
import { Menu, Play, Home, PlayCircle, Calendar, UserX, UserCheck, Headphones, Megaphone , MonitorPlay, Gauge} from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Store } from 'react-notifications-component';
import CustomLoading from './CustomLoading';
import VIPPage from './VIP-Service-Page';
import DexServicesPage from './Dex-Services-Page';
import ZeroTo100ServicePage from './0to100-Service-Page';
import ZeroTo100 from './0to100'; 
import SignalStreamServicePage from './SignalStream-Service-Page';
import PaymentCard from './PaymentCard';
import { PRODUCT_PRICES } from './config';
import supportNotificationService from './SupportNotificationService';
import channelNotificationService from './ChannelNotificationService';
import vipNotificationService from './VIPNotificationService';
import TradeProPage from './TradePro-Service-Page';
import postsNotificationService from './PostsNotificationService';






const SLIDER_TIMING = 3000;
const CoinIcon = ({ symbol }) => {
  // SVG icons for cryptocurrencies...
  const icons = {
    BTC: (
      <svg viewBox="0 0 32 32" width="16" height="16" fill="currentColor">
        <path d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zm7.189-17.98c.314-2.096-1.283-3.223-3.465-3.975l.708-2.84-1.728-.43-.69 2.765c-.454-.114-.92-.22-1.385-.326l.695-2.783L15.596 6l-.708 2.839c-.376-.086-.745-.17-1.104-.26l.002-.009-2.384-.595-.46 1.846s1.283.294 1.256.312c.7.175.826.638.805 1.006l-.806 3.235c.048.012.11.03.18.057l-.183-.045-1.13 4.532c-.086.212-.303.531-.793.41.018.025-1.256-.313-1.256-.313l-.858 1.978 2.25.561c.418.105.828.215 1.231.318l-.715 2.872 1.727.43.708-2.84c.472.127.93.245 1.378.357l-.706 2.828 1.728.43.715-2.866c2.948.558 5.164.333 6.097-2.333.752-2.146-.037-3.385-1.588-4.192 1.13-.26 1.98-1.003 2.207-2.538z" fill="#f7931a"/>
      </svg>
    ),
    BNB: (
      <svg viewBox="0 0 32 32" width="18" height="18">
        <circle cx="16" cy="16" r="16" fill="#F3BA2F"/>
        <path d="M12.116 14.404L16 10.52l3.886 3.886 2.26-2.26L16 6l-6.144 6.144 2.26 2.26zM6 16l2.26-2.26L10.52 16l-2.26 2.26L6 16zm6.116 1.596L16 21.48l3.886-3.886 2.26 2.259L16 26l-6.144-6.144-.003-.003 2.263-2.257zM21.48 16l2.26-2.26L26 16l-2.26 2.26L21.48 16zm-3.188-.002h.002V16L16 18.294l-2.291-2.29-.004-.004.004-.003.401-.402.195-.195L16 13.706l2.293 2.293z" fill="#fff"/>
      </svg>
    ),
    ETH: (
      <svg viewBox="0 0 32 32" width="16" height="16">
        <g fill="none" fillRule="evenodd">
          <circle cx="16" cy="16" r="16" fill="#627EEA"/>
          <g fill="#FFF" fillRule="nonzero">
            <path fillOpacity=".602" d="M16.498 4v8.87l7.497 3.35z"/>
            <path d="M16.498 4L9 16.22l7.498-3.35z"/>
            <path fillOpacity=".602" d="M16.498 21.968v6.027L24 17.616z"/>
            <path d="M16.498 27.995v-6.028L9 17.616z"/>
            <path fillOpacity=".2" d="M16.498 20.573l7.497-4.353-7.497-3.348z"/>
            <path fillOpacity=".602" d="M9 16.22l7.498 4.353v-7.701z"/>
          </g>
        </g>
      </svg>
    ),
    SOL: (
      <svg viewBox="0 0 32 32" width="16" height="16">
        <defs>
          <linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="sol-grad">
            <stop stopColor="#9945FF" offset="0%"/>
            <stop stopColor="#14F195" offset="100%"/>
          </linearGradient>
        </defs>
        <circle cx="16" cy="16" r="16" fill="url(#sol-grad)"/>
        <path d="M9 10.29h9.72c.18 0 .36.07.48.21l2.44 2.97c.24.29.24.72 0 1.01l-2.44 2.97c-.12.14-.3.21-.48.21H9c-.18 0-.36-.07-.48-.21L6.08 14.7c-.24-.29-.24-.72 0-1.01l2.44-2.97c.12-.14.3-.21.48-.21z" fill="#FFF"/>
      </svg>
    ),

    XRP: (
      <svg viewBox="0 0 32 32" width="16" height="16">
        <g fill="none">
          <circle cx="16" cy="16" r="16" fill="#23292F"/>
          <path d="M23.07 8h2.89l-6.015 5.957a5.621 5.621 0 01-7.89 0L6.035 8H8.93l4.57 4.523a3.556 3.556 0 004.996 0L23.07 8zM8.895 24.563H6l6.055-5.993a5.621 5.621 0 017.89 0L26 24.562h-2.895L18.5 20a3.556 3.556 0 00-4.996 0l-4.61 4.563z" fill="#FFF"/>
        </g>
      </svg>
    ),
    DOGE: <img src="/dogecoin.svg" alt="Dogecoin" width="22" height="22" />,
    ADA: <img src="/cardano-ada-logo.svg" alt="Dogecoin" width="32" height="32" />,
  };

  
  return icons[symbol] || <span className="text-lg font-bold">{symbol}</span>;
};

const ThemeSwitcher = ({ isDarkMode, setIsDarkMode }) => {
  const handleCheckboxChange = () => {
    const newThemeMode = !isDarkMode;
    setIsDarkMode(newThemeMode);
    
    // ارسال پیام به اپ نیتیو
    try {
      if (window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === 'function') {
        window.ReactNativeWebView.postMessage(JSON.stringify({ theme: newThemeMode ? 'dark' : 'light' }));
        //console.log(`Theme change message sent to app: ${newThemeMode ? 'dark' : 'light'}`);
      }
    } catch (error) {
      //console.error('Error sending message to native app:', error);
    }
  };

  return (
    <label className='themeSwitcherThree relative inline-flex cursor-pointer select-none items-center'>
      <input
        type='checkbox'
        checked={isDarkMode}
        onChange={handleCheckboxChange}
        className='sr-only'
      />
      <div className={`shadow-sm flex h-8 w-16 items-center justify-center rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-slate-200'}`}>
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full transition-all ${
            !isDarkMode ? 'bg-yellow-500 text-white' : 'text-gray-500'
          }`}
        >
          <svg
            width='14'
            height='14'
            viewBox='0 0 16 16'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <g clipPath='url(#clip0_3128_692)'>
            <path
  fillRule='evenodd'
  clipRule='evenodd'
  d='M8 0C8.36819 0 8.66667 0.298477 8.66667 0.666667V2C8.66667 2.36819 8.36819 2.66667 8 2.66667C7.63181 2.66667 7.33333 2.36819 7.33333 2V0.666667C7.33333 0.298477 7.63181 0 8 0ZM8 5.33333C6.52724 5.33333 5.33333 6.52724 5.33333 8C5.33333 9.47276 6.52724 10.6667 8 10.6667C9.47276 10.6667 10.6667 9.47276 10.6667 8C10.6667 6.52724 9.47276 5.33333 8 5.33333ZM4 8C4 5.79086 5.79086 4 8 4C10.2091 4 12 5.79086 12 8C12 10.2091 10.2091 12 8 12C5.79086 12 4 10.2091 4 8ZM8.66667 14C8.66667 13.6318 8.36819 13.3333 8 13.3333C7.63181 13.3333 7.33333 13.6318 7.33333 14V15.3333C7.33333 15.7015 7.63181 16 8 16C8.36819 16 8.66667 15.7015 8.66667 15.3333V14ZM2.3411 2.3424C2.60145 2.08205 3.02356 2.08205 3.28391 2.3424L4.23057 3.28906C4.49092 3.54941 4.49092 3.97152 4.23057 4.23187C3.97022 4.49222 3.54811 4.49222 3.28776 4.23187L2.3411 3.28521C2.08075 3.02486 2.08075 2.60275 2.3411 2.3424ZM12.711 11.7682C12.4506 11.5078 12.0285 11.5078 11.7682 11.7682C11.5078 12.0285 11.5078 12.4506 11.7682 12.711L12.7148 13.6577C12.9752 13.918 13.3973 13.918 13.6577 13.6577C13.918 13.3973 13.918 12.9752 13.6577 12.7148L12.711 11.7682ZM0 8C0 7.63181 0.298477 7.33333 0.666667 7.33333H2C2.36819 7.33333 2.66667 7.63181 2.66667 8C2.66667 8.36819 2.36819 8.66667 2 8.66667H0.666667C0.298477 8.66667 0 8.36819 0 8ZM14 7.33333C13.6318 7.33333 13.3333 7.63181 13.3333 8C13.3333 8.36819 13.6318 8.66667 14 8.66667H15.3333C15.7015 8.66667 16 8.36819 16 8C16 7.63181 15.7015 7.33333 15.3333 7.33333H14ZM4.23057 11.7682C4.49092 12.0285 4.49092 12.4506 4.23057 12.711L3.28391 13.6577C3.02356 13.918 2.60145 13.918 2.3411 13.6577C2.08075 13.3973 2.08075 12.9752 2.3411 12.7148L3.28776 11.7682C3.54811 11.5078 3.97022 11.5078 4.23057 11.7682ZM13.6577 3.28521C13.918 3.02486 13.918 2.60275 13.6577 2.3424C13.3973 2.08205 12.9752 2.08205 12.7148 2.3424L11.7682 3.28906C11.5078 3.54941 11.5078 3.97152 11.7682 4.23187C12.0285 4.49222 12.4506 4.49222 12.711 4.23187L13.6577 3.28521Z'
  fill='currentColor'
/>
            </g>
          </svg>
        </span>
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full transition-all ${
            isDarkMode ? 'bg-yellow-500 text-white' : 'text-gray-500'
          }`}
        >
          <svg
            width='14'
            height='14'
            viewBox='0 0 16 16'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
              <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M8.0547 1.67334C8.18372 1.90227 8.16622 2.18562 8.01003 2.39693C7.44055 3.16737 7.16651 4.11662 7.23776 5.07203C7.30901 6.02744 7.72081 6.92554 8.39826 7.60299C8.07571 8.28044 9.97381 8.69224 10.9292 8.76349C11.8846 8.83473 12.8339 8.5607 13.6043 7.99122C13.8156 7.83502 14.099 7.81753 14.3279 7.94655C14.5568 8.07556 14.6886 8.32702 14.6644 8.58868C14.5479 9.84957 14.0747 11.0512 13.3002 12.053C12.5256 13.0547 11.4818 13.8152 10.2909 14.2454C9.09992 14.6756 7.81108 14.7577 6.57516 14.4821C5.33925 14.2065 4.20738 13.5846 3.312 12.6892C2.41661 11.7939 1.79475 10.662 1.51917 9.42608C1.24359 8.19017 1.32569 6.90133 1.75588 5.71038C2.18606 4.51942 2.94652 3.47561 3.94828 2.70109C4.95005 1.92656 6.15168 1.45335 7.41257 1.33682C7.67423 1.31264 7.92568 1.44442 8.0547 1.67334Z'
                fill='currentColor'
              ></path>
          </svg>
        </span>
      </div>
    </label>
  );
};


const CourseApp = ({  // این قسمت رو جایگزین کنید
  isDarkMode,
  setIsDarkMode,
  products,
  cryptoPrices,
  stories,
  loading,
  sliders,
  isLoggedIn,
  onLogout,
  unreadSupportMessages
}) => {

  const navigate = useNavigate();
  const sliderRef = useRef(null);
  const cryptoSliderRef = useRef(null);
  const slidersRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0); // برای ردیابی اسلاید فعلی
  const [autoplayEnabled, setAutoplayEnabled] = useState(true); // افزودن state جدید
  const [showVIPPage, setShowVIPPage] = useState(false);
  const [showDexPage, setShowDexPage] = useState(false);
  const [showZeroTo100Page, setShowZeroTo100Page] = useState(false);
  const [showSignalStreamPage, setShowSignalStreamPage] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isUIDLoading, setIsUIDLoading] = useState(false);
const [showActualZeroTo100Page, setShowActualZeroTo100Page] = useState(false);
const [unreadChannelPosts, setUnreadChannelPosts] = useState(0);
const [unreadVIPPosts, setUnreadVIPPosts] = useState(0);
const [showTradeProPage, setShowTradeProPage] = useState(false);
const [unreadPostsMessages, setUnreadPostsMessages] = useState(0);


  const [showPaymentCard, setShowPaymentCard] = useState({
    show: false,
    productTitle: '',
    price: ''
  });



  


  const services = [
    {
      id: 1,
      name: "VIP",
      imageSrc: "/Services/vip.jpg",
    },
    {
      id: 2,
      name: "آموزش دکس تریدینگ",
      imageSrc: "/Services/dex.jpg",
    },
    {
      id: 3,
      name: "آموزش صفر تا صد ",
      imageSrc: "/Services/0to100.jpg",
    },
    {
      id: 4,
      name: "آموزش دکس تریدینگ +‌ 0 تا 100",
      imageSrc: "/Services/0to100+dex.jpg",
    },
    {
      id: 5,
      name: "آموزش ترید حرفه‌ای",
      imageSrc: "/Services/TradePro.jpg",
    }
    /*{
      id: ,
       name: "سیگنال استریم",
      imageSrc: "/Services/Signal-Stream.jpg",
    
    },*/
  ];

  const handleServiceClick = (service) => {
    if (service.id === 1) { // VIP
      setShowVIPPage(true); // نمایش صفحه VIP
    } else if (service.id === 2) { // دکس ترید
      setShowDexPage(true);
    } else if (service.id === 3) { // آموزش صفر تا صد
      setShowZeroTo100Page(true);
    } else if (service.id === 4) { // پکیج
      // بررسی وضعیت ورود کاربر
      const userToken = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      
      if (!userToken) {
        // اگر کاربر لاگین نیست، به صفحه لاگین هدایت می‌شود
        navigate('/login');
        return;
      }
      
      // بررسی خریدهای کاربر
      const purchasedProductsStr = localStorage.getItem('purchasedProducts');
      
      if (purchasedProductsStr) {
        try {
          const products = JSON.parse(purchasedProductsStr);
          
          // بررسی آیا پکیج ترکیبی خریداری شده است
          const hasPackage = products.some(p => 
            p.title && 
            p.title.toLowerCase().includes('پکیج') && 
            p.title.toLowerCase().includes('دکس') && 
            p.title.toLowerCase().includes('صفر') && 
            p.status === 'active'
          );
          
          // بررسی آیا هر دو دوره جداگانه خریداری شده‌اند
          const hasDex = products.some(p => 
            p.title && 
            p.title.toLowerCase().includes('دکس') && 
            p.status === 'active'
          );
          
          const hasZeroTo100 = products.some(p => 
            p.title && 
            (p.title.toLowerCase().includes('صفر تا صد') || p.title.toLowerCase().includes('0 تا 100')) && 
            p.status === 'active'
          );
          
          // اگر کاربر پکیج یا هر دو دوره را خریداری کرده باشد
          if (hasPackage || (hasDex && hasZeroTo100)) {
            Store.addNotification({
              title: (
                <div dir="rtl" style={{ textAlign: 'right', paddingRight: '15px' }}>
                  اطلاعیه
                </div>
              ),
              message: (
                <div dir="rtl" style={{ textAlign: 'right' }}>
                  شما قبلاً این آموزشها را خریداری کرده‌اید. می‌توانید از طریق منوی مربوطه به محتوای دوره‌ها دسترسی داشته باشید.
                </div>
              ),
              type: "info",
              insert: "top",
              container: "center",
              animationIn: ["animate__animated", "animate__flipInX"],
              animationOut: ["animate__animated", "animate__flipOutX"],
              dismiss: { duration: 7500, showIcon: true, pauseOnHover: true }
            });
            return;
          }
        } catch (error) {
        }
      }
      
      // اگر خریدی نداشته باشد، کارت پرداخت را نمایش می‌دهیم
      setShowPaymentCard({
        show: true,
        productTitle: 'پکیج آموزشی دکس + صفر تا صد',
        price: PRODUCT_PRICES.DEX_ZERO_TO_100_PACKAGE
      });
    }
    else if (service.id === 5) { // ترید حرفه‌ای
    setShowTradeProPage(true); // استفاده از تابع handleTradeProClick
  }
  };

const handleVIPClick = async () => {
  const userInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
  if (!userInfo) {
    navigate('/login');
    return;
  }

  try {
    // بررسی مستقیم localStorage برای محصول اشتراک
    const purchasedProductsStr = localStorage.getItem('purchasedProducts');
    
    if (purchasedProductsStr) {
      try {
        const purchasedProducts = JSON.parse(purchasedProductsStr);
        
        // بررسی برای یافتن اشتراک فعال - شامل هرگونه اشتراک فعال
        const subscriptionProduct = purchasedProducts.find(p => 
          (p.isVIP === true || 
           (p.title && typeof p.title === 'string' && 
            (p.title.includes('VIP') || p.title.includes('اشتراک')))
          ) && 
          p.status === 'active'
        );
        
        
        if (subscriptionProduct) {
          // اگر اشتراک فعال پیدا شد، به کانال VIP هدایت می‌شود
          vipNotificationService.markAllAsRead(); // علامت‌گذاری همه پیام‌ها به عنوان خوانده شده
          navigate('/chat');
          return;
        }
      } catch (parseError) {
      }
    }
    
    // اگر در localStorage پیدا نشد، از API بررسی می‌کنیم
    const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
    const response = await fetch('https://p30s.com/wp-json/pcs/v1/check-vip-status', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('خطا در بررسی وضعیت VIP');
    }
    
    const data = await response.json();
    
    if (data.success && data.has_vip) {
      // کاربر VIP است، به کانال VIP هدایت شود
      vipNotificationService.markAllAsRead(); // علامت‌گذاری همه پیام‌ها به عنوان خوانده شده
      navigate('/chat');
    } else {
      // کاربر VIP نیست، نمایش پیام مناسب
      if (data.vip_details && data.vip_details.length > 0) {
        // اشتراک VIP منقضی شده است
        Store.addNotification({
          title: (
            <div dir="rtl" style={{ textAlign: 'right', paddingRight: '15px' }}>
              خطا
            </div>
          ),
          message: (
            <div dir="rtl" style={{ textAlign: 'right' }}>
              زمان اشتراک VIP شما به پایان رسیده است
            </div>
          ),
          type: "warning",
          insert: "top",
          container: "center",
          animationIn: ["animate__animated", "animate__flipInX"],
          animationOut: ["animate__animated", "animate__flipOutX"],
          dismiss: { duration: 4000, showIcon: true, pauseOnHover: true }
        });
      } else {
        // اشتراک VIP خریداری نشده است
        Store.addNotification({
          title: (
            <div dir="rtl" style={{ textAlign: 'right', paddingRight: '15px' }}>
              خطا
            </div>
          ),
          message: (
            <div dir="rtl" style={{ textAlign: 'right' }}>
              شما هنوز اشتراک VIP را خریداری نکرده‌اید. به‌صورت خودکار به صفحه خرید هدایت می‌شوید
            </div>
          ),
          type: "danger",
          insert: "top",
          container: "center",
          animationIn: ["animate__animated", "animate__flipInX"],
          animationOut: ["animate__animated", "animate__flipOutX"],
          dismiss: { duration: 5000, showIcon: true, pauseOnHover: true }
        });
      }
      
      // نمایش صفحه خرید VIP
      setTimeout(() => {
        setShowVIPPage(true);
      }, 2000);
    }
  } catch (error) {
    
    // دوباره localStorage را بررسی می‌کنیم
    const purchasedProductsStr = localStorage.getItem('purchasedProducts');
    
    if (purchasedProductsStr) {
      try {
        const purchasedProducts = JSON.parse(purchasedProductsStr);
        
        // بررسی برای یافتن اشتراک فعال - شامل هرگونه اشتراک فعال
        const subscriptionProduct = purchasedProducts.find(p => 
          (p.isVIP === true || 
           (p.title && typeof p.title === 'string' && 
            (p.title.includes('VIP') || p.title.includes('اشتراک')))
          ) && 
          p.status === 'active'
        );
        
        if (subscriptionProduct) {
          // اگر اشتراک فعال پیدا شد، به کانال VIP هدایت می‌شود
          vipNotificationService.markAllAsRead(); // علامت‌گذاری همه پیام‌ها به عنوان خوانده شده
          navigate('/chat');
          return;
        }
      } catch (parseError) {
      }
    }
    
    // اگر در localStorage هم محصول فعال پیدا نشد، پیام خطا نمایش داده می‌شود
    Store.addNotification({
      title: (
        <div dir="rtl" style={{ textAlign: 'right', paddingRight: '15px' }}>
          خطا
        </div>
      ),
      message: (
        <div dir="rtl" style={{ textAlign: 'right' }}>
          خطا در بررسی وضعیت اشتراک. به‌صورت خودکار به صفحه خرید هدایت می‌شوید
        </div>
      ),
      type: "danger",
      insert: "top",
      container: "center",
      animationIn: ["animate__animated", "animate__flipInX"],
      animationOut: ["animate__animated", "animate__flipOutX"],
      dismiss: { duration: 5000, showIcon: true, pauseOnHover: true }
    });
    
    // نمایش صفحه VIP
    setTimeout(() => {
      setShowVIPPage(true);
    }, 2000);
  }
};





  const handleDexClick = () => {
    const userInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
    if (!userInfo) {
      navigate('/login');
      return;
    }
  
    const purchasedProducts = localStorage.getItem('purchasedProducts');
    if (!purchasedProducts) {
      // نمایش پیام مناسب و هدایت به صفحه Dex
      Store.addNotification({
        title: (
          <div dir="rtl" style={{ textAlign: 'right', paddingRight: '15px' }}>
            اطلاعیه
          </div>
        ),
        message: (
          <div dir="rtl" style={{ textAlign: 'right' }}>
            شما هنوز آموزش دکس تریدینگ را خریداری نکرده‌اید
          </div>
        ),
        type: "danger",
        insert: "top",
        container: "center",
        animationIn: ["animate__animated", "animate__flipInX"],
        animationOut: ["animate__animated", "animate__flipOutX"],
        dismiss: { duration: 3000, showIcon: true, pauseOnHover: true }
      });
      setTimeout(() => {
        setShowDexPage(true);
      }, 2000);
      return;
    }
  
    const products = JSON.parse(purchasedProducts);
    // بررسی اینکه آیا محصول دکس تریدینگ خریداری شده است
    const dexProduct = products.find(p => 
      p.title && p.title.includes('دکس') && p.status === 'active'
    );
  
    if (!dexProduct) {
      Store.addNotification({
        title: (
          <div dir="rtl" style={{ textAlign: 'right' , paddingRight: '15px' }}>اطلاعیه </div>
        ),
        message: (
                 <div dir="rtl" style={{ textAlign: 'right' }}>
                   شما هنوز آموزش دکس تریدینگ را خریداری نکرده‌اید . به صورت خودکار به صغحه مورد نظر هدایت می شوید
                 </div>
               ),
        type: "danger",
        insert: "top",
        container: "center",
        animationIn: ["animate__animated", "animate__flipInX"],
        animationOut: ["animate__animated", "animate__flipOutX"],
        dismiss: { duration: 5000, showIcon: true, pauseOnHover: true },
     
      });
  
      setTimeout(() => {
        setShowDexPage(true);
      }, 2000);
      return;
    }
  
    // اگر محصول خریداری شده باشد، به صفحه دکس تریدینگ هدایت می‌شود
    navigate('/dex');
  };

const handleTradeProClick = () => {
  const userInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
  if (!userInfo) {
    navigate('/login');
    return;
  }

  const purchasedProducts = localStorage.getItem('purchasedProducts');
  if (!purchasedProducts) {
    // نمایش پیام مناسب و هدایت به صفحه ترید حرفه‌ای
    Store.addNotification({
      title: (
        <div dir="rtl" style={{ textAlign: 'right', paddingRight: '15px' }}>
          اطلاعیه
        </div>
      ),
      message: (
        <div dir="rtl" style={{ textAlign: 'right' }}>
          شما هنوز آموزش ترید حرفه‌ای را خریداری نکرده‌اید
        </div>
      ),
      type: "danger",
      insert: "top",
      container: "center",
      animationIn: ["animate__animated", "animate__flipInX"],
      animationOut: ["animate__animated", "animate__flipOutX"],
      dismiss: { duration: 3000, showIcon: true, pauseOnHover: true }
    });
    setTimeout(() => {
      setShowTradeProPage(true);
    }, 2000);
    return;
  }

  const products = JSON.parse(purchasedProducts);
  // بررسی اینکه آیا محصول ترید حرفه‌ای خریداری شده است
  const tradeProProduct = products.find(p => 
    p.title && p.title.includes('ترید حرفه‌ای') && p.status === 'active'
  );

  if (!tradeProProduct) {
    Store.addNotification({
      title: (
        <div dir="rtl" style={{ textAlign: 'right', paddingRight: '15px' }}>اطلاعیه </div>
      ),
      message: (
        <div dir="rtl" style={{ textAlign: 'right' }}>
          شما هنوز آموزش ترید حرفه‌ای را خریداری نکرده‌اید. به صورت خودکار به صفحه مورد نظر هدایت می شوید
        </div>
      ),
      type: "danger",
      insert: "top",
      container: "center",
      animationIn: ["animate__animated", "animate__flipInX"],
      animationOut: ["animate__animated", "animate__flipOutX"],
      dismiss: { duration: 5000, showIcon: true, pauseOnHover: true },
    });

    setTimeout(() => {
      setShowTradeProPage(true);
    }, 2000);
    return;
  }

  // اگر محصول خریداری شده باشد، به صفحه ترید حرفه‌ای هدایت می‌شود
  navigate('/tradepro');
};
  const handleSliderWithPaymentClick = (productName, productPrice) => {
  // بررسی وضعیت ورود کاربر
  const userToken = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
  
  if (!userToken) {
    // مستقیماً به صفحه لاگین هدایت می‌شود بدون نمایش پیام
    navigate('/login');
    return;
  }
  
  // بررسی خریدهای کاربر
  const purchasedProductsStr = localStorage.getItem('purchasedProducts');
  
  if (purchasedProductsStr) {
    try {
      const products = JSON.parse(purchasedProductsStr);
      
      // بررسی آیا محصول مشابه قبلاً خریداری شده است
      const hasSimilarProduct = products.some(p => 
        p.title && 
        p.title.toLowerCase().includes(productName.toLowerCase()) && 
        p.status === 'active'
      );
      
      // اگر محصول دکس یا صفر تا صد است، بررسی اضافی انجام می‌دهیم
      let hasDexAndZeroTo100 = false;
      
      if (productName.toLowerCase().includes('دکس') && productName.toLowerCase().includes('صفر تا صد')) {
        const hasDex = products.some(p => 
          p.title && 
          p.title.toLowerCase().includes('دکس') && 
          p.status === 'active'
        );
        
        const hasZeroTo100 = products.some(p => 
          p.title && 
          (p.title.toLowerCase().includes('صفر تا صد') || p.title.toLowerCase().includes('0 تا 100')) && 
          p.status === 'active'
        );
        
        hasDexAndZeroTo100 = hasDex && hasZeroTo100;
      }
      
      // اگر کاربر محصول مشابه یا هر دو دوره را خریداری کرده باشد
      if (hasSimilarProduct || hasDexAndZeroTo100) {
        Store.addNotification({
          title: (
            <div dir="rtl" style={{ textAlign: 'right', paddingRight: '15px' }}>
              اطلاعیه
            </div>
          ),
          message: (
            <div dir="rtl" style={{ textAlign: 'right' }}>
              شما قبلاً این دوره آموشی را خریداری کرده‌اید. می‌توانید از طریق منوی مربوطه به محتوای دوره دسترسی داشته باشید.
            </div>
          ),
          type: "info",
          insert: "top",
          container: "center",
          animationIn: ["animate__animated", "animate__flipInX"],
          animationOut: ["animate__animated", "animate__flipOutX"],
          dismiss: { duration: 7500, showIcon: true, pauseOnHover: true }
        });
        return;
      }
    } catch (error) {
    }
  }
  
  // اگر خریدی نداشته باشد یا خطایی رخ داده باشد، کارت پرداخت را نمایش می‌دهیم
  setShowPaymentCard({
    show: true,
    productTitle: productName,
    price: productPrice
  });
};
const handleZeroTo100Click = () => {
  const userInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
  if (!userInfo) {
    navigate('/login');
    return;
  }

  const purchasedProducts = localStorage.getItem('purchasedProducts');
  if (!purchasedProducts) {
    // نمایش پیام مناسب و هدایت به صفحه صفر تا صد
    Store.addNotification({
      title: (
        <div dir="rtl" style={{ textAlign: 'right', paddingRight: '15px' }}>
          اطلاعیه
        </div>
      ),
      message: (
        <div dir="rtl" style={{ textAlign: 'right' }}>
          شما هنوز آموزش صفر تا صد را خریداری نکرده‌اید
        </div>
      ),
      type: "danger",
      insert: "top",
      container: "center",
      animationIn: ["animate__animated", "animate__flipInX"],
      animationOut: ["animate__animated", "animate__flipOutX"],
      dismiss: { duration: 3000, showIcon: true, pauseOnHover: true }
    });
    setTimeout(() => {
      setShowZeroTo100Page(true);
    }, 2000);
    return;
  }

  const products = JSON.parse(purchasedProducts);
  // بررسی اینکه آیا محصول صفر تا صد خریداری شده است
  const zeroTo100Product = products.find(p => 
    p.title && 
    (p.title.includes('صفر تا صد') || p.title.includes('0 تا 100') || p.title.includes('۰ تا ۱۰۰')) && 
    p.status === 'active'
  );

  if (!zeroTo100Product) {
    Store.addNotification({
      title: (
        <div dir="rtl" style={{ textAlign: 'right', paddingRight: '15px' }}>اطلاعیه </div>
      ),
      message: (
        <div dir="rtl" style={{ textAlign: 'right' }}>
          شما هنوز آموزش صفر تا صد را خریداری نکرده‌اید. به صورت خودکار به صفحه مورد نظر هدایت می شوید
        </div>
      ),
      type: "danger",
      insert: "top",
      container: "center",
      animationIn: ["animate__animated", "animate__flipInX"],
      animationOut: ["animate__animated", "animate__flipOutX"],
      dismiss: { duration: 5000, showIcon: true, pauseOnHover: true },
    });

    setTimeout(() => {
      setShowZeroTo100Page(true);
    }, 2000);
    return;
  }

  // اگر محصول خریداری شده باشد، به صفحه صفر تا صد هدایت می‌شود
  setShowActualZeroTo100Page(true);
};
  // ارسال وضعیت تم به اپ نیتیو در بارگذاری اولیه
useEffect(() => {
  try {
    if (window.ReactNativeWebView && typeof window.ReactNativeWebView.postMessage === 'function') {
      window.ReactNativeWebView.postMessage(JSON.stringify({ theme: isDarkMode ? 'dark' : 'light' }));
      //console.log(`Initial theme sent to app: ${isDarkMode ? 'dark' : 'light'}`);
    }
  } catch (error) {
    //console.error('Error sending initial theme to native app:', error);
  }
  
  // ذخیره وضعیت اتوپلی در localStorage
 // همیشه اتوپلی را فعال نگه دار
localStorage.removeItem('sliderAutoplayEnabled');
setAutoplayEnabled(true);
}, []);


useEffect(() => {
  if (isLoggedIn) {
    postsNotificationService.start();
    postsNotificationService.addListener(count => {
      setUnreadPostsMessages(count);
    });
    
    return () => {
      postsNotificationService.removeListener(setUnreadPostsMessages);
      postsNotificationService.stop();
    };
  } else {
    setUnreadPostsMessages(0);
  }
}, [isLoggedIn]);


// اضافه کردن useEffect برای راه‌اندازی سرویس‌های نوتیفیکیشن
useEffect(() => {
  if (isLoggedIn) {
    // راه‌اندازی سرویس نوتیفیکیشن کانال
    channelNotificationService.start();
    channelNotificationService.addListener(count => {
      setUnreadChannelPosts(count);
    });
    
    // تمیز کردن در زمان unmount
    return () => {
      channelNotificationService.removeListener(setUnreadChannelPosts);
      channelNotificationService.stop();
    };
  } else {
    // ریست کردن شمارشگر پست‌های ناخوانده در صورت خروج کاربر
    setUnreadChannelPosts(0);
  }
}, [isLoggedIn]); // فقط وقتی وضعیت ورود کاربر تغییر می‌کند، اجرا شود

// این کد را در بخش useEffect های فایل CourseApp.js اضافه کنید
useEffect(() => {
  const verifyAndRefreshToken = async () => {
    const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
    if (!token) return;
    
    // بررسی زمان آخرین تمدید توکن
    const lastTokenRefresh = localStorage.getItem('lastTokenRefresh') || sessionStorage.getItem('lastTokenRefresh');
    const now = new Date().getTime();
    
    // اگر بیش از 23 ساعت از آخرین تمدید گذشته، توکن را تمدید کنیم
    if (!lastTokenRefresh || (now - parseInt(lastTokenRefresh)) > 23 * 60 * 60 * 1000) {
      try {
        const response = await fetch('https://p30s.com/wp-json/jwt-auth/v1/token/validate', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          // اگر توکن نامعتبر است، کاربر را لاگین مجدد کنیم
          const userInfo = JSON.parse(localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo') || '{}');
          if (userInfo.user_email && localStorage.getItem('userPassword')) {
            // اگر رمز عبور ذخیره شده وجود دارد، لاگین مجدد انجام دهیم
            const loginResponse = await fetch('https://p30s.com/wp-json/jwt-auth/v1/token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                username: userInfo.user_email,
                password: localStorage.getItem('userPassword')
              })
            });
            
            if (loginResponse.ok) {
              const data = await loginResponse.json();
              if (data.token) {
                // ذخیره توکن جدید
                if (localStorage.getItem('userToken')) {
                  localStorage.setItem('userToken', data.token);
                  localStorage.setItem('userInfo', JSON.stringify(data));
                  localStorage.setItem('lastTokenRefresh', now.toString());
                } else {
                  sessionStorage.setItem('userToken', data.token);
                  sessionStorage.setItem('userInfo', JSON.stringify(data));
                  sessionStorage.setItem('lastTokenRefresh', now.toString());
                }
              }
            }
          }
        } else {
          // توکن معتبر است، زمان آخرین بررسی را به‌روز کنیم
          if (localStorage.getItem('userToken')) {
            localStorage.setItem('lastTokenRefresh', now.toString());
          } else {
            sessionStorage.setItem('lastTokenRefresh', now.toString());
          }
        }
      } catch (error) {
      }
    }
  };

  // اجرای تابع بررسی توکن با فاصله منظم
  verifyAndRefreshToken();
  const tokenCheckInterval = setInterval(verifyAndRefreshToken, 30 * 60 * 1000); // هر 30 دقیقه
  
  return () => clearInterval(tokenCheckInterval);
}, []);



  // اضافه کردن یک useEffect جدید برای هندل کردن اسکرول دستی
  useEffect(() => {
    if (!slidersRef.current) return;
    
    const slider = slidersRef.current;
    
    const handleScroll = () => {
      const index = Math.round(slider.scrollLeft / slider.offsetWidth);
      
      // اگر شماره اسلاید تغییر کرده باشد، به معنی تعامل کاربر است
      if (index !== currentSlide) {
        setCurrentSlide(index);
      }
    };
  
    slider.addEventListener('scroll', handleScroll);
    
    return () => {
      slider.removeEventListener('scroll', handleScroll);
    };
  }, [currentSlide]);

// اتوچنج اسلایدر (فقط اگر autoplayEnabled فعال باشد)
useEffect(() => {
  // اگر اسلایدری وجود ندارد یا autoplayEnabled غیرفعال است، اجرا نشود
  if (sliders.length === 0 || !autoplayEnabled) return;
  
  //console.log('اتوپلی اسلایدر فعال است');
  
  const interval = setInterval(() => {
    if (slidersRef.current) {
      const nextSlide = (currentSlide + 1) % sliders.length;
      setCurrentSlide(nextSlide);
      
      slidersRef.current.scrollTo({
        left: nextSlide * slidersRef.current.clientWidth,
        behavior: 'smooth'
      });
    }
  }, 1000);  // هر 4 ثانیه
  
  return () => clearInterval(interval);
}, [currentSlide, sliders.length, autoplayEnabled]);

// افزودن useEffect برای مدیریت تعامل کاربر
useEffect(() => {
  const slider = slidersRef.current;
  if (!slider) return;

  // غیرفعال کردن دائمی اتوچنج با تعامل کاربر
  // غیرفعال کردن موقت اتوچنج با تعامل کاربر
const disableAutoplay = () => {
  // فقط موقتاً غیرفعال می‌کنیم، بدون ذخیره در localStorage
  if (autoplayEnabled) {
    //console.log('اتوپلی اسلایدر موقتاً غیرفعال شد');
    setAutoplayEnabled(false);
    
    // بعد از چند ثانیه دوباره فعال می‌کنیم
    setTimeout(() => {
      setAutoplayEnabled(true);
      //console.log('اتوپلی اسلایدر دوباره فعال شد');
    }, 3000); // 10 ثانیه بعد
  }
};

  // ایجاد event listener برای همه انواع تعامل کاربر
  const handleUserInteraction = () => {
    disableAutoplay();
  };

  slider.addEventListener('touchstart', handleUserInteraction, { passive: true });
  slider.addEventListener('mousedown', handleUserInteraction);
  slider.addEventListener('wheel', handleUserInteraction);
  slider.addEventListener('scroll', handleUserInteraction, { passive: true });
  
  // اضافه کردن listener برای کلیک روی دکمه‌های navigation
  const navButtons = document.querySelectorAll('.slider-nav-button');
  navButtons.forEach(button => {
    button.addEventListener('click', handleUserInteraction);
  });

  return () => {
    slider.removeEventListener('touchstart', handleUserInteraction);
    slider.removeEventListener('mousedown', handleUserInteraction);
    slider.removeEventListener('wheel', handleUserInteraction);
    slider.removeEventListener('scroll', handleUserInteraction);
    
    navButtons.forEach(button => {
      button.removeEventListener('click', handleUserInteraction);
    });
  };
}, [autoplayEnabled]);


// اضافه کردن useEffect برای راه‌اندازی سرویس نوتیفیکیشن VIP
useEffect(() => {
  if (isLoggedIn) {
    // راه‌اندازی سرویس - خود سرویس داخلاً بررسی می‌کند که آیا کاربر VIP است
    const initService = async () => {
      const started = await vipNotificationService.start();
      if (started) {
        vipNotificationService.addListener(count => {
          setUnreadVIPPosts(count);
        });
      } else {
        // اگر کاربر VIP نیست، مقدار را صفر قرار می‌دهیم
        setUnreadVIPPosts(0);
      }
    };
    
    initService();
    
    // تمیز کردن در زمان unmount
    return () => {
      vipNotificationService.removeListener(setUnreadVIPPosts);
      vipNotificationService.stop();
    };
  } else {
    // ریست کردن شمارشگر پست‌های ناخوانده VIP در صورت خروج کاربر
    setUnreadVIPPosts(0);
  }
}, [isLoggedIn]); // فقط وقتی وضعیت ورود کاربر تغییر می‌کند، اجرا شود

const handleSignalStreamClick = async () => {
  // نمایش وضعیت لودینگ
  setIsUIDLoading(true);
  
  // بررسی اینکه آیا کاربر لاگین کرده است
  const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
  
  if (!token) {
    // پنهان کردن لودینگ
    setIsUIDLoading(false);
    
    Store.addNotification({
      title: (
        <div dir="rtl" style={{ textAlign: 'right', paddingRight: '15px' }}>
          خطا
        </div>
      ),
      message: (
        <div dir="rtl" style={{ textAlign: 'right' }}>
          شما باید ابتدا وارد حساب کاربری خود شوید
        </div>
      ),
      type: "danger",
      insert: "top",
      container: "center",
      animationIn: ["animate__animated", "animate__flipInX"],
      animationOut: ["animate__animated", "animate__flipOutX"],
      dismiss: { duration: 3000, showIcon: true, pauseOnHover: true }
    });
    
    // هدایت به صفحه لاگین
    setTimeout(() => {
      navigate('/login');
    }, 3000);
    return;
  }
  
  try {
    // بررسی وضعیت UID با استفاده از API
    const response = await fetch('https://p30s.com/wp-json/lbank/v1/check-uid-status', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    // پنهان کردن لودینگ
    setIsUIDLoading(false);
    
    if (data.has_request && data.requests.some(req => req.status === 'approved')) {
      // اگر UID تأیید شده، هدایت به کانال
      navigate('/chanel-signal-stream');
    } else {
      // اگر UID ثبت نشده یا تأیید نشده
      Store.addNotification({
        title: (
          <div dir="rtl" style={{ textAlign: 'right', paddingRight: '15px' }}>
            اطلاعیه
          </div>
        ),
        message: (
          <div dir="rtl" style={{ textAlign: 'right' }}>
            شما باید ابتدا در سیگنال استریم ثبت‌نام کنید. به صورت اتوماتیک به صفحه ثبت‌نام سیگنال استریم هدایت می‌شوید.
          </div>
        ),
        type: "info",
        insert: "top",
        container: "center",
        animationIn: ["animate__animated", "animate__flipInX"],
        animationOut: ["animate__animated", "animate__flipOutX"],
        dismiss: { duration: 4000, showIcon: true, pauseOnHover: true }
      });
      
      
      // هدایت به صفحه ثبت‌نام سیگنال استریم
      setTimeout(() => {
        setShowSignalStreamPage(true);
      }, 4000);
    }
  } catch (error) {
    //console.error('Error checking UID status:', error);
    
    // پنهان کردن لودینگ
    setIsUIDLoading(false);
    
    // در صورت خطا، پیام مناسب نمایش داده شود
    Store.addNotification({
      title: (
        <div dir="rtl" style={{ textAlign: 'right', paddingRight: '15px' }}>
          خطا
        </div>
      ),
      message: (
        <div dir="rtl" style={{ textAlign: 'right' }}>
          خطا در بررسی وضعیت ثبت‌نام. به صفحه ثبت‌نام هدایت می‌شوید.
        </div>
      ),
      type: "danger",
      insert: "top",
      container: "center",
      animationIn: ["animate__animated", "animate__flipInX"],
      animationOut: ["animate__animated", "animate__flipOutX"],
      dismiss: { duration: 3000, showIcon: true, pauseOnHover: true }
    });
    
    
    // هدایت به صفحه ثبت‌نام سیگنال استریم
    setTimeout(() => {
      setShowSignalStreamPage(true);
    }, 3000);
  }
};


  const scrollToIndex = (index) => {
    setCurrentIndex(index);
    if (sliderRef.current) {
      const scrollPosition = index * (280 + 16);
      sliderRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return <CustomLoading />;
  }

  return (
    <div className={`min-h-screen scrollbar-hide ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} font-iransans`}>
        <Toaster
  position="top-center"
  reverseOrder={false}
  toastOptions={{
    duration: 4000,
    style: {
      background: isDarkMode ? '#1F2937' : '#363636',
      color: '#fff',
      fontFamily: 'IranSans',
      direction: 'rtl',
       textAlign: 'right'
    },
    success: {
      duration: 3000,
      icon: '',
    },
    error: {
      duration: 7000,
      icon: '❌',
    }
  }}
/>

      {/* Header */}
<div className={`px-6 py-4 flex items-center justify-between ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
  <img src="/Logo-UpLeft.png" alt="Logo" className="h-8 w-auto" />
  <span className={`text-lg ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>خانه</span>
  <ThemeSwitcher isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
</div>


{/* ------------------------------------------------------- */}

{/* Crypto Prices */}
<div className="p-4">
  <div 
    ref={cryptoSliderRef}
    className="flex overflow-x-auto gap-3 pb-1 -mx-2 px-1 scrollbar-hide snap-x snap-mandatory touch-pan-x"
    style={{
      scrollbarWidth: 'none',
      msOverflowStyle: 'none'
    }}
  >
    {cryptoPrices.map((crypto) => (
      <div
        key={crypto.id}
        className={`flex-shrink-0 w-[150px] h-[85px] p-1.5 rounded-xl border ${
          isDarkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900'
        }`}
      >
        <div className="flex items-center mb-2">
          <div className="w-6 h-6 mr-2">
            <CoinIcon symbol={crypto.symbol} />
          </div>
          <span className={`text-sm  ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {crypto.symbol}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
        <div 
  className={`text- font-bold tracking-wide ${isDarkMode ? 'text-white' : 'text-gray-900'}`}  style={{ WebkitTextStroke: '0.4px currentColor' }}  >
            $&nbsp;{crypto.price?.toLocaleString()}
          </div>
          <div className={`text-xs font-medium ${crypto.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {crypto.change >= 0 ? '+' : ''}{crypto.change?.toFixed(2)}%
          </div>
        </div>
        <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          $&nbsp;{crypto.price?.toLocaleString()} USD
        </div>
      </div>
    ))}
  </div>
</div>

{/* ------------------------------------------------------- */}

{/* Story Highlights */}
<div className="px-4">
<h2
  className={`text-2xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
  dir="rtl"
  style={{
    textShadow:
      '1px 0 0 currentColor, -1px 0 0 currentColor, 0 1px 0 currentColor, 0 -1px 0 currentColor'
  }}
>
استوری ها
</h2>

  <div className="relative">
    <div 
      className="flex overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory gap-0.5"
      onScroll={(e) => {
        const scrollLeft = e.target.scrollLeft;
        const itemWidth = 90; // تقریبی برای هر آیتم داستان
        const index = Math.round(scrollLeft / itemWidth);
        setCurrentStoryIndex(index);
      }}
    >
      {stories.map((story, index) => (
        <div 
          key={story.id}
          className="flex-none snap-center cursor-pointer"
          onClick={() => navigate(`/stories/${story.id}`)}
        >
          <div className="flex flex-col items-center gap-1">
            <div className="w-16 h-16">
              <div className={`w-full h-full rounded-full p-0.5 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                {story._embedded && story._embedded['wp:featuredmedia'] && (
                  <img
                    src={story._embedded['wp:featuredmedia'][0].source_url}
                    alt={story.title.rendered}
                    className="w-full h-full rounded-full object-cover"
                  />
                )}
              </div>
            </div>
            <div className="flex flex-col items-center gap-0.5">
              <span className={`text-sm font-medium text-center line-clamp-1 w-24 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {story.title.rendered}
              </span>
              <span className={`text-xs text-center line-clamp-1 w-24 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {story.meta?.story_subtitle || ''}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
    
 {/* Dots Indicator for Stories */}
{stories.length > 0 && (
  <div className="flex justify-center gap-2 mt-2 mb-4">
    {/* فقط 2 نقطه نمایش داده شود */}
    {[0, 1,2,3,4].filter(index => index < stories.length).map((index) => (
      <button
        key={index}
        onClick={() => {
          // اسکرول به موقعیت استوری مورد نظر
          const storyContainer = document.querySelector('.flex.overflow-x-auto.pb-4');
          if (storyContainer) {
            storyContainer.scrollTo({
              left: index * 90, // عرض تقریبی هر آیتم
              behavior: 'smooth'
            });
          }
          setCurrentStoryIndex(index);
        }}
        className={`w-2 h-2 rounded-full transition-all ${
          currentStoryIndex === index ? 'bg-yellow-500 w-4' : isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
        }`}
      />
    ))}
  </div>
)}
  </div>
</div>




    {/* Sliders Section */}
{/* Sliders Section */}
<div className="px-4">
  <div className="relative">
    <div 
      ref={slidersRef}
      className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
    >
     {sliders.map((slider, index) => (
      <div 
        key={slider.id}
        className="flex-none w-full snap-center cursor-pointer"
        style={{
          width: '100%',
          minWidth: '100%'
        }}
        onClick={() => {
          // استخراج لینک و اطلاعات محصول از متادیتای اسلایدر
          const link = slider.meta?.slider_link || '';
          const productName = slider.meta?.slider_product_name || '';
          const productPrice = slider.meta?.slider_product_price || '';
          
          // بررسی آیا باید صفحه پرداخت باز شود
          if (link === 'PAYMENT' && productName && productPrice) {
            // اینجا تابع بررسی وضعیت ورود کاربر را فراخوانی می‌کنیم
            handleSliderWithPaymentClick(productName, productPrice);
          }
          // بررسی آیا لینک داخلی است
          else if (link && link.startsWith('/')) {
            // هدایت به مسیر داخلی با استفاده از React Router
            navigate(link);
          } else if (link && !link.startsWith('http')) {
            // اگر لینک با http شروع نشود، فرض می‌کنیم مسیر داخلی بدون اسلش ابتدایی است
            navigate('/' + link);
          } else if (link) {
            // لینک خارجی
            window.open(link, '_blank');
          }
        }}
      >
        {slider._embedded && 
         slider._embedded['wp:featuredmedia'] && 
         slider._embedded['wp:featuredmedia'][0] && (
          <img
            src={slider._embedded['wp:featuredmedia'][0].source_url}
            alt={slider.title.rendered}
            className="w-full h-18 object-cover rounded-xl"
            loading="eager"
          />
        )}
      </div>
     ))}
    </div>
    {/* Navigation & Control */}
   
  </div>
</div>
{/* Services */}
<div className="p-4">

  <h2
  className={`text-2xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
  dir="rtl"
  style={{
    textShadow:
      '1px 0 0 currentColor, -1px 0 0 currentColor, 0 1px 0 currentColor, 0 -1px 0 currentColor'
  }}
>
  خدمات ما
</h2>


  <div className="relative">
    <div 
      ref={sliderRef}
      className="flex overflow-x-auto gap-3 -mx-2 px-2 scrollbar-hide snap-x snap-mandatory"
      style={{
        scrollSnapType: 'x mandatory',
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch'
      }}
      onScroll={(e) => {
        const index = Math.round(e.target.scrollLeft / (280 + 16));
        setCurrentIndex(index);
      }}
    >
 {services.map((service, index) => (
  <div 
    key={service.id} 
    className={`flex-shrink-0 w-32 p-2 rounded-2xl shadow-sm ${isDarkMode ? '' : ''}`}
    onClick={() => handleServiceClick(service)}
    style={{ cursor: 'pointer' }}
  >
    <div className="flex flex-col items-center">
      <div className="rounded-2xl p-2 bg-gray-0 w-full aspect-square">
        <img
          src={service.imageSrc}
          alt={service.name}
          className="w-full h-full rounded-xl object-cover"
        />
      </div>
      <div className="w-full space-y-2">
        <h3 className={`font-medium text-sm text-center line-clamp-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {service.name}
        </h3>
      </div>
    </div>
  </div>
))}
          </div>
          
{/* Dots Indicator */}
<div className="flex justify-center gap-2 mt-4">
  {/* فقط 3 نقطه نمایش داده شود */}
  {[0, 1,].map((index) => (
    <button
      key={index}
      onClick={() => scrollToIndex(index)}
      className={`w-2 h-2 rounded-full transition-all ${
        currentIndex === index ? 'bg-yellow-500 w-4' : 'bg-gray-300'
      }`}
    />
  ))}
</div>
          {/* Courses */}
<div className="px-4">
  <h2 className="text-xl mb-4"></h2>
  <div className="grid grid-cols-1 gap-4" dir="rtl">
{/*
  <div onClick={handleSignalStreamClick} className={`p-4 rounded-2xl flex items-center gap-3 border-2 ${ isDarkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900' }`}>
  <div className="w-16 h-16 rounded-xl flex items-center justify-center">
      <div className="w-16 h-16 text-[#f7d55d]">
      <img src="/Services/Signal-Stream.jpg" alt="Signal Stream" className="w-full h-full object-cover rounded-lg" />
</div>
      </div>
      <div>
      <h3 className={`font-medium text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          ورود به کانال رایگان سیگنال استریم
        </h3>
        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
سیگنال فیوچرز رایگان
        </p>
      </div>
    </div>
    */}

<div onClick={handleVIPClick} className={`p-4 rounded-2xl flex items-center gap-3 border-2 ${isDarkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900'}`}>
  <div className="relative">
    <div className="w-16 h-16 text-blue-100">
      <img src="/Services/VIP.jpg" alt="Signal Stream" className="w-full h-full object-cover rounded-lg" />
    </div>
    {unreadVIPPosts > 0 && (
      <div className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full animate__animated animate__heartBeat animate__infinite">
        {unreadVIPPosts > 9 ? '9+' : unreadVIPPosts}
      </div>
    )}
  </div>
  <div>
    <h3 className={`font-medium text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      ورود به کانال VIP
    </h3>
    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
      کانال ویژه تیم PCS
    </p>
  </div>
</div>

    <div onClick={handleDexClick} className={`p-4 rounded-2xl flex items-center gap-3 border-2 ${isDarkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900'}`}>
            <div className="">
        <div className="w-16 h-16 text-purple-500">
        <img src="/Services/Dex.jpg" alt="Signal Stream" className="w-full h-full object-cover rounded-lg" />
        </div>
      </div>
      <div>
      <h3 className={`font-medium text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          ورود به آموزش حرفه ای دکس تریدینگ
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          نحوه پیدا کردن میم کوین های پامپی 
           </p>
      </div>
    </div>

    <div  onClick={handleZeroTo100Click} className={`p-4 rounded-2xl flex items-center gap-3 border-2 ${ isDarkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900' }`}>
    <div className="">
        <div className="w-16 h-16 text-yellow-500">
        <img src="/Services/0To100.jpg" alt="Signal Stream" className="w-full h-full object-cover rounded-lg" />

        </div>
      </div>
      <div>
      <h3 className={`font-medium text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          ورود به آموزش ۰ تا ۱۰۰ کریپتو
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          آشنایی با مفاهیم پایه تا حرفه ای
          </p>
      </div>
    </div>

    <div onClick={handleTradeProClick} className={`p-4 rounded-2xl flex items-center gap-3 border-2 ${isDarkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900'}`}>
  <div className="">
    <div className="w-16 h-16 text-blue-500">
      <img src="/Services/TradePro.jpg" alt="Trade Pro" className="w-full h-full object-cover rounded-lg" />
    </div>
  </div>
  <div>
    <h3 className={`font-medium text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      ورود به آموزش ترید حرفه‌ای
    </h3>
    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
      آموزش استراتژی‌های پیشرفته ترید
    </p>
  </div>
</div>

    <div  onClick={() => navigate('/mentor')} className={`p-4 rounded-2xl flex items-center gap-3 border-2 ${ isDarkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900' }`}>
      <div className="">
        <div className="w-10 h-10 text-yellow-500">
        <Gauge size={32} />
        </div>
      </div>
      <div>
      <h3 className={`font-medium text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      ورود به کوچینگ شخصی ( منتور )
      </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          ارتباط مستقیم با اساتید
          </p>
      </div>
    </div>

  </div>
</div>
        </div>
      </div>
     
     {/*--------------------------- */}
     {/* Social Media Boxes */}
<div className="px-8  mb- pb-28 ">
  <div className="grid grid-cols-3 gap-7">
   {/* Telegram */}
<div 
  onClick={() => window.open('https://t.me/persianCryptoSource', '_blank')}
  className={`p-1 rounded-xl flex flex-col items-center justify-center gap-2 shadow-sm border cursor-pointer ${isDarkMode ? 'border-gray-600 bg-transparent hover:bg-gray-800' : 'border-gray-300 bg-transparent hover:bg-gray-100'}`}
>
  <div className="w-7 h-7 flex items-center justify-center">
    <img src="/icons/telegram-icon.png" alt="Telegram" className="w-15 h-15" />
  </div>
</div>

    {/* Instagram */}
<div 
  onClick={() => window.open('https://www.instagram.com/persiancryptosource?igsh=OHBwcmRyNG56M3gy&utm_source=qr', '_blank')}
  className={`p-1 rounded-xl flex flex-col items-center justify-center gap-2 shadow-sm border cursor-pointer ${isDarkMode ? 'border-gray-600 bg-transparent hover:bg-gray-800' : 'border-gray-300 bg-transparent hover:bg-gray-100'}`}
>
  <div className="w-7 h-7 flex items-center justify-center">
    <img src="/icons/Instagram.png" alt="Instagram" className="w-15 h-15" />
  </div>
</div>

{/* TikTok */}
<div 
  onClick={() => window.open('https://www.tiktok.com/@asadmindset?_t=ZN-8vc9U7GoGYA&_r=1', '_blank')}
  className={`p-1 rounded-xl flex flex-col items-center justify-center gap-2 shadow-sm border cursor-pointer ${isDarkMode ? 'border-gray-600 bg-transparent hover:bg-gray-800' : 'border-gray-300 bg-transparent hover:bg-gray-100'}`}
>
  <div className="w-7 h-7 flex items-center justify-center">
    <img src="/icons/TikTok.png" alt="TikTok" className="w-15 h-15" />
  </div>
</div>

  
  </div>
</div>
     

     
{/* Bottom Navigation */}
<div className="fixed bottom-0 left-0 right-0">
  <div className="mx-4 mb-4">
    <div className={`flex items-center justify-between rounded-full px-6 shadow-lg
      ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`} style={{ paddingTop: '0px', paddingBottom: '0px' }}>
      <NavItem icon={<Home size={24} />} label="خانه" active={true} isDarkMode={isDarkMode}/>
<NavItem 
  icon={<MonitorPlay size={24} />} 
  label="پست ها" 
  active={false} 
  isDarkMode={isDarkMode}
  isLoggedIn={isLoggedIn}
  badgeCount={unreadPostsMessages}
  badgePosition="top-3"
/>

      <NavItem 
  icon={<img src="/center.png" width="48" height="48" alt="center" />} 
  label="آپدیت مارکت" 
  active={false} 
  isDarkMode={isDarkMode}
  isLoggedIn={isLoggedIn} // این خط را اضافه کنید 
  onLogout={onLogout} 
  badgeCount={unreadChannelPosts}
  badgePosition="top-3"
/>
      <NavItem 
        icon={isLoggedIn ? <UserCheck size={24} /> : <UserX size={24} />}  
        active={false} 
        label="پروفایل" 
        isDarkMode={isDarkMode} 
        isProfile={true}  
        isLoggedIn={isLoggedIn} 
        onLogout={onLogout}
      />     
      <NavItem 
        icon={<Headphones size={24} />} 
        label="پشتیبانی" 
        active={false} 
        isDarkMode={isDarkMode} 
        isLoggedIn={isLoggedIn} 
        badgeCount={unreadSupportMessages}
        badgePosition="top-0" // موقعیت بادج پشتیبانی - بالاتر از آپدیت مارکت
      />
    </div>
  </div>
</div>
{/* زیر هدر یا هر جای دیگری که مناسب است */}
<div className="fixed bottom-32 right-4 z-50">
 
</div>

      {isUIDLoading && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} flex flex-col items-center`}>
      <div className="w-12 h-12 border-4 border-t-transparent border-yellow-500 rounded-full animate-spin mb-4"></div>
      <p className={`text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`} dir='rtl'>
        در حال بررسی وضعیت...
      </p>
    </div>
  </div>
)}


       {/* اضافه کردن VIPPage */}
       {showVIPPage && (
        <VIPPage
          isDarkMode={isDarkMode}
          isOpen={showVIPPage}
          onClose={() => setShowVIPPage(false)}
        />
      )}

      {/* اضافه کردن ZeroTo100ServicePage */}
{showZeroTo100Page && (
  <ZeroTo100ServicePage
    isDarkMode={isDarkMode}
    isOpen={showZeroTo100Page}
    onClose={() => setShowZeroTo100Page(false)}
  />
)}


{/* ZeroTo100  */}
{showActualZeroTo100Page && (
  <ZeroTo100
    isDarkMode={isDarkMode}
    isOpen={showActualZeroTo100Page}
    onClose={() => setShowActualZeroTo100Page(false)}
  />
)}
      
      {/* اضافه کردن DexServicesPage */}
{showDexPage && (
  <DexServicesPage
    isDarkMode={isDarkMode}
    isOpen={showDexPage}
    onClose={() => setShowDexPage(false)}
    
  />
)}

{/* اضافه کردن SignalStreamServicePage */}
{showSignalStreamPage && (
  <SignalStreamServicePage
    isDarkMode={isDarkMode}
    isOpen={showSignalStreamPage}
    onClose={() => setShowSignalStreamPage(false)}
  />
)}

{/* TradeProPage */}
{showTradeProPage && (
  <TradeProPage
    isDarkMode={isDarkMode}
    isOpen={showTradeProPage}
    onClose={() => setShowTradeProPage(false)}
  />
)}



{/* PaymentCard */}
{showPaymentCard.show && (
        <PaymentCard
          isDarkMode={isDarkMode}
          onClose={() => setShowPaymentCard({ show: false, productTitle: '', price: '' })}
          productTitle={showPaymentCard.productTitle}
          price={showPaymentCard.price}
          months={1} // تعداد ماه رو می‌تونی بر اساس نیازت تغییر بدی
        />
      )}
    </div>
  );
};

const NavItem = ({ icon, label, active, isDarkMode, isProfile, onLogout, isLoggedIn, badgeCount, badgePosition = "top-3" }) => {
  const navigate = useNavigate();

const handleClick = () => {
  if (isProfile) {
    if (isLoggedIn) {
      navigate('/profile');
    } else {
      navigate('/login');
    }
  } else if (label === "آپدیت مارکت") {
    if (isLoggedIn) {
      navigate('/chanel-public');
    } else {
      navigate('/login');
    }
  } else if (label === "پست ها") {
    if (isLoggedIn) {
      navigate('/chanel-posts');
    } else {
      navigate('/login');
    }
  } else if (label === "محصولات") {
    navigate('/products');
  } else if (label === "سفارش‌ها") {
    if (isLoggedIn) {
      navigate('/orders');
    } else {
      navigate('/login');
    }
  } else if (label === "پشتیبانی") {
    if (isLoggedIn) {
      navigate('/support');
    } else {
      navigate('/login');
    }
  }
};
  
   return (
    <button 
      onClick={handleClick} 
      className="flex flex-col items-center p-2 relative"
    >
      <div className={active ? "text-yellow-500" : isDarkMode ? "text-gray-400" : "text-gray-500"}>
        {icon}
        {badgeCount > 0 && (
          <div className={`absolute ${badgePosition} -right-1 w-5 h-5 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full animate__animated animate__heartBeat animate__infinite`}>
            {badgeCount > 9 ? '9+' : badgeCount}
          </div>
        )}
      </div>

      <span className={`text-xs mt-1 ${active ? "text-yellow-500" : isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
        {label}
      </span>
    </button>
  );
};

export default CourseApp;
