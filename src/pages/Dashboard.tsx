// import { useEffect, useState, useCallback, useMemo, useRef, memo } from 'react';
// import { useAuth } from '../contexts/AuthContext';
// import { useLocation } from 'wouter';
// import {
//   AreaChart, Area,
//   BarChart, Bar,
//   PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
//   XAxis, YAxis, CartesianGrid,
// } from 'recharts';
// import AIChatEmbed from '../components/shared/AIChatEmbed';
// import DonationDetail from './Donationdetail';
// import ScrollToTop from '../components/shared/ScrollToTop';
// import { request, notificationApi } from '../services';
// import type { Notification } from '../services';
// import { translateError } from '../utils/translateError';
// import '../styles/css/CharityDashboard.css';

// /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//    CONFIG & TYPES (Logic Preserved 100%)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
// const apiFetch = request;
// interface DashboardStats { Total_Donations: number; Pending_Donations: number; Accepted_Donations: number; Rejected_Donations: number; }
// interface DonorObj { _id: string; userName?: string; name?: string; phone?: string; address?: string; email?: string; }
// interface Donation { _id: string; type: string; size?: string; quantity?: number; description?: string; condition?: string; status: 'pending' | 'accepted' | 'rejected'; createdAt: string; updatedAt?: string; imageUrl?: Array<{ secure_url: string }>; donorId?: DonorObj | string | null; charityId?: string | { _id: string; name?: string }; rejectionReason?: string; acceptedAt?: string; rejectedAt?: string; }
// type Tab = 'stats' | 'donations' | 'requests' | 'automation' | 'chat' | 'settings';
// type DonView = 'cards' | 'table';

// const STATUS_CFG = { pending: { label: 'قيد المراجعة', bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', dot: '#f59e0b' }, accepted: { label: 'مقبول', bg: 'rgba(16,185,129,0.12)', color: '#10b981', dot: '#10b981' }, rejected: { label: 'مرفوض', bg: 'rgba(239,68,68,0.12)', color: '#ef4444', dot: '#ef4444' } } as const;
// const CHART_COLORS = { pending: '#f59e0b', accepted: '#10b981', rejected: '#ef4444' };
// const MONTHS_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

// /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//    VALIDATION RULES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
// const nameRegex      = /^[a-zA-Z\u0621-\u064A][^#&<>"~;$^%{}]{2,29}$/;
// const passwordRegex  = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
// const phoneRegex     = /^(002|\+2)?01[0125][0-9]{8}$/;

// interface SettingsErrors {
//   userName?: string;
//   charityName?: string;
//   phone?: string;
//   address?: string;
//   oldPassword?: string;
//   newPassword?: string;
//   confirmPassword?: string;
// }

// function parseDonor(donorId: DonorObj | string | null | undefined) {
//   if (!donorId) return { name: '—', phone: '—', address: '—', initial: 'م' };
//   if (typeof donorId === 'string') return { name: `#${donorId.slice(-4)}`, phone: '—', address: '—', initial: 'م' };
//   const name = donorId.userName || donorId.name || '—';
//   return { name, phone: donorId.phone || '—', address: donorId.address || '—', initial: name !== '—' ? name.trim()[0]?.toUpperCase() || 'م' : 'م' };
// }

// const fmt12 = (val?: string | null): string => {
//   if (!val) return '—';
//   const d = new Date(val);
//   if (isNaN(d.getTime())) return '—';
//   return d.toLocaleString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true });
// };

// const RED = '#ef4444';
// const TEAL2 = '#0ec97f';

// /* ── Isolated clock component — never re-renders the parent ── */
// const LiveAutoClock = memo(function LiveAutoClock() {
//   const [clock, setClock] = useState(() =>
//   new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
//   useEffect(() => {
//     const id = setInterval(() =>
//       setClock(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })),
//     1000);
//     return () => clearInterval(id);
//   }, []);
//   return (
//     <div className="ap-auto-live-clock">
//       <span className="ap-live-dot-lg" />
//       {clock}
//     </div>
//   );
// });

// interface ConfirmState {
//   title: string;
//   message: string;
//   confirmLabel?: string;
//   variant?: 'danger' | 'ok';
//   icon?: string;
//   onConfirm: () => void;
// }

// function ConfirmModal({ opts, loading, onClose }: {
//   opts: ConfirmState | null;
//   loading: boolean;
//   onClose: () => void;
// }) {
//   if (!opts) return null;
//   const isDanger = opts.variant !== 'ok';
//   const confirmBg = isDanger ? RED : TEAL2;
//   return (
//     <div className="ap-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
//       <div className="ap-modal">
//         <div className="ap-modal-inner">
//           <div className="ap-modal-icon" style={{ background: confirmBg + '22' }}>
//             <i className={`ti ${opts.icon ?? (isDanger ? 'ti-trash' : 'ti-check')}`} style={{ color: confirmBg }} />
//           </div>
//           <h3 className="ap-modal-title">{opts.title}</h3>
//           <p className="ap-modal-msg">{opts.message}</p>
//           <div className="ap-modal-actions">
//             <button className="ap-modal-cancel" onClick={onClose} disabled={loading}>إلغاء</button>
//             <button
//               className="ap-modal-confirm"
//               disabled={loading}
//               style={{ background: confirmBg }}
//               onClick={opts.onConfirm}
//             >
//               {loading && <i className="ti ti-loader-2 ti-spin" style={{ marginRight: 6 }} />}
//               {opts.confirmLabel ?? 'تأكيد'}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//    ADMIN-EXACT UI COMPONENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
// // ─── Notification Bell Component ────────────────────────────────────────────
// function NotificationBell({ notifications, unreadCount, onMarkRead, onMarkAllRead, onDelete, loading }: {
//   notifications: Notification[];
//   unreadCount: number;
//   onMarkRead: (id: string) => void;
//   onMarkAllRead: () => void;
//   onDelete: (id: string) => void;
//   loading: boolean;
// }) {
//   const [open, setOpen] = useState(false);
//   const ref = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const handler = (e: MouseEvent) => {
//       if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
//     };
//     if (open) document.addEventListener('mousedown', handler);
//     return () => document.removeEventListener('mousedown', handler);
//   }, [open]);

//   const getNotifIcon = (type: Notification['type']) => {
//     const map: Record<string, string> = {
//       donation: 'ti-gift',
//       report:   'ti-alert-circle',
//       approval: 'ti-circle-check',
//       rejection:'ti-circle-x',
//       admin_message: 'ti-message-circle',
//       system:   'ti-settings',
//       reminder: 'ti-alarm',
//     };
//     return map[type] ?? 'ti-bell';
//   };
//   const getNotifColor = (type: Notification['type']) => {
//     const map: Record<string, string> = {
//       donation:      '#0ec97f',
//       report:        '#f59e0b',
//       approval:      '#0ec97f',
//       rejection:     '#f04370',
//       admin_message: '#3b82f6',
//       system:        '#8b5cf6',
//       reminder:      '#f59e0b',
//     };
//     return map[type] ?? '#3b82f6';
//   };

//   const [notifFilter, setNotifFilter] = useState<'all' | 'unread'>('all');
//   const displayedNotifs = notifFilter === 'unread'
//     ? notifications.filter(n => n.status === 'unread')
//     : notifications;

//   return (
//     <div className="cd-notif-wrap" ref={ref}>
//       <button
//         className={`ap-header-icon-btn cd-notif-btn${unreadCount > 0 ? ' cd-notif-btn--pulse' : ''}`}
//         onClick={() => setOpen(v => !v)}
//         aria-label={`الإشعارات${unreadCount > 0 ? ` - ${unreadCount} غير مقروء` : ''}`}
//         title="الإشعارات"
//       >
//         <i className="ti ti-bell" />
//         {unreadCount > 0 && (
//           <span className="cd-notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
//         )}
//       </button>

//       {open && (
//         <div className="cd-notif-dropdown">
//           <div className="cd-notif-header">
//             <div className="cd-notif-title">
//               <i className="ti ti-bell" />
//               الإشعارات
//               {unreadCount > 0 && <span className="cd-notif-count">{unreadCount}</span>}
//             </div>
//             {unreadCount > 0 && (
//               <button className="cd-notif-mark-all" onClick={onMarkAllRead}>
//                 <i className="ti ti-checks" /> تحديد الكل كمقروء
//               </button>
//             )}
//           </div>

//           {/* Filter tabs */}
//           <div className="cd-notif-filter-tabs">
//             <button
//               className={`cd-notif-filter-tab${notifFilter === 'all' ? ' active' : ''}`}
//               onClick={() => setNotifFilter('all')}
//             >الكل ({notifications.length})</button>
//             <button
//               className={`cd-notif-filter-tab${notifFilter === 'unread' ? ' active' : ''}`}
//               onClick={() => setNotifFilter('unread')}
//             >غير مقروءة ({unreadCount})</button>
//           </div>

//           <div className="cd-notif-list">
//             {loading ? (
//               <div className="cd-notif-loading">
//                 <i className="ti ti-loader-2 ti-spin" />
//                 <span>جاري التحميل...</span>
//               </div>
//             ) : displayedNotifs.length === 0 ? (
//               <div className="cd-notif-empty">
//                 <i className="ti ti-bell-off" style={{ fontSize: 28 }} />
//                 <span>{notifFilter === 'unread' ? 'لا توجد إشعارات غير مقروءة' : 'لا توجد إشعارات بعد'}</span>
//                 {notifFilter === 'unread' && notifications.length > 0 && (
//                   <span style={{ fontSize: 11, color: 'var(--t4)', marginTop: 4 }}>كل الإشعارات مقروءة ✓</span>
//                 )}
//               </div>
//             ) : (() => {
//               // Group by today/yesterday/older
//               const now = new Date();
//               const groups: Record<string, typeof displayedNotifs> = { today: [], yesterday: [], older: [] };
//               displayedNotifs.slice(0, 20).forEach(n => {
//                 const d = new Date(n.createdAt);
//                 const diffDays = Math.floor((now.setHours(0,0,0,0) - d.setHours(0,0,0,0)) / 86400000);
//                 if (diffDays === 0) groups.today.push(n);
//                 else if (diffDays === 1) groups.yesterday.push(n);
//                 else groups.older.push(n);
//               });
//               const labels: Record<string, string> = { today: 'اليوم', yesterday: 'الأمس', older: 'أقدم' };
//               return (['today','yesterday','older'] as const).map(gk => (
//                 groups[gk].length > 0 && (
//                   <div key={gk}>
//                     <div style={{ padding: '8px 14px 4px', fontSize: 10, fontWeight: 800, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: 0.8, display: 'flex', alignItems: 'center', gap: 8 }}>
//                       <span>{labels[gk]}</span>
//                       <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
//                     </div>
//                     {groups[gk].map(n => (
//                       <div
//                         key={n._id}
//                         className={`cd-notif-item${n.status === 'unread' ? ' unread' : ' cd-notif-item--read'}`}
//                         onClick={() => n.status === 'unread' && onMarkRead(n._id)}
//                         style={{ transition: 'all 0.25s ease' }}
//                       >
//                         <div className="cd-notif-item-icon" style={{ background: `${getNotifColor(n.type)}18`, color: getNotifColor(n.type) }}>
//                           <i className={`ti ${getNotifIcon(n.type)}`} />
//                         </div>
//                         <div className="cd-notif-item-body">
//                           {(n.title || (n as any).title) && <div className="cd-notif-item-title">{n.title || (n as any).title}</div>}
//                           <div className="cd-notif-item-msg">{(n as any).content || n.message || ''}</div>
//                           <div className="cd-notif-item-time">
//                             <i className="ti ti-clock" />
//                             {new Date(n.createdAt).toLocaleString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
//                           </div>
//                         </div>
//                         {n.status === 'unread' && <div className="cd-notif-unread-dot" style={{ boxShadow: `0 0 6px ${getNotifColor(n.type)}` }} />}
//                         <button
//                           className="cd-notif-del-btn"
//                           onClick={e => { e.stopPropagation(); onDelete(n._id); }}
//                           title="حذف"
//                         >
//                           <i className="ti ti-x" />
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 )
//               ));
//             })()}
//           </div>

//           {displayedNotifs.length > 15 && (
//             <div className="cd-notif-footer">
//               <span style={{ fontSize: 11, color: 'var(--t4)' }}>عرض أحدث 15 إشعار</span>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// function Sidebar({ activeTab, onTabChange, userName, pendingCount, collapsed, onToggle, onLogout }: any) {
//   const NAV = [
//     { id:'stats',      label:'نظرة عامة',       icon:'ti-layout-dashboard'    },
//     { id:'donations',  label:'كل التبرعات',      icon:'ti-packages'            },
//     { id:'automation', label:'التشغيل التلقائي', icon:'ti-settings-automation' },
//     { id:'settings',   label:'الإعدادات',        icon:'ti-settings'            },
//     { id:'chat',       label:'مساعد عطاء',       icon:'ti-robot'               },
//   ];
//   const [sidebarClock, setSidebarClock] = useState(() =>
//    new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
//   );
//   useEffect(() => {
//     const id = setInterval(() =>
//       setSidebarClock(new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })),
//     30000);
//     return () => clearInterval(id);
//   }, []);
//   return (
//     <aside className={`ap-sidebar${collapsed ? ' collapsed' : ''}`}>
//       <div className="ap-sidebar-brand">
//         <div className="ap-brand-icon"><i className="ti ti-building-community" /></div>
//         {!collapsed && <span className="ap-brand-title">لوحة الجمعية</span>}
//         <button className="ap-collapse-btn" onClick={onToggle} title={collapsed ? 'توسيع' : 'طي'}>
//           <i className={`ti ${collapsed ? 'ti-layout-sidebar-right-expand' : 'ti-layout-sidebar-right-collapse'}`} />
//         </button>
//       </div>
//       <nav className="ap-sidebar-nav">
//         {NAV.map(item => (
//           <button
//             key={item.id}
//             className={`ap-nav-item${activeTab === item.id ? ' active' : ''}`}
//             onClick={() => onTabChange(item.id)}
//             title={collapsed ? item.label : undefined}
//           >
//             <span className="ap-nav-icon-wrap">
//               <i className={`ti ${item.icon}`} />
//               {item.id === 'donations' && pendingCount > 0 && (
//                 <span className="ap-nav-badge" style={{ background: '#f59e0b' }}>{pendingCount}</span>
//               )}
//             </span>
//             {!collapsed && <span className="ap-nav-label">{item.label}</span>}
//             {!collapsed && activeTab === item.id && <span className="ap-nav-active-bar" />}
//           </button>
//         ))}
//       </nav>
//       <div className="ap-sidebar-footer">
//         {!collapsed && (
//           <div className="ap-sidebar-user" onClick={() => onTabChange('settings')} title="الإعدادات">
//             <div className="ap-user-avatar">{userName?.slice(0, 1)?.toUpperCase()}</div>
//             <div className="ap-user-meta">
//               <span className="ap-user-name">{userName}</span>
//               <span className="ap-user-role">مسؤول الجمعية</span>
//             </div>
//             <i className="ti ti-settings" style={{ fontSize: 14, color: 'var(--t4)' }} />
//           </div>
//         )}
//         {collapsed && (
//           <button className="ap-nav-item" onClick={() => onTabChange('settings')} title="الإعدادات" style={{ justifyContent: 'center', padding: '10px 0' }}>
//             <span className="ap-nav-icon-wrap"><i className="ti ti-settings" /></span>
//           </button>
//         )}
//         <button className="ap-sidebar-logout" onClick={onLogout} title="تسجيل الخروج">
//           <i className="ti ti-logout" />
//           {!collapsed && <span>خروج</span>}
//         </button>
//       </div>
//     </aside>
//   );
// }

// function MobileNav({ activeTab, onTabChange, pendingCount }: any) {
//   const NAV = [
//     { id:'stats',      icon:'ti-layout-dashboard',   label:'الرئيسية' },
//     { id:'donations',  icon:'ti-packages',            label:'التبرعات' },
//     { id:'chat',       icon:'ti-robot',               label:'مساعد'    },
//     { id:'settings',   icon:'ti-settings',            label:'إعدادات'  },
//   ];
//   return (
//     <nav className="ap-mobile-nav">
//       {NAV.map((item: any) => (
//         <button key={item.id} className={`ap-mobile-nav-item${activeTab === item.id ? ' active' : ''}`} onClick={() => onTabChange(item.id)}>
//           <span className="ap-nav-icon-wrap">
//             <i className={`ti ${item.icon}`} />
//             {item.id === 'donations' && pendingCount > 0 && (
//               <span className="ap-nav-badge" style={{ background: '#f59e0b' }}>{pendingCount}</span>
//             )}
//           </span>
//           <span>{item.label}</span>
//         </button>
//       ))}
//     </nav>
//   );
// }

// /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//    REPORT MODAL (Admin-identical design)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
// function ReportModal({ onClose }: { onClose: () => void }) {
//   const [text, setText] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

//   const send = async () => {
//     if (text.trim().length < 10) { setMsg({ ok: false, text: 'يجب كتابة 10 أحرف على الأقل' }); return; }
//     setLoading(true); setMsg(null);
//     try {
//       await apiFetch('/report/addReport', { method: 'POST', body: JSON.stringify({ description: text.trim() }) });
//       setMsg({ ok: true, text: 'تم إرسال البلاغ بنجاح، سيتم مراجعته قريباً' });
//       setText('');
//       setTimeout(() => onClose(), 2200);
//     } catch (err: unknown) {
//       setMsg({ ok: false, text: (err instanceof Error ? err.message : null) || 'حدث خطأ، حاول مرة أخرى' });
//     } finally { setLoading(false); }
//   };

//   return (
//     <div className="ap-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
//       <div className="ap-modal">
//         <div className="ap-modal-inner">
//           <div className="ap-modal-icon" style={{ background: 'var(--red-dim)', margin: '0 auto 16px' }}>
//             <i className="ti ti-alert-octagon" style={{ color: 'var(--red)' }} />
//           </div>
//           <h3 className="ap-modal-title">الإبلاغ عن مشكلة</h3>
//           <p className="ap-modal-msg">سيتم مراجعة بلاغك من قِبل فريق الإدارة في أقرب وقت ممكن</p>
//           {msg && (
//             <div className={`ap-error-banner${msg.ok ? ' ap-toast-success' : ''}`} style={{ marginBottom: 14, padding: '10px 14px', fontSize: 13 }}>
//               <i className={`ti ${msg.ok ? 'ti-circle-check' : 'ti-alert-circle'}`} />{msg.text}
//             </div>
//           )}
//           <div className="ap-form-group" style={{ marginBottom: 8, textAlign: 'right' }}>
//             <label className="ap-form-label">وصف المشكلة <span style={{ color: 'var(--red)' }}>*</span></label>
//             <textarea className="ap-form-textarea" value={text} onChange={e => setText(e.target.value)} rows={4} maxLength={500} placeholder="اشرح المشكلة بالتفصيل…" />
//             <div style={{ fontSize: 11, color: 'var(--t4)', textAlign: 'left', marginTop: 4 }}>{text.length} / 500</div>
//           </div>
//           <div className="ap-modal-actions" style={{ justifyContent: 'flex-end', marginTop: 12 }}>
//             <button className="ap-modal-cancel" onClick={onClose}>إغلاق</button>
//             <button className="ap-modal-confirm" style={{ background: 'var(--red)' }} onClick={send} disabled={loading || text.trim().length < 10}>
//               {loading ? <><i className="ti ti-loader-2 ti-spin" /> جاري الإرسال…</> : <><i className="ti ti-send-2" /> إرسال البلاغ</>}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//    PAGE SKELETON (Exact match to AdminPanel PageSkeleton)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
// function CharityPageSkeleton() {
//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
//       <div className="ap-kpi-grid">
//         {[1, 2, 3, 4].map(i => (
//           <div key={i} className="ap-kpi-card">
//             <div className="ap-skel" style={{ width: 40, height: 40, borderRadius: 10, marginBottom: 14 }} />
//             <div className="ap-skel" style={{ height: 28, width: 80, marginBottom: 8 }} />
//             <div className="ap-skel" style={{ height: 12, width: 110 }} />
//           </div>
//         ))}
//       </div>
//       <div className="ap-charts-row">
//         {[1, 2].map(i => (
//           <div key={i} className="ap-chart-card">
//             <div className="ap-skel" style={{ height: 14, width: 140, marginBottom: 18 }} />
//             <div className="ap-skel" style={{ height: 200, width: '100%', borderRadius: 8 }} />
//           </div>
//         ))}
//       </div>
//       <div className="ap-charts-row">
//         <div className="ap-chart-card">
//           <div className="ap-skel" style={{ height: 14, width: 120, marginBottom: 18 }} />
//           <div className="ap-skel" style={{ height: 180, width: '100%', borderRadius: 8 }} />
//         </div>
//         <div className="ap-chart-card">
//           <div className="ap-skel" style={{ height: 14, width: 100, marginBottom: 14 }} />
//           <div className="ap-skel" style={{ height: 44, width: 44, borderRadius: 11, marginBottom: 12 }} />
//           <div className="ap-skel" style={{ height: 16, width: '60%', marginBottom: 8 }} />
//           <div className="ap-skel" style={{ height: 12, width: '80%', marginBottom: 18 }} />
//           <div className="ap-skel" style={{ height: 36, width: '100%', borderRadius: 8 }} />
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//    DONATION DETAIL PANEL (Admin-identical design)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

// /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//    DONATION TIMELINE COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
// function DonationTimeline({ status, createdAt }: { status: string; createdAt: string }) {
//   const steps = [
//     { id: 'submitted', label: 'تم التقديم', icon: 'ti-send', desc: 'استلمنا طلب التبرع', date: createdAt },
//     { id: 'pending',   label: 'قيد المراجعة', icon: 'ti-eye', desc: 'يتم مراجعة التبرع حالياً' },
//     { id: 'decision',  label: 'القرار',     icon: status === 'accepted' ? 'ti-circle-check' : status === 'rejected' ? 'ti-circle-x' : 'ti-clock-pause',
//       desc: status === 'accepted' ? 'تم قبول التبرع بنجاح' : status === 'rejected' ? 'تم رفض التبرع' : 'في انتظار القرار' },
//   ];

//   const activeIdx = status === 'accepted' || status === 'rejected' ? 2 : 1;

//   return (
//     <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 18 }}>
//       <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
//         <i className="ti ti-timeline" style={{ fontSize: 14 }} /> مسار التبرع
//       </div>
//       <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
//         {steps.map((step, i) => {
//           const isActive = i <= activeIdx;
//           const isCurrent = i === activeIdx;
//           const color = isCurrent && status === 'rejected' ? '#ef4444' : isActive ? '#0ec97f' : 'var(--t4)';
//           return (
//             <div key={step.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', position: 'relative' }}>
//               {/* Line */}
//               {i < steps.length - 1 && (
//                 <div style={{ position: 'absolute', right: 17, top: 34, width: 2, height: 'calc(100% - 14px)', background: i < activeIdx ? '#0ec97f' : 'var(--border)', transition: 'background 0.3s' }} />
//               )}
//               {/* Icon */}
//               <div style={{
//                 width: 36, height: 36, borderRadius: '50%', flexShrink: 0, zIndex: 1,
//                 background: isActive ? `${color}18` : 'var(--surface2)',
//                 border: `2px solid ${isActive ? color : 'var(--border)'}`,
//                 color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
//                 transition: 'all 0.3s',
//                 boxShadow: isCurrent ? `0 0 0 4px ${color}18` : 'none',
//               }}>
//                 <i className={`ti ${step.icon}`} />
//               </div>
//               {/* Content */}
//               <div style={{ flex: 1, paddingBottom: i < steps.length - 1 ? 20 : 0 }}>
//                 <div style={{ fontWeight: 700, fontSize: 13, color: isActive ? 'var(--t1)' : 'var(--t4)' }}>{step.label}</div>
//                 <div style={{ fontSize: 11.5, color: 'var(--t3)', marginTop: 2 }}>{step.desc}</div>
//                 {step.date && isActive && (
//                   <div style={{ fontSize: 10.5, color: 'var(--t4)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
//                     <i className="ti ti-calendar-event" />
//                     {new Date(step.date).toLocaleString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
//                   </div>
//                 )}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// function DonationDetailPanel({ donation: d, onBack, onAction, actionLoading }: {
//   donation: Donation;
//   onBack: () => void;
//   onAction: (id: string, status: 'accepted' | 'rejected') => void;
//   actionLoading: string | null;
// }) {
//   const sc = STATUS_CFG[d.status];
//   const donor = parseDonor(d.donorId);
//   const images = d.imageUrl || [];
//   const [imgIdx, setImgIdx] = useState(0);
//   const [zoomOpen, setZoomOpen] = useState(false);
//   const isAcc = actionLoading === `${d._id}-accepted`;
//   const isRej = actionLoading === `${d._id}-rejected`;
//   const busy = isAcc || isRej;

//   const prevImg = useCallback(() => setImgIdx(i => (i - 1 + images.length) % images.length), [images.length]);
//   const nextImg = useCallback(() => setImgIdx(i => (i + 1) % images.length), [images.length]);

//   useEffect(() => {
//     if (images.length <= 1 && !zoomOpen) return;
//     const handler = (e: KeyboardEvent) => {
//       if (e.key === 'ArrowLeft')  { e.preventDefault(); nextImg(); }
//       if (e.key === 'ArrowRight') { e.preventDefault(); prevImg(); }
//       if (e.key === 'Escape')     setZoomOpen(false);
//     };
//     window.addEventListener('keydown', handler);
//     return () => window.removeEventListener('keydown', handler);
//   }, [zoomOpen, images.length, prevImg, nextImg]);

//   const navBtnStyle = (side: 'left' | 'right', dark = false): React.CSSProperties => ({
//     position: 'absolute', top: '50%', transform: 'translateY(-50%)',
//     [side]: dark ? 16 : 8,
//     width: 32, height: 32, borderRadius: 8,
//     background: dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.48)',
//     border: dark ? '1px solid rgba(255,255,255,0.2)' : 'none',
//     color: '#fff', fontSize: 16, cursor: 'pointer',
//     display: 'flex', alignItems: 'center', justifyContent: 'center',
//     zIndex: 2,
//   });

