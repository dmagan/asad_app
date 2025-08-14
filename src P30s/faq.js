import PageTransition from './components/PageTransition';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftCircle, ChevronDown, ChevronUp, RefreshCw, Search, X } from 'lucide-react';
import { Store } from 'react-notifications-component';
import faqService from './FaqService';

const FaqPage = ({ isDarkMode , onBack }) => {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOn, setFilterOn] = useState(false);
  const [filteredFaqs, setFilteredFaqs] = useState([]);
  const isInitializedRef = React.useRef(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const initializeFaqs = async () => {
      try {
        setLoading(true);
        await faqService.start();
        isInitializedRef.current = true;
      } catch (error) {
        //console.error('Error initializing FAQ service:', error);
        Store.addNotification({
          title: "خطا",
          message: "مشکلی در بارگذاری سوالات متداول پیش آمد",
          type: "warning",
          insert: "top",
          container: "center",
          dismiss: { duration: 3000 }
        });
      } finally {
        setLoading(false);
      }
    };

    initializeFaqs();

    return () => {
      faqService.stop();
    };
  }, []);

  // استخراج دسته‌بندی‌ها
  useEffect(() => {
    const handleFaqUpdate = (data) => {
      setFaqs(data.faqs);
      setFilteredFaqs(data.faqs);
      setIsSyncing(data.isSyncing);
      setLastSyncTime(data.lastSyncTime);
      setLoading(false);
      
      // دسته‌بندی‌هایی که باید حذف شوند
      const excludedCategories = ['عمومی', '', 'همه', null];
      
      // استخراج دسته‌بندی‌های معتبر
      const validCategories = data.faqs
        .map(faq => faq.category)
        .filter(category => category && !excludedCategories.includes(category));
      
      // حذف موارد تکراری
      const uniqueCategories = [...new Set(validCategories)];
      
      // ذخیره دسته‌بندی‌ها اگر وجود داشته باشند
      setCategories(uniqueCategories.length > 0 ? uniqueCategories : []);
    };

    faqService.addListener(handleFaqUpdate);

    return () => {
      faqService.removeListener(handleFaqUpdate);
    };
  }, []);

  // فیلتر کردن سوالات بر اساس جستجو و دسته‌بندی
  useEffect(() => {
    let results = [...faqs];
    
    // فیلتر بر اساس دسته‌بندی
    if (selectedCategory) {
      results = results.filter(faq => faq.category === selectedCategory);
    }
    
    // فیلتر بر اساس جستجو
    if (searchQuery.trim() !== '') {
      const normalizedQuery = searchQuery.trim().toLowerCase();
      results = results.filter(
        faq => 
          faq.question.toLowerCase().includes(normalizedQuery) || 
          faq.answer.toLowerCase().includes(normalizedQuery)
      );
      setFilterOn(true);
    } else {
      setFilterOn(false);
    }
    
    setFilteredFaqs(results);
  }, [searchQuery, faqs, selectedCategory]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  
  const handleRefresh = async () => {
    try {
      await faqService.syncFaqs();
    } catch (error) {
      //console.error('Error refreshing FAQs:', error);
      Store.addNotification({
        title: "خطا",
        message: "خطا در بروزرسانی سوالات متداول",
        type: "danger",
        insert: "top",
        container: "center",
        dismiss: { duration: 3000 }
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // حذف تابع renderCategories که دیگر استفاده نمی‌شود

  return (
    <div className={`fixed inset-0 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Header */}
      <div className={`h-16 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} flex items-center px-4 relative border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <button 
          onClick={onBack || (() => navigate(-1))}
          className={`absolute left-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}
        >
          <ArrowLeftCircle className="w-8 h-8" />
        </button>
        <h2 className={`w-full text-center text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          سوالات متداول
        </h2>
        <button 
          onClick={handleRefresh}
          disabled={isSyncing}
          className={`absolute right-4 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          } ${isSyncing ? 'opacity-50' : 'hover:text-blue-500'}`}
        >
          <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
        </button>
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
            placeholder="جستجو در سوالات متداول..."
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
        {filterOn && (
          <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {filteredFaqs.length} نتیجه برای "{searchQuery}"
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

      {/* Last update info */}
      {lastSyncTime && (
        <div className={`px-4 py-2 text-center text-xs ${
          isDarkMode ? 'text-gray-400 bg-gray-800/80' : 'text-gray-500 bg-gray-100/80'
        }`}>
          آخرین بروزرسانی: {formatDate(lastSyncTime)}
        </div>
      )}

      {/* Spacer - فضای خالی اضافه */}
      <div className="h-6"></div>

      {/* FAQ Content */}
      <div className="absolute top-[197px] bottom-0 left-0 right-0 overflow-y-auto p-4">
        {loading ? (
          <div className="flex flex-col space-y-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className={`rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                <div className="px-4 py-3 animate-pulse flex justify-between items-center">
                  <div className={`h-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded w-3/4`}></div>
                  <div className={`h-4 w-4 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className={`flex flex-col items-center justify-center h-48 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {filterOn ? (
              <>
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
                <p>موردی با عبارت جستجوشده یافت نشد</p>
              </>
            ) : (
              <>
                <svg
                  className="w-16 h-16 mb-4 opacity-30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <p>سوالی یافت نشد</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3 pb-16">
            {filteredFaqs.map((faq) => (
              <div 
                key={faq.id}
                className={`rounded-xl border ${
                  isDarkMode 
                    ? 'border-gray-700 bg-gray-800' 
                    : 'border-gray-200 bg-white'
                } transition-all duration-200 ${
                  expandedId === faq.id
                    ? 'shadow-md'
                    : ''
                }`}
              >
                <button
                  onClick={() => toggleExpand(faq.id)}
                  className="w-full px-4 py-3 flex items-center justify-between"
                >
                  <div className="flex-1 text-right">
                    <span className={`font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {faq.question}
                    </span>
                    {faq.category && !['عمومی', ''].includes(faq.category) && (
                      <div className="mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          isDarkMode
                            ? 'bg-gray-700 text-gray-300'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {faq.category}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-2 flex-shrink-0">
                    {expandedId === faq.id ? (
                      <ChevronUp className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} size={20} />
                    ) : (
                      <ChevronDown className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} size={20} />
                    )}
                  </div>
                </button>
                {expandedId === faq.id && (
                  <div 
                    className={`px-4 pb-4 text-right leading-relaxed ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    {faq.rawAnswer ? (
                      <div dangerouslySetInnerHTML={{ __html: faq.rawAnswer }} className="faq-content" />
                    ) : (
                      faq.answer
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* اضافه کردن استایل برای محتوای HTML در پاسخ‌ها */}
      <style jsx global>{`
        .faq-content a {
          color: #3b82f6;
          text-decoration: underline;
        }
        
        .faq-content ol {
          list-style-type: decimal;
          padding-right: 1.5rem;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }
        
        .faq-content ul {
          list-style-type: disc;
          padding-right: 1.5rem;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }
        
        .faq-content p {
          margin-bottom: 0.75rem;
        }
        
        .faq-content h3, .faq-content h4 {
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        
        .faq-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.375rem;
          margin: 0.5rem 0;
        }
        
        .faq-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }
        
        .faq-content th, .faq-content td {
          border: 1px solid #d1d5db;
          padding: 0.5rem;
          text-align: right;
        }
        
        .faq-content th {
          background-color: #f3f4f6;
        }
        
        .dark .faq-content th, .dark .faq-content td {
          border-color: #4b5563;
        }
        
        .dark .faq-content th {
          background-color: #374151;
        }
        
        .dark .faq-content a {
          color: #60a5fa;
        }
        
        @media (max-width: 640px) {
          .faq-content table {
            display: block;
            overflow-x: auto;
          }
        }
        
        /* Hide scrollbar for Chrome, Safari and Opera */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        /* Hide scrollbar for IE, Edge and Firefox */
        .no-scrollbar {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }
      `}</style>
    </div>
  );
};

export default FaqPage;