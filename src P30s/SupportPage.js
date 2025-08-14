import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftCircle, Send, RefreshCw } from 'lucide-react';
import { Store } from 'react-notifications-component';
import MessageSkeleton from './MessageSkeleton';
import messageService from './MessageService';
import FaqPage from './faq';
import supportNotificationService from './SupportNotificationService';


// کامپوننت نمایش هر پیام
const ChatMessage = ({ message, isDarkMode }) => {
  const formattedDate = new Date(message.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const formattedTime = new Date(message.date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  return (
    <div className={`flex w-full ${message.isAdmin ? 'justify-start' : 'justify-end'} mb-4`}>
      <div
        className={`max-w-[80%] rounded-2xl p-4 relative ${
          message.isAdmin
            ? isDarkMode
              ? 'bg-gray-700'
              : 'bg-gray-100'
            : 'bg-[#f7d55d]'
        }`}
      >
        <div
          className={`text-sm message-content ${
            message.isAdmin
              ? isDarkMode
                ? 'text-white'
                : 'text-gray-800'
              : 'text-gray-900'
          }`}
          dangerouslySetInnerHTML={{ __html: message.content }}
        />
        <div className="flex justify-end items-center gap-2 mt-2">
          <span
            className={`text-xs ${
              message.isAdmin
                ? isDarkMode
                  ? 'text-gray-400'
                  : 'text-gray-500'
                : 'text-gray-700'
            }`}
          >
            {formattedTime}
          </span>
          <span
            className={`text-xs ${
              message.isAdmin
                ? isDarkMode
                  ? 'text-gray-400'
                  : 'text-gray-500'
                : 'text-gray-700'
            }`}
          >
            {formattedDate}
          </span>
          {!message.isAdmin && (
            <div className="flex items-center">
              {message.isPending ? (
                <svg
                  className="w-3 h-3 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-3 h-3 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 12l5 5L20 7"
                  />
                </svg>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
const SupportPage = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [activeTicketId, setActiveTicketId] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const cardRef = useRef(null);
  const [showCard, setShowCard] = useState(false);
  const [showFaq, setShowFaq] = useState(false);
  const messagesEndRef = useRef(null);
  const isInitializedRef = useRef(false);
  const firstLoadRef = useRef(true);
  const inputRef = useRef(null);
  const pendingMessagesRef = useRef(new Map());
  const [supportExiting, setSupportExiting] = useState(false);
  const [faqExiting, setFaqExiting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // فرض می‌کنیم کاربر لاگین است

  // استایل‌های سراسری برای متن‌های دوزبانه
  const globalBidiCss = `
    .message-content {
      direction: rtl;
      text-align: right;
      unicode-bidi: plaintext;
    }
    .message-content p {
      direction: rtl;
      text-align: right;
      unicode-bidi: plaintext;
    }
    .message-content div {
      direction: rtl;
      text-align: right;
      unicode-bidi: plaintext;
    }
    .message-content * [lang="en"],
    .message-content .en,
    .message-content code,
    .message-content pre {
      direction: ltr;
      text-align: left;
      unicode-bidi: embed;
      display: inline-block;
    }
    .message-content span.number {
      direction: ltr;
      unicode-bidi: embed;
      display: inline-block;
    }
  `;

  // اسکرول به انتهای لیست پیام‌ها
  const scrollToBottom = (smooth = true) => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: smooth ? 'smooth' : 'auto',
          block: 'end'
        });
      }
    }, smooth ? 100 : 0);
  };

  // همگام‌سازی دستی پیام‌ها

  const handleManualSync = async () => {
    if (isSyncing) return;
    
    try {
      setIsSyncing(true);
      
      // همگام‌سازی پیام‌ها
      await messageService.syncMessages();
      
      // بجای تغییر وضعیت loading، فقط به‌روزرسانی می‌کنیم
      // بدون نمایش اسکلتون‌ها
      
      // دریافت مستقیم پیام‌های جدید
      const currentMessages = messageService.getMessages();
      const currentTicketId = messageService.getActiveTicketId();
      
      // به‌روزرسانی state‌ها بدون نیاز به loading
      setMessages(currentMessages);
      setActiveTicketId(currentTicketId);
      
      // اسکرول به انتهای پیام‌ها
      setTimeout(() => {
        scrollToBottom(false);
      }, 300);
      
      // اعلان موفقیت
      Store.addNotification({
        title: "بروزرسانی",
        message: "پیام‌ها با موفقیت بروزرسانی شدند",
        type: "success",
        insert: "top",
        container: "center",
        dismiss: { duration: 2000 }
      });
    } catch (error) {
      console.error('Error manual syncing:', error);
      
      Store.addNotification({
        title: "خطا",
        message: "خطا در بروزرسانی پیام‌ها",
        type: "danger",
        insert: "top",
        container: "center",
        dismiss: { duration: 3000 }
      });
    } finally {
      setIsSyncing(false);
    }
  };
  // ارسال پیام جدید
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return; // حذف بررسی activeTicketId
    
    const messageText = message;
    setMessage('');
    
    // ایجاد پیام موقت جهت نمایش فوری
    const tempId = Date.now();
    const tempMessage = {
      id: tempId,
      content: messageText,
      date: new Date().toISOString(),
      isAdmin: false,
      isPending: true
    };
  
    // ثبت در pendingMessagesRef
    pendingMessagesRef.current.set(tempId, tempMessage);
    
    // افزودن پیام به state برای نمایش فوری
    setMessages(prev => {
      const updatedMessages = [...prev, tempMessage];
      return updatedMessages.sort((a, b) => new Date(a.date) - new Date(b.date));
    });
    
    scrollToBottom(false);
  
    try {
      // اگر تیکت فعال نداریم، هنگام ارسال پیام اولیه، سرویس به صورت خودکار تیکت ایجاد می‌کند
      await messageService.sendMessage(messageText);
      
      // به‌روزرسانی پیام پس از تایید از سرور
      setMessages(prev => prev.map(msg => 
        msg.id === tempId ? { ...msg, isPending: false } : msg
      ));
    } catch (error) {
      // حذف پیام در صورت بروز خطا
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      pendingMessagesRef.current.delete(tempId);
      
      Store.addNotification({
        title: "خطا",
        message: "خطا در ارسال پیام",
        type: "danger",
        insert: "top",
        container: "center",
        dismiss: { duration: 3000 }
      });
    } finally {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };
  // انیمیشن ورود صفحه
  useEffect(() => {
    setTimeout(() => {
      setShowCard(true);
    }, 100);
  }, []);



 // راه‌اندازی اولیه سرویس پیام‌ها
useEffect(() => {
  // ریست کامل وضعیت
isInitializedRef.current = false;
firstLoadRef.current = true;
// همیشه با loading=true شروع کنیم تا اسکلتون نمایش داده شود
setLoading(true); 
// پاک کردن پیام‌های کش شده از قبل
setMessages([]);
  
  const initializeService = async () => {
    try {
      // شروع سرویس
      const success = await messageService.start();
      if (!success) {
        Store.addNotification({
          title: "خطا",
          message: "مشکلی در بارگذاری پیام‌ها پیش آمد. لطفاً از ورود به حساب کاربری خود اطمینان حاصل کنید.",
          type: "danger",
          insert: "top",
          container: "center",
          dismiss: { duration: 3000 }
        });
        navigate('/login');
        return;
      }
      
      // سرویس راه‌اندازی شد
      isInitializedRef.current = true;
      
      // درخواست همگام‌سازی با تأخیر کوتاه
      setTimeout(() => {
        messageService.syncMessages();
      }, 300);
    } catch (error) {
      console.error('Error initializing message service:', error);
      setLoading(false);
      firstLoadRef.current = false;
    }
  };

  initializeService();

  return () => {
    messageService.stop();
  };
}, [navigate]); // برداشتن وابستگی به messages.length

  // گوش دادن به به‌روزرسانی‌های سرویس پیام‌ها
  useEffect(() => {
    const handleServiceUpdate = (data) => {
      // کپی کردن پیام‌های سروری
      const serverMessages = [...data.messages];
      
      // یک کپی از پیام‌های پندینگ فعلی می‌گیریم
      const stillPending = new Map(pendingMessagesRef.current);
      
      // آرایه‌ای برای ساختن لیست نهایی
      const newLocalMessages = [];
      
      // 1. پیمایش پیام‌های سروری و حذف پندینگ‌های منطبق
      for (let srv of serverMessages) {
        // پیدا کردن پیام پندینگ منطبق
        for (let [tempId, pMsg] of stillPending.entries()) {
          // فقط بر اساس محتوا مقایسه می‌کنیم
          const sameContent = pMsg.content.trim() === srv.content.trim();
          
          // اگر متن یکسان است و پیام سروری ادمین نیست
          if (sameContent && !srv.isAdmin) {
            // یعنی این پیام پندینگ با پیام سروری یکی است
            // پس از لیست پندینگ حذفش می‌کنیم
            stillPending.delete(tempId);
            // چون srv را به لیست نهایی اضافه می‌کنیم، پندینگ دیگر لازم نیست
            break;
          }
        }
        // پیام سروری را به لیست نهایی اضافه می‌کنیم
        newLocalMessages.push({
          id: srv.id || 'server-' + new Date(srv.date).getTime(), // اگر سرور id ندارد، یک id ساختگی
          content: srv.content,
          date: srv.date,
          isAdmin: srv.isAdmin,
          isPending: srv.isPending || false
        });
      }
      
      // 2. حالا هر پیام پندینگی که هنوز باقی مانده، یعنی سرور آن را برنگردانده است
      for (let [tempId, pMsg] of stillPending.entries()) {
        newLocalMessages.push(pMsg);
      }
      
      // 3. مرتب‌سازی پیام‌ها بر اساس تاریخ
      newLocalMessages.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      // 4. استیت را به‌روزرسانی می‌کنیم
      setMessages(newLocalMessages);
      setActiveTicketId(data.activeTicketId);
      setIsSyncing(data.isSyncing);
      setLastSyncTime(data.lastSyncTime);
      
      // 5. رفرنس pendingMessagesRef را با stillPending آپدیت می‌کنیم
      pendingMessagesRef.current = stillPending;
      
    // تنها زمانی که پیام‌ها دریافت شده‌اند و همگام‌سازی تمام شده، وضعیت لودینگ را به‌روز کنیم
if (!data.isSyncing && serverMessages.length > 0 && (firstLoadRef.current || loading)) {
      // به‌جای تنظیم فوری، یک تأخیر واقعی (حداقل 1 ثانیه) ایجاد می‌کنیم
      // تا اطمینان حاصل کنیم که اسکلتون‌ها همیشه نمایش داده می‌شوند
      setTimeout(() => {
          setLoading(false);
  firstLoadRef.current = false;

        
        // اسکرول به انتهای پیام‌ها پس از لود اولیه
        scrollToBottom(false);
      }, 3000); // تأخیر طولانی‌تر برای تضمین نمایش اسکلتون‌ها
    }
    };
    
    messageService.addListener(handleServiceUpdate);

    let autoRefreshInterval;
  
  if (isLoggedIn && activeTicketId) {
    autoRefreshInterval = setInterval(() => {
      if (!isSyncing) {
        messageService.syncMessages().then(() => {
          // به‌روزرسانی بصری روان‌تر بدون نیاز به اسکلتون
          const chatContainer = document.querySelector('.absolute.top-16.bottom-20.left-0.right-0.overflow-y-auto');
          if (chatContainer) {
            const isAtBottom = chatContainer.scrollHeight - chatContainer.scrollTop <= chatContainer.clientHeight + 100;
            if (isAtBottom) {
              scrollToBottom(true);
            }
          }
        }).catch(error => {
          console.error('Auto-refresh error:', error);
        });
      }
    }, 20000); // هر 20 ثانیه
  }
    
    return () => {
      messageService.removeListener(handleServiceUpdate);
      clearInterval(autoRefreshInterval);
    };
  }, [isSyncing, activeTicketId, isLoggedIn]);


  // متد جدید برای بستن صفحه
  const closeCard = () => {
    setSupportExiting(true);
    setTimeout(() => {
      setShowCard(false);
      setSupportExiting(false);
      navigate(-1);
    }, 300); // زمان انیمیشن
  };

  // متد بازگشت از صفحه سوالات متداول به صفحه پشتیبانی
 const closeFaq = () => {
  setFaqExiting(true);
  setTimeout(() => {
    setShowFaq(false);
    setFaqExiting(false);
  }, 300); // زمان انیمیشن
};

  // برای اسکرول خودکار بعد از لود شدن یا تغییر پیام‌ها
  useEffect(() => {
    if (!loading) {
      scrollToBottom(false);
    }
  }, [messages, loading]);
  

  // بررسی وضعیت ورود کاربر هنگام بارگذاری صفحه
useEffect(() => {
  const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
  setIsLoggedIn(!!token);
}, []);

// پس از اینکه پیام‌ها را دریافت کردیم، شمارشگر پیام‌های ناخوانده را ریست کنیم
useEffect(() => {
  // فقط وقتی که پیام‌ها لود شد، شمارشگر را ریست کنیم
  if (!loading && messages.length > 0) {
    // ریست کردن شمارشگر پیام‌های ناخوانده
    const latestMessageId = messages[messages.length - 1].id;
    supportNotificationService.markAllAsRead(latestMessageId);
  }
}, [loading, messages]);
  return (
    <div 
  className="fixed inset-0 z-50 bg-black/40 overflow-hidden transition-opacity duration-300"
  style={{ 
    opacity: supportExiting ? 0 : (showCard ? 1 : 0),
    pointerEvents: showCard ? 'auto' : 'none',
    transition: 'opacity 0.3s ease-out'
  }}
>
     <div 
  ref={cardRef}
  className={`fixed inset-0 w-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} shadow-lg transition-transform duration-300 ease-out`}
  style={{ 
    transform: supportExiting 
      ? 'translateX(100%)' // در حال خروج
      : `translateX(${showCard ? '0' : '100%'})`, // در حال ورود یا پنهان
    transition: 'transform 0.3s cubic-bezier(0.17, 0.67, 0.24, 0.99), opacity 0.3s ease-out',
  }}
>
        {/* Header */}
        <div className={`h-16 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} flex items-center px-4 relative border-b ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <button
            onClick={closeCard} 
            className={`absolute left-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}
          >
            <ArrowLeftCircle className="w-8 h-8" />
          </button>
          <h2
            className={`w-full text-center text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
          >
            پشتیبانی
          </h2>
          {lastSyncTime && (
            <button 
              onClick={handleManualSync}
              className={`absolute right-4 flex items-center ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              } ${isSyncing ? 'opacity-50 cursor-not-allowed' : 'hover:text-blue-500'}`}
              disabled={isSyncing}
            >
              <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>

        {/* Messages Area */}
        <div className="absolute top-16 bottom-20 left-0 right-0 overflow-y-auto p-4">
          {loading ? (
            <>
              <MessageSkeleton isDarkMode={isDarkMode} />
              <MessageSkeleton isDarkMode={isDarkMode} />
              <MessageSkeleton isDarkMode={isDarkMode} />
            </>
          ) : messages.length === 0 ? (
            <div className={`flex flex-col items-center justify-center h-full ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <svg
                className="w-16 h-16 mb-4 opacity-50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="text-center">
                پیامی وجود ندارد. اولین پیام خود را ارسال کنید.
              </p>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} isDarkMode={isDarkMode} />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* FAQ Button */}
        <div className="absolute bottom-20 left-4 right-4 flex justify-center p-1">
          <button
            onClick={() => setShowFaq(true)}
            className={`w-full max-w-md ${
              isDarkMode ? 'bg-gray-700/50 text-white' : 'bg-gray-200/80 text-gray-800'
            } py-2 px-4 rounded-lg shadow-md hover:bg-opacity-80 transition-colors`}
          >
            سوالات پر تکرار
          </button>
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className={`
            ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
            rounded-2xl shadow-lg border
            ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
          `}>
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 p-2">
             <input
  ref={inputRef}
  type="text"
  value={message}
  onChange={(e) => setMessage(e.target.value)}
  placeholder="پیام خود را بنویسید..."
  className={`
    flex-1 p-2 bg-transparent focus:outline-none
    ${isDarkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-500'}
  `}
  style={{ direction: 'rtl' }}
/>
              <button
  type="submit"
  disabled={!message.trim() || isSyncing} // حذف loading از شرط
  className={`
    p-2 rounded-full transition-colors
    ${
      message.trim() && !isSyncing
        ? 'text-[#f7d55d]'
        : isDarkMode
        ? 'text-gray-600'
        : 'text-gray-400'
    }
    ${
      message.trim() && !isSyncing &&
      (isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100')
    }
  `}
>
  <Send size={20} />
</button>
            </form>
          </div>
        </div>

        {/* استایل‌های سراسری برای پشتیبانی از متن‌های دوزبانه */}
        <style jsx global>{globalBidiCss}</style>
      </div>
      
      {/* FAQ Modal */}
      {showFaq && (
        <div 
        className="fixed inset-0 z-[9999] bg-black/40 overflow-hidden transition-opacity duration-300"
        style={{ 
          opacity: faqExiting ? 0 : 1,
          pointerEvents: 'auto',
          transition: 'opacity 0.3s ease-out'
        }}
      >
          <div 
  className={`fixed inset-0 w-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} shadow-lg transition-transform duration-300 ease-out`}
  style={{ 
    transform: 'translateX(0)',
    animation: faqExiting 
      ? 'slideOutRight 0.3s forwards' 
      : 'slideInRight 0.3s forwards',
    transition: 'transform 0.3s cubic-bezier(0.17, 0.67, 0.24, 0.99), opacity 0.3s ease-out'
  }}
>
            <div className={`h-16 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} flex items-center px-4 relative border-b ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <button
                onClick={closeFaq} 
                className={`absolute left-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}
              >
                <ArrowLeftCircle className="w-8 h-8" />
              </button>
              <h2
                className={`w-full text-center text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              >
                سوالات متداول
              </h2>
            </div>
            <div className="absolute top-16 bottom-0 left-0 right-0 overflow-auto">
               <FaqPage isDarkMode={isDarkMode} onBack={closeFaq} />
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(100%);
    }
  }
`}</style>
    </div>
  );
};

export default SupportPage;