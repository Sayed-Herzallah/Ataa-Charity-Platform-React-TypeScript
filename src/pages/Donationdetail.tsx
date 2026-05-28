
import { useState, useCallback, useEffect } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface DonorInfo {
  _id: string;
  userName?: string;
  name?: string;
  phone?: string;
  address?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface DonationImage {
  secure_url: string;
  public_id?: string;
}

interface Donation {
  _id: string;
  donorId?: DonorInfo | string | null;
  imageUrl?: DonationImage | DonationImage[];
  type: string;
  size?: string;
  quantity?: number;
  condition?: string;
  description?: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt?: string;
  address?: string;
  charityId?: string;
  rejectionReason?: string;
  acceptedAt?: string;
  rejectedAt?: string;
}

interface DonationDetailProps {
  donation: Donation | null;
  onBack: () => void;
  onAction?: (id: string, status: 'accepted' | 'rejected') => void;
  actionLoading?: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_MAP = {
  pending:  { label: 'قيد المراجعة', icon: 'ti-clock-hour-4',  bg: 'rgba(245,158,11,0.08)',  color: '#f59e0b', dot: '#f59e0b', glow: 'rgba(245,158,11,0.2)' },
  accepted: { label: 'مقبول',        icon: 'ti-circle-check',  bg: 'rgba(14,201,127,0.08)',  color: '#0ec97f', dot: '#0ec97f', glow: 'rgba(14,201,127,0.2)' },
  rejected: { label: 'مرفوض',        icon: 'ti-circle-x',      bg: 'rgba(239,68,68,0.08)',   color: '#ef4444', dot: '#ef4444', glow: 'rgba(239,68,68,0.2)'  },
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso?: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('ar-EG', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

// Ensure images array is strictly formatted
function getImages(donation: Donation): string[] {
  const raw = donation.imageUrl;
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(i => i.secure_url).filter(Boolean);
  if (typeof raw === 'object' && 'secure_url' in raw && raw.secure_url) return [raw.secure_url];
  return [];
}

function parseDonor(donorId: DonorInfo | string | null | undefined) {
  if (!donorId) return null;
  if (typeof donorId === 'string') return { _id: donorId, userName: null, name: null, phone: null, address: null, email: null, createdAt: null, updatedAt: null };
  const emailPrefix = donorId.email ? donorId.email.split('@')[0] : null;
  return {
    _id: donorId._id,
    userName: donorId.userName || emailPrefix || null,
    name: donorId.name || null,
    phone: donorId.phone || null,
    address: donorId.address || null,
    email: donorId.email || null,
    createdAt: donorId.createdAt || null,
    updatedAt: donorId.updatedAt || null,
  };
}

// ─── Injected CSS ─────────────────────────────────────────────────────────────
const STYLES = `
@keyframes ddFadeIn   { from { opacity:0; transform:scale(0.97) } to { opacity:1; transform:scale(1) } }
@keyframes ddSlideUp  { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
@keyframes ddSpin     { to { transform:rotate(360deg) } }
@keyframes ddPulse    { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.15); opacity: 1; } }

.dd-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  font-family: 'Tajawal', sans-serif !important;
  animation: ddSlideUp 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}

/* Modern Asymmetrical Grid */
.dd-layout-grid {
  display: grid;
  grid-template-columns: 7.5fr 4.5fr;
  gap: 20px;
  align-items: start;
}

@media (max-width: 1024px) {
  .dd-layout-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

/* Premium Dashboard Card styling */
.dd-card {
  background: var(--surface) !important;
  border: 1px solid var(--border) !important;
  border-radius: 16px !important;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.12) !important;
  padding: 24px;
  position: relative;
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.dd-card:hover {
  border-color: var(--border2) !important;
  box-shadow: 0 8px 26px rgba(0, 0, 0, 0.18) !important;
}

.dd-card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 800;
  color: var(--t1);
  padding-bottom: 14px;
  margin-bottom: 18px;
  border-bottom: 1px solid var(--border);
}

/* Specifications Grid */
.dd-spec-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

@media (max-width: 600px) {
  .dd-spec-grid {
    grid-template-columns: 1fr;
  }
}

/* Spec Box */
.dd-spec-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.dd-spec-box:hover {
  background: var(--surface3);
  border-color: var(--teal-dim);
  transform: translateY(-2px);
}

.dd-spec-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.dd-spec-label {
  font-size: 11.5px;
  color: var(--t4);
  margin-bottom: 2px;
  display: block;
}

.dd-spec-value {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--t1);
}

/* Interactive Action Buttons */
.dd-action-row {
  display: flex;
  gap: 12px;
  margin-top: 18px;
}

@media (max-width: 480px) {
  .dd-action-row {
    flex-direction: column;
  }
}

.dd-btn-action {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 13px 20px;
  font-size: 14px;
  font-weight: 800;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.dd-btn-action:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.dd-btn-action:active {
  transform: translateY(-1px) scale(0.98);
}

.dd-btn-action:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.dd-btn-accept {
  background: linear-gradient(135deg, #0ec97f 0%, #0aaa68 100%);
  color: #fff;
}

.dd-btn-accept:hover {
  box-shadow: 0 8px 22px rgba(14, 201, 127, 0.35);
}

.dd-btn-reject {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #fff;
}

.dd-btn-reject:hover {
  box-shadow: 0 8px 22px rgba(239, 68, 68, 0.35);
}

/* Contact shortcuts */
.dd-contact-shortcut {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 10px;
  margin-top: 10px;
  transition: all 0.2s ease;
}

.dd-contact-shortcut:hover {
  border-color: var(--border2);
  background: var(--surface3);
}

.dd-shortcut-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--t3);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition: all 0.15s ease;
}

.dd-shortcut-btn:hover {
  background: var(--teal-dim);
  color: var(--teal);
  border-color: var(--teal);
  transform: scale(1.1);
}

.dd-shortcut-btn:active {
  transform: scale(0.95);
}

/* Micro-tooltip for copied text */
.dd-copied-tag {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translate(-50%, -6px);
  background: var(--teal);
  color: #fff;
  font-size: 9.5px;
  font-weight: 700;
  padding: 3px 7px;
  border-radius: 4px;
  white-space: nowrap;
  animation: ddFadeIn 0.15s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  pointer-events: none;
}

.dd-copied-tag::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 4px solid transparent;
  border-top-color: var(--teal);
}

/* ── Timeline horizontal ── */
.dd-timeline {
  display: flex;
  align-items: flex-start;
  gap: 0;
  padding: 8px 0;
  overflow-x: auto;
  scrollbar-width: none;
  scrollbar-width: none;
}
.dd-timeline::-webkit-scrollbar { display:none }

.dd-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  min-width: 90px;
  position: relative;
}

/* connector line between steps — RTL-safe */
.dd-step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 18px;
  inset-inline-start: 50%;
  width: 100%;
  height: 3px;
  background: var(--dd-line-color, var(--border));
  z-index: 0;
  transition: background 0.4s ease;
}

.dd-step-circle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.dd-step-label {
  margin-top: 8px;
  font-size: 12px;
  font-weight: 800;
  text-align: center;
  white-space: nowrap;
  transition: color 0.3s;
}

.dd-step-sub {
  font-size: 10px;
  text-align: center;
  margin-top: 4px;
  line-height: 1.4;
  max-width: 105px;
  white-space: normal;
}

/* ── Zoom nav buttons ── */
.dd-zoom-nav {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(30,30,30,0.92);
  border: 2px solid rgba(255,255,255,0.5);
  color: #fff;
  font-size: 22px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100000;
  transition: background 0.18s, transform 0.18s;
  box-shadow: 0 4px 20px rgba(0,0,0,0.6);
}
.dd-zoom-nav:hover {
  background: rgba(14,201,127,0.85);
  border-color: #0ec97f;
  transform: translateY(-50%) scale(1.1);
}
.dd-zoom-nav:active { transform: translateY(-50%) scale(0.96); }
.dd-zoom-nav.prev { right: 24px; }
.dd-zoom-nav.next { left:  24px; }

/* ── Thumb nav on image card ── */
.dd-nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 38px; height: 38px;
  border-radius: 50%;
  background: rgba(0,0,0,0.62);
  border: 2px solid rgba(255,255,255,0.35);
  color: #fff;
  font-size: 17px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: background 0.15s, transform 0.15s;
  backdrop-filter: blur(6px);
  box-shadow: 0 2px 10px rgba(0,0,0,0.35);
}
.dd-nav-btn:hover { background: rgba(0,0,0,0.85); transform: translateY(-50%) scale(1.1); }
.dd-nav-btn.prev { right: 10px; }
.dd-nav-btn.next { left:  10px; }

/* ── Thumbnail ── */
.dd-thumb {
  width: 54px; height: 54px;
  border-radius: 10px;
  object-fit: cover;
  cursor: pointer;
  border: 2px solid var(--border);
  transition: border-color 0.15s, transform 0.15s;
  flex-shrink: 0;
}
.dd-thumb:hover { transform: scale(1.06); }
.dd-thumb.active { border-color: var(--teal); box-shadow: 0 0 0 3px var(--teal-dim); }

/* ── Zoom close btn ── */
.dd-zoom-close {
  position: absolute;
  top: 20px; right: 20px;
  width: 42px; height: 42px;
  border-radius: 50%;
  background: rgba(255,255,255,0.14);
  border: 1.5px solid rgba(255,255,255,0.25);
  color: #fff;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 11;
  transition: background 0.15s;
  backdrop-filter: blur(6px);
}
.dd-zoom-close:hover { background: rgba(255,255,255,0.28); }

.dd-spin { animation: ddSpin 0.7s linear infinite; }
`;

function InjectStyles() {
  return <style dangerouslySetInnerHTML={{ __html: STYLES }} />;
}

// ─── Horizontal Timeline ───────────────────────────────────────────────────────
function HorizontalTimeline({ status, createdAt }: { status: string; createdAt: string }) {
  const steps = [
    {
      id: 'submitted',
      label: 'تم التقديم',
      icon: 'ti-send',
      sub: formatDate(createdAt).split('،')[0], // date only
      active: true,
      color: '#0ec97f',
    },
    {
      id: 'review',
      label: 'قيد المراجعة',
      icon: 'ti-eye',
      sub: status === 'pending' ? 'جارٍ الفحص' : 'تمت المراجعة',
      active: true,
      color: '#0ec97f',
    },
    {
      id: 'decision',
      label: status === 'accepted' ? 'تم القبول' : status === 'rejected' ? 'تم الرفض' : 'في الانتظار',
      icon: status === 'accepted' ? 'ti-circle-check' : status === 'rejected' ? 'ti-circle-x' : 'ti-clock-pause',
      sub: status === 'accepted' ? 'بنجاح ✓' : status === 'rejected' ? 'مرفوض ✗' : 'لم يُحدَّد',
      active: status === 'accepted' || status === 'rejected',
      color: status === 'accepted' ? '#0ec97f' : status === 'rejected' ? '#ef4444' : 'var(--t4)',
    },
  ];

  return (
    <div className="dd-card">
      <div className="dd-card-header" style={{ marginBottom: 20 }}>
        <i className="ti ti-timeline" style={{ color: 'var(--teal)', fontSize: 16 }} />
        <span>مسار حالة التبرع</span>
      </div>

      <div className="dd-timeline">
        {steps.map((step, i) => {
          const isLast = i === steps.length - 1;
          // line between this and next step
          const nextActive = !isLast && steps[i + 1].active;
          const lineColor = step.active && nextActive ? '#0ec97f' : 'var(--border)';

          return (
            <div
              key={step.id}
              className="dd-step"
              style={{ '--dd-line-color': lineColor } as React.CSSProperties}
            >
              {/* Circle */}
              <div
                className="dd-step-circle"
                style={{
                  background: step.active ? (step.color + '18') : 'var(--surface2)',
                  border: '2px solid ' + (step.active ? step.color : 'var(--border)'),
                  color: step.active ? step.color : 'var(--t4)',
                  boxShadow: step.active && i === steps.findIndex(s => s.id === 'decision')
                    ? ('0 0 0 5px ' + step.color + '15')
                    : step.active ? ('0 0 0 4px ' + step.color + '10') : 'none',
                }}
              >
                <i className={`ti ${step.icon}`} />
              </div>

              {/* Label */}
              <div
                className="dd-step-label"
                style={{ color: step.active ? 'var(--t1)' : 'var(--t4)' }}
              >
                {step.label}
              </div>

              {/* Sub text */}
              <div className="dd-step-sub" style={{ color: step.active ? 'var(--t3)' : 'var(--t4)' }}>
                {step.sub}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Image Gallery ────────────────────────────────────────────────────────────
function ImageGallery({ images }: { images: string[] }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const prev = useCallback(() => setActive(i => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setActive(i => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    if (!zoomed) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); next(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); prev(); }
      if (e.key === 'Escape') setZoomed(false);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [zoomed, next, prev]);

  if (!images.length) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 250, gap: 10, color: 'var(--t4)', background: 'var(--surface2)', borderRadius: '12px' }}>
        <i className="ti ti-photo-off" style={{ fontSize: 48, opacity: 0.6 }} />
        <span style={{ fontSize: 13.5, fontWeight: 700 }}>لا توجد صور متوفرة للمعاينة</span>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Main image wrapper — relative container for buttons */}
        <div style={{ position: 'relative', borderRadius: '12px 12px 0 0', overflow: 'hidden', border: '1px solid var(--border)' }}>
          <div style={{ position: 'relative', cursor: 'zoom-in', background: 'var(--surface2)' }} onClick={() => setZoomed(true)}>
            <img
              src={images[active]}
              alt="صورة التبرع"
              key={images[active]}
              style={{ width: '100%', aspectRatio: '16/10', objectFit: 'cover', display: 'block', animation: 'ddFadeIn 0.22s ease' }}
            />

            {/* zoom hint */}
            <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(0,0,0,0.65)', color: '#fff', borderRadius: 8, padding: '5px 11px', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 5, backdropFilter: 'blur(8px)' }}>
              <i className="ti ti-zoom-in" /> تكبير المعاينة
            </div>

            {/* counter */}
            {images.length > 1 && (
              <div dir="ltr" style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(0,0,0,0.65)', color: '#fff', borderRadius: 8, padding: '5px 11px', fontSize: 11, fontWeight: 700, backdropFilter: 'blur(8px)' }}>
                {active + 1} / {images.length}
              </div>
            )}
          </div>

          {/* prev / next buttons */}
          {images.length > 1 && (
            <>
              <button className="dd-nav-btn prev" onClick={e => { e.stopPropagation(); prev(); }} aria-label="السابق">
                <i className="ti ti-chevron-right" />
              </button>
              <button className="dd-nav-btn next" onClick={e => { e.stopPropagation(); next(); }} aria-label="التالي">
                <i className="ti ti-chevron-left" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div style={{ display: 'flex', gap: 8, padding: '12px', flexWrap: 'wrap', background: 'var(--surface2)', borderRadius: '0 0 12px 12px', border: '1px solid var(--border)', borderTop: 'none' }}>
            {images.map((img, i) => (
              <img key={i} src={img} alt="" className={`dd-thumb${i === active ? ' active' : ''}`} onClick={() => setActive(i)} />
            ))}
          </div>
        )}
      </div>

      {/* ── Zoom Overlay ── */}
      {zoomed && (
        <div
          onClick={() => setZoomed(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', backdropFilter: 'blur(12px)' }}
        >
          {/* Close */}
          <button className="dd-zoom-close" onClick={() => setZoomed(false)} aria-label="إغلاق">
            <i className="ti ti-x" />
          </button>

          {/* Image + nav buttons in a row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, zIndex: 1 }} onClick={e => e.stopPropagation()}>
            {images.length > 1 && (
              <button className="dd-zoom-nav" onClick={e => { e.stopPropagation(); prev(); }} aria-label="السابق" style={{ position: 'static', transform: 'none', flexShrink: 0 }}>
                <i className="ti ti-chevron-right" />
              </button>
            )}
            <img
              key={images[active]}
              src={images[active]}
              alt="صورة مكبرة"
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: '75vw', maxHeight: '82vh', borderRadius: 16, objectFit: 'contain', cursor: 'default', animation: 'ddFadeIn 0.25s cubic-bezier(0.22, 1, 0.36, 1)', userSelect: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.8)' }}
            />
            {images.length > 1 && (
              <button className="dd-zoom-nav" onClick={e => { e.stopPropagation(); next(); }} aria-label="التالي" style={{ position: 'static', transform: 'none', flexShrink: 0 }}>
                <i className="ti ti-chevron-left" />
              </button>
            )}
          </div>

          {/* Dots */}
          {images.length > 1 && (
            <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 11 }}>
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={e => { e.stopPropagation(); setActive(i); }}
                  aria-label={`صورة ${i + 1}`}
                  style={{ width: i === active ? 30 : 8, height: 8, borderRadius: 4, border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.22s ease', background: i === active ? '#0ec97f' : 'rgba(255,255,255,0.35)' }}
                />
              ))}
            </div>
          )}

          {/* Image counter */}
          {images.length > 1 && (
            <div dir="ltr" style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', color: '#fff', padding: '5px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, border: '1px solid rgba(255,255,255,0.15)' }}>
              {active + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}

// ─── Info Row Helper Component ──────────────────────────────────────────────────
function InfoBox({ icon, label, value, color = 'var(--teal)' }: { icon: string; label: string; value?: string | number | null; color?: string }) {
  if (value == null || value === '') return null;
  return (
    <div className="dd-spec-box">
      <div className="dd-spec-icon-wrap" style={{ background: color + '12', border: `1.5px solid ${color}25` }}>
        <i className={`ti ${icon}`} style={{ color: color, fontSize: 15 }} />
      </div>
      <div>
        <span className="dd-spec-label">{label}</span>
        <span className="dd-spec-value">{value}</span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DonationDetail({ donation, onBack, onAction, actionLoading }: DonationDetailProps) {
  const [copiedText, setCopiedText] = useState<string | null>(null);

  useEffect(() => {
    if (donation) {
      console.log('--- DIAGNOSTIC INFO ---');
      console.log('Donation ID:', donation._id);
      console.log('donorId type:', typeof donation.donorId);
      console.log('donorId value:', donation.donorId);
      console.log('Parsed donor object:', parseDonor(donation.donorId));
      console.log('-----------------------');
    }
  }, [donation]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  if (!donation) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, gap: 14, color: 'var(--t4)', fontFamily: "'Tajawal', sans-serif" }}>
        <i className="ti ti-package-off" style={{ fontSize: 52, opacity: 0.6 }} />
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>لم يتم العثور على أي تفاصيل أو بيانات لهذا التبرع</p>
      </div>
    );
  }

  const sc     = STATUS_MAP[donation.status] ?? STATUS_MAP.pending;
  const images = getImages(donation);
  const donor  = parseDonor(donation.donorId);
  const isAccLoading = actionLoading === `${donation._id}-accepted`;
  const isRejLoading = actionLoading === `${donation._id}-rejected`;
  const busy = isAccLoading || isRejLoading;

  return (
    <div className="dd-container">
      <InjectStyles />

      {/* ══ Timeline Tracker ══ */}
      <HorizontalTimeline status={donation.status} createdAt={donation.createdAt} />

      {/* ══ Main Grid Layout (Asymmetrical SaaS grid) ══ */}
      <div className="dd-layout-grid">
        
        {/* RIGHT COLUMN (Desktop side) — Gallery, Description & Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Gallery card */}
          <div className="dd-card" style={{ padding: 16 }}>
            <ImageGallery images={images} />
          </div>

          {/* Donation Specifications card */}
          <div className="dd-card">
            <div className="dd-card-header">
              <i className="ti ti-info-circle" style={{ color: 'var(--teal)', fontSize: 16 }} />
              <span>مواصفات وتفاصيل التبرع</span>
            </div>

            <div className="dd-spec-grid">
              <InfoBox icon="ti-fingerprint"   label="المعرف البرمجي"   value={donation._id} color="#6366f1" />
              <InfoBox icon="ti-tag"           label="نوع القطعة"      value={donation.type} />
              <InfoBox icon="ti-package"       label="الكمية الإجمالية" value={donation.quantity != null ? `${donation.quantity} قطع` : null} color="#10b981" />
              <InfoBox icon="ti-ruler"         label="المقاس المتوفر"   value={donation.size || null} color="#ec4899" />
              <InfoBox icon="ti-star"          label="حالة التوريد"     value={donation.condition || null} color="#f59e0b" />
              <InfoBox icon="ti-calendar-plus" label="تاريخ تسجيل الطلب" value={formatDate(donation.createdAt)} color="#14b8a6" />
            </div>

            {/* Description area */}
            {donation.description && (
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--t3)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <i className="ti ti-file-description" style={{ color: 'var(--teal)' }} /> الوصف التوضيحي
                </div>
                <div style={{ fontSize: 13.5, color: 'var(--t2)', lineHeight: 1.8, padding: '14px 18px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12 }}>
                  {donation.description}
                </div>
              </div>
            )}
          </div>

          {/* Rejection notice card (if rejected) */}
          {donation.status === 'rejected' && donation.rejectionReason && (
            <div className="dd-card" style={{ background: 'rgba(239,68,68,0.02)', border: '1.5px solid rgba(239,68,68,0.22)' }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#ef4444', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="ti ti-alert-triangle" style={{ fontSize: 16 }} /> سبب رفض الطلب
              </div>
              <div style={{ fontSize: 13.5, color: 'var(--t2)', lineHeight: 1.8, padding: '12px 16px', background: 'rgba(239,68,68,0.06)', borderRadius: 10, border: '1px dashed rgba(239,68,68,0.15)' }}>
                {donation.rejectionReason}
              </div>
            </div>
          )}
        </div>

        {/* LEFT COLUMN (Desktop sidebar) — Donor Info and Action Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Donor Information card */}
          <div className="dd-card">
            <div className="dd-card-header">
              <i className="ti ti-user" style={{ color: '#3b82f6', fontSize: 16 }} />
              <span>معلومات حساب المتبرع</span>
            </div>

            {donor ? (
              <>
                {/* Visual Premium Profile banner */}
                <div style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '14px 16px', background: 'var(--surface2)', borderRadius: 14, border: '1px solid var(--border)', marginBottom: 18 }}>
                  <div className="ap-table-avatar" style={{ width: 50, height: 50, fontSize: 20, borderRadius: 12, flexShrink: 0, background: 'rgba(59,130,246,0.12)', color: '#3b82f6', border: '2px solid rgba(59,130,246,0.2)' }}>
                    {(donor.userName || donor.email || donor._id || 'ع').trim()[0]?.toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 10, color: 'var(--t4)', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <i className="ti ti-shield-check" style={{ color: '#0ec97f', fontSize: 12 }} /> متبرع مسجل
                    </div>
                    <div style={{ fontWeight: 900, color: 'var(--t1)', fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {donor.userName || 'متبرع عطاء'}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--t3)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <i className="ti ti-map-pin" style={{ color: '#3b82f6', fontSize: 13 }} />{donor.address || 'العنوان غير متوفر'}
                    </div>
                  </div>
                </div>

                {/* Info parameters */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

                  {/* Username */}
                  <div className="dd-contact-shortcut">
                    <div>
                      <span style={{ fontSize: 10.5, color: 'var(--t4)', display: 'block' }}>اسم المستخدم</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>{donor.userName || '—'}</span>
                    </div>
                    {donor.userName && (
                      <button className="dd-shortcut-btn" onClick={() => handleCopy(donor.userName || '', 'userName')} title="نسخ اسم المستخدم">
                        <i className="ti ti-copy" />
                        {copiedText === 'userName' && <span className="dd-copied-tag">تم النسخ!</span>}
                      </button>
                    )}
                  </div>

                  {/* Monospace Donor ID */}
                  <div className="dd-contact-shortcut">
                    <div>
                      <span style={{ fontSize: 10.5, color: 'var(--t4)', display: 'block' }}>معرف المتبرع (ID)</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)', fontFamily: "'IBM Plex Mono', monospace" }}>{donor._id}</span>
                    </div>
                    <button className="dd-shortcut-btn" onClick={() => handleCopy(donor._id, 'donorId')} title="نسخ المعرف">
                      <i className="ti ti-copy" />
                      {copiedText === 'donorId' && <span className="dd-copied-tag">تم النسخ!</span>}
                    </button>
                  </div>

                  {/* Phone */}
                  <div className="dd-contact-shortcut">
                    <div>
                      <span style={{ fontSize: 10.5, color: 'var(--t4)', display: 'block' }}>رقم الهاتف</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', fontFamily: donor.phone ? "'IBM Plex Mono', monospace" : undefined }}>{donor.phone || 'غير متوفر'}</span>
                    </div>
                    {donor.phone && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <a href={`tel:${donor.phone}`} className="dd-shortcut-btn" title="اتصال مباشر" style={{ textDecoration: 'none' }}>
                          <i className="ti ti-phone-call" />
                        </a>
                        <button className="dd-shortcut-btn" onClick={() => handleCopy(donor.phone || '', 'phone')} title="نسخ الرقم">
                          <i className="ti ti-copy" />
                          {copiedText === 'phone' && <span className="dd-copied-tag">تم النسخ!</span>}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="dd-contact-shortcut">
                    <div>
                      <span style={{ fontSize: 10.5, color: 'var(--t4)', display: 'block' }}>البريد الإلكتروني</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)', wordBreak: 'break-all' }}>{donor.email || 'غير متوفر'}</span>
                    </div>
                    {donor.email && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <a
                          href={`https://mail.google.com/mail/?view=cm&fs=1&to=${donor.email}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="dd-shortcut-btn"
                          title="إرسال بريد"
                          style={{ textDecoration: 'none' }}
                        >
                          <i className="ti ti-mail-fast" />
                        </a>
                        <button className="dd-shortcut-btn" onClick={() => handleCopy(donor.email || '', 'email')} title="نسخ البريد">
                          <i className="ti ti-copy" />
                          {copiedText === 'email' && <span className="dd-copied-tag">تم النسخ!</span>}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  <div className="dd-contact-shortcut">
                    <div>
                      <span style={{ fontSize: 10.5, color: 'var(--t4)', display: 'block' }}>العنوان بالكامل</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--t1)' }}>{donor.address || 'غير متوفر'}</span>
                    </div>
                    {donor.address && (
                      <button className="dd-shortcut-btn" onClick={() => handleCopy(donor.address || '', 'address')} title="نسخ العنوان">
                        <i className="ti ti-copy" />
                        {copiedText === 'address' && <span className="dd-copied-tag">تم النسخ!</span>}
                      </button>
                    )}
                  </div>

                  {/* Registration Date */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--surface2)', borderRadius: 10, border: '1px solid var(--border)', fontSize: 11.5 }}>
                    <span style={{ color: 'var(--t4)' }}>تاريخ الانضمام (التسجيل)</span>
                    <span style={{ color: 'var(--t2)', fontWeight: 700 }}>{donor.createdAt ? formatDate(donor.createdAt) : 'غير متوفر'}</span>
                  </div>

                  {/* Last Account Update */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--surface2)', borderRadius: 10, border: '1px solid var(--border)', fontSize: 11.5 }}>
                    <span style={{ color: 'var(--t4)' }}>آخر تحديث للحساب</span>
                    <span style={{ color: 'var(--t2)', fontWeight: 700 }}>
                      {donor.updatedAt && donor.updatedAt !== donor.createdAt ? formatDate(donor.updatedAt) : 'لا يوجد تحديث'}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '36px 0', color: 'var(--t4)' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, border: '1px solid var(--border)' }}>
                  <i className="ti ti-user-off" />
                </div>
                <span style={{ fontSize: 13.5, fontWeight: 700 }}>بيانات المتبرع غير متوفرة</span>
                <span style={{ fontSize: 11, textAlign: 'center', lineHeight: 1.6, maxWidth: 200 }}>قد يكون حساب المتبرع محذوفاً أو غير مرتبط بشكل صحيح.</span>
              </div>
            )}
          </div>

          {/* Action / Decision Panel Card */}
          {donation.status === 'pending' && onAction ? (
            <div className="dd-card" style={{ border: '1.5px solid var(--teal-dim)' }}>
              <div className="dd-card-header">
                <i className="ti ti-clipboard-list" style={{ color: 'var(--teal)', fontSize: 16 }} />
                <span>اتخاذ قرار بشأن التبرع</span>
              </div>
              <p style={{ fontSize: 12.5, color: 'var(--t3)', lineHeight: 1.75, margin: '0 0 16px' }}>
                يرجى معاينة الصور وتفاصيل القطعة جيداً قبل اتخاذ الإجراء. عند قبول التبرع أو رفضه، يتم إرسال إشعار تلقائي إلى المتبرع فوراً.
              </p>
              
              <div className="dd-action-row">
                <button
                  className="dd-btn-action dd-btn-accept"
                  disabled={busy}
                  onClick={() => onAction(donation._id, 'accepted')}
                >
                  {isAccLoading
                    ? <><i className="ti ti-loader-2 dd-spin" /> جاري القبول...</>
                    : <><i className="ti ti-circle-check" /> قبول التبرع</>
                  }
                </button>
                <button
                  className="dd-btn-action dd-btn-reject"
                  disabled={busy}
                  onClick={() => onAction(donation._id, 'rejected')}
                >
                  {isRejLoading
                    ? <><i className="ti ti-loader-2 dd-spin" /> جاري الرفض...</>
                    : <><i className="ti ti-circle-x" /> رفض التبرع</>
                  }
                </button>
              </div>
            </div>
          ) : (
            <div className="dd-card">
              <div className="dd-card-header">
                <i className="ti ti-clipboard-check" style={{ color: sc.color, fontSize: 16 }} />
                <span>حالة الطلب الحالية</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: sc.bg, border: '1.5px dashed ' + sc.color + '40', borderRadius: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: sc.color + '20', color: sc.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, boxShadow: '0 0 0 4px ' + sc.glow }}>
                  <i className={`ti ${sc.icon}`} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--t1)' }}>{sc.label}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--t4)', marginTop: 3 }}>تم تسجيل هذا القرار بنجاح — الطلب مغلق ولا يمكن التعديل عليه.</div>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}