import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, LogOut, Package, ShoppingCart, User } from 'lucide-react';
import ProductSkeleton from './ProductSkeleton';
import VIPPage from './VIP-Service-Page';

const formatDate = (date) => 
  date.toLocaleDateString('en-GB', {
    day:   'numeric',
    month: 'long',
    year:  'numeric'
  });

const ProfilePage = ({ isDarkMode, setIsLoggedIn, onLogout }) => {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [showCard, setShowCard] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const cardRef = useRef(null);
  const isDragging = useRef(false);
  const startY = useRef(0);
  const [isLandscape, setIsLandscape] = useState(window.innerHeight < window.innerWidth);
  const [purchasedProducts, setPurchasedProducts] = useState([]);

  useEffect(() => {
    const storedInfo = localStorage.getItem('userInfo') || sessionStorage.getItem('userInfo');
    if (storedInfo) {
      try {
        const parsedInfo = JSON.parse(storedInfo);
        setUserInfo(parsedInfo);
      } catch (error) {
        console.error('خطا در پردازش اطلاعات کاربر:', error);
      }
    }
    
    setTimeout(() => {
      setShowCard(true);
    }, 100);
  }, []);
  
  useEffect(() => {
    if (userInfo?.user_email) {
      loadPurchasedProducts();
    }
  }, [userInfo]);

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
  }, [isLandscape]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [isLoading]);

  const closeCard = () => {
    setShowCard(false);
    setTimeout(() => {
      navigate(-1);
    }, 300);
  };

  const handleLogout = () => {
    // پاک کردن اطلاعات کاربر
    localStorage.removeItem('userToken');
    localStorage.removeItem('userInfo');
    sessionStorage.removeItem('userToken');
    sessionStorage.removeItem('userInfo');
    // پاک کردن کش محصولات
    localStorage.removeItem('purchasedProducts');
    localStorage.removeItem('purchasedProductsTime');
    localStorage.removeItem('lastProductCheck');
    sessionStorage.removeItem('purchasedProducts');
    sessionStorage.removeItem('lastProductCheck');
    
    setIsLoggedIn(false);
    onLogout?.();
    navigate('/');
  };

  // تابع loadPurchasedProducts بهبود یافته
  const loadPurchasedProducts = async () => {
    try {
      setIsLoading(true);
      
      if (!userInfo?.user_email) {
        setPurchasedProducts([]);
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      if (!token) {
        setPurchasedProducts([]);
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await fetch('https://p30s.com/wp-json/pcs/v1/user-purchases', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success && Array.isArray(data.purchases)) {
            // گروه‌بندی اشتراک‌ها براساس نوع 
            const groupedSubscriptions = {};
            
            data.purchases.forEach(purchase => {
  let subscriptionType = 'other';
  if (purchase.isVIP) subscriptionType = 'vip';
  else if (purchase.title && purchase.title.includes('دکس')) subscriptionType = 'dex';
  else if (purchase.title && (purchase.title.includes('صفر تا صد') || purchase.title.includes('0 تا 100'))) 
    subscriptionType = 'zero-to-100';
  else if (purchase.title && (purchase.title.includes('سیگنال') || purchase.title.includes('Signal'))) 
    subscriptionType = 'signal';
  // اضافه کردن شرط برای دوره ترید حرفه‌ای
  else if (purchase.title && purchase.title.includes('ترید حرفه‌ای'))
    subscriptionType = 'trade-pro';
    
  if (!groupedSubscriptions[subscriptionType]) {
    groupedSubscriptions[subscriptionType] = [];
  }
  groupedSubscriptions[subscriptionType].push(purchase);
});
            
            // استخراج آخرین اشتراک فعال از هر گروه
            const activeSubscriptions = [];
            
            Object.keys(groupedSubscriptions).forEach(type => {
              const typeSubscriptions = groupedSubscriptions[type];
              
              typeSubscriptions.sort((a, b) => {
                const dateA = new Date(a.date || a.purchase_date || a.lastUpdated || a.createdAt);
                const dateB = new Date(b.date || b.purchase_date || b.lastUpdated || b.createdAt);
                return dateB - dateA;  
              });
              
              const activeSubscription = typeSubscriptions.find(sub => sub.status === 'active');
              if (activeSubscription) {
                activeSubscriptions.push(activeSubscription);
              } else if (typeSubscriptions.length > 0) {
                activeSubscriptions.push(typeSubscriptions[0]);
              }
            });
            
            // تبدیل به فرمت مورد نیاز برای نمایش
            const products = activeSubscriptions.map(purchase => {
              let title = purchase.title;
              if (purchase.isVIP) {
                const baseTitle = title
                  .replace(/^اشتراک\s*/, '')
                  .replace(/VIP\s*/g, '')
                  .trim();
                title = `اشتراک VIP ${baseTitle}`;
              }
              
              const productData = {
                id: purchase.id,
                title: title,
                date: new Date(purchase.date || purchase.purchase_date || purchase.lastUpdated || purchase.createdAt),
                status: purchase.status,
                remainingDays: purchase.remainingDays,
                isVIP: purchase.isVIP,
                isDex: purchase.title && purchase.title.includes('دکس'),
                lastUpdated: purchase.lastUpdated,
                transactionHash: purchase.transactionHash
              };
              
              return {
                ...productData,
                icon: productData.isVIP ? <ShoppingCart className="w-6 h-6" /> : <Package className="w-6 h-6" />
              };
            });
            
            const productsForCache = products.map(({ icon, ...rest }) => rest);
            localStorage.setItem('purchasedProducts', JSON.stringify(productsForCache));
            localStorage.setItem('lastProductCheck', new Date().getTime().toString());
            sessionStorage.setItem('purchasedProducts', JSON.stringify(productsForCache));
            sessionStorage.setItem('lastProductCheck', new Date().getTime().toString());
            
            setPurchasedProducts(products);
            return;
          }
        }
        
        throw new Error('API پاسخ مناسب نداد');
        
      } catch (apiError) {
        console.warn('خطا در استفاده از API اصلی، استفاده از داده‌های کش شده...', apiError);
        
        const cachedData = localStorage.getItem('purchasedProducts');
        if (cachedData) {
          try {
            const parsedProducts = JSON.parse(cachedData);
            
            const groupedSubscriptions = {};
            
           // در بخش catch که از کش استفاده می‌کند:
parsedProducts.forEach(product => {
  let subscriptionType = 'other';
  if (product.isVIP) subscriptionType = 'vip';
  else if (product.title && product.title.includes('دکس')) subscriptionType = 'dex';
  else if (product.title && (product.title.includes('صفر تا صد') || product.title.includes('0 تا 100'))) 
    subscriptionType = 'zero-to-100';
  else if (product.title && (product.title.includes('سیگنال') || product.title.includes('Signal'))) 
    subscriptionType = 'signal';
  // اضافه کردن شرط برای دوره ترید حرفه‌ای
  else if (product.title && product.title.includes('ترید حرفه‌ای'))
    subscriptionType = 'trade-pro';
    
  if (!groupedSubscriptions[subscriptionType]) {
    groupedSubscriptions[subscriptionType] = [];
  }
  groupedSubscriptions[subscriptionType].push(product);
});
            
            const activeSubscriptions = [];
            
            Object.keys(groupedSubscriptions).forEach(type => {
              const typeSubscriptions = groupedSubscriptions[type];
              
              typeSubscriptions.sort((a, b) => {
                const dateA = new Date(a.date || a.purchase_date || a.lastUpdated || a.createdAt);
                const dateB = new Date(b.date || b.purchase_date || b.lastUpdated || b.createdAt);
                return dateB - dateA;
              });
              
              const activeSubscription = typeSubscriptions.find(sub => sub.status === 'active');
              if (activeSubscription) {
                activeSubscriptions.push(activeSubscription);
              } else if (typeSubscriptions.length > 0) {
                activeSubscriptions.push(typeSubscriptions[0]);
              }
            });
            
            const productsWithIcons = activeSubscriptions.map(product => ({
              ...product,
              date: new Date(product.date || product.purchase_date || product.lastUpdated || product.createdAt),
              icon: product.isVIP ? <ShoppingCart className="w-6 h-6" /> : <Package className="w-6 h-6" />
            }));
            
            setPurchasedProducts(productsWithIcons);
          } catch (cacheError) {
            console.error('Error parsing cached data:', cacheError);
            setPurchasedProducts([]);
          }
        } else {
          setPurchasedProducts([]);
        }
      }
    } catch (error) {
      console.error('Error loading purchased products:', error);
      setPurchasedProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

const handleRenewal = (product) => {
  setShowCard(false);
  
  sessionStorage.setItem('renewProduct', JSON.stringify({
    id: product.id,
    title: product.title,
    isVIP: product.isVIP,
    isDex: product.title.includes('دکس'),
    isTradePro: product.title.includes('ترید حرفه‌ای')
  }));
  
  setTimeout(() => {
    if (product.isVIP) {
      navigate('/vip-services', { state: { renewal: true } });
    } else if (product.title.includes('دکس')) {
      navigate('/dex-services', { state: { renewal: true } });
    } else if (product.title.includes('صفر تا صد') || product.title.includes('0 تا 100')) {
      navigate('/0to100-services', { state: { renewal: true } });
    } else if (product.title.includes('سیگنال') || product.title.includes('Signal')) {
      navigate('/signal-stream', { state: { renewal: true } });
    } else if (product.title.includes('ترید حرفه‌ای')) {
      navigate('/tradepro', { state: { renewal: true } });
    } else {
      navigate('/products', { state: { renewal: true } });
    }
  }, 300);
};

  return (
    <div className="fixed inset-0 z-50 bg-black/75 overflow-hidden transition-opacity duration-300"
    onClick={(e) => {
      if (e.target === e.currentTarget) {
        closeCard();
      }
    }}
      style={{ 
        opacity: showCard ? 1 : 0,
        pointerEvents: showCard ? 'auto' : 'none'
      }}>
      <div 
        ref={cardRef}
        className={`fixed bottom-0 left-0 right-0 w-full ${
          isDarkMode ? 'bg-[#0d1822]' : 'bg-white'
        } rounded-t-3xl shadow-lg transition-transform duration-300 ease-out ${
          isLandscape ? 'h-screen overflow-y-auto' : 'max-h-[92vh] overflow-hidden'
        }`}
        style={{ 
          transform: `translateY(${showCard ? '0' : '100%'})`,
          touchAction: isLandscape ? 'auto' : 'none',
        }}
      >
        <div className="pt-2 relative">
          <div className="w-24 h-1 bg-gray-300 rounded-full mx-auto" />
          
          <button 
            onClick={closeCard}
            className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>
  
        <div className="scrollable-content h-full overflow-y-auto pb-safe">
          <div className="px-6 pb-8 pt-4">
            <div className="mb-2 text-center pt-4">
              <div className="w-16 h-16 bg-[#f7d55d] rounded-full mx-auto mb-2 flex items-center justify-center">

                <User className="w-8 h-8 text-white" />
              </div>
               <h1 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
   {userInfo?.user_display_name || 'کاربر'}
 </h1>
 {userInfo?.user_registered && (
   <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
     {new Date(userInfo.user_registered).toLocaleDateString('fa-IR')} — {formatDate(new Date(userInfo.user_registered))}
   </p>
 )}
            </div>
  
  <div className="space-y-2 text-right" dir="rtl">
              <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4 `}>
                اشتراک‌های شما
              </h2>
              
              {isLoading ? (
                <>
                  <ProductSkeleton isDarkMode={isDarkMode} />
                  <ProductSkeleton isDarkMode={isDarkMode} />
                  <ProductSkeleton isDarkMode={isDarkMode} />
                </>
              ) : purchasedProducts.length > 0 ? (
                purchasedProducts.map(product => (
                  <div key={product.id} className={`p-2 rounded-xl border ${isDarkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900'}`}>

                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-base">{product.title}</h3>
                          <div className="flex items-center justify-between mt-1">
                            <div className="flex flex-col">
                              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {new Date(product.date).toLocaleDateString('fa-IR')} — {formatDate(new Date(product.date))}
                              </p>
                              {product.status === 'active' && (
  <p className="text-sm text-yellow-500">
    {product.title.includes('دکس تریدینگ') || 
     product.title.includes('صفر تا صد') || 
     product.title.includes('0 تا 100') || 
     product.title.includes('۰ تا ۱۰۰') || 
     product.title.includes('ترید حرفه‌ای') || 
     product.remainingDays === 'unlimited' ? 
      'دسترسی نامحدود' : 
      `روزهای باقیمانده: ${product.remainingDays}`
    }
  </p>
)}  
                            </div>
                            <span className={`text-sm ${product.status === 'active' ? 'text-green-500' : 'text-red-500'}`}>
                              {product.status === 'active' ? 'فعال' : 'منقضی شده'}
                            </span>
                          </div>
                        </div>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          product.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                          {product.icon}
                        </div>
                      </div>
                      {product.status !== 'active' && (
                       <button 
                       onClick={() => handleRenewal(product)} 
                       className="w-full bg-[#f7d55d] text-gray-900 py-3 rounded-xl text-sm"
                     >
                       تمدید اشتراک
                     </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className={`text-center p-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  هیچ اشتراکی یافت نشد
                </div>
              )}
  
              <button
                onClick={handleLogout}
                className="w-full mt-6 bg-red-500 text-white rounded-xl py-3 text-sm font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                خروج از حساب کاربری
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;