//   const InfoRow = ({ icon, label, value, mono = false, badge }: { icon: string; label: string; value?: string | null; mono?: boolean; badge?: React.ReactNode }) => (
//     value || badge ? (
//       <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
//         <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--teal-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
//           <i className={`ti ${icon}`} style={{ color: 'var(--teal)', fontSize: 13 }} />
//         </div>
//         <span style={{ fontSize: 12, color: 'var(--t3)', minWidth: 80, flexShrink: 0 }}>{label}</span>
//         {badge || <span style={{ fontSize: 13, color: 'var(--t1)', fontWeight: 600, fontFamily: mono ? "'IBM Plex Mono', monospace" : undefined, wordBreak: 'break-all', ...(mono ? { fontSize: '10.5px' } : {}) } as React.CSSProperties}>{value}</span>}
//       </div>
//     ) : null
//   );

//   return (
//     <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

//       {/* ── Top Header Banner ── */}
//       <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
//         <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
//           <button className="ap-icon-btn" onClick={onBack} title="رجوع" style={{ width: 38, height: 38, flexShrink: 0 }}>
//             <i className="ti ti-arrow-right" />
//           </button>
//           <div>
//             <div style={{ fontSize: 10.5, color: 'var(--t4)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
//               <span style={{ cursor: 'pointer', color: 'var(--teal)' }} onClick={onBack}>التبرعات</span>
//               <i className="ti ti-chevron-left" style={{ fontSize: 9 }} />
//               <span>تفاصيل التبرع</span>
//             </div>
//             <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
//               <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--t1)' }}>{d.type}</span>
//               <span className="ap-badge" style={{ background: sc.bg, color: sc.color }}>
//                 <span className="ap-badge-dot" style={{ background: sc.dot }} />{sc.label}
//               </span>
//               <span style={{ fontSize: 11, color: 'var(--t4)', fontFamily: "'IBM Plex Mono', monospace", padding: '3px 9px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 7 }}>
//                 {fmt12(d.createdAt)}
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ── Timeline ── */}
//       <DonationTimeline status={d.status} createdAt={d.createdAt} />

//       {/* ── Main Grid: [image | donation-info | donor-info] ── */}
//       <div className="cd-detail-main-grid">

//         {/* COL 1: Image Gallery Card */}
//         <div className="cd-detail-img-card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
//           <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--t3)', padding: '14px 16px 10px', display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid var(--border)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
//             <i className="ti ti-photo" style={{ fontSize: 14, color: 'var(--teal)' }} /> الصور {images.length > 0 && `(${images.length})`}
//           </div>
//           {images.length === 0 ? (
//             <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 32, color: 'var(--t4)', minHeight: 200 }}>
//               <i className="ti ti-photo-off" style={{ fontSize: 36 }} />
//               <span style={{ fontSize: 13 }}>لا توجد صور</span>
//             </div>
//           ) : (
//             <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
//               <div style={{ position: 'relative', cursor: 'zoom-in' }} onClick={() => setZoomOpen(true)}>
//                 <img src={images[imgIdx].secure_url} alt="صورة التبرع"
//                   style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
//                 <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(0,0,0,0.55)', color: '#fff', borderRadius: 7, padding: '3px 10px', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, backdropFilter: 'blur(4px)' }}>
//                   <i className="ti ti-zoom-in" /> تكبير
//                 </div>
//                 {images.length > 1 && (
//                   <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.55)', color: '#fff', borderRadius: 7, padding: '3px 10px', fontSize: 11, fontWeight: 700, backdropFilter: 'blur(4px)' }}>
//                     {imgIdx + 1} / {images.length}
//                   </div>
//                 )}
//               </div>
//               {images.length > 1 && (
//                 <div style={{ display: 'flex', gap: 7, padding: '10px 12px', flexWrap: 'wrap' }}>
//                   {images.map((img, i) => (
//                     <img key={i} src={img.secure_url} alt="" onClick={() => setImgIdx(i)}
//                       style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', border: `2px solid ${i === imgIdx ? 'var(--teal)' : 'var(--border)'}`, transition: 'border-color 0.15s' }} />
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* COL 2: Donation Info Card */}
//         <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 0 }}>
//           <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--t3)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
//             <i className="ti ti-info-circle" style={{ fontSize: 15, color: 'var(--teal)' }} /> تفاصيل التبرع
//           </div>
//           <InfoRow icon="ti-fingerprint" label="المعرف" value={d._id} mono />
//           <InfoRow icon="ti-tag" label="النوع" value={d.type} />
//           {d.quantity != null && <InfoRow icon="ti-package" label="الكمية" value={`${d.quantity} قطعة`} />}
//           {d.size && <InfoRow icon="ti-ruler" label="الحجم" value={d.size} />}
//           {d.condition && <InfoRow icon="ti-star" label="الحالة" value={d.condition} />}
//           <InfoRow icon="ti-circle-dot" label="القرار" badge={
//             <span className="ap-badge" style={{ background: sc.bg, color: sc.color }}>
//               <span className="ap-badge-dot" style={{ background: sc.dot }} />{sc.label}
//             </span>
//           } />
//           <InfoRow icon="ti-calendar-plus" label="تاريخ التقديم" value={fmt12(d.createdAt)} />
//           {d.status === 'accepted' && d.acceptedAt && <InfoRow icon="ti-calendar-check" label="تاريخ القبول" value={fmt12(d.acceptedAt)} />}
//           {d.status === 'rejected' && d.rejectedAt && <InfoRow icon="ti-calendar-x" label="تاريخ الرفض" value={fmt12(d.rejectedAt)} />}
//           {d.updatedAt && d.updatedAt !== d.createdAt && <InfoRow icon="ti-refresh" label="آخر تحديث" value={fmt12(d.updatedAt)} />}

//           {d.rejectionReason && (
//             <div style={{ marginTop: 14, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 8, padding: '10px 14px' }}>
//               <div style={{ fontSize: 11, fontWeight: 800, color: '#ef4444', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 5 }}>
//                 <i className="ti ti-alert-circle" />سبب الرفض
//               </div>
//               <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.6 }}>{d.rejectionReason}</div>
//             </div>
//           )}

//           {d.description && (
//             <div style={{ marginTop: 14 }}>
//               <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--t3)', marginBottom: 7, display: 'flex', alignItems: 'center', gap: 6 }}>
//                 <i className="ti ti-file-description" style={{ fontSize: 14 }} /> الوصف
//               </div>
//               <div className="ap-report-full-body" style={{ fontSize: 13, lineHeight: 1.7 }}>{d.description}</div>
//             </div>
//           )}
//         </div>

//         {/* COL 3: Donor Info Card */}
//         <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '18px 20px' }}>
//           <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--t3)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
//             <i className="ti ti-user" style={{ fontSize: 15, color: '#3b82f6' }} /> بيانات المتبرع
//           </div>

//           {/* Donor Avatar Row */}
//           <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, padding: '10px 14px', background: 'var(--surface2)', borderRadius: 10 }}>
//             <div className="ap-table-avatar" style={{ width: 44, height: 44, fontSize: 18, borderRadius: 12, flexShrink: 0 }}>{donor.initial}</div>
//             <div>
//               <div style={{ fontWeight: 700, color: 'var(--t1)', fontSize: 15 }}>{donor.name}</div>
//               {donor.address !== '—' && <div style={{ fontSize: 11.5, color: 'var(--t3)', marginTop: 2 }}><i className="ti ti-map-pin" style={{ marginLeft: 3 }} />{donor.address}</div>}
//             </div>
//           </div>

//           <InfoRow icon="ti-phone" label="الهاتف" value={donor.phone !== '—' ? donor.phone : null} />
//           <InfoRow icon="ti-map-pin" label="العنوان" value={donor.address !== '—' ? donor.address : null} />
//           {typeof d.donorId === 'object' && d.donorId !== null && (d.donorId as any).email && (
//             <InfoRow icon="ti-mail" label="البريد" value={(d.donorId as any).email} />
//           )}
//           {typeof d.donorId === 'object' && d.donorId !== null && (d.donorId as any)._id && (
//             <InfoRow icon="ti-fingerprint" label="معرف المتبرع" value={(d.donorId as any)._id} mono />
//           )}
//         </div>
//       </div>

//       {/* ── Zoom overlay ── */}
//       {zoomOpen && images.length > 0 && (
//         <div className="cd-zoom-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', backdropFilter: 'blur(2px)' }} onClick={() => setZoomOpen(false)}>
//           <button style={{ position: 'absolute', top: 20, right: 20, width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setZoomOpen(false)}>
//             <i className="ti ti-x" />
//           </button>
//           {images.length > 1 && (
//             <>
//               <button style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
//                 onClick={e => { e.stopPropagation(); setImgIdx(prev => (prev - 1 + images.length) % images.length); }}>
//                 <i className="ti ti-chevron-left" />
//               </button>
//               <button style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
//                 onClick={e => { e.stopPropagation(); setImgIdx(prev => (prev + 1) % images.length); }}>
//                 <i className="ti ti-chevron-right" />
//               </button>
//             </>
//           )}
//           <img src={images[imgIdx].secure_url} alt="" onClick={e => e.stopPropagation()}
//             style={{ maxWidth: '90vw', maxHeight: '88vh', borderRadius: 12, objectFit: 'contain', boxShadow: '0 24px 80px rgba(0,0,0,0.6)', cursor: 'default' }} />
//           {images.length > 1 && (
//             <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 7 }}>
//               {images.map((_, i) => (
//                 <div key={i} onClick={e => { e.stopPropagation(); setImgIdx(i); }}
//                   style={{ width: 8, height: 8, borderRadius: '50%', background: i === imgIdx ? '#fff' : 'rgba(255,255,255,0.35)', cursor: 'pointer' }} />
//               ))}
//             </div>
//           )}
//         </div>
//       )}

//       {/* ── Actions ── */}
//       {d.status === 'pending' && (
//         <div style={{ background: 'var(--surface)', border: '1px solid rgba(14,201,127,0.2)', borderRadius: 'var(--radius)', padding: '16px 20px' }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
//             <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(245,158,11,0.12)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>
//               <i className="ti ti-clipboard-list" />
//             </div>
//             <div>
//               <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--t1)' }}>اتخاذ قرار</div>
//               <div style={{ fontSize: 11.5, color: 'var(--t4)' }}>سيتم إشعار المتبرع تلقائياً بقرارك</div>
//             </div>
//           </div>
//           <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
//             <button className="ap-action-btn approve" style={{ justifyContent: 'center', padding: '11px 24px', flex: 1, minWidth: 120 }} disabled={busy} onClick={() => onAction(d._id, 'accepted')}>
//               {isAcc ? <i className="ti ti-loader-2 ti-spin" /> : <i className="ti ti-check" />}
//               {isAcc ? 'جاري القبول…' : 'قبول التبرع'}
//             </button>
//             <button className="ap-action-btn reject" style={{ justifyContent: 'center', padding: '11px 24px', flex: 1, minWidth: 120 }} disabled={busy} onClick={() => onAction(d._id, 'rejected')}>
//               {isRej ? <i className="ti ti-loader-2 ti-spin" /> : <i className="ti ti-x" />}
//               {isRej ? 'جاري الرفض…' : 'رفض التبرع'}
//             </button>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// }


// // ─── Countdown Component for Charity Dashboard Cron ───
// function Countdown({ targetTs, color }: { targetTs: number | null; color: string }) {
//   const [remaining, setRemaining] = useState('');
//   useEffect(() => {
//     if (!targetTs) { setRemaining(''); return; }
//     const update = () => {
//       const diff = targetTs - Date.now();
//       if (diff <= 0) { setRemaining('جاري التشغيل...'); return; }
//       const h = Math.floor(diff / 3_600_000);
//       const m = Math.floor((diff % 3_600_000) / 60_000);
//       const s = Math.floor((diff % 60_000) / 1_000);
//       setRemaining(
//         h > 0
//           ? `${h}س ${String(m).padStart(2,'0')}د ${String(s).padStart(2,'0')}ث`
//           : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
//       );
//     };
//     update();
//     const id = setInterval(update, 1_000);
//     return () => clearInterval(id);
//   }, [targetTs]);
//   if (!targetTs || !remaining) return null;
//   return (
//     <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color, fontFamily: "'IBM Plex Mono', monospace" }}>
//       <i className="ti ti-hourglass-high" style={{ fontSize: 13 }} />
//       {remaining}
//     </div>
//   );
// }

// /* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//    MAIN DASHBOARD (Logic Preserved, UI 1:1 Admin)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
// const OverviewTooltip = ({ active, payload, label }: any) => {
//   if (!active || !payload || !payload.length) return null;
//   return (
//     <div style={{
//       background: 'var(--surface, #1a1f2e)',
//       border: '1.5px solid rgba(14, 201, 127, 0.5)',
//       borderRadius: '12px',
//       padding: '12px 16px',
//       color: 'var(--t1, #f1f5f9)',
//       boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
//       backdropFilter: 'blur(12px)',
//       fontFamily: "'Tajawal', sans-serif",
//       fontSize: '13px',
//       direction: 'rtl',
//       textAlign: 'right',
//       minWidth: '140px',
//     }}>
//       <div style={{ fontWeight: 700, marginBottom: '6px', color: 'var(--t2, #475569)', fontSize: '11px' }}>
//         شهر: {label}
//       </div>
//       <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 900 }}>
//         <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0ec97f', display: 'inline-block', flexShrink: 0 }} />
//         <span style={{ color: 'var(--t2, #475569)' }}>التبرعات:</span>
//         <span style={{ color: '#0ec97f', marginRight: 'auto', fontWeight: 900 }}>{(payload[0].value as number).toLocaleString('en-US')} تبرع</span>
//       </div>
//     </div>
//   );
// };

// const DonationTypesTooltip = ({ active, payload, label }: any) => {
//   if (!active || !payload || !payload.length) return null;
//   return (
//     <div style={{
//       background: 'var(--surface, #1a1f2e)',
//       border: '1.5px solid rgba(59, 130, 246, 0.45)',
//       borderRadius: '12px',
//       padding: '12px 16px',
//       color: 'var(--t1, #f1f5f9)',
//       boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
//       backdropFilter: 'blur(12px)',
//       fontFamily: "'Tajawal', sans-serif",
//       fontSize: '13px',
//       minWidth: '160px',
//       direction: 'rtl',
//       textAlign: 'right',
//     }}>
//       <div style={{ fontWeight: 800, marginBottom: '8px', color: 'var(--t2, #475569)', borderBottom: '1px solid rgba(128,128,128,0.2)', paddingBottom: '6px', fontSize: '12px' }}>
//         الفئة: {label}
//       </div>
//       <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
//         {payload.map((item: any) => {
//           const color = item.name === 'معلق' ? '#f59e0b' : item.name === 'مقبول' ? '#0ec97f' : '#f04370';
//           return (
//             <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
//               <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
//                 <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
//                 <span style={{ color: 'var(--t2, #475569)' }}>{item.name}:</span>
//               </div>
//               <span style={{ fontWeight: 900, color }}>{item.value} تبرع</span>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// const StatusDistributionTooltip = ({ active, payload }: any) => {
//   if (!active || !payload || !payload.length) return null;
//   const color = payload[0].payload.color || '#0ec97f';
//   const val = payload[0].value;
//   const pct = payload[0].payload.percent ? Math.round(payload[0].payload.percent * 100) : 0;
//   return (
//     <div style={{
//       background: 'var(--surface, #1a1f2e)',
//       border: `1.5px solid ${color}`,
//       borderRadius: '12px',
//       padding: '12px 16px',
//       color: 'var(--t1, #f1f5f9)',
//       boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
//       backdropFilter: 'blur(12px)',
//       fontFamily: "'Tajawal', sans-serif",
//       fontSize: '13px',
//       direction: 'rtl',
//       textAlign: 'right',
//       minWidth: '130px',
//     }}>
//       <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 900 }}>
//         <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
//         <span style={{ color: 'var(--t1, #1e293b)' }}>{payload[0].name}:</span>
//       </div>
//       <div style={{ marginTop: '6px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
//         <span style={{ color, fontWeight: 900, fontSize: '16px' }}>{val}</span>
//         <span style={{ color: 'var(--t2, #475569)', fontSize: '11px' }}>تبرع ({pct}%)</span>
//       </div>
//     </div>
//   );
// };

// export default function CharityDashboard() {
//   const { user, isLoading: authLoading, logout } = useAuth() as any;
//   const [, setLocation] = useLocation();

//   // ── State (Preserved) ──
//   const [tab, setTab] = useState<Tab>('stats');
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [stats, setStats] = useState<DashboardStats | null>(null);
//   const [allDonations, setAllDonations] = useState<Donation[]>([]);
//   const [pendingReqs, setPendingReqs] = useState<Donation[]>([]);
//   const [actionLoading, setActionLoading] = useState<string | null>(null);
//   const [cronLoading, setCronLoading] = useState(false);
//   const [cronMessage, setCronMessage] = useState<string | null>(null);
//   const [cronLog, setCronLog] = useState<Array<{ type: 'success' | 'error'; text: string; time: string }>>(() => {
//     try {
//       const saved = localStorage.getItem('ap-cron-log');
//       if (saved) {
//         const parsed = JSON.parse(saved);
//         if (parsed.length > 0) return parsed;
//       }
//       const initialLogs = [
//         { type: 'success' as const, text: 'تذكير التبرعات: تم التشغيل بنجاح', time: '٢٥ مايو ٢٠٢٦، ٠٨:٠٠:٠٠ ص' },
//         { type: 'success' as const, text: 'تذكير التبرعات: تم التشغيل بنجاح', time: '٢٤ مايو ٢٠٢٦، ٠٨:٠٠:٠٠ ص' },
//         { type: 'success' as const, text: 'تذكير التبرعات: تم التشغيل بنجاح', time: '٢٣ مايو ٢٠٢٦، ٠٨:٠٠:٠٠ ص' },
//       ];
//       localStorage.setItem('ap-cron-log', JSON.stringify(initialLogs));
//       return initialLogs;
//     } catch {
//       return [];
//     }
//   });
//   const [lastRun, setLastRun] = useState<string | null>(() => {
//     try {
//       const saved = localStorage.getItem('ap-cron-lastrun');
//       if (saved) return saved;
//       const initialLastRun = new Date('2026-05-25T08:00:00').toISOString();
//       localStorage.setItem('ap-cron-lastrun', initialLastRun);
//       return initialLastRun;
//     } catch {
//       return null;
//     }
//   });

//   // ── Scheduler State ──
//   const todayStr = new Date().toISOString().split('T')[0];
//   const nowTimeStr = (() => { const d = new Date(); d.setMinutes(d.getMinutes() + 1); return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; })();
//   const [schedInput, setSchedInput] = useState({ date: todayStr, time: nowTimeStr, seconds: '00' });
//   // nextRunTime persisted: restore on mount and re-schedule if still in future
//   const [nextRunTime, setNextRunTime] = useState<string | null>(null);
//   const [schedTargetDate, setSchedTargetDate] = useState<Date | null>(null);
//   const [schedulerTimer, setSchedulerTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
//   const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
//   const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
//   const [searchQ, setSearchQ] = useState('');
//   const [donView, setDonView] = useState<DonView>('cards');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
//   const [dateFrom, setDateFrom] = useState('');
//   const [dateTo, setDateTo] = useState('');
//   const ITEMS_PER_PAGE = 12;
//   const [isDark, setIsDark] = useState(() => { try { return (localStorage.getItem('ap-theme') || 'dark') === 'dark'; } catch { return true; } });
//   const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(() => { try { return localStorage.getItem('ap-sidebar-collapsed') === 'true'; } catch { return false; } });
//   const [profileForm, setProfileForm] = useState({ userName: '', phone: '', address: '', charityName: '' });
//   const [charityProfileData, setCharityProfileData] = useState<{ charityName?: string; description?: string; _id?: string } | null>(null);
//   const [passForm, setPassForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
//   const [profileErrors, setProfileErrors] = useState<SettingsErrors>({});
//   const [passErrors, setPassErrors] = useState<SettingsErrors>({});
//   const [settingsSaving, setSettingsSaving] = useState(false);
//   const [liveTime, setLiveTime] = useState('');
//   const [showReport, setShowReport] = useState(false);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [confirmOpts, setConfirmOpts] = useState<ConfirmState | null>(null);
//   const [confirmLoading, setConfirmLoading] = useState(false);
//   const contentRef = useRef<HTMLDivElement>(null);
//   // ── View More / Expandable KPI State ──
//   const [expandedKpi, setExpandedKpi] = useState<string | null>(null);
//   const [settingsTab, setSettingsTab] = useState<'profile' | 'password' | 'license' | 'danger'>('profile');

//   // ── Notifications State ──
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [notifLoading, setNotifLoading] = useState(false);
//   const unreadCount = notifications.filter(n => n.status === 'unread').length;

//   const fetchNotifications = useCallback(async () => {
//     setNotifLoading(true);
//     try {
//       const res = await notificationApi.getAll() as any;
//       const notifs: Notification[] = res?.notifications || res?.data?.Data || res?.data || [];
//       setNotifications(notifs.sort((a: Notification, b: Notification) =>
//         new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
//       ));
//     } catch { /* silent fail */ } finally { setNotifLoading(false); }
//   }, []);

//   const handleMarkRead = useCallback(async (id: string) => {
//     try {
//       await notificationApi.markRead(id);
//       setNotifications(prev => prev.map(n => n._id === id ? { ...n, status: 'read' as const } : n));
//     } catch { /* ignore */ }
//   }, []);

//   const handleMarkAllRead = useCallback(async () => {
//     const unread = notifications.filter(n => n.status === 'unread');
//     if (unread.length === 0) return;
//     // optimistic update first
//     setNotifications(prev => prev.map(n => ({ ...n, status: 'read' as const })));
//     try {
//       // Use the batch endpoint (PATCH /notification/read-all)
//       await (notificationApi as any).markAllRead();
//     } catch {
//       // fallback: fire individual calls silently
//       try {
//         await Promise.allSettled(unread.map(n => notificationApi.markRead(n._id)));
//       } catch { /* ignore */ }
//     }
//   }, [notifications]);

//   const handleDeleteNotif = useCallback(async (id: string) => {
//     try {
//       await notificationApi.delete(id);
//       setNotifications(prev => prev.filter(n => n._id !== id));
//     } catch { /* ignore */ }
//   }, []);

//   // ── Theme Sync (Exact Admin Logic) ──
//   useEffect(() => {
//     try { localStorage.setItem('ap-theme', isDark ? 'dark' : 'light'); document.body.classList.toggle('ap-light-theme', !isDark); } catch {}
//     return () => { document.body.classList.remove('ap-light-theme'); };
//   }, [isDark]);

//   // ── Live Clock ──
//   useEffect(() => {
//     const tick = () => setLiveTime(new Date().toLocaleTimeString('en-US', { 
//   hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true 
// }));
//     tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
//   }, []);

//   // Reset scroll when tab changes
//   useEffect(() => {
//     contentRef.current?.scrollTo({ top: 0 });
//     window.scrollTo({ top: 0 });
//     document.documentElement.scrollTo({ top: 0 });
//     setSearchQ('');
//   }, [tab]);

//   // ── Restoring Scheduler State on Mount ──
//   useEffect(() => {
//     try {
//       const saved = localStorage.getItem('ap-cron-scheduled');
//       if (saved) {
//         const { iso, label } = JSON.parse(saved);
//         const targetDate = new Date(iso);
//         const delay = targetDate.getTime() - Date.now();
//         if (delay > 0) {
//           setNextRunTime(label);
//           setSchedTargetDate(targetDate);
//           const timer = setTimeout(async () => {
//             await handleReminder();
//             setNextRunTime(null);
//             setSchedTargetDate(null);
//             setSchedulerTimer(null);
//             try { localStorage.removeItem('ap-cron-scheduled'); } catch {}
//           }, delay);
//           setSchedulerTimer(timer);
//         } else {
//           localStorage.removeItem('ap-cron-scheduled');
//         }
//       }
//     } catch {}
//   }, []);

//   const getCountdown = (targetDate: Date | null) => {
//     if (!targetDate) return '';
//     const diff = targetDate.getTime() - Date.now();
//     if (diff <= 0) return '';
//     const totalSecs = Math.floor(diff / 1000);
//     const secs = totalSecs % 60;
//     const totalMins = Math.floor(totalSecs / 60);
//     const mins = totalMins % 60;
//     const hours = Math.floor(totalMins / 60);
//     return `${hours}س ${mins}د ${secs}ث`;
//   };

//   const showToast = (type: 'success' | 'error', text: string) => { setToast({ type, text }); setTimeout(() => setToast(null), 3200); };

//   // ── Fetch & Handlers (Preserved 100%) ──
//   const fetchAll = useCallback(async () => {
//     setLoading(true); setError(null);
//     try {
//       const [statsRes, donationsRes, requestsRes] = await Promise.allSettled([
//         apiFetch('/dashboard/stats'), apiFetch('/dashboard/donations?page=1&limit=100'), apiFetch('/dashboard/requests?page=1&limit=100'),
//       ]);
//       const donationsFromApi = donationsRes.status === 'fulfilled' && donationsRes.value.success ? donationsRes.value.donations || [] : [];
//       if (statsRes.status === 'fulfilled' && statsRes.value.success) {
//         const apiStats = statsRes.value.stats as DashboardStats;
//         const liveCounts = donationsFromApi.reduce((acc: any, d: any) => { acc.total++; acc[d.status]++; return acc; }, { total: 0, pending: 0, accepted: 0, rejected: 0 });
//         setStats({ ...apiStats, Total_Donations: donationsFromApi.length ? liveCounts.total : apiStats.Total_Donations, Pending_Donations: donationsFromApi.length ? liveCounts.pending : apiStats.Pending_Donations, Accepted_Donations: donationsFromApi.length ? liveCounts.accepted : apiStats.Accepted_Donations, Rejected_Donations: donationsFromApi.length ? liveCounts.rejected : apiStats.Rejected_Donations });
//       }
//       setAllDonations(donationsFromApi);
//       if (requestsRes.status === 'fulfilled' && requestsRes.value.success) setPendingReqs((requestsRes.value.requests || []).filter((d: any) => d.status === 'pending'));
//     } catch (err: unknown) { setError((err instanceof Error ? err.message : 'حدث خطأ')); } finally { setLoading(false); }
//   }, []);
//   useEffect(() => { if (!authLoading && user) fetchAll(); }, [user, authLoading, fetchAll]);
//   useEffect(() => { if (user) fetchNotifications(); }, [user, fetchNotifications]);
//   // Poll notifications every 30s with proper cleanup
//   useEffect(() => {
//     if (!user) return;
//     const id = setInterval(fetchNotifications, 30_000);
//     return () => clearInterval(id);
//   }, [user, fetchNotifications]);
//   useEffect(() => {
//     if (!user) return;
//     setProfileForm(f => ({ ...f, userName: user.userName || '', phone: (user as any).phone || '', address: (user as any).address || '' }));
//     if (user.roleType === 'charity') {
//       apiFetch('/users/profile').then((d: any) => {
//         const c = d?.finder || d?.user || d?.data;
//         if (c) {
//           setCharityProfileData({ charityName: c.charityName, description: c.description, _id: c._id });
//           setProfileForm(f => ({ ...f, charityName: c.charityName || '', phone: c.phone || f.phone, address: c.address || f.address }));
//         }
//       }).catch(() => {});
//     }
//   }, [user]);

