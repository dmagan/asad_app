import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PaymentCard from './PaymentCard';
import LoginPage from './LoginPage';
import { PRODUCT_PRICES } from './config';

const BuyPage = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const [showPaymentCard, setShowPaymentCard] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPage, setShowLoginPage] = useState(false);

  // بررسی وضعیت لاگین
  useEffect(() => {
    const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
    setIsLoggedIn(!!token);
  }, []);

  // لیست محصولات
  const products = [
    {
      id: 'vip',
      title: 'اشتراک VIP (6 ماهه)',
      price: PRODUCT_PRICES.VIP.SIX_MONTHS,
      description: 'سیگنال‌های پامپی دقیق /  تحلیل‌های اختصاصی تیم PCS / دسترسی به سیگنال هایی که جای دیگه پیدا نمی‌شه / با دادن نقطه ورود و خروج دقیق(چی زمان بفروشی چی زمان بخری)',
      imageSrc: '/Services/vip.jpg'
    },
    {
      id: 'mimcoin',
      title: 'کانال میم کوین باز (ماهیانه) ',
      price: PRODUCT_PRICES.MEM_COIN,
      description: 'استراتژی‌های حرفه‌ای میم کوین',
      imageSrc: '/Services/mimCoin.jpg'
    },
    {
      id: 'dex',
      title: 'آموزش دکس تریدینگ',
      price: PRODUCT_PRICES.DEX,
      description: 'پیدا کردن میم‌کوین‌های پامپی 10 تا 200 برابر / فهمیدن ارز های اسکم و شناسایی دقیق / تکنیکال مخصوص میم کوینها',
      imageSrc: '/Services/dex.jpg'
    },
    {
      id: 'zero-to-100',
      title: 'آموزش صفر تا صد کریپتو',
      price: PRODUCT_PRICES.ZERO_TO_100,
      description: 'پایه برای افراد تازه وارد / آموزش صفر تا صد بازار کریپتو  تمامی مسیر درامد زایی  از کریپتو',
      imageSrc: '/Services/0to100.jpg'
    },
    
    {
      id: 'tradepro',
      title: 'MASTER TRADING',
      price: PRODUCT_PRICES.TRADE_PRO,
      description: 'نهنگ ها چگونه ترید میکنن : تمام استراتیژی هایی که برای تبدیل شدن به یک تریدر حرفه‌ای نیاز داری تا استاد شوی',
      imageSrc: '/Services/TradePro.jpg'
    }
  ];

  const handleProductSelect = (product) => {
    if (!isLoggedIn) {
      // اگر لاگین نیست، محصول را ذخیره کن و صفحه لاگین را باز کن
      setSelectedProduct(product);
      setShowLoginPage(true);
      return;
    }
    
    // اگر لاگین است، مستقیماً کارت پرداخت را باز کن
    setSelectedProduct(product);
    setShowPaymentCard(true);
  };

  // تابع برای هندل کردن موفقیت آمیز لاگین
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setShowLoginPage(false);
    
    // بعد از لاگین موفق، کارت پرداخت را باز کن
    if (selectedProduct) {
      setShowPaymentCard(true);
    }
  };

  // تابع برای بستن صفحه لاگین
  const handleLoginClose = () => {
    setShowLoginPage(false);
    setSelectedProduct(null);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Header */}
<div className={`sticky top-0 z-20 ${
  isDarkMode 
    ? 'bg-gradient-to-b from-gray-800 to-gray-900' 
    : 'bg-gradient-to-b from-white to-gray-100'
}`}>
        <div className="flex items-center justify-center p-2">
          <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
یک بار برای همیشه با ضرر خداحافظی کن
          </h1>
        </div>
         </div>
{/* Shop Image */}  
<div className="pb-2 relative">
  <div className="w-full relative">
    <img 
      src="/shop.png" 
      alt="Shop" 
      className="w-full h-64 object-cover"
    />
  </div>
