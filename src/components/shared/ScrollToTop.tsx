// // src/components/shared/ScrollToTop.tsx
// import { useState, useEffect, useCallback } from 'react';

// interface ScrollToTopProps {
//   /** Optional ref to the scrollable container (e.g. ap-content div).
//    *  When provided, the button listens to that element's scroll instead of window.
//    *  This fixes the desktop issue where ap-layout has overflow:hidden and only
//    *  ap-content actually scrolls. */
//   containerRef?: React.RefObject<HTMLElement | null>;
// }

// export default function ScrollToTop(props?: any) {
//   // If called directly as an onClick event handler (like in Footer.tsx: onClick={ScrollToTop}),
//   // the first argument will be a React MouseEvent. We detect it and trigger the scroll immediately.
//   const isMouseEvent = props && (props.nativeEvent || props.target || typeof props.preventDefault === 'function');

//   if (isMouseEvent) {
//     // Scroll window + all active dashboard containers immediately
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//     document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
//     document.querySelectorAll('.ap-content').forEach(el => {
//       el.scrollTo({ top: 0, behavior: 'smooth' });
//     });
//     return null;
//   }

//   // Normal Component rendering mode:
//   const containerRef = props && typeof props === 'object' && 'containerRef' in props 
//     ? (props.containerRef as React.RefObject<HTMLElement | null>)
//     : undefined;

//   const [visible, setVisible] = useState(false);

//   const updateVisibility = useCallback(() => {
//     if (containerRef?.current) {
//       setVisible(containerRef.current.scrollTop > 150);
//     } else {
//       // Fallback: check window + any .ap-content containers in DOM
//       let scrolled = window.scrollY > 150 || document.documentElement.scrollTop > 150;
//       if (!scrolled) {
//         const containers = document.querySelectorAll('.ap-content');
//         for (let i = 0; i < containers.length; i++) {
//           if ((containers[i] as HTMLElement).scrollTop > 150) {
//             scrolled = true;
//             break;
//           }
//         }
//       }
//       setVisible(scrolled);
//     }
//   }, [containerRef]);

//   useEffect(() => {
//     // A capture-phase scroll listener on window catches all scroll events in the document DOM tree,
//     // including overflow-y scrolling on child divs like .ap-content.
//     // This perfectly solves the React ref mount timing issues (containerRef.current is null on mount)
//     // without any setInterval polling or memory leaks!
//     window.addEventListener('scroll', updateVisibility, { capture: true, passive: true });
//     updateVisibility();

//     return () => {
//       window.removeEventListener('scroll', updateVisibility, { capture: true });
//     };
//   }, [updateVisibility]);

//   const scrollTop = () => {
//     if (containerRef?.current) {
//       containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
//     } else {
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//       document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
//       document.querySelectorAll('.ap-content').forEach(el => {
//         el.scrollTo({ top: 0, behavior: 'smooth' });
//       });
//     }
//   };

//   return (
//     <button
//       className={`ap-scroll-top-btn${visible ? ' visible' : ''}`}
//       onClick={scrollTop}
//       aria-label="العودة للأعلى"
//       title="العودة للأعلى"
//     >
//       <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
//         viewBox="0 0 24 24" fill="none" stroke="currentColor"
//         strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
//         <line x1="12" y1="19" x2="12" y2="5"/>
//         <polyline points="5 12 12 5 19 12"/>
//       </svg>
//     </button>
//   );
// }
import { useState, useEffect, useCallback } from 'react';

interface ScrollToTopProps {
  /** Optional ref to the scrollable container (e.g. ap-content div).
   *  When provided, the button listens to that element's scroll instead of window.
   *  This fixes the desktop issue where ap-layout has overflow:hidden and only
   *  ap-content actually scrolls. */
  containerRef?: React.RefObject<HTMLElement | null>;
}

