import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from '../../features/notifications/NotificationBell';

/* ── Static nav links ───────────────────────────────────────── */
const PUBLIC_NAV_LINKS = [
  { href: '/',          label: 'الرئيسية' },
  { href: '/charities', label: 'الجمعيات' },
  { href: '/about',     label: 'عن المنصة' },
  { href: '/contact',   label: 'تواصل معنا' },
];

/* ── Role-based nav link ────────────────────────────────────── */
function useRoleNavLink(roleType?: string) {
  if (roleType === 'user')    return { href: '/user-dashboard', label: 'تبرعاتي',     icon: 'fa-solid fa-shirt' as string | null };
  if (roleType === 'charity') return { href: '/dashboard',      label: 'لوحة التحكم', icon: null };
  if (roleType === 'donor')   return { href: '/dashboard',      label: 'حسابي',        icon: null };
  if (roleType === 'admin')   return { href: '/admin',          label: 'لوحة الإدارة', icon: null };
  return null;
}

function getRoleLabel(roleType?: string): string {
  if (roleType === 'charity') return 'جمعية خيرية';
  if (roleType === 'admin')   return 'مدير';
  return 'متبرع';
}

/* ════════════════════════════════════════════════════════════
   Navbar
════════════════════════════════════════════════════════════ */
export default function Navbar() {
  const [scrolled,   setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location,   setLocation]   = useLocation();
  const { user, logout }            = useAuth();
  const roleLink                    = useRoleNavLink(user?.roleType);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Element;
      if (!t.closest('.mobile-nav') && !t.closest('.nav-ham')) setMobileOpen(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [mobileOpen]);

  const goToAuth = (mode: 'login' | 'signup') => {
    setMobileOpen(false);
    setLocation(`/authModals?mode=${mode}`);
  };

  const isActive = (href: string) =>
    href === '/' ? location === '/' : location.startsWith(href);

  return (
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`} role="navigation" aria-label="القائمة الرئيسية">
        <div className="nav-inner">

          <Link href="/" className="nav-logo" aria-label="عطاء — الصفحة الرئيسية">
            <NavLogo />
          </Link>

          <div className="nav-links">
            {PUBLIC_NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} className={isActive(l.href) ? 'active' : ''}>
                {l.label}
              </Link>
            ))}
            {roleLink && (
              <Link href={roleLink.href} className={isActive(roleLink.href) ? 'active' : ''}>
                {roleLink.icon && <i className={roleLink.icon} style={{ fontSize: 13 }} />}
                {' '}{roleLink.label}
              </Link>
            )}
          </div>

          <div className="nav-actions">
            {user ? (
              <div className="nav-user">
                <NotificationBell />
                <Link href="/settings" className="nav-avatar" title="الإعدادات">
                  {user.userName?.[0]?.toUpperCase() || '👤'}
                </Link>
                <span className="nav-user-name">{user.userName}</span>
                <button className="nav-btn-login" onClick={logout} aria-label="تسجيل الخروج">
                  <i className="fas fa-sign-out-alt" style={{ fontSize: 13 }} /> خروج
                </button>
              </div>
            ) : (
              <>
                <button className="nav-btn-login"  onClick={() => goToAuth('login')}>تسجيل الدخول</button>
                <button className="nav-btn-signup" onClick={() => goToAuth('signup')}>إنشاء حساب</button>
              </>
            )}
          </div>

          <button
            className={`nav-ham${mobileOpen ? ' open' : ''}`}
            onClick={() => setMobileOpen(v => !v)}
            aria-label={mobileOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
            aria-expanded={mobileOpen}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`mobile-nav${mobileOpen ? ' open' : ''}`} role="dialog" aria-label="القائمة المحمولة">
        <div className="mobile-nav-links">
          {PUBLIC_NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} className={`mobile-link${isActive(l.href) ? ' active' : ''}`}>
              {l.label}
            </Link>
          ))}
          {roleLink && (
            <Link href={roleLink.href} className={`mobile-link${isActive(roleLink.href) ? ' active' : ''}`}>
              {roleLink.icon && <i className={roleLink.icon} />}
              {' '}{roleLink.label}
            </Link>
          )}
          {/* {user && (
            <Link href="/ai-chat" className={`mobile-link${isActive('/ai-chat') ? ' active' : ''}`}>
              <i className="fa-solid fa-robot" /> المساعد الذكي
            </Link>
          )} */}
        </div>

        <div className="mobile-nav-divider" />

        {user ? (
          <div className="mobile-nav-user">
            <div className="mobile-user-info">
              <div className="mobile-avatar">{user.userName?.[0]?.toUpperCase() || '👤'}</div>
              <div>
                <div className="mobile-user-name">{user.userName}</div>
                <div className="mobile-user-role">{getRoleLabel(user.roleType)}</div>
              </div>
            </div>
            <div className="mobile-nav-actions">
              <Link href="/settings">
                <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  <i className="fas fa-cog" /> إعداداتي
                </button>
              </Link>
              {/* <button className="btn-mobile-logout" onClick={logout}>
                <i className="fas fa-sign-out-alt" /> خروج
              </button> */}
            </div>
          </div>
        ) : (
          <div className="mobile-nav-actions">
            <button className="btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => goToAuth('login')}>
              <i className="fas fa-sign-in-alt" /> دخول
            </button>
            <button className="nav-btn-signup" style={{ flex: 1 }} onClick={() => goToAuth('signup')}>
              تسجيل
            </button>
          </div>
        )}
      </div>

      {mobileOpen && <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />}
    </>
  );
}

/* ── Logo SVG ────────────────────────────────────────────────── */
function NavLogo() {
  return (
    <svg width="88" height="40" viewBox="0 0 88 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <g filter="url(#f0)">
        <path d="M83.5143 28.488H79.0703L78.6303 26.596C76.6943 28.2093 74.729 29.016 72.7343 29.016C68.305 29.016 66.0903 26.86 66.0903 22.548C66.0903 20.4067 67.0143 18.7347 68.8623 17.532C70.7397 16.3 73.5117 15.684 77.1783 15.684H78.1023V15.596C78.1023 14.3347 77.8383 13.4693 77.3103 13C76.7823 12.5307 75.829 12.296 74.4503 12.296C72.5143 12.296 70.7397 12.912 69.1263 14.144C69.1263 12.296 61.4693 8.92266 61 7.984C62.672 6.69333 70.7543 9.128 71.9863 8.688C73.2477 8.21866 74.7437 7.984 76.4743 7.984C81.1677 7.984 83.5143 10.9173 83.5143 16.784V28.488ZM77.9263 19.072H77.2663C75.5943 19.072 74.245 19.3653 73.2183 19.952C72.1917 20.5387 71.6783 21.316 71.6783 22.284C71.6783 24.1027 72.4703 25.012 74.0543 25.012C75.0223 25.012 75.873 24.7333 76.6063 24.176C77.3397 23.6187 77.7797 22.9147 77.9263 22.064V19.072Z" fill="#234124"/>
      </g>
      <g filter="url(#f1)">
        <path d="M61 33.136L58.1843 28.488L57.7443 26.596C55.8083 28.2093 53.843 29.016 51.8483 29.016C47.419 29.016 45.2043 26.86 45.2043 22.548C45.2043 20.4067 46.1283 18.7347 47.9763 17.532C49.8537 16.3 52.6257 15.684 56.2923 15.684H57.2163V15.596C57.2163 14.3347 56.9523 13.4693 56.4243 13C55.8963 12.5307 54.943 12.296 53.5643 12.296C51.6283 12.296 49.8537 12.912 48.2403 14.144C47.7123 13.176 47.2137 12.2227 46.7443 11.284C48.4163 9.99334 49.8683 9.12801 51.1003 8.68801C52.3617 8.21868 53.8577 7.98401 55.5883 7.98401C60.2817 7.98401 62.6283 10.9173 62.6283 16.784L61 33.136ZM57.0403 19.072H56.3803C54.7083 19.072 53.359 19.3653 52.3323 19.952C51.3057 20.5387 50.7923 21.316 50.7923 22.284C50.7923 24.1027 51.5843 25.012 53.1683 25.012C54.1363 25.012 54.987 24.7333 55.7203 24.176C56.4537 23.6187 56.8937 22.9147 57.0403 22.064V19.072Z" fill="#234124"/>
      </g>
      <g filter="url(#f2)">
        <path d="M42.7321 12.956H37.0121V22.856C37.0121 24.3227 37.4961 25.056 38.4641 25.056C39.3441 25.056 40.4441 24.6747 41.7641 23.912L43.6121 26.728C41.5294 28.3707 39.2268 29.192 36.7041 29.192C33.1841 29.192 31.4241 27.256 31.4241 23.384V12.956H28.6521V8.512H31.4681V4.948C32.9348 4.156 34.7974 3.17333 37.0561 2V8.512H42.7321V12.956Z" fill="#234124"/>
      </g>
      <g filter="url(#f3)">
        <path d="M15 2.56799L29.344 28.488H23.492C22.9933 27.0213 22.3773 25.0853 21.644 22.68H11.656C11.2453 24 10.6147 25.936 9.764 28.488H4L15 2.56799ZM20.016 4.06799C19.1947 6.38533 14.7653 13.7333 13.328 17.928H20.016C18.6373 13.88 20.8373 6.53199 20.016 4.06799Z" fill="#234124"/>
      </g>
      <defs>
        <filter id="f0" x="57" y="5.60252" width="30.5143" height="29.4135" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
          <feOffset dy="2"/><feGaussianBlur stdDeviation="2"/>
          <feComposite in2="hardAlpha" operator="out"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0"/>
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_141_126"/>
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_141_126" result="shape"/>
        </filter>
        <filter id="f1" x="41.2043" y="5.98401" width="25.424" height="33.152" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
          <feOffset dy="2"/><feGaussianBlur stdDeviation="2"/>
          <feComposite in2="hardAlpha" operator="out"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0"/>
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_141_126"/>
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_141_126" result="shape"/>
        </filter>
        <filter id="f2" x="24.6521" y="0" width="22.96" height="35.192" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
          <feOffset dy="2"/><feGaussianBlur stdDeviation="2"/>
          <feComposite in2="hardAlpha" operator="out"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0"/>
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_141_126"/>
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_141_126" result="shape"/>
        </filter>
        <filter id="f3" x="0" y="0.567993" width="33.344" height="33.92" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
          <feOffset dy="2"/><feGaussianBlur stdDeviation="2"/>
          <feComposite in2="hardAlpha" operator="out"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.04 0"/>
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_141_126"/>
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_141_126" result="shape"/>
        </filter>
      </defs>
    </svg>
  );
}
