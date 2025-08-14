import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Store } from 'react-notifications-component';
import { countries } from './countryList';


const validateMobile = (mobile) => {
  // حذف هر کاراکتری به جز اعداد
  const numericMobile = mobile.replace(/\D/g, '');
  // چک کردن طول شماره بین 8 تا 13 رقم
  return numericMobile.length >= 8 && numericMobile.length <= 13;
};

const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const validateRegister = async (userData, selectedCountry) => {
  try {
    const response = await fetch('https://p30s.com/wp-json/wp/v2/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        username: userData.email,
        email: userData.email,
        password: userData.password,
        phone_number:"",
        name: userData.fullName,
        phone: ""
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      // بعد از ثبت نام موفق، لاگین کردن کاربر
      const loginResult = await fetch('https://p30s.com/wp-json/jwt-auth/v1/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          username: userData.email,
          password: userData.password 
        })
      });
      
      const loginData = await loginResult.json();
      
      if (loginData.token) {
        return {
          success: true,
          message: 'ثبت نام با موفقیت انجام شد',
          token: loginData.token,
          user_email: userData.email,
          user_display_name: userData.fullName,
          user_registered: new Date().toISOString()
        };
      }
      
      // اگر لاگین نشد، حداقل ثبت نام موفق بوده
      return {
        success: true,
        message: 'ثبت نام با موفقیت انجام شد، لطفا وارد شوید'
      };
    }

    return {
      success: false,
      message: data.message || 'خطا در ثبت نام',
      type: 'register_error'
    };

  } catch (error) {
    return {
      success: false,
      message: 'خطا در ارتباط با سرور',
      type: 'network_error'
    };
  }
};
const LoginPage = ({ isDarkMode, setIsLoggedIn, onClose, defaultTab = "login" }) => {
  const [selectedCountry, setSelectedCountry] = useState({ code: '+41', flag: '🇨🇭', name: 'سوئیس' });
    const [showCountries, setShowCountries] = useState(false);
  const [isLandscape, setIsLandscape] = useState(window.innerHeight < window.innerWidth);
  const navigate = useNavigate();
const [isLogin, setIsLogin] = useState(defaultTab === "login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const cardRef = useRef(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const [showCard, setShowCard] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    mobile: '',
    fullName: '',
    password: '',
    confirmPassword: ''
  });
const [saveLogin, setSaveLogin] = useState(true);
const [acceptTerms, setAcceptTerms] = useState(false);

  // state برای حالت بازیابی رمز عبور
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setShowCard(true);
    }, 100);
  }, []);

  // تنظیم تب پیش‌فرض بر اساس defaultTab prop
useEffect(() => {
  setIsLogin(defaultTab === "login");
}, [defaultTab]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCountries && !event.target.closest('.country-selector')) {
        setShowCountries(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCountries]);

  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerHeight < window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    if (!card || isLandscape) return;

    const handleTouchStart = (e) => {
      if (e.target.closest('.country-selector')) return;
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
      // اگر onClose به عنوان prop منتقل شده باشد، از آن استفاده کن
      if (onClose) {
        onClose();
      } else {
        // در غیر این صورت، از navigate استفاده کن (برای حالت‌های مستقل)
        navigate(-1);
      }
    }, 300);
  };




  // این کد را در بخش handleLoginSuccess در فایل LoginPage.js جایگزین کنید

