import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftCircle, X } from 'lucide-react';
import AudioPlayer from './AudioPlayer';
import VideoPlayer from './components/VideoPlayer';
import channelNotificationService from './ChannelNotificationService';


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
    // جلوگیری از propagation
    e.stopPropagation();
    
    // ذخیره موقعیت لمس‌ها برای محاسبات بعدی
    touchesRef.current = Array.from(e.touches).map(touch => ({
      identifier: touch.identifier,
      pageX: touch.pageX,
      pageY: touch.pageY
    }));
    
    // مدیریت pinch زوم - ذخیره فاصله اولیه بین انگشتان
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      lastTouchDistanceRef.current = dist;
    }
    
    // مدیریت drag با یک انگشت
    if (e.touches.length === 1 && scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].pageX - position.x,
        y: e.touches[0].pageY - position.y
      });
    }
  };
  
  const handleTouchMove = (e) => {
    // جلوگیری از اسکرول صفحه زیرین
    e.preventDefault();
    e.stopPropagation();
    
    // مدیریت pinch zoom با دو انگشت
    if (e.touches.length === 2) {
      // محاسبه فاصله جدید بین دو انگشت
      const currentDist = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      
      // اگر فاصله قبلی داریم، تغییر مقیاس را محاسبه کنید
      if (lastTouchDistanceRef.current > 0) {
        // محاسبه نسبت تغییر
        const ratio = currentDist / lastTouchDistanceRef.current;
        
        // اعمال زوم جدید با محدودیت
        const newScale = Math.min(Math.max(0.5, scale * ratio), 5);
        
        // محاسبه مرکز pinch
        const centerX = (e.touches[0].pageX + e.touches[1].pageX) / 2;
        const centerY = (e.touches[0].pageY + e.touches[1].pageY) / 2;
        
        // برای smooth بودن حرکت، میزان تغییر نسبت به مرکز را محاسبه می‌کنیم
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const containerCenterX = rect.left + rect.width / 2;
          const containerCenterY = rect.top + rect.height / 2;
          
          // محاسبه offset از مرکز
          const offsetX = centerX - containerCenterX;
          const offsetY = centerY - containerCenterY;
          
          // ضریب تنظیم برای حرکت نرم‌تر
          const factorX = 0.03;
          const factorY = 0.03;
          
          setPosition({
            x: position.x + offsetX * factorX * (newScale - scale),
            y: position.y + offsetY * factorY * (newScale - scale)
          });
        }
        
        setScale(newScale);
      }
      
      // به‌روزرسانی فاصله برای محاسبه بعدی
      lastTouchDistanceRef.current = currentDist;
    } 
    // مدیریت drag با یک انگشت
    else if (e.touches.length === 1 && isDragging && scale > 1) {
      const touch = e.touches[0];
      const newX = touch.pageX - dragStart.x;
      const newY = touch.pageY - dragStart.y;
      
      // محدود کردن موقعیت به مرزهای تصویر
      if (imageRef.current && containerRef.current) {
        const img = imageRef.current;
        const container = containerRef.current;
        
        const imgWidth = img.naturalWidth * scale;
        const imgHeight = img.naturalHeight * scale;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // محاسبه حداکثر فاصله مجاز برای حرکت
        // این محاسبه را بهبود دادیم تا حرکت نرم‌تر باشد
        const maxX = Math.max(0, (imgWidth - containerWidth) / 2);
        const maxY = Math.max(0, (imgHeight - containerHeight) / 2);
        
        // محدود کردن حرکت
        const clampedX = Math.min(Math.max(newX, -maxX), maxX);
        const clampedY = Math.min(Math.max(newY, -maxY), maxY);
        
        setPosition({ x: clampedX, y: clampedY });
      } else {
        setPosition({ x: newX, y: newY });
      }
    }
  };
  
  const handleTouchEnd = (e) => {
    // ریست کردن فاصله ذخیره شده
    lastTouchDistanceRef.current = 0;
    
    // ریست کردن وضعیت drag
    if (e.touches.length === 0) {
      setIsDragging(false);
    }
    
    // به‌روزرسانی لیست لمس‌های فعال
    touchesRef.current = Array.from(e.touches).map(touch => ({
      identifier: touch.identifier,
      pageX: touch.pageX,
      pageY: touch.pageY
    }));
  };
  
  // مدیریت چرخ ماوس برای زوم با استفاده از passive: false
  useEffect(() => {
    const container = containerRef.current;
    
    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY * -0.01;
      const newScale = Math.min(Math.max(0.5, scale + delta), 5);
      
      // زوم به مرکز ویو‌پورت
      if (container) {
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // محاسبه تغییر موقعیت
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
      // ثبت رویداد با passive: false برای امکان استفاده از preventDefault
      container.addEventListener('wheel', handleWheel, { passive: false });
    }
    
    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [isOpen, scale, position]);
  
  // غیرفعال کردن اسکرول در کل صفحه هنگام باز بودن مودال
  useEffect(() => {
    if (!isOpen) return;
    
    // ذخیره وضعیت اولیه overflow
    const originalStyle = window.getComputedStyle(document.body).overflow;
    
    // غیرفعال کردن اسکرول
    document.body.style.overflow = 'hidden';
    
    // اضافه کردن کلاس به جلوگیری از اسکرول در iOS
    document.documentElement.classList.add('overflow-hidden');
    
    // ثبت کننده رویداد touchmove در سطح document برای جلوگیری از اسکرول
    const preventScroll = (e) => {
      e.preventDefault();
    };
    
    // اضافه کردن event listener با passive: false
    document.addEventListener('touchmove', preventScroll, { passive: false });
    
    return () => {
      // برگرداندن وضعیت اصلی
      document.body.style.overflow = originalStyle;
      document.documentElement.classList.remove('overflow-hidden');
      document.removeEventListener('touchmove', preventScroll);
    };
  }, [isOpen]);
  
  // ریست زوم هنگام باز/بسته شدن مودال
  useEffect(() => {
    if (isOpen) {
      resetZoom();
      setImageLoaded(false);
      lastTouchDistanceRef.current = 0;
    }
  }, [isOpen]);
  
  // بهبود مدیریت دکمه بستن
  const handleClose = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };
  
  if (!isOpen) return null;

  // آماده‌سازی URL تصویر با کیفیت بالا
  // اطمینان از استفاده از URL اصلی بدون محدودیت اندازه
  const highQualityImageUrl = imageUrl.replace(/-\d+x\d+\./, '.'); // حذف پسوندهای اندازه وردپرس

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-90 select-none"
      onClick={onClose}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'none' }}
    >
      {/* Loading indicator */}
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
   {/* دکمه بستن بهینه‌شده برای iOS با فاصله بیشتر از بالا */}
