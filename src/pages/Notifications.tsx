// import { useEffect, useState, useMemo } from 'react';
// import { notificationApi, Notification } from '../services';

// // ── Group helper ──────────────────────────────────────────────────
// function getGroup(dateStr: string): 'today' | 'yesterday' | 'older' {
//   const now = new Date();
//   const d = new Date(dateStr);
//   const diffDays = Math.floor((now.setHours(0,0,0,0) - d.setHours(0,0,0,0)) / 86400000);
//   if (diffDays === 0) return 'today';
//   if (diffDays === 1) return 'yesterday';
//   return 'older';
// }

// const GROUP_LABELS = { today: 'اليوم', yesterday: 'الأمس', older: 'أقدم' };

// const TYPE_ICON: Record<string, string> = {
//   donation:      'ti-gift',
//   report:        'ti-alert-circle',
//   approval:      'ti-circle-check',
//   rejection:     'ti-circle-x',
//   admin_message: 'ti-message-circle',
//   system:        'ti-settings',
//   reminder:      'ti-alarm',
// };
// const TYPE_COLOR: Record<string, string> = {
//   donation:      '#0ec97f',
//   report:        '#f59e0b',
//   approval:      '#0ec97f',
//   rejection:     '#ef4444',
//   admin_message: '#3b82f6',
//   system:        '#8b5cf6',
//   reminder:      '#f59e0b',
// };

// export default function Notifications() {
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
//   const [error, setError] = useState<string | null>(null);
//   const [animatingIds, setAnimatingIds] = useState<Set<string>>(new Set());

//   const loadNotifs = () => {
//     setLoading(true);
//     setError(null);
//     notificationApi.getAll()
//       .then(d => setNotifications((d.notifications || []).sort((a: Notification, b: Notification) =>
//         new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
//       )))
//       .catch(err => setError(err?.message || 'فشل تحميل الإشعارات، حاول مرة أخرى'))
//       .finally(() => setLoading(false));
//   };

//   useEffect(() => { loadNotifs(); }, []);

//   const markRead = async (id: string) => {
//     if (animatingIds.has(id)) return;
//     setAnimatingIds(prev => new Set([...prev, id]));
//     try {
//       await notificationApi.markRead(id);
//       setTimeout(() => {
//         setNotifications(prev => prev.map(n => n._id === id ? { ...n, status: 'read' as const } : n));
//         setAnimatingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
//       }, 300);
//     } catch {
//       setAnimatingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
//     }
//   };

//   const markAllRead = async () => {
//     const unread = notifications.filter(n => n.status === 'unread');
//     const ids = unread.map(n => n._id);
//     setAnimatingIds(new Set(ids));
//     await Promise.allSettled(unread.map(n => notificationApi.markRead(n._id)));
//     setTimeout(() => {
//       setNotifications(prev => prev.map(n => ({ ...n, status: 'read' as const })));
//       setAnimatingIds(new Set());
//     }, 350);
//   };

//   const deleteNotif = async (id: string) => {
//     setAnimatingIds(prev => new Set([...prev, id]));
//     try {
//       await notificationApi.delete(id);
//       setTimeout(() => {
//         setNotifications(prev => prev.filter(n => n._id !== id));
//         setAnimatingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
//       }, 300);
//     } catch {
//       setAnimatingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
//     }
//   };

//   const filtered = notifications.filter(n => {
//     if (filter === 'unread') return n.status === 'unread';
//     if (filter === 'read')   return n.status === 'read';
//     return true;
//   });

//   const grouped = useMemo(() => {
//     const groups: Record<string, Notification[]> = { today: [], yesterday: [], older: [] };
//     filtered.forEach(n => groups[getGroup(n.createdAt)].push(n));
//     return groups;
//   }, [filtered]);

//   const unreadCount = notifications.filter(n => n.status === 'unread').length;

//   return (
//     <div className="page-wrapper" style={{ paddingTop: 72 }}>
//       <div className="page-hero">
//         <div style={{ maxWidth: 'var(--container-max)', width: '90%', margin: '0 auto', padding: '48px 0' }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
//             <div style={{ width: 50, height: 50, borderRadius: 14, background: 'rgba(14,201,127,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#0ec97f' }}>
//               <i className="ti ti-bell" />
//             </div>
//             <div>
//               <h1 style={{ marginBottom: 4 }}>الإشعارات</h1>
//               <p style={{ margin: 0, opacity: .75 }}>
//                 تابع آخر تحديثاتك
//                 {unreadCount > 0 && (
//                   <span style={{ marginRight: 8, background: 'rgba(14,201,127,0.15)', color: '#0ec97f', fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
//                     {unreadCount} غير مقروء
//                   </span>
//                 )}
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div style={{ maxWidth: 760, width: '90%', margin: '32px auto 80px' }}>