const handleLoginSuccess = async (result) => {
  setIsLoggedIn(true);
  try {
    // ذخیره توکن و اطلاعات کاربر
    const token = result.token || localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
    
    if (!token) {
      console.error('خطا: توکن کاربر یافت نشد');
      return;
    }
    
    // ذخیره توکن و اطلاعات کاربر در localStorage یا sessionStorage
    const now = new Date().getTime();
    if (saveLogin) {
      localStorage.setItem('userToken', token);
      localStorage.setItem('userInfo', JSON.stringify(result));
      // ذخیره رمز عبور برای تمدید خودکار توکن در آینده
      localStorage.setItem('userPassword', formData.password);
      // ذخیره زمان تمدید و انقضای توکن
      localStorage.setItem('lastTokenRefresh', now.toString());
      localStorage.setItem('tokenExpiration', (now + 30 * 24 * 60 * 60 * 1000).toString()); // 30 روز
    } else {
      sessionStorage.setItem('userToken', token);
      sessionStorage.setItem('userInfo', JSON.stringify(result));
      sessionStorage.setItem('lastTokenRefresh', now.toString());
    }
    
    console.log("توکن ذخیره شد و کاربر با موفقیت وارد سیستم شد");
    
    // دریافت خریدهای کاربر از API
    try {
      console.log("در حال دریافت خریدهای کاربر...");
      const purchasesResponse = await fetch('https://p30s.com/wp-json/pcs/v1/user-purchases', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (!purchasesResponse.ok) {
        console.error('خطا در دریافت خریدها. کد وضعیت:', purchasesResponse.status);
        throw new Error('خطا در دریافت خریدهای کاربر');
      }
      
      const purchasesData = await purchasesResponse.json();
      console.log("پاسخ API خریدهای کاربر:", purchasesData);
      
      if (purchasesData.success && Array.isArray(purchasesData.purchases)) {
        // ذخیره خریدها در localStorage و sessionStorage
        localStorage.setItem('purchasedProducts', JSON.stringify(purchasesData.purchases));
        localStorage.setItem('lastProductCheck', now.toString());
        
        // همچنین در sessionStorage ذخیره می‌کنیم
        sessionStorage.setItem('purchasedProducts', JSON.stringify(purchasesData.purchases));
        sessionStorage.setItem('lastProductCheck', now.toString());
        
        console.log(`${purchasesData.purchases.length} محصول خریداری شده در localStorage و sessionStorage ذخیره شد`);
      } else {
        console.warn("هیچ خریدی یافت نشد یا پاسخ نامعتبر است");
        localStorage.setItem('purchasedProducts', JSON.stringify([]));
        sessionStorage.setItem('purchasedProducts', JSON.stringify([]));
      }
    } catch (error) {
      console.error('خطا در بارگیری محصولات:', error);
      // در صورت خطا، localStorage را با آرایه خالی پر می‌کنیم
      localStorage.setItem('purchasedProducts', JSON.stringify([]));
      sessionStorage.setItem('purchasedProducts', JSON.stringify([]));
    }
    
    // تنظیم سیستم تمدید خودکار توکن
    if (saveLogin) {
      console.log("تنظیم سیستم تمدید خودکار توکن...");
      setupTokenRefresh(token, true);
    }
    
    // بررسی وضعیت VIP کاربر (اختیاری)
    try {
      if (saveLogin) { // فقط برای کاربرانی که "مرا به خاطر بسپار" را فعال کرده‌اند
        const vipResponse = await fetch('https://p30s.com/wp-json/pcs/v1/check-vip-status', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        if (vipResponse.ok) {
          const vipData = await vipResponse.json();
          if (vipData.success) {
            localStorage.setItem('userVipStatus', JSON.stringify({
              has_vip: vipData.has_vip,
              details: vipData.vip_details || [],
              checkedAt: now
            }));
            console.log("وضعیت VIP کاربر بررسی شد:", vipData.has_vip ? "فعال" : "غیرفعال");
          }
        }
      }
    } catch (vipError) {
      console.error('خطا در بررسی وضعیت VIP:', vipError);
    }
    
    // هدایت به صفحه اصلی
    // هدایت به صفحه اصلی یا بستن کارت لاگین
if (onClose) {
  // اگر کارت به عنوان modal باز شده، آن را ببند
  onClose();
} else {
  // در غیر این صورت، به صفحه اصلی هدایت شو
  navigate('/');
}
    
  } catch (error) {
    console.error('خطا در فرآیند ورود:', error);
    
    // حتی در صورت خطا، سعی می‌کنیم کاربر را به صفحه اصلی هدایت کنیم
    setTimeout(() => {
  if (onClose) {
    onClose();
  } else {
    navigate('/');
  }
}, 500);
  }
};
  // تابع کمکی برای تنظیم تمدید خودکار توکن
const setupTokenRefresh = (token, isPersistent) => {
  if (!isPersistent) return; // فقط برای حالت "مرا به خاطر بسپار"
  
  // ذخیره زمان انقضای توکن (30 روز)
  const expirationTime = new Date().getTime() + 30 * 24 * 60 * 60 * 1000;
  localStorage.setItem('tokenExpiration', expirationTime.toString());
  
  // ارسال پینگ هر 12 ساعت برای نگه داشتن توکن
  const pingInterval = 12 * 60 * 60 * 1000; // 12 ساعت
  
  // تابع پینگ به سرور برای حفظ فعال بودن توکن
  const pingServer = async () => {
    try {
      // اول بررسی کنیم که آیا توکن نزدیک به انقضا است
      const currentToken = localStorage.getItem('userToken');
      const expiration = parseInt(localStorage.getItem('tokenExpiration') || '0');
      const now = new Date().getTime();
      
      // اگر کمتر از 3 روز به انقضای توکن مانده، آن را تمدید کنیم
      if (now > expiration - 3 * 24 * 60 * 60 * 1000) {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const userPassword = localStorage.getItem('userPassword');
        
        if (userInfo.user_email && userPassword) {
          console.log('توکن نزدیک به انقضا است، در حال تمدید خودکار...');
          // تلاش مجدد لاگین با اطلاعات ذخیره شده
          const refreshResponse = await fetch('https://p30s.com/wp-json/jwt-auth/v1/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              username: userInfo.user_email,
              password: userPassword
            })
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            if (refreshData.token) {
              // به‌روزرسانی توکن در localStorage
              localStorage.setItem('userToken', refreshData.token);
              localStorage.setItem('userInfo', JSON.stringify(refreshData));
              localStorage.setItem('lastTokenRefresh', new Date().getTime().toString());
              
              // تنظیم مجدد زمان انقضا
              const newExpiration = new Date().getTime() + 30 * 24 * 60 * 60 * 1000;
              localStorage.setItem('tokenExpiration', newExpiration.toString());
              
              console.log('توکن با موفقیت تمدید شد، انقضای جدید:', new Date(newExpiration).toLocaleString());
              return;
            }
          }
        }
      }
      
      // اگر هنوز به تمدید نیاز نیست، فقط یک اعتبارسنجی انجام دهیم
      const validationResponse = await fetch('https://p30s.com/wp-json/jwt-auth/v1/token/validate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });
      
      if (validationResponse.ok) {
        console.log('توکن همچنان معتبر است');
        localStorage.setItem('lastTokenRefresh', new Date().getTime().toString());
      } else {
        // اگر توکن نامعتبر است، تلاش برای تمدید خودکار
        throw new Error('توکن نامعتبر است');
      }
    } catch (error) {
      console.error('خطا در بررسی یا تمدید توکن:', error);
      // تلاش برای تمدید خودکار
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const userPassword = localStorage.getItem('userPassword');
        
        if (userInfo.user_email && userPassword) {
          console.log('در حال تمدید خودکار توکن...');
          const refreshResponse = await fetch('https://p30s.com/wp-json/jwt-auth/v1/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              username: userInfo.user_email,
              password: userPassword
            })
          });
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            if (refreshData.token) {
              localStorage.setItem('userToken', refreshData.token);
              localStorage.setItem('userInfo', JSON.stringify(refreshData));
              localStorage.setItem('lastTokenRefresh', new Date().getTime().toString());
              
              const newExpiration = new Date().getTime() + 30 * 24 * 60 * 60 * 1000;
              localStorage.setItem('tokenExpiration', newExpiration.toString());
              
              console.log('توکن با موفقیت تمدید شد');
            }
          }
        }
      } catch (refreshError) {
        console.error('خطا در تمدید خودکار توکن:', refreshError);
      }
    }
  };
  
  // اجرای اولیه تابع پینگ
  pingServer();
  
  // تنظیم پینگ دوره‌ای
  const intervalId = setInterval(pingServer, pingInterval);
  
  // ذخیره شناسه اینتروال برای پاک کردن در زمان خروج کاربر
  localStorage.setItem('tokenRefreshIntervalId', intervalId.toString());
  
  // اضافه کردن یک event listener برای بررسی توکن در زمان بازیابی صفحه
  window.addEventListener('focus', pingServer);
  
  return () => {
    clearInterval(intervalId);
    window.removeEventListener('focus', pingServer);
  };
};

  const validateLogin = async (username, password, rememberMe) => {
    try {
      const response = await fetch('https://p30s.com/wp-json/jwt-auth/v1/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim()
        })
      });
      const data = await response.json();
      
      if (data.token) {
        if (rememberMe) {
          localStorage.setItem('userToken', data.token);
          localStorage.setItem('userInfo', JSON.stringify(data));
        } else {
          sessionStorage.setItem('userToken', data.token);
          sessionStorage.setItem('userInfo', JSON.stringify(data));
        }
        return {
          success: true,
          message: 'با موفقیت وارد شدید'
        };
      }
  
      if (data.code === '[jwt_auth] invalid_username' || 
          data.code === '[jwt_auth] incorrect_password' || 
          data.code === 'invalid_login') {
        return {
          success: false,
          message: 'نام کاربری یا رمز عبور اشتباه است',
          type: 'auth_error'
        };
      }
  
      return {
        success: false,
        message: data.message || 'خطای سرور',
        type: 'server_error'
      };
  
    } catch (error) {
      //console.error('Network error:', error);
      return {
        success: false,
        message: 'خطا در برقراری ارتباط با سرور. لطفاً اتصال اینترنت خود را بررسی کنید.',
        type: 'network_error'
      };
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEmailBlur = () => {
    if (formData.email && !validateEmail(formData.email)) {
      Store.addNotification({
        title: "خطا",
        message: "لطفاً یک ایمیل معتبر وارد کنید",
        type: "danger",
        insert: "top",
        container: "center",
        animationIn: ["animate__animated", "animate__flipInX"],
        animationOut: ["animate__animated", "animate__flipOutX"],
        dismiss: { duration: 3000, showIcon: true, pauseOnHover: true },
        style: { direction: 'rtl', textAlign: 'right' }
      });
    }
  };

  const clearInput = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: ''
    }));
  };

  const handleSubmit = async () => {
    if (!isLogin) {
      // ثبت‌نام
      if (!formData.fullName || !formData.email || !formData.password) {
        Store.addNotification({
          title: "خطا",
          message: "لطفا تمام فیلدها را پر کنید",
          type: "danger",
          insert: "top",
          container: "center",
          dismiss: { duration: 3000, showIcon: true, pauseOnHover: true },
        });
        return;
      }
       if (!acceptTerms) {
    Store.addNotification({
      title: "خطا",
      message: "لطفاً تیک قوانین و مقررات را فعال کنید و سپس روی کلید ثبت نام کلیک کنید",
      type: "danger",
      insert: "top",
      container: "center",
      dismiss: { duration: 4000, showIcon: true, pauseOnHover: true },
      style: { direction: 'rtl', textAlign: 'right' }
    });
    return;
  }
  
      if (!validateEmail(formData.email)) {
        Store.addNotification({
          title: "خطا",
          message: "لطفا یک ایمیل معتبر وارد کنید",
          type: "danger",
          insert: "top",
          container: "center",
          dismiss: { duration: 3000, showIcon: true, pauseOnHover: true },
        });
        return;
      }
  
      if (formData.password !== formData.confirmPassword) {
        Store.addNotification({
          title: "خطا",
          message: "رمز عبور و تکرار آن مطابقت ندارند",
          type: "danger",
          insert: "top",
          container: "center",
          dismiss: { duration: 3000, showIcon: true, pauseOnHover: true },
        });
        return;
      }
  
      setIsLoading(true);
      try {
        const result = await validateRegister(formData, selectedCountry);
  
        if (result.success) {
          setIsLoggedIn(true);
          Store.addNotification({
            title: "موفق",
            message: result.message,
            type: "success",
            insert: "top",
            container: "center",
            animationIn: ["animate__animated", "animate__flipInX"],
            animationOut: ["animate__animated", "animate__flipOutX"],
            dismiss: { duration: 2000, showIcon: true, pauseOnHover: true },
            style: { direction: 'rtl', textAlign: 'right' }
          });
          
          if (result.success && !result.token) {
            // اگر ثبت نام موفق بود اما توکن دریافت نشد، مستقیماً لاگین کنید
            const loginResult = await validateLogin(formData.email, formData.password, saveLogin);
            if (loginResult.success) {
              // استفاده از توکن دریافتی از لاگین
              result.token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
            }
          }
          const token = result.token || localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
          
          // ذخیره اطلاعات کاربر و تنظیم زمان آخرین به‌روزرسانی توکن
          if (saveLogin) {
            localStorage.setItem('userToken', token);
            localStorage.setItem('userInfo', JSON.stringify(result));
            localStorage.setItem('userPassword', formData.password); // ذخیره رمز عبور برای تمدید خودکار
            localStorage.setItem('lastTokenRefresh', new Date().getTime().toString());
            localStorage.setItem('tokenExpiration', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).getTime().toString()); // تنظیم انقضای توکن به ۳۰ روز آینده
          } else {
            sessionStorage.setItem('userToken', token);
            sessionStorage.setItem('userInfo', JSON.stringify(result));
            sessionStorage.setItem('lastTokenRefresh', new Date().getTime().toString());
          }
          
          // مستقیم به صفحه اصلی هدایت می‌کنیم
   // فراخوانی تابع موفقیت لاگین
await handleLoginSuccess(result);

        } else {
          Store.addNotification({
            title: "خطا",
            message: result.message,
            type: "danger",
            insert: "top",
            container: "center",
            animationIn: ["animate__animated", "animate__flipInX"],
            animationOut: ["animate__animated", "animate__flipOutX"],
            dismiss: { duration: 3000, showIcon: true, pauseOnHover: true },
            style: { direction: 'rtl', textAlign: 'right' }
          });
        }
      } catch (error) {
        Store.addNotification({
          title: "خطای سیستم",
          message: "خطای غیرمنتظره رخ داد. لطفاً دوباره تلاش کنید.",
          type: "danger",
          insert: "top",
          container: "center",
          animationIn: ["animate__animated", "animate__flipInX"],
          animationOut: ["animate__animated", "animate__flipOutX"],
          dismiss: { duration: 3000, showIcon: true, pauseOnHover: true },
          style: { direction: 'rtl', textAlign: 'right' }
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      // ورود
      if (!formData.email || !formData.password) {
        Store.addNotification({
          title: "خطا",
          message: "لطفا نام کاربری و رمز عبور را وارد کنید",
          type: "danger",
          insert: "top",
          container: "center",
          animationIn: ["animate__animated", "animate__flipInX"],
          animationOut: ["animate__animated", "animate__flipOutX"],
          dismiss: { duration: 3000, showIcon: true, pauseOnHover: true },
          style: { direction: 'rtl', textAlign: 'right' }
        });
        return;
      }
  
      setIsLoading(true);
      try {
        const result = await validateLogin(formData.email, formData.password, saveLogin);
  
        if (result.success) {
          setIsLoggedIn(true);
          
          // ذخیره اطلاعات ورود برای "مرا به خاطر بسپار"
          if (saveLogin) {
            // ذخیره رمز عبور برای تمدید خودکار توکن
            localStorage.setItem('userPassword', formData.password);
            localStorage.setItem('lastTokenRefresh', new Date().getTime().toString());
            localStorage.setItem('tokenExpiration', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).getTime().toString()); // تنظیم انقضای توکن به ۳۰ روز آینده
            
            // فراخوانی API برای دریافت خریدهای کاربر
            const token = localStorage.getItem('userToken');
            if (token) {
              try {
                const purchasesResponse = await fetch('https://p30s.com/wp-json/pcs/v1/user-purchases', {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                  }
                });
                
                if (purchasesResponse.ok) {
                  const purchasesData = await purchasesResponse.json();
                  if (purchasesData.success && Array.isArray(purchasesData.purchases)) {
                    localStorage.setItem('purchasedProducts', JSON.stringify(purchasesData.purchases));
                    localStorage.setItem('lastProductCheck', new Date().getTime().toString());
                  }
                }
              } catch (error) {
                console.error('خطا در دریافت خریدهای کاربر:', error);
              }
            }
          }
          
          Store.addNotification({
            title: "موفق",
            message: result.message,
            type: "success",
            insert: "top",
            container: "center",
            animationIn: ["animate__animated", "animate__flipInX"],
            animationOut: ["animate__animated", "animate__flipOutX"],
            dismiss: { duration: 3000, showIcon: true, pauseOnHover: true },
            style: { direction: 'rtl', textAlign: 'right' }
          });
  
// فراخوانی تابع موفقیت لاگین
const loginData = {
  token: localStorage.getItem('userToken') || sessionStorage.getItem('userToken'),
  user_email: formData.email
};
await handleLoginSuccess(loginData);
        } else {
          let title = "خطا";
          let message = result.message;
  
          if (result.type === 'auth_error') {
            title = "خطای ورود";
          } else if (result.type === 'network_error') {
            title = "خطای شبکه";
          } else if (result.type === 'server_error') {
            title = "خطای سرور";
          }
  
          Store.addNotification({
            title: title,
            message: message,
            type: "danger",
            insert: "top",
            container: "center",
            animationIn: ["animate__animated", "animate__flipInX"],
            animationOut: ["animate__animated", "animate__flipOutX"],
            dismiss: { duration: 3000, showIcon: true, pauseOnHover: true },
            style: { direction: 'rtl', textAlign: 'right' }
          });
        }
      } catch (error) {
        Store.addNotification({
          title: "خطای سیستم",
          message: "خطای غیرمنتظره رخ داد. لطفاً دوباره تلاش کنید.",
          type: "danger",
          insert: "top",
          container: "center",
          animationIn: ["animate__animated", "animate__flipInX"],
          animationOut: ["animate__animated", "animate__flipOutX"],
          dismiss: { duration: 3000, showIcon: true, pauseOnHover: true },
          style: { direction: 'rtl', textAlign: 'right' }
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // به‌روزرسانی تابع handleForgotPassword برای استفاده از دستور curl ارائه‌شده
  const handleForgotPassword = async () => {
    if (!formData.email) {
      Store.addNotification({
        title: "خطا",
        message: "لطفاً ایمیل خود را وارد کنید",
        type: "danger",
        insert: "top",
        container: "center",
        dismiss: { duration: 3000, showIcon: true, pauseOnHover: true },
        style: { direction: 'rtl', textAlign: 'right' }
      });
      return;
    }
    setIsLoading(true);
    try {
      // آماده‌سازی داده‌ها به صورت URL-encoded
      const params = new URLSearchParams();
      params.append('user_login', formData.email);
      params.append('redirect_to', '');
      params.append('wp-submit', 'دریافت رمز تازه');

      const response = await fetch('https://p30s.com/wp-login.php?action=lostpassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          'Referer': 'https://p30s.com/wp-login.php?action=lostpassword'
        },
        body: params.toString()
      });
      
      // دریافت پاسخ به صورت متنی (HTML)
      const responseText = await response.text();
      
      if (response.ok) {
        Store.addNotification({
          title: "موفق",
          message: "ایمیل بازیابی ارسال شد",
          type: "success",
          insert: "top",
          container: "center",
          dismiss: { duration: 3000, showIcon: true, pauseOnHover: true },
          style: { direction: 'rtl', textAlign: 'right' }
        });
        // بازگشت به فرم ورود پس از موفقیت
        setIsForgotPassword(false);
      } else {
        Store.addNotification({
          title: "خطا",
          message: "خطا در ارسال درخواست بازیابی",
          type: "danger",
          insert: "top",
          container: "center",
          dismiss: { duration: 3000, showIcon: true, pauseOnHover: true },
          style: { direction: 'rtl', textAlign: 'right' }
        });
      }
    } catch (error) {
      Store.addNotification({
        title: "خطای سیستم",
        message: "خطای غیرمنتظره رخ داد. لطفاً دوباره تلاش کنید.",
        type: "danger",
        insert: "top",
        container: "center",
        dismiss: { duration: 3000, showIcon: true, pauseOnHover: true },
        style: { direction: 'rtl', textAlign: 'right' }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderInput = (name, placeholder, type = 'text', showPasswordToggle = false, setShowPasswordState, inputProps = {}) => {
    const isPassword = type === 'password';
    const showCurrentPassword = isPassword && showPassword;
    const isConfirmPassword = name === 'confirmPassword';
    const passwordsMatch = isConfirmPassword && formData.password === formData.confirmPassword && formData.confirmPassword !== '';
    const isMobile = type === 'tel';

    return (
      <div className="relative">
        <div className="relative flex items-center">
          {isMobile && (
            <div
              dir="rtl"
              className="absolute right-4 flex flex-row-reverse items-center gap-2 cursor-pointer"
              onClick={() => setShowCountries(prev => !prev)}
            >
              <span className={`text-lg ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>|</span>
              <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedCountry.code}
              </span>
              <span className="text-sm">{selectedCountry.flag}</span>
            </div>
          )}

          <input
            {...inputProps}
            type={showCurrentPassword ? 'text' : type}
            name={name}
            value={formData[name]}
            onChange={inputProps.onChange || handleChange}
            className={`w-full px-4 py-3 sm:py-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#f7d55d] rtl-placeholder text-right ${
              isDarkMode 
                ? 'bg-gray-800 text-white placeholder-gray-500 border-gray-700'
                : 'bg-gray-100 text-gray-900 placeholder-gray-500'
            } ${isMobile ? 'pr-[97px]' : ''}`}
            placeholder={placeholder}
            style={{ fontSize: '16px', textAlign: 'right' }}
            dir="rtl"
            autoComplete="off"
            autoCorrect="off"
          />

<div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
  {isConfirmPassword && formData.confirmPassword && (
    <div className={`transition-colors ${passwordsMatch ? 'text-green-500' : 'text-red-500'}`}>
      {passwordsMatch ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      )}
    </div>
  )}
</div>
        </div>

        {isMobile && showCountries && (
          <div 
            className={`country-selector absolute right-0 top-full mt-2 w-48 rounded-xl shadow-lg z-50 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <div className="py-2 max-h-60 overflow-y-auto">
              {countries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => {
                    setSelectedCountry(country);
                    setShowCountries(false);
                  }}
                  className={`w-full px-4 py-2 text-left flex items-center gap-2 hover:bg-gray-100 ${
                    isDarkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-900'
                  }`}
                >
                  <span className="text-lg">{country.flag}</span>
                  <span className="text-sm">{country.code}</span>
                  <span className="text-sm text-gray-500">{country.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {formData[name] && !isPassword && !isMobile && (
          <button
            onClick={() => clearInput(name)}
            className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
          >
            {/* دکمه پاک کردن در صورت نیاز */}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 overflow-hidden transition-opacity duration-300"
      style={{ 
        opacity: showCard ? 1 : 0,
        pointerEvents: showCard ? 'auto' : 'none'
      }}>
      <div 
        ref={cardRef}
        className={`fixed bottom-0 left-0 right-0 w-full ${isDarkMode ? 'bg-[#0d1822]' : 'bg-white'} rounded-t-3xl shadow-lg transition-transform duration-300 ease-out ${
          isLandscape ? 'h-screen overflow-y-auto' : 'max-h-[92vh] overflow-hidden'
        }`}
        style={{ 
          transform: `translateY(${showCard ? '0' : '100%'})`,
          touchAction: isLandscape ? 'auto' : 'none',
        }}
      >
        {isForgotPassword && (
          <button 
            onClick={() => setIsForgotPassword(false)}
            className="absolute top-4 left-4 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
        )}

<div className="pt-2 relative">
  <div className="w-24 h-1 bg-gray-300 rounded-full mx-auto" />
  
  {/* دکمه بستن (X) */}
  <button 
    onClick={closeCard}
    className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
  >
    <X size={20} className="text-gray-600" />
  </button>
</div>

        <div className="scrollable-content h-full overflow-y-auto pb-safe">
          <div className="px-6 pb-8 pt-4">
            {isForgotPassword ? (
              <>
                <div className="mb-8 text-center pt-4">
                  <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    بازیابی رمز عبور
                  </h1>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    ایمیل خود را وارد کنید
                  </p>
                </div>
                <div className="space-y-4 px-1">
                  {renderInput('email', 'ایمیل خود را وارد کنید', 'email', false, null, {
                    onBlur: handleEmailBlur,
                    autoComplete: "off",
                    autoCorrect: "off"
                  })}
                  <button
                    onClick={handleForgotPassword}
                    disabled={isLoading}
                    className={`w-full mt-6 bg-[#f7d55d] text-gray-900 rounded-xl py-3 text-sm font-medium transition-colors relative ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#e5c44c]'}`}
                  >
                    {isLoading ? (
                      <>
                        <span className="opacity-0">بازیابی</span>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                        </div>
                      </>
                    ) : (
                      'بازیابی'
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-2 text-center ">
                  <div className="w-16 h-16 bg-[#f7d55d] rounded-full mx-auto mb-2 flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <h1 className={`text-2xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    ورود یا ثبت‌نام
                  </h1>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    به اپلیکیشن ما خوش آمدید
                  </p>
                </div>

                <div className={`p-[3px] rounded-full flex mb-4 relative ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <div
                    className={`absolute inset-[3px] w-[calc(50%-3px)] rounded-full transition-transform duration-300 ease-out ${isDarkMode ? 'bg-gray-700' : 'bg-white'} ${isLogin ? 'translate-x-0' : 'translate-x-full'}`}
                  />
                  <button
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 py-2.5 sm:py-3 rounded-full text-sm z-10 transition-colors relative ${isLogin ? (isDarkMode ? 'text-white' : 'text-gray-900') : (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`}
                  >
                    ورود
                  </button>
                  <button
                    onClick={() => setIsLogin(false)}
                    className={`flex-1 py-2.5 sm:py-3 rounded-full text-sm z-10 transition-colors relative ${!isLogin ? (isDarkMode ? 'text-white' : 'text-gray-900') : (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`}
                  >
                    ثبت‌نام
                  </button>
                </div>

                <div className="space-y-2 px-1">
                  {isLogin ? (
                    <>
                      {renderInput('email', 'ایمیل خود را وارد کنید', 'email', false, null, {
                        onBlur: handleEmailBlur,
                        autoComplete: "off",
                        autoCorrect: "off"
                      })}
                      {renderInput('password', 'رمز عبور', 'password', true, setShowPassword)}
                      <div className="flex items-center justify-between pt-2">
                        <label className={`flex items-center gap-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <input
                            type="checkbox"
                            checked={saveLogin}
                            onChange={(e) => setSaveLogin(e.target.checked)}
                            className="rounded border-gray-300"
                          />
                          من رو به خاطر بسپار
                        </label>
                        <button
                          onClick={() => setIsForgotPassword(true)}
                          className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
                        >
                          فراموشی رمز عبور؟
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {renderInput('fullName', 'نام و نام خانوادگی')}
                      {/* {renderInput('mobile', 'شماره موبایل', 'tel', false, null, {
                        pattern: '[0-9]*',
                        inputMode: 'numeric',
                        onChange: (e) => {
                          const value = e.target.value.replace(/[^0-9]/g, '');
                          setFormData(prev => ({ ...prev, mobile: value }));
                        }
                      })} */}
                      {renderInput('email', 'ایمیل خود را وارد کنید', 'email', false, null, {
                        onBlur: handleEmailBlur,
                        autoComplete: "off",
                        autoCorrect: "off"
                      })}
                      {renderInput('password', 'رمز عبور', 'password', true, setShowPassword)}
                      {renderInput('confirmPassword', 'تکرار رمز عبور', 'password', true, setShowPassword)} 
{!isLogin && (
  <div className="pt-1">
    <label className={`flex items-start gap-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
      <input
        type="checkbox"
        checked={acceptTerms}
        onChange={(e) => setAcceptTerms(e.target.checked)}
        className="mt-1 rounded border-gray-300"
      />
      <span className="leading-relaxed">
        با ثبت نام، 
        <a 
          href="https://persiancryptosource.com/privacy-policy.html" 
          target="_blank" 
          rel="noopener noreferrer"
          className={`mx-1 underline ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
        >
          سیاست حفظ حریم خصوصی
        </a>
        و قوانین استفاده موافقت می‌کنم.
      </span>
    </label>
  </div>
)}
                    </>
                  )}
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className={`w-full mt-3 bg-[#f7d55d] text-gray-900 rounded-xl py-3 text-sm font-medium transition-colors relative ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#e5c44c]'}`}
                >
                  {isLoading ? (
                    <>
                      <span className="opacity-0">ورود</span>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                      </div>
                    </>
                  ) : (
                    isLogin ? 'ورود' : 'ثبت‌نام'
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
