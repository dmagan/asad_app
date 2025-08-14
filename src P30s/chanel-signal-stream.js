import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftCircle, X } from 'lucide-react';
import AudioPlayer from './AudioPlayer';

// Image Modal Component
const ImageModal = ({ isOpen, onClose, imageUrl }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 select-none" onClick={onClose}>
      <button 
        className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-gray-800"
        onClick={onClose}
      >
        <X size={24} />
      </button>
      <img 
        src={imageUrl} 
        alt="Full size" 
        className="max-h-[90vh] max-w-[90vw] object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

// Chat Message Component
const ChatMessage = ({ message, isDarkMode }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const image = message._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  const audioUrl = message.meta?.audio_url;
  const getFormattedDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getFormattedTime = (date) => {
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  
  const dateStr = message.date ? getFormattedDate(message.date) : getFormattedDate(new Date());
  const timeStr = message.date ? getFormattedTime(message.date) : getFormattedTime(new Date());
  const content = message.content || message.excerpt?.rendered || '';

  return (
    <div className="flex w-full justify-start mb-4 select-none" dir="rtl">
      <div className="message-bubble">
        {image && (
          <>
            <img 
              src={image} 
              alt="Post featured" 
              className="w-full h-48 object-cover rounded-xl mb-4 cursor-pointer"
              onClick={() => setIsModalOpen(true)}
              loading="lazy"
            />
            <ImageModal 
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              imageUrl={image}
            />
          </>
        )}
        {message.title && (
          <h3 className="font-bold mb-2" dangerouslySetInnerHTML={{ __html: message.title.rendered }} />
        )}
        {typeof content === 'string' && content ? (
          <div dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          typeof content === 'object' && React.isValidElement(content) ? content : null
        )}
        {audioUrl && (
          <AudioPlayer audioUrl={audioUrl} isDarkMode={isDarkMode} />
        )}
        <div className="timestamps">
          <span className="date">{dateStr}</span>
          <span className="time">{timeStr}</span>
        </div>
      </div>
    </div>
  );
};

const SignalStreamChannel = ({ isDarkMode, isOpen, onClose }) => {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const containerRef = useRef(null);
  const loadingMoreRef = useRef(null);
  
  // انیمیشن
  const [showChannel, setShowChannel] = useState(false);
  const [channelExiting, setChannelExiting] = useState(false);

  // Welcome messages
  const welcomeMessages = [
    {
      id: 'welcome-1',
      content: 'سلام! به کانال سیگنال استریم خوش اومدید 👋',
      date: new Date()
    },
  ];

  // Fetch posts function
  const fetchPosts = async (pageNumber) => {
    try {
      setLoading(true);
      const auth = btoa('ck_20b3c33ef902d4ccd94fc1230c940a85be290e0a:cs_e8a85df738324996fd3608154ab5bf0ccc6ded99');
      const response = await fetch(
        `https://p30s.com/wp-json/wp/v2/posts?_embed&order=desc&orderby=date&per_page=10&page=${pageNumber}&categories=110`,
        {
          headers: {
            'Authorization': `Basic ${auth}`
          }
        }
      );
      
      if (!response.ok) throw new Error('Error fetching posts');
      
      const data = await response.json();
      const totalPages = response.headers.get('X-WP-TotalPages');
      setHasMore(pageNumber < parseInt(totalPages));
      
      setPosts(prevPosts => pageNumber === 1 ? [...data].reverse() : [...prevPosts, ...[...data].reverse()]);
      setLoading(false);
    } catch (error) {
     // console.error('Error fetching posts:', error);
      setLoading(false);
      setHasMore(false);
    }
  };

  // مدیریت دکمه بازگشت و انیمیشن
  useEffect(() => {
    const handleBackButton = (event) => {
      event.preventDefault();
      closeChannel();
    };

    // اگر صفحه باز است، یک state به تاریخچه اضافه کنیم
    if (isOpen) {
      window.history.pushState({ signalStreamPage: true }, '');
      
      // انیمیشن ورود
      setTimeout(() => {
        setShowChannel(true);
      }, 100);
    }
    
    // شنونده برای رویداد popstate (فشردن دکمه برگشت)
    window.addEventListener('popstate', handleBackButton);
    
    // پاکسازی event listener
    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [isOpen]);

  // بستن چنل
  const closeChannel = useCallback(() => {
    setChannelExiting(true);
    setTimeout(() => {
      setShowChannel(false);
      setChannelExiting(false);
      onClose ? onClose() : navigate(-1);
    }, 300);
  }, [onClose, navigate]);

  useEffect(() => {
    fetchPosts(1);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current && page === 1) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [posts, page]);

  useEffect(() => {
    if (!loadingMoreRef.current || loading || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading && hasMore) {
          setPage(prev => prev + 1);
          fetchPosts(page + 1);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(loadingMoreRef.current);
    return () => observer.disconnect();
  }, [loading, hasMore, page]);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/40 overflow-hidden transition-opacity duration-300"
      style={{ 
        opacity: channelExiting ? 0 : (showChannel ? 1 : 0),
        pointerEvents: showChannel ? 'auto' : 'none',
        transition: 'opacity 0.3s ease-out'
      }}
    >
      <div 
        className={`fixed inset-0 w-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} shadow-lg transition-transform duration-300 ease-out`}
        style={{ 
          transform: channelExiting 
            ? 'translateX(100%)' 
            : `translateX(${showChannel ? '0' : '100%'})`,
          transition: 'transform 0.3s cubic-bezier(0.17, 0.67, 0.24, 0.99), opacity 0.3s ease-out'
        }}
      >
        {/* Header */}
        <div 
          className={`h-16 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} flex items-center px-4 relative border-b ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <button
            onClick={closeChannel} 
            className={`absolute left-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}
          >
            <ArrowLeftCircle className="w-8 h-8" />
          </button>
          <h1 className={`w-full text-center text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            کانال سیگنال استریم
          </h1>
        </div>

        {/* Messages Area */}
        <div className="absolute top-16 bottom-0 left-0 right-0 overflow-y-auto">
          <div 
            ref={containerRef}
            className="px-4 pb-4"
          >
            {(loading && page > 1) && (
              <div ref={loadingMoreRef} className="flex justify-center items-center p-4">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            <div className="flex-grow">
            {[...welcomeMessages].reverse().map((msg, index) => (
  <div key={msg.id} className={index === 0 ? 'mt-3' : ''}>
    <ChatMessage 
      message={msg}
      isDarkMode={isDarkMode}
    />
  </div>
))}


              {[...posts].map((post) => (
                <ChatMessage 
                  key={post.id}
                  message={post}
                  isDarkMode={isDarkMode}
                />
              ))}

              {loading && page === 1 && (
                <div className="flex justify-center items-center p-4">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {!loading && !hasMore && posts.length > 0 && (
              <div className="text-center text-gray-500 py-4">
                پیام دیگری وجود ندارد
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <style jsx global>{`
          .message-bubble {
            background-color: transparent;
            color: ${isDarkMode ? '#fff' : '#1f2937'};
            border: 2px solid rgba(247, 213, 93, 0.5);
            border-radius: 24px;
            border-top-right-radius: 4px;
            padding: 1rem;
            max-width: 80%;
            direction: rtl;
            text-align: right;
            position: relative;
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
          }
          
          .message-bubble ul {
            padding-right: 20px;
            list-style-position: inside;
            user-select: none;
          }

          .message-bubble .timestamps {
            display: flex;
            justify-content: space-between;
            margin-top: 1rem;
            color: ${isDarkMode ? '#9CA3AF' : '#6B7280'};
            font-size: 0.75rem;
            user-select: none;
          }

          .message-bubble .time {
            direction: ltr;
            user-select: none;
          }

          .message-bubble .date {
            direction: ltr;
            user-select: none;
          }

          * {
            -webkit-tap-highlight-color: transparent;
          }
        `}</style>
      </div>
    </div>
  );
};

export default SignalStreamChannel;