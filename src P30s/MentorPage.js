import React, { useState, useRef, useEffect } from 'react';
import { X, Gauge } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MentorRegistrationCard from './MentorRegistrationCard'; // مسیر را اگر فرق دارد اصلاح کن


const MentorPage = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const [showCard, setShowCard] = useState(false);
  const cardRef = useRef(null);
  const touchStartY = useRef(0);
  const [showRegisterCard, setShowRegisterCard] = useState(false);


  // انیمیشن نمایش کارت
  useEffect(() => {
    setTimeout(() => {
      setShowCard(true);
    }, 100);
  }, []);

  // بستن کارت با انیمیشن
  const closeCard = () => {
    setShowCard(false);
    setTimeout(() => {
      navigate(-1);
    }, 300);
  };

  // اضافه کردن رویداد کشیدن به کل کارت
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    // شروع کشیدن
    const handleTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY;
    };

    // بررسی کشیدن به پایین
    const handleTouchMove = (e) => {
      const currentY = e.touches[0].clientY;
      const diffY = currentY - touchStartY.current;
      
      // کشیدن به سمت پایین
      if (diffY > 0) {
        // باید بررسی کنیم که آیا در ناحیه اسکرول هستیم
        const content = document.querySelector('.scrollable-content');
        
        // اگر در منطقه هدر هستیم، یا در بالای محتوا هستیم
        if (!content || !e.target.closest('.scrollable-content') || content.scrollTop <= 5) {
          e.preventDefault();
          card.style.transform = `translateY(${diffY}px)`;
        }
      }
    };

    // پایان کشیدن و تصمیم‌گیری
    const handleTouchEnd = (e) => {
      const currentTransform = card.style.transform;
      const match = currentTransform.match(/translateY\(([0-9.]+)px\)/);
      
      if (match) {
        const translateY = parseFloat(match[1]);
        // اگر به اندازه کافی کشیده شده، کارت را ببندیم
        if (translateY > 80) {
          closeCard();
        } else {
          // برگشت به حالت اولیه
          card.style.transform = 'translateY(0)';
        }
      }
    };

    // اضافه کردن رویدادها
    card.addEventListener('touchstart', handleTouchStart);
    card.addEventListener('touchmove', handleTouchMove, { passive: false });
    card.addEventListener('touchend', handleTouchEnd);

    return () => {
      card.removeEventListener('touchstart', handleTouchStart);
      card.removeEventListener('touchmove', handleTouchMove);
      card.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/75 overflow-hidden transition-opacity duration-300"
      style={{ 
        opacity: showCard ? 1 : 0,
        pointerEvents: showCard ? 'auto' : 'none'
      }}
      onClick={closeCard}
    >
      <div 
        ref={cardRef}
        className={`fixed bottom-0 left-0 right-0 w-full ${
          isDarkMode ? 'bg-[#0d1822]' : 'bg-white'
        } rounded-t-3xl shadow-lg transition-transform duration-300 ease-out max-h-[92vh] overflow-hidden`}
        style={{ 
          transform: `translateY(${showCard ? '0' : '100%'})`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* هدر ثابت */}
        <div className="relative header-area">
          {/* ناحیه دستگیره - مخصوص کشیدن */}
          <div className="h-10 flex items-center justify-center handle-area">
            <div className="w-24 h-1 bg-gray-300 rounded-full" />
          </div>

          {/* دکمه بستن */}
          <button 
            onClick={closeCard}
            className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
          >
            <X size={20} className="text-gray-600" />
          </button>

          {/* قسمت ثابت هدر */}
          <div className="px-6 pt-2">
            <div className="mb-4 text-center">
              <div className="w-16 h-16 bg-[#f7d55d] rounded-full mx-auto mb-4 flex items-center justify-center">
                <Gauge className="w-8 h-8 text-white" />
              </div>
              <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              کوچینگ شخصی (منتور)
              </h1>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              همراهی قدم‌به‌قدم با اساتید  برای شکار موقعیت‌های خاص و رشد واقعی سرمایه
              </p>

              <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              مناسب افرادی با سرمایه بالای ۲۰،۰۰۰ دلار
              با مدیریت سرمایه اختصاصی، برنامه‌ریزی حرفه‌ای و مشاوره مستقیم از اساتید
              </p>
            </div>
          </div>
          
          {/* گرادینت متقابل در پایین هدر ثابت برای نرم کردن انتقال */}
          <div className="absolute bottom-[-44px] left-0 right-0 pointer-events-none z-[5]" style={{
            height: '30px',
            background: isDarkMode 
              ? 'linear-gradient(to bottom, rgba(13,24,34,1), rgba(13,24,34,0))' 
              : 'linear-gradient(to bottom, rgba(255,255,255,1), rgba(255,255,255,0))'
          }}></div>
        </div>

        {/* محتوای قابل اسکرول */}
        <div className="overflow-y-auto h-[calc(92vh-200px)] pb-40 scrollable-content">
          <div className="px-6">
            {/* محتوای اصلی */}
            <div className="space-y-4 text-right" dir="rtl">
            <div className={`p-4 rounded-xl mt-6 ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
                <h2 className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                نحوه همکاری در منتور
                </h2>
                <p className={`mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>در مسیر منتور، شما تنها نیستید. ما کنارتان هستیم تا در زمان درست، با ریسک کنترل‌ شده، وارد موقعیت‌های پامپی و کم‌یاب بازار شوید.
                  <br />
ورود و خروج دقیق، استراتژی شخصی‌سازی‌ شده و مدیریت کامل سرمایه توسط اساتید انجام می شود
<br/>
نیاز به دانش تخصصی ندارید – ما فرصت‌ها رو پیدا می‌کنیم، شما فقط وارد معامله می شوید.
<br/>
پرداخت اولیه برای دو سال پشتیبانی و درصدی از سود معاملات موفق دریافت می شود.
</p>
              </div>

              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
                <h2 className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                افتخار ما در منتور
                </h2>
                <ul className={`space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#f7d55d]" />
                    <span>صدها عضو فعال در ۳ سال گذشته</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#f7d55d]" />
                    <span>۶۳ موقعیت سودده بدون ضرر بسته‌شده (فقط معاملات اسپات ،برای دیدن بعضی از معاملات منتور هایلایت نتایج پامپی را مشاهده کنید)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#f7d55d]" />
                    <span>مجموع بازدهی موقعیت‌ها بالای ۴۰۰۰٪</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#f7d55d]" />
                    <span>همراه همیشگی در نوسانات مارکت و حفظ سرمایه از ضررهای بزرگ</span>
                  </li>
                </ul>
                <p className={`space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>منتور مخصوص افرادی هست که به‌ دنبال سود منطقی، مدیریت حرفه‌ای  امنیت سرمایه  و آرامش در سرمایه‌گذاری هستن.
                </p>
                <p className={`space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>نکته : سرمایه شما نزد خود شما است . ما فقط برای شما سرمایه گذاری درست و موفق میکنیم چون از سود شما ما سود و هزینه خود را دریافت میکنیم.
                </p>
              </div>
    
            </div>
          </div>
        </div>
        
        {/* دکمه ثابت در پایین */}
        <div className="absolute bottom-6 left-4 right-4 z-10">
        <button
  onClick={() => setShowRegisterCard(true)}
  className="w-full bg-[#f7d55d] text-gray-900 rounded-xl py-3 text-sm font-bold hover:bg-[#e5c44c] transition-colors shadow-lg"
>
  ثبت نام در کوچینگ شخصی
</button>

        </div>
        
        {showRegisterCard && (
  <MentorRegistrationCard 
    isDarkMode={isDarkMode} 
    onClose={() => setShowRegisterCard(false)} 
  />
)}

        {/* گرادینت مشکی به شفاف از پایین به بالا */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none z-[5]" style={{
          height: '90px',
          background: isDarkMode 
            ? 'linear-gradient(to top, rgba(13,24,34,1), rgba(13,24,34,0))' 
            : 'linear-gradient(to top, rgba(255,255,255,1), rgba(255,255,255,0))'
        }}></div>
      </div>
    </div>
  );
};

export default MentorPage;