//         {error && (
//           <div className="modal-error" style={{ marginBottom: 20, borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
//             <i className="ti ti-alert-triangle" style={{ fontSize: 18 }} />
//             <span style={{ flex: 1 }}>{error}</span>
//             <button onClick={loadNotifs} style={{ background: 'none', border: '1px solid currentColor', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', color: 'inherit', fontSize: 12 }}>
//               إعادة المحاولة
//             </button>
//           </div>
//         )}

//         {/* Toolbar */}
//         <div className="notif-page-toolbar" style={{ marginBottom: 20 }}>
//           <div className="notif-filter-tabs">
//             {(['all', 'unread', 'read'] as const).map(f => (
//               <button
//                 key={f}
//                 className={`notif-filter-tab${filter === f ? ' active' : ''}`}
//                 onClick={() => setFilter(f)}
//               >
//                 {f === 'all' ? `الكل (${notifications.length})` : f === 'unread' ? `غير مقروء (${unreadCount})` : `مقروء`}
//               </button>
//             ))}
//           </div>
//           <div style={{ display: 'flex', gap: 8 }}>
//             {unreadCount > 0 && (
//               <button className="btn-sm" onClick={markAllRead} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//                 <i className="ti ti-checks" /> تحديد الكل كمقروء
//               </button>
//             )}
//             <button className="btn-sm" onClick={loadNotifs} title="تحديث" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//               <i className="ti ti-refresh" />
//             </button>
//           </div>
//         </div>

//         {/* List */}
//         {loading ? (
//           <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
//             {[1,2,3,4].map(i => (
//               <div key={i} style={{ height: 72, borderRadius: 12, background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.4s ease-in-out infinite', animationDelay: `${i * 0.1}s` }} />
//             ))}
//           </div>
//         ) : filtered.length === 0 ? (
//           <div style={{ textAlign: 'center', padding: '60px 20px' }}>
//             <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.4 }}><i className="ti ti-bell-off" /></div>
//             <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, opacity: 0.7 }}>
//               {filter === 'unread' ? 'لا توجد إشعارات غير مقروءة' : 'لا توجد إشعارات'}
//             </div>
//             <div style={{ fontSize: 13, opacity: 0.5 }}>ستظهر هنا إشعاراتك عند ورودها</div>
//           </div>
//         ) : (
//           <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
//             {(['today', 'yesterday', 'older'] as const).map(group => (
//               grouped[group].length > 0 && (
//                 <div key={group}>
//                   {/* Group header */}
//                   <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
//                     <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--neutral-400, #9ca3af)', textTransform: 'uppercase', letterSpacing: 1 }}>
//                       {GROUP_LABELS[group]}
//                     </span>
//                     <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
//                     <span style={{ fontSize: 11, color: 'var(--neutral-400, #9ca3af)' }}>
//                       {grouped[group].length}
//                     </span>
//                   </div>

//                   <div className="notif-page-list" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
//                     {grouped[group].map(n => {
//                       const icon = TYPE_ICON[n.type] || 'ti-bell';
//                       const color = TYPE_COLOR[n.type] || '#3b82f6';
//                       const isAnimating = animatingIds.has(n._id);
//                       return (
//                         <div
//                           key={n._id}
//                           className={`notif-page-item${n.status === 'unread' ? ' unread' : ''}`}
//                           onClick={() => n.status === 'unread' && markRead(n._id)}
//                           style={{
//                             display: 'flex', alignItems: 'flex-start', gap: 12,
//                             padding: '14px 16px', borderRadius: 12,
//                             border: `1px solid ${n.status === 'unread' ? `${color}30` : 'rgba(255,255,255,0.06)'}`,
//                             background: n.status === 'unread' ? `${color}08` : 'rgba(255,255,255,0.02)',
//                             cursor: n.status === 'unread' ? 'pointer' : 'default',
//                             transition: 'all 0.3s ease',
//                             opacity: isAnimating ? 0.5 : 1,
//                             transform: isAnimating ? 'scale(0.98)' : 'scale(1)',
//                           }}
//                         >
//                           {/* Icon */}
//                           <div style={{
//                             width: 40, height: 40, borderRadius: 11, flexShrink: 0,
//                             background: `${color}18`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
//                           }}>
//                             <i className={`ti ${icon}`} />
//                           </div>