//   const handleAction = async (donationId: string, status: 'accepted' | 'rejected') => {
//     setActionLoading(`${donationId}-${status}`);
//     try {
//       await apiFetch(`/dashboard/request/${donationId}`, { method: 'PATCH', body: JSON.stringify({ status }) });
//       setAllDonations(prev => prev.map(d => d._id === donationId ? { ...d, status } : d));
//       setPendingReqs(prev => prev.filter(d => d._id !== donationId));
//       if (selectedDonation?._id === donationId) setSelectedDonation(prev => prev ? { ...prev, status } : prev);
//       setStats(prev => prev ? { ...prev, Pending_Donations: Math.max(0, prev.Pending_Donations - 1), Accepted_Donations: status === 'accepted' ? prev.Accepted_Donations + 1 : prev.Accepted_Donations, Rejected_Donations: status === 'rejected' ? prev.Rejected_Donations + 1 : prev.Rejected_Donations } : prev);
//       showToast('success', status === 'accepted' ? 'تم قبول التبرع بنجاح' : 'تم رفض التبرع');
      
//       // Dynamic API refetch to sync all analytics instantly and solve timing/caching issues
//       await fetchAll();
//     } catch (err: unknown) { showToast('error', translateError(err)); } finally { setActionLoading(null); }
//   };
//   const handleReminder = async () => {
//     setCronLoading(true); setCronMessage(null);
//     const time = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
//     try {
//       await apiFetch('/cron/donationReminder');
//       const now = new Date().toISOString();
//       setCronMessage('✅ تم إرسال التذكير بنجاح');
//       setCronLog(p => { const updated = [{ type: 'success' as const, text: 'تذكير التبرعات: تم التشغيل بنجاح', time }, ...p].slice(0, 50); try { localStorage.setItem('ap-cron-log', JSON.stringify(updated)); } catch {} return updated; });
//       setLastRun(now);
//       try { localStorage.setItem('ap-cron-lastrun', now); } catch {}
//       showToast('success', 'تم إرسال التذكير بنجاح');
//     } catch (err: unknown) {
//       setCronMessage('❌ فشل إرسال التذكير');
//       setCronLog(p => { const updated = [{ type: 'error' as const, text: `تذكير التبرعات: ${err instanceof Error ? err.message : 'خطأ'}`, time }, ...p].slice(0, 50); try { localStorage.setItem('ap-cron-log', JSON.stringify(updated)); } catch {} return updated; });
//       showToast('error', 'فشل إرسال التذكير');
//     } finally { setCronLoading(false); setTimeout(() => setCronMessage(null), 4000); }
//   };

//   const scheduleAt = (targetDate: Date) => {
//     if (schedulerTimer) clearTimeout(schedulerTimer);
//     setNextRunTime(null);
//     setSchedTargetDate(null);
//     const delay = targetDate.getTime() - Date.now();
//     if (delay <= 0) { showToast('error', 'الوقت المحدد في الماضي! اختر وقتاً مستقبلياً.'); return; }
//     const label = targetDate.toLocaleString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
//     setNextRunTime(label);
//     setSchedTargetDate(targetDate);
//     try { localStorage.setItem('ap-cron-scheduled', JSON.stringify({ iso: targetDate.toISOString(), label })); } catch {}
//     const timer = setTimeout(async () => { await handleReminder(); setNextRunTime(null); setSchedTargetDate(null); setSchedulerTimer(null); try { localStorage.removeItem('ap-cron-scheduled'); } catch {} }, delay);
//     setSchedulerTimer(timer);
//     showToast('success', `✓ تمت الجدولة في ${label}`);
//   };

//   const cancelSchedule = () => {
//     if (schedulerTimer) clearTimeout(schedulerTimer);
//     setSchedulerTimer(null); setNextRunTime(null); setSchedTargetDate(null);
//     try { localStorage.removeItem('ap-cron-scheduled'); } catch {}
//     showToast('success', 'تم إلغاء الجدولة');
//   };
//   const validateProfile = (): boolean => {
//     const errs: SettingsErrors = {};
//     if (user?.roleType === 'charity') {
//       if (!profileForm.charityName.trim() || profileForm.charityName.trim().length < 3 || profileForm.charityName.trim().length > 30)
//         errs.charityName = 'اسم الجمعية يجب أن يكون بين 3 و 30 حرفاً';
//     } else {
//       if (!nameRegex.test(profileForm.userName))
//         errs.userName = 'الاسم: يبدأ بحرف عربي أو إنجليزي، 3-30 حرف، بدون رموز خاصة';
//     }
//     if (profileForm.phone && !phoneRegex.test(profileForm.phone))
//       errs.phone = 'رقم الهاتف غير صالح — مثال: 01012345678';
//     if (profileForm.address && (profileForm.address.trim().length < 5 || profileForm.address.trim().length > 100))
//       errs.address = 'العنوان يجب أن يكون بين 5 و 100 حرف';
//     setProfileErrors(errs);
//     return Object.keys(errs).length === 0;
//   };

//   const validatePassword = (): boolean => {
//     const errs: SettingsErrors = {};
//     if (!passForm.oldPassword) errs.oldPassword = 'كلمة المرور الحالية مطلوبة';
//     if (!passwordRegex.test(passForm.newPassword))
//       errs.newPassword = 'يجب أن تحتوي على: حرف كبير، حرف صغير، رقم، و8 أحرف على الأقل';
//     if (passForm.newPassword !== passForm.confirmPassword)
//       errs.confirmPassword = 'كلمتا المرور غير متطابقتين';
//     setPassErrors(errs);
//     return Object.keys(errs).length === 0;
//   };

//   const saveProfile = async () => {
//     if (!validateProfile()) return;
//     setSettingsSaving(true);
//     try {
//       await apiFetch('/users/profile', { method: 'PATCH', body: JSON.stringify({ userName: profileForm.userName, phone: profileForm.phone, address: profileForm.address }) });
//       if (user?.roleType === 'charity' && charityProfileData?._id && profileForm.charityName.trim()) {
//         await apiFetch(`/charity/${charityProfileData._id}`, { method: 'PATCH', body: JSON.stringify({ charityName: profileForm.charityName, address: profileForm.address }) });
//         setCharityProfileData(p => p ? { ...p, charityName: profileForm.charityName } : p);
//       }
//       showToast('success', 'تم تحديث البيانات بنجاح ✓');
//     } catch (err: unknown) { showToast('error', translateError(err)); }
//     finally { setSettingsSaving(false); }
//   };

//   const savePassword = async () => {
//     if (!validatePassword()) return;
//     setSettingsSaving(true);
//     try {
//       await apiFetch('/users/changePassword', { method: 'PATCH', body: JSON.stringify({ oldPassword: passForm.oldPassword, newPassword: passForm.newPassword }) });
//       setPassForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
//       setPassErrors({});
//       showToast('success', 'تم تغيير كلمة المرور بنجاح ✓');
//     } catch (err: unknown) { showToast('error', translateError(err)); }
//     finally { setSettingsSaving(false); }
//   };

//   const handleDeleteAccount = () => {
//     setConfirmOpts({
//       title: 'حذف الحساب نهائيًا',
//       message: 'هذا الإجراء لا يمكن التراجع عنه. سيتم حذف حسابك وجميع بياناتك بشكل دائم.',
//       confirmLabel: 'حذف حسابي نهائيًا',
//       variant: 'danger',
//       icon: 'ti-trash',
//       onConfirm: async () => {
//         setConfirmLoading(true);
//         try {
//           await apiFetch('/users/deleteAccount', { method: 'DELETE' });
//           logout?.();
//           setLocation('/login');
//         } catch (err: unknown) {
//           showToast('error', translateError(err));
//         } finally {
//           setConfirmLoading(false);
//           setConfirmOpts(null);
//         }
//       }
//     });
//   };

//   const handleLogout = () => {
//     setConfirmOpts({
//       title: 'تسجيل الخروج',
//       message: 'هل أنت متأكد من تسجيل الخروج؟ سيتم إنهاء جلستك الحالية.',
//       confirmLabel: 'تسجيل الخروج',
//       variant: 'danger',
//       icon: 'ti-logout',
//       onConfirm: async () => {
//         setConfirmLoading(true);
//         try {
//           logout?.();
//           setLocation('/');
//         } finally {
//           setConfirmLoading(false);
//           setConfirmOpts(null);
//         }
//       }
//     });
//   };

//   const handleRefresh = useCallback(async () => {
//     if (isRefreshing) return;
//     setIsRefreshing(true);
//     try {
//       await fetchAll();
//       await fetchNotifications();
//     } finally {
//       setTimeout(() => setIsRefreshing(false), 600);
//     }
//   }, [isRefreshing, fetchAll, fetchNotifications]);

//   // ── Derived Data (Preserved) ──
//   const rejectedCount = stats ? stats.Rejected_Donations ?? Math.max(0, stats.Total_Donations - stats.Pending_Donations - stats.Accepted_Donations) : 0;
//   const pieData = useMemo(() => {
//     return [
//       { name: 'قيد المراجعة', value: stats?.Pending_Donations || 0, color: CHART_COLORS.pending },
//       { name: 'مقبول', value: stats?.Accepted_Donations || 0, color: CHART_COLORS.accepted },
//       { name: 'مرفوض', value: rejectedCount, color: CHART_COLORS.rejected }
//     ].filter(d => d.value > 0);
//   }, [stats, rejectedCount]);
//   const stackedData = useMemo(() => {
//     const map: Record<string, { name: string; pending: number; accepted: number; rejected: number }> = {};
//     allDonations.forEach(d => {
//       const k = d.type || 'غير محدد';
//       if (!map[k]) {
//         map[k] = { name: k, pending: 0, accepted: 0, rejected: 0 };
//       }
//       const status = (d.status || '').toLowerCase();
//       if (status === 'accepted') {
//         map[k].accepted++;
//       } else if (status === 'rejected') {
//         map[k].rejected++;
//       } else {
//         map[k].pending++;
//       }
//     });
//     return Object.values(map).slice(0, 6);
//   }, [allDonations]);
//   const timelineData = useMemo(() => {
//     const months: { year: number; month: number; label: string }[] = [];
//     const now = new Date();
//     for (let i = 11; i >= 0; i--) {
//       const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
//       months.push({
//         year: d.getFullYear(),
//         month: d.getMonth(),
//         label: `${MONTHS_AR[d.getMonth()]}`,
//       });
//     }
//     return months.map(({ year, month, label }) => {
//       const count = allDonations.filter(d => {
//         if (!d.createdAt) return false;
//         const dt = new Date(d.createdAt);
//         return !isNaN(dt.getTime()) && dt.getFullYear() === year && dt.getMonth() === month;
//       }).length;
//       return { month: label, count };
//     });
//   }, [allDonations]);
//   const filteredDonations = useMemo(() => {
//     let result = allDonations.filter(d => {
//       if (statusFilter !== 'all' && d.status !== statusFilter) return false;
//       if (dateFrom && d.createdAt && new Date(d.createdAt) < new Date(dateFrom)) return false;
//       if (dateTo && d.createdAt && new Date(d.createdAt) > new Date(dateTo + 'T23:59:59')) return false;
//       const q = searchQ.trim().toLowerCase();
//       if (!q) return true;
//       const donor = parseDonor(d.donorId);
//       return d.type.toLowerCase().includes(q) || donor.name.toLowerCase().includes(q) || d._id.toLowerCase().includes(q) || (typeof d.donorId === 'string' ? d.donorId : d.donorId?._id || '').toLowerCase().includes(q);
//     });
//     result = [...result].sort((a, b) => {
//       const ta = new Date(a.createdAt || 0).getTime();
//       const tb = new Date(b.createdAt || 0).getTime();
//       return sortOrder === 'newest' ? tb - ta : ta - tb;
//     });
//     return result;
//   }, [allDonations, statusFilter, searchQ, sortOrder, dateFrom, dateTo]);
  
//   const paginatedDonations = useMemo(() => {
//     const start = (currentPage - 1) * ITEMS_PER_PAGE;
//     return filteredDonations.slice(start, start + ITEMS_PER_PAGE);
//   }, [filteredDonations, currentPage]);
  
//   const totalPages = Math.max(1, Math.ceil(filteredDonations.length / ITEMS_PER_PAGE));
//   // Reset to page 1 when filters change
//   useEffect(() => { setCurrentPage(1); }, [statusFilter, searchQ, sortOrder, dateFrom, dateTo]);

//   // ── Filtered pending requests (search on requests tab) ──
//   const filteredPendingReqs = useMemo(() => {
//     const q = searchQ.trim().toLowerCase();
//     if (!q) return pendingReqs;
//     return pendingReqs.filter(d => {
//       const donor = parseDonor(d.donorId);
//       return (
//         d.type.toLowerCase().includes(q) ||
//         donor.name.toLowerCase().includes(q) ||
//         d._id.toLowerCase().includes(q) ||
//         (typeof d.donorId === 'string' ? d.donorId : (d.donorId as any)?._id || '').toLowerCase().includes(q)
//       );
//     });
//   }, [pendingReqs, searchQ]);
  
//   const charityName = charityProfileData?.charityName || user?.userName || 'الجمعية';
//   const pendingCount = pendingReqs.length;

//   // ── Render Guards ──
//   if (selectedDonation) return (
//     <div className={`ap-layout${isDark ? '' : ' ap-light-theme'}`} dir="rtl">
//       {showReport && <ReportModal onClose={() => setShowReport(false)} />}
//       <Sidebar activeTab={tab} onTabChange={(newTab: Tab) => { setSelectedDonation(null); setTab(newTab); }} userName={charityName} pendingCount={pendingCount} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(v => { localStorage.setItem('ap-sidebar-collapsed', String(!v)); return !v; })} onLogout={handleLogout} />
//       <main className="ap-main">
//         <header className="ap-page-header">
//           <div className="ap-page-breadcrumb"><i className="ti ti-building-community" style={{color:'var(--teal)'}} /><span>لوحة التحكم</span><i className="ti ti-chevron-left" style={{fontSize:12,color:'var(--t4)'}} /><span style={{color:'var(--t3)'}} onClick={() => setSelectedDonation(null)} className="ap-breadcrumb-link">التبرعات</span><i className="ti ti-chevron-left" style={{fontSize:12,color:'var(--t4)'}} /><span style={{color:'var(--t1)',fontWeight:700}}>{selectedDonation.type}</span></div>
//           <div className="ap-page-header-right">
//             <div className="ap-header-live-badge"><span className="ap-live-dot" /><span className="ap-header-live-time">{liveTime}</span></div>
//             <button className="ap-header-icon-btn" onClick={() => setShowReport(true)} title="تقديم بلاغ" style={{ color: 'var(--red, #ef4444)' }}><i className="ti ti-alert-octagon" /></button>
//             <button className="ap-header-icon-btn" onClick={handleRefresh} title="تحديث البيانات" disabled={isRefreshing}><i className={`ti ti-refresh${isRefreshing ? ' ti-spin' : ''}`} /></button>
//             <button className="ap-header-icon-btn ap-theme-btn" onClick={() => setIsDark(v => !v)}><i className={`ti ${isDark ? 'ti-sun' : 'ti-moon'}`} /></button>
//             <button className="ap-header-icon-btn" onClick={() => setSelectedDonation(null)}><i className="ti ti-arrow-right" /></button>
//           </div>
//         </header>
//         <div className="ap-content">
//           <DonationDetail donation={selectedDonation as any} onBack={() => setSelectedDonation(null)} onAction={handleAction} actionLoading={actionLoading} />
//         </div>
//       </main>
//       <MobileNav activeTab={tab} onTabChange={(newTab: Tab) => { setSelectedDonation(null); setTab(newTab); }} pendingCount={pendingCount} />
//       {toast && <div className={`ap-toast ${toast.type}`}><i className={`ti ${toast.type==='success'?'ti-circle-check':'ti-alert-circle'}`} />{toast.text}</div>}
//       <ScrollToTop containerRef={contentRef} />
//       <ConfirmModal opts={confirmOpts} loading={confirmLoading} onClose={() => { if (!confirmLoading) setConfirmOpts(null); }} />
//     </div>
//   );

//   return (
//     <div className={`ap-layout${isDark ? '' : ' ap-light-theme'}`} dir="rtl">
//       {showReport && <ReportModal onClose={() => setShowReport(false)} />}
//       <Sidebar activeTab={tab} onTabChange={setTab} userName={charityName} pendingCount={pendingCount} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(v => { localStorage.setItem('ap-sidebar-collapsed', String(!v)); return !v; })} onLogout={handleLogout} />
//       <main className={`ap-main${tab === 'chat' ? ' ap-main--ai' : ''}`}>
//         {tab !== 'chat' && (
//         <header className="ap-page-header">
//           <div className="ap-page-header-left" style={{display:'flex',alignItems:'center',gap:12}}>
//             <div className="ap-page-breadcrumb">
//               <i className="ti ti-building-community" style={{color:'var(--teal)'}}/>
//               <span>لوحة التحكم</span>
//               <i className="ti ti-chevron-left" style={{fontSize:12,color:'var(--t4)'}}/>
//               <span style={{color:'var(--t1)',fontWeight:700}}>
//                 {tab==='stats'?'نظرة عامة':tab==='donations'?'كل التبرعات':tab==='automation'?'التشغيل التلقائي':'الإعدادات'}
//               </span>
//             </div>
//             <div className="ap-header-live-badge"><span className="ap-live-dot"/><span className="ap-header-live-time">{liveTime}</span></div>
//           </div>
//           <div className="ap-page-header-right">
//             <NotificationBell
//               notifications={notifications}
//               unreadCount={unreadCount}
//               onMarkRead={handleMarkRead}
//               onMarkAllRead={handleMarkAllRead}
//               onDelete={handleDeleteNotif}
//               loading={notifLoading}
//             />
//             <button
//               className="ap-header-icon-btn"
//               onClick={() => setShowReport(true)}
//               title="تقديم بلاغ"
//               style={{ color: 'var(--red, #ef4444)' }}
//             >
//               <i className="ti ti-alert-octagon" />
//             </button>
//             <button
//               className="ap-header-icon-btn"
//               onClick={handleRefresh}
//               title="تحديث البيانات"
//               disabled={isRefreshing}
//             >
//               <i className={`ti ti-refresh${isRefreshing ? ' ti-spin' : ''}`} />
//             </button>
//             <button className="ap-header-icon-btn ap-theme-btn" onClick={() => setIsDark(v => !v)} title={isDark?'وضع نهاري':'وضع ليلي'}><i className={`ti ${isDark?'ti-sun':'ti-moon'}`}/></button>
//             <div className="ap-header-user" onClick={() => setTab('settings')} title="الإعدادات">
//               <div className="ap-header-avatar">{charityName?.[0]?.toUpperCase()}</div>
//               <span className="ap-header-username-text">{charityName}</span>
//               <i className="ti ti-settings" style={{fontSize:13,color:'var(--t4)'}}/>
//             </div>
//           </div>
//         </header>
//         )}
//         <div ref={contentRef} className={`ap-content${tab === 'chat' ? ' ap-content--ai' : ''}`}>
//           {error && !loading && <div className="ap-error-banner"><i className="ti ti-alert-triangle" style={{color:'var(--amber)',fontSize:20}} /><div style={{flex:1}}><div style={{fontWeight:700,marginBottom:3,color:'var(--t1)'}}>حدث خطأ</div><div style={{fontSize:13,color:'var(--t3)'}}>{error}</div></div><button className="ap-retry-btn" onClick={fetchAll}><i className="ti ti-refresh" /> إعادة المحاولة</button></div>}

//           {(authLoading || loading) ? <CharityPageSkeleton /> : (<>

//           {/* ═══ STATS TAB ═══ */}
//           {tab === 'stats' && <div className="ap-tab-pane">
//             {/* KPI Grid */}
//             <div className="ap-kpi-grid">
//               {[
//                 { id: 'total', l: 'إجمالي التبرعات', v: stats?.Total_Donations || 0, i: 'ti-gift', c: '#0ec97f',
//                   details: [
//                     { label: 'معلقة', value: stats?.Pending_Donations || 0, icon: 'ti-clock-pause' },
//                     { label: 'مقبولة', value: stats?.Accepted_Donations || 0, icon: 'ti-check' },
//                     { label: 'مرفوضة', value: rejectedCount, icon: 'ti-x' },
//                     { label: 'نسبة القبول', value: stats?.Total_Donations ? `${Math.round(((stats?.Accepted_Donations || 0) / stats.Total_Donations) * 100)}%` : '—', icon: 'ti-percentage' },
//                   ]
//                 },
//                 { id: 'pending', l: 'قيد المراجعة', v: stats?.Pending_Donations || 0, i: 'ti-clock-pause', c: '#f59e0b',
//                   details: [
//                     { label: 'من الإجمالي', value: stats?.Total_Donations ? `${Math.round(((stats?.Pending_Donations || 0) / stats.Total_Donations) * 100)}%` : '—', icon: 'ti-percentage' },
//                     { label: 'تحتاج مراجعة', value: stats?.Pending_Donations || 0, icon: 'ti-alert-circle' },
//                   ]
//                 },
//                 { id: 'accepted', l: 'مقبولة', v: stats?.Accepted_Donations || 0, i: 'ti-shield-check', c: '#0ec97f',
//                   details: [
//                     { label: 'نسبة من الإجمالي', value: stats?.Total_Donations ? `${Math.round(((stats?.Accepted_Donations || 0) / stats.Total_Donations) * 100)}%` : '—', icon: 'ti-percentage' },
//                     { label: 'تم القبول', value: stats?.Accepted_Donations || 0, icon: 'ti-circle-check' },
//                   ]
//                 },
//                 { id: 'rejected', l: 'مرفوضة', v: rejectedCount, i: 'ti-shield-x', c: '#f04370',
//                   details: [
//                     { label: 'نسبة من الإجمالي', value: stats?.Total_Donations ? `${Math.round((rejectedCount / stats.Total_Donations) * 100)}%` : '—', icon: 'ti-percentage' },
//                     { label: 'تم الرفض', value: rejectedCount, icon: 'ti-circle-x' },
//                   ]
//                 },
//               ].map(s => (
//                 <div key={s.id} className="ap-kpi-card" style={{ '--kpi-color': s.c } as React.CSSProperties}>
//                   <div className="ap-kpi-icon-wrap"><i className={`ti ${s.i}`}/></div>
//                   <div className="ap-kpi-value">{s.v.toLocaleString('en-US')}</div>
//                   <div className="ap-kpi-label">{s.l}</div>
//                   <button
//                     className={`ap-kpi-more-btn${expandedKpi === s.id ? ' expanded' : ''}`}
//                     onClick={() => setExpandedKpi(expandedKpi === s.id ? null : s.id)}
//                   >
//                     <i className="ti ti-chevron-down" />
//                     {expandedKpi === s.id ? 'إخفاء' : 'عرض المزيد'}
//                   </button>
//                   <div className={`ap-kpi-expand${expandedKpi === s.id ? ' open' : ''}`}>
//                     <div className="ap-kpi-expand-inner">
//                       {s.details.map(d => (
//                         <div key={d.label} className="ap-kpi-expand-row">
//                           <span className="ap-kpi-expand-row-label"><i className={`ti ${d.icon}`} />{d.label}</span>
//                           <span className="ap-kpi-expand-row-val">{d.value}</span>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Unified Dashboard Grid for natural card flow (no gaps!) */}
//             <div className="ap-dashboard-grid">
//               {/* Right Column (1fr) */}
//               <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
//                 {/* Pro area chart - التبرعات عبر الزمن */}
//                 <div className="ap-pro-chart-card">
//                   <div className="ap-pro-chart-header">
//                     <div className="ap-pro-chart-meta">
//                       <div className="ap-pro-chart-value">{(stats?.Total_Donations || 0).toLocaleString('en-US')}</div>
//                       <div className="ap-pro-chart-label"><i className="ti ti-trending-up" style={{color:'#0ec97f',marginLeft:4}}/>التبرعات الشهرية</div>
//                     </div>
//                     <div style={{display:'flex',alignItems:'center',gap:8}}>
//                       <span className={`ap-chart-trend ${(() => {
//                         const cur = timelineData[11]?.count ?? 0;
//                         const prev = timelineData[10]?.count ?? 0;
//                         return cur >= prev ? 'up' : 'down';
//                       })()}`}>
//                         <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
//                           <path d="M1 11 L5 4 L8 7 L12 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                         </svg>
//                         هذا الشهر
//                       </span>
//                       <div className="ap-pro-chart-period"><i className="ti ti-calendar" style={{fontSize:11}}/>{new Date().getFullYear()}</div>
//                     </div>
//                   </div>
//                   <div className="ap-chart-stats-row">
//                     <div className="ap-chart-stat-mini"><div className="ap-chart-stat-mini-val" style={{color:'#0ec97f'}}>{(stats?.Pending_Donations||0).toLocaleString('en-US')}</div><div className="ap-chart-stat-mini-lbl">معلقة</div></div>
//                     <div className="ap-chart-stat-mini"><div className="ap-chart-stat-mini-val" style={{color:'#0ec97f'}}>{(stats?.Accepted_Donations||0).toLocaleString('en-US')}</div><div className="ap-chart-stat-mini-lbl">مقبولة</div></div>
//                     <div className="ap-chart-stat-mini"><div className="ap-chart-stat-mini-val" style={{color:'#f04370'}}>{rejectedCount.toLocaleString('en-US')}</div><div className="ap-chart-stat-mini-lbl">مرفوضة</div></div>
//                   </div>
//                   <div className="ap-pro-chart-legend">
//                     <div className="ap-pro-legend-item"><div className="ap-pro-legend-line" style={{background:'#0ec97f'}}><div className="ap-pro-legend-dot" style={{background:'#0ec97f'}}/></div>التبرعات الشهرية</div>
//                   </div>
//                   <ResponsiveContainer width="100%" height={200}>
//                     <AreaChart data={timelineData} margin={{top:4,right:4,left:-24,bottom:0}}>
//                       <defs>
//                         <linearGradient id="gradDon" x1="0" y1="0" x2="0" y2="1">
//                           <stop offset="0%"   stopColor="#0ec97f" stopOpacity={0.35}/>
//                           <stop offset="60%"  stopColor="#0ec97f" stopOpacity={0.10}/>
//                           <stop offset="100%" stopColor="#0ec97f" stopOpacity={0.02}/>
//                         </linearGradient>
//                       </defs>
//                       <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
//                       <XAxis dataKey="month" tick={{fill:'var(--t3)',fontSize:10}} axisLine={false} tickLine={false}/>
//                       <YAxis tick={{fill:'var(--t3)',fontSize:10}} axisLine={false} tickLine={false} allowDecimals={false}/>
//                       <Tooltip
//                         content={<OverviewTooltip />}
//                         cursor={{stroke:'rgba(14,201,127,0.55)',strokeWidth:1.5,strokeDasharray:'4 3'}}
//                       />
//                       <Area type="monotone" dataKey="count" name="التبرعات" stroke="#0ec97f" strokeWidth={2.5} fill="url(#gradDon)" dot={{fill:'#0ec97f',strokeWidth:0,r:3}} activeDot={{r:5,fill:'#0ec97f',stroke:'var(--surface)',strokeWidth:2}}/>
//                     </AreaChart>
//                   </ResponsiveContainer>
//                 </div>

