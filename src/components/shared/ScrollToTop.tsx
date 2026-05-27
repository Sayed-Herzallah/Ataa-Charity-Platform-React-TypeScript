// import { useState, useEffect, useCallback, useRef } from 'react';

// interface ScrollToTopProps {
//   /** اسم الـ CSS class للـ scroll container — للداشبورد نمرر 'ap-content' */
//   containerClass?: string;
//   /** حد الـ scroll قبل ما يظهر الزر (default 300px) */
//   threshold?: number;
// }

// /**
//  * ScrollToTop — universal scroll detection
//  * يشتغل مع window scroll AND custom scroll containers
//  * يسمع على كلهم في نفس الوقت لأن بعض layouts تمزج بينهم
//  */
// export default function ScrollToTop({ containerClass, threshold = 280 }: ScrollToTopProps) {
//   const [visible, setVisible] = useState(false);
//   const containerRef = useRef<Element | null>(null);
//   const attachedRef = useRef(false);

//   const updateVisibility = useCallback(() => {
//     const containerScroll = containerRef.current
//       ? (containerRef.current as HTMLElement).scrollTop
//       : 0;
//     const winScroll = window.scrollY || document.documentElement.scrollTop;
//     setVisible(Math.max(containerScroll, winScroll) > threshold);
//   }, [threshold]);

//   /* attach to custom container when available */
//   useEffect(() => {
//     if (!containerClass) return;

//     const attach = () => {
//       const el = document.querySelector(`.${containerClass}`);
//       if (!el || attachedRef.current) return false;
//       containerRef.current = el;
//       attachedRef.current = true;
//       el.addEventListener('scroll', updateVisibility, { passive: true });
//       updateVisibility();
//       return true;
//     };

//     if (attach()) return;

//     // poll until element appears (lazy-rendered dashboards)
//     const interval = setInterval(() => { if (attach()) clearInterval(interval); }, 200);
//     return () => {
//       clearInterval(interval);
//       if (containerRef.current) {
//         containerRef.current.removeEventListener('scroll', updateVisibility);
//       }
//       attachedRef.current = false;
//     };
//   }, [containerClass, updateVisibility]);

//   /* always listen on window too — handles pages that scroll on window */
//   useEffect(() => {
//     window.addEventListener('scroll', updateVisibility, { passive: true });
//     // check immediately in case already scrolled
//     updateVisibility();
//     return () => window.removeEventListener('scroll', updateVisibility);
//   }, [updateVisibility]);

//   const scrollTop = () => {
//     const el = containerRef.current;
//     if (el && (el as HTMLElement).scrollTop > 0) {
//       (el as HTMLElement).scrollTo({ top: 0, behavior: 'smooth' });
//     }
//     if (window.scrollY > 0) {
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//     }
//   };

//   return (
//     <>
//       <button
//         className={`scroll-top-btn${visible ? ' visible' : ''}`}
//         onClick={scrollTop}
//         aria-label="العودة للأعلى"
//         title="العودة للأعلى"
//       >
//         <i className="ti ti-arrow-up" />
//       </button>

//       <style>{`
//         .scroll-top-btn {
//           position: fixed;
//           bottom: 28px;
//           left: 28px;
//           width: 44px;
//           height: 44px;
//           border-radius: 50%;
//           background: linear-gradient(135deg, #267880 0%, #1e6268 100%);
//           color: #fff;
//           border: 2px solid rgba(255,255,255,0.12);
//           cursor: pointer;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           font-size: 17px;
//           box-shadow: 0 4px 20px rgba(38,120,128,0.45), 0 1px 4px rgba(0,0,0,0.18);
//           opacity: 0;
//           transform: translateY(14px) scale(0.86);
//           transition:
//             opacity 0.28s cubic-bezier(0.22,1,0.36,1),
//             transform 0.28s cubic-bezier(0.22,1,0.36,1),
//             box-shadow 0.2s ease;
//           /* Must be above sidebar (200-300), modals (400+), mobile-nav (100) */
//           z-index: 9999;
//           pointer-events: none;
//           /* ensure it's never clipped */
//           isolation: isolate;
//         }
//         .scroll-top-btn.visible {
//           opacity: 1;
//           transform: translateY(0) scale(1);
//           pointer-events: auto;
//         }
//         .scroll-top-btn:hover {
//           background: linear-gradient(135deg, #2e8e98 0%, #267880 100%);
//           transform: translateY(-3px) scale(1.07);
//           box-shadow: 0 10px 30px rgba(38,120,128,0.52), 0 2px 8px rgba(0,0,0,0.2);
//         }
//         .scroll-top-btn:active {
//           transform: translateY(0) scale(0.96);
//         }
//         .scroll-top-btn:hover i {
//           animation: stbBounce 0.45s ease infinite alternate;
//         }
//         @keyframes stbBounce {
//           from { transform: translateY(0); }
//           to   { transform: translateY(-4px); }
//         }

