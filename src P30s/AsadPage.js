import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftCircle, ChevronDown, ChevronUpCircle } from 'lucide-react';

const AsadPage = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const currentTranslate = useRef(50);
  const [isExpanded, setIsExpanded] = useState(false);

  const isAndroid = /Android/i.test(navigator.userAgent);
  const isIOS = CSS.supports("-webkit-touch-callout", "none");

  useEffect(() => {
    const card = cardRef.current;
    if (!card || isAndroid) return;

    const handleTouchStart = (e) => {
      if (e.target.closest('.scrollable-content') && 
          e.target.closest('.scrollable-content').scrollTop !== 0) {
        return;
      }
      isDragging.current = true;
      startY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      if (!isDragging.current) return;

      const currentY = e.touches[0].clientY;
      const diff = (currentY - startY.current) / window.innerHeight * 100;
      let newTranslate = currentTranslate.current + diff * 1.5;

      newTranslate = Math.max(0, Math.min(50, newTranslate));
      card.style.transform = `translateY(${newTranslate}vh)`;
    };

    const handleTouchEnd = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      const currentTransform = card.style.transform;
      const match = currentTransform.match(/translateY\(([0-9.]+)vh\)/);
      if (match) {
        const currentValue = parseFloat(match[1]);
        if (currentValue < 35) {
          card.style.transition = 'transform 0.3s cubic-bezier(0.17, 0.84, 0.44, 1)';
          card.style.transform = 'translateY(0vh)';
          currentTranslate.current = 0;
          setIsExpanded(true);
        } else {
          card.style.transition = 'transform 0.3s cubic-bezier(0.17, 0.84, 0.44, 1)';
          card.style.transform = 'translateY(50vh)';
          currentTranslate.current = 50;
          setIsExpanded(false);
        }
        setTimeout(() => {
          card.style.transition = 'transform 0.3s ease-out';
        }, 300);
      }
    };

    card.addEventListener('touchstart', handleTouchStart, { passive: false });
    card.addEventListener('touchmove', handleTouchMove, { passive: false });
    card.addEventListener('touchend', handleTouchEnd);

    return () => {
      card.removeEventListener('touchstart', handleTouchStart);
      card.removeEventListener('touchmove', handleTouchMove);
      card.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isAndroid]);

  const handleAndroidToggle = () => {
    const card = cardRef.current;
    if (!card) return;

    setIsExpanded(prev => !prev);
    card.style.transition = 'transform 0.3s cubic-bezier(0.17, 0.84, 0.44, 1)';
    
    if (!isExpanded) {
      card.style.transform = 'translateY(0vh)';
      currentTranslate.current = 0;
    } else {
      card.style.transform = 'translateY(50vh)';
      currentTranslate.current = 50;
    }
  };

  return (
    <div className={`fixed inset-0 select-none ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <button 
        onClick={() => navigate(-1)} 
        className="fixed top-4 left-4 z-10 flex items-center gap-1 rounded-full px-4 py-2"
      >
        <ArrowLeftCircle className="w-8 h-8" />
      </button>

      <div className="relative w-full h-full max-w-lg mx-auto">
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-500 to-yellow-200" />

        <div className="relative w-full h-[60vh]">
          <div className="w-full h-full flex justify-center items-center px-4 pt-24">
            <img 
              src="/0ta100.png"
              alt="0 to 100"
              className="w-4/5 max-w-sm h-auto object-contain"
            />
          </div>
        </div>

        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-11/12 max-w-lg mx-auto z-50">
          <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-xl transition-colors shadow-lg">
            خرید اشتراک
          </button>
        </div>

        <div className="absolute bottom-0 w-full overflow-hidden">
          <div 
            ref={cardRef}
            className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} 
              rounded-t-3xl shadow-lg h-[85vh] transform translate-y-[50vh] 
              transition-transform duration-300 ease-out`}
          >
            {isAndroid ? (
              <button
                onClick={handleAndroidToggle}
                className="w-full pt-4 pb-2 flex justify-center items-center"
              >
                {isExpanded ? (
                  <ChevronDown className="w-8 h-8 text-gray-400" />
                ) : (
                  <ChevronUpCircle className="w-8 h-8 text-gray-400" />
                )}
              </button>
            ) : (
              <div className="pt-2">
                <div className="w-24 h-1 bg-gray-400/20 rounded-full mx-auto" />
              </div>
            )}
            
            <div className="scrollable-content h-[calc(100%-3rem)] overflow-y-auto touch-pan-y">
              <div className="p-6 space-y-4 text-right pb-24">
                <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  آموزش ۰ تا ۱۰۰ کریپتو
                </h2>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
                  دسترسی به تمام محتوای آموزشی و تحلیل‌های اختصاصی
                </p>
                
                <div className="space-y-4">
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
                    محتوای آموزشی شامل:
                  </p>
                  <ul className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} 
                    text-sm list-disc space-y-2 text-right [direction:rtl] pr-4`}>
                    <li>مبانی ارزهای دیجیتال</li>
                    <li>نحوه تحلیل بازار</li>
                    <li>استراتژی‌های معاملاتی</li>
                    <li>مدیریت سرمایه</li>
                    <li>تحلیل‌های تکنیکال و فاندامنتال</li>
                    <li>روش‌های مختلف ترید و معامله</li>
                    <li>امنیت و نگهداری ارزهای دیجیتال</li>
                    <li>شناخت انواع کیف پول‌ها</li>
                    <li>آشنایی با صرافی‌های معتبر</li>
                    <li>مدیریت ریسک در معاملات</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AsadPage;