<button 
  onClick={handleClose}
  className="fixed top-[80px] right-6 w-8 h-8 bg-white text-black font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-gray-200 z-[99999]"
  style={{ 
    touchAction: 'manipulation',
    WebkitAppearance: 'none',
    transform: 'translateZ(0)',
    willChange: 'transform',
    // جلوگیری از چسبیدن به safe area در آیفون
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
            transition: imageLoaded ? 'opacity 0.3s ease' : 'none', // فقط transition برای opacity
            willChange: 'transform', // بهبود عملکرد برای انیمیشن transform
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
 const [mediaType, setMediaType] = useState(''); // 'image' یا 'video'
 const messageRef = useRef(null);

 const content = message.content?.rendered || '';
 const title = message.title?.rendered || '';
 const audioUrl = message.meta?.audio_url;

 // پردازش محتوا برای اصلاح ویدیو و تصاویر
 useEffect(() => {
   if (!content || !messageRef.current) return;
   
   const parser = new DOMParser();
   const doc = parser.parseFromString(content, 'text/html');
   
   // پردازش ویدیوها
   const videos = doc.querySelectorAll('video');
   
   videos.forEach((video, index) => {
     // بررسی source tags
     const sources = video.querySelectorAll('source');
     let videoSrc = video.getAttribute('src');
     
     // اگر src مستقیم نداشت، از source tag استفاده کن
     if (!videoSrc && sources.length > 0) {
       videoSrc = sources[0].getAttribute('src');
     }
     
     const videoTitle = video.getAttribute('title') || 'ویدیو';
     
     if (!videoSrc) {
       return; // اگر src پیدا نشد، این ویدیو را رد کن
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
     
     // جایگزینی ویدیو
     video.parentNode.replaceChild(videoPlaceholder, video);
   });
   
   // پردازش تصاویر
   // پردازش تصاویر
const images = doc.querySelectorAll('img');
images.forEach(img => {
  img.classList.add('message-image');
  const originalSrc = img.getAttribute('src');
  const highQualitySrc = originalSrc ? originalSrc.replace(/-\d+x\d+\./, '.') : originalSrc;
  
  // اضافه کردن lazy loading و caching
  img.loading = 'lazy';
  img.decoding = 'async';
  
  // حذف cache parameter برای یکسان‌سازی URL
  // if (originalSrc && !originalSrc.includes('?')) {
  //   img.src = originalSrc + '?cache=1';
  // }
  
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


// اضافه کردن Intersection Observer برای تصاویر
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      const src = img.getAttribute('data-src');
      if (src && !globalImageCache.has(src)) {
        img.src = src;
        globalImageCache.add(src);
        imageObserver.unobserve(img);
      }
    }
  });
}, { threshold: 0.1 });

// اعمال observer به تصاویر - فقط تصاویری که قبلاً لود نشده‌اند
images.forEach(img => {
  const originalSrc = img.getAttribute('src');
  if (originalSrc) {
    // تمیز کردن URL از cache parameters
    const cleanSrc = originalSrc.replace('?cache=1', '');
    
    if (!globalImageCache.has(cleanSrc)) {
      // تصویر قبلاً لود نشده، از lazy loading استفاده کن
      img.setAttribute('data-src', cleanSrc);
      img.removeAttribute('src');
      imageObserver.observe(img);
    } else {
      // تصویر قبلاً لود شده، مستقیماً نمایش بده
      img.src = cleanSrc;
    }
  }
});

// پاک کردن observer در cleanup

   if (messageRef.current) {
     messageRef.current.innerHTML = '';
     Array.from(doc.body.childNodes).forEach(node => {
       messageRef.current.appendChild(node);
     });
     
     // اضافه کردن event listener بعد از appendChild
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
    return () => {
     imageObserver.disconnect();
   };
 }, [content, onVideoClick]);


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
       {/* نمایش عنوان پست اگر وجود داشته باشد */}
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
     
     {/* Media Modal */}
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
const PublicChannel = ({ isDarkMode, isOpen = true, onClose }) => {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const containerRef = useRef(null);
  const loadingMoreRef = useRef(null);
  // اضافه کردن state برای دکمه اسکرول به پایین
const [showScrollButton, setShowScrollButton] = useState(false);
const previousPostsCountRef = useRef(0);
const [lastLoadedPostId, setLastLoadedPostId] = useState(null);
const [showVideoPlayer, setShowVideoPlayer] = useState(false);
const [currentVideo, setCurrentVideo] = useState({ url: '', title: '' });



  
  // اضافه کردن انیمیشن
  const [showCard, setShowCard] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  // اضافه کردن state‌های مربوط به pull-to-refresh

  

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
    // Handle back button behavior - simplified approach
    const handleBackButton = () => {
      if (isOpen) {
        closeCard();
      }
    };
  
    // Listen for the popstate event (back button)
    window.addEventListener('popstate', handleBackButton);
    
    // Clean up the event listener
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
      
      // اگر onClose به عنوان prop منتقل شده باشد، از آن استفاده کن
      if (onClose) {
        onClose();
      } else {
        // در غیر این صورت، از navigate استفاده کن
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

// Fetch posts function
const fetchPosts = async (pageNumber) => {
  try {
    setLoading(true);
    const auth = btoa('ck_20b3c33ef902d4ccd94fc1230c940a85be290e0a:cs_e8a85df738324996fd3608154ab5bf0ccc6ded99');
    const response = await fetch(
      `https://p30s.com/wp-json/wp/v2/posts?_embed&order=desc&orderby=date&per_page=10&page=${pageNumber}&categories=111`,
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
    
    // ذخیره تعداد پست‌های فعلی قبل از بروزرسانی
    previousPostsCountRef.current = posts.length;
    
    // ذخیره آیدی اولین پست موجود قبل از اضافه کردن پست‌های جدید (فقط برای صفحات بعد از اول)
    if (pageNumber > 1 && posts.length > 0) {
      setLastLoadedPostId(posts[0]?.id);
    } else {
      setLastLoadedPostId(null);
    }
    
    if (pageNumber === 1) {
      // برای صفحه اول، پست‌ها را معکوس می‌کنیم تا آخرین پست در پایین باشد
      setPosts([...data].reverse());
      
      // این کد را در فانکشن fetchPosts پس از تغییر کش پست‌ها اضافه کنید
      // این کار برای آپدیت سرویس نوتیفیکیشن مهم است
      if (data.length > 0) {
        // اگر صفحه اول است و داده‌ها را دریافت کرده‌ایم، پست‌ها را به عنوان خوانده شده علامت‌گذاری می‌کنیم
        channelNotificationService.markAllAsRead();
      }
    } else {
      // برای صفحات بعدی، پست‌های جدید را در بالای لیست قرار می‌دهیم
      setPosts(prevPosts => [...data].reverse().concat(prevPosts));
    }
    
    setLoading(false);
  } catch (error) {
    console.error('Error fetching posts:', error);
    setLoading(false);
    setHasMore(false);
  }
};




  useEffect(() => {
    fetchPosts(1);
  }, []);
  

useEffect(() => {
  // فقط وقتی که پیام‌ها لود شد، شمارشگر را ریست کنیم
  if (!loading && posts.length > 0) {
    // ریست کردن شمارشگر پیام‌های ناخوانده بر اساس زمان فعلی
    channelNotificationService.markAllAsRead();
  }
}, [loading, posts]);

useEffect(() => {
  if (isOpen) {
    // وقتی کانال باز می‌شود، همه پست‌ها را به عنوان خوانده شده علامت‌گذاری می‌کنیم
    // استفاده از markAllAsRead بدون پارامتر چون در سرویس جدید از timestamp استفاده می‌شود
    channelNotificationService.markAllAsRead();
  }
}, [isOpen]);


// اضافه کردن useEffect جدید برای مدیریت نوتیفیکیشن در زمان unmount
useEffect(() => {
  return () => {
    // علامت‌گذاری همه پیام‌ها به عنوان خوانده شده هنگام خروج از کانال
    channelNotificationService.markAllAsRead();
  };
}, []);

  // اسکرول به آخرین پیام پس از بارگذاری پست‌های جدید

  useEffect(() => {
    if (messagesEndRef.current && page === 1 && posts.length > 0) {
      // اسکرول به آخرین پیام
      setTimeout(() => {
        messagesEndRef.current.scrollIntoView({ behavior: "auto" });
      }, 300);
    }
  }, [posts, page]);


// اضافه کردن event listener برای نمایش/مخفی کردن دکمه اسکرول
useEffect(() => {
  if (!containerRef.current) return;
  
  const container = containerRef.current;
  
  const handleScroll = () => {
    // اگر به اندازه کافی اسکرول کرده باشیم (100 پیکسل)، دکمه را نمایش دهیم
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





// اسکرول به نشانگر پس از بارگذاری پست‌های جدید
// اسکرول به نشانگر پس از بارگذاری پست‌های جدید - بهینه شده برای اندروید
useEffect(() => {
  if (!loading && lastLoadedPostId && page > 1) {
    setTimeout(() => {
      const divider = document.getElementById('new-content-divider');
      if (divider && containerRef.current) {
        // منطقه قابل مشاهده مرورگر
        const viewportHeight = containerRef.current.clientHeight;
        
        // موقعیت دیوایدر نسبت به پدر
        const dividerPosition = divider.offsetTop;
        
        // اسکرول به موقعیتی که دیوایدر در مرکز صفحه باشد
        containerRef.current.scrollTo({
          top: dividerPosition - (viewportHeight / 2) + (divider.clientHeight / 2),
          behavior: 'smooth'
        });
        
        // هایلایت موقت دیوایدر برای جلب توجه
        divider.style.transition = 'background-color 0.5s ease';
        const originalBg = isDarkMode ? 'rgba(17, 24, 39, 0.8)' : 'rgba(243, 244, 246, 0.8)';
        const highlightBg = isDarkMode ? 'rgba(55, 65, 81, 0.95)' : 'rgba(229, 231, 235, 0.95)';
        
        // افکت بصری برای جلب توجه
        divider.style.backgroundColor = highlightBg;
        setTimeout(() => {
          divider.style.backgroundColor = originalBg;
        }, 800);
      }
    }, 1000);
  }
}, [loading, lastLoadedPostId, page, isDarkMode]);


// اضافه کردن useEffect جدید برای مدیریت unread notification ها در زمان unmount کامپوننت
useEffect(() => {
  // وقتی کامپوننت unmount می‌شود
  return () => {
    // مطمئن شوید که همه پست‌ها به عنوان خوانده شده علامت‌گذاری شده‌اند
    if (posts.length > 0) {
      const latestPostId = posts[0]?.id;
      channelNotificationService.markAllAsRead(latestPostId);
    } else {
      channelNotificationService.markAllAsRead();
    }
  };
}, [posts]);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////





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
           آپدیت مارکت
          </h2>
        </div>

        {/* Main Content Area */}
        <div className="absolute top-16 bottom-0 left-0 right-0 flex flex-col overflow-hidden">


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
  // imageCache={globalImageCache} را حذف کنید
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
          
          {/* گرادینت پایین صفحه حذف شد */}
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

  /* بهبود کارایی تصاویر */
.message-image {
  will-change: auto;
  backface-visibility: hidden;
  transform: translateZ(0);
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}

/* کش کردن تصاویر */
.message-bubble img {
  content-visibility: auto;
  contain-intrinsic-size: 300px 200px;
}
  
  /* استایل برای عنوان پست */
  .message-bubble .message-title {
    font-size: 1.3rem;
    font-weight: bold;
    color: #f7d55d;
    margin-bottom: 0.75rem;
    line-height: 1.4;
    word-break: break-word;
  }
  
  /* استایل برای لیست‌ها */
  .message-bubble ul {
    padding-right: 20px;
    list-style-position: inside;
    user-select: none;  
  }

  /* استایل برای تاریخ و زمان */
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

  /* استایل جدید برای کانتینر ویدیو */
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
        
  /* استایل برای دکمه پخش */
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

  /* مثلث پخش داخل دکمه */
  .video-play-button:before {
    content: '';
    width: 0; 
    height: 0;
    border-top: 15px solid transparent;
    border-bottom: 15px solid transparent;
    border-left: 25px solid rgba(255, 255, 255, 0.8);
    margin-left: 5px;
  }

  /* تغییر حالت هنگام هاور */
  .video-play-button:hover {
    background-color: rgba(255, 255, 255, 0.5);
    transform: translate(-50%, -50%) scale(1.1);
  }

  /* حالت پنهان شدن دکمه بعد از پخش ویدیو */
  .video-container.playing .video-play-button {
    opacity: 0;
    pointer-events: none;
  }
  
  /* کانتینر برای ویدیوهای افقی */
  .landscape-container {
    max-width: 350px;
    max-height: 220px;
  }
  
  /* کانتینر برای ویدیوهای عمودی */
  .portrait-container {
    max-width: 220px;
    max-height: 350px;
  }

  /* استایل برای ویدیوها */
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
  
  /* ویدیوهای افقی */
  .landscape-video {
    max-height: 200px !important;
    max-width: 350px !important;
  }
  
  /* ویدیوهای عمودی */
  .portrait-video {
    max-height: 350px !important;
    max-width: 220px !important;
  }
  
  /* ویدیوهای چندگانه */
  .multiple-videos {
    margin-top: 16px;
    margin-bottom: 16px;
  }
  
  .multiple-videos:not(:first-child) {
    margin-top: 20px;
  }

  /* استایل برای آیفریم‌ها */
  .iframe-container {
    position: relative;
    width: 100%;
    max-width: 350px;
    padding-bottom: 56.25%; /* نسبت 16:9 */
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

  /* استایل برای تصاویر */
  .message-image {
    max-width: 100%;
    height: auto;
    border-radius: 12px;
    margin: 8px 0;
    cursor: pointer;
  }

  /* استایل برای لینک‌ها */
  .message-bubble a {
    color: #f7d55d;
    text-decoration: none;
  }
  
  .message-bubble a:hover {
    text-decoration: underline;
  }
  
  /* حذف پدینگ اضافی برای پاراگراف‌ها */
  .message-bubble p {
    margin-top: 0.5em;
    margin-bottom: 0.5em;
  }
  
  /* حذف هایلایت برای المان‌های تعاملی */
  * {
    -webkit-tap-highlight-color: transparent;
  }
  
  /* فیکس برای ویدیوهای با کنترل‌ها */
  video::-webkit-media-controls-panel {
    background-color: rgba(0,0,0,0.5);
  }
  
  /* اصلاح ویدیوهای پلیر دوم */
  .message-bubble > video + video,
  .message-bubble > div:has(video) + div:has(video) {
    margin-top: 16px !important;
  }
  
  /* بهبود کنترل‌های ویدیو */
  video::-webkit-media-controls {
    background-color: rgba(0, 0, 0, 0.4);
  }
  
  video::-webkit-media-controls-play-button,
  video::-webkit-media-controls-fullscreen-button {
    background-color: rgba(255, 255, 255, 0.4);
    border-radius: 50%;
  }
  
  /* بهبود نمایش در موبایل */
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
    
    /* کاهش سایز عنوان در موبایل */
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

export default PublicChannel;