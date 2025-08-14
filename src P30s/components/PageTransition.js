import React, { useEffect, useRef } from 'react';

const PageTransition = ({ children }) => {
  const pageRef = useRef(null);

  useEffect(() => {
    // انیمیشن ورود
    if (pageRef.current) {
      pageRef.current.style.opacity = '0';
      pageRef.current.style.transform = 'translateX(100%)';
      
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (pageRef.current) {
            pageRef.current.style.opacity = '1';
            pageRef.current.style.transform = 'translateX(0)';
          }
        });
      });
    }

    // تمیزکاری هنگام unmount
    return () => {
      if (pageRef.current) {
        pageRef.current.style.opacity = '0';
        pageRef.current.style.transform = 'translateX(100%)';
      }
    };
  }, []);

  return (
    <div
      ref={pageRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        opacity: 0,
        transform: 'translateX(100%)',
        transition: 'transform 0.3s cubic-bezier(0.17, 0.67, 0.24, 0.99), opacity 0.3s ease-out',
        pointerEvents: 'auto',
        backgroundColor: 'transparent',
      }}
    >
      {children}
    </div>
  );
};

export default PageTransition;