import React, { useState, useEffect, useRef } from 'react';
import { X, Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import { Store } from 'react-notifications-component';

const SignupCard = ({ isDarkMode, onClose, defaultTab = 'login', onSignupSuccess }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [showCard, setShowCard] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const cardRef = useRef(null);
  const isDragging = useRef(false);
  const startY = useRef(0);

  // فرم ورود
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  // فرم ثبت نام
  const [signupData, setSignupData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    setActiveTab(defaultTab);
    setTimeout(() => {
      setShowCard(true);
    }, 100);
  }, [defaultTab]);

  // Touch handlers for drag to close
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleTouchStart = (e) => {
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
      onClose();
    }, 300);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password) {
      Store.addNotification({
        title: "خطا",
        message: "لطفاً تمام فیلدها را پر کنید",
        type: "danger",
        insert: "top",
        container: "center",
        dismiss: { duration: 3000 }
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('https://p30s.com/wp-json/jwt-auth/v1/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: loginData.email,
          password: loginData.password
        })
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // ذخیره اطلاعات کاربر
        if (loginData.rememberMe) {
          localStorage.setItem('userToken', data.token);
          localStorage.setItem('userInfo', JSON.stringify(data));
          localStorage.setItem('userPassword', loginData.password);
        } else {
          sessionStorage.setItem('userToken', data.token);
          sessionStorage.setItem('userInfo', JSON.stringify(data));
        }

        Store.addNotification({
          title: "موفق",
          message: "ورود با موفقیت انجام شد",
          type: "success",
          insert: "top",
          container: "center",
          dismiss: { duration: 2000 }
        });

        onSignupSuccess?.();
        closeCard();
      } else {
        Store.addNotification({
          title: "خطا",
          message: data.message || "خطا در ورود",
          type: "danger",
          insert: "top",
          container: "center",
          dismiss: { duration: 3000 }
        });
      }
    } catch (error) {
      Store.addNotification({
        title: "خطا",
        message: "خطا در برقراری ارتباط",
        type: "danger",
        insert: "top",
        container: "center",
        dismiss: { duration: 3000 }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!signupData.firstName || !signupData.lastName || !signupData.email || 
        !signupData.phone || !signupData.password || !signupData.confirmPassword) {
      Store.addNotification({
        title: "خطا",
        message: "لطفاً تمام فیلدها را پر کنید",
        type: "danger",
        insert: "top",
        container: "center",
        dismiss: { duration: 3000 }
      });
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      Store.addNotification({
        title: "خطا",
        message: "رمز عبور و تکرار آن مطابقت ندارند",
        type: "danger",
        insert: "top",
        container: "center",
        dismiss: { duration: 3000 }
      });
      return;
    }

    if (signupData.password.length < 6) {
      Store.addNotification({
        title: "خطا",
        message: "رمز عبور باید حداقل 6 کاراکتر باشد",
        type: "danger",
        insert: "top",
        container: "center",
        dismiss: { duration: 3000 }
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('https://p30s.com/wp-json/wp/v2/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: signupData.email,
          email: signupData.email,
          password: signupData.password,
          first_name: signupData.firstName,
          last_name: signupData.lastName,
          meta: {
            phone: signupData.phone
          }
        })
      });

      const data = await response.json();

      if (response.ok) {
        Store.addNotification({
          title: "موفق",
          message: "ثبت نام با موفقیت انجام شد. در حال ورود...",
          type: "success",
          insert: "top",
          container: "center",
          dismiss: { duration: 2000 }
        });

        // ورود خودکار بعد از ثبت نام
        setTimeout(async () => {
          try {
            const loginResponse = await fetch('https://p30s.com/wp-json/jwt-auth/v1/token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                username: signupData.email,
                password: signupData.password
              })
            });

            const loginData = await loginResponse.json();
            if (loginResponse.ok && loginData.token) {
              localStorage.setItem('userToken', loginData.token);
              localStorage.setItem('userInfo', JSON.stringify(loginData));
              
              onSignupSuccess?.();
              closeCard();
            }
          } catch (loginError) {
            // اگر ورود خودکار موفق نبود، به تب ورود بروید
            setActiveTab('login');
          }
        }, 1000);

      } else {
        Store.addNotification({
          title: "خطا",
          message: data.message || "خطا در ثبت نام",
          type: "danger",
          insert: "top",
          container: "center",
          dismiss: { duration: 3000 }
        });
      }
    } catch (error) {
      Store.addNotification({
        title: "خطا",
        message: "خطا در برقراری ارتباط",
        type: "danger",
        insert: "top",
        container: "center",
        dismiss: { duration: 3000 }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/75 overflow-hidden transition-opacity duration-300"
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
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } rounded-t-3xl shadow-lg transition-transform duration-300 ease-out max-h-[92vh] overflow-hidden`}
        style={{ 
          transform: `translateY(${showCard ? '0' : '100%'})`,
          touchAction: 'none',
        }}
      >
        {/* Handle */}
        <div className="pt-2 relative">
          <div className="w-24 h-1 bg-gray-300 rounded-full mx-auto" />
          
          <button 
            onClick={closeCard}
            className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Header Tabs */}
        <div className="px-6 pt-4">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                activeTab === 'login'
                  ? 'text-yellow-500 border-b-2 border-yellow-500'
                  : isDarkMode
                  ? 'text-gray-400 hover:text-gray-200'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              ورود
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-4 text-center font-medium transition-colors ${
                activeTab === 'signup'
                  ? 'text-yellow-500 border-b-2 border-yellow-500'
                  : isDarkMode
                  ? 'text-gray-400 hover:text-gray-200'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              ثبت نام
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto pb-8" style={{ maxHeight: 'calc(92vh - 120px)' }}>
          <div className="p-6">
            {activeTab === 'login' ? (
              // Login Form
              <form onSubmit={handleLogin} className="space-y-4" dir="rtl">
                <h2 className={`text-2xl font-bold text-center mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  ورود به حساب کاربری
                </h2>
                
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    placeholder="ایمیل"
                    className={`w-full pr-12 pl-4 py-4 rounded-xl border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    placeholder="رمز عبور"
                    className={`w-full pr-12 pl-12 py-4 rounded-xl border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <label className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    <input
                      type="checkbox"
                      checked={loginData.rememberMe}
                      onChange={(e) => setLoginData({ ...loginData, rememberMe: e.target.checked })}
                      className="ml-2 w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                    />
                    مرا به خاطر بسپار
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-black font-bold py-4 rounded-xl transition-colors"
                >
                  {isLoading ? 'در حال ورود...' : 'ورود'}
                </button>
              </form>
            ) : (
              // Signup Form
              <form onSubmit={handleSignup} className="space-y-4" dir="rtl">
                <h2 className={`text-2xl font-bold text-center mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  ایجاد حساب کاربری جدید
                </h2>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={signupData.firstName}
                      onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                      placeholder="نام"
                      className={`w-full pr-12 pl-4 py-4 rounded-xl border ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                      required
                    />
                  </div>

                  <div className="relative">
                    <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={signupData.lastName}
                      onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
                      placeholder="نام خانوادگی"
                      className={`w-full pr-12 pl-4 py-4 rounded-xl border ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'
                      } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                      required
                    />
                  </div>
                </div>

                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    placeholder="ایمیل"
                    className={`w-full pr-12 pl-4 py-4 rounded-xl border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                    required
                  />
                </div>

                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    value={signupData.phone}
                    onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                    placeholder="شماره تلفن"
                    className={`w-full pr-12 pl-4 py-4 rounded-xl border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    placeholder="رمز عبور"
                    className={`w-full pr-12 pl-12 py-4 rounded-xl border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={signupData.confirmPassword}
                    onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                    placeholder="تکرار رمز عبور"
                    className={`w-full pr-12 pl-12 py-4 rounded-xl border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-yellow-500`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-black font-bold py-4 rounded-xl transition-colors"
                >
                  {isLoading ? 'در حال ثبت نام...' : 'ثبت نام'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupCard;