// src/tradepro.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftCircle, X } from 'lucide-react';
import VideoPlayer from './components/VideoPlayer';

const PlayButton = ({ isActive }) => (
  <svg 
    width="32" height="32" viewBox="0 0 32 32" 
    fill="none" xmlns="http://www.w3.org/2000/svg" 
    className="cursor-pointer transition-colors"
  >
    <circle cx="16" cy="16" r="15" 
      stroke={isActive ? "#F7D55D" : "#4B5563"} strokeWidth="2"/>
    <path 
      d="M20.5 15.134C21.1667 15.5189 21.1667 16.4811 20.5 16.866L14.5 20.3301C13.8333 20.715 13 20.2339 13 19.4641L13 12.5359C13 11.7661 13.8333 11.285 14.5 11.6699L20.5 15.134Z" 
      fill={isActive ? "#F7D55D" : "#4B5563"}
    />
  </svg>
);

const episodes = [
  { 
    id: 0,
    title: "مقدمه و آشنایی با دوره ترید حرفه‌ای", 
    duration: "15 دقیقه",
    videoUrl: "https://iamvakilet.ir/learn/tradepro-intro.mp4"
  },
  { 
    id: 1, 
    title: "تحلیل تکنیکال پیشرفته - بخش اول", 
    duration: "45 دقیقه",
    videoUrl: "https://iamvakilet.ir/learn/technical-1.mp4"
  },
  { 
    id: 2, 
    title: "تحلیل تکنیکال پیشرفته - بخش دوم", 
    duration: "38 دقیقه",
    videoUrl: "https://iamvakilet.ir/learn/technical-2.mp4"
  },
  { 
    id: 3, 
    title: "تشخیص نقاط ورود و خروج", 
    duration: "52 دقیقه",
    videoUrl: "https://iamvakilet.ir/learn/technical-3.mp4"
  },
  { 
    id: 4, 
    title: "مدیریت ریسک حرفه‌ای - محاسبه حجم پوزیشن", 
    duration: "33 دقیقه",
    videoUrl: "https://iamvakilet.ir/learn/risk-1.mp4"
  },
  { 
    id: 5, 
    title: "مدیریت ریسک حرفه‌ای - تکنیک‌های پیشرفته حد ضرر و حد سود", 
    duration: "42 دقیقه",
    videoUrl: "https://iamvakilet.ir/learn/risk-2.mp4"
  },
  { 
    id: 6, 
    title: "روانشناسی معاملات - کنترل احساسات", 
    duration: "36 دقیقه",
    videoUrl: "https://iamvakilet.ir/learn/psych-1.mp4"
  },
  { 
    id: 7, 
    title: "روانشناسی معاملات - ذهنیت برنده و تکنیک‌های حفظ تمرکز", 
    duration: "41 دقیقه",
    videoUrl: "https://iamvakilet.ir/learn/psych-2.mp4"
  },
  { 
    id: 8, 
    title: "استراتژی‌های معاملاتی - اسکالپینگ و دی‌تریدینگ", 
    duration: "39 دقیقه",
    videoUrl: "https://iamvakilet.ir/learn/strat-1.mp4"
  },
  { 
    id: 9, 
    title: "استراتژی‌های معاملاتی - سوینگ تریدینگ", 
    duration: "47 دقیقه",
    videoUrl: "https://iamvakilet.ir/learn/strat-2.mp4"
  },
  { 
    id: 10, 
    title: "استراتژی‌های معاملاتی - استراتژی‌های اختصاصی ارزهای دیجیتال", 
    duration: "58 دقیقه",
    videoUrl: "https://iamvakilet.ir/learn/strat-3.mp4"
  }
];

