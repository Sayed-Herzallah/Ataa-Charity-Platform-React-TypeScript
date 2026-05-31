import React, { useEffect, useState, useCallback, useRef, memo, useMemo } from 'react';
import ScrollToTop from '../components/shared/ScrollToTop';
import { useAuth } from '../contexts/AuthContext';
import { donorApi, reportApi, notificationApi, usersApi, ratingApi, charityApi, Donation, Charity } from '../services';
import type { Notification } from '../services';
import { formatDate, formatRelativeTime } from '../utils/formatDate';
import { PremiumDatePicker } from '../components/ui/PremiumDatePicker';
import { formatNumber, formatPercent } from '../utils/formatNumber';
import { Link, useLocation } from 'wouter';
import RatingModal from '../features/rating/RatingModal';
import AIChatEmbed from '../components/shared/AIChatEmbed';
import NotificationBell from '../features/notifications/NotificationBell';
import PageLoader from '../components/ui/Pageloader';
import { translateError } from '../utils/translateError';
import { translateNotification, translateNotificationTitle } from '../utils/translateNotification';
import '../styles/css/UserDashboard.css';
import '../styles/css/donationForm.css';
import '@tabler/icons-webfont/dist/tabler-icons.css';
import {
  AreaChart, Area, PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

/* ─── Type definitions ─── */
type DashboardTab = 'stats' | 'donations' | 'add-donation' | 'chat' | 'settings';
type ImageItem = { id: string; file: File; url: string };
type ConfirmState = {
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'ok';
  icon?: string;
  onConfirm: () => void;
};

// ─── Arabic Months Constant ──────────────────────────────────────────────────
const MONTHS_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

// ─── Validation Regexes ──────────────────────────────────────────────────────
const nameRegex = /^[a-zA-Z\u0621-\u064A][^#&<>"~;$^%{}]{2,29}$/;
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
const phoneRegex = /^(002|\+2)?01[0125][0-9]{8}$/;

// ✅ القيم مطابقة تماماً لما يقبله الباك إند
const DASH_CONDITIONS = [
  { value: 'جديدة',  label: 'جديد',  desc: 'ببطاقة الأسعار أو في العبوة الأصلية ولم تُستعمل قط', icon: 'ti-sparkles' },
  { value: 'ممتازة', label: 'ممتاز', desc: 'شبه جديدة تماماً، استعملت مرات معدودة ولا يوجد بها عيوب', icon: 'ti-award' },
  { value: 'جيدة',   label: 'جيد',   desc: 'بحالة جيدة جداً، مغسولة ومكوية وخالية من التمزق أو التلف', icon: 'ti-thumb-up' },
  { value: 'مقبولة', label: 'مقبول', desc: 'صالحة للاستخدام وبحالة مقبولة ولكن تظهر عليها آثار الاستعمال', icon: 'ti-discount-check' },
];

/* ─── Theme-Aware Status Config ─── */
const getStatusCfg = (isDark: boolean): Record<string, {
  label: string; color: string; bg: string; border: string; dot: string;
}> => {
  if (isDark) {
    return {
      pending:   { label: 'قيد المراجعة', color: '#f4a118', bg: 'rgba(244,161,24,0.12)', border: 'rgba(244,161,24,0.25)', dot: '#f4a118' },
      accepted:  { label: 'مقبول',        color: '#0ec97f', bg: 'rgba(14,201,127,0.12)',  border: 'rgba(14,201,127,0.25)',  dot: '#0ec97f' },
      delivered: { label: 'تم التسليم',   color: '#0ec97f', bg: 'rgba(14,201,127,0.12)',  border: 'rgba(14,201,127,0.25)',  dot: '#0ec97f' },
      rejected:  { label: 'مرفوض',        color: '#f04870', bg: 'rgba(240,72,112,0.12)',  border: 'rgba(240,72,112,0.25)',  dot: '#f04870' },
    };
  } else {
    return {
      pending:   { label: 'قيد المراجعة', color: '#92400e', bg: '#fffbeb', border: '#fde68a', dot: '#f59e0b'  },
      accepted:  { label: 'مقبول',        color: '#065f46', bg: '#ecfdf5', border: '#6ee7b7', dot: '#10b981' },
      delivered: { label: 'تم التسليم',   color: '#065f46', bg: '#ecfdf5', border: '#6ee7b7', dot: '#10b981' },
      rejected:  { label: 'مرفوض',        color: '#991b1b', bg: '#fef2f2', border: '#fca5a5', dot: '#ef4444' },
    };
  }
};

// ✅ المفاتيح هي نفس القيم المُرسلة من الفورم (عربي) وليست الإنجليزية
const CONDITION_LABELS: Record<string, string> = {
  جديدة: 'جديدة', ممتازة: 'ممتازة', جيدة: 'جيدة', مقبولة: 'مقبولة',
  // legacy English keys (للتوافق مع البيانات القديمة)
  new: 'جديدة', good: 'جيدة', excellent: 'ممتازة', acceptable: 'مقبولة',
};

/* ─── Premium Dynamic Tooltips ─── */
const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const { name, value, color } = payload[0].payload;
  return (
    <div className="ud-chart-tooltip">
      <span className="ud-tooltip-dot" style={{ background: color }} />
      <strong>{name}</strong>: <span className="ud-tooltip-val">{value} تبرع</span>
    </div>
  );
};

const BarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="ud-chart-tooltip">
      <div className="ud-tooltip-label">{label}</div>
      <div className="ud-tooltip-val" style={{ color: 'var(--success)' }}>
        {payload[0].value} تبرع
      </div>
    </div>
  );
};

const OverviewTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  return (
    <div style={{
      background: 'var(--surface, #1a1f2e)',
      border: `1.5px solid var(--teal, #0ec97f)`,
      borderRadius: '12px',
      padding: '12px 16px',
      color: 'var(--t1, #f1f5f9)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      backdropFilter: 'blur(12px)',
      fontFamily: "'Tajawal', sans-serif",
      fontSize: '13px',
      direction: 'rtl',
      textAlign: 'right',
      minWidth: '130px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 900 }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--teal, #0ec97f)', display: 'inline-block', flexShrink: 0 }} />
        <span style={{ color: 'var(--t1)' }}>التبرعات:</span>
      </div>
      <div style={{ marginTop: '6px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
        <span style={{ color: 'var(--teal, #0ec97f)', fontWeight: 900, fontSize: '16px' }}>{val}</span>
        <span style={{ color: 'var(--t2, #475569)', fontSize: '11px' }}>تبرع</span>
      </div>
    </div>
  );
};

const DonationTypesTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: 'rgba(10, 14, 26, 0.95)',
      border: '2.5px solid rgba(59, 130, 246, 0.75)',
      borderRadius: '16px',
      padding: '16px 20px',
      color: '#fff',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(12px)',
      fontFamily: "'Tajawal', sans-serif",
      fontSize: '13px',
      minWidth: '180px',
      direction: 'rtl',
      textAlign: 'right',
    }}>
      <div style={{ 
        fontWeight: 800, 
        marginBottom: '12px', 
        color: '#fff', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.15)', 
        paddingBottom: '8px', 
        fontSize: '14px',
        textAlign: 'center'
      }}>
        الفئة: {label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {payload.map((item: any) => {
          const color = item.name === 'معلق' ? '#f59e0b' : item.name === 'مقبول' ? '#0ec97f' : '#f04370';
          return (
            <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
              <span style={{ fontWeight: 800, color, fontSize: '15px' }}>{item.value} تبرع</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'rgba(255, 255, 255, 0.85)', fontWeight: 700 }}>{item.name}:</span>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─── Sidebar Clock ─── */
const SidebarClock = memo(function SidebarClock() {
  const [clock, setClock] = useState(() =>
    new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })
  );
  useEffect(() => {
    const id = setInterval(() =>
      setClock(new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })),
      30000
    );
    return () => clearInterval(id);
  }, []);
  return <span className="ap-live-time">{clock}</span>;
});



