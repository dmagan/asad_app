import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Volume2, VolumeX } from 'lucide-react';
import { useParams } from 'react-router-dom';
import CustomLoading from '../CustomLoading';

const StoriesPage = ({ isDarkMode, stories = [] }) => {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preloadedMedia, setPreloadedMedia] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  
  // For touch gestures and effects
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isExiting, setIsExiting] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState(null);

  // References
  const progressInterval = useRef(null);
  const contentRef = useRef(null);
  const containerRef = useRef(null);
  const touchTimeoutRef = useRef(null);
  const videoRef = useRef(null);

  const STORY_DURATION = 15000; // 15 seconds for images
  const UPDATE_INTERVAL = 100;
  const SWIPE_THRESHOLD = 70;
  const VERTICAL_SWIPE_THRESHOLD = 100;
  const DRAG_LIMIT_Y = 150;
  const DRAG_LIMIT_X = 250;

  const currentStory = stories[currentStoryIndex];
  // Get media gallery for current story
  const currentGallery = processStoryGallery(currentStory);
  
  // Process the gallery data from the story
  function processStoryGallery(story) {
    if (!story) return [];
    
    // Check for the new gallery_media format that includes type
    if (story.meta?.gallery_media && Array.isArray(story.meta.gallery_media)) {
      return story.meta.gallery_media;
    }
    
    // Legacy format: convert simple image URLs to media objects
    if (story.meta?.gallery_images && Array.isArray(story.meta.gallery_images)) {
      return story.meta.gallery_images.map(url => ({
        id: Math.random().toString(),
        url: url,
        type: detectMediaType(url)
      }));
    }
    
    // If no gallery, use featured image
    if (story._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
      return [{
        id: 'featured',
        url: story._embedded['wp:featuredmedia'][0].source_url,
        type: detectMediaType(story._embedded['wp:featuredmedia'][0].source_url)
      }];
    }
    
    return [];
  }
  
  // Helper to detect media type from URL
  function detectMediaType(url) {
    if (!url) return 'image';
    const extension = url.split('.').pop().toLowerCase();
    const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'm4v'];
    return videoExtensions.includes(extension) ? 'video' : 'image';
  }

  // Get the type of current media item
  const getCurrentMediaType = () => {
    if (currentGallery && currentGallery.length > 0) {
      const currentItem = currentGallery[currentImageIndex];
      if (currentItem) {
        return currentItem.type || detectMediaType(currentItem.url) || 'image';
      }
    }
    return 'image';
  };

  // Get the URL of current media item
  const getCurrentMediaUrl = () => {
    if (currentGallery && currentGallery.length > 0) {
      const currentItem = currentGallery[currentImageIndex];
      if (currentItem) {
        return currentItem.url || currentItem;
      }
    }
    
    // Fallback to featured image
    return stories[currentStoryIndex]?._embedded?.['wp:featuredmedia']?.[0]?.source_url || '';
  };

  // Preload media
  useEffect(() => {
    const preloadMedia = async () => {
      if (stories.length === 0) return;

      setIsLoading(true);

      // Preload current media
      const currentStory = stories[currentStoryIndex];
      if (!currentStory) return;

      const gallery = processStoryGallery(currentStory);
      
      // Preload current media item
      if (gallery[currentImageIndex]) {
        const mediaItem = gallery[currentImageIndex];
        const mediaUrl = mediaItem.url;
        const mediaType = mediaItem.type || detectMediaType(mediaUrl);
        
        if (mediaUrl && !preloadedMedia[mediaUrl]) {
          if (mediaType === 'image') {
            await preloadImage(mediaUrl);
          } else if (mediaType === 'video') {
            await preloadVideo(mediaUrl);
          }
          setPreloadedMedia(prev => ({ ...prev, [mediaUrl]: true }));
        }
      }

      // Preload next media items in current gallery
      const nextMediaToPreload = gallery.slice(currentImageIndex + 1, currentImageIndex + 3);
      for (const mediaItem of nextMediaToPreload) {
        const mediaUrl = mediaItem.url;
        const mediaType = mediaItem.type || detectMediaType(mediaUrl);
        
        if (mediaUrl && !preloadedMedia[mediaUrl]) {
          if (mediaType === 'image') {
            preloadImage(mediaUrl).then(() => {
              setPreloadedMedia(prev => ({ ...prev, [mediaUrl]: true }));
            });
          } else if (mediaType === 'video') {
            preloadVideo(mediaUrl).then(() => {
              setPreloadedMedia(prev => ({ ...prev, [mediaUrl]: true }));
            });
          }
        }
      }

      // Preload adjacent stories
      const adjacentStories = [
        currentStoryIndex < stories.length - 1 ? stories[currentStoryIndex + 1] : null,
        currentStoryIndex > 0 ? stories[currentStoryIndex - 1] : null
      ];

      for (const story of adjacentStories) {
        if (!story) continue;
        
        const nextGallery = processStoryGallery(story);
        
        if (nextGallery.length > 0) {
          const firstItem = nextGallery[0];
          const mediaUrl = firstItem.url;
          const mediaType = firstItem.type || detectMediaType(mediaUrl);
          
          if (mediaUrl && !preloadedMedia[mediaUrl]) {
            if (mediaType === 'image') {
              preloadImage(mediaUrl).then(() => {
                setPreloadedMedia(prev => ({ ...prev, [mediaUrl]: true }));
              });
            } else if (mediaType === 'video') {
              preloadVideo(mediaUrl).then(() => {
                setPreloadedMedia(prev => ({ ...prev, [mediaUrl]: true }));
              });
            }
          }
        }
      }

      setIsLoading(false);
    };

    preloadMedia();
  }, [currentStoryIndex, currentImageIndex, stories, preloadedMedia]);

  // Helper functions for preloading
  const preloadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = resolve;
      img.onerror = reject;
    });
  };

  const preloadVideo = (src) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = src;
      video.preload = 'auto';
      video.onloadeddata = resolve;
      video.onerror = reject;
      // Set timeout to avoid hanging on video preload
      const timeout = setTimeout(() => {
        resolve(); // Resolve anyway after 5 seconds
      }, 5000);
      video.onloadeddata = () => {
        clearTimeout(timeout);
        resolve();
      };
    });
  };

  // Progress management
  const startProgress = (startFrom = 0) => {
    setProgress(startFrom);
    clearInterval(progressInterval.current);

    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
        // If video is playing, calculate progress from video time
        if (getCurrentMediaType() === 'video' && videoRef.current) {
          const video = videoRef.current;
          if (video.readyState >= 2) { // Have enough data to calculate duration
            const percentage = (video.currentTime / video.duration) * 100;
            
            // If video has ended, go to next item
            if (video.ended) {
              clearInterval(progressInterval.current);
              handleMediaEnd();
              return 0;
            }
            
            return percentage;
          }
          return prev; // If video not ready, don't update progress
        }
        
        // For images, use timer-based progress
        if (prev >= 100) {
          clearInterval(progressInterval.current);
          handleMediaEnd();
          return 0;
        }
        
        return prev + 100 / (STORY_DURATION / UPDATE_INTERVAL);
      });
    }, UPDATE_INTERVAL);
  };

  // Handle media end
  const handleMediaEnd = () => {
    if (currentImageIndex < currentGallery.length - 1) {
      // Go to next media in same story
      setCurrentImageIndex((prev) => prev + 1);
    } else {
      // When we reach the last media, go to next story
      goToNextStory();
    }
  };

  // Set initial story based on URL
  useEffect(() => {
    const storyIndex = stories.findIndex(story => story.id === Number(storyId));
    if (storyIndex !== -1) {
      setCurrentStoryIndex(storyIndex);
    }
  }, [storyId, stories]);
  
  // Start media playback after loading
  useEffect(() => {
    if (stories.length > 0 && !isLoading && !isDragging) {
      // Set up video if current item is video
      if (getCurrentMediaType() === 'video' && videoRef.current) {
        const video = videoRef.current;
        video.currentTime = 0;
        video.muted = isMuted;
        
        try {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.error('Auto-play prevented:', error);
              // If autoplay is prevented, try with muted video
              if (!isMuted) {
                setIsMuted(true);
                video.muted = true;
                video.play().catch(e => console.error('Still cannot play video:', e));
              }
            });
          }
        } catch (error) {
          console.error('Error playing video:', error);
        }
      }
      
      startProgress();
    }
    
    return () => {
      clearInterval(progressInterval.current);
      clearTimeout(touchTimeoutRef.current);
    };
  }, [currentStoryIndex, currentImageIndex, stories.length, isLoading, isDragging, isMuted]);

  // Pause story on touch
  const handleTouchStart = (e) => {
    if (isLoading || transitionDirection) return;

    // Store initial touch position
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
    setIsDragging(true);
    setDragOffset({ x: 0, y: 0 });
    
    // Store touch start time
    touchTimeoutRef.current = e.timeStamp;
    
    // Pause progress and video
    clearInterval(progressInterval.current);
    if (getCurrentMediaType() === 'video' && videoRef.current) {
      videoRef.current.pause();
    }
    
    setIsPaused(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || isLoading || transitionDirection) return;
    
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
  
    // Calculate drag distance
    const deltaX = touchX - touchStartX;
    const deltaY = touchY - touchStartY;
    
    // Detect vertical drag down (to exit)
    if (deltaY > 10 && Math.abs(deltaY) > Math.abs(deltaX)) {
      const boundedDeltaY = Math.max(0, Math.min(DRAG_LIMIT_Y, deltaY));
  
      setDragOffset({
        x: 0,  // only vertical
        y: boundedDeltaY
      });
  
      if (boundedDeltaY > VERTICAL_SWIPE_THRESHOLD) {
        setIsExiting(true);
      } else {
        setIsExiting(false);
      }
    }
    // Detect horizontal drag (to change story)
    else if (Math.abs(deltaX) > 10 && Math.abs(deltaX) > Math.abs(deltaY)) {
      const boundedDeltaX = Math.max(-DRAG_LIMIT_X, Math.min(DRAG_LIMIT_X, deltaX));
  
      setDragOffset({
        x: boundedDeltaX,
        y: 0, // no vertical movement
      });
  
      setIsExiting(false);
    }
  };
    
  const handleTouchEnd = (e) => {
    if (!isDragging || isLoading || transitionDirection) return;
    
    setIsDragging(false);
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const swipeSpeed = Math.abs(deltaX) / (e.timeStamp - touchTimeoutRef.current);
    
    // If exiting and dragged enough
    if (isExiting && deltaY > VERTICAL_SWIPE_THRESHOLD) {
      setDragOffset({ x: 0, y: window.innerHeight });
      setTimeout(() => {
        navigate(-1);
      }, 300);
      return;
    }
    
    // If horizontal swipe and past threshold
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > SWIPE_THRESHOLD && swipeSpeed < 2.5) {
      if (deltaX < 0) {
        // Swipe left - next story
        setTransitionDirection('next');
        setTimeout(() => {
          goToNextStory();
          setTimeout(() => setTransitionDirection(null), 150);
        }, 25);
      } else {
        // Swipe right - previous story
        setTransitionDirection('prev');
        setTimeout(() => {
          goToPrevStory();
          setTimeout(() => setTransitionDirection(null), 150);
        }, 25);
      }
    } else if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
      // Determine if this is a quick tap or just holding
      const touchDuration = e.timeStamp - touchTimeoutRef.current;
      
    // If tap less than 300ms, consider it a click
