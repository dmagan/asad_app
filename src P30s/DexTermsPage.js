import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftCircle, ChevronDown, ChevronUp, Search, X } from 'lucide-react';

const DexTermsPage = ({ isDarkMode, onBack }) => {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTerms, setFilteredTerms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showPage, setShowPage] = useState(false);
  const [pageExiting, setPageExiting] = useState(false);

  // اصطلاحات کریپتو - می‌توانید آن‌ها را تغییر دهید
const dexTerms = [
  {
    id: 1,
    question: "DEX (Decentralized Exchange)",
    answer: "صرافی غیرمتمرکز که بدون نیاز به واسطه و کنترل متمرکز، امکان خرید و فروش ارزهای دیجیتال را فراهم می‌کند.",
  },
  {
    id: 2,
    question: "Liquidity (نقدینگی)",
    answer: "میزان توکن‌های موجود در استخر نقدینگی که تعیین‌کننده راحتی خرید و فروش است.",
  },
  {
    id: 3,
    question: "Liquidity Pool (استخر نقدینگی)",
    answer: "مکانی که کاربران توکن‌های خود را در آن قرار می‌دهند تا ترید در دکس امکان‌پذیر شود.",
  },
  {
    id: 4,
    question: "Slippage (لغزش)",
    answer: "تفاوت بین قیمت مورد انتظار و قیمت واقعی انجام سفارش به دلیل نوسانات و کمبود نقدینگی.",
  },
  {
    id: 5,
    question: "Market Cap (ارزش بازار)",
    answer: "ارزش کلی یک توکن در بازار، محاسبه‌شده از ضرب قیمت در تعداد کل توکن‌های در گردش.",
  },
  {
    id: 6,
    question: "Volume (حجم معاملات)",
    answer: "میزان کلی توکن‌های معامله‌شده در یک بازه زمانی مشخص که نشان‌دهنده فعالیت بازار است.",  },
  {
    id: 7,
    question: "Tokenomics (اقتصاد توکن)",
    answer: "ساختار اقتصادی و ویژگی‌های یک توکن شامل عرضه، تقاضا و مکانیزم‌های توزیع.",
  },
  {
    id: 8,
    question: "Price Impact (تأثیر قیمت)",
    answer: "میزان تغییر قیمت به دلیل حجم خرید یا فروش بالا در یک استخر نقدینگی.",
  },
  {
    id: 9,
    question: "Rug Pull (راگ پول)",
    answer: "نوعی کلاهبرداری که توسعه‌دهندگان نقدینگی استخر را برداشت کرده و ارزش توکن را به صفر می‌رسانند.",
  },
  {
    id: 10,
    question: "Gas Fee (کارمزد گس)",
    answer: "هزینه پردازش تراکنش‌ها در شبکه‌های بلاک‌چین مانند اتریوم.",
  },
  {
    id: 11,
    question: "Whitelist (لیست سفید)",
    answer: "فهرست آدرس‌هایی که مجاز به شرکت در پیش‌فروش یا لانچ اولیه توکن هستند.",
  },
  {
    id: 12,
    question: "Blacklist (لیست سیاه)",
    answer: "فهرست آدرس‌هایی که از انجام تراکنش یا دسترسی به قرارداد هوشمند منع شده‌اند.",
  },
  {
    id: 13,
    question: "Scam (اسکم)",
    answer: "توکن یا پروژه‌ای که با هدف کلاهبرداری ایجاد شده و ارزش واقعی و بلندمدت ندارد.",
  },
  {
    id: 14,
    question: "FOMO (Fear of Missing Out)",
    answer: "ترس از جا ماندن از یک فرصت سرمایه‌گذاری که ممکن است به تصمیمات عجولانه منجر شود.",
  },
  {
    id: 15,
    question: "Pump and Dump (پامپ و دامپ)",
    answer: "افزایش مصنوعی قیمت توکن برای فروش در سقف و کسب سود سریع.",
  },
  {
    id: 16,
    question: "Honeypot (هانی‌پات)",
    answer: "قراردادی که اجازه خرید می‌دهد اما فروش را محدود یا مسدود می‌کند؛ تله سرمایه‌گذاران.",
  },
  {
    id: 17,
    question: "LP (Liquidity Provider)",
    answer: "فردی که توکن‌های خود را به استخر نقدینگی اضافه کرده و از کارمزد معاملات سود می‌برد.",
  },
  {
    id: 18,
    question: "Chart (نمودار)",
    answer: "نمایش گرافیکی از تغییرات قیمت و حجم معاملات در طول زمان برای تحلیل تکنیکال.",
  },
  {
    id: 19,
    question: "Pair (جفت معاملاتی)",
    answer: "دو توکن که در برابر یکدیگر معامله می‌شوند؛ مانند ETH/USDT.",
  },
  {
    id: 20,
    question: "ATH (All-Time High)",
    answer: "بالاترین قیمتی که یک توکن از زمان عرضه تا کنون ثبت کرده است.",
  },
  {
    id: 21,
    question: "ATL (All-Time Low)",
    answer: "پایین‌ترین قیمتی که یک توکن از زمان عرضه تا کنون ثبت کرده است.",
  },
  {
    id: 22,
    question: "Burn (توکن‌سوزی)",
    answer: "فرآیند حذف دائمی توکن‌ها از گردش برای کاهش عرضه کل.",
  },
  {
    id: 23,
    question: "Airdrop (ایردراپ)",
    answer: "توزیع رایگان توکن به کاربران خاص یا دارندگان قبلی توکن‌ها.",
  },
  {
    id: 24,
    question: "Presale (پیش‌فروش)",
    answer: "مرحله‌ای که توکن‌ها قبل از عرضه عمومی با قیمت پایین‌تر فروخته می‌شوند.",
  },
  {
    id: 25,
    question: "Smart Contract (قرارداد هوشمند)",
    answer: "برنامه‌ای خوداجرا روی بلاک‌چین که تراکنش‌ها را طبق شرایط از پیش تعریف‌شده اجرا می‌کند.",
  },
  {
    id: 26,
    question: "DYOR (Do Your Own Research)",
    answer: "اصطلاحی برای تأکید بر تحقیق شخصی قبل از سرمایه‌گذاری در هر پروژه.",
  },
  {
    id: 27,
    question: "APY (Annual Percentage Yield)",
    answer: "نرخ بازده سالانه برای سرمایه‌گذاری در استخرهای نقدینگی یا فارم‌ها با احتساب سود مرکب.",
  },
  {
    id: 28,
    question: "Bridge (بریج)",
    answer: "ابزاری برای انتقال دارایی‌ها بین بلاک‌چین‌های مختلف.",
  },
  {
    id: 29,
    question: "Liquidity Lock (قفل نقدینگی)",
    answer: "فرآیندی برای جلوگیری از برداشت نقدینگی استخر توسط توسعه‌دهندگان در مدت زمان مشخص.",
  },
  {
    id: 30,
    question: "Floor Price (قیمت کف)",
    answer: "پایین‌ترین قیمتی که فروشندگان حاضر به فروش توکن خود هستند.",
  },
  {
    id: 31,
    question: "Circulating Supply (عرضه در گردش)",
    answer: "مقدار توکن‌هایی که در حال حاضر در بازار در گردش هستند.",
  },
  {
    id: 32,
    question: "Fully Diluted Valuation (ارزش کامل رقیق‌شده)",
    answer: "ارزش کل بازار در صورت آزاد شدن همه توکن‌های قابل عرضه.",
  },
  {
    id: 33,
    question: "Token Swap (تعویض توکن)",
    answer: "تبدیل مستقیم یک توکن به توکن دیگر در یک صرافی غیرمتمرکز.",
  },
  {
    id: 34,
    question: "Bot (ربات)",
    answer: "برنامه‌های خودکار برای خرید و فروش سریع در صرافی‌های غیرمتمرکز.",
  }

];


  // تابع بستن صفحه با انیمیشن
  const handleClose = useCallback(() => {
    setPageExiting(true);
    setTimeout(() => {
      if (onBack) {
        onBack();
      } else {
        navigate(-1);
      }
    }, 300);
  }, [onBack, navigate]);

  // مدیریت انیمیشن ورود و دکمه برگشت
  useEffect(() => {
    // انیمیشن ورود
    setTimeout(() => {
      setShowPage(true);
    }, 100);

    const handleBackButton = () => {
      handleClose();
    };

    // شنونده برای رویداد popstate (فشردن دکمه برگشت)
    window.addEventListener('popstate', handleBackButton);
    
    // پاکسازی event listener
    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [handleClose]);

  // استخراج دسته‌بندی‌ها
  useEffect(() => {
    const uniqueCategories = [...new Set(dexTerms.map(term => term.category).filter(Boolean))];
    setCategories(uniqueCategories);
    setFilteredTerms(dexTerms);
  }, []);

  // فیلتر کردن اصطلاحات بر اساس جستجو و دسته‌بندی
  useEffect(() => {
    let results = [...dexTerms];
    
    // فیلتر بر اساس دسته‌بندی
    if (selectedCategory) {
      results = results.filter(term => term.category === selectedCategory);
    }
    
    // فیلتر بر اساس جستجو
    if (searchQuery.trim() !== '') {
      const normalizedQuery = searchQuery.trim().toLowerCase();
      results = results.filter(
        term => 
          term.question.toLowerCase().includes(normalizedQuery) || 
          term.answer.toLowerCase().includes(normalizedQuery)
      );
    }
    
    setFilteredTerms(results);
  }, [searchQuery, selectedCategory]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/40 overflow-hidden transition-opacity duration-300"
      style={{ 
        opacity: pageExiting ? 0 : (showPage ? 1 : 0),
        pointerEvents: showPage ? 'auto' : 'none',
        transition: 'opacity 0.3s ease-out'
      }}
    >
      <div 
        className={`fixed inset-0 w-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} shadow-lg transition-transform duration-300 ease-out`}
        style={{ 
          transform: pageExiting 
            ? 'translateX(100%)' 
            : `translateX(${showPage ? '0' : '100%'})`,
          transition: 'transform 0.3s cubic-bezier(0.17, 0.67, 0.24, 0.99), opacity 0.3s ease-out'
        }}
      >
        {/* Header */}
        <div className={`h-16 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} flex items-center px-4 relative border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button 
            onClick={handleClose}
            className={`absolute left-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}
          >
            <ArrowLeftCircle className="w-8 h-8" />
          </button>
          <h2 className={`w-full text-center text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            اصطلاحات دکس
          </h2>
        </div>

        {/* Search Bar */}
        <div className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className={`relative rounded-xl overflow-hidden border ${
            isDarkMode ? 'border-gray-700 bg-gray-700' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <Search size={18} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در اصطلاحات دکس..."
              className={`w-full p-3 pr-10 ${
                isDarkMode 
                  ? 'bg-gray-700 text-white placeholder-gray-400'
                  : 'bg-gray-50 text-gray-900 placeholder-gray-500'
              } focus:outline-none`}
              dir="rtl"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                <X size={16} />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {filteredTerms.length} نتیجه برای "{searchQuery}"
            </p>
          )}
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex overflow-x-auto py-2 px-4 gap-2 no-scrollbar">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                selectedCategory === null
                  ? isDarkMode
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-200 text-gray-900'
                  : isDarkMode
                  ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
              }`}
            >
              همه
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? isDarkMode
                      ? 'bg-gray-700 text-white'
                      : 'bg-gray-200 text-gray-900'
                    : isDarkMode
                    ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="absolute top-[149px] bottom-0 left-0 right-0 overflow-y-auto p-4">
          {filteredTerms.length === 0 ? (
            <div className={`flex flex-col items-center justify-center h-48 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <svg
                className="w-16 h-16 mb-4 opacity-30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="8" y1="11" x2="14" y2="11" strokeWidth="1.5" />
              </svg>
              <p>موردی یافت نشد</p>
            </div>
          ) : (
            <div className="space-y-3 pb-16 pt-4">
              {filteredTerms.map((term) => (
                <div 
                  key={term.id}
                  className={`rounded-xl border ${
                    isDarkMode 
                      ? 'border-gray-700 bg-gray-800' 
                      : 'border-gray-200 bg-white'
                  } transition-all duration-200 ${
                    expandedId === term.id
                      ? 'shadow-md'
                      : ''
                  }`}
                >
                  <button
                    onClick={() => toggleExpand(term.id)}
                    className="w-full px-4 py-3 flex items-center justify-between"
                  >
                    <div className="flex-1 text-right">
                      <span className={`font-medium ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {term.question}
                      </span>
                      {term.category && (
                        <div className="mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            isDarkMode
                              ? 'bg-gray-700 text-gray-300'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {term.category}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      {expandedId === term.id ? (
                        <ChevronUp className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} size={20} />
                      ) : (
                        <ChevronDown className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} size={20} />
                      )}
                    </div>
                  </button>
                  {expandedId === term.id && (
                    <div 
                      className={`px-4 pb-4 text-right leading-relaxed ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      {term.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Styles */}
        <style jsx global>{`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </div>
    </div>
  );
};

export default DexTermsPage;