const TradeProCoursePage = ({ isDarkMode, isOpen, onClose }) => {
  const navigate = useNavigate();
  const [activeEpisode, setActiveEpisode] = useState(null);
  const [showVideo, setShowVideo] = useState(false);
  
  // انیمیشن
  const [showTradePage, setShowTradePage] = useState(false);
  const [tradePageExiting, setTradePageExiting] = useState(false);
  
  // state های کانتداون
  const [showCountdownOverlay, setShowCountdownOverlay] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(204);
  const [days, setDays] = useState(15);
  const [hours, setHours] = useState(10);
  const [minutes, setMinutes] = useState(24);
  const [seconds, setSeconds] = useState(59);
  const [countdownEnded, setCountdownEnded] = useState(false);

  // مدیریت دکمه بازگشت و انیمیشن
  useEffect(() => {
    const handleBackButton = (event) => {
      event.preventDefault();
      closeTradeProPage();
    };

    // اگر صفحه باز است، یک state به تاریخچه اضافه کنیم
    if (isOpen) {
      window.history.pushState({ tradeProCoursePage: true }, '');
      
      // انیمیشن ورود
      setTimeout(() => {
        setShowTradePage(true);
      }, 100);
    }
    
    // شنونده برای رویداد popstate (فشردن دکمه برگشت)
    window.addEventListener('popstate', handleBackButton);
    
    // پاکسازی event listener
    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [isOpen]);

  // بستن صفحه
  const closeTradeProPage = useCallback(() => {
    setTradePageExiting(true);
    setTimeout(() => {
      setShowTradePage(false);
      setTradePageExiting(false);
      onClose ? onClose() : navigate(-1);
    }, 300);
  }, [onClose, navigate]);

  const handleEpisodeClick = (episode) => {
    setActiveEpisode(episode);
    setShowVideo(true);
  };

  const handleCloseVideo = () => {
    setShowVideo(false);
    setActiveEpisode(null);
  };
  
  // اضافه کردن CSS برای کانتداون
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .countdown {
        line-height: 1;
        display: inline-flex;
      }
      .countdown > * {
        height: 1em;
        overflow-y: hidden;
      }
      .countdown > *:before {
        content: "00\\A 01\\A 02\\A 03\\A 04\\A 05\\A 06\\A 07\\A 08\\A 09\\A 10\\A 11\\A 12\\A 13\\A 14\\A 15\\A 16\\A 17\\A 18\\A 19\\A 20\\A 21\\A 22\\A 23\\A 24\\A 25\\A 26\\A 27\\A 28\\A 29\\A 30\\A 31\\A 32\\A 33\\A 34\\A 35\\A 36\\A 37\\A 38\\A 39\\A 40\\A 41\\A 42\\A 43\\A 44\\A 45\\A 46\\A 47\\A 48\\A 49\\A 50\\A 51\\A 52\\A 53\\A 54\\A 55\\A 56\\A 57\\A 58\\A 59\\A 60\\A 61\\A 62\\A 63\\A 64\\A 65\\A 66\\A 67\\A 68\\A 69\\A 70\\A 71\\A 72\\A 73\\A 74\\A 75\\A 76\\A 77\\A 78\\A 79\\A 80\\A 81\\A 82\\A 83\\A 84\\A 85\\A 86\\A 87\\A 88\\A 89\\A 90\\A 91\\A 92\\A 93\\A 94\\A 95\\A 96\\A 97\\A 98\\A 99\\A";
        white-space: pre;
        position: relative;
        top: calc(var(--value) * -1em);
        text-align: center;
        transition: top 1s cubic-bezier(1, 0, 0, 1);
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // اضافه کردن useEffect برای کانتر داون
  useEffect(() => {
    // تابع کمکی برای دریافت زمان اروپا (CET/CEST)
    const getEuropeTime = () => {
      const options = { timeZone: 'Europe/Paris' };
      const europeDateString = new Date().toLocaleString('en-US', options);
      return new Date(europeDateString);
    };
    
    // تاریخ پایان تخفیف: 1 آگوست 2025 در منطقه زمانی اروپا
    const targetDate = new Date(Date.UTC(2025, 7, 1, 23, 59, 59)); // ماه‌ها از 0 شروع می‌شوند، پس 7 = آگوست
    const startDate = new Date(Date.UTC(2025, 4, 15, 0, 0, 0));    // 15 مه 2025، 4 = مه
    
    // محاسبه قیمت اولیه بر اساس زمان اروپا
    const now = getEuropeTime();
    const daysPassed = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
    const initialPrice = 360 + (daysPassed * 5); // افزایش 5 دلار برای هر روز گذشته
    setCurrentPrice(initialPrice);
    
    const interval = setInterval(() => {
      const now = getEuropeTime();
      const difference = targetDate.getTime() - now.getTime();
      
      // محاسبه مجدد قیمت هر روز - فقط زمانی که روز تغییر کند
      const newDaysPassed = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
      if (newDaysPassed !== daysPassed) {
        const newPrice = 360 + (newDaysPassed * 5);
        setCurrentPrice(newPrice);
      }
      
      if (difference <= 0) {
        // زمان به پایان رسیده
        setDays(0);
        setHours(0);
        setMinutes(0);
        setSeconds(0);
        setCountdownEnded(true);
        setShowCountdownOverlay(false);
        clearInterval(interval);
      } else {
        // محاسبه زمان باقیمانده
        const d = Math.floor(difference / (1000 * 60 * 60 * 24));
        const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((difference % (1000 * 60)) / 1000);
        
        setDays(d);
        setHours(h);
        setMinutes(m);
        setSeconds(s);
      }
    }, 1000);
    
    // پاکسازی interval در زمان unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/40 overflow-hidden transition-opacity duration-300"
      style={{ 
        opacity: tradePageExiting ? 0 : (showTradePage ? 1 : 0),
        pointerEvents: showTradePage ? 'auto' : 'none',
        transition: 'opacity 0.3s ease-out'
      }}
    >
      <div 
        className={`fixed inset-0 w-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} shadow-lg transition-transform duration-300 ease-out`}
        style={{ 
          transform: tradePageExiting 
            ? 'translateX(100%)' 
            : `translateX(${showTradePage ? '0' : '100%'})`,
          transition: 'transform 0.3s cubic-bezier(0.17, 0.67, 0.24, 0.99), opacity 0.3s ease-out'
        }}
        dir="rtl"
      >
        <div className="absolute top-0 left-0 right-0 z-30">
          <div className="relative h-16 flex items-center px-4">
            {!showVideo && (
              <>
                <button 
                  onClick={closeTradeProPage}
                  className={`absolute left-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}
                >
                  <ArrowLeftCircle className="w-8 h-8" />
                </button>
                <h1 className={`w-full text-center text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                  آموزش ترید حرفه‌ای
                </h1>
              </>
            )}
          </div>
        </div>

        {showVideo && activeEpisode && (
          <div className="absolute top-16 left-0 right-0 z-20">
            <VideoPlayer
              videoUrl={activeEpisode.videoUrl}
              title={activeEpisode.title}
              isDarkMode={isDarkMode}
              onClose={handleCloseVideo}
            />
          </div>
        )}

        <div className={`absolute ${showVideo ? 'top-[calc(4rem+56.25vw)]' : 'top-16'} bottom-0 left-0 right-0 overflow-y-auto`}>
          <div className="p-4 pb-4">
            <div className="space-y-3">
              {episodes.map((episode) => (
                <div
                  key={episode.id}
                  onClick={() => handleEpisodeClick(episode)}
                  className={`p-4 rounded-xl border ${
                    isDarkMode 
                      ? 'bg-gray-900 border-gray-700 text-white' 
                      : 'bg-white border-gray-200 text-gray-900'
                  } cursor-pointer`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center justify-center">
                      <PlayButton isActive={activeEpisode?.id === episode.id} />
                    </div>
                    <div className="flex-1 mr-4">
                      <h3 className="font-medium whitespace-pre-line text-right">
                        <bdi>{episode.title}</bdi>
                      </h3>
                      <p className={`text-sm mt-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {episode.duration}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Overlay کانتداون */}
        {showCountdownOverlay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
            <div className="relative p-6 max-w-md w-full mx-4">
         {/* دکمه بستن دایره‌ای با استروک سفید و پس‌زمینه مشکی */}
<button 
  onClick={() => {
    closeTradeProPage(); // بستن کامل صفحه و برگشت به صفحه اصلی
  }}
  className="absolute top-2 right-2 w-8 h-8 bg-black border-2 border-white rounded-full flex items-center justify-center text-white hover:bg-gray-900 transition-colors z-10"
>
  <X size={20} strokeWidth={2.5} />
</button>
              
              {/* Countdown Timer Card */}
              <div className="bg-[#141e35] rounded-xl relative overflow-hidden border border-gray-500 p-4">
                {/* Gradient background */}
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] to-[#141e35]"></div>
                </div>
                
                {/* Content */} 
                <div className="relative z-10 flex flex-col items-center justify-center text-white text-center">
                  <div className="text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300 drop-shadow-[0_0_20px_rgba(234,179,8,0.7)]" style={{ fontFamily: "'Segoe UI', 'Helvetica Neue', 'Arial', sans-serif" }}>
                    {days} 
                  </div>
<span className="text-3xl font-extrabold">روز دیگر </span>
                  {countdownEnded ? (
                    <p className="text-yellow-500 font-bold text-lg">مهلت تخفیف به پایان رسیده است</p>
                  ) : (
                    <>
                   <div className="grid grid-flow-col gap-3 text-center auto-cols-max mb-4 w-full justify-center">
  <div className="flex flex-col p-2 bg-black/40 rounded-lg text-white">
    <span className="countdown font-mono text-3xl">
      <span style={{"--value": seconds}} />
    </span>
    <span className="text-xs mt-1">ثانیه</span>
  </div>
  <div className="flex flex-col p-2 bg-black/40 rounded-lg text-white">
    <span className="countdown font-mono text-3xl">
      <span style={{"--value": minutes}} />
    </span>
    <span className="text-xs mt-1">دقیقه</span>
  </div>
  <div className="flex flex-col p-2 bg-black/40 rounded-lg text-white">
    <span className="countdown font-mono text-3xl">
      <span style={{"--value": hours}} />
    </span>
    <span className="text-xs mt-1">ساعت</span>
  </div>
  <div className="flex flex-col p-2 bg-black/40 rounded-lg text-white">
    <span className="countdown font-mono text-3xl">
      <span style={{"--value": days}} />
    </span>
    <span className="text-xs mt-1">روز</span>
  </div>
</div>
                      
                      <p className="text-sm bg-red-500/90 text-white font-bold px-4 py-2 rounded-lg mb-2">
                        این سرویس در تاریخ<span className="text-2xl font-extrabold"> 1 August</span> برای شما در دسترس خواهد بود
                      </p>
                      
                  
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeProCoursePage;