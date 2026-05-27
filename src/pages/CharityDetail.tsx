import { useEffect, useState } from 'react';
import { Link, useParams } from 'wouter';
import { charityApi, Charity } from '../services';
import { useAuth } from '../contexts/AuthContext';
import DonationModal from '../components/shared/DonationModal';

/* ─── Same style system as Charities.tsx ─── */
const CATEGORY_ICONS: Record<string, { icon: string; color: string; bg: string }> = {
  'تعليم': { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3L1 9l11 6 11-6-11-6z"/><path d="M1 9v6"/><path d="M7 12.5v5c0 1.657 2.239 3 5 3s5-1.343 5-3v-5"/></svg>`, color: '#2563eb', bg: '#eff6ff' },
  'صحة':   { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`, color: '#dc2626', bg: '#fef2f2' },
  'أيتام': { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`, color: '#7c3aed', bg: '#f5f3ff' },
  'إغاثة': { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`, color: '#ea580c', bg: '#fff7ed' },
  'بيئة':  { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 22c1.25-1.25 2.5-2.5 3.75-3.75C7 17 8.5 16 10.25 15.5c0 0-2.5-5 2.25-9.5 0 0 2 6.5 7 6.5 0 0-1 4-5 5.5 0 0 2 2 3.5 3.5"/><path d="M12 22c0-4.4-3.6-8-8-8"/></svg>`, color: '#16a34a', bg: '#f0fdf4' },
  'default': { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`, color: '#267880', bg: '#f0fafb' },
};

const FALLBACK_COLORS = [
  { color: '#267880', accent: '#0f4c58' },
  { color: '#7c3aed', accent: '#5b21b6' },
  { color: '#dc2626', accent: '#991b1b' },
  { color: '#16a34a', accent: '#14532d' },
  { color: '#2563eb', accent: '#1d4ed8' },
  { color: '#ea580c', accent: '#9a3412' },
];

function getCharityStyle(name: string) {
  for (const [key, val] of Object.entries(CATEGORY_ICONS)) {
    if (key !== 'default' && name?.includes(key)) return val;
  }
  return CATEGORY_ICONS.default;
}

function getCharityColors(name: string) {
  const style = getCharityStyle(name);
  // find matching fallback or use index 0
  const fb = FALLBACK_COLORS.find(f => f.color === style.color) || FALLBACK_COLORS[0];
  return { ...style, accent: fb.accent };
}

const PATTERNS = [
  `<pattern id="dp0" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1.5" fill="white" opacity="0.15"/><circle cx="0" cy="0" r="1.5" fill="white" opacity="0.15"/><circle cx="40" cy="0" r="1.5" fill="white" opacity="0.15"/><circle cx="0" cy="40" r="1.5" fill="white" opacity="0.15"/><circle cx="40" cy="40" r="1.5" fill="white" opacity="0.15"/></pattern>`,
  `<pattern id="dp1" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M0 15 L15 0 L30 15 L15 30 Z" fill="none" stroke="white" stroke-width="0.5" opacity="0.12"/></pattern>`,
  `<pattern id="dp2" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><line x1="0" y1="0" x2="20" y2="20" stroke="white" stroke-width="0.4" opacity="0.1"/><line x1="20" y1="0" x2="0" y2="20" stroke="white" stroke-width="0.4" opacity="0.1"/></pattern>`,
];

/* ─── Contact row ─── */
function ContactRow({ icon, label, value, ltr = false }: { icon: React.ReactNode; label: string; value: string; ltr?: boolean }) {
  return (
    <div className="cd-contact-row">
      <div className="cd-contact-icon">{icon}</div>
      <div>
        <div className="cd-contact-label">{label}</div>
        <div className="cd-contact-val" style={{ direction: ltr ? 'ltr' : 'rtl', textAlign: 'right' }}>{value}</div>
      </div>
    </div>
  );
}

export default function CharityDetail() {
  const { id } = useParams<{ id: string }>();
  const [charity, setCharity]       = useState<Charity | null>(null);
  const [loading, setLoading]       = useState(true);
  const [showDonate, setShowDonate] = useState(false);
  const [donated, setDonated]       = useState(false);
  const { isLoggedIn, user } = useAuth();

  useEffect(() => {
    if (!id) return;
    charityApi.getById(id)
      .then(d => setCharity(d.charity))
      .catch(() => setCharity(null))
      .finally(() => setLoading(false));
  }, [id]);

  /* ── Loading ── */
  if (loading) return (
    <div className="cd-page">
      <div className="cd-loading">
        <div className="cd-spinner" />
      </div>
    </div>
  );

  /* ── Not found ── */
  if (!charity) return (
    <div className="cd-page">
      <div className="cd-notfound">
        <div className="cd-notfound__icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <p className="cd-notfound__title">لم يتم العثور على الجمعية</p>
        <Link href="/charities" className="cd-back-btn">العودة للجمعيات</Link>
      </div>
    </div>
  );

  const canDonate = isLoggedIn && user?.roleType === 'user';
  const status    = (charity as any).approvalStatus;
  const style     = getCharityColors(charity.charityName);
  const nameInitials = charity.charityName?.slice(0, 2) || 'جم';
  const year      = charity.createdAt ? new Date(charity.createdAt).getFullYear() : null;
  const patternIdx = (charity.charityName?.length || 0) % PATTERNS.length;

  return (
    <div className="cd-page">

      {/* ══ Hero ══ */}
      <div className="cd-hero" style={{ background: `linear-gradient(135deg, ${style.accent} 0%, ${style.color} 100%)` }}>
        {/* pattern overlay */}
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="cd-hero__pattern">
          <defs dangerouslySetInnerHTML={{ __html: PATTERNS[patternIdx] }} />
          <rect width="100%" height="100%" fill={`url(#dp${patternIdx})`} />
        </svg>

        <div className="cd-hero__inner">
          {/* Breadcrumb */}
          <nav className="cd-breadcrumb">
            <Link href="/">الرئيسية</Link>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            <Link href="/charities">الجمعيات</Link>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            <span>{charity.charityName}</span>
          </nav>

          {/* Header row */}
          <div className="cd-hero__row">
            {/* Big icon visual */}
            <div className="cd-hero__avatar" style={{ background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.25)' }}>
              <div className="cd-hero__avatar-icon" dangerouslySetInnerHTML={{ __html: style.icon }} />
            </div>

            <div className="cd-hero__info">
              <div className="cd-hero__top">
                <h1 className="cd-hero__name">{charity.charityName}</h1>
                {status && (
                  <span className={`cd-status-badge${status === 'approved' ? ' cd-status-badge--approved' : ' cd-status-badge--pending'}`}>
                    {status === 'approved' ? (
                      <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> معتمدة</>
                    ) : 'قيد المراجعة'}
                  </span>
                )}
              </div>
              <div className="cd-hero__meta">
                {charity.address && (
                  <span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {charity.address}
                  </span>
                )}
                <span>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  {charity.email}
                </span>
                {charity.phone && (
                  <span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.41 2 2 0 0 1 3.6 2.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    {charity.phone}
                  </span>
                )}
                {year && (
                  <span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    منذ {year}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ Body ══ */}
      <div className="cd-body">

        {/* ── Main column ── */}
        <div className="cd-main">

          {/* About */}
          <div className="cd-card">
            <div className="cd-card__header">
              <div className="cd-card__header-icon" style={{ background: style.bg, color: style.color }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              </div>
              <h2 className="cd-card__title">عن الجمعية</h2>
            </div>
            <p className="cd-card__text">
              {charity.description || 'لا يوجد وصف متاح لهذه الجمعية.'}
            </p>
          </div>

          {/* Mission */}
          <div className="cd-mission" style={{ background: `linear-gradient(135deg, ${style.accent} 0%, ${style.color} 100%)` }}>
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="cd-mission__pattern">
              <defs dangerouslySetInnerHTML={{ __html: PATTERNS[patternIdx] }} />
              <rect width="100%" height="100%" fill={`url(#dp${patternIdx})`} />
            </svg>
            <div className="cd-mission__inner">
              <div className="cd-mission__header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                <h2 className="cd-mission__title">رسالتنا</h2>
              </div>
              <p className="cd-mission__text">
                نسعى جاهدين لتحقيق أهدافنا الإنسانية من خلال العمل الجماعي والتعاون مع المجتمع المحيط، لضمان وصول المساعدة لكل محتاج بطريقة كريمة ومنظمة.
              </p>
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="cd-sidebar">

          {/* Contact card */}
          <div className="cd-card">
            <div className="cd-card__header">
              <div className="cd-card__header-icon" style={{ background: style.bg, color: style.color }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <h3 className="cd-card__title">معلومات التواصل</h3>
            </div>
            <div className="cd-contact-list">
              <ContactRow
                icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
                label="البريد الإلكتروني" value={charity.email}
              />
              {charity.phone && (
                <ContactRow
                  icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.41 2 2 0 0 1 3.6 2.22h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>}
                  label="رقم الهاتف" value={charity.phone} ltr
                />
              )}
              {charity.address && (
                <ContactRow
                  icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>}
                  label="العنوان" value={charity.address}
                />
              )}
            </div>
          </div>

          {/* Donate card */}
          <div className="cd-card cd-donate-card">
            {donated ? (
              <div className="cd-donate-success">
                <div className="cd-donate-success__icon" style={{ background: style.bg, color: style.color }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div className="cd-donate-success__title">تم إرسال تبرعك!</div>
                <p className="cd-donate-success__sub">شكراً لمساهمتك الكريمة</p>
              </div>
            ) : canDonate ? (
              <div className="cd-donate-inner">
                <div className="cd-donate__icon" style={{ background: style.bg, color: style.color }}
                  dangerouslySetInnerHTML={{ __html: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>` }}
                />
                <h4 className="cd-donate__title">تبرع لهذه الجمعية</h4>
                <p className="cd-donate__sub">ملابسك المستعملة قد تغير حياة شخص محتاج</p>
                <button
                  onClick={() => setShowDonate(true)}
                  className="cd-donate-btn"
                  style={{ background: `linear-gradient(135deg, ${style.accent}, ${style.color})` }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  تبرع الآن
                </button>
              </div>
            ) : !isLoggedIn ? (
              <div className="cd-donate-inner">
                <div className="cd-donate__lock">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <h4 className="cd-donate__title">تبرع لهذه الجمعية</h4>
                <p className="cd-donate__sub">يجب تسجيل الدخول للتبرع</p>
                <Link href="/authModals?mode=login" className="cd-donate-btn" style={{ background: `linear-gradient(135deg, ${style.accent}, ${style.color})`, display: 'flex', textDecoration: 'none' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                  تسجيل الدخول
                </Link>
              </div>
            ) : null}
          </div>

          {/* Back link */}
          <Link href="/charities" className="cd-back-link">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            العودة للجمعيات
          </Link>
        </div>
      </div>

      {showDonate && (
        <DonationModal isOpen={showDonate} onClose={() => setShowDonate(false)} onSuccess={() => { setDonated(true); setShowDonate(false); }} />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');

        /* ══ Base ══ */
        .cd-page {
          min-height: 100vh;
          background: #f8fafc;
          direction: rtl;
          font-family: 'Cairo', sans-serif;
        }

        /* ══ Loading ══ */
        .cd-loading {
          display: flex; align-items: center; justify-content: center;
          min-height: 60vh;
        }
        .cd-spinner {
          width: 40px; height: 40px; border-radius: 50%;
          border: 3px solid #e5e7eb;
          border-top-color: #267880;
          animation: cdSpin 0.7s linear infinite;
        }
        @keyframes cdSpin { to { transform: rotate(360deg); } }

        /* ══ Not found ══ */
        .cd-notfound {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; min-height: 60vh; text-align: center; gap: 12px;
        }
        .cd-notfound__icon {
          width: 80px; height: 80px; border-radius: 50%;
          background: #f9fafb; border: 2px solid #f3f4f6;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 8px;
        }
        .cd-notfound__title { font-size: 17px; font-weight: 700; color: #374151; margin: 0; }

        /* ══ Hero ══ */
        .cd-hero {
          position: relative; overflow: hidden;
          padding: 44px 5% 40px;
          color: #fff;
        }
        .cd-hero__pattern {
          position: absolute; inset: 0; pointer-events: none;
        }
        .cd-hero__inner {
          position: relative; max-width: 1200px; margin: 0 auto;
        }
        .cd-breadcrumb {
          display: flex; align-items: center; gap: 6px;
          font-size: 12.5px; color: rgba(255,255,255,0.6);
          margin-bottom: 22px;
        }
        .cd-breadcrumb a { color: rgba(255,255,255,0.8); text-decoration: none; }
        .cd-breadcrumb a:hover { color: #fff; }

        .cd-hero__row {
          display: flex; align-items: center; gap: 20px; flex-wrap: wrap;
        }
        .cd-hero__avatar {
          width: 72px; height: 72px; border-radius: 18px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .cd-hero__avatar-icon { width: 38px; height: 38px; color: rgba(255,255,255,0.92); }
        .cd-hero__avatar-icon svg { width: 100%; height: 100%; }

        .cd-hero__info { flex: 1; min-width: 0; }
        .cd-hero__top {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 10px; flex-wrap: wrap;
        }
        .cd-hero__name {
          font-size: clamp(20px, 3vw, 28px);
          font-weight: 900; margin: 0; color: #fff;
        }
        .cd-status-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 12px; border-radius: 999px;
          font-size: 12px; font-weight: 700;
        }
        .cd-status-badge--approved {
          background: rgba(16,185,129,0.2);
          color: #a7f3d0;
          border: 1px solid rgba(16,185,129,0.3);
        }
        .cd-status-badge--pending {
          background: rgba(245,158,11,0.2);
          color: #fde68a;
          border: 1px solid rgba(245,158,11,0.3);
        }
        .cd-hero__meta {
          display: flex; flex-wrap: wrap; gap: 14px;
          font-size: 13px; color: rgba(255,255,255,0.72);
        }
        .cd-hero__meta span { display: flex; align-items: center; gap: 5px; }

        /* ══ Body ══ */
        .cd-body {
          max-width: 1200px; margin: 28px auto 80px;
          padding: 0 5%;
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 22px;
          align-items: start;
        }
        @media (max-width: 860px) {
          .cd-body { grid-template-columns: 1fr; }
          .cd-sidebar { order: -1; }
        }

        .cd-main { display: flex; flex-direction: column; gap: 18px; }
        .cd-sidebar { display: flex; flex-direction: column; gap: 16px; }

        /* ══ Card ══ */
        .cd-card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 22px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.05);
        }
        .cd-card__header {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 16px;
          padding-bottom: 14px;
          border-bottom: 1px solid #f3f4f6;
        }
        .cd-card__header-icon {
          width: 34px; height: 34px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .cd-card__title {
          font-size: 15px; font-weight: 800; color: #111827; margin: 0;
        }
        .cd-card__text {
          font-size: 14.5px; color: #374151; line-height: 2; margin: 0;
        }

        /* ══ Mission ══ */
        .cd-mission {
          border-radius: 16px; padding: 22px;
          position: relative; overflow: hidden;
        }
        .cd-mission__pattern {
          position: absolute; inset: 0; pointer-events: none;
        }
        .cd-mission__inner { position: relative; }
        .cd-mission__header {
          display: flex; align-items: center; gap: 8px;
          color: rgba(255,255,255,0.9);
          margin-bottom: 14px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.15);
        }
        .cd-mission__title {
          font-size: 15px; font-weight: 800; color: #fff; margin: 0;
        }
        .cd-mission__text {
          color: rgba(255,255,255,0.85); font-size: 14.5px; line-height: 2; margin: 0;
        }

        /* ══ Contact ══ */
        .cd-contact-list { display: flex; flex-direction: column; }
        .cd-contact-row {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 11px 0;
          border-bottom: 1px solid #f3f4f6;
        }
        .cd-contact-row:last-child { border-bottom: none; padding-bottom: 0; }
        .cd-contact-icon {
          width: 34px; height: 34px; border-radius: 9px;
          background: #f0fafb; color: #267880;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .cd-contact-label {
          font-size: 11px; color: #9ca3af; font-weight: 600; margin-bottom: 3px;
        }
        .cd-contact-val {
          font-size: 13.5px; color: #374151; font-weight: 600;
        }

        /* ══ Donate card ══ */
        .cd-donate-card { text-align: center; }
        .cd-donate-inner {
          display: flex; flex-direction: column; align-items: center; gap: 6px;
        }
        .cd-donate__icon {
          width: 56px; height: 56px; border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 4px;
        }
        .cd-donate__lock {
          width: 56px; height: 56px; border-radius: 16px;
          background: #f3f4f6;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 4px;
        }
        .cd-donate__title {
          font-size: 15px; font-weight: 800; color: #111827; margin: 0;
        }
        .cd-donate__sub {
          font-size: 12.5px; color: #6b7280; margin: 0 0 10px; line-height: 1.6;
        }
        .cd-donate-btn {
          width: 100%; padding: 12px 0;
          color: #fff; border: none; border-radius: 10px;
          font-size: 14px; font-weight: 700; cursor: pointer;
          font-family: 'Cairo', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          transition: opacity 0.2s, transform 0.2s;
        }
        .cd-donate-btn:hover { opacity: 0.9; transform: translateY(-1px); }

        .cd-donate-success {
          display: flex; flex-direction: column; align-items: center;
          gap: 6px; padding: 8px 0;
        }
        .cd-donate-success__icon {
          width: 56px; height: 56px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 4px;
        }
        .cd-donate-success__title {
          font-size: 15px; font-weight: 800; color: #111827;
        }
        .cd-donate-success__sub {
          font-size: 12.5px; color: #6b7280; margin: 0;
        }

        /* ══ Back link ══ */
        .cd-back-link {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 11px 0;
          border: 1.5px solid #e5e7eb; border-radius: 12px;
          font-size: 13.5px; color: #6b7280; font-weight: 600;
          text-decoration: none; background: #fff;
          transition: border-color 0.2s, color 0.2s;
          font-family: 'Cairo', sans-serif;
        }
        .cd-back-link:hover { border-color: #267880; color: #267880; }

        .cd-back-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 10px 24px; background: #267880; color: #fff;
          border-radius: 999px; text-decoration: none;
          font-size: 14px; font-weight: 700; font-family: 'Cairo', sans-serif;
        }

        /* ══ Dark mode ══ */
        [data-theme="dark"] .cd-page, .dark .cd-page { background: #0f172a; }
        [data-theme="dark"] .cd-card, .dark .cd-card { background: #1a1f2e; border-color: #2d3748; }
        [data-theme="dark"] .cd-card__title, .dark .cd-card__title { color: #f1f5f9; }
        [data-theme="dark"] .cd-card__text, .dark .cd-card__text { color: #94a3b8; }
        [data-theme="dark"] .cd-card__header, .dark .cd-card__header { border-color: #2d3748; }
        [data-theme="dark"] .cd-contact-row, .dark .cd-contact-row { border-color: #2d3748; }
        [data-theme="dark"] .cd-contact-val, .dark .cd-contact-val { color: #cbd5e1; }
        [data-theme="dark"] .cd-back-link, .dark .cd-back-link { background: #1a1f2e; border-color: #2d3748; color: #94a3b8; }
        [data-theme="dark"] .cd-donate__title, .dark .cd-donate__title { color: #f1f5f9; }

        /* ══ Responsive ══ */
        @media (max-width: 640px) {
          .cd-hero { padding: 32px 4% 28px; }
          .cd-body { padding: 0 4%; margin-top: 20px; }
          .cd-hero__meta { font-size: 12px; gap: 10px; }
        }
      `}</style>
    </div>
  );
}