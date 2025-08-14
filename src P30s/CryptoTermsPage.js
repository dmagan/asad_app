import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftCircle, ChevronDown, ChevronUp, Search, X } from 'lucide-react';

const CryptoTermsPage = ({ isDarkMode, onBack }) => {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTerms, setFilteredTerms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showPage, setShowPage] = useState(false);
  const [pageExiting, setPageExiting] = useState(false);

  // اصطلاحات کریپتو - می‌توانید آن‌ها را تغییر دهید
const cryptoTerms = [
  {
    id: 1,
    question: "Support (حمایت)",
    answer: "قیمتی که معمولاً خریدارها از آن‌جا وارد می‌شن و قیمت رو بالا نگه می‌دارن.",
  },
  {
    id: 2,
    question: "Resistance (مقاومت)",
    answer: "سطحی که فروشنده‌ها زیاد می‌شن و مانع رشد قیمت می‌شن.",
  },
  {
    id: 3,
    question: "Breakout (شکست)",
    answer: "وقتی قیمت از سطح حمایت یا مقاومت عبور می‌کنه. نشونه‌ای از تغییر روند یا شروع حرکت قویه.",
  },
  {
    id: 4,
    question: "Fakeout (شکست فِیک)",
    answer: "شکست دروغین سطح؛ قیمت یه لحظه رد می‌کنه ولی سریع برمی‌گرده.",
  },
  {
    id: 5,
    question: "Pullback (پولبک)",
    answer: "برگشت موقت قیمت بعد از یه حرکت قوی. معمولاً فرصت ورود محسوب می‌شه.",  },
  {
    id: 6,
    question: "Consolidation (تحکیم)",
    answer: "وقتی قیمت توی یه محدوده‌ی کوچیک نوسان می‌کنه؛ بازار منتظر تصمیمه.",
  },
  {
    id: 7,
    question: "RSI (شاخص قدرت نسبی)",
    answer: "اندیکاتوری برای سنجش قدرت خرید و فروش. بالای ۷۰ اشباع خرید، زیر ۳۰ اشباع فروش.",
  },
  {
    id: 8,
    question: "MACD",
    answer: "اندیکاتوری برای تشخیص تغییر روند با تقاطع دو خط میانگین متحرک.",
  },
  {
    id: 9,
    question: "EMA / MA (میانگین متحرک)",
    answer: "میانگین‌های متحرک قیمت. جهت روند و سطوح حمایتی یا مقاومتی رو نشون می‌دن.",
  },
  {
    id: 10,
    question: "Volume (حجم معاملات)",
    answer: "نشان می‌ده چقدر خرید و فروش انجام شده. حجم زیاد یعنی اعتبار بیشتر در حرکت قیمت.",
  },
   {
    id: 11,
    question: "Divergence (واگرایی)",
    answer: "ناهمخوانی بین قیمت و اندیکاتور (مثلاً RSI). نشانه‌ای از ضعف روند فعلیه.",
  },
  {
    id: 12,
    question: "Trendline (خط روند)",
    answer: "خطی که روند کلی قیمت رو نشون می‌ده؛ می‌تونه حمایتی یا مقاومتی باشه.",
  },
  {
    id: 13,
    question: "Fibonacci Retracement (بازگشت فیبوناچی)",
    answer: "ابزار تحلیل برای پیش‌بینی سطوح بازگشت قیمت بعد از یک حرکت قوی.",
  },
  {
    id: 14,
    question: "Long Position (پوزیشن خرید)",
    answer: "خرید یک رمزارز با انتظار رشد قیمت.",
  },
  {
    id: 15,
    question: "Short Position (پوزیشن فروش)",
    answer: "فروش با انتظار کاهش قیمت؛ معمولاً با لوریج و در صرافی‌های خاص انجام می‌شه.",
  },
  {
    id: 16,
    question: "Entry / Exit (ورود / خروج)",
    answer: "زمان ورود به معامله و خروج از اون؛ باید بر اساس تحلیل دقیق انتخاب بشه.",
  },
  {
    id: 17,
    question: "Stop Loss (حد ضرر)",
    answer: "قیمتی که اگر بازار خلاف جهت بره، معامله بسته می‌شه تا از ضرر بیشتر جلوگیری شه.",
  },
  {
    id: 18,
    question: "Take Profit (حد سود)",
    answer: "قیمتی که وقتی بازار به اون می‌رسه، معامله با سود بسته می‌شه.",
  },
  {
    id: 19,
    question: "Risk to Reward (نسبت سود به ضرر)",
    answer: "مثلاً نسبت ۱:۳ یعنی یک واحد ضرر در برابر سه واحد سود.",
  },
  {
    id: 20,
    question: "Scalping (اسکالپینگ)",
    answer: "سبک معاملاتی سریع با سودهای کوچک و متعدد. نیاز به دقت و واکنش سریع داره.",
  },
  {
    id: 21,
    question: "Swing Trading (سوئینگ تریدینگ)",
    answer: "معامله در بازه‌ی زمانی چند روز تا چند هفته. بین هولد و اسکالپ قرار می‌گیره.",
  },
  {
    id: 22,
    question: "Day Trading (دی تریدینگ)",
    answer: "معامله‌هایی که در یک روز باز و بسته می‌شن و برای شب پوزیشنی باز نمی‌مونه.",
  },
  {
    id: 23,
    question: "Position Trading (پوزیشن تریدینگ)",
    answer: "نگهداری بلندمدت پوزیشن‌ها بر اساس تحلیل‌های کلان بازار.",
  },
  {
    id: 24,
    question: "PnL (سود و زیان)",
    answer: "سود و زیان در یک معامله یا بازه زمانی؛ در صرافی‌ها معمولاً به‌صورت درصدی نمایش داده می‌شه.",
  },
  {
    id: 25,
    question: "Risk Management (مدیریت ریسک)",
    answer: "استراتژی‌هایی برای حفظ سرمایه، مثل تعیین حجم معامله یا تعیین حد ضرر.",
  },
  {
    id: 26,
    question: "Total Supply (عرضه کل)",
    answer: "کل تعداد توکن‌هایی که وجود دارن؛ شامل توکن‌های در گردش و قفل‌شده.",
  },
  {
    id: 27,
    question: "Max Supply (حداکثر عرضه)",
    answer: "بیشترین مقدار توکن‌هایی که قرار ساخته بشن. عرضه محدود ضد تورمی محسوب می‌شه.",
  },
  {
    id: 28,
    question: "Inflationary / Deflationary (تورمی / ضد تورمی)",
    answer: "توکن‌های تورمی عرضه‌شون مدام افزایش پیدا می‌کنه؛ ضد تورمی‌ها با گذر زمان کاهش عرضه دارن.",
  },
  {
    id: 29,
    question: "Token Burn (سوزاندن توکن)",
    answer: "از بین بردن دائمی بخشی از توکن‌ها برای کاهش عرضه.",
  },
  {
    id: 30,
    question: "Governance (حاکمیت)",
    answer: "مکانیزم رأی‌گیری توسط دارندگان توکن برای تصمیم‌گیری درباره آینده پروژه.",
  },
  {
    id: 31,
    question: "Vesting Schedule (برنامه آزادسازی)",
    answer: "برنامه زمانی آزاد شدن توکن‌های اختصاص یافته به تیم یا سرمایه‌گذاران.",
  },
  {
    id: 32,
    question: "Lockup Period (دوره قفل شدن)",
    answer: "مدتی که توکن‌ها نمی‌تونن فروخته بشن؛ برای جلوگیری از فروش ناگهانی.",
  },
  {
    id: 33,
    question: "DAO Treasury (خزانه DAO)",
    answer: "صندوق مالی غیرمتمرکز که تحت رأی‌گیری کاربران خرج می‌شه.",
  },
  {
    id: 34,
    question: "Layer 1 (لایه اول)",
    answer: "بلاک‌چین‌های پایه مانند بیت‌کوین، اتریوم و سولانا.",
  },
  {
    id: 35,
    question: "Layer 2 (لایه دوم)",
    answer: "راه‌حل‌هایی برای افزایش مقیاس‌پذیری که بر روی بلاک‌چین‌های اصلی ساخته می‌شن.",
  },
  {
    id: 36,
    question: "Interoperability (تعامل‌پذیری)",
    answer: "توانایی بلاک‌چین‌ها برای ارتباط و تبادل داده یا توکن با یکدیگر.",
  },
  {
    id: 37,
    question: "Rollup",
    answer: "تکنولوژی‌ای برای تجمیع تراکنش‌ها و کاهش هزینه در لایه دوم.",
  },
  {
    id: 38,
    question: "zk-Rollup / Optimistic Rollup",
    answer: "دو نوع اصلی از Rollup ها که برای مقیاس‌پذیری اتریوم استفاده می‌شن.",
  },
  {
    id: 39,
    question: "Presale (پیش‌فروش)",
    answer: "فروش اولیه توکن قبل از عرضه رسمی؛ معمولاً با قیمت پایین‌تر و ریسک بیشتر.",
  },
  {
    id: 40,
    question: "Launchpad",
    answer: "پلتفرمی برای راه‌اندازی پروژه‌های جدید ارز دیجیتال.",
  },
  {
    id: 41,
    question: "Degen (دیجن)",
    answer: "اصطلاحی برای معامله‌گران پرریسک که بدون تحلیل وارد بازار می‌شن.",
  },
  {
    id: 42,
    question: "Fair Launch",
    answer: "عرضه‌ای بدون پیش‌فروش یا ماین اولیه که همه فرصت برابر دارن.",
  },
  {
    id: 43,
    question: "Sniper Bot",
    answer: "رباتی که در اولین ثانیه لانچ توکن وارد می‌شه و سریع می‌خره.",
  },
  {
    id: 44,
    question: "Honeypot",
    answer: "توکنی که فقط می‌شه خرید ولی نمی‌شه فروخت؛ نوعی تله.",
  },
  {
    id: 45,
    question: "Scam / Rug / Exit Scam",
    answer: "پروژه‌هایی که پس از جمع‌آوری پول ناگهان ناپدید می‌شن.",
  },
  {
    id: 46,
    question: "Yield Farming",
    answer: "قفل کردن دارایی برای دریافت سود یا توکن جایزه در پروتکل‌های DeFi.",
  },
  {
    id: 47,
    question: "APR / APY",
    answer: "APR سود سالانه بدون ترکیب؛ APY با احتساب سود مرکب.",
  },
  {
    id: 48,
    question: "Staking (استیکینگ)",
    answer: "قفل کردن ارز دیجیتال برای حمایت از شبکه و دریافت پاداش.",
  },
  {
    id: 49,
    question: "Lending / Borrowing",
    answer: "وام گرفتن یا دادن از طریق پروتکل‌های غیرمتمرکز بدون بانک.",
  },
  {
    id: 50,
    question: "AMM (بازارساز خودکار)",
    answer: "مکانیزم معاملات در صرافی‌های غیرمتمرکز بدون نیاز به خریدار و فروشنده همزمان.",
  },
  {
    id: 51,
    question: "NFT (توکن غیرقابل تعویض)",
    answer: "توکن منحصربه‌فرد برای نمایش مالکیت دیجیتال، مثل آثار هنری و آیتم‌های بازی.",
  },
  {
    id: 52,
    question: "Mint (مینت)",
    answer: "فرآیند ایجاد و ثبت اولین نسخه از NFT روی بلاک‌چین.",
  },
  {
    id: 53,
    question: "Royalties (حق امتیاز)",
    answer: "درصدی از فروش بعدی NFT که به خالق اصلی می‌رسد.",
  },
  {
    id: 54,
    question: "Rarity (نادر بودن)",
    answer: "ویژگی‌های خاص و کمیاب NFT که باعث ارزش بیشتر آن می‌شن.",
  },
  {
    id: 55,
    question: "Virtual Land (زمین مجازی)",
    answer: "زمین‌های دیجیتال در متاورس که قابل خرید و فروش هستند.",
  },
  {
    id: 56,
    question: "GameFi",
    answer: "ترکیب بازی و مالی غیرمتمرکز؛ با بازی کردن توکن دریافت می‌کنید.",
  },
  {
    id: 57,
    question: "Play-to-Earn",
    answer: "مدلی که در آن کاربران با بازی کردن درآمد دارند؛ اغلب با NFT یا توکن.",
  },
  {
    id: 58,
    question: "Metaverse (متاورس)",
    answer: "جهان مجازی سه‌بعدی که می‌توان در آن تعامل، خرید و کار انجام داد.",
  },
  {
    id: 59,
    question: "On-Chain Data (اطلاعات روی زنجیره)",
    answer: "اطلاعاتی که در بلاک‌چین ثبت شده‌اند مثل تراکنش‌ها و آدرس‌ها.",
  },
  {
    id: 60,
    question: "Whale Alert",
    answer: "سرویسی برای ردیابی تراکنش‌های بزرگ توسط نهنگ‌ها (دارندگان بزرگ).",
  },
  {
    id: 61,
    question: "Exchange Inflow / Outflow",
    answer: "ورود یا خروج ارز از صرافی‌ها. ورود زیاد ممکنه نشونه فروش باشه؛ خروج زیاد نشونه هولد.",
  },
  {
    id: 62,
    question: "Active Addresses (آدرس‌های فعال)",
    answer: "تعداد کیف پول‌هایی که در یک بازه زمانی مشخص فعالیت داشته‌اند؛ نشانه‌ای از مشارکت پروژه.",
  },
  {
    id: 63,
    question: "Dormant Supply (عرضه غیرفعال)",
    answer: "توکن‌هایی که مدت طولانی جابه‌جا نشده‌اند؛ نشان‌دهنده هولد بلندمدت.",
  },
  {
    id: 64,
    question: "Gas Fee (کارمزد گس)",
    answer: "هزینه انجام تراکنش‌ها در شبکه‌هایی مانند اتریوم.",
  },
  {
    id: 65,
    question: "Hashrate (قدرت هش)",
    answer: "میزان قدرت پردازشی شبکه برای استخراج. هرچه بیشتر، امنیت بالاتر.",
  },
  {
    id: 66,
    question: "Validator / Miner",
    answer: "افرادی که تراکنش‌ها را تأیید کرده و بلاک جدید تولید می‌کنند.",
  },
  {
    id: 67,
    question: "FUD (Fear, Uncertainty, Doubt)",
    answer: "ترس، عدم اطمینان و شک. شایعات منفی که باعث افت بازار می‌شن.",
  },
  {
    id: 68,
    question: "HODL",
    answer: "اصطلاحی برای نگهداری بلندمدت ارز دیجیتال؛ برگرفته از اشتباه تایپی HOLD.",
  },
  {
    id: 69,
    question: "Bagholder",
    answer: "فردی که یک توکن را در اوج خریده و در ضرر نگه داشته است.",
  },
  {
    id: 70,
    question: "Moon",
    answer: "اصطلاحی برای زمانی که قیمت یک ارز دیجیتال رشد شدیدی می‌کند. مانند: BTC to the moon!",
  },
  {
    id: 71,
    question: "REKT",
    answer: "اصطلاحی برای از دست دادن سنگین سرمایه در بازار؛ تلفظ شده‌ی 'wrecked'.",
  },
  {
    id: 72,
    question: "Shitcoin",
    answer: "توکن‌هایی بی‌ارزش و بدون آینده واقعی؛ معمولاً تبلیغاتی یا پامپی.",
  },
  {
    id: 73,
    question: "Pump and Dump",
    answer: "افزایش مصنوعی قیمت برای جذب خریداران و فروش در سقف توسط گروهی خاص.",
  },
  {
    id: 74,
    question: "Cold Wallet / Hardware Wallet",
    answer: "کیف پول آفلاین مانند Ledger یا Trezor برای نگهداری امن بلندمدت.",
  },
  {
    id: 75,
    question: "Airdrop Hunter",
    answer: "فردی که به دنبال پروژه‌هایی است که توکن رایگان (ایردراپ) می‌دهند.",
  },
  {
    id: 76,
    question: "Launch Timing",
    answer: "زمان‌بندی دقیق ورود به پروژه یا خرید توکن؛ مخصوصاً در لانچ‌پدها مهم است.",
  },
  {
    id: 77,
    question: "GWEI",
    answer: "واحد کوچکتر اتریوم برای نمایش کارمزد گس؛ هر ۱ ETH معادل ۱ میلیارد GWEI است.",
  },
  {
    id: 78,
    question: "Slippage Tolerance",
    answer: "درصدی از نوسان قیمت که در هنگام خرید قابل قبول در نظر گرفته می‌شود.",
  },
  {
    id: 79,
    question: "Watchlist",
    answer: "لیستی از ارزهایی که کاربر قصد دنبال کردن آن‌ها را دارد (مثل CoinGecko).",
  },
  {
    id: 80,
    question: "Alpha",
    answer: "اطلاعات ارزشمند و زودهنگام درباره پروژه‌ها؛ معمولاً در گروه‌های خاص یا VIP.",
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
    const uniqueCategories = [...new Set(cryptoTerms.map(term => term.category).filter(Boolean))];
    setCategories(uniqueCategories);
    setFilteredTerms(cryptoTerms);
  }, []);

  // فیلتر کردن اصطلاحات بر اساس جستجو و دسته‌بندی
  useEffect(() => {
    let results = [...cryptoTerms];
    
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
            اصطلاحات کریپتو
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
              placeholder="جستجو در اصطلاحات کریپتو..."
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

export default CryptoTermsPage;