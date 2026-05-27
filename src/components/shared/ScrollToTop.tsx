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

import { useState, useEffect, useCallback, useRef } from 'react';

interface ScrollToTopProps {
  /** اسم الـ CSS class للـ scroll container — للداشبورد نمرر 'ap-content' */
  containerClass?: string;
  /** حد الـ scroll قبل ما يظهر الزر (default 300px) */
  threshold?: number;
}

/**
 * ScrollToTop — universal scroll detection
 * يشتغل مع window scroll AND custom scroll containers
 * يسمع على كلهم في نفس الوقت لأن بعض layouts تمزج بينهم
 */
export default function ScrollToTop({ containerClass, threshold = 280 }: ScrollToTopProps) {
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLElement | null>(null);

  /* ── build a stable updater that reads current refs ── */
  const updateVisibility = useCallback(() => {
    const containerScroll = containerRef.current?.scrollTop ?? 0;
    const winScroll = window.scrollY || document.documentElement.scrollTop;
    setVisible(Math.max(containerScroll, winScroll) > threshold);
  }, [threshold]);

  /* ── attach / detach to the internal scroll container ── */
  useEffect(() => {
    // Clean up previous container listener whenever containerClass changes
    const prev = containerRef.current;
    if (prev) {
      prev.removeEventListener('scroll', updateVisibility);
      containerRef.current = null;
    }
    setVisible(false);

    if (!containerClass) return;

    let interval: ReturnType<typeof setInterval> | null = null;

    const attach = (): boolean => {
      // querySelector with the base class — works even when extra classes are present
      const el = document.querySelector<HTMLElement>(`.${containerClass}`);
      if (!el) return false;
      containerRef.current = el;
      el.addEventListener('scroll', updateVisibility, { passive: true });
      updateVisibility(); // check immediately
      return true;
    };

    if (!attach()) {
      // Poll until the lazily-rendered dashboard mounts
      interval = setInterval(() => { if (attach() && interval) clearInterval(interval); }, 150);
    }

    return () => {
      if (interval) clearInterval(interval);
      containerRef.current?.removeEventListener('scroll', updateVisibility);
      containerRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerClass]); // intentionally omit updateVisibility — rebuilt when threshold changes

  /* ── always listen on window too (regular pages) ── */
  useEffect(() => {
    window.addEventListener('scroll', updateVisibility, { passive: true });
    updateVisibility();
    return () => window.removeEventListener('scroll', updateVisibility);
  }, [updateVisibility]);

  /* ── re-check whenever threshold changes ── */
  useEffect(() => { updateVisibility(); }, [updateVisibility]);

  const scrollTop = () => {
    const el = containerRef.current;
    if (el && el.scrollTop > 0) {
      el.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (window.scrollY > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <button
        className={`scroll-top-btn${visible ? ' visible' : ''}`}
        onClick={scrollTop}
        aria-label="العودة للأعلى"
        title="العودة للأعلى"
      >
        <i className="ti ti-arrow-up" />
      </button>

      <style>{`
        .scroll-top-btn {
          position: fixed;
          bottom: 28px;
          left: 28px;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #267880 0%, #1e6268 100%);
          color: #fff;
          border: 2px solid rgba(255,255,255,0.12);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
          box-shadow: 0 4px 20px rgba(38,120,128,0.45), 0 1px 4px rgba(0,0,0,0.18);
          opacity: 0;
          transform: translateY(14px) scale(0.86);
          transition:
            opacity 0.28s cubic-bezier(0.22,1,0.36,1),
            transform 0.28s cubic-bezier(0.22,1,0.36,1),
            box-shadow 0.2s ease;
          /* فوق الـ sidebar (200-300) والـ modals (400+) والـ mobile-nav (100) */
          z-index: 9999;
          pointer-events: none;
          isolation: isolate;
        }
        .scroll-top-btn.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
        }
        .scroll-top-btn:hover {
          background: linear-gradient(135deg, #2e8e98 0%, #267880 100%);
          transform: translateY(-3px) scale(1.07);
          box-shadow: 0 10px 30px rgba(38,120,128,0.52), 0 2px 8px rgba(0,0,0,0.2);
        }
        .scroll-top-btn:active {
          transform: translateY(0) scale(0.96);
        }
        .scroll-top-btn:hover i {
          animation: stbBounce 0.45s ease infinite alternate;
        }
        @keyframes stbBounce {
          from { transform: translateY(0); }
          to   { transform: translateY(-4px); }
        }

        /* Mobile — فوق bottom nav bar */
        @media (max-width: 768px) {
          .scroll-top-btn {
            bottom: 84px;
            left: 14px;
            width: 40px;
            height: 40px;
            font-size: 15px;
          }
        }
        @media (max-width: 480px) {
          .scroll-top-btn {
            bottom: 80px;
            left: 10px;
            width: 38px;
            height: 38px;
          }
        }
      `}</style>
    </>
  );
}