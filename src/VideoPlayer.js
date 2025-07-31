// components/VideoPlayer.js - نسخه بهینه‌سازی شده برای WebView اندروید و iOS
import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

const VideoPlayer = ({ videoUrl, title, isDarkMode, onClose }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
const [isMuted, setIsMuted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedOptions, setShowSpeedOptions] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [buffered, setBuffered] = useState([]);
  const [videoError, setVideoError] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState(videoUrl);
  const [fallbackUrls] = useState([
    videoUrl,
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    'https://www.w3schools.com/html/mov_bbb.mp4'
  ]);
  const [urlIndex, setUrlIndex] = useState(0);

  const [loadingProgress, setLoadingProgress] = useState(0);
const [isLargeFile, setIsLargeFile] = useState(false);
  const controlsTimeoutRef = useRef(null);


  // تابع بررسی اندازه فایل
const checkFileSize = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentLength = response.headers.get('content-length');
    const fileSizeMB = contentLength ? parseInt(contentLength) / (1024 * 1024) : 0;
    
    console.log(`File size: ${fileSizeMB.toFixed(2)} MB`);
    
    if (fileSizeMB > 300) { // اگر بیشتر از 300 مگابایت بود
      setIsLargeFile(true);
    }
    
    return fileSizeMB;
  } catch (error) {
    console.error('Error checking file size:', error);
    return 0;
  }
};

  // تشخیص iOS
  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) || 
                      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(isIOSDevice);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadMetadata = () => {
      setDuration(video.duration);
      console.log('Video metadata loaded:', video.duration);
    };
    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => {
      setIsBuffering(false);
      setIsPlaying(true);
    };
    const handlePause = () => setIsPlaying(false);
    const handleSeeked = () => setIsBuffering(false);
    const handleCanPlay = () => {
      setIsBuffering(false);
      console.log('Video can play');
    };
    const handleLoadStart = () => {
      console.log('Video load started');
      setIsBuffering(true);
    };
    const handleLoadedData = () => {
      console.log('Video data loaded');
      setIsBuffering(false);
    };
    const handleError = (e) => {
      console.error('Video error:', e.target.error);
      
      // سعی در استفاده از URL بعدی
      if (urlIndex < fallbackUrls.length - 1) {
        const nextIndex = urlIndex + 1;
        console.log(`Trying fallback URL ${nextIndex}:`, fallbackUrls[nextIndex]);
        setUrlIndex(nextIndex);
        setCurrentVideoUrl(fallbackUrls[nextIndex]);
        setVideoError(null);
        // کمی تأخیر برای اجتناب از loop سریع
        setTimeout(() => {
          if (video) {
            video.load();
          }
        }, 1000);
      } else {
        setVideoError(e.target.error);
        setIsBuffering(false);
      }
    };
    const handleProgress = () => {
      const buffered = video.buffered;
      const bufferedRanges = [];
      for (let i = 0; i < buffered.length; i++) {
        bufferedRanges.push({
          start: buffered.start(i),
          end: buffered.end(i),
        });
      }
      setBuffered(bufferedRanges);
    };

    // Event listeners
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadMetadata);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('pause', handlePause);
    video.addEventListener('seeked', handleSeeked);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('error', handleError);
    video.addEventListener('progress', handleProgress);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadMetadata);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('error', handleError);
      video.removeEventListener('progress', handleProgress);
    };
  }, []);

  useEffect(() => {
    const hideControls = () => {
      if (isPlaying) {
        setShowControls(false);
      }
    };

    if (showControls) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(hideControls, 3000);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls, isPlaying]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMouseMove = () => {
    setShowControls(true);
  };

  const handleUserInteraction = () => {
    setHasUserInteracted(true);
  };

const togglePlay = async () => {
  const video = videoRef.current;
  if (!video) return;

  if (!hasUserInteracted) {
    setHasUserInteracted(true);
  }

  try {
    if (video.paused) {
      // برای iOS ابتدا با muted پخش می‌کنیم
      video.muted = true;
      setIsMuted(true);
      
      if (video.readyState === 0) {
        video.load();
      }
      
      const playPromise = video.play();
      
      if (playPromise !== undefined) {
        await playPromise;
        setIsPlaying(true);
        
        // پس از 500ms صدا را روشن می‌کنیم
        setTimeout(() => {
          if (video && !video.paused) {
            video.muted = false;
            setIsMuted(false);
          }
        }, 500);
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
  } catch (error) {
    console.error('Play/pause failed:', error);
    setVideoError({ code: 999, message: 'پخش ویدیو امکان‌پذیر نیست' });
  }
};

  const handleSeek = (e) => {
    const time = e.target.value;
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleSpeedChange = (speed) => {
    videoRef.current.playbackRate = speed;
    setPlaybackRate(speed);
    setShowSpeedOptions(false);
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

 // مدیریت دکمه بک
useEffect(() => {
  const handleBackButton = (event) => {
    event.preventDefault();
    onClose();
  };

  // تنظیم تعامل کاربر بلافاصله
  setHasUserInteracted(true);

  if (window.postMessage) {
    window.postMessage(JSON.stringify({
      type: 'VIDEO_PLAYER_OPENED'
    }), '*');
  }
  
  window.history.pushState({ videoPlayer: true }, '');
  window.addEventListener('popstate', handleBackButton);
  
  return () => {
    window.removeEventListener('popstate', handleBackButton);
    
    if (window.postMessage) {
      window.postMessage(JSON.stringify({
        type: 'VIDEO_PLAYER_CLOSED'
      }), '*');
    }
  };
}, [onClose]);

  useEffect(() => {
  const video = videoRef.current;
  if (!video || !isIOS) return;

  const handleLoadedData = () => {
    if (hasUserInteracted && video.paused) {
      video.play().catch(console.error);
    }
  };

  video.addEventListener('loadeddata', handleLoadedData);
  
  return () => {
    video.removeEventListener('loadeddata', handleLoadedData);
  };
}, [hasUserInteracted, isIOS]);

// useEffect برای بررسی اندازه فایل
useEffect(() => {
  if (currentVideoUrl) {
    checkFileSize(currentVideoUrl);
  }
}, [currentVideoUrl]);

// useEffect برای tracking پیشرفت بارگذاری
useEffect(() => {
  const video = videoRef.current;
  if (!video) return;

  const handleProgress = () => {
    const buffered = video.buffered;
    const duration = video.duration;
    
    if (buffered.length > 0 && duration > 0) {
      const loadedEnd = buffered.end(buffered.length - 1);
      const progress = (loadedEnd / duration) * 100;
      setLoadingProgress(progress);
    }
  };

  video.addEventListener('progress', handleProgress);
  
  return () => {
    video.removeEventListener('progress', handleProgress);
  };
}, []);

  // تابع retry برای بارگذاری مجدد ویدیو
  const retryVideo = () => {
    console.log('Retrying video load...');
    setVideoError(null);
    setIsBuffering(true);
    setUrlIndex(0);
    setCurrentVideoUrl(fallbackUrls[0]);
    const video = videoRef.current;
    if (video) {
      video.load();
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 ${isDarkMode ? 'bg-black' : 'bg-white'}`}
      onMouseMove={handleMouseMove}
      onClick={handleUserInteraction}
      onTouchStart={handleUserInteraction}
      dir="ltr"
      style={{ direction: 'ltr' }}
    >
      <div className="relative h-full">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-14 left-7 z-[9999] flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500 hover:bg-yellow-600"
        >
          <X size={20} className="text-black" />
        </button>

        {/* Video */}
      <video
  ref={videoRef}
  src={currentVideoUrl}
  className="w-full h-full object-contain"
  // onClick={togglePlay} را حذف کنید
  // onTouchEnd={togglePlay} را حذف کنید
  playsInline
  webkit-playsinline="true"
  x5-playsinline="true"
  x5-video-player-type="h5-page"
  x5-video-player-fullscreen="true"
  controls={false}
preload={isLargeFile ? "none" : "metadata"}
  disablePictureInPicture
muted={true}
  crossOrigin="anonymous"
          style={{
            backgroundColor: '#000',
            zIndex: 1
          }}
        />

        {/* Error Message */}
        {videoError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-20">
            <div className="text-white text-center p-4 max-w-sm">
              <p className="mb-4 text-lg">خطا در بارگذاری ویدیو</p>
              <p className="text-sm text-gray-300 mb-4">
                {isIOS ? 
                  'ممکن است به دلیل محدودیت‌های شبکه یا فرمت ویدیو باشد' :
                  `کد خطا: ${videoError.code} - ${videoError.message}`
                }
              </p>
              <p className="text-xs text-gray-400 mb-4">
                URL فعلی: {urlIndex + 1} از {fallbackUrls.length}
              </p>
              <div className="space-y-2">
                <button
                  onClick={retryVideo}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-lg font-medium"
                >
                  تلاش مجدد
                </button>
                <br />
                <button
                  onClick={onClose}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium"
                >
                  بستن
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Buffering Indicator */}
{isBuffering && !videoError && (
  <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
    <div className="text-white text-center p-4 max-w-sm">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-500 border-t-transparent mb-4 mx-auto" />
      <p className="text-lg mb-2">در حال بارگذاری ویدیو...</p>
      {isLargeFile && (
        <p className="text-sm text-gray-300 mb-4">
          فایل حجیم است، کمی صبر کنید
        </p>
      )}
      {loadingProgress > 0 && (
        <div className="w-full bg-gray-600 rounded-full h-2 mt-4">
          <div 
            className="bg-yellow-500 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${Math.min(loadingProgress, 100)}%` }}
          ></div>
        </div>
      )}
    </div>
  </div>
)}



        {/* Video Controls */}
        {showControls && (
          <>
            {/* Title */}
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4 z-30">
              <h2 className="text-white text-lg font-medium text-left ml-12">{title}</h2>
            </div>

            {/* Play/Pause Center Button */}
{hasUserInteracted && !isPlaying && (
  <button
    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 w-20 h-20 rounded-full bg-yellow-500/90 hover:bg-yellow-600/90 flex items-center justify-center shadow-lg transition-colors"
    onClick={togglePlay}
  >
    <svg className="w-8 h-8 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  </button>
)}
            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent z-30">
              {/* Progress Bar */}
              <div className="px-4 py-1">
                <div className="relative w-full h-1 bg-white/30 rounded-full">
                  <div
                    className="absolute top-0 left-0 h-1 bg-yellow-500 rounded-full"
                    style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  />
                  {buffered.map((range, index) => (
                    <div
                      key={index}
                      className="absolute top-0 h-1 bg-white/50 rounded-full"
                      style={{
                        left: `${duration > 0 ? (range.start / duration) * 100 : 0}%`,
                        width: `${duration > 0 ? ((range.end - range.start) / duration) * 100 : 0}%`,
                      }}
                    />
                  ))}
                  <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="absolute top-0 left-0 w-full h-1 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between px-4 pb-4">
                <div className="flex items-center gap-4">
                  {/* Play/Pause */}
                  <button onClick={togglePlay} className="text-white hover:text-yellow-500">
                    {isPlaying ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>

                  {/* Volume */}
                  <div className="relative group">
                    {isMobile ? (
                      <button onClick={toggleMute} className="text-white hover:text-yellow-500">
                        {isMuted ? (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                          </svg>
                        )}
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button onClick={toggleMute} className="text-white hover:text-yellow-500">
                          {isMuted ? (
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                            </svg>
                          )}
                        </button>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className="w-24 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    )}
                  </div>

                  {/* Time */}
                  <span className="text-white text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                {/* Playback Speed */}
                <div className="relative">
                  <button
                    onClick={() => setShowSpeedOptions(!showSpeedOptions)}
                    className="text-white hover:text-yellow-500 text-sm flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {playbackRate}x
                  </button>

                  {showSpeedOptions && (
                    <div className="absolute bottom-full right-0 mb-2 py-2 bg-black/90 rounded">
                      {[0.5, 1, 1.25, 1.5, 2].map((speed) => (
                        <button
                          key={speed}
                          onClick={() => handleSpeedChange(speed)}
                          className={`block w-full px-4 py-1 text-sm text-left ${
                            playbackRate === speed ? 'text-yellow-500' : 'text-white'
                          } hover:bg-white/10`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;