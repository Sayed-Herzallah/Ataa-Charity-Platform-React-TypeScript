import { useState, useCallback, useEffect } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface DonorInfo {
  _id: string;
  userName?: string;
  name?: string;
  phone?: string;
  address?: string;
  email?: string;
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
  pending:  { label: 'قيد المراجعة', icon: 'ti-clock-hour-4',  bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b', dot: '#f59e0b', glow: 'rgba(245,158,11,0.25)' },
  accepted: { label: 'مقبول',        icon: 'ti-circle-check',  bg: 'rgba(14,201,127,0.12)',  color: '#0ec97f', dot: '#0ec97f', glow: 'rgba(14,201,127,0.25)' },
  rejected: { label: 'مرفوض',        icon: 'ti-circle-x',      bg: 'rgba(239,68,68,0.12)',   color: '#ef4444', dot: '#ef4444', glow: 'rgba(239,68,68,0.25)'  },
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

function getImages(donation: Donation): string[] {
  const raw = donation.imageUrl;
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(i => i.secure_url).filter(Boolean);
  if (typeof raw === 'object' && 'secure_url' in raw && raw.secure_url) return [raw.secure_url];
  return [];
}

function parseDonor(donorId: DonorInfo | string | null | undefined) {
  if (!donorId) return null;
  if (typeof donorId === 'string') return { _id: donorId, name: `#${donorId.slice(-4)}`, phone: null, address: null, email: null };
  return {
    _id: donorId._id,
    name: donorId.userName || donorId.name || null,
    phone: donorId.phone || null,
    address: donorId.address || null,
    email: donorId.email || null,
  };
}

// ─── Injected CSS ─────────────────────────────────────────────────────────────
const STYLES = `
@keyframes ddFadeIn   { from { opacity:0; transform:scale(0.96) } to { opacity:1; transform:scale(1) } }
@keyframes ddSlideUp  { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
@keyframes ddSpin     { to { transform:rotate(360deg) } }

/* ── Timeline horizontal ── */
.dd-timeline {
  display: flex;
  align-items: flex-start;
  gap: 0;
  padding: 4px 0;
  overflow-x: auto;
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
  height: 2px;
  background: var(--dd-line-color, var(--border));
  z-index: 0;
  transition: background 0.4s ease;
}

.dd-step-circle {
  width: 36px;
  height: 36px;
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
  font-size: 11px;
  font-weight: 700;
  text-align: center;
  white-space: nowrap;
  transition: color 0.3s;
}

.dd-step-sub {
  font-size: 10px;
  text-align: center;
  margin-top: 3px;
  line-height: 1.4;
  max-width: 100px;
  white-space: normal;
}

/* ── Zoom nav buttons ── */
.dd-zoom-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(255,255,255,0.18);
  border: 2px solid rgba(255,255,255,0.35);
  color: #fff;
  font-size: 22px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: background 0.18s, transform 0.18s, border-color 0.18s;
  backdrop-filter: blur(8px);
}
.dd-zoom-nav:hover {
  background: rgba(255,255,255,0.32);
  border-color: rgba(255,255,255,0.6);
  transform: translateY(-50%) scale(1.1);
}
.dd-zoom-nav:active { transform: translateY(-50%) scale(0.96); }
.dd-zoom-nav.prev { right: 20px; }
.dd-zoom-nav.next { left:  20px; }

/* ── Thumb nav on image card ── */
.dd-nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 32px; height: 32px;
  border-radius: 9px;
  background: rgba(0,0,0,0.52);
  border: 1.5px solid rgba(255,255,255,0.15);
  color: #fff;
  font-size: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3;
  transition: background 0.15s, transform 0.15s;
  backdrop-filter: blur(4px);
}
.dd-nav-btn:hover { background: rgba(0,0,0,0.75); transform: translateY(-50%) scale(1.08); }
.dd-nav-btn.prev { right: 8px; }
.dd-nav-btn.next { left:  8px; }

/* ── Info row ── */
.dd-info-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 0;
  border-bottom: 1px solid var(--border);
  transition: background 0.12s;
}
.dd-info-row:last-of-type { border-bottom: none; }

/* ── Card section title ── */
.dd-section-title {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 11px;
  font-weight: 800;
  color: var(--t3);
  text-transform: uppercase;
  letter-spacing: 0.7px;
  padding-bottom: 12px;
  margin-bottom: 4px;
  border-bottom: 1px solid var(--border);
}

/* ── Stat chip ── */
.dd-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11.5px;
  font-weight: 700;
}

/* ── Spin animation ── */
.dd-spin { animation: ddSpin 0.7s linear infinite; }

/* ── Thumbnail ── */
.dd-thumb {
  width: 52px; height: 52px;
  border-radius: 8px;
  object-fit: cover;
  cursor: pointer;
  border: 2px solid var(--border);
  transition: border-color 0.15s, transform 0.15s;
  flex-shrink: 0;
}
.dd-thumb:hover { transform: scale(1.06); }
.dd-thumb.active { border-color: var(--teal); }

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
`;

function InjectStyles() {
  return <style>{STYLES}</style>;
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
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '18px 24px' }}>
      <div className="dd-section-title" style={{ marginBottom: 20 }}>
        <i className="ti ti-timeline" style={{ color: 'var(--teal)', fontSize: 14 }} />
        مسار التبرع
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
                  background: step.active ? `${step.color}1a` : 'var(--surface2)',
                  border: `2px solid ${step.active ? step.color : 'var(--border)'}`,
                  color: step.active ? step.color : 'var(--t4)',
                  boxShadow: step.active && i === steps.findIndex(s => s.id === 'decision')
                    ? `0 0 0 5px ${step.color}15`
                    : step.active ? `0 0 0 4px ${step.color}10` : 'none',
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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 220, gap: 10, color: 'var(--t4)' }}>
        <i className="ti ti-photo-off" style={{ fontSize: 40 }} />
        <span style={{ fontSize: 13 }}>لا توجد صور</span>
      </div>
    );
  }

  return (
    <>
      {/* Card */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div className="dd-section-title" style={{ padding: '14px 16px 12px', marginBottom: 0, borderBottom: '1px solid var(--border)' }}>
          <i className="ti ti-photo" style={{ color: 'var(--teal)', fontSize: 14 }} />
          الصور {images.length > 1 && <span style={{ color: 'var(--teal)', fontWeight: 900 }}>({images.length})</span>}
        </div>

        {/* Main image */}
        <div style={{ position: 'relative', cursor: 'zoom-in', background: 'var(--surface2)', overflow: 'hidden' }} onClick={() => setZoomed(true)}>
          <img
            src={images[active]}
            alt="صورة التبرع"
            key={images[active]}
            style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block', animation: 'ddFadeIn 0.2s ease' }}
          />

          {/* zoom hint */}
          <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, backdropFilter: 'blur(6px)' }}>
            <i className="ti ti-zoom-in" /> تكبير
          </div>

          {/* counter */}
          {images.length > 1 && (
            <div dir="ltr" style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700, backdropFilter: 'blur(6px)' }}>
              {active + 1} / {images.length}
            </div>
          )}

          {/* prev / next on card */}
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
          <div style={{ display: 'flex', gap: 7, padding: '10px 12px', flexWrap: 'wrap', background: 'var(--surface2)', borderTop: '1px solid var(--border)' }}>
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
          style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.93)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}
        >
          {/* Close */}
          <button className="dd-zoom-close" onClick={() => setZoomed(false)} aria-label="إغلاق">
            <i className="ti ti-x" />
          </button>

          {/* Image */}
          <img
            key={images[active]}
            src={images[active]}
            alt="صورة مكبرة"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '82vw', maxHeight: '82vh', borderRadius: 14, objectFit: 'contain', cursor: 'default', animation: 'ddFadeIn 0.22s ease', userSelect: 'none' }}
          />

          {/* Nav arrows — كبيرة وواضحة */}
          {images.length > 1 && (
            <>
              <button
                className="dd-zoom-nav prev"
                onClick={e => { e.stopPropagation(); prev(); }}
                aria-label="السابق"
              >
                <i className="ti ti-chevron-right" />
              </button>
              <button
                className="dd-zoom-nav next"
                onClick={e => { e.stopPropagation(); next(); }}
                aria-label="التالي"
              >
                <i className="ti ti-chevron-left" />
              </button>

              {/* Dots */}
              <div style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 11 }}>
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={e => { e.stopPropagation(); setActive(i); }}
                    aria-label={`صورة ${i + 1}`}
                    style={{ width: i === active ? 28 : 8, height: 8, borderRadius: 4, border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.22s ease', background: i === active ? '#fff' : 'rgba(255,255,255,0.38)' }}
                  />
                ))}
              </div>

              {/* Image counter */}
              <div dir="ltr" style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', color: '#fff', padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, border: '1px solid rgba(255,255,255,0.2)' }}>
                {active + 1} / {images.length}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

