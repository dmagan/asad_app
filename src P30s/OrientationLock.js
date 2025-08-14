import React from 'react';

const OrientationLock = ({ children }) => {
  return children;
};

export default OrientationLock;
/*



import React, { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

const OrientationLock = ({ children, isDarkMode, allowLandscape = false }) => {
  const [showBlocker, setShowBlocker] = useState(false);

  useEffect(() => {
    function checkOrientation() {
      // اگر allowLandscape روشن است، نیازی به بررسی نیست
      if (allowLandscape) {
        setShowBlocker(false);
        return;
      }

      let isLandscape = false;

      // روش اول: استفاده از window.screen.orientation
      if (window.screen && window.screen.orientation) {
        isLandscape = window.screen.orientation.type.includes('landscape');
      } 
      // روش دوم: استفاده از window.orientation
      else if (window.orientation !== undefined) {
        isLandscape = Math.abs(window.orientation) === 90;
      } 
      // روش سوم: مقایسه ابعاد صفحه
      else {
        isLandscape = window.innerWidth > window.innerHeight;
      }

      setShowBlocker(isLandscape);
    }

    // بررسی اولیه
    checkOrientation();

    // تنظیم event listener ها
    if (window.screen && window.screen.orientation) {
      window.screen.orientation.addEventListener('change', checkOrientation);
    }
    window.addEventListener('orientationchange', checkOrientation);
    window.addEventListener('resize', checkOrientation);

    // cleanup
    return () => {
      if (window.screen && window.screen.orientation) {
        window.screen.orientation.removeEventListener('change', checkOrientation);
      }
      window.removeEventListener('orientationchange', checkOrientation);
      window.removeEventListener('resize', checkOrientation);
    };
  }, [allowLandscape]);

  if (showBlocker) {
    return (
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isDarkMode ? '#141e35' : 'white',
          color: isDarkMode ? 'white' : '#1a1a1a',
          overflow: 'hidden'
        }}
      >
        <div style={{ marginBottom: '1rem', animation: 'bounce 1s infinite' }}>
          <RotateCcw style={{ width: 64, height: 64, color: '#f7d55d' }} />
        </div>
        <p style={{ 
          fontSize: '1.25rem', 
          fontWeight: 500, 
          textAlign: 'center',
          padding: '0 1rem',
          marginBottom: '0.5rem'
        }}>
          لطفا گوشی خود را به حالت عمودی بچرخانید
        </p>
        <p style={{ 
          fontSize: '0.875rem', 
          color: '#6b7280',
          textAlign: 'center',
          padding: '0 1rem'
        }}>
          این صفحه فقط در حالت عمودی قابل استفاده است
        </p>
      </div>
    );
  }

  return children;
};

export default OrientationLock;
*/