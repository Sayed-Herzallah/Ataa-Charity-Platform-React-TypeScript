import { useEffect, useState, useMemo } from 'react';
import { Link } from 'wouter';
import { charityApi } from '../services';
import type { Charity } from '../services';

/* ─── Category icon mapping ─── */
const CATEGORY_ICONS: Record<string, { icon: string; color: string; bg: string }> = {
  'تعليم':    { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3L1 9l11 6 11-6-11-6z"/><path d="M1 9v6"/><path d="M7 12.5v5c0 1.657 2.239 3 5 3s5-1.343 5-3v-5"/></svg>`, color: '#2563eb', bg: '#eff6ff' },
  'صحة':     { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`, color: '#dc2626', bg: '#fef2f2' },
  'أيتام':   { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`, color: '#7c3aed', bg: '#f5f3ff' },
  'إغاثة':   { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`, color: '#ea580c', bg: '#fff7ed' },
  'بيئة':    { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 22c1.25-1.25 2.5-2.5 3.75-3.75C7 17 8.5 16 10.25 15.5c0 0-2.5-5 2.25-9.5 0 0 2 6.5 7 6.5 0 0-1 4-5 5.5 0 0 2 2 3.5 3.5"/><path d="M12 22c0-4.4-3.6-8-8-8"/></svg>`, color: '#16a34a', bg: '#f0fdf4' },
  'مسنين':   { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`, color: '#db2777', bg: '#fdf2f8' },
  'default': { icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`, color: '#267880', bg: '#f0fafb' },
};

const FALLBACK_COLORS = [
  { color: '#267880', bg: '#f0fafb', accent: '#0f4c58' },
  { color: '#7c3aed', bg: '#f5f3ff', accent: '#5b21b6' },
  { color: '#dc2626', bg: '#fef2f2', accent: '#991b1b' },
  { color: '#16a34a', bg: '#f0fdf4', accent: '#14532d' },
  { color: '#2563eb', bg: '#eff6ff', accent: '#1d4ed8' },
  { color: '#ea580c', bg: '#fff7ed', accent: '#9a3412' },
];

function getCharityStyle(charity: Charity, index: number) {
  const name = charity.charityName || '';
  for (const [key, val] of Object.entries(CATEGORY_ICONS)) {
    if (key !== 'default' && name.includes(key)) return { ...val, fallback: FALLBACK_COLORS[index % FALLBACK_COLORS.length] };
  }
  const c = FALLBACK_COLORS[index % FALLBACK_COLORS.length];
  return { ...CATEGORY_ICONS.default, color: c.color, bg: c.bg, fallback: c };
}

/* ─── Abstract pattern SVG backgrounds ─── */
const PATTERNS = [
  `<pattern id="p0" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1.5" fill="white" opacity="0.15"/><circle cx="0" cy="0" r="1.5" fill="white" opacity="0.15"/><circle cx="40" cy="0" r="1.5" fill="white" opacity="0.15"/><circle cx="0" cy="40" r="1.5" fill="white" opacity="0.15"/><circle cx="40" cy="40" r="1.5" fill="white" opacity="0.15"/></pattern>`,
  `<pattern id="p1" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M0 15 L15 0 L30 15 L15 30 Z" fill="none" stroke="white" stroke-width="0.5" opacity="0.12"/></pattern>`,
  `<pattern id="p2" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><line x1="0" y1="0" x2="20" y2="20" stroke="white" stroke-width="0.4" opacity="0.1"/><line x1="20" y1="0" x2="0" y2="20" stroke="white" stroke-width="0.4" opacity="0.1"/></pattern>`,
  `<pattern id="p3" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse"><polygon points="12,2 22,9 18,21 6,21 2,9" fill="none" stroke="white" stroke-width="0.5" opacity="0.12"/></pattern>`,
  `<pattern id="p4" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse"><circle cx="16" cy="16" r="12" fill="none" stroke="white" stroke-width="0.5" opacity="0.1"/><circle cx="16" cy="16" r="6" fill="none" stroke="white" stroke-width="0.5" opacity="0.1"/></pattern>`,
  `<pattern id="p5" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse"><rect x="8" y="8" width="24" height="24" fill="none" stroke="white" stroke-width="0.5" opacity="0.1"/><rect x="14" y="14" width="12" height="12" fill="none" stroke="white" stroke-width="0.5" opacity="0.1"/></pattern>`,
];

function getRegions(charities: Charity[]): string[] {
  const set = new Set<string>();
  charities.forEach(c => { if (c.address) set.add(c.address.split('،')[0].trim()); });
  return ['الكل', ...Array.from(set).sort()];
}

function SkeletonCard() {
  return (
    <div className="ch-card ch-card--skeleton" aria-hidden="true">
      <div className="ch-card__visual ch-skeleton" style={{ height: 160 }} />
      <div className="ch-card__body">
        <div className="ch-skeleton ch-skeleton--line" style={{ width: '60%', height: 16, marginBottom: 12 }} />
        <div className="ch-skeleton ch-skeleton--line" style={{ width: '90%', height: 12, marginBottom: 6 }} />
        <div className="ch-skeleton ch-skeleton--line" style={{ width: '75%', height: 12, marginBottom: 20 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="ch-skeleton ch-skeleton--line" style={{ width: 70, height: 28, borderRadius: 99 }} />
          <div className="ch-skeleton ch-skeleton--line" style={{ width: 80, height: 28, borderRadius: 99 }} />
        </div>
      </div>
    </div>
  );
}

/* ─── Charity card ─── */
function CharityCard({ charity, index }: { charity: Charity; index: number }) {
  const style = getCharityStyle(charity, index);
  const patternIndex = index % PATTERNS.length;
  const year = charity.createdAt ? new Date(charity.createdAt).getFullYear() : null;
  const region = charity.address?.split('،')[0]?.trim() || 'مصر';
  const age = year ? new Date().getFullYear() - year : null;

  const tags: string[] = [];
  if (charity.charityName?.includes('تعليم') || charity.charityName?.includes('مدرسة')) tags.push('تعليم');
  if (charity.charityName?.includes('صحة') || charity.charityName?.includes('طبي')) tags.push('صحة');
  if (charity.charityName?.includes('أيتام') || charity.charityName?.includes('يتيم')) tags.push('أيتام');
  if (charity.charityName?.includes('إغاثة') || charity.charityName?.includes('مساعدة')) tags.push('إغاثة');
  if (tags.length === 0) tags.push('خيرية');

  return (
    <Link href={`/charities/${charity._id}`} className="ch-card ch-card--link">
      {/* Visual header — no images, pure SVG */}
      <div className="ch-card__visual" style={{ background: `linear-gradient(135deg, ${style.color} 0%, ${style.fallback.accent} 100%)` }}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ position:'absolute', inset:0 }}>
          <defs dangerouslySetInnerHTML={{ __html: PATTERNS[patternIndex] }} />
          <rect width="100%" height="100%" fill={`url(#p${patternIndex})`} />
        </svg>

        {/* Big centered icon */}
        <div className="ch-card__main-icon" dangerouslySetInnerHTML={{ __html: style.icon }} />

        {/* Region badge */}
        <span className="ch-card__badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          {region}
        </span>

        {/* Year pill */}
        {year && (
          <span className="ch-card__year-pill">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            {year}
          </span>
        )}
      </div>

      {/* Icon circle overlay */}
      <div className="ch-card__icon-circle" style={{ background: style.bg, color: style.color, border: `2px solid ${style.color}22` }}>
        <div dangerouslySetInnerHTML={{ __html: style.icon }} style={{ width: 22, height: 22 }} />
      </div>

      <div className="ch-card__body">
        <h3 className="ch-card__name">{charity.charityName}</h3>

        <p className="ch-card__desc">
          {charity.description
            ? charity.description.length > 100
              ? charity.description.slice(0, 100) + '…'
              : charity.description
            : 'جمعية خيرية معتمدة تعمل على خدمة المجتمع وتقديم المساعدة للمحتاجين.'}
        </p>

        {/* Tags */}
        <div className="ch-card__tags">
          {tags.map(t => (
            <span key={t} className="ch-tag" style={{ background: style.bg, color: style.color }}>
              {t}
            </span>
          ))}
          {age && age > 0 && (
            <span className="ch-tag ch-tag--age">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {age} سنة
            </span>
          )}
        </div>

        {/* CTA row */}
        <div className="ch-card__cta-row">
          <span className="ch-card__cta" style={{ color: style.color }}>
            عرض التفاصيل
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
          </span>
          <span className="ch-card__region-label">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {region}
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ─── List view card ─── */
function CharityListCard({ charity, index }: { charity: Charity; index: number }) {
  const style = getCharityStyle(charity, index);
  const year = charity.createdAt ? new Date(charity.createdAt).getFullYear() : null;
  const region = charity.address?.split('،')[0]?.trim() || 'مصر';

  return (
    <Link href={`/charities/${charity._id}`} className="ch-list-card ch-card--link">
      <div className="ch-list-card__icon" style={{ background: `linear-gradient(135deg, ${style.color}, ${style.fallback.accent})` }}>
        <div dangerouslySetInnerHTML={{ __html: style.icon }} />
      </div>
      <div className="ch-list-card__body">
        <div className="ch-list-card__top">
          <h3 className="ch-list-card__name">{charity.charityName}</h3>
          <div className="ch-list-card__meta">
            {year && <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>{year}</span>}
            <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>{region}</span>
          </div>
        </div>
        <p className="ch-list-card__desc">
          {charity.description
            ? charity.description.length > 150 ? charity.description.slice(0, 150) + '…' : charity.description
            : 'جمعية خيرية معتمدة تعمل على خدمة المجتمع وتقديم المساعدة للمحتاجين.'}
        </p>
      </div>
      <div className="ch-list-card__arrow" style={{ color: style.color }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
      </div>
    </Link>
  );
}

function StatsBar({ total, filtered, loading }: { total: number; filtered: number; loading: boolean }) {
  if (loading) return null;
  return (
    <div className="ch-stats-bar">
      <span className="ch-stats-item">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        <strong>{total}</strong> جمعية
      </span>
      <span className="ch-stats-divider" />
      <span className="ch-stats-item">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
        <strong>{filtered}</strong> نتيجة
      </span>
    </div>
  );
}

export default function Charities() {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [search, setSearch]       = useState('');
  const [region, setRegion]       = useState('الكل');
  const [viewMode, setViewMode]   = useState<'grid' | 'list'>('grid');
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    setLoading(true);
    setError(null);
    charityApi.getAll()
      .then(res => setCharities((res as any).result?.Data || res.charities || []))
      .catch(() => setError('تعذّر تحميل الجمعيات، يرجى المحاولة لاحقاً'))
      .finally(() => setLoading(false));
  }, []);

  const regions = useMemo(() => getRegions(charities), [charities]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return charities.filter(c => {
      const matchSearch = !q ||
        c.charityName.toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q) ||
        (c.address || '').toLowerCase().includes(q);
      const matchRegion = region === 'الكل' || (c.address || '').startsWith(region);
      return matchSearch && matchRegion;
    });
  }, [charities, search, region]);

  // reset pagination when filters change
  useEffect(() => { setVisibleCount(10); }, [search, region]);

  return (
    <div className="ch-page">

      {/* ── Hero ── */}
      <section className="ch-hero">
        <div className="ch-hero__bg-shapes">
          <div className="ch-hero__shape ch-hero__shape--1" />
          <div className="ch-hero__shape ch-hero__shape--2" />
          <div className="ch-hero__shape ch-hero__shape--3" />
        </div>
        <div className="ch-hero__inner">
          <nav className="ch-breadcrumb">
            <Link href="/">الرئيسية</Link>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            <span>الجمعيات</span>
          </nav>
          <div className="ch-hero__content">
            <div className="ch-hero__icon-cluster">
              {[CATEGORY_ICONS['تعليم'], CATEGORY_ICONS['صحة'], CATEGORY_ICONS['أيتام'], CATEGORY_ICONS['بيئة']].map((cat, i) => (
                <div key={i} className="ch-hero__mini-icon" style={{ animationDelay: `${i * 0.15}s`, background: cat.bg, color: cat.color }}
                  dangerouslySetInnerHTML={{ __html: cat.icon }} />
              ))}
            </div>
            <div>
              <h1 className="ch-hero__title">
                الجمعيات الخيرية <span className="ch-hero__accent">المعتمدة</span>
              </h1>
              <p className="ch-hero__sub">
                تصفّح قائمة الجمعيات الشريكة وتعرّف على أهدافها وخدماتها لتختار الأنسب لتبرعك
              </p>
            </div>
          </div>

          {!loading && charities.length > 0 && (
            <div className="ch-hero__counters">
              <div className="ch-counter">
                <span className="ch-counter__num">{charities.length}+</span>
                <span className="ch-counter__label">جمعية معتمدة</span>
              </div>
              <div className="ch-counter__sep" />
              <div className="ch-counter">
                <span className="ch-counter__num">{regions.length - 1}</span>
                <span className="ch-counter__label">محافظة</span>
              </div>
              <div className="ch-counter__sep" />
              <div className="ch-counter">
                <span className="ch-counter__num">100%</span>
                <span className="ch-counter__label">شفافية</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Toolbar ── */}
      <div className="ch-toolbar">
        <div className="ch-toolbar__inner">
          <div className="ch-search-wrap">
            <svg className="ch-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="search"
              placeholder="ابحث عن جمعية…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="ch-search-input"
            />
            {search && (
              <button className="ch-search-clear" onClick={() => setSearch('')} aria-label="مسح">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            )}
          </div>

          {regions.length > 1 && (
            <div className="ch-chips-wrap">
              {regions.map(r => (
                <button key={r} className={`ch-chip${region === r ? ' ch-chip--active' : ''}`} onClick={() => setRegion(r)}>
                  {r}
                </button>
              ))}
            </div>
          )}

          <div className="ch-toolbar__end">
            <StatsBar total={charities.length} filtered={filtered.length} loading={loading} />
            <div className="ch-view-toggle">
              <button className={`ch-view-btn${viewMode === 'grid' ? ' active' : ''}`} onClick={() => setViewMode('grid')} title="شبكي">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              </button>
              <button className={`ch-view-btn${viewMode === 'list' ? ' active' : ''}`} onClick={() => setViewMode('list')} title="قائمة">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <section className="ch-content">
        {loading ? (
          <div className="ch-grid">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <div className="ch-empty">
            <div className="ch-empty__icon-wrap">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <p className="ch-empty__title">{error}</p>
            <button className="ch-retry-btn" onClick={() => window.location.reload()}>إعادة المحاولة</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="ch-empty">
            <div className="ch-empty__icon-wrap">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <p className="ch-empty__title">لا توجد نتائج</p>
            <p className="ch-empty__sub">جرّب كلمة مختلفة أو اختر منطقة أخرى</p>
            <button className="ch-retry-btn" onClick={() => { setSearch(''); setRegion('الكل'); }}>إعادة ضبط الفلاتر</button>
          </div>
        ) : viewMode === 'grid' ? (
          <>
            <div className="ch-grid">
              {filtered.slice(0, visibleCount).map((c, i) => <CharityCard key={c._id} charity={c} index={i} />)}
            </div>
            {visibleCount < filtered.length && (
              <div className="ch-loadmore-wrap">
                <button className="ch-loadmore-btn" onClick={() => setVisibleCount(v => v + 10)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                  عرض المزيد
                  <span className="ch-loadmore-badge">{filtered.length - visibleCount}</span>
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="ch-list">
              {filtered.slice(0, visibleCount).map((c, i) => <CharityListCard key={c._id} charity={c} index={i} />)}
            </div>
            {visibleCount < filtered.length && (
              <div className="ch-loadmore-wrap">
                <button className="ch-loadmore-btn" onClick={() => setVisibleCount(v => v + 10)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                  عرض المزيد
                  <span className="ch-loadmore-badge">{filtered.length - visibleCount}</span>
                </button>
              </div>
            )}
          </>
        )}
      </section>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');

        /* ══ Base ══ */
        .ch-page {
          min-height: 100vh;
          background: #f8fafc;
          direction: rtl;
          font-family: 'Cairo', sans-serif;
        }

        /* ══ Hero ══ */
        .ch-hero {
          background: linear-gradient(145deg, #0c3d47 0%, #1a6b78 50%, #267880 100%);
          padding: 36px 5% 30px;
          color: #fff;
          position: relative;
          overflow: hidden;
        }
        .ch-hero__bg-shapes { position: absolute; inset: 0; pointer-events: none; }
        .ch-hero__shape {
          position: absolute;
          border-radius: 50%;
          opacity: 0.06;
          background: #fff;
        }
        .ch-hero__shape--1 { width: 400px; height: 400px; top: -180px; left: -100px; }
        .ch-hero__shape--2 { width: 200px; height: 200px; bottom: -80px; right: 10%; }
        .ch-hero__shape--3 { width: 120px; height: 120px; top: 40px; right: 30%; }

        .ch-hero__inner { position: relative; max-width: 1200px; margin: 0 auto; }
        .ch-breadcrumb {
          display: flex; align-items: center; gap: 6px;
          font-size: 13px; color: rgba(255,255,255,0.65); margin-bottom: 24px;
        }
        .ch-breadcrumb a { color: rgba(255,255,255,0.8); text-decoration: none; }
        .ch-breadcrumb a:hover { color: #fff; }

        .ch-hero__content { display: flex; align-items: center; gap: 28px; margin-bottom: 32px; flex-wrap: wrap; }
        .ch-hero__icon-cluster { display: flex; gap: 8px; flex-shrink: 0; }
        .ch-hero__mini-icon {
          width: 44px; height: 44px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          animation: heroIconFloat 0.6s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        .ch-hero__mini-icon svg { width: 22px; height: 22px; }
        @keyframes heroIconFloat {
          from { opacity: 0; transform: translateY(16px) scale(0.8); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .ch-hero__title {
          font-size: clamp(24px, 3.5vw, 40px);
          font-weight: 900;
          margin: 0 0 12px;
          line-height: 1.3;
        }
        .ch-hero__accent { color: #fbbf24; }
        .ch-hero__sub {
          font-size: clamp(13px, 1.8vw, 16px);
          color: rgba(255,255,255,0.75);
          line-height: 1.8;
          max-width: 540px;
          margin: 0;
        }

        .ch-hero__counters {
          display: flex; align-items: center; gap: 0;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 14px;
          padding: 14px 24px;
          backdrop-filter: blur(8px);
          width: fit-content;
          flex-wrap: wrap;
          gap: 0;
        }
        .ch-counter { text-align: center; padding: 0 20px; }
        .ch-counter__num { display: block; font-size: 22px; font-weight: 900; color: #fff; }
        .ch-counter__label { display: block; font-size: 11px; color: rgba(255,255,255,0.65); margin-top: 2px; }
        .ch-counter__sep { width: 1px; height: 32px; background: rgba(255,255,255,0.2); }

        /* ══ Toolbar ══ */
        .ch-toolbar {
          background: #fff;
          border-bottom: 1px solid #e5e7eb;
          position: sticky; top: 0; z-index: 40;
          box-shadow: 0 2px 16px rgba(0,0,0,0.06);
        }
        .ch-toolbar__inner {
          max-width: 1200px; margin: 0 auto;
          padding: 14px 5%;
          display: flex; flex-direction: column; gap: 10px;
        }
        @media (min-width: 768px) {
          .ch-toolbar__inner { flex-direction: row; align-items: center; flex-wrap: wrap; gap: 12px; }
        }

        .ch-search-wrap { position: relative; flex: 1; min-width: 0; max-width: 380px; }
        .ch-search-icon {
          position: absolute; right: 14px; top: 50%;
          transform: translateY(-50%);
          color: #9ca3af; pointer-events: none;
        }
        .ch-search-input {
          width: 100%; padding: 10px 42px 10px 38px;
          border: 1.5px solid #e5e7eb; border-radius: 999px;
          font-size: 14px; background: #f9fafb;
          color: #111; outline: none;
          font-family: 'Cairo', sans-serif;
          direction: rtl;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .ch-search-input:focus {
          border-color: #267880;
          box-shadow: 0 0 0 3px rgba(38,120,128,0.1);
          background: #fff;
        }
        .ch-search-clear {
          position: absolute; left: 12px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #9ca3af; padding: 4px;
          display: flex; align-items: center;
        }
        .ch-search-clear:hover { color: #374151; }

        .ch-chips-wrap {
          display: flex; gap: 6px;
          overflow-x: auto; scrollbar-width: none;
          padding-bottom: 2px;
        }
        .ch-chips-wrap::-webkit-scrollbar { display: none; }
        .ch-chip {
          white-space: nowrap; padding: 6px 16px;
          border-radius: 999px;
          border: 1.5px solid #e5e7eb;
          background: #fff; color: #4b5563;
          font-size: 13px; font-weight: 600; cursor: pointer;
          transition: all 0.18s; font-family: 'Cairo', sans-serif;
        }
        .ch-chip:hover { border-color: #267880; color: #1a6b78; }
        .ch-chip--active { background: #267880; border-color: #267880; color: #fff; }

        .ch-toolbar__end { display: flex; align-items: center; gap: 10px; margin-right: auto; }
        .ch-stats-bar { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #6b7280; }
        .ch-stats-item { display: flex; align-items: center; gap: 5px; }
        .ch-stats-item svg { color: #267880; }
        .ch-stats-item strong { color: #111; font-weight: 700; }
        .ch-stats-divider { width: 1px; height: 14px; background: #e5e7eb; }

        .ch-view-toggle {
          display: flex; border: 1.5px solid #e5e7eb;
          border-radius: 8px; overflow: hidden;
        }
        .ch-view-btn {
          padding: 7px 10px; background: #fff; border: none;
          cursor: pointer; color: #9ca3af;
          display: flex; align-items: center;
          transition: all 0.15s;
        }
        .ch-view-btn:hover { background: #f9fafb; color: #374151; }
        .ch-view-btn.active { background: #267880; color: #fff; }

        /* ══ Content ══ */
        .ch-content {
          max-width: 1200px; margin: 0 auto;
          padding: 36px 5% 100px;
        }

        /* ══ Grid ══ */
        .ch-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(295px, 1fr));
          gap: 24px;
        }

        /* ══ Card ══ */
        .ch-card {
          background: #fff;
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          display: flex; flex-direction: column;
          text-decoration: none; color: inherit;
          transition: transform 0.3s cubic-bezier(0.22,1,0.36,1),
                      box-shadow 0.3s ease, border-color 0.2s;
          position: relative;
        }
        .ch-card--link:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 48px rgba(0,0,0,0.12);
        }

        /* Card visual header */
        .ch-card__visual {
          height: 120px;
          position: relative;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden;
        }
        .ch-card__main-icon {
          width: 48px; height: 48px;
          color: rgba(255,255,255,0.9);
          position: relative; z-index: 1;
          filter: drop-shadow(0 4px 12px rgba(0,0,0,0.2));
          transition: transform 0.3s ease;
        }
        .ch-card__main-icon svg { width: 100%; height: 100%; }
        .ch-card--link:hover .ch-card__main-icon { transform: scale(1.1) translateY(-3px); }

        .ch-card__badge {
          position: absolute; top: 12px; right: 12px;
          background: rgba(255,255,255,0.92);
          color: #1a6b78;
          padding: 4px 10px 4px 8px;
          border-radius: 999px;
          font-size: 11.5px; font-weight: 700;
          display: flex; align-items: center; gap: 4px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
          backdrop-filter: blur(4px);
        }
        .ch-card__year-pill {
          position: absolute; bottom: 12px; left: 12px;
          background: rgba(0,0,0,0.25);
          color: rgba(255,255,255,0.95);
          padding: 3px 9px;
          border-radius: 999px;
          font-size: 11px; font-weight: 600;
          display: flex; align-items: center; gap: 4px;
          backdrop-filter: blur(4px);
        }

        /* Icon circle overlay (positioned on card body top) */
        .ch-card__icon-circle {
          width: 40px; height: 40px;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          margin: -20px 16px 0;
          position: relative; z-index: 2;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
          flex-shrink: 0;
          align-self: flex-start;
          transition: transform 0.3s ease;
        }
        .ch-card--link:hover .ch-card__icon-circle { transform: scale(1.05); }

        /* Card body */
        .ch-card__body {
          padding: 14px 16px 16px;
          flex: 1; display: flex; flex-direction: column;
        }
        .ch-card__name {
          font-size: 14px; font-weight: 800;
          color: #111827; margin: 10px 0 8px;
          line-height: 1.4;
        }
        .ch-card__desc {
          font-size: 13px; color: #6b7280;
          line-height: 1.75; flex: 1; margin: 0 0 14px;
        }

        /* Tags */
        .ch-card__tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; }
        .ch-tag {
          padding: 3px 10px; border-radius: 999px;
          font-size: 11.5px; font-weight: 700;
        }
        .ch-tag--age {
          background: #f3f4f6; color: #6b7280;
          display: flex; align-items: center; gap: 4px;
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 11.5px; font-weight: 700;
        }

        /* CTA row */
        .ch-card__cta-row {
          display: flex; align-items: center;
          justify-content: space-between;
          padding-top: 14px;
          border-top: 1px solid #f3f4f6;
          margin-top: auto;
        }
        .ch-card__cta {
          font-size: 13px; font-weight: 700;
          display: flex; align-items: center; gap: 4px;
          transition: gap 0.2s;
        }
        .ch-card--link:hover .ch-card__cta { gap: 8px; }
        .ch-card__region-label {
          font-size: 11.5px; color: #9ca3af;
          display: flex; align-items: center; gap: 3px;
        }

        /* ══ List view ══ */
        .ch-list { display: flex; flex-direction: column; gap: 12px; }
        .ch-list-card {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          padding: 18px 20px;
          display: flex; align-items: center; gap: 18px;
          text-decoration: none; color: inherit;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.2s;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .ch-list-card:hover {
          transform: translateX(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.09);
          border-color: #b3d8dc;
        }
        .ch-list-card__icon {
          width: 52px; height: 52px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; color: rgba(255,255,255,0.9);
        }
        .ch-list-card__icon svg { width: 26px; height: 26px; }
        .ch-list-card__body { flex: 1; min-width: 0; }
        .ch-list-card__top {
          display: flex; align-items: baseline;
          justify-content: space-between; gap: 12px;
          margin-bottom: 6px; flex-wrap: wrap;
        }
        .ch-list-card__name {
          font-size: 15px; font-weight: 800; color: #111827; margin: 0;
        }
        .ch-list-card__meta {
          display: flex; gap: 12px;
          font-size: 12px; color: #9ca3af; flex-shrink: 0;
        }
        .ch-list-card__meta span { display: flex; align-items: center; gap: 4px; }
        .ch-list-card__desc {
          font-size: 13px; color: #6b7280; line-height: 1.65; margin: 0;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .ch-list-card__arrow {
          flex-shrink: 0;
          opacity: 0.5;
          transition: opacity 0.2s, transform 0.2s;
        }
        .ch-list-card:hover .ch-list-card__arrow { opacity: 1; transform: translateX(-4px); }

        /* ══ Skeleton ══ */
        .ch-card--skeleton { pointer-events: none; }
        .ch-skeleton {
          background: linear-gradient(90deg, #f3f4f6 25%, #e9eaec 50%, #f3f4f6 75%);
          background-size: 200% 100%;
          animation: chSkel 1.4s ease-in-out infinite;
          border-radius: 8px;
        }
        @keyframes chSkel {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ══ Empty / Error ══ */
        .ch-empty {
          text-align: center; padding: 80px 20px;
        }
        .ch-empty__icon-wrap {
          width: 80px; height: 80px; border-radius: 50%;
          background: #f9fafb; border: 2px solid #f3f4f6;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px;
        }
        .ch-empty__title { font-size: 17px; font-weight: 700; color: #374151; margin-bottom: 8px; }
        .ch-empty__sub { font-size: 14px; color: #9ca3af; margin-bottom: 24px; }
        .ch-retry-btn {
          padding: 10px 28px; background: #267880;
          color: #fff; border: none; border-radius: 999px;
          font-size: 14px; font-weight: 700; cursor: pointer;
          font-family: 'Cairo', sans-serif;
          transition: background 0.2s;
        }
        .ch-retry-btn:hover { background: #1a6b78; }

        /* ══ Load more ══ */
        .ch-loadmore-wrap {
          display: flex; justify-content: center;
          margin-top: 36px;
        }
        .ch-loadmore-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 12px 28px;
          background: #fff;
          border: 2px solid #267880;
          color: #267880;
          border-radius: 999px;
          font-size: 15px; font-weight: 700;
          cursor: pointer; font-family: 'Cairo', sans-serif;
          transition: background 0.2s, color 0.2s, transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 2px 12px rgba(38,120,128,0.1);
        }
        .ch-loadmore-btn:hover {
          background: #267880; color: #fff;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(38,120,128,0.25);
        }
        .ch-loadmore-badge {
          background: #267880; color: #fff;
          border-radius: 999px;
          font-size: 12px; font-weight: 800;
          padding: 1px 9px; min-width: 26px;
          text-align: center;
          transition: background 0.2s, color 0.2s;
        }
        .ch-loadmore-btn:hover .ch-loadmore-badge {
          background: rgba(255,255,255,0.25); color: #fff;
        }
        [data-theme="dark"] .ch-loadmore-btn, .dark .ch-loadmore-btn {
          background: #1a1f2e; border-color: #267880; color: #5eabb3;
        }
        [data-theme="dark"] .ch-loadmore-btn:hover, .dark .ch-loadmore-btn:hover {
          background: #267880; color: #fff;
        }

        /* ══ Dark mode ══ */
        [data-theme="dark"] .ch-page, .dark .ch-page { background: #0f172a; }
        [data-theme="dark"] .ch-toolbar, .dark .ch-toolbar { background: #1a1f2e; border-color: #2d3748; }
        [data-theme="dark"] .ch-search-input, .dark .ch-search-input { background: #232b3e; border-color: #2d3748; color: #f1f5f9; }
        [data-theme="dark"] .ch-chip, .dark .ch-chip { background: #232b3e; border-color: #2d3748; color: #cbd5e1; }
        [data-theme="dark"] .ch-card, .dark .ch-card { background: #1a1f2e; border-color: #2d3748; }
        [data-theme="dark"] .ch-card__name, .dark .ch-card__name { color: #f1f5f9; }
        [data-theme="dark"] .ch-card__desc, .dark .ch-card__desc { color: #94a3b8; }
        [data-theme="dark"] .ch-card__cta-row, .dark .ch-card__cta-row { border-color: #2d3748; }
        [data-theme="dark"] .ch-list-card, .dark .ch-list-card { background: #1a1f2e; border-color: #2d3748; }
        [data-theme="dark"] .ch-list-card__name, .dark .ch-list-card__name { color: #f1f5f9; }
        [data-theme="dark"] .ch-view-btn, .dark .ch-view-btn { background: #232b3e; color: #94a3b8; }
        [data-theme="dark"] .ch-view-toggle, .dark .ch-view-toggle { border-color: #2d3748; }
        [data-theme="dark"] .ch-empty__icon-wrap, .dark .ch-empty__icon-wrap { background: #1a1f2e; border-color: #2d3748; }

        /* ══ Responsive ══ */
        @media (max-width: 768px) {
          .ch-hero { padding: 36px 4% 32px; }
          .ch-hero__icon-cluster { display: none; }
          .ch-hero__counters { width: 100%; justify-content: center; }
          .ch-content { padding: 24px 4% 80px; }
          .ch-grid { grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
          .ch-toolbar__end { width: 100%; justify-content: space-between; }
        }
        @media (max-width: 560px) {
          .ch-hero { padding: 28px 4% 24px; }
          .ch-grid { grid-template-columns: 1fr; gap: 14px; }
          .ch-stats-bar { display: none; }
          .ch-list-card__desc { display: none; }
        }
      `}</style>
    </div>
  );
}