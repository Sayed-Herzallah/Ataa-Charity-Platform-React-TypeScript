import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'wouter';
import {
  AreaChart, Area,
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList,
} from 'recharts';
import AIChatEmbed from '../components/shared/AIChatEmbed';
import { request, notificationApi } from '../services';
import type { Notification } from '../services';
import '../styles/css/CharityDashboard.css';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CONFIG & TYPES (Logic Preserved 100%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const apiFetch = request;
interface DashboardStats { Total_Donations: number; Pending_Donations: number; Accepted_Donations: number; Rejected_Donations: number; }
interface DonorObj { _id: string; userName?: string; name?: string; phone?: string; address?: string; }
interface Donation { _id: string; type: string; size?: string; quantity?: number; description?: string; condition?: string; status: 'pending' | 'accepted' | 'rejected'; createdAt: string; imageUrl?: Array<{ secure_url: string }>; donorId?: DonorObj | string | null; }
type Tab = 'stats' | 'donations' | 'requests' | 'automation' | 'chat' | 'settings';
type DonView = 'cards' | 'table';

const STATUS_CFG = { pending: { label: 'قيد المراجعة', bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', dot: '#f59e0b' }, accepted: { label: 'مقبول', bg: 'rgba(16,185,129,0.12)', color: '#10b981', dot: '#10b981' }, rejected: { label: 'مرفوض', bg: 'rgba(239,68,68,0.12)', color: '#ef4444', dot: '#ef4444' } } as const;
const CHART_COLORS = { pending: '#f59e0b', accepted: '#10b981', rejected: '#ef4444' };
const MONTHS_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

function parseDonor(donorId: DonorObj | string | null | undefined) {
  if (!donorId) return { name: '—', phone: '—', address: '—', initial: 'م' };
  if (typeof donorId === 'string') return { name: `#${donorId.slice(-4)}`, phone: '—', address: '—', initial: 'م' };
  const name = donorId.userName || donorId.name || '—';
  return { name, phone: donorId.phone || '—', address: donorId.address || '—', initial: name !== '—' ? name.trim()[0]?.toUpperCase() || 'م' : 'م' };
}

const fmt12 = (val?: string | null): string => {
  if (!val) return '—';
  const d = new Date(val);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ADMIN-EXACT UI COMPONENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
// ─── Notification Bell Component ────────────────────────────────────────────
function NotificationBell({ notifications, unreadCount, onMarkRead, onMarkAllRead, onDelete, loading }: {
  notifications: Notification[];
  unreadCount: number;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDelete: (id: string) => void;
  loading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const getNotifIcon = (type: Notification['type']) => {
    const map: Record<string, string> = {
      donation: 'ti-gift',
      report:   'ti-alert-circle',
      approval: 'ti-circle-check',
      rejection:'ti-circle-x',
      admin_message: 'ti-message-circle',
      system:   'ti-settings',
      reminder: 'ti-alarm',
    };
    return map[type] ?? 'ti-bell';
  };
  const getNotifColor = (type: Notification['type']) => {
    const map: Record<string, string> = {
      donation:      '#0ec97f',
      report:        '#f59e0b',
      approval:      '#0ec97f',
      rejection:     '#f04370',
      admin_message: '#3b82f6',
      system:        '#8b5cf6',
      reminder:      '#f59e0b',
    };
    return map[type] ?? '#3b82f6';
  };

  const [notifFilter, setNotifFilter] = useState<'all' | 'unread'>('all');
  const displayedNotifs = notifFilter === 'unread'
    ? notifications.filter(n => n.status === 'unread')
    : notifications;

  return (
    <div className="cd-notif-wrap" ref={ref}>
      <button
        className={`ap-header-icon-btn cd-notif-btn${unreadCount > 0 ? ' cd-notif-btn--pulse' : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-label={`الإشعارات${unreadCount > 0 ? ` - ${unreadCount} غير مقروء` : ''}`}
        title="الإشعارات"
      >
        <i className="ti ti-bell" />
        {unreadCount > 0 && (
          <span className="cd-notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="cd-notif-dropdown">
          <div className="cd-notif-header">
            <div className="cd-notif-title">
              <i className="ti ti-bell" />
              الإشعارات
              {unreadCount > 0 && <span className="cd-notif-count">{unreadCount}</span>}
            </div>
            {unreadCount > 0 && (
              <button className="cd-notif-mark-all" onClick={onMarkAllRead}>
                <i className="ti ti-checks" /> تحديد الكل كمقروء
              </button>
            )}
          </div>

          {/* Filter tabs */}
          <div className="cd-notif-filter-tabs">
            <button
              className={`cd-notif-filter-tab${notifFilter === 'all' ? ' active' : ''}`}
              onClick={() => setNotifFilter('all')}
            >الكل ({notifications.length})</button>
            <button
              className={`cd-notif-filter-tab${notifFilter === 'unread' ? ' active' : ''}`}
              onClick={() => setNotifFilter('unread')}
            >غير مقروءة ({unreadCount})</button>
          </div>

          <div className="cd-notif-list">
            {loading ? (
              <div className="cd-notif-loading">
                <i className="ti ti-loader-2 ti-spin" />
                <span>جاري التحميل...</span>
              </div>
            ) : displayedNotifs.length === 0 ? (
              <div className="cd-notif-empty">
                <i className="ti ti-bell-off" style={{ fontSize: 28 }} />
                <span>{notifFilter === 'unread' ? 'لا توجد إشعارات غير مقروءة' : 'لا توجد إشعارات بعد'}</span>
                {notifFilter === 'unread' && notifications.length > 0 && (
                  <span style={{ fontSize: 11, color: 'var(--t4)', marginTop: 4 }}>كل الإشعارات مقروءة ✓</span>
                )}
              </div>
            ) : (() => {
              // Group by today/yesterday/older
              const now = new Date();
              const groups: Record<string, typeof displayedNotifs> = { today: [], yesterday: [], older: [] };
              displayedNotifs.slice(0, 20).forEach(n => {
                const d = new Date(n.createdAt);
                const diffDays = Math.floor((now.setHours(0,0,0,0) - d.setHours(0,0,0,0)) / 86400000);
                if (diffDays === 0) groups.today.push(n);
                else if (diffDays === 1) groups.yesterday.push(n);
                else groups.older.push(n);
              });
              const labels: Record<string, string> = { today: 'اليوم', yesterday: 'الأمس', older: 'أقدم' };
              return (['today','yesterday','older'] as const).map(gk => (
                groups[gk].length > 0 && (
                  <div key={gk}>
                    <div style={{ padding: '8px 14px 4px', fontSize: 10, fontWeight: 800, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: 0.8, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{labels[gk]}</span>
                      <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                    </div>
                    {groups[gk].map(n => (
                      <div
                        key={n._id}
                        className={`cd-notif-item${n.status === 'unread' ? ' unread' : ''}`}
                        onClick={() => n.status === 'unread' && onMarkRead(n._id)}
                        style={{ transition: 'all 0.25s ease' }}
                      >
                        <div className="cd-notif-item-icon" style={{ background: `${getNotifColor(n.type)}18`, color: getNotifColor(n.type) }}>
                          <i className={`ti ${getNotifIcon(n.type)}`} />
                        </div>
                        <div className="cd-notif-item-body">
                          {n.title && <div className="cd-notif-item-title">{n.title}</div>}
                          <div className="cd-notif-item-msg">{n.message}</div>
                          <div className="cd-notif-item-time">
                            <i className="ti ti-clock" />
                            {new Date(n.createdAt).toLocaleString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                          </div>
                        </div>
                        {n.status === 'unread' && <div className="cd-notif-unread-dot" style={{ boxShadow: `0 0 6px ${getNotifColor(n.type)}` }} />}
                        <button
                          className="cd-notif-del-btn"
                          onClick={e => { e.stopPropagation(); onDelete(n._id); }}
                          title="حذف"
                        >
                          <i className="ti ti-x" />
                        </button>
                      </div>
                    ))}
                  </div>
                )
              ));
            })()}
          </div>

          {displayedNotifs.length > 15 && (
            <div className="cd-notif-footer">
              <span style={{ fontSize: 11, color: 'var(--t4)' }}>عرض أحدث 15 إشعار</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Sidebar({ activeTab, onTabChange, userName, pendingCount, collapsed, onToggle, onLogout }: any) {
  const NAV = [
    { id:'stats',      label:'نظرة عامة',       icon:'ti-layout-dashboard'    },
    { id:'donations',  label:'كل التبرعات',      icon:'ti-packages'            },
    { id:'requests',   label:'الطلبات المعلقة', icon:'ti-clock-exclamation'   },
    { id:'automation', label:'التشغيل التلقائي', icon:'ti-settings-automation' },
    { id:'settings',   label:'الإعدادات',        icon:'ti-settings'            },
    { id:'chat',       label:'مساعد عطاء',       icon:'ti-robot'               },
  ];
  const [sidebarClock, setSidebarClock] = useState(() =>
    new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })
  );
  useEffect(() => {
    const id = setInterval(() =>
      setSidebarClock(new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })),
    30000);
    return () => clearInterval(id);
  }, []);
  return (
    <aside className={`ap-sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="ap-sidebar-brand">
        <div className="ap-brand-icon"><i className="ti ti-building-community" /></div>
        {!collapsed && <span className="ap-brand-title">لوحة الجمعية</span>}
        <button className="ap-collapse-btn" onClick={onToggle} title={collapsed ? 'توسيع' : 'طي'}>
          <i className={`ti ${collapsed ? 'ti-layout-sidebar-right-expand' : 'ti-layout-sidebar-right-collapse'}`} />
        </button>
      </div>
      {!collapsed && (
        <div className="ap-live-pill">
          <span className="ap-live-dot" />
          <span>مباشر</span>
          <span className="ap-live-time">{sidebarClock}</span>
        </div>
      )}
      <nav className="ap-sidebar-nav">
        {NAV.map(item => (
          <button
            key={item.id}
            className={`ap-nav-item${activeTab === item.id ? ' active' : ''}`}
            onClick={() => onTabChange(item.id)}
            title={collapsed ? item.label : undefined}
          >
            <span className="ap-nav-icon-wrap">
              <i className={`ti ${item.icon}`} />
              {item.id === 'requests' && pendingCount > 0 && (
                <span className="ap-nav-badge">{pendingCount}</span>
              )}
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
              <span className="ap-user-role">مسؤول الجمعية</span>
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

function MobileNav({ activeTab, onTabChange, pendingCount }: any) {
  const NAV = [
    { id:'stats',      icon:'ti-layout-dashboard',   label:'الرئيسية' },
    { id:'donations',  icon:'ti-packages',            label:'التبرعات' },
    { id:'requests',   icon:'ti-clock-exclamation',   label:'معلقة'    },
    { id:'chat',       icon:'ti-robot',               label:'مساعد'    },
    { id:'settings',   icon:'ti-settings',            label:'إعدادات'  },
  ];
  return (
    <nav className="ap-mobile-nav">
      {NAV.map((item: any) => (
        <button key={item.id} className={`ap-mobile-nav-item${activeTab === item.id ? ' active' : ''}`} onClick={() => onTabChange(item.id)}>
          <span className="ap-nav-icon-wrap"><i className={`ti ${item.icon}`} />{item.id === 'requests' && pendingCount > 0 && <span className="ap-nav-badge">{pendingCount}</span>}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   REPORT MODAL (Admin-identical design)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function ReportModal({ onClose }: { onClose: () => void }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const send = async () => {
    if (text.trim().length < 10) { setMsg({ ok: false, text: 'يجب كتابة 10 أحرف على الأقل' }); return; }
    setLoading(true); setMsg(null);
    try {
      await apiFetch('/report', { method: 'POST', body: JSON.stringify({ description: text.trim() }) });
      setMsg({ ok: true, text: 'تم إرسال البلاغ بنجاح، سيتم مراجعته قريباً' });
      setText('');
      setTimeout(() => onClose(), 2200);
    } catch (err: unknown) {
      setMsg({ ok: false, text: (err instanceof Error ? err.message : null) || 'حدث خطأ، حاول مرة أخرى' });
    } finally { setLoading(false); }
  };

  return (
    <div className="ap-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ap-modal">
        <div className="ap-modal-inner">
          <div className="ap-modal-icon" style={{ background: 'var(--red-dim)', margin: '0 auto 16px' }}>
            <i className="ti ti-alert-octagon" style={{ color: 'var(--red)' }} />
          </div>
          <h3 className="ap-modal-title">الإبلاغ عن مشكلة</h3>
          <p className="ap-modal-msg">سيتم مراجعة بلاغك من قِبل فريق الإدارة في أقرب وقت ممكن</p>
          {msg && (
            <div className={`ap-error-banner${msg.ok ? ' ap-toast-success' : ''}`} style={{ marginBottom: 14, padding: '10px 14px', fontSize: 13 }}>
              <i className={`ti ${msg.ok ? 'ti-circle-check' : 'ti-alert-circle'}`} />{msg.text}
            </div>
          )}
          <div className="ap-form-group" style={{ marginBottom: 8, textAlign: 'right' }}>
            <label className="ap-form-label">وصف المشكلة <span style={{ color: 'var(--red)' }}>*</span></label>
            <textarea className="ap-form-textarea" value={text} onChange={e => setText(e.target.value)} rows={4} maxLength={500} placeholder="اشرح المشكلة بالتفصيل…" />
            <div style={{ fontSize: 11, color: 'var(--t4)', textAlign: 'left', marginTop: 4 }}>{text.length} / 500</div>
          </div>
          <div className="ap-modal-actions" style={{ justifyContent: 'flex-end', marginTop: 12 }}>
            <button className="ap-modal-cancel" onClick={onClose}>إغلاق</button>
            <button className="ap-modal-confirm" style={{ background: 'var(--red)' }} onClick={send} disabled={loading || text.trim().length < 10}>
              {loading ? <><i className="ti ti-loader-2 ti-spin" /> جاري الإرسال…</> : <><i className="ti ti-send-2" /> إرسال البلاغ</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PAGE SKELETON (Exact match to AdminPanel PageSkeleton)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function CharityPageSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div className="ap-kpi-grid">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="ap-kpi-card">
            <div className="ap-skel" style={{ width: 40, height: 40, borderRadius: 10, marginBottom: 14 }} />
            <div className="ap-skel" style={{ height: 28, width: 80, marginBottom: 8 }} />
            <div className="ap-skel" style={{ height: 12, width: 110 }} />
          </div>
        ))}
      </div>
      <div className="ap-charts-row">
        {[1, 2].map(i => (
          <div key={i} className="ap-chart-card">
            <div className="ap-skel" style={{ height: 14, width: 140, marginBottom: 18 }} />
            <div className="ap-skel" style={{ height: 200, width: '100%', borderRadius: 8 }} />
          </div>
        ))}
      </div>
      <div className="ap-charts-row">
        <div className="ap-chart-card">
          <div className="ap-skel" style={{ height: 14, width: 120, marginBottom: 18 }} />
          <div className="ap-skel" style={{ height: 180, width: '100%', borderRadius: 8 }} />
        </div>
        <div className="ap-chart-card">
          <div className="ap-skel" style={{ height: 14, width: 100, marginBottom: 14 }} />
          <div className="ap-skel" style={{ height: 44, width: 44, borderRadius: 11, marginBottom: 12 }} />
          <div className="ap-skel" style={{ height: 16, width: '60%', marginBottom: 8 }} />
          <div className="ap-skel" style={{ height: 12, width: '80%', marginBottom: 18 }} />
          <div className="ap-skel" style={{ height: 36, width: '100%', borderRadius: 8 }} />
        </div>
      </div>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   DONATION DETAIL PANEL (Admin-identical design)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   DONATION TIMELINE COMPONENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function DonationTimeline({ status, createdAt }: { status: string; createdAt: string }) {
  const steps = [
    { id: 'submitted', label: 'تم التقديم', icon: 'ti-send', desc: 'استلمنا طلب التبرع', date: createdAt },
    { id: 'pending',   label: 'قيد المراجعة', icon: 'ti-eye', desc: 'يتم مراجعة التبرع حالياً' },
    { id: 'decision',  label: 'القرار',     icon: status === 'accepted' ? 'ti-circle-check' : status === 'rejected' ? 'ti-circle-x' : 'ti-clock-pause',
      desc: status === 'accepted' ? 'تم قبول التبرع بنجاح' : status === 'rejected' ? 'تم رفض التبرع' : 'في انتظار القرار' },
  ];

  const activeIdx = status === 'accepted' || status === 'rejected' ? 2 : 1;

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 18 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
        <i className="ti ti-timeline" style={{ fontSize: 14 }} /> مسار التبرع
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {steps.map((step, i) => {
          const isActive = i <= activeIdx;
          const isCurrent = i === activeIdx;
          const color = isCurrent && status === 'rejected' ? '#ef4444' : isActive ? '#0ec97f' : 'var(--t4)';
          return (
            <div key={step.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', position: 'relative' }}>
              {/* Line */}
              {i < steps.length - 1 && (
                <div style={{ position: 'absolute', right: 17, top: 34, width: 2, height: 'calc(100% - 14px)', background: i < activeIdx ? '#0ec97f' : 'var(--border)', transition: 'background 0.3s' }} />
              )}
              {/* Icon */}
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0, zIndex: 1,
                background: isActive ? `${color}18` : 'var(--surface2)',
                border: `2px solid ${isActive ? color : 'var(--border)'}`,
                color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
                transition: 'all 0.3s',
                boxShadow: isCurrent ? `0 0 0 4px ${color}18` : 'none',
              }}>
                <i className={`ti ${step.icon}`} />
              </div>
              {/* Content */}
              <div style={{ flex: 1, paddingBottom: i < steps.length - 1 ? 20 : 0 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: isActive ? 'var(--t1)' : 'var(--t4)' }}>{step.label}</div>
                <div style={{ fontSize: 11.5, color: 'var(--t3)', marginTop: 2 }}>{step.desc}</div>
                {step.date && isActive && (
                  <div style={{ fontSize: 10.5, color: 'var(--t4)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <i className="ti ti-calendar-event" />
                    {new Date(step.date).toLocaleString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DonationDetailPanel({ donation: d, onBack, onAction, actionLoading }: {
  donation: Donation;
  onBack: () => void;
  onAction: (id: string, status: 'accepted' | 'rejected') => void;
  actionLoading: string | null;
}) {
  const sc = STATUS_CFG[d.status];
  const donor = parseDonor(d.donorId);
  const images = d.imageUrl || [];
  const [imgIdx, setImgIdx] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const isAcc = actionLoading === `${d._id}-accepted`;
  const isRej = actionLoading === `${d._id}-rejected`;
  const busy = isAcc || isRej;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* ── Detail Header Card ── */}
      <div style={{ background: 'linear-gradient(135deg, rgba(14,201,127,0.12) 0%, rgba(14,201,127,0.03) 100%)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '22px 26px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <div className="ap-entity-avatar charity" style={{ width: 54, height: 54, fontSize: 22, borderRadius: 14 }}>
            <i className="ti ti-package" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--t1)', marginBottom: 4 }}>{d.type}</div>
            <span className="ap-badge" style={{ background: sc.bg, color: sc.color }}>
              <span className="ap-badge-dot" style={{ background: sc.dot }} />
              {sc.label}
            </span>
            <div style={{ fontSize: 11.5, color: 'var(--t4)', marginTop: 6 }}>
              <i className="ti ti-calendar" style={{ marginLeft: 4 }} />{fmt12(d.createdAt)}
            </div>
          </div>
        </div>
        <button className="ap-modal-cancel" style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={onBack}>
          <i className="ti ti-arrow-right" /> رجوع
        </button>
      </div>

      {/* ── Timeline ── */}
      <DonationTimeline status={d.status} createdAt={d.createdAt} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        {/* ── Images Column ── */}
        {images.length > 0 && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="ti ti-photo" style={{ fontSize: 14 }} /> الصور ({images.length})
            </div>
            <img
              src={images[imgIdx].secure_url}
              alt=""
              onClick={() => setZoomOpen(true)}
              style={{ width: '100%', height: 220, objectFit: 'cover', borderRadius: 10, border: '1px solid var(--border)', display: 'block', cursor: 'zoom-in', transition: 'opacity 0.15s' }}
            />
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 7, marginTop: 10, flexWrap: 'wrap' }}>
                {images.map((img, i) => (
                  <img
                    key={i}
                    src={img.secure_url}
                    alt=""
                    onClick={() => setImgIdx(i)}
                    style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', border: `2px solid ${i === imgIdx ? 'var(--teal)' : 'var(--border)'}`, transition: 'border-color 0.15s' }}
                  />
                ))}
              </div>
            )}
          </div>
          )}

          {/* Image Zoom Modal */}
          {zoomOpen && images.length > 0 && (
            <div
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}
              onClick={() => setZoomOpen(false)}
            >
              <button style={{ position: 'absolute', top: 20, right: 20, width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={() => setZoomOpen(false)}>
                <i className="ti ti-x" />
              </button>
              {images.length > 1 && (
                <>
                  <button style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={e => { e.stopPropagation(); setImgIdx(prev => (prev - 1 + images.length) % images.length); }}>
                    <i className="ti ti-chevron-left" />
                  </button>
                  <button style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onClick={e => { e.stopPropagation(); setImgIdx(prev => (prev + 1) % images.length); }}>
                    <i className="ti ti-chevron-right" />
                  </button>
                </>
              )}
              <img
                src={images[imgIdx].secure_url}
                alt=""
                onClick={e => e.stopPropagation()}
                style={{ maxWidth: '90vw', maxHeight: '88vh', borderRadius: 12, objectFit: 'contain', boxShadow: '0 24px 80px rgba(0,0,0,0.6)', cursor: 'default' }}
              />
              {images.length > 1 && (
                <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 7 }}>
                  {images.map((_, i) => (
                    <div key={i} onClick={e => { e.stopPropagation(); setImgIdx(i); }}
                      style={{ width: 8, height: 8, borderRadius: '50%', background: i === imgIdx ? '#fff' : 'rgba(255,255,255,0.35)', cursor: 'pointer', transition: 'background 0.15s' }}
                    />
                  ))}
                </div>
              )}
              
            </div>
          )}

        {/* ── Donation Info ── */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="ti ti-info-circle" style={{ fontSize: 14 }} /> تفاصيل التبرع
          </div>
          <div className="ap-detail-section">
            <div className="ap-detail-row">
              <div className="ap-detail-row-icon"><i className="ti ti-fingerprint" /></div>
              <span className="ap-detail-row-label">المعرف</span>
              <span className="ap-detail-row-val mono" style={{ fontSize: 10.5 }}>{d._id}</span>
            </div>
            <div className="ap-detail-row">
              <div className="ap-detail-row-icon"><i className="ti ti-tag" /></div>
              <span className="ap-detail-row-label">النوع</span>
              <span className="ap-detail-row-val">{d.type}</span>
            </div>
            {d.quantity != null && (
              <div className="ap-detail-row">
                <div className="ap-detail-row-icon"><i className="ti ti-package" /></div>
                <span className="ap-detail-row-label">الكمية</span>
                <span className="ap-detail-row-val">{d.quantity} قطعة</span>
              </div>
            )}
            {d.size && (
              <div className="ap-detail-row">
                <div className="ap-detail-row-icon"><i className="ti ti-ruler" /></div>
                <span className="ap-detail-row-label">الحجم</span>
                <span className="ap-detail-row-val">{d.size}</span>
              </div>
            )}
            {d.condition && (
              <div className="ap-detail-row">
                <div className="ap-detail-row-icon"><i className="ti ti-star" /></div>
                <span className="ap-detail-row-label">الحالة</span>
                <span className="ap-detail-row-val">{d.condition}</span>
              </div>
            )}
            <div className="ap-detail-row">
              <div className="ap-detail-row-icon"><i className="ti ti-circle-dot" /></div>
              <span className="ap-detail-row-label">الحالة</span>
              <span className="ap-badge" style={{ background: sc.bg, color: sc.color }}>
                <span className="ap-badge-dot" style={{ background: sc.dot }} />{sc.label}
              </span>
            </div>
            <div className="ap-detail-row">
              <div className="ap-detail-row-icon"><i className="ti ti-calendar" /></div>
              <span className="ap-detail-row-label">التاريخ</span>
              <span className="ap-detail-row-val">{fmt12(d.createdAt)}</span>
            </div>
          </div>

          {d.description && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="ti ti-file-description" style={{ fontSize: 14 }} /> الوصف
              </div>
              <div className="ap-report-full-body">{d.description}</div>
            </div>
          )}
        </div>

        {/* ── Donor Info ── */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="ti ti-user" style={{ fontSize: 14 }} /> بيانات المتبرع
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
            <div className="ap-table-avatar" style={{ width: 42, height: 42, fontSize: 16, borderRadius: 11 }}>{donor.initial}</div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--t1)', fontSize: 14 }}>{donor.name}</div>
              {donor.address !== '—' && <div style={{ fontSize: 12, color: 'var(--t3)' }}><i className="ti ti-map-pin" style={{ marginLeft: 3 }} />{donor.address}</div>}
            </div>
          </div>
          <div className="ap-detail-section">
            {donor.phone !== '—' && (
              <div className="ap-detail-row">
                <div className="ap-detail-row-icon"><i className="ti ti-phone" /></div>
                <span className="ap-detail-row-label">الهاتف</span>
                <span className="ap-detail-row-val">{donor.phone}</span>
              </div>
            )}
            {donor.address !== '—' && (
              <div className="ap-detail-row">
                <div className="ap-detail-row-icon"><i className="ti ti-map-pin" /></div>
                <span className="ap-detail-row-label">العنوان</span>
                <span className="ap-detail-row-val">{donor.address}</span>
              </div>
            )}
            {typeof d.donorId === 'object' && d.donorId !== null && (d.donorId as any)._id && (
              <div className="ap-detail-row">
                <div className="ap-detail-row-icon"><i className="ti ti-fingerprint" /></div>
                <span className="ap-detail-row-label">معرف المتبرع</span>
                <span className="ap-detail-row-val mono" style={{ fontSize: 10.5 }}>{(d.donorId as any)._id}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Actions ── */}
      {d.status === 'pending' && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="ti ti-player-play" style={{ fontSize: 14 }} /> اتخاذ قرار
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="ap-action-btn approve" style={{ flex: 1, justifyContent: 'center', padding: '12px 20px' }} disabled={busy} onClick={() => onAction(d._id, 'accepted')}>
              {isAcc ? <i className="ti ti-loader-2 ti-spin" /> : <i className="ti ti-check" />}
              {isAcc ? 'جاري القبول…' : 'قبول التبرع'}
            </button>
            <button className="ap-action-btn reject" style={{ flex: 1, justifyContent: 'center', padding: '12px 20px' }} disabled={busy} onClick={() => onAction(d._id, 'rejected')}>
              {isRej ? <i className="ti ti-loader-2 ti-spin" /> : <i className="ti ti-x" />}
              {isRej ? 'جاري الرفض…' : 'رفض التبرع'}
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <button className="ap-modal-cancel" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px' }} onClick={onBack}>
          <i className="ti ti-arrow-right" /> العودة للقائمة
        </button>
      </div>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN DASHBOARD (Logic Preserved, UI 1:1 Admin)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function CharityDashboard() {
  const { user, isLoading: authLoading, logout } = useAuth() as any;
  const [, setLocation] = useLocation();

  // ── State (Preserved) ──
  const [tab, setTab] = useState<Tab>('stats');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [allDonations, setAllDonations] = useState<Donation[]>([]);
  const [pendingReqs, setPendingReqs] = useState<Donation[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [cronLoading, setCronLoading] = useState(false);
  const [cronMessage, setCronMessage] = useState<string | null>(null);
  const [cronLog, setCronLog] = useState<Array<{ type: 'success' | 'error'; text: string; time: string }>>(() => { try { return JSON.parse(localStorage.getItem('ap-cron-log') || '[]'); } catch { return []; } });
  const [lastRun, setLastRun] = useState<string | null>(() => { try { return localStorage.getItem('ap-cron-lastrun'); } catch { return null; } });

  // ── Scheduler State ──
  const todayStr = new Date().toISOString().split('T')[0];
  const nowTimeStr = (() => { const d = new Date(); d.setMinutes(d.getMinutes() + 1); return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; })();
  const [schedInput, setSchedInput] = useState({ date: todayStr, time: nowTimeStr, seconds: '00' });
  // nextRunTime persisted: restore on mount and re-schedule if still in future
  const [nextRunTime, setNextRunTime] = useState<string | null>(null);
  const [schedulerTimer, setSchedulerTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  // adminReport cron state
  const [adminCronLoading, setAdminCronLoading] = useState(false);
  const [adminCronMessage, setAdminCronMessage] = useState<string | null>(null);
  const [adminSchedInput, setAdminSchedInput] = useState({ date: todayStr, time: nowTimeStr, seconds: '00' });
  const [adminNextRunTime, setAdminNextRunTime] = useState<string | null>(null);
  const [adminSchedulerTimer, setAdminSchedulerTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [searchQ, setSearchQ] = useState('');
  const [donView, setDonView] = useState<DonView>('cards');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const ITEMS_PER_PAGE = 12;
  const [isDark, setIsDark] = useState(() => { try { return (localStorage.getItem('ap-theme') || 'dark') === 'dark'; } catch { return true; } });
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => { try { return localStorage.getItem('ap-sidebar-collapsed') === 'true'; } catch { return false; } });
  const [profileForm, setProfileForm] = useState({ userName: '', phone: '', address: '' });
  const [passForm, setPassForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [liveTime, setLiveTime] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // ── Notifications State ──
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  const fetchNotifications = useCallback(async () => {
    setNotifLoading(true);
    try {
      const res = await notificationApi.getAll() as any;
      const notifs: Notification[] = res?.notifications || res?.data || [];
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
    try {
      await Promise.allSettled(unread.map(n => notificationApi.markRead(n._id)));
      setNotifications(prev => prev.map(n => ({ ...n, status: 'read' as const })));
    } catch { /* ignore */ }
  }, [notifications]);

  const handleDeleteNotif = useCallback(async (id: string) => {
    try {
      await notificationApi.delete(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch { /* ignore */ }
  }, []);

  // ── Theme Sync (Exact Admin Logic) ──
  useEffect(() => {
    try { localStorage.setItem('ap-theme', isDark ? 'dark' : 'light'); document.body.classList.toggle('ap-light-theme', !isDark); } catch {}
    return () => { document.body.classList.remove('ap-light-theme'); };
  }, [isDark]);

  // ── Live Clock ──
  useEffect(() => {
    const tick = () => setLiveTime(new Date().toLocaleString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);

  // ── Scroll-to-top inside dashboard content ──
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const onScroll = () => setShowScrollTop(el.scrollTop > 300);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const showToast = (type: 'success' | 'error', text: string) => { setToast({ type, text }); setTimeout(() => setToast(null), 3200); };

  // ── Fetch & Handlers (Preserved 100%) ──
  const fetchAll = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [statsRes, donationsRes, requestsRes] = await Promise.allSettled([
        apiFetch('/dashboard/stats'), apiFetch('/dashboard/donations?page=1&limit=100'), apiFetch('/dashboard/requests?page=1&limit=100'),
      ]);
      const donationsFromApi = donationsRes.status === 'fulfilled' && donationsRes.value.success ? donationsRes.value.donations || [] : [];
      if (statsRes.status === 'fulfilled' && statsRes.value.success) {
        const apiStats = statsRes.value.stats as DashboardStats;
        const liveCounts = donationsFromApi.reduce((acc: any, d: any) => { acc.total++; acc[d.status]++; return acc; }, { total: 0, pending: 0, accepted: 0, rejected: 0 });
        setStats({ ...apiStats, Total_Donations: donationsFromApi.length ? liveCounts.total : apiStats.Total_Donations, Pending_Donations: donationsFromApi.length ? liveCounts.pending : apiStats.Pending_Donations, Accepted_Donations: donationsFromApi.length ? liveCounts.accepted : apiStats.Accepted_Donations, Rejected_Donations: donationsFromApi.length ? liveCounts.rejected : apiStats.Rejected_Donations });
      }
      setAllDonations(donationsFromApi);
      if (requestsRes.status === 'fulfilled' && requestsRes.value.success) setPendingReqs((requestsRes.value.requests || []).filter((d: any) => d.status === 'pending'));
    } catch (err: unknown) { setError((err instanceof Error ? err.message : 'حدث خطأ')); } finally { setLoading(false); }
  }, []);
  useEffect(() => { if (!authLoading && user) fetchAll(); }, [user, authLoading, fetchAll]);
  useEffect(() => { if (user) fetchNotifications(); }, [user, fetchNotifications]);
  // Poll notifications every 30s with proper cleanup
  useEffect(() => {
    if (!user) return;
    const id = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(id);
  }, [user, fetchNotifications]);
  useEffect(() => { if (user) setProfileForm({ userName: user.userName || '', phone: (user as any).phone || '', address: (user as any).address || '' }); }, [user]);

  const handleAction = async (donationId: string, status: 'accepted' | 'rejected') => {
    setActionLoading(`${donationId}-${status}`);
    try {
      await apiFetch(`/dashboard/request/${donationId}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setAllDonations(prev => prev.map(d => d._id === donationId ? { ...d, status } : d));
      setPendingReqs(prev => prev.filter(d => d._id !== donationId));
      if (selectedDonation?._id === donationId) setSelectedDonation(prev => prev ? { ...prev, status } : prev);
      setStats(prev => prev ? { ...prev, Pending_Donations: Math.max(0, prev.Pending_Donations - 1), Accepted_Donations: status === 'accepted' ? prev.Accepted_Donations + 1 : prev.Accepted_Donations, Rejected_Donations: status === 'rejected' ? prev.Rejected_Donations + 1 : prev.Rejected_Donations } : prev);
      showToast('success', status === 'accepted' ? 'تم قبول التبرع بنجاح' : 'تم رفض التبرع');
    } catch (err: unknown) { showToast('error', (err instanceof Error ? err.message : 'حدث خطأ')); } finally { setActionLoading(null); }
  };
  const handleReminder = async () => {
    setCronLoading(true); setCronMessage(null);
    const time = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    try {
      await apiFetch('/cron/donationReminder');
      const now = new Date().toISOString();
      setCronMessage('✅ تم إرسال التذكير بنجاح');
      setCronLog(p => { const updated = [{ type: 'success' as const, text: 'تذكير التبرعات: تم التشغيل بنجاح', time }, ...p].slice(0, 50); try { localStorage.setItem('ap-cron-log', JSON.stringify(updated)); } catch {} return updated; });
      setLastRun(now);
      try { localStorage.setItem('ap-cron-lastrun', now); } catch {}
      showToast('success', 'تم إرسال التذكير بنجاح');
    } catch (err: unknown) {
      setCronMessage('❌ فشل إرسال التذكير');
      setCronLog(p => { const updated = [{ type: 'error' as const, text: `تذكير التبرعات: ${err instanceof Error ? err.message : 'خطأ'}`, time }, ...p].slice(0, 50); try { localStorage.setItem('ap-cron-log', JSON.stringify(updated)); } catch {} return updated; });
      showToast('error', 'فشل إرسال التذكير');
    } finally { setCronLoading(false); setTimeout(() => setCronMessage(null), 4000); }
  };

  const handleAdminReport = async () => {
    setAdminCronLoading(true); setAdminCronMessage(null);
    const time = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    try {
      await apiFetch('/cron/adminReport');
      setAdminCronMessage('✅ تم إرسال تقرير الإدارة بنجاح');
      showToast('success', 'تم إرسال تقرير الإدارة بنجاح');
    } catch (err: unknown) {
      setAdminCronMessage('❌ فشل إرسال تقرير الإدارة');
      showToast('error', `فشل: ${err instanceof Error ? err.message : 'خطأ'}`);
    } finally { setAdminCronLoading(false); setTimeout(() => setAdminCronMessage(null), 4000); }
  };

  const scheduleAt = (targetDate: Date) => {
    if (schedulerTimer) clearTimeout(schedulerTimer);
    setNextRunTime(null);
    const delay = targetDate.getTime() - Date.now();
    if (delay <= 0) { showToast('error', 'الوقت المحدد في الماضي! اختر وقتاً مستقبلياً.'); return; }
    const label = targetDate.toLocaleString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    setNextRunTime(label);
    try { localStorage.setItem('ap-cron-scheduled', JSON.stringify({ iso: targetDate.toISOString(), label })); } catch {}
    const timer = setTimeout(async () => { await handleReminder(); setNextRunTime(null); setSchedulerTimer(null); try { localStorage.removeItem('ap-cron-scheduled'); } catch {} }, delay);
    setSchedulerTimer(timer);
    showToast('success', `✓ تمت الجدولة في ${label}`);
  };

  const cancelSchedule = () => {
    if (schedulerTimer) clearTimeout(schedulerTimer);
    setSchedulerTimer(null); setNextRunTime(null);
    try { localStorage.removeItem('ap-cron-scheduled'); } catch {}
    showToast('success', 'تم إلغاء الجدولة');
  };

  const scheduleAdminAt = (targetDate: Date) => {
    if (adminSchedulerTimer) clearTimeout(adminSchedulerTimer);
    setAdminNextRunTime(null);
    const delay = targetDate.getTime() - Date.now();
    if (delay <= 0) { showToast('error', 'الوقت المحدد في الماضي! اختر وقتاً مستقبلياً.'); return; }
    const label = targetDate.toLocaleString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    setAdminNextRunTime(label);
    const timer = setTimeout(async () => { await handleAdminReport(); setAdminNextRunTime(null); setAdminSchedulerTimer(null); }, delay);
    setAdminSchedulerTimer(timer);
    showToast('success', `✓ تمت جدولة تقرير الإدارة في ${label}`);
  };

  const cancelAdminSchedule = () => {
    if (adminSchedulerTimer) clearTimeout(adminSchedulerTimer);
    setAdminSchedulerTimer(null); setAdminNextRunTime(null);
    showToast('success', 'تم إلغاء جدولة تقرير الإدارة');
  };
  const saveProfile = async () => { if (!profileForm.userName.trim()) { showToast('error', 'اسم المستخدم مطلوب'); return; } setSettingsSaving(true); try { await apiFetch('/users/profile', { method: 'PATCH', body: JSON.stringify(profileForm) }); showToast('success', 'تم تحديث الملف الشخصي بنجاح'); } catch (err: unknown) { showToast('error', err instanceof Error ? err.message : 'حدث خطأ'); } finally { setSettingsSaving(false); } };
  const savePassword = async () => { if (!passForm.oldPassword || !passForm.newPassword) { showToast('error', 'يرجى ملء جميع الحقول'); return; } if (passForm.newPassword !== passForm.confirmPassword) { showToast('error', 'كلمتا المرور غير متطابقتين'); return; } setSettingsSaving(true); try { await apiFetch('/users/change-password', { method: 'PATCH', body: JSON.stringify({ oldPassword: passForm.oldPassword, newPassword: passForm.newPassword }) }); setPassForm({ oldPassword: '', newPassword: '', confirmPassword: '' }); showToast('success', 'تم تغيير كلمة المرور بنجاح'); } catch (err: unknown) { showToast('error', err instanceof Error ? err.message : 'حدث خطأ'); } finally { setSettingsSaving(false); } };

  // ── Derived Data (Preserved) ──
  const rejectedCount = stats ? stats.Rejected_Donations ?? Math.max(0, stats.Total_Donations - stats.Pending_Donations - stats.Accepted_Donations) : 0;
  const pieData = [{ name: 'قيد المراجعة', value: stats?.Pending_Donations || 0, color: CHART_COLORS.pending }, { name: 'مقبول', value: stats?.Accepted_Donations || 0, color: CHART_COLORS.accepted }, { name: 'مرفوض', value: rejectedCount, color: CHART_COLORS.rejected }].filter(d => d.value > 0);
  const stackedData = useMemo(() => { const map: Record<string, any> = {}; allDonations.forEach(d => { const k = d.type || 'غير محدد'; if (!map[k]) map[k] = { name: k, pending: 0, accepted: 0, rejected: 0 }; map[k][d.status]++; }); return Object.values(map).slice(0, 6); }, [allDonations]);
  const timelineData = useMemo(() => { const m: Record<number, number> = {}; for (let i = 0; i < 12; i++) m[i] = 0; allDonations.forEach(d => { if (d.createdAt) m[new Date(d.createdAt).getMonth()]++; }); return MONTHS_AR.map((month, i) => ({ month: month.slice(0, 3), count: m[i] })); }, [allDonations]);
  const filteredDonations = useMemo(() => {
    let result = allDonations.filter(d => {
      if (statusFilter !== 'all' && d.status !== statusFilter) return false;
      if (dateFrom && d.createdAt && new Date(d.createdAt) < new Date(dateFrom)) return false;
      if (dateTo && d.createdAt && new Date(d.createdAt) > new Date(dateTo + 'T23:59:59')) return false;
      const q = searchQ.trim().toLowerCase();
      if (!q) return true;
      const donor = parseDonor(d.donorId);
      return d.type.toLowerCase().includes(q) || donor.name.toLowerCase().includes(q) || d._id.toLowerCase().includes(q) || (typeof d.donorId === 'string' ? d.donorId : d.donorId?._id || '').toLowerCase().includes(q);
    });
    result = [...result].sort((a, b) => {
      const ta = new Date(a.createdAt || 0).getTime();
      const tb = new Date(b.createdAt || 0).getTime();
      return sortOrder === 'newest' ? tb - ta : ta - tb;
    });
    return result;
  }, [allDonations, statusFilter, searchQ, sortOrder, dateFrom, dateTo]);
  
  const paginatedDonations = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredDonations.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredDonations, currentPage]);
  
  const totalPages = Math.max(1, Math.ceil(filteredDonations.length / ITEMS_PER_PAGE));
  // Reset to page 1 when filters change
  useEffect(() => { setCurrentPage(1); }, [statusFilter, searchQ, sortOrder, dateFrom, dateTo]);
  
  const charityName = user?.userName || 'الجمعية';
  const pendingCount = pendingReqs.length;

  // ── Render Guards ──
  if (selectedDonation) return (
    <div className={`ap-layout${isDark ? '' : ' ap-light-theme'}`} dir="rtl">
      <Sidebar activeTab={tab} onTabChange={setTab} userName={charityName} pendingCount={pendingCount} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(v => { localStorage.setItem('ap-sidebar-collapsed', String(!v)); return !v; })} onLogout={() => { logout?.(); setLocation('/login'); }} />
      <main className="ap-main">
        <header className="ap-page-header">
          <div className="ap-page-breadcrumb"><i className="ti ti-building-community" style={{color:'var(--teal)'}} /><span>لوحة التحكم</span><i className="ti ti-chevron-left" style={{fontSize:12,color:'var(--t4)'}} /><span style={{color:'var(--t3)'}} onClick={() => setSelectedDonation(null)} className="ap-breadcrumb-link">التبرعات</span><i className="ti ti-chevron-left" style={{fontSize:12,color:'var(--t4)'}} /><span style={{color:'var(--t1)',fontWeight:700}}>{selectedDonation.type}</span></div>
          <div className="ap-page-header-right">
            <div className="ap-header-live-badge"><span className="ap-live-dot" /><span className="ap-header-live-time">{liveTime}</span></div>
            <button className="ap-header-icon-btn ap-theme-btn" onClick={() => setIsDark(v => !v)}><i className={`ti ${isDark ? 'ti-sun' : 'ti-moon'}`} /></button>
            <button className="ap-header-icon-btn" onClick={() => setSelectedDonation(null)}><i className="ti ti-arrow-right" /></button>
          </div>
        </header>
        <div className="ap-content">
          <DonationDetailPanel donation={selectedDonation} onBack={() => setSelectedDonation(null)} onAction={handleAction} actionLoading={actionLoading} />
        </div>
      </main>
      <MobileNav activeTab={tab} onTabChange={setTab} pendingCount={pendingCount} />
      {toast && <div className={`ap-toast ${toast.type}`}><i className={`ti ${toast.type==='success'?'ti-circle-check':'ti-alert-circle'}`} />{toast.text}</div>}
    </div>
  );

  return (
    <div className={`ap-layout${isDark ? '' : ' ap-light-theme'}`} dir="rtl">
      {showReport && <ReportModal onClose={() => setShowReport(false)} />}
      <Sidebar activeTab={tab} onTabChange={setTab} userName={charityName} pendingCount={pendingCount} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(v => { localStorage.setItem('ap-sidebar-collapsed', String(!v)); return !v; })} onLogout={() => { logout?.(); setLocation('/login'); }} />
      <main className={`ap-main${tab === 'chat' ? ' ap-main--ai' : ''}`}>
        {tab !== 'chat' && (
        <header className="ap-page-header">
          <div className="ap-page-header-left" style={{display:'flex',alignItems:'center',gap:12}}>
            <div className="ap-page-breadcrumb">
              <i className="ti ti-building-community" style={{color:'var(--teal)'}}/>
              <span>لوحة التحكم</span>
              <i className="ti ti-chevron-left" style={{fontSize:12,color:'var(--t4)'}}/>
              <span style={{color:'var(--t1)',fontWeight:700}}>
                {tab==='stats'?'نظرة عامة':tab==='donations'?'كل التبرعات':tab==='requests'?'الطلبات المعلقة':tab==='automation'?'التشغيل التلقائي':'الإعدادات'}
              </span>
            </div>
            <div className="ap-header-live-badge"><span className="ap-live-dot"/><span className="ap-header-live-time">{liveTime}</span></div>
          </div>
          <div className="ap-page-header-right">
            <NotificationBell
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkRead={handleMarkRead}
              onMarkAllRead={handleMarkAllRead}
              onDelete={handleDeleteNotif}
              loading={notifLoading}
            />
            <button className="ap-header-icon-btn" title="إبلاغ" onClick={() => setShowReport(true)} style={{borderColor:'rgba(240,67,112,0.3)',color:'var(--red)'}}><i className="ti ti-alert-triangle"/></button>
            <button className="ap-header-icon-btn ap-theme-btn" onClick={() => setIsDark(v => !v)} title={isDark?'وضع نهاري':'وضع ليلي'}><i className={`ti ${isDark?'ti-sun':'ti-moon'}`}/></button>
            <button className="ap-header-icon-btn" onClick={fetchAll} title="تحديث"><i className="ti ti-refresh"/></button>
            <div className="ap-header-user" onClick={() => setTab('settings')} title="الإعدادات">
              <div className="ap-header-avatar">{charityName?.[0]?.toUpperCase()}</div>
              <span className="ap-header-username-text">{charityName}</span>
              <i className="ti ti-settings" style={{fontSize:13,color:'var(--t4)'}}/>
            </div>
          </div>
        </header>
        )}
        <div ref={contentRef} className={`ap-content${tab === 'chat' ? ' ap-content--ai' : ''}`}>
          {/* زر العودة للأعلى داخل الداشبورد */}
          {showScrollTop && tab !== 'chat' && (
            <button
              onClick={() => contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="العودة للأعلى"
              style={{
                position: 'fixed', bottom: 28, left: 28, zIndex: 999,
                width: 44, height: 44, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--teal) 0%, #00a87a 100%)',
                color: '#fff', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, boxShadow: '0 4px 20px rgba(0,212,154,0.4)',
                transition: 'all 0.25s cubic-bezier(0.22,1,0.36,1)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-4px) scale(1.08)'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 28px rgba(0,212,154,0.5)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ''; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(0,212,154,0.4)'; }}
            >
              <i className="ti ti-arrow-up" />
            </button>
          )}
          {error && !loading && <div className="ap-error-banner"><i className="ti ti-alert-triangle" style={{color:'var(--amber)',fontSize:20}} /><div style={{flex:1}}><div style={{fontWeight:700,marginBottom:3,color:'var(--t1)'}}>حدث خطأ</div><div style={{fontSize:13,color:'var(--t3)'}}>{error}</div></div><button className="ap-retry-btn" onClick={fetchAll}><i className="ti ti-refresh" /> إعادة المحاولة</button></div>}

          {(authLoading || loading) ? <CharityPageSkeleton /> : (<>

          {/* ═══ STATS TAB ═══ */}
          {tab === 'stats' && <div className="ap-tab-pane">
            {/* KPI Grid */}
            <div className="ap-kpi-grid">
              {[
                { l: 'إجمالي التبرعات', v: stats?.Total_Donations || 0,    i: 'ti-gift',          c: '#0ec97f' },
                { l: 'قيد المراجعة',    v: stats?.Pending_Donations || 0,  i: 'ti-clock-pause',   c: '#f59e0b' },
                { l: 'مقبولة',          v: stats?.Accepted_Donations || 0, i: 'ti-shield-check',  c: '#0ec97f' },
                { l: 'مرفوضة',          v: rejectedCount,                  i: 'ti-shield-x',      c: '#f04370' },
              ].map(s => (
                <div key={s.l} className="ap-kpi-card" style={{ '--kpi-color': s.c } as React.CSSProperties}>
                  <div className="ap-kpi-icon-wrap"><i className={`ti ${s.i}`}/></div>
                  <div className="ap-kpi-value">{s.v.toLocaleString('en-US')}</div>
                  <div className="ap-kpi-label">{s.l}</div>
                </div>
              ))}
            </div>

            {/* Row 1: Pro area chart + pie */}
            <div className="ap-charts-row">
              {/* Pro area chart - التبرعات عبر الزمن */}
              <div className="ap-pro-chart-card ap-chart-card--wide">
                <div className="ap-pro-chart-header">
                  <div className="ap-pro-chart-meta">
                    <div className="ap-pro-chart-value">{(stats?.Total_Donations || 0).toLocaleString('en-US')}</div>
                    <div className="ap-pro-chart-label"><i className="ti ti-trending-up" style={{color:'#0ec97f',marginLeft:4}}/>التبرعات الشهرية</div>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <span className={`ap-chart-trend ${timelineData.length > 1 && timelineData[timelineData.length-1]?.count >= timelineData[timelineData.length-2]?.count ? 'up' : 'down'}`}>
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M1 11 L5 4 L8 7 L12 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      هذا الشهر
                    </span>
                    <div className="ap-pro-chart-period"><i className="ti ti-calendar" style={{fontSize:11}}/>{new Date().getFullYear()}</div>
                  </div>
                </div>
                <div className="ap-chart-stats-row">
                  <div className="ap-chart-stat-mini"><div className="ap-chart-stat-mini-val" style={{color:'#0ec97f'}}>{(stats?.Pending_Donations||0).toLocaleString('en-US')}</div><div className="ap-chart-stat-mini-lbl">معلقة</div></div>
                  <div className="ap-chart-stat-mini"><div className="ap-chart-stat-mini-val" style={{color:'#0ec97f'}}>{(stats?.Accepted_Donations||0).toLocaleString('en-US')}</div><div className="ap-chart-stat-mini-lbl">مقبولة</div></div>
                  <div className="ap-chart-stat-mini"><div className="ap-chart-stat-mini-val" style={{color:'#f04370'}}>{rejectedCount.toLocaleString('en-US')}</div><div className="ap-chart-stat-mini-lbl">مرفوضة</div></div>
                </div>
                <div className="ap-pro-chart-legend">
                  <div className="ap-pro-legend-item"><div className="ap-pro-legend-line" style={{background:'#0ec97f'}}><div className="ap-pro-legend-dot" style={{background:'#0ec97f'}}/></div>التبرعات الشهرية</div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={timelineData} margin={{top:4,right:4,left:-24,bottom:0}}>
                    <defs>
                      <linearGradient id="gradDon" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#0ec97f" stopOpacity={0.35}/>
                        <stop offset="60%"  stopColor="#0ec97f" stopOpacity={0.10}/>
                        <stop offset="100%" stopColor="#0ec97f" stopOpacity={0.02}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
                    <XAxis dataKey="month" tick={{fill:'var(--t3)',fontSize:10}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fill:'var(--t3)',fontSize:10}} axisLine={false} tickLine={false} allowDecimals={false}/>
                    <Tooltip
                      contentStyle={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,color:'var(--t1)',fontFamily:'Tajawal',fontSize:12,boxShadow:'0 8px 24px rgba(0,0,0,0.2)'}}
                      formatter={(val: number) => [val.toLocaleString('en-US'), 'التبرعات']}
                      labelFormatter={(label) => `شهر: ${label}`}
                      cursor={{stroke:'rgba(14,201,127,0.2)',strokeWidth:2}}
                    />
                    <Area type="monotone" dataKey="count" name="التبرعات" stroke="#0ec97f" strokeWidth={2.5} fill="url(#gradDon)" dot={{fill:'#0ec97f',strokeWidth:0,r:3}} activeDot={{r:5,fill:'#0ec97f',stroke:'var(--surface)',strokeWidth:2}}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Pie chart - توزيع الحالات */}
              <div className="ap-chart-card">
                <div className="ap-chart-header">
                  <span className="ap-chart-title"><i className="ti ti-chart-pie" style={{color:'#0ec97f'}} />توزيع الحالات</span>
                </div>
                {pieData.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={80} dataKey="value" paddingAngle={3}>
                          {pieData.map((e, i) => <Cell key={i} fill={e.color} strokeWidth={0}/>)}
                        </Pie>
                        <Tooltip
                          contentStyle={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,color:'var(--t1)',fontFamily:'Tajawal',fontSize:12,boxShadow:'0 8px 24px rgba(0,0,0,0.2)'}}
                          formatter={(val: number, name: string) => {
                            const total = pieData.reduce((s,d) => s+d.value, 0);
                            const pct = total > 0 ? Math.round((val/total)*100) : 0;
                            return [`${val.toLocaleString('ar-EG')} تبرع (${pct}%)`, name];
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{display:'flex',gap:12,flexWrap:'wrap',justifyContent:'center',marginTop:4}}>
                      {pieData.map(d => (
                        <div key={d.name} style={{display:'flex',alignItems:'center',gap:5,fontSize:11.5,color:'var(--t2)',fontWeight:600}}>
                          <span style={{width:8,height:8,borderRadius:'50%',background:d.color,display:'inline-block'}}/>
                          {d.name} <span style={{color:'var(--t4)',fontWeight:400}}>({d.value})</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : <div className="ap-empty-state"><div className="ap-empty-icon"><i className="ti ti-inbox"/></div><div className="ap-empty-title">لا توجد بيانات</div></div>}
              </div>
            </div>

            {/* Row 2: Stacked bar + recent donations list */}
            <div className="ap-charts-row">
              <div className="ap-chart-card">
                <div className="ap-chart-header">
                  <span className="ap-chart-title"><i className="ti ti-chart-bar" style={{color:'#3b82f6'}}/>أنواع التبرعات</span>
                </div>
                {stackedData.length > 0
                  ? <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={stackedData} layout="vertical" margin={{top:0,right:4,left:0,bottom:0}}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)"/>
                        <XAxis type="number" tick={{fill:'var(--t3)',fontSize:10}} axisLine={false} tickLine={false}/>
                        <YAxis type="category" dataKey="name" width={72} tick={{fill:'var(--t2)',fontSize:11}} axisLine={false} tickLine={false}/>
                        <Tooltip
                          contentStyle={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,color:'var(--t1)',fontFamily:'Tajawal',fontSize:12,boxShadow:'0 8px 24px rgba(0,0,0,0.2)'}}
                          formatter={(val: number, name: string) => [`${val.toLocaleString('ar-EG')} تبرع`, name]}
                          cursor={{fill:'rgba(255,255,255,0.03)'}}
                        />
                        <Legend wrapperStyle={{fontSize:11,fontFamily:'Tajawal',paddingTop:8}} formatter={(v) => <span style={{color:'var(--t2)'}}>{v}</span>}/>
                        <Bar dataKey="pending"  name="معلق"  fill="#f59e0b" radius={[0,4,4,0]}><LabelList dataKey="pending"  position="right" style={{fill:'#f59e0b',fontSize:10,fontWeight:700}}/></Bar>
                        <Bar dataKey="accepted" name="مقبول" fill="#0ec97f" radius={[0,4,4,0]}><LabelList dataKey="accepted" position="right" style={{fill:'#0ec97f',fontSize:10,fontWeight:700}}/></Bar>
                        <Bar dataKey="rejected" name="مرفوض" fill="#f04370" radius={[0,4,4,0]}><LabelList dataKey="rejected" position="right" style={{fill:'#f04370',fontSize:10,fontWeight:700}}/></Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  : <div className="ap-empty-state"><div className="ap-empty-icon"><i className="ti ti-inbox"/></div><div className="ap-empty-title">لا توجد بيانات</div></div>
                }
              </div>

              {/* Latest donations list */}
              {allDonations.length > 0 && (
                <div className="ap-chart-card">
                  <div className="ap-chart-header">
                    <span className="ap-chart-title"><i className="ti ti-clock-record" style={{color:'#0ec97f'}}/>آخر التبرعات</span>
                    <button className="ap-card-eye-btn" style={{fontSize:12}} onClick={() => setTab('donations')}><i className="ti ti-eye"/>عرض الكل</button>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:0,overflow:'hidden',borderRadius:'var(--radius-sm)',border:'1px solid var(--border)'}}>
                    {[...allDonations].sort((a,b) => new Date(b.createdAt||0).getTime()-new Date(a.createdAt||0).getTime()).slice(0,5).map((d,i) => {
                      const sc = STATUS_CFG[d.status]; const donor = parseDonor(d.donorId);
                      return (
                        <div key={d._id} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 12px',borderBottom:i<4?'1px solid var(--border)':'none',background:i%2===0?'var(--surface2)':'transparent',cursor:'pointer'}} onClick={() => setSelectedDonation(d)}>
                          <div style={{width:28,height:28,borderRadius:7,background:sc.bg,color:sc.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,flexShrink:0}}>
                            <i className="ti ti-package"/>
                          </div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:12,fontWeight:700,color:'var(--t1)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.type}</div>
                            <div style={{fontSize:10.5,color:'var(--t4)',marginTop:1}}>{donor.name}</div>
                          </div>
                          <span style={{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:20,background:sc.bg,color:sc.color,flexShrink:0}}>{sc.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>}

          {/* ═══ DONATIONS & REQUESTS TABS ═══ */}
          {(tab === 'donations' || tab === 'requests') && <div className="ap-tab-pane">
            <div className="ap-section-header">
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div className="ap-section-title">
                  <i className={`ti ${tab==='donations'?'ti-clipboard-list':'ti-clock-exclamation'}`} style={{color:'var(--teal)'}}/>
                  {tab==='donations'?'كل التبرعات':'الطلبات المعلقة'}
                  <span className="ap-count-badge" style={{background:'var(--teal)'}}>{tab==='donations'?filteredDonations.length:pendingCount}</span>
                </div>
                <div className="ap-view-switcher">
                  <button className={`ap-view-btn${donView==='table'?' active':''}`} onClick={() => setDonView('table')} title="جدول"><i className="ti ti-list"/></button>
                  <button className={`ap-view-btn${donView==='cards'?' active':''}`} onClick={() => setDonView('cards')} title="كروت"><i className="ti ti-layout-grid"/></button>
                </div>
              </div>
              <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
                <div className="ap-filter-tabs">
                  {(['all','pending','accepted','rejected'] as const).map(s => (
                    <button key={s} className={`ap-filter-tab${statusFilter===s?' active':''}`} onClick={() => setStatusFilter(s)}>
                      {s==='all'?`الكل (${allDonations.length})`:STATUS_CFG[s as keyof typeof STATUS_CFG].label}
                    </button>
                  ))}
                </div>
                <div className="ap-search-wrap">
                  <i className="ti ti-search ap-search-icon"/>
                  <input className="ap-search-input" placeholder="بحث بالمعرف، الاسم أو النوع..." value={searchQ} onChange={e => setSearchQ(e.target.value)}/>
                  {searchQ && <button className="ap-search-clear" onClick={() => setSearchQ('')}><i className="ti ti-x"/></button>}
                </div>
                {/* Date Range */}
                <div style={{display:'flex',gap:4,alignItems:'center',flexWrap:'wrap',background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:'var(--radius-sm)',padding:'5px 10px'}}>
                  <i className="ti ti-calendar-range" style={{fontSize:14,color:'var(--t3)',flexShrink:0}}/>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:1}}>
                    <span style={{fontSize:10,color:'var(--t4)',lineHeight:1}}>من</span>
                    <input
                      type="date"
                      className="ap-sched-input"
                      style={{padding:'2px 6px',fontSize:12,width:130,background:'transparent',border:'none',color:dateFrom?'var(--t1)':'var(--t3)',cursor:'pointer'}}
                      value={dateFrom}
                      onChange={e => setDateFrom(e.target.value)}
                    />
                  </div>
                  <i className="ti ti-arrow-narrow-left" style={{fontSize:14,color:'var(--t4)'}}/>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:1}}>
                    <span style={{fontSize:10,color:'var(--t4)',lineHeight:1}}>إلى</span>
                    <input
                      type="date"
                      className="ap-sched-input"
                      style={{padding:'2px 6px',fontSize:12,width:130,background:'transparent',border:'none',color:dateTo?'var(--t1)':'var(--t3)',cursor:'pointer'}}
                      value={dateTo}
                      min={dateFrom || undefined}
                      onChange={e => setDateTo(e.target.value)}
                    />
                  </div>
                  {(dateFrom || dateTo) && (
                    <button
                      className="ap-search-clear"
                      style={{position:'static',width:22,height:22,fontSize:11,borderRadius:6}}
                      onClick={() => { setDateFrom(''); setDateTo(''); }}
                      title="مسح الفلتر"
                    ><i className="ti ti-x"/></button>
                  )}
                </div>
                {/* Sort */}
                <div style={{display:'flex',alignItems:'center',gap:5,background:'var(--surface2)',border:'1px solid var(--border)',borderRadius:'var(--radius-sm)',padding:'4px 10px'}}>
                  <i className={`ti ${sortOrder==='newest'?'ti-sort-descending':'ti-sort-ascending'}`} style={{fontSize:14,color:'var(--teal)',flexShrink:0}}/>
                  <select style={{background:'transparent',border:'none',color:'var(--t1)',fontSize:12,fontFamily:'inherit',cursor:'pointer',outline:'none',padding:'2px 0'}} value={sortOrder} onChange={e => setSortOrder(e.target.value as 'newest'|'oldest')}>
                    <option value="newest">الأحدث أولاً</option>
                    <option value="oldest">الأقدم أولاً</option>
                  </select>
                </div>
                <button className="ap-header-icon-btn" onClick={fetchAll} title="تحديث"><i className="ti ti-refresh"/></button>
              </div>
            </div>

            {(tab==='requests'?pendingReqs:filteredDonations).length === 0
              ? <div className="ap-empty-state"><div className="ap-empty-icon"><i className="ti ti-inbox"/></div><div className="ap-empty-title">لا توجد بيانات مطابقة</div><div className="ap-empty-desc">جرّب تغيير الفلتر أو البحث</div></div>
              : donView === 'cards'
                ? <div className="ap-card-grid">
                    {(tab==='requests'?pendingReqs:paginatedDonations).map(d => {
                      const sc = STATUS_CFG[d.status]; const donor = parseDonor(d.donorId); const img = d.imageUrl?.[0]?.secure_url; const busy = actionLoading === `${d._id}-accepted` || actionLoading === `${d._id}-rejected`;
                      return (
                        <div key={d._id} className="ap-entity-card" onClick={() => setSelectedDonation(d)} style={{cursor:'pointer'}}>
                          <div className="ap-entity-card-header">
                            {img ? <img src={img} style={{width:40,height:40,borderRadius:10,objectFit:'cover'}} alt=""/> : <div className="ap-entity-avatar charity"><i className="ti ti-photo"/></div>}
                            <div style={{flex:1,minWidth:0}}>
                              <div className="ap-entity-name">{d.type}</div>
                              <div className="ap-entity-email">{d.condition || 'بدون شرط'}</div>
                            </div>
                            <span className="ap-badge" style={{background:sc.bg,color:sc.color}}><span className="ap-badge-dot" style={{background:sc.dot}}/>{sc.label}</span>
                          </div>
                          <div style={{display:'flex',gap:6,marginBottom:8,fontSize:11,color:'var(--t3)'}}><i className="ti ti-package"/>{d.quantity||0} قطعة{d.size && <><i className="ti ti-ruler" style={{marginLeft:6}}/>{d.size}</>}</div>
                          <div className="ap-entity-date"><i className="ti ti-calendar"/>{fmt12(d.createdAt)} | {donor.name}</div>
                          <div className="ap-entity-actions" onClick={e => e.stopPropagation()}>
                            {tab==='requests' && <>
                              <button className="ap-action-btn approve" disabled={busy} onClick={() => handleAction(d._id,'accepted')}>{actionLoading===`${d._id}-accepted`?<i className="ti ti-loader-2 ti-spin"/>:<><i className="ti ti-check"/>قبول</>}</button>
                              <button className="ap-action-btn reject"  disabled={busy} onClick={() => handleAction(d._id,'rejected')}>{actionLoading===`${d._id}-rejected`?<i className="ti ti-loader-2 ti-spin"/>:<><i className="ti ti-x"/>رفض</>}</button>
                            </>}
                            <button className="ap-card-eye-btn" onClick={() => setSelectedDonation(d)}><i className="ti ti-eye"/>تفاصيل</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                : <div className="ap-table-wrap">
                    <table className="ap-table">
                      <thead><tr><th>النوع</th><th>المتبرع</th><th>الكمية</th><th>الحالة</th><th>التاريخ</th><th>إجراء</th></tr></thead>
                      <tbody>
                        {(tab==='requests'?pendingReqs:paginatedDonations).map(d => {
                          const sc = STATUS_CFG[d.status]; const donor = parseDonor(d.donorId); const busy = actionLoading === `${d._id}-accepted` || actionLoading === `${d._id}-rejected`;
                          return (
                            <tr key={d._id} onClick={() => setSelectedDonation(d)} className="ap-table-row-clickable">
                              <td style={{fontWeight:600,color:'var(--t1)'}}>{d.type}</td>
                              <td><div style={{display:'flex',alignItems:'center',gap:8}}><div className="ap-table-avatar">{donor.initial}</div><span>{donor.name}</span></div></td>
                              <td>{d.quantity ? `${d.quantity} قطعة` : '—'}</td>
                              <td><span className="ap-badge" style={{background:sc.bg,color:sc.color}}><span className="ap-badge-dot" style={{background:sc.dot}}/>{sc.label}</span></td>
                              <td style={{color:'var(--t3)',fontSize:12}}>{fmt12(d.createdAt)}</td>
                              <td onClick={e => e.stopPropagation()}>
                                <div style={{display:'flex',gap:6}}>
                                  {tab==='requests' && <>
                                    <button className="ap-action-btn approve" disabled={busy} onClick={() => handleAction(d._id,'accepted')}>{actionLoading===`${d._id}-accepted`?<i className="ti ti-loader-2 ti-spin"/>:<i className="ti ti-check"/>}</button>
                                    <button className="ap-action-btn reject"  disabled={busy} onClick={() => handleAction(d._id,'rejected')}>{actionLoading===`${d._id}-rejected`?<i className="ti ti-loader-2 ti-spin"/>:<i className="ti ti-x"/>}</button>
                                  </>}
                                  <button className="ap-eye-btn" onClick={() => setSelectedDonation(d)}><i className="ti ti-eye"/></button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
            }

            {/* Pagination */}
            {tab === 'donations' && totalPages > 1 && (
              <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,marginTop:20,flexWrap:'wrap'}}>
                <button
                  className="ap-modal-cancel"
                  style={{padding:'7px 14px',fontSize:12,display:'flex',alignItems:'center',gap:5}}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                ><i className="ti ti-chevrons-right"/></button>
                <button
                  className="ap-modal-cancel"
                  style={{padding:'7px 14px',fontSize:12,display:'flex',alignItems:'center',gap:5}}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                ><i className="ti ti-chevron-right"/> السابق</button>
                <div style={{display:'flex',gap:4}}>
                  {Array.from({length:Math.min(5,totalPages)},(_,i) => {
                    let page: number;
                    if (totalPages <= 5) page = i + 1;
                    else if (currentPage <= 3) page = i + 1;
                    else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                    else page = currentPage - 2 + i;
                    return (
                      <button key={page} onClick={() => setCurrentPage(page)}
                        style={{width:34,height:34,borderRadius:8,border:`1px solid ${page===currentPage?'var(--teal)':'var(--border)'}`,background:page===currentPage?'var(--teal-dim)':'transparent',color:page===currentPage?'var(--teal)':'var(--t3)',fontWeight:page===currentPage?700:400,fontSize:13,cursor:'pointer',transition:'all 0.15s'}}>
                        {page}
                      </button>
                    );
                  })}
                </div>
                <button
                  className="ap-modal-cancel"
                  style={{padding:'7px 14px',fontSize:12,display:'flex',alignItems:'center',gap:5}}
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >التالي <i className="ti ti-chevron-left"/></button>
                <button
                  className="ap-modal-cancel"
                  style={{padding:'7px 14px',fontSize:12,display:'flex',alignItems:'center',gap:5}}
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                ><i className="ti ti-chevrons-left"/></button>
                <span style={{fontSize:12,color:'var(--t4)',marginRight:8}}>
                  {((currentPage-1)*ITEMS_PER_PAGE)+1}–{Math.min(currentPage*ITEMS_PER_PAGE, filteredDonations.length)} من {filteredDonations.length}
                </span>
              </div>
            )}
          </div>}

          {/* ═══ AUTOMATION TAB ═══ */}
          {tab === 'automation' && <div className="ap-tab-pane">
            {/* Banner */}
            <div className="ap-automation-banner">
              <div className="ap-automation-banner-icon"><i className="ti ti-settings-automation"/></div>
              <div>
                <div className="ap-automation-banner-title">التشغيل التلقائي</div>
                <div className="ap-automation-banner-sub">يمكنك تشغيل المهام يدويًا أو جدولتها في تاريخ وساعة محددة.</div>
              </div>
            </div>

            {/* Cron Grid — 2 cards */}
            <div className="ap-cron-grid" style={{gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))'}}>

              {/* Card 1: تذكير التبرعات */}
              <div className="ap-cron-card">
                <div className="ap-cron-icon" style={{background:'rgba(14,201,127,0.14)'}}>
                  <i className="ti ti-bell-ringing" style={{color:'#0ec97f'}}/>
                </div>
                <div className="ap-cron-title">تذكير التبرعات</div>
                <p className="ap-cron-desc">يرسل تذكيرات للجمعية بالتبرعات المعلقة التي لم يتم تأكيدها.</p>
                <code className="ap-cron-code" style={{background:'rgba(14,201,127,0.08)',borderColor:'rgba(14,201,127,0.24)',color:'#0ec97f'}}>
                  GET /cron/donationReminder
                </code>
                {cronMessage && <div style={{fontSize:13,padding:'7px 12px',borderRadius:8,background: cronMessage.includes('✅') ? 'rgba(14,201,127,0.1)' : 'rgba(240,72,112,0.1)',color: cronMessage.includes('✅') ? '#0ec97f' : '#f04370',marginBottom:8}}>{cronMessage}</div>}
                <div className="ap-sched-picker">
                  <div className="ap-sched-picker-label">
                    <i className="ti ti-calendar-clock" style={{color:'#0ec97f'}}/> جدولة في تاريخ وساعة محددة
                  </div>
                  <div className="ap-sched-inputs">
                    <div className="ap-sched-field">
                      <label>التاريخ</label>
                      <input type="date" className="ap-sched-input" value={schedInput.date} min={todayStr}
                        onChange={e => setSchedInput(p => ({...p, date: e.target.value}))}/>
                    </div>
                    <div className="ap-sched-field">
                      <label>الساعة</label>
                      <input type="time" className="ap-sched-input" value={schedInput.time}
                        onChange={e => setSchedInput(p => ({...p, time: e.target.value}))}/>
                    </div>
                    <div className="ap-sched-field ap-sched-field-sm">
                      <label>الثواني</label>
                      <input type="number" className="ap-sched-input" value={schedInput.seconds} min="0" max="59" placeholder="00"
                        onChange={e => { const v = Math.max(0, Math.min(59, Number(e.target.value))); setSchedInput(p => ({...p, seconds: String(v).padStart(2,'0')})); }}/>
                    </div>
                  </div>
                  {nextRunTime ? (
                    <div className="ap-sched-status">
                      <div className="ap-sched-next">
                        <i className="ti ti-clock-play" style={{color:'#0ec97f'}}/>
                        <span>موعد التشغيل: <strong style={{color:'#0ec97f'}}>{nextRunTime}</strong></span>
                      </div>
                      <button className="ap-sched-cancel-btn" onClick={cancelSchedule}>
                        <i className="ti ti-x"/> إلغاء الجدولة
                      </button>
                    </div>
                  ) : (
                    <button className="ap-sched-confirm-btn" style={{borderColor:'#0ec97f',color:'#0ec97f'}}
                      onClick={() => {
                        if (!schedInput.date || !schedInput.time) { showToast('error','يرجى تحديد التاريخ والوقت'); return; }
                        const [h,m] = schedInput.time.split(':').map(Number);
                        const d = new Date(schedInput.date);
                        d.setHours(h, m, Number(schedInput.seconds), 0);
                        scheduleAt(d);
                      }}>
                      <i className="ti ti-calendar-plus"/> تأكيد الجدولة
                    </button>
                  )}
                </div>
                <button className="ap-cron-run-btn" style={{background:'#0ec97f',color:'#fff'}} disabled={cronLoading} onClick={handleReminder}>
                  {cronLoading ? <><i className="ti ti-loader-2 ti-spin"/>جاري التشغيل...</> : <><i className="ti ti-player-play"/>تشغيل الآن</>}
                </button>
              </div>

              {/* Card 2: تقرير الإدارة */}
              <div className="ap-cron-card">
                <div className="ap-cron-icon" style={{background:'rgba(59,130,246,0.14)'}}>
                  <i className="ti ti-report-analytics" style={{color:'#3b82f6'}}/>
                </div>
                <div className="ap-cron-title">تقرير الإدارة</div>
                <p className="ap-cron-desc">يولّد تقريراً شاملاً لمسؤول النظام بإحصائيات التبرعات والجمعيات.</p>
                <code className="ap-cron-code" style={{background:'rgba(59,130,246,0.08)',borderColor:'rgba(59,130,246,0.24)',color:'#3b82f6'}}>
                  GET /cron/adminReport
                </code>
                {adminCronMessage && <div style={{fontSize:13,padding:'7px 12px',borderRadius:8,background: adminCronMessage.includes('✅') ? 'rgba(59,130,246,0.1)' : 'rgba(240,72,112,0.1)',color: adminCronMessage.includes('✅') ? '#3b82f6' : '#f04370',marginBottom:8}}>{adminCronMessage}</div>}
                <div className="ap-sched-picker">
                  <div className="ap-sched-picker-label">
                    <i className="ti ti-calendar-clock" style={{color:'#3b82f6'}}/> جدولة في تاريخ وساعة محددة
                  </div>
                  <div className="ap-sched-inputs">
                    <div className="ap-sched-field">
                      <label>التاريخ</label>
                      <input type="date" className="ap-sched-input" value={adminSchedInput.date} min={todayStr}
                        onChange={e => setAdminSchedInput(p => ({...p, date: e.target.value}))}/>
                    </div>
                    <div className="ap-sched-field">
                      <label>الساعة</label>
                      <input type="time" className="ap-sched-input" value={adminSchedInput.time}
                        onChange={e => setAdminSchedInput(p => ({...p, time: e.target.value}))}/>
                    </div>
                    <div className="ap-sched-field ap-sched-field-sm">
                      <label>الثواني</label>
                      <input type="number" className="ap-sched-input" value={adminSchedInput.seconds} min="0" max="59" placeholder="00"
                        onChange={e => { const v = Math.max(0, Math.min(59, Number(e.target.value))); setAdminSchedInput(p => ({...p, seconds: String(v).padStart(2,'0')})); }}/>
                    </div>
                  </div>
                  {adminNextRunTime ? (
                    <div className="ap-sched-status">
                      <div className="ap-sched-next">
                        <i className="ti ti-clock-play" style={{color:'#3b82f6'}}/>
                        <span>موعد التشغيل: <strong style={{color:'#3b82f6'}}>{adminNextRunTime}</strong></span>
                      </div>
                      <button className="ap-sched-cancel-btn" onClick={cancelAdminSchedule} style={{borderColor:'#3b82f6',color:'#3b82f6'}}>
                        <i className="ti ti-x"/> إلغاء الجدولة
                      </button>
                    </div>
                  ) : (
                    <button className="ap-sched-confirm-btn" style={{borderColor:'#3b82f6',color:'#3b82f6'}}
                      onClick={() => {
                        if (!adminSchedInput.date || !adminSchedInput.time) { showToast('error','يرجى تحديد التاريخ والوقت'); return; }
                        const [h,m] = adminSchedInput.time.split(':').map(Number);
                        const d = new Date(adminSchedInput.date);
                        d.setHours(h, m, Number(adminSchedInput.seconds), 0);
                        scheduleAdminAt(d);
                      }}>
                      <i className="ti ti-calendar-plus"/> تأكيد الجدولة
                    </button>
                  )}
                </div>
                <button className="ap-cron-run-btn" style={{background:'#3b82f6',color:'#fff'}} disabled={adminCronLoading} onClick={handleAdminReport}>
                  {adminCronLoading ? <><i className="ti ti-loader-2 ti-spin"/>جاري التشغيل...</> : <><i className="ti ti-player-play"/>تشغيل الآن</>}
                </button>
              </div>
            </div>

            {/* Stats Row */}
            <div className="ap-cron-stats-row">
              {[
                { icon:'ti-history',        color:'#0ec97f', value: cronLog.length,                        label:'عدد مرات التشغيل' },
                { icon:'ti-clock',          color:'#f59e0b', value: lastRun ? new Date(lastRun).toLocaleString('ar-EG',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',hour12:true}) : '—', label:'آخر تشغيل' },
                { icon:'ti-calendar-event', color:'#3b82f6', value: (nextRunTime || adminNextRunTime) ? 'مجدول' : 'لا يوجد', label:'جدولة نشطة' },
              ].map((s,i) => (
                <div key={i} className="ap-cron-stat">
                  <i className={`ti ${s.icon}`} style={{color:s.color,fontSize:22}}/>
                  <div>
                    <div style={{fontSize:18,fontWeight:800,color:'var(--t1)'}}>{s.value}</div>
                    <div style={{fontSize:12,color:'var(--t3)',marginTop:2}}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Log */}
            {cronLog.length > 0 && (
              <div className="ap-cron-log">
                <div className="ap-cron-log-header">
                  <div className="ap-section-title" style={{margin:0}}><i className="ti ti-list-details" style={{color:'#0ec97f'}}/>سجل التنفيذ<span className="ap-count-badge" style={{background:'#0ec97f'}}>{cronLog.length}</span></div>
                  <button className="ap-cron-log-clear" onClick={() => { setCronLog([]); try { localStorage.removeItem('ap-cron-log'); } catch {} }}><i className="ti ti-trash"/>مسح</button>
                </div>
                <div className="ap-cron-log-list">
                  {cronLog.map((log,i) => (
                    <div key={i} className={`ap-cron-log-item ${log.type}`}>
                      <span>{log.type==='success'?'✓':'✗'} {log.text}</span>
                      <span style={{fontSize:11,color:'var(--t4)',flexShrink:0}}>{log.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>}

          {/* ═══ SETTINGS TAB ═══ */}
          {tab === 'settings' && <div className="ap-tab-pane">
            <div className="ap-section-header" style={{marginBottom:20}}>
              <div className="ap-section-title"><i className="ti ti-settings" style={{color:'var(--teal)'}}/>الإعدادات</div>
            </div>
            <div className="ap-settings-grid">
              {/* Profile card */}
              <div className="ap-settings-card">
                <div className="ap-settings-card-title">
                  <div className="ap-settings-icon" style={{background:'rgba(14,201,127,0.14)',color:'#0ec97f'}}><i className="ti ti-user-circle"/></div>
                  الملف الشخصي
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:14}}>
                  <div className="ap-form-group"><label className="ap-form-label">اسم المستخدم</label><input className="ap-form-input" value={profileForm.userName} onChange={e => setProfileForm(f => ({...f,userName:e.target.value}))} placeholder="اسم المستخدم"/></div>
                  <div className="ap-form-group"><label className="ap-form-label">البريد الإلكتروني</label><input className="ap-form-input" value={user?.email||''} disabled style={{opacity:0.6,cursor:'not-allowed'}}/></div>
                  <div className="ap-form-group"><label className="ap-form-label">رقم الهاتف</label><input className="ap-form-input" value={profileForm.phone} onChange={e => setProfileForm(f => ({...f,phone:e.target.value}))} placeholder="01xxxxxxxxx"/></div>
                  <div className="ap-form-group"><label className="ap-form-label">العنوان</label><input className="ap-form-input" value={profileForm.address} onChange={e => setProfileForm(f => ({...f,address:e.target.value}))} placeholder="المدينة أو المنطقة"/></div>
                  <button className="ap-action-btn approve" style={{alignSelf:'flex-start',padding:'8px 18px'}} disabled={settingsSaving} onClick={saveProfile}>
                    {settingsSaving ? <><i className="ti ti-loader-2 ti-spin"/>جاري الحفظ...</> : <><i className="ti ti-check"/>حفظ التغييرات</>}
                  </button>
                </div>
              </div>

              {/* Password card */}
              <div className="ap-settings-card">
                <div className="ap-settings-card-title">
                  <div className="ap-settings-icon" style={{background:'rgba(240,67,112,0.14)',color:'#f04370'}}><i className="ti ti-shield-lock"/></div>
                  تغيير كلمة المرور
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:14}}>
                  <div className="ap-form-group"><label className="ap-form-label">كلمة المرور الحالية</label><input className="ap-form-input" type="password" value={passForm.oldPassword} onChange={e => setPassForm(f => ({...f,oldPassword:e.target.value}))} placeholder="••••••••"/></div>
                  <div className="ap-form-group"><label className="ap-form-label">كلمة المرور الجديدة</label><input className="ap-form-input" type="password" value={passForm.newPassword} onChange={e => setPassForm(f => ({...f,newPassword:e.target.value}))} placeholder="••••••••"/></div>
                  <div className="ap-form-group"><label className="ap-form-label">تأكيد كلمة المرور الجديدة</label><input className="ap-form-input" type="password" value={passForm.confirmPassword} onChange={e => setPassForm(f => ({...f,confirmPassword:e.target.value}))} placeholder="••••••••"/></div>
                  <button className="ap-action-btn edit" style={{alignSelf:'flex-start',padding:'8px 18px'}} disabled={settingsSaving} onClick={savePassword}>
                    {settingsSaving ? <><i className="ti ti-loader-2 ti-spin"/>جاري الحفظ...</> : <><i className="ti ti-key"/>تغيير كلمة المرور</>}
                  </button>
                </div>
              </div>

              {/* Notifications card */}
              <div className="ap-settings-card">
                <div className="ap-settings-card-title">
                  <div className="ap-settings-icon" style={{background:'rgba(59,130,246,0.14)',color:'#3b82f6'}}><i className="ti ti-bell"/></div>
                  الإشعارات
                </div>
                {[
                  { label:'إشعارات البريد الإلكتروني', sub:'تلقي التنبيهات عبر البريد',           def:true  },
                  { label:'تبرعات جديدة',               sub:'إشعار فوري عند ورود تبرع جديد',       def:true  },
                  { label:'تذكيرات التبرعات المعلقة',   sub:'تنبيه بالتبرعات التي تنتظر الرد',    def:true  },
                ].map((item,i) => (
                  <div key={i} className="ap-settings-row">
                    <div><div className="ap-settings-row-label">{item.label}</div><div className="ap-settings-row-sub">{item.sub}</div></div>
                    <label className="ap-toggle"><input type="checkbox" defaultChecked={item.def}/><span className="ap-toggle-slider"/></label>
                  </div>
                ))}
              </div>

              {/* System card */}
              <div className="ap-settings-card">
                <div className="ap-settings-card-title">
                  <div className="ap-settings-icon" style={{background:'rgba(245,158,11,0.14)',color:'#f59e0b'}}><i className="ti ti-server"/></div>
                  النظام
                </div>
                <div className="ap-settings-row">
                  <div><div className="ap-settings-row-label">الوضع الليلي (Dark Mode)</div><div className="ap-settings-row-sub">تبديل مظهر لوحة التحكم بالكامل</div></div>
                  <label className="ap-toggle"><input type="checkbox" checked={isDark} onChange={() => setIsDark(v => !v)}/><span className="ap-toggle-slider"/></label>
                </div>
                {[
                  { label:'حفظ الجلسة تلقائياً', sub:'الاستمرار مسجلاً بعد إغلاق المتصفح', def:true  },
                  { label:'الوضع المضغوط',        sub:'عرض أكثر للبيانات في مساحة أصغر',   def:false },
                ].map((item,i) => (
                  <div key={i} className="ap-settings-row">
                    <div><div className="ap-settings-row-label">{item.label}</div><div className="ap-settings-row-sub">{item.sub}</div></div>
                    <label className="ap-toggle"><input type="checkbox" defaultChecked={item.def}/><span className="ap-toggle-slider"/></label>
                  </div>
                ))}
              </div>
            </div>
          </div>}

          {/* ═══ CHAT TAB ═══ */}
          {tab === 'chat' && <AIChatEmbed />}

          </>)}
        </div>
      </main>
      <MobileNav activeTab={tab} onTabChange={setTab} pendingCount={pendingCount} />
      {toast && <div className={`ap-toast ${toast.type}`}><i className={`ti ${toast.type==='success'?'ti-circle-check':'ti-alert-circle'}`} />{toast.text}</div>}
    </div>
  );
}