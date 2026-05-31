// import { useState, useEffect, useRef } from 'react';
// import { useLocation } from 'wouter';
// import { notificationApi, Notification } from '../../services';

// export default function NotificationBell() {
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [open, setOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   // ✅ BUG #5 FIX: إضافة error state بدل silent catch
//   const [fetchError, setFetchError] = useState<string | null>(null);
//   const dropRef = useRef<HTMLDivElement>(null);
//   const [, setLocation] = useLocation();

//   const unread = notifications.filter(n => n.status === 'unread').length;

//   const fetchNotifications = async () => {
//     setLoading(true);
//     setFetchError(null);
//     try {
//       const data = await notificationApi.getAll();
//       setNotifications(data.notifications || []);
//     } catch (err: unknown) {
//       // ✅ BUG #5 FIX: نحفظ الخطأ ونعرضه في الـ dropdown
//       setFetchError(err instanceof Error ? err.message : 'فشل تحميل الإشعارات');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchNotifications();
//     const interval = setInterval(fetchNotifications, 60_000);
//     return () => clearInterval(interval);
//   }, []);

//   useEffect(() => {
//     const handler = (e: MouseEvent) => {
//       if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
//         setOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handler);
//     return () => document.removeEventListener('mousedown', handler);
//   }, []);

//   const markRead = async (id: string) => {
//     try {
//       await notificationApi.markRead(id);
//       setNotifications(prev => prev.map(n => n._id === id ? { ...n, status: 'read' as const } : n));
//     } catch { /* silent — عملية ثانوية */ }
//   };

//   const handleViewAll = () => {
//     setOpen(false);
//     setLocation('/notifications');
//   };

//   return (
//     <div className="notif-bell-wrap" ref={dropRef}>
//       <button
//         className="notif-bell-btn"
//         onClick={() => setOpen(o => !o)}
//         title="الإشعارات"
//       >
//         <i className="fas fa-bell" />
//         {unread > 0 && (
//           <span className="notif-bell-badge">{unread > 9 ? '9+' : unread}</span>
//         )}
//       </button>

//       {open && (
//         <div className="notif-dropdown">
//           <div className="notif-drop-header">
//             <span className="notif-drop-title">الإشعارات</span>
//             {unread > 0 && <span className="notif-drop-count">{unread} جديد</span>}
//           </div>

//           <div className="notif-drop-list">
//             {loading ? (
//               <div className="notif-drop-empty">
//                 <div className="spinner" style={{ padding: 20 }}><div className="spinner-ring" /></div>
//               </div>
//             ) : fetchError ? (
//               // ✅ BUG #5 FIX: عرض رسالة خطأ في الـ dropdown مع زرار إعادة المحاولة
//               <div className="notif-drop-empty" style={{ padding: '16px 12px', gap: 8 }}>
//                 <i className="fas fa-exclamation-circle" style={{ fontSize: 24, color: 'var(--danger, #ef4444)' }} />
//                 <p style={{ fontSize: 13, margin: 0 }}>{fetchError}</p>
//                 <button
//                   onClick={fetchNotifications}
//                   style={{ fontSize: 12, marginTop: 4, background: 'none', border: '1px solid currentColor', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', color: 'inherit' }}
//                 >
//                   إعادة المحاولة
//                 </button>
//               </div>
//             ) : notifications.length === 0 ? (
//               <div className="notif-drop-empty">
//                 <i className="fas fa-bell-slash" style={{ fontSize: 28, color: 'var(--neutral-300)', marginBottom: 8 }} />
//                 <p>لا توجد إشعارات</p>
//               </div>
//             ) : (
//               notifications.slice(0, 5).map(n => (
//                 <div
//                   key={n._id}
//                   className={`notif-drop-item${n.status === 'unread' ? ' unread' : ''}`}
//                   onClick={() => n.status === 'unread' && markRead(n._id)}
//                 >
//                   <div className={`notif-dot${n.status === 'read' ? ' read' : ''}`} />
//                   <div className="notif-drop-text">
//                     <p>{n.message}</p>
//                     <span>{new Date(n.createdAt).toLocaleString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>

//           {notifications.length > 0 && (
//             <button className="notif-drop-footer" onClick={handleViewAll}>
//               عرض كل الإشعارات ({notifications.length})
//             </button>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }
// import { useState, useEffect, useRef } from 'react';
// import { useLocation } from 'wouter';
// import { notificationApi, Notification } from '../../services';

// export default function NotificationBell() {
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [open, setOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   // ✅ BUG #5 FIX: إضافة error state بدل silent catch
//   const [fetchError, setFetchError] = useState<string | null>(null);
//   const dropRef = useRef<HTMLDivElement>(null);
//   const [, setLocation] = useLocation();

//   const unread = notifications.filter(n => n.status === 'unread').length;

//   const fetchNotifications = async () => {
//     setLoading(true);
//     setFetchError(null);
//     try {
//       const data = await notificationApi.getAll();
//       setNotifications(data.notifications || []);
//     } catch (err: unknown) {
//       // ✅ BUG #5 FIX: نحفظ الخطأ ونعرضه في الـ dropdown
//       setFetchError(err instanceof Error ? err.message : 'فشل تحميل الإشعارات');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchNotifications();
//     const interval = setInterval(fetchNotifications, 60_000);
//     return () => clearInterval(interval);
//   }, []);

//   useEffect(() => {
//     const handler = (e: MouseEvent) => {
//       if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
//         setOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handler);
//     return () => document.removeEventListener('mousedown', handler);
//   }, []);

//   const markRead = async (id: string) => {
//     try {
//       await notificationApi.markRead(id);
//       setNotifications(prev => prev.map(n => n._id === id ? { ...n, status: 'read' as const } : n));
//     } catch { /* silent — عملية ثانوية */ }
//   };

//   const handleViewAll = () => {
//     setOpen(false);
//     setLocation('/notifications');
//   };

//   return (
//     <div className="notif-bell-wrap" ref={dropRef}>
//       <button
//         className="notif-bell-btn"
//         onClick={() => setOpen(o => !o)}
//         title="الإشعارات"
//       >
//         <i className="fas fa-bell" />
//         {unread > 0 && (
//           <span className="notif-bell-badge">{unread > 9 ? '9+' : unread}</span>
//         )}
//       </button>

//       {open && (
//         <div className="notif-dropdown">
//           <div className="notif-drop-header">
//             <span className="notif-drop-title">الإشعارات</span>
//             {unread > 0 && <span className="notif-drop-count">{unread} جديد</span>}
//           </div>

//           <div className="notif-drop-list">
//             {loading ? (
//               <div className="notif-drop-empty">
//                 <div className="spinner" style={{ padding: 20 }}><div className="spinner-ring" /></div>
//               </div>
//             ) : fetchError ? (
//               // ✅ BUG #5 FIX: عرض رسالة خطأ في الـ dropdown مع زرار إعادة المحاولة
//               <div className="notif-drop-empty" style={{ padding: '16px 12px', gap: 8 }}>
//                 <i className="fas fa-exclamation-circle" style={{ fontSize: 24, color: 'var(--danger, #ef4444)' }} />
//                 <p style={{ fontSize: 13, margin: 0 }}>{fetchError}</p>
//                 <button
//                   onClick={fetchNotifications}
//                   style={{ fontSize: 12, marginTop: 4, background: 'none', border: '1px solid currentColor', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', color: 'inherit' }}
//                 >
//                   إعادة المحاولة
//                 </button>
//               </div>
//             ) : notifications.length === 0 ? (
//               <div className="notif-drop-empty">
//                 <i className="fas fa-bell-slash" style={{ fontSize: 28, color: 'var(--neutral-300)', marginBottom: 8 }} />
//                 <p>لا توجد إشعارات</p>
//               </div>
//             ) : (
//               notifications.slice(0, 5).map(n => (
//                 <div
//                   key={n._id}
//                   className={`notif-drop-item${n.status === 'unread' ? ' unread' : ''}`}
//                   onClick={() => n.status === 'unread' && markRead(n._id)}
//                 >
//                   <div className={`notif-dot${n.status === 'read' ? ' read' : ''}`} />
//                   <div className="notif-drop-text">
//                     <p>{n.message}</p>
//                     <span>{new Date(n.createdAt).toLocaleString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>

//           {notifications.length > 0 && (
//             <button className="notif-drop-footer" onClick={handleViewAll}>
//               عرض كل الإشعارات ({notifications.length})
//             </button>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }
/**
 * NotificationBell.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * مكون الجرس المتجاوب:
 *  • موبايل  → Drawer يطلع من الأسفل (Sheet)
 *  • ديسكتوب → Dropdown عائم
 * جميع رسائل الباك إند تُترجم للعربية تلقائياً عبر translateNotification.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { notificationApi } from '../../services';
import type { Notification } from '../../services';
import { translateNotification, translateNotificationTitle } from '../../utils/translateNotification';

// ── Types ──────────────────────────────────────────────────────────────────────
export interface NotificationBellProps {
  notifications?: Notification[];
  unreadCount?: number;
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  onDelete?: (id: string) => void;
  loading?: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function getNotifIcon(type: Notification['type']): string {
  const map: Record<string, string> = {
    donation:      'ti-gift',
    report:        'ti-alert-circle',
    approval:      'ti-circle-check',
    rejection:     'ti-circle-x',
    admin_message: 'ti-message-circle',
    system:        'ti-settings',
    reminder:      'ti-alarm',
  };
  return map[type] ?? 'ti-bell';
}

function getNotifColor(type: Notification['type']): string {
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
}

function groupByDate(notifications: Notification[]) {
  const now = new Date();
  const groups: Record<'today' | 'yesterday' | 'older', Notification[]> = {
    today: [], yesterday: [], older: [],
  };
  notifications.forEach(n => {
    const d   = new Date(n.createdAt);
    const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const nDay   = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diff   = Math.round((nowDay.getTime() - nDay.getTime()) / 86400000);
    if (diff === 0)      groups.today.push(n);
    else if (diff === 1) groups.yesterday.push(n);
    else                 groups.older.push(n);
  });
  return groups;
}

// ── NotificationItem ───────────────────────────────────────────────────────────
function NotificationItem({
  n,
  onMarkRead,
  onDelete,
}: {
  n: Notification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const color      = getNotifColor(n.type);
  const icon       = getNotifIcon(n.type);
  const isUnread   = n.status === 'unread';
  const rawMsg     = n.message || (n as any).content || '';
  const rawTitle   = n.title || '';
  const arMsg      = translateNotification(rawMsg);
  const arTitle    = rawTitle ? translateNotificationTitle(rawTitle) : '';

  return (
    <div
      className={`cd-notif-item${isUnread ? ' unread' : ' cd-notif-item--read'}`}
      onClick={() => isUnread && onMarkRead(n._id)}
      style={{ cursor: isUnread ? 'pointer' : 'default' }}
    >
      {/* Icon */}
      <div
        className="cd-notif-item-icon"
        style={{ background: `${color}18`, color }}
      >
        <i className={`ti ${icon}`} />
      </div>

      {/* Body */}
      <div className="cd-notif-item-body">
        {arTitle && (
          <div
            className="cd-notif-item-title"
            style={{ fontWeight: 800, fontSize: '12.5px', color: 'var(--t1)', marginBottom: '2px' }}
          >
            {arTitle}
          </div>
        )}
        <div className="cd-notif-item-msg">{arMsg}</div>
        <div className="cd-notif-item-time">
          <i className="ti ti-clock" />
          {new Date(n.createdAt).toLocaleString('ar-EG', {
            month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: true,
          })}
        </div>
      </div>

      {/* Unread dot */}
      {isUnread && (
        <div
          className="cd-notif-unread-dot"
          style={{ boxShadow: `0 0 6px ${color}` }}
        />
      )}

      {/* Delete */}
      <button
        className="cd-notif-del-btn"
        onClick={e => { e.stopPropagation(); onDelete(n._id); }}
        title="حذف الإشعار"
      >
        <i className="ti ti-x" />
      </button>
    </div>
  );
}