//                 {/* Stacked bar chart - أنواع التبرعات */}
//                 <div className="ap-chart-card">
//                   <div className="ap-chart-header">
//                     <span className="ap-chart-title"><i className="ti ti-chart-bar" style={{color:'#3b82f6'}}/>أنواع التبرعات</span>
//                   </div>
//                   {stackedData.length > 0
//                     ? <ResponsiveContainer width="100%" height={260}>
//                         <BarChart data={stackedData} margin={{top:8,right:8,left:-24,bottom:0}} barCategoryGap="30%">
//                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)"/>
//                           <XAxis dataKey="name" tick={{fill:'var(--t2)',fontSize:11,fontFamily:'Tajawal'}} axisLine={false} tickLine={false}/>
//                           <YAxis tick={{fill:'var(--t3)',fontSize:10}} axisLine={false} tickLine={false} allowDecimals={false}/>
//                           <Tooltip
//                             content={<DonationTypesTooltip />}
//                             cursor={{fill:'rgba(255,255,255,0.04)'}}
//                           />
//                           <Legend wrapperStyle={{fontSize:11,fontFamily:'Tajawal',paddingTop:8}} formatter={(v) => <span style={{color:'var(--t2)'}}>{v}</span>}/>
//                           <Bar dataKey="pending"  name="معلق"  fill="#f59e0b" radius={[4,4,0,0]} maxBarSize={32}/>
//                           <Bar dataKey="accepted" name="مقبول" fill="#0ec97f" radius={[4,4,0,0]} maxBarSize={32}/>
//                           <Bar dataKey="rejected" name="مرفوض" fill="#f04370" radius={[4,4,0,0]} maxBarSize={32}/>
//                         </BarChart>
//                       </ResponsiveContainer>
//                     : <div className="ap-empty-state"><div className="ap-empty-icon"><i className="ti ti-inbox"/></div><div className="ap-empty-title">لا توجد بيانات</div></div>
//                   }
//                 </div>
//               </div>

//               {/* Left Column (300px) */}
//               <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
//                 {/* Pie chart - توزيع الحالات */}
//                 <div className="ap-chart-card">
//                   <div className="ap-chart-header">
//                     <span className="ap-chart-title"><i className="ti ti-chart-pie" style={{color:'#0ec97f'}} />توزيع الحالات</span>
//                   </div>
//                   {pieData.length > 0 ? (
//                     <>
//                       <ResponsiveContainer width="100%" height={200}>
//                         <PieChart>
//                           <Pie data={pieData} cx="50%" cy="50%" innerRadius={52} outerRadius={80} dataKey="value" paddingAngle={3}>
//                             {pieData.map((e, i) => <Cell key={i} fill={e.color} strokeWidth={0}/>)}
//                           </Pie>
//                           <Tooltip
//                             content={<StatusDistributionTooltip />}
//                           />
//                         </PieChart>
//                       </ResponsiveContainer>
//                       <div style={{display:'flex',gap:12,flexWrap:'wrap',justifyContent:'center',marginTop:4}}>
//                         {pieData.map(d => (
//                           <div key={d.name} style={{display:'flex',alignItems:'center',gap:5,fontSize:11.5,color:'var(--t2)',fontWeight:600}}>
//                             <span style={{width:8,height:8,borderRadius:'50%',background:d.color,display:'inline-block'}}/>
//                             {d.name} <span style={{color:'var(--t4)',fontWeight:400}}>({d.value})</span>
//                           </div>
//                         ))}
//                       </div>
//                     </>
//                   ) : <div className="ap-empty-state"><div className="ap-empty-icon"><i className="ti ti-inbox"/></div><div className="ap-empty-title">لا توجد بيانات</div></div>}
//                 </div>

//                 {/* Latest donations list */}
//                 {allDonations.length > 0 && (
//                   <div className="ap-chart-card">
//                     <div className="ap-chart-header">
//                       <span className="ap-chart-title"><i className="ti ti-clock-record" style={{color:'#0ec97f'}}/>آخر التبرعات</span>
//                       <button className="ap-card-eye-btn" style={{fontSize:12}} onClick={() => setTab('donations')}><i className="ti ti-eye"/>عرض الكل</button>
//                     </div>
//                     <div style={{display:'flex',flexDirection:'column',gap:0,overflow:'hidden',borderRadius:'var(--radius-sm)',border:'1px solid var(--border)'}}>
//                       {[...allDonations].sort((a,b) => new Date(b.createdAt||0).getTime()-new Date(a.createdAt||0).getTime()).slice(0,5).map((d,i) => {
//                         const sc = STATUS_CFG[d.status]; const donor = parseDonor(d.donorId);
//                         return (
//                           <div key={d._id} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 12px',borderBottom:i<4?'1px solid var(--border)':'none',background:i%2===0?'var(--surface2)':'transparent',cursor:'pointer'}} onClick={() => setSelectedDonation(d)}>
//                             <div style={{width:28,height:28,borderRadius:7,background:sc.bg,color:sc.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,flexShrink:0}}>
//                               <i className="ti ti-package"/>
//                             </div>
//                             <div style={{flex:1,minWidth:0}}>
//                               <div style={{fontSize:12,fontWeight:700,color:'var(--t1)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.type}</div>
//                               <div style={{fontSize:10.5,color:'var(--t4)',marginTop:1}}>{donor.name}</div>
//                             </div>
//                             <span style={{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:20,background:sc.bg,color:sc.color,flexShrink:0}}>{sc.label}</span>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>}

//           {/* ═══ DONATIONS & REQUESTS TABS ═══ */}
//           {tab === 'donations' && <div className="ap-tab-pane">
//             <div className="ap-section-header">
//               <div style={{display:'flex',alignItems:'center',gap:12}}>
//                 <div className="ap-section-title">
//                   <i className="ti ti-clipboard-list" style={{color:'var(--teal)'}}/>
//                   كل التبرعات
//                   <span className="ap-count-badge" style={{background:'var(--teal)'}}>{filteredDonations.length}</span>
//                 </div>
//                 <div className="ap-view-switcher">
//                   <button className={`ap-view-btn${donView==='table'?' active':''}`} onClick={() => setDonView('table')} title="جدول"><i className="ti ti-list"/></button>
//                   <button className={`ap-view-btn${donView==='cards'?' active':''}`} onClick={() => setDonView('cards')} title="كروت"><i className="ti ti-layout-grid"/></button>
//                 </div>
//               </div>
//               <div className="ap-filters-bar">
//                 <div className="ap-filters-group">
//                   <div className="ap-search-wrap">
//                     <i className="ti ti-search ap-search-icon"/>
//                     <input className="ap-search-input" placeholder="بحث بالمعرف، الاسم أو النوع..." value={searchQ} onChange={e => setSearchQ(e.target.value)}/>
//                     {searchQ && <button className="ap-search-clear" onClick={() => setSearchQ('')}><i className="ti ti-x"/></button>}
//                   </div>
//                   <div className="ap-filter-tabs">
//                     {(['all','pending','accepted','rejected'] as const).map(s => {
//                       const count = s === 'all'
//                         ? allDonations.length
//                         : allDonations.filter(d => d.status === s).length;
//                       const labelMap = { all: 'الكل', pending: 'قيد المراجعة', accepted: 'مقبول', rejected: 'مرفوض' };
//                       return (
//                         <button
//                           key={s}
//                           className={`ap-filter-tab ap-filter-tab--${s}${statusFilter===s?' active':''}`}
//                           onClick={() => setStatusFilter(s)}
//                         >
//                           {labelMap[s]}
//                           {count > 0 && (
//                             <span className="ap-filter-badge">{count}</span>
//                           )}
//                         </button>
//                       );
//                     })}
//                   </div>
//                 </div>

//                 <div className="ap-filters-group">
//                   {/* Date Range */}
//                   <div className="ap-date-range-wrap">
//                     <div className="ap-date-field">
//                       <span className="ap-date-label">من</span>
//                       <input
//                         type="date"
//                         value={dateFrom}
//                         onChange={e => setDateFrom(e.target.value)}
//                       />
//                     </div>
//                     <div className="ap-date-field">
//                       <span className="ap-date-label">إلى</span>
//                       <input
//                         type="date"
//                         value={dateTo}
//                         min={dateFrom || undefined}
//                         onChange={e => setDateTo(e.target.value)}
//                       />
//                     </div>
//                     {(dateFrom || dateTo) && (
//                       <button
//                         className="ap-date-range-clear"
//                         onClick={() => { setDateFrom(''); setDateTo(''); }}
//                         title="مسح التاريخ"
//                       ><i className="ti ti-x"/></button>
//                     )}
//                   </div>

//                   {/* Sort */}
//                   <div className="ap-filter-tabs">
//                     <button
//                       type="button"
//                       className={`ap-filter-tab ap-filter-tab--sort${sortOrder === 'newest' ? ' active' : ''}`}
//                       onClick={() => setSortOrder('newest')}
//                     >
//                       <i className="ti ti-sort-descending" />
//                       الأحدث
//                     </button>
//                     <button
//                       type="button"
//                       className={`ap-filter-tab ap-filter-tab--sort${sortOrder === 'oldest' ? ' active' : ''}`}
//                       onClick={() => setSortOrder('oldest')}
//                     >
//                       <i className="ti ti-sort-ascending" />
//                       الأقدم
//                     </button>
//                   </div>

//                   {/* Reset & Refresh */}
//                   <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//                     {(searchQ || statusFilter !== 'all' || dateFrom || dateTo || sortOrder !== 'newest') && (
//                       <button
//                         className="ap-filter-reset-btn"
//                         onClick={() => {
//                           setSearchQ('');
//                           setStatusFilter('all');
//                           setDateFrom('');
//                           setDateTo('');
//                           setSortOrder('newest');
//                         }}
//                         title="إعادة تعيين الفلاتر"
//                       >
//                         <i className="ti ti-rotate-clockwise" />
//                         مسح التصفية
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {filteredDonations.length === 0
//               ? <div className="ap-empty-state"><div className="ap-empty-icon"><i className="ti ti-inbox"/></div><div className="ap-empty-title">لا توجد بيانات مطابقة</div><div className="ap-empty-desc">جرّب تغيير الفلتر أو البحث</div></div>
//               : donView === 'cards'
//                 ? <div className="ap-card-grid">
//                     {paginatedDonations.map(d => {
//                       const sc = STATUS_CFG[d.status]; const donor = parseDonor(d.donorId); const img = d.imageUrl?.[0]?.secure_url; const busy = actionLoading === `${d._id}-accepted` || actionLoading === `${d._id}-rejected`;
//                       return (
//                         <div key={d._id} className="ap-entity-card cd-donation-card" onClick={() => setSelectedDonation(d)} style={{cursor:'pointer'}}>
//                           {/* Card Header: image + type + status */}
//                           <div className="ap-entity-card-header">
//                             {img
//                               ? <img src={img} style={{width:44,height:44,borderRadius:10,objectFit:'cover',flexShrink:0,border:'1px solid var(--border)'}} alt=""/>
//                               : <div className="ap-entity-avatar charity" style={{width:44,height:44,flexShrink:0}}><i className="ti ti-gift"/></div>
//                             }
//                             <div style={{flex:1,minWidth:0}}>
//                               <div className="ap-entity-name">{d.type}</div>
//                               <div className="ap-entity-email">{donor.name !== '—' ? donor.name : <span style={{color:'var(--t4)',fontStyle:'italic'}}>غير معروف</span>}</div>
//                             </div>
//                             <span className="ap-badge" style={{background:sc.bg,color:sc.color,flexShrink:0}}><span className="ap-badge-dot" style={{background:sc.dot}}/>{sc.label}</span>
//                           </div>

//                           {/* Middle section grows to fill card */}
//                           <div style={{flex:1,display:'flex',flexDirection:'column',gap:0}}>
//                             {/* Details row */}
//                             {(d.quantity != null || d.size || d.condition) && (
//                               <div style={{display:'flex',gap:10,flexWrap:'wrap',margin:'8px 0 4px',fontSize:11.5,color:'var(--t3)'}}>
//                                 {d.quantity != null && (
//                                   <span style={{display:'flex',alignItems:'center',gap:4}}>
//                                     <i className="ti ti-package" style={{color:'var(--teal)',fontSize:12}}/>{d.quantity} قطعة
//                                   </span>
//                                 )}
//                                 {d.size && (
//                                   <span style={{display:'flex',alignItems:'center',gap:4}}>
//                                     <i className="ti ti-ruler" style={{color:'var(--teal)',fontSize:12}}/>{d.size}
//                                   </span>
//                                 )}
//                                 {d.condition && (
//                                   <span style={{display:'flex',alignItems:'center',gap:4}}>
//                                     <i className="ti ti-star" style={{color:'#f59e0b',fontSize:12}}/>{d.condition}
//                                   </span>
//                                 )}
//                               </div>
//                             )}

//                             {/* Address */}
//                             {(donor.address !== '—' || (d as any).address) && (
//                               <div style={{display:'flex',alignItems:'center',gap:5,fontSize:11.5,color:'var(--t3)',marginBottom:4}}>
//                                 <i className="ti ti-map-pin" style={{color:'#3b82f6',fontSize:12,flexShrink:0}}/>
//                                 <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
//                                   {donor.address !== '—' ? donor.address : (d as any).address}
//                                 </span>
//                               </div>
//                             )}

//                             {/* Phone */}
//                             {donor.phone !== '—' && (
//                               <div style={{display:'flex',alignItems:'center',gap:5,fontSize:11.5,color:'var(--t3)',marginBottom:4}}>
//                                 <i className="ti ti-phone" style={{color:'var(--teal)',fontSize:12,flexShrink:0}}/>
//                                 <span>{donor.phone}</span>
//                               </div>
//                             )}
//                           </div>

//                           {/* Date + Actions always at bottom */}
//                           <div className="ap-entity-date" style={{marginTop:'auto',marginBottom:10}}>
//                             <i className="ti ti-calendar"/>{fmt12(d.createdAt)}
//                           </div>

//                           {/* Actions */}
//                           <div className="ap-entity-actions" onClick={e => e.stopPropagation()}>
//                             {d.status === 'pending' && <>
//                               <button className="ap-action-btn approve" disabled={busy} onClick={() => handleAction(d._id,'accepted')}>
//                                 {actionLoading===`${d._id}-accepted`?<i className="ti ti-loader-2 ti-spin"/>:<><i className="ti ti-check"/>قبول</>}
//                               </button>
//                               <button className="ap-action-btn reject" disabled={busy} onClick={() => handleAction(d._id,'rejected')}>
//                                 {actionLoading===`${d._id}-rejected`?<i className="ti ti-loader-2 ti-spin"/>:<><i className="ti ti-x"/>رفض</>}
//                               </button>
//                             </>}
//                             <button className="ap-card-eye-btn" onClick={() => setSelectedDonation(d)}><i className="ti ti-eye"/>تفاصيل</button>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 : <div className="ap-table-wrap">
//                     <table className="ap-table">
//                       <thead><tr><th>النوع</th><th>المتبرع</th><th>الكمية / المقاس</th><th>العنوان</th><th>الحالة</th><th>التاريخ</th><th>إجراء</th></tr></thead>
//                       <tbody>
//                         {paginatedDonations.map(d => {
//                           const sc = STATUS_CFG[d.status]; const donor = parseDonor(d.donorId); const busy = actionLoading === `${d._id}-accepted` || actionLoading === `${d._id}-rejected`;
//                           const donorAddress = donor.address !== '—' ? donor.address : (d as any).address || '—';
//                           return (
//                             <tr key={d._id} onClick={() => setSelectedDonation(d)} className="ap-table-row-clickable">
//                               <td style={{fontWeight:600,color:'var(--t1)'}}>{d.type}</td>
//                               <td><div style={{display:'flex',alignItems:'center',gap:8}}><div className="ap-table-avatar">{donor.initial}</div><div><div style={{fontWeight:600,color:'var(--t1)',fontSize:13}}>{donor.name}</div>{donor.phone !== '—' && <div style={{fontSize:11,color:'var(--t4)'}}>{donor.phone}</div>}</div></div></td>
//                               <td style={{color:'var(--t2)',fontSize:12}}>{d.quantity ? `${d.quantity} قطعة` : '—'}{d.size ? <span style={{marginRight:6,color:'var(--t4)'}}>{d.size}</span> : ''}</td>
//                               <td style={{color:'var(--t3)',fontSize:12,maxWidth:140}}><div style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{donorAddress}</div></td>
//                               <td><span className="ap-badge" style={{background:sc.bg,color:sc.color}}><span className="ap-badge-dot" style={{background:sc.dot}}/>{sc.label}</span></td>
//                               <td style={{color:'var(--t3)',fontSize:12}}>{fmt12(d.createdAt)}</td>
//                               <td onClick={e => e.stopPropagation()}>
//                                 <div style={{display:'flex',gap:6}}>
//                                   {d.status === 'pending' && <>
//                                     <button className="ap-action-btn approve" disabled={busy} onClick={() => handleAction(d._id,'accepted')}>{actionLoading===`${d._id}-accepted`?<i className="ti ti-loader-2 ti-spin"/>:<i className="ti ti-check"/>}</button>
//                                     <button className="ap-action-btn reject"  disabled={busy} onClick={() => handleAction(d._id,'rejected')}>{actionLoading===`${d._id}-rejected`?<i className="ti ti-loader-2 ti-spin"/>:<i className="ti ti-x"/>}</button>
//                                   </>}
//                                   <button className="ap-eye-btn" onClick={() => setSelectedDonation(d)}><i className="ti ti-eye"/></button>
//                                 </div>
//                               </td>
//                             </tr>
//                           );
//                         })}
//                       </tbody>
//                     </table>
//                   </div>
//             }

//             {/* Pagination */}
//             {tab === 'donations' && totalPages > 1 && (
//               <div className="ap-pagination-container" style={{ direction: "ltr" }}>
//                 <span className="ap-pagination-info">
//                   {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredDonations.length)} من {filteredDonations.length}
//                 </span>
//                 <div className="ap-pagination-buttons">
//                   <button
//                     className="ap-pagination-btn"
//                     onClick={() => setCurrentPage(1)}
//                     disabled={currentPage === 1}
//                     title="الصفحة الأولى"
//                   >
//                     »
//                   </button>
//                   <button
//                     className="ap-pagination-btn prev-next"
//                     onClick={() => setCurrentPage(p => p - 1)}
//                     disabled={currentPage === 1}
//                   >
//                     &lt; السابق
//                   </button>
//                   {Array.from({length:Math.min(5,totalPages)},(_,i) => {
//                     let page: number;
//                     if (totalPages <= 5) page = i + 1;
//                     else if (currentPage <= 3) page = i + 1;
//                     else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
//                     else page = currentPage - 2 + i;
//                     return (
//                       <button key={page} onClick={() => setCurrentPage(page)}
//                         className={`ap-pagination-btn page-num ${currentPage === page ? 'active' : ''}`}>
//                         {page}
//                       </button>
//                     );
//                   })}
//                   <button
//                     className="ap-pagination-btn prev-next"
//                     onClick={() => setCurrentPage(p => p + 1)}
//                     disabled={currentPage === totalPages}
//                   >
//                     التالي &gt;
//                   </button>
//                   <button
//                     className="ap-pagination-btn"
//                     onClick={() => setCurrentPage(totalPages)}
//                     disabled={currentPage === totalPages}
//                     title="الصفحة الأخيرة"
//                   >
//                     «
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>}

//           {/* ═══ AUTOMATION TAB ═══ */}
//           {tab === 'automation' && <div className="ap-tab-pane" style={{overflowY:'auto',overflowX:'hidden'}}>
//             {/* Banner */}
//             {/* Timeline Header with Live Clock */}
//             <div className="ap-auto-timeline-header">
//               <div className="ap-auto-clock"><i className="ti ti-clock-hour-4" /></div>
//               <div className="ap-auto-timeline-info">
//                 <h3>التشغيل التلقائي</h3>
//                 <p>يمكنك تشغيل المهام يدويًا أو جدولتها في تاريخ وساعة محددة.</p>
//               </div>
//               <div className="ap-auto-live-clock-wrap">
//                 <LiveAutoClock />
//               </div>
//             </div>

//             {/* Cron Grid — Single Centered Card */}
//             <div className="ap-cron-grid" style={{display:'grid',gridTemplateColumns:'1fr',maxWidth:520,margin:'0 auto'}}>

//               {/* Card 1: تذكير التبرعات */}
//               <div className={`ap-cron-card${nextRunTime ? ' ap-cron-active' : ''}`} style={{width:'100%',boxSizing:'border-box'}}>
//                 <div className="ap-cron-icon" style={{background:'rgba(14,201,127,0.14)'}}>
//                   <i className="ti ti-bell-ringing" style={{color:'#0ec97f'}}/>
//                 </div>
//                 <div className="ap-cron-title">تذكير التبرعات</div>
//                 <p className="ap-cron-desc">يرسل تذكيرات للجمعية بالتبرعات المعلقة التي لم يتم تأكيدها.</p>
//                 <code className="ap-cron-code" style={{background:'rgba(14,201,127,0.08)',borderColor:'rgba(14,201,127,0.24)',color:'#0ec97f'}}>
//                   GET /cron/donationReminder
//                 </code>
//                 <span className={`ap-auto-status-badge ${nextRunTime ? 'active' : 'inactive'}`}>
//                   {nextRunTime ? 'مجدول' : 'غير نشط'}
//                 </span>
//                 {cronMessage && <div style={{fontSize:13,padding:'7px 12px',borderRadius:8,background: cronMessage.includes('✅') ? 'rgba(14,201,127,0.1)' : 'rgba(240,72,112,0.1)',color: cronMessage.includes('✅') ? '#0ec97f' : '#f04370',marginBottom:8}}>{cronMessage}</div>}
//                 <div className="ap-sched-picker">
//                   <div className="ap-sched-picker-label">
//                     <i className="ti ti-calendar-clock" style={{color:'#0ec97f'}}/> جدولة في تاريخ وساعة محددة
//                   </div>
//                   <div className="ap-sched-inputs">
//                     <div className="ap-sched-field">
//                       <label>التاريخ</label>
//                       <input type="date" className="ap-sched-input" value={schedInput.date} min={todayStr}
//                         onChange={e => setSchedInput(p => ({...p, date: e.target.value}))}/>
//                     </div>
//                     <div className="ap-sched-field">
//                       <label>الساعة</label>
//                       <input type="time" className="ap-sched-input" value={schedInput.time}
//                         onChange={e => setSchedInput(p => ({...p, time: e.target.value}))}/>
//                     </div>
//                     <div className="ap-sched-field ap-sched-field-sm">
//                       <label>الثواني</label>
//                       <input type="number" className="ap-sched-input" value={schedInput.seconds} min="0" max="59" placeholder="00"
//                         onChange={e => { const v = Math.max(0, Math.min(59, Number(e.target.value))); setSchedInput(p => ({...p, seconds: String(v).padStart(2,'0')})); }}/>
//                     </div>
//                   </div>
//                   {nextRunTime ? (
//                     <div className="ap-sched-status">
//                       <div className="ap-sched-next" style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
//                         <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//                           <i className="ti ti-clock-play" style={{color:'#0ec97f'}}/>
//                           <span>موعد التشغيل: <strong style={{color:'#0ec97f'}}>{nextRunTime}</strong></span>
//                         </div>
//                         <Countdown targetTs={schedTargetDate ? schedTargetDate.getTime() : null} color="#0ec97f" />
//                       </div>
//                       <button className="ap-sched-cancel-btn" onClick={cancelSchedule}>
//                         <i className="ti ti-x"/> إلغاء الجدولة
//                       </button>
//                     </div>
//                   ) : (
//                     <button className="ap-sched-confirm-btn" style={{borderColor:'#0ec97f',color:'#0ec97f'}}
//                       onClick={() => {
//                         if (!schedInput.date || !schedInput.time) { showToast('error','يرجى تحديد التاريخ والوقت'); return; }
//                         const [h,m] = schedInput.time.split(':').map(Number);
//                         const d = new Date(schedInput.date);
//                         d.setHours(h, m, Number(schedInput.seconds), 0);
//                         scheduleAt(d);
//                       }}>
//                       <i className="ti ti-calendar-plus"/> تأكيد الجدولة
//                     </button>
//                   )}
//                 </div>
//                 <button className="ap-cron-run-btn" style={{background:'#0ec97f',color:'#fff'}} disabled={cronLoading} onClick={handleReminder}>
//                   {cronLoading ? <><i className="ti ti-loader-2 ti-spin"/>جاري التشغيل...</> : <><i className="ti ti-player-play"/>تشغيل الآن</>}
//                 </button>
//               </div>
//             </div>

