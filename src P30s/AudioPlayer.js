import React, { useState, useRef, useEffect } from 'react';

const AudioPlayer = ({ audioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);

  // Event listeners remain the same
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
      });

      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime);
      });

      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });
    }

    return () => {
      if (audio) {
        audio.removeEventListener('loadedmetadata', () => {});
        audio.removeEventListener('timeupdate', () => {});
        audio.removeEventListener('ended', () => {});
      }
    };
  }, [audioRef]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Modified to generate shorter bars for very small screens
  const generateBars = (count = 30) => {
    const bars = [];
    for (let i = 0; i < count; i++) {
      // Reduced height range for small screens
      const height = 2 + Math.random() * 8;
      bars.push(
        <div
          key={i}
          className="w-[3px] mx-[1px] rounded-full bg-white/50"
          style={{ height: `${height}px` }}
        />
      );
    }
    return bars;
  };

  return (
    <div 
      className="w-full rounded-3xl p-2 sm:p-4 mt-4"
      style={{
        background: `linear-gradient(to bottom right, #f7d55d, #e5c255)`
      }}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <audio
          ref={audioRef}
          src={audioUrl}
          className="hidden"
        />
        
        {/* Play button - Adjusted size for small screens */}
        <button
          onClick={handlePlayPause}
          className="w-9 h-9 sm:w-14 sm:h-14 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-md mt-4 sm:mt-6"
        >
          {isPlaying ? (
            <svg 
              className="w-3 h-3 sm:w-6 sm:h-6" 
              fill="currentColor" 
              viewBox="0 0 24 24"
              style={{ color: '#f7d55d' }}
            >
              <rect x="7" y="6" width="3" height="12" rx="1" />
              <rect x="14" y="6" width="3" height="12" rx="1" />
            </svg>
          ) : (
            <svg 
              className="w-7 h-7 sm:w-6 sm:h-6 ml-0.5" 
              fill="currentColor" 
              viewBox="0 0 24 24"
              style={{ color: '#f7d55d' }}
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Main container */}
        <div className="flex-1 min-w-0"> {/* Added min-w-0 to prevent overflow */}
          {/* Times Container - Adjusted for small screens */}
          <div className="flex justify-between mb-2 sm:mb-3">
            <div className="text-sm sm:text-base text-white/90 font-bold">
              {formatTime(currentTime)}
            </div>
            <div className="text-sm sm:text-base text-white/90 font-bold p-1 font-bold">
              {formatTime(duration)}
            </div>
          </div>
          
          {/* Waveform Container - Mobile (fewer bars for small screens) */}
          <div className="flex items-center sm:hidden overflow-hidden h-6 sm:h-8">
            <div className="flex items-center gap-[1px] flex-1">
              {generateBars(90)} {/* Reduced number of bars */}
            </div>
          </div>

          {/* Waveform Container - Desktop */}
          <div className="hidden sm:flex items-center justify-between h-10">
            <div className="flex items-center gap-[2px] overflow-hidden">
              {generateBars(30)}
            </div>
            <div className="flex items-center gap-[2px] overflow-hidden">
              {generateBars(30)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;