import React, { useState, useEffect, useRef } from 'react';

const useIntersectionObserver = (ref, options) => {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIntersecting(entry.isIntersecting);
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return isIntersecting;
};

const LazyImage = ({ src, alt, className, onClick }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);
  const imageRef = useRef();
  const isVisible = useIntersectionObserver(imageRef, {
    threshold: 0.1,
    rootMargin: '50px'
  });

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setShouldLoad(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  return (
    <div ref={imageRef} className={`relative ${className}`}>
      <div className={`absolute inset-0 bg-gray-200 animate-pulse rounded-xl ${isLoaded ? 'hidden' : ''}`} />
      
      {shouldLoad && !isError && (
        <img
          src={src}
          alt={alt}
          className={`transition-opacity duration-300 rounded-xl ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          onLoad={() => setIsLoaded(true)}
          onError={() => setIsError(true)}
          onClick={onClick}
        />
      )}
    </div>
  );
};

export default LazyImage;