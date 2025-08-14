import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { Store } from 'react-notifications-component';
import { useNavigate } from 'react-router-dom';

const MentorRegistrationCard = ({ isDarkMode, onClose = () => {} }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    capital: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const cardRef = useRef(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const navigate = useNavigate();

  const notify = (title, message, type = 'danger') => {
    Store.addNotification({
      title,
      message,
      type,
      insert: "top",
      container: "center",
      animationIn: ["animate__animated", "animate__flipInX"],
      animationOut: ["animate__animated", "animate__flipOutX"],
      dismiss: { duration: 3000, showIcon: true, pauseOnHover: true },
      style: { direction: 'rtl', textAlign: 'right', zIndex: 99999 },
    });
  };

  useEffect(() => {
    setTimeout(() => setShowCard(true), 100);
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    // برای تشخیص اینکه آیا قصد کشیدن داریم یا اسکرول عادی
    let isSwiping = false;
    let initialTouchY = 0;
    let initialScrollTop = 0;
    let touchStartTime = 0;

    const handleTouchStart = (e) => {
      const scrollableContent = e.target.closest('.scrollable-content');
      initialTouchY = e.touches[0].clientY;
      touchStartTime = Date.now();
      
      // فقط در ناحیه هدر یا وقتی اسکرول کاملاً در بالاست، امکان بستن با کشیدن را فعال می‌کنیم
      if (e.target.closest('.handle-area') || 
         (scrollableContent && scrollableContent.scrollTop === 0)) {
        isSwiping = true;
        isDragging.current = false;
        
        if (scrollableContent) {
          initialScrollTop = scrollableContent.scrollTop;
        }
      }
    };

    const handleTouchMove = (e) => {
      const currentY = e.touches[0].clientY;
      const diffY = currentY - initialTouchY;
      
      // اگر در حالت اسکرول عادی هستیم، اجازه دهید آن رفتار پیش‌فرض را ادامه دهد
      if (!isSwiping) return;
      
      // اگر کشیدن به سمت پایین است و در ناحیه هدر هستیم یا در بالای محتوا
      if (diffY > 5 && (e.target.closest('.handle-area') || initialScrollTop === 0)) {
        isDragging.current = true;
        e.preventDefault();
        card.style.transform = 'translateY(' + diffY + 'px)';
      } else if (diffY < -5) {
        // اگر به سمت بالا می‌کشیم، حالت کشیدن را غیرفعال می‌کنیم تا اسکرول عادی شود
        isSwiping = false;
        isDragging.current = false;
        card.style.transform = 'translateY(0)';
      }
    };

    const handleTouchEnd = (e) => {
      const touchEndTime = Date.now();
      const touchDuration = touchEndTime - touchStartTime;
      
      // اگر در حالت کشیدن بودیم
      if (isDragging.current) {
        isDragging.current = false;
        
        const match = card.style.transform.match(/translateY\(([0-9.]+)px\)/);
        const currentValue = match ? parseFloat(match[1]) : 0;
        
        // اگر به اندازه کافی کشیده شده یا با سرعت زیاد کشیده شده
        const isQuickSwipe = touchDuration < 300 && currentValue > 80;
        
        if (currentValue > 150 || isQuickSwipe) {
          closeCard();
        } else {
          // برگشت به حالت اولیه
          card.style.transform = 'translateY(0)';
        }
      }
      
      // بازنشانی متغیرها
      isSwiping = false;
    };

    card.addEventListener('touchstart', handleTouchStart, { passive: true });
    card.addEventListener('touchmove', handleTouchMove, { passive: false });
    card.addEventListener('touchend', handleTouchEnd);

    return () => {
      card.removeEventListener('touchstart', handleTouchStart);
      card.removeEventListener('touchmove', handleTouchMove);
      card.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const closeCard = () => {
    setShowCard(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhoneNumber = (phone) => phone.replace(/\D/g, '').length >= 10 && phone.replace(/\D/g, '').length <= 13;

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'capital') {
      // Remove any non-digit characters first
      const numericValue = value.replace(/[^0-9]/g, '');
      
      // Format with thousand separators
      const formattedValue = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else if (name === 'phoneNumber') {
      // Just keep digits for phone number
      setFormData(prev => ({
        ...prev,
        [name]: value.replace(/[^0-9]/g, '')
      }));
    } else {
      // For other fields (fullName, email), keep as is
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async () => {
    const { fullName, email, phoneNumber, capital } = formData;
    if (!fullName || !email || !capital) {
      notify("خطا", "لطفا تمام فیلدها را پر کنید");
      return;
    }
    if (!validateEmail(email)) {
      notify("خطا", "ایمیل وارد شده معتبر نیست");
      return;
    }
    // if (!validatePhoneNumber(phoneNumber)) {
    //   notify("خطا", "شماره تماس معتبر نیست");
    //   return;
    // }

    setIsSubmitting(true);
    try {
      const auth = btoa('ck_20b3c33ef902d4ccd94fc1230c940a85be290e0a:cs_e8a85df738324996fd3608154ab5bf0ccc6ded99');
      
      // Remove commas for submission
      const capitalValue = capital.replace(/,/g, '');
      
      const payload = {
        title: 'درخواست منتور - ' + fullName,
        status: 'publish',
        content: 'نام: ' + fullName + ' \nایمیل: ' + email + ' \nتلفن: ' + phoneNumber + ' \nسرمایه: ' + capitalValue,
        meta: {
          mentor_fullname: fullName,
          mentor_email: email,
          mentor_phone: phoneNumber,
          mentor_capital: capitalValue
        }
      };

      const response = await fetch('https://p30s.com/wp-json/wp/v2/mentor_requests', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + auth,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        notify("موفق", "درخواست با موفقیت ثبت شد", "success");
        setTimeout(closeCard, 2000);
      } else {
        notify("خطا", "مشکلی در ثبت درخواست به وجود آمد");
      }
    } catch (err) {
     // console.error(err);
      notify("خطا", "خطا در ارتباط با سرور");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 overflow-hidden transition-opacity duration-300"
         style={{ opacity: showCard ? 1 : 0, pointerEvents: showCard ? 'auto' : 'none' }}>
      <div 
        ref={cardRef}
        className={'fixed bottom-0 left-0 right-0 w-full ' + 
          (isDarkMode ? 'bg-[#0d1822]' : 'bg-white') + 
          ' rounded-t-3xl shadow-lg transition-transform duration-300 ease-out max-h-[92vh] overflow-hidden'}
        style={{ transform: 'translateY(' + (showCard ? '0' : '100%') + ')' }}
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
            <div className="text-center">
              {/* آیکون دایره‌ای بالای کارت */}
              <div className="w-16 h-16 bg-[#f7d55d] rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>

              <h1 className={'text-2xl font-bold mb-2 ' + (isDarkMode ? 'text-white' : 'text-gray-900')}>
                ثبت درخواست منتور
              </h1>
              <p className={'text-sm mb-2 ' + (isDarkMode ? 'text-gray-400' : 'text-gray-500')}>
                لطفاً اطلاعات خود را وارد کنید
              </p>
            </div>
          </div>
          
          {/* گرادینت متقابل در پایین هدر ثابت برای نرم کردن انتقال */}
          <div className="absolute bottom-[-20px] left-0 right-0 pointer-events-none z-[5]" style={{
            height: '20px',
            background: isDarkMode 
              ? 'linear-gradient(to bottom, rgba(13,24,34,1), rgba(13,24,34,0))' 
              : 'linear-gradient(to bottom, rgba(255,255,255,1), rgba(255,255,255,0))'
          }}></div>
        </div>

        {/* محتوای قابل اسکرول */}
        <div className="scrollable-content overflow-y-auto max-h-[calc(92vh-200px)] pb-32" dir="rtl">
          <div className="px-6 pt-5">
            {/* فرم ورودی */}
            {[
              { name: 'fullName', placeholder: 'نام و نام خانوادگی', type: 'text', inputMode: 'text' },
              { name: 'email', placeholder: 'ایمیل در دسترس', type: 'email', inputMode: 'email' },
              { name: 'phoneNumber', placeholder: 'شماره تماس', type: 'tel', inputMode: 'numeric', pattern: '[0-9]*' },
              { name: 'capital', placeholder: 'میزان سرمایه (دلار)', type: 'tel', inputMode: 'numeric', pattern: '[0-9]*' }
            ].map((field) => (
              <div key={field.name} className="mb-4">
                <input
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  type={field.type}
                  inputMode={field.inputMode}
                  pattern={field.pattern || null}
                  className={'w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f7d55d] ' +
                    (isDarkMode ? 'bg-gray-800 text-white placeholder-gray-500 border-gray-700' : 'bg-gray-100 text-gray-900 placeholder-gray-500')
                  }
                  placeholder={field.placeholder}
                  dir="rtl"
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* دکمه ثبت ثابت در پایین */}
        <div className="absolute bottom-6 left-4 right-4 z-10">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={'w-full bg-[#f7d55d] text-gray-900 rounded-xl py-3 text-sm font-medium transition-colors relative ' +
              (isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#e5c44c]')
            }
          >
            {isSubmitting ? (
              <>
                <span className="opacity-0">ثبت درخواست</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                </div>
              </>
            ) : 'ثبت درخواست'}
          </button>
        </div>
        
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

export default MentorRegistrationCard;