if (touchDuration < 300) {
  // Simple click, go to next or previous part of story
  const halfWidth = window.innerWidth / 2;
  
  if (touchEndX < halfWidth) {
    // Left side click - restart current image if it's the first image
    if (currentImageIndex === 0) {
      // First image - restart timer
      startProgress(0);
    } else {
      // Otherwise go to previous image
      goToPrevImage();
    }
  } else {
    // Right side click - check if last story and last image
    if (currentStoryIndex === stories.length - 1 && currentImageIndex === currentGallery.length - 1) {
      // Last story, last image - exit app
      navigate(-1);
    } else {
      // Otherwise go to next image
      goToNextImage();
    }
  }
} else {
        // This is just holding and releasing - resume story
        resetPosition();
        
        // If video, resume playback
        if (getCurrentMediaType() === 'video' && videoRef.current) {
          videoRef.current.play();
        }
        
        setIsPaused(false);
      }
    } else {
      // Drag less than threshold, reset position
      resetPosition();
    }

    // Resume progress from same point
  // Resume progress from same point without restarting
setIsPaused(false);
if (!isExiting && Math.abs(deltaX) >= 10 || Math.abs(deltaY) >= 10) {
  startProgress(progress);
}
  };

  // Reset content position
 // Reset content position
const resetPosition = () => {
  setDragOffset({ x: 0, y: 0 });
  setIsExiting(false);
  
  // Resume progress from where it was paused
  startProgress(progress);
  
  // If video, resume playback
  if (getCurrentMediaType() === 'video' && videoRef.current) {
    videoRef.current.play();
  }
  
  setIsPaused(false);
};
  // Go to next image in current story