</div>
{/* Text under image */}
<div className="px-4 pb-4 ">
  <p className={`text-center  leading-relaxed ${isDarkMode ? 'text-white' : 'text-gray-900'}`} dir="rtl">
    من اسد هستم. سالها تجربه در بازار کریپتو، راهی که خودم رفتم را حالا به ساده‌ترین شکل برات آموزش میدم. از صفر تا درآمد ماهانه عالی
  </p>
</div>


     


      {/* Products List */}
      <div className="p-4">
        <div className="grid grid-cols-1 gap-4" dir="rtl">
          {products.map((product) => (
            <div 
              key={product.id}
              onClick={() => handleProductSelect(product)}
              className={`p-4 rounded-2xl flex items-center gap-3 border-2 cursor-pointer hover:opacity-80 transition-opacity ${
                isDarkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900'
              }`}
            >
              <div className="w-16 h-16 rounded-xl flex items-center justify-center">
                <img 
                  src={product.imageSrc} 
                  alt={product.title} 
                  className="w-full h-full object-cover rounded-lg" 
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`font-medium text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {product.title}
                  </h3>
                  <span className={`font-black text-xl ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    ${product.price}
                  </span>
                </div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {product.description}
                </p>
              </div>
            </div>
          ))}
          





            <div 
onClick={() => window.open('https://t.me/Asadmindset_TeamSupport', '_blank')}
            className={`p-4 rounded-2xl flex items-center gap-3 border-2 cursor-pointer hover:opacity-80 transition-opacity ${
              isDarkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900'
            }`}
          >
            <div className="w-16 h-16 rounded-xl flex items-center justify-center">
              <div className="w-16 h-16 flex items-center justify-center">
                <img src="/icons/telegram-icon.png" alt="Telegram" className="w-12 h-12" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className={`font-medium text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                پشتیبانی تلگرام
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                ارتباط مستقیم از طریق تلگرام
              </p>
            </div>
          </div>

          {/* Download App Button */}
          <div 
            onClick={() => window.open('https://persiancryptosource.com/download/', '_blank')}
            className={`p-4 rounded-2xl flex items-center gap-3 border-2 cursor-pointer hover:opacity-80 transition-opacity ${
              isDarkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900'
            }`}
          >
            <div className="w-16 h-16 rounded-xl flex items-center justify-center">
              <div className="w-16 h-16 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-xl flex items-center justify-center">
              <div className="w-16 h-16 flex items-center justify-center">
                <img src="/icons/download.png" alt="Download" className="w-12 h-12" />
              </div>
            </div>

              </div>
            </div>
            <div className="flex-1">
              <h3 className={`font-medium text-base ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                دانلود اپ
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                نصب اپلیکیشن موبایل
              </p>
            </div>
          </div>
          
        </div>
      </div>

      {/* Login Page */}
      {showLoginPage && (
        <LoginPage
          isDarkMode={isDarkMode}
          setIsLoggedIn={handleLoginSuccess}
          onClose={handleLoginClose}
          defaultTab="register"
        />
      )}

      {/* Payment Card */}
      {showPaymentCard && selectedProduct && (
        <PaymentCard
          isDarkMode={isDarkMode}
          onClose={() => {
            setShowPaymentCard(false);
            setSelectedProduct(null);
          }}
          productTitle={selectedProduct.title}
          price={selectedProduct.price}
        />
      )}

      {/* Login Page */}
      {showLoginPage && (
        <LoginPage
          isDarkMode={isDarkMode}
          setIsLoggedIn={handleLoginSuccess}
          onClose={handleLoginClose}
          defaultTab="register"
        />
      )}

      {/* Payment Card */}
      {showPaymentCard && selectedProduct && (
        <PaymentCard
          isDarkMode={isDarkMode}
          onClose={() => {
            setShowPaymentCard(false);
            setSelectedProduct(null);
          }}
          productTitle={selectedProduct.title}
          price={selectedProduct.price}
        />
      )}
    </div>
  );
};

export default BuyPage;