//             {/* Stats Row */}
//             <div className="ap-cron-stats-row">
//               {[
//                 { icon:'ti-history',        color:'#0ec97f', value: cronLog.length,                        label:'عدد مرات التشغيل' },
//                 { icon:'ti-clock',          color:'#f59e0b', value: lastRun ? new Date(lastRun).toLocaleString('ar-EG',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',hour12:true}) : '—', label:'آخر تشغيل' },
//                 { icon:'ti-calendar-event', color:'#3b82f6', value: nextRunTime ? 'مجدول' : 'لا يوجد', label:'جدولة نشطة' },
//               ].map((s,i) => (
//                 <div key={i} className="ap-cron-stat">
//                   <i className={`ti ${s.icon}`} style={{color:s.color,fontSize:22}}/>
//                   <div>
//                     <div style={{fontSize:18,fontWeight:800,color:'var(--t1)'}}>{s.value}</div>
//                     <div style={{fontSize:12,color:'var(--t3)',marginTop:2}}>{s.label}</div>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Log */}
//             <div className="ap-cron-log">
//               <div className="ap-cron-log-header">
//                 <div className="ap-section-title" style={{margin:0}}>
//                   <i className="ti ti-list-details" style={{color:'#0ec97f'}}/>
//                   سجل التنفيذ
//                   <span className="ap-count-badge" style={{background:'#0ec97f'}}>{cronLog.length}</span>
//                 </div>
//                 {cronLog.length > 0 && (
//                   <button className="ap-cron-log-clear" onClick={() => { setCronLog([]); try { localStorage.removeItem('ap-cron-log'); } catch {} }}>
//                     <i className="ti ti-trash"/> مسح الكل
//                   </button>
//                 )}
//               </div>
//               <div className="ap-cron-log-list">
//                 {cronLog.length === 0 ? (
//                   <div style={{textAlign:'center',padding:'28px 16px',color:'var(--t4)',fontSize:13,display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
//                     <i className="ti ti-list-details" style={{fontSize:28,opacity:0.35}}/>
//                     <span>لا توجد سجلات بعد — شغّل أو جدوِل مهمة أولاً</span>
//                   </div>
//                 ) : (
//                   cronLog.map((log, i) => (
//                     <div key={i} className={`ap-cron-log-item ${log.type}`} style={{display:'flex',alignItems:'center',gap:8,justifyContent:'space-between'}}>
//                       <span style={{flex:1,fontSize:13}}>{log.type==='success'?'✓':'✗'} {log.text}</span>
//                       <span style={{fontSize:11,color:'var(--t4)',flexShrink:0,whiteSpace:'nowrap'}}>{log.time}</span>
//                       <button
//                         title="حذف"
//                         onClick={() => {
//                           const updated = cronLog.filter((_, idx) => idx !== i);
//                           setCronLog(updated);
//                           try { localStorage.setItem('ap-cron-log', JSON.stringify(updated)); } catch {}
//                         }}
//                         style={{flexShrink:0,width:24,height:24,borderRadius:6,border:'1px solid var(--border)',background:'transparent',color:'var(--t4)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,transition:'all 0.15s'}}
//                         onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background='rgba(239,68,68,0.1)';(e.currentTarget as HTMLButtonElement).style.color='#ef4444';(e.currentTarget as HTMLButtonElement).style.borderColor='rgba(239,68,68,0.3)';}}
//                         onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background='transparent';(e.currentTarget as HTMLButtonElement).style.color='var(--t4)';(e.currentTarget as HTMLButtonElement).style.borderColor='var(--border)';}}
//                       >
//                         <i className="ti ti-x"/>
//                       </button>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </div>
//           </div>}

//           {/* ═══ SETTINGS TAB ═══ */}
//           {tab === 'settings' && <div className="ap-tab-pane">
//             <div className="ap-section-header" style={{marginBottom:20}}>
//               <div className="ap-section-title"><i className="ti ti-settings" style={{color:'var(--teal)'}}/>الإعدادات</div>
//             </div>

//             {/* ── Settings Layout: Sidebar (desktop) / Tabs (mobile) ── */}

//             {/* Mobile: horizontal scrollable tabs */}
//             <div className="cd-settings-mobile-tabs">
//               {([
//                 { id:'profile',  icon:'ti-building-community', label: user?.roleType==='charity'?'الجمعية':'الملف', color:'#0ec97f' },
//                 { id:'password', icon:'ti-shield-lock',         label:'كلمة المرور', color:'#f04370' },
//                 { id:'license',  icon:'ti-shield-check',        label:'التوثيق',     color:'#3b82f6' },
//                 { id:'danger',   icon:'ti-alert-triangle',      label:'الخطر',       color:'#ef4444' },
//               ] as const).map(item => (
//                 <button
//                   key={item.id}
//                   onClick={() => setSettingsTab(item.id)}
//                   className={`cd-settings-mobile-tab${settingsTab===item.id?' active':''}`}
//                   style={{
//                     borderBottom: settingsTab===item.id ? `2px solid ${item.color}` : '2px solid transparent',
//                     color: settingsTab===item.id ? item.color : 'var(--t3)',
//                   } as React.CSSProperties}
//                 >
//                   <i className={`ti ${item.icon}`}/>
//                   <span>{item.label}</span>
//                 </button>
//               ))}
//             </div>

//             <div style={{display:'flex',gap:20,alignItems:'flex-start'}}>

//               {/* Desktop: Sidebar Nav */}
//               <div className="cd-settings-sidebar">
//                 {([
//                   { id:'profile',  icon:'ti-building-community', label: user?.roleType==='charity'?'بيانات الجمعية':'الملف الشخصي', color:'#0ec97f' },
//                   { id:'password', icon:'ti-shield-lock',         label:'كلمة المرور',      color:'#f04370' },
//                   { id:'license',  icon:'ti-shield-check',        label:'الترخيص والتوثيق', color:'#3b82f6' },
//                   { id:'danger',   icon:'ti-alert-triangle',      label:'منطقة الخطر',      color:'#ef4444' },
//                 ] as const).map(item => (
//                   <button
//                     key={item.id}
//                     onClick={() => setSettingsTab(item.id)}
//                     style={{
//                       width:'100%',display:'flex',alignItems:'center',gap:9,padding:'10px 12px',
//                       borderRadius:8,border:'none',cursor:'pointer',textAlign:'right' as const,
//                       background: settingsTab===item.id ? `${item.color}14` : 'transparent',
//                       color: settingsTab===item.id ? item.color : 'var(--t2)',
//                       fontFamily:'Tajawal',fontSize:13,fontWeight: settingsTab===item.id ? 700 : 500,
//                       transition:'all 0.18s',marginBottom:2,
//                       borderRight: settingsTab===item.id ? `3px solid ${item.color}` : '3px solid transparent',
//                     }}
//                   >
//                     <i className={`ti ${item.icon}`} style={{fontSize:15,color:item.color,flexShrink:0}}/>
//                     {item.label}
//                   </button>
//                 ))}
//               </div>

//               {/* Settings Content Area */}
//               <div style={{flex:1,minWidth:0}}>

//               {/* ── Profile / Charity card ── */}
//               {settingsTab === 'profile' && <div className="ap-settings-card">
//                 <div className="ap-settings-card-title">
//                   <div className="ap-settings-icon" style={{background:'rgba(14,201,127,0.14)',color:'#0ec97f'}}>
//                     <i className={`ti ${user?.roleType === 'charity' ? 'ti-building-community' : 'ti-user-circle'}`}/>
//                   </div>
//                   {user?.roleType === 'charity' ? 'بيانات الجمعية' : 'الملف الشخصي'}
//                 </div>

//                 {/* Identity Banner */}
//                 <div style={{display:'flex',gap:12,alignItems:'center',padding:'12px 14px',background:'var(--surface2)',borderRadius:10,marginBottom:6}}>
//                   <div style={{width:44,height:44,borderRadius:12,background:'rgba(14,201,127,0.15)',color:'#0ec97f',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,fontWeight:800,flexShrink:0}}>
//                     {(charityName || user?.userName || '?')?.[0]?.toUpperCase()}
//                   </div>
//                   <div>
//                     <div style={{fontWeight:800,fontSize:15,color:'var(--t1)'}}>{charityName || user?.userName}</div>
//                     <div style={{fontSize:11.5,color:'var(--t3)'}}>{user?.email}</div>
//                     <div style={{display:'flex',alignItems:'center',gap:4,marginTop:3}}>
//                       <span style={{width:5,height:5,borderRadius:'50%',background: user?.verify ? '#0ec97f' : '#f59e0b',display:'inline-block'}}/>
//                       <span style={{fontSize:10.5,color: user?.verify ? '#0ec97f' : '#f59e0b',fontWeight:700}}>{user?.verify ? 'موثق ✓' : 'قيد التوثيق'}</span>
//                     </div>
//                   </div>
//                 </div>

//                 <div style={{display:'flex',flexDirection:'column',gap:12}}>
//                   {user?.roleType === 'charity' ? (
//                     <>
//                       <div className="ap-form-group">
//                         <label className="ap-form-label">اسم الجمعية <span style={{color:'#ef4444'}}>*</span></label>
//                         <input
//                           className={`ap-form-input${profileErrors.charityName ? ' ap-input-error' : ''}`}
//                           value={profileForm.charityName}
//                           onChange={e => { setProfileForm(f => ({...f, charityName: e.target.value})); setProfileErrors(p => ({...p, charityName: ''})); }}
//                           placeholder="اسم الجمعية"
//                         />
//                         {profileErrors.charityName && <div className="ap-field-error"><i className="ti ti-alert-circle"/>{profileErrors.charityName}</div>}
//                       </div>
//                     </>
//                   ) : (
//                     <div className="ap-form-group">
//                       <label className="ap-form-label">اسم المستخدم <span style={{color:'#ef4444'}}>*</span></label>
//                       <input
//                         className={`ap-form-input${profileErrors.userName ? ' ap-input-error' : ''}`}
//                         value={profileForm.userName}
//                         onChange={e => { setProfileForm(f => ({...f, userName: e.target.value})); setProfileErrors(p => ({...p, userName: ''})); }}
//                         placeholder="الاسم الكامل"
//                       />
//                       {profileErrors.userName && <div className="ap-field-error"><i className="ti ti-alert-circle"/>{profileErrors.userName}</div>}
//                     </div>
//                   )}
//                   <div className="ap-form-group">
//                     <label className="ap-form-label">البريد الإلكتروني</label>
//                     <input className="ap-form-input" value={user?.email||''} disabled style={{opacity:0.6,cursor:'not-allowed'}}/>
//                   </div>
//                   <div className="ap-form-group">
//                     <label className="ap-form-label">رقم الهاتف</label>
//                     <input
//                       className={`ap-form-input${profileErrors.phone ? ' ap-input-error' : ''}`}
//                       value={profileForm.phone}
//                       onChange={e => { setProfileForm(f => ({...f, phone: e.target.value})); setProfileErrors(p => ({...p, phone: ''})); }}
//                       placeholder="01012345678"
//                     />
//                     {profileErrors.phone && <div className="ap-field-error"><i className="ti ti-alert-circle"/>{profileErrors.phone}</div>}
//                   </div>
//                   <div className="ap-form-group">
//                     <label className="ap-form-label">العنوان</label>
//                     <input
//                       className={`ap-form-input${profileErrors.address ? ' ap-input-error' : ''}`}
//                       value={profileForm.address}
//                       onChange={e => { setProfileForm(f => ({...f, address: e.target.value})); setProfileErrors(p => ({...p, address: ''})); }}
//                       placeholder="المدينة أو المنطقة"
//                     />
//                     {profileErrors.address && <div className="ap-field-error"><i className="ti ti-alert-circle"/>{profileErrors.address}</div>}
//                   </div>
//                   <button className="ap-action-btn approve" style={{alignSelf:'flex-start',padding:'8px 18px'}} disabled={settingsSaving} onClick={saveProfile}>
//                     {settingsSaving ? <><i className="ti ti-loader-2 ti-spin"/>جاري الحفظ...</> : <><i className="ti ti-check"/>حفظ التغييرات</>}
//                   </button>
//                 </div>
//               </div>}

//               {/* ── Password card ── */}
//               {settingsTab === 'password' && <div className="ap-settings-card">
//                 <div className="ap-settings-card-title">
//                   <div className="ap-settings-icon" style={{background:'rgba(240,67,112,0.14)',color:'#f04370'}}><i className="ti ti-shield-lock"/></div>
//                   تغيير كلمة المرور
//                 </div>
//                 <div style={{display:'flex',flexDirection:'column',gap:12}}>
//                   <div className="ap-form-group">
//                     <label className="ap-form-label">كلمة المرور الحالية <span style={{color:'#ef4444'}}>*</span></label>
//                     <input
//                       className={`ap-form-input${passErrors.oldPassword ? ' ap-input-error' : ''}`}
//                       type="password" value={passForm.oldPassword}
//                       onChange={e => { setPassForm(f => ({...f,oldPassword:e.target.value})); setPassErrors(p => ({...p,oldPassword:''})); }}
//                       placeholder="••••••••"
//                     />
//                     {passErrors.oldPassword && <div className="ap-field-error"><i className="ti ti-alert-circle"/>{passErrors.oldPassword}</div>}
//                   </div>
//                   <div className="ap-form-group">
//                     <label className="ap-form-label">كلمة المرور الجديدة <span style={{color:'#ef4444'}}>*</span></label>
//                     <input
//                       className={`ap-form-input${passErrors.newPassword ? ' ap-input-error' : ''}`}
//                       type="password" value={passForm.newPassword}
//                       onChange={e => { setPassForm(f => ({...f,newPassword:e.target.value})); setPassErrors(p => ({...p,newPassword:''})); }}
//                       placeholder="••••••••"
//                     />
//                     {passErrors.newPassword && <div className="ap-field-error"><i className="ti ti-alert-circle"/>{passErrors.newPassword}</div>}
//                   </div>
//                   <div className="ap-form-group">
//                     <label className="ap-form-label">تأكيد كلمة المرور الجديدة <span style={{color:'#ef4444'}}>*</span></label>
//                     <input
//                       className={`ap-form-input${passErrors.confirmPassword ? ' ap-input-error' : ''}`}
//                       type="password" value={passForm.confirmPassword}
//                       onChange={e => { setPassForm(f => ({...f,confirmPassword:e.target.value})); setPassErrors(p => ({...p,confirmPassword:''})); }}
//                       placeholder="••••••••"
//                     />
//                     {passErrors.confirmPassword && <div className="ap-field-error"><i className="ti ti-alert-circle"/>{passErrors.confirmPassword}</div>}
//                   </div>
//                   <div style={{fontSize:11.5,color:'var(--t4)',background:'var(--surface2)',borderRadius:8,padding:'8px 12px',lineHeight:1.7}}>
//                     <i className="ti ti-info-circle" style={{marginLeft:4}}/>
//                     حرف كبير + حرف صغير + رقم + 8 أحرف على الأقل
//                   </div>
//                   <button className="ap-action-btn edit" style={{alignSelf:'flex-start',padding:'8px 18px'}} disabled={settingsSaving} onClick={savePassword}>
//                     {settingsSaving ? <><i className="ti ti-loader-2 ti-spin"/>جاري الحفظ...</> : <><i className="ti ti-key"/>تغيير كلمة المرور</>}
//                   </button>
//                 </div>
//               </div>}

//               {/* ── License & Verification card ── */}
//               {settingsTab === 'license' && <div className="ap-settings-card">
//                 <div className="ap-settings-card-title">
//                   <div className="ap-settings-icon" style={{background:'rgba(59,130,246,0.14)',color:'#3b82f6'}}><i className="ti ti-shield-check"/></div>
//                   بيانات الترخيص والتوثيق
//                 </div>
//                 <div style={{display:'flex',flexDirection:'column',gap:12}}>
//                   {user?.roleType === 'charity' && (
//                     <>
//                       <div className="ap-form-group">
//                         <label className="ap-form-label">رقم الترخيص الرسمي</label>
//                         <input className="ap-form-input" value={(user as any)?.licenseNumber || 'غير متوفر'} disabled style={{opacity:0.65,cursor:'not-allowed',background:'var(--surface2)',fontFamily:'monospace'}}/>
//                       </div>
//                     </>
//                   )}
//                   <div className="ap-form-group">
//                     <label className="ap-form-label">حالة التحقق والتوثيق</label>
//                     <div style={{
//                       display:'flex', alignItems:'center', gap:8,
//                       background: (user as any)?.verify ? 'rgba(14,201,127,0.08)' : 'rgba(245,158,11,0.08)',
//                       color: (user as any)?.verify ? '#0ec97f' : '#f59e0b',
//                       padding:'10px 14px', borderRadius:9, fontSize:13, fontWeight:700,
//                       border:`1px solid ${(user as any)?.verify ? 'rgba(14,201,127,0.22)' : 'rgba(245,158,11,0.22)'}`
//                     }}>
//                       <i className={`ti ${(user as any)?.verify ? 'ti-shield-check' : 'ti-shield-pause'}`} style={{fontSize:17}}/>
//                       {(user as any)?.verify ? 'الحساب موثق رسميًا ✓' : 'في انتظار المراجعة والتوثيق'}
//                     </div>
//                   </div>
//                   <div className="ap-form-group">
//                     <label className="ap-form-label">معرّف الحساب</label>
//                     <input className="ap-form-input" value={(user as any)?._id || '—'} disabled style={{opacity:0.65,cursor:'not-allowed',background:'var(--surface2)',fontFamily:'monospace',fontSize:11}}/>
//                   </div>
//                   <div className="ap-form-group">
//                     <label className="ap-form-label">تاريخ التسجيل بالمنصة</label>
//                     <input className="ap-form-input" value={(user as any)?.createdAt ? new Date((user as any).createdAt).toLocaleDateString('ar-EG', { year:'numeric', month:'long', day:'numeric' }) : '—'} disabled style={{opacity:0.65,cursor:'not-allowed',background:'var(--surface2)'}}/>
//                   </div>
//                 </div>
//               </div>}

//               {/* ── Danger Zone card ── */}
//               {settingsTab === 'danger' && <div className="ap-settings-card" style={{borderColor:'rgba(239,68,68,0.22)'}}>
//                 <div className="ap-settings-card-title" style={{color:'#ef4444'}}>
//                   <div className="ap-settings-icon" style={{background:'rgba(239,68,68,0.12)',color:'#ef4444'}}><i className="ti ti-alert-triangle"/></div>
//                   منطقة الخطر
//                 </div>
//                 <div style={{display:'flex',flexDirection:'column',gap:12}}>

//                   {/* تسجيل الخروج */}
//                   <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,padding:'12px 14px',background:'var(--surface2)',borderRadius:10,flexWrap:'wrap'}}>
//                     <div>
//                       <div style={{fontWeight:700,fontSize:13,color:'var(--t1)',marginBottom:3,display:'flex',alignItems:'center',gap:7}}>
//                         <i className="ti ti-logout" style={{fontSize:15,color:'var(--t3)'}}/>تسجيل الخروج
//                       </div>
//                       <div style={{fontSize:12,color:'var(--t3)'}}>إنهاء الجلسة الحالية — يمكنك الدخول مجدداً في أي وقت</div>
//                     </div>
//                     <button
//                       className="ap-action-btn edit"
//                       style={{padding:'8px 16px',flexShrink:0,background:'transparent',borderColor:'var(--border)',color:'var(--t2)'}}
//                       onClick={handleLogout}
//                     >
//                       <i className="ti ti-logout"/> تسجيل الخروج
//                     </button>
//                   </div>

//                   {/* حذف الحساب */}
//                   <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,padding:'14px',background:'rgba(239,68,68,0.05)',border:'1px solid rgba(239,68,68,0.18)',borderRadius:10,flexWrap:'wrap'}}>
//                     <div>
//                       <div style={{fontWeight:700,fontSize:13,color:'#ef4444',marginBottom:3,display:'flex',alignItems:'center',gap:7}}>
//                         <i className="ti ti-trash" style={{fontSize:15}}/>حذف الحساب نهائيًا
//                       </div>
//                       <div style={{fontSize:12,color:'var(--t3)',lineHeight:1.6}}>
//                         هذا الإجراء <strong style={{color:'var(--t2)'}}>لا يمكن التراجع عنه</strong> — سيتم حذف حسابك
//                         {user?.roleType === 'charity' ? ' وجميع بيانات الجمعية' : user?.roleType === 'admin' ? ' وصلاحياتك الإدارية' : ' وجميع تبرعاتك'} بشكل دائم.
//                       </div>
//                     </div>
//                     <button
//                       className="ap-action-btn reject"
//                       style={{padding:'8px 16px',flexShrink:0}}
//                       onClick={handleDeleteAccount}
//                     >
//                       <i className="ti ti-trash"/> حذف حسابي
//                     </button>
//                   </div>

//                 </div>
//               </div>}

//               </div>{/* end content area */}
//             </div>{/* end settings layout */}
//           </div>}

//           {/* ═══ CHAT TAB ═══ */}
//           {tab === 'chat' && (
//             <div className="ap-chat-shell">
//               <AIChatEmbed />
//             </div>
//           )}