//                           {/* Content */}
//                           <div style={{ flex: 1, minWidth: 0 }}>
//                             {n.title && (
//                               <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text-primary, #f0f5ff)', marginBottom: 3 }}>{n.title}</div>
//                             )}
//                             <p style={{ margin: 0, fontSize: 13, color: n.status === 'unread' ? 'var(--text-primary, #f0f5ff)' : 'var(--text-secondary, #9ca3af)', lineHeight: 1.5, fontWeight: n.status === 'unread' ? 500 : 400 }}>
//                               {n.message}
//                             </p>
//                             <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted, #6b7280)', marginTop: 5 }}>
//                               <i className="ti ti-clock" style={{ fontSize: 12 }} />
//                               {new Date(n.createdAt).toLocaleString('ar-EG', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
//                             </span>
//                           </div>

//                           {/* Unread dot */}
//                           {n.status === 'unread' && (
//                             <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0, marginTop: 6, boxShadow: `0 0 6px ${color}` }} />
//                           )}

//                           {/* Actions */}
//                           <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
//                             {n.status === 'unread' && (
//                               <button
//                                 className="notif-action-btn"
//                                 title="تحديد كمقروء"
//                                 onClick={e => { e.stopPropagation(); markRead(n._id); }}
//                                 style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '4px 8px' }}
//                               >
//                                 <i className="ti ti-check" />
//                               </button>
//                             )}
//                             <button
//                               className="notif-action-btn danger"
//                               title="حذف"
//                               onClick={e => { e.stopPropagation(); deleteNotif(n._id); }}
//                               style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '4px 8px' }}
//                             >
//                               <i className="ti ti-trash" />
//                             </button>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 </div>
//               )
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
import { useEffect, useState, useMemo } from 'react';
import { notificationApi, Notification } from '../services';

// ── Group helper ──────────────────────────────────────────────────
function getGroup(dateStr: string): 'today' | 'yesterday' | 'older' {
  const now = new Date();
  const d = new Date(dateStr);
  const diffDays = Math.floor((now.setHours(0,0,0,0) - d.setHours(0,0,0,0)) / 86400000);
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  return 'older';
}

const GROUP_LABELS = { today: 'اليوم', yesterday: 'الأمس', older: 'أقدم' };

// ── ترجمة محتوى الإشعارات للعربية ────────────────────────────────────────────
function translateMessage(text: string): string {
  if (!text) return text;
  const t = text.toLowerCase();

  // donation
  if (t.includes('donation') && (t.includes('accept') || t.includes('approved'))) return 'تم قبول طلب تبرعك';
  if (t.includes('donation') && (t.includes('reject') || t.includes('declined'))) return 'تم رفض طلب تبرعك';
  if (t.includes('donation') && t.includes('deliver'))                             return 'تم تسليم تبرعك';
  if (t.includes('donation') && t.includes('complet'))                             return 'اكتمل تبرعك بنجاح';
  if (t.includes('donation') && t.includes('pend'))                               return 'طلب تبرعك قيد المراجعة';
  if (t.includes('donation') && t.includes('new'))                                return 'لديك طلب تبرع جديد';
  if (t.includes('donation'))                                                      return 'إشعار تبرع';

  // account / verification
  if (t.includes('account') && t.includes('verif'))   return 'تم التحقق من حسابك';
  if (t.includes('account') && t.includes('suspend')) return 'تم تعليق حسابك';
  if (t.includes('account') && t.includes('ban'))     return 'تم حظر حسابك';

  // charity
  if (t.includes('charity') && (t.includes('approv') || t.includes('accept'))) return 'تمت الموافقة على جمعيتك الخيرية';
  if (t.includes('charity') && (t.includes('reject') || t.includes('declin'))) return 'تم رفض جمعيتك الخيرية';
  if (t.includes('charity') && t.includes('pend'))                             return 'جمعيتك قيد المراجعة';

  // report
  if (t.includes('report') && t.includes('resolv')) return 'تم حل بلاغك';
  if (t.includes('report') && t.includes('receiv')) return 'تم استلام بلاغك';
  if (t.includes('report'))                          return 'إشعار بلاغ';

  // admin / message
  if (t.includes('admin') && t.includes('message')) return 'رسالة جديدة من المسؤول';
  if (t.includes('admin'))                           return 'رسالة من المسؤول';

  // reminder
  if (t.includes('reminder')) return 'تذكير';

  // welcome
  if (t.includes('welcome')) return 'مرحباً بك في المنصة';

  return text;
}