//         /* Mobile — above bottom nav bar */
//         @media (max-width: 768px) {
//           .scroll-top-btn {
//             bottom: 84px;
//             left: 14px;
//             width: 40px;
//             height: 40px;
//             font-size: 15px;
//           }
//         }
//         @media (max-width: 480px) {
//           .scroll-top-btn {
//             bottom: 80px;
//             left: 10px;
//             width: 38px;
//             height: 38px;
//           }
//         }
//       `}</style>
//     </>
//   );
// }

import { useState, useEffect } from 'react';

/**
 * Reusable ScrollToTop Button
 * Supports both window scrolling and internal dashboard scroll containers (.ap-content).
 * Uses event capturing to automatically detect scrolls on any nested elements.
 */
export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      let isScrolled = window.scrollY > 300 || document.documentElement.scrollTop > 300;

      // Check if there is an active internal dashboard scroll container (.ap-content)
      const apContent = document.querySelector('.ap-content');
      if (apContent && apContent.scrollTop > 300) {
        isScrolled = true;
      }

      setVisible(isScrolled);
    };

    // Use capture: true to capture scroll events from any nested scrollable elements (like .ap-content)
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    
    // Initial check
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll, { capture: true });
    };
  }, []);

  const scrollTop = () => {
    // Scroll window
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });

    // Scroll any active internal dashboard container
    const apContent = document.querySelector('.ap-content');
    if (apContent) {
      apContent.scrollTo({ top: 0, behavior: 'smooth' });
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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="scroll-top-svg"
        >
          <line x1="12" y1="19" x2="12" y2="5"></line>
          <polyline points="5 12 12 5 19 12"></polyline>
        </svg>
      </button>

      <style>{`
        .ap-scroll-top-btn {
          position: fixed;
          bottom: 32px;
          left: 32px;
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--teal, #0ec97f) 0%, #0aaa68 100%);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(14, 201, 127, 0.4);
          opacity: 0;
          transform: translateY(16px) scale(0.9);
          transition: opacity 0.3s cubic-bezier(0.22, 1, 0.36, 1),
                      transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
                      background 0.2s ease,
                      box-shadow 0.2s ease;
          z-index: 99999 !important;
          pointer-events: none;
        }

        .ap-scroll-top-btn.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
        }

        .ap-scroll-top-btn:hover {
          background: linear-gradient(135deg, #0aaa68 0%, #088e56 100%);
          transform: translateY(-4px) scale(1.08);
          box-shadow: 0 8px 28px rgba(14, 201, 127, 0.55);
        }

        .ap-scroll-top-btn:active {
          transform: translateY(-1px) scale(0.96);
        }

        .scroll-top-svg {
          transition: transform 0.2s ease;
        }

        .ap-scroll-top-btn:hover .scroll-top-svg {
          animation: stbBounce 0.5s ease infinite alternate;
        }

        @keyframes stbBounce {
          from { transform: translateY(0); }
          to   { transform: translateY(-4px); }
        }

        /* Responsive positioning to float above mobile navigation bar */
        @media (max-width: 768px) {
          .ap-scroll-top-btn {
            bottom: calc(var(--mobile-nav-h, 60px) + 16px) !important;
            left: 16px !important;
            width: 40px !important;
            height: 40px !important;
          }
          .scroll-top-svg {
            width: 16px;
            height: 16px;
          }
        }
      `}</style>
    </>
  );
}