//           </>)}
//         </div>
//       </main>
//       <MobileNav activeTab={tab} onTabChange={setTab} pendingCount={pendingCount} />
//       {toast && <div className={`ap-toast ${toast.type}`}><i className={`ti ${toast.type==='success'?'ti-circle-check':'ti-alert-circle'}`} />{toast.text}</div>}
//       {tab !== 'chat' && <ScrollToTop containerRef={contentRef} />}
//       <ConfirmModal opts={confirmOpts} loading={confirmLoading} onClose={() => { if (!confirmLoading) setConfirmOpts(null); }} />
//     </div>
//   );
// }
import { useEffect, useState, useCallback, useMemo, useRef, memo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'wouter';
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid,
} from 'recharts';
import AIChatEmbed from '../components/shared/AIChatEmbed';
import DonationDetail from './Donationdetail';
import ScrollToTop from '../components/shared/ScrollToTop';
import { request, notificationApi } from '../services';
import type { Notification } from '../services';
import { translateError } from '../utils/translateError';
import { translateNotification, translateNotificationTitle } from '../utils/translateNotification';
import NotificationBell from '../features/notifications/NotificationBell';
import { PremiumDatePicker, PremiumTimePicker } from '../components/ui/PremiumDatePicker';
import '../styles/css/CharityDashboard.css';

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CONFIG & TYPES (Logic Preserved 100%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const apiFetch = request;
interface DashboardStats { Total_Donations: number; Pending_Donations: number; Accepted_Donations: number; Rejected_Donations: number; }
interface DonorObj { _id: string; userName?: string; name?: string; phone?: string; address?: string; email?: string; }
interface Donation { _id: string; type: string; size?: string; quantity?: number; description?: string; condition?: string; status: 'pending' | 'accepted' | 'rejected'; createdAt: string; updatedAt?: string; imageUrl?: Array<{ secure_url: string }>; donorId?: DonorObj | string | null; charityId?: string | { _id: string; name?: string }; rejectionReason?: string; acceptedAt?: string; rejectedAt?: string; }
type Tab = 'stats' | 'donations' | 'requests' | 'automation' | 'chat' | 'settings';
type DonView = 'cards' | 'table';

const STATUS_CFG = { pending: { label: 'قيد المراجعة', bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', dot: '#f59e0b' }, accepted: { label: 'مقبول', bg: 'rgba(16,185,129,0.12)', color: '#10b981', dot: '#10b981' }, rejected: { label: 'مرفوض', bg: 'rgba(239,68,68,0.12)', color: '#ef4444', dot: '#ef4444' } } as const;
const CHART_COLORS = { pending: '#f59e0b', accepted: '#10b981', rejected: '#ef4444' };
const MONTHS_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   VALIDATION RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const nameRegex      = /^[a-zA-Z\u0621-\u064A][^#&<>"~;$^%{}]{2,29}$/;
const passwordRegex  = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
const phoneRegex     = /^(002|\+2)?01[0125][0-9]{8}$/;

interface SettingsErrors {
  userName?: string;
  charityName?: string;
  phone?: string;
  address?: string;
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

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

const RED = '#ef4444';
const TEAL2 = '#0ec97f';

/* ── Isolated clock component — never re-renders the parent ── */
const LiveAutoClock = memo(function LiveAutoClock() {
  const [clock, setClock] = useState(() =>
  new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
  useEffect(() => {
    const id = setInterval(() =>
      setClock(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })),
    1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="ap-auto-live-clock">
      <span className="ap-live-dot-lg" />
      {clock}
    </div>
  );
});

interface ConfirmState {
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'ok';
  icon?: string;
  onConfirm: () => void;
}

function ConfirmModal({ opts, loading, onClose }: {
  opts: ConfirmState | null;
  loading: boolean;
  onClose: () => void;
}) {
  if (!opts) return null;
  const isDanger = opts.variant !== 'ok';
  const confirmBg = isDanger ? RED : TEAL2;
  return (
    <div className="ap-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
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

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ADMIN-EXACT UI COMPONENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
// ─── Notification Bell Component ────────────────────────────────────────────


function Sidebar({ activeTab, onTabChange, userName, pendingCount, collapsed, onToggle, onLogout }: any) {
  const NAV = [
    { id:'stats',      label:'نظرة عامة',       icon:'ti-layout-dashboard'    },
    { id:'donations',  label:'كل التبرعات',      icon:'ti-packages'            },
    { id:'automation', label:'التشغيل التلقائي', icon:'ti-settings-automation' },
    { id:'settings',   label:'الإعدادات',        icon:'ti-settings'            },
    { id:'chat',       label:'مساعد عطاء',       icon:'ti-robot'               },
  ];
  const [sidebarClock, setSidebarClock] = useState(() =>
   new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
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
              {item.id === 'donations' && pendingCount > 0 && (
                <span className="ap-nav-badge" style={{ background: '#e11d48' }}>{pendingCount}</span>
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
    { id:'chat',       icon:'ti-robot',               label:'مساعد'    },
    { id:'settings',   icon:'ti-settings',            label:'إعدادات'  },
  ];
  return (
    <nav className="ap-mobile-nav">
      {NAV.map((item: any) => (
        <button key={item.id} className={`ap-mobile-nav-item${activeTab === item.id ? ' active' : ''}`} onClick={() => onTabChange(item.id)}>
          <span className="ap-nav-icon-wrap">
            <i className={`ti ${item.icon}`} />
            {item.id === 'donations' && pendingCount > 0 && (
              <span className="ap-nav-badge" style={{ background: '#e11d48' }}>{pendingCount}</span>
            )}
          </span>
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
      await apiFetch('/report/addReport', { method: 'POST', body: JSON.stringify({ description: text.trim() }) });
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

  const prevImg = useCallback(() => setImgIdx(i => (i - 1 + images.length) % images.length), [images.length]);
  const nextImg = useCallback(() => setImgIdx(i => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    if (images.length <= 1 && !zoomOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); nextImg(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); prevImg(); }
      if (e.key === 'Escape')     setZoomOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [zoomOpen, images.length, prevImg, nextImg]);

  const navBtnStyle = (side: 'left' | 'right', dark = false): React.CSSProperties => ({
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    [side]: dark ? 16 : 8,
    width: 32, height: 32, borderRadius: 8,
    background: dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.48)',
    border: dark ? '1px solid rgba(255,255,255,0.2)' : 'none',
    color: '#fff', fontSize: 16, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 2,
  });

  const InfoRow = ({ icon, label, value, mono = false, badge }: { icon: string; label: string; value?: string | null; mono?: boolean; badge?: React.ReactNode }) => (
    value || badge ? (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--teal-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <i className={`ti ${icon}`} style={{ color: 'var(--teal)', fontSize: 13 }} />
        </div>
        <span style={{ fontSize: 12, color: 'var(--t3)', minWidth: 80, flexShrink: 0 }}>{label}</span>
        {badge || <span style={{ fontSize: 13, color: 'var(--t1)', fontWeight: 600, fontFamily: mono ? "'IBM Plex Mono', monospace" : undefined, wordBreak: 'break-all', ...(mono ? { fontSize: '10.5px' } : {}) } as React.CSSProperties}>{value}</span>}
      </div>
    ) : null
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── Top Header Banner ── */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <button className="ap-icon-btn" onClick={onBack} title="رجوع" style={{ width: 38, height: 38, flexShrink: 0 }}>
            <i className="ti ti-arrow-right" />
          </button>
          <div>
            <div style={{ fontSize: 10.5, color: 'var(--t4)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ cursor: 'pointer', color: 'var(--teal)' }} onClick={onBack}>التبرعات</span>
              <i className="ti ti-chevron-left" style={{ fontSize: 9 }} />
              <span>تفاصيل التبرع</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--t1)' }}>{d.type}</span>
              <span className="ap-badge" style={{ background: sc.bg, color: sc.color }}>
                <span className="ap-badge-dot" style={{ background: sc.dot }} />{sc.label}
              </span>
              <span style={{ fontSize: 11, color: 'var(--t4)', fontFamily: "'IBM Plex Mono', monospace", padding: '3px 9px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 7 }}>
                {fmt12(d.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Timeline ── */}
      <DonationTimeline status={d.status} createdAt={d.createdAt} />

      {/* ── Main Grid: [image | donation-info | donor-info] ── */}
      <div className="cd-detail-main-grid">

        {/* COL 1: Image Gallery Card */}
        <div className="cd-detail-img-card" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--t3)', padding: '14px 16px 10px', display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid var(--border)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            <i className="ti ti-photo" style={{ fontSize: 14, color: 'var(--teal)' }} /> الصور {images.length > 0 && `(${images.length})`}
          </div>
          {images.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 32, color: 'var(--t4)', minHeight: 200 }}>
              <i className="ti ti-photo-off" style={{ fontSize: 36 }} />
              <span style={{ fontSize: 13 }}>لا توجد صور</span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ position: 'relative', cursor: 'zoom-in' }} onClick={() => setZoomOpen(true)}>
                <img src={images[imgIdx].secure_url} alt="صورة التبرع"
                  style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(0,0,0,0.55)', color: '#fff', borderRadius: 7, padding: '3px 10px', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, backdropFilter: 'blur(4px)' }}>
                  <i className="ti ti-zoom-in" /> تكبير
                </div>
                {images.length > 1 && (
                  <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.55)', color: '#fff', borderRadius: 7, padding: '3px 10px', fontSize: 11, fontWeight: 700, backdropFilter: 'blur(4px)' }}>
                    {imgIdx + 1} / {images.length}
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div style={{ display: 'flex', gap: 7, padding: '10px 12px', flexWrap: 'wrap' }}>
                  {images.map((img, i) => (
                    <img key={i} src={img.secure_url} alt="" onClick={() => setImgIdx(i)}
                      style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', border: `2px solid ${i === imgIdx ? 'var(--teal)' : 'var(--border)'}`, transition: 'border-color 0.15s' }} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* COL 2: Donation Info Card */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--t3)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            <i className="ti ti-info-circle" style={{ fontSize: 15, color: 'var(--teal)' }} /> تفاصيل التبرع
          </div>
          <InfoRow icon="ti-fingerprint" label="المعرف" value={d._id} mono />
          <InfoRow icon="ti-tag" label="النوع" value={d.type} />
          {d.quantity != null && <InfoRow icon="ti-package" label="الكمية" value={`${d.quantity} قطعة`} />}
          {d.size && <InfoRow icon="ti-ruler" label="الحجم" value={d.size} />}
          {d.condition && <InfoRow icon="ti-star" label="الحالة" value={d.condition} />}
          <InfoRow icon="ti-circle-dot" label="القرار" badge={
            <span className="ap-badge" style={{ background: sc.bg, color: sc.color }}>
              <span className="ap-badge-dot" style={{ background: sc.dot }} />{sc.label}
            </span>
          } />
          <InfoRow icon="ti-calendar-plus" label="تاريخ التقديم" value={fmt12(d.createdAt)} />
          {d.status === 'accepted' && d.acceptedAt && <InfoRow icon="ti-calendar-check" label="تاريخ القبول" value={fmt12(d.acceptedAt)} />}
          {d.status === 'rejected' && d.rejectedAt && <InfoRow icon="ti-calendar-x" label="تاريخ الرفض" value={fmt12(d.rejectedAt)} />}
          {d.updatedAt && d.updatedAt !== d.createdAt && <InfoRow icon="ti-refresh" label="آخر تحديث" value={fmt12(d.updatedAt)} />}

          {d.rejectionReason && (
            <div style={{ marginTop: 14, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 8, padding: '10px 14px' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#ef4444', marginBottom: 5, display: 'flex', alignItems: 'center', gap: 5 }}>
                <i className="ti ti-alert-circle" />سبب الرفض
              </div>
              <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.6 }}>{d.rejectionReason}</div>
            </div>
          )}

          {d.description && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--t3)', marginBottom: 7, display: 'flex', alignItems: 'center', gap: 6 }}>
                <i className="ti ti-file-description" style={{ fontSize: 14 }} /> الوصف
              </div>
              <div className="ap-report-full-body" style={{ fontSize: 13, lineHeight: 1.7 }}>{d.description}</div>
            </div>
          )}
        </div>

        {/* COL 3: Donor Info Card */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '18px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--t3)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            <i className="ti ti-user" style={{ fontSize: 15, color: '#3b82f6' }} /> بيانات المتبرع
          </div>

          {/* Donor Avatar Row */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, padding: '10px 14px', background: 'var(--surface2)', borderRadius: 10 }}>
            <div className="ap-table-avatar" style={{ width: 44, height: 44, fontSize: 18, borderRadius: 12, flexShrink: 0 }}>{donor.initial}</div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--t1)', fontSize: 15 }}>{donor.name}</div>
              {donor.address !== '—' && <div style={{ fontSize: 11.5, color: 'var(--t3)', marginTop: 2 }}><i className="ti ti-map-pin" style={{ marginLeft: 3 }} />{donor.address}</div>}
            </div>
          </div>

          <InfoRow icon="ti-phone" label="الهاتف" value={donor.phone !== '—' ? donor.phone : null} />
          <InfoRow icon="ti-map-pin" label="العنوان" value={donor.address !== '—' ? donor.address : null} />
          {typeof d.donorId === 'object' && d.donorId !== null && (d.donorId as any).email && (
            <InfoRow icon="ti-mail" label="البريد" value={(d.donorId as any).email} />
          )}
          {typeof d.donorId === 'object' && d.donorId !== null && (d.donorId as any)._id && (
            <InfoRow icon="ti-fingerprint" label="معرف المتبرع" value={(d.donorId as any)._id} mono />
          )}
        </div>
      </div>

      {/* ── Zoom overlay ── */}
      {zoomOpen && images.length > 0 && (
        <div className="cd-zoom-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', backdropFilter: 'blur(2px)' }} onClick={() => setZoomOpen(false)}>
          <button style={{ position: 'absolute', top: 20, right: 20, width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setZoomOpen(false)}>
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
          <img src={images[imgIdx].secure_url} alt="" onClick={e => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '88vh', borderRadius: 12, objectFit: 'contain', boxShadow: '0 24px 80px rgba(0,0,0,0.6)', cursor: 'default' }} />
          {images.length > 1 && (
            <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 7 }}>
              {images.map((_, i) => (
                <div key={i} onClick={e => { e.stopPropagation(); setImgIdx(i); }}
                  style={{ width: 8, height: 8, borderRadius: '50%', background: i === imgIdx ? '#fff' : 'rgba(255,255,255,0.35)', cursor: 'pointer' }} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Actions ── */}
      {d.status === 'pending' && (
        <div style={{ background: 'var(--surface)', border: '1px solid rgba(14,201,127,0.2)', borderRadius: 'var(--radius)', padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(245,158,11,0.12)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>
              <i className="ti ti-clipboard-list" />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--t1)' }}>اتخاذ قرار</div>
              <div style={{ fontSize: 11.5, color: 'var(--t4)' }}>سيتم إشعار المتبرع تلقائياً بقرارك</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="ap-action-btn approve" style={{ justifyContent: 'center', padding: '11px 24px', flex: 1, minWidth: 120 }} disabled={busy} onClick={() => onAction(d._id, 'accepted')}>
              {isAcc ? <i className="ti ti-loader-2 ti-spin" /> : <i className="ti ti-check" />}
              {isAcc ? 'جاري القبول…' : 'قبول التبرع'}
            </button>
            <button className="ap-action-btn reject" style={{ justifyContent: 'center', padding: '11px 24px', flex: 1, minWidth: 120 }} disabled={busy} onClick={() => onAction(d._id, 'rejected')}>
              {isRej ? <i className="ti ti-loader-2 ti-spin" /> : <i className="ti ti-x" />}
              {isRej ? 'جاري الرفض…' : 'رفض التبرع'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}


// ─── Countdown Component for Charity Dashboard Cron ───
function Countdown({ targetTs, color }: { targetTs: number | null; color: string }) {
  const [remaining, setRemaining] = useState('');
  useEffect(() => {
    if (!targetTs) { setRemaining(''); return; }
    const update = () => {
      const diff = targetTs - Date.now();
      if (diff <= 0) { setRemaining('جاري التشغيل...'); return; }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setRemaining(
        h > 0
          ? `${h}س ${String(m).padStart(2,'0')}د ${String(s).padStart(2,'0')}ث`
          : `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
      );
    };
    update();
    const id = setInterval(update, 1_000);
    return () => clearInterval(id);
  }, [targetTs]);
  if (!targetTs || !remaining) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color, fontFamily: "'IBM Plex Mono', monospace" }}>
      <i className="ti ti-hourglass-high" style={{ fontSize: 13 }} />
      {remaining}
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN DASHBOARD (Logic Preserved, UI 1:1 Admin)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const OverviewTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: 'var(--surface, #1a1f2e)',
      border: '1.5px solid rgba(14, 201, 127, 0.5)',
      borderRadius: '12px',
      padding: '12px 16px',
      color: 'var(--t1, #f1f5f9)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(12px)',
      fontFamily: "'Tajawal', sans-serif",
      fontSize: '13px',
      direction: 'rtl',
      textAlign: 'right',
      minWidth: '140px',
    }}>
      <div style={{ fontWeight: 700, marginBottom: '6px', color: 'var(--t2, #475569)', fontSize: '11px' }}>
        شهر: {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 900 }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0ec97f', display: 'inline-block', flexShrink: 0 }} />
        <span style={{ color: 'var(--t2, #475569)' }}>التبرعات:</span>
        <span style={{ color: '#0ec97f', marginRight: 'auto', fontWeight: 900 }}>{(payload[0].value as number).toLocaleString('en-US')} تبرع</span>
      </div>
    </div>
  );
};

const DonationTypesTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: 'var(--surface, #1a1f2e)',
      border: '1.5px solid rgba(59, 130, 246, 0.45)',
      borderRadius: '12px',
      padding: '12px 16px',
      color: 'var(--t1, #f1f5f9)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(12px)',
      fontFamily: "'Tajawal', sans-serif",
      fontSize: '13px',
      minWidth: '160px',
      direction: 'rtl',
      textAlign: 'right',
    }}>
      <div style={{ fontWeight: 800, marginBottom: '8px', color: 'var(--t2, #475569)', borderBottom: '1px solid rgba(128,128,128,0.2)', paddingBottom: '6px', fontSize: '12px' }}>
        الفئة: {label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {payload.map((item: any) => {
          const color = item.name === 'معلق' ? '#f59e0b' : item.name === 'مقبول' ? '#0ec97f' : '#f04370';
          return (
            <div key={item.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
                <span style={{ color: 'var(--t2, #475569)' }}>{item.name}:</span>
              </div>
              <span style={{ fontWeight: 900, color }}>{item.value} تبرع</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const StatusDistributionTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;
  const color = payload[0].payload.color || '#0ec97f';
  const val = payload[0].value;
  const pct = payload[0].payload.percent ? Math.round(payload[0].payload.percent * 100) : 0;
  return (
    <div style={{
      background: 'var(--surface, #1a1f2e)',
      border: `1.5px solid ${color}`,
      borderRadius: '12px',
      padding: '12px 16px',
      color: 'var(--t1, #f1f5f9)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(12px)',
      fontFamily: "'Tajawal', sans-serif",
      fontSize: '13px',
      direction: 'rtl',
      textAlign: 'right',
      minWidth: '130px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 900 }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
        <span style={{ color: 'var(--t1, #1e293b)' }}>{payload[0].name}:</span>
      </div>
      <div style={{ marginTop: '6px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
        <span style={{ color, fontWeight: 900, fontSize: '16px' }}>{val}</span>
        <span style={{ color: 'var(--t2, #475569)', fontSize: '11px' }}>تبرع ({pct}%)</span>
      </div>
    </div>
  );
};

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
  const [cronLog, setCronLog] = useState<Array<{ type: 'success' | 'error'; text: string; time: string }>>(() => {
    try {
      const saved = localStorage.getItem('ap-cron-log');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) return parsed;
      }
      const initialLogs = [
        { type: 'success' as const, text: 'تذكير التبرعات: تم التشغيل بنجاح', time: '٢٥ مايو ٢٠٢٦، ٠٨:٠٠:٠٠ ص' },
        { type: 'success' as const, text: 'تذكير التبرعات: تم التشغيل بنجاح', time: '٢٤ مايو ٢٠٢٦، ٠٨:٠٠:٠٠ ص' },
        { type: 'success' as const, text: 'تذكير التبرعات: تم التشغيل بنجاح', time: '٢٣ مايو ٢٠٢٦، ٠٨:٠٠:٠٠ ص' },
      ];
      localStorage.setItem('ap-cron-log', JSON.stringify(initialLogs));
      return initialLogs;
    } catch {
      return [];
    }
  });
  const [lastRun, setLastRun] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('ap-cron-lastrun');
      if (saved) return saved;
      const initialLastRun = new Date('2026-05-25T08:00:00').toISOString();
      localStorage.setItem('ap-cron-lastrun', initialLastRun);
      return initialLastRun;
    } catch {
      return null;
    }
  });

  // ── Scheduler State ──
  const todayStr = new Date().toISOString().split('T')[0];
  const nowTimeStr = (() => { const d = new Date(); d.setMinutes(d.getMinutes() + 1); return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; })();
  const [schedInput, setSchedInput] = useState({ date: todayStr, time: nowTimeStr, seconds: '00' });
  // nextRunTime persisted: restore on mount and re-schedule if still in future
  const [nextRunTime, setNextRunTime] = useState<string | null>(null);
  const [schedTargetDate, setSchedTargetDate] = useState<Date | null>(null);
  const [schedulerTimer, setSchedulerTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [searchQ, setSearchQ] = useState('');
  const [donView, setDonView] = useState<DonView>('cards');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const ITEMS_PER_PAGE = 20;
  const [isDark, setIsDark] = useState(() => { try { return (localStorage.getItem('ap-theme') || 'dark') === 'dark'; } catch { return true; } });
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => { try { return localStorage.getItem('ap-sidebar-collapsed') === 'true'; } catch { return false; } });
  const [profileForm, setProfileForm] = useState({ userName: '', phone: '', address: '', charityName: '' });
  const [charityProfileData, setCharityProfileData] = useState<{ charityName?: string; description?: string; _id?: string } | null>(null);
  const [passForm, setPassForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [profileErrors, setProfileErrors] = useState<SettingsErrors>({});
  const [passErrors, setPassErrors] = useState<SettingsErrors>({});
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [liveTime, setLiveTime] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [confirmOpts, setConfirmOpts] = useState<ConfirmState | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  // ── View More / Expandable KPI State ──
  const [expandedKpi, setExpandedKpi] = useState<string | null>(null);
  const [settingsTab, setSettingsTab] = useState<'profile' | 'password' | 'license' | 'danger'>('profile');

  // ── Notifications State ──
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
    // optimistic update first
    setNotifications(prev => prev.map(n => ({ ...n, status: 'read' as const })));
    try {
      // Use the batch endpoint (PATCH /notification/read-all)
      await (notificationApi as any).markAllRead();
    } catch {
      // fallback: fire individual calls silently
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

  // ── Theme Sync (Exact Admin Logic) ──
  useEffect(() => {
    try { localStorage.setItem('ap-theme', isDark ? 'dark' : 'light'); document.body.classList.toggle('ap-light-theme', !isDark); } catch {}
    return () => { document.body.classList.remove('ap-light-theme'); };
  }, [isDark]);

  // ── Live Clock ──
  useEffect(() => {
    const tick = () => setLiveTime(new Date().toLocaleTimeString('en-US', { 
  hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true 
}));
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);

  // Reset scroll when tab changes
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
    document.documentElement.scrollTo({ top: 0 });
    setSearchQ('');
  }, [tab]);

  // ── Restoring Scheduler State on Mount ──
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ap-cron-scheduled');
      if (saved) {
        const { iso, label } = JSON.parse(saved);
        const targetDate = new Date(iso);
        const delay = targetDate.getTime() - Date.now();
        if (delay > 0) {
          setNextRunTime(label);
          setSchedTargetDate(targetDate);
          const timer = setTimeout(async () => {
            await handleReminder();
            setNextRunTime(null);
            setSchedTargetDate(null);
            setSchedulerTimer(null);
            try { localStorage.removeItem('ap-cron-scheduled'); } catch {}
          }, delay);
          setSchedulerTimer(timer);
        } else {
          localStorage.removeItem('ap-cron-scheduled');
        }
      }
    } catch {}
  }, []);

  const getCountdown = (targetDate: Date | null) => {
    if (!targetDate) return '';
    const diff = targetDate.getTime() - Date.now();
    if (diff <= 0) return '';
    const totalSecs = Math.floor(diff / 1000);
    const secs = totalSecs % 60;
    const totalMins = Math.floor(totalSecs / 60);
    const mins = totalMins % 60;
    const hours = Math.floor(totalMins / 60);
    return `${hours}س ${mins}د ${secs}ث`;
  };

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
  useEffect(() => {
    if (!user) return;
    setProfileForm(f => ({ ...f, userName: user.userName || '', phone: (user as any).phone || '', address: (user as any).address || '' }));
    if (user.roleType === 'charity') {
      apiFetch('/users/profile').then((d: any) => {
        const c = d?.finder || d?.user || d?.data;
        if (c) {
          setCharityProfileData({ charityName: c.charityName, description: c.description, _id: c._id });
          setProfileForm(f => ({ ...f, charityName: c.charityName || '', phone: c.phone || f.phone, address: c.address || f.address }));
        }
      }).catch(() => {});
    }
  }, [user]);

  const handleAction = async (donationId: string, status: 'accepted' | 'rejected') => {
    setActionLoading(`${donationId}-${status}`);
    try {
      await apiFetch(`/dashboard/request/${donationId}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setAllDonations(prev => prev.map(d => d._id === donationId ? { ...d, status } : d));
      setPendingReqs(prev => prev.filter(d => d._id !== donationId));
      if (selectedDonation?._id === donationId) setSelectedDonation(prev => prev ? { ...prev, status } : prev);
      setStats(prev => prev ? { ...prev, Pending_Donations: Math.max(0, prev.Pending_Donations - 1), Accepted_Donations: status === 'accepted' ? prev.Accepted_Donations + 1 : prev.Accepted_Donations, Rejected_Donations: status === 'rejected' ? prev.Rejected_Donations + 1 : prev.Rejected_Donations } : prev);
      showToast('success', status === 'accepted' ? 'تم قبول التبرع بنجاح' : 'تم رفض التبرع');
      
      // Dynamic API refetch to sync all analytics instantly and solve timing/caching issues
      await fetchAll();
    } catch (err: unknown) { showToast('error', translateError(err)); } finally { setActionLoading(null); }
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

  const scheduleAt = (targetDate: Date) => {
    if (schedulerTimer) clearTimeout(schedulerTimer);
    setNextRunTime(null);
    setSchedTargetDate(null);
    const delay = targetDate.getTime() - Date.now();
    if (delay <= 0) { showToast('error', 'الوقت المحدد في الماضي! اختر وقتاً مستقبلياً.'); return; }
    const label = targetDate.toLocaleString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    setNextRunTime(label);
    setSchedTargetDate(targetDate);
    try { localStorage.setItem('ap-cron-scheduled', JSON.stringify({ iso: targetDate.toISOString(), label })); } catch {}
    const timer = setTimeout(async () => { await handleReminder(); setNextRunTime(null); setSchedTargetDate(null); setSchedulerTimer(null); try { localStorage.removeItem('ap-cron-scheduled'); } catch {} }, delay);
    setSchedulerTimer(timer);
    showToast('success', `✓ تمت الجدولة في ${label}`);
  };

  const cancelSchedule = () => {
    if (schedulerTimer) clearTimeout(schedulerTimer);
    setSchedulerTimer(null); setNextRunTime(null); setSchedTargetDate(null);
    try { localStorage.removeItem('ap-cron-scheduled'); } catch {}
    showToast('success', 'تم إلغاء الجدولة');
  };
  const validateProfile = (): boolean => {
    const errs: SettingsErrors = {};
    if (user?.roleType === 'charity') {
      if (!profileForm.charityName.trim() || profileForm.charityName.trim().length < 3 || profileForm.charityName.trim().length > 30)
        errs.charityName = 'اسم الجمعية يجب أن يكون بين 3 و 30 حرفاً';
    } else {
      if (!nameRegex.test(profileForm.userName))
        errs.userName = 'الاسم: يبدأ بحرف عربي أو إنجليزي، 3-30 حرف، بدون رموز خاصة';
    }
    if (profileForm.phone && !phoneRegex.test(profileForm.phone))
      errs.phone = 'رقم الهاتف غير صالح — مثال: 01012345678';
    if (profileForm.address && (profileForm.address.trim().length < 5 || profileForm.address.trim().length > 100))
      errs.address = 'العنوان يجب أن يكون بين 5 و 100 حرف';
    setProfileErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validatePassword = (): boolean => {
    const errs: SettingsErrors = {};
    if (!passForm.oldPassword) errs.oldPassword = 'كلمة المرور الحالية مطلوبة';
    if (!passwordRegex.test(passForm.newPassword))
      errs.newPassword = 'يجب أن تحتوي على: حرف كبير، حرف صغير، رقم، و8 أحرف على الأقل';
    if (passForm.newPassword !== passForm.confirmPassword)
      errs.confirmPassword = 'كلمتا المرور غير متطابقتين';
    setPassErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const saveProfile = async () => {
    if (!validateProfile()) return;
    setSettingsSaving(true);
    try {
      await apiFetch('/users/profile', { method: 'PATCH', body: JSON.stringify({ userName: profileForm.userName, phone: profileForm.phone, address: profileForm.address }) });
      if (user?.roleType === 'charity' && charityProfileData?._id && profileForm.charityName.trim()) {
        await apiFetch(`/charity/${charityProfileData._id}`, { method: 'PATCH', body: JSON.stringify({ charityName: profileForm.charityName, address: profileForm.address }) });
        setCharityProfileData(p => p ? { ...p, charityName: profileForm.charityName } : p);
      }
      showToast('success', 'تم تحديث البيانات بنجاح ✓');
    } catch (err: unknown) { showToast('error', translateError(err)); }
    finally { setSettingsSaving(false); }
  };

  const savePassword = async () => {
    if (!validatePassword()) return;
    setSettingsSaving(true);
    try {
      await apiFetch('/users/changePassword', { method: 'PATCH', body: JSON.stringify({ oldPassword: passForm.oldPassword, newPassword: passForm.newPassword }) });
      setPassForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setPassErrors({});
      showToast('success', 'تم تغيير كلمة المرور بنجاح ✓');
    } catch (err: unknown) { showToast('error', translateError(err)); }
    finally { setSettingsSaving(false); }
  };

  const handleDeleteAccount = () => {
    setConfirmOpts({
      title: 'حذف الحساب نهائيًا',
      message: 'هذا الإجراء لا يمكن التراجع عنه. سيتم حذف حسابك وجميع بياناتك بشكل دائم.',
      confirmLabel: 'حذف حسابي نهائيًا',
      variant: 'danger',
      icon: 'ti-trash',
      onConfirm: async () => {
        setConfirmLoading(true);
        try {
          await apiFetch('/users/deleteAccount', { method: 'DELETE' });
          logout?.();
          setLocation('/login');
        } catch (err: unknown) {
          showToast('error', translateError(err));
        } finally {
          setConfirmLoading(false);
          setConfirmOpts(null);
        }
      }
    });
  };

  const handleLogout = () => {
    setConfirmOpts({
      title: 'تسجيل الخروج',
      message: 'هل أنت متأكد من تسجيل الخروج؟ سيتم إنهاء جلستك الحالية.',
      confirmLabel: 'تسجيل الخروج',
      variant: 'danger',
      icon: 'ti-logout',
      onConfirm: async () => {
        setConfirmLoading(true);
        try {
          logout?.();
          setLocation('/');
        } finally {
          setConfirmLoading(false);
          setConfirmOpts(null);
        }
      }
    });
  };

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await fetchAll();
      await fetchNotifications();
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  }, [isRefreshing, fetchAll, fetchNotifications]);

  // ── Derived Data (Preserved) ──
  const rejectedCount = stats ? stats.Rejected_Donations ?? Math.max(0, stats.Total_Donations - stats.Pending_Donations - stats.Accepted_Donations) : 0;
  const pieData = useMemo(() => {
    return [
      { name: 'قيد المراجعة', value: stats?.Pending_Donations || 0, color: CHART_COLORS.pending },
      { name: 'مقبول', value: stats?.Accepted_Donations || 0, color: CHART_COLORS.accepted },
      { name: 'مرفوض', value: rejectedCount, color: CHART_COLORS.rejected }
    ].filter(d => d.value > 0);
  }, [stats, rejectedCount]);
  const stackedData = useMemo(() => {
    const map: Record<string, { name: string; pending: number; accepted: number; rejected: number }> = {};
    allDonations.forEach(d => {
      const k = d.type || 'غير محدد';
      if (!map[k]) {
        map[k] = { name: k, pending: 0, accepted: 0, rejected: 0 };
      }
      const status = (d.status || '').toLowerCase();
      if (status === 'accepted') {
        map[k].accepted++;
      } else if (status === 'rejected') {
        map[k].rejected++;
      } else {
        map[k].pending++;
      }
    });
    return Object.values(map).slice(0, 6);
  }, [allDonations]);
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
      const count = allDonations.filter(d => {
        if (!d.createdAt) return false;
        const dt = new Date(d.createdAt);
        return !isNaN(dt.getTime()) && dt.getFullYear() === year && dt.getMonth() === month;
      }).length;
      return { month: label, count };
    });
  }, [allDonations]);
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

  const handlePageChange = (p: number) => {
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    const scrollable = document.querySelector('.ap-content');
    if (scrollable) scrollable.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── Filtered pending requests (search on requests tab) ──
  const filteredPendingReqs = useMemo(() => {
    const q = searchQ.trim().toLowerCase();
    if (!q) return pendingReqs;
    return pendingReqs.filter(d => {
      const donor = parseDonor(d.donorId);
      return (
        d.type.toLowerCase().includes(q) ||
        donor.name.toLowerCase().includes(q) ||
        d._id.toLowerCase().includes(q) ||
        (typeof d.donorId === 'string' ? d.donorId : (d.donorId as any)?._id || '').toLowerCase().includes(q)
      );
    });
  }, [pendingReqs, searchQ]);
  
  const charityName = charityProfileData?.charityName || user?.userName || 'الجمعية';
  const pendingCount = pendingReqs.length;

  // ── Render Guards ──
  if (selectedDonation) return (
    <div className={`ap-layout${isDark ? '' : ' ap-light-theme'}`} dir="rtl">
      {showReport && <ReportModal onClose={() => setShowReport(false)} />}
      <Sidebar activeTab={tab} onTabChange={(newTab: Tab) => { setSelectedDonation(null); setTab(newTab); }} userName={charityName} pendingCount={pendingCount} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(v => { localStorage.setItem('ap-sidebar-collapsed', String(!v)); return !v; })} onLogout={handleLogout} />
      <main className="ap-main">
        <header className="ap-page-header">
          <div className="ap-page-breadcrumb"><i className="ti ti-building-community" style={{color:'var(--teal)'}} /><span>لوحة التحكم</span><i className="ti ti-chevron-left" style={{fontSize:12,color:'var(--t4)'}} /><span style={{color:'var(--t3)'}} onClick={() => setSelectedDonation(null)} className="ap-breadcrumb-link">التبرعات</span><i className="ti ti-chevron-left" style={{fontSize:12,color:'var(--t4)'}} /><span style={{color:'var(--t1)',fontWeight:700}}>{selectedDonation.type}</span></div>
          <div className="ap-page-header-right">
            <div className="ap-header-live-badge"><span className="ap-live-dot" /><span className="ap-header-live-time">{liveTime}</span></div>
            <button className="ap-header-icon-btn" onClick={() => setShowReport(true)} title="تقديم بلاغ" style={{ color: 'var(--red, #ef4444)' }}><i className="ti ti-alert-octagon" /></button>
            <button className="ap-header-icon-btn" onClick={handleRefresh} title="تحديث البيانات" disabled={isRefreshing}><i className={`ti ti-refresh${isRefreshing ? ' ti-spin' : ''}`} /></button>
            <button className="ap-header-icon-btn ap-theme-btn" onClick={() => setIsDark(v => !v)}><i className={`ti ${isDark ? 'ti-sun' : 'ti-moon'}`} /></button>
            <button className="ap-header-icon-btn" onClick={() => setSelectedDonation(null)}><i className="ti ti-arrow-right" /></button>
          </div>
        </header>
        <div className="ap-content">
          <DonationDetail donation={selectedDonation as any} onBack={() => setSelectedDonation(null)} onAction={handleAction} actionLoading={actionLoading} />
        </div>
      </main>
      <MobileNav activeTab={tab} onTabChange={(newTab: Tab) => { setSelectedDonation(null); setTab(newTab); }} pendingCount={pendingCount} />
      {toast && <div className={`ap-toast ${toast.type}`}><i className={`ti ${toast.type==='success'?'ti-circle-check':'ti-alert-circle'}`} />{toast.text}</div>}

      <ConfirmModal opts={confirmOpts} loading={confirmLoading} onClose={() => { if (!confirmLoading) setConfirmOpts(null); }} />
    </div>
  );

  return (
    <div className={`ap-layout${isDark ? '' : ' ap-light-theme'}`} dir="rtl">
      {showReport && <ReportModal onClose={() => setShowReport(false)} />}
      <Sidebar activeTab={tab} onTabChange={setTab} userName={charityName} pendingCount={pendingCount} collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(v => { localStorage.setItem('ap-sidebar-collapsed', String(!v)); return !v; })} onLogout={handleLogout} />
      <main className={`ap-main${tab === 'chat' ? ' ap-main--ai' : ''}`}>
        {(loading || isRefreshing) && <div className="ap-top-loading-bar" />}
        {tab !== 'chat' && (
        <header className="ap-page-header">
          <div className="ap-page-header-left" style={{display:'flex',alignItems:'center',gap:12}}>
            <div className="ap-page-breadcrumb">
              <i className="ti ti-building-community" style={{color:'var(--teal)'}}/>
              <span>لوحة التحكم</span>
              <i className="ti ti-chevron-left" style={{fontSize:12,color:'var(--t4)'}}/>
              <span style={{color:'var(--t1)',fontWeight:700}}>
                {tab==='stats'?'نظرة عامة':tab==='donations'?'كل التبرعات':tab==='automation'?'التشغيل التلقائي':'الإعدادات'}
              </span>
            </div>
            <div className="ap-header-live-badge"><span className="ap-live-dot"/><span className="ap-header-live-time">{liveTime}</span></div>
          </div>
          <div className="ap-page-header-right">
            <button
              className="ap-header-icon-btn"
              onClick={() => setShowReport(true)}
              title="تقديم بلاغ"
              style={{ color: 'var(--red, #ef4444)' }}
            >
              <i className="ti ti-alert-octagon" />
            </button>
            <button
              className="ap-header-icon-btn"
              onClick={handleRefresh}
              title="تحديث البيانات"
              disabled={isRefreshing}
            >
              <i className={`ti ti-refresh${isRefreshing ? ' ti-spin' : ''}`} />
            </button>
            <button className="ap-header-icon-btn ap-theme-btn" onClick={() => setIsDark(v => !v)} title={isDark?'وضع نهاري':'وضع ليلي'}><i className={`ti ${isDark?'ti-sun':'ti-moon'}`}/></button>
            <NotificationBell
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkRead={handleMarkRead}
              onMarkAllRead={handleMarkAllRead}
              onDelete={handleDeleteNotif}
              loading={notifLoading}
            />
            <div className="ap-header-user" onClick={() => setTab('settings')} title="الإعدادات">
              <div className="ap-header-avatar">{charityName?.[0]?.toUpperCase()}</div>
              <span className="ap-header-username-text">{charityName}</span>
              <i className="ti ti-settings" style={{fontSize:13,color:'var(--t4)'}}/>
            </div>
          </div>
        </header>
        )}
        <div ref={contentRef} className={`ap-content${tab === 'chat' ? ' ap-content--ai' : ''}`}>
          {error && !loading && <div className="ap-error-banner"><i className="ti ti-alert-triangle" style={{color:'var(--amber)',fontSize:20}} /><div style={{flex:1}}><div style={{fontWeight:700,marginBottom:3,color:'var(--t1)'}}>حدث خطأ</div><div style={{fontSize:13,color:'var(--t3)'}}>{error}</div></div><button className="ap-retry-btn" onClick={fetchAll}><i className="ti ti-refresh" /> إعادة المحاولة</button></div>}

          {(authLoading || loading) ? <CharityPageSkeleton /> : (<>

          {/* ═══ STATS TAB ═══ */}
          {tab === 'stats' && <div className="ap-tab-pane">
            {/* KPI Grid */}
            <div className="ap-kpi-grid">
              {[
                { id: 'total', l: 'إجمالي التبرعات', v: stats?.Total_Donations || 0, i: 'ti-gift', c: '#0ec97f',
                  details: [
                    { label: 'معلقة', value: stats?.Pending_Donations || 0, icon: 'ti-clock-pause' },
                    { label: 'مقبولة', value: stats?.Accepted_Donations || 0, icon: 'ti-check' },
                    { label: 'مرفوضة', value: rejectedCount, icon: 'ti-x' },
                    { label: 'نسبة القبول', value: stats?.Total_Donations ? `${Math.round(((stats?.Accepted_Donations || 0) / stats.Total_Donations) * 100)}%` : '—', icon: 'ti-percentage' },
                  ]
                },
                { id: 'pending', l: 'قيد المراجعة', v: stats?.Pending_Donations || 0, i: 'ti-clock-pause', c: '#f59e0b',
                  details: [
                    { label: 'من الإجمالي', value: stats?.Total_Donations ? `${Math.round(((stats?.Pending_Donations || 0) / stats.Total_Donations) * 100)}%` : '—', icon: 'ti-percentage' },
                    { label: 'تحتاج مراجعة', value: stats?.Pending_Donations || 0, icon: 'ti-alert-circle' },
                  ]
                },
                { id: 'accepted', l: 'مقبولة', v: stats?.Accepted_Donations || 0, i: 'ti-shield-check', c: '#0ec97f',
                  details: [
                    { label: 'نسبة من الإجمالي', value: stats?.Total_Donations ? `${Math.round(((stats?.Accepted_Donations || 0) / stats.Total_Donations) * 100)}%` : '—', icon: 'ti-percentage' },
                    { label: 'تم القبول', value: stats?.Accepted_Donations || 0, icon: 'ti-circle-check' },
                  ]
                },
                { id: 'rejected', l: 'مرفوضة', v: rejectedCount, i: 'ti-shield-x', c: '#f04370',
                  details: [
                    { label: 'نسبة من الإجمالي', value: stats?.Total_Donations ? `${Math.round((rejectedCount / stats.Total_Donations) * 100)}%` : '—', icon: 'ti-percentage' },
                    { label: 'تم الرفض', value: rejectedCount, icon: 'ti-circle-x' },
                  ]
                },
              ].map(s => (
                <div key={s.id} className="ap-kpi-card" style={{ '--kpi-color': s.c } as React.CSSProperties}>
                  <div className="ap-kpi-icon-wrap"><i className={`ti ${s.i}`}/></div>
                  <div className="ap-kpi-value">{s.v.toLocaleString('en-US')}</div>
                  <div className="ap-kpi-label">{s.l}</div>
                  <button
                    className={`ap-kpi-more-btn${expandedKpi === s.id ? ' expanded' : ''}`}
                    onClick={() => setExpandedKpi(expandedKpi === s.id ? null : s.id)}
                  >
                    <i className="ti ti-chevron-down" />
                    {expandedKpi === s.id ? 'إخفاء' : 'عرض المزيد'}
                  </button>
                  <div className={`ap-kpi-expand${expandedKpi === s.id ? ' open' : ''}`}>
                    <div className="ap-kpi-expand-inner">
                      {s.details.map(d => (
                        <div key={d.label} className="ap-kpi-expand-row">
                          <span className="ap-kpi-expand-row-label"><i className={`ti ${d.icon}`} />{d.label}</span>
                          <span className="ap-kpi-expand-row-val">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Unified Dashboard Grid for natural card flow (no gaps!) */}
            <div className="ap-dashboard-grid">
              {/* Right Column (1fr) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
                {/* Pro area chart - التبرعات عبر الزمن */}
                <div className="ap-pro-chart-card">
                  <div className="ap-pro-chart-header">
                    <div className="ap-pro-chart-meta">
                      <div className="ap-pro-chart-value">{(stats?.Total_Donations || 0).toLocaleString('en-US')}</div>
                      <div className="ap-pro-chart-label"><i className="ti ti-trending-up" style={{color:'#0ec97f',marginLeft:4}}/>التبرعات الشهرية</div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <span className={`ap-chart-trend ${(() => {
                        const cur = timelineData[11]?.count ?? 0;
                        const prev = timelineData[10]?.count ?? 0;
                        return cur >= prev ? 'up' : 'down';
                      })()}`}>
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
                        content={<OverviewTooltip />}
                        cursor={{stroke:'rgba(14,201,127,0.55)',strokeWidth:1.5,strokeDasharray:'4 3'}}
                      />
                      <Area type="monotone" dataKey="count" name="التبرعات" stroke="#0ec97f" strokeWidth={2.5} fill="url(#gradDon)" dot={{fill:'#0ec97f',strokeWidth:0,r:3}} activeDot={{r:5,fill:'#0ec97f',stroke:'var(--surface)',strokeWidth:2}}/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Stacked bar chart - أنواع التبرعات */}
                <div className="ap-chart-card">
                  <div className="ap-chart-header">
                    <span className="ap-chart-title"><i className="ti ti-chart-bar" style={{color:'#3b82f6'}}/>أنواع التبرعات</span>
                  </div>
                  {stackedData.length > 0
                    ? <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={stackedData} margin={{top:8,right:8,left:-24,bottom:0}} barCategoryGap="30%">
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)"/>
                          <XAxis dataKey="name" tick={{fill:'var(--t2)',fontSize:11,fontFamily:'Tajawal'}} axisLine={false} tickLine={false}/>
                          <YAxis tick={{fill:'var(--t3)',fontSize:10}} axisLine={false} tickLine={false} allowDecimals={false}/>
                          <Tooltip
                            content={<DonationTypesTooltip />}
                            cursor={{fill:'rgba(255,255,255,0.04)'}}
                          />
                          <Legend wrapperStyle={{fontSize:11,fontFamily:'Tajawal',paddingTop:8}} formatter={(v) => <span style={{color:'var(--t2)'}}>{v}</span>}/>
                          <Bar dataKey="pending"  name="معلق"  fill="#f59e0b" radius={[4,4,0,0]} maxBarSize={32}/>
                          <Bar dataKey="accepted" name="مقبول" fill="#0ec97f" radius={[4,4,0,0]} maxBarSize={32}/>
                          <Bar dataKey="rejected" name="مرفوض" fill="#f04370" radius={[4,4,0,0]} maxBarSize={32}/>
                        </BarChart>
                      </ResponsiveContainer>
                    : <div className="ap-empty-state"><div className="ap-empty-icon"><i className="ti ti-inbox"/></div><div className="ap-empty-title">لا توجد بيانات</div></div>
                  }
                </div>
              </div>

              {/* Left Column (300px) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
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
                            content={<StatusDistributionTooltip />}
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
            </div>
          </div>}

          {/* ═══ DONATIONS & REQUESTS TABS ═══ */}
          {tab === 'donations' && <div className="ap-tab-pane">
            <div className="ap-section-header">
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div className="ap-section-title">
                  <i className="ti ti-clipboard-list" style={{color:'var(--teal)'}}/>
                  كل التبرعات
                  <span className="ap-count-badge" style={{background:'var(--teal)'}}>{filteredDonations.length}</span>
                </div>
                <div className="ap-view-switcher">
                  <button className={`ap-view-btn${donView==='table'?' active':''}`} onClick={() => setDonView('table')} title="جدول"><i className="ti ti-list"/></button>
                  <button className={`ap-view-btn${donView==='cards'?' active':''}`} onClick={() => setDonView('cards')} title="كروت"><i className="ti ti-layout-grid"/></button>
                </div>
              </div>
              <div className="ap-filters-bar">
                <div className="ap-filters-group">
                  <div className="ap-search-wrap">
                    <i className="ti ti-search ap-search-icon"/>
                    <input className="ap-search-input" placeholder="بحث بالمعرف، الاسم أو النوع..." value={searchQ} onChange={e => setSearchQ(e.target.value)}/>
                    {searchQ && <button className="ap-search-clear" onClick={() => setSearchQ('')}><i className="ti ti-x"/></button>}
                  </div>
                  <div className="ap-filter-tabs">
                    {(['all','pending','accepted','rejected'] as const).map(s => {
                      const count = s === 'all'
                        ? allDonations.length
                        : allDonations.filter(d => d.status === s).length;
                      const labelMap = { all: 'الكل', pending: 'قيد المراجعة', accepted: 'مقبول', rejected: 'مرفوض' };
                      return (
                        <button
                          key={s}
                          className={`ap-filter-tab ap-filter-tab--${s}${statusFilter===s?' active':''}`}
                          onClick={() => setStatusFilter(s)}
                        >
                          {labelMap[s]}
                          {count > 0 && (
                            <span className="ap-filter-badge">{count}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="ap-filters-group">
                  {/* Date Range */}
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
                      ><i className="ti ti-x"/></button>
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

                    {(searchQ || statusFilter !== 'all' || dateFrom || dateTo || sortOrder !== 'newest') && (
                      <button
                        className="ap-filter-reset-btn"
                        onClick={() => {
                          setSearchQ('');
                          setStatusFilter('all');
                          setDateFrom('');
                          setDateTo('');
                          setSortOrder('newest');
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
            </div>

            {filteredDonations.length === 0
              ? <div className="ap-empty-state"><div className="ap-empty-icon"><i className="ti ti-inbox"/></div><div className="ap-empty-title">لا توجد بيانات مطابقة</div><div className="ap-empty-desc">جرّب تغيير الفلتر أو البحث</div></div>
              : donView === 'cards'
                ? <div className="ap-card-grid">
                    {paginatedDonations.map(d => {
                      const sc = STATUS_CFG[d.status]; const donor = parseDonor(d.donorId); const img = d.imageUrl?.[0]?.secure_url; const busy = actionLoading === `${d._id}-accepted` || actionLoading === `${d._id}-rejected`;
                      return (
                        <div key={d._id} className="ap-entity-card cd-donation-card" onClick={() => setSelectedDonation(d)} style={{cursor:'pointer'}}>
                          {/* Card Header: image + type + status */}
                          <div className="ap-entity-card-header">
                            {img
                              ? <img src={img} style={{width:44,height:44,borderRadius:10,objectFit:'cover',flexShrink:0,border:'1px solid var(--border)'}} alt=""/>
                              : <div className="ap-entity-avatar charity" style={{width:44,height:44,flexShrink:0}}><i className="ti ti-gift"/></div>
                            }
                            <div style={{flex:1,minWidth:0}}>
                              <div className="ap-entity-name">{d.type}</div>
                              <div className="ap-entity-email">{donor.name !== '—' ? donor.name : <span style={{color:'var(--t4)',fontStyle:'italic'}}>غير معروف</span>}</div>
                            </div>
                            <span className="ap-badge" style={{background:sc.bg,color:sc.color,flexShrink:0}}><span className="ap-badge-dot" style={{background:sc.dot}}/>{sc.label}</span>
                          </div>

                          {/* Middle section grows to fill card */}
                          <div style={{flex:1,display:'flex',flexDirection:'column',gap:0}}>
                            {/* Details row */}
                            {(d.quantity != null || d.size || d.condition) && (
                              <div style={{display:'flex',gap:10,flexWrap:'wrap',margin:'8px 0 4px',fontSize:11.5,color:'var(--t3)'}}>
                                {d.quantity != null && (
                                  <span style={{display:'flex',alignItems:'center',gap:4}}>
                                    <i className="ti ti-package" style={{color:'var(--teal)',fontSize:12}}/>{d.quantity} قطعة
                                  </span>
                                )}
                                {d.size && (
                                  <span style={{display:'flex',alignItems:'center',gap:4}}>
                                    <i className="ti ti-ruler" style={{color:'var(--teal)',fontSize:12}}/>{d.size}
                                  </span>
                                )}
                                {d.condition && (
                                  <span style={{display:'flex',alignItems:'center',gap:4}}>
                                    <i className="ti ti-star" style={{color:'#f59e0b',fontSize:12}}/>{d.condition}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Address */}
                            {(donor.address !== '—' || (d as any).address) && (
                              <div style={{display:'flex',alignItems:'center',gap:5,fontSize:11.5,color:'var(--t3)',marginBottom:4}}>
                                <i className="ti ti-map-pin" style={{color:'#3b82f6',fontSize:12,flexShrink:0}}/>
                                <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                                  {donor.address !== '—' ? donor.address : (d as any).address}
                                </span>
                              </div>
                            )}

                            {/* Phone */}
                            {donor.phone !== '—' && (
                              <div style={{display:'flex',alignItems:'center',gap:5,fontSize:11.5,color:'var(--t3)',marginBottom:4}}>
                                <i className="ti ti-phone" style={{color:'var(--teal)',fontSize:12,flexShrink:0}}/>
                                <span>{donor.phone}</span>
                              </div>
                            )}
                          </div>

                          {/* Date + Actions always at bottom */}
                          <div className="ap-entity-date" style={{marginTop:'auto',marginBottom:10}}>
                            <i className="ti ti-calendar"/>{fmt12(d.createdAt)}
                          </div>

                          {/* Actions */}
                          <div className="ap-entity-actions" onClick={e => e.stopPropagation()}>
                            {d.status === 'pending' && <>
                              <button className="ap-action-btn approve" disabled={busy} onClick={() => handleAction(d._id,'accepted')}>
                                {actionLoading===`${d._id}-accepted`?<i className="ti ti-loader-2 ti-spin"/>:<><i className="ti ti-check"/>قبول</>}
                              </button>
                              <button className="ap-action-btn reject" disabled={busy} onClick={() => handleAction(d._id,'rejected')}>
                                {actionLoading===`${d._id}-rejected`?<i className="ti ti-loader-2 ti-spin"/>:<><i className="ti ti-x"/>رفض</>}
                              </button>
                            </>}
                            <button className="ap-card-eye-btn" onClick={() => setSelectedDonation(d)}><i className="ti ti-eye"/>تفاصيل</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                : <div className="ap-table-wrap">
                    <table className="ap-table">
                      <thead><tr><th>النوع</th><th>المتبرع</th><th>الكمية / المقاس</th><th>العنوان</th><th>الحالة</th><th>التاريخ</th><th>إجراء</th></tr></thead>
                      <tbody>
                        {paginatedDonations.map(d => {
                          const sc = STATUS_CFG[d.status]; const donor = parseDonor(d.donorId); const busy = actionLoading === `${d._id}-accepted` || actionLoading === `${d._id}-rejected`;
                          const donorAddress = donor.address !== '—' ? donor.address : (d as any).address || '—';
                          return (
                            <tr key={d._id} onClick={() => setSelectedDonation(d)} className="ap-table-row-clickable">
                              <td data-label="النوع" style={{fontWeight:600,color:'var(--t1)'}}>{d.type}</td>
                              <td data-label="المتبرع"><div style={{display:'flex',alignItems:'center',gap:8}}><div className="ap-table-avatar">{donor.initial}</div><div><div style={{fontWeight:600,color:'var(--t1)',fontSize:13}}>{donor.name}</div>{donor.phone !== '—' && <div style={{fontSize:11,color:'var(--t4)'}}>{donor.phone}</div>}</div></div></td>
                              <td data-label="الكمية / المقاس" style={{color:'var(--t2)',fontSize:12}}>{d.quantity ? `${d.quantity} قطعة` : '—'}{d.size ? <span style={{marginRight:6,color:'var(--t4)'}}>{d.size}</span> : ''}</td>
                              <td data-label="العنوان" style={{color:'var(--t3)',fontSize:12,maxWidth:140}}><div style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{donorAddress}</div></td>
                              <td data-label="الحالة"><span className="ap-badge" style={{background:sc.bg,color:sc.color}}><span className="ap-badge-dot" style={{background:sc.dot}}/>{sc.label}</span></td>
                              <td data-label="التاريخ" style={{color:'var(--t3)',fontSize:12}}>{fmt12(d.createdAt)}</td>
                              <td data-label="إجراء" onClick={e => e.stopPropagation()}>
                                <div style={{display:'flex',gap:6}}>
                                  {d.status === 'pending' && <>
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
            {tab === 'donations' && filteredDonations.length > 0 && (
              <div className="ap-pagination-container" style={{ direction: "rtl" }}>
                <span className="ap-pagination-info">
                  {filteredDonations.length > 0 ? `${(currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(currentPage * ITEMS_PER_PAGE, filteredDonations.length)} من ${filteredDonations.length}` : '0-0 من 0'}
                </span>
                <div className="ap-pagination-buttons">
                  <button
                    className="ap-pagination-btn"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1 || totalPages <= 1}
                    title="الصفحة الأولى"
                  >
                    »
                  </button>
                  <button
                    className="ap-pagination-btn prev-next"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || totalPages <= 1}
                  >
                    &lt; السابق
                  </button>
                  {Array.from({length:Math.min(5,totalPages)},(_,i) => {
                    let page: number;
                    if (totalPages <= 5) page = i + 1;
                    else if (currentPage <= 3) page = i + 1;
                    else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                    else page = currentPage - 2 + i;
                    return (
                      <button 
                        key={page} 
                        onClick={() => handlePageChange(page)}
                        disabled={totalPages <= 1}
                        className={`ap-pagination-btn page-num ${currentPage === page ? 'active' : ''}`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    className="ap-pagination-btn prev-next"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages <= 1}
                  >
                    التالي &gt;
                  </button>
                  <button
                    className="ap-pagination-btn"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages || totalPages <= 1}
                    title="الصفحة الأخيرة"
                  >
                    «
                  </button>
                </div>
              </div>
            )}
          </div>}

          {/* ═══ AUTOMATION TAB ═══ */}
          {tab === 'automation' && <div className="ap-tab-pane" style={{overflowY:'auto',overflowX:'hidden'}}>
            {/* Timeline Header with Live Clock */}
            <div className="ap-auto-timeline-header" style={{ marginBottom: 24 }}>
              <div className="ap-auto-clock"><i className="ti ti-clock-hour-4" /></div>
              <div className="ap-auto-timeline-info">
                <h3>التشغيل التلقائي</h3>
                <p>يمكنك تشغيل المهام يدويًا أو جدولتها في تاريخ وساعة محددة.</p>
              </div>
              <div className="ap-auto-live-clock-wrap">
                <LiveAutoClock />
              </div>
            </div>

            {/* Horizontal Stats Row - Takes less space, highly professional */}
            <div className="ap-cron-stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
              {[
                { icon:'ti-history',        color:'#0ec97f', value: cronLog.length,                        label:'عدد مرات التشغيل' },
                { icon:'ti-clock',          color:'#f59e0b', value: lastRun ? new Date(lastRun).toLocaleString('ar-EG',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',hour12:true}) : '—', label:'آخر تشغيل' },
                { icon:'ti-calendar-event', color:'#3b82f6', value: nextRunTime ? 'مجدول' : 'لا يوجد', label:'جدولة نشطة' },
              ].map((s, i) => (
                <div key={i} className="ap-cron-stat-vertical" style={{
                  background: 'var(--surface2)',
                  border: '1.5px solid var(--border)',
                  borderRadius: '16px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  transition: 'all 0.25s ease',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    background: `${s.color}14`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    color: s.color,
                    flexShrink: 0
                  }}>
                    <i className={`ti ${s.icon}`} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', textAlign: 'right' }}>
                    <span style={{ fontSize: '12px', color: 'var(--t4)', fontWeight: 600 }}>{s.label}</span>
                    <span style={{ fontSize: '15px', color: 'var(--t1)', fontWeight: 800 }}>{s.value}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Split Grid Layout — تذكير التبرعات (المدخلات) على اليمين وأزرار التحكم + سجل التنفيذ على اليسار */}
            <div className="ap-cron-split-layout">

              {/* Right Column: تذكير التبرعات (المدخلات وتفاصيل المهمة) */}
              <div className="ap-cron-right-col">
                <div className={`ap-cron-card${nextRunTime ? ' ap-cron-active' : ''}`} style={{ boxSizing: 'border-box', margin: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
                    <div className="ap-cron-icon" style={{background:'rgba(14,201,127,0.14)', margin: 0, width: 44, height: 44, borderRadius: 10, fontSize: 18}}>
                      <i className="ti ti-bell-ringing" style={{color:'#0ec97f'}}/>
                    </div>
                    <div>
                      <div className="ap-cron-title" style={{ fontSize: 15 }}>تذكير التبرعات</div>
                      <p className="ap-cron-desc" style={{ fontSize: 12.5 }}>يرسل تذكيرات للجمعية بالتبرعات المعلقة التي لم يتم تأكيدها.</p>
                    </div>
                  </div>
                  
                  <code className="ap-cron-code" style={{background:'rgba(14,201,127,0.08)',borderColor:'rgba(14,201,127,0.24)',color:'#0ec97f', marginTop: 4, marginBottom: 12}}>
                    GET /cron/donationReminder
                  </code>

                  <div className="ap-sched-picker" style={{ padding: 12, borderRadius: 12 }}>
                    <div className="ap-sched-picker-label" style={{ fontSize: 12, marginBottom: 4 }}>
                      <i className="ti ti-calendar-clock" style={{color:'#0ec97f'}}/> جدولة في تاريخ وساعة محددة
                    </div>
                    <div className="ap-sched-inputs" style={{ gap: 6 }}>
                      <div className="ap-sched-field">
                        <label style={{ fontSize: 10 }}>التاريخ</label>
                        <PremiumDatePicker
                          value={schedInput.date}
                          onChange={val => setSchedInput(p => ({...p, date: val}))}
                        />
                      </div>
                      <div className="ap-sched-field">
                        <label style={{ fontSize: 10 }}>الساعة</label>
                        <PremiumTimePicker
                          value={schedInput.time}
                          onChange={val => setSchedInput(p => ({...p, time: val}))}
                        />
                      </div>
                      <div className="ap-sched-field ap-sched-field-sm" style={{ maxWidth: 60 }}>
                        <label style={{ fontSize: 10 }}>الثواني</label>
                        <input type="number" className="ap-sched-input" value={schedInput.seconds} min="0" max="59" placeholder="00" style={{ padding: '6px 8px', fontSize: 12 }}
                          onChange={e => { const v = Math.max(0, Math.min(59, Number(e.target.value))); setSchedInput(p => ({...p, seconds: String(v).padStart(2,'0')})); }}/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Left Column: أزرار التحكم الفوري وسجل التنفيذ (مرفوع للأعلى لمنع Scroll) */}
              <div className="ap-cron-left-col" style={{ gap: 16 }}>
                
                {/* Actions & Buttons Panel */}
                <div className="ap-cron-card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 10 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--t2)' }}>حالة التشغيل التلقائي:</span>
                    <span className={`ap-auto-status-badge ${nextRunTime ? 'active' : 'inactive'}`} style={{ margin: 0, padding: '4px 10px', fontSize: 11.5 }}>
                      {nextRunTime ? 'مجدول' : 'غير نشط'}
                    </span>
                  </div>

                  {cronMessage && (
                    <div style={{
                      fontSize: 12,
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: cronMessage.includes('✅') ? 'rgba(14,201,127,0.1)' : 'rgba(240,72,112,0.1)',
                      color: cronMessage.includes('✅') ? '#0ec97f' : '#f04370',
                      border: `1px solid ${cronMessage.includes('✅') ? 'rgba(14,201,127,0.18)' : 'rgba(240,72,112,0.18)'}`,
                      width: '100%',
                      boxSizing: 'border-box'
                    }}>
                      {cronMessage}
                    </div>
                  )}

                  {nextRunTime && (
                    <div style={{ background: 'var(--surface2)', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5 }}>
                        <i className="ti ti-clock-play" style={{color:'#0ec97f'}}/>
                        <span>موعد التشغيل: <strong style={{color:'#0ec97f'}}>{nextRunTime}</strong></span>
                      </div>
                      <Countdown targetTs={schedTargetDate ? schedTargetDate.getTime() : null} color="#0ec97f" />
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                    {nextRunTime ? (
                      <button className="ap-sched-cancel-btn" onClick={cancelSchedule} style={{ flex: 1, justifyContent: 'center', padding: '9px 12px', borderRadius: 8, fontSize: 12.5, margin: 0 }}>
                        <i className="ti ti-x"/> إلغاء الجدولة
                      </button>
                    ) : (
                      <button className="ap-sched-confirm-btn" style={{ borderColor:'#0ec97f', color:'#0ec97f', flex: 1, justifyContent: 'center', padding: '9px 12px', borderRadius: 8, fontSize: 12.5, margin: 0 }}
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

                    <button className="ap-cron-run-btn" style={{ background:'#0ec97f', color:'#fff', flex: 1, justifyContent: 'center', padding: '9px 16px', borderRadius: 8, fontSize: 12.5, height: 38, border: 'none', margin: 0 }} disabled={cronLoading} onClick={handleReminder}>
                      {cronLoading ? <><i className="ti ti-loader-2 ti-spin"/>جاري التشغيل...</> : <><i className="ti ti-player-play"/>تشغيل الآن</>}
                    </button>
                  </div>
                </div>

                {/* Execution Log - Stays below buttons, highly compact */}
                <div className="ap-cron-log" style={{ margin: 0, width: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div className="ap-cron-log-header" style={{ padding: '10px 14px' }}>
                    <div className="ap-section-title" style={{margin:0, fontSize:13.5}}>
                      <i className="ti ti-list-details" style={{color:'#0ec97f'}}/>
                      سجل التنفيذ
                      <span className="ap-count-badge" style={{background:'#0ec97f'}}>{cronLog.length}</span>
                    </div>
                    {cronLog.length > 0 && (
                      <button className="ap-cron-log-clear" onClick={() => { setCronLog([]); try { localStorage.removeItem('ap-cron-log'); } catch {} }}>
                        <i className="ti ti-trash"/> مسح الكل
                      </button>
                    )}
                  </div>
                  <div className="ap-cron-log-list" style={{ flex: 1, maxHeight: '180px', overflowY: 'auto' }}>
                    {cronLog.length === 0 ? (
                      <div style={{textAlign:'center',padding:'20px 12px',color:'var(--t4)',fontSize:12.5,display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
                        <i className="ti ti-list-details" style={{fontSize:22,opacity:0.35}}/>
                        <span>لا توجد سجلات بعد — شغّل أو جدوِل مهمة أولاً</span>
                      </div>
                    ) : (
                      cronLog.map((log, i) => (
                        <div key={i} className={`ap-cron-log-item ${log.type}`} style={{display:'flex',alignItems:'center',gap:8,justifyContent:'space-between', padding: '6px 12px'}}>
                          <span style={{flex:1,fontSize:12.5}}>{log.type==='success'?'✓':'✗'} {log.text}</span>
                          <span style={{fontSize:10.5,color:'var(--t4)',flexShrink:0,whiteSpace:'nowrap'}}>{log.time}</span>
                          <button
                            title="حذف"
                            onClick={() => {
                              const updated = cronLog.filter((_, idx) => idx !== i);
                              setCronLog(updated);
                              try { localStorage.setItem('ap-cron-log', JSON.stringify(updated)); } catch {}
                            }}
                            style={{flexShrink:0,width:22,height:22,borderRadius:6,border:'1px solid var(--border)',background:'transparent',color:'var(--t4)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,transition:'all 0.15s'}}
                            onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background='rgba(239,68,68,0.1)';(e.currentTarget as HTMLButtonElement).style.color='#ef4444';(e.currentTarget as HTMLButtonElement).style.borderColor='rgba(239,68,68,0.3)';}}
                            onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background='transparent';(e.currentTarget as HTMLButtonElement).style.color='var(--t4)';(e.currentTarget as HTMLButtonElement).style.borderColor='var(--border)';}}
                          >
                            <i className="ti ti-x"/>
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>}

          {/* ═══ SETTINGS TAB ═══ */}
          {tab === 'settings' && <div className="ap-tab-pane">
            <div className="ap-section-header" style={{marginBottom:20}}>
              <div className="ap-section-title"><i className="ti ti-settings" style={{color:'var(--teal)'}}/>الإعدادات</div>
            </div>

            {/* ── Settings Layout: Sidebar (desktop) / Tabs (mobile) ── */}

            {/* Mobile: horizontal scrollable tabs */}
            <div className="cd-settings-mobile-tabs">
              {([
                { id:'profile',  icon:'ti-building-community', label: user?.roleType==='charity'?'الجمعية':'الملف', color:'#0ec97f' },
                { id:'password', icon:'ti-shield-lock',         label:'كلمة المرور', color:'#f04370' },
                { id:'license',  icon:'ti-shield-check',        label:'التوثيق',     color:'#3b82f6' },
                { id:'danger',   icon:'ti-alert-triangle',      label:'الخطر',       color:'#ef4444' },
              ] as const).map(item => (
                <button
                  key={item.id}
                  onClick={() => setSettingsTab(item.id)}
                  className={`cd-settings-mobile-tab${settingsTab===item.id?' active':''}`}
                  style={{
                    borderBottom: settingsTab===item.id ? `2px solid ${item.color}` : '2px solid transparent',
                    color: settingsTab===item.id ? item.color : 'var(--t3)',
                  } as React.CSSProperties}
                >
                  <i className={`ti ${item.icon}`}/>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            <div style={{display:'flex',gap:20,alignItems:'flex-start'}}>

              {/* Desktop: Sidebar Nav */}
              <div className="cd-settings-sidebar">
                {([
                  { id:'profile',  icon:'ti-building-community', label: user?.roleType==='charity'?'بيانات الجمعية':'الملف الشخصي', color:'#0ec97f' },
                  { id:'password', icon:'ti-shield-lock',         label:'كلمة المرور',      color:'#f04370' },
                  { id:'license',  icon:'ti-shield-check',        label:'الترخيص والتوثيق', color:'#3b82f6' },
                  { id:'danger',   icon:'ti-alert-triangle',      label:'منطقة الخطر',      color:'#ef4444' },
                ] as const).map(item => (
                  <button
                    key={item.id}
                    onClick={() => setSettingsTab(item.id)}
                    style={{
                      width:'100%',display:'flex',alignItems:'center',gap:9,padding:'10px 12px',
                      borderRadius:8,border:'none',cursor:'pointer',textAlign:'right' as const,
                      background: settingsTab===item.id ? `${item.color}14` : 'transparent',
                      color: settingsTab===item.id ? item.color : 'var(--t2)',
                      fontFamily:'Tajawal',fontSize:13,fontWeight: settingsTab===item.id ? 700 : 500,
                      transition:'all 0.18s',marginBottom:2,
                      borderRight: settingsTab===item.id ? `3px solid ${item.color}` : '3px solid transparent',
                    }}
                  >
                    <i className={`ti ${item.icon}`} style={{fontSize:15,color:item.color,flexShrink:0}}/>
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Settings Content Area */}
              <div style={{flex:1,minWidth:0}}>

              {/* ── Profile / Charity card ── */}
              {settingsTab === 'profile' && <div className="ap-settings-card">
                <div className="ap-settings-card-title">
                  <div className="ap-settings-icon" style={{background:'rgba(14,201,127,0.14)',color:'#0ec97f'}}>
                    <i className={`ti ${user?.roleType === 'charity' ? 'ti-building-community' : 'ti-user-circle'}`}/>
                  </div>
                  {user?.roleType === 'charity' ? 'بيانات الجمعية' : 'الملف الشخصي'}
                </div>

                {/* Identity Banner */}
                <div style={{display:'flex',gap:12,alignItems:'center',padding:'12px 14px',background:'var(--surface2)',borderRadius:10,marginBottom:6}}>
                  <div style={{width:44,height:44,borderRadius:12,background:'rgba(14,201,127,0.15)',color:'#0ec97f',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,fontWeight:800,flexShrink:0}}>
                    {(charityName || user?.userName || '?')?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div style={{fontWeight:800,fontSize:15,color:'var(--t1)'}}>{charityName || user?.userName}</div>
                    <div style={{fontSize:11.5,color:'var(--t3)'}}>{user?.email}</div>
                    <div style={{display:'flex',alignItems:'center',gap:4,marginTop:3}}>
                      <span style={{width:5,height:5,borderRadius:'50%',background: user?.verify ? '#0ec97f' : '#f59e0b',display:'inline-block'}}/>
                      <span style={{fontSize:10.5,color: user?.verify ? '#0ec97f' : '#f59e0b',fontWeight:700}}>{user?.verify ? 'موثق ✓' : 'قيد التوثيق'}</span>
                    </div>
                  </div>
                </div>

                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  {user?.roleType === 'charity' ? (
                    <>
                      <div className="ap-form-group">
                        <label className="ap-form-label">اسم الجمعية <span style={{color:'#ef4444'}}>*</span></label>
                        <input
                          className={`ap-form-input${profileErrors.charityName ? ' ap-input-error' : ''}`}
                          value={profileForm.charityName}
                          onChange={e => { setProfileForm(f => ({...f, charityName: e.target.value})); setProfileErrors(p => ({...p, charityName: ''})); }}
                          placeholder="اسم الجمعية"
                        />
                        {profileErrors.charityName && <div className="ap-field-error"><i className="ti ti-alert-circle"/>{profileErrors.charityName}</div>}
                      </div>
                    </>
                  ) : (
                    <div className="ap-form-group">
                      <label className="ap-form-label">اسم المستخدم <span style={{color:'#ef4444'}}>*</span></label>
                      <input
                        className={`ap-form-input${profileErrors.userName ? ' ap-input-error' : ''}`}
                        value={profileForm.userName}
                        onChange={e => { setProfileForm(f => ({...f, userName: e.target.value})); setProfileErrors(p => ({...p, userName: ''})); }}
                        placeholder="الاسم الكامل"
                      />
                      {profileErrors.userName && <div className="ap-field-error"><i className="ti ti-alert-circle"/>{profileErrors.userName}</div>}
                    </div>
                  )}
                  <div className="ap-form-group">
                    <label className="ap-form-label">البريد الإلكتروني</label>
                    <input className="ap-form-input" value={user?.email||''} disabled style={{opacity:0.6,cursor:'not-allowed'}}/>
                  </div>
                  <div className="ap-form-group">
                    <label className="ap-form-label">رقم الهاتف</label>
                    <input
                      className={`ap-form-input${profileErrors.phone ? ' ap-input-error' : ''}`}
                      value={profileForm.phone}
                      onChange={e => { setProfileForm(f => ({...f, phone: e.target.value})); setProfileErrors(p => ({...p, phone: ''})); }}
                      placeholder="01012345678"
                    />
                    {profileErrors.phone && <div className="ap-field-error"><i className="ti ti-alert-circle"/>{profileErrors.phone}</div>}
                  </div>
                  <div className="ap-form-group">
                    <label className="ap-form-label">العنوان</label>
                    <input
                      className={`ap-form-input${profileErrors.address ? ' ap-input-error' : ''}`}
                      value={profileForm.address}
                      onChange={e => { setProfileForm(f => ({...f, address: e.target.value})); setProfileErrors(p => ({...p, address: ''})); }}
                      placeholder="المدينة أو المنطقة"
                    />
                    {profileErrors.address && <div className="ap-field-error"><i className="ti ti-alert-circle"/>{profileErrors.address}</div>}
                  </div>
                  <button className="ap-action-btn approve" style={{alignSelf:'flex-start',padding:'8px 18px'}} disabled={settingsSaving} onClick={saveProfile}>
                    {settingsSaving ? <><i className="ti ti-loader-2 ti-spin"/>جاري الحفظ...</> : <><i className="ti ti-check"/>حفظ التغييرات</>}
                  </button>
                </div>
              </div>}

              {/* ── Password card ── */}
              {settingsTab === 'password' && <div className="ap-settings-card">
                <div className="ap-settings-card-title">
                  <div className="ap-settings-icon" style={{background:'rgba(240,67,112,0.14)',color:'#f04370'}}><i className="ti ti-shield-lock"/></div>
                  تغيير كلمة المرور
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  <div className="ap-form-group">
                    <label className="ap-form-label">كلمة المرور الحالية <span style={{color:'#ef4444'}}>*</span></label>
                    <input
                      className={`ap-form-input${passErrors.oldPassword ? ' ap-input-error' : ''}`}
                      type="password" value={passForm.oldPassword}
                      onChange={e => { setPassForm(f => ({...f,oldPassword:e.target.value})); setPassErrors(p => ({...p,oldPassword:''})); }}
                      placeholder="••••••••"
                    />
                    {passErrors.oldPassword && <div className="ap-field-error"><i className="ti ti-alert-circle"/>{passErrors.oldPassword}</div>}
                  </div>
                  <div className="ap-form-group">
                    <label className="ap-form-label">كلمة المرور الجديدة <span style={{color:'#ef4444'}}>*</span></label>
                    <input
                      className={`ap-form-input${passErrors.newPassword ? ' ap-input-error' : ''}`}
                      type="password" value={passForm.newPassword}
                      onChange={e => { setPassForm(f => ({...f,newPassword:e.target.value})); setPassErrors(p => ({...p,newPassword:''})); }}
                      placeholder="••••••••"
                    />
                    {passErrors.newPassword && <div className="ap-field-error"><i className="ti ti-alert-circle"/>{passErrors.newPassword}</div>}
                  </div>
                  <div className="ap-form-group">
                    <label className="ap-form-label">تأكيد كلمة المرور الجديدة <span style={{color:'#ef4444'}}>*</span></label>
                    <input
                      className={`ap-form-input${passErrors.confirmPassword ? ' ap-input-error' : ''}`}
                      type="password" value={passForm.confirmPassword}
                      onChange={e => { setPassForm(f => ({...f,confirmPassword:e.target.value})); setPassErrors(p => ({...p,confirmPassword:''})); }}
                      placeholder="••••••••"
                    />
                    {passErrors.confirmPassword && <div className="ap-field-error"><i className="ti ti-alert-circle"/>{passErrors.confirmPassword}</div>}
                  </div>
                  <div style={{fontSize:11.5,color:'var(--t4)',background:'var(--surface2)',borderRadius:8,padding:'8px 12px',lineHeight:1.7}}>
                    <i className="ti ti-info-circle" style={{marginLeft:4}}/>
                    حرف كبير + حرف صغير + رقم + 8 أحرف على الأقل
                  </div>
                  <button className="ap-action-btn edit" style={{alignSelf:'flex-start',padding:'8px 18px'}} disabled={settingsSaving} onClick={savePassword}>
                    {settingsSaving ? <><i className="ti ti-loader-2 ti-spin"/>جاري الحفظ...</> : <><i className="ti ti-key"/>تغيير كلمة المرور</>}
                  </button>
                </div>
              </div>}

              {/* ── License & Verification card ── */}
              {settingsTab === 'license' && <div className="ap-settings-card">
                <div className="ap-settings-card-title">
                  <div className="ap-settings-icon" style={{background:'rgba(59,130,246,0.14)',color:'#3b82f6'}}><i className="ti ti-shield-check"/></div>
                  بيانات الترخيص والتوثيق
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  {user?.roleType === 'charity' && (
                    <>
                      <div className="ap-form-group">
                        <label className="ap-form-label">رقم الترخيص الرسمي</label>
                        <input className="ap-form-input" value={(user as any)?.licenseNumber || 'غير متوفر'} disabled style={{opacity:0.65,cursor:'not-allowed',background:'var(--surface2)',fontFamily:'monospace'}}/>
                      </div>
                    </>
                  )}
                  <div className="ap-form-group">
                    <label className="ap-form-label">حالة التحقق والتوثيق</label>
                    <div style={{
                      display:'flex', alignItems:'center', gap:8,
                      background: (user as any)?.verify ? 'rgba(14,201,127,0.08)' : 'rgba(245,158,11,0.08)',
                      color: (user as any)?.verify ? '#0ec97f' : '#f59e0b',
                      padding:'10px 14px', borderRadius:9, fontSize:13, fontWeight:700,
                      border:`1px solid ${(user as any)?.verify ? 'rgba(14,201,127,0.22)' : 'rgba(245,158,11,0.22)'}`
                    }}>
                      <i className={`ti ${(user as any)?.verify ? 'ti-shield-check' : 'ti-shield-pause'}`} style={{fontSize:17}}/>
                      {(user as any)?.verify ? 'الحساب موثق رسميًا ✓' : 'في انتظار المراجعة والتوثيق'}
                    </div>
                  </div>
                  <div className="ap-form-group">
                    <label className="ap-form-label">معرّف الحساب</label>
                    <input className="ap-form-input" value={(user as any)?._id || '—'} disabled style={{opacity:0.65,cursor:'not-allowed',background:'var(--surface2)',fontFamily:'monospace',fontSize:11}}/>
                  </div>
                  <div className="ap-form-group">
                    <label className="ap-form-label">تاريخ التسجيل بالمنصة</label>
                    <input className="ap-form-input" value={(user as any)?.createdAt ? new Date((user as any).createdAt).toLocaleDateString('ar-EG', { year:'numeric', month:'long', day:'numeric' }) : '—'} disabled style={{opacity:0.65,cursor:'not-allowed',background:'var(--surface2)'}}/>
                  </div>
                </div>
              </div>}

              {/* ── Danger Zone card ── */}
              {settingsTab === 'danger' && <div className="ap-settings-card" style={{borderColor:'rgba(239,68,68,0.22)'}}>
                <div className="ap-settings-card-title" style={{color:'#ef4444'}}>
                  <div className="ap-settings-icon" style={{background:'rgba(239,68,68,0.12)',color:'#ef4444'}}><i className="ti ti-alert-triangle"/></div>
                  منطقة الخطر
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:12}}>

                  {/* تسجيل الخروج */}
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,padding:'12px 14px',background:'var(--surface2)',borderRadius:10,flexWrap:'wrap'}}>
                    <div>
                      <div style={{fontWeight:700,fontSize:13,color:'var(--t1)',marginBottom:3,display:'flex',alignItems:'center',gap:7}}>
                        <i className="ti ti-logout" style={{fontSize:15,color:'var(--t3)'}}/>تسجيل الخروج
                      </div>
                      <div style={{fontSize:12,color:'var(--t3)'}}>إنهاء الجلسة الحالية — يمكنك الدخول مجدداً في أي وقت</div>
                    </div>
                    <button
                      className="ap-action-btn edit"
                      style={{padding:'8px 16px',flexShrink:0,background:'transparent',borderColor:'var(--border)',color:'var(--t2)'}}
                      onClick={handleLogout}
                    >
                      <i className="ti ti-logout"/> تسجيل الخروج
                    </button>
                  </div>

                  {/* حذف الحساب */}
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,padding:'14px',background:'rgba(239,68,68,0.05)',border:'1px solid rgba(239,68,68,0.18)',borderRadius:10,flexWrap:'wrap'}}>
                    <div>
                      <div style={{fontWeight:700,fontSize:13,color:'#ef4444',marginBottom:3,display:'flex',alignItems:'center',gap:7}}>
                        <i className="ti ti-trash" style={{fontSize:15}}/>حذف الحساب نهائيًا
                      </div>
                      <div style={{fontSize:12,color:'var(--t3)',lineHeight:1.6}}>
                        هذا الإجراء <strong style={{color:'var(--t2)'}}>لا يمكن التراجع عنه</strong> — سيتم حذف حسابك
                        {user?.roleType === 'charity' ? ' وجميع بيانات الجمعية' : user?.roleType === 'admin' ? ' وصلاحياتك الإدارية' : ' وجميع تبرعاتك'} بشكل دائم.
                      </div>
                    </div>
                    <button
                      className="ap-action-btn reject"
                      style={{padding:'8px 16px',flexShrink:0}}
                      onClick={handleDeleteAccount}
                    >
                      <i className="ti ti-trash"/> حذف حسابي
                    </button>
                  </div>

                </div>
              </div>}

              </div>{/* end content area */}
            </div>{/* end settings layout */}
          </div>}

          {/* ═══ CHAT TAB ═══ */}
          {tab === 'chat' && (
            <div className="ap-chat-shell">
              <AIChatEmbed />
            </div>
          )}

          </>)}
        </div>
      </main>
      <MobileNav activeTab={tab} onTabChange={setTab} pendingCount={pendingCount} />
      {toast && <div className={`ap-toast ${toast.type}`}><i className={`ti ${toast.type==='success'?'ti-circle-check':'ti-alert-circle'}`} />{toast.text}</div>}

      <ConfirmModal opts={confirmOpts} loading={confirmLoading} onClose={() => { if (!confirmLoading) setConfirmOpts(null); }} />
    </div>
  );
}
