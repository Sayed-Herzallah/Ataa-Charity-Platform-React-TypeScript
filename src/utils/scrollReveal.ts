/* ── Count-up helper ───────────────────────────────────────────── */
function animateCountUp(el: HTMLElement, target: number, duration = 1400) {
  if (el.dataset.counted) return; // don't re-run
  el.dataset.counted = '1';
  const start = performance.now();
  const hasComma = target >= 1000;

  const tick = (now: number) => {
    const elapsed = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - elapsed, 3); // ease-out-cubic
    const current = Math.round(ease * target);
    el.textContent = hasComma ? current.toLocaleString('en') : String(current);
    if (elapsed < 1) requestAnimationFrame(tick);
    else el.textContent = hasComma ? target.toLocaleString('en') : String(target);
  };
  requestAnimationFrame(tick);
}

/* ── Trigger count-up on any [data-target] elements inside root ── */
function triggerCountUp(root: Element) {
  root.querySelectorAll<HTMLElement>('[data-target]').forEach((numEl) => {
    const target = parseInt(numEl.dataset.target || '0', 10);
    if (!isNaN(target)) animateCountUp(numEl, target);
  });
  // also check if root itself has data-target
  if ((root as HTMLElement).dataset?.target) {
    const target = parseInt((root as HTMLElement).dataset.target || '0', 10);
    if (!isNaN(target)) animateCountUp(root as HTMLElement, target);
  }
}

/* ── Scroll Reveal ─────────────────────────────────────────────── */
export function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;

        if (el.dataset.stagger !== undefined) {
          el.querySelectorAll(':scope > *').forEach((child) => {
            child.classList.add('revealed');
          });
          triggerCountUp(el);
        } else {
          el.classList.add('revealed');
          triggerCountUp(el);
        }

        observer.unobserve(el);
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  );

  document.querySelectorAll('[data-reveal], [data-stagger]').forEach((el) => {
    observer.observe(el);
  });

  return () => observer.disconnect();
}