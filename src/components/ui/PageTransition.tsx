import { useEffect, useRef, ReactNode } from 'react';
import { useLocation } from 'wouter';

interface Props {
  children: ReactNode;
}

export default function PageTransition({ children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [location] = useLocation();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // 1. Reset state instantly to avoid flicker or jump
    el.style.transition = 'none';
    el.style.opacity = '0';
    el.style.transform = 'translate3d(0, 14px, 0)';

    // Force repaint
    void el.offsetHeight;

    // 2. Apply premium hardware-accelerated transitions
    el.style.transition = [
      'opacity 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
      'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)'
    ].join(', ');

    // 3. Drive transition home
    el.style.opacity = '1';
    el.style.transform = 'translate3d(0, 0, 0)';

    // Scroll to top instantly
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location]);

  return (
    <div
      ref={ref}
      style={{
        opacity: 0,
        transform: 'translate3d(0, 14px, 0)',
        willChange: 'opacity, transform'
      }}
    >
      {children}
    </div>
  );
}