const TYPE_ICON: Record<string, string> = {
  donation:      'ti-gift',
  report:        'ti-alert-circle',
  approval:      'ti-circle-check',
  rejection:     'ti-circle-x',
  admin_message: 'ti-message-circle',
  system:        'ti-settings',
  reminder:      'ti-alarm',
};
const TYPE_COLOR: Record<string, string> = {
  donation:      '#0ec97f',
  report:        '#f59e0b',
  approval:      '#0ec97f',
  rejection:     '#ef4444',
  admin_message: '#3b82f6',
  system:        '#8b5cf6',
  reminder:      '#f59e0b',
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [error, setError] = useState<string | null>(null);
  const [animatingIds, setAnimatingIds] = useState<Set<string>>(new Set());

  const loadNotifs = () => {
    setLoading(true);
    setError(null);
    notificationApi.getAll()
      .then(d => setNotifications((d.notifications || []).sort((a: Notification, b: Notification) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )))
      .catch(err => setError(err?.message || 'فشل تحميل الإشعارات، حاول مرة أخرى'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadNotifs(); }, []);

  const markRead = async (id: string) => {
    if (animatingIds.has(id)) return;
    setAnimatingIds(prev => new Set([...prev, id]));
    try {
      await notificationApi.markRead(id);
      setTimeout(() => {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, status: 'read' as const } : n));
        setAnimatingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
      }, 300);
    } catch {
      setAnimatingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    }
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => n.status === 'unread');
    const ids = unread.map(n => n._id);
    setAnimatingIds(new Set(ids));
    await Promise.allSettled(unread.map(n => notificationApi.markRead(n._id)));
    setTimeout(() => {
      setNotifications(prev => prev.map(n => ({ ...n, status: 'read' as const })));
      setAnimatingIds(new Set());
    }, 350);
  };

  const deleteNotif = async (id: string) => {
    setAnimatingIds(prev => new Set([...prev, id]));
    try {
      await notificationApi.delete(id);
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n._id !== id));
        setAnimatingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
      }, 300);
    } catch {
      setAnimatingIds(prev => { const s = new Set(prev); s.delete(id); return s; });
    }
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return n.status === 'unread';
    if (filter === 'read')   return n.status === 'read';
    return true;
  });

  const grouped = useMemo(() => {
    const groups: Record<string, Notification[]> = { today: [], yesterday: [], older: [] };
    filtered.forEach(n => groups[getGroup(n.createdAt)].push(n));
    return groups;
  }, [filtered]);

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  return (
    <div className="page-wrapper" style={{ paddingTop: 72 }}>
      <div className="page-hero">
        <div style={{ maxWidth: 'var(--container-max)', width: '90%', margin: '0 auto', padding: '48px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 50, height: 50, borderRadius: 14, background: 'rgba(14,201,127,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#0ec97f' }}>
              <i className="ti ti-bell" />
            </div>
            <div>
              <h1 style={{ marginBottom: 4 }}>الإشعارات</h1>
              <p style={{ margin: 0, opacity: .75 }}>
                تابع آخر تحديثاتك
                {unreadCount > 0 && (
                  <span style={{ marginRight: 8, background: 'rgba(14,201,127,0.15)', color: '#0ec97f', fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>
                    {unreadCount} غير مقروء
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 760, width: '90%', margin: '32px auto 80px' }}>

        {error && (
          <div className="modal-error" style={{ marginBottom: 20, borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <i className="ti ti-alert-triangle" style={{ fontSize: 18 }} />
            <span style={{ flex: 1 }}>{error}</span>
            <button onClick={loadNotifs} style={{ background: 'none', border: '1px solid currentColor', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', color: 'inherit', fontSize: 12 }}>
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div className="notif-page-toolbar" style={{ marginBottom: 20 }}>
          <div className="notif-filter-tabs">
            {(['all', 'unread', 'read'] as const).map(f => (
              <button
                key={f}
                className={`notif-filter-tab${filter === f ? ' active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? `الكل (${notifications.length})` : f === 'unread' ? `غير مقروء (${unreadCount})` : `مقروء`}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {unreadCount > 0 && (
              <button className="btn-sm" onClick={markAllRead} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="ti ti-checks" /> تحديد الكل كمقروء
              </button>
            )}
            <button className="btn-sm" onClick={loadNotifs} title="تحديث" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <i className="ti ti-refresh" />
            </button>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{ height: 72, borderRadius: 12, background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.4s ease-in-out infinite', animationDelay: `${i * 0.1}s` }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.4 }}><i className="ti ti-bell-off" /></div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, opacity: 0.7 }}>
              {filter === 'unread' ? 'لا توجد إشعارات غير مقروءة' : 'لا توجد إشعارات'}
            </div>
            <div style={{ fontSize: 13, opacity: 0.5 }}>ستظهر هنا إشعاراتك عند ورودها</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {(['today', 'yesterday', 'older'] as const).map(group => (
              grouped[group].length > 0 && (
                <div key={group}>
                  {/* Group header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--neutral-400, #9ca3af)', textTransform: 'uppercase', letterSpacing: 1 }}>
                      {GROUP_LABELS[group]}
                    </span>
                    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                    <span style={{ fontSize: 11, color: 'var(--neutral-400, #9ca3af)' }}>
                      {grouped[group].length}
                    </span>
                  </div>

                  <div className="notif-page-list" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {grouped[group].map(n => {
                      const icon = TYPE_ICON[n.type] || 'ti-bell';
                      const color = TYPE_COLOR[n.type] || '#3b82f6';
                      const isAnimating = animatingIds.has(n._id);
                      return (
                        <div
                          key={n._id}
                          className={`notif-page-item${n.status === 'unread' ? ' unread' : ''}`}
                          onClick={() => n.status === 'unread' && markRead(n._id)}
                          style={{
                            display: 'flex', alignItems: 'flex-start', gap: 12,
                            padding: '14px 16px', borderRadius: 12,
                            border: `1px solid ${n.status === 'unread' ? `${color}30` : 'rgba(255,255,255,0.06)'}`,
                            background: n.status === 'unread' ? `${color}08` : 'rgba(255,255,255,0.02)',
                            cursor: n.status === 'unread' ? 'pointer' : 'default',
                            transition: 'all 0.3s ease',
                            opacity: isAnimating ? 0.5 : 1,
                            transform: isAnimating ? 'scale(0.98)' : 'scale(1)',
                          }}
                        >
                          {/* Icon */}
                          <div style={{
                            width: 40, height: 40, borderRadius: 11, flexShrink: 0,
                            background: `${color}18`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
                          }}>
                            <i className={`ti ${icon}`} />
                          </div>

                          {/* Content */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            {n.title && (
                              <div style={{ fontWeight: 700, fontSize: 13.5, color: 'var(--text-primary, #f0f5ff)', marginBottom: 3 }}>{translateMessage(n.title)}</div>
                            )}
                            <p style={{ margin: 0, fontSize: 13, color: n.status === 'unread' ? 'var(--text-primary, #f0f5ff)' : 'var(--text-secondary, #9ca3af)', lineHeight: 1.5, fontWeight: n.status === 'unread' ? 500 : 400 }}>
                              {translateMessage(n.message)}
                            </p>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted, #6b7280)', marginTop: 5 }}>
                              <i className="ti ti-clock" style={{ fontSize: 12 }} />
                              {new Date(n.createdAt).toLocaleString('ar-EG', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                            </span>
                          </div>

                          {/* Unread dot */}
                          {n.status === 'unread' && (
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0, marginTop: 6, boxShadow: `0 0 6px ${color}` }} />
                          )}

                          {/* Actions */}
                          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                            {n.status === 'unread' && (
                              <button
                                className="notif-action-btn"
                                title="تحديد كمقروء"
                                onClick={e => { e.stopPropagation(); markRead(n._id); }}
                                style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '4px 8px' }}
                              >
                                <i className="ti ti-check" />
                              </button>
                            )}
                            <button
                              className="notif-action-btn danger"
                              title="حذف"
                              onClick={e => { e.stopPropagation(); deleteNotif(n._id); }}
                              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '4px 8px' }}
                            >
                              <i className="ti ti-trash" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}