// ─── Info Row ─────────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value, mono = false, badge, accent }: {
  icon: string; label: string; value?: string | number | null;
  mono?: boolean; badge?: React.ReactNode; accent?: string;
}) {
  if (value == null && !badge) return null;
  return (
    <div className="dd-info-row">
      <div style={{ width: 30, height: 30, borderRadius: 8, background: accent ? `${accent}18` : 'var(--teal-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <i className={`ti ${icon}`} style={{ color: accent || 'var(--teal)', fontSize: 13 }} />
      </div>
      <span style={{ fontSize: 12, color: 'var(--t3)', minWidth: 88, flexShrink: 0 }}>{label}</span>
      {badge || (
        <span style={{ fontSize: mono ? 10.5 : 13, color: 'var(--t1)', fontWeight: 600, wordBreak: 'break-all', fontFamily: mono ? "'IBM Plex Mono', monospace" : undefined, marginRight: 'auto' } as React.CSSProperties}>
          {value}
        </span>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DonationDetail({ donation, onBack, onAction, actionLoading }: DonationDetailProps) {
  if (!donation) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, gap: 12, color: 'var(--t4)' }}>
        <i className="ti ti-package-off" style={{ fontSize: 44 }} />
        <p style={{ margin: 0, fontSize: 14 }}>لم يتم العثور على بيانات التبرع</p>
      </div>
    );
  }

  const sc     = STATUS_MAP[donation.status] ?? STATUS_MAP.pending;
  const images = getImages(donation);
  const donor  = parseDonor(donation.donorId);
  const isAccLoading = actionLoading === `${donation._id}-accepted`;
  const isRejLoading = actionLoading === `${donation._id}-rejected`;
  const busy = isAccLoading || isRejLoading;

  const card: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    overflow: 'hidden',
  };

  const cardPadded: React.CSSProperties = {
    ...card,
    padding: '18px 20px',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontFamily: "'Tajawal', sans-serif" }}>
      <InjectStyles />

      {/* ══ Top Banner ══ */}
      <div style={{ ...cardPadded, display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 12, flexWrap: 'wrap', borderRadius: 'var(--radius-lg)', padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <button className="ap-icon-btn" onClick={onBack} title="رجوع" style={{ width: 38, height: 38, flexShrink: 0 }}>
            <i className="ti ti-arrow-right" />
          </button>
          <div>
            <div style={{ fontSize: 10.5, color: 'var(--t4)', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span className="ap-breadcrumb-link" style={{ color: 'var(--teal)', cursor: 'pointer' }} onClick={onBack}>التبرعات</span>
              <i className="ti ti-chevron-left" style={{ fontSize: 9 }} />
              <span>تفاصيل التبرع</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--t1)' }}>{donation.type}</span>
              {/* Status pill */}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: sc.bg, color: sc.color, border: `1px solid ${sc.color}40` }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc.dot, display: 'inline-block' }} />
                {sc.label}
              </span>
              <span style={{ fontSize: 11, color: 'var(--t4)', fontFamily: "'IBM Plex Mono', monospace", padding: '3px 9px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 7 }}>
                {formatDate(donation.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ══ Timeline ══ */}
      <HorizontalTimeline status={donation.status} createdAt={donation.createdAt} />

      {/* ══ Main Grid ══ */}
      <div className="cd-detail-main-grid">

        {/* COL 1 — Gallery */}
        <div className="cd-detail-img-card" style={{ ...card }}>
          <ImageGallery images={images} />
        </div>

        {/* COL 2 — Donation Info */}
        <div style={{ ...cardPadded }}>
          <div className="dd-section-title">
            <i className="ti ti-info-circle" style={{ color: 'var(--teal)', fontSize: 14 }} />
            تفاصيل التبرع
          </div>

          <InfoRow icon="ti-fingerprint"   label="المعرف"          value={donation._id}                                    mono />
          <InfoRow icon="ti-tag"           label="النوع"           value={donation.type} />
          <InfoRow icon="ti-package"       label="الكمية"          value={donation.quantity != null ? `${donation.quantity} قطعة` : null} />
          <InfoRow icon="ti-ruler"         label="المقاس"          value={donation.size || null} />
          <InfoRow icon="ti-star"          label="حالة القطعة"     value={donation.condition || null} />
          <InfoRow
            icon="ti-circle-dot"
            label="القرار"
            badge={
              <span className="dd-chip" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.color}33` }}>
                <i className={`ti ${sc.icon}`} style={{ fontSize: 13 }} />
                {sc.label}
              </span>
            }
          />
          <InfoRow icon="ti-calendar-plus" label="تاريخ التقديم"  value={formatDate(donation.createdAt)} />
          {donation.updatedAt && donation.updatedAt !== donation.createdAt && (
            <InfoRow icon="ti-refresh"     label="آخر تحديث"       value={formatDate(donation.updatedAt)} />
          )}

          {/* سبب الرفض */}
          {donation.rejectionReason && (
            <div style={{ marginTop: 14, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 11.5, fontWeight: 800, color: '#ef4444', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                <i className="ti ti-alert-circle" /> سبب الرفض
              </div>
              <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.7 }}>{donation.rejectionReason}</div>
            </div>
          )}

          {/* الوصف */}
          {donation.description && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--t3)', marginBottom: 7, display: 'flex', alignItems: 'center', gap: 5 }}>
                <i className="ti ti-file-description" /> الوصف
              </div>
              <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.8, padding: '10px 14px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 9 }}>
                {donation.description}
              </div>
            </div>
          )}
        </div>

        {/* COL 3 — Donor Info */}
        <div style={{ ...cardPadded }}>
          <div className="dd-section-title">
            <i className="ti ti-user" style={{ color: '#3b82f6', fontSize: 14 }} />
            بيانات المتبرع
          </div>

          {donor ? (
            <>
              {/* Avatar hero */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, padding: '12px 14px', background: 'var(--surface2)', borderRadius: 12, border: '1px solid var(--border)' }}>
                <div className="ap-table-avatar" style={{ width: 46, height: 46, fontSize: 19, borderRadius: 12, flexShrink: 0, background: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: '1.5px solid rgba(59,130,246,0.25)' }}>
                  {donor.name ? donor.name.trim()[0]?.toUpperCase() : 'م'}
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: 'var(--t1)', fontSize: 15 }}>{donor.name || 'مستخدم غير معروف'}</div>
                  {donor.address && (
                    <div style={{ fontSize: 11.5, color: 'var(--t4)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <i className="ti ti-map-pin" style={{ color: '#3b82f6', fontSize: 12 }} />{donor.address}
                    </div>
                  )}
                </div>
              </div>

              <InfoRow icon="ti-phone"       label="الهاتف"        value={donor.phone}   accent="#3b82f6" />
              <InfoRow icon="ti-map-pin"     label="العنوان"       value={donor.address} accent="#3b82f6" />
              <InfoRow icon="ti-mail"        label="البريد"        value={donor.email}   accent="#3b82f6" />
              <InfoRow icon="ti-fingerprint" label="معرف المتبرع" value={donor._id}      accent="#3b82f6" mono />
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '32px 0', color: 'var(--t4)' }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                <i className="ti ti-user-off" />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700 }}>بيانات المتبرع غير متاحة</span>
              <span style={{ fontSize: 11, textAlign: 'center', lineHeight: 1.6 }}>الحساب محذوف أو غير مرتبط بهذا التبرع</span>
            </div>
          )}
        </div>
      </div>

      {/* ══ Action / Status Card ══ */}
      {donation.status === 'pending' && onAction ? (
        <div style={{ ...card, padding: '20px 22px' }}>
          <div className="dd-section-title">
            <i className="ti ti-clipboard-list" style={{ color: 'var(--teal)', fontSize: 14 }} />
            اتخاذ إجراء
          </div>
          <p style={{ fontSize: 13, color: 'var(--t3)', lineHeight: 1.75, margin: '0 0 18px' }}>
            بعد مراجعة التبرع يمكنك قبوله أو رفضه. سيتم إشعار المتبرع تلقائياً بقرارك.
          </p>
          <div className="cd-action-row">
            <button
              className="cd-btn-accept-lg"
              disabled={busy}
              onClick={() => onAction(donation._id, 'accepted')}
            >
              {isAccLoading
                ? <><i className="ti ti-loader-2 dd-spin" /> جارٍ القبول...</>
                : <><i className="ti ti-circle-check" /> قبول التبرع</>
              }
            </button>
            <button
              className="cd-btn-reject-lg"
              disabled={busy}
              onClick={() => onAction(donation._id, 'rejected')}
            >
              {isRejLoading
                ? <><i className="ti ti-loader-2 dd-spin" /> جارٍ الرفض...</>
                : <><i className="ti ti-circle-x" /> رفض التبرع</>
              }
            </button>
          </div>
        </div>
      ) : donation.status !== 'pending' ? (
        <div style={{ ...card, padding: '16px 20px' }}>
          <div className="dd-section-title">
            <i className="ti ti-clipboard-check" style={{ color: sc.color, fontSize: 14 }} />
            حالة الطلب
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: sc.bg, border: `1px solid ${sc.color}33`, borderRadius: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `${sc.color}20`, color: sc.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, flexShrink: 0, boxShadow: `0 0 0 4px ${sc.glow}` }}>
              <i className={`ti ${sc.icon}`} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--t1)' }}>{sc.label}</div>
              <div style={{ fontSize: 11.5, color: 'var(--t4)', marginTop: 2 }}>تم اتخاذ القرار — لا يمكن التعديل</div>
            </div>
          </div>
        </div>
      ) : null}

    </div>
  );
}