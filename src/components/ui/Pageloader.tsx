import React, { useEffect } from 'react';
import '../../styles/css/Pageloader.css';

interface PageLoaderProps {
  text?: string;
  fullscreen?: boolean;
  inline?: boolean;
  className?: string;
}

export default function PageLoader({
  fullscreen = true,
  inline = false,
  className = '',
}: PageLoaderProps) {
  useEffect(() => {
    if (fullscreen && !inline) {
      const originalOverflow = document.body.style.overflow;
      const originalHeight = document.body.style.height;
      const originalWidth = document.body.style.width;

      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
      document.body.style.width = '100vw';

      const htmlEl = document.documentElement;
      const originalHtmlOverflow = htmlEl.style.overflow;
      const originalHtmlHeight = htmlEl.style.height;
      const originalHtmlWidth = htmlEl.style.width;

      htmlEl.style.overflow = 'hidden';
      htmlEl.style.height = '100vh';
      htmlEl.style.width = '100vw';

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.height = originalHeight;
        document.body.style.width = originalWidth;

        htmlEl.style.overflow = originalHtmlOverflow;
        htmlEl.style.height = originalHtmlHeight;
        htmlEl.style.width = originalHtmlWidth;
      };
    }
  }, [fullscreen, inline]);

  return (
    <div
      className={`pl-root ${fullscreen && !inline ? 'pl-fullscreen' : ''} ${inline ? 'pl-inline' : ''} ${className}`}
      role="status"
    >
      <div className="pl-container">
        {/* Modern premium three-dot bouncing loader */}
        <div className="pl-dots-container">
          <div className="pl-dot" />
          <div className="pl-dot" />
          <div className="pl-dot" />
        </div>
      </div>
    </div>
  );
}