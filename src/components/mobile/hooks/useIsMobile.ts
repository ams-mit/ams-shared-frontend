import { useState, useEffect } from 'react';

export interface MobileState {
  isMobile: boolean;       // width <= 768px
  isSmallMobile: boolean;  // width <= 480px
  isTablet: boolean;       // 769px <= width <= 1024px
  width: number;
}

export const useIsMobile = (breakpoint = 768): MobileState => {
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return {
    isMobile: windowWidth <= breakpoint,
    isSmallMobile: windowWidth <= 480,
    isTablet: windowWidth > 768 && windowWidth <= 1024,
    width: windowWidth,
  };
};
