import { useState, useEffect } from 'react';

/**
 * زر العودة للأعلى — يظهر في أي صفحة بعد الـ scroll 300px
 * يُضاف في AppLayout مرة واحدة
 */
export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <>
      <button
        className={`scroll-top-btn${visible ? ' visible' : ''}`}
        onClick={scrollTop}
        aria-label="العودة للأعلى"
      >
        <i className="fas fa-arrow-up" />
      </button>

      <style>{`
        .scroll-top-btn {
          position: fixed;
          bottom: 32px;
          left: 32px;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--teal-600, #267880) 0%, var(--teal-700, #1e6268) 100%);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          box-shadow: 0 4px 20px rgba(38,120,128,0.35);
          opacity: 0;
          transform: translateY(16px) scale(0.9);
          transition: opacity 0.3s cubic-bezier(0.22,1,0.36,1),
                      transform 0.3s cubic-bezier(0.22,1,0.36,1),
                      background 0.2s ease,
                      box-shadow 0.2s ease;
          z-index: 9990;
          pointer-events: none;
        }
        .scroll-top-btn.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
        }
        .scroll-top-btn:hover {
          background: linear-gradient(135deg, var(--teal-700, #1e6268) 0%, var(--teal-800, #164e52) 100%);
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 8px 28px rgba(38,120,128,0.45);
        }
        .scroll-top-btn:active {
          transform: translateY(-1px) scale(0.98);
        }
        .scroll-top-btn i {
          transition: transform 0.2s ease;
        }
        .scroll-top-btn:hover i {
          animation: stbBounce 0.5s ease infinite alternate;
        }
        @keyframes stbBounce {
          from { transform: translateY(0); }
          to   { transform: translateY(-4px); }
        }
        @media (max-width: 640px) {
          .scroll-top-btn { bottom: 24px; left: 16px; width: 42px; height: 42px; font-size: 14px; }
        }
      `}</style>
    </>
  );
}