import { useState, useEffect, useCallback } from 'react';

interface ScrollToTopProps {
  containerRef?: React.RefObject<HTMLElement | null>;
}

export default function ScrollToTop({ containerRef }: ScrollToTopProps) {
  const [visible, setVisible] = useState(false);

  const updateVisibility = useCallback(() => {
    if (containerRef?.current && containerRef.current.scrollTop > 300) {
      setVisible(true);
      return;
    }
    if (window.scrollY > 300 || document.documentElement.scrollTop > 300) {
      setVisible(true);
      return;
    }
    const containers = document.querySelectorAll<HTMLElement>('.ap-content, .ap-main');
    if (Array.from(containers).some(el => el.scrollTop > 300)) {
      setVisible(true);
      return;
    }
    setVisible(false);
  }, [containerRef]);

  useEffect(() => {
    const target = containerRef?.current;
    window.addEventListener('scroll', updateVisibility, { capture: true, passive: true });
    target?.addEventListener('scroll', updateVisibility, { passive: true });
    const apContents = document.querySelectorAll<HTMLElement>('.ap-content, .ap-main');
    apContents.forEach(el => el.addEventListener('scroll', updateVisibility, { passive: true }));
    updateVisibility();
    return () => {
      window.removeEventListener('scroll', updateVisibility, { capture: true });
      target?.removeEventListener('scroll', updateVisibility);
      apContents.forEach(el => el.removeEventListener('scroll', updateVisibility));
    };
  }, [containerRef, updateVisibility]);

  const scrollTop = () => {
    if (containerRef?.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const apContent = document.querySelector<HTMLElement>('.ap-content');
    if (apContent && apContent.scrollTop > 0) {
      apContent.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
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
        /* ── Scroll To Top Button ── */
        .ap-scroll-top-btn {
          position: fixed !important;
          bottom: 32px !important;
          right: 24px !important;
          left: auto !important;
          width: 48px !important;
          height: 48px !important;
          border-radius: 50% !important;
          /* Always brand blue background */
          background: #3b82f6 !important;
          /* Light mode: black arrow */
          color: #000000 !important;
          border: none !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.35) !important;
          z-index: 99999 !important;
          opacity: 0 !important;
          transform: translateY(16px) scale(0.9) !important;
          pointer-events: none !important;
          transition: opacity 0.3s cubic-bezier(0.22, 1, 0.36, 1),
                      transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
                      background 0.2s ease,
                      color 0.2s ease,
                      box-shadow 0.2s ease !important;
        }
        .ap-scroll-top-btn.visible {
          opacity: 1 !important;
          transform: translateY(0) scale(1) !important;
          pointer-events: auto !important;
        }
        .ap-scroll-top-btn:hover {
          background: #2563eb !important;
          color: #000000 !important;
          transform: translateY(-4px) scale(1.08) !important;
          box-shadow: 0 8px 28px rgba(59, 130, 246, 0.5) !important;
        }
        .ap-scroll-top-btn:active {
          transform: translateY(-1px) scale(0.96) !important;
        }

        /* ── Dark mode: blue background, white arrow ── */
        body:not(.ap-light-theme) .ap-scroll-top-btn,
        html[data-theme="dark"] .ap-scroll-top-btn {
          background: #3b82f6 !important;
          color: #ffffff !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), 0 0 0 1.5px rgba(255, 255, 255, 0.08) !important;
        }
        body:not(.ap-light-theme) .ap-scroll-top-btn:hover,
        html[data-theme="dark"] .ap-scroll-top-btn:hover {
          background: #2563eb !important;
          color: #ffffff !important;
          box-shadow: 0 8px 28px rgba(0, 0, 0, 0.55), 0 0 0 1.5px rgba(255, 255, 255, 0.15) !important;
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