// ── NotificationList (shared between Dropdown & Drawer) ───────────────────────
function NotificationList({
  notifications,
  loading,
  filter,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  onDelete,
  onFilterChange,
  onClose,
}: {
  notifications: Notification[];
  loading: boolean;
  filter: 'all' | 'unread';
  unreadCount: number;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDelete: (id: string) => void;
  onFilterChange: (f: 'all' | 'unread') => void;
  onClose: () => void;
}) {
  const displayed = filter === 'unread'
    ? notifications.filter(n => n.status === 'unread')
    : notifications;

  const groups = groupByDate(displayed.slice(0, 20));
  const GROUP_LABELS = { today: 'اليوم', yesterday: 'الأمس', older: 'أقدم' } as const;

  return (
    <>
      {/* Header */}
      <div className="cd-notif-header">
        <div className="cd-notif-title">
          <i className="ti ti-bell" />
          الإشعارات
          {unreadCount > 0 && (
            <span className="cd-notif-count">{unreadCount}</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {unreadCount > 0 && (
            <button className="cd-notif-mark-all" onClick={onMarkAllRead}>
              <i className="ti ti-checks" /> تحديد الكل كمقروء
            </button>
          )}
          {/* زرار إغلاق مرئي على الموبايل */}
          <button
            className="cd-notif-close-btn"
            onClick={onClose}
            title="إغلاق"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--t3)', fontSize: 18, padding: '2px 4px',
              display: 'flex', alignItems: 'center',
            }}
          >
            <i className="ti ti-x" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="cd-notif-filter-tabs">
        <button
          className={`cd-notif-filter-tab${filter === 'all' ? ' active' : ''}`}
          onClick={() => onFilterChange('all')}
        >
          الكل ({notifications.length})
        </button>
        <button
          className={`cd-notif-filter-tab${filter === 'unread' ? ' active' : ''}`}
          onClick={() => onFilterChange('unread')}
        >
          غير مقروءة ({unreadCount})
        </button>
      </div>

      {/* List */}
      <div className="cd-notif-list">
        {loading ? (
          <div className="cd-notif-loading">
            <i className="ti ti-loader-2 ti-spin" />
            <span>جاري التحميل...</span>
          </div>
        ) : displayed.length === 0 ? (
          <div className="cd-notif-empty">
            <i className="ti ti-bell-off" style={{ fontSize: 28 }} />
            <span>
              {filter === 'unread'
                ? 'لا توجد إشعارات غير مقروءة'
                : 'لا توجد إشعارات بعد'}
            </span>
          </div>
        ) : (
          (['today', 'yesterday', 'older'] as const).map(gk =>
            groups[gk].length > 0 ? (
              <div key={gk}>
                {/* Group label */}
                <div style={{
                  padding: '8px 14px 4px',
                  fontSize: 10,
                  fontWeight: 800,
                  color: 'var(--t4)',
                  textTransform: 'uppercase' as const,
                  letterSpacing: 0.8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}>
                  <span>{GROUP_LABELS[gk]}</span>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                </div>

                {groups[gk].map(n => (
                  <NotificationItem
                    key={n._id}
                    n={n}
                    onMarkRead={onMarkRead}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            ) : null
          )
        )}
      </div>
    </>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function NotificationBell({
  notifications: propNotifications,
  unreadCount: propUnreadCount,
  onMarkRead: propOnMarkRead,
  onMarkAllRead: propOnMarkAllRead,
  onDelete: propOnDelete,
  loading: propLoading,
}: NotificationBellProps) {
  const isInternal = propNotifications === undefined;

  const [localNotifications, setLocalNotifications] = useState<Notification[]>([]);
  const [localLoading, setLocalLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!isInternal) return;
    setLocalLoading(true);
    try {
      const res = await notificationApi.getAll() as any;
      const notifs: Notification[] = res?.notifications || res?.data?.Data || res?.data || [];
      setLocalNotifications(notifs.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch { /* ignore */ } finally {
      setLocalLoading(false);
    }
  }, [isInternal]);

  useEffect(() => {
    if (isInternal) {
      fetchNotifications();
      const id = setInterval(fetchNotifications, 60_000);
      return () => clearInterval(id);
    }
  }, [isInternal, fetchNotifications]);

  const handleMarkRead = useCallback(async (id: string) => {
    if (propOnMarkRead) {
      propOnMarkRead(id);
    } else {
      try {
        await notificationApi.markRead(id);
        setLocalNotifications(prev => prev.map(n => n._id === id ? { ...n, status: 'read' as const } : n));
      } catch { /* ignore */ }
    }
  }, [propOnMarkRead]);

  const handleMarkAllRead = useCallback(async () => {
    if (propOnMarkAllRead) {
      propOnMarkAllRead();
    } else {
      const unread = localNotifications.filter(n => n.status === 'unread');
      if (unread.length === 0) return;
      setLocalNotifications(prev => prev.map(n => ({ ...n, status: 'read' as const })));
      try {
        await (notificationApi as any).markAllRead();
      } catch {
        try {
          await Promise.allSettled(unread.map(n => notificationApi.markRead(n._id)));
        } catch { /* ignore */ }
      }
    }
  }, [propOnMarkAllRead, localNotifications]);

  const handleDelete = useCallback(async (id: string) => {
    if (propOnDelete) {
      propOnDelete(id);
    } else {
      try {
        await notificationApi.delete(id);
        setLocalNotifications(prev => prev.filter(n => n._id !== id));
      } catch { /* ignore */ }
    }
  }, [propOnDelete]);

  const notifications = isInternal ? localNotifications : propNotifications!;
  const unreadCount = isInternal ? localNotifications.filter(n => n.status === 'unread').length : propUnreadCount!;
  const loading = isInternal ? localLoading : propLoading!;

  const [open, setOpen]                 = useState(false);
  const [filter, setFilter]             = useState<'all' | 'unread'>('all');
  const [isMobile, setIsMobile]         = useState(() => typeof window !== 'undefined' && window.innerWidth <= 767);
  const [dropPos, setDropPos]           = useState<{ top: number; left: number } | null>(null);
  const wrapRef                         = useRef<HTMLDivElement>(null);
  const btnRef                          = useRef<HTMLButtonElement>(null);

  // ── تحديد ما إذا كان الجهاز موبايل ──────────────────────────────────────────
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 767);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // ── إغلاق الـ dropdown عند الضغط خارجه ──────────────────────────────────────
  useEffect(() => {
    if (!open || isMobile) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, isMobile]);

  // ── منع تمرير الـ body عند فتح الـ Drawer ────────────────────────────────────
  useEffect(() => {
    if (isMobile && open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMobile, open]);

  const handleClose = useCallback(() => setOpen(false), []);

  return (
    <div className="cd-notif-wrap" ref={wrapRef} style={{ position: 'relative' }}>

      {/* ── زرار الجرس ──────────────────────────────────────────────────────── */}
      <button
        ref={btnRef}
        className={`ap-header-icon-btn cd-notif-btn${unreadCount > 0 ? ' cd-notif-btn--pulse' : ''}`}
        onClick={() => {
          if (!open && btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            setDropPos({ top: rect.bottom + 8, left: rect.left });
          }
          setOpen(v => !v);
        }}
        title="الإشعارات"
        aria-label={`الإشعارات${unreadCount > 0 ? ` - ${unreadCount} غير مقروء` : ''}`}
        aria-expanded={open}
      >
        <i className="ti ti-bell" />
        {unreadCount > 0 && (
          <span className="cd-notif-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* ═══════════════════════════════════════════════════════════════
          DESKTOP: Dropdown (portal — يهرب من overflow:hidden)
          ═══════════════════════════════════════════════════════════════ */}
      {!isMobile && open && dropPos && createPortal(
        <>
          {/* طبقة شفافة لإغلاق الـ dropdown عند الضغط خارجه */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 9997 }}
            onClick={handleClose}
            aria-hidden="true"
          />
          <div
            className="cd-notif-dropdown"
            role="dialog"
            aria-label="قائمة الإشعارات"
            style={{
              position: 'fixed',
              top: dropPos.top,
              left: dropPos.left,
              zIndex: 9998,
            }}
          >
            <NotificationList
              notifications={notifications}
              loading={loading}
              filter={filter}
              unreadCount={unreadCount}
              onMarkRead={handleMarkRead}
              onMarkAllRead={handleMarkAllRead}
              onDelete={handleDelete}
              onFilterChange={setFilter}
              onClose={handleClose}
            />
          </div>
        </>,
        document.body
      )}

      {/* ═══════════════════════════════════════════════════════════════
          MOBILE: Drawer (bottom sheet)
          ═══════════════════════════════════════════════════════════════ */}
      {isMobile && createPortal(
        <>
          {/* Overlay */}
          <div
            className={`cd-notif-overlay${open ? ' visible' : ''}`}
            onClick={handleClose}
            aria-hidden="true"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.55)',
              zIndex: 9998,
              opacity: open ? 1 : 0,
              pointerEvents: open ? 'auto' : 'none',
              transition: 'opacity 0.25s ease',
              backdropFilter: 'blur(2px)',
            }}
          />

          {/* Drawer */}
          <div
            className="cd-notif-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="قائمة الإشعارات"
            style={{
              position: 'fixed',
              bottom: 0,
              right: 0,
              left: 0,
              zIndex: 9999,
              background: 'var(--surface, #1a1f2e)',
              borderRadius: '20px 20px 0 0',
              maxHeight: '82vh',
              display: 'flex',
              flexDirection: 'column',
              transform: open ? 'translateY(0)' : 'translateY(105%)',
              transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.5)',
            }}
          >
            {/* Drag Handle */}
            <div style={{
              width: 36, height: 4,
              background: 'var(--border, rgba(255,255,255,0.12))',
              borderRadius: 4,
              margin: '10px auto 0',
              flexShrink: 0,
            }} />

            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <NotificationList
                notifications={notifications}
                loading={loading}
                filter={filter}
                unreadCount={unreadCount}
                onMarkRead={handleMarkRead}
                onMarkAllRead={handleMarkAllRead}
                onDelete={handleDelete}
                onFilterChange={setFilter}
                onClose={handleClose}
              />
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}