/* ─── Collapsible Sidebar ─── */
function Sidebar({ activeTab, onTabChange, userName, collapsed, onToggle, onLogout }: {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  userName: string;
  collapsed: boolean;
  onToggle: () => void;
  onLogout: () => void;
}) {
  const NAV_ITEMS = [
    { id: 'stats',         label: 'نظرة عامة',    icon: 'ti-layout-dashboard' },
    { id: 'donations',     label: 'تبرعاتي',      icon: 'ti-clipboard-list'   },
    { id: 'add-donation',  label: 'إضافة تبرع',   icon: 'ti-circle-plus'      },
    { id: 'chat',          label: 'مساعد عطاء',   icon: 'ti-brain'            },
    { id: 'settings',      label: 'الإعدادات',    icon: 'ti-settings'         },
  ];

  return (
    <aside className={`ap-sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="ap-sidebar-brand">
        <div className="ap-brand-icon"><i className="ti ti-layout-grid" /></div>
        {!collapsed && <span className="ap-brand-title">لوحة المستخدم</span>}
        <button className="ap-collapse-btn" onClick={onToggle} title={collapsed ? 'توسيع' : 'طي'}>
          <i className={`ti ${collapsed ? 'ti-layout-sidebar-right-expand' : 'ti-layout-sidebar-right-collapse'}`} />
        </button>
      </div>
      <nav className="ap-sidebar-nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`ap-nav-item${activeTab === item.id ? ' active' : ''}`}
            onClick={() => onTabChange(item.id as DashboardTab)}
            title={collapsed ? item.label : undefined}
          >
            <span className="ap-nav-icon-wrap">
              <i className={`ti ${item.icon}`} />
            </span>
            {!collapsed && <span className="ap-nav-label">{item.label}</span>}
            {!collapsed && activeTab === item.id && <span className="ap-nav-active-bar" />}
          </button>
        ))}
      </nav>

      <div className="ap-sidebar-footer">
        {!collapsed && (
          <div className="ap-sidebar-user" onClick={() => onTabChange('settings')} title="الإعدادات">
            <div className="ap-user-avatar">{userName?.slice(0, 1)?.toUpperCase()}</div>
            <div className="ap-user-meta">
              <span className="ap-user-name">{userName}</span>
            </div>
            <i className="ti ti-settings" style={{ fontSize: 14, color: 'var(--t4)' }} />
          </div>
        )}
        {collapsed && (
          <button className="ap-nav-item" onClick={() => onTabChange('settings')} title="الإعدادات" style={{ justifyContent: 'center', padding: '10px 0' }}>
            <span className="ap-nav-icon-wrap"><i className="ti ti-settings" /></span>
          </button>
        )}
        <button className="ap-sidebar-logout" onClick={onLogout} title="تسجيل الخروج">
          <i className="ti ti-logout" />
          {!collapsed && <span>خروج</span>}
        </button>
      </div>
    </aside>
  );
}

/* ─── Mobile Bottom Navigation ─── */
function MobileNav({ activeTab, onTabChange }: {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}) {
  const NAV_ITEMS = [
    { id: 'stats',        icon: 'ti-layout-dashboard', label: 'الرئيسية' },
    { id: 'donations',    icon: 'ti-clipboard-list',   label: 'تبرعاتي' },
    { id: 'add-donation', icon: 'ti-plus',             label: 'تبرع جديد' },
    { id: 'chat',         icon: 'ti-brain',            label: 'مساعد'   },
    { id: 'settings',     icon: 'ti-settings',         label: 'إعدادات' },
  ];

  return (
    <nav className="ap-mobile-nav">
      {NAV_ITEMS.map(item => (
        <button
          key={item.id}
          className={`ap-mobile-nav-item${activeTab === item.id ? ' active' : ''}`}
          onClick={() => onTabChange(item.id as DashboardTab)}
        >
          <span className="ap-nav-icon-wrap">
            <i className={`ti ${item.icon}`} />
          </span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

/* ─── Premium Custom Confirmation Modal ─── */
function ConfirmModal({ opts, loading, onClose }: {
  opts: ConfirmState | null;
  loading: boolean;
  onClose: () => void;
}) {
  if (!opts) return null;
  const isDanger = opts.variant !== 'ok';
  const confirmBg = isDanger ? '#ef4444' : '#0ec97f';
  return (
    <div className="ap-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }} style={{ zIndex: 9999 }}>
      <div className="ap-modal">
        <div className="ap-modal-inner">
          <div className="ap-modal-icon" style={{ background: confirmBg + '22' }}>
            <i className={`ti ${opts.icon ?? (isDanger ? 'ti-trash' : 'ti-check')}`} style={{ color: confirmBg }} />
          </div>
          <h3 className="ap-modal-title">{opts.title}</h3>
          <p className="ap-modal-msg">{opts.message}</p>
          <div className="ap-modal-actions">
            <button className="ap-modal-cancel" onClick={onClose} disabled={loading}>إلغاء</button>
            <button
              className="ap-modal-confirm"
              disabled={loading}
              style={{ background: confirmBg }}
              onClick={opts.onConfirm}
            >
              {loading && <i className="ti ti-loader-2 ti-spin" style={{ marginRight: 6 }} />}
              {opts.confirmLabel ?? 'تأكيد'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Main UserDashboard Component
   ═══════════════════════════════════════════════════════════════ */
export default function UserDashboard(): JSX.Element | null {
  const { user, isLoading: authLoading, logout, refreshUser } = useAuth();
  const [, setLocation] = useLocation();

  const [isRefreshing, setIsRefreshing]     = useState(false);
  const [donations, setDonations]           = useState<Donation[]>([]);
  const [loading, setLoading]               = useState(true);
  const [fetchError, setFetchError]         = useState<string | null>(null);
  const [ratingDonation, setRatingDonation] = useState<Donation | null>(null);
  const [ratedIds, setRatedIds]             = useState<Set<string>>(new Set());
  const [allCharities, setAllCharities]     = useState<Charity[]>([]);
  const [dbTotalDonations, setDbTotalDonations] = useState<number>(0);
  const [allDonationsForStats, setAllDonationsForStats] = useState<Donation[]>([]);
  const [statsLoading, setStatsLoading]               = useState(false);
  const [loadedRatings, setLoadedRatings]   = useState<Map<string, any>>(new Map());
  const [viewingRating, setViewingRating]   = useState<any | null>(null);
  const [showReport, setShowReport]         = useState(false);
  const [reportText, setReportText]         = useState('');
  const [reportLoading, setReportLoading]   = useState(false);
  const [reportMsg, setReportMsg]           = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab]           = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [searchQ, setSearchQ]               = useState('');

  /* ── Enhanced Donations Tab Sorting & Filtering ── */
  const [donView, setDonView]               = useState<'table' | 'cards'>('cards');
  const [dateFrom, setDateFrom]             = useState('');
  const [dateTo, setDateTo]                 = useState('');
  const [sortOrder, setSortOrder]           = useState<'newest' | 'oldest'>('newest');
  const [donPage, setDonPage]               = useState(1);
  const DON_PER_PAGE = 10;

  // Reset to page 1 when filters change
  useEffect(() => { setDonPage(1); }, [searchQ, activeTab, dateFrom, dateTo, sortOrder]);

  // Fetch new page from server when donPage changes (only when no active filters)
  const handleDonPageChange = (newPage: number) => {
    setDonPage(newPage);
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ── Settings Tab Custom Form Handling ── */
  const [settingsTab, setSettingsTab]       = useState<'profile' | 'password' | 'license' | 'danger'>('profile');
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [profileForm, setProfileForm]       = useState({ userName: '', phone: '', address: '' });
  const [passForm, setPassForm]             = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [profileErrors, setProfileErrors]   = useState<Record<string, string>>({});
  const [passErrors, setPassErrors]         = useState<Record<string, string>>({});
  const [formGlobalError, setFormGlobalError] = useState<string>('');
  const [formSaving, setFormSaving]         = useState<boolean>(false);
  const [formStep, setFormStep]             = useState<number>(1);
  const [formSuccess, setFormSuccess]       = useState<boolean>(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [toast, setToast]                   = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showOldPass, setShowOldPass]       = useState(false);
  const [showNewPass, setShowNewPass]       = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  /* ── Premium Custom Confirmation Dialogs ── */
  const [confirmOpts, setConfirmOpts]       = useState<ConfirmState | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  /* العرض الفرعي التفاعلي لتبويب التبرعات لفتح الاستمارة بداخل لوحة التحكم مباشرة */
  const [donSubView, setDonSubView]         = useState<'list' | 'add'>('list');

  /* ── State for Add Donation Visual Wizard ── */
  const [formType, setFormType]             = useState<string>('');
  const [formSize, setFormSize]             = useState<string>('');
  const [formQuantity, setFormQuantity]     = useState<number>(1);
  const [formCondition, setFormCondition]   = useState<string>('');
  const [formNotes, setFormNotes]           = useState<string>('');
  const [formImages, setFormImages]         = useState<ImageItem[]>([]);
  const [formDragOver, setFormDragOver]     = useState<boolean>(false);
  const [formTouched, setFormTouched]       = useState<Record<string, boolean>>({});

  const showToast = useCallback((type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const resetAddDonationForm = useCallback(() => {
    formImages.forEach(i => URL.revokeObjectURL(i.url));
    setFormImages([]);
    setFormType('');
    setFormSize('');
    setFormQuantity(1);
    setFormCondition('');
    setFormNotes('');
    setFormTouched({});
    setFormGlobalError('');
    setFormStep(1);
    setFormSuccess(false);
    try {
      localStorage.removeItem('ap_donation_draft');
    } catch {}
  }, [formImages]);

  // Auto-save draft logic
  useEffect(() => {
    if (donSubView === 'add') {
      const draft = { formType, formSize, formQuantity, formCondition, formNotes };
      localStorage.setItem('ap_donation_draft', JSON.stringify(draft));
    }
  }, [formType, formSize, formQuantity, formCondition, formNotes, donSubView]);

  // Restore draft on mount or when going to "add" view
  useEffect(() => {
    if (donSubView === 'add') {
      try {
        const savedDraft = localStorage.getItem('ap_donation_draft');
        if (savedDraft) {
          const draft = JSON.parse(savedDraft);
          if (draft.formType) setFormType(draft.formType);
          if (draft.formSize) setFormSize(draft.formSize);
          if (draft.formQuantity) setFormQuantity(Number(draft.formQuantity) || 1);
          if (draft.formCondition) setFormCondition(draft.formCondition);
          if (draft.formNotes) setFormNotes(draft.formNotes);
        }
      } catch (e) {
        console.warn('Failed to restore donation draft:', e);
      }
    }
  }, [donSubView]);

  /* Synchronize forms on load */
  useEffect(() => {
    if (user) {
      setProfileForm({
        userName: user.userName || user.name || '',
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  }, [user]);

  /* ── Sidebar & Layout tabs logic ── */
  const [tab, setTab] = useState<DashboardTab>('stats');

  const handleTabChange = (t: DashboardTab) => {
    if (t === 'add-donation') {
      setTab('donations');
      setDonSubView('add');
    } else {
      setTab(t);
    }
  };
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('ap-sidebar-collapsed') === 'true';
    } catch {
      return false;
    }
  });

  /* ── Theme mode logic (Dynamic syncing) ── */
  const [isDark, setIsDark] = useState(() => {
    try {
      return (localStorage.getItem('ap-theme') || 'dark') === 'dark';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ap-theme', isDark ? 'dark' : 'light');
      document.body.classList.toggle('ap-light-theme', !isDark);
    } catch {}
    return () => {
      document.body.classList.remove('ap-light-theme');
    };
  }, [isDark]);

  /* التوجيه الذكي عند فتح صفحة التبرع من الخارج */
  useEffect(() => {
    if (window.location.search.includes('action=donate')) {
      setTab('donations');
      setDonSubView('add');
      try {
        window.history.replaceState({}, '', window.location.pathname);
      } catch {}
    }
  }, []);

  /* ── Notifications Logic ── */
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  const fetchNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      const res = await notificationApi.getAll() as any;
      const notifs: Notification[] = res?.notifications || res?.data?.Data || res?.data || [];
      setNotifications(notifs.sort((a: Notification, b: Notification) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch { /* silent fail */ } finally { setNotifLoading(false); }
  }, []);

  const handleMarkRead = useCallback(async (id: string) => {
    try {
      await notificationApi.markRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, status: 'read' as const } : n));
    } catch { /* ignore */ }
  }, []);

  const handleMarkAllRead = useCallback(async () => {
    const unread = notifications.filter(n => n.status === 'unread');
    if (unread.length === 0) return;
    setNotifications(prev => prev.map(n => ({ ...n, status: 'read' as const })));
    try {
      await (notificationApi as any).markAllRead();
    } catch {
      try {
        await Promise.allSettled(unread.map(n => notificationApi.markRead(n._id)));
      } catch { /* ignore */ }
    }
  }, [notifications]);

  const handleDeleteNotif = useCallback(async (id: string) => {
    try {
      await notificationApi.delete(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch { /* ignore */ }
  }, []);

  const fetchCharities = useCallback(async () => {
    try {
      const res = await charityApi.getAll();
      const list = res.charities || res.result?.Data || res.result || [];
      if (Array.isArray(list)) {
        // Fetch detailed information in parallel for all charities to retrieve their `userId` field!
        const detailedList = await Promise.all(
          list.map(async (c: any) => {
            try {
              const detailRes = await charityApi.getById(c._id);
              if (detailRes.success && detailRes.charity) {
                return detailRes.charity;
              }
            } catch (err) {
              console.warn(`Failed to fetch details for charity ${c._id}:`, err);
            }
            return c;
          })
        );
        setAllCharities(detailedList);
      } else {
        setAllCharities([]);
      }
    } catch (e) {
      console.warn('Failed to fetch charities:', e);
    }
  }, []);

  const checkEvaluations = async (acceptedDonations: Donation[]) => {
    const ids = new Set<string>();
    const map = new Map<string, any>();
    await Promise.allSettled(
      acceptedDonations.map(async (d) => {
        try {
          const res = await ratingApi.get(d._id) as any;
          const evals = res.evaluations || res.data?.evaluations || [];
          if (evals && evals.length > 0) {
            ids.add(d._id);
            map.set(d._id, evals[0]);
          }
        } catch (e) {
          // not rated
        }
      })
    );
    setRatedIds(ids);
    setLoadedRatings(map);
  };

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await Promise.allSettled([fetchDonations(), fetchAllDonationsForStats(), fetchNotifications(), fetchCharities()]);
    } catch {
      // ignore
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  }, [isRefreshing, fetchNotifications, fetchCharities]);

  /* ── Fetch ALL donations once — used for stats/charts only ── */
  const fetchAllDonationsForStats = useCallback(async () => {
    // Unified: all data is already loaded in fetchDonations, no action needed here
  }, []);

  /* ── Fetch Donations list — server-side pagination ── */
  const fetchDonations = async () => {
    try {
      setLoading(true);
      const res = await donorApi.getMyDonations() as any;
      console.log('Donor donations API response:', res);
      const list = res.donations || res.Data || res.data?.Data || res.data || [];
      const donationsList = Array.isArray(list) ? list : [];
      setDonations(donationsList);
      setAllDonationsForStats(donationsList);
      setDbTotalDonations(donationsList.length);
      setFetchError(null);

      // Fetch evaluation status for all accepted donations
      const accepted = donationsList.filter((d: any) => d.status === 'accepted');
      if (accepted.length > 0) {
        checkEvaluations(accepted);
      }
    } catch {
      setFetchError('فشل تحميل التبرعات، تحقق من اتصالك بالإنترنت');
      setDonations([]);
      setAllDonationsForStats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchDonations();
      fetchAllDonationsForStats();
      fetchNotifications();
      fetchCharities();
      const id = setInterval(fetchNotifications, 60_000);
      return () => clearInterval(id);
    }
  }, [user, authLoading, fetchNotifications, fetchCharities, fetchAllDonationsForStats]);

  /* ── Wizard Image Handling Functions ── */
  const addFormFiles = (files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024);
    if (arr.length === 0) {
      setFormGlobalError('اختر صور PNG/JPG بحجم أقل من 5MB');
      return;
    }
    const space = 5 - formImages.length;
    if (space <= 0) {
      setFormGlobalError('الحد الأقصى 5 صور');
      return;
    }
    const allowed = arr.slice(0, space);
    const items = allowed.map(f => ({
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      file: f,
      url: URL.createObjectURL(f),
    }));
    setFormImages(prev => [...prev, ...items]);
    setFormGlobalError('');
  };

  const removeFormImage = (id: string) => {
    setFormImages(prev => {
      const found = prev.find(p => p.id === id);
      if (found) URL.revokeObjectURL(found.url);
      return prev.filter(p => p.id !== id);
    });
  };

  /* ── Wizard Validations ── */
  const errors = useMemo(() => ({
    type: !formType ? 'يرجى اختيار نوع قطع التبرع' : '',
    size: !formSize ? 'يرجى اختيار المقاس' : '',
    condition: !formCondition ? 'يرجى اختيار حالة التبرع' : '',
    quantity: formQuantity < 1 ? 'الكمية لا يمكن أن تكون أقل من 1' : '',
    images: formImages.length === 0 ? 'يرجى إضافة صورة واحدة على الأقل لتوضيح حالة القطعة' : '',
  }), [formType, formSize, formCondition, formQuantity, formImages.length]);

  /* ── القيم المقبولة من الباك إند للتحقق قبل الإرسال ── */
  const VALID_TYPES_UD      = ['رجالي', 'حريمي', 'أطفال'];
  const VALID_SIZES_UD      = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL'];
  const VALID_CONDITIONS_UD = ['جديدة', 'ممتازة', 'جيدة', 'مقبولة'];

  /* ── Submit Donation request via Visual Wizard ── */
  const submitDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormTouched({ type: true, size: true, condition: true, quantity: true, images: true });

    const safeQty = Math.max(1, Math.min(99, Number(formQuantity) || 1));

    // التحقق من الصور
    if (formImages.length === 0) {
      setFormGlobalError('❌ يرجى إضافة صورة واحدة على الأقل لتوضيح حالة القطعة');
      return;
    }
    // التحقق من كل حقل على حدة
    if (!formType) {
      setFormGlobalError('❌ يرجى اختيار نوع قطع التبرع (رجالي / حريمي / أطفال)');
      setFormStep(1);
      return;
    }
    if (!formSize) {
      setFormGlobalError('❌ يرجى اختيار مقاس قطع التبرع');
      setFormStep(1);
      return;
    }
    if (!formCondition) {
      setFormGlobalError('❌ يرجى تحديد حالة التبرع (جديدة / ممتازة / جيدة / مقبولة)');
      setFormStep(3);
      return;
    }
    // التحقق من صحة القيم مع ما يقبله الباك إند
    if (!VALID_TYPES_UD.includes(formType)) {
      setFormGlobalError(`❌ نوع التبرع "${formType}" غير مقبول. المقبول: رجالي، حريمي، أطفال`);
      setFormStep(1);
      return;
    }
    if (!VALID_SIZES_UD.includes(formSize)) {
      setFormGlobalError(`❌ المقاس "${formSize}" غير مقبول. المقاسات: XS, S, M, L, XL, XXL, 3XL, 4XL, 5XL`);
      setFormStep(1);
      return;
    }
    if (!VALID_CONDITIONS_UD.includes(formCondition)) {
      setFormGlobalError(`❌ حالة التبرع "${formCondition}" غير مقبولة. المقبول: جديدة، ممتازة، جيدة، مقبولة`);
      setFormStep(3);
      return;
    }

    setFormSaving(true);
    setFormGlobalError('');
    try {
      const fd = new FormData();
      fd.append('type',      formType.trim());
      fd.append('size',      formSize.trim());
      fd.append('quantity',  String(safeQty));
      fd.append('condition', formCondition.trim());
      if (formNotes.trim()) fd.append('description', formNotes.trim());
      formImages.forEach(it => fd.append('images', it.file, it.file.name));

      // Debug log — يظهر في Developer Console (F12)
      console.log('📦 FormData → POST /donor (UserDashboard)');
      console.log('  type      :', formType);
      console.log('  size      :', formSize);
      console.log('  quantity  :', safeQty);
      console.log('  condition :', formCondition);
      console.log('  images    :', formImages.length, 'ملف');

      await donorApi.create(fd);

      try {
        localStorage.removeItem('ap_donation_draft');
      } catch {}

      setFormSuccess(true);
      fetchDonations();
      fetchAllDonationsForStats();
      showToast('success', 'تم تقديم طلب تبرعك بنجاح وجاري مراجعته الآن ✓');
    } catch (err: any) {
      console.error('❌ Donation submit error (UserDashboard):', err);
      setFormGlobalError(`❌ ${translateError(err)}`);
    } finally {
      setFormSaving(false);
    }
  };

  /* Clean up Object URLs on unmount */
  useEffect(() => {
    return () => {
      formImages.forEach(i => URL.revokeObjectURL(i.url));
    };
  }, [formImages]);

  // ── Settings Form Validations ──
  const validateProfile = (): boolean => {
    const errs: Record<string, string> = {};
    if (!nameRegex.test(profileForm.userName)) {
      errs.userName = 'الاسم: يبدأ بحرف، 3-30 حرف، بدون رموز خاصة';
    }
    if (profileForm.phone && !phoneRegex.test(profileForm.phone)) {
      errs.phone = 'رقم غير صالح — أدخل رقماً مصرياً صحيحاً (مثال: 01012345678)';
    }
    if (profileForm.address && (profileForm.address.length < 5 || profileForm.address.length > 100)) {
      errs.address = 'العنوان يجب أن يكون بين 5 و 100 حرف';
    }
    setProfileErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validatePassword = (): boolean => {
    const errs: Record<string, string> = {};
    if (!passForm.oldPassword) {
      errs.oldPassword = 'كلمة المرور الحالية مطلوبة';
    }
    if (!passwordRegex.test(passForm.newPassword)) {
      errs.newPassword = 'يجب أن تحتوي على: حرف كبير، حرف صغير، رقم، و8 أحرف على الأقل';
    }
    if (passForm.newPassword !== passForm.confirmPassword) {
      errs.confirmPassword = 'كلمتا المرور غير متطابقتين';
    }
    setPassErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ── Settings Form Handlers ── */
  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProfile()) return;
    setSettingsSaving(true);
    try {
      await usersApi.updateProfile(profileForm);
      await refreshUser();
      showToast('success', 'تم تحديث ملفك الشخصي بنجاح ✓');
    } catch (err: any) {
      showToast('error', translateError(err));
    } finally {
      setSettingsSaving(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword()) return;
    setSettingsSaving(true);
    try {
      await usersApi.changePassword(passForm);
      setPassForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      showToast('success', 'تم تغيير كلمة المرور بنجاح ✓');
    } catch (err: any) {
      showToast('error', translateError(err));
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    setConfirmOpts({
      title: 'حذف الحساب نهائيًا',
      message: 'هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بياناتك وتبرعاتك بشكل كامل ودائم من المنصة.',
      confirmLabel: 'حذف حسابي نهائيًا',
      variant: 'danger',
      icon: 'ti-trash',
      onConfirm: async () => {
        setConfirmLoading(true);
        try {
          await usersApi.deleteAccount();
          logout();
          setLocation('/');
        } catch (err: any) {
          showToast('error', translateError(err));
        } finally {
          setConfirmLoading(false);
          setConfirmOpts(null);
        }
      }
    });
  };

  const handleLogoutConfirm = () => {
    setConfirmOpts({
      title: 'تسجيل الخروج',
      message: 'هل أنت متأكد من تسجيل الخروج؟ سيتم إنهاء جلستك الحالية.',
      confirmLabel: 'تسجيل الخروج',
      variant: 'danger',
      icon: 'ti-logout',
      onConfirm: async () => {
        setConfirmLoading(true);
        try {
          logout();
          setLocation('/');
        } finally {
          setConfirmLoading(false);
          setConfirmOpts(null);
        }
      }
    });
  };

  const handleRatingSuccess = (id: string) => {
    setRatedIds(p => new Set([...p, id]));
    setRatingDonation(null);
    fetchDonations();
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reportText.trim().length < 10) {
      setReportMsg({ type: 'error', text: 'يجب كتابة 10 أحرف على الأقل' });
      return;
    }
    setReportLoading(true);
    setReportMsg(null);
    try {
      await reportApi.create({ description: reportText.trim() });
      setReportMsg({ type: 'success', text: 'تم إرسال البلاغ بنجاح، سيتم مراجعته قريباً' });
      setReportText('');
      setTimeout(() => { setShowReport(false); setReportMsg(null); }, 2400);
    } catch (err: unknown) {
      setReportMsg({ type: 'error', text: err instanceof Error ? err.message : 'حدث خطأ، حاول مرة أخرى' });
    } finally {
      setReportLoading(false);
    }
  };

  const getCharityName = (d: Donation): string => {
    if (!d.charityId) return 'غير محدد';
    if (typeof d.charityId === 'object' && 'charityName' in d.charityId)
      return (d.charityId as { charityName: string }).charityName;
    const charityIdStr = typeof d.charityId === 'string' ? d.charityId : (d.charityId as any)?._id;
    if (!charityIdStr) return 'غير محدد';
    const charity = allCharities.find(c => c._id === charityIdStr || ((c as any).userId && (typeof (c as any).userId === 'string' ? (c as any).userId : (c as any).userId._id) === charityIdStr));
    return charity ? charity.charityName : 'غير محدد';
  };

  const stats = useMemo(() => {
    return {
      total:    dbTotalDonations || allDonationsForStats.length,
      pending:  allDonationsForStats.filter(d => (d.status || '').toLowerCase() === 'pending').length,
      accepted: allDonationsForStats.filter(d => {
        const s = (d.status || '').toLowerCase();
        return s === 'accepted' || s === 'delivered' || s === 'completed';
      }).length,
      rejected: allDonationsForStats.filter(d => (d.status || '').toLowerCase() === 'rejected').length,
    };
  }, [allDonationsForStats, dbTotalDonations]);

  const pieData = useMemo(() => {
    return [
      { name: 'قيد المراجعة', value: stats.pending,  color: '#f59e0b' },
      { name: 'مقبول',        value: stats.accepted, color: '#10b981' },
      { name: 'مرفوض',        value: stats.rejected, color: '#ef4444' },
    ].filter(d => d.value > 0);
  }, [stats]);

  const barData = useMemo(() => {
    const typeMap: Record<string, number> = {};
    allDonationsForStats.forEach(d => {
      const key = d.type?.trim() || 'غير محدد';
      typeMap[key] = (typeMap[key] || 0) + 1;
    });
    return Object.entries(typeMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [allDonationsForStats]);

  const timelineData = useMemo(() => {
    const months: { year: number; month: number; label: string }[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        year: d.getFullYear(),
        month: d.getMonth(),
        label: `${MONTHS_AR[d.getMonth()]}`,
      });
    }
    return months.map(({ year, month, label }) => {
      const count = allDonationsForStats.filter(d => {
        if (!d.createdAt) return false;
        const dt = new Date(d.createdAt);
        return !isNaN(dt.getTime()) && dt.getFullYear() === year && dt.getMonth() === month;
      }).length;
      return { month: label, count };
    });
  }, [allDonationsForStats]);

  const stackedData = useMemo(() => {
    const map: Record<string, { name: string; pending: number; accepted: number; rejected: number }> = {};
    allDonationsForStats.forEach(d => {
      const k = d.type?.trim() || 'غير محدد';
      if (!map[k]) {
        map[k] = { name: k, pending: 0, accepted: 0, rejected: 0 };
      }
      const status = (d.status || '').toLowerCase();
      if (status === 'accepted' || status === 'delivered' || status === 'completed') {
        map[k].accepted++;
      } else if (status === 'rejected') {
        map[k].rejected++;
      } else {
        map[k].pending++;
      }
    });
    return Object.values(map).slice(0, 6);
  }, [allDonationsForStats]);

  const filteredAndSorted = donations.filter(d => {
    const matchTab    = activeTab === 'all' || d.status === activeTab;
    const q           = searchQ.trim().toLowerCase();
    const matchSearch = !q || (d.type && d.type.toLowerCase().includes(q)) || getCharityName(d).toLowerCase().includes(q);
    
    let matchDate = true;
    if (dateFrom) {
      matchDate = matchDate && new Date(d.createdAt) >= new Date(dateFrom);
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      matchDate = matchDate && new Date(d.createdAt) <= toDate;
    }
    
    return matchTab && matchSearch && matchDate;
  }).sort((a, b) => {
    const tA = new Date(a.createdAt).getTime();
    const tB = new Date(b.createdAt).getTime();
    return sortOrder === 'newest' ? tB - tA : tA - tB;
  });

  // All pagination, sorting, and filtering is performed entirely on the client side
  const effectiveTotal = filteredAndSorted.length;
  const donTotalPages = Math.max(1, Math.ceil(effectiveTotal / DON_PER_PAGE));
  const donStart = (donPage - 1) * DON_PER_PAGE;
  const donEnd = donStart + DON_PER_PAGE;
  const paginatedDonations = filteredAndSorted.slice(donStart, donEnd);

  // Safe boundary adjustment to prevent out of bounds paging
  useEffect(() => {
    if (donPage > donTotalPages) {
      setDonPage(donTotalPages || 1);
    }
  }, [donPage, donTotalPages]);

  const today = new Date().toLocaleDateString('ar-EG', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const userInitial = user?.userName?.[0]?.toUpperCase() ?? 'م';
  const userName    = user?.userName || user?.name || 'المستخدم';

  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : '#eef2f7';
  const tickColor = isDark ? '#647da0' : '#94a3b8';

  const getBreadcrumbTitle = () => {
    const maps: Record<DashboardTab, string> = {
      stats: 'نظرة عامة',
      donations: 'تبرعاتي',
      'add-donation': 'إضافة تبرع',
      chat: 'مساعد عطاء',
      settings: 'الإعدادات',
    };
    return maps[tab];
  };

  const activePreset =
    formQuantity === 1 ? '1' :
    formQuantity === 3 ? '3' :
    formQuantity === 5 ? '5' :
    formQuantity === 10 ? '10' : 'custom';

  const stepValidated =
    formStep === 1 ? !!(formType && formSize) :
    formStep === 2 ? (formQuantity >= 1) :
    formStep === 3 ? !!formCondition :
    formStep === 4 ? (formImages.length >= 1) : false;

  const handleFormNext = () => {
    if (formStep === 1) setFormTouched(t => ({ ...t, type: true, size: true }));
    if (formStep === 2) setFormTouched(t => ({ ...t, quantity: true }));
    if (formStep === 3) setFormTouched(t => ({ ...t, condition: true }));
    
    if (stepValidated) {
      setFormStep(s => Math.min(4, s + 1));
      setFormGlobalError('');
    } else {
      setFormGlobalError('يرجى تعبئة الحقول المطلوبة للانتقال للخطوة التالية');
    }
  };

  const handleFormPrev = () => {
    setFormStep(s => Math.max(1, s - 1));
    setFormGlobalError('');
  };

  if (authLoading) return <PageLoader text="جاري تحميل بياناتك…" />;
  if (!user) return null;

  return (
    <>
      <div className={`ap-layout${isDark ? '' : ' ap-light-theme'}`} dir="rtl">
        {/* Sidebar */}
        <Sidebar
          activeTab={tab}
          onTabChange={handleTabChange}
          userName={userName}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(v => { localStorage.setItem('ap-sidebar-collapsed', String(!v)); return !v; })}
          onLogout={handleLogoutConfirm}
        />

        {/* ── Main Content Container ── */}
        <main className={`ap-main${tab === 'chat' ? ' ap-main--ai' : ''}`}>
          
          {/* Header Topbar */}
          <header className="ap-page-header">
            <div className="ap-page-breadcrumb">
              <span className="ap-breadcrumb-link" onClick={() => setTab('stats')}>لوحة التحكم</span>
              <i className="ti ti-chevron-left" style={{ fontSize: 10, opacity: 0.6 }} />
              <span style={{ fontWeight: 800, color: 'var(--t1)' }}>{getBreadcrumbTitle()}</span>
            </div>

            <div className="ap-page-header-right">
              {/* Report Issue */}
              <button
                className="ap-header-icon-btn"
                onClick={() => setShowReport(true)}
                title="الإبلاغ عن مشكلة"
                style={{ color: 'var(--red, #ef4444)' }}
              >
                <i className="ti ti-alert-octagon" />
              </button>

              {/* Refresh Data */}
              <button
                className="ap-header-icon-btn"
                onClick={handleRefresh}
                title="تحديث البيانات"
                disabled={isRefreshing}
              >
                <i className={`ti ti-refresh${isRefreshing ? ' ti-spin' : ''}`} />
              </button>

              {/* Theme Toggle */}
              <button
                className="ap-header-icon-btn ap-theme-btn"
                onClick={() => setIsDark(v => !v)}
                title={isDark ? 'تفعيل المظهر الفاتح' : 'تفعيل المظهر الداكن'}
              >
                <i className={`ti ${isDark ? 'ti-sun' : 'ti-moon'}`} />
              </button>

              {/* Notification Bell */}
              <NotificationBell
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkRead={handleMarkRead}
                onMarkAllRead={handleMarkAllRead}
                onDelete={handleDeleteNotif}
                loading={notifLoading}
              />

              {/* User Avatar */}
              <div
                className="ap-header-user"
                onClick={() => setTab('settings')}
                title="الملف الشخصي"
              >
                <div className="ap-header-avatar">{userInitial}</div>
                <span className="ap-header-username-text" style={{ fontSize: 12, fontWeight: 700 }}>{userName}</span>
              </div>
            </div>
          </header>

          {/* Scrollable Tabpane */}
          <div ref={contentRef} className={`ap-content${tab === 'chat' ? ' ap-content--ai' : ''}`}>

            {/* ━━━━━━━━━━ 1. OVERVIEW TAB (stats) ━━━━━━━━━━ */}
            {tab === 'stats' && <div className="ap-tab-pane ap-tab-pane--stats">
              <div className="ap-section-header">
                <div className="ap-section-title">
                  <i className="ti ti-layout-dashboard" style={{ color: 'var(--teal)' }} />
                  نظرة عامة
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <i className="ti ti-calendar" /> {today}
                </div>
              </div>

              {/* KPI cards Grid */}
              <div className="ap-kpi-grid">
                {loading ? (
                  [1, 2, 3, 4].map(i => (
                    <div key={i} className="ap-kpi-card">
                      <div className="ap-skel" style={{ width: 36, height: 36, borderRadius: 10, marginBottom: 14 }} />
                      <div className="ap-skel" style={{ height: 28, width: 70, marginBottom: 8 }} />
                      <div className="ap-skel" style={{ height: 12, width: 100 }} />
                    </div>
                  ))
                ) : (
                  [
                    { label: 'إجمالي التبرعات', val: stats.total,    icon: 'ti-packages',     color: 'var(--teal)' },
                    { label: 'قيد المراجعة',    val: stats.pending,  icon: 'ti-clock',        color: '#f59e0b'     },
                    { label: 'مقبولة',           val: stats.accepted, icon: 'ti-circle-check', color: '#0ec97f'     },
                    { label: 'مرفوضة',           val: stats.rejected, icon: 'ti-circle-x',    color: '#f04870'     },
                  ].map(s => (
                    <div key={s.label} className="ap-kpi-card" style={{ '--kpi-color': s.color } as React.CSSProperties}>
                      <div className="ap-kpi-icon-wrap" style={{ background: `${s.color}14`, color: s.color }}>
                        <i className={`ti ${s.icon}`} />
                      </div>
                      <div className="ap-kpi-value">{formatNumber(s.val)}</div>
                      <div className="ap-kpi-label">{s.label}</div>
                    </div>
                  ))
                )}
              </div>

              {/* Analytics Charts Grid */}
              <div className="ap-dashboard-grid" style={{ gridTemplateColumns: '1fr 320px', gap: '16px', alignItems: 'start' }}>
                
                {/* Right Column: Timeline Area Chart + Donation Types Bar Chart */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
                  
                  {/* Pro area chart - التبرعات عبر الزمن */}
                  <div className="ap-pro-chart-card">
                    <div className="ap-pro-chart-header">
                      <div className="ap-pro-chart-meta">
                        <div className="ap-pro-chart-value">{formatNumber(stats.total)}</div>
                        <div className="ap-pro-chart-label">
                          <i className="ti ti-trending-up" style={{ color: '#0ec97f', marginLeft: 4 }} />
                          التبرعات عبر الزمن
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="ap-chart-trend up">
                          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                            <path d="M1 11 L5 4 L8 7 L12 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          مسيرة العطاء
                        </span>
                        <div className="ap-pro-chart-period">
                          <i className="ti ti-calendar" style={{ fontSize: 11 }} />
                          {new Date().getFullYear()}
                        </div>
                      </div>
                    </div>
                    <div className="ap-chart-stats-row">
                      <div className="ap-chart-stat-mini">
                        <div className="ap-chart-stat-mini-val" style={{ color: '#f59e0b' }}>
                          {formatNumber(stats.pending)}
                        </div>
                        <div className="ap-chart-stat-mini-lbl">معلقة</div>
                      </div>
                      <div className="ap-chart-stat-mini">
                        <div className="ap-chart-stat-mini-val" style={{ color: '#0ec97f' }}>
                          {formatNumber(stats.accepted)}
                        </div>
                        <div className="ap-chart-stat-mini-lbl">مقبولة</div>
                      </div>
                      <div className="ap-chart-stat-mini">
                        <div className="ap-chart-stat-mini-val" style={{ color: '#f04370' }}>
                          {formatNumber(stats.rejected)}
                        </div>
                        <div className="ap-chart-stat-mini-lbl">مرفوضة</div>
                      </div>
                    </div>
                    <div className="ap-pro-chart-legend">
                      <div className="ap-pro-legend-item">
                        <div className="ap-pro-legend-line" style={{ background: '#0ec97f' }}>
                          <div className="ap-pro-legend-dot" style={{ background: '#0ec97f' }} />
                        </div>
                        التبرعات الشهرية
                      </div>
                    </div>
                    
                    <div style={{ minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      {fetchError ? (
                        <div className="ap-error-fallback" style={{ textAlign: 'center', padding: '20px 10px' }}>
                          <i className="ti ti-alert-triangle" style={{ fontSize: 32, color: 'var(--red)', marginBottom: 8, display: 'block' }} />
                          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--t2)', marginBottom: 12 }}>{fetchError}</p>
                          <button onClick={fetchDonations} className="ap-empty-btn" style={{ padding: '6px 16px', fontSize: 12 }}>
                            إعادة المحاولة
                          </button>
                        </div>
                      ) : statsLoading ? (
                        <div className="ap-skel" style={{ width: '100%', height: 200, borderRadius: 8 }} />
                      ) : allDonationsForStats.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                          <AreaChart data={timelineData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                            <defs>
                              <linearGradient id="gradDonUser" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#0ec97f" stopOpacity={0.35} />
                                <stop offset="60%" stopColor="#0ec97f" stopOpacity={0.10} />
                                <stop offset="100%" stopColor="#0ec97f" stopOpacity={0.02} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="month" tick={{ fill: 'var(--t3)', fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: 'var(--t3)', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip content={<OverviewTooltip />} cursor={{ stroke: 'rgba(14,201,127,0.55)', strokeWidth: 1.5, strokeDasharray: '4 3' }} />
                            <Area type="monotone" dataKey="count" name="التبرعات" stroke="#0ec97f" strokeWidth={2.5} fill="url(#gradDonUser)" dot={{ fill: '#0ec97f', strokeWidth: 0, r: 3 }} activeDot={{ r: 5, fill: '#0ec97f', stroke: 'var(--surface)', strokeWidth: 2 }} />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="ap-chart-empty-state" style={{ textAlign: 'center', padding: '30px 10px' }}>
                          <div className="ap-empty-icon" style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--teal-dim, rgba(38, 120, 128, 0.05))', border: '1.5px solid rgba(38, 120, 128, 0.15)', color: 'var(--teal-500, #2e8e98)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, margin: '0 auto 10px' }}>
                            <i className="ti ti-inbox" />
                          </div>
                          <p style={{ color: 'var(--t3)', fontSize: 12.5, fontWeight: 700 }}>لا توجد تبرعات مسجلة حالياً</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2. Donation types */}
                  <div className="ap-chart-card">
                    <div className="ap-chart-header">
                      <span className="ap-chart-title">
                        <i className="ti ti-chart-bar" style={{ color: '#3b82f6' }} /> أنواع التبرعات
                      </span>
                    </div>
                    <div style={{ minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      {fetchError ? (
                        <div className="ap-error-fallback" style={{ textAlign: 'center', padding: '20px 10px' }}>
                          <i className="ti ti-alert-triangle" style={{ fontSize: 32, color: 'var(--red)', marginBottom: 8, display: 'block' }} />
                          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--t2)', marginBottom: 12 }}>{fetchError}</p>
                          <button onClick={fetchDonations} className="ap-empty-btn" style={{ padding: '6px 16px', fontSize: 12 }}>
                            إعادة المحاولة
                          </button>
                        </div>
                      ) : statsLoading ? (
                        <div className="ap-skel" style={{ width: '100%', height: 180, borderRadius: 8 }} />
                      ) : stackedData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                          <BarChart data={stackedData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }} barCategoryGap="30%">
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" tick={{ fill: 'var(--t2)', fontSize: 11, fontFamily: 'Tajawal' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: 'var(--t3)', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                            <Tooltip content={<DonationTypesTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                            <Legend iconType="square" wrapperStyle={{ fontSize: 11, fontFamily: 'Tajawal', paddingTop: 8 }} formatter={(v) => <span style={{ color: 'var(--t2)' }}>{v}</span>} />
                            <Bar dataKey="pending" name="معلق" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={32} />
                            <Bar dataKey="accepted" name="مقبول" fill="#0ec97f" radius={[4, 4, 0, 0]} maxBarSize={32} />
                            <Bar dataKey="rejected" name="مرفوض" fill="#f04370" radius={[4, 4, 0, 0]} maxBarSize={32} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="ap-chart-empty-state" style={{ textAlign: 'center', padding: '30px 10px' }}>
                          <div className="ap-empty-icon" style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--teal-dim, rgba(38, 120, 128, 0.05))', border: '1.5px solid rgba(38, 120, 128, 0.15)', color: 'var(--teal-500, #2e8e98)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, margin: '0 auto 10px' }}>
                            <i className="ti ti-inbox" />
                          </div>
                          <p style={{ color: 'var(--t3)', fontSize: 12.5, fontWeight: 700 }}>لا توجد تبرعات مسجلة حالياً</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Left Column: Status distribution Pie + Latest Donations List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
                  
                  {/* Status distribution */}
                  <div className="ap-chart-card">
                    <div className="ap-chart-header">
                      <span className="ap-chart-title">
                        <i className="ti ti-chart-pie" style={{ color: '#0ec97f' }} /> توزيع الحالات
                      </span>
                    </div>
                    <div style={{ minHeight: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                      {fetchError ? (
                        <div className="ap-error-fallback" style={{ textAlign: 'center', padding: '20px 10px' }}>
                          <i className="ti ti-alert-triangle" style={{ fontSize: 32, color: 'var(--red)', marginBottom: 8, display: 'block' }} />
                          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--t2)', marginBottom: 12 }}>{fetchError}</p>
                          <button onClick={fetchDonations} className="ap-empty-btn" style={{ padding: '6px 16px', fontSize: 12 }}>
                            إعادة المحاولة
                          </button>
                        </div>
                      ) : statsLoading ? (
                        <div className="ap-skel" style={{ width: 120, height: 120, borderRadius: '50%' }} />
                      ) : pieData.length > 0 ? (
                        <>
                          <ResponsiveContainer width="100%" height={160}>
                            <PieChart>
                              <Pie data={pieData} cx="50%" cy="50%" innerRadius={44} outerRadius={68} paddingAngle={3} dataKey="value" animationBegin={0} animationDuration={700}>
                                {pieData.map((entry, i) => (
                                  <Cell key={i} fill={entry.color} strokeWidth={0} />
                                ))}
                              </Pie>
                              <Tooltip content={<PieTooltip />} />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="ap-pie-legend">
                            {pieData.map((d, i) => (
                              <span key={i} className="ap-pie-legend-item">
                                <span className="ap-pie-legend-dot" style={{ background: d.color }} />
                                {d.name} ({d.value})
                              </span>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="ap-chart-empty-state" style={{ textAlign: 'center', padding: '30px 10px' }}>
                          <div className="ap-empty-icon" style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--teal-dim, rgba(38, 120, 128, 0.05))', border: '1.5px solid rgba(38, 120, 128, 0.15)', color: 'var(--teal-500, #2e8e98)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, margin: '0 auto 10px' }}>
                            <i className="ti ti-inbox" />
                          </div>
                          <p style={{ color: 'var(--t3)', fontSize: 12.5, fontWeight: 700 }}>لا توجد تبرعات مسجلة حالياً</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Latest donations list */}
                  {donations.length > 0 && (
                    <div className="ap-chart-card">
                      <div className="ap-chart-header">
                        <span className="ap-chart-title">
                          <i className="ti ti-clock-record" style={{ color: '#0ec97f' }} /> آخر تبرعاتك
                        </span>
                        <button className="ap-card-eye-btn" style={{ fontSize: 11, padding: '3px 8px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--t2)', cursor: 'pointer' }} onClick={() => setTab('donations')}>
                          <i className="ti ti-eye" style={{ marginLeft: 3 }} />عرض الكل
                        </button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 0, overflow: 'hidden', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                        {[...donations].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5).map((d, i) => {
                          const statusCfg = getStatusCfg(isDark);
                          const sc = statusCfg[d.status] ?? {
                            label: d.status, color: isDark ? '#9ca3af' : '#6b7280',
                            bg: isDark ? 'rgba(255,255,255,0.06)' : '#f3f4f6',
                            border: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
                            dot: isDark ? '#9ca3af' : '#9ca3af',
                          };
                          return (
                            <div 
                              key={d._id} 
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 10, 
                                padding: '9px 12px', 
                                borderBottom: i < 4 ? '1px solid var(--border)' : 'none', 
                                background: i % 2 === 0 ? 'var(--surface2)' : 'transparent', 
                                cursor: 'pointer' 
                              }} 
                              onClick={() => {
                                setTab('donations');
                                setDonSubView('list');
                              }}
                            >
                              <div style={{ width: 28, height: 28, borderRadius: 7, background: sc.bg, color: sc.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>
                                <i className="ti ti-gift" />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.type}</div>
                                <div style={{ fontSize: 10.5, color: 'var(--t4)', marginTop: 1 }}>{getCharityName(d)}</div>
                              </div>
                              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: sc.bg, color: sc.color, flexShrink: 0 }}>{sc.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>}

            {/* ━━━━━━━━━━ 2. DONATIONS TAB (donations) ━━━━━━━━━━ */}
            {tab === 'donations' && <div className="ap-tab-pane">
              {donSubView === 'list' ? (
                <>
                  <div className="ap-section-header" style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="ap-section-title">
                        <i className="ti ti-clipboard-list" style={{ color: 'var(--teal)' }} />
                        سجل التبرعات الشخصية
                        <span className="ap-count-badge" style={{ background: 'var(--teal)' }}>{filteredAndSorted.length}</span>
                      </div>
                      <div className="ap-view-switcher">
                        <button className={`ap-view-btn${donView === 'table' ? ' active' : ''}`} onClick={() => setDonView('table')} title="جدول"><i className="ti ti-list" /></button>
                        <button className={`ap-view-btn${donView === 'cards' ? ' active' : ''}`} onClick={() => setDonView('cards')} title="كروت"><i className="ti ti-layout-grid" /></button>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                      <button
                        className="ap-action-btn approve"
                        onClick={() => setDonSubView('add')}
                        style={{
                          padding: '10px 22px',
                          borderRadius: '12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          fontSize: '13px',
                          fontWeight: 800,
                          background: 'linear-gradient(135deg, var(--teal, #0ec97f) 0%, #0ba86b 100%)',
                          color: '#fff',
                          border: 'none',
                          boxShadow: '0 4px 14px rgba(14, 201, 127, 0.3)',
                          cursor: 'pointer',
                          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                          transform: 'translateY(0)',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(14, 201, 127, 0.45)';
                          e.currentTarget.style.filter = 'brightness(1.05)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 14px rgba(14, 201, 127, 0.3)';
                          e.currentTarget.style.filter = 'none';
                        }}
                      >
                        <i className="ti ti-heart-plus" style={{ fontSize: '15px' }} />
                        إضافة تبرع جديد
                      </button>
                    </div>
                  </div>

                  {/* Filters Bar */}
                  <div className="ap-filters-bar" style={{ marginBottom: 16 }}>
                    <div className="ap-filters-group">
                      <div className="ap-search-wrap">
                        <i className="ti ti-search ap-search-icon" />
                        <input
                          className="ap-search-input"
                          placeholder="ابحث بالنوع أو الجمعية…"
                          value={searchQ}
                          onChange={e => setSearchQ(e.target.value)}
                        />
                        {searchQ && (
                          <button className="ap-search-clear" onClick={() => setSearchQ('')}>
                            <i className="ti ti-x" />
                          </button>
                        )}
                      </div>

                      <div className="ap-filter-tabs">
                        {([
                          ['all',      'الكل',         stats.total    ],
                          ['pending',  'قيد المراجعة', stats.pending  ],
                          ['accepted', 'مقبول',        stats.accepted ],
                          ['rejected', 'مرفوض',        stats.rejected ],
                        ] as const).map(([key, label, count]) => (
                          <button
                            key={key}
                            className={`ap-filter-tab ap-filter-tab--${key}${activeTab === key ? ' active' : ''}`}
                            onClick={() => setActiveTab(key)}
                          >
                            {label}
                            <span className="ap-filter-badge">{count}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="ap-filters-group">
                      <div className="ap-date-range-wrap">
                        <div className="ap-date-field">
                          <span className="ap-date-label">من</span>
                          <PremiumDatePicker
                            value={dateFrom}
                            onChange={setDateFrom}
                            placeholder="تاريخ البدء"
                          />
                        </div>
                        <div className="ap-date-field">
                          <span className="ap-date-label">إلى</span>
                          <PremiumDatePicker
                            value={dateTo}
                            min={dateFrom || undefined}
                            onChange={setDateTo}
                            placeholder="تاريخ الانتهاء"
                          />
                        </div>
                        {(dateFrom || dateTo) && (
                          <button
                            className="ap-date-range-clear"
                            onClick={() => { setDateFrom(''); setDateTo(''); }}
                            title="مسح التاريخ"
                          >
                            <i className="ti ti-x" />
                          </button>
                        )}
                      </div>

                      {/* Sort & Reset grouped */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="ap-filter-tabs">
                          <button
                            type="button"
                            className={`ap-filter-tab ap-filter-tab--sort${sortOrder === 'newest' ? ' active' : ''}`}
                            onClick={() => setSortOrder('newest')}
                          >
                            <i className="ti ti-sort-descending" />
                            الأحدث
                          </button>
                          <button
                            type="button"
                            className={`ap-filter-tab ap-filter-tab--sort${sortOrder === 'oldest' ? ' active' : ''}`}
                            onClick={() => setSortOrder('oldest')}
                          >
                            <i className="ti ti-sort-ascending" />
                            الأقدم
                          </button>
                        </div>

                        {(searchQ || activeTab !== 'all' || dateFrom || dateTo || sortOrder !== 'newest') && (
                          <button
                            className="ap-filter-reset-btn"
                            onClick={() => {
                              setSearchQ('');
                              setActiveTab('all');
                              setDateFrom('');
                              setDateTo('');
                              setSortOrder('newest');
                              setDonPage(1);
                            }}
                            title="مسح التصفية"
                          >
                            <i className="ti ti-filter-off" />
                            مسح التصفية
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Donations list render */}
                  {fetchError ? (
                    <div className="ap-empty-state">
                      <div className="ap-empty-icon"><i className="ti ti-alert-circle" /></div>
                      <div className="ap-empty-title">{fetchError}</div>
                      <button className="ap-load-more-btn" style={{ marginTop: 12 }} onClick={fetchDonations}>
                        <i className="ti ti-refresh" /> إعادة المحاولة
                      </button>
                    </div>
                  ) : loading ? (
                    donView === 'table' ? (
                      <div className="ud-table-skeleton-wrap">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className="ud-table-skeleton-row">
                            <div className="ud-skeleton ud-sk-tbl-cell-lg" />
                            <div className="ud-skeleton ud-sk-tbl-cell" />
                            <div className="ud-skeleton ud-sk-tbl-cell" />
                            <div className="ud-skeleton ud-sk-tbl-cell" />
                            <div className="ud-skeleton ud-sk-tbl-cell" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="ap-card-grid">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="ap-entity-card cd-donation-card">
                            <div className="ap-entity-card-header" style={{ borderBottom: 'none' }}>
                              <div className="ap-skel" style={{ width: 44, height: 44, borderRadius: 10 }} />
                              <div style={{ flex: 1, marginRight: 10 }}>
                                <div className="ap-skel" style={{ height: 16, width: '60%', marginBottom: 6 }} />
                                <div className="ap-skel" style={{ height: 12, width: '40%' }} />
                              </div>
                            </div>
                            <div style={{ margin: '14px 0' }}>
                              <div className="ap-skel" style={{ height: 26, width: '85%', borderRadius: 6, marginBottom: 8 }} />
                              <div className="ap-skel" style={{ height: 14, width: '50%' }} />
                            </div>
                            <div className="ap-skel" style={{ height: 14, width: '90%', marginTop: 'auto' }} />
                          </div>
                        ))}
                      </div>
                    )
                  ) : filteredAndSorted.length === 0 ? (
                    <div className="ap-empty-state">
                      <div className="ap-empty-icon"><i className="ti ti-inbox" /></div>
                      <div className="ap-empty-title">لا توجد تبرعات مطابقة للتصفية الحالية</div>
                      <p className="ap-empty-desc">ابدأ رحلتك في العطاء وساعد من يحتاج</p>
                      <button className="ap-empty-btn" onClick={() => setDonSubView('add')}>
                        <i className="ti ti-plus" /> أضف تبرعًا جديدًا
                      </button>
                    </div>
                  ) : donView === 'cards' ? (
                    <div className="ap-card-grid">
                      {paginatedDonations.map(d => {
                        const statusCfg = getStatusCfg(isDark);
                        const sc = statusCfg[d.status] ?? {
                          label: d.status, color: isDark ? '#9ca3af' : '#6b7280',
                          bg: isDark ? 'rgba(255,255,255,0.06)' : '#f3f4f6',
                          border: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
                          dot: isDark ? '#9ca3af' : '#9ca3af',
                        };
                        const alreadyRated = ratedIds.has(d._id);
                        const canRate      = d.status === 'accepted';
                        const condLabel    = CONDITION_LABELS[d.condition ?? ''] ?? d.condition ?? '—';
                        const img = (d as any).imageUrl?.[0]?.secure_url;

                        return (
                          <div key={d._id} className="ap-entity-card cd-donation-card">
                            <div className="ap-entity-card-header">
                              {img
                                ? <img src={img} style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border)' }} alt="" />
                                : <div className="ap-entity-avatar charity" style={{ width: 44, height: 44, flexShrink: 0 }}><i className="ti ti-gift" /></div>
                              }
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="ap-entity-name">{d.type}</div>
                                {d.size && <div style={{ fontSize: 11.5, color: 'var(--t4)', fontWeight: 600 }}>مقاص: {d.size}</div>}
                              </div>
                              <span className="ap-badge" style={{ background: sc.bg, color: sc.color, borderColor: sc.border, borderWidth: 1, borderStyle: 'solid', flexShrink: 0 }}>
                                <span className="ap-badge-dot" style={{ background: sc.dot }} />
                                {sc.label}
                              </span>
                            </div>

                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, margin: '12px 0' }}>
                              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 12, color: 'var(--t2)', fontWeight: 700 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--surface2)', padding: '3px 9px', borderRadius: 6, border: '1px solid var(--border)' }}>
                                  <i className="ti ti-package" style={{ color: 'var(--teal)', fontSize: 13 }} />
                                  {formatNumber(d.quantity)} قطع
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--surface2)', padding: '3px 9px', borderRadius: 6, border: '1px solid var(--border)' }}>
                                  <i className="ti ti-star" style={{ color: '#f59e0b', fontSize: 13 }} />
                                  {condLabel}
                                </span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--t3)' }}>
                                <i className="ti ti-building-community" style={{ color: 'var(--teal)', fontSize: 14 }} />
                                <span style={{ fontWeight: 700 }}>{getCharityName(d)}</span>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                              <div style={{ fontSize: 11, color: 'var(--t4)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <i className="ti ti-calendar" />
                                {formatDate(d.createdAt)}
                              </div>
                              
                              {canRate && (
                                alreadyRated
                                  ? (
                                    <span 
                                      className="ud-rated" 
                                      style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                      onClick={() => {
                                        const ratingDetails = loadedRatings.get(d._id);
                                        if (ratingDetails) setViewingRating(ratingDetails);
                                      }}
                                    >
                                      <i className="ti ti-star-filled" style={{ color: '#f59e0b' }} />
                                      عرض التقييم
                                    </span>
                                  )
                                  : (
                                    <button className="ud-rate-btn" onClick={() => setRatingDonation(d)} style={{ padding: '4px 10px', fontSize: 11.5 }}>
                                      <i className="ti ti-star" /> قيّم الجمعية
                                    </button>
                                  )
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="ap-table-wrap">
                      <table className="ap-table" aria-label="قائمة التبرعات">
                        <thead>
                          <tr>
                            <th scope="col">نوع التبرع</th>
                            <th scope="col">الكمية</th>
                            <th scope="col">الجمعية</th>
                            <th scope="col">حالة القطعة</th>
                            <th scope="col">التاريخ</th>
                            <th scope="col">الحالة</th>
                            <th scope="col"><span className="sr-only">إجراء</span></th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginatedDonations.map(d => {
                            const statusCfg = getStatusCfg(isDark);
                            const sc = statusCfg[d.status] ?? {
                              label: d.status, color: isDark ? '#9ca3af' : '#6b7280',
                              bg: isDark ? 'rgba(255,255,255,0.06)' : '#f3f4f6',
                              border: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
                              dot: isDark ? '#9ca3af' : '#9ca3af',
                            };
                            const alreadyRated = ratedIds.has(d._id);
                            const canRate      = d.status === 'accepted';
                            const condLabel    = CONDITION_LABELS[d.condition ?? ''] ?? d.condition ?? '—';

                            return (
                              <tr key={d._id} className="ap-table-row-clickable">
                                <td data-label="نوع التبرع">
                                  <div className="ud-type-cell">
                                    <div className="ud-type-ico"><i className="ti ti-shirt" /></div>
                                    <div>
                                      <div className="ud-type-name">{d.type}</div>
                                      {d.size && <div className="ud-type-size">مقاس: {d.size}</div>}
                                    </div>
                                  </div>
                                </td>
                                <td data-label="الكمية"><span className="ud-qty">{formatNumber(d.quantity)} قطع</span></td>
                                <td data-label="الجمعية">
                                  <span className="ud-charity-tag">
                                    <i className="ti ti-building-community" />
                                    {getCharityName(d)}
                                  </span>
                                </td>
                                <td data-label="حالة القطعة" style={{ color: 'var(--t2)', fontSize: 13, fontWeight: 700 }}>
                                  {condLabel}
                                </td>
                                <td data-label="التاريخ" style={{ color: 'var(--t3)', fontSize: 11.5, fontWeight: 600, whiteSpace: 'nowrap' }} className="ap-table-mono">
                                  {formatDate(d.createdAt)}
                                </td>
                                <td data-label="الحالة">
                                  <span
                                    className="ud-status"
                                    style={{ color: sc.color, background: sc.bg, borderColor: sc.border }}
                                  >
                                    <span className="ud-status-dot" style={{ background: sc.dot }} />
                                    {sc.label}
                                  </span>
                                </td>
                                <td data-label="إجراء">
                                  {canRate && (
                                    alreadyRated
                                      ? (
                                        <span 
                                          className="ud-rated" 
                                          style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                          onClick={() => {
                                            const ratingDetails = loadedRatings.get(d._id);
                                            if (ratingDetails) setViewingRating(ratingDetails);
                                          }}
                                        >
                                          <i className="ti ti-star-filled" style={{ color: '#f59e0b' }} />
                                          عرض التقييم
                                        </span>
                                      )
                                      : (
                                        <button className="ud-rate-btn" onClick={() => setRatingDonation(d)}>
                                          <i className="ti ti-star" /> قيّم
                                        </button>
                                      )
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* ── Donations Pagination ── */}
                  {!loading && !fetchError && effectiveTotal > DON_PER_PAGE && donTotalPages > 1 && (
                    <div className="ap-pagination-container" style={{ marginTop: 20, direction: "rtl" }}>
                      <span className="ap-pagination-info" style={{ direction: 'rtl', unicodeBidi: 'plaintext' }}>
                        عرض {formatNumber(donStart + 1)}–{formatNumber(Math.min(donEnd, effectiveTotal))} من {formatNumber(effectiveTotal)}
                      </span>
                      <div className="ap-pagination-buttons" style={{ direction: 'rtl' }}>
                        <button
                          className="ap-pagination-btn"
                          onClick={() => handleDonPageChange(1)}
                          disabled={donPage === 1}
                          title="الصفحة الأولى"
                        >»</button>
                        <button
                          className="ap-pagination-btn prev-next"
                          onClick={() => handleDonPageChange(Math.max(1, donPage - 1))}
                          disabled={donPage === 1}
                        >السابق</button>
                        {Array.from({ length: donTotalPages }, (_, i) => i + 1)
                          .filter(p => p === 1 || p === donTotalPages || Math.abs(p - donPage) <= 1)
                          .reduce<(number | string)[]>((acc, p, idx, arr) => {
                            if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('…');
                            acc.push(p);
                            return acc;
                          }, [])
                          .map((p, i) => typeof p === 'string'
                            ? <span key={`ellipsis-${i}`} style={{ padding: '0 4px', color: 'var(--t4)' }}>…</span>
                            : <button
                                key={p}
                                className={`ap-pagination-btn page-num${donPage === p ? ' active' : ''}`}
                                onClick={() => handleDonPageChange(p as number)}
                              >{formatNumber(p)}</button>
                          )}
                        <button
                          className="ap-pagination-btn prev-next"
                          onClick={() => handleDonPageChange(Math.min(donTotalPages, donPage + 1))}
                          disabled={donPage === donTotalPages}
                        >التالي</button>
                        <button
                          className="ap-pagination-btn"
                          onClick={() => handleDonPageChange(donTotalPages)}
                          disabled={donPage === donTotalPages}
                          title="الصفحة الأخيرة"
                        >«</button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* ─── معالج تفاعلي فاخر جداً لإضافة التبرع كلياً بداخل الداشبورد وبدون استمارات مملة ─── */
                <div className="ap-settings-card animate-up" style={{ width: '100%', border: '1px solid var(--border)' }}>
                  
                  {/* Visual Header */}
                  {!formSuccess && (
                    <div className="ap-section-header" style={{ marginBottom: 24, paddingBottom: 12, borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: 12 }}>
                      <div className="ap-section-title" style={{ fontSize: 16 }}>
                        <i className="ti ti-gift" style={{ color: 'var(--teal)' }} />
                        إضافة تبرع جديد
                      </div>
                      <button
                        className="ap-action-btn edit"
                        onClick={() => {
                          resetAddDonationForm();
                          setDonSubView('list');
                        }}
                        style={{ padding: '6px 14px', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                      >
                        <i className="ti ti-arrow-right" />
                        العودة للسجل
                      </button>
                    </div>
                  )}

                  {/* STEP-BY-STEP INTERACTIVE WIZARD OR SUCCESS CARD */}
                  {formSuccess ? (
                    <div className="ap-success-card animate-up" style={{ padding: '20px 0' }}>
                      <div className="ap-success-icon-wrap">
                        <i className="ti ti-check" />
                      </div>
                      <h3 className="ap-success-title" style={{ fontSize: 18 }}>تم تقديم تبرعك بنجاح!</h3>
                      <p className="ap-success-msg" style={{ fontSize: 13, marginBottom: 20 }}>
                        شكراً لمساهمتك الكريمة. تم تسجيل طلب تبرع الخير في سجلات جميع الجمعيات الشريكة وجاري تدقيقه للموافقة والقبول.
                      </p>

                      {/* Notion style Summary card */}
                      <div className="ap-notion-summary-box" style={{ maxWidth: '100%' }}>
                        <div className="ap-notion-summary-header">ملخص تبرع الخير</div>
                        <div className="ap-notion-summary-list">
                          <div className="ap-notion-summary-item">
                            <span className="ap-notion-summary-label">👕 نوع التبرع</span>
                            <span className="ap-notion-summary-val">{formType}</span>
                          </div>
                          <div className="ap-notion-summary-item">
                            <span className="ap-notion-summary-label">📏 مقاس القطع</span>
                            <span className="ap-notion-summary-val">{formSize}</span>
                          </div>
                          <div className="ap-notion-summary-item">
                            <span className="ap-notion-summary-label">📦 كمية الملابس</span>
                            <span className="ap-notion-summary-val">{formQuantity} قطع</span>
                          </div>
                          <div className="ap-notion-summary-item">
                            <span className="ap-notion-summary-label">⭐ جودة التوريد</span>
                            <span className="ap-notion-summary-val">{DASH_CONDITIONS.find(c => c.value === formCondition)?.label || formCondition}</span>
                          </div>
                          {formNotes && (
                            <div className="ap-notion-summary-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
                              <span className="ap-notion-summary-label">📝 تفاصيل إضافية</span>
                              <span className="ap-notion-summary-val" style={{ fontSize: 12, color: 'var(--t3)', fontWeight: 500, background: 'var(--surface3, rgba(255,255,255,0.05))', padding: '6px 10px', borderRadius: 8, width: '100%', border: '1px solid var(--border, rgba(255,255,255,0.08))' }}>{formNotes}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="ap-success-actions" style={{ marginTop: 16 }}>
                        <button
                          type="button"
                          className="ap-btn-prev"
                          onClick={() => {
                            resetAddDonationForm();
                            setDonSubView('list');
                          }}
                        >
                          العودة للسجل
                        </button>
                        <button
                          type="button"
                          className="ap-btn-next"
                          onClick={resetAddDonationForm}
                        >
                          <i className="ti ti-plus" />
                          إضافة تبرع آخر
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={submitDonation} className="donation-form" noValidate>
                      {/* Top guided stepper component (Stripe/Airbnb style) */}
                      <div className="ap-stepper-wrap">
                        <div className="ap-stepper-steps">
                          {[
                            { step: 1, label: 'التصنيف والمقاس', icon: 'ti-shirt' },
                            { step: 2, label: 'الكمية والقطع', icon: 'ti-package' },
                            { step: 3, label: 'الجودة والوصف', icon: 'ti-star' },
                            { step: 4, label: 'إرفاق الصور', icon: 'ti-camera' },
                          ].map((item, idx) => {
                            const isCompleted = formStep > item.step;
                            const isActive = formStep === item.step;
                            return (
                              <React.Fragment key={item.step}>
                                <div className={`ap-stepper-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                                  <div 
                                    className="ap-stepper-circle" 
                                    onClick={() => {
                                      if (item.step < formStep) setFormStep(item.step);
                                    }}
                                    style={{ cursor: item.step < formStep ? 'pointer' : 'default' }}
                                  >
                                    {isCompleted ? <i className="ti ti-check" /> : <i className={`ti ${item.icon}`} />}
                                  </div>
                                  <span className="ap-stepper-label">{item.label}</span>
                                </div>
                                {idx < 3 && (
                                  <div className={`ap-stepper-line ${formStep > item.step ? 'filled' : ''}`} />
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>

                      {formGlobalError && <div className="global-error" role="alert"><i className="ti ti-alert-circle" /> {formGlobalError}</div>}

                      {/* STEP 1: Category & Size */}
                      {formStep === 1 && (
                        <div className="ap-wizard-step" key="step-1">
                          <div className="ap-wizard-group">
                            <div className="ap-wizard-group-title">
                              <i className="ti ti-shirt" />
                              <span>ما هو تصنيف ونوع التبرع؟</span>
                            </div>
                            
                            <div className="ap-form-group">
                              <label className="ap-form-label">تصنيف قطع الملابس <span className="req">*</span></label>
                              <div className="ap-category-grid">
                                {[
                                  { id: 'رجالي', icon: 'ti-shirt', label: 'رجالي', sub: 'ملابس، قمصان، بدل، إلخ' },
                                  { id: 'حريمي', icon: 'ti-hanger', label: 'حريمي', sub: 'فساتين، ملابس حريمي، إلخ' },
                                  { id: 'أطفال', icon: 'ti-mood-kid', label: 'أطفال', sub: 'ملابس أطفال وحديثي الولادة' }
                                ].map(c => {
                                  const isSel = formType === c.id;
                                  return (
                                    <div
                                      key={c.id}
                                      className={`ap-category-card ${isSel ? 'active' : ''}`}
                                      onClick={() => { setFormType(c.id); setFormTouched(t => ({ ...t, type: true })); }}
                                    >
                                      <div className="ap-category-icon-wrap">
                                        <i className={`ti ${c.icon}`} />
                                      </div>
                                      <div className="ap-category-title">{c.label}</div>
                                      <div className="ap-category-sub">{c.sub}</div>
                                      {isSel && <span className="ap-category-checkmark">✓</span>}
                                    </div>
                                  );
                                })}
                              </div>
                              {formTouched.type && errors.type && <div className="field-error" role="alert"><i className="ti ti-alert-triangle" /> {errors.type}</div>}
                            </div>
                          </div>

                          <div className="ap-wizard-group">
                            <div className="ap-wizard-group-title">
                              <i className="ti ti-ruler-2" />
                              <span>ما هو المقاس المتوفر؟</span>
                            </div>

                            <div className="ap-form-group">
                              <label className="ap-form-label">اختر المقاس المطلوب <span className="req">*</span></label>
                              <div className="ap-size-grid">
                                {['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL'].map(s => {
                                  const isSel = formSize === s;
                                  return (
                                    <button
                                      key={s}
                                      type="button"
                                      className={`ap-size-pill ${isSel ? 'active' : ''}`}
                                      onClick={() => { setFormSize(s); setFormTouched(t => ({ ...t, size: true })); }}
                                    >
                                      {s}
                                    </button>
                                  );
                                })}
                              </div>
                              {formTouched.size && errors.size && <div className="field-error" role="alert"><i className="ti ti-alert-triangle" /> {errors.size}</div>}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* STEP 2: Quantity (Amount experience) */}
                      {formStep === 2 && (
                        <div className="ap-wizard-step" key="step-2">
                          <div className="ap-wizard-group">
                            <div className="ap-wizard-group-title">
                              <i className="ti ti-package" />
                              <span>حدد كمية الملابس والقطع المراد التبرع بها</span>
                            </div>

                            <div className="ap-form-group">
                              <label className="ap-form-label">الكمية الإجمالية <span className="req">*</span></label>
                              <div className="ap-presets-row">
                                {[
                                  { val: '1', label: 'قطعة واحدة', count: 1 },
                                  { val: '3', label: '٣ قطع', count: 3 },
                                  { val: '5', label: '٥ قطع', count: 5 },
                                  { val: '10', label: '١٠ قطع', count: 10 },
                                  { val: 'custom', label: 'عدد مخصص...', count: formQuantity },
                                ].map(p => {
                                  const active = activePreset === p.val;
                                  return (
                                    <button
                                      key={p.val}
                                      type="button"
                                      className={`ap-preset-btn ${active ? 'active' : ''}`}
                                      onClick={() => {
                                        if (p.val !== 'custom') {
                                          setFormQuantity(p.count);
                                        } else if ([1, 3, 5, 10].includes(formQuantity)) {
                                          setFormQuantity(6);
                                        }
                                        setFormTouched(t => ({ ...t, quantity: true }));
                                      }}
                                    >
                                      {p.val === 'custom' && <i className="ti ti-plus" />}
                                      {p.label}
                                    </button>
                                  );
                                })}
                              </div>

                              {activePreset === 'custom' && (
                                <div className="qty-control animate-up" style={{ marginTop: 16 }}>
                                  <button
                                    type="button"
                                    className="qty-btn"
                                    onClick={() => setFormQuantity(q => Math.max(1, q - 1))}
                                  >
                                    <i className="ti ti-minus" />
                                  </button>
                                  <span className="qty-input" style={{ width: 44, display: 'inline-block', textAlign: 'center', fontWeight: 900, color: 'var(--t1)', fontSize: 15 }}>
                                    {formQuantity}
                                  </span>
                                  <button
                                    type="button"
                                    className="qty-btn"
                                    onClick={() => setFormQuantity(q => Math.min(99, q + 1))}
                                  >
                                    <i className="ti ti-plus" />
                                  </button>
                                </div>
                              )}
                              {formTouched.quantity && errors.quantity && <div className="field-error"><i className="ti ti-alert-triangle" /> {errors.quantity}</div>}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* STEP 3: Quality Condition & Description */}
                      {formStep === 3 && (
                        <div className="ap-wizard-step" key="step-3">
                          <div className="ap-wizard-group">
                            <div className="ap-wizard-group-title">
                              <i className="ti ti-star" />
                              <span>ما هي حالة وجودة قطع التبرع؟</span>
                            </div>

                            <div className="ap-form-group">
                              <label className="ap-form-label">حالة جودة التوريد <span className="req">*</span></label>
                              <div className="ap-condition-grid">
                                {DASH_CONDITIONS.map(c => {
                                  const isSel = formCondition === c.value;
                                  return (
                                    <div
                                      key={c.value}
                                      className={`ap-condition-card ${isSel ? 'active' : ''}`}
                                      onClick={() => { setFormCondition(c.value); setFormTouched(t => ({ ...t, condition: true })); }}
                                    >
                                      <div className="ap-condition-dot-wrap">
                                        <i className={`ti ${(c as any).icon}`} />
                                      </div>
                                      <div className="ap-condition-info">
                                        <span className="ap-condition-name">{c.label}</span>
                                        <span className="ap-condition-desc">{c.desc}</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              {formTouched.condition && errors.condition && <div className="field-error" role="alert"><i className="ti ti-alert-triangle" /> {errors.condition}</div>}
                            </div>
                          </div>

                          <div className="ap-wizard-group">
                            <div className="ap-wizard-group-title">
                              <i className="ti ti-notes" />
                              <span>تفاصيل إضافية (اختياري)</span>
                            </div>

                            <div className="ap-form-group">
                              <label className="ap-form-label" htmlFor="notes">اكتب أي تفاصيل أخرى تود إعلام الجمعية بها</label>
                              <div className="ap-floating-group">
                                <textarea
                                  id="notes"
                                  className="ap-form-textarea"
                                  style={{ minHeight: 96, resize: 'vertical' }}
                                  placeholder="اكتب تفاصيل إضافية (مثل: خامات مريحة، ملابس مغسولة وجاهزة)..."
                                  value={formNotes}
                                  onChange={e => setFormNotes(e.target.value)}
                                  maxLength={500}
                                  rows={3}
                                />
                                <div style={{ fontSize: 11, color: 'var(--t4)', textAlign: 'left', marginTop: 4, fontFamily: 'monospace' }}>{formNotes.length}/500</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* STEP 4: Visual Images Evidence */}
                      {formStep === 4 && (
                        <div className="ap-wizard-step" key="step-4">
                          <div className="ap-wizard-group">
                            <div className="ap-wizard-group-title">
                              <i className="ti ti-camera" />
                              <span>أرفق صوراً توضيحية لقطع التبرع</span>
                            </div>

                            <div className="ap-form-group">
                              <label className="ap-form-label">الصور التوثيقية للقطع (تساعد في تسريع القبول) <span className="req">*</span></label>
                              <div
                                className={`upload-area ${formDragOver ? 'dragover' : ''}`}
                                onDragOver={e => { e.preventDefault(); setFormDragOver(true); }}
                                onDragLeave={() => setFormDragOver(false)}
                                onDrop={e => {
                                  e.preventDefault();
                                  setFormDragOver(false);
                                  if (e.dataTransfer?.files?.length) addFormFiles(e.dataTransfer.files);
                                }}
                                onClick={() => fileRef.current?.click()}
                                role="button"
                                tabIndex={0}
                                onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && fileRef.current) fileRef.current.click(); }}
                              >
                                <div className="upload-inner">
                                  <div className="upload-ico"><i className="ti ti-cloud-upload" /></div>
                                  <div className="upload-text">انقر لرفع صورة أو اسحبها هنا</div>
                                  <div className="upload-hint">PNG, JPG حتى 5MB (يمكنك اختيار أكثر من صورة، بحد أقصى ٥ صور)</div>
                                  <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    style={{ display: 'none' }}
                                    onChange={e => {
                                      if (e.target.files?.length) addFormFiles(e.target.files);
                                      e.currentTarget.value = '';
                                    }}
                                  />
                                </div>
                              </div>

                              {formTouched.images && errors.images && <div className="field-error" role="alert"><i className="ti ti-alert-triangle" /> {errors.images}</div>}

                              {formImages.length > 0 && (
                                <div className="preview-grid" aria-live="polite">
                                  {formImages.map((it, i) => (
                                    <div className="preview-item animate-up" key={it.id}>
                                      <img src={it.url} alt={`معاينة ${i + 1}`} />
                                      <button
                                        type="button"
                                        className="preview-rm"
                                        onClick={e => { e.stopPropagation(); removeFormImage(it.id); }}
                                        aria-label={`حذف الصورة ${i + 1}`}
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tactile Navigation Row */}
                      <div className="ap-wizard-nav-row">
                        {formStep === 1 ? (
                          <button
                            type="button"
                            className="ap-btn-prev"
                            onClick={() => {
                              resetAddDonationForm();
                              setDonSubView('list');
                            }}
                          >
                            <i className="ti ti-arrow-right" />
                            إلغاء وإغلاق
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="ap-btn-prev"
                            onClick={handleFormPrev}
                          >
                            <i className="ti ti-arrow-right" />
                            الخطوة السابقة
                          </button>
                        )}

                        {formStep < 4 ? (
                          <button
                            type="button"
                            className="ap-btn-next"
                            onClick={handleFormNext}
                            disabled={!stepValidated}
                          >
                            الخطوة التالية
                            <i className="ti ti-arrow-left" />
                          </button>
                        ) : (
                          <button
                            type="submit"
                            className="ap-btn-next"
                            disabled={formSaving || !stepValidated}
                          >
                            {formSaving ? (
                              <>
                                <i className="ti ti-loader-2 ti-spin" />
                                جاري تقديم طلب الخير...
                              </>
                            ) : (
                              <>
                                <i className="ti ti-heart-filled" />
                                تقديم التبرع الآن
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>}

            {/* ━━━━━━━━━━ 3. AI CHAT TAB (chat) ━━━━━━━━━━ */}
            {tab === 'chat' && (
              <div className="ap-chat-shell">
                <AIChatEmbed />
              </div>
            )}

            {/* ━━━━━━━━━━ 4. SETTINGS TAB (settings) ━━━━━━━━━━ */}
            {tab === 'settings' && <div className="ap-tab-pane">
              <div className="ap-section-header" style={{ marginBottom: 20 }}>
                <div className="ap-section-title">
                  <i className="ti ti-settings" style={{ color: 'var(--teal)' }} />
                  الإعدادات
                </div>
              </div>

              {/* Mobile settings navigation */}
              <div className="cd-settings-mobile-tabs">
                {([
                  { id: 'profile',  icon: 'ti-user-circle',        label: 'الحساب', color: '#0ec97f' },
                  { id: 'password', icon: 'ti-shield-lock',       label: 'كلمة المرور', color: '#f04370' },
                  { id: 'license',  icon: 'ti-shield-check',      label: ' التوثيق', color: '#3b82f6' },
                  { id: 'danger',   icon: 'ti-alert-triangle',    label: ' الخطر',       color: '#ef4444' },
                ] as const).map(item => (
                  <button
                    key={item.id}
                    onClick={() => setSettingsTab(item.id)}
                    className={`cd-settings-mobile-tab${settingsTab === item.id ? ' active' : ''}`}
                    style={{
                      borderBottom: settingsTab === item.id ? `2px solid ${item.color}` : '2px solid transparent',
                      color: settingsTab === item.id ? item.color : 'var(--t3)',
                    } as React.CSSProperties}
                  >
                    <i className={`ti ${item.icon}`} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                {/* Desktop settings sidebar navigation */}
                <div className="cd-settings-sidebar">
                  {([
                    { id: 'profile',  icon: 'ti-user-circle',        label: 'الملف الشخصي', color: '#0ec97f' },
                    { id: 'password', icon: 'ti-shield-lock',       label: 'كلمة المرور',      color: '#f04370' },
                    { id: 'license',  icon: 'ti-shield-check',      label: 'الحساب والتوثيق', color: '#3b82f6' },
                    { id: 'danger',   icon: 'ti-alert-triangle',    label: 'منطقة الخطر',      color: '#ef4444' },
                  ] as const).map(item => (
                    <button
                      key={item.id}
                      onClick={() => setSettingsTab(item.id)}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '10px 12px',
                        borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'right' as const,
                        background: settingsTab === item.id ? `${item.color}14` : 'transparent',
                        color: settingsTab === item.id ? item.color : 'var(--t2)',
                        fontFamily: 'Tajawal', fontSize: 13, fontWeight: settingsTab === item.id ? 700 : 500,
                        transition: 'all 0.18s', marginBottom: 2,
                        borderRight: settingsTab === item.id ? `3px solid ${item.color}` : '3px solid transparent',
                      }}
                    >
                      <i className={`ti ${item.icon}`} style={{ fontSize: 15, color: item.color, flexShrink: 0 }} />
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Settings Panels Content */}
                <div style={{ flex: 1, minWidth: 280 }}>
                  
                  {/* Panel 1: Profile information */}
                  {settingsTab === 'profile' && (
                    <div className="ap-settings-card">
                      <div className="ap-settings-card-title">
                        <div className="ap-settings-icon" style={{ background: 'rgba(14,201,127,0.14)', color: '#0ec97f' }}>
                          <i className="ti ti-user-circle" />
                        </div>
                        الملف الشخصي
                      </div>

                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 14px', background: 'var(--surface2)', borderRadius: 10, marginBottom: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(14,201,127,0.15)', color: '#0ec97f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, flexShrink: 0 }}>
                          {userInitial}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--t1)' }}>{userName}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--t3)' }}>{user?.email}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: user?.verify ? '#0ec97f' : '#f59e0b', display: 'inline-block' }} />
                            <span style={{ fontSize: 10.5, color: user?.verify ? '#0ec97f' : '#f59e0b', fontWeight: 700 }}>{user?.verify ? 'موثق ✓' : 'قيد التوثيق'}</span>
                          </div>
                        </div>
                      </div>

                      <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div className="ap-form-group">
                          <label className="ap-form-label">اسم المستخدم <span style={{ color: '#ef4444' }}>*</span></label>
                          <input
                            className={`ap-form-input${profileErrors.userName ? ' ap-input-error' : ''}`}
                            value={profileForm.userName}
                            onChange={e => { setProfileForm(f => ({ ...f, userName: e.target.value })); setProfileErrors(p => ({ ...p, userName: '' })); }}
                            placeholder="الاسم الكامل"
                          />
                          {profileErrors.userName && <div className="ap-field-error"><i className="ti ti-alert-circle" />{profileErrors.userName}</div>}
                        </div>
                        <div className="ap-form-group">
                          <label className="ap-form-label">البريد الإلكتروني</label>
                          <input className="ap-form-input" value={user?.email || ''} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                        </div>
                        <div className="ap-form-group">
                          <label className="ap-form-label">رقم الهاتف</label>
                          <input
                            className={`ap-form-input${profileErrors.phone ? ' ap-input-error' : ''}`}
                            value={profileForm.phone}
                            onChange={e => { setProfileForm(f => ({ ...f, phone: e.target.value })); setProfileErrors(p => ({ ...p, phone: '' })); }}
                            placeholder="01012345678"
                          />
                          {profileErrors.phone && <div className="ap-field-error"><i className="ti ti-alert-circle" />{profileErrors.phone}</div>}
                        </div>
                        <div className="ap-form-group">
                          <label className="ap-form-label">العنوان</label>
                          <input
                            className={`ap-form-input${profileErrors.address ? ' ap-input-error' : ''}`}
                            value={profileForm.address}
                            onChange={e => { setProfileForm(f => ({ ...f, address: e.target.value })); setProfileErrors(p => ({ ...p, address: '' })); }}
                            placeholder="المدينة أو المنطقة"
                          />
                          {profileErrors.address && <div className="ap-field-error"><i className="ti ti-alert-circle" />{profileErrors.address}</div>}
                        </div>
                        <button type="submit" className="ap-action-btn approve" style={{ alignSelf: 'flex-start', padding: '8px 18px', marginTop: 8 }} disabled={settingsSaving}>
                          {settingsSaving ? <><i className="ti ti-loader-2 ti-spin" /> جاري الحفظ...</> : <><i className="ti ti-check" /> حفظ التغييرات</>}
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Panel 2: Password change */}
                  {settingsTab === 'password' && (
                    <div className="ap-settings-card">
                      <div className="ap-settings-card-title">
                        <div className="ap-settings-icon" style={{ background: 'rgba(240,67,112,0.14)', color: '#f04370' }}>
                          <i className="ti ti-shield-lock" />
                        </div>
                        تغيير كلمة المرور
                      </div>

                      <form onSubmit={savePassword} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div className="ap-form-group">
                          <label className="ap-form-label">كلمة المرور الحالية <span style={{ color: '#ef4444' }}>*</span></label>
                          <div style={{ position: 'relative' }}>
                            <input
                              className={`ap-form-input${passErrors.oldPassword ? ' ap-input-error' : ''}`}
                              type={showOldPass ? 'text' : 'password'}
                              value={passForm.oldPassword}
                              onChange={e => { setPassForm(f => ({ ...f, oldPassword: e.target.value })); setPassErrors(p => ({ ...p, oldPassword: '' })); }}
                              placeholder="••••••••"
                              style={{ paddingLeft: 38 }}
                            />
                            <button
                              type="button"
                              onClick={() => setShowOldPass(v => !v)}
                              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t4)', padding: 4 }}
                              title={showOldPass ? 'إخفاء' : 'إظهار'}
                            >
                              <i className={`ti ${showOldPass ? 'ti-eye-off' : 'ti-eye'}`} />
                            </button>
                          </div>
                          {passErrors.oldPassword && <div className="ap-field-error"><i className="ti ti-alert-circle" />{passErrors.oldPassword}</div>}
                        </div>
                        
                        <div className="ap-form-group">
                          <label className="ap-form-label">كلمة المرور الجديدة <span style={{ color: '#ef4444' }}>*</span></label>
                          <div style={{ position: 'relative' }}>
                            <input
                              className={`ap-form-input${passErrors.newPassword ? ' ap-input-error' : ''}`}
                              type={showNewPass ? 'text' : 'password'}
                              value={passForm.newPassword}
                              onChange={e => { setPassForm(f => ({ ...f, newPassword: e.target.value })); setPassErrors(p => ({ ...p, newPassword: '' })); }}
                              placeholder="••••••••"
                              style={{ paddingLeft: 38 }}
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPass(v => !v)}
                              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t4)', padding: 4 }}
                              title={showNewPass ? 'إخفاء' : 'إظهار'}
                            >
                              <i className={`ti ${showNewPass ? 'ti-eye-off' : 'ti-eye'}`} />
                            </button>
                          </div>
                          {passErrors.newPassword && <div className="ap-field-error"><i className="ti ti-alert-circle" />{passErrors.newPassword}</div>}
                        </div>

                        <div className="ap-form-group">
                          <label className="ap-form-label">تأكيد كلمة المرور الجديدة <span style={{ color: '#ef4444' }}>*</span></label>
                          <div style={{ position: 'relative' }}>
                            <input
                              className={`ap-form-input${passErrors.confirmPassword ? ' ap-input-error' : ''}`}
                              type={showConfirmPass ? 'text' : 'password'}
                              value={passForm.confirmPassword}
                              onChange={e => { setPassForm(f => ({ ...f, confirmPassword: e.target.value })); setPassErrors(p => ({ ...p, confirmPassword: '' })); }}
                              placeholder="••••••••"
                              style={{ paddingLeft: 38 }}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPass(v => !v)}
                              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t4)', padding: 4 }}
                              title={showConfirmPass ? 'إخفاء' : 'إظهار'}
                            >
                              <i className={`ti ${showConfirmPass ? 'ti-eye-off' : 'ti-eye'}`} />
                            </button>
                          </div>
                          {passErrors.confirmPassword && <div className="ap-field-error"><i className="ti ti-alert-circle" />{passErrors.confirmPassword}</div>}
                        </div>

                        <div style={{ fontSize: 11.5, color: 'var(--t4)', background: 'var(--surface2)', borderRadius: 8, padding: '8px 12px', lineHeight: 1.7 }}>
                          <i className="ti ti-info-circle" style={{ marginLeft: 4 }} />
                          يجب أن تحتوي كلمة المرور على حرف كبير، حرف صغير، رقم، وبطول 8 رموز على الأقل.
                        </div>

                        <button type="submit" className="ap-action-btn edit" style={{ alignSelf: 'flex-start', padding: '8px 18px', marginTop: 8 }} disabled={settingsSaving}>
                          {settingsSaving ? <><i className="ti ti-loader-2 ti-spin" /> جاري الحفظ...</> : <><i className="ti ti-key" /> تغيير كلمة المرور</>}
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Panel 3: Verification info (No National ID) */}
                  {settingsTab === 'license' && (
                    <div className="ap-settings-card">
                      <div className="ap-settings-card-title">
                        <div className="ap-settings-icon" style={{ background: 'rgba(59,130,246,0.14)', color: '#3b82f6' }}>
                          <i className="ti ti-shield-check" />
                        </div>
                        بيانات التحقق والتوثيق
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div className="ap-form-group">
                          <label className="ap-form-label">البريد الإلكتروني الموثق</label>
                          <input className="ap-form-input" value={user?.email || 'غير متوفر'} disabled style={{ opacity: 0.65, cursor: 'not-allowed', background: 'var(--surface2)' }} />
                        </div>
                        
                        <div className="ap-form-group">
                          <label className="ap-form-label">حالة التحقق والتوثيق</label>
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            background: user?.verify ? 'rgba(14,201,127,0.08)' : 'rgba(245,158,11,0.08)',
                            color: user?.verify ? '#0ec97f' : '#f59e0b',
                            padding: '10px 14px', borderRadius: 9, fontSize: 13, fontWeight: 700,
                            border: `1px solid ${user?.verify ? 'rgba(14,201,127,0.22)' : 'rgba(245,158,11,0.22)'}`
                          }}>
                            <i className={`ti ${user?.verify ? 'ti-shield-check' : 'ti-shield-pause'}`} style={{ fontSize: 17 }} />
                            {user?.verify ? 'البريد موثق والتحقق نشط ✓' : 'في انتظار التحقق والمراجعة'}
                          </div>
                        </div>

                        <div className="ap-form-group">
                          <label className="ap-form-label">معرّف الحساب (ID)</label>
                          <input className="ap-form-input" value={user?._id || '—'} disabled style={{ opacity: 0.65, cursor: 'not-allowed', background: 'var(--surface2)', fontFamily: 'monospace', fontSize: 11 }} />
                        </div>

                        <div className="ap-form-group">
                          <label className="ap-form-label">تاريخ التسجيل بالمنصة</label>
                          <input className="ap-form-input" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'} disabled style={{ opacity: 0.65, cursor: 'not-allowed', background: 'var(--surface2)' }} />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Panel 4: Danger Zone */}
                  {settingsTab === 'danger' && (
                    <div className="ap-settings-card ap-danger-card">
                      <div className="ap-settings-card-title" style={{ color: '#ef4444' }}>
                        <div className="ap-settings-icon" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
                          <i className="ti ti-alert-triangle" />
                        </div>
                        منطقة الخطر
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {/* تسجيل الخروج */}
                        <div className="ap-danger-row">
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--t1)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                              <i className="ti ti-logout" style={{ fontSize: 16, color: 'var(--t3)' }} />تسجيل الخروج
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--t3)', fontWeight: 500 }}>إنهاء الجلسة الحالية — يمكنك الدخول مجدداً في أي وقت.</div>
                          </div>
                          <button
                            type="button"
                            className="ap-danger-btn-logout"
                            onClick={handleLogoutConfirm}
                          >
                            <i className="ti ti-logout" /> تسجيل الخروج
                          </button>
                        </div>

                        {/* حذف الحساب */}
                        <div className="ap-danger-row ap-danger-row--delete">
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 13.5, color: '#ef4444', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                              <i className="ti ti-trash" style={{ fontSize: 16 }} />حذف الحساب نهائيًا
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--t3)', lineHeight: 1.6, fontWeight: 500 }}>
                              هذا الإجراء <strong style={{ color: 'var(--t2)', fontWeight: 800 }}>لا يمكن التراجع عنه</strong> — سيتم حذف جميع بياناتك وتبرعاتك بشكل كامل ودائم من المنصة.
                            </div>
                          </div>
                          <button
                            type="button"
                            className="ap-danger-btn-delete"
                            onClick={handleDeleteAccount}
                          >
                            <i className="ti ti-trash" /> حذف حسابي
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>}

          </div>{/* end ap-content */}
        <ScrollToTop containerRef={contentRef} />
        </main>

        {/* Mobile Navigation */}
        <MobileNav activeTab={tab} onTabChange={handleTabChange} />

        {/* Rating Modal */}
        {ratingDonation && (
          <RatingModal
            donationId={ratingDonation._id}
            donationType={ratingDonation.type}
            charityName={getCharityName(ratingDonation)}
            onClose={() => setRatingDonation(null)}
            onSuccess={() => handleRatingSuccess(ratingDonation._id)}
          />
        )}

        {/* Read-Only Rating View Modal */}
        {viewingRating && (
          <div className="ap-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setViewingRating(null); }} style={{ zIndex: 9999 }}>
            <div className="ap-modal">
              <div className="ap-modal-inner" style={{ textAlign: 'right' }}>
                <div className="ap-modal-icon" style={{ background: 'rgba(244,161,24,0.14)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="ti ti-star" style={{ color: '#f59e0b', fontSize: 22 }} />
                </div>
                <h3 className="ap-modal-title" style={{ textAlign: 'center', fontSize: 16 }}>تقييمك للجمعية</h3>
                <p className="ap-modal-msg" style={{ textAlign: 'center', marginBottom: 16 }}>التقييم الذي قمت بتقديمه لهذه الجمعية</p>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 20, direction: 'ltr' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <span 
                      key={star} 
                      style={{ 
                        fontSize: 28, 
                        color: star <= viewingRating.rating ? '#f59e0b' : 'var(--t4)',
                        lineHeight: 1
                      }}
                    >
                      {star <= viewingRating.rating ? '★' : '☆'}
                    </span>
                  ))}
                </div>

                {viewingRating.comment && (
                  <div className="ap-form-group" style={{ marginBottom: 12 }}>
                    <label className="ap-form-label">تعليقك ورأيك:</label>
                    <div style={{ background: 'var(--surface2)', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)', color: 'var(--t1)', fontSize: 13, lineHeight: 1.6 }}>
                      {viewingRating.comment}
                    </div>
                  </div>
                )}

                <div className="ap-modal-actions" style={{ justifyContent: 'center', marginTop: 8 }}>
                  <button type="button" className="ap-btn-prev" onClick={() => setViewingRating(null)} style={{ margin: 0, padding: '8px 24px' }}>إغلاق</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Report Modal */}
        {showReport && (
          <div
            className="ap-modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="الإبلاغ عن مشكلة"
            onClick={e => { if (e.target === e.currentTarget) setShowReport(false); }}
          >
            <div className="ap-modal">
              <div className="ap-modal-inner">
                <div className="ap-modal-icon" style={{ background: 'var(--red-dim)', margin: '0 auto 16px' }}>
                  <i className="ti ti-alert-triangle" style={{ color: 'var(--red)' }} />
                </div>
                <h3 className="ap-modal-title">الإبلاغ عن مشكلة</h3>
                <p className="ap-modal-msg">سيتم مراجعة بلاغك من قِبل فريق الإدارة في أقرب وقت</p>

                {reportMsg && (
                  <div
                    className={`ud-alert ${reportMsg.type === 'success' ? 'ud-alert-ok' : 'ud-alert-err'}`}
                    role="alert"
                    style={{ marginBottom: 14, padding: '10px 14px', fontSize: 13 }}
                  >
                    <i className={`ti ${reportMsg.type === 'success' ? 'ti-circle-check' : 'ti-alert-circle'}`} />
                    {reportMsg.text}
                  </div>
                )}

                <form onSubmit={handleReport} noValidate>
                  <div className="ap-form-group" style={{ marginBottom: 8, textAlign: 'right' }}>
                    <label className="ap-form-label" htmlFor="report-ta">
                      وصف المشكلة <span style={{ color: 'var(--red)' }}>*</span>
                    </label>
                    <textarea
                      id="report-ta"
                      className="ap-form-textarea"
                      value={reportText}
                      onChange={e => setReportText(e.target.value)}
                      rows={4}
                      minLength={10}
                      maxLength={500}
                      placeholder="اشرح المشكلة بالتفصيل…"
                      required
                    />
                    <div style={{ fontSize: 11, color: 'var(--t4)', textAlign: 'left', marginTop: 4 }}>{reportText.length} / 500</div>
                  </div>
                  <div className="ap-modal-actions" style={{ justifyContent: 'flex-end', marginTop: 12 }}>
                    <button type="button" className="ap-modal-cancel" onClick={() => setShowReport(false)}>إلغاء</button>
                    <button
                      type="submit"
                      className="ap-modal-confirm"
                      style={{ background: 'var(--red)' }}
                      disabled={reportLoading || reportText.trim().length < 10}
                    >
                      {reportLoading
                        ? <><i className="ti ti-loader-2 ti-spin" /> جاري الإرسال…</>
                        : <><i className="ti ti-send-2" /> إرسال البلاغ</>
                      }
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Custom Confirmation Modal */}
        <ConfirmModal
          opts={confirmOpts}
          loading={confirmLoading}
          onClose={() => { if (!confirmLoading) setConfirmOpts(null); }}
        />

        {/* Toast */}
        {toast && (
          <div className={`ap-toast ${toast.type}`} style={{ zIndex: 9999 }}>
            <i className={`ti ${toast.type === 'success' ? 'ti-circle-check' : 'ti-alert-circle'}`} />
            {toast.text}
          </div>
        )}
      </div>
    </>
  );
  
}
