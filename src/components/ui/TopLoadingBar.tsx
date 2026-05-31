import { useEffect, useState } from 'react';
import { loadingEvents } from '../../utils/loadingEvents';

export default function TopLoadingBar() {
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    let timer: any;
    let stepTimer: any;

    const handleLoading = (isLoading: boolean) => {
      if (isLoading) {
        clearInterval(stepTimer);
        clearTimeout(timer);
        setVisible(true);
        setOpacity(1);
        setWidth(10); // Start showing

        // Simulate stepping progression
        stepTimer = setInterval(() => {
          setWidth(prev => {
            if (prev >= 88) {
              clearInterval(stepTimer);
              return 88;
            }
            // Step slower as we get closer to 90
            const step = prev < 50 ? 8 : prev < 75 ? 3 : 1;
            return prev + step;
          });
        }, 220);
      } else {
        clearInterval(stepTimer);
        setWidth(100); // Instantly finish

        // Elegantly fade out
        timer = setTimeout(() => {
          setOpacity(0);
          timer = setTimeout(() => {
            setVisible(false);
            setWidth(0);
          }, 350); // Match transition speed
        }, 200);
      }
    };

    const unsubscribe = loadingEvents.subscribe(handleLoading);
    return () => {
      unsubscribe();
      clearInterval(stepTimer);
      clearTimeout(timer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 'auto',
        direction: 'ltr',
        height: '3px',
        width: `${width}%`,
        background: 'linear-gradient(90deg, #0ec97f 0%, #06b6d4 50%, #3b82f6 100%)',
        boxShadow: '0 0 10px rgba(6, 182, 212, 0.5), 0 0 4px rgba(14, 201, 127, 0.3)',
        zIndex: 999999,
        opacity: opacity,
        transition: width === 100 
          ? 'width 0.2s ease-out, opacity 0.3s ease-out' 
          : 'width 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease-out',
        willChange: 'width, opacity',
        pointerEvents: 'none',
      }}
    />
  );
}