export default function ScrollToTop(props?: any) {
  // If called directly as an onClick event handler (like in Footer.tsx: onClick={ScrollToTop}),
  // the first argument will be a React MouseEvent. We detect it and trigger the scroll immediately.
  const isMouseEvent = props && (props.nativeEvent || props.target || typeof props.preventDefault === 'function');

  if (isMouseEvent) {
    // Scroll window + all active dashboard containers immediately
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
    document.querySelectorAll('.ap-content').forEach(el => {
      el.scrollTo({ top: 0, behavior: 'smooth' });
    });
    return null;
  }

  // Normal Component rendering mode:
  const containerRef = props && typeof props === 'object' && 'containerRef' in props 
    ? (props.containerRef as React.RefObject<HTMLElement | null>)
    : undefined;

  const [visible, setVisible] = useState(false);

  const updateVisibility = useCallback(() => {
    let scrolled = false;
    
    // 1. Check container Ref if provided
    if (containerRef?.current && containerRef.current.scrollTop > 150) {
      scrolled = true;
    }
    
    // 2. Fallback: check window scroll
    if (!scrolled && (window.scrollY > 150 || document.documentElement.scrollTop > 150)) {
      scrolled = true;
    }
    
    // 3. Fallback: check any .ap-content, .ap-main, or scrollable containers in DOM
    if (!scrolled) {
      const containers = document.querySelectorAll('.ap-content, .ap-main, .ap-layout');
      for (let i = 0; i < containers.length; i++) {
        if ((containers[i] as HTMLElement).scrollTop > 150) {
          scrolled = true;
          break;
        }
      }
    }
    
    setVisible(scrolled);
  }, [containerRef]);

  useEffect(() => {
    const handleScroll = () => {
      updateVisibility();
    };

    // 1. Listen on window (capture phase catches events from all elements)
    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    
    // 2. Listen directly on the provided containerRef
    const container = containerRef?.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
    }

    // 3. Fallback: Listen directly to scrollable areas in the DOM
    const elements = document.querySelectorAll('.ap-content, .ap-main, .ap-layout');
    elements.forEach(el => {
      el.addEventListener('scroll', handleScroll, { passive: true });
    });

    // Check initial visibility
    updateVisibility();

    // Check periodically in case layout changes dynamically
    const intervalId = setInterval(updateVisibility, 1000);

    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
      elements.forEach(el => {
        el.removeEventListener('scroll', handleScroll);
      });
      clearInterval(intervalId);
    };
  }, [containerRef, updateVisibility]);

  const scrollTop = () => {
    if (containerRef?.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
      document.querySelectorAll('.ap-content').forEach(el => {
        el.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  };

  return (
    <>
      <button
        className={`ap-scroll-top-btn${visible ? ' visible' : ''}`}
        onClick={scrollTop}
        aria-label="العودة للأعلى"
        title="العودة للأعلى"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
          viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="19" x2="12" y2="5"/>
          <polyline points="5 12 12 5 19 12"/>
        </svg>
      </button>

      <style dangerouslySetInnerHTML={{ __html: `
        .ap-scroll-top-btn {
          position: fixed !important;
          bottom: 88px !important;
          left: 24px !important;
          right: auto !important;
          width: 48px !important;
          height: 48px !important;
          border-radius: 50% !important;
          background: linear-gradient(135deg, var(--teal, #0ec97f) 0%, #0aaa68 100%) !important;
          color: #ffffff !important;
          border: none !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          box-shadow: 0 4px 20px rgba(14, 201, 127, 0.4) !important;
          z-index: 99999 !important;
          opacity: 0 !important;
          transform: translateY(16px) scale(0.9) !important;
          pointer-events: none !important;
          transition: opacity 0.3s cubic-bezier(0.22, 1, 0.36, 1),
                      transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
                      background 0.2s ease,
                      box-shadow 0.2s ease !important;
        }

        .ap-scroll-top-btn.visible {
          opacity: 1 !important;
          transform: translateY(0) scale(1) !important;
          pointer-events: auto !important;
        }

        .ap-scroll-top-btn:hover {
          background: linear-gradient(135deg, #0aaa68 0%, #088e56 100%) !important;
          transform: translateY(-4px) scale(1.08) !important;
          box-shadow: 0 8px 28px rgba(14, 201, 127, 0.55) !important;
        }

        .ap-scroll-top-btn:active {
          transform: translateY(-1px) scale(0.96) !important;
        }

        @media (max-width: 768px) {
          .ap-scroll-top-btn {
            bottom: calc(var(--mobile-nav-h, 60px) + 16px) !important;
            left: auto !important;
            right: 16px !important;
            width: 42px !important;
            height: 42px !important;
          }
        }
      `}} />
    </>
  );
}