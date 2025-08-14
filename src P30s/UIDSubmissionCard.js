import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { Store } from 'react-notifications-component';

const notify = (title, message, type = 'danger', duration = 7000) => {
  Store.addNotification({
    title,
    message,
    type,
    insert: "top",
    container: "center",
    animationIn: ["animate__animated", "animate__flipInX"],
    animationOut: ["animate__animated", "animate__flipOutX"],
    dismiss: {
      duration,
      showIcon: true,
      pauseOnHover: true,
    },
    style: { direction: 'rtl', textAlign: 'right' },
  });
};

const UIDSubmissionCard = ({ isDarkMode, onClose, productTitle }) => {
  const [uid, setUID] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [showCard, setShowCard] = useState(false);
  const cardRef = useRef(null);
  const isDragging = useRef(false);
  const startY = useRef(0);

  // انیمیشن ورود کارت
  useEffect(() => {
    setTimeout(() => {
      setShowCard(true);
    }, 100);
  }, []);

  // مدیریت دکمه برگشت اندروید
  useEffect(() => {
    const handleBackButton = () => {
      closeCard();
    };
    
    // اگر این event listener قبلاً در کامپوننت والد اضافه شده،
    // نیازی به افزودن state جدید به history نیست
    
    // گوش دادن به رویداد back button
    window.addEventListener('popstate', handleBackButton);
    
    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, []);

  // مدیریت تعامل کاربر با کارت (امکان کشیدن به پایین)
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

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
      const diff = currentY - startY.current;
      if (diff < 0) return;
      e.preventDefault();
      card.style.transform = `translateY(${diff}px)`;
    };

    const handleTouchEnd = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      const currentTransform = card.style.transform;
      const match = currentTransform.match(/translateY\(([0-9.]+)px\)/);
      if (match) {
        const currentValue = parseFloat(match[1]);
        if (currentValue > 150) {
          closeCard();
        } else {
          card.style.transform = 'translateY(0)';
        }
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
  }, []);

  const closeCard = () => {
    setShowCard(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  const handleSubmit = async () => {
    if (!uid) {
      notify("خطا", "لطفا کد UID را وارد کنید", "danger");
      return;
    }

    setIsSubmitting(true);

    try {
      // دریافت توکن از localStorage یا sessionStorage
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      
      if (!token) {
        notify("خطا", "لطفا ابتدا وارد حساب کاربری شوید", "danger");
        setIsSubmitting(false);
        return;
      }

      // ارسال درخواست به سرور
      const response = await fetch('https://p30s.com/wp-json/lbank/v1/submit-uid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          uid: uid
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmissionStatus('success');
        notify("موفق", "درخواست UID شما با موفقیت ثبت شد و در انتظار بررسی است", "success", 3000);
        
        // بستن با تاخیر بعد از موفقیت
        setTimeout(() => {
          closeCard();
        }, 2000);
      } else {
        setSubmissionStatus('error');
        notify("خطا", result.message || "خطا در ثبت UID. لطفا مجددا تلاش کنید", "danger");
      }
    } catch (error) {
      //console.error('Error submitting UID:', error);
      setSubmissionStatus('error');
      notify("خطا", "خطا در برقراری ارتباط با سرور", "danger");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStatusMessage = () => {
    if (submissionStatus === 'success') {
      return (
        <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg">
          <p className="text-center">درخواست UID شما با موفقیت ثبت شد و در انتظار بررسی است. تا ۲۴ ساعت آینده در قسمت پشتیبانی به شما اطلاع داده خواهد شد.</p>
          <p className="text-center text-sm mt-1">پس از تایید، دسترسی به کانال سیگنال برای شما فعال خواهد شد.</p>
        </div>
      );
    } else if (submissionStatus === 'error') {
      return (
        <div dir="rtl" className="mt-4 p-3 bg-red-100 text-red-800 rounded-lg">
          <p className="text-center">خطایی در ثبت UID رخ داد. لطفا مجددا تلاش کنید.</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-black/75 overflow-hidden transition-opacity duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeCard();
        }
      }}
      style={{ 
        opacity: showCard ? 1 : 0,
        pointerEvents: showCard ? 'auto' : 'none'
      }}
    >
      <div 
        ref={cardRef}
        className={`fixed bottom-0 left-0 right-0 w-full ${
          isDarkMode ? 'bg-[#0d1822]' : 'bg-white'
        } rounded-t-3xl shadow-lg transition-transform duration-300 ease-out max-h-[92vh] overflow-hidden`}
        style={{ 
          transform: `translateY(${showCard ? '0' : '100%'})`,
          touchAction: 'none',
        }}
      >
        {/* Handle Bar */}
        <div className="pt-2">
          <div className="w-24 h-1 bg-gray-300 rounded-full mx-auto" />
        </div>

        {/* Close Button */}
        <button 
          onClick={closeCard}
          className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
        >
          <X size={20} className="text-gray-600" />
        </button>

        {/* Scrollable Content */}
        <div className="scrollable-content overflow-y-auto h-full pb-12">
          <div className="p-6 pb-8">
            {/* Header */}
            <div className="mb-8 text-center">
              <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                ثبت UID
              </h1>
              <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {productTitle || 'کانال سیگنال رایگان'}
              </p>
            </div>

            {/* Main Content */}
            <div className="space-y-4">
              {/* UID Input */}
              <div className="relative">
                <input
                  type="text"
                  value={uid}
                  onChange={(e) => setUID(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f7d55d] ${
                    isDarkMode 
                      ? 'bg-gray-800 text-white placeholder-gray-500'
                      : 'bg-gray-100 text-gray-900 placeholder-gray-500'
                  }`}
                  placeholder="کد UID خود را وارد کنید"
                  dir="rtl"
                  disabled={isSubmitting || submissionStatus === 'success'}
                />
              </div>

              {/* Guide Text */}
              <div dir="rtl" className="mt-2 p-3 bg-blue-100 text-blue-800 rounded-lg">
                <p className="text-sm text-right">
                  <strong>راهنما:</strong> برای دریافت UID، وارد حساب کاربری خود در اپلیکیشن Lbank شوید و از قسمت پروفایل، کد UID خود را کپی کنید.
                </p>
              </div>

              {/* Status Message */}
              {renderStatusMessage()}
            </div>
          </div>
        </div>

        {/* Submit Button - Fixed at Bottom */}
        <div className="absolute bottom-6 left-4 right-4 z-10">
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting || submissionStatus === 'success' || !uid}
            className={`w-full ${
              isSubmitting || submissionStatus === 'success' || !uid
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#f7d55d] hover:bg-[#e5c44c]'
            } text-gray-900 rounded-xl py-3 text-sm font-medium transition-colors relative`}
          >
            {isSubmitting ? (
              <>
                <span className="opacity-0">ارسال</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                </div>
              </>
            ) : submissionStatus === 'success' ? 'ثبت شد' : 'ارسال'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UIDSubmissionCard;