import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftCircle, X } from 'lucide-react';
import AudioPlayer from './AudioPlayer';
import VideoPlayer from './components/VideoPlayer';
import channelNotificationService from './ChannelNotificationService';
import PaymentCard from './PaymentCard';
import { PRODUCT_PRICES } from './config';


const globalImageCache = new Set();

// Image Modal Component with Zoom (iOS compatible)
const ImageModal = ({ isOpen, onClose, imageUrl }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const touchesRef = useRef([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const lastTouchDistanceRef = useRef(0);

  

  // تابع برای مقدار دهی مجدد حالت‌ها
  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };
  
  // زوم با دابل کلیک
  const handleDoubleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // زوم بین 1x و 2.5x
    if (scale === 1) {
      setScale(2.5);
      
      // زوم به نقطه‌ای که کاربر روی آن دابل کلیک کرده
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) - rect.width / 2;
        const y = (e.clientY - rect.top) - rect.height / 2;
        setPosition({ x: -x, y: -y });
      }
    } else {
      resetZoom();
    }
  };
  
  // مدیریت کلیک ماوس
  const handleMouseDown = (e) => {
    if (scale > 1) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };
  
  const handleMouseMove = (e) => {
    if (isDragging && scale > 1) {
      e.preventDefault();
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setPosition({ x: newX, y: newY });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  // مدیریت لمس برای iOS
  const handleTouchStart = (e) => {
    e.stopPropagation();
    
    touchesRef.current = Array.from(e.touches).map(touch => ({
      identifier: touch.identifier,
      pageX: touch.pageX,
      pageY: touch.pageY
    }));
    
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      lastTouchDistanceRef.current = dist;
    }
    
    if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].pageX - position.x,
        y: e.touches[0].pageY - position.y
      });
    }
  };
  
  const handleTouchMove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.touches.length === 2) {
      const currentDist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      
      if (lastTouchDistanceRef.current > 0) {
        const ratio = currentDist / lastTouchDistanceRef.current;
        const newScale = Math.min(Math.max(0.5, scale * ratio), 5);
        
        const centerX = (e.touches[0].pageX + e.touches[1].pageX) / 2;
        const centerY = (e.touches[0].pageY + e.touches[1].pageY) / 2;
        
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const containerCenterX = rect.left + rect.width / 2;
          const containerCenterY = rect.top + rect.height / 2;
          
          const offsetX = centerX - containerCenterX;
          const offsetY = centerY - containerCenterY;
          
          const factorX = 0.03;
          const factorY = 0.03;
          
          setPosition({
            x: position.x + offsetX * factorX * (newScale - scale),
            y: position.y + offsetY * factorY * (newScale - scale)
          });
        }
        
        setScale(newScale);
      }
      
      lastTouchDistanceRef.current = currentDist;
    } 
    else if (e.touches.length === 1 && isDragging && scale > 1) {
      const touch = e.touches[0];
      const newX = touch.pageX - dragStart.x;
      const newY = touch.pageY - dragStart.y;
      
      if (imageRef.current && containerRef.current) {
        const img = imageRef.current;
        const container = containerRef.current;
        
        const imgWidth = img.naturalWidth * scale;
        const imgHeight = img.naturalHeight * scale;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        const maxX = Math.max(0, (imgWidth - containerWidth) / 2);
        const maxY = Math.max(0, (imgHeight - containerHeight) / 2);
        
        const clampedX = Math.min(Math.max(newX, -maxX), maxX);
        const clampedY = Math.min(Math.max(newY, -maxY), maxY);
        
        setPosition({ x: clampedX, y: clampedY });
      } else {
        setPosition({ x: newX, y: newY });
      }
    }
  };
  
  const handleTouchEnd = (e) => {
    lastTouchDistanceRef.current = 0;
    
    if (e.touches.length === 0) {
      setIsDragging(false);
    }
    
    touchesRef.current = Array.from(e.touches).map(touch => ({
      identifier: touch.identifier,
      pageX: touch.pageX,
      pageY: touch.pageY
    }));
  };
  
  useEffect(() => {
    const container = containerRef.current;
    
    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY * -0.01;
      const newScale = Math.min(Math.max(0.5, scale + delta), 5);
      
      if (container) {
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const scaleChange = newScale / scale;
        const newPosition = {
          x: mouseX - (mouseX - position.x) * scaleChange,
          y: mouseY - (mouseY - position.y) * scaleChange
        };
        
        setScale(newScale);
        setPosition(newPosition);
      } else {
        setScale(newScale);
      }
    };
    
    if (container && isOpen) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }
    
    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [isOpen, scale, position]);
  
  useEffect(() => {
    if (!isOpen) return;
    
    const originalStyle = window.getComputedStyle(document.body).overflow;
    
    document.body.style.overflow = 'hidden';
    document.documentElement.classList.add('overflow-hidden');
    
    const preventScroll = (e) => {
      e.preventDefault();
    };
    
    document.addEventListener('touchmove', preventScroll, { passive: false });
    
    return () => {
      document.body.style.overflow = originalStyle;
      document.documentElement.classList.remove('overflow-hidden');
      document.removeEventListener('touchmove', preventScroll);
    };
  }, [isOpen]);
  
  useEffect(() => {
    if (isOpen) {
      resetZoom();
      setImageLoaded(false);
      lastTouchDistanceRef.current = 0;
    }
  }, [isOpen]);
  
  const handleClose = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };
  
  if (!isOpen) return null;

  const highQualityImageUrl = imageUrl.replace(/-\d+x\d+\./, '.');

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-90 select-none"
      onClick={onClose}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'none' }}
    >
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      <button 
        onClick={handleClose}
        className="fixed top-[80px] right-6 w-8 h-8 bg-white text-black font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-gray-200 z-[99999]"
        style={{ 
          touchAction: 'manipulation',
          WebkitAppearance: 'none',
          transform: 'translateZ(0)',
          willChange: 'transform',
          marginTop: 'env(safe-area-inset-top, 40px)'
        }}
      >
        <span style={{ fontSize: '30px', lineHeight: 1 }}>×</span>
      </button>
      
      <div className="absolute bottom-4 left-0 right-0 flex justify-center text-white text-sm bg-black bg-opacity-30 py-2 px-4 rounded-full mx-auto max-w-max opacity-70 z-[9990]">
        دابل تپ برای زوم • دو انگشت برای زوم • درگ برای جابجایی
      </div>
      
      <div 
        ref={containerRef}
        className="w-full h-full flex items-center justify-center overflow-hidden"
        onTouchMove={handleTouchMove}
        onTouchStart={handleTouchStart}
        style={{ touchAction: 'none' }}
      >
        <img 
          ref={imageRef}
          src={highQualityImageUrl} 
          alt="تصویر کامل" 
          className="max-h-[90vh] max-w-[90vw] object-contain"
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            cursor: scale > 1 ? 'grab' : 'default',
            touchAction: 'none',
            opacity: imageLoaded ? 1 : 0,
            transition: imageLoaded ? 'opacity 0.3s ease' : 'none',
            willChange: 'transform',
          }}
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={handleDoubleClick}
          onMouseDown={handleMouseDown}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(true)}
        />
      </div>
    </div>
  );
};

