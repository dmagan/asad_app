// EmbeddedVideoPlayer.js - نسخه ساده و سازگار با iOS و اندروید
import React, { useState } from 'react';
import { Play } from 'lucide-react';

const EmbeddedVideoPlayer = ({ videoUrl, title, isDarkMode }) => {
  const [loading, setLoading] = useState(true);
  const [showPlayOverlay, setShowPlayOverlay] = useState(true);

  const handleVideoLoad = () => {
    setLoading(false);
  };

  const handlePlayClick = () => {
    setShowPlayOverlay(false);
  };

  // استایل برای کنترل‌های استاندارد ویدیو
  const customControlsStyle = `
    .custom-video-player::-webkit-media-controls-panel {
      background-color: rgba(0, 0, 0, 0.6);
    }
    
    .custom-video-player::-webkit-media-controls-play-button {
      filter: brightness(0) saturate(100%) invert(91%) sepia(61%) saturate(3117%) hue-rotate(332deg) brightness(100%) contrast(96%);
    }
    
    .custom-video-player::-webkit-media-controls-current-time-display,
    .custom-video-player::-webkit-media-controls-time-remaining-display {
      color: white;
    }
    
    .custom-video-player::-webkit-media-controls-timeline {
      filter: hue-rotate(355deg) saturate(200%);
    }
  `;

  return (
    <div className="video-wrapper relative rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
      {/* استایل‌های سفارشی برای کنترل‌های ویدیو */}
      <style>{customControlsStyle}</style>
      
      {/* عنوان ویدیو */}
      {title && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-2 z-10 pointer-events-none">
          <h2 className="text-white text-sm font-medium text-right">{title}</h2>
        </div>
      )}
      
      {/* نشانگر بارگذاری */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-yellow-500 border-t-transparent" />
        </div>
      )}
      
      {/* دکمه پخش اولیه (فقط برای iOS) */}
      {showPlayOverlay && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/40 z-20 cursor-pointer"
          onClick={handlePlayClick}
        >
          <div className="w-16 h-16 rounded-full bg-yellow-500/80 flex items-center justify-center">
            <Play size={30} className="text-black ml-1" />
          </div>
        </div>
      )}
      
      {/* ویدیو با کنترل‌های استاندارد */}
      <video
        className={`w-full h-full object-contain custom-video-player ${!showPlayOverlay ? 'z-30' : ''}`}
        src={videoUrl}
        controls
        controlsList="nodownload"
        playsInline={true}
        webkit-playsinline="true"
        preload="metadata"
        onLoadedData={handleVideoLoad}
        poster=""
        style={{
          borderRadius: '0.75rem',
          backgroundColor: isDarkMode ? '#000000' : '#111827'
        }}
      />
    </div>
  );
};

export default EmbeddedVideoPlayer;