const goToNextImage = () => {
  if (currentImageIndex < currentGallery.length - 1) {
    setCurrentImageIndex(prev => prev + 1);
    startProgress(0);
  } else {
    // Right side click - check if last image in current story
    if (currentImageIndex === currentGallery.length - 1) {
      // Last image in story - exit app
      navigate(-1);
    } else {
      // Otherwise go to next image
      goToNextImage();
    }
  }
}
  
  // Go to previous image in current story
  const goToPrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
      startProgress(0);
    } else {
      // When on first image, restart it
      setCurrentImageIndex(0);
      startProgress(0);
    }
  };

  // Go to next story
  const goToNextStory = () => {
    // If on last story, go back to first
    if (currentStoryIndex === stories.length - 1) {
      setCurrentStoryIndex(0);
    } else {
      setCurrentStoryIndex(prev => prev + 1);
    }
    setCurrentImageIndex(0);
    startProgress(0);
  };

  // Go to previous story
  const goToPrevStory = () => {
    // If on first story, go to last
    if (currentStoryIndex === 0) {
      setCurrentStoryIndex(stories.length - 1);
    } else {
      setCurrentStoryIndex(prev => prev - 1);
    }
    setCurrentImageIndex(0);
    startProgress(0);
  };

  // Toggle video mute
  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !isMuted;
      setIsMuted(newMutedState);
      videoRef.current.muted = newMutedState;
    }
  };

  if (!stories || stories.length === 0) {
    return <CustomLoading />;
  }

  // Determine transition animation style
  const getTransitionStyle = () => {
    if (!transitionDirection) return {};
    
    if (transitionDirection === 'next') {
      return {
        transform: 'translate3d(100%, 0, 0) scale(0.95)',
        opacity: 0,
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      };
    } else if (transitionDirection === 'prev') {
      return {
        transform: 'translate3d(-100%, 0, 0) scale(0.95)',
        opacity: 0,
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      };
    }
    
    return {};
  };
  
  // Determine drag-based style
  const storyContainerStyle = {
    transform: isDragging 
      ? `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) scale(${1 - Math.abs(dragOffset.y) / 800})`
      : 'translate3d(0, 0, 0) scale(1)',
    opacity: isDragging ? 1 - Math.abs(dragOffset.y) / 400 : 1,
    transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const isVideo = getCurrentMediaType() === 'video';

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black select-none overflow-hidden perspective"
      style={{
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none',
        touchAction: 'manipulation',
        perspective: '1200px',
      }}
    >
      {/* Close button */}
      <div className="absolute top-0 right-0 z-50 p-4">
        <button
          onClick={() => navigate(-1)}
          className="text-white p-2 hover:bg-white/10 rounded-full transition-all"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Video mute/unmute button */}
      {isVideo && (
        <div className="absolute bottom-6 right-4 z-50">
          <button
            onClick={toggleMute}
            className="text-white p-2 bg-black/30 hover:bg-black/50 rounded-full transition-all"
          >
            {isMuted ? (
              <VolumeX className="w-6 h-6" />
            ) : (
              <Volume2 className="w-6 h-6" />
            )}
          </button>
        </div>
      )}

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 z-40 p-4">
        <div className="flex gap-1">
          {currentGallery.map((_, idx) => (
            <div
              key={idx}
              className="flex-1 h-1 bg-gray-500/50 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-white rounded-full transition-all duration-100 ease-linear"
                style={{
                  width:
                    idx < currentImageIndex
                      ? '100%'
                      : idx === currentImageIndex
                      ? `${progress}%`
                      : '0%',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div
        ref={contentRef}
        className={`h-full w-full ${isExiting ? 'exiting' : ''}`}
        style={{
          ...storyContainerStyle,
          ...getTransitionStyle(),
          WebkitTouchCallout: 'none',
          WebkitUserSelect: 'none',
          WebkitTapHighlightColor: 'transparent',
          userSelect: 'none',
          touchAction: 'manipulation',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute inset-0 z-10">
          {isLoading ? (
            <div className="h-full w-full flex items-center justify-center bg-black">
              <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {getCurrentMediaType() === 'video' ? (
                <video
                  ref={videoRef}
                  src={getCurrentMediaUrl()}
                  className="h-full w-full object-cover"
                  playsInline
                  muted={isMuted}
                  controls={false}
                  autoPlay
                  style={{
                    WebkitTouchCallout: 'none',
                    WebkitUserSelect: 'none',
                    pointerEvents: 'none',
                  }}
                />
              ) : (
                <img
                  src={getCurrentMediaUrl()}
                  alt={stories[currentStoryIndex]?.title?.rendered || 'Story image'}
                  className="h-full w-full object-cover"
                  style={{
                    WebkitTouchCallout: 'none',
                    WebkitUserSelect: 'none',
                    pointerEvents: 'none',
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Caption or story title */}
     

      {/* Styles for effects */}
      <style jsx>{`
        .perspective {
          perspective: 1200px;
        }
        
        .exiting {
          filter: brightness(0.9);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Disable iOS text selection and highlighting */
        * {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -webkit-tap-highlight-color: transparent;
          user-select: none;
        }
        
        img, video {
          -webkit-user-drag: none;
        }
      `}</style>
    </div>
  );
};

export default StoriesPage;