// Chat Message Component
const ChatMessage = React.memo(({ message, isDarkMode, onVideoClick }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('');
  const messageRef = useRef(null);

  const content = message.content?.rendered || '';
  const title = message.title?.rendered || '';
  const audioUrl = message.meta?.audio_url;

useEffect(() => {
  if (!content || !messageRef.current) return;
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'text/html');
  
  // پردازش ویدیوها
  const videos = doc.querySelectorAll('video');
  
  videos.forEach((video, index) => {
    const sources = video.querySelectorAll('source');
    let videoSrc = video.getAttribute('src');
    
    if (!videoSrc && sources.length > 0) {
      videoSrc = sources[0].getAttribute('src');
    }
    
    const videoTitle = video.getAttribute('title') || 'ویدیو';
    
    if (!videoSrc) {
      return;
    }
    
    const videoPlaceholder = doc.createElement('div');
    videoPlaceholder.innerHTML = `
      <div style="
        position: relative;
        width: 100%;
        max-width: 280px;
        height: 180px;
        background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
        border-radius: 12px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid rgba(247, 213, 93, 0.3);
        margin: 10px ;
        transition: all 0.3s ease;
      " 
      data-video-src="${videoSrc}" 
      data-video-title="${videoTitle}"
      class="video-play-trigger">
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          color: white;
          text-align: center;
        ">
          <div style="
            width: 70px;
            height: 70px;
            background: rgba(247, 213, 93, 0.9);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 10px;
            box-shadow: 0 4px 15px rgba(247, 213, 93, 0.3);
          ">
            <div style="
              width: 0;
              height: 0;
              border-left: 20px solid white;
              border-top: 12px solid transparent;
              border-bottom: 12px solid transparent;
              margin-left: 4px;
            "></div>
          </div>
          <span style="
            font-size: 14px; 
            color: #f7d55d;
            font-weight: 500;
          ">کلیک برای پخش ویدیو</span>
        </div>
      </div>
    `;
    
    video.parentNode.replaceChild(videoPlaceholder, video);
  });
  
  // پردازش تصاویر - بدون observer
  const images = doc.querySelectorAll('img');
  images.forEach(img => {
    img.classList.add('message-image');
    const originalSrc = img.getAttribute('src');
    const highQualitySrc = originalSrc ? originalSrc.replace(/-\d+x\d+\./, '.') : originalSrc;
    
    if (originalSrc) {
      img.src = originalSrc; // مستقیماً src را تنظیم کن
    }
    
    img.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (highQualitySrc) {
        setMediaUrl(highQualitySrc);
        setMediaType('image');
        setIsModalOpen(true);
      }
    };
    
    img.classList.add('max-w-full', 'h-auto', 'rounded-xl');
  });

  if (messageRef.current) {
    messageRef.current.innerHTML = '';
    Array.from(doc.body.childNodes).forEach(node => {
      messageRef.current.appendChild(node);
    });
    
    const videoTriggers = messageRef.current.querySelectorAll('.video-play-trigger');
    videoTriggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const videoSrc = trigger.getAttribute('data-video-src');
        const videoTitle = trigger.getAttribute('data-video-title');
        
        if (videoSrc && onVideoClick) {
          onVideoClick(videoSrc, videoTitle);
        }
      });
    });
  }
}, []); // dependency array را خالی کن



  const getFormattedDate = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  
  const getFormattedTime = (date) => {
    const d = new Date(date);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  const dateStr = message.date ? getFormattedDate(message.date) : getFormattedDate(new Date());
  const timeStr = message.date ? getFormattedTime(message.date) : getFormattedTime(new Date());

  return (
    <div className="flex w-full justify-start mb-4 select-none" dir="rtl">
      <div className="message-bubble">
        {title && (
          <h3 className="message-title" dangerouslySetInnerHTML={{ __html: title }} />
        )}

        {content && (
          <div 
            ref={messageRef}
            className="message-content" 
          />
        )}

        {audioUrl && (
          <AudioPlayer audioUrl={audioUrl} isDarkMode={isDarkMode} />
        )}

        <div className="timestamps">
          <span className="date">{dateStr}</span>
          <span className="time">{timeStr}</span>
        </div>
      </div>
      
      {isModalOpen && (
        <>
          {mediaType === 'image' && (
            <ImageModal 
              isOpen={isModalOpen && mediaType === 'image'} 
              onClose={() => setIsModalOpen(false)} 
              imageUrl={mediaUrl} 
            />
          )}
          
          {mediaType === 'video' && (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90" 
              onClick={() => setIsModalOpen(false)}
            >
              <button 
                className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-gray-800"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={24} />
              </button>
              
              <video 
                src={mediaUrl} 
                controls
                preload="none"
                loading="lazy"
                className="max-h-[90vh] max-w-[90vw]"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
});

const MimCoinChannel = ({ isDarkMode, isOpen = true, onClose }) => {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const containerRef = useRef(null);
  const loadingMoreRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const previousPostsCountRef = useRef(0);
  const [lastLoadedPostId, setLastLoadedPostId] = useState(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [currentVideo, setCurrentVideo] = useState({ url: '', title: '' });
  const [showCard, setShowCard] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [addedToHistory, setAddedToHistory] = useState(false);
  const [subscriptionWarning, setSubscriptionWarning] = useState(null);
const [showPaymentCard, setShowPaymentCard] = useState(false);


  // انیمیشن ورود کارت
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setShowCard(true);
      }, 100);
    }
  }, [isOpen]);

  // مدیریت دکمه برگشت و انیمیشن
  useEffect(() => {
    const handleBackButton = () => {
      if (isOpen) {
        closeCard();
      }
    };
  
    window.addEventListener('popstate', handleBackButton);
    
    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [isOpen]);

  // بستن کارت با انیمیشن
  const closeCard = () => {
    setIsExiting(true);
    setTimeout(() => {
      setShowCard(false);
      setIsExiting(false);
      setAddedToHistory(false);
      
      if (onClose) {
        onClose();
      } else {
        navigate(-1);
      }
    }, 300);
  };

  // تابع اسکرول به آخرین پیام
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Fetch posts function - تغییر شده برای tag_ID=113
  const fetchPosts = async (pageNumber) => {
    try {
      setLoading(true);
      const auth = btoa('ck_20b3c33ef902d4ccd94fc1230c940a85be290e0a:cs_e8a85df738324996fd3608154ab5bf0ccc6ded99');
      const response = await fetch(
        `https://p30s.com/wp-json/wp/v2/posts?_embed&order=desc&orderby=date&per_page=10&page=${pageNumber}&categories=113`,
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
      
      previousPostsCountRef.current = posts.length;
      
      if (pageNumber > 1 && posts.length > 0) {
        setLastLoadedPostId(posts[0]?.id);
      } else {
        setLastLoadedPostId(null);
      }
      
      if (pageNumber === 1) {
        setPosts([...data].reverse());
        
        if (data.length > 0) {
          channelNotificationService.markAllAsRead();
        }
      } else {
        setPosts(prevPosts => [...data].reverse().concat(prevPosts));
      }
      
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setHasMore(false);
    }
  };

 useEffect(() => {
  fetchPosts(1);
}, []); 
  

useEffect(() => {
  if (!loading && posts.length > 0) {
    channelNotificationService.markAllAsRead();
  }
}, [loading]); // حذف posts از dependency array

  useEffect(() => {
    if (isOpen) {
      channelNotificationService.markAllAsRead();
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      channelNotificationService.markAllAsRead();
    };
  }, []);

  useEffect(() => {
    if (messagesEndRef.current && page === 1 && posts.length > 0) {
      setTimeout(() => {
        messagesEndRef.current.scrollIntoView({ behavior: "auto" });
      }, 300);
    }
  }, [posts, page]);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    
    const handleScroll = () => {
      if (container.scrollTop < -100 || container.scrollHeight - container.scrollTop - container.clientHeight > 300) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };
    
    container.addEventListener('scroll', handleScroll);
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    if (!loading && lastLoadedPostId && page > 1) {
      setTimeout(() => {
        const divider = document.getElementById('new-content-divider');
        if (divider && containerRef.current) {
          const viewportHeight = containerRef.current.clientHeight;
          const dividerPosition = divider.offsetTop;
          
          containerRef.current.scrollTo({
            top: dividerPosition - (viewportHeight / 2) + (divider.clientHeight / 2),
            behavior: 'smooth'
          });
          
          divider.style.transition = 'background-color 0.5s ease';
          const originalBg = isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(243, 244, 246, 0.8)';
          const highlightBg = isDarkMode ? 'rgba(55, 65, 81, 0.95)' : 'rgba(229, 231, 235, 0.95)';
          
          divider.style.backgroundColor = highlightBg;
          setTimeout(() => {
            divider.style.backgroundColor = originalBg;
          }, 800);
        }
      }, 1000);
    }
  }, [loading, lastLoadedPostId, page, isDarkMode]);

  useEffect(() => {
    return () => {
      if (posts.length > 0) {
        const latestPostId = posts[0]?.id;
        channelNotificationService.markAllAsRead(latestPostId);
      } else {
        channelNotificationService.markAllAsRead();
      }
    };
  }, [posts]);


// بررسی وضعیت اشتراک و نمایش هشدار
useEffect(() => {
  const checkSubscriptionExpiry = async () => {
    try {
      // ابتدا سعی می‌کنیم از API داده‌های جدید بگیریم
      const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
      
      if (token) {
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
              // پیدا کردن اشتراک میم کوین
              const mimCoinSubscription = data.purchases.find(p => 
                p.title && p.title.includes('میم کوین') && p.status === 'active'
              );
              
              if (mimCoinSubscription) {
                const remainingDays = mimCoinSubscription.remainingDays;
                
                if (typeof remainingDays === 'number' && remainingDays <= 97) {
                  if (remainingDays <= 0) {
                    setSubscriptionWarning({
                      days: 0,
                      type: 'expired'
                    });
                  } else {
                    setSubscriptionWarning({
                      days: remainingDays,
                      type: remainingDays <= 3 ? 'critical' : 'warning'
                    });
                  }
                } else {
                  setSubscriptionWarning(null);
                }
                return; // اگر از API گرفتیم، دیگر localStorage چک نکنیم
              }
            }
          }
        } catch (apiError) {
          console.log('API call failed, falling back to localStorage');
        }
      }
      
      // اگر API کار نکرد، از localStorage استفاده کنیم
      const purchasedProductsStr = localStorage.getItem('purchasedProducts');
      
      if (!purchasedProductsStr) return;

      const purchasedProducts = JSON.parse(purchasedProductsStr);
      const mimCoinSubscription = purchasedProducts.find(p => 
        p.title && p.title.includes('میم کوین') && p.status === 'active'
      );

      if (mimCoinSubscription) {
        const remainingDays = mimCoinSubscription.remainingDays;
        
        if (typeof remainingDays === 'number' && remainingDays <= 7) {
          if (remainingDays <= 0) {
            setSubscriptionWarning({
              days: 0,
              type: 'expired'
            });
          } else {
            setSubscriptionWarning({
              days: remainingDays,
              type: remainingDays <= 3 ? 'critical' : 'warning'
            });
          }
        } else {
          setSubscriptionWarning(null);
        }
      }
    } catch (error) {
      console.error('Error checking subscription expiry:', error);
    }
  };

  checkSubscriptionExpiry();
}, []);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/40 overflow-hidden transition-opacity duration-300"
      style={{ 
        opacity: isExiting ? 0 : (showCard ? 1 : 0),
        pointerEvents: showCard ? 'auto' : 'none',
        transition: 'opacity 0.3s ease-out'
      }}
    >
      <div 
        className={`fixed inset-0 w-full ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} shadow-lg transition-transform duration-300 ease-out`}
        style={{ 
          transform: isExiting 
            ? 'translateX(100%)' 
            : `translateX(${showCard ? '0' : '100%'})`,
          transition: 'transform 0.3s cubic-bezier(0.17, 0.67, 0.24, 0.99), opacity 0.3s ease-out'
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
          <h2 className={`w-full text-center text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
           کانال میم کوین باز
          </h2>
        </div>


{/* Subscription Warning Bar */}
{subscriptionWarning && (
  <div 
    className={`px-4 py-3 text-white text-sm font-medium ${
      subscriptionWarning.type === 'expired' ? 'bg-red-500' : 
      subscriptionWarning.type === 'critical' ? 'bg-red-500' : 'bg-orange-500'
    }`}
    dir="rtl"
  >
    <div className="flex items-center justify-between">
      <div className="flex-1 text-right">
        {subscriptionWarning.days === 0 ? 
          'اشتراک شما منقضی شده است' : 
          `${subscriptionWarning.days} روز تا پایان اشتراک باقی مانده`
        }
      </div>
      <button
        onClick={() => setShowPaymentCard(true)}
        className="bg-white text-gray-800 px-8 py-2 rounded-full text-sm font-bold hover:bg-gray-100 transition-colors min-w-[120px]"
      >
        تمدید
      </button>
    </div>
  </div>
)}


{/* Main Content Area */}
<div 
  className="absolute bottom-0 left-0 right-0 flex flex-col overflow-hidden"
  style={{
    top: subscriptionWarning ? '124px' : '65px' // 128px وقتی نوار هست، 64px وقتی نیست
  }}
>
          {/* Scrollable Content Area */}
          <div ref={containerRef} className="flex-1 overflow-y-auto pb-4">
            <div className="px-4">

              {(loading && page > 1) && (
                <div className="flex justify-center items-center p-4">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
<span className={`mr-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    در حال بارگذاری پست‌های بیشتر...
                  </span>
                </div>
              )}

              <div className="flex-grow pt-2">
                {hasMore && !loading && posts.length > 0 && (
                  <div className="text-center py-4">
                    <button
                      onClick={() => {
                        setPage(prev => prev + 1);
                        fetchPosts(page + 1);
                      }}
                      className={`px-6 py-3 rounded-full border-2 transition-all duration-200 ${
                        isDarkMode 
                          ? 'border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-gray-900' 
                          : 'border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white'
                      }`}
                    >
                      برای مشاهده پست‌های قبلی اینجا کلیک کنید
                    </button>
                  </div>
                )}
                
                {posts.map((post, index) => (
                  <React.Fragment key={`post-${post.id}-${post.date}`}>
                    {lastLoadedPostId === post.id && (
                      <div 
                        dir="rtl"
                        id="new-content-divider"
                        className={`w-full py-3 my-4 text-center border-t-2 border-dashed ${
                          isDarkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-600'
                        }`}
                        style={{
                          position: 'relative',
                          zIndex: 10,
                          backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(243, 244, 246, 0.8)',
                          backdropFilter: 'blur(2px)'
                        }}
                      >
                        <div className="font-bold">پست‌های جدید ↑   پست‌های قدیمی ↓</div>
                      </div>
                    )}
                    <ChatMessage 
                      message={post}
                      isDarkMode={isDarkMode}
                      onVideoClick={(url, title) => {
                        setCurrentVideo({ url, title });
                        setShowVideoPlayer(true);
                      }}
                    />
                  </React.Fragment>
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
        </div>

        {/* دکمه اسکرول به پایین */}
        {showScrollButton && (
          <div className="fixed bottom-7 left-0 right-0 flex justify-center z-20 pointer-events-none">
            <button
              onClick={scrollToBottom}
              className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg pointer-events-auto 
              bg-[#f7d55d] text-gray-800
              border border-yellow-400`}
              style={{
                animation: 'fadeIn 0.3s ease-out',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                width="24" 
                height="24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
          </div>
        )}


{/* Payment Card Component */}
{showPaymentCard && (
  <PaymentCard
    isDarkMode={isDarkMode}
    onClose={() => setShowPaymentCard(false)}
    productTitle="تمدید کانال میم کوین باز"
    price={PRODUCT_PRICES.MEM_COIN}
    isRenewal={true}
  />
)}
      </div>

      {/* Video Player Modal */}
      {showVideoPlayer && (
        <VideoPlayer
          videoUrl={currentVideo.url}
          title={currentVideo.title}
          isDarkMode={isDarkMode}
          onClose={() => {
            setShowVideoPlayer(false);
            setCurrentVideo({ url: '', title: '' });
          }}
        />
      )}

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

        .message-image {
          will-change: auto;
          backface-visibility: hidden;
          transform: translateZ(0);
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
        }

        .message-bubble img {
          content-visibility: auto;
          contain-intrinsic-size: 300px 200px;
        }
        
        .message-bubble .message-title {
          font-size: 1.3rem;
          font-weight: bold;
          color: #f7d55d;
          margin-bottom: 0.75rem;
          line-height: 1.4;
          word-break: break-word;
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

        .video-container {
          width: 40% !important;
          max-width: 0%;
          margin: 10px 0 12px 0;
          border-radius: 12px;
          overflow: hidden;
          position: relative;
          background-color: #000;
          display: flex;
          align-items: center;
        }
              
        .video-play-button {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 60px;
          height: 60px;
          background-color: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          z-index: 2;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }

        .video-play-button:before {
          content: '';
          width: 0; 
          height: 0;
          border-top: 15px solid transparent;
          border-bottom: 15px solid transparent;
          border-left: 25px solid rgba(255, 255, 255, 0.8);
          margin-left: 5px;
        }

        .video-play-button:hover {
          background-color: rgba(255, 255, 255, 0.5);
          transform: translate(-50%, -50%) scale(1.1);
        }

        .video-container.playing .video-play-button {
          opacity: 0;
          pointer-events: none;
        }
        
        .landscape-container {
          max-width: 350px;
          max-height: 220px;
        }
        
        .portrait-container {
          max-width: 220px;
          max-height: 350px;
        }

        .message-video {
          width: 100% !important;
          max-width: 100% !important;
          height: auto !important;
          object-fit: contain;
          display: block;
          border-radius: 12px;
          background-color: #000;
          cursor: pointer;
          margin: 0;
        }
        
        .landscape-video {
          max-height: 200px !important;
          max-width: 350px !important;
        }
        
        .portrait-video {
          max-height: 350px !important;
          max-width: 220px !important;
        }
        
        .multiple-videos {
          margin-top: 16px;
          margin-bottom: 16px;
        }
        
        .multiple-videos:not(:first-child) {
          margin-top: 20px;
        }

        .iframe-container {
          position: relative;
          width: 100%;
          max-width: 350px;
          padding-bottom: 56.25%;
          height: 0;
          overflow: hidden;
          border-radius: 12px;
          margin: 12px auto;
          background-color: #000;
        }

        .iframe-container iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100% !important;
          height: 100% !important;
          border: none;
        }

        .message-image {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          margin: 8px 0;
          cursor: pointer;
        }

        .message-bubble a {
          color: #f7d55d;
          text-decoration: none;
        }
        
        .message-bubble a:hover {
          text-decoration: underline;
        }
        
        .message-bubble p {
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        
        * {
          -webkit-tap-highlight-color: transparent;
        }
        
        video::-webkit-media-controls-panel {
          background-color: rgba(0,0,0,0.5);
        }
        
        .message-bubble > video + video,
        .message-bubble > div:has(video) + div:has(video) {
          margin-top: 16px !important;
        }
        
        video::-webkit-media-controls {
          background-color: rgba(0, 0, 0, 0.4);
        }
        
        video::-webkit-media-controls-play-button,
        video::-webkit-media-controls-fullscreen-button {
          background-color: rgba(255, 255, 255, 0.4);
          border-radius: 50%;
        }
        
        @media (max-width: 480px) {
          .message-bubble {
            max-width: 90%;
          }
          
          .video-container {
            max-width: 100%;
          }

          .landscape-container {
            max-width: 300px;
            max-height: 190px;
          }
          
          .portrait-container {
            max-width: 190px;
            max-height: 300px;
          }
          
          .landscape-video {
            max-height: 180px !important;
            max-width: 300px !important;
          }
          
          .portrait-video {
            max-height: 300px !important;
            max-width: 190px !important;
          }
          
          .video-play-button {
            width: 50px;
            height: 50px;
          }
          
          .video-play-button:before {
            border-top: 12px solid transparent;
            border-bottom: 12px solid transparent;
            border-left: 20px solid rgba(255, 255, 255, 0.8);
          }
          
          .message-bubble .message-title {
            font-size: 1.2rem;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        }
      `}</style>
    </div>
  );
};

export default MimCoinChannel;