// import { useEffect, useState, useCallback, useMemo } from 'react';
// import { useAuth } from '../../contexts/AuthContext';
// import { useLocation } from 'wouter';
// import '../../styles/css/AdminPanel.css';
// import {
//   AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
//   Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
// } from 'recharts';
// import AIChatEmbed from '../../components/shared/AIChatEmbed';
// import { usersApi } from '../../services';
// import {
//   apiFetch, fetchPage,
//   User, Charity, Report, Tab, ApprovalStatus,
//   APPROVAL_CFG, ROLE_CFG,
//   TEAL2, AMBER, RED,
//   fmt,
// } from './adminTypes';

// type ViewMode = 'table' | 'cards';
// type ThemeMode = 'dark' | 'light';

// const NAV_ITEMS = [
//   { id: 'overview',   label: 'نظرة عامة',       icon: 'ti-layout-dashboard'    },
//   { id: 'users',      label: 'المستخدمون',       icon: 'ti-users'               },
//   { id: 'charities',  label: 'الجمعيات',          icon: 'ti-building-community'  },
//   { id: 'reports',    label: 'التقارير',          icon: 'ti-alert-circle'        },
//   { id: 'automation', label: 'التشغيل التلقائي', icon: 'ti-settings-automation' },
//   { id: 'settings',   label: 'الإعدادات',        icon: 'ti-settings'            },
//   { id: 'ai-chat',    label: 'مساعد الذكاء',     icon: 'ti-brain'               },
// ];

// // ─── Sidebar Component ────────────────────────────────────────────────────────
// function Sidebar({ activeTab, onTabChange, userName, onLogout, pendingCount, collapsed, onToggleCollapse }: {
//   activeTab: Tab;
//   onTabChange: (tab: Tab) => void;
//   userName: string;
//   onLogout: () => void;
//   pendingCount: number;
//   collapsed: boolean;
//   onToggleCollapse: () => void;
// }) {
//   return (
//     <aside className={`ap-sidebar${collapsed ? ' collapsed' : ''}`}>
//       <div className="ap-sidebar-brand">
//         <div className="ap-brand-icon">
//           <i className="ti ti-shield-check" />
//         </div>
//         {!collapsed && <span className="ap-brand-title">لوحة التحكم</span>}
//         <button
//           className="ap-collapse-btn"
//           onClick={onToggleCollapse}
//           title={collapsed ? 'توسيع الشريط' : 'طي الشريط'}
//         >
//           <i className={`ti ${collapsed ? 'ti-layout-sidebar-right-expand' : 'ti-layout-sidebar-right-collapse'}`} />
//         </button>
//       </div>

      

//       <nav className="ap-sidebar-nav">
//         {NAV_ITEMS.map(item => (
//           <button
//             key={item.id}
//             className={`ap-nav-item${activeTab === item.id ? ' active' : ''}`}
//             onClick={() => onTabChange(item.id as Tab)}
//             title={collapsed ? item.label : undefined}
//           >
//             <span className="ap-nav-icon-wrap">
//               <i className={`ti ${item.icon}`} />
//               {item.id === 'charities' && pendingCount > 0 && (
//                 <span className="ap-nav-badge">{pendingCount}</span>
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
//             <div className="ap-user-avatar">{userName?.slice(0, 1).toUpperCase()}</div>
//             <div className="ap-user-meta">
//               <span className="ap-user-name">{userName}</span>
//               <span className="ap-user-role">مسؤول النظام</span>
//             </div>
//             <i className="ti ti-settings" style={{ fontSize: 14, color: 'var(--t4)' }} />
//           </div>
//         )}
//         {collapsed && (
//           <button
//             className="ap-nav-item"
//             onClick={() => onTabChange('settings')}
//             title="الإعدادات"
//             style={{ justifyContent: 'center', padding: '10px 0' }}
//           >
//             <span className="ap-nav-icon-wrap">
//               <i className="ti ti-settings" />
//             </span>
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

// // ─── Mobile Bottom Nav ────────────────────────────────────────────────────────
// function MobileNav({ activeTab, onTabChange, pendingCount }: {
//   activeTab: Tab;
//   onTabChange: (tab: Tab) => void;
//   pendingCount: number;
// }) {
//   return (
//     <nav className="ap-mobile-nav">
//       {NAV_ITEMS.map(item => (
//         <button
//           key={item.id}
//           className={`ap-mobile-nav-item${activeTab === item.id ? ' active' : ''}`}
//           onClick={() => onTabChange(item.id as Tab)}
//         >
//           <span className="ap-nav-icon-wrap">
//             <i className={`ti ${item.icon}`} />
//             {item.id === 'charities' && pendingCount > 0 && (
//               <span className="ap-nav-badge">{pendingCount}</span>
//             )}
//           </span>
//           <span>{item.label}</span>
//         </button>
//       ))}
//     </nav>
//   );
// }

// // ─── View Toggle Component ──────────────────────────────────────────────────
// function ViewToggle({ mode, onChange }: { mode: ViewMode; onChange: (mode: ViewMode) => void }) {
//   return (
//     <div className="ap-view-switcher">
//       <button 
//         className={`ap-view-btn ${mode === 'table' ? 'active' : ''}`} 
//         onClick={() => onChange('table')}
//         title="عرض كجدول"
//       >
//         <i className="ti ti-list" />
//       </button>
//       <button 
//         className={`ap-view-btn ${mode === 'cards' ? 'active' : ''}`} 
//         onClick={() => onChange('cards')}
//         title="عرض ككروت"
//       >
//         <i className="ti ti-layout-grid" />
//       </button>
//     </div>
//   );
// }

// function StatusBadge({ status }: { status: string }) {
//   const cfg = APPROVAL_CFG[status as ApprovalStatus] ?? {
//     label: status, bg: '#1c2333', color: '#9aa5b9', dot: '#3d4a60',
//   };
//   return (
//     <span className="ap-badge" style={{ background: cfg.bg, color: cfg.color }}>
//       <span className="ap-badge-dot" style={{ background: cfg.dot }} />
//       {cfg.label}
//     </span>
//   );
// }

// function RoleBadge({ role }: { role: string }) {
//   const cfg = ROLE_CFG[role as keyof typeof ROLE_CFG] ?? {
//     label: role, bg: '#1c2333', color: '#9aa5b9', icon: '',
//   };
//   return (
//     <span className="ap-badge" style={{ background: cfg.bg, color: cfg.color }}>
//       {cfg.icon} {cfg.label}
//     </span>
//   );
// }

// function Toast({ msg }: { msg: { type: 'success' | 'error'; text: string } | null }) {
//   if (!msg) return null;
//   return (
//     <div className={`ap-toast ${msg.type}`}>
//       <i className={`ti ${msg.type === 'success' ? 'ti-circle-check' : 'ti-alert-circle'}`} />
//       {msg.text}
//     </div>
//   );
// }

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
//               {loading && <i className="ti ti-loader-2 ti-spin" />}
//               {opts.confirmLabel ?? 'تأكيد'}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function RejectModal({ target, loading, onClose, onConfirm }: {
//   target: { id: string; name: string } | null;
//   loading: boolean;
//   onClose: () => void;
//   onConfirm: (reason: string) => void;
// }) {
//   const [reason, setReason] = useState('');
//   useEffect(() => { if (target) setReason(''); }, [target]);
//   if (!target) return null;
//   return (
//     <div className="ap-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
//       <div className="ap-modal">
//         <div className="ap-modal-inner">
//           <div className="ap-modal-icon" style={{ background: RED + '22' }}>
//             <i className="ti ti-x" style={{ color: RED }} />
//           </div>
//           <h3 className="ap-modal-title">رفض جمعية "{target.name}"</h3>
//           <p className="ap-modal-msg">يمكنك تحديد سبب الرفض ليصل للجمعية بالبريد الإلكتروني.</p>
//           <div className="ap-form-group" style={{ marginBottom: 20 }}>
//             <label className="ap-form-label">سبب الرفض</label>
//             <textarea
//               className="ap-form-textarea"
//               rows={3}
//               value={reason}
//               onChange={e => setReason(e.target.value)}
//               placeholder="سبب الرفض (اختياري)"
//             />
//           </div>
//           <div className="ap-modal-actions">
//             <button className="ap-modal-cancel" onClick={onClose} disabled={loading}>إلغاء</button>
//             <button
//               className="ap-modal-confirm"
//               disabled={loading}
//               style={{ background: RED }}
//               onClick={() => onConfirm(reason)}
//             >
//               {loading && <i className="ti ti-loader-2 ti-spin" />}
//               تأكيد الرفض
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function EditCharityModal({ target, loading, setLoading, onClose, onSaved, showMsg }: {
//   target: Charity | null;
//   loading: string | null;
//   setLoading: (v: string | null) => void;
//   onClose: () => void;
//   onSaved: (id: string, form: { charityName: string; address: string; description: string }) => void;
//   showMsg: (type: 'success' | 'error', text: string) => void;
// }) {
//   const [form, setForm] = useState({ charityName: '', address: '', description: '' });
//   const [errors, setErrors] = useState<Record<string, string>>({});

//   useEffect(() => {
//     if (target) {
//       setForm({
//         charityName: target.charityName ?? '',
//         address: target.address ?? '',
//         description: target.description ?? '',
//       });
//       setErrors({});
//     }
//   }, [target]);

//   if (!target) return null;

//   const validate = () => {
//     const e: Record<string, string> = {};
//     if (!form.charityName.trim() || form.charityName.trim().length < 3)
//       e.charityName = 'اسم الجمعية يجب أن يكون 3 أحرف على الأقل';
//     if (!form.address.trim() || form.address.trim().length < 5)
//       e.address = 'العنوان يجب أن يكون 5 أحرف على الأقل';
//     return e;
//   };

//   const isBusy = loading === 'edit-' + target._id;
//   const changed =
//     form.charityName  !== (target.charityName  ?? '') ||
//     form.address      !== (target.address      ?? '') ||
//     form.description  !== (target.description  ?? '');

//   const handleSave = async () => {
//     const e = validate();
//     if (Object.keys(e).length) { setErrors(e); return; }
//     setLoading('edit-' + target._id);
//     try {
//       await apiFetch(`/charity/${target._id}`, {
//         method: 'PATCH',
//         body: JSON.stringify({
//           charityName: form.charityName.trim(),
//           address: form.address.trim(),
//           description: form.description.trim(),
//         }),
//       });
//       onSaved(target._id, form);
//       showMsg('success', `تم تحديث "${form.charityName}" بنجاح`);
//       onClose();
//     } catch (err: unknown) {
//       showMsg('error', (err instanceof Error ? err.message : null) || 'فشل التحديث');
//     } finally { setLoading(null); }
//   };

//   return (
//     <div className="ap-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
//       <div className="ap-modal">
//         <div className="ap-modal-inner">
//           <div className="ap-modal-icon" style={{ background: TEAL2 + '22' }}>
//             <i className="ti ti-edit" style={{ color: TEAL2 }} />
//           </div>
//           <h3 className="ap-modal-title">تعديل بيانات الجمعية</h3>
//           <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>
//             <div className="ap-form-group">
//               <label className="ap-form-label">
//                 اسم الجمعية <span style={{ color: RED }}>*</span>
//               </label>
//               <input
//                 className={`ap-form-input${errors.charityName ? ' error' : ''}`}
//                 value={form.charityName}
//                 onChange={e => {
//                   setForm(f => ({ ...f, charityName: e.target.value }));
//                   setErrors(er => ({ ...er, charityName: '' }));
//                 }}
//                 placeholder="اسم الجمعية"
//               />
//               {errors.charityName && (
//                 <div className="ap-form-err">
//                   <i className="ti ti-alert-circle" />{errors.charityName}
//                 </div>
//               )}
//             </div>
//             <div className="ap-form-group">
//               <label className="ap-form-label">
//                 العنوان <span style={{ color: RED }}>*</span>
//               </label>
//               <input
//                 className={`ap-form-input${errors.address ? ' error' : ''}`}
//                 value={form.address}
//                 onChange={e => {
//                   setForm(f => ({ ...f, address: e.target.value }));
//                   setErrors(er => ({ ...er, address: '' }));
//                 }}
//                 placeholder="عنوان الجمعية"
//               />
//               {errors.address && (
//                 <div className="ap-form-err">
//                   <i className="ti ti-alert-circle" />{errors.address}
//                 </div>
//               )}
//             </div>
//             <div className="ap-form-group">
//               <label className="ap-form-label">
//                 الوصف{' '}
//                 <span style={{ fontSize: 11, color: 'var(--t4)', fontWeight: 400 }}>(اختياري)</span>
//               </label>
//               <textarea
//                 className="ap-form-textarea"
//                 rows={3}
//                 value={form.description}
//                 onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
//                 placeholder="وصف مختصر عن الجمعية..."
//               />
//             </div>
//           </div>
//           <div className="ap-info-box" style={{ marginBottom: 18 }}>
//             <div className="ap-info-row">
//               <span className="lbl">البريد الإلكتروني:</span>
//               <span className="val">{target.email}</span>
//             </div>
//             <div className="ap-info-row">
//               <span className="lbl">حالة الجمعية:</span>
//               <span className="val"><StatusBadge status={target.approvalStatus} /></span>
//             </div>
//             {target.licenseNumber && (
//               <div className="ap-info-row">
//                 <span className="lbl">رقم الترخيص:</span>
//                 <span className="val">{target.licenseNumber}</span>
//               </div>
//             )}
//           </div>
//           <div className="ap-modal-actions">
//             <button className="ap-modal-cancel" onClick={onClose} disabled={isBusy}>إلغاء</button>
//             <button
//               className="ap-modal-confirm"
//               disabled={isBusy || !changed}
//               style={{ background: TEAL2 }}
//               onClick={handleSave}
//             >
//               {isBusy && <i className="ti ti-loader-2 ti-spin" />}
//               {isBusy ? 'جاري الحفظ...' : 'حفظ التغييرات'}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function PageSkeleton() {
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
//     </div>
//   );
// }

// function DetailRow({ icon, label, value, mono, danger }: {
//   icon: string; label: string; value: string; mono?: boolean; danger?: boolean;
// }) {
//   return (
//     <div className="ap-detail-row">
//       <div className="ap-detail-row-icon"><i className={`ti ${icon}`} /></div>
//       <span className="ap-detail-row-label">{label}</span>
//       <span className={`ap-detail-row-val${mono ? ' mono' : ''}${danger ? ' danger' : ''}`}>
//         {value}
//       </span>
//     </div>
//   );
// }

// function EmptyState({ icon, title, desc }: { icon: string; title: string; desc?: string }) {
//   return (
//     <div className="ap-empty-state">
//       <div className="ap-empty-icon"><i className={`ti ${icon}`} /></div>
//       <div className="ap-empty-title">{title}</div>
//       {desc && <div className="ap-empty-desc">{desc}</div>}
//     </div>
//   );
// }

// function ErrorBanner({ msg, onRetry }: { msg: string; onRetry: () => void }) {
//   return (
//     <div className="ap-error-banner">
//       <i className="ti ti-alert-triangle" style={{ color: AMBER, fontSize: 20, flexShrink: 0 }} />
//       <div style={{ flex: 1 }}>
//         <div style={{ fontWeight: 700, marginBottom: 3, color: 'var(--t1)' }}>حدث خطأ</div>
//         <div style={{ fontSize: 13, color: 'var(--t3)' }}>{msg}</div>
//       </div>
//       <button className="ap-retry-btn" onClick={onRetry}>
//         <i className="ti ti-refresh" /> إعادة المحاولة
//       </button>
//     </div>
//   );
// }

// function SectionTitle({ icon, color, title, badge }: {
//   icon: string; color: string; title: string; badge?: number;
// }) {
//   return (
//     <div className="ap-section-title">
//       <i className={`ti ${icon}`} style={{ color }} />
//       {title}
//       {badge !== undefined && (
//         <span className="ap-count-badge" style={{ background: color }}>{badge}</span>
//       )}
//     </div>
//   );
// }

// function SearchBox({ value, onChange, placeholder }: {
//   value: string;
//   onChange: (v: string) => void;
//   placeholder?: string;
// }) {
//   return (
//     <div className="ap-search-wrap">
//       <i className="ti ti-search ap-search-icon" />
//       <input
//         className="ap-search-input"
//         value={value}
//         onChange={e => onChange(e.target.value)}
//         placeholder={placeholder ?? 'بحث...'}
//       />
//       {value && (
//         <button className="ap-search-clear" onClick={() => onChange('')}>
//           <i className="ti ti-x" />
//         </button>
//       )}
//     </div>
//   );
// }

// function LoadMoreBtn({ loading, remaining, onClick }: {
//   loading: boolean; remaining: number; onClick: () => void;
// }) {
//   return (
//     <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
//       <button className="ap-load-more-btn" onClick={onClick} disabled={loading}>
//         {loading
//           ? <><i className="ti ti-loader-2 ti-spin" /> جاري التحميل...</>
//           : <>تحميل المزيد {remaining > 0 && `(${remaining})`}</>
//         }
//       </button>
//     </div>
//   );
// }

// function KpiCard({ icon, label, value, change, changeDir, color }: {
//   icon: string; label: string; value: string | number;
//   change?: string; changeDir?: 'up' | 'down' | 'neutral'; color: string;
// }) {
//   return (
//     <div className="ap-kpi-card" style={{ '--kpi-color': color } as React.CSSProperties}>
//       <div className="ap-kpi-icon-wrap"><i className={`ti ${icon}`} /></div>
//       <div className="ap-kpi-value">{value}</div>
//       <div className="ap-kpi-label">{label}</div>
//       {change && (
//         <div className={`ap-kpi-change ${changeDir ?? 'neutral'}`}>{change}</div>
//       )}
//     </div>
//   );
// }

// function ChartTooltip({ active, payload, label }: {
//   active?: boolean;
//   payload?: { value: number; name: string }[];
//   label?: string;
// }) {
//   if (!active || !payload?.length) return null;
//   return (
//     <div className="ap-chart-tooltip">
//       <div className="ap-chart-tooltip-label">{label}</div>
//       {payload.map((p, i) => (
//         <div key={i} className="ap-chart-tooltip-row">
//           <span>{p.name}</span>
//           <span style={{ fontWeight: 700 }}>{p.value.toLocaleString('en-US')}</span>
//         </div>
//       ))}
//     </div>
//   );
// }

// function CronCard({ icon, iconBg, iconColor, title, desc, code, codeBg, codeBorder, codeColor, loading, btnColor, onRun }: {
//   icon: string; iconBg: string; iconColor: string;
//   title: string; desc: string; code: string;
//   codeBg: string; codeBorder: string; codeColor: string;
//   loading: boolean; btnColor: string; onRun: () => void;
// }) {
//   return (
//     <div className="ap-cron-card">
//       <div className="ap-cron-icon" style={{ background: iconBg }}>
//         <i className={`ti ${icon}`} style={{ color: iconColor }} />
//       </div>
//       <div className="ap-cron-title">{title}</div>
//       <p className="ap-cron-desc">{desc}</p>
//       <code className="ap-cron-code" style={{ background: codeBg, borderColor: codeBorder, color: codeColor }}>
//         {code}
//       </code>
//       <button
//         className="ap-cron-run-btn"
//         style={{ background: btnColor }}
//         disabled={loading}
//         onClick={onRun}
//       >
//         {loading
//           ? <><i className="ti ti-loader-2 ti-spin" />جاري التشغيل...</>
//           : <><i className="ti ti-player-play" />تشغيل الآن</>
//         }
//       </button>
//     </div>
//   );
// }

// export default function AdminPanel() {
//   const { user, logout } = useAuth();
//   const [, navigate] = useLocation();
//   const [tab, setTab] = useState<Tab>('overview');

//   // ─── View Modes State ──────────────────────────────────────────────────────
//   const [usersViewMode, setUsersViewMode] = useState<ViewMode>('table');
//   const [charitiesViewMode, setCharitiesViewMode] = useState<ViewMode>('cards');
//   const [reportsViewMode, setReportsViewMode] = useState<ViewMode>('cards');

//   // ─── Theme Mode Logic ──────────────────────────────────────────────────────
//   const [theme, setTheme] = useState<ThemeMode>(() => {
//     try {
//       return (localStorage.getItem('ap-theme') as ThemeMode) || 'light';
//     } catch { return 'dark'; }
//   });

//   useEffect(() => {
//     try {
//       localStorage.setItem('ap-theme', theme);
//       // تحديث كلاس الـ body لتطبيق الستايل على كامل الصفحة
//       if (theme === 'light') {
//         document.body.classList.add('ap-light-theme');
//       } else {
//         document.body.classList.remove('ap-light-theme');
//       }
//     } catch { /* ignore */ }
//   }, [theme]);

//   const toggleTheme = () => {
//     setTheme(prev => prev === 'dark' ? 'light' : 'dark');
//   };

//   const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
//     try {
//       return localStorage.getItem('ap-sidebar-collapsed') === 'true';
//     } catch { return false; }
//   });

//   const handleToggleSidebar = () => {
//     setSidebarCollapsed(v => {
//       const next = !v;
//       try { localStorage.setItem('ap-sidebar-collapsed', String(next)); } catch { /* ignore */ }
//       return next;
//     });
//   };

//   const [users,      setUsers]     = useState<User[]>([]);
//   const [charities, setCharities] = useState<Charity[]>([]);
//   const [reports,    setReports]   = useState<Report[]>([]);

//   const [usersTotal,      setUsersTotal]     = useState(0);
//   const [charitiesTotal, setCharitiesTotal] = useState(0);
//   const [reportsTotal,    setReportsTotal]   = useState(0);

//   const [usersPage,      setUsersPage]     = useState(1);
//   const [charitiesPage, setCharitiesPage] = useState(1);
//   const [reportsPage,    setReportsPage]   = useState(1);

//   const [hasMoreUsers,       setHasMoreUsers]       = useState(false);
//   const [hasMoreCharities,   setHasMoreCharities]   = useState(false);
//   const [hasMoreReports,     setHasMoreReports]     = useState(false);
//   const [charitiesRemaining, setCharitiesRemaining] = useState(0);
//   const [loadingMore,        setLoadingMore]        = useState<string | null>(null);

//   const [loading,       setLoading]       = useState(true);
//   const [error,         setError]         = useState<string | null>(null);
//   const [actionLoading, setActionLoading] = useState<string | null>(null);
//   const [toast,         setToast]         = useState<{ type: 'success' | 'error'; text: string } | null>(null);
//   const [confirmOpts,   setConfirmOpts]   = useState<ConfirmState | null>(null);
//   const [confirmLoading,setConfirmLoading]= useState(false);
//   const [rejectTarget,  setRejectTarget]  = useState<{ id: string; name: string } | null>(null);
//   const [rejectLoading, setRejectLoading] = useState(false);
//   const [editCharityTarget,  setEditCharityTarget]  = useState<Charity | null>(null);
//   const [userDetailModal,    setUserDetailModal]    = useState<User | null>(null);
//   const [reportModal,        setReportModal]        = useState<Report | null>(null);
//   const [charityDetailModal, setCharityDetailModal] = useState<Charity | null>(null);

//   const [usersSearch,     setUsersSearch]     = useState('');
//   const [charitiesSearch, setCharitiesSearch] = useState('');
//   const [reportsSearch,   setReportsSearch]   = useState('');
//   const [charitiesFilter, setCharitiesFilter] = useState<string>('all');

//   const [cronLoading, setCronLoading] = useState({ reminder: false, report: false });
//   const [cronLog, setCronLog]         = useState<{ type: 'success' | 'error'; text: string; time: string }[]>([]);
//   const [lastRun, setLastRun]         = useState<string | null>(null);

//   useEffect(() => {
//     const tick = () => {
//       const el = document.getElementById('ap-clock');
//       if (el) {
//         el.textContent = new Date().toLocaleTimeString('ar-EG', {
//           hour: '2-digit', minute: '2-digit',
//         });
//       }
//     };
//     tick();
//     const id = setInterval(tick, 30_000);
//     return () => clearInterval(id);
//   }, []);

//   const showMsg = useCallback((type: 'success' | 'error', text: string) => {
//     setToast({ type, text });
//     setTimeout(() => setToast(null), 3500);
//   }, []);

//   const loadData = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     setUsersPage(1);
//     setCharitiesPage(1);
//     setReportsPage(1);

//     try {
//       const [uRes, cRes, rRes] = await Promise.allSettled([
//         fetchPage<User>('/users', 1, 10),
//         fetchPage<Charity>('/charity/charities', 1, 10),
//         fetchPage<Report>('/report/allReports', 1, 10),
//       ]);

//       if (uRes.status === 'fulfilled') {
//         setUsers(uRes.value.data ?? []);
//         setUsersTotal(uRes.value.total ?? 0);
//         setHasMoreUsers(uRes.value.hasMore ?? false);
//       }
//       if (cRes.status === 'fulfilled') {
//         setCharities(cRes.value.data ?? []);
//         setCharitiesTotal(cRes.value.total ?? 0);
//         setHasMoreCharities(cRes.value.hasMore ?? false);
//         setCharitiesRemaining(
//           Math.max(0, (cRes.value.total ?? 0) - (cRes.value.data?.length ?? 0))
//         );
//       }
//       if (rRes.status === 'fulfilled') {
//         setReports(rRes.value.data ?? []);
//         setReportsTotal(rRes.value.total ?? 0);
//         setHasMoreReports(rRes.value.hasMore ?? false);
//       }

//       const failures = [uRes, cRes, rRes].filter(r => r.status === 'rejected') as PromiseRejectedResult[];
//       if (failures.length === 3) {
//         throw new Error((failures[0].reason instanceof Error ? failures[0].reason.message : null) || 'فشل تحميل البيانات');
//       }
//     } catch (e: unknown) {
//       const status = (e as { status?: number })?.status;
//       if (status === 401) {
//         setTimeout(() => logout?.(), 1500);
//       }
//       setError((e instanceof Error ? e.message : null) || 'فشل تحميل البيانات');
//     } finally {
//       setLoading(false);
//     }
//   }, [logout]);

//   useEffect(() => { loadData(); }, [loadData]);

//   const loadMoreUsers = async () => {
//     const next = usersPage + 1;
//     setLoadingMore('users');
//     try {
//       const res = await fetchPage<User>('/users', next, 10);
//       if (!res.data?.length) { setHasMoreUsers(false); return; }
//       setUsers(prev => {
//         const ids = new Set(prev.map(u => u._id));
//         return [...prev, ...res.data.filter(u => !ids.has(u._id))];
//       });
//       setUsersPage(next);
//       setHasMoreUsers(res.hasMore ?? false);
//     } finally { setLoadingMore(null); }
//   };

//   const loadMoreCharities = async () => {
//     const next = charitiesPage + 1;
//     setLoadingMore('charities');
//     try {
//       const res = await fetchPage<Charity>('/charity/charities', next, 10);
//       if (!res.data?.length) { setHasMoreCharities(false); return; }
//       setCharities(prev => {
//         const ids = new Set(prev.map(c => c._id));
//         return [...prev, ...res.data.filter(c => !ids.has(c._id))];
//       });
//       setCharitiesPage(next);
//       setHasMoreCharities(res.hasMore ?? false);
//       setCharitiesRemaining(Math.max(0, (res.total ?? 0) - (charities.length + res.data.length)));
//     } finally { setLoadingMore(null); }
//   };

//   const loadMoreReports = async () => {
//     const next = reportsPage + 1;
//     setLoadingMore('reports');
//     try {
//       const res = await fetchPage<Report>('/report/allReports', next, 10);
//       if (!res.data?.length) { setHasMoreReports(false); return; }
//       setReports(prev => {
//         const ids = new Set(prev.map(r => r._id));
//         return [...prev, ...res.data.filter(r => !ids.has(r._id))];
//       });
//       setReportsPage(next);
//       setHasMoreReports(res.hasMore ?? false);
//     } finally { setLoadingMore(null); }
//   };

//   const handleDeleteUser = (id: string, name: string) => {
//     setConfirmOpts({
//       title: `حذف المستخدم "${name}"`,
//       message: 'هذا الإجراء لا يمكن التراجع عنه. سيتم حذف الحساب نهائيًا.',
//       confirmLabel: 'حذف', variant: 'danger', icon: 'ti-user-off',
//       onConfirm: async () => {
//         setConfirmLoading(true);
//         try {
//           await apiFetch(`/users/${id}`, { method: 'DELETE' });
//           setUsers(prev => prev.filter(u => u._id !== id));
//           showMsg('success', `تم حذف "${name}" بنجاح`);
//         } catch (e: unknown) {
//           showMsg('error', (e instanceof Error ? e.message : null) || 'فشل الحذف');
//         } finally { setConfirmLoading(false); setConfirmOpts(null); }
//       },
//     });
//   };

//   const handleApprove = async (id: string, name: string) => {
//     setActionLoading('approve-' + id);
//     try {
//       await apiFetch(`/charity/${id}/approve`, { method: 'PATCH' });
//       setCharities(prev =>
//         prev.map(c => c._id === id ? { ...c, approvalStatus: 'approved' as ApprovalStatus } : c)
//       );
//       showMsg('success', `تمت الموافقة على "${name}"`);
//     } catch (e: unknown) {
//       showMsg('error', (e instanceof Error ? e.message : null) || 'فشلت الموافقة');
//     } finally { setActionLoading(null); }
//   };

//   const handleReject = async (reason: string) => {
//     if (!rejectTarget) return;
//     setRejectLoading(true);
//     try {
//       await apiFetch(`/charity/${rejectTarget.id}/reject`, {
//         method: 'PATCH',
//         body: JSON.stringify({ rejectionReason: reason }),
//       });
//       setCharities(prev =>
//         prev.map(c =>
//           c._id === rejectTarget.id ? { ...c, approvalStatus: 'rejected' as ApprovalStatus } : c
//         )
//       );
//       showMsg('success', `تم رفض "${rejectTarget.name}"`);
//     } catch (e: unknown) {
//       showMsg('error', (e instanceof Error ? e.message : null) || 'فشل الرفض');
//     } finally { setRejectLoading(false); setRejectTarget(null); }
//   };

//   const handleDeleteCharity = (id: string, name: string) => {
//     setConfirmOpts({
//       title: `حذف جمعية "${name}"`,
//       message: 'هذا الإجراء لا يمكن التراجع عنه.',
//       confirmLabel: 'حذف', variant: 'danger', icon: 'ti-building-off',
//       onConfirm: async () => {
//         setConfirmLoading(true);
//         try {
//           await apiFetch(`/charity/${id}`, { method: 'DELETE' });
//           setCharities(prev => prev.filter(c => c._id !== id));
//           showMsg('success', `تم حذف "${name}" بنجاح`);
//         } catch (e: unknown) {
//           showMsg('error', (e instanceof Error ? e.message : null) || 'فشل الحذف');
//         } finally { setConfirmLoading(false); setConfirmOpts(null); }
//       },
//     });
//   };

//   const runDonationReminder = async () => {
//     setCronLoading(p => ({ ...p, reminder: true }));
//     const time = new Date().toLocaleTimeString('ar-EG');
//     try {
//       await apiFetch('/cron/donationReminder');
//       setCronLog(p => [{ type: 'success', text: 'تذكير التبرعات: تم التشغيل بنجاح', time }, ...p]);
//       setLastRun(new Date().toISOString());
//       showMsg('success', 'تم تشغيل تذكير التبرعات');
//     } catch (e: unknown) {
//       const msg = (e instanceof Error ? e.message : null) || 'فشل';
//       setCronLog(p => [{ type: 'error', text: `تذكير التبرعات: ${msg}`, time }, ...p]);
//       showMsg('error', 'فشل تشغيل التذكير');
//     } finally { setCronLoading(p => ({ ...p, reminder: false })); }
//   };

//   const runAdminReport = async () => {
//     setCronLoading(p => ({ ...p, report: true }));
//     const time = new Date().toLocaleTimeString('ar-EG');
//     try {
//       await apiFetch('/cron/adminReport');
//       setCronLog(p => [{ type: 'success', text: 'تقرير الأدمن: تم الإرسال بنجاح', time }, ...p]);
//       setLastRun(new Date().toISOString());
//       showMsg('success', 'تم إرسال تقرير الأدمن');
//     } catch (e: unknown) {
//       const msg = (e instanceof Error ? e.message : null) || 'فشل';
//       setCronLog(p => [{ type: 'error', text: `تقرير الأدمن: ${msg}`, time }, ...p]);
//       showMsg('error', 'فشل إرسال التقرير');
//     } finally { setCronLoading(p => ({ ...p, report: false })); }
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
//           navigate('/login');
//         } finally {
//           setConfirmLoading(false);
//           setConfirmOpts(null);
//         }
//       },
//     });
//   };

//   const [profileForm, setProfileForm] = useState({ userName: '', phone: '', address: '' });
//   const [passForm, setPassForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
//   const [settingsSaving, setSettingsSaving] = useState(false);

//   useEffect(() => {
//     if (user) {
//       setProfileForm({
//         userName: user.userName || '',
//         phone: (user as any).phone || '',
//         address: (user as any).address || '',
//       });
//     }
//   }, [user]);

//   const { refreshUser } = useAuth();

//   const saveProfile = async () => {
//     if (!profileForm.userName.trim()) { showMsg('error', 'اسم المستخدم مطلوب'); return; }
//     setSettingsSaving(true);
//     try {
//       await usersApi.updateProfile(profileForm);
//       await refreshUser();
//       showMsg('success', 'تم تحديث الملف الشخصي بنجاح');
//     } catch (err: unknown) {
//       showMsg('error', err instanceof Error ? err.message : 'حدث خطأ');
//     } finally { setSettingsSaving(false); }
//   };

//   const savePassword = async () => {
//     if (!passForm.oldPassword || !passForm.newPassword) {
//       showMsg('error', 'يرجى ملء جميع الحقول');
//       return;
//     }
//     if (passForm.newPassword !== passForm.confirmPassword) {
//       showMsg('error', 'كلمتا المرور غير متطابقتين');
//       return;
//     }
//     setSettingsSaving(true);
//     try {
//       await usersApi.changePassword(passForm);
//       setPassForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
//       showMsg('success', 'تم تغيير كلمة المرور بنجاح');
//     } catch (err: unknown) {
//       showMsg('error', err instanceof Error ? err.message : 'حدث خطأ');
//     } finally { setSettingsSaving(false); }
//   };

//   const filteredUsers = users.filter(u => {
//     if (!usersSearch) return true;
//     const q = usersSearch.toLowerCase();
//     return (
//       u.userName?.toLowerCase().includes(q) ||
//       u.email?.toLowerCase().includes(q) ||
//       u.roleType?.toLowerCase().includes(q)
//     );
//   });

//   const filteredCharities = charities
//     .filter(c => charitiesFilter === 'all' || c.approvalStatus === charitiesFilter)
//     .filter(c => {
//       if (!charitiesSearch) return true;
//       const q = charitiesSearch.toLowerCase();
//       return (
//         c.charityName?.toLowerCase().includes(q) ||
//         c.email?.toLowerCase().includes(q)
//       );
//     });

//   const filteredReports = reports.filter(r => {
//     if (!reportsSearch) return true;
//     const q = reportsSearch.toLowerCase();
//     return (
//       r.description?.toLowerCase().includes(q) ||
//       r.userName?.toLowerCase().includes(q)    ||
//       r.charityName?.toLowerCase().includes(q)
//     );
//   });

//   const pendingCount = charities.filter(c => c.approvalStatus === 'pending').length;

//   const MONTHS_AR = [
//   'يناير','فبراير','مارس','أبريل','مايو','يونيو',
//   'يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'
// ];

// const trendData = useMemo(() => {
//   const currentYear = new Date().getFullYear();
//   const currentMonth = new Date().getMonth();

//   const usersByMonth = Array(12).fill(0);
//   users.forEach(u => {
//     if (u.createdAt) {
//       const d = new Date(u.createdAt);
//       if (d.getFullYear() === currentYear)
//         usersByMonth[d.getMonth()]++;
//     }
//   });

//   const charitiesByMonth = Array(12).fill(0);
//   charities.forEach(c => {
//     if (c.createdAt) {
//       const d = new Date(c.createdAt);
//       if (d.getFullYear() === currentYear)
//         charitiesByMonth[d.getMonth()]++;
//     }
//   });

//   return Array.from({ length: currentMonth + 1 }, (_, i) => ({
//     name: MONTHS_AR[i],
//     users: usersByMonth[i],
//     charities: charitiesByMonth[i],
//   })).filter(m => m.users > 0 || m.charities > 0);
// }, [users, charities]);

//   const approvalPieData = [
//     { name: 'موافق عليها', value: charities.filter(c => c.approvalStatus === 'approved').length },
//     { name: 'معلقة',       value: charities.filter(c => c.approvalStatus === 'pending').length  },
//     { name: 'مرفوضة',     value: charities.filter(c => c.approvalStatus === 'rejected').length  },
//   ].filter(d => d.value > 0);
//   const PIE_COLORS = [TEAL2, AMBER, RED];

//   const userName = user?.userName ?? user?.email?.split('@')[0] ?? 'مسؤول';

//   return (
//     <div className="ap-layout" dir="rtl">
//       <Sidebar
//         activeTab={tab}
//         onTabChange={setTab}
//         userName={userName}
//         onLogout={handleLogout}
//         pendingCount={pendingCount}
//         collapsed={sidebarCollapsed}
//         onToggleCollapse={handleToggleSidebar}
//       />

//       <main className={`ap-main${tab === 'ai-chat' ? ' ap-main--ai' : ''}`}>
//         {tab !== 'ai-chat' && (
//           <header className="ap-page-header">
//             <div className="ap-page-header-left">
//               <div className="ap-page-breadcrumb">
//                 <i className="ti ti-shield-check" style={{ color: TEAL2 }} />
//                 <span>لوحة التحكم</span>
//                 <i className="ti ti-chevron-left" style={{ fontSize: 12, color: 'var(--t4)' }} />
//                 <span style={{ color: 'var(--t1)', fontWeight: 700 }}>
//                   {NAV_ITEMS.find(n => n.id === tab)?.label}
//                 </span>
//               </div>
//             </div>
//             <div className="ap-page-header-right">
//               {/* زر تبديل الثيم المباشر في الناف بار */}
//               <button 
//                 className="ap-header-icon-btn ap-theme-btn" 
//                 onClick={toggleTheme} 
//                 title={theme === 'dark' ? 'تفعيل الوضع النهارى' : 'تفعيل الوضع الليلي'}
//               >
//                 <i className={`ti ${theme === 'dark' ? 'ti-sun' : 'ti-moon'}`} />
//               </button>
//               <button className="ap-header-icon-btn" onClick={loadData} title="تحديث البيانات">
//                 <i className="ti ti-refresh" />
//               </button>
//               <div className="ap-header-user" onClick={() => setTab('settings')} title="الإعدادات">
//                 <div className="ap-header-avatar">{userName.slice(0, 1).toUpperCase()}</div>
//                 <span className="ap-header-username-text">{userName}</span>
//                 <i className="ti ti-settings" style={{ fontSize: 13, color: 'var(--t4)' }} />
//               </div>
//             </div>
//           </header>
//         )}

//         <div className={`ap-content${tab === 'ai-chat' ? ' ap-content--ai' : ''}`}>
//           {error && !loading && <ErrorBanner msg={error} onRetry={loadData} />}

//           {loading ? <PageSkeleton /> : (
//             <>
//               {/* ══ OVERVIEW ══════════════════════════════════════════════════ */}
//               {tab === 'overview' && (
//                 <div className="ap-tab-pane">
//                   <div className="ap-kpi-grid">
//                     <KpiCard icon="ti-users" label="إجمالي المستخدمين" value={(usersTotal || users.length).toLocaleString('ar-EG')} change="+12.5% هذا الشهر" changeDir="up" color={TEAL2} />
//                     <KpiCard icon="ti-building-community" label="الجمعيات المسجلة" value={(charitiesTotal || charities.length).toLocaleString('ar-EG')} change="+3 جديد" changeDir="up" color="#3b82f6" />
//                     <KpiCard icon="ti-alert-circle" label="التقارير الواردة" value={(reportsTotal || reports.length).toLocaleString('ar-EG')} change={pendingCount > 0 ? `${pendingCount} معلق` : 'لا يوجد معلق'} changeDir={pendingCount > 0 ? 'down' : 'neutral'} color={AMBER} />
//                     <KpiCard icon="ti-clock-pause" label="جمعيات معلقة" value={pendingCount.toLocaleString('ar-EG')} change={pendingCount > 0 ? 'تحتاج مراجعة' : 'الكل جاهز'} changeDir={pendingCount > 0 ? 'down' : 'neutral'} color={RED} />
//                   </div>

//                   <div className="ap-charts-row">
//                     <div className="ap-chart-card ap-chart-card--wide">
//                       <div className="ap-chart-header">
//                         <span className="ap-chart-title"><i className="ti ti-trending-up" style={{ color: TEAL2 }} />نمو المستخدمين والجمعيات</span>
//                         <span className="ap-chart-trend up">↑ 12.5%</span>
//                       </div>
//                       <ResponsiveContainer width="100%" height={220}>
//                         <AreaChart data={trendData} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
//                           <defs>
//                             <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
//                               <stop offset="0%" stopColor={TEAL2} stopOpacity={0.32} />
//                               <stop offset="100%" stopColor={TEAL2} stopOpacity={0.02} />
//                             </linearGradient>
//                             <linearGradient id="gradCharities" x1="0" y1="0" x2="0" y2="1">
//                               <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.28} />
//                               <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
//                             </linearGradient>
//                           </defs>
//                           <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
//                           <XAxis dataKey="name" tick={{ fill: 'var(--t3)', fontSize: 11 }} axisLine={false} tickLine={false} />
//                           <YAxis tick={{ fill: 'var(--t3)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
//                           <Tooltip content={<ChartTooltip />} />
//                           <Area type="monotone" dataKey="users" name="المستخدمون" stroke={TEAL2} strokeWidth={2.5} fill="url(#gradUsers)" dot={false} />
//                           <Area type="monotone" dataKey="charities" name="الجمعيات" stroke="#3b82f6" strokeWidth={2.5} fill="url(#gradCharities)" dot={false} />
//                         </AreaChart>
//                       </ResponsiveContainer>
//                     </div>

//                     {approvalPieData.length > 0 && (
//                       <div className="ap-chart-card">
//                         <div className="ap-chart-header">
//                           <span className="ap-chart-title"><i className="ti ti-chart-donut" style={{ color: AMBER }} />حالة الجمعيات</span>
//                         </div>
//                         <ResponsiveContainer width="100%" height={210}>
//                           <PieChart>
//                             <Pie data={approvalPieData} cx="50%" cy="50%" innerRadius={52} outerRadius={82} paddingAngle={4} dataKey="value">
//                               {approvalPieData.map((_, index) => (
//                                 <Cell key={index} fill={PIE_COLORS[index]} strokeWidth={0} />
//                               ))}
//                             </Pie>
//                             <Tooltip formatter={(v: number, n: string) => [v, n]} contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 10, color: 'var(--t1)', fontSize: 12, fontFamily: 'Tajawal, sans-serif' }} />
//                           </PieChart>
//                         </ResponsiveContainer>
//                         <div className="ap-pie-legend">
//                           {approvalPieData.map((d, i) => (
//                             <div key={i} className="ap-pie-legend-item">
//                               <span className="ap-pie-legend-dot" style={{ background: PIE_COLORS[i] }} />
//                               <span>{d.name}</span>
//                               <span style={{ fontWeight: 700, marginRight: 'auto' }}>{d.value}</span>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {/* ══ USERS ══════════════════════════════════════════════════════ */}
//               {tab === 'users' && (
//                 <div className="ap-tab-pane">
//                   <div className="ap-section-header">
//                     <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
//                       <SectionTitle icon="ti-users" color={TEAL2} title="المستخدمون" badge={usersTotal || users.length} />
//                       <ViewToggle mode={usersViewMode} onChange={setUsersViewMode} />
//                     </div>
//                     <SearchBox value={usersSearch} onChange={setUsersSearch} placeholder="بحث بالاسم أو البريد..." />
//                   </div>

//                   {filteredUsers.length === 0 ? (
//                     <EmptyState icon="ti-user-off" title="لا يوجد مستخدمون" desc="لم يتم العثور على مستخدمين مطابقين للبحث" />
//                   ) : usersViewMode === 'table' ? (
//                     <div className="ap-table-wrap">
//                       <table className="ap-table">
//                         <thead>
//                           <tr>
//                             {['المستخدم', 'البريد الإلكتروني', 'الدور', 'موثق', 'تاريخ الانضمام', ''].map((h, i) => (
//                               <th key={i}>{h}</th>
//                             ))}
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {filteredUsers.map(u => {
//                             const verified = u.isVerified || u.verify;
//                             return (
//                               <tr key={u._id} className="ap-table-row-clickable" onClick={() => setUserDetailModal(u)}>
//                                 <td>
//                                   <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//                                     <div className="ap-table-avatar">
//                                       {u.userName?.slice(0, 1).toUpperCase() ?? '?'}
//                                     </div>
//                                     <span style={{ fontWeight: 600, color: 'var(--t1)' }}>{u.userName}</span>
//                                   </div>
//                                 </td>
//                                 <td className="ap-table-mono">{u.email}</td>
//                                 <td><RoleBadge role={u.roleType} /></td>
//                                 <td>
//                                   <span className="ap-badge" style={{ background: verified ? 'rgba(34,197,94,0.14)' : 'rgba(244,63,94,0.14)', color: verified ? '#22c55e' : RED }}>
//                                     <i className={`ti ${verified ? 'ti-circle-check' : 'ti-circle-x'}`} style={{ fontSize: 12 }} />
//                                     {verified ? 'موثق' : 'غير موثق'}
//                                   </span>
//                                 </td>
//                                 <td style={{ color: 'var(--t3)', fontSize: 12 }}>{fmt(u.createdAt)}</td>
//                                 <td onClick={e => e.stopPropagation()}>
//                                   <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
//                                     <button className="ap-eye-btn" onClick={() => setUserDetailModal(u)} title="عرض التفاصيل">
//                                       <i className="ti ti-eye" />
//                                     </button>
//                                     {u.roleType !== 'admin' && (
//                                       <button className="ap-action-btn delete" onClick={() => handleDeleteUser(u._id, u.userName)}>
//                                         <i className="ti ti-trash" />
//                                       </button>
//                                     )}
//                                   </div>
//                                 </td>
//                               </tr>
//                             );
//                           })}
//                         </tbody>
//                       </table>
//                     </div>
//                   ) : (
//                     <div className="ap-card-grid">
//                       {filteredUsers.map(u => {
//                         const verified = u.isVerified || u.verify;
//                         return (
//                           <div key={u._id} className="ap-entity-card" onClick={() => setUserDetailModal(u)}>
//                             <div className="ap-entity-card-header">
//                               <div className="ap-entity-avatar user">{u.userName?.slice(0, 1).toUpperCase()}</div>
//                               <div style={{ flex: 1, minWidth: 0 }}>
//                                 <div className="ap-entity-name">{u.userName}</div>
//                                 <div className="ap-entity-email">{u.email}</div>
//                               </div>
//                             </div>
//                             <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
//                               <RoleBadge role={u.roleType} />
//                               <span className="ap-badge" style={{ background: verified ? 'rgba(34,197,94,0.14)' : 'rgba(244,63,94,0.14)', color: verified ? '#22c55e' : RED }}>
//                                 {verified ? 'موثق' : 'غير موثق'}
//                               </span>
//                             </div>
//                             <div className="ap-entity-date"><i className="ti ti-calendar" />{fmt(u.createdAt)}</div>
//                             <div className="ap-entity-actions" onClick={e => e.stopPropagation()}>
//                               <button className="ap-card-eye-btn" onClick={() => setUserDetailModal(u)}>
//                                 <i className="ti ti-eye" /> التفاصيل
//                               </button>
//                               {u.roleType !== 'admin' && (
//                                 <button className="ap-action-btn delete" onClick={() => handleDeleteUser(u._id, u.userName)}>
//                                   <i className="ti ti-trash" /> حذف
//                                 </button>
//                               )}
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   )}

//                   {hasMoreUsers && (
//                     <LoadMoreBtn loading={loadingMore === 'users'} remaining={Math.max(0, usersTotal - users.length)} onClick={loadMoreUsers} />
//                   )}
//                 </div>
//               )}

//               {/* ══ CHARITIES ══════════════════════════════════════════════════ */}
//               {tab === 'charities' && (
//                 <div className="ap-tab-pane">
//                   <div className="ap-section-header">
//                     <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
//                       <SectionTitle icon="ti-building-community" color="#3b82f6" title="الجمعيات" badge={charitiesTotal || charities.length} />
//                       <ViewToggle mode={charitiesViewMode} onChange={setCharitiesViewMode} />
//                     </div>
//                     <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
//                       <div className="ap-filter-tabs">
//                         {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
//                           <button key={f} className={`ap-filter-tab${charitiesFilter === f ? ' active' : ''}`} onClick={() => setCharitiesFilter(f)}>
//                             {f === 'all' ? 'الكل' : f === 'pending' ? 'معلق' : f === 'approved' ? 'موافق' : 'مرفوض'}
//                             {f === 'pending' && pendingCount > 0 && (
//                               <span className="ap-filter-badge">{pendingCount}</span>
//                             )}
//                           </button>
//                         ))}
//                       </div>
//                       <SearchBox value={charitiesSearch} onChange={setCharitiesSearch} placeholder="بحث في الجمعيات..." />
//                     </div>
//                   </div>

//                   {filteredCharities.length === 0 ? (
//                     <EmptyState icon="ti-building-off" title="لا توجد جمعيات" desc="لم يتم العثور على جمعيات مطابقة" />
//                   ) : charitiesViewMode === 'table' ? (
//                     <div className="ap-table-wrap">
//                       <table className="ap-table">
//                         <thead>
//                           <tr>
//                             {['الجمعية', 'البريد الإلكتروني', 'العنوان', 'الحالة', 'تاريخ التسجيل', ''].map((h, i) => (
//                               <th key={i}>{h}</th>
//                             ))}
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {filteredCharities.map(c => (
//                             <tr key={c._id} className="ap-table-row-clickable" onClick={() => setCharityDetailModal(c)}>
//                               <td>
//                                 <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//                                   <div className="ap-table-avatar" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>
//                                     <i className="ti ti-building-community" />
//                                   </div>
//                                   <span style={{ fontWeight: 600, color: 'var(--t1)' }}>{c.charityName}</span>
//                                 </div>
//                               </td>
//                               <td className="ap-table-mono">{c.email}</td>
//                               <td>{c.address || '—'}</td>
//                               <td><StatusBadge status={c.approvalStatus} /></td>
//                               <td style={{ color: 'var(--t3)', fontSize: 12 }}>{fmt(c.createdAt)}</td>
//                               <td onClick={e => e.stopPropagation()}>
//                                 <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
//                                   <button className="ap-eye-btn" onClick={() => setCharityDetailModal(c)}>
//                                     <i className="ti ti-eye" />
//                                   </button>
//                                   {c.approvalStatus === 'pending' && (
//                                     <>
//                                       <button className="ap-action-btn approve" onClick={() => handleApprove(c._id, c.charityName)}>
//                                         <i className="ti ti-check" />
//                                       </button>
//                                       <button className="ap-action-btn reject" onClick={() => setRejectTarget({ id: c._id, name: c.charityName })}>
//                                         <i className="ti ti-x" />
//                                       </button>
//                                     </>
//                                   )}
//                                   <button className="ap-action-btn edit" onClick={() => setEditCharityTarget(c)}>
//                                     <i className="ti ti-edit" />
//                                   </button>
//                                   <button className="ap-action-btn delete" onClick={() => handleDeleteCharity(c._id, c.charityName)}>
//                                     <i className="ti ti-trash" />
//                                   </button>
//                                 </div>
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   ) : (
//                     <div className="ap-card-grid">
//                       {filteredCharities.map(c => (
//                         <div key={c._id} className="ap-entity-card" onClick={() => setCharityDetailModal(c)}>
//                           <div className="ap-entity-card-header">
//                             <div className="ap-entity-avatar charity"><i className="ti ti-building-community" /></div>
//                             <div style={{ flex: 1, minWidth: 0 }}>
//                               <div className="ap-entity-name">{c.charityName}</div>
//                               <div className="ap-entity-email">{c.email}</div>
//                             </div>
//                           </div>
//                           <div style={{ marginBottom: 10 }}>
//                             <StatusBadge status={c.approvalStatus} />
//                           </div>
//                           {c.address && <div className="ap-entity-meta"><i className="ti ti-map-pin" />{c.address}</div>}
//                           <div className="ap-entity-date"><i className="ti ti-calendar" />{fmt(c.createdAt)}</div>
//                           <div className="ap-entity-actions" onClick={e => e.stopPropagation()}>
//                             <button className="ap-card-eye-btn" onClick={() => setCharityDetailModal(c)}>
//                               <i className="ti ti-eye" /> تفاصيل
//                             </button>
//                             {c.approvalStatus === 'pending' && (
//                               <>
//                                 <button className="ap-action-btn approve" disabled={!!actionLoading} onClick={() => handleApprove(c._id, c.charityName)}>
//                                   <i className="ti ti-check" /> موافقة
//                                 </button>
//                                 <button className="ap-action-btn reject" disabled={!!actionLoading} onClick={() => setRejectTarget({ id: c._id, name: c.charityName })}>
//                                   <i className="ti ti-x" /> رفض
//                                 </button>
//                               </>
//                             )}
//                             <button className="ap-action-btn edit" onClick={() => setEditCharityTarget(c)}>
//                               <i className="ti ti-edit" />
//                             </button>
//                             <button className="ap-action-btn delete" disabled={!!actionLoading} onClick={() => handleDeleteCharity(c._id, c.charityName)}>
//                               <i className="ti ti-trash" />
//                             </button>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}

//                   {hasMoreCharities && (
//                     <LoadMoreBtn loading={loadingMore === 'charities'} remaining={charitiesRemaining} onClick={loadMoreCharities} />
//                   )}
//                 </div>
//               )}

//               {/* ══ REPORTS ══════════════════════════════════════════════════ */}
//               {tab === 'reports' && (
//                 <div className="ap-tab-pane">
//                   <div className="ap-section-header">
//                     <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
//                       <SectionTitle icon="ti-alert-circle" color={AMBER} title="التقارير" badge={reportsTotal || reports.length} />
//                       <ViewToggle mode={reportsViewMode} onChange={setReportsViewMode} />
//                     </div>
//                     <SearchBox value={reportsSearch} onChange={setReportsSearch} placeholder="بحث في التقارير..." />
//                   </div>

//                   {filteredReports.length === 0 ? (
//                     <EmptyState icon="ti-mood-happy" title="لا توجد تقارير حتى الآن" desc="كل شيء يسير على ما يرام!" />
//                   ) : reportsViewMode === 'table' ? (
//                     <div className="ap-table-wrap">
//                       <table className="ap-table">
//                         <thead>
//                           <tr>
//                             {['رقم التقرير', 'المُرسِل', 'النوع', 'الوصف', 'التاريخ', ''].map((h, i) => (
//                               <th key={i}>{h}</th>
//                             ))}
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {filteredReports.map((r, i) => {
//                             const isCharity = r.senderType === 'charity';
//                             return (
//                               <tr key={r._id} className="ap-table-row-clickable" onClick={() => setReportModal(r)}>
//                                 <td style={{ fontWeight: 700, color: 'var(--amber)' }}>#{i + 1}</td>
//                                 <td>{r.userName || r.charityName || '—'}</td>
//                                 <td>{isCharity ? 'جمعية' : 'مستخدم'}</td>
//                                 <td style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description}</td>
//                                 <td style={{ color: 'var(--t3)', fontSize: 12 }}>{fmt(r.createdAt)}</td>
//                                 <td onClick={e => e.stopPropagation()}>
//                                   <button className="ap-eye-btn" onClick={() => setReportModal(r)}>
//                                     <i className="ti ti-eye" />
//                                   </button>
//                                 </td>
//                               </tr>
//                             );
//                           })}
//                         </tbody>
//                       </table>
//                     </div>
//                   ) : (
//                     <div className="ap-card-grid">
//                       {filteredReports.map((r, i) => {
//                         const isCharity = r.senderType === 'charity';
//                         const senderName = r.userName || r.charityName || '—';
//                         return (
//                           <div key={r._id} className="ap-report-card" onClick={() => setReportModal(r)}>
//                             <div className="ap-report-card-top">
//                               <span className="ap-report-num"><i className="ti ti-alert-triangle" />تقرير #{i + 1}</span>
//                               <span className="ap-report-date"><i className="ti ti-calendar" />{fmt(r.createdAt)}</span>
//                             </div>
//                             <div className="ap-report-sender">
//                               <div className="ap-report-sender-icon" style={{ background: isCharity ? 'rgba(16,185,129,0.14)' : 'rgba(59,130,246,0.14)', color: isCharity ? TEAL2 : '#3b82f6' }}>
//                                 <i className={`ti ${isCharity ? 'ti-building' : 'ti-user'}`} />
//                               </div>
//                               <div>
//                                 <div style={{ fontWeight: 700, color: 'var(--t1)', fontSize: 13 }}>{senderName}</div>
//                                 <div style={{ fontSize: 11, color: 'var(--t4)', marginTop: 1 }}>{isCharity ? 'جمعية' : 'مستخدم'}</div>
//                               </div>
//                             </div>
//                             <p className="ap-report-body">{r.description}</p>
//                             <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
//                               <button className="ap-card-eye-btn" onClick={e => { e.stopPropagation(); setReportModal(r); }}>
//                                 <i className="ti ti-eye" /> عرض التقرير
//                               </button>
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   )}

//                   {hasMoreReports && (
//                     <LoadMoreBtn loading={loadingMore === 'reports'} remaining={Math.max(0, reportsTotal - reports.length)} onClick={loadMoreReports} />
//                   )}
//                 </div>
//               )}

//               {/* ══ AUTOMATION ══════════════════════════════════════════════ */}
//               {tab === 'automation' && (
//                 <div className="ap-tab-pane">
//                   <div className="ap-automation-banner">
//                     <div className="ap-automation-banner-icon"><i className="ti ti-settings-automation" /></div>
//                     <div>
//                       <div className="ap-automation-banner-title">التشغيل التلقائي — Cron Jobs</div>
//                       <div className="ap-automation-banner-sub">يمكنك تشغيل المهام التلقائية يدويًا من هنا. يتم تشغيلها في الخلفية وفقًا لجدول زمني محدد.</div>
//                     </div>
//                   </div>

//                   <div className="ap-cron-grid">
//                     <CronCard icon="ti-bell-ringing" iconBg="rgba(16,185,129,0.14)" iconColor={TEAL2} title="تذكير التبرعات" desc="يرسل تذكيرات للجمعيات بالتبرعات المعلقة التي لم يتم تأكيدها." code="GET /cron/donationReminder" codeBg="rgba(16,185,129,0.08)" codeBorder="rgba(16,185,129,0.24)" codeColor={TEAL2} loading={cronLoading.reminder} btnColor={TEAL2} onRun={runDonationReminder} />
//                     <CronCard icon="ti-report-analytics" iconBg="rgba(59,130,246,0.14)" iconColor="#3b82f6" title="تقرير الأدمن" desc="يولّد تقريرًا شاملاً عن نشاط المنصة ويرسله لجميع المسؤولين عبر البريد الإلكتروني." code="GET /cron/adminReport" codeBg="rgba(59,130,246,0.08)" codeBorder="rgba(59,130,246,0.24)" codeColor="#3b82f6" loading={cronLoading.report} btnColor="#3b82f6" onRun={runAdminReport} />
//                   </div>

//                   <div className="ap-cron-stats-row">
//                     {[
//                       { icon: 'ti-history',        color: TEAL2,     value: cronLog.length, label: 'عدد مرات التشغيل' },
//                       { icon: 'ti-clock',           color: AMBER,     value: lastRun ? new Date(lastRun).toLocaleTimeString('ar-EG') : '—', label: 'آخر تشغيل' },
//                       { icon: 'ti-calendar-event', color: '#3b82f6', value: 'تلقائي', label: 'جدول زمني' },
//                     ].map((s, i) => (
//                       <div key={i} className="ap-cron-stat">
//                         <i className={`ti ${s.icon}`} style={{ color: s.color, fontSize: 22 }} />
//                         <div>
//                           <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)' }}>{s.value}</div>
//                           <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>{s.label}</div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>

//                   {cronLog.length > 0 && (
//                     <div className="ap-cron-log">
//                       <div className="ap-cron-log-header">
//                         <SectionTitle icon="ti-list-details" color={TEAL2} title="سجل التنفيذ" badge={cronLog.length} />
//                         <button className="ap-cron-log-clear" onClick={() => setCronLog([])}><i className="ti ti-trash" />مسح</button>
//                       </div>
//                       <div className="ap-cron-log-list">
//                         {cronLog.map((log, i) => (
//                           <div key={i} className={`ap-cron-log-item ${log.type}`}>
//                             <span>{log.type === 'success' ? '✓' : '✗'} {log.text}</span>
//                             <span style={{ fontSize: 11, color: 'var(--t4)', flexShrink: 0 }}>{log.time}</span>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* ══ SETTINGS ══════════════════════════════════════════════════ */}
//               {tab === 'settings' && (
//                 <div className="ap-tab-pane">
//                   <div className="ap-section-header">
//                     <SectionTitle icon="ti-settings" color={TEAL2} title="الإعدادات" />
//                   </div>

//                   <div className="ap-settings-grid">
//                     <div className="ap-settings-card">
//                       <div className="ap-settings-card-title">
//                         <div className="ap-settings-icon" style={{ background: 'rgba(16,185,129,0.14)', color: TEAL2 }}>
//                           <i className="ti ti-user-circle" />
//                         </div>
//                         الملف الشخصي
//                       </div>
//                       <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
//                         <div className="ap-form-group">
//                           <label className="ap-form-label">اسم المستخدم</label>
//                           <input
//                             className="ap-form-input"
//                             value={profileForm.userName}
//                             onChange={e => setProfileForm(f => ({ ...f, userName: e.target.value }))}
//                             placeholder="اسم المستخدم"
//                           />
//                         </div>
//                         <div className="ap-form-group">
//                           <label className="ap-form-label">البريد الإلكتروني</label>
//                           <input className="ap-form-input" value={user?.email ?? ''} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
//                         </div>
//                         <div className="ap-form-group">
//                           <label className="ap-form-label">رقم الهاتف</label>
//                           <input
//                             className="ap-form-input"
//                             value={profileForm.phone}
//                             onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
//                             placeholder="01xxxxxxxxx"
//                           />
//                         </div>
//                         <div className="ap-form-group">
//                           <label className="ap-form-label">العنوان</label>
//                           <input
//                             className="ap-form-input"
//                             value={profileForm.address}
//                             onChange={e => setProfileForm(f => ({ ...f, address: e.target.value }))}
//                             placeholder="المدينة أو المنطقة"
//                           />
//                         </div>
//                         <button
//                           className="ap-action-btn approve"
//                           style={{ alignSelf: 'flex-start', padding: '8px 18px' }}
//                           disabled={settingsSaving}
//                           onClick={saveProfile}
//                         >
//                           {settingsSaving ? <><i className="ti ti-loader-2 ti-spin" /> جاري الحفظ...</> : <><i className="ti ti-check" /> حفظ التغييرات</>}
//                         </button>
//                       </div>
//                     </div>

//                     <div className="ap-settings-card">
//                       <div className="ap-settings-card-title">
//                         <div className="ap-settings-icon" style={{ background: 'rgba(244,63,94,0.14)', color: RED }}>
//                           <i className="ti ti-shield-lock" />
//                         </div>
//                         تغيير كلمة المرور
//                       </div>
//                       <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
//                         <div className="ap-form-group">
//                           <label className="ap-form-label">كلمة المرور الحالية</label>
//                           <input
//                             className="ap-form-input"
//                             type="password"
//                             value={passForm.oldPassword}
//                             onChange={e => setPassForm(f => ({ ...f, oldPassword: e.target.value }))}
//                             placeholder="••••••••"
//                           />
//                         </div>
//                         <div className="ap-form-group">
//                           <label className="ap-form-label">كلمة المرور الجديدة</label>
//                           <input
//                             className="ap-form-input"
//                             type="password"
//                             value={passForm.newPassword}
//                             onChange={e => setPassForm(f => ({ ...f, newPassword: e.target.value }))}
//                             placeholder="••••••••"
//                           />
//                         </div>
//                         <div className="ap-form-group">
//                           <label className="ap-form-label">تأكيد كلمة المرور الجديدة</label>
//                           <input
//                             className="ap-form-input"
//                             type="password"
//                             value={passForm.confirmPassword}
//                             onChange={e => setPassForm(f => ({ ...f, confirmPassword: e.target.value }))}
//                             placeholder="••••••••"
//                           />
//                         </div>
//                         <button
//                           className="ap-action-btn edit"
//                           style={{ alignSelf: 'flex-start', padding: '8px 18px' }}
//                           disabled={settingsSaving}
//                           onClick={savePassword}
//                         >
//                           {settingsSaving ? <><i className="ti ti-loader-2 ti-spin" /> جاري الحفظ...</> : <><i className="ti ti-key" /> تغيير كلمة المرور</>}
//                         </button>
//                       </div>
//                     </div>

//                     <div className="ap-settings-card">
//                       <div className="ap-settings-card-title">
//                         <div className="ap-settings-icon" style={{ background: 'rgba(59,130,246,0.14)', color: '#3b82f6' }}>
//                           <i className="ti ti-bell" />
//                         </div>
//                         الإشعارات
//                       </div>
//                       {[
//                         { label: 'إشعارات البريد الإلكتروني', sub: 'تلقي التنبيهات عبر البريد', default: true  },
//                         { label: 'تقارير جديدة',              sub: 'إشعار فوري عند ورود تقرير',  default: true  },
//                         { label: 'طلبات الانضمام',            sub: 'جمعيات تنتظر الموافقة',       default: false },
//                       ].map((item, i) => (
//                         <div key={i} className="ap-settings-row">
//                           <div>
//                             <div className="ap-settings-row-label">{item.label}</div>
//                             <div className="ap-settings-row-sub">{item.sub}</div>
//                           </div>
//                           <label className="ap-toggle">
//                             <input type="checkbox" defaultChecked={item.default} />
//                             <span className="ap-toggle-slider" />
//                           </label>
//                         </div>
//                       ))}
//                     </div>

//                     <div className="ap-settings-card">
//                       <div className="ap-settings-card-title">
//                         <div className="ap-settings-icon" style={{ background: 'rgba(245,158,11,0.14)', color: AMBER }}>
//                           <i className="ti ti-server" />
//                         </div>
//                         النظام
//                       </div>
                      
//                       {/* خيار الوضع الليلي والنهاري داخل كارد الإعدادات */}
//                       <div className="ap-settings-row">
//                         <div>
//                           <div className="ap-settings-row-label">الوضع الليلي (Dark Mode)</div>
//                           <div className="ap-settings-row-sub">تبديل مظهر لوحة التحكم بالكامل</div>
//                         </div>
//                         <label className="ap-toggle">
//                           <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
//                           <span className="ap-toggle-slider" />
//                         </label>
//                       </div>

//                       {[
//                         { label: 'وضع المطور',      sub: 'عرض السجلات التقنية',    default: false },
//                         { label: 'ذاكرة التخزين', sub: 'حفظ الجلسة تلقائياً',    default: true  },
//                       ].map((item, i) => (
//                         <div key={i} className="ap-settings-row">
//                           <div>
//                             <div className="ap-settings-row-label">{item.label}</div>
//                             <div className="ap-settings-row-sub">{item.sub}</div>
//                           </div>
//                           <label className="ap-toggle">
//                             <input type="checkbox" defaultChecked={item.default} />
//                             <span className="ap-toggle-slider" />
//                           </label>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                   <div style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 'var(--radius)', padding: '20px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>                
//                     <div>
//                       <div style={{ fontWeight: 800, color: RED, marginBottom: 4, fontSize: 14 }}>منطقة الخطر</div>
//                       <div style={{ fontSize: 13, color: 'var(--t3)', lineHeight: 1.6 }}>تسجيل الخروج من جميع الجلسات أو حذف الحساب نهائيًا.</div>
//                     </div>
//                     <button className="ap-action-btn reject" style={{ padding: '9px 18px', flexShrink: 0 }} onClick={handleLogout}>
//                       <i className="ti ti-logout" /> تسجيل الخروج
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {/* ══ AI CHAT ══════════════════════════════════════════════════ */}
//               {tab === 'ai-chat' && (
//                 <div className="ap-ai-chat-container">
//                   <AIChatEmbed />
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </main>

//       <MobileNav activeTab={tab} onTabChange={setTab} pendingCount={pendingCount} />

//       <Toast msg={toast} />
//       <ConfirmModal opts={confirmOpts} loading={confirmLoading} onClose={() => { if (!confirmLoading) setConfirmOpts(null); }} />
//       <RejectModal target={rejectTarget} loading={rejectLoading} onClose={() => setRejectTarget(null)} onConfirm={handleReject} />
//       <EditCharityModal target={editCharityTarget} loading={actionLoading} setLoading={setActionLoading} onClose={() => setEditCharityTarget(null)} onSaved={(id, form) => setCharities(prev => prev.map(c => c._id === id ? { ...c, ...form } : c))} showMsg={showMsg} />

//       {/* User Detail Modal */}
//       {userDetailModal && (() => {
//         const verified = userDetailModal.isVerified || userDetailModal.verify;
//         return (
//           <div className="ap-modal-overlay" onClick={() => setUserDetailModal(null)}>
//             <div className="ap-modal ap-modal-wide" onClick={e => e.stopPropagation()}>
//               <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.04) 100%)', padding: '22px 28px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
//                 <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
//                   <div className="ap-detail-avatar" style={{ width: 52, height: 52, fontSize: 20 }}>{userDetailModal.userName?.slice(0, 1).toUpperCase() ?? '?'}</div>
//                   <div>
//                     <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--t1)', marginBottom: 3 }}>{userDetailModal.userName}</div>
//                     <div style={{ fontSize: 13, color: 'var(--t3)' }}>{userDetailModal.email}</div>
//                     <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
//                       <RoleBadge role={userDetailModal.roleType} />
//                       <span className="ap-badge" style={{ background: verified ? 'rgba(34,197,94,0.14)' : 'rgba(244,63,94,0.14)', color: verified ? '#22c55e' : RED }}>
//                         <i className={`ti ${verified ? 'ti-circle-check' : 'ti-circle-x'}`} style={{ fontSize: 11 }} />
//                         {verified ? 'موثق' : 'غير موثق'}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//                 <button className="ap-modal-close-x" onClick={() => setUserDetailModal(null)}><i className="ti ti-x" /></button>
//               </div>
//               <div className="ap-modal-inner" style={{ paddingTop: 20 }}>
//                 <div className="ap-detail-section">
//                   <DetailRow icon="ti-fingerprint" label="المعرف"       value={userDetailModal._id}                           mono />
//                   <DetailRow icon="ti-mail"        label="البريد"       value={userDetailModal.email}                               />
//                   {userDetailModal.phone   && <DetailRow icon="ti-phone"   label="الهاتف"    value={userDetailModal.phone}   />}
//                   {userDetailModal.address && <DetailRow icon="ti-map-pin" label="العنوان"   value={userDetailModal.address} />}
//                   <DetailRow icon="ti-calendar"    label="تاريخ الانضمام" value={fmt(userDetailModal.createdAt)}                    />
//                   {userDetailModal.updatedAt && <DetailRow icon="ti-clock-edit" label="آخر تحديث" value={fmt(userDetailModal.updatedAt)} />}
//                 </div>
//                 <div className="ap-modal-actions" style={{ marginTop: 18 }}>
//                   <button className="ap-modal-cancel" onClick={() => setUserDetailModal(null)}>إغلاق</button>
//                   {userDetailModal.roleType !== 'admin' && (
//                     <button className="ap-modal-confirm" style={{ background: RED }} onClick={() => { setUserDetailModal(null); handleDeleteUser(userDetailModal._id, userDetailModal.userName); }}>
//                       <i className="ti ti-trash" />حذف المستخدم
//                     </button>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         );
//       })()}

//       {/* Charity Detail Modal */}
//       {charityDetailModal && (
//         <div className="ap-modal-overlay" onClick={() => setCharityDetailModal(null)}>
//           <div className="ap-modal ap-modal-wide" onClick={e => e.stopPropagation()}>
//             <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.04) 100%)', padding: '22px 28px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
//               <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
//                 <div className="ap-entity-avatar charity" style={{ width: 52, height: 52, fontSize: 22 }}><i className="ti ti-building-community" /></div>
//                 <div>
//                   <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--t1)', marginBottom: 3 }}>{charityDetailModal.charityName}</div>
//                   <div style={{ fontSize: 13, color: 'var(--t3)' }}>{charityDetailModal.email}</div>
//                   <div style={{ marginTop: 8 }}><StatusBadge status={charityDetailModal.approvalStatus} /></div>
//                 </div>
//               </div>
//               <button className="ap-modal-close-x" onClick={() => setCharityDetailModal(null)}><i className="ti ti-x" /></button>
//             </div>

//             <div className="ap-modal-inner" style={{ paddingTop: 20 }}>
//               <div className="ap-detail-section" style={{ marginBottom: 16 }}>
//                 <DetailRow icon="ti-fingerprint"  label="المعرف"        value={charityDetailModal._id}                     mono />
//                 <DetailRow icon="ti-map-pin"      label="العنوان"       value={charityDetailModal.address || '—'}                />
//                 {charityDetailModal.phone         && <DetailRow icon="ti-phone"       label="الهاتف"       value={charityDetailModal.phone}         />}
//                 {charityDetailModal.licenseNumber && <DetailRow icon="ti-certificate" label="رقم الترخيص"  value={charityDetailModal.licenseNumber} />}
//                 <DetailRow icon="ti-calendar"     label="تاريخ التسجيل" value={fmt(charityDetailModal.createdAt)}                />
//                 {charityDetailModal.userId && <DetailRow icon="ti-user" label="معرف المالك" value={charityDetailModal.userId} mono />}
//               </div>

//               {charityDetailModal.description && (
//                 <div style={{ marginBottom: 16 }}>
//                   <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
//                     <i className="ti ti-file-description" style={{ fontSize: 14 }} /> وصف الجمعية
//                   </div>
//                   <div className="ap-report-full-body">{charityDetailModal.description}</div>
//                 </div>
//               )}

//               {charityDetailModal.approvalStatus === 'rejected' && charityDetailModal.rejectionReason && (
//                 <div style={{ marginBottom: 16 }}>
//                   <div style={{ fontSize: 12, fontWeight: 700, color: RED, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
//                     <i className="ti ti-alert-circle" style={{ fontSize: 14 }} /> سبب الرفض
//                   </div>
//                   <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.8, background: 'rgba(244,63,94,0.06)', borderRadius: 'var(--radius-sm)', padding: 14, border: '1px solid rgba(244,63,94,0.18)' }}>
//                     {charityDetailModal.rejectionReason}
//                   </div>
//                 </div>
//               )}

//               {charityDetailModal.approvalStatus === 'pending' && (
//                 <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
//                   <button className="ap-action-btn approve" style={{ flex: 1, justifyContent: 'center' }} disabled={!!actionLoading} onClick={() => { setCharityDetailModal(null); handleApprove(charityDetailModal._id, charityDetailModal.charityName); }}>
//                     <i className="ti ti-check" />موافقة
//                   </button>
//                   <button className="ap-action-btn reject" style={{ flex: 1, justifyContent: 'center' }} disabled={!!actionLoading} onClick={() => { setCharityDetailModal(null); setRejectTarget({ id: charityDetailModal._id, name: charityDetailModal.charityName }); }}>
//                     <i className="ti ti-x" />رفض
//                   </button>
//                 </div>
//               )}
//               <div className="ap-modal-actions">
//                 <button className="ap-modal-cancel" onClick={() => setCharityDetailModal(null)}>إغلاق</button>
//                 <button className="ap-action-btn edit" style={{ padding: '10px 18px', fontSize: 13 }} onClick={() => { setCharityDetailModal(null); setEditCharityTarget(charityDetailModal); }}>
//                   <i className="ti ti-edit" />تعديل
//                 </button>
//                 <button className="ap-modal-confirm" style={{ background: RED }} disabled={!!actionLoading} onClick={() => { setCharityDetailModal(null); handleDeleteCharity(charityDetailModal._id, charityDetailModal.charityName); }}>
//                   <i className="ti ti-trash" />حذف
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Report Detail Modal */}
//       {reportModal && (() => {
//         const isCharity = reportModal.senderType === 'charity';
//         const senderName = reportModal.userName || reportModal.charityName || '—';
//         return (
//           <div className="ap-modal-overlay" onClick={() => setReportModal(null)}>
//             <div className="ap-modal ap-modal-wide" onClick={e => e.stopPropagation()}>
//               <div style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(245,158,11,0.04) 100%)', padding: '22px 28px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
//                 <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
//                   <div style={{ width: 48, height: 48, borderRadius: 13, background: 'rgba(245,158,11,0.14)', color: AMBER, display: 'flex', alignItems: 'center', justifycontent: 'center', fontSize: 22, flexShrink: 0 }}>
//                     <i className="ti ti-alert-triangle" />
//                   </div>
//                   <div>
//                     <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--t1)', marginBottom: 3 }}>تقرير وارد</div>
//                     <div style={{ fontSize: 12, color: 'var(--t3)' }}>{fmt(reportModal.createdAt)}</div>
//                   </div>
//                 </div>
//                 <button className="ap-modal-close-x" onClick={() => setReportModal(null)}><i className="ti ti-x" /></button>
//               </div>

//               <div className="ap-modal-inner" style={{ paddingTop: 20 }}>
//                 <div className="ap-detail-section" style={{ marginBottom: 16 }}>
//                   <DetailRow icon={isCharity ? 'ti-building' : 'ti-user'} label="المُرسِل" value={senderName} />
//                   <DetailRow icon="ti-tag" label="نوع المُرسِل" value={isCharity ? 'جمعية' : 'مستخدم'} />
//                   <DetailRow icon="ti-calendar" label="التاريخ" value={fmt(reportModal.createdAt)} />
//                   {reportModal.userId && <DetailRow icon="ti-fingerprint" label="معرف المُرسِل" value={reportModal.userId} mono />}
//                 </div>

//                 <div style={{ marginBottom: 16 }}>
//                   <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
//                     <i className="ti ti-file-text" style={{ fontSize: 14 }} /> محتوى التقرير
//                   </div>
//                   <div className="ap-report-full-body">{reportModal.description}</div>
//                 </div>

//                 <div className="ap-modal-actions" style={{ marginTop: 16 }}>
//                   <button className="ap-modal-cancel" onClick={() => setReportModal(null)}>إغلاق</button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         );
//       })()}
//     </div>
//   );
// }

// import { useEffect, useState, useCallback, useMemo } from 'react';
// import { useAuth } from '../../contexts/AuthContext';
// import { useLocation } from 'wouter';
// import '../../styles/css/AdminPanel.css';
// import {
//   AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
//   Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
// } from 'recharts';
// import AIChatEmbed from '../../components/shared/AIChatEmbed';
// import { usersApi } from '../../services';
// import {
//   apiFetch, fetchPage,
//   User, Charity, Report, Tab, ApprovalStatus,
//   APPROVAL_CFG, ROLE_CFG,
//   TEAL2, AMBER, RED,
//   fmt,
// } from './adminTypes';

// type ViewMode = 'table' | 'cards';
// type ThemeMode = 'dark' | 'light';

// const NAV_ITEMS = [
//   { id: 'overview',   label: 'نظرة عامة',       icon: 'ti-layout-dashboard'    },
//   { id: 'users',      label: 'المستخدمون',       icon: 'ti-users'               },
//   { id: 'charities',  label: 'الجمعيات',          icon: 'ti-building-community'  },
//   { id: 'reports',    label: 'التقارير',          icon: 'ti-alert-circle'        },
//   { id: 'automation', label: 'التشغيل التلقائي', icon: 'ti-settings-automation' },
//   { id: 'settings',   label: 'الإعدادات',        icon: 'ti-settings'            },
//   { id: 'ai-chat',    label: 'مساعد الذكاء',     icon: 'ti-brain'               },
// ];

// // ─── Sidebar Component ────────────────────────────────────────────────────────
// function Sidebar({ activeTab, onTabChange, userName, onLogout, pendingCount, collapsed, onToggleCollapse }: {
//   activeTab: Tab;
//   onTabChange: (tab: Tab) => void;
//   userName: string;
//   onLogout: () => void;
//   pendingCount: number;
//   collapsed: boolean;
//   onToggleCollapse: () => void;
// }) {
//   return (
//     <aside className={`ap-sidebar${collapsed ? ' collapsed' : ''}`}>
//       <div className="ap-sidebar-brand">
//         <div className="ap-brand-icon">
//           <i className="ti ti-shield-check" />
//         </div>
//         {!collapsed && <span className="ap-brand-title">لوحة التحكم</span>}
//         <button
//           className="ap-collapse-btn"
//           onClick={onToggleCollapse}
//           title={collapsed ? 'توسيع الشريط' : 'طي الشريط'}
//         >
//           <i className={`ti ${collapsed ? 'ti-layout-sidebar-right-expand' : 'ti-layout-sidebar-right-collapse'}`} />
//         </button>
//       </div>

      

//       <nav className="ap-sidebar-nav">
//         {NAV_ITEMS.map(item => (
//           <button
//             key={item.id}
//             className={`ap-nav-item${activeTab === item.id ? ' active' : ''}`}
//             onClick={() => onTabChange(item.id as Tab)}
//             title={collapsed ? item.label : undefined}
//           >
//             <span className="ap-nav-icon-wrap">
//               <i className={`ti ${item.icon}`} />
//               {item.id === 'charities' && pendingCount > 0 && (
//                 <span className="ap-nav-badge">{pendingCount}</span>
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
//             <div className="ap-user-avatar">{userName?.slice(0, 1).toUpperCase()}</div>
//             <div className="ap-user-meta">
//               <span className="ap-user-name">{userName}</span>
//               <span className="ap-user-role">مسؤول النظام</span>
//             </div>
//             <i className="ti ti-settings" style={{ fontSize: 14, color: 'var(--t4)' }} />
//           </div>
//         )}
//         {collapsed && (
//           <button
//             className="ap-nav-item"
//             onClick={() => onTabChange('settings')}
//             title="الإعدادات"
//             style={{ justifyContent: 'center', padding: '10px 0' }}
//           >
//             <span className="ap-nav-icon-wrap">
//               <i className="ti ti-settings" />
//             </span>
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

// // ─── Mobile Bottom Nav ────────────────────────────────────────────────────────
// function MobileNav({ activeTab, onTabChange, pendingCount }: {
//   activeTab: Tab;
//   onTabChange: (tab: Tab) => void;
//   pendingCount: number;
// }) {
//   return (
//     <nav className="ap-mobile-nav">
//       {NAV_ITEMS.map(item => (
//         <button
//           key={item.id}
//           className={`ap-mobile-nav-item${activeTab === item.id ? ' active' : ''}`}
//           onClick={() => onTabChange(item.id as Tab)}
//         >
//           <span className="ap-nav-icon-wrap">
//             <i className={`ti ${item.icon}`} />
//             {item.id === 'charities' && pendingCount > 0 && (
//               <span className="ap-nav-badge">{pendingCount}</span>
//             )}
//           </span>
//           <span>{item.label}</span>
//         </button>
//       ))}
//     </nav>
//   );
// }

// // ─── View Toggle Component ──────────────────────────────────────────────────
// function ViewToggle({ mode, onChange }: { mode: ViewMode; onChange: (mode: ViewMode) => void }) {
//   return (
//     <div className="ap-view-switcher">
//       <button 
//         className={`ap-view-btn ${mode === 'table' ? 'active' : ''}`} 
//         onClick={() => onChange('table')}
//         title="عرض كجدول"
//       >
//         <i className="ti ti-list" />
//       </button>
//       <button 
//         className={`ap-view-btn ${mode === 'cards' ? 'active' : ''}`} 
//         onClick={() => onChange('cards')}
//         title="عرض ككروت"
//       >
//         <i className="ti ti-layout-grid" />
//       </button>
//     </div>
//   );
// }

// function StatusBadge({ status }: { status: string }) {
//   const cfg = APPROVAL_CFG[status as ApprovalStatus] ?? {
//     label: status, bg: '#1c2333', color: '#9aa5b9', dot: '#3d4a60',
//   };
//   return (
//     <span className="ap-badge" style={{ background: cfg.bg, color: cfg.color }}>
//       <span className="ap-badge-dot" style={{ background: cfg.dot }} />
//       {cfg.label}
//     </span>
//   );
// }

// function RoleBadge({ role }: { role: string }) {
//   const cfg = ROLE_CFG[role as keyof typeof ROLE_CFG] ?? {
//     label: role, bg: '#1c2333', color: '#9aa5b9', icon: '',
//   };
//   return (
//     <span className="ap-badge" style={{ background: cfg.bg, color: cfg.color }}>
//       {cfg.icon} {cfg.label}
//     </span>
//   );
// }

// function Toast({ msg }: { msg: { type: 'success' | 'error'; text: string } | null }) {
//   if (!msg) return null;
//   return (
//     <div className={`ap-toast ${msg.type}`}>
//       <i className={`ti ${msg.type === 'success' ? 'ti-circle-check' : 'ti-alert-circle'}`} />
//       {msg.text}
//     </div>
//   );
// }

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
//               {loading && <i className="ti ti-loader-2 ti-spin" />}
//               {opts.confirmLabel ?? 'تأكيد'}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function RejectModal({ target, loading, onClose, onConfirm }: {
//   target: { id: string; name: string } | null;
//   loading: boolean;
//   onClose: () => void;
//   onConfirm: (reason: string) => void;
// }) {
//   const [reason, setReason] = useState('');
//   useEffect(() => { if (target) setReason(''); }, [target]);
//   if (!target) return null;
//   return (
//     <div className="ap-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
//       <div className="ap-modal">
//         <div className="ap-modal-inner">
//           <div className="ap-modal-icon" style={{ background: RED + '22' }}>
//             <i className="ti ti-x" style={{ color: RED }} />
//           </div>
//           <h3 className="ap-modal-title">رفض جمعية "{target.name}"</h3>
//           <p className="ap-modal-msg">يمكنك تحديد سبب الرفض ليصل للجمعية بالبريد الإلكتروني.</p>
//           <div className="ap-form-group" style={{ marginBottom: 20 }}>
//             <label className="ap-form-label">سبب الرفض</label>
//             <textarea
//               className="ap-form-textarea"
//               rows={3}
//               value={reason}
//               onChange={e => setReason(e.target.value)}
//               placeholder="سبب الرفض (اختياري)"
//             />
//           </div>
//           <div className="ap-modal-actions">
//             <button className="ap-modal-cancel" onClick={onClose} disabled={loading}>إلغاء</button>
//             <button
//               className="ap-modal-confirm"
//               disabled={loading}
//               style={{ background: RED }}
//               onClick={() => onConfirm(reason)}
//             >
//               {loading && <i className="ti ti-loader-2 ti-spin" />}
//               تأكيد الرفض
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function EditCharityModal({ target, loading, setLoading, onClose, onSaved, showMsg }: {
//   target: Charity | null;
//   loading: string | null;
//   setLoading: (v: string | null) => void;
//   onClose: () => void;
//   onSaved: (id: string, form: { charityName: string; address: string; description: string }) => void;
//   showMsg: (type: 'success' | 'error', text: string) => void;
// }) {
//   const [form, setForm] = useState({ charityName: '', address: '', description: '' });
//   const [errors, setErrors] = useState<Record<string, string>>({});

//   useEffect(() => {
//     if (target) {
//       setForm({
//         charityName: target.charityName ?? '',
//         address: target.address ?? '',
//         description: target.description ?? '',
//       });
//       setErrors({});
//     }
//   }, [target]);

//   if (!target) return null;

//   const validate = () => {
//     const e: Record<string, string> = {};
//     if (!form.charityName.trim() || form.charityName.trim().length < 3)
//       e.charityName = 'اسم الجمعية يجب أن يكون 3 أحرف على الأقل';
//     if (!form.address.trim() || form.address.trim().length < 5)
//       e.address = 'العنوان يجب أن يكون 5 أحرف على الأقل';
//     return e;
//   };

//   const isBusy = loading === 'edit-' + target._id;
//   const changed =
//     form.charityName  !== (target.charityName  ?? '') ||
//     form.address      !== (target.address      ?? '') ||
//     form.description  !== (target.description  ?? '');

//   const handleSave = async () => {
//     const e = validate();
//     if (Object.keys(e).length) { setErrors(e); return; }
//     setLoading('edit-' + target._id);
//     try {
//       await apiFetch(`/charity/${target._id}`, {
//         method: 'PATCH',
//         body: JSON.stringify({
//           charityName: form.charityName.trim(),
//           address: form.address.trim(),
//           description: form.description.trim(),
//         }),
//       });
//       onSaved(target._id, form);
//       showMsg('success', `تم تحديث "${form.charityName}" بنجاح`);
//       onClose();
//     } catch (err: unknown) {
//       showMsg('error', (err instanceof Error ? err.message : null) || 'فشل التحديث');
//     } finally { setLoading(null); }
//   };

//   return (
//     <div className="ap-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
//       <div className="ap-modal">
//         <div className="ap-modal-inner">
//           <div className="ap-modal-icon" style={{ background: TEAL2 + '22' }}>
//             <i className="ti ti-edit" style={{ color: TEAL2 }} />
//           </div>
//           <h3 className="ap-modal-title">تعديل بيانات الجمعية</h3>
//           <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>
//             <div className="ap-form-group">
//               <label className="ap-form-label">
//                 اسم الجمعية <span style={{ color: RED }}>*</span>
//               </label>
//               <input
//                 className={`ap-form-input${errors.charityName ? ' error' : ''}`}
//                 value={form.charityName}
//                 onChange={e => {
//                   setForm(f => ({ ...f, charityName: e.target.value }));
//                   setErrors(er => ({ ...er, charityName: '' }));
//                 }}
//                 placeholder="اسم الجمعية"
//               />
//               {errors.charityName && (
//                 <div className="ap-form-err">
//                   <i className="ti ti-alert-circle" />{errors.charityName}
//                 </div>
//               )}
//             </div>
//             <div className="ap-form-group">
//               <label className="ap-form-label">
//                 العنوان <span style={{ color: RED }}>*</span>
//               </label>
//               <input
//                 className={`ap-form-input${errors.address ? ' error' : ''}`}
//                 value={form.address}
//                 onChange={e => {
//                   setForm(f => ({ ...f, address: e.target.value }));
//                   setErrors(er => ({ ...er, address: '' }));
//                 }}
//                 placeholder="عنوان الجمعية"
//               />
//               {errors.address && (
//                 <div className="ap-form-err">
//                   <i className="ti ti-alert-circle" />{errors.address}
//                 </div>
//               )}
//             </div>
//             <div className="ap-form-group">
//               <label className="ap-form-label">
//                 الوصف{' '}
//                 <span style={{ fontSize: 11, color: 'var(--t4)', fontWeight: 400 }}>(اختياري)</span>
//               </label>
//               <textarea
//                 className="ap-form-textarea"
//                 rows={3}
//                 value={form.description}
//                 onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
//                 placeholder="وصف مختصر عن الجمعية..."
//               />
//             </div>
//           </div>
//           <div className="ap-info-box" style={{ marginBottom: 18 }}>
//             <div className="ap-info-row">
//               <span className="lbl">البريد الإلكتروني:</span>
//               <span className="val">{target.email}</span>
//             </div>
//             <div className="ap-info-row">
//               <span className="lbl">حالة الجمعية:</span>
//               <span className="val"><StatusBadge status={target.approvalStatus} /></span>
//             </div>
//             {target.licenseNumber && (
//               <div className="ap-info-row">
//                 <span className="lbl">رقم الترخيص:</span>
//                 <span className="val">{target.licenseNumber}</span>
//               </div>
//             )}
//           </div>
//           <div className="ap-modal-actions">
//             <button className="ap-modal-cancel" onClick={onClose} disabled={isBusy}>إلغاء</button>
//             <button
//               className="ap-modal-confirm"
//               disabled={isBusy || !changed}
//               style={{ background: TEAL2 }}
//               onClick={handleSave}
//             >
//               {isBusy && <i className="ti ti-loader-2 ti-spin" />}
//               {isBusy ? 'جاري الحفظ...' : 'حفظ التغييرات'}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function PageSkeleton() {
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
//     </div>
//   );
// }

// function DetailRow({ icon, label, value, mono, danger }: {
//   icon: string; label: string; value: string; mono?: boolean; danger?: boolean;
// }) {
//   return (
//     <div className="ap-detail-row">
//       <div className="ap-detail-row-icon"><i className={`ti ${icon}`} /></div>
//       <span className="ap-detail-row-label">{label}</span>
//       <span className={`ap-detail-row-val${mono ? ' mono' : ''}${danger ? ' danger' : ''}`}>
//         {value}
//       </span>
//     </div>
//   );
// }

// function EmptyState({ icon, title, desc }: { icon: string; title: string; desc?: string }) {
//   return (
//     <div className="ap-empty-state">
//       <div className="ap-empty-icon"><i className={`ti ${icon}`} /></div>
//       <div className="ap-empty-title">{title}</div>
//       {desc && <div className="ap-empty-desc">{desc}</div>}
//     </div>
//   );
// }

// function ErrorBanner({ msg, onRetry }: { msg: string; onRetry: () => void }) {
//   return (
//     <div className="ap-error-banner">
//       <i className="ti ti-alert-triangle" style={{ color: AMBER, fontSize: 20, flexShrink: 0 }} />
//       <div style={{ flex: 1 }}>
//         <div style={{ fontWeight: 700, marginBottom: 3, color: 'var(--t1)' }}>حدث خطأ</div>
//         <div style={{ fontSize: 13, color: 'var(--t3)' }}>{msg}</div>
//       </div>
//       <button className="ap-retry-btn" onClick={onRetry}>
//         <i className="ti ti-refresh" /> إعادة المحاولة
//       </button>
//     </div>
//   );
// }

// function SectionTitle({ icon, color, title, badge }: {
//   icon: string; color: string; title: string; badge?: number;
// }) {
//   return (
//     <div className="ap-section-title">
//       <i className={`ti ${icon}`} style={{ color }} />
//       {title}
//       {badge !== undefined && (
//         <span className="ap-count-badge" style={{ background: color }}>{badge}</span>
//       )}
//     </div>
//   );
// }

// function SearchBox({ value, onChange, placeholder }: {
//   value: string;
//   onChange: (v: string) => void;
//   placeholder?: string;
// }) {
//   return (
//     <div className="ap-search-wrap">
//       <i className="ti ti-search ap-search-icon" />
//       <input
//         className="ap-search-input"
//         value={value}
//         onChange={e => onChange(e.target.value)}
//         placeholder={placeholder ?? 'بحث...'}
//       />
//       {value && (
//         <button className="ap-search-clear" onClick={() => onChange('')}>
//           <i className="ti ti-x" />
//         </button>
//       )}
//     </div>
//   );
// }

// function LoadMoreBtn({ loading, remaining, onClick }: {
//   loading: boolean; remaining: number; onClick: () => void;
// }) {
//   return (
//     <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
//       <button className="ap-load-more-btn" onClick={onClick} disabled={loading}>
//         {loading
//           ? <><i className="ti ti-loader-2 ti-spin" /> جاري التحميل...</>
//           : <>تحميل المزيد {remaining > 0 && `(${remaining})`}</>
//         }
//       </button>
//     </div>
//   );
// }

// function KpiCard({ icon, label, value, change, changeDir, color }: {
//   icon: string; label: string; value: string | number;
//   change?: string; changeDir?: 'up' | 'down' | 'neutral'; color: string;
// }) {
//   return (
//     <div className="ap-kpi-card" style={{ '--kpi-color': color } as React.CSSProperties}>
//       <div className="ap-kpi-icon-wrap"><i className={`ti ${icon}`} /></div>
//       <div className="ap-kpi-value">{value}</div>
//       <div className="ap-kpi-label">{label}</div>
//       {change && (
//         <div className={`ap-kpi-change ${changeDir ?? 'neutral'}`}>{change}</div>
//       )}
//     </div>
//   );
// }

// function ChartTooltip({ active, payload, label }: {
//   active?: boolean;
//   payload?: { value: number; name: string }[];
//   label?: string;
// }) {
//   if (!active || !payload?.length) return null;
//   return (
//     <div className="ap-chart-tooltip">
//       <div className="ap-chart-tooltip-label">{label}</div>
//       {payload.map((p, i) => (
//         <div key={i} className="ap-chart-tooltip-row">
//           <span>{p.name}</span>
//           <span style={{ fontWeight: 700 }}>{p.value.toLocaleString('en-US')}</span>
//         </div>
//       ))}
//     </div>
//   );
// }

// function CronCard({ icon, iconBg, iconColor, title, desc, code, codeBg, codeBorder, codeColor, loading, btnColor, onRun }: {
//   icon: string; iconBg: string; iconColor: string;
//   title: string; desc: string; code: string;
//   codeBg: string; codeBorder: string; codeColor: string;
//   loading: boolean; btnColor: string; onRun: () => void;
// }) {
//   return (
//     <div className="ap-cron-card">
//       <div className="ap-cron-icon" style={{ background: iconBg }}>
//         <i className={`ti ${icon}`} style={{ color: iconColor }} />
//       </div>
//       <div className="ap-cron-title">{title}</div>
//       <p className="ap-cron-desc">{desc}</p>
//       <code className="ap-cron-code" style={{ background: codeBg, borderColor: codeBorder, color: codeColor }}>
//         {code}
//       </code>
//       <button
//         className="ap-cron-run-btn"
//         style={{ background: btnColor }}
//         disabled={loading}
//         onClick={onRun}
//       >
//         {loading
//           ? <><i className="ti ti-loader-2 ti-spin" />جاري التشغيل...</>
//           : <><i className="ti ti-player-play" />تشغيل الآن</>
//         }
//       </button>
//     </div>
//   );
// }

// export default function AdminPanel() {
//   const { user, logout } = useAuth();
//   const [, navigate] = useLocation();
//   const [tab, setTab] = useState<Tab>('overview');

//   // ─── View Modes State ──────────────────────────────────────────────────────
//   const [usersViewMode, setUsersViewMode] = useState<ViewMode>('table');
//   const [charitiesViewMode, setCharitiesViewMode] = useState<ViewMode>('cards');
//   const [reportsViewMode, setReportsViewMode] = useState<ViewMode>('cards');

//   // ─── Theme Mode Logic ──────────────────────────────────────────────────────
//   const [theme, setTheme] = useState<ThemeMode>(() => {
//     try {
//       return (localStorage.getItem('ap-theme') as ThemeMode) || 'light';
//     } catch { return 'dark'; }
//   });

//   useEffect(() => {
//     try {
//       localStorage.setItem('ap-theme', theme);
//       // تحديث كلاس الـ body لتطبيق الستايل على كامل الصفحة
//       if (theme === 'light') {
//         document.body.classList.add('ap-light-theme');
//       } else {
//         document.body.classList.remove('ap-light-theme');
//       }
//     } catch { /* ignore */ }
//   }, [theme]);

//   const toggleTheme = () => {
//     setTheme(prev => prev === 'dark' ? 'light' : 'dark');
//   };

//   const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
//     try {
//       return localStorage.getItem('ap-sidebar-collapsed') === 'true';
//     } catch { return false; }
//   });

//   const handleToggleSidebar = () => {
//     setSidebarCollapsed(v => {
//       const next = !v;
//       try { localStorage.setItem('ap-sidebar-collapsed', String(next)); } catch { /* ignore */ }
//       return next;
//     });
//   };

//   const [users,      setUsers]     = useState<User[]>([]);
//   const [charities, setCharities] = useState<Charity[]>([]);
//   const [reports,    setReports]   = useState<Report[]>([]);

//   const [usersTotal,      setUsersTotal]     = useState(0);
//   const [charitiesTotal, setCharitiesTotal] = useState(0);
//   const [reportsTotal,    setReportsTotal]   = useState(0);

//   const [usersPage,      setUsersPage]     = useState(1);
//   const [charitiesPage, setCharitiesPage] = useState(1);
//   const [reportsPage,    setReportsPage]   = useState(1);

//   const [hasMoreUsers,       setHasMoreUsers]       = useState(false);
//   const [hasMoreCharities,   setHasMoreCharities]   = useState(false);
//   const [hasMoreReports,     setHasMoreReports]     = useState(false);
//   const [charitiesRemaining, setCharitiesRemaining] = useState(0);
//   const [loadingMore,        setLoadingMore]        = useState<string | null>(null);

//   const [loading,       setLoading]       = useState(true);
//   const [error,         setError]         = useState<string | null>(null);
//   const [actionLoading, setActionLoading] = useState<string | null>(null);
//   const [toast,         setToast]         = useState<{ type: 'success' | 'error'; text: string } | null>(null);
//   const [confirmOpts,   setConfirmOpts]   = useState<ConfirmState | null>(null);
//   const [confirmLoading,setConfirmLoading]= useState(false);
//   const [rejectTarget,  setRejectTarget]  = useState<{ id: string; name: string } | null>(null);
//   const [rejectLoading, setRejectLoading] = useState(false);
//   const [editCharityTarget,  setEditCharityTarget]  = useState<Charity | null>(null);
//   const [userDetailModal,    setUserDetailModal]    = useState<User | null>(null);
//   const [reportModal,        setReportModal]        = useState<Report | null>(null);
//   const [charityDetailModal, setCharityDetailModal] = useState<Charity | null>(null);

//   const [usersSearch,     setUsersSearch]     = useState('');
//   const [charitiesSearch, setCharitiesSearch] = useState('');
//   const [reportsSearch,   setReportsSearch]   = useState('');
//   const [charitiesFilter, setCharitiesFilter] = useState<string>('all');

//   const [cronLoading, setCronLoading] = useState({ reminder: false, report: false });
//   const [cronLog, setCronLog]         = useState<{ type: 'success' | 'error'; text: string; time: string }[]>([]);
//   const [lastRun, setLastRun]         = useState<string | null>(null);

//   useEffect(() => {
//     const tick = () => {
//       const el = document.getElementById('ap-clock');
//       if (el) {
//         el.textContent = new Date().toLocaleTimeString('ar-EG', {
//           hour: '2-digit', minute: '2-digit',
//         });
//       }
//     };
//     tick();
//     const id = setInterval(tick, 30_000);
//     return () => clearInterval(id);
//   }, []);

//   const showMsg = useCallback((type: 'success' | 'error', text: string) => {
//     setToast({ type, text });
//     setTimeout(() => setToast(null), 3500);
//   }, []);

//   const loadData = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     setUsersPage(1);
//     setCharitiesPage(1);
//     setReportsPage(1);

//     try {
//       const [uRes, cRes, rRes] = await Promise.allSettled([
//         fetchPage<User>('/users', 1, 10),
//         fetchPage<Charity>('/charity/charities', 1, 10),
//         fetchPage<Report>('/report/allReports', 1, 10),
//       ]);

//       if (uRes.status === 'fulfilled') {
//         setUsers(uRes.value.data ?? []);
//         setUsersTotal(uRes.value.total ?? 0);
//         setHasMoreUsers(uRes.value.hasMore ?? false);
//       }
//       if (cRes.status === 'fulfilled') {
//         setCharities(cRes.value.data ?? []);
//         setCharitiesTotal(cRes.value.total ?? 0);
//         setHasMoreCharities(cRes.value.hasMore ?? false);
//         setCharitiesRemaining(
//           Math.max(0, (cRes.value.total ?? 0) - (cRes.value.data?.length ?? 0))
//         );
//       }
//       if (rRes.status === 'fulfilled') {
//         setReports(rRes.value.data ?? []);
//         setReportsTotal(rRes.value.total ?? 0);
//         setHasMoreReports(rRes.value.hasMore ?? false);
//       }

//       const failures = [uRes, cRes, rRes].filter(r => r.status === 'rejected') as PromiseRejectedResult[];
//       if (failures.length === 3) {
//         throw new Error((failures[0].reason instanceof Error ? failures[0].reason.message : null) || 'فشل تحميل البيانات');
//       }
//     } catch (e: unknown) {
//       const status = (e as { status?: number })?.status;
//       if (status === 401) {
//         setTimeout(() => logout?.(), 1500);
//       }
//       setError((e instanceof Error ? e.message : null) || 'فشل تحميل البيانات');
//     } finally {
//       setLoading(false);
//     }
//   }, [logout]);

//   useEffect(() => { loadData(); }, [loadData]);

//   const loadMoreUsers = async () => {
//     const next = usersPage + 1;
//     setLoadingMore('users');
//     try {
//       const res = await fetchPage<User>('/users', next, 10);
//       if (!res.data?.length) { setHasMoreUsers(false); return; }
//       setUsers(prev => {
//         const ids = new Set(prev.map(u => u._id));
//         return [...prev, ...res.data.filter(u => !ids.has(u._id))];
//       });
//       setUsersPage(next);
//       setHasMoreUsers(res.hasMore ?? false);
//     } finally { setLoadingMore(null); }
//   };

//   const loadMoreCharities = async () => {
//     const next = charitiesPage + 1;
//     setLoadingMore('charities');
//     try {
//       const res = await fetchPage<Charity>('/charity/charities', next, 10);
//       if (!res.data?.length) { setHasMoreCharities(false); return; }
//       setCharities(prev => {
//         const ids = new Set(prev.map(c => c._id));
//         return [...prev, ...res.data.filter(c => !ids.has(c._id))];
//       });
//       setCharitiesPage(next);
//       setHasMoreCharities(res.hasMore ?? false);
//       setCharitiesRemaining(Math.max(0, (res.total ?? 0) - (charities.length + res.data.length)));
//     } finally { setLoadingMore(null); }
//   };

//   const loadMoreReports = async () => {
//     const next = reportsPage + 1;
//     setLoadingMore('reports');
//     try {
//       const res = await fetchPage<Report>('/report/allReports', next, 10);
//       if (!res.data?.length) { setHasMoreReports(false); return; }
//       setReports(prev => {
//         const ids = new Set(prev.map(r => r._id));
//         return [...prev, ...res.data.filter(r => !ids.has(r._id))];
//       });
//       setReportsPage(next);
//       setHasMoreReports(res.hasMore ?? false);
//     } finally { setLoadingMore(null); }
//   };

//   const handleDeleteUser = (id: string, name: string) => {
//     setConfirmOpts({
//       title: `حذف المستخدم "${name}"`,
//       message: 'هذا الإجراء لا يمكن التراجع عنه. سيتم حذف الحساب نهائيًا.',
//       confirmLabel: 'حذف', variant: 'danger', icon: 'ti-user-off',
//       onConfirm: async () => {
//         setConfirmLoading(true);
//         try {
//           await apiFetch(`/users/${id}`, { method: 'DELETE' });
//           setUsers(prev => prev.filter(u => u._id !== id));
//           showMsg('success', `تم حذف "${name}" بنجاح`);
//         } catch (e: unknown) {
//           showMsg('error', (e instanceof Error ? e.message : null) || 'فشل الحذف');
//         } finally { setConfirmLoading(false); setConfirmOpts(null); }
//       },
//     });
//   };

//   const handleApprove = async (id: string, name: string) => {
//     setActionLoading('approve-' + id);
//     try {
//       await apiFetch(`/charity/${id}/approve`, { method: 'PATCH' });
//       setCharities(prev =>
//         prev.map(c => c._id === id ? { ...c, approvalStatus: 'approved' as ApprovalStatus } : c)
//       );
//       showMsg('success', `تمت الموافقة على "${name}"`);
//     } catch (e: unknown) {
//       showMsg('error', (e instanceof Error ? e.message : null) || 'فشلت الموافقة');
//     } finally { setActionLoading(null); }
//   };

//   const handleReject = async (reason: string) => {
//     if (!rejectTarget) return;
//     setRejectLoading(true);
//     try {
//       await apiFetch(`/charity/${rejectTarget.id}/reject`, {
//         method: 'PATCH',
//         body: JSON.stringify({ rejectionReason: reason }),
//       });
//       setCharities(prev =>
//         prev.map(c =>
//           c._id === rejectTarget.id ? { ...c, approvalStatus: 'rejected' as ApprovalStatus } : c
//         )
//       );
//       showMsg('success', `تم رفض "${rejectTarget.name}"`);
//     } catch (e: unknown) {
//       showMsg('error', (e instanceof Error ? e.message : null) || 'فشل الرفض');
//     } finally { setRejectLoading(false); setRejectTarget(null); }
//   };

//   const handleDeleteCharity = (id: string, name: string) => {
//     setConfirmOpts({
//       title: `حذف جمعية "${name}"`,
//       message: 'هذا الإجراء لا يمكن التراجع عنه.',
//       confirmLabel: 'حذف', variant: 'danger', icon: 'ti-building-off',
//       onConfirm: async () => {
//         setConfirmLoading(true);
//         try {
//           await apiFetch(`/charity/${id}`, { method: 'DELETE' });
//           setCharities(prev => prev.filter(c => c._id !== id));
//           showMsg('success', `تم حذف "${name}" بنجاح`);
//         } catch (e: unknown) {
//           showMsg('error', (e instanceof Error ? e.message : null) || 'فشل الحذف');
//         } finally { setConfirmLoading(false); setConfirmOpts(null); }
//       },
//     });
//   };

//   const runDonationReminder = async () => {
//     setCronLoading(p => ({ ...p, reminder: true }));
//     const time = new Date().toLocaleTimeString('ar-EG');
//     try {
//       await apiFetch('/cron/donationReminder');
//       setCronLog(p => [{ type: 'success', text: 'تذكير التبرعات: تم التشغيل بنجاح', time }, ...p]);
//       setLastRun(new Date().toISOString());
//       showMsg('success', 'تم تشغيل تذكير التبرعات');
//     } catch (e: unknown) {
//       const msg = (e instanceof Error ? e.message : null) || 'فشل';
//       setCronLog(p => [{ type: 'error', text: `تذكير التبرعات: ${msg}`, time }, ...p]);
//       showMsg('error', 'فشل تشغيل التذكير');
//     } finally { setCronLoading(p => ({ ...p, reminder: false })); }
//   };

//   const runAdminReport = async () => {
//     setCronLoading(p => ({ ...p, report: true }));
//     const time = new Date().toLocaleTimeString('ar-EG');
//     try {
//       await apiFetch('/cron/adminReport');
//       setCronLog(p => [{ type: 'success', text: 'تقرير الأدمن: تم الإرسال بنجاح', time }, ...p]);
//       setLastRun(new Date().toISOString());
//       showMsg('success', 'تم إرسال تقرير الأدمن');
//     } catch (e: unknown) {
//       const msg = (e instanceof Error ? e.message : null) || 'فشل';
//       setCronLog(p => [{ type: 'error', text: `تقرير الأدمن: ${msg}`, time }, ...p]);
//       showMsg('error', 'فشل إرسال التقرير');
//     } finally { setCronLoading(p => ({ ...p, report: false })); }
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
//           navigate('/login');
//         } finally {
//           setConfirmLoading(false);
//           setConfirmOpts(null);
//         }
//       },
//     });
//   };

//   const [profileForm, setProfileForm] = useState({ userName: '', phone: '', address: '' });
//   const [passForm, setPassForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
//   const [settingsSaving, setSettingsSaving] = useState(false);

//   useEffect(() => {
//     if (user) {
//       setProfileForm({
//         userName: user.userName || '',
//         phone: (user as any).phone || '',
//         address: (user as any).address || '',
//       });
//     }
//   }, [user]);

//   const { refreshUser } = useAuth();

//   const saveProfile = async () => {
//     if (!profileForm.userName.trim()) { showMsg('error', 'اسم المستخدم مطلوب'); return; }
//     setSettingsSaving(true);
//     try {
//       await usersApi.updateProfile(profileForm);
//       await refreshUser();
//       showMsg('success', 'تم تحديث الملف الشخصي بنجاح');
//     } catch (err: unknown) {
//       showMsg('error', err instanceof Error ? err.message : 'حدث خطأ');
//     } finally { setSettingsSaving(false); }
//   };

//   const savePassword = async () => {
//     if (!passForm.oldPassword || !passForm.newPassword) {
//       showMsg('error', 'يرجى ملء جميع الحقول');
//       return;
//     }
//     if (passForm.newPassword !== passForm.confirmPassword) {
//       showMsg('error', 'كلمتا المرور غير متطابقتين');
//       return;
//     }
//     setSettingsSaving(true);
//     try {
//       await usersApi.changePassword(passForm);
//       setPassForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
//       showMsg('success', 'تم تغيير كلمة المرور بنجاح');
//     } catch (err: unknown) {
//       showMsg('error', err instanceof Error ? err.message : 'حدث خطأ');
//     } finally { setSettingsSaving(false); }
//   };

//   const filteredUsers = users.filter(u => {
//     if (!usersSearch) return true;
//     const q = usersSearch.toLowerCase();
//     return (
//       u.userName?.toLowerCase().includes(q) ||
//       u.email?.toLowerCase().includes(q) ||
//       u.roleType?.toLowerCase().includes(q)
//     );
//   });

//   const filteredCharities = charities
//     .filter(c => charitiesFilter === 'all' || c.approvalStatus === charitiesFilter)
//     .filter(c => {
//       if (!charitiesSearch) return true;
//       const q = charitiesSearch.toLowerCase();
//       return (
//         c.charityName?.toLowerCase().includes(q) ||
//         c.email?.toLowerCase().includes(q)
//       );
//     });

//   const filteredReports = reports.filter(r => {
//     if (!reportsSearch) return true;
//     const q = reportsSearch.toLowerCase();
//     return (
//       r.description?.toLowerCase().includes(q) ||
//       r.userName?.toLowerCase().includes(q)    ||
//       r.charityName?.toLowerCase().includes(q)
//     );
//   });

//   const pendingCount = charities.filter(c => c.approvalStatus === 'pending').length;

//   const MONTHS_AR = [
//   'يناير','فبراير','مارس','أبريل','مايو','يونيو',
//   'يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'
// ];

// const trendData = useMemo(() => {
//   const currentYear = new Date().getFullYear();
//   const currentMonth = new Date().getMonth();

//   const usersByMonth = Array(12).fill(0);
//   users.forEach(u => {
//     if (u.createdAt) {
//       const d = new Date(u.createdAt);
//       if (d.getFullYear() === currentYear)
//         usersByMonth[d.getMonth()]++;
//     }
//   });

//   const charitiesByMonth = Array(12).fill(0);
//   charities.forEach(c => {
//     if (c.createdAt) {
//       const d = new Date(c.createdAt);
//       if (d.getFullYear() === currentYear)
//         charitiesByMonth[d.getMonth()]++;
//     }
//   });

//   return Array.from({ length: currentMonth + 1 }, (_, i) => ({
//     name: MONTHS_AR[i],
//     users: usersByMonth[i],
//     charities: charitiesByMonth[i],
//   })).filter(m => m.users > 0 || m.charities > 0);
// }, [users, charities]);

//   const approvalPieData = [
//     { name: 'موافق عليها', value: charities.filter(c => c.approvalStatus === 'approved').length },
//     { name: 'معلقة',       value: charities.filter(c => c.approvalStatus === 'pending').length  },
//     { name: 'مرفوضة',     value: charities.filter(c => c.approvalStatus === 'rejected').length  },
//   ].filter(d => d.value > 0);
//   const PIE_COLORS = [TEAL2, AMBER, RED];

//   const userName = user?.userName ?? user?.email?.split('@')[0] ?? 'مسؤول';

//   return (
//     <div className="ap-layout" dir="rtl">
//       <Sidebar
//         activeTab={tab}
//         onTabChange={setTab}
//         userName={userName}
//         onLogout={handleLogout}
//         pendingCount={pendingCount}
//         collapsed={sidebarCollapsed}
//         onToggleCollapse={handleToggleSidebar}
//       />

//       <main className={`ap-main${tab === 'ai-chat' ? ' ap-main--ai' : ''}`}>
//         {tab !== 'ai-chat' && (
//           <header className="ap-page-header">
//             <div className="ap-page-header-left">
//               <div className="ap-page-breadcrumb">
//                 <i className="ti ti-shield-check" style={{ color: TEAL2 }} />
//                 <span>لوحة التحكم</span>
//                 <i className="ti ti-chevron-left" style={{ fontSize: 12, color: 'var(--t4)' }} />
//                 <span style={{ color: 'var(--t1)', fontWeight: 700 }}>
//                   {NAV_ITEMS.find(n => n.id === tab)?.label}
//                 </span>
//               </div>
//             </div>
//             <div className="ap-page-header-right">
//               {/* زر تبديل الثيم المباشر في الناف بار */}
//               <button 
//                 className="ap-header-icon-btn ap-theme-btn" 
//                 onClick={toggleTheme} 
//                 title={theme === 'dark' ? 'تفعيل الوضع النهارى' : 'تفعيل الوضع الليلي'}
//               >
//                 <i className={`ti ${theme === 'dark' ? 'ti-sun' : 'ti-moon'}`} />
//               </button>
//               <button className="ap-header-icon-btn" onClick={loadData} title="تحديث البيانات">
//                 <i className="ti ti-refresh" />
//               </button>
//               <div className="ap-header-user" onClick={() => setTab('settings')} title="الإعدادات">
//                 <div className="ap-header-avatar">{userName.slice(0, 1).toUpperCase()}</div>
//                 <span className="ap-header-username-text">{userName}</span>
//                 <i className="ti ti-settings" style={{ fontSize: 13, color: 'var(--t4)' }} />
//               </div>
//             </div>
//           </header>
//         )}

//         <div className={`ap-content${tab === 'ai-chat' ? ' ap-content--ai' : ''}`}>
//           {error && !loading && <ErrorBanner msg={error} onRetry={loadData} />}

//           {loading ? <PageSkeleton /> : (
//             <>
//               {/* ══ OVERVIEW ══════════════════════════════════════════════════ */}
//               {tab === 'overview' && (
//                 <div className="ap-tab-pane">
//                   <div className="ap-kpi-grid">
//                     <KpiCard icon="ti-users" label="إجمالي المستخدمين" value={(usersTotal || users.length).toLocaleString('ar-EG')} change="+12.5% هذا الشهر" changeDir="up" color={TEAL2} />
//                     <KpiCard icon="ti-building-community" label="الجمعيات المسجلة" value={(charitiesTotal || charities.length).toLocaleString('ar-EG')} change="+3 جديد" changeDir="up" color="#3b82f6" />
//                     <KpiCard icon="ti-alert-circle" label="التقارير الواردة" value={(reportsTotal || reports.length).toLocaleString('ar-EG')} change={pendingCount > 0 ? `${pendingCount} معلق` : 'لا يوجد معلق'} changeDir={pendingCount > 0 ? 'down' : 'neutral'} color={AMBER} />
//                     <KpiCard icon="ti-clock-pause" label="جمعيات معلقة" value={pendingCount.toLocaleString('ar-EG')} change={pendingCount > 0 ? 'تحتاج مراجعة' : 'الكل جاهز'} changeDir={pendingCount > 0 ? 'down' : 'neutral'} color={RED} />
//                   </div>

//                   <div className="ap-charts-row">
//                     <div className="ap-chart-card ap-chart-card--wide">
//                       <div className="ap-chart-header">
//                         <span className="ap-chart-title"><i className="ti ti-trending-up" style={{ color: TEAL2 }} />نمو المستخدمين والجمعيات</span>
//                         <span className="ap-chart-trend up">↑ 12.5%</span>
//                       </div>
//                       <ResponsiveContainer width="100%" height={220}>
//                         <AreaChart data={trendData} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
//                           <defs>
//                             <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
//                               <stop offset="0%" stopColor={TEAL2} stopOpacity={0.32} />
//                               <stop offset="100%" stopColor={TEAL2} stopOpacity={0.02} />
//                             </linearGradient>
//                             <linearGradient id="gradCharities" x1="0" y1="0" x2="0" y2="1">
//                               <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.28} />
//                               <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
//                             </linearGradient>
//                           </defs>
//                           <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
//                           <XAxis dataKey="name" tick={{ fill: 'var(--t3)', fontSize: 11 }} axisLine={false} tickLine={false} />
//                           <YAxis tick={{ fill: 'var(--t3)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
//                           <Tooltip content={<ChartTooltip />} />
//                           <Area type="monotone" dataKey="users" name="المستخدمون" stroke={TEAL2} strokeWidth={2.5} fill="url(#gradUsers)" dot={false} />
//                           <Area type="monotone" dataKey="charities" name="الجمعيات" stroke="#3b82f6" strokeWidth={2.5} fill="url(#gradCharities)" dot={false} />
//                         </AreaChart>
//                       </ResponsiveContainer>
//                     </div>

//                     {approvalPieData.length > 0 && (
//                       <div className="ap-chart-card">
//                         <div className="ap-chart-header">
//                           <span className="ap-chart-title"><i className="ti ti-chart-donut" style={{ color: AMBER }} />حالة الجمعيات</span>
//                         </div>
//                         <ResponsiveContainer width="100%" height={210}>
//                           <PieChart>
//                             <Pie data={approvalPieData} cx="50%" cy="50%" innerRadius={52} outerRadius={82} paddingAngle={4} dataKey="value">
//                               {approvalPieData.map((_, index) => (
//                                 <Cell key={index} fill={PIE_COLORS[index]} strokeWidth={0} />
//                               ))}
//                             </Pie>
//                             <Tooltip formatter={(v: number, n: string) => [v, n]} contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 10, color: 'var(--t1)', fontSize: 12, fontFamily: 'Tajawal, sans-serif' }} />
//                           </PieChart>
//                         </ResponsiveContainer>
//                         <div className="ap-pie-legend">
//                           {approvalPieData.map((d, i) => (
//                             <div key={i} className="ap-pie-legend-item">
//                               <span className="ap-pie-legend-dot" style={{ background: PIE_COLORS[i] }} />
//                               <span>{d.name}</span>
//                               <span style={{ fontWeight: 700, marginRight: 'auto' }}>{d.value}</span>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {/* ══ USERS ══════════════════════════════════════════════════════ */}
//               {tab === 'users' && (
//                 <div className="ap-tab-pane">
//                   <div className="ap-section-header">
//                     <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
//                       <SectionTitle icon="ti-users" color={TEAL2} title="المستخدمون" badge={usersTotal || users.length} />
//                       <ViewToggle mode={usersViewMode} onChange={setUsersViewMode} />
//                     </div>
//                     <SearchBox value={usersSearch} onChange={setUsersSearch} placeholder="بحث بالاسم أو البريد..." />
//                   </div>

//                   {filteredUsers.length === 0 ? (
//                     <EmptyState icon="ti-user-off" title="لا يوجد مستخدمون" desc="لم يتم العثور على مستخدمين مطابقين للبحث" />
//                   ) : usersViewMode === 'table' ? (
//                     <div className="ap-table-wrap">
//                       <table className="ap-table">
//                         <thead>
//                           <tr>
//                             {['المستخدم', 'البريد الإلكتروني', 'الدور', 'موثق', 'تاريخ الانضمام', ''].map((h, i) => (
//                               <th key={i}>{h}</th>
//                             ))}
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {filteredUsers.map(u => {
//                             const verified = u.isVerified || u.verify;
//                             return (
//                               <tr key={u._id} className="ap-table-row-clickable" onClick={() => setUserDetailModal(u)}>
//                                 <td>
//                                   <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//                                     <div className="ap-table-avatar">
//                                       {u.userName?.slice(0, 1).toUpperCase() ?? '?'}
//                                     </div>
//                                     <span style={{ fontWeight: 600, color: 'var(--t1)' }}>{u.userName}</span>
//                                   </div>
//                                 </td>
//                                 <td className="ap-table-mono">{u.email}</td>
//                                 <td><RoleBadge role={u.roleType} /></td>
//                                 <td>
//                                   <span className="ap-badge" style={{ background: verified ? 'rgba(34,197,94,0.14)' : 'rgba(244,63,94,0.14)', color: verified ? '#22c55e' : RED }}>
//                                     <i className={`ti ${verified ? 'ti-circle-check' : 'ti-circle-x'}`} style={{ fontSize: 12 }} />
//                                     {verified ? 'موثق' : 'غير موثق'}
//                                   </span>
//                                 </td>
//                                 <td style={{ color: 'var(--t3)', fontSize: 12 }}>{fmt(u.createdAt)}</td>
//                                 <td onClick={e => e.stopPropagation()}>
//                                   <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
//                                     <button className="ap-eye-btn" onClick={() => setUserDetailModal(u)} title="عرض التفاصيل">
//                                       <i className="ti ti-eye" />
//                                     </button>
//                                     {u.roleType !== 'admin' && (
//                                       <button className="ap-action-btn delete" onClick={() => handleDeleteUser(u._id, u.userName)}>
//                                         <i className="ti ti-trash" />
//                                       </button>
//                                     )}
//                                   </div>
//                                 </td>
//                               </tr>
//                             );
//                           })}
//                         </tbody>
//                       </table>
//                     </div>
//                   ) : (
//                     <div className="ap-card-grid">
//                       {filteredUsers.map(u => {
//                         const verified = u.isVerified || u.verify;
//                         return (
//                           <div key={u._id} className="ap-entity-card" onClick={() => setUserDetailModal(u)}>
//                             <div className="ap-entity-card-header">
//                               <div className="ap-entity-avatar user">{u.userName?.slice(0, 1).toUpperCase()}</div>
//                               <div style={{ flex: 1, minWidth: 0 }}>
//                                 <div className="ap-entity-name">{u.userName}</div>
//                                 <div className="ap-entity-email">{u.email}</div>
//                               </div>
//                             </div>
//                             <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
//                               <RoleBadge role={u.roleType} />
//                               <span className="ap-badge" style={{ background: verified ? 'rgba(34,197,94,0.14)' : 'rgba(244,63,94,0.14)', color: verified ? '#22c55e' : RED }}>
//                                 {verified ? 'موثق' : 'غير موثق'}
//                               </span>
//                             </div>
//                             <div className="ap-entity-date"><i className="ti ti-calendar" />{fmt(u.createdAt)}</div>
//                             <div className="ap-entity-actions" onClick={e => e.stopPropagation()}>
//                               <button className="ap-card-eye-btn" onClick={() => setUserDetailModal(u)}>
//                                 <i className="ti ti-eye" /> التفاصيل
//                               </button>
//                               {u.roleType !== 'admin' && (
//                                 <button className="ap-action-btn delete" onClick={() => handleDeleteUser(u._id, u.userName)}>
//                                   <i className="ti ti-trash" /> حذف
//                                 </button>
//                               )}
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   )}

//                   {hasMoreUsers && (
//                     <LoadMoreBtn loading={loadingMore === 'users'} remaining={Math.max(0, usersTotal - users.length)} onClick={loadMoreUsers} />
//                   )}
//                 </div>
//               )}

//               {/* ══ CHARITIES ══════════════════════════════════════════════════ */}
//               {tab === 'charities' && (
//                 <div className="ap-tab-pane">
//                   <div className="ap-section-header">
//                     <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
//                       <SectionTitle icon="ti-building-community" color="#3b82f6" title="الجمعيات" badge={charitiesTotal || charities.length} />
//                       <ViewToggle mode={charitiesViewMode} onChange={setCharitiesViewMode} />
//                     </div>
//                     <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
//                       <div className="ap-filter-tabs">
//                         {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
//                           <button key={f} className={`ap-filter-tab${charitiesFilter === f ? ' active' : ''}`} onClick={() => setCharitiesFilter(f)}>
//                             {f === 'all' ? 'الكل' : f === 'pending' ? 'معلق' : f === 'approved' ? 'موافق' : 'مرفوض'}
//                             {f === 'pending' && pendingCount > 0 && (
//                               <span className="ap-filter-badge">{pendingCount}</span>
//                             )}
//                           </button>
//                         ))}
//                       </div>
//                       <SearchBox value={charitiesSearch} onChange={setCharitiesSearch} placeholder="بحث في الجمعيات..." />
//                     </div>
//                   </div>

//                   {filteredCharities.length === 0 ? (
//                     <EmptyState icon="ti-building-off" title="لا توجد جمعيات" desc="لم يتم العثور على جمعيات مطابقة" />
//                   ) : charitiesViewMode === 'table' ? (
//                     <div className="ap-table-wrap">
//                       <table className="ap-table">
//                         <thead>
//                           <tr>
//                             {['الجمعية', 'البريد الإلكتروني', 'العنوان', 'الحالة', 'تاريخ التسجيل', ''].map((h, i) => (
//                               <th key={i}>{h}</th>
//                             ))}
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {filteredCharities.map(c => (
//                             <tr key={c._id} className="ap-table-row-clickable" onClick={() => setCharityDetailModal(c)}>
//                               <td>
//                                 <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//                                   <div className="ap-table-avatar" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>
//                                     <i className="ti ti-building-community" />
//                                   </div>
//                                   <span style={{ fontWeight: 600, color: 'var(--t1)' }}>{c.charityName}</span>
//                                 </div>
//                               </td>
//                               <td className="ap-table-mono">{c.email}</td>
//                               <td>{c.address || '—'}</td>
//                               <td><StatusBadge status={c.approvalStatus} /></td>
//                               <td style={{ color: 'var(--t3)', fontSize: 12 }}>{fmt(c.createdAt)}</td>
//                               <td onClick={e => e.stopPropagation()}>
//                                 <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
//                                   <button className="ap-eye-btn" onClick={() => setCharityDetailModal(c)}>
//                                     <i className="ti ti-eye" />
//                                   </button>
//                                   {c.approvalStatus === 'pending' && (
//                                     <>
//                                       <button className="ap-action-btn approve" onClick={() => handleApprove(c._id, c.charityName)}>
//                                         <i className="ti ti-check" />
//                                       </button>
//                                       <button className="ap-action-btn reject" onClick={() => setRejectTarget({ id: c._id, name: c.charityName })}>
//                                         <i className="ti ti-x" />
//                                       </button>
//                                     </>
//                                   )}
//                                   <button className="ap-action-btn edit" onClick={() => setEditCharityTarget(c)}>
//                                     <i className="ti ti-edit" />
//                                   </button>
//                                   <button className="ap-action-btn delete" onClick={() => handleDeleteCharity(c._id, c.charityName)}>
//                                     <i className="ti ti-trash" />
//                                   </button>
//                                 </div>
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   ) : (
//                     <div className="ap-card-grid">
//                       {filteredCharities.map(c => (
//                         <div key={c._id} className="ap-entity-card" onClick={() => setCharityDetailModal(c)}>
//                           <div className="ap-entity-card-header">
//                             <div className="ap-entity-avatar charity"><i className="ti ti-building-community" /></div>
//                             <div style={{ flex: 1, minWidth: 0 }}>
//                               <div className="ap-entity-name">{c.charityName}</div>
//                               <div className="ap-entity-email">{c.email}</div>
//                             </div>
//                           </div>
//                           <div style={{ marginBottom: 10 }}>
//                             <StatusBadge status={c.approvalStatus} />
//                           </div>
//                           {c.address && <div className="ap-entity-meta"><i className="ti ti-map-pin" />{c.address}</div>}
//                           <div className="ap-entity-date"><i className="ti ti-calendar" />{fmt(c.createdAt)}</div>
//                           <div className="ap-entity-actions" onClick={e => e.stopPropagation()}>
//                             <button className="ap-card-eye-btn" onClick={() => setCharityDetailModal(c)}>
//                               <i className="ti ti-eye" /> تفاصيل
//                             </button>
//                             {c.approvalStatus === 'pending' && (
//                               <>
//                                 <button className="ap-action-btn approve" disabled={!!actionLoading} onClick={() => handleApprove(c._id, c.charityName)}>
//                                   <i className="ti ti-check" /> موافقة
//                                 </button>
//                                 <button className="ap-action-btn reject" disabled={!!actionLoading} onClick={() => setRejectTarget({ id: c._id, name: c.charityName })}>
//                                   <i className="ti ti-x" /> رفض
//                                 </button>
//                               </>
//                             )}
//                             <button className="ap-action-btn edit" onClick={() => setEditCharityTarget(c)}>
//                               <i className="ti ti-edit" />
//                             </button>
//                             <button className="ap-action-btn delete" disabled={!!actionLoading} onClick={() => handleDeleteCharity(c._id, c.charityName)}>
//                               <i className="ti ti-trash" />
//                             </button>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}

//                   {hasMoreCharities && (
//                     <LoadMoreBtn loading={loadingMore === 'charities'} remaining={charitiesRemaining} onClick={loadMoreCharities} />
//                   )}
//                 </div>
//               )}

//               {/* ══ REPORTS ══════════════════════════════════════════════════ */}
//               {tab === 'reports' && (
//                 <div className="ap-tab-pane">
//                   <div className="ap-section-header">
//                     <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
//                       <SectionTitle icon="ti-alert-circle" color={AMBER} title="التقارير" badge={reportsTotal || reports.length} />
//                       <ViewToggle mode={reportsViewMode} onChange={setReportsViewMode} />
//                     </div>
//                     <SearchBox value={reportsSearch} onChange={setReportsSearch} placeholder="بحث في التقارير..." />
//                   </div>

//                   {filteredReports.length === 0 ? (
//                     <EmptyState icon="ti-mood-happy" title="لا توجد تقارير حتى الآن" desc="كل شيء يسير على ما يرام!" />
//                   ) : reportsViewMode === 'table' ? (
//                     <div className="ap-table-wrap">
//                       <table className="ap-table">
//                         <thead>
//                           <tr>
//                             {['رقم التقرير', 'المُرسِل', 'النوع', 'الوصف', 'التاريخ', ''].map((h, i) => (
//                               <th key={i}>{h}</th>
//                             ))}
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {filteredReports.map((r, i) => {
//                             const isCharity = r.senderType === 'charity';
//                             return (
//                               <tr key={r._id} className="ap-table-row-clickable" onClick={() => setReportModal(r)}>
//                                 <td style={{ fontWeight: 700, color: 'var(--amber)' }}>#{i + 1}</td>
//                                 <td>{r.userName || r.charityName || '—'}</td>
//                                 <td>{isCharity ? 'جمعية' : 'مستخدم'}</td>
//                                 <td style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description}</td>
//                                 <td style={{ color: 'var(--t3)', fontSize: 12 }}>{fmt(r.createdAt)}</td>
//                                 <td onClick={e => e.stopPropagation()}>
//                                   <button className="ap-eye-btn" onClick={() => setReportModal(r)}>
//                                     <i className="ti ti-eye" />
//                                   </button>
//                                 </td>
//                               </tr>
//                             );
//                           })}
//                         </tbody>
//                       </table>
//                     </div>
//                   ) : (
//                     <div className="ap-card-grid">
//                       {filteredReports.map((r, i) => {
//                         const isCharity = r.senderType === 'charity';
//                         const senderName = r.userName || r.charityName || '—';
//                         return (
//                           <div key={r._id} className="ap-report-card" onClick={() => setReportModal(r)}>
//                             <div className="ap-report-card-top">
//                               <span className="ap-report-num"><i className="ti ti-alert-triangle" />تقرير #{i + 1}</span>
//                               <span className="ap-report-date"><i className="ti ti-calendar" />{fmt(r.createdAt)}</span>
//                             </div>
//                             <div className="ap-report-sender">
//                               <div className="ap-report-sender-icon" style={{ background: isCharity ? 'rgba(16,185,129,0.14)' : 'rgba(59,130,246,0.14)', color: isCharity ? TEAL2 : '#3b82f6' }}>
//                                 <i className={`ti ${isCharity ? 'ti-building' : 'ti-user'}`} />
//                               </div>
//                               <div>
//                                 <div style={{ fontWeight: 700, color: 'var(--t1)', fontSize: 13 }}>{senderName}</div>
//                                 <div style={{ fontSize: 11, color: 'var(--t4)', marginTop: 1 }}>{isCharity ? 'جمعية' : 'مستخدم'}</div>
//                               </div>
//                             </div>
//                             <p className="ap-report-body">{r.description}</p>
//                             <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
//                               <button className="ap-card-eye-btn" onClick={e => { e.stopPropagation(); setReportModal(r); }}>
//                                 <i className="ti ti-eye" /> عرض التقرير
//                               </button>
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   )}

//                   {hasMoreReports && (
//                     <LoadMoreBtn loading={loadingMore === 'reports'} remaining={Math.max(0, reportsTotal - reports.length)} onClick={loadMoreReports} />
//                   )}
//                 </div>
//               )}

//               {/* ══ AUTOMATION ══════════════════════════════════════════════ */}
//               {tab === 'automation' && (
//                 <div className="ap-tab-pane">
//                   <div className="ap-automation-banner">
//                     <div className="ap-automation-banner-icon"><i className="ti ti-settings-automation" /></div>
//                     <div>
//                       <div className="ap-automation-banner-title">التشغيل التلقائي — Cron Jobs</div>
//                       <div className="ap-automation-banner-sub">يمكنك تشغيل المهام التلقائية يدويًا من هنا. يتم تشغيلها في الخلفية وفقًا لجدول زمني محدد.</div>
//                     </div>
//                   </div>

//                   <div className="ap-cron-grid">
//                     <CronCard icon="ti-bell-ringing" iconBg="rgba(16,185,129,0.14)" iconColor={TEAL2} title="تذكير التبرعات" desc="يرسل تذكيرات للجمعيات بالتبرعات المعلقة التي لم يتم تأكيدها." code="GET /cron/donationReminder" codeBg="rgba(16,185,129,0.08)" codeBorder="rgba(16,185,129,0.24)" codeColor={TEAL2} loading={cronLoading.reminder} btnColor={TEAL2} onRun={runDonationReminder} />
//                     <CronCard icon="ti-report-analytics" iconBg="rgba(59,130,246,0.14)" iconColor="#3b82f6" title="تقرير الأدمن" desc="يولّد تقريرًا شاملاً عن نشاط المنصة ويرسله لجميع المسؤولين عبر البريد الإلكتروني." code="GET /cron/adminReport" codeBg="rgba(59,130,246,0.08)" codeBorder="rgba(59,130,246,0.24)" codeColor="#3b82f6" loading={cronLoading.report} btnColor="#3b82f6" onRun={runAdminReport} />
//                   </div>

//                   <div className="ap-cron-stats-row">
//                     {[
//                       { icon: 'ti-history',        color: TEAL2,     value: cronLog.length, label: 'عدد مرات التشغيل' },
//                       { icon: 'ti-clock',           color: AMBER,     value: lastRun ? new Date(lastRun).toLocaleTimeString('ar-EG') : '—', label: 'آخر تشغيل' },
//                       { icon: 'ti-calendar-event', color: '#3b82f6', value: 'تلقائي', label: 'جدول زمني' },
//                     ].map((s, i) => (
//                       <div key={i} className="ap-cron-stat">
//                         <i className={`ti ${s.icon}`} style={{ color: s.color, fontSize: 22 }} />
//                         <div>
//                           <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)' }}>{s.value}</div>
//                           <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>{s.label}</div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>

//                   {cronLog.length > 0 && (
//                     <div className="ap-cron-log">
//                       <div className="ap-cron-log-header">
//                         <SectionTitle icon="ti-list-details" color={TEAL2} title="سجل التنفيذ" badge={cronLog.length} />
//                         <button className="ap-cron-log-clear" onClick={() => setCronLog([])}><i className="ti ti-trash" />مسح</button>
//                       </div>
//                       <div className="ap-cron-log-list">
//                         {cronLog.map((log, i) => (
//                           <div key={i} className={`ap-cron-log-item ${log.type}`}>
//                             <span>{log.type === 'success' ? '✓' : '✗'} {log.text}</span>
//                             <span style={{ fontSize: 11, color: 'var(--t4)', flexShrink: 0 }}>{log.time}</span>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* ══ SETTINGS ══════════════════════════════════════════════════ */}
//               {tab === 'settings' && (
//                 <div className="ap-tab-pane">
//                   <div className="ap-section-header">
//                     <SectionTitle icon="ti-settings" color={TEAL2} title="الإعدادات" />
//                   </div>

//                   <div className="ap-settings-grid">
//                     <div className="ap-settings-card">
//                       <div className="ap-settings-card-title">
//                         <div className="ap-settings-icon" style={{ background: 'rgba(16,185,129,0.14)', color: TEAL2 }}>
//                           <i className="ti ti-user-circle" />
//                         </div>
//                         الملف الشخصي
//                       </div>
//                       <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
//                         <div className="ap-form-group">
//                           <label className="ap-form-label">اسم المستخدم</label>
//                           <input
//                             className="ap-form-input"
//                             value={profileForm.userName}
//                             onChange={e => setProfileForm(f => ({ ...f, userName: e.target.value }))}
//                             placeholder="اسم المستخدم"
//                           />
//                         </div>
//                         <div className="ap-form-group">
//                           <label className="ap-form-label">البريد الإلكتروني</label>
//                           <input className="ap-form-input" value={user?.email ?? ''} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
//                         </div>
//                         <div className="ap-form-group">
//                           <label className="ap-form-label">رقم الهاتف</label>
//                           <input
//                             className="ap-form-input"
//                             value={profileForm.phone}
//                             onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
//                             placeholder="01xxxxxxxxx"
//                           />
//                         </div>
//                         <div className="ap-form-group">
//                           <label className="ap-form-label">العنوان</label>
//                           <input
//                             className="ap-form-input"
//                             value={profileForm.address}
//                             onChange={e => setProfileForm(f => ({ ...f, address: e.target.value }))}
//                             placeholder="المدينة أو المنطقة"
//                           />
//                         </div>
//                         <button
//                           className="ap-action-btn approve"
//                           style={{ alignSelf: 'flex-start', padding: '8px 18px' }}
//                           disabled={settingsSaving}
//                           onClick={saveProfile}
//                         >
//                           {settingsSaving ? <><i className="ti ti-loader-2 ti-spin" /> جاري الحفظ...</> : <><i className="ti ti-check" /> حفظ التغييرات</>}
//                         </button>
//                       </div>
//                     </div>

//                     <div className="ap-settings-card">
//                       <div className="ap-settings-card-title">
//                         <div className="ap-settings-icon" style={{ background: 'rgba(244,63,94,0.14)', color: RED }}>
//                           <i className="ti ti-shield-lock" />
//                         </div>
//                         تغيير كلمة المرور
//                       </div>
//                       <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
//                         <div className="ap-form-group">
//                           <label className="ap-form-label">كلمة المرور الحالية</label>
//                           <input
//                             className="ap-form-input"
//                             type="password"
//                             value={passForm.oldPassword}
//                             onChange={e => setPassForm(f => ({ ...f, oldPassword: e.target.value }))}
//                             placeholder="••••••••"
//                           />
//                         </div>
//                         <div className="ap-form-group">
//                           <label className="ap-form-label">كلمة المرور الجديدة</label>
//                           <input
//                             className="ap-form-input"
//                             type="password"
//                             value={passForm.newPassword}
//                             onChange={e => setPassForm(f => ({ ...f, newPassword: e.target.value }))}
//                             placeholder="••••••••"
//                           />
//                         </div>
//                         <div className="ap-form-group">
//                           <label className="ap-form-label">تأكيد كلمة المرور الجديدة</label>
//                           <input
//                             className="ap-form-input"
//                             type="password"
//                             value={passForm.confirmPassword}
//                             onChange={e => setPassForm(f => ({ ...f, confirmPassword: e.target.value }))}
//                             placeholder="••••••••"
//                           />
//                         </div>
//                         <button
//                           className="ap-action-btn edit"
//                           style={{ alignSelf: 'flex-start', padding: '8px 18px' }}
//                           disabled={settingsSaving}
//                           onClick={savePassword}
//                         >
//                           {settingsSaving ? <><i className="ti ti-loader-2 ti-spin" /> جاري الحفظ...</> : <><i className="ti ti-key" /> تغيير كلمة المرور</>}
//                         </button>
//                       </div>
//                     </div>

//                     <div className="ap-settings-card">
//                       <div className="ap-settings-card-title">
//                         <div className="ap-settings-icon" style={{ background: 'rgba(59,130,246,0.14)', color: '#3b82f6' }}>
//                           <i className="ti ti-bell" />
//                         </div>
//                         الإشعارات
//                       </div>
//                       {[
//                         { label: 'إشعارات البريد الإلكتروني', sub: 'تلقي التنبيهات عبر البريد', default: true  },
//                         { label: 'تقارير جديدة',              sub: 'إشعار فوري عند ورود تقرير',  default: true  },
//                         { label: 'طلبات الانضمام',            sub: 'جمعيات تنتظر الموافقة',       default: false },
//                       ].map((item, i) => (
//                         <div key={i} className="ap-settings-row">
//                           <div>
//                             <div className="ap-settings-row-label">{item.label}</div>
//                             <div className="ap-settings-row-sub">{item.sub}</div>
//                           </div>
//                           <label className="ap-toggle">
//                             <input type="checkbox" defaultChecked={item.default} />
//                             <span className="ap-toggle-slider" />
//                           </label>
//                         </div>
//                       ))}
//                     </div>

//                     <div className="ap-settings-card">
//                       <div className="ap-settings-card-title">
//                         <div className="ap-settings-icon" style={{ background: 'rgba(245,158,11,0.14)', color: AMBER }}>
//                           <i className="ti ti-server" />
//                         </div>
//                         النظام
//                       </div>
                      
//                       {/* خيار الوضع الليلي والنهاري داخل كارد الإعدادات */}
//                       <div className="ap-settings-row">
//                         <div>
//                           <div className="ap-settings-row-label">الوضع الليلي (Dark Mode)</div>
//                           <div className="ap-settings-row-sub">تبديل مظهر لوحة التحكم بالكامل</div>
//                         </div>
//                         <label className="ap-toggle">
//                           <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
//                           <span className="ap-toggle-slider" />
//                         </label>
//                       </div>

//                       {[
//                         { label: 'وضع المطور',      sub: 'عرض السجلات التقنية',    default: false },
//                         { label: 'ذاكرة التخزين', sub: 'حفظ الجلسة تلقائياً',    default: true  },
//                       ].map((item, i) => (
//                         <div key={i} className="ap-settings-row">
//                           <div>
//                             <div className="ap-settings-row-label">{item.label}</div>
//                             <div className="ap-settings-row-sub">{item.sub}</div>
//                           </div>
//                           <label className="ap-toggle">
//                             <input type="checkbox" defaultChecked={item.default} />
//                             <span className="ap-toggle-slider" />
//                           </label>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                   <div style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 'var(--radius)', padding: '20px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>                
//                     <div>
//                       <div style={{ fontWeight: 800, color: RED, marginBottom: 4, fontSize: 14 }}>منطقة الخطر</div>
//                       <div style={{ fontSize: 13, color: 'var(--t3)', lineHeight: 1.6 }}>تسجيل الخروج من جميع الجلسات أو حذف الحساب نهائيًا.</div>
//                     </div>
//                     <button className="ap-action-btn reject" style={{ padding: '9px 18px', flexShrink: 0 }} onClick={handleLogout}>
//                       <i className="ti ti-logout" /> تسجيل الخروج
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {/* ══ AI CHAT ══════════════════════════════════════════════════ */}
//               {tab === 'ai-chat' && (
//                 <div className="ap-ai-chat-container">
//                   <AIChatEmbed />
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </main>

//       <MobileNav activeTab={tab} onTabChange={setTab} pendingCount={pendingCount} />

//       <Toast msg={toast} />
//       <ConfirmModal opts={confirmOpts} loading={confirmLoading} onClose={() => { if (!confirmLoading) setConfirmOpts(null); }} />
//       <RejectModal target={rejectTarget} loading={rejectLoading} onClose={() => setRejectTarget(null)} onConfirm={handleReject} />
//       <EditCharityModal target={editCharityTarget} loading={actionLoading} setLoading={setActionLoading} onClose={() => setEditCharityTarget(null)} onSaved={(id, form) => setCharities(prev => prev.map(c => c._id === id ? { ...c, ...form } : c))} showMsg={showMsg} />

//       {/* User Detail Modal */}
//       {userDetailModal && (() => {
//         const verified = userDetailModal.isVerified || userDetailModal.verify;
//         return (
//           <div className="ap-modal-overlay" onClick={() => setUserDetailModal(null)}>
//             <div className="ap-modal ap-modal-wide" onClick={e => e.stopPropagation()}>
//               <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.04) 100%)', padding: '22px 28px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
//                 <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
//                   <div className="ap-detail-avatar" style={{ width: 52, height: 52, fontSize: 20 }}>{userDetailModal.userName?.slice(0, 1).toUpperCase() ?? '?'}</div>
//                   <div>
//                     <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--t1)', marginBottom: 3 }}>{userDetailModal.userName}</div>
//                     <div style={{ fontSize: 13, color: 'var(--t3)' }}>{userDetailModal.email}</div>
//                     <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
//                       <RoleBadge role={userDetailModal.roleType} />
//                       <span className="ap-badge" style={{ background: verified ? 'rgba(34,197,94,0.14)' : 'rgba(244,63,94,0.14)', color: verified ? '#22c55e' : RED }}>
//                         <i className={`ti ${verified ? 'ti-circle-check' : 'ti-circle-x'}`} style={{ fontSize: 11 }} />
//                         {verified ? 'موثق' : 'غير موثق'}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//                 <button className="ap-modal-close-x" onClick={() => setUserDetailModal(null)}><i className="ti ti-x" /></button>
//               </div>
//               <div className="ap-modal-inner" style={{ paddingTop: 20 }}>
//                 <div className="ap-detail-section">
//                   <DetailRow icon="ti-fingerprint" label="المعرف"       value={userDetailModal._id}                           mono />
//                   <DetailRow icon="ti-mail"        label="البريد"       value={userDetailModal.email}                               />
//                   {userDetailModal.phone   && <DetailRow icon="ti-phone"   label="الهاتف"    value={userDetailModal.phone}   />}
//                   {userDetailModal.address && <DetailRow icon="ti-map-pin" label="العنوان"   value={userDetailModal.address} />}
//                   <DetailRow icon="ti-calendar"    label="تاريخ الانضمام" value={fmt(userDetailModal.createdAt)}                    />
//                   {userDetailModal.updatedAt && <DetailRow icon="ti-clock-edit" label="آخر تحديث" value={fmt(userDetailModal.updatedAt)} />}
//                 </div>
//                 <div className="ap-modal-actions" style={{ marginTop: 18 }}>
//                   <button className="ap-modal-cancel" onClick={() => setUserDetailModal(null)}>إغلاق</button>
//                   {userDetailModal.roleType !== 'admin' && (
//                     <button className="ap-modal-confirm" style={{ background: RED }} onClick={() => { setUserDetailModal(null); handleDeleteUser(userDetailModal._id, userDetailModal.userName); }}>
//                       <i className="ti ti-trash" />حذف المستخدم
//                     </button>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         );
//       })()}

//       {/* Charity Detail Modal */}
//       {charityDetailModal && (
//         <div className="ap-modal-overlay" onClick={() => setCharityDetailModal(null)}>
//           <div className="ap-modal ap-modal-wide" onClick={e => e.stopPropagation()}>
//             <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.04) 100%)', padding: '22px 28px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
//               <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
//                 <div className="ap-entity-avatar charity" style={{ width: 52, height: 52, fontSize: 22 }}><i className="ti ti-building-community" /></div>
//                 <div>
//                   <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--t1)', marginBottom: 3 }}>{charityDetailModal.charityName}</div>
//                   <div style={{ fontSize: 13, color: 'var(--t3)' }}>{charityDetailModal.email}</div>
//                   <div style={{ marginTop: 8 }}><StatusBadge status={charityDetailModal.approvalStatus} /></div>
//                 </div>
//               </div>
//               <button className="ap-modal-close-x" onClick={() => setCharityDetailModal(null)}><i className="ti ti-x" /></button>
//             </div>

//             <div className="ap-modal-inner" style={{ paddingTop: 20 }}>
//               <div className="ap-detail-section" style={{ marginBottom: 16 }}>
//                 <DetailRow icon="ti-fingerprint"  label="المعرف"        value={charityDetailModal._id}                     mono />
//                 <DetailRow icon="ti-map-pin"      label="العنوان"       value={charityDetailModal.address || '—'}                />
//                 {charityDetailModal.phone         && <DetailRow icon="ti-phone"       label="الهاتف"       value={charityDetailModal.phone}         />}
//                 {charityDetailModal.licenseNumber && <DetailRow icon="ti-certificate" label="رقم الترخيص"  value={charityDetailModal.licenseNumber} />}
//                 <DetailRow icon="ti-calendar"     label="تاريخ التسجيل" value={fmt(charityDetailModal.createdAt)}                />
//                 {charityDetailModal.userId && <DetailRow icon="ti-user" label="معرف المالك" value={charityDetailModal.userId} mono />}
//               </div>

//               {charityDetailModal.description && (
//                 <div style={{ marginBottom: 16 }}>
//                   <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
//                     <i className="ti ti-file-description" style={{ fontSize: 14 }} /> وصف الجمعية
//                   </div>
//                   <div className="ap-report-full-body">{charityDetailModal.description}</div>
//                 </div>
//               )}

//               {charityDetailModal.approvalStatus === 'rejected' && charityDetailModal.rejectionReason && (
//                 <div style={{ marginBottom: 16 }}>
//                   <div style={{ fontSize: 12, fontWeight: 700, color: RED, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
//                     <i className="ti ti-alert-circle" style={{ fontSize: 14 }} /> سبب الرفض
//                   </div>
//                   <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.8, background: 'rgba(244,63,94,0.06)', borderRadius: 'var(--radius-sm)', padding: 14, border: '1px solid rgba(244,63,94,0.18)' }}>
//                     {charityDetailModal.rejectionReason}
//                   </div>
//                 </div>
//               )}

//               {charityDetailModal.approvalStatus === 'pending' && (
//                 <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
//                   <button className="ap-action-btn approve" style={{ flex: 1, justifyContent: 'center' }} disabled={!!actionLoading} onClick={() => { setCharityDetailModal(null); handleApprove(charityDetailModal._id, charityDetailModal.charityName); }}>
//                     <i className="ti ti-check" />موافقة
//                   </button>
//                   <button className="ap-action-btn reject" style={{ flex: 1, justifyContent: 'center' }} disabled={!!actionLoading} onClick={() => { setCharityDetailModal(null); setRejectTarget({ id: charityDetailModal._id, name: charityDetailModal.charityName }); }}>
//                     <i className="ti ti-x" />رفض
//                   </button>
//                 </div>
//               )}
//               <div className="ap-modal-actions">
//                 <button className="ap-modal-cancel" onClick={() => setCharityDetailModal(null)}>إغلاق</button>
//                 <button className="ap-action-btn edit" style={{ padding: '10px 18px', fontSize: 13 }} onClick={() => { setCharityDetailModal(null); setEditCharityTarget(charityDetailModal); }}>
//                   <i className="ti ti-edit" />تعديل
//                 </button>
//                 <button className="ap-modal-confirm" style={{ background: RED }} disabled={!!actionLoading} onClick={() => { setCharityDetailModal(null); handleDeleteCharity(charityDetailModal._id, charityDetailModal.charityName); }}>
//                   <i className="ti ti-trash" />حذف
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Report Detail Modal */}
//       {reportModal && (() => {
//         const isCharity = reportModal.senderType === 'charity';
//         const senderName = reportModal.userName || reportModal.charityName || '—';
//         return (
//           <div className="ap-modal-overlay" onClick={() => setReportModal(null)}>
//             <div className="ap-modal ap-modal-wide" onClick={e => e.stopPropagation()}>
//               <div style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(245,158,11,0.04) 100%)', padding: '22px 28px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
//                 <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
//                   <div style={{ width: 48, height: 48, borderRadius: 13, background: 'rgba(245,158,11,0.14)', color: AMBER, display: 'flex', alignItems: 'center', justifycontent: 'center', fontSize: 22, flexShrink: 0 }}>
//                     <i className="ti ti-alert-triangle" />
//                   </div>
//                   <div>
//                     <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--t1)', marginBottom: 3 }}>تقرير وارد</div>
//                     <div style={{ fontSize: 12, color: 'var(--t3)' }}>{fmt(reportModal.createdAt)}</div>
//                   </div>
//                 </div>
//                 <button className="ap-modal-close-x" onClick={() => setReportModal(null)}><i className="ti ti-x" /></button>
//               </div>

//               <div className="ap-modal-inner" style={{ paddingTop: 20 }}>
//                 <div className="ap-detail-section" style={{ marginBottom: 16 }}>
//                   <DetailRow icon={isCharity ? 'ti-building' : 'ti-user'} label="المُرسِل" value={senderName} />
//                   <DetailRow icon="ti-tag" label="نوع المُرسِل" value={isCharity ? 'جمعية' : 'مستخدم'} />
//                   <DetailRow icon="ti-calendar" label="التاريخ" value={fmt(reportModal.createdAt)} />
//                   {reportModal.userId && <DetailRow icon="ti-fingerprint" label="معرف المُرسِل" value={reportModal.userId} mono />}
//                 </div>

//                 <div style={{ marginBottom: 16 }}>
//                   <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
//                     <i className="ti ti-file-text" style={{ fontSize: 14 }} /> محتوى التقرير
//                   </div>
//                   <div className="ap-report-full-body">{reportModal.description}</div>
//                 </div>

//                 <div className="ap-modal-actions" style={{ marginTop: 16 }}>
//                   <button className="ap-modal-cancel" onClick={() => setReportModal(null)}>إغلاق</button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         );
//       })()}
//     </div>
//   );
// }

// import { useEffect, useState, useCallback, useMemo } from 'react';
// import { useAuth } from '../../contexts/AuthContext';
// import { useLocation } from 'wouter';
// import '../../styles/css/AdminPanel.css';
// import {
//   AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
//   Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
// } from 'recharts';
// import AIChatEmbed from '../../components/shared/AIChatEmbed';
// import { usersApi } from '../../services';
// import {
//   apiFetch, fetchPage,
//   User, Charity, Report, Tab, ApprovalStatus,
//   APPROVAL_CFG, ROLE_CFG,
//   TEAL2, AMBER, RED,
//   fmt,
// } from './adminTypes';

// type ViewMode = 'table' | 'cards';
// type ThemeMode = 'dark' | 'light';

// const NAV_ITEMS = [
//   { id: 'overview',   label: 'نظرة عامة',       icon: 'ti-layout-dashboard'    },
//   { id: 'users',      label: 'المستخدمون',       icon: 'ti-users'               },
//   { id: 'charities',  label: 'الجمعيات',          icon: 'ti-building-community'  },
//   { id: 'reports',    label: 'التقارير',          icon: 'ti-alert-circle'        },
//   { id: 'automation', label: 'التشغيل التلقائي', icon: 'ti-settings-automation' },
//   { id: 'settings',   label: 'الإعدادات',        icon: 'ti-settings'            },
//   { id: 'ai-chat',    label: 'مساعد الذكاء',     icon: 'ti-brain'               },
// ];

// // ─── Sidebar Component ────────────────────────────────────────────────────────
// function Sidebar({ activeTab, onTabChange, userName, onLogout, pendingCount, collapsed, onToggleCollapse }: {
//   activeTab: Tab;
//   onTabChange: (tab: Tab) => void;
//   userName: string;
//   onLogout: () => void;
//   pendingCount: number;
//   collapsed: boolean;
//   onToggleCollapse: () => void;
// }) {
//   return (
//     <aside className={`ap-sidebar${collapsed ? ' collapsed' : ''}`}>
//       <div className="ap-sidebar-brand">
//         <div className="ap-brand-icon">
//           <i className="ti ti-shield-check" />
//         </div>
//         {!collapsed && <span className="ap-brand-title">لوحة التحكم</span>}
//         <button
//           className="ap-collapse-btn"
//           onClick={onToggleCollapse}
//           title={collapsed ? 'توسيع الشريط' : 'طي الشريط'}
//         >
//           <i className={`ti ${collapsed ? 'ti-layout-sidebar-right-expand' : 'ti-layout-sidebar-right-collapse'}`} />
//         </button>
//       </div>

      

//       <nav className="ap-sidebar-nav">
//         {NAV_ITEMS.map(item => (
//           <button
//             key={item.id}
//             className={`ap-nav-item${activeTab === item.id ? ' active' : ''}`}
//             onClick={() => onTabChange(item.id as Tab)}
//             title={collapsed ? item.label : undefined}
//           >
//             <span className="ap-nav-icon-wrap">
//               <i className={`ti ${item.icon}`} />
//               {item.id === 'charities' && pendingCount > 0 && (
//                 <span className="ap-nav-badge">{pendingCount}</span>
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
//             <div className="ap-user-avatar">{userName?.slice(0, 1).toUpperCase()}</div>
//             <div className="ap-user-meta">
//               <span className="ap-user-name">{userName}</span>
//               <span className="ap-user-role">مسؤول النظام</span>
//             </div>
//             <i className="ti ti-settings" style={{ fontSize: 14, color: 'var(--t4)' }} />
//           </div>
//         )}
//         {collapsed && (
//           <button
//             className="ap-nav-item"
//             onClick={() => onTabChange('settings')}
//             title="الإعدادات"
//             style={{ justifyContent: 'center', padding: '10px 0' }}
//           >
//             <span className="ap-nav-icon-wrap">
//               <i className="ti ti-settings" />
//             </span>
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

// // ─── Mobile Bottom Nav ────────────────────────────────────────────────────────
// function MobileNav({ activeTab, onTabChange, pendingCount }: {
//   activeTab: Tab;
//   onTabChange: (tab: Tab) => void;
//   pendingCount: number;
// }) {
//   return (
//     <nav className="ap-mobile-nav">
//       {NAV_ITEMS.map(item => (
//         <button
//           key={item.id}
//           className={`ap-mobile-nav-item${activeTab === item.id ? ' active' : ''}`}
//           onClick={() => onTabChange(item.id as Tab)}
//         >
//           <span className="ap-nav-icon-wrap">
//             <i className={`ti ${item.icon}`} />
//             {item.id === 'charities' && pendingCount > 0 && (
//               <span className="ap-nav-badge">{pendingCount}</span>
//             )}
//           </span>
//           <span>{item.label}</span>
//         </button>
//       ))}
//     </nav>
//   );
// }

// // ─── View Toggle Component ──────────────────────────────────────────────────
// function ViewToggle({ mode, onChange }: { mode: ViewMode; onChange: (mode: ViewMode) => void }) {
//   return (
//     <div className="ap-view-switcher">
//       <button 
//         className={`ap-view-btn ${mode === 'table' ? 'active' : ''}`} 
//         onClick={() => onChange('table')}
//         title="عرض كجدول"
//       >
//         <i className="ti ti-list" />
//       </button>
//       <button 
//         className={`ap-view-btn ${mode === 'cards' ? 'active' : ''}`} 
//         onClick={() => onChange('cards')}
//         title="عرض ككروت"
//       >
//         <i className="ti ti-layout-grid" />
//       </button>
//     </div>
//   );
// }

// function StatusBadge({ status }: { status: string }) {
//   const cfg = APPROVAL_CFG[status as ApprovalStatus] ?? {
//     label: status, bg: '#1c2333', color: '#9aa5b9', dot: '#3d4a60',
//   };
//   return (
//     <span className="ap-badge" style={{ background: cfg.bg, color: cfg.color }}>
//       <span className="ap-badge-dot" style={{ background: cfg.dot }} />
//       {cfg.label}
//     </span>
//   );
// }

// function RoleBadge({ role }: { role: string }) {
//   const cfg = ROLE_CFG[role as keyof typeof ROLE_CFG] ?? {
//     label: role, bg: '#1c2333', color: '#9aa5b9', icon: '',
//   };
//   return (
//     <span className="ap-badge" style={{ background: cfg.bg, color: cfg.color }}>
//       {cfg.icon} {cfg.label}
//     </span>
//   );
// }

// function Toast({ msg }: { msg: { type: 'success' | 'error'; text: string } | null }) {
//   if (!msg) return null;
//   return (
//     <div className={`ap-toast ${msg.type}`}>
//       <i className={`ti ${msg.type === 'success' ? 'ti-circle-check' : 'ti-alert-circle'}`} />
//       {msg.text}
//     </div>
//   );
// }

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
//               {loading && <i className="ti ti-loader-2 ti-spin" />}
//               {opts.confirmLabel ?? 'تأكيد'}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function RejectModal({ target, loading, onClose, onConfirm }: {
//   target: { id: string; name: string } | null;
//   loading: boolean;
//   onClose: () => void;
//   onConfirm: (reason: string) => void;
// }) {
//   const [reason, setReason] = useState('');
//   useEffect(() => { if (target) setReason(''); }, [target]);
//   if (!target) return null;
//   return (
//     <div className="ap-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
//       <div className="ap-modal">
//         <div className="ap-modal-inner">
//           <div className="ap-modal-icon" style={{ background: RED + '22' }}>
//             <i className="ti ti-x" style={{ color: RED }} />
//           </div>
//           <h3 className="ap-modal-title">رفض جمعية "{target.name}"</h3>
//           <p className="ap-modal-msg">يمكنك تحديد سبب الرفض ليصل للجمعية بالبريد الإلكتروني.</p>
//           <div className="ap-form-group" style={{ marginBottom: 20 }}>
//             <label className="ap-form-label">سبب الرفض</label>
//             <textarea
//               className="ap-form-textarea"
//               rows={3}
//               value={reason}
//               onChange={e => setReason(e.target.value)}
//               placeholder="سبب الرفض (اختياري)"
//             />
//           </div>
//           <div className="ap-modal-actions">
//             <button className="ap-modal-cancel" onClick={onClose} disabled={loading}>إلغاء</button>
//             <button
//               className="ap-modal-confirm"
//               disabled={loading}
//               style={{ background: RED }}
//               onClick={() => onConfirm(reason)}
//             >
//               {loading && <i className="ti ti-loader-2 ti-spin" />}
//               تأكيد الرفض
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function EditCharityModal({ target, loading, setLoading, onClose, onSaved, showMsg }: {
//   target: Charity | null;
//   loading: string | null;
//   setLoading: (v: string | null) => void;
//   onClose: () => void;
//   onSaved: (id: string, form: { charityName: string; address: string; description: string }) => void;
//   showMsg: (type: 'success' | 'error', text: string) => void;
// }) {
//   const [form, setForm] = useState({ charityName: '', address: '', description: '' });
//   const [errors, setErrors] = useState<Record<string, string>>({});

//   useEffect(() => {
//     if (target) {
//       setForm({
//         charityName: target.charityName ?? '',
//         address: target.address ?? '',
//         description: target.description ?? '',
//       });
//       setErrors({});
//     }
//   }, [target]);

//   if (!target) return null;

//   const validate = () => {
//     const e: Record<string, string> = {};
//     if (!form.charityName.trim() || form.charityName.trim().length < 3)
//       e.charityName = 'اسم الجمعية يجب أن يكون 3 أحرف على الأقل';
//     if (!form.address.trim() || form.address.trim().length < 5)
//       e.address = 'العنوان يجب أن يكون 5 أحرف على الأقل';
//     return e;
//   };

//   const isBusy = loading === 'edit-' + target._id;
//   const changed =
//     form.charityName  !== (target.charityName  ?? '') ||
//     form.address      !== (target.address      ?? '') ||
//     form.description  !== (target.description  ?? '');

//   const handleSave = async () => {
//     const e = validate();
//     if (Object.keys(e).length) { setErrors(e); return; }
//     setLoading('edit-' + target._id);
//     try {
//       await apiFetch(`/charity/${target._id}`, {
//         method: 'PATCH',
//         body: JSON.stringify({
//           charityName: form.charityName.trim(),
//           address: form.address.trim(),
//           description: form.description.trim(),
//         }),
//       });
//       onSaved(target._id, form);
//       showMsg('success', `تم تحديث "${form.charityName}" بنجاح`);
//       onClose();
//     } catch (err: unknown) {
//       showMsg('error', (err instanceof Error ? err.message : null) || 'فشل التحديث');
//     } finally { setLoading(null); }
//   };

//   return (
//     <div className="ap-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
//       <div className="ap-modal">
//         <div className="ap-modal-inner">
//           <div className="ap-modal-icon" style={{ background: TEAL2 + '22' }}>
//             <i className="ti ti-edit" style={{ color: TEAL2 }} />
//           </div>
//           <h3 className="ap-modal-title">تعديل بيانات الجمعية</h3>
//           <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>
//             <div className="ap-form-group">
//               <label className="ap-form-label">
//                 اسم الجمعية <span style={{ color: RED }}>*</span>
//               </label>
//               <input
//                 className={`ap-form-input${errors.charityName ? ' error' : ''}`}
//                 value={form.charityName}
//                 onChange={e => {
//                   setForm(f => ({ ...f, charityName: e.target.value }));
//                   setErrors(er => ({ ...er, charityName: '' }));
//                 }}
//                 placeholder="اسم الجمعية"
//               />
//               {errors.charityName && (
//                 <div className="ap-form-err">
//                   <i className="ti ti-alert-circle" />{errors.charityName}
//                 </div>
//               )}
//             </div>
//             <div className="ap-form-group">
//               <label className="ap-form-label">
//                 العنوان <span style={{ color: RED }}>*</span>
//               </label>
//               <input
//                 className={`ap-form-input${errors.address ? ' error' : ''}`}
//                 value={form.address}
//                 onChange={e => {
//                   setForm(f => ({ ...f, address: e.target.value }));
//                   setErrors(er => ({ ...er, address: '' }));
//                 }}
//                 placeholder="عنوان الجمعية"
//               />
//               {errors.address && (
//                 <div className="ap-form-err">
//                   <i className="ti ti-alert-circle" />{errors.address}
//                 </div>
//               )}
//             </div>
//             <div className="ap-form-group">
//               <label className="ap-form-label">
//                 الوصف{' '}
//                 <span style={{ fontSize: 11, color: 'var(--t4)', fontWeight: 400 }}>(اختياري)</span>
//               </label>
//               <textarea
//                 className="ap-form-textarea"
//                 rows={3}
//                 value={form.description}
//                 onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
//                 placeholder="وصف مختصر عن الجمعية..."
//               />
//             </div>
//           </div>
//           <div className="ap-info-box" style={{ marginBottom: 18 }}>
//             <div className="ap-info-row">
//               <span className="lbl">البريد الإلكتروني:</span>
//               <span className="val">{target.email}</span>
//             </div>
//             <div className="ap-info-row">
//               <span className="lbl">حالة الجمعية:</span>
//               <span className="val"><StatusBadge status={target.approvalStatus} /></span>
//             </div>
//             {target.licenseNumber && (
//               <div className="ap-info-row">
//                 <span className="lbl">رقم الترخيص:</span>
//                 <span className="val">{target.licenseNumber}</span>
//               </div>
//             )}
//           </div>
//           <div className="ap-modal-actions">
//             <button className="ap-modal-cancel" onClick={onClose} disabled={isBusy}>إلغاء</button>
//             <button
//               className="ap-modal-confirm"
//               disabled={isBusy || !changed}
//               style={{ background: TEAL2 }}
//               onClick={handleSave}
//             >
//               {isBusy && <i className="ti ti-loader-2 ti-spin" />}
//               {isBusy ? 'جاري الحفظ...' : 'حفظ التغييرات'}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function PageSkeleton() {
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
//     </div>
//   );
// }

// function DetailRow({ icon, label, value, mono, danger }: {
//   icon: string; label: string; value: string; mono?: boolean; danger?: boolean;
// }) {
//   return (
//     <div className="ap-detail-row">
//       <div className="ap-detail-row-icon"><i className={`ti ${icon}`} /></div>
//       <span className="ap-detail-row-label">{label}</span>
//       <span className={`ap-detail-row-val${mono ? ' mono' : ''}${danger ? ' danger' : ''}`}>
//         {value}
//       </span>
//     </div>
//   );
// }

// function EmptyState({ icon, title, desc }: { icon: string; title: string; desc?: string }) {
//   return (
//     <div className="ap-empty-state">
//       <div className="ap-empty-icon"><i className={`ti ${icon}`} /></div>
//       <div className="ap-empty-title">{title}</div>
//       {desc && <div className="ap-empty-desc">{desc}</div>}
//     </div>
//   );
// }

// function ErrorBanner({ msg, onRetry }: { msg: string; onRetry: () => void }) {
//   return (
//     <div className="ap-error-banner">
//       <i className="ti ti-alert-triangle" style={{ color: AMBER, fontSize: 20, flexShrink: 0 }} />
//       <div style={{ flex: 1 }}>
//         <div style={{ fontWeight: 700, marginBottom: 3, color: 'var(--t1)' }}>حدث خطأ</div>
//         <div style={{ fontSize: 13, color: 'var(--t3)' }}>{msg}</div>
//       </div>
//       <button className="ap-retry-btn" onClick={onRetry}>
//         <i className="ti ti-refresh" /> إعادة المحاولة
//       </button>
//     </div>
//   );
// }

// function SectionTitle({ icon, color, title, badge }: {
//   icon: string; color: string; title: string; badge?: number;
// }) {
//   return (
//     <div className="ap-section-title">
//       <i className={`ti ${icon}`} style={{ color }} />
//       {title}
//       {badge !== undefined && (
//         <span className="ap-count-badge" style={{ background: color }}>{badge}</span>
//       )}
//     </div>
//   );
// }

// function SearchBox({ value, onChange, placeholder }: {
//   value: string;
//   onChange: (v: string) => void;
//   placeholder?: string;
// }) {
//   return (
//     <div className="ap-search-wrap">
//       <i className="ti ti-search ap-search-icon" />
//       <input
//         className="ap-search-input"
//         value={value}
//         onChange={e => onChange(e.target.value)}
//         placeholder={placeholder ?? 'بحث...'}
//       />
//       {value && (
//         <button className="ap-search-clear" onClick={() => onChange('')}>
//           <i className="ti ti-x" />
//         </button>
//       )}
//     </div>
//   );
// }

// function LoadMoreBtn({ loading, remaining, onClick }: {
//   loading: boolean; remaining: number; onClick: () => void;
// }) {
//   return (
//     <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
//       <button className="ap-load-more-btn" onClick={onClick} disabled={loading}>
//         {loading
//           ? <><i className="ti ti-loader-2 ti-spin" /> جاري التحميل...</>
//           : <>تحميل المزيد {remaining > 0 && `(${remaining})`}</>
//         }
//       </button>
//     </div>
//   );
// }

// function KpiCard({ icon, label, value, change, changeDir, color }: {
//   icon: string; label: string; value: string | number;
//   change?: string; changeDir?: 'up' | 'down' | 'neutral'; color: string;
// }) {
//   return (
//     <div className="ap-kpi-card" style={{ '--kpi-color': color } as React.CSSProperties}>
//       <div className="ap-kpi-icon-wrap"><i className={`ti ${icon}`} /></div>
//       <div className="ap-kpi-value">{value}</div>
//       <div className="ap-kpi-label">{label}</div>
//       {change && (
//         <div className={`ap-kpi-change ${changeDir ?? 'neutral'}`}>{change}</div>
//       )}
//     </div>
//   );
// }

// function ChartTooltip({ active, payload, label }: {
//   active?: boolean;
//   payload?: { value: number; name: string }[];
//   label?: string;
// }) {
//   if (!active || !payload?.length) return null;
//   return (
//     <div className="ap-chart-tooltip">
//       <div className="ap-chart-tooltip-label">{label}</div>
//       {payload.map((p, i) => (
//         <div key={i} className="ap-chart-tooltip-row">
//           <span>{p.name}</span>
//           <span style={{ fontWeight: 700 }}>{p.value.toLocaleString('en-US')}</span>
//         </div>
//       ))}
//     </div>
//   );
// }

// function CronCard({ icon, iconBg, iconColor, title, desc, code, codeBg, codeBorder, codeColor, loading, btnColor, onRun }: {
//   icon: string; iconBg: string; iconColor: string;
//   title: string; desc: string; code: string;
//   codeBg: string; codeBorder: string; codeColor: string;
//   loading: boolean; btnColor: string; onRun: () => void;
// }) {
//   return (
//     <div className="ap-cron-card">
//       <div className="ap-cron-icon" style={{ background: iconBg }}>
//         <i className={`ti ${icon}`} style={{ color: iconColor }} />
//       </div>
//       <div className="ap-cron-title">{title}</div>
//       <p className="ap-cron-desc">{desc}</p>
//       <code className="ap-cron-code" style={{ background: codeBg, borderColor: codeBorder, color: codeColor }}>
//         {code}
//       </code>
//       <button
//         className="ap-cron-run-btn"
//         style={{ background: btnColor }}
//         disabled={loading}
//         onClick={onRun}
//       >
//         {loading
//           ? <><i className="ti ti-loader-2 ti-spin" />جاري التشغيل...</>
//           : <><i className="ti ti-player-play" />تشغيل الآن</>
//         }
//       </button>
//     </div>
//   );
// }

// export default function AdminPanel() {
//   const { user, logout } = useAuth();
//   const [, navigate] = useLocation();
//   const [tab, setTab] = useState<Tab>('overview');

//   // ─── View Modes State ──────────────────────────────────────────────────────
//   const [usersViewMode, setUsersViewMode] = useState<ViewMode>('table');
//   const [charitiesViewMode, setCharitiesViewMode] = useState<ViewMode>('cards');
//   const [reportsViewMode, setReportsViewMode] = useState<ViewMode>('cards');

//   // ─── Theme Mode Logic ──────────────────────────────────────────────────────
//   const [theme, setTheme] = useState<ThemeMode>(() => {
//     try {
//       return (localStorage.getItem('ap-theme') as ThemeMode) || 'dark';
//     } catch { return 'dark'; }
//   });

//   useEffect(() => {
//     try {
//       localStorage.setItem('ap-theme', theme);
//       // تحديث كلاس الـ body لتطبيق الستايل على كامل الصفحة
//       if (theme === 'light') {
//         document.body.classList.add('ap-light-theme');
//       } else {
//         document.body.classList.remove('ap-light-theme');
//       }
//     } catch { /* ignore */ }
//   }, [theme]);

//   const toggleTheme = () => {
//     setTheme(prev => prev === 'dark' ? 'light' : 'dark');
//   };

//   const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
//     try {
//       return localStorage.getItem('ap-sidebar-collapsed') === 'true';
//     } catch { return false; }
//   });

//   const handleToggleSidebar = () => {
//     setSidebarCollapsed(v => {
//       const next = !v;
//       try { localStorage.setItem('ap-sidebar-collapsed', String(next)); } catch { /* ignore */ }
//       return next;
//     });
//   };

//   const [users,      setUsers]     = useState<User[]>([]);
//   const [charities, setCharities] = useState<Charity[]>([]);
//   const [reports,    setReports]   = useState<Report[]>([]);

//   const [usersTotal,      setUsersTotal]     = useState(0);
//   const [charitiesTotal, setCharitiesTotal] = useState(0);
//   const [reportsTotal,    setReportsTotal]   = useState(0);

//   const [usersPage,      setUsersPage]     = useState(1);
//   const [charitiesPage, setCharitiesPage] = useState(1);
//   const [reportsPage,    setReportsPage]   = useState(1);

//   const [hasMoreUsers,       setHasMoreUsers]       = useState(false);
//   const [hasMoreCharities,   setHasMoreCharities]   = useState(false);
//   const [hasMoreReports,     setHasMoreReports]     = useState(false);
//   const [charitiesRemaining, setCharitiesRemaining] = useState(0);
//   const [loadingMore,        setLoadingMore]        = useState<string | null>(null);

//   const [loading,       setLoading]       = useState(true);
//   const [error,         setError]         = useState<string | null>(null);
//   const [actionLoading, setActionLoading] = useState<string | null>(null);
//   const [toast,         setToast]         = useState<{ type: 'success' | 'error'; text: string } | null>(null);
//   const [confirmOpts,   setConfirmOpts]   = useState<ConfirmState | null>(null);
//   const [confirmLoading,setConfirmLoading]= useState(false);
//   const [rejectTarget,  setRejectTarget]  = useState<{ id: string; name: string } | null>(null);
//   const [rejectLoading, setRejectLoading] = useState(false);
//   const [editCharityTarget,  setEditCharityTarget]  = useState<Charity | null>(null);
//   const [userDetailModal,    setUserDetailModal]    = useState<User | null>(null);
//   const [reportModal,        setReportModal]        = useState<Report | null>(null);
//   const [charityDetailModal, setCharityDetailModal] = useState<Charity | null>(null);

//   const [usersSearch,     setUsersSearch]     = useState('');
//   const [charitiesSearch, setCharitiesSearch] = useState('');
//   const [reportsSearch,   setReportsSearch]   = useState('');
//   const [charitiesFilter, setCharitiesFilter] = useState<string>('all');

//   const [cronLoading, setCronLoading] = useState({ reminder: false, report: false });
//   const [cronLog, setCronLog]         = useState<{ type: 'success' | 'error'; text: string; time: string }[]>([]);
//   const [lastRun, setLastRun]         = useState<string | null>(null);

//   useEffect(() => {
//     const tick = () => {
//       const el = document.getElementById('ap-clock');
//       if (el) {
//         el.textContent = new Date().toLocaleTimeString('ar-EG', {
//           hour: '2-digit', minute: '2-digit',
//         });
//       }
//     };
//     tick();
//     const id = setInterval(tick, 30_000);
//     return () => clearInterval(id);
//   }, []);

//   const showMsg = useCallback((type: 'success' | 'error', text: string) => {
//     setToast({ type, text });
//     setTimeout(() => setToast(null), 3500);
//   }, []);

//   const loadData = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     setUsersPage(1);
//     setCharitiesPage(1);
//     setReportsPage(1);

//     try {
//       const [uRes, cRes, rRes] = await Promise.allSettled([
//         fetchPage<User>('/users', 1, 10),
//         fetchPage<Charity>('/charity/charities', 1, 10),
//         fetchPage<Report>('/report/allReports', 1, 10),
//       ]);

//       if (uRes.status === 'fulfilled') {
//         setUsers(uRes.value.data ?? []);
//         setUsersTotal(uRes.value.total ?? 0);
//         setHasMoreUsers(uRes.value.hasMore ?? false);
//       }
//       if (cRes.status === 'fulfilled') {
//         setCharities(cRes.value.data ?? []);
//         setCharitiesTotal(cRes.value.total ?? 0);
//         setHasMoreCharities(cRes.value.hasMore ?? false);
//         setCharitiesRemaining(
//           Math.max(0, (cRes.value.total ?? 0) - (cRes.value.data?.length ?? 0))
//         );
//       }
//       if (rRes.status === 'fulfilled') {
//         setReports(rRes.value.data ?? []);
//         setReportsTotal(rRes.value.total ?? 0);
//         setHasMoreReports(rRes.value.hasMore ?? false);
//       }

//       const failures = [uRes, cRes, rRes].filter(r => r.status === 'rejected') as PromiseRejectedResult[];
//       if (failures.length === 3) {
//         throw new Error((failures[0].reason instanceof Error ? failures[0].reason.message : null) || 'فشل تحميل البيانات');
//       }
//     } catch (e: unknown) {
//       const status = (e as { status?: number })?.status;
//       if (status === 401) {
//         setTimeout(() => logout?.(), 1500);
//       }
//       setError((e instanceof Error ? e.message : null) || 'فشل تحميل البيانات');
//     } finally {
//       setLoading(false);
//     }
//   }, [logout]);

//   useEffect(() => { loadData(); }, [loadData]);

//   const loadMoreUsers = async () => {
//     const next = usersPage + 1;
//     setLoadingMore('users');
//     try {
//       const res = await fetchPage<User>('/users', next, 10);
//       if (!res.data?.length) { setHasMoreUsers(false); return; }
//       setUsers(prev => {
//         const ids = new Set(prev.map(u => u._id));
//         return [...prev, ...res.data.filter(u => !ids.has(u._id))];
//       });
//       setUsersPage(next);
//       setHasMoreUsers(res.hasMore ?? false);
//     } finally { setLoadingMore(null); }
//   };

//   const loadMoreCharities = async () => {
//     const next = charitiesPage + 1;
//     setLoadingMore('charities');
//     try {
//       const res = await fetchPage<Charity>('/charity/charities', next, 10);
//       if (!res.data?.length) { setHasMoreCharities(false); return; }
//       setCharities(prev => {
//         const ids = new Set(prev.map(c => c._id));
//         return [...prev, ...res.data.filter(c => !ids.has(c._id))];
//       });
//       setCharitiesPage(next);
//       setHasMoreCharities(res.hasMore ?? false);
//       setCharitiesRemaining(Math.max(0, (res.total ?? 0) - (charities.length + res.data.length)));
//     } finally { setLoadingMore(null); }
//   };

//   const loadMoreReports = async () => {
//     const next = reportsPage + 1;
//     setLoadingMore('reports');
//     try {
//       const res = await fetchPage<Report>('/report/allReports', next, 10);
//       if (!res.data?.length) { setHasMoreReports(false); return; }
//       setReports(prev => {
//         const ids = new Set(prev.map(r => r._id));
//         return [...prev, ...res.data.filter(r => !ids.has(r._id))];
//       });
//       setReportsPage(next);
//       setHasMoreReports(res.hasMore ?? false);
//     } finally { setLoadingMore(null); }
//   };

//   const handleDeleteUser = (id: string, name: string) => {
//     setConfirmOpts({
//       title: `حذف المستخدم "${name}"`,
//       message: 'هذا الإجراء لا يمكن التراجع عنه. سيتم حذف الحساب نهائيًا.',
//       confirmLabel: 'حذف', variant: 'danger', icon: 'ti-user-off',
//       onConfirm: async () => {
//         setConfirmLoading(true);
//         try {
//           await apiFetch(`/users/${id}`, { method: 'DELETE' });
//           setUsers(prev => prev.filter(u => u._id !== id));
//           showMsg('success', `تم حذف "${name}" بنجاح`);
//         } catch (e: unknown) {
//           showMsg('error', (e instanceof Error ? e.message : null) || 'فشل الحذف');
//         } finally { setConfirmLoading(false); setConfirmOpts(null); }
//       },
//     });
//   };

//   const handleApprove = async (id: string, name: string) => {
//     setActionLoading('approve-' + id);
//     try {
//       await apiFetch(`/charity/${id}/approve`, { method: 'PATCH' });
//       setCharities(prev =>
//         prev.map(c => c._id === id ? { ...c, approvalStatus: 'approved' as ApprovalStatus } : c)
//       );
//       showMsg('success', `تمت الموافقة على "${name}"`);
//     } catch (e: unknown) {
//       showMsg('error', (e instanceof Error ? e.message : null) || 'فشلت الموافقة');
//     } finally { setActionLoading(null); }
//   };

//   const handleReject = async (reason: string) => {
//     if (!rejectTarget) return;
//     setRejectLoading(true);
//     try {
//       await apiFetch(`/charity/${rejectTarget.id}/reject`, {
//         method: 'PATCH',
//         body: JSON.stringify({ rejectionReason: reason }),
//       });
//       setCharities(prev =>
//         prev.map(c =>
//           c._id === rejectTarget.id ? { ...c, approvalStatus: 'rejected' as ApprovalStatus } : c
//         )
//       );
//       showMsg('success', `تم رفض "${rejectTarget.name}"`);
//     } catch (e: unknown) {
//       showMsg('error', (e instanceof Error ? e.message : null) || 'فشل الرفض');
//     } finally { setRejectLoading(false); setRejectTarget(null); }
//   };

//   const handleDeleteCharity = (id: string, name: string) => {
//     setConfirmOpts({
//       title: `حذف جمعية "${name}"`,
//       message: 'هذا الإجراء لا يمكن التراجع عنه.',
//       confirmLabel: 'حذف', variant: 'danger', icon: 'ti-building-off',
//       onConfirm: async () => {
//         setConfirmLoading(true);
//         try {
//           await apiFetch(`/charity/${id}`, { method: 'DELETE' });
//           setCharities(prev => prev.filter(c => c._id !== id));
//           showMsg('success', `تم حذف "${name}" بنجاح`);
//         } catch (e: unknown) {
//           showMsg('error', (e instanceof Error ? e.message : null) || 'فشل الحذف');
//         } finally { setConfirmLoading(false); setConfirmOpts(null); }
//       },
//     });
//   };

//   const runDonationReminder = async () => {
//     setCronLoading(p => ({ ...p, reminder: true }));
//     const time = new Date().toLocaleTimeString('ar-EG');
//     try {
//       await apiFetch('/cron/donationReminder');
//       setCronLog(p => [{ type: 'success', text: 'تذكير التبرعات: تم التشغيل بنجاح', time }, ...p]);
//       setLastRun(new Date().toISOString());
//       showMsg('success', 'تم تشغيل تذكير التبرعات');
//     } catch (e: unknown) {
//       const msg = (e instanceof Error ? e.message : null) || 'فشل';
//       setCronLog(p => [{ type: 'error', text: `تذكير التبرعات: ${msg}`, time }, ...p]);
//       showMsg('error', 'فشل تشغيل التذكير');
//     } finally { setCronLoading(p => ({ ...p, reminder: false })); }
//   };

//   const runAdminReport = async () => {
//     setCronLoading(p => ({ ...p, report: true }));
//     const time = new Date().toLocaleTimeString('ar-EG');
//     try {
//       await apiFetch('/cron/adminReport');
//       setCronLog(p => [{ type: 'success', text: 'تقرير الأدمن: تم الإرسال بنجاح', time }, ...p]);
//       setLastRun(new Date().toISOString());
//       showMsg('success', 'تم إرسال تقرير الأدمن');
//     } catch (e: unknown) {
//       const msg = (e instanceof Error ? e.message : null) || 'فشل';
//       setCronLog(p => [{ type: 'error', text: `تقرير الأدمن: ${msg}`, time }, ...p]);
//       showMsg('error', 'فشل إرسال التقرير');
//     } finally { setCronLoading(p => ({ ...p, report: false })); }
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
//           navigate('/login');
//         } finally {
//           setConfirmLoading(false);
//           setConfirmOpts(null);
//         }
//       },
//     });
//   };

//   const [profileForm, setProfileForm] = useState({ userName: '', phone: '', address: '' });
//   const [passForm, setPassForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
//   const [settingsSaving, setSettingsSaving] = useState(false);

//   useEffect(() => {
//     if (user) {
//       setProfileForm({
//         userName: user.userName || '',
//         phone: (user as any).phone || '',
//         address: (user as any).address || '',
//       });
//     }
//   }, [user]);

//   const { refreshUser } = useAuth();

//   const saveProfile = async () => {
//     if (!profileForm.userName.trim()) { showMsg('error', 'اسم المستخدم مطلوب'); return; }
//     setSettingsSaving(true);
//     try {
//       await usersApi.updateProfile(profileForm);
//       await refreshUser();
//       showMsg('success', 'تم تحديث الملف الشخصي بنجاح');
//     } catch (err: unknown) {
//       showMsg('error', err instanceof Error ? err.message : 'حدث خطأ');
//     } finally { setSettingsSaving(false); }
//   };

//   const savePassword = async () => {
//     if (!passForm.oldPassword || !passForm.newPassword) {
//       showMsg('error', 'يرجى ملء جميع الحقول');
//       return;
//     }
//     if (passForm.newPassword !== passForm.confirmPassword) {
//       showMsg('error', 'كلمتا المرور غير متطابقتين');
//       return;
//     }
//     setSettingsSaving(true);
//     try {
//       await usersApi.changePassword(passForm);
//       setPassForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
//       showMsg('success', 'تم تغيير كلمة المرور بنجاح');
//     } catch (err: unknown) {
//       showMsg('error', err instanceof Error ? err.message : 'حدث خطأ');
//     } finally { setSettingsSaving(false); }
//   };

//   const filteredUsers = users.filter(u => {
//     if (!usersSearch) return true;
//     const q = usersSearch.toLowerCase();
//     return (
//       u.userName?.toLowerCase().includes(q) ||
//       u.email?.toLowerCase().includes(q) ||
//       u.roleType?.toLowerCase().includes(q)
//     );
//   });

//   const filteredCharities = charities
//     .filter(c => charitiesFilter === 'all' || c.approvalStatus === charitiesFilter)
//     .filter(c => {
//       if (!charitiesSearch) return true;
//       const q = charitiesSearch.toLowerCase();
//       return (
//         c.charityName?.toLowerCase().includes(q) ||
//         c.email?.toLowerCase().includes(q)
//       );
//     });

//   const filteredReports = reports.filter(r => {
//     if (!reportsSearch) return true;
//     const q = reportsSearch.toLowerCase();
//     return (
//       r.description?.toLowerCase().includes(q) ||
//       r.userName?.toLowerCase().includes(q)    ||
//       r.charityName?.toLowerCase().includes(q)
//     );
//   });

//   const pendingCount = charities.filter(c => c.approvalStatus === 'pending').length;

//   const MONTHS_AR = [
//   'يناير','فبراير','مارس','أبريل','مايو','يونيو',
//   'يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'
// ];

// const trendData = useMemo(() => {
//   const currentYear = new Date().getFullYear();
//   const currentMonth = new Date().getMonth();

//   const usersByMonth = Array(12).fill(0);
//   users.forEach(u => {
//     if (u.createdAt) {
//       const d = new Date(u.createdAt);
//       if (d.getFullYear() === currentYear)
//         usersByMonth[d.getMonth()]++;
//     }
//   });

//   const charitiesByMonth = Array(12).fill(0);
//   charities.forEach(c => {
//     if (c.createdAt) {
//       const d = new Date(c.createdAt);
//       if (d.getFullYear() === currentYear)
//         charitiesByMonth[d.getMonth()]++;
//     }
//   });

//   return Array.from({ length: currentMonth + 1 }, (_, i) => ({
//     name: MONTHS_AR[i],
//     users: usersByMonth[i],
//     charities: charitiesByMonth[i],
//   })).filter(m => m.users > 0 || m.charities > 0);
// }, [users, charities]);

//   const approvalPieData = [
//     { name: 'موافق عليها', value: charities.filter(c => c.approvalStatus === 'approved').length },
//     { name: 'معلقة',       value: charities.filter(c => c.approvalStatus === 'pending').length  },
//     { name: 'مرفوضة',     value: charities.filter(c => c.approvalStatus === 'rejected').length  },
//   ].filter(d => d.value > 0);
//   const PIE_COLORS = [TEAL2, AMBER, RED];

//   const userName = user?.userName ?? user?.email?.split('@')[0] ?? 'مسؤول';

//   return (
//     <div className="ap-layout" dir="rtl">
//       <Sidebar
//         activeTab={tab}
//         onTabChange={setTab}
//         userName={userName}
//         onLogout={handleLogout}
//         pendingCount={pendingCount}
//         collapsed={sidebarCollapsed}
//         onToggleCollapse={handleToggleSidebar}
//       />

//       <main className={`ap-main${tab === 'ai-chat' ? ' ap-main--ai' : ''}`}>
//         {tab !== 'ai-chat' && (
//           <header className="ap-page-header">
//             <div className="ap-page-header-left">
//               <div className="ap-page-breadcrumb">
//                 <i className="ti ti-shield-check" style={{ color: TEAL2 }} />
//                 <span>لوحة التحكم</span>
//                 <i className="ti ti-chevron-left" style={{ fontSize: 12, color: 'var(--t4)' }} />
//                 <span style={{ color: 'var(--t1)', fontWeight: 700 }}>
//                   {NAV_ITEMS.find(n => n.id === tab)?.label}
//                 </span>
//               </div>
//             </div>
//             <div className="ap-page-header-right">
//               {/* زر تبديل الثيم المباشر في الناف بار */}
//               <button 
//                 className="ap-header-icon-btn ap-theme-btn" 
//                 onClick={toggleTheme} 
//                 title={theme === 'dark' ? 'تفعيل الوضع النهارى' : 'تفعيل الوضع الليلي'}
//               >
//                 <i className={`ti ${theme === 'dark' ? 'ti-sun' : 'ti-moon'}`} />
//               </button>
//               <button className="ap-header-icon-btn" onClick={loadData} title="تحديث البيانات">
//                 <i className="ti ti-refresh" />
//               </button>
//               <div className="ap-header-user" onClick={() => setTab('settings')} title="الإعدادات">
//                 <div className="ap-header-avatar">{userName.slice(0, 1).toUpperCase()}</div>
//                 <span className="ap-header-username-text">{userName}</span>
//                 <i className="ti ti-settings" style={{ fontSize: 13, color: 'var(--t4)' }} />
//               </div>
//             </div>
//           </header>
//         )}

//         <div className={`ap-content${tab === 'ai-chat' ? ' ap-content--ai' : ''}`}>
//           {error && !loading && <ErrorBanner msg={error} onRetry={loadData} />}

//           {loading ? <PageSkeleton /> : (
//             <>
//               {/* ══ OVERVIEW ══════════════════════════════════════════════════ */}
//               {tab === 'overview' && (
//                 <div className="ap-tab-pane">
//                   <div className="ap-kpi-grid">
//                     <KpiCard icon="ti-users" label="إجمالي المستخدمين" value={(usersTotal || users.length).toLocaleString('ar-EG')} change="+12.5% هذا الشهر" changeDir="up" color={TEAL2} />
//                     <KpiCard icon="ti-building-community" label="الجمعيات المسجلة" value={(charitiesTotal || charities.length).toLocaleString('ar-EG')} change="+3 جديد" changeDir="up" color="#3b82f6" />
//                     <KpiCard icon="ti-alert-circle" label="التقارير الواردة" value={(reportsTotal || reports.length).toLocaleString('ar-EG')} change={pendingCount > 0 ? `${pendingCount} معلق` : 'لا يوجد معلق'} changeDir={pendingCount > 0 ? 'down' : 'neutral'} color={AMBER} />
//                     <KpiCard icon="ti-clock-pause" label="جمعيات معلقة" value={pendingCount.toLocaleString('ar-EG')} change={pendingCount > 0 ? 'تحتاج مراجعة' : 'الكل جاهز'} changeDir={pendingCount > 0 ? 'down' : 'neutral'} color={RED} />
//                   </div>

//                   <div className="ap-charts-row">
//                     <div className="ap-chart-card ap-chart-card--wide">
//                       <div className="ap-chart-header">
//                         <span className="ap-chart-title"><i className="ti ti-trending-up" style={{ color: TEAL2 }} />نمو المستخدمين والجمعيات</span>
//                         <span className="ap-chart-trend up">↑ 12.5%</span>
//                       </div>
//                       <ResponsiveContainer width="100%" height={220}>
//                         <AreaChart data={trendData} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
//                           <defs>
//                             <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
//                               <stop offset="0%" stopColor={TEAL2} stopOpacity={0.32} />
//                               <stop offset="100%" stopColor={TEAL2} stopOpacity={0.02} />
//                             </linearGradient>
//                             <linearGradient id="gradCharities" x1="0" y1="0" x2="0" y2="1">
//                               <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.28} />
//                               <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
//                             </linearGradient>
//                           </defs>
//                           <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
//                           <XAxis dataKey="name" tick={{ fill: 'var(--t3)', fontSize: 11 }} axisLine={false} tickLine={false} />
//                           <YAxis tick={{ fill: 'var(--t3)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
//                           <Tooltip content={<ChartTooltip />} />
//                           <Area type="monotone" dataKey="users" name="المستخدمون" stroke={TEAL2} strokeWidth={2.5} fill="url(#gradUsers)" dot={false} />
//                           <Area type="monotone" dataKey="charities" name="الجمعيات" stroke="#3b82f6" strokeWidth={2.5} fill="url(#gradCharities)" dot={false} />
//                         </AreaChart>
//                       </ResponsiveContainer>
//                     </div>

//                     {approvalPieData.length > 0 && (
//                       <div className="ap-chart-card">
//                         <div className="ap-chart-header">
//                           <span className="ap-chart-title"><i className="ti ti-chart-donut" style={{ color: AMBER }} />حالة الجمعيات</span>
//                         </div>
//                         <ResponsiveContainer width="100%" height={210}>
//                           <PieChart>
//                             <Pie data={approvalPieData} cx="50%" cy="50%" innerRadius={52} outerRadius={82} paddingAngle={4} dataKey="value">
//                               {approvalPieData.map((_, index) => (
//                                 <Cell key={index} fill={PIE_COLORS[index]} strokeWidth={0} />
//                               ))}
//                             </Pie>
//                             <Tooltip formatter={(v: number, n: string) => [v, n]} contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 10, color: 'var(--t1)', fontSize: 12, fontFamily: 'Tajawal, sans-serif' }} />
//                           </PieChart>
//                         </ResponsiveContainer>
//                         <div className="ap-pie-legend">
//                           {approvalPieData.map((d, i) => (
//                             <div key={i} className="ap-pie-legend-item">
//                               <span className="ap-pie-legend-dot" style={{ background: PIE_COLORS[i] }} />
//                               <span>{d.name}</span>
//                               <span style={{ fontWeight: 700, marginRight: 'auto' }}>{d.value}</span>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {/* ══ USERS ══════════════════════════════════════════════════════ */}
//               {tab === 'users' && (
//                 <div className="ap-tab-pane">
//                   <div className="ap-section-header">
//                     <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
//                       <SectionTitle icon="ti-users" color={TEAL2} title="المستخدمون" badge={usersTotal || users.length} />
//                       <ViewToggle mode={usersViewMode} onChange={setUsersViewMode} />
//                     </div>
//                     <SearchBox value={usersSearch} onChange={setUsersSearch} placeholder="بحث بالاسم أو البريد..." />
//                   </div>

//                   {filteredUsers.length === 0 ? (
//                     <EmptyState icon="ti-user-off" title="لا يوجد مستخدمون" desc="لم يتم العثور على مستخدمين مطابقين للبحث" />
//                   ) : usersViewMode === 'table' ? (
//                     <div className="ap-table-wrap">
//                       <table className="ap-table">
//                         <thead>
//                           <tr>
//                             {['المستخدم', 'البريد الإلكتروني', 'الدور', 'موثق', 'تاريخ الانضمام', ''].map((h, i) => (
//                               <th key={i}>{h}</th>
//                             ))}
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {filteredUsers.map(u => {
//                             const verified = u.isVerified || u.verify;
//                             return (
//                               <tr key={u._id} className="ap-table-row-clickable" onClick={() => setUserDetailModal(u)}>
//                                 <td>
//                                   <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//                                     <div className="ap-table-avatar">
//                                       {u.userName?.slice(0, 1).toUpperCase() ?? '?'}
//                                     </div>
//                                     <span style={{ fontWeight: 600, color: 'var(--t1)' }}>{u.userName}</span>
//                                   </div>
//                                 </td>
//                                 <td className="ap-table-mono">{u.email}</td>
//                                 <td><RoleBadge role={u.roleType} /></td>
//                                 <td>
//                                   <span className="ap-badge" style={{ background: verified ? 'rgba(34,197,94,0.14)' : 'rgba(244,63,94,0.14)', color: verified ? '#22c55e' : RED }}>
//                                     <i className={`ti ${verified ? 'ti-circle-check' : 'ti-circle-x'}`} style={{ fontSize: 12 }} />
//                                     {verified ? 'موثق' : 'غير موثق'}
//                                   </span>
//                                 </td>
//                                 <td style={{ color: 'var(--t3)', fontSize: 12 }}>{fmt(u.createdAt)}</td>
//                                 <td onClick={e => e.stopPropagation()}>
//                                   <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
//                                     <button className="ap-eye-btn" onClick={() => setUserDetailModal(u)} title="عرض التفاصيل">
//                                       <i className="ti ti-eye" />
//                                     </button>
//                                     {u.roleType !== 'admin' && (
//                                       <button className="ap-action-btn delete" onClick={() => handleDeleteUser(u._id, u.userName)}>
//                                         <i className="ti ti-trash" />
//                                       </button>
//                                     )}
//                                   </div>
//                                 </td>
//                               </tr>
//                             );
//                           })}
//                         </tbody>
//                       </table>
//                     </div>
//                   ) : (
//                     <div className="ap-card-grid">
//                       {filteredUsers.map(u => {
//                         const verified = u.isVerified || u.verify;
//                         return (
//                           <div key={u._id} className="ap-entity-card" onClick={() => setUserDetailModal(u)}>
//                             <div className="ap-entity-card-header">
//                               <div className="ap-entity-avatar user">{u.userName?.slice(0, 1).toUpperCase()}</div>
//                               <div style={{ flex: 1, minWidth: 0 }}>
//                                 <div className="ap-entity-name">{u.userName}</div>
//                                 <div className="ap-entity-email">{u.email}</div>
//                               </div>
//                             </div>
//                             <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
//                               <RoleBadge role={u.roleType} />
//                               <span className="ap-badge" style={{ background: verified ? 'rgba(34,197,94,0.14)' : 'rgba(244,63,94,0.14)', color: verified ? '#22c55e' : RED }}>
//                                 {verified ? 'موثق' : 'غير موثق'}
//                               </span>
//                             </div>
//                             <div className="ap-entity-date"><i className="ti ti-calendar" />{fmt(u.createdAt)}</div>
//                             <div className="ap-entity-actions" onClick={e => e.stopPropagation()}>
//                               <button className="ap-card-eye-btn" onClick={() => setUserDetailModal(u)}>
//                                 <i className="ti ti-eye" /> التفاصيل
//                               </button>
//                               {u.roleType !== 'admin' && (
//                                 <button className="ap-action-btn delete" onClick={() => handleDeleteUser(u._id, u.userName)}>
//                                   <i className="ti ti-trash" /> حذف
//                                 </button>
//                               )}
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   )}

//                   {hasMoreUsers && (
//                     <LoadMoreBtn loading={loadingMore === 'users'} remaining={Math.max(0, usersTotal - users.length)} onClick={loadMoreUsers} />
//                   )}
//                 </div>
//               )}

//               {/* ══ CHARITIES ══════════════════════════════════════════════════ */}
//               {tab === 'charities' && (
//                 <div className="ap-tab-pane">
//                   <div className="ap-section-header">
//                     <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
//                       <SectionTitle icon="ti-building-community" color="#3b82f6" title="الجمعيات" badge={charitiesTotal || charities.length} />
//                       <ViewToggle mode={charitiesViewMode} onChange={setCharitiesViewMode} />
//                     </div>
//                     <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
//                       <div className="ap-filter-tabs">
//                         {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
//                           <button key={f} className={`ap-filter-tab${charitiesFilter === f ? ' active' : ''}`} onClick={() => setCharitiesFilter(f)}>
//                             {f === 'all' ? 'الكل' : f === 'pending' ? 'معلق' : f === 'approved' ? 'موافق' : 'مرفوض'}
//                             {f === 'pending' && pendingCount > 0 && (
//                               <span className="ap-filter-badge">{pendingCount}</span>
//                             )}
//                           </button>
//                         ))}
//                       </div>
//                       <SearchBox value={charitiesSearch} onChange={setCharitiesSearch} placeholder="بحث في الجمعيات..." />
//                     </div>
//                   </div>

//                   {filteredCharities.length === 0 ? (
//                     <EmptyState icon="ti-building-off" title="لا توجد جمعيات" desc="لم يتم العثور على جمعيات مطابقة" />
//                   ) : charitiesViewMode === 'table' ? (
//                     <div className="ap-table-wrap">
//                       <table className="ap-table">
//                         <thead>
//                           <tr>
//                             {['الجمعية', 'البريد الإلكتروني', 'العنوان', 'الحالة', 'تاريخ التسجيل', ''].map((h, i) => (
//                               <th key={i}>{h}</th>
//                             ))}
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {filteredCharities.map(c => (
//                             <tr key={c._id} className="ap-table-row-clickable" onClick={() => setCharityDetailModal(c)}>
//                               <td>
//                                 <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//                                   <div className="ap-table-avatar" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>
//                                     <i className="ti ti-building-community" />
//                                   </div>
//                                   <span style={{ fontWeight: 600, color: 'var(--t1)' }}>{c.charityName}</span>
//                                 </div>
//                               </td>
//                               <td className="ap-table-mono">{c.email}</td>
//                               <td>{c.address || '—'}</td>
//                               <td><StatusBadge status={c.approvalStatus} /></td>
//                               <td style={{ color: 'var(--t3)', fontSize: 12 }}>{fmt(c.createdAt)}</td>
//                               <td onClick={e => e.stopPropagation()}>
//                                 <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
//                                   <button className="ap-eye-btn" onClick={() => setCharityDetailModal(c)}>
//                                     <i className="ti ti-eye" />
//                                   </button>
//                                   {c.approvalStatus === 'pending' && (
//                                     <>
//                                       <button className="ap-action-btn approve" onClick={() => handleApprove(c._id, c.charityName)}>
//                                         <i className="ti ti-check" />
//                                       </button>
//                                       <button className="ap-action-btn reject" onClick={() => setRejectTarget({ id: c._id, name: c.charityName })}>
//                                         <i className="ti ti-x" />
//                                       </button>
//                                     </>
//                                   )}
//                                   <button className="ap-action-btn edit" onClick={() => setEditCharityTarget(c)}>
//                                     <i className="ti ti-edit" />
//                                   </button>
//                                   <button className="ap-action-btn delete" onClick={() => handleDeleteCharity(c._id, c.charityName)}>
//                                     <i className="ti ti-trash" />
//                                   </button>
//                                 </div>
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   ) : (
//                     <div className="ap-card-grid">
//                       {filteredCharities.map(c => (
//                         <div key={c._id} className="ap-entity-card" onClick={() => setCharityDetailModal(c)}>
//                           <div className="ap-entity-card-header">
//                             <div className="ap-entity-avatar charity"><i className="ti ti-building-community" /></div>
//                             <div style={{ flex: 1, minWidth: 0 }}>
//                               <div className="ap-entity-name">{c.charityName}</div>
//                               <div className="ap-entity-email">{c.email}</div>
//                             </div>
//                           </div>
//                           <div style={{ marginBottom: 10 }}>
//                             <StatusBadge status={c.approvalStatus} />
//                           </div>
//                           {c.address && <div className="ap-entity-meta"><i className="ti ti-map-pin" />{c.address}</div>}
//                           <div className="ap-entity-date"><i className="ti ti-calendar" />{fmt(c.createdAt)}</div>
//                           <div className="ap-entity-actions" onClick={e => e.stopPropagation()}>
//                             <button className="ap-card-eye-btn" onClick={() => setCharityDetailModal(c)}>
//                               <i className="ti ti-eye" /> تفاصيل
//                             </button>
//                             {c.approvalStatus === 'pending' && (
//                               <>
//                                 <button className="ap-action-btn approve" disabled={!!actionLoading} onClick={() => handleApprove(c._id, c.charityName)}>
//                                   <i className="ti ti-check" /> موافقة
//                                 </button>
//                                 <button className="ap-action-btn reject" disabled={!!actionLoading} onClick={() => setRejectTarget({ id: c._id, name: c.charityName })}>
//                                   <i className="ti ti-x" /> رفض
//                                 </button>
//                               </>
//                             )}
//                             <button className="ap-action-btn edit" onClick={() => setEditCharityTarget(c)}>
//                               <i className="ti ti-edit" />
//                             </button>
//                             <button className="ap-action-btn delete" disabled={!!actionLoading} onClick={() => handleDeleteCharity(c._id, c.charityName)}>
//                               <i className="ti ti-trash" />
//                             </button>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}

//                   {hasMoreCharities && (
//                     <LoadMoreBtn loading={loadingMore === 'charities'} remaining={charitiesRemaining} onClick={loadMoreCharities} />
//                   )}
//                 </div>
//               )}

//               {/* ══ REPORTS ══════════════════════════════════════════════════ */}
//               {tab === 'reports' && (
//                 <div className="ap-tab-pane">
//                   <div className="ap-section-header">
//                     <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
//                       <SectionTitle icon="ti-alert-circle" color={AMBER} title="التقارير" badge={reportsTotal || reports.length} />
//                       <ViewToggle mode={reportsViewMode} onChange={setReportsViewMode} />
//                     </div>
//                     <SearchBox value={reportsSearch} onChange={setReportsSearch} placeholder="بحث في التقارير..." />
//                   </div>

//                   {filteredReports.length === 0 ? (
//                     <EmptyState icon="ti-mood-happy" title="لا توجد تقارير حتى الآن" desc="كل شيء يسير على ما يرام!" />
//                   ) : reportsViewMode === 'table' ? (
//                     <div className="ap-table-wrap">
//                       <table className="ap-table">
//                         <thead>
//                           <tr>
//                             {['رقم التقرير', 'المُرسِل', 'النوع', 'الوصف', 'التاريخ', ''].map((h, i) => (
//                               <th key={i}>{h}</th>
//                             ))}
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {filteredReports.map((r, i) => {
//                             const isCharity = r.senderType === 'charity';
//                             return (
//                               <tr key={r._id} className="ap-table-row-clickable" onClick={() => setReportModal(r)}>
//                                 <td style={{ fontWeight: 700, color: 'var(--amber)' }}>#{i + 1}</td>
//                                 <td>{r.userName || r.charityName || '—'}</td>
//                                 <td>{isCharity ? 'جمعية' : 'مستخدم'}</td>
//                                 <td style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description}</td>
//                                 <td style={{ color: 'var(--t3)', fontSize: 12 }}>{fmt(r.createdAt)}</td>
//                                 <td onClick={e => e.stopPropagation()}>
//                                   <button className="ap-eye-btn" onClick={() => setReportModal(r)}>
//                                     <i className="ti ti-eye" />
//                                   </button>
//                                 </td>
//                               </tr>
//                             );
//                           })}
//                         </tbody>
//                       </table>
//                     </div>
//                   ) : (
//                     <div className="ap-card-grid">
//                       {filteredReports.map((r, i) => {
//                         const isCharity = r.senderType === 'charity';
//                         const senderName = r.userName || r.charityName || '—';
//                         return (
//                           <div key={r._id} className="ap-report-card" onClick={() => setReportModal(r)}>
//                             <div className="ap-report-card-top">
//                               <span className="ap-report-num"><i className="ti ti-alert-triangle" />تقرير #{i + 1}</span>
//                               <span className="ap-report-date"><i className="ti ti-calendar" />{fmt(r.createdAt)}</span>
//                             </div>
//                             <div className="ap-report-sender">
//                               <div className="ap-report-sender-icon" style={{ background: isCharity ? 'rgba(16,185,129,0.14)' : 'rgba(59,130,246,0.14)', color: isCharity ? TEAL2 : '#3b82f6' }}>
//                                 <i className={`ti ${isCharity ? 'ti-building' : 'ti-user'}`} />
//                               </div>
//                               <div>
//                                 <div style={{ fontWeight: 700, color: 'var(--t1)', fontSize: 13 }}>{senderName}</div>
//                                 <div style={{ fontSize: 11, color: 'var(--t4)', marginTop: 1 }}>{isCharity ? 'جمعية' : 'مستخدم'}</div>
//                               </div>
//                             </div>
//                             <p className="ap-report-body">{r.description}</p>
//                             <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
//                               <button className="ap-card-eye-btn" onClick={e => { e.stopPropagation(); setReportModal(r); }}>
//                                 <i className="ti ti-eye" /> عرض التقرير
//                               </button>
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   )}

//                   {hasMoreReports && (
//                     <LoadMoreBtn loading={loadingMore === 'reports'} remaining={Math.max(0, reportsTotal - reports.length)} onClick={loadMoreReports} />
//                   )}
//                 </div>
//               )}

//               {/* ══ AUTOMATION ══════════════════════════════════════════════ */}
//               {tab === 'automation' && (
//                 <div className="ap-tab-pane">
//                   <div className="ap-automation-banner">
//                     <div className="ap-automation-banner-icon"><i className="ti ti-settings-automation" /></div>
//                     <div>
//                       <div className="ap-automation-banner-title">التشغيل التلقائي — Cron Jobs</div>
//                       <div className="ap-automation-banner-sub">يمكنك تشغيل المهام التلقائية يدويًا من هنا. يتم تشغيلها في الخلفية وفقًا لجدول زمني محدد.</div>
//                     </div>
//                   </div>

//                   <div className="ap-cron-grid">
//                     <CronCard icon="ti-bell-ringing" iconBg="rgba(16,185,129,0.14)" iconColor={TEAL2} title="تذكير التبرعات" desc="يرسل تذكيرات للجمعيات بالتبرعات المعلقة التي لم يتم تأكيدها." code="GET /cron/donationReminder" codeBg="rgba(16,185,129,0.08)" codeBorder="rgba(16,185,129,0.24)" codeColor={TEAL2} loading={cronLoading.reminder} btnColor={TEAL2} onRun={runDonationReminder} />
//                     <CronCard icon="ti-report-analytics" iconBg="rgba(59,130,246,0.14)" iconColor="#3b82f6" title="تقرير الأدمن" desc="يولّد تقريرًا شاملاً عن نشاط المنصة ويرسله لجميع المسؤولين عبر البريد الإلكتروني." code="GET /cron/adminReport" codeBg="rgba(59,130,246,0.08)" codeBorder="rgba(59,130,246,0.24)" codeColor="#3b82f6" loading={cronLoading.report} btnColor="#3b82f6" onRun={runAdminReport} />
//                   </div>

//                   <div className="ap-cron-stats-row">
//                     {[
//                       { icon: 'ti-history',        color: TEAL2,     value: cronLog.length, label: 'عدد مرات التشغيل' },
//                       { icon: 'ti-clock',           color: AMBER,     value: lastRun ? new Date(lastRun).toLocaleTimeString('ar-EG') : '—', label: 'آخر تشغيل' },
//                       { icon: 'ti-calendar-event', color: '#3b82f6', value: 'تلقائي', label: 'جدول زمني' },
//                     ].map((s, i) => (
//                       <div key={i} className="ap-cron-stat">
//                         <i className={`ti ${s.icon}`} style={{ color: s.color, fontSize: 22 }} />
//                         <div>
//                           <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)' }}>{s.value}</div>
//                           <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>{s.label}</div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>

//                   {cronLog.length > 0 && (
//                     <div className="ap-cron-log">
//                       <div className="ap-cron-log-header">
//                         <SectionTitle icon="ti-list-details" color={TEAL2} title="سجل التنفيذ" badge={cronLog.length} />
//                         <button className="ap-cron-log-clear" onClick={() => setCronLog([])}><i className="ti ti-trash" />مسح</button>
//                       </div>
//                       <div className="ap-cron-log-list">
//                         {cronLog.map((log, i) => (
//                           <div key={i} className={`ap-cron-log-item ${log.type}`}>
//                             <span>{log.type === 'success' ? '✓' : '✗'} {log.text}</span>
//                             <span style={{ fontSize: 11, color: 'var(--t4)', flexShrink: 0 }}>{log.time}</span>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* ══ SETTINGS ══════════════════════════════════════════════════ */}
//               {tab === 'settings' && (
//                 <div className="ap-tab-pane">
//                   <div className="ap-section-header">
//                     <SectionTitle icon="ti-settings" color={TEAL2} title="الإعدادات" />
//                   </div>

//                   <div className="ap-settings-grid">
//                     <div className="ap-settings-card">
//                       <div className="ap-settings-card-title">
//                         <div className="ap-settings-icon" style={{ background: 'rgba(16,185,129,0.14)', color: TEAL2 }}>
//                           <i className="ti ti-user-circle" />
//                         </div>
//                         الملف الشخصي
//                       </div>
//                       <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
//                         <div className="ap-form-group">
//                           <label className="ap-form-label">اسم المستخدم</label>
//                           <input
//                             className="ap-form-input"
//                             value={profileForm.userName}
//                             onChange={e => setProfileForm(f => ({ ...f, userName: e.target.value }))}
//                             placeholder="اسم المستخدم"
//                           />
//                         </div>
//                         <div className="ap-form-group">
//                           <label className="ap-form-label">البريد الإلكتروني</label>
//                           <input className="ap-form-input" value={user?.email ?? ''} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
//                         </div>
//                         <div className="ap-form-group">
//                           <label className="ap-form-label">رقم الهاتف</label>
//                           <input
//                             className="ap-form-input"
//                             value={profileForm.phone}
//                             onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
//                             placeholder="01xxxxxxxxx"
//                           />
//                         </div>
//                         <div className="ap-form-group">
//                           <label className="ap-form-label">العنوان</label>
//                           <input
//                             className="ap-form-input"
//                             value={profileForm.address}
//                             onChange={e => setProfileForm(f => ({ ...f, address: e.target.value }))}
//                             placeholder="المدينة أو المنطقة"
//                           />
//                         </div>
//                         <button
//                           className="ap-action-btn approve"
//                           style={{ alignSelf: 'flex-start', padding: '8px 18px' }}
//                           disabled={settingsSaving}
//                           onClick={saveProfile}
//                         >
//                           {settingsSaving ? <><i className="ti ti-loader-2 ti-spin" /> جاري الحفظ...</> : <><i className="ti ti-check" /> حفظ التغييرات</>}
//                         </button>
//                       </div>
//                     </div>

//                     <div className="ap-settings-card">
//                       <div className="ap-settings-card-title">
//                         <div className="ap-settings-icon" style={{ background: 'rgba(244,63,94,0.14)', color: RED }}>
//                           <i className="ti ti-shield-lock" />
//                         </div>
//                         تغيير كلمة المرور
//                       </div>
//                       <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
//                         <div className="ap-form-group">
//                           <label className="ap-form-label">كلمة المرور الحالية</label>
//                           <input
//                             className="ap-form-input"
//                             type="password"
//                             value={passForm.oldPassword}
//                             onChange={e => setPassForm(f => ({ ...f, oldPassword: e.target.value }))}
//                             placeholder="••••••••"
//                           />
//                         </div>
//                         <div className="ap-form-group">
//                           <label className="ap-form-label">كلمة المرور الجديدة</label>
//                           <input
//                             className="ap-form-input"
//                             type="password"
//                             value={passForm.newPassword}
//                             onChange={e => setPassForm(f => ({ ...f, newPassword: e.target.value }))}
//                             placeholder="••••••••"
//                           />
//                         </div>
//                         <div className="ap-form-group">
//                           <label className="ap-form-label">تأكيد كلمة المرور الجديدة</label>
//                           <input
//                             className="ap-form-input"
//                             type="password"
//                             value={passForm.confirmPassword}
//                             onChange={e => setPassForm(f => ({ ...f, confirmPassword: e.target.value }))}
//                             placeholder="••••••••"
//                           />
//                         </div>
//                         <button
//                           className="ap-action-btn edit"
//                           style={{ alignSelf: 'flex-start', padding: '8px 18px' }}
//                           disabled={settingsSaving}
//                           onClick={savePassword}
//                         >
//                           {settingsSaving ? <><i className="ti ti-loader-2 ti-spin" /> جاري الحفظ...</> : <><i className="ti ti-key" /> تغيير كلمة المرور</>}
//                         </button>
//                       </div>
//                     </div>

//                     <div className="ap-settings-card">
//                       <div className="ap-settings-card-title">
//                         <div className="ap-settings-icon" style={{ background: 'rgba(59,130,246,0.14)', color: '#3b82f6' }}>
//                           <i className="ti ti-bell" />
//                         </div>
//                         الإشعارات
//                       </div>
//                       {[
//                         { label: 'إشعارات البريد الإلكتروني', sub: 'تلقي التنبيهات عبر البريد', default: true  },
//                         { label: 'تقارير جديدة',              sub: 'إشعار فوري عند ورود تقرير',  default: true  },
//                         { label: 'طلبات الانضمام',            sub: 'جمعيات تنتظر الموافقة',       default: false },
//                       ].map((item, i) => (
//                         <div key={i} className="ap-settings-row">
//                           <div>
//                             <div className="ap-settings-row-label">{item.label}</div>
//                             <div className="ap-settings-row-sub">{item.sub}</div>
//                           </div>
//                           <label className="ap-toggle">
//                             <input type="checkbox" defaultChecked={item.default} />
//                             <span className="ap-toggle-slider" />
//                           </label>
//                         </div>
//                       ))}
//                     </div>

//                     <div className="ap-settings-card">
//                       <div className="ap-settings-card-title">
//                         <div className="ap-settings-icon" style={{ background: 'rgba(245,158,11,0.14)', color: AMBER }}>
//                           <i className="ti ti-server" />
//                         </div>
//                         النظام
//                       </div>
                      
//                       {/* خيار الوضع الليلي والنهاري داخل كارد الإعدادات */}
//                       <div className="ap-settings-row">
//                         <div>
//                           <div className="ap-settings-row-label">الوضع الليلي (Dark Mode)</div>
//                           <div className="ap-settings-row-sub">تبديل مظهر لوحة التحكم بالكامل</div>
//                         </div>
//                         <label className="ap-toggle">
//                           <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
//                           <span className="ap-toggle-slider" />
//                         </label>
//                       </div>

//                       {[
//                         { label: 'وضع المطور',      sub: 'عرض السجلات التقنية',    default: false },
//                         { label: 'ذاكرة التخزين', sub: 'حفظ الجلسة تلقائياً',    default: true  },
//                       ].map((item, i) => (
//                         <div key={i} className="ap-settings-row">
//                           <div>
//                             <div className="ap-settings-row-label">{item.label}</div>
//                             <div className="ap-settings-row-sub">{item.sub}</div>
//                           </div>
//                           <label className="ap-toggle">
//                             <input type="checkbox" defaultChecked={item.default} />
//                             <span className="ap-toggle-slider" />
//                           </label>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                   <div style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 'var(--radius)', padding: '20px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>                
//                     <div>
//                       <div style={{ fontWeight: 800, color: RED, marginBottom: 4, fontSize: 14 }}>منطقة الخطر</div>
//                       <div style={{ fontSize: 13, color: 'var(--t3)', lineHeight: 1.6 }}>تسجيل الخروج من جميع الجلسات أو حذف الحساب نهائيًا.</div>
//                     </div>
//                     <button className="ap-action-btn reject" style={{ padding: '9px 18px', flexShrink: 0 }} onClick={handleLogout}>
//                       <i className="ti ti-logout" /> تسجيل الخروج
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {/* ══ AI CHAT ══════════════════════════════════════════════════ */}
//               {tab === 'ai-chat' && (
//                 <div className="ap-ai-chat-container">
//                   <AIChatEmbed />
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </main>

//       <MobileNav activeTab={tab} onTabChange={setTab} pendingCount={pendingCount} />

//       <Toast msg={toast} />
//       <ConfirmModal opts={confirmOpts} loading={confirmLoading} onClose={() => { if (!confirmLoading) setConfirmOpts(null); }} />
//       <RejectModal target={rejectTarget} loading={rejectLoading} onClose={() => setRejectTarget(null)} onConfirm={handleReject} />
//       <EditCharityModal target={editCharityTarget} loading={actionLoading} setLoading={setActionLoading} onClose={() => setEditCharityTarget(null)} onSaved={(id, form) => setCharities(prev => prev.map(c => c._id === id ? { ...c, ...form } : c))} showMsg={showMsg} />

//       {/* User Detail Modal */}
//       {userDetailModal && (() => {
//         const verified = userDetailModal.isVerified || userDetailModal.verify;
//         return (
//           <div className="ap-modal-overlay" onClick={() => setUserDetailModal(null)}>
//             <div className="ap-modal ap-modal-wide" onClick={e => e.stopPropagation()}>
//               <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.04) 100%)', padding: '22px 28px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
//                 <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
//                   <div className="ap-detail-avatar" style={{ width: 52, height: 52, fontSize: 20 }}>{userDetailModal.userName?.slice(0, 1).toUpperCase() ?? '?'}</div>
//                   <div>
//                     <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--t1)', marginBottom: 3 }}>{userDetailModal.userName}</div>
//                     <div style={{ fontSize: 13, color: 'var(--t3)' }}>{userDetailModal.email}</div>
//                     <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
//                       <RoleBadge role={userDetailModal.roleType} />
//                       <span className="ap-badge" style={{ background: verified ? 'rgba(34,197,94,0.14)' : 'rgba(244,63,94,0.14)', color: verified ? '#22c55e' : RED }}>
//                         <i className={`ti ${verified ? 'ti-circle-check' : 'ti-circle-x'}`} style={{ fontSize: 11 }} />
//                         {verified ? 'موثق' : 'غير موثق'}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//                 <button className="ap-modal-close-x" onClick={() => setUserDetailModal(null)}><i className="ti ti-x" /></button>
//               </div>
//               <div className="ap-modal-inner" style={{ paddingTop: 20 }}>
//                 <div className="ap-detail-section">
//                   <DetailRow icon="ti-fingerprint" label="المعرف"       value={userDetailModal._id}                           mono />
//                   <DetailRow icon="ti-mail"        label="البريد"       value={userDetailModal.email}                               />
//                   {userDetailModal.phone   && <DetailRow icon="ti-phone"   label="الهاتف"    value={userDetailModal.phone}   />}
//                   {userDetailModal.address && <DetailRow icon="ti-map-pin" label="العنوان"   value={userDetailModal.address} />}
//                   <DetailRow icon="ti-calendar"    label="تاريخ الانضمام" value={fmt(userDetailModal.createdAt)}                    />
//                   {userDetailModal.updatedAt && <DetailRow icon="ti-clock-edit" label="آخر تحديث" value={fmt(userDetailModal.updatedAt)} />}
//                 </div>
//                 <div className="ap-modal-actions" style={{ marginTop: 18 }}>
//                   <button className="ap-modal-cancel" onClick={() => setUserDetailModal(null)}>إغلاق</button>
//                   {userDetailModal.roleType !== 'admin' && (
//                     <button className="ap-modal-confirm" style={{ background: RED }} onClick={() => { setUserDetailModal(null); handleDeleteUser(userDetailModal._id, userDetailModal.userName); }}>
//                       <i className="ti ti-trash" />حذف المستخدم
//                     </button>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         );
//       })()}

//       {/* Charity Detail Modal */}
//       {charityDetailModal && (
//         <div className="ap-modal-overlay" onClick={() => setCharityDetailModal(null)}>
//           <div className="ap-modal ap-modal-wide" onClick={e => e.stopPropagation()}>
//             <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.04) 100%)', padding: '22px 28px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
//               <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
//                 <div className="ap-entity-avatar charity" style={{ width: 52, height: 52, fontSize: 22 }}><i className="ti ti-building-community" /></div>
//                 <div>
//                   <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--t1)', marginBottom: 3 }}>{charityDetailModal.charityName}</div>
//                   <div style={{ fontSize: 13, color: 'var(--t3)' }}>{charityDetailModal.email}</div>
//                   <div style={{ marginTop: 8 }}><StatusBadge status={charityDetailModal.approvalStatus} /></div>
//                 </div>
//               </div>
//               <button className="ap-modal-close-x" onClick={() => setCharityDetailModal(null)}><i className="ti ti-x" /></button>
//             </div>

//             <div className="ap-modal-inner" style={{ paddingTop: 20 }}>
//               <div className="ap-detail-section" style={{ marginBottom: 16 }}>
//                 <DetailRow icon="ti-fingerprint"  label="المعرف"        value={charityDetailModal._id}                     mono />
//                 <DetailRow icon="ti-map-pin"      label="العنوان"       value={charityDetailModal.address || '—'}                />
//                 {charityDetailModal.phone         && <DetailRow icon="ti-phone"       label="الهاتف"       value={charityDetailModal.phone}         />}
//                 {charityDetailModal.licenseNumber && <DetailRow icon="ti-certificate" label="رقم الترخيص"  value={charityDetailModal.licenseNumber} />}
//                 <DetailRow icon="ti-calendar"     label="تاريخ التسجيل" value={fmt(charityDetailModal.createdAt)}                />
//                 {charityDetailModal.userId && <DetailRow icon="ti-user" label="معرف المالك" value={charityDetailModal.userId} mono />}
//               </div>

//               {charityDetailModal.description && (
//                 <div style={{ marginBottom: 16 }}>
//                   <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
//                     <i className="ti ti-file-description" style={{ fontSize: 14 }} /> وصف الجمعية
//                   </div>
//                   <div className="ap-report-full-body">{charityDetailModal.description}</div>
//                 </div>
//               )}

//               {charityDetailModal.approvalStatus === 'rejected' && charityDetailModal.rejectionReason && (
//                 <div style={{ marginBottom: 16 }}>
//                   <div style={{ fontSize: 12, fontWeight: 700, color: RED, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
//                     <i className="ti ti-alert-circle" style={{ fontSize: 14 }} /> سبب الرفض
//                   </div>
//                   <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.8, background: 'rgba(244,63,94,0.06)', borderRadius: 'var(--radius-sm)', padding: 14, border: '1px solid rgba(244,63,94,0.18)' }}>
//                     {charityDetailModal.rejectionReason}
//                   </div>
//                 </div>
//               )}

//               {charityDetailModal.approvalStatus === 'pending' && (
//                 <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
//                   <button className="ap-action-btn approve" style={{ flex: 1, justifyContent: 'center' }} disabled={!!actionLoading} onClick={() => { setCharityDetailModal(null); handleApprove(charityDetailModal._id, charityDetailModal.charityName); }}>
//                     <i className="ti ti-check" />موافقة
//                   </button>
//                   <button className="ap-action-btn reject" style={{ flex: 1, justifyContent: 'center' }} disabled={!!actionLoading} onClick={() => { setCharityDetailModal(null); setRejectTarget({ id: charityDetailModal._id, name: charityDetailModal.charityName }); }}>
//                     <i className="ti ti-x" />رفض
//                   </button>
//                 </div>
//               )}
//               <div className="ap-modal-actions">
//                 <button className="ap-modal-cancel" onClick={() => setCharityDetailModal(null)}>إغلاق</button>
//                 <button className="ap-action-btn edit" style={{ padding: '10px 18px', fontSize: 13 }} onClick={() => { setCharityDetailModal(null); setEditCharityTarget(charityDetailModal); }}>
//                   <i className="ti ti-edit" />تعديل
//                 </button>
//                 <button className="ap-modal-confirm" style={{ background: RED }} disabled={!!actionLoading} onClick={() => { setCharityDetailModal(null); handleDeleteCharity(charityDetailModal._id, charityDetailModal.charityName); }}>
//                   <i className="ti ti-trash" />حذف
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Report Detail Modal */}
//       {reportModal && (() => {
//         const isCharity = reportModal.senderType === 'charity';
//         const senderName = reportModal.userName || reportModal.charityName || '—';
//         return (
//           <div className="ap-modal-overlay" onClick={() => setReportModal(null)}>
//             <div className="ap-modal ap-modal-wide" onClick={e => e.stopPropagation()}>
//               <div style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(245,158,11,0.04) 100%)', padding: '22px 28px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
//                 <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
//                   <div style={{ width: 48, height: 48, borderRadius: 13, background: 'rgba(245,158,11,0.14)', color: AMBER, display: 'flex', alignItems: 'center', justifycontent: 'center', fontSize: 22, flexShrink: 0 }}>
//                     <i className="ti ti-alert-triangle" />
//                   </div>
//                   <div>
//                     <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--t1)', marginBottom: 3 }}>تقرير وارد</div>
//                     <div style={{ fontSize: 12, color: 'var(--t3)' }}>{fmt(reportModal.createdAt)}</div>
//                   </div>
//                 </div>
//                 <button className="ap-modal-close-x" onClick={() => setReportModal(null)}><i className="ti ti-x" /></button>
//               </div>

//               <div className="ap-modal-inner" style={{ paddingTop: 20 }}>
//                 <div className="ap-detail-section" style={{ marginBottom: 16 }}>
//                   <DetailRow icon={isCharity ? 'ti-building' : 'ti-user'} label="المُرسِل" value={senderName} />
//                   <DetailRow icon="ti-tag" label="نوع المُرسِل" value={isCharity ? 'جمعية' : 'مستخدم'} />
//                   <DetailRow icon="ti-calendar" label="التاريخ" value={fmt(reportModal.createdAt)} />
//                   {reportModal.userId && <DetailRow icon="ti-fingerprint" label="معرف المُرسِل" value={reportModal.userId} mono />}
//                 </div>

//                 <div style={{ marginBottom: 16 }}>
//                   <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
//                     <i className="ti ti-file-text" style={{ fontSize: 14 }} /> محتوى التقرير
//                   </div>
//                   <div className="ap-report-full-body">{reportModal.description}</div>
//                 </div>

//                 <div className="ap-modal-actions" style={{ marginTop: 16 }}>
//                   <button className="ap-modal-cancel" onClick={() => setReportModal(null)}>إغلاق</button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         );
//       })()}
//     </div>
//   );
// }

// import { useEffect, useState, useCallback, useMemo } from 'react';
// import { useAuth } from '../../contexts/AuthContext';
// import { useLocation } from 'wouter';
// import '../../styles/css/AdminPanel.css';
// import {
//   AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
//   Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
// } from 'recharts';
// import AIChatEmbed from '../../components/shared/AIChatEmbed';
// import { usersApi } from '../../services';
// import {
//   apiFetch, fetchPage,
//   User, Charity, Report, Tab, ApprovalStatus,
//   APPROVAL_CFG, ROLE_CFG,
//   TEAL2, AMBER, RED,
//   fmt,
// } from './adminTypes';

// type ViewMode = 'table' | 'cards';
// type ThemeMode = 'dark' | 'light';

// const NAV_ITEMS = [
//   { id: 'overview',   label: 'نظرة عامة',       icon: 'ti-layout-dashboard'    },
//   { id: 'users',      label: 'المستخدمون',       icon: 'ti-users'               },
//   { id: 'charities',  label: 'الجمعيات',          icon: 'ti-building-community'  },
//   { id: 'reports',    label: 'التقارير',          icon: 'ti-alert-circle'        },
//   { id: 'automation', label: 'التشغيل التلقائي', icon: 'ti-settings-automation' },
//   { id: 'settings',   label: 'الإعدادات',        icon: 'ti-settings'            },
//   { id: 'ai-chat',    label: 'مساعد الذكاء',     icon: 'ti-brain'               },
// ];

// // ─── Sidebar Component ────────────────────────────────────────────────────────
// function Sidebar({ activeTab, onTabChange, userName, onLogout, pendingCount, collapsed, onToggleCollapse }: {
//   activeTab: Tab;
//   onTabChange: (tab: Tab) => void;
//   userName: string;
//   onLogout: () => void;
//   pendingCount: number;
//   collapsed: boolean;
//   onToggleCollapse: () => void;
// }) {
//   return (
//     <aside className={`ap-sidebar${collapsed ? ' collapsed' : ''}`}>
//       <div className="ap-sidebar-brand">
//         <div className="ap-brand-icon">
//           <i className="ti ti-shield-check" />
//         </div>
//         {!collapsed && <span className="ap-brand-title">لوحة التحكم</span>}
//         <button
//           className="ap-collapse-btn"
//           onClick={onToggleCollapse}
//           title={collapsed ? 'توسيع الشريط' : 'طي الشريط'}
//         >
//           <i className={`ti ${collapsed ? 'ti-layout-sidebar-right-expand' : 'ti-layout-sidebar-right-collapse'}`} />
//         </button>
//       </div>

      

//       <nav className="ap-sidebar-nav">
//         {NAV_ITEMS.map(item => (
//           <button
//             key={item.id}
//             className={`ap-nav-item${activeTab === item.id ? ' active' : ''}`}
//             onClick={() => onTabChange(item.id as Tab)}
//             title={collapsed ? item.label : undefined}
//           >
//             <span className="ap-nav-icon-wrap">
//               <i className={`ti ${item.icon}`} />
//               {item.id === 'charities' && pendingCount > 0 && (
//                 <span className="ap-nav-badge">{pendingCount}</span>
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
//             <div className="ap-user-avatar">{userName?.slice(0, 1).toUpperCase()}</div>
//             <div className="ap-user-meta">
//               <span className="ap-user-name">{userName}</span>
//               <span className="ap-user-role">مسؤول النظام</span>
//             </div>
//             <i className="ti ti-settings" style={{ fontSize: 14, color: 'var(--t4)' }} />
//           </div>
//         )}
//         {collapsed && (
//           <button
//             className="ap-nav-item"
//             onClick={() => onTabChange('settings')}
//             title="الإعدادات"
//             style={{ justifyContent: 'center', padding: '10px 0' }}
//           >
//             <span className="ap-nav-icon-wrap">
//               <i className="ti ti-settings" />
//             </span>
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

// // ─── Mobile Bottom Nav ────────────────────────────────────────────────────────
// function MobileNav({ activeTab, onTabChange, pendingCount }: {
//   activeTab: Tab;
//   onTabChange: (tab: Tab) => void;
//   pendingCount: number;
// }) {
//   return (
//     <nav className="ap-mobile-nav">
//       {NAV_ITEMS.map(item => (
//         <button
//           key={item.id}
//           className={`ap-mobile-nav-item${activeTab === item.id ? ' active' : ''}`}
//           onClick={() => onTabChange(item.id as Tab)}
//         >
//           <span className="ap-nav-icon-wrap">
//             <i className={`ti ${item.icon}`} />
//             {item.id === 'charities' && pendingCount > 0 && (
//               <span className="ap-nav-badge">{pendingCount}</span>
//             )}
//           </span>
//           <span>{item.label}</span>
//         </button>
//       ))}
//     </nav>
//   );
// }

// // ─── View Toggle Component ──────────────────────────────────────────────────
// function ViewToggle({ mode, onChange }: { mode: ViewMode; onChange: (mode: ViewMode) => void }) {
//   return (
//     <div className="ap-view-switcher">
//       <button 
//         className={`ap-view-btn ${mode === 'table' ? 'active' : ''}`} 
//         onClick={() => onChange('table')}
//         title="عرض كجدول"
//       >
//         <i className="ti ti-list" />
//       </button>
//       <button 
//         className={`ap-view-btn ${mode === 'cards' ? 'active' : ''}`} 
//         onClick={() => onChange('cards')}
//         title="عرض ككروت"
//       >
//         <i className="ti ti-layout-grid" />
//       </button>
//     </div>
//   );
// }

// function StatusBadge({ status }: { status: string }) {
//   const cfg = APPROVAL_CFG[status as ApprovalStatus] ?? {
//     label: status, bg: '#1c2333', color: '#9aa5b9', dot: '#3d4a60',
//   };
//   return (
//     <span className="ap-badge" style={{ background: cfg.bg, color: cfg.color }}>
//       <span className="ap-badge-dot" style={{ background: cfg.dot }} />
//       {cfg.label}
//     </span>
//   );
// }

// function RoleBadge({ role }: { role: string }) {
//   const cfg = ROLE_CFG[role as keyof typeof ROLE_CFG] ?? {
//     label: role, bg: '#1c2333', color: '#9aa5b9', icon: '',
//   };
//   return (
//     <span className="ap-badge" style={{ background: cfg.bg, color: cfg.color }}>
//       {cfg.icon} {cfg.label}
//     </span>
//   );
// }

// function Toast({ msg }: { msg: { type: 'success' | 'error'; text: string } | null }) {
//   if (!msg) return null;
//   return (
//     <div className={`ap-toast ${msg.type}`}>
//       <i className={`ti ${msg.type === 'success' ? 'ti-circle-check' : 'ti-alert-circle'}`} />
//       {msg.text}
//     </div>
//   );
// }

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
//               {loading && <i className="ti ti-loader-2 ti-spin" />}
//               {opts.confirmLabel ?? 'تأكيد'}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function RejectModal({ target, loading, onClose, onConfirm }: {
//   target: { id: string; name: string } | null;
//   loading: boolean;
//   onClose: () => void;
//   onConfirm: (reason: string) => void;
// }) {
//   const [reason, setReason] = useState('');
//   useEffect(() => { if (target) setReason(''); }, [target]);
//   if (!target) return null;
//   return (
//     <div className="ap-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
//       <div className="ap-modal">
//         <div className="ap-modal-inner">
//           <div className="ap-modal-icon" style={{ background: RED + '22' }}>
//             <i className="ti ti-x" style={{ color: RED }} />
//           </div>
//           <h3 className="ap-modal-title">رفض جمعية "{target.name}"</h3>
//           <p className="ap-modal-msg">يمكنك تحديد سبب الرفض ليصل للجمعية بالبريد الإلكتروني.</p>
//           <div className="ap-form-group" style={{ marginBottom: 20 }}>
//             <label className="ap-form-label">سبب الرفض</label>
//             <textarea
//               className="ap-form-textarea"
//               rows={3}
//               value={reason}
//               onChange={e => setReason(e.target.value)}
//               placeholder="سبب الرفض (اختياري)"
//             />
//           </div>
//           <div className="ap-modal-actions">
//             <button className="ap-modal-cancel" onClick={onClose} disabled={loading}>إلغاء</button>
//             <button
//               className="ap-modal-confirm"
//               disabled={loading}
//               style={{ background: RED }}
//               onClick={() => onConfirm(reason)}
//             >
//               {loading && <i className="ti ti-loader-2 ti-spin" />}
//               تأكيد الرفض
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function EditCharityModal({ target, loading, setLoading, onClose, onSaved, showMsg }: {
//   target: Charity | null;
//   loading: string | null;
//   setLoading: (v: string | null) => void;
//   onClose: () => void;
//   onSaved: (id: string, form: { charityName: string; address: string; description: string }) => void;
//   showMsg: (type: 'success' | 'error', text: string) => void;
// }) {
//   const [form, setForm] = useState({ charityName: '', address: '', description: '' });
//   const [errors, setErrors] = useState<Record<string, string>>({});

//   useEffect(() => {
//     if (target) {
//       setForm({
//         charityName: target.charityName ?? '',
//         address: target.address ?? '',
//         description: target.description ?? '',
//       });
//       setErrors({});
//     }
//   }, [target]);

//   if (!target) return null;

//   const validate = () => {
//     const e: Record<string, string> = {};
//     if (!form.charityName.trim() || form.charityName.trim().length < 3)
//       e.charityName = 'اسم الجمعية يجب أن يكون 3 أحرف على الأقل';
//     if (!form.address.trim() || form.address.trim().length < 5)
//       e.address = 'العنوان يجب أن يكون 5 أحرف على الأقل';
//     return e;
//   };

//   const isBusy = loading === 'edit-' + target._id;
//   const changed =
//     form.charityName  !== (target.charityName  ?? '') ||
//     form.address      !== (target.address      ?? '') ||
//     form.description  !== (target.description  ?? '');

//   const handleSave = async () => {
//     const e = validate();
//     if (Object.keys(e).length) { setErrors(e); return; }
//     setLoading('edit-' + target._id);
//     try {
//       await apiFetch(`/charity/${target._id}`, {
//         method: 'PATCH',
//         body: JSON.stringify({
//           charityName: form.charityName.trim(),
//           address: form.address.trim(),
//           description: form.description.trim(),
//         }),
//       });
//       onSaved(target._id, form);
//       showMsg('success', `تم تحديث "${form.charityName}" بنجاح`);
//       onClose();
//     } catch (err: unknown) {
//       showMsg('error', (err instanceof Error ? err.message : null) || 'فشل التحديث');
//     } finally { setLoading(null); }
//   };

//   return (
//     <div className="ap-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
//       <div className="ap-modal">
//         <div className="ap-modal-inner">
//           <div className="ap-modal-icon" style={{ background: TEAL2 + '22' }}>
//             <i className="ti ti-edit" style={{ color: TEAL2 }} />
//           </div>
//           <h3 className="ap-modal-title">تعديل بيانات الجمعية</h3>
//           <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>
//             <div className="ap-form-group">
//               <label className="ap-form-label">
//                 اسم الجمعية <span style={{ color: RED }}>*</span>
//               </label>
//               <input
//                 className={`ap-form-input${errors.charityName ? ' error' : ''}`}
//                 value={form.charityName}
//                 onChange={e => {
//                   setForm(f => ({ ...f, charityName: e.target.value }));
//                   setErrors(er => ({ ...er, charityName: '' }));
//                 }}
//                 placeholder="اسم الجمعية"
//               />
//               {errors.charityName && (
//                 <div className="ap-form-err">
//                   <i className="ti ti-alert-circle" />{errors.charityName}
//                 </div>
//               )}
//             </div>
//             <div className="ap-form-group">
//               <label className="ap-form-label">
//                 العنوان <span style={{ color: RED }}>*</span>
//               </label>
//               <input
//                 className={`ap-form-input${errors.address ? ' error' : ''}`}
//                 value={form.address}
//                 onChange={e => {
//                   setForm(f => ({ ...f, address: e.target.value }));
//                   setErrors(er => ({ ...er, address: '' }));
//                 }}
//                 placeholder="عنوان الجمعية"
//               />
//               {errors.address && (
//                 <div className="ap-form-err">
//                   <i className="ti ti-alert-circle" />{errors.address}
//                 </div>
//               )}
//             </div>
//             <div className="ap-form-group">
//               <label className="ap-form-label">
//                 الوصف{' '}
//                 <span style={{ fontSize: 11, color: 'var(--t4)', fontWeight: 400 }}>(اختياري)</span>
//               </label>
//               <textarea
//                 className="ap-form-textarea"
//                 rows={3}
//                 value={form.description}
//                 onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
//                 placeholder="وصف مختصر عن الجمعية..."
//               />
//             </div>
//           </div>
//           <div className="ap-info-box" style={{ marginBottom: 18 }}>
//             <div className="ap-info-row">
//               <span className="lbl">البريد الإلكتروني:</span>
//               <span className="val">{target.email}</span>
//             </div>
//             <div className="ap-info-row">
//               <span className="lbl">حالة الجمعية:</span>
//               <span className="val"><StatusBadge status={target.approvalStatus} /></span>
//             </div>
//             {target.licenseNumber && (
//               <div className="ap-info-row">
//                 <span className="lbl">رقم الترخيص:</span>
//                 <span className="val">{target.licenseNumber}</span>
//               </div>
//             )}
//           </div>
//           <div className="ap-modal-actions">
//             <button className="ap-modal-cancel" onClick={onClose} disabled={isBusy}>إلغاء</button>
//             <button
//               className="ap-modal-confirm"
//               disabled={isBusy || !changed}
//               style={{ background: TEAL2 }}
//               onClick={handleSave}
//             >
//               {isBusy && <i className="ti ti-loader-2 ti-spin" />}
//               {isBusy ? 'جاري الحفظ...' : 'حفظ التغييرات'}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function PageSkeleton() {
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
//     </div>
//   );
// }

// function DetailRow({ icon, label, value, mono, danger }: {
//   icon: string; label: string; value: string; mono?: boolean; danger?: boolean;
// }) {
//   return (
//     <div className="ap-detail-row">
//       <div className="ap-detail-row-icon"><i className={`ti ${icon}`} /></div>
//       <span className="ap-detail-row-label">{label}</span>
//       <span className={`ap-detail-row-val${mono ? ' mono' : ''}${danger ? ' danger' : ''}`}>
//         {value}
//       </span>
//     </div>
//   );
// }

// function EmptyState({ icon, title, desc }: { icon: string; title: string; desc?: string }) {
//   return (
//     <div className="ap-empty-state">
//       <div className="ap-empty-icon"><i className={`ti ${icon}`} /></div>
//       <div className="ap-empty-title">{title}</div>
//       {desc && <div className="ap-empty-desc">{desc}</div>}
//     </div>
//   );
// }

// function ErrorBanner({ msg, onRetry }: { msg: string; onRetry: () => void }) {
//   return (
//     <div className="ap-error-banner">
//       <i className="ti ti-alert-triangle" style={{ color: AMBER, fontSize: 20, flexShrink: 0 }} />
//       <div style={{ flex: 1 }}>
//         <div style={{ fontWeight: 700, marginBottom: 3, color: 'var(--t1)' }}>حدث خطأ</div>
//         <div style={{ fontSize: 13, color: 'var(--t3)' }}>{msg}</div>
//       </div>
//       <button className="ap-retry-btn" onClick={onRetry}>
//         <i className="ti ti-refresh" /> إعادة المحاولة
//       </button>
//     </div>
//   );
// }

// function SectionTitle({ icon, color, title, badge }: {
//   icon: string; color: string; title: string; badge?: number;
// }) {
//   return (
//     <div className="ap-section-title">
//       <i className={`ti ${icon}`} style={{ color }} />
//       {title}
//       {badge !== undefined && (
//         <span className="ap-count-badge" style={{ background: color }}>{badge}</span>
//       )}
//     </div>
//   );
// }

// function SearchBox({ value, onChange, placeholder }: {
//   value: string;
//   onChange: (v: string) => void;
//   placeholder?: string;
// }) {
//   return (
//     <div className="ap-search-wrap">
//       <i className="ti ti-search ap-search-icon" />
//       <input
//         className="ap-search-input"
//         value={value}
//         onChange={e => onChange(e.target.value)}
//         placeholder={placeholder ?? 'بحث...'}
//       />
//       {value && (
//         <button className="ap-search-clear" onClick={() => onChange('')}>
//           <i className="ti ti-x" />
//         </button>
//       )}
//     </div>
//   );
// }

// function LoadMoreBtn({ loading, remaining, onClick }: {
//   loading: boolean; remaining: number; onClick: () => void;
// }) {
//   return (
//     <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
//       <button className="ap-load-more-btn" onClick={onClick} disabled={loading}>
//         {loading
//           ? <><i className="ti ti-loader-2 ti-spin" /> جاري التحميل...</>
//           : <>تحميل المزيد {remaining > 0 && `(${remaining})`}</>
//         }
//       </button>
//     </div>
//   );
// }

// function KpiCard({ icon, label, value, change, changeDir, color }: {
//   icon: string; label: string; value: string | number;
//   change?: string; changeDir?: 'up' | 'down' | 'neutral'; color: string;
// }) {
//   return (
//     <div className="ap-kpi-card" style={{ '--kpi-color': color } as React.CSSProperties}>
//       <div className="ap-kpi-icon-wrap"><i className={`ti ${icon}`} /></div>
//       <div className="ap-kpi-value">{value}</div>
//       <div className="ap-kpi-label">{label}</div>
//       {change && (
//         <div className={`ap-kpi-change ${changeDir ?? 'neutral'}`}>{change}</div>
//       )}
//     </div>
//   );
// }

// function ChartTooltip({ active, payload, label }: {
//   active?: boolean;
//   payload?: { value: number; name: string }[];
//   label?: string;
// }) {
//   if (!active || !payload?.length) return null;
//   return (
//     <div className="ap-chart-tooltip">
//       <div className="ap-chart-tooltip-label">{label}</div>
//       {payload.map((p, i) => (
//         <div key={i} className="ap-chart-tooltip-row">
//           <span>{p.name}</span>
//           <span style={{ fontWeight: 700 }}>{p.value.toLocaleString('en-US')}</span>
//         </div>
//       ))}
//     </div>
//   );
// }

// function CronCard({ icon, iconBg, iconColor, title, desc, code, codeBg, codeBorder, codeColor, loading, btnColor, onRun }: {
//   icon: string; iconBg: string; iconColor: string;
//   title: string; desc: string; code: string;
//   codeBg: string; codeBorder: string; codeColor: string;
//   loading: boolean; btnColor: string; onRun: () => void;
// }) {
//   return (
//     <div className="ap-cron-card">
//       <div className="ap-cron-icon" style={{ background: iconBg }}>
//         <i className={`ti ${icon}`} style={{ color: iconColor }} />
//       </div>
//       <div className="ap-cron-title">{title}</div>
//       <p className="ap-cron-desc">{desc}</p>
//       <code className="ap-cron-code" style={{ background: codeBg, borderColor: codeBorder, color: codeColor }}>
//         {code}
//       </code>
//       <button
//         className="ap-cron-run-btn"
//         style={{ background: btnColor }}
//         disabled={loading}
//         onClick={onRun}
//       >
//         {loading
//           ? <><i className="ti ti-loader-2 ti-spin" />جاري التشغيل...</>
//           : <><i className="ti ti-player-play" />تشغيل الآن</>
//         }
//       </button>
//     </div>
//   );
// }

// export default function AdminPanel() {
//   const { user, logout } = useAuth();
//   const [, navigate] = useLocation();
//   const [tab, setTab] = useState<Tab>('overview');

//   // ─── View Modes State ──────────────────────────────────────────────────────
//   const [usersViewMode, setUsersViewMode] = useState<ViewMode>('table');
//   const [charitiesViewMode, setCharitiesViewMode] = useState<ViewMode>('cards');
//   const [reportsViewMode, setReportsViewMode] = useState<ViewMode>('cards');

//   // ─── Theme Mode Logic ──────────────────────────────────────────────────────
//   const [theme, setTheme] = useState<ThemeMode>(() => {
//     try {
//       return (localStorage.getItem('ap-theme') as ThemeMode) || 'dark';
//     } catch { return 'dark'; }
//   });

//   useEffect(() => {
//     try {
//       localStorage.setItem('ap-theme', theme);
//       // تحديث كلاس الـ body لتطبيق الستايل على كامل الصفحة
//       if (theme === 'light') {
//         document.body.classList.add('ap-light-theme');
//       } else {
//         document.body.classList.remove('ap-light-theme');
//       }
//     } catch { /* ignore */ }
//   }, [theme]);

//   const toggleTheme = () => {
//     setTheme(prev => prev === 'dark' ? 'light' : 'dark');
//   };

//   const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
//     try {
//       return localStorage.getItem('ap-sidebar-collapsed') === 'true';
//     } catch { return false; }
//   });

//   const handleToggleSidebar = () => {
//     setSidebarCollapsed(v => {
//       const next = !v;
//       try { localStorage.setItem('ap-sidebar-collapsed', String(next)); } catch { /* ignore */ }
//       return next;
//     });
//   };

//   const [users,      setUsers]     = useState<User[]>([]);
//   const [charities, setCharities] = useState<Charity[]>([]);
//   const [reports,    setReports]   = useState<Report[]>([]);

//   const [usersTotal,      setUsersTotal]     = useState(0);
//   const [charitiesTotal, setCharitiesTotal] = useState(0);
//   const [reportsTotal,    setReportsTotal]   = useState(0);

//   const [usersPage,      setUsersPage]     = useState(1);
//   const [charitiesPage, setCharitiesPage] = useState(1);
//   const [reportsPage,    setReportsPage]   = useState(1);

//   const [hasMoreUsers,       setHasMoreUsers]       = useState(false);
//   const [hasMoreCharities,   setHasMoreCharities]   = useState(false);
//   const [hasMoreReports,     setHasMoreReports]     = useState(false);
//   const [charitiesRemaining, setCharitiesRemaining] = useState(0);
//   const [loadingMore,        setLoadingMore]        = useState<string | null>(null);

//   const [loading,       setLoading]       = useState(true);
//   const [error,         setError]         = useState<string | null>(null);
//   const [actionLoading, setActionLoading] = useState<string | null>(null);
//   const [toast,         setToast]         = useState<{ type: 'success' | 'error'; text: string } | null>(null);
//   const [confirmOpts,   setConfirmOpts]   = useState<ConfirmState | null>(null);
//   const [confirmLoading,setConfirmLoading]= useState(false);
//   const [rejectTarget,  setRejectTarget]  = useState<{ id: string; name: string } | null>(null);
//   const [rejectLoading, setRejectLoading] = useState(false);
//   const [editCharityTarget,  setEditCharityTarget]  = useState<Charity | null>(null);
//   const [userDetailModal,    setUserDetailModal]    = useState<User | null>(null);
//   const [reportModal,        setReportModal]        = useState<Report | null>(null);
//   const [charityDetailModal, setCharityDetailModal] = useState<Charity | null>(null);

//   const [usersSearch,     setUsersSearch]     = useState('');
//   const [charitiesSearch, setCharitiesSearch] = useState('');
//   const [reportsSearch,   setReportsSearch]   = useState('');
//   const [charitiesFilter, setCharitiesFilter] = useState<string>('all');

//   const [cronLoading, setCronLoading] = useState({ reminder: false, report: false });
//   const [cronLog, setCronLog]         = useState<{ type: 'success' | 'error'; text: string; time: string }[]>([]);
//   const [lastRun, setLastRun]         = useState<string | null>(null);

//   useEffect(() => {
//     const tick = () => {
//       const el = document.getElementById('ap-clock');
//       if (el) {
//         el.textContent = new Date().toLocaleTimeString('ar-EG', {
//           hour: '2-digit', minute: '2-digit',
//         });
//       }
//     };
//     tick();
//     const id = setInterval(tick, 30_000);
//     return () => clearInterval(id);
//   }, []);

//   const showMsg = useCallback((type: 'success' | 'error', text: string) => {
//     setToast({ type, text });
//     setTimeout(() => setToast(null), 3500);
//   }, []);

//   const loadData = useCallback(async () => {
//     setLoading(true);
//     setError(null);
//     setUsersPage(1);
//     setCharitiesPage(1);
//     setReportsPage(1);

//     try {
//       const [uRes, cRes, rRes] = await Promise.allSettled([
//         fetchPage<User>('/users', 1, 10),
//         fetchPage<Charity>('/charity/charities', 1, 10),
//         fetchPage<Report>('/report/allReports', 1, 10),
//       ]);

//       if (uRes.status === 'fulfilled') {
//         setUsers(uRes.value.data ?? []);
//         setUsersTotal(uRes.value.total ?? 0);
//         setHasMoreUsers(uRes.value.hasMore ?? false);
//       }
//       if (cRes.status === 'fulfilled') {
//         setCharities(cRes.value.data ?? []);
//         setCharitiesTotal(cRes.value.total ?? 0);
//         setHasMoreCharities(cRes.value.hasMore ?? false);
//         setCharitiesRemaining(
//           Math.max(0, (cRes.value.total ?? 0) - (cRes.value.data?.length ?? 0))
//         );
//       }
//       if (rRes.status === 'fulfilled') {
//         setReports(rRes.value.data ?? []);
//         setReportsTotal(rRes.value.total ?? 0);
//         setHasMoreReports(rRes.value.hasMore ?? false);
//       }

//       const failures = [uRes, cRes, rRes].filter(r => r.status === 'rejected') as PromiseRejectedResult[];
//       if (failures.length === 3) {
//         throw new Error((failures[0].reason instanceof Error ? failures[0].reason.message : null) || 'فشل تحميل البيانات');
//       }
//     } catch (e: unknown) {
//       const status = (e as { status?: number })?.status;
//       if (status === 401) {
//         setTimeout(() => logout?.(), 1500);
//       }
//       setError((e instanceof Error ? e.message : null) || 'فشل تحميل البيانات');
//     } finally {
//       setLoading(false);
//     }
//   }, [logout]);

//   useEffect(() => { loadData(); }, [loadData]);

//   const loadMoreUsers = async () => {
//     const next = usersPage + 1;
//     setLoadingMore('users');
//     try {
//       const res = await fetchPage<User>('/users', next, 10);
//       if (!res.data?.length) { setHasMoreUsers(false); return; }
//       setUsers(prev => {
//         const ids = new Set(prev.map(u => u._id));
//         return [...prev, ...res.data.filter(u => !ids.has(u._id))];
//       });
//       setUsersPage(next);
//       setHasMoreUsers(res.hasMore ?? false);
//     } finally { setLoadingMore(null); }
//   };

//   const loadMoreCharities = async () => {
//     const next = charitiesPage + 1;
//     setLoadingMore('charities');
//     try {
//       const res = await fetchPage<Charity>('/charity/charities', next, 10);
//       if (!res.data?.length) { setHasMoreCharities(false); return; }
//       setCharities(prev => {
//         const ids = new Set(prev.map(c => c._id));
//         return [...prev, ...res.data.filter(c => !ids.has(c._id))];
//       });
//       setCharitiesPage(next);
//       setHasMoreCharities(res.hasMore ?? false);
//       setCharitiesRemaining(Math.max(0, (res.total ?? 0) - (charities.length + res.data.length)));
//     } finally { setLoadingMore(null); }
//   };

//   const loadMoreReports = async () => {
//     const next = reportsPage + 1;
//     setLoadingMore('reports');
//     try {
//       const res = await fetchPage<Report>('/report/allReports', next, 10);
//       if (!res.data?.length) { setHasMoreReports(false); return; }
//       setReports(prev => {
//         const ids = new Set(prev.map(r => r._id));
//         return [...prev, ...res.data.filter(r => !ids.has(r._id))];
//       });
//       setReportsPage(next);
//       setHasMoreReports(res.hasMore ?? false);
//     } finally { setLoadingMore(null); }
//   };

//   const handleDeleteUser = (id: string, name: string) => {
//     setConfirmOpts({
//       title: `حذف المستخدم "${name}"`,
//       message: 'هذا الإجراء لا يمكن التراجع عنه. سيتم حذف الحساب نهائيًا.',
//       confirmLabel: 'حذف', variant: 'danger', icon: 'ti-user-off',
//       onConfirm: async () => {
//         setConfirmLoading(true);
//         try {
//           await apiFetch(`/users/${id}`, { method: 'DELETE' });
//           setUsers(prev => prev.filter(u => u._id !== id));
//           showMsg('success', `تم حذف "${name}" بنجاح`);
//         } catch (e: unknown) {
//           showMsg('error', (e instanceof Error ? e.message : null) || 'فشل الحذف');
//         } finally { setConfirmLoading(false); setConfirmOpts(null); }
//       },
//     });
//   };

//   const handleApprove = async (id: string, name: string) => {
//     setActionLoading('approve-' + id);
//     try {
//       await apiFetch(`/charity/${id}/approve`, { method: 'PATCH' });
//       setCharities(prev =>
//         prev.map(c => c._id === id ? { ...c, approvalStatus: 'approved' as ApprovalStatus } : c)
//       );
//       showMsg('success', `تمت الموافقة على "${name}"`);
//     } catch (e: unknown) {
//       showMsg('error', (e instanceof Error ? e.message : null) || 'فشلت الموافقة');
//     } finally { setActionLoading(null); }
//   };

//   const handleReject = async (reason: string) => {
//     if (!rejectTarget) return;
//     setRejectLoading(true);
//     try {
//       await apiFetch(`/charity/${rejectTarget.id}/reject`, {
//         method: 'PATCH',
//         body: JSON.stringify({ rejectionReason: reason }),
//       });
//       setCharities(prev =>
//         prev.map(c =>
//           c._id === rejectTarget.id ? { ...c, approvalStatus: 'rejected' as ApprovalStatus } : c
//         )
//       );
//       showMsg('success', `تم رفض "${rejectTarget.name}"`);
//     } catch (e: unknown) {
//       showMsg('error', (e instanceof Error ? e.message : null) || 'فشل الرفض');
//     } finally { setRejectLoading(false); setRejectTarget(null); }
//   };

//   const handleDeleteCharity = (id: string, name: string) => {
//     setConfirmOpts({
//       title: `حذف جمعية "${name}"`,
//       message: 'هذا الإجراء لا يمكن التراجع عنه.',
//       confirmLabel: 'حذف', variant: 'danger', icon: 'ti-building-off',
//       onConfirm: async () => {
//         setConfirmLoading(true);
//         try {
//           await apiFetch(`/charity/${id}`, { method: 'DELETE' });
//           setCharities(prev => prev.filter(c => c._id !== id));
//           showMsg('success', `تم حذف "${name}" بنجاح`);
//         } catch (e: unknown) {
//           showMsg('error', (e instanceof Error ? e.message : null) || 'فشل الحذف');
//         } finally { setConfirmLoading(false); setConfirmOpts(null); }
//       },
//     });
//   };

//   const runDonationReminder = async () => {
//     setCronLoading(p => ({ ...p, reminder: true }));
//     const time = new Date().toLocaleTimeString('ar-EG');
//     try {
//       await apiFetch('/cron/donationReminder');
//       setCronLog(p => [{ type: 'success', text: 'تذكير التبرعات: تم التشغيل بنجاح', time }, ...p]);
//       setLastRun(new Date().toISOString());
//       showMsg('success', 'تم تشغيل تذكير التبرعات');
//     } catch (e: unknown) {
//       const msg = (e instanceof Error ? e.message : null) || 'فشل';
//       setCronLog(p => [{ type: 'error', text: `تذكير التبرعات: ${msg}`, time }, ...p]);
//       showMsg('error', 'فشل تشغيل التذكير');
//     } finally { setCronLoading(p => ({ ...p, reminder: false })); }
//   };

//   const runAdminReport = async () => {
//     setCronLoading(p => ({ ...p, report: true }));
//     const time = new Date().toLocaleTimeString('ar-EG');
//     try {
//       await apiFetch('/cron/adminReport');
//       setCronLog(p => [{ type: 'success', text: 'تقرير الأدمن: تم الإرسال بنجاح', time }, ...p]);
//       setLastRun(new Date().toISOString());
//       showMsg('success', 'تم إرسال تقرير الأدمن');
//     } catch (e: unknown) {
//       const msg = (e instanceof Error ? e.message : null) || 'فشل';
//       setCronLog(p => [{ type: 'error', text: `تقرير الأدمن: ${msg}`, time }, ...p]);
//       showMsg('error', 'فشل إرسال التقرير');
//     } finally { setCronLoading(p => ({ ...p, report: false })); }
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
//           navigate('/login');
//         } finally {
//           setConfirmLoading(false);
//           setConfirmOpts(null);
//         }
//       },
//     });
//   };

//   const [profileForm, setProfileForm] = useState({ userName: '', phone: '', address: '' });
//   const [passForm, setPassForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
//   const [settingsSaving, setSettingsSaving] = useState(false);

//   useEffect(() => {
//     if (user) {
//       setProfileForm({
//         userName: user.userName || '',
//         phone: (user as any).phone || '',
//         address: (user as any).address || '',
//       });
//     }
//   }, [user]);

//   const { refreshUser } = useAuth();

//   const saveProfile = async () => {
//     if (!profileForm.userName.trim()) { showMsg('error', 'اسم المستخدم مطلوب'); return; }
//     setSettingsSaving(true);
//     try {
//       await usersApi.updateProfile(profileForm);
//       await refreshUser();
//       showMsg('success', 'تم تحديث الملف الشخصي بنجاح');
//     } catch (err: unknown) {
//       showMsg('error', err instanceof Error ? err.message : 'حدث خطأ');
//     } finally { setSettingsSaving(false); }
//   };

//   const savePassword = async () => {
//     if (!passForm.oldPassword || !passForm.newPassword) {
//       showMsg('error', 'يرجى ملء جميع الحقول');
//       return;
//     }
//     if (passForm.newPassword !== passForm.confirmPassword) {
//       showMsg('error', 'كلمتا المرور غير متطابقتين');
//       return;
//     }
//     setSettingsSaving(true);
//     try {
//       await usersApi.changePassword(passForm);
//       setPassForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
//       showMsg('success', 'تم تغيير كلمة المرور بنجاح');
//     } catch (err: unknown) {
//       showMsg('error', err instanceof Error ? err.message : 'حدث خطأ');
//     } finally { setSettingsSaving(false); }
//   };

//   const filteredUsers = users.filter(u => {
//     if (!usersSearch) return true;
//     const q = usersSearch.toLowerCase();
//     return (
//       u.userName?.toLowerCase().includes(q) ||
//       u.email?.toLowerCase().includes(q) ||
//       u.roleType?.toLowerCase().includes(q)
//     );
//   });

//   const filteredCharities = charities
//     .filter(c => charitiesFilter === 'all' || c.approvalStatus === charitiesFilter)
//     .filter(c => {
//       if (!charitiesSearch) return true;
//       const q = charitiesSearch.toLowerCase();
//       return (
//         c.charityName?.toLowerCase().includes(q) ||
//         c.email?.toLowerCase().includes(q)
//       );
//     });

//   const filteredReports = reports.filter(r => {
//     if (!reportsSearch) return true;
//     const q = reportsSearch.toLowerCase();
//     return (
//       r.description?.toLowerCase().includes(q) ||
//       r.userName?.toLowerCase().includes(q)    ||
//       r.charityName?.toLowerCase().includes(q)
//     );
//   });

//   const pendingCount = charities.filter(c => c.approvalStatus === 'pending').length;

//   const MONTHS_AR = [
//   'يناير','فبراير','مارس','أبريل','مايو','يونيو',
//   'يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'
// ];

// const trendData = useMemo(() => {
//   const currentYear = new Date().getFullYear();
//   const currentMonth = new Date().getMonth();

//   const usersByMonth = Array(12).fill(0);
//   users.forEach(u => {
//     if (u.createdAt) {
//       const d = new Date(u.createdAt);
//       if (d.getFullYear() === currentYear)
//         usersByMonth[d.getMonth()]++;
//     }
//   });

//   const charitiesByMonth = Array(12).fill(0);
//   charities.forEach(c => {
//     if (c.createdAt) {
//       const d = new Date(c.createdAt);
//       if (d.getFullYear() === currentYear)
//         charitiesByMonth[d.getMonth()]++;
//     }
//   });

//   return Array.from({ length: currentMonth + 1 }, (_, i) => ({
//     name: MONTHS_AR[i],
//     users: usersByMonth[i],
//     charities: charitiesByMonth[i],
//   })).filter(m => m.users > 0 || m.charities > 0);
// }, [users, charities]);

//   const approvalPieData = [
//     { name: 'موافق عليها', value: charities.filter(c => c.approvalStatus === 'approved').length },
//     { name: 'معلقة',       value: charities.filter(c => c.approvalStatus === 'pending').length  },
//     { name: 'مرفوضة',     value: charities.filter(c => c.approvalStatus === 'rejected').length  },
//   ].filter(d => d.value > 0);
//   const PIE_COLORS = [TEAL2, AMBER, RED];

//   const userName = user?.userName ?? user?.email?.split('@')[0] ?? 'مسؤول';

//   return (
//     <div className="ap-layout" dir="rtl">
//       <Sidebar
//         activeTab={tab}
//         onTabChange={setTab}
//         userName={userName}
//         onLogout={handleLogout}
//         pendingCount={pendingCount}
//         collapsed={sidebarCollapsed}
//         onToggleCollapse={handleToggleSidebar}
//       />

//       <main className={`ap-main${tab === 'ai-chat' ? ' ap-main--ai' : ''}`}>
//         {tab !== 'ai-chat' && (
//           <header className="ap-page-header">
//             <div className="ap-page-header-left">
//               <div className="ap-page-breadcrumb">
//                 <i className="ti ti-shield-check" style={{ color: TEAL2 }} />
//                 <span>لوحة التحكم</span>
//                 <i className="ti ti-chevron-left" style={{ fontSize: 12, color: 'var(--t4)' }} />
//                 <span style={{ color: 'var(--t1)', fontWeight: 700 }}>
//                   {NAV_ITEMS.find(n => n.id === tab)?.label}
//                 </span>
//               </div>
//             </div>
//             <div className="ap-page-header-right">
//               {/* زر تبديل الثيم المباشر في الناف بار */}
//               <button 
//                 className="ap-header-icon-btn ap-theme-btn" 
//                 onClick={toggleTheme} 
//                 title={theme === 'dark' ? 'تفعيل الوضع النهارى' : 'تفعيل الوضع الليلي'}
//               >
//                 <i className={`ti ${theme === 'dark' ? 'ti-sun' : 'ti-moon'}`} />
//               </button>
//               <button className="ap-header-icon-btn" onClick={loadData} title="تحديث البيانات">
//                 <i className="ti ti-refresh" />
//               </button>
//               <div className="ap-header-user" onClick={() => setTab('settings')} title="الإعدادات">
//                 <div className="ap-header-avatar">{userName.slice(0, 1).toUpperCase()}</div>
//                 <span className="ap-header-username-text">{userName}</span>
//                 <i className="ti ti-settings" style={{ fontSize: 13, color: 'var(--t4)' }} />
//               </div>
//             </div>
//           </header>
//         )}

//         <div className={`ap-content${tab === 'ai-chat' ? ' ap-content--ai' : ''}`}>
//           {error && !loading && <ErrorBanner msg={error} onRetry={loadData} />}

//           {loading ? <PageSkeleton /> : (
//             <>
//               {/* ══ OVERVIEW ══════════════════════════════════════════════════ */}
//               {tab === 'overview' && (
//                 <div className="ap-tab-pane">
//                   <div className="ap-kpi-grid">
//                     <KpiCard icon="ti-users" label="إجمالي المستخدمين" value={(usersTotal || users.length).toLocaleString('ar-EG')} change="+12.5% هذا الشهر" changeDir="up" color={TEAL2} />
//                     <KpiCard icon="ti-building-community" label="الجمعيات المسجلة" value={(charitiesTotal || charities.length).toLocaleString('ar-EG')} change="+3 جديد" changeDir="up" color="#3b82f6" />
//                     <KpiCard icon="ti-alert-circle" label="التقارير الواردة" value={(reportsTotal || reports.length).toLocaleString('ar-EG')} change={pendingCount > 0 ? `${pendingCount} معلق` : 'لا يوجد معلق'} changeDir={pendingCount > 0 ? 'down' : 'neutral'} color={AMBER} />
//                     <KpiCard icon="ti-clock-pause" label="جمعيات معلقة" value={pendingCount.toLocaleString('ar-EG')} change={pendingCount > 0 ? 'تحتاج مراجعة' : 'الكل جاهز'} changeDir={pendingCount > 0 ? 'down' : 'neutral'} color={RED} />
//                   </div>

//                   <div className="ap-charts-row">
//                     <div className="ap-chart-card ap-chart-card--wide">
//                       <div className="ap-chart-header">
//                         <span className="ap-chart-title"><i className="ti ti-trending-up" style={{ color: TEAL2 }} />نمو المستخدمين والجمعيات</span>
//                         <span className="ap-chart-trend up">↑ 12.5%</span>
//                       </div>
//                       <ResponsiveContainer width="100%" height={220}>
//                         <AreaChart data={trendData} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
//                           <defs>
//                             <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
//                               <stop offset="0%" stopColor={TEAL2} stopOpacity={0.32} />
//                               <stop offset="100%" stopColor={TEAL2} stopOpacity={0.02} />
//                             </linearGradient>
//                             <linearGradient id="gradCharities" x1="0" y1="0" x2="0" y2="1">
//                               <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.28} />
//                               <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
//                             </linearGradient>
//                           </defs>
//                           <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
//                           <XAxis dataKey="name" tick={{ fill: 'var(--t3)', fontSize: 11 }} axisLine={false} tickLine={false} />
//                           <YAxis tick={{ fill: 'var(--t3)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
//                           <Tooltip content={<ChartTooltip />} />
//                           <Area type="monotone" dataKey="users" name="المستخدمون" stroke={TEAL2} strokeWidth={2.5} fill="url(#gradUsers)" dot={false} />
//                           <Area type="monotone" dataKey="charities" name="الجمعيات" stroke="#3b82f6" strokeWidth={2.5} fill="url(#gradCharities)" dot={false} />
//                         </AreaChart>
//                       </ResponsiveContainer>
//                     </div>

//                     {approvalPieData.length > 0 && (
//                       <div className="ap-chart-card">
//                         <div className="ap-chart-header">
//                           <span className="ap-chart-title"><i className="ti ti-chart-donut" style={{ color: AMBER }} />حالة الجمعيات</span>
//                         </div>
//                         <ResponsiveContainer width="100%" height={210}>
//                           <PieChart>
//                             <Pie data={approvalPieData} cx="50%" cy="50%" innerRadius={52} outerRadius={82} paddingAngle={4} dataKey="value">
//                               {approvalPieData.map((_, index) => (
//                                 <Cell key={index} fill={PIE_COLORS[index]} strokeWidth={0} />
//                               ))}
//                             </Pie>
//                             <Tooltip formatter={(v: number, n: string) => [v, n]} contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 10, color: 'var(--t1)', fontSize: 12, fontFamily: 'Tajawal, sans-serif' }} />
//                           </PieChart>
//                         </ResponsiveContainer>
//                         <div className="ap-pie-legend">
//                           {approvalPieData.map((d, i) => (
//                             <div key={i} className="ap-pie-legend-item">
//                               <span className="ap-pie-legend-dot" style={{ background: PIE_COLORS[i] }} />
//                               <span>{d.name}</span>
//                               <span style={{ fontWeight: 700, marginRight: 'auto' }}>{d.value}</span>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {/* ══ USERS ══════════════════════════════════════════════════════ */}
//               {tab === 'users' && (
//                 <div className="ap-tab-pane">
//                   <div className="ap-section-header">
//                     <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
//                       <SectionTitle icon="ti-users" color={TEAL2} title="المستخدمون" badge={usersTotal || users.length} />
//                       <ViewToggle mode={usersViewMode} onChange={setUsersViewMode} />
//                     </div>
//                     <SearchBox value={usersSearch} onChange={setUsersSearch} placeholder="بحث بالاسم أو البريد..." />
//                   </div>

//                   {filteredUsers.length === 0 ? (
//                     <EmptyState icon="ti-user-off" title="لا يوجد مستخدمون" desc="لم يتم العثور على مستخدمين مطابقين للبحث" />
//                   ) : usersViewMode === 'table' ? (
//                     <div className="ap-table-wrap">
//                       <table className="ap-table">
//                         <thead>
//                           <tr>
//                             {['المستخدم', 'البريد الإلكتروني', 'الدور', 'موثق', 'تاريخ الانضمام', ''].map((h, i) => (
//                               <th key={i}>{h}</th>
//                             ))}
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {filteredUsers.map(u => {
//                             const verified = u.isVerified || u.verify;
//                             return (
//                               <tr key={u._id} className="ap-table-row-clickable" onClick={() => setUserDetailModal(u)}>
//                                 <td>
//                                   <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//                                     <div className="ap-table-avatar">
//                                       {u.userName?.slice(0, 1).toUpperCase() ?? '?'}
//                                     </div>
//                                     <span style={{ fontWeight: 600, color: 'var(--t1)' }}>{u.userName}</span>
//                                   </div>
//                                 </td>
//                                 <td className="ap-table-mono">{u.email}</td>
//                                 <td><RoleBadge role={u.roleType} /></td>
//                                 <td>
//                                   <span className="ap-badge" style={{ background: verified ? 'rgba(34,197,94,0.14)' : 'rgba(244,63,94,0.14)', color: verified ? '#22c55e' : RED }}>
//                                     <i className={`ti ${verified ? 'ti-circle-check' : 'ti-circle-x'}`} style={{ fontSize: 12 }} />
//                                     {verified ? 'موثق' : 'غير موثق'}
//                                   </span>
//                                 </td>
//                                 <td style={{ color: 'var(--t3)', fontSize: 12 }}>{fmt(u.createdAt)}</td>
//                                 <td onClick={e => e.stopPropagation()}>
//                                   <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
//                                     <button className="ap-eye-btn" onClick={() => setUserDetailModal(u)} title="عرض التفاصيل">
//                                       <i className="ti ti-eye" />
//                                     </button>
//                                     {u.roleType !== 'admin' && (
//                                       <button className="ap-action-btn delete" onClick={() => handleDeleteUser(u._id, u.userName)}>
//                                         <i className="ti ti-trash" />
//                                       </button>
//                                     )}
//                                   </div>
//                                 </td>
//                               </tr>
//                             );
//                           })}
//                         </tbody>
//                       </table>
//                     </div>
//                   ) : (
//                     <div className="ap-card-grid">
//                       {filteredUsers.map(u => {
//                         const verified = u.isVerified || u.verify;
//                         return (
//                           <div key={u._id} className="ap-entity-card" onClick={() => setUserDetailModal(u)}>
//                             <div className="ap-entity-card-header">
//                               <div className="ap-entity-avatar user">{u.userName?.slice(0, 1).toUpperCase()}</div>
//                               <div style={{ flex: 1, minWidth: 0 }}>
//                                 <div className="ap-entity-name">{u.userName}</div>
//                                 <div className="ap-entity-email">{u.email}</div>
//                               </div>
//                             </div>
//                             <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
//                               <RoleBadge role={u.roleType} />
//                               <span className="ap-badge" style={{ background: verified ? 'rgba(34,197,94,0.14)' : 'rgba(244,63,94,0.14)', color: verified ? '#22c55e' : RED }}>
//                                 {verified ? 'موثق' : 'غير موثق'}
//                               </span>
//                             </div>
//                             <div className="ap-entity-date"><i className="ti ti-calendar" />{fmt(u.createdAt)}</div>
//                             <div className="ap-entity-actions" onClick={e => e.stopPropagation()}>
//                               <button className="ap-card-eye-btn" onClick={() => setUserDetailModal(u)}>
//                                 <i className="ti ti-eye" /> التفاصيل
//                               </button>
//                               {u.roleType !== 'admin' && (
//                                 <button className="ap-action-btn delete" onClick={() => handleDeleteUser(u._id, u.userName)}>
//                                   <i className="ti ti-trash" /> حذف
//                                 </button>
//                               )}
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   )}

//                   {hasMoreUsers && (
//                     <LoadMoreBtn loading={loadingMore === 'users'} remaining={Math.max(0, usersTotal - users.length)} onClick={loadMoreUsers} />
//                   )}
//                 </div>
//               )}

//               {/* ══ CHARITIES ══════════════════════════════════════════════════ */}
//               {tab === 'charities' && (
//                 <div className="ap-tab-pane">
//                   <div className="ap-section-header">
//                     <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
//                       <SectionTitle icon="ti-building-community" color="#3b82f6" title="الجمعيات" badge={charitiesTotal || charities.length} />
//                       <ViewToggle mode={charitiesViewMode} onChange={setCharitiesViewMode} />
//                     </div>
//                     <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
//                       <div className="ap-filter-tabs">
//                         {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
//                           <button key={f} className={`ap-filter-tab${charitiesFilter === f ? ' active' : ''}`} onClick={() => setCharitiesFilter(f)}>
//                             {f === 'all' ? 'الكل' : f === 'pending' ? 'معلق' : f === 'approved' ? 'موافق' : 'مرفوض'}
//                             {f === 'pending' && pendingCount > 0 && (
//                               <span className="ap-filter-badge">{pendingCount}</span>
//                             )}
//                           </button>
//                         ))}
//                       </div>
//                       <SearchBox value={charitiesSearch} onChange={setCharitiesSearch} placeholder="بحث في الجمعيات..." />
//                     </div>
//                   </div>

//                   {filteredCharities.length === 0 ? (
//                     <EmptyState icon="ti-building-off" title="لا توجد جمعيات" desc="لم يتم العثور على جمعيات مطابقة" />
//                   ) : charitiesViewMode === 'table' ? (
//                     <div className="ap-table-wrap">
//                       <table className="ap-table">
//                         <thead>
//                           <tr>
//                             {['الجمعية', 'البريد الإلكتروني', 'العنوان', 'الحالة', 'تاريخ التسجيل', ''].map((h, i) => (
//                               <th key={i}>{h}</th>
//                             ))}
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {filteredCharities.map(c => (
//                             <tr key={c._id} className="ap-table-row-clickable" onClick={() => setCharityDetailModal(c)}>
//                               <td>
//                                 <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
//                                   <div className="ap-table-avatar" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>
//                                     <i className="ti ti-building-community" />
//                                   </div>
//                                   <span style={{ fontWeight: 600, color: 'var(--t1)' }}>{c.charityName}</span>
//                                 </div>
//                               </td>
//                               <td className="ap-table-mono">{c.email}</td>
//                               <td>{c.address || '—'}</td>
//                               <td><StatusBadge status={c.approvalStatus} /></td>
//                               <td style={{ color: 'var(--t3)', fontSize: 12 }}>{fmt(c.createdAt)}</td>
//                               <td onClick={e => e.stopPropagation()}>
//                                 <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
//                                   <button className="ap-eye-btn" onClick={() => setCharityDetailModal(c)}>
//                                     <i className="ti ti-eye" />
//                                   </button>
//                                   {c.approvalStatus === 'pending' && (
//                                     <>
//                                       <button className="ap-action-btn approve" onClick={() => handleApprove(c._id, c.charityName)}>
//                                         <i className="ti ti-check" />
//                                       </button>
//                                       <button className="ap-action-btn reject" onClick={() => setRejectTarget({ id: c._id, name: c.charityName })}>
//                                         <i className="ti ti-x" />
//                                       </button>
//                                     </>
//                                   )}
//                                   <button className="ap-action-btn edit" onClick={() => setEditCharityTarget(c)}>
//                                     <i className="ti ti-edit" />
//                                   </button>
//                                   <button className="ap-action-btn delete" onClick={() => handleDeleteCharity(c._id, c.charityName)}>
//                                     <i className="ti ti-trash" />
//                                   </button>
//                                 </div>
//                               </td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   ) : (
//                     <div className="ap-card-grid">
//                       {filteredCharities.map(c => (
//                         <div key={c._id} className="ap-entity-card" onClick={() => setCharityDetailModal(c)}>
//                           <div className="ap-entity-card-header">
//                             <div className="ap-entity-avatar charity"><i className="ti ti-building-community" /></div>
//                             <div style={{ flex: 1, minWidth: 0 }}>
//                               <div className="ap-entity-name">{c.charityName}</div>
//                               <div className="ap-entity-email">{c.email}</div>
//                             </div>
//                           </div>
//                           <div style={{ marginBottom: 10 }}>
//                             <StatusBadge status={c.approvalStatus} />
//                           </div>
//                           {c.address && <div className="ap-entity-meta"><i className="ti ti-map-pin" />{c.address}</div>}
//                           <div className="ap-entity-date"><i className="ti ti-calendar" />{fmt(c.createdAt)}</div>
//                           <div className="ap-entity-actions" onClick={e => e.stopPropagation()}>
//                             <button className="ap-card-eye-btn" onClick={() => setCharityDetailModal(c)}>
//                               <i className="ti ti-eye" /> تفاصيل
//                             </button>
//                             {c.approvalStatus === 'pending' && (
//                               <>
//                                 <button className="ap-action-btn approve" disabled={!!actionLoading} onClick={() => handleApprove(c._id, c.charityName)}>
//                                   <i className="ti ti-check" /> موافقة
//                                 </button>
//                                 <button className="ap-action-btn reject" disabled={!!actionLoading} onClick={() => setRejectTarget({ id: c._id, name: c.charityName })}>
//                                   <i className="ti ti-x" /> رفض
//                                 </button>
//                               </>
//                             )}
//                             <button className="ap-action-btn edit" onClick={() => setEditCharityTarget(c)}>
//                               <i className="ti ti-edit" />
//                             </button>
//                             <button className="ap-action-btn delete" disabled={!!actionLoading} onClick={() => handleDeleteCharity(c._id, c.charityName)}>
//                               <i className="ti ti-trash" />
//                             </button>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}

//                   {hasMoreCharities && (
//                     <LoadMoreBtn loading={loadingMore === 'charities'} remaining={charitiesRemaining} onClick={loadMoreCharities} />
//                   )}
//                 </div>
//               )}

//               {/* ══ REPORTS ══════════════════════════════════════════════════ */}
//               {tab === 'reports' && (
//                 <div className="ap-tab-pane">
//                   <div className="ap-section-header">
//                     <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
//                       <SectionTitle icon="ti-alert-circle" color={AMBER} title="التقارير" badge={reportsTotal || reports.length} />
//                       <ViewToggle mode={reportsViewMode} onChange={setReportsViewMode} />
//                     </div>
//                     <SearchBox value={reportsSearch} onChange={setReportsSearch} placeholder="بحث في التقارير..." />
//                   </div>

//                   {filteredReports.length === 0 ? (
//                     <EmptyState icon="ti-mood-happy" title="لا توجد تقارير حتى الآن" desc="كل شيء يسير على ما يرام!" />
//                   ) : reportsViewMode === 'table' ? (
//                     <div className="ap-table-wrap">
//                       <table className="ap-table">
//                         <thead>
//                           <tr>
//                             {['رقم التقرير', 'المُرسِل', 'النوع', 'الوصف', 'التاريخ', ''].map((h, i) => (
//                               <th key={i}>{h}</th>
//                             ))}
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {filteredReports.map((r, i) => {
//                             const isCharity = r.senderType === 'charity';
//                             return (
//                               <tr key={r._id} className="ap-table-row-clickable" onClick={() => setReportModal(r)}>
//                                 <td style={{ fontWeight: 700, color: 'var(--amber)' }}>#{i + 1}</td>
//                                 <td>{r.userName || r.charityName || '—'}</td>
//                                 <td>{isCharity ? 'جمعية' : 'مستخدم'}</td>
//                                 <td style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description}</td>
//                                 <td style={{ color: 'var(--t3)', fontSize: 12 }}>{fmt(r.createdAt)}</td>
//                                 <td onClick={e => e.stopPropagation()}>
//                                   <button className="ap-eye-btn" onClick={() => setReportModal(r)}>
//                                     <i className="ti ti-eye" />
//                                   </button>
//                                 </td>
//                               </tr>
//                             );
//                           })}
//                         </tbody>
//                       </table>
//                     </div>
//                   ) : (
//                     <div className="ap-card-grid">
//                       {filteredReports.map((r, i) => {
//                         const isCharity = r.senderType === 'charity';
//                         const senderName = r.userName || r.charityName || '—';
//                         return (
//                           <div key={r._id} className="ap-report-card" onClick={() => setReportModal(r)}>
//                             <div className="ap-report-card-top">
//                               <span className="ap-report-num"><i className="ti ti-alert-triangle" />تقرير #{i + 1}</span>
//                               <span className="ap-report-date"><i className="ti ti-calendar" />{fmt(r.createdAt)}</span>
//                             </div>
//                             <div className="ap-report-sender">
//                               <div className="ap-report-sender-icon" style={{ background: isCharity ? 'rgba(16,185,129,0.14)' : 'rgba(59,130,246,0.14)', color: isCharity ? TEAL2 : '#3b82f6' }}>
//                                 <i className={`ti ${isCharity ? 'ti-building' : 'ti-user'}`} />
//                               </div>
//                               <div>
//                                 <div style={{ fontWeight: 700, color: 'var(--t1)', fontSize: 13 }}>{senderName}</div>
//                                 <div style={{ fontSize: 11, color: 'var(--t4)', marginTop: 1 }}>{isCharity ? 'جمعية' : 'مستخدم'}</div>
//                               </div>
//                             </div>
//                             <p className="ap-report-body">{r.description}</p>
//                             <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
//                               <button className="ap-card-eye-btn" onClick={e => { e.stopPropagation(); setReportModal(r); }}>
//                                 <i className="ti ti-eye" /> عرض التقرير
//                               </button>
//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   )}

//                   {hasMoreReports && (
//                     <LoadMoreBtn loading={loadingMore === 'reports'} remaining={Math.max(0, reportsTotal - reports.length)} onClick={loadMoreReports} />
//                   )}
//                 </div>
//               )}

//               {/* ══ AUTOMATION ══════════════════════════════════════════════ */}
//               {tab === 'automation' && (
//                 <div className="ap-tab-pane">
//                   <div className="ap-automation-banner">
//                     <div className="ap-automation-banner-icon"><i className="ti ti-settings-automation" /></div>
//                     <div>
//                       <div className="ap-automation-banner-title">التشغيل التلقائي — Cron Jobs</div>
//                       <div className="ap-automation-banner-sub">يمكنك تشغيل المهام التلقائية يدويًا من هنا. يتم تشغيلها في الخلفية وفقًا لجدول زمني محدد.</div>
//                     </div>
//                   </div>

//                   <div className="ap-cron-grid">
//                     <CronCard icon="ti-bell-ringing" iconBg="rgba(16,185,129,0.14)" iconColor={TEAL2} title="تذكير التبرعات" desc="يرسل تذكيرات للجمعيات بالتبرعات المعلقة التي لم يتم تأكيدها." code="GET /cron/donationReminder" codeBg="rgba(16,185,129,0.08)" codeBorder="rgba(16,185,129,0.24)" codeColor={TEAL2} loading={cronLoading.reminder} btnColor={TEAL2} onRun={runDonationReminder} />
//                     <CronCard icon="ti-report-analytics" iconBg="rgba(59,130,246,0.14)" iconColor="#3b82f6" title="تقرير الأدمن" desc="يولّد تقريرًا شاملاً عن نشاط المنصة ويرسله لجميع المسؤولين عبر البريد الإلكتروني." code="GET /cron/adminReport" codeBg="rgba(59,130,246,0.08)" codeBorder="rgba(59,130,246,0.24)" codeColor="#3b82f6" loading={cronLoading.report} btnColor="#3b82f6" onRun={runAdminReport} />
//                   </div>

//                   <div className="ap-cron-stats-row">
//                     {[
//                       { icon: 'ti-history',        color: TEAL2,     value: cronLog.length, label: 'عدد مرات التشغيل' },
//                       { icon: 'ti-clock',           color: AMBER,     value: lastRun ? new Date(lastRun).toLocaleTimeString('ar-EG') : '—', label: 'آخر تشغيل' },
//                       { icon: 'ti-calendar-event', color: '#3b82f6', value: 'تلقائي', label: 'جدول زمني' },
//                     ].map((s, i) => (
//                       <div key={i} className="ap-cron-stat">
//                         <i className={`ti ${s.icon}`} style={{ color: s.color, fontSize: 22 }} />
//                         <div>
//                           <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)' }}>{s.value}</div>
//                           <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>{s.label}</div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>

//                   {cronLog.length > 0 && (
//                     <div className="ap-cron-log">
//                       <div className="ap-cron-log-header">
//                         <SectionTitle icon="ti-list-details" color={TEAL2} title="سجل التنفيذ" badge={cronLog.length} />
//                         <button className="ap-cron-log-clear" onClick={() => setCronLog([])}><i className="ti ti-trash" />مسح</button>
//                       </div>
//                       <div className="ap-cron-log-list">
//                         {cronLog.map((log, i) => (
//                           <div key={i} className={`ap-cron-log-item ${log.type}`}>
//                             <span>{log.type === 'success' ? '✓' : '✗'} {log.text}</span>
//                             <span style={{ fontSize: 11, color: 'var(--t4)', flexShrink: 0 }}>{log.time}</span>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* ══ SETTINGS ══════════════════════════════════════════════════ */}
//               {tab === 'settings' && (
//                 <div className="ap-tab-pane">
//                   <div className="ap-section-header">
//                     <SectionTitle icon="ti-settings" color={TEAL2} title="الإعدادات" />
//                   </div>

//                   <div className="ap-settings-grid">
//                     <div className="ap-settings-card">
//                       <div className="ap-settings-card-title">
//                         <div className="ap-settings-icon" style={{ background: 'rgba(16,185,129,0.14)', color: TEAL2 }}>
//                           <i className="ti ti-user-circle" />
//                         </div>
//                         الملف الشخصي
//                       </div>
//                       <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
//                         <div className="ap-form-group">
//                           <label className="ap-form-label">اسم المستخدم</label>
//                           <input
//                             className="ap-form-input"
//                             value={profileForm.userName}
//                             onChange={e => setProfileForm(f => ({ ...f, userName: e.target.value }))}
//                             placeholder="اسم المستخدم"
//                           />
//                         </div>
//                         <div className="ap-form-group">
//                           <label className="ap-form-label">البريد الإلكتروني</label>
//                           <input className="ap-form-input" value={user?.email ?? ''} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
//                         </div>
//                         <div className="ap-form-group">
//                           <label className="ap-form-label">رقم الهاتف</label>
//                           <input
//                             className="ap-form-input"
//                             value={profileForm.phone}
//                             onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
//                             placeholder="01xxxxxxxxx"
//                           />
//                         </div>
//                         <div className="ap-form-group">
//                           <label className="ap-form-label">العنوان</label>
//                           <input
//                             className="ap-form-input"
//                             value={profileForm.address}
//                             onChange={e => setProfileForm(f => ({ ...f, address: e.target.value }))}
//                             placeholder="المدينة أو المنطقة"
//                           />
//                         </div>
//                         <button
//                           className="ap-action-btn approve"
//                           style={{ alignSelf: 'flex-start', padding: '8px 18px' }}
//                           disabled={settingsSaving}
//                           onClick={saveProfile}
//                         >
//                           {settingsSaving ? <><i className="ti ti-loader-2 ti-spin" /> جاري الحفظ...</> : <><i className="ti ti-check" /> حفظ التغييرات</>}
//                         </button>
//                       </div>
//                     </div>

//                     <div className="ap-settings-card">
//                       <div className="ap-settings-card-title">
//                         <div className="ap-settings-icon" style={{ background: 'rgba(244,63,94,0.14)', color: RED }}>
//                           <i className="ti ti-shield-lock" />
//                         </div>
//                         تغيير كلمة المرور
//                       </div>
//                       <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
//                         <div className="ap-form-group">
//                           <label className="ap-form-label">كلمة المرور الحالية</label>
//                           <input
//                             className="ap-form-input"
//                             type="password"
//                             value={passForm.oldPassword}
//                             onChange={e => setPassForm(f => ({ ...f, oldPassword: e.target.value }))}
//                             placeholder="••••••••"
//                           />
//                         </div>
//                         <div className="ap-form-group">
//                           <label className="ap-form-label">كلمة المرور الجديدة</label>
//                           <input
//                             className="ap-form-input"
//                             type="password"
//                             value={passForm.newPassword}
//                             onChange={e => setPassForm(f => ({ ...f, newPassword: e.target.value }))}
//                             placeholder="••••••••"
//                           />
//                         </div>
//                         <div className="ap-form-group">
//                           <label className="ap-form-label">تأكيد كلمة المرور الجديدة</label>
//                           <input
//                             className="ap-form-input"
//                             type="password"
//                             value={passForm.confirmPassword}
//                             onChange={e => setPassForm(f => ({ ...f, confirmPassword: e.target.value }))}
//                             placeholder="••••••••"
//                           />
//                         </div>
//                         <button
//                           className="ap-action-btn edit"
//                           style={{ alignSelf: 'flex-start', padding: '8px 18px' }}
//                           disabled={settingsSaving}
//                           onClick={savePassword}
//                         >
//                           {settingsSaving ? <><i className="ti ti-loader-2 ti-spin" /> جاري الحفظ...</> : <><i className="ti ti-key" /> تغيير كلمة المرور</>}
//                         </button>
//                       </div>
//                     </div>

//                     <div className="ap-settings-card">
//                       <div className="ap-settings-card-title">
//                         <div className="ap-settings-icon" style={{ background: 'rgba(59,130,246,0.14)', color: '#3b82f6' }}>
//                           <i className="ti ti-bell" />
//                         </div>
//                         الإشعارات
//                       </div>
//                       {[
//                         { label: 'إشعارات البريد الإلكتروني', sub: 'تلقي التنبيهات عبر البريد', default: true  },
//                         { label: 'تقارير جديدة',              sub: 'إشعار فوري عند ورود تقرير',  default: true  },
//                         { label: 'طلبات الانضمام',            sub: 'جمعيات تنتظر الموافقة',       default: false },
//                       ].map((item, i) => (
//                         <div key={i} className="ap-settings-row">
//                           <div>
//                             <div className="ap-settings-row-label">{item.label}</div>
//                             <div className="ap-settings-row-sub">{item.sub}</div>
//                           </div>
//                           <label className="ap-toggle">
//                             <input type="checkbox" defaultChecked={item.default} />
//                             <span className="ap-toggle-slider" />
//                           </label>
//                         </div>
//                       ))}
//                     </div>

//                     <div className="ap-settings-card">
//                       <div className="ap-settings-card-title">
//                         <div className="ap-settings-icon" style={{ background: 'rgba(245,158,11,0.14)', color: AMBER }}>
//                           <i className="ti ti-server" />
//                         </div>
//                         النظام
//                       </div>
                      
//                       {/* خيار الوضع الليلي والنهاري داخل كارد الإعدادات */}
//                       <div className="ap-settings-row">
//                         <div>
//                           <div className="ap-settings-row-label">الوضع الليلي (Dark Mode)</div>
//                           <div className="ap-settings-row-sub">تبديل مظهر لوحة التحكم بالكامل</div>
//                         </div>
//                         <label className="ap-toggle">
//                           <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
//                           <span className="ap-toggle-slider" />
//                         </label>
//                       </div>

//                       {[
//                         { label: 'وضع المطور',      sub: 'عرض السجلات التقنية',    default: false },
//                         { label: 'ذاكرة التخزين', sub: 'حفظ الجلسة تلقائياً',    default: true  },
//                       ].map((item, i) => (
//                         <div key={i} className="ap-settings-row">
//                           <div>
//                             <div className="ap-settings-row-label">{item.label}</div>
//                             <div className="ap-settings-row-sub">{item.sub}</div>
//                           </div>
//                           <label className="ap-toggle">
//                             <input type="checkbox" defaultChecked={item.default} />
//                             <span className="ap-toggle-slider" />
//                           </label>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                   <div style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 'var(--radius)', padding: '20px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>                
//                     <div>
//                       <div style={{ fontWeight: 800, color: RED, marginBottom: 4, fontSize: 14 }}>منطقة الخطر</div>
//                       <div style={{ fontSize: 13, color: 'var(--t3)', lineHeight: 1.6 }}>تسجيل الخروج من جميع الجلسات أو حذف الحساب نهائيًا.</div>
//                     </div>
//                     <button className="ap-action-btn reject" style={{ padding: '9px 18px', flexShrink: 0 }} onClick={handleLogout}>
//                       <i className="ti ti-logout" /> تسجيل الخروج
//                     </button>
//                   </div>
//                 </div>
//               )}

//               {/* ══ AI CHAT ══════════════════════════════════════════════════ */}
//               {tab === 'ai-chat' && (
//                 <div className="ap-ai-chat-container">
//                   <AIChatEmbed />
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </main>

//       <MobileNav activeTab={tab} onTabChange={setTab} pendingCount={pendingCount} />

//       <Toast msg={toast} />
//       <ConfirmModal opts={confirmOpts} loading={confirmLoading} onClose={() => { if (!confirmLoading) setConfirmOpts(null); }} />
//       <RejectModal target={rejectTarget} loading={rejectLoading} onClose={() => setRejectTarget(null)} onConfirm={handleReject} />
//       <EditCharityModal target={editCharityTarget} loading={actionLoading} setLoading={setActionLoading} onClose={() => setEditCharityTarget(null)} onSaved={(id, form) => setCharities(prev => prev.map(c => c._id === id ? { ...c, ...form } : c))} showMsg={showMsg} />

//       {/* User Detail Modal */}
//       {userDetailModal && (() => {
//         const verified = userDetailModal.isVerified || userDetailModal.verify;
//         return (
//           <div className="ap-modal-overlay" onClick={() => setUserDetailModal(null)}>
//             <div className="ap-modal ap-modal-wide" onClick={e => e.stopPropagation()}>
//               <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.04) 100%)', padding: '22px 28px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
//                 <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
//                   <div className="ap-detail-avatar" style={{ width: 52, height: 52, fontSize: 20 }}>{userDetailModal.userName?.slice(0, 1).toUpperCase() ?? '?'}</div>
//                   <div>
//                     <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--t1)', marginBottom: 3 }}>{userDetailModal.userName}</div>
//                     <div style={{ fontSize: 13, color: 'var(--t3)' }}>{userDetailModal.email}</div>
//                     <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
//                       <RoleBadge role={userDetailModal.roleType} />
//                       <span className="ap-badge" style={{ background: verified ? 'rgba(34,197,94,0.14)' : 'rgba(244,63,94,0.14)', color: verified ? '#22c55e' : RED }}>
//                         <i className={`ti ${verified ? 'ti-circle-check' : 'ti-circle-x'}`} style={{ fontSize: 11 }} />
//                         {verified ? 'موثق' : 'غير موثق'}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//                 <button className="ap-modal-close-x" onClick={() => setUserDetailModal(null)}><i className="ti ti-x" /></button>
//               </div>
//               <div className="ap-modal-inner" style={{ paddingTop: 20 }}>
//                 <div className="ap-detail-section">
//                   <DetailRow icon="ti-fingerprint" label="المعرف"       value={userDetailModal._id}                           mono />
//                   <DetailRow icon="ti-mail"        label="البريد"       value={userDetailModal.email}                               />
//                   {userDetailModal.phone   && <DetailRow icon="ti-phone"   label="الهاتف"    value={userDetailModal.phone}   />}
//                   {userDetailModal.address && <DetailRow icon="ti-map-pin" label="العنوان"   value={userDetailModal.address} />}
//                   <DetailRow icon="ti-calendar"    label="تاريخ الانضمام" value={fmt(userDetailModal.createdAt)}                    />
//                   {userDetailModal.updatedAt && <DetailRow icon="ti-clock-edit" label="آخر تحديث" value={fmt(userDetailModal.updatedAt)} />}
//                 </div>
//                 <div className="ap-modal-actions" style={{ marginTop: 18 }}>
//                   <button className="ap-modal-cancel" onClick={() => setUserDetailModal(null)}>إغلاق</button>
//                   {userDetailModal.roleType !== 'admin' && (
//                     <button className="ap-modal-confirm" style={{ background: RED }} onClick={() => { setUserDetailModal(null); handleDeleteUser(userDetailModal._id, userDetailModal.userName); }}>
//                       <i className="ti ti-trash" />حذف المستخدم
//                     </button>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         );
//       })()}

//       {/* Charity Detail Modal */}
//       {charityDetailModal && (
//         <div className="ap-modal-overlay" onClick={() => setCharityDetailModal(null)}>
//           <div className="ap-modal ap-modal-wide" onClick={e => e.stopPropagation()}>
//             <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.04) 100%)', padding: '22px 28px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
//               <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
//                 <div className="ap-entity-avatar charity" style={{ width: 52, height: 52, fontSize: 22 }}><i className="ti ti-building-community" /></div>
//                 <div>
//                   <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--t1)', marginBottom: 3 }}>{charityDetailModal.charityName}</div>
//                   <div style={{ fontSize: 13, color: 'var(--t3)' }}>{charityDetailModal.email}</div>
//                   <div style={{ marginTop: 8 }}><StatusBadge status={charityDetailModal.approvalStatus} /></div>
//                 </div>
//               </div>
//               <button className="ap-modal-close-x" onClick={() => setCharityDetailModal(null)}><i className="ti ti-x" /></button>
//             </div>

//             <div className="ap-modal-inner" style={{ paddingTop: 20 }}>
//               <div className="ap-detail-section" style={{ marginBottom: 16 }}>
//                 <DetailRow icon="ti-fingerprint"  label="المعرف"        value={charityDetailModal._id}                     mono />
//                 <DetailRow icon="ti-map-pin"      label="العنوان"       value={charityDetailModal.address || '—'}                />
//                 {charityDetailModal.phone         && <DetailRow icon="ti-phone"       label="الهاتف"       value={charityDetailModal.phone}         />}
//                 {charityDetailModal.licenseNumber && <DetailRow icon="ti-certificate" label="رقم الترخيص"  value={charityDetailModal.licenseNumber} />}
//                 <DetailRow icon="ti-calendar"     label="تاريخ التسجيل" value={fmt(charityDetailModal.createdAt)}                />
//                 {charityDetailModal.userId && <DetailRow icon="ti-user" label="معرف المالك" value={charityDetailModal.userId} mono />}
//               </div>

//               {charityDetailModal.description && (
//                 <div style={{ marginBottom: 16 }}>
//                   <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
//                     <i className="ti ti-file-description" style={{ fontSize: 14 }} /> وصف الجمعية
//                   </div>
//                   <div className="ap-report-full-body">{charityDetailModal.description}</div>
//                 </div>
//               )}

//               {charityDetailModal.approvalStatus === 'rejected' && charityDetailModal.rejectionReason && (
//                 <div style={{ marginBottom: 16 }}>
//                   <div style={{ fontSize: 12, fontWeight: 700, color: RED, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
//                     <i className="ti ti-alert-circle" style={{ fontSize: 14 }} /> سبب الرفض
//                   </div>
//                   <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.8, background: 'rgba(244,63,94,0.06)', borderRadius: 'var(--radius-sm)', padding: 14, border: '1px solid rgba(244,63,94,0.18)' }}>
//                     {charityDetailModal.rejectionReason}
//                   </div>
//                 </div>
//               )}

//               {charityDetailModal.approvalStatus === 'pending' && (
//                 <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
//                   <button className="ap-action-btn approve" style={{ flex: 1, justifyContent: 'center' }} disabled={!!actionLoading} onClick={() => { setCharityDetailModal(null); handleApprove(charityDetailModal._id, charityDetailModal.charityName); }}>
//                     <i className="ti ti-check" />موافقة
//                   </button>
//                   <button className="ap-action-btn reject" style={{ flex: 1, justifyContent: 'center' }} disabled={!!actionLoading} onClick={() => { setCharityDetailModal(null); setRejectTarget({ id: charityDetailModal._id, name: charityDetailModal.charityName }); }}>
//                     <i className="ti ti-x" />رفض
//                   </button>
//                 </div>
//               )}
//               <div className="ap-modal-actions">
//                 <button className="ap-modal-cancel" onClick={() => setCharityDetailModal(null)}>إغلاق</button>
//                 <button className="ap-action-btn edit" style={{ padding: '10px 18px', fontSize: 13 }} onClick={() => { setCharityDetailModal(null); setEditCharityTarget(charityDetailModal); }}>
//                   <i className="ti ti-edit" />تعديل
//                 </button>
//                 <button className="ap-modal-confirm" style={{ background: RED }} disabled={!!actionLoading} onClick={() => { setCharityDetailModal(null); handleDeleteCharity(charityDetailModal._id, charityDetailModal.charityName); }}>
//                   <i className="ti ti-trash" />حذف
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Report Detail Modal */}
//       {reportModal && (() => {
//         const isCharity = reportModal.senderType === 'charity';
//         const senderName = reportModal.userName || reportModal.charityName || '—';
//         return (
//           <div className="ap-modal-overlay" onClick={() => setReportModal(null)}>
//             <div className="ap-modal ap-modal-wide" onClick={e => e.stopPropagation()}>
//               <div style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(245,158,11,0.04) 100%)', padding: '22px 28px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
//                 <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
//                   <div style={{ width: 48, height: 48, borderRadius: 13, background: 'rgba(245,158,11,0.14)', color: AMBER, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
//                     <i className="ti ti-alert-triangle" />
//                   </div>
//                   <div>
//                     <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--t1)', marginBottom: 3 }}>تقرير وارد</div>
//                     <div style={{ fontSize: 12, color: 'var(--t3)' }}>{fmt(reportModal.createdAt)}</div>
//                   </div>
//                 </div>
//                 <button className="ap-modal-close-x" onClick={() => setReportModal(null)}><i className="ti ti-x" /></button>
//               </div>

//               <div className="ap-modal-inner" style={{ paddingTop: 20 }}>
//                 <div className="ap-detail-section" style={{ marginBottom: 16 }}>
//                   <DetailRow icon={isCharity ? 'ti-building' : 'ti-user'} label="المُرسِل" value={senderName} />
//                   <DetailRow icon="ti-tag" label="نوع المُرسِل" value={isCharity ? 'جمعية' : 'مستخدم'} />
//                   <DetailRow icon="ti-calendar" label="التاريخ" value={fmt(reportModal.createdAt)} />
//                   {reportModal.userId && <DetailRow icon="ti-fingerprint" label="معرف المُرسِل" value={reportModal.userId} mono />}
//                 </div>

//                 <div style={{ marginBottom: 16 }}>
//                   <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
//                     <i className="ti ti-file-text" style={{ fontSize: 14 }} /> محتوى التقرير
//                   </div>
//                   <div className="ap-report-full-body">{reportModal.description}</div>
//                 </div>

//                 <div className="ap-modal-actions" style={{ marginTop: 16 }}>
//                   <button className="ap-modal-cancel" onClick={() => setReportModal(null)}>إغلاق</button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         );
//       })()}
//     </div>
//   );
// }

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from 'wouter';
import '../../styles/css/AdminPanel.css';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import AIChatEmbed from '../../components/shared/AIChatEmbed';
import { usersApi } from '../../services';
import {
  apiFetch, fetchPage,
  User, Charity, Report, Tab, ApprovalStatus,
  APPROVAL_CFG, ROLE_CFG,
  TEAL2, AMBER, RED,
  fmt,
} from './adminTypes';

type ViewMode = 'table' | 'cards';
type ThemeMode = 'dark' | 'light';

const NAV_ITEMS = [
  { id: 'overview',   label: 'نظرة عامة',       icon: 'ti-layout-dashboard'    },
  { id: 'users',      label: 'المستخدمون',       icon: 'ti-users'               },
  { id: 'charities',  label: 'الجمعيات',          icon: 'ti-building-community'  },
  { id: 'reports',    label: 'التقارير',          icon: 'ti-alert-circle'        },
  { id: 'automation', label: 'التشغيل التلقائي', icon: 'ti-settings-automation' },
  { id: 'settings',   label: 'الإعدادات',        icon: 'ti-settings'            },
  { id: 'ai-chat',    label: 'مساعد الذكاء',     icon: 'ti-brain'               },
];

// ─── Sidebar Component ────────────────────────────────────────────────────────
function Sidebar({ activeTab, onTabChange, userName, onLogout, pendingCount, collapsed, onToggleCollapse }: {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  userName: string;
  onLogout: () => void;
  pendingCount: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  return (
    <aside className={`ap-sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="ap-sidebar-brand">
        <div className="ap-brand-icon">
          <i className="ti ti-shield-check" />
        </div>
        {!collapsed && <span className="ap-brand-title">لوحة التحكم</span>}
        <button
          className="ap-collapse-btn"
          onClick={onToggleCollapse}
          title={collapsed ? 'توسيع الشريط' : 'طي الشريط'}
        >
          <i className={`ti ${collapsed ? 'ti-layout-sidebar-right-expand' : 'ti-layout-sidebar-right-collapse'}`} />
        </button>
      </div>

      <nav className="ap-sidebar-nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`ap-nav-item${activeTab === item.id ? ' active' : ''}`}
            onClick={() => onTabChange(item.id as Tab)}
            title={collapsed ? item.label : undefined}
          >
            <span className="ap-nav-icon-wrap">
              <i className={`ti ${item.icon}`} />
              {item.id === 'charities' && pendingCount > 0 && (
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
            <div className="ap-user-avatar">{userName?.slice(0, 1).toUpperCase()}</div>
            <div className="ap-user-meta">
              <span className="ap-user-name">{userName}</span>
              <span className="ap-user-role">مسؤول النظام</span>
            </div>
            <i className="ti ti-settings" style={{ fontSize: 14, color: 'var(--t4)' }} />
          </div>
        )}
        {collapsed && (
          <button
            className="ap-nav-item"
            onClick={() => onTabChange('settings')}
            title="الإعدادات"
            style={{ justifyContent: 'center', padding: '10px 0' }}
          >
            <span className="ap-nav-icon-wrap">
              <i className="ti ti-settings" />
            </span>
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

// ─── Mobile Bottom Nav ────────────────────────────────────────────────────────
function MobileNav({ activeTab, onTabChange, pendingCount }: {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  pendingCount: number;
}) {
  return (
    <nav className="ap-mobile-nav">
      {NAV_ITEMS.map(item => (
        <button
          key={item.id}
          className={`ap-mobile-nav-item${activeTab === item.id ? ' active' : ''}`}
          onClick={() => onTabChange(item.id as Tab)}
        >
          <span className="ap-nav-icon-wrap">
            <i className={`ti ${item.icon}`} />
            {item.id === 'charities' && pendingCount > 0 && (
              <span className="ap-nav-badge">{pendingCount}</span>
            )}
          </span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

// ─── View Toggle Component ──────────────────────────────────────────────────
function ViewToggle({ mode, onChange }: { mode: ViewMode; onChange: (mode: ViewMode) => void }) {
  return (
    <div className="ap-view-switcher">
      <button 
        className={`ap-view-btn ${mode === 'table' ? 'active' : ''}`} 
        onClick={() => onChange('table')}
        title="عرض كجدول"
      >
        <i className="ti ti-list" />
      </button>
      <button 
        className={`ap-view-btn ${mode === 'cards' ? 'active' : ''}`} 
        onClick={() => onChange('cards')}
        title="عرض ككروت"
      >
        <i className="ti ti-layout-grid" />
      </button>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg = APPROVAL_CFG[status as ApprovalStatus] ?? {
    label: status, bg: '#1c2333', color: '#9aa5b9', dot: '#3d4a60',
  };
  return (
    <span className="ap-badge" style={{ background: cfg.bg, color: cfg.color }}>
      <span className="ap-badge-dot" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  const cfg = ROLE_CFG[role as keyof typeof ROLE_CFG] ?? {
    label: role, bg: '#1c2333', color: '#9aa5b9', icon: '',
  };
  return (
    <span className="ap-badge" style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function Toast({ msg }: { msg: { type: 'success' | 'error'; text: string } | null }) {
  if (!msg) return null;
  return (
    <div className={`ap-toast ${msg.type}`}>
      <i className={`ti ${msg.type === 'success' ? 'ti-circle-check' : 'ti-alert-circle'}`} />
      {msg.text}
    </div>
  );
}

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
              {loading && <i className="ti ti-loader-2 ti-spin" />}
              {opts.confirmLabel ?? 'تأكيد'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RejectModal({ target, loading, onClose, onConfirm }: {
  target: { id: string; name: string } | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState('');
  useEffect(() => { if (target) setReason(''); }, [target]);
  if (!target) return null;
  return (
    <div className="ap-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ap-modal">
        <div className="ap-modal-inner">
          <div className="ap-modal-icon" style={{ background: RED + '22' }}>
            <i className="ti ti-x" style={{ color: RED }} />
          </div>
          <h3 className="ap-modal-title">رفض جمعية "{target.name}"</h3>
          <p className="ap-modal-msg">يمكنك تحديد سبب الرفض ليصل للجمعية بالبريد الإلكتروني.</p>
          <div className="ap-form-group" style={{ marginBottom: 20 }}>
            <label className="ap-form-label">سبب الرفض</label>
            <textarea
              className="ap-form-textarea"
              rows={3}
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="سبب الرفض (اختياري)"
            />
          </div>
          <div className="ap-modal-actions">
            <button className="ap-modal-cancel" onClick={onClose} disabled={loading}>إلغاء</button>
            <button
              className="ap-modal-confirm"
              disabled={loading}
              style={{ background: RED }}
              onClick={() => onConfirm(reason)}
            >
              {loading && <i className="ti ti-loader-2 ti-spin" />}
              تأكيد الرفض
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditCharityModal({ target, loading, setLoading, onClose, onSaved, showMsg }: {
  target: Charity | null;
  loading: string | null;
  setLoading: (v: string | null) => void;
  onClose: () => void;
  onSaved: (id: string, form: { charityName: string; address: string; description: string }) => void;
  showMsg: (type: 'success' | 'error', text: string) => void;
}) {
  const [form, setForm] = useState({ charityName: '', address: '', description: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (target) {
      setForm({
        charityName: target.charityName ?? '',
        address: target.address ?? '',
        description: target.description ?? '',
      });
      setErrors({});
    }
  }, [target]);

  if (!target) return null;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.charityName.trim() || form.charityName.trim().length < 3)
      e.charityName = 'اسم الجمعية يجب أن يكون 3 أحرف على الأقل';
    if (!form.address.trim() || form.address.trim().length < 5)
      e.address = 'العنوان يجب أن يكون 5 أحرف على الأقل';
    return e;
  };

  const isBusy = loading === 'edit-' + target._id;
  const changed =
    form.charityName  !== (target.charityName  ?? '') ||
    form.address      !== (target.address      ?? '') ||
    form.description  !== (target.description  ?? '');

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading('edit-' + target._id);
    try {
      await apiFetch(`/charity/${target._id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          charityName: form.charityName.trim(),
          address: form.address.trim(),
          description: form.description.trim(),
        }),
      });
      onSaved(target._id, form);
      showMsg('success', `تم تحديث "${form.charityName}" بنجاح`);
      onClose();
    } catch (err: unknown) {
      showMsg('error', (err instanceof Error ? err.message : null) || 'فشل التحديث');
    } finally { setLoading(null); }
  };

  return (
    <div className="ap-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ap-modal">
        <div className="ap-modal-inner">
          <div className="ap-modal-icon" style={{ background: TEAL2 + '22' }}>
            <i className="ti ti-edit" style={{ color: TEAL2 }} />
          </div>
          <h3 className="ap-modal-title">تعديل بيانات الجمعية</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 16 }}>
            <div className="ap-form-group">
              <label className="ap-form-label">
                اسم الجمعية <span style={{ color: RED }}>*</span>
              </label>
              <input
                className={`ap-form-input${errors.charityName ? ' error' : ''}`}
                value={form.charityName}
                onChange={e => {
                  setForm(f => ({ ...f, charityName: e.target.value }));
                  setErrors(er => ({ ...er, charityName: '' }));
                }}
                placeholder="اسم الجمعية"
              />
              {errors.charityName && (
                <div className="ap-form-err">
                  <i className="ti ti-alert-circle" />{errors.charityName}
                </div>
              )}
            </div>
            <div className="ap-form-group">
              <label className="ap-form-label">
                العنوان <span style={{ color: RED }}>*</span>
              </label>
              <input
                className={`ap-form-input${errors.address ? ' error' : ''}`}
                value={form.address}
                onChange={e => {
                  setForm(f => ({ ...f, address: e.target.value }));
                  setErrors(er => ({ ...er, address: '' }));
                }}
                placeholder="عنوان الجمعية"
              />
              {errors.address && (
                <div className="ap-form-err">
                  <i className="ti ti-alert-circle" />{errors.address}
                </div>
              )}
            </div>
            <div className="ap-form-group">
              <label className="ap-form-label">
                الوصف{' '}
                <span style={{ fontSize: 11, color: 'var(--t4)', fontWeight: 400 }}>(اختياري)</span>
              </label>
              <textarea
                className="ap-form-textarea"
                rows={3}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="وصف مختصر عن الجمعية..."
              />
            </div>
          </div>
          <div className="ap-info-box" style={{ marginBottom: 18 }}>
            <div className="ap-info-row">
              <span className="lbl">البريد الإلكتروني:</span>
              <span className="val">{target.email}</span>
            </div>
            <div className="ap-info-row">
              <span className="lbl">حالة الجمعية:</span>
              <span className="val"><StatusBadge status={target.approvalStatus} /></span>
            </div>
            {target.licenseNumber && (
              <div className="ap-info-row">
                <span className="lbl">رقم الترخيص:</span>
                <span className="val">{target.licenseNumber}</span>
              </div>
            )}
          </div>
          <div className="ap-modal-actions">
            <button className="ap-modal-cancel" onClick={onClose} disabled={isBusy}>إلغاء</button>
            <button
              className="ap-modal-confirm"
              disabled={isBusy || !changed}
              style={{ background: TEAL2 }}
              onClick={handleSave}
            >
              {isBusy && <i className="ti ti-loader-2 ti-spin" />}
              {isBusy ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PageSkeleton() {
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
    </div>
  );
}

function DetailRow({ icon, label, value, mono, danger }: {
  icon: string; label: string; value: string; mono?: boolean; danger?: boolean;
}) {
  return (
    <div className="ap-detail-row">
      <div className="ap-detail-row-icon"><i className={`ti ${icon}`} /></div>
      <span className="ap-detail-row-label">{label}</span>
      <span className={`ap-detail-row-val${mono ? ' mono' : ''}${danger ? ' danger' : ''}`}>
        {value}
      </span>
    </div>
  );
}

function EmptyState({ icon, title, desc }: { icon: string; title: string; desc?: string }) {
  return (
    <div className="ap-empty-state">
      <div className="ap-empty-icon"><i className={`ti ${icon}`} /></div>
      <div className="ap-empty-title">{title}</div>
      {desc && <div className="ap-empty-desc">{desc}</div>}
    </div>
  );
}

function ErrorBanner({ msg, onRetry }: { msg: string; onRetry: () => void }) {
  return (
    <div className="ap-error-banner">
      <i className="ti ti-alert-triangle" style={{ color: AMBER, fontSize: 20, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, marginBottom: 3, color: 'var(--t1)' }}>حدث خطأ</div>
        <div style={{ fontSize: 13, color: 'var(--t3)' }}>{msg}</div>
      </div>
      <button className="ap-retry-btn" onClick={onRetry}>
        <i className="ti ti-refresh" /> إعادة المحاولة
      </button>
    </div>
  );
}

function SectionTitle({ icon, color, title, badge }: {
  icon: string; color: string; title: string; badge?: number;
}) {
  return (
    <div className="ap-section-title">
      <i className={`ti ${icon}`} style={{ color }} />
      {title}
      {badge !== undefined && (
        <span className="ap-count-badge" style={{ background: color }}>{badge}</span>
      )}
    </div>
  );
}

function SearchBox({ value, onChange, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="ap-search-wrap">
      <i className="ti ti-search ap-search-icon" />
      <input
        className="ap-search-input"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder ?? 'بحث...'}
      />
      {value && (
        <button className="ap-search-clear" onClick={() => onChange('')}>
          <i className="ti ti-x" />
        </button>
      )}
    </div>
  );
}

function LoadMoreBtn({ loading, remaining, onClick }: {
  loading: boolean; remaining: number; onClick: () => void;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
      <button className="ap-load-more-btn" onClick={onClick} disabled={loading}>
        {loading
          ? <><i className="ti ti-loader-2 ti-spin" /> جاري التحميل...</>
          : <>تحميل المزيد {remaining > 0 && `(${remaining.toLocaleString('en-US')})`}</>
        }
      </button>
    </div>
  );
}

function KpiCard({ icon, label, value, change, changeDir, color }: {
  icon: string; label: string; value: string | number;
  change?: string; changeDir?: 'up' | 'down' | 'neutral'; color: string;
}) {
  return (
    <div className="ap-kpi-card" style={{ '--kpi-color': color } as React.CSSProperties}>
      <div className="ap-kpi-icon-wrap"><i className={`ti ${icon}`} /></div>
      <div className="ap-kpi-value">{value}</div>
      <div className="ap-kpi-label">{label}</div>
      {change && (
        <div className={`ap-kpi-change ${changeDir ?? 'neutral'}`}>{change}</div>
      )}
    </div>
  );
}

function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="ap-chart-tooltip">
      <div className="ap-chart-tooltip-label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="ap-chart-tooltip-row">
          <span>{p.name}</span>
          <span style={{ fontWeight: 700 }}>{p.value.toLocaleString('en-US')}</span>
        </div>
      ))}
    </div>
  );
}

function CronCard({ icon, iconBg, iconColor, title, desc, code, codeBg, codeBorder, codeColor, loading, btnColor, onRun }: {
  icon: string; iconBg: string; iconColor: string;
  title: string; desc: string; code: string;
  codeBg: string; codeBorder: string; codeColor: string;
  loading: boolean; btnColor: string; onRun: () => void;
}) {
  return (
    <div className="ap-cron-card">
      <div className="ap-cron-icon" style={{ background: iconBg }}>
        <i className={`ti ${icon}`} style={{ color: iconColor }} />
      </div>
      <div className="ap-cron-title">{title}</div>
      <p className="ap-cron-desc">{desc}</p>
      <code className="ap-cron-code" style={{ background: codeBg, borderColor: codeBorder, color: codeColor }}>
        {code}
      </code>
      <button
        className="ap-cron-run-btn"
        style={{ background: btnColor }}
        disabled={loading}
        onClick={onRun}
      >
        {loading
          ? <><i className="ti ti-loader-2 ti-spin" />جاري التشغيل...</>
          : <><i className="ti ti-player-play" />تشغيل الآن</>
        }
      </button>
    </div>
  );
}

export default function AdminPanel() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<Tab>('overview');

  // ─── View Modes State ──────────────────────────────────────────────────────
  const [usersViewMode, setUsersViewMode] = useState<ViewMode>('table');
  const [charitiesViewMode, setCharitiesViewMode] = useState<ViewMode>('cards');
  const [reportsViewMode, setReportsViewMode] = useState<ViewMode>('cards');

  // ─── Theme Mode Logic ──────────────────────────────────────────────────────
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      return (localStorage.getItem('ap-theme') as ThemeMode) || 'dark';
    } catch { return 'dark'; }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ap-theme', theme);
      if (theme === 'light') {
        document.body.classList.add('ap-light-theme');
      } else {
        document.body.classList.remove('ap-light-theme');
      }
    } catch { /* ignore */ }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('ap-sidebar-collapsed') === 'true';
    } catch { return false; }
  });

  const handleToggleSidebar = () => {
    setSidebarCollapsed(v => {
      const next = !v;
      try { localStorage.setItem('ap-sidebar-collapsed', String(next)); } catch { /* ignore */ }
      return next;
    });
  };

  const [users,      setUsers]     = useState<User[]>([]);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [reports,    setReports]   = useState<Report[]>([]);

  const [usersTotal,      setUsersTotal]     = useState(0);
  const [charitiesTotal, setCharitiesTotal] = useState(0);
  const [reportsTotal,    setReportsTotal]   = useState(0);

  const [usersPage,      setUsersPage]     = useState(1);
  const [charitiesPage, setCharitiesPage] = useState(1);
  const [reportsPage,    setReportsPage]   = useState(1);

  const [hasMoreUsers,       setHasMoreUsers]       = useState(false);
  const [hasMoreCharities,   setHasMoreCharities]   = useState(false);
  const [hasMoreReports,     setHasMoreReports]     = useState(false);
  const [charitiesRemaining, setCharitiesRemaining] = useState(0);
  const [loadingMore,        setLoadingMore]        = useState<string | null>(null);

  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast,         setToast]         = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmOpts,   setConfirmOpts]   = useState<ConfirmState | null>(null);
  const [confirmLoading,setConfirmLoading]= useState(false);
  const [rejectTarget,  setRejectTarget]  = useState<{ id: string; name: string } | null>(null);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [editCharityTarget,  setEditCharityTarget]  = useState<Charity | null>(null);
  const [userDetailModal,    setUserDetailModal]    = useState<User | null>(null);
  const [reportModal,        setReportModal]        = useState<Report | null>(null);
  const [charityDetailModal, setCharityDetailModal] = useState<Charity | null>(null);

  const [usersSearch,     setUsersSearch]     = useState('');
  const [charitiesSearch, setCharitiesSearch] = useState('');
  const [reportsSearch,   setReportsSearch]   = useState('');
  const [charitiesFilter, setCharitiesFilter] = useState<string>('all');

  const [cronLoading, setCronLoading] = useState({ reminder: false, report: false });
  const [cronLog, setCronLog]         = useState<{ type: 'success' | 'error'; text: string; time: string }[]>([]);
  const [lastRun, setLastRun]         = useState<string | null>(null);

  useEffect(() => {
    const tick = () => {
      const el = document.getElementById('ap-clock');
      if (el) {
        el.textContent = new Date().toLocaleTimeString('en-US', {
          hour: '2-digit', minute: '2-digit',
        });
      }
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  const showMsg = useCallback((type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setUsersPage(1);
    setCharitiesPage(1);
    setReportsPage(1);

    try {
      const [uRes, cRes, rRes] = await Promise.allSettled([
        fetchPage<User>('/users', 1, 10),
        fetchPage<Charity>('/charity/charities', 1, 10),
        fetchPage<Report>('/report/allReports', 1, 10),
      ]);

      if (uRes.status === 'fulfilled') {
        setUsers(uRes.value.data ?? []);
        setUsersTotal(uRes.value.total ?? 0);
        setHasMoreUsers(uRes.value.hasMore ?? false);
      }
      if (cRes.status === 'fulfilled') {
        setCharities(cRes.value.data ?? []);
        setCharitiesTotal(cRes.value.total ?? 0);
        setHasMoreCharities(cRes.value.hasMore ?? false);
        setCharitiesRemaining(
          Math.max(0, (cRes.value.total ?? 0) - (cRes.value.data?.length ?? 0))
        );
      }
      if (rRes.status === 'fulfilled') {
        setReports(rRes.value.data ?? []);
        setReportsTotal(rRes.value.total ?? 0);
        setHasMoreReports(rRes.value.hasMore ?? false);
      }

      const failures = [uRes, cRes, rRes].filter(r => r.status === 'rejected') as PromiseRejectedResult[];
      if (failures.length === 3) {
        throw new Error((failures[0].reason instanceof Error ? failures[0].reason.message : null) || 'فشل تحميل البيانات');
      }
    } catch (e: unknown) {
      const status = (e as { status?: number })?.status;
      if (status === 401) {
        setTimeout(() => logout?.(), 1500);
      }
      setError((e instanceof Error ? e.message : null) || 'فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => { loadData(); }, [loadData]);

  const loadMoreUsers = async () => {
    const next = usersPage + 1;
    setLoadingMore('users');
    try {
      const res = await fetchPage<User>('/users', next, 10);
      if (!res.data?.length) { setHasMoreUsers(false); return; }
      setUsers(prev => {
        const ids = new Set(prev.map(u => u._id));
        return [...prev, ...res.data.filter(u => !ids.has(u._id))];
      });
      setUsersPage(next);
      setHasMoreUsers(res.hasMore ?? false);
    } finally { setLoadingMore(null); }
  };

  const loadMoreCharities = async () => {
    const next = charitiesPage + 1;
    setLoadingMore('charities');
    try {
      const res = await fetchPage<Charity>('/charity/charities', next, 10);
      if (!res.data?.length) { setHasMoreCharities(false); return; }
      setCharities(prev => {
        const ids = new Set(prev.map(c => c._id));
        return [...prev, ...res.data.filter(c => !ids.has(c._id))];
      });
      setCharitiesPage(next);
      setHasMoreCharities(res.hasMore ?? false);
      setCharitiesRemaining(Math.max(0, (res.total ?? 0) - (charities.length + res.data.length)));
    } finally { setLoadingMore(null); }
  };

  const loadMoreReports = async () => {
    const next = reportsPage + 1;
    setLoadingMore('reports');
    try {
      const res = await fetchPage<Report>('/report/allReports', next, 10);
      if (!res.data?.length) { setHasMoreReports(false); return; }
      setReports(prev => {
        const ids = new Set(prev.map(r => r._id));
        return [...prev, ...res.data.filter(r => !ids.has(r._id))];
      });
      setReportsPage(next);
      setHasMoreReports(res.hasMore ?? false);
    } finally { setLoadingMore(null); }
  };

  const handleDeleteUser = (id: string, name: string) => {
    setConfirmOpts({
      title: `حذف المستخدم "${name}"`,
      message: 'هذا الإجراء لا يمكن التراجع عنه. سيتم حذف الحساب نهائيًا.',
      confirmLabel: 'حذف', variant: 'danger', icon: 'ti-user-off',
      onConfirm: async () => {
        setConfirmLoading(true);
        try {
          await apiFetch(`/users/${id}`, { method: 'DELETE' });
          setUsers(prev => prev.filter(u => u._id !== id));
          showMsg('success', `تم حذف "${name}" بنجاح`);
        } catch (e: unknown) {
          showMsg('error', (e instanceof Error ? e.message : null) || 'فشل الحذف');
        } finally { setConfirmLoading(false); setConfirmOpts(null); }
      },
    });
  };

  const handleApprove = async (id: string, name: string) => {
    setActionLoading('approve-' + id);
    try {
      await apiFetch(`/charity/${id}/approve`, { method: 'PATCH' });
      setCharities(prev =>
        prev.map(c => c._id === id ? { ...c, approvalStatus: 'approved' as ApprovalStatus } : c)
      );
      showMsg('success', `تمت الموافقة على "${name}"`);
    } catch (e: unknown) {
      showMsg('error', (e instanceof Error ? e.message : null) || 'فشلت الموافقة');
    } finally { setActionLoading(null); }
  };

  const handleReject = async (reason: string) => {
    if (!rejectTarget) return;
    setRejectLoading(true);
    try {
      await apiFetch(`/charity/${rejectTarget.id}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ rejectionReason: reason }),
      });
      setCharities(prev =>
        prev.map(c =>
          c._id === rejectTarget.id ? { ...c, approvalStatus: 'rejected' as ApprovalStatus } : c
        )
      );
      showMsg('success', `تم رفض "${rejectTarget.name}"`);
    } catch (e: unknown) {
      showMsg('error', (e instanceof Error ? e.message : null) || 'فشل الرفض');
    } finally { setRejectLoading(false); setRejectTarget(null); }
  };

  const handleDeleteCharity = (id: string, name: string) => {
    setConfirmOpts({
      title: `حذف جمعية "${name}"`,
      message: 'هذا الإجراء لا يمكن التراجع عنه.',
      confirmLabel: 'حذف', variant: 'danger', icon: 'ti-building-off',
      onConfirm: async () => {
        setConfirmLoading(true);
        try {
          await apiFetch(`/charity/${id}`, { method: 'DELETE' });
          setCharities(prev => prev.filter(c => c._id !== id));
          showMsg('success', `تم حذف "${name}" بنجاح`);
        } catch (e: unknown) {
          showMsg('error', (e instanceof Error ? e.message : null) || 'فشل الحذف');
        } finally { setConfirmLoading(false); setConfirmOpts(null); }
      },
    });
  };

  const runDonationReminder = async () => {
    setCronLoading(p => ({ ...p, reminder: true }));
    const time = new Date().toLocaleTimeString('en-US');
    try {
      await apiFetch('/cron/donationReminder');
      setCronLog(p => [{ type: 'success', text: 'تذكير التبرعات: تم التشغيل بنجاح', time }, ...p]);
      setLastRun(new Date().toISOString());
      showMsg('success', 'تم تشغيل تذكير التبرعات');
    } catch (e: unknown) {
      const msg = (e instanceof Error ? e.message : null) || 'فشل';
      setCronLog(p => [{ type: 'error', text: `تذكير التبرعات: ${msg}`, time }, ...p]);
      showMsg('error', 'فشل تشغيل التذكير');
    } finally { setCronLoading(p => ({ ...p, reminder: false })); }
  };

  const runAdminReport = async () => {
    setCronLoading(p => ({ ...p, report: true }));
    const time = new Date().toLocaleTimeString('en-US');
    try {
      await apiFetch('/cron/adminReport');
      setCronLog(p => [{ type: 'success', text: 'تقرير الأدمن: تم الإرسال بنجاح', time }, ...p]);
      setLastRun(new Date().toISOString());
      showMsg('success', 'تم إرسال تقرير الأدمن');
    } catch (e: unknown) {
      const msg = (e instanceof Error ? e.message : null) || 'فشل';
      setCronLog(p => [{ type: 'error', text: `تقرير الأدمن: ${msg}`, time }, ...p]);
      showMsg('error', 'فشل إرسال التقرير');
    } finally { setCronLoading(p => ({ ...p, report: false })); }
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
          navigate('/login');
        } finally {
          setConfirmLoading(false);
          setConfirmOpts(null);
        }
      },
    });
  };

  const [profileForm, setProfileForm] = useState({ userName: '', phone: '', address: '' });
  const [passForm, setPassForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [settingsSaving, setSettingsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        userName: user.userName || '',
        phone: (user as any).phone || '',
        address: (user as any).address || '',
      });
    }
  }, [user]);

  const { refreshUser } = useAuth();

  const saveProfile = async () => {
    if (!profileForm.userName.trim()) { showMsg('error', 'اسم المستخدم مطلوب'); return; }
    setSettingsSaving(true);
    try {
      await usersApi.updateProfile(profileForm);
      await refreshUser();
      showMsg('success', 'تم تحديث الملف الشخصي بنجاح');
    } catch (err: unknown) {
      showMsg('error', err instanceof Error ? err.message : 'حدث خطأ');
    } finally { setSettingsSaving(false); }
  };

  const savePassword = async () => {
    if (!passForm.oldPassword || !passForm.newPassword) {
      showMsg('error', 'يرجى ملء جميع الحقول');
      return;
    }
    if (passForm.newPassword !== passForm.confirmPassword) {
      showMsg('error', 'كلمتا المرور غير متطابقتين');
      return;
    }
    setSettingsSaving(true);
    try {
      await usersApi.changePassword(passForm);
      setPassForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      showMsg('success', 'تم تغيير كلمة المرور بنجاح');
    } catch (err: unknown) {
      showMsg('error', err instanceof Error ? err.message : 'حدث خطأ');
    } finally { setSettingsSaving(false); }
  };

  const filteredUsers = users.filter(u => {
    if (!usersSearch) return true;
    const q = usersSearch.toLowerCase();
    return (
      u.userName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.roleType?.toLowerCase().includes(q)
    );
  });

  const filteredCharities = charities
    .filter(c => charitiesFilter === 'all' || c.approvalStatus === charitiesFilter)
    .filter(c => {
      if (!charitiesSearch) return true;
      const q = charitiesSearch.toLowerCase();
      return (
        c.charityName?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
      );
    });

  const filteredReports = reports.filter(r => {
    if (!reportsSearch) return true;
    const q = reportsSearch.toLowerCase();
    return (
      r.description?.toLowerCase().includes(q) ||
      r.userName?.toLowerCase().includes(q)    ||
      r.charityName?.toLowerCase().includes(q)
    );
  });

  const pendingCount = charities.filter(c => c.approvalStatus === 'pending').length;

  const MONTHS_AR = [
    'يناير','فبراير','مارس','أبريل','مايو','يونيو',
    'يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'
  ];

  const trendData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    const usersByMonth = Array(12).fill(0);
    users.forEach(u => {
      if (u.createdAt) {
        const d = new Date(u.createdAt);
        if (d.getFullYear() === currentYear)
          usersByMonth[d.getMonth()]++;
      }
    });

    const charitiesByMonth = Array(12).fill(0);
    charities.forEach(c => {
      if (c.createdAt) {
        const d = new Date(c.createdAt);
        if (d.getFullYear() === currentYear)
          charitiesByMonth[d.getMonth()]++;
      }
    });

    return Array.from({ length: currentMonth + 1 }, (_, i) => ({
      name: MONTHS_AR[i],
      users: usersByMonth[i],
      charities: charitiesByMonth[i],
    })).filter(m => m.users > 0 || m.charities > 0);
  }, [users, charities]);

  // ─── لوجيك حساب نسبة النمو الفعلي ديناميكياً للشهر الحالى ────────────────
  const dynamicTrend = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const currentMonthCount = 
      users.filter(u => u.createdAt && new Date(u.createdAt).getMonth() === currentMonth && new Date(u.createdAt).getFullYear() === currentYear).length +
      charities.filter(c => c.createdAt && new Date(c.createdAt).getMonth() === currentMonth && new Date(c.createdAt).getFullYear() === currentYear).length;

    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const lastMonthCount = 
      users.filter(u => u.createdAt && new Date(u.createdAt).getMonth() === lastMonth && new Date(u.createdAt).getFullYear() === lastMonthYear).length +
      charities.filter(c => c.createdAt && new Date(c.createdAt).getMonth() === lastMonth && new Date(c.createdAt).getFullYear() === lastMonthYear).length;

    let percentage = 0;
    if (lastMonthCount === 0) {
      percentage = currentMonthCount * 100;
    } else {
      percentage = parseFloat(((currentMonthCount / lastMonthCount) * 100).toFixed(1));
    }

    const isUp = currentMonthCount >= lastMonthCount;
    return {
      label: `${isUp ? '+' : '-'}${percentage.toLocaleString('en-US')}%`,
      isUp
    };
  }, [users, charities]);

  const approvalPieData = [
    { name: 'موافق عليها', value: charities.filter(c => c.approvalStatus === 'approved').length },
    { name: 'معلقة',       value: charities.filter(c => c.approvalStatus === 'pending').length  },
    { name: 'مرفوضة',     value: charities.filter(c => c.approvalStatus === 'rejected').length  },
  ].filter(d => d.value > 0);
  const PIE_COLORS = [TEAL2, AMBER, RED];

  const userName = user?.userName ?? user?.email?.split('@')[0] ?? 'مسؤول';

  return (
    <div className="ap-layout" dir="rtl">
      <Sidebar
        activeTab={tab}
        onTabChange={setTab}
        userName={userName}
        onLogout={handleLogout}
        pendingCount={pendingCount}
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      <main className={`ap-main${tab === 'ai-chat' ? ' ap-main--ai' : ''}`}>
        {tab !== 'ai-chat' && (
          <header className="ap-page-header">
            <div className="ap-page-header-left">
              <div className="ap-page-breadcrumb">
                <i className="ti ti-shield-check" style={{ color: TEAL2 }} />
                <span>لوحة التحكم</span>
                <i className="ti ti-chevron-left" style={{ fontSize: 12, color: 'var(--t4)' }} />
                <span style={{ color: 'var(--t1)', fontWeight: 700 }}>
                  {NAV_ITEMS.find(n => n.id === tab)?.label}
                </span>
              </div>
            </div>
            <div className="ap-page-header-right">
              <button 
                className="ap-header-icon-btn ap-theme-btn" 
                onClick={toggleTheme} 
                title={theme === 'dark' ? 'تفعيل الوضع النهارى' : 'تفعيل الوضع الليلي'}
              >
                <i className={`ti ${theme === 'dark' ? 'ti-sun' : 'ti-moon'}`} />
              </button>
              <button className="ap-header-icon-btn" onClick={loadData} title="تحديث البيانات">
                <i className="ti ti-refresh" />
              </button>
              <div className="ap-header-user" onClick={() => setTab('settings')} title="الإعدادات">
                <div className="ap-header-avatar">{userName.slice(0, 1).toUpperCase()}</div>
                <span className="ap-header-username-text">{userName}</span>
                <i className="ti ti-settings" style={{ fontSize: 13, color: 'var(--t4)' }} />
              </div>
            </div>
          </header>
        )}

        <div className={`ap-content${tab === 'ai-chat' ? ' ap-content--ai' : ''}`}>
          {error && !loading && <ErrorBanner msg={error} onRetry={loadData} />}

          {loading ? <PageSkeleton /> : (
            <>
              {/* ══ OVERVIEW ══════════════════════════════════════════════════ */}
              {tab === 'overview' && (
                <div className="ap-tab-pane">
                  <div className="ap-kpi-grid">
                    <KpiCard icon="ti-users" label="إجمالي المستخدمين" value={(usersTotal || users.length).toLocaleString('en-US')} change="+12.5% هذا الشهر" changeDir="up" color={TEAL2} />
                    <KpiCard icon="ti-building-community" label="الجمعيات المسجلة" value={(charitiesTotal || charities.length).toLocaleString('en-US')} change="+3 جديد" changeDir="up" color="#3b82f6" />
                    <KpiCard icon="ti-alert-circle" label="التقارير الواردة" value={(reportsTotal || reports.length).toLocaleString('en-US')} change={pendingCount > 0 ? `${pendingCount} معلق` : 'لا يوجد معلق'} changeDir={pendingCount > 0 ? 'down' : 'neutral'} color={AMBER} />
                    <KpiCard icon="ti-clock-pause" label="جمعيات معلقة" value={pendingCount.toLocaleString('en-US')} change={pendingCount > 0 ? 'تحتاج مراجعة' : 'الكل جاهز'} changeDir={pendingCount > 0 ? 'down' : 'neutral'} color={RED} />
                  </div>

                  <div className="ap-charts-row">
                    <div className="ap-chart-card ap-chart-card--wide">
                      <div className="ap-chart-header">
                        <span className="ap-chart-title"><i className="ti ti-trending-up" style={{ color: TEAL2 }} />نمو المستخدمين والجمعيات</span>
                        <span className={`ap-chart-trend ${dynamicTrend.isUp ? 'up' : 'down'}`}>
                          <i className={`ti ${dynamicTrend.isUp ? 'ti-arrow-up-right' : 'ti-arrow-down-right'}`} /> 
                          {dynamicTrend.label}
                        </span>
                      </div>
                      <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={trendData} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={TEAL2} stopOpacity={0.32} />
                              <stop offset="100%" stopColor={TEAL2} stopOpacity={0.02} />
                            </linearGradient>
                            <linearGradient id="gradCharities" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.28} />
                              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="name" tick={{ fill: 'var(--t3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: 'var(--t3)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                          <Tooltip content={<ChartTooltip />} />
                          <Area type="monotone" dataKey="users" name="المستخدمون" stroke={TEAL2} strokeWidth={2.5} fill="url(#gradUsers)" dot={false} />
                          <Area type="monotone" dataKey="charities" name="الجمعيات" stroke="#3b82f6" strokeWidth={2.5} fill="url(#gradCharities)" dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    {approvalPieData.length > 0 && (
                      <div className="ap-chart-card">
                        <div className="ap-chart-header">
                          <span className="ap-chart-title"><i className="ti ti-chart-donut" style={{ color: AMBER }} />حالة الجمعيات</span>
                        </div>
                        <ResponsiveContainer width="100%" height={210}>
                          <PieChart>
                            <Pie data={approvalPieData} cx="50%" cy="50%" innerRadius={52} outerRadius={82} paddingAngle={4} dataKey="value">
                              {approvalPieData.map((_, index) => (
                                <Cell key={index} fill={PIE_COLORS[index]} strokeWidth={0} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(v: number, n: string) => [v, n]} contentStyle={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 10, color: 'var(--t1)', fontSize: 12, fontFamily: 'Tajawal, sans-serif' }} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="ap-pie-legend">
                          {approvalPieData.map((d, i) => (
                            <div key={i} className="ap-pie-legend-item">
                              <span className="ap-pie-legend-dot" style={{ background: PIE_COLORS[i] }} />
                              <span>{d.name}</span>
                              <span style={{ fontWeight: 700, marginRight: 'auto' }}>{d.value.toLocaleString('en-US')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ══ USERS ══════════════════════════════════════════════════════ */}
              {tab === 'users' && (
                <div className="ap-tab-pane">
                  <div className="ap-section-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <SectionTitle icon="ti-users" color={TEAL2} title="المستخدمون" badge={usersTotal || users.length} />
                      <ViewToggle mode={usersViewMode} onChange={setUsersViewMode} />
                    </div>
                    <SearchBox value={usersSearch} onChange={setUsersSearch} placeholder="بحث بالاسم أو البريد..." />
                  </div>

                  {filteredUsers.length === 0 ? (
                    <EmptyState icon="ti-user-off" title="لا يوجد مستخدمون" desc="لم يتم العثور على مستخدمين مطابقين للبحث" />
                  ) : usersViewMode === 'table' ? (
                    <div className="ap-table-wrap">
                      <table className="ap-table">
                        <thead>
                          <tr>
                            <th>المستخدم</th>
                            <th className="ap-col-hide-sm">البريد الإلكتروني</th>
                            <th>الدور</th>
                            <th className="ap-col-hide-xs">موثق</th>
                            <th className="ap-col-hide-sm">تاريخ الانضمام</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map(u => {
                            const verified = u.isVerified || u.verify;
                            return (
                              <tr key={u._id} className="ap-table-row-clickable" onClick={() => setUserDetailModal(u)}>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div className="ap-table-avatar">
                                      {u.userName?.slice(0, 1).toUpperCase() ?? '?'}
                                    </div>
                                    <span style={{ fontWeight: 600, color: 'var(--t1)' }}>{u.userName}</span>
                                  </div>
                                </td>
                                <td className="ap-table-mono ap-col-hide-sm">{u.email}</td>
                                <td><RoleBadge role={u.roleType} /></td>
                                <td className="ap-col-hide-xs">
                                  <span className="ap-badge" style={{ background: verified ? 'rgba(34,197,94,0.14)' : 'rgba(244,63,94,0.14)', color: verified ? '#22c55e' : RED }}>
                                    <i className={`ti ${verified ? 'ti-circle-check' : 'ti-circle-x'}`} style={{ fontSize: 12 }} />
                                    {verified ? 'موثق' : 'غير موثق'}
                                  </span>
                                </td>
                                <td className="ap-col-hide-sm" style={{ color: 'var(--t3)', fontSize: 12 }}>{fmt(u.createdAt)}</td>
                                <td onClick={e => e.stopPropagation()}>
                                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                    <button className="ap-eye-btn" onClick={() => setUserDetailModal(u)} title="عرض التفاصيل">
                                      <i className="ti ti-eye" />
                                    </button>
                                    {u.roleType !== 'admin' && (
                                      <button className="ap-action-btn delete" onClick={() => handleDeleteUser(u._id, u.userName)}>
                                        <i className="ti ti-trash" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="ap-card-grid">
                      {filteredUsers.map(u => {
                        const verified = u.isVerified || u.verify;
                        return (
                          <div key={u._id} className="ap-entity-card" onClick={() => setUserDetailModal(u)}>
                            <div className="ap-entity-card-header">
                              <div className="ap-entity-avatar user">{u.userName?.slice(0, 1).toUpperCase()}</div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="ap-entity-name">{u.userName}</div>
                                <div className="ap-entity-email">{u.email}</div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                              <RoleBadge role={u.roleType} />
                              <span className="ap-badge" style={{ background: verified ? 'rgba(34,197,94,0.14)' : 'rgba(244,63,94,0.14)', color: verified ? '#22c55e' : RED }}>
                                {verified ? 'موثق' : 'غير موثق'}
                              </span>
                            </div>
                            <div className="ap-entity-date"><i className="ti ti-calendar" />{fmt(u.createdAt)}</div>
                            <div className="ap-entity-actions" onClick={e => e.stopPropagation()}>
                              <button className="ap-card-eye-btn" onClick={() => setUserDetailModal(u)}>
                                <i className="ti ti-eye" /> التفاصيل
                              </button>
                              {u.roleType !== 'admin' && (
                                <button className="ap-action-btn delete" onClick={() => handleDeleteUser(u._id, u.userName)}>
                                  <i className="ti ti-trash" /> حذف
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {hasMoreUsers && (
                    <LoadMoreBtn loading={loadingMore === 'users'} remaining={Math.max(0, usersTotal - users.length)} onClick={loadMoreUsers} />
                  )}
                </div>
              )}

              {/* ══ CHARITIES ══════════════════════════════════════════════════ */}
              {tab === 'charities' && (
                <div className="ap-tab-pane">
                  <div className="ap-section-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <SectionTitle icon="ti-building-community" color="#3b82f6" title="الجمعيات" badge={charitiesTotal || charities.length} />
                      <ViewToggle mode={charitiesViewMode} onChange={setCharitiesViewMode} />
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                      <div className="ap-filter-tabs">
                        {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
                          <button key={f} className={`ap-filter-tab${charitiesFilter === f ? ' active' : ''}`} onClick={() => setCharitiesFilter(f)}>
                            {f === 'all' ? 'الكل' : f === 'pending' ? 'معلق' : f === 'approved' ? 'موافق' : 'مرفوض'}
                            {f === 'pending' && pendingCount > 0 && (
                              <span className="ap-filter-badge">{pendingCount}</span>
                            )}
                          </button>
                        ))}
                      </div>
                      <SearchBox value={charitiesSearch} onChange={setCharitiesSearch} placeholder="بحث في الجمعيات..." />
                    </div>
                  </div>

                  {filteredCharities.length === 0 ? (
                    <EmptyState icon="ti-building-off" title="لا توجد جمعيات" desc="لم يتم العثور على جمعيات مطابقة" />
                  ) : charitiesViewMode === 'table' ? (
                    <div className="ap-table-wrap">
                      <table className="ap-table">
                        <thead>
                          <tr>
                            <th>الجمعية</th>
                            <th className="ap-col-hide-sm">البريد الإلكتروني</th>
                            <th className="ap-col-hide-xs">العنوان</th>
                            <th>الحالة</th>
                            <th className="ap-col-hide-sm">تاريخ التسجيل</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredCharities.map(c => (
                            <tr key={c._id} className="ap-table-row-clickable" onClick={() => setCharityDetailModal(c)}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <div className="ap-table-avatar" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>
                                    <i className="ti ti-building-community" />
                                  </div>
                                  <span style={{ fontWeight: 600, color: 'var(--t1)' }}>{c.charityName}</span>
                                </div>
                              </td>
                              <td className="ap-table-mono ap-col-hide-sm">{c.email}</td>
                              <td className="ap-col-hide-xs">{c.address || '—'}</td>
                              <td><StatusBadge status={c.approvalStatus} /></td>
                              <td className="ap-col-hide-sm" style={{ color: 'var(--t3)', fontSize: 12 }}>{fmt(c.createdAt)}</td>
                              <td onClick={e => e.stopPropagation()}>
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                  <button className="ap-eye-btn" onClick={() => setCharityDetailModal(c)}>
                                    <i className="ti ti-eye" />
                                  </button>
                                  {c.approvalStatus === 'pending' && (
                                    <>
                                      <button className="ap-action-btn approve" onClick={() => handleApprove(c._id, c.charityName)}>
                                        <i className="ti ti-check" />
                                      </button>
                                      <button className="ap-action-btn reject" onClick={() => setRejectTarget({ id: c._id, name: c.charityName })}>
                                        <i className="ti ti-x" />
                                      </button>
                                    </>
                                  )}
                                  <button className="ap-action-btn edit" onClick={() => setEditCharityTarget(c)}>
                                    <i className="ti ti-edit" />
                                  </button>
                                  <button className="ap-action-btn delete" onClick={() => handleDeleteCharity(c._id, c.charityName)}>
                                    <i className="ti ti-trash" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="ap-card-grid">
                      {filteredCharities.map(c => (
                        <div key={c._id} className="ap-entity-card" onClick={() => setCharityDetailModal(c)}>
                          <div className="ap-entity-card-header">
                            <div className="ap-entity-avatar charity"><i className="ti ti-building-community" /></div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div className="ap-entity-name">{c.charityName}</div>
                              <div className="ap-entity-email">{c.email}</div>
                            </div>
                          </div>
                          <div style={{ marginBottom: 10 }}>
                            <StatusBadge status={c.approvalStatus} />
                          </div>
                          {c.address && <div className="ap-entity-meta"><i className="ti ti-map-pin" />{c.address}</div>}
                          <div className="ap-entity-date"><i className="ti ti-calendar" />{fmt(c.createdAt)}</div>
                          <div className="ap-entity-actions" onClick={e => e.stopPropagation()}>
                            <button className="ap-card-eye-btn" onClick={() => setCharityDetailModal(c)}>
                              <i className="ti ti-eye" /> تفاصيل
                            </button>
                            {c.approvalStatus === 'pending' && (
                              <>
                                <button className="ap-action-btn approve" disabled={!!actionLoading} onClick={() => handleApprove(c._id, c.charityName)}>
                                  <i className="ti ti-check" /> موافقة
                                </button>
                                <button className="ap-action-btn reject" disabled={!!actionLoading} onClick={() => setRejectTarget({ id: c._id, name: c.charityName })}>
                                  <i className="ti ti-x" /> رفض
                                </button>
                              </>
                            )}
                            <button className="ap-action-btn edit" onClick={() => setEditCharityTarget(c)}>
                              <i className="ti ti-edit" />
                            </button>
                            <button className="ap-action-btn delete" disabled={!!actionLoading} onClick={() => handleDeleteCharity(c._id, c.charityName)}>
                              <i className="ti ti-trash" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {hasMoreCharities && (
                    <LoadMoreBtn loading={loadingMore === 'charities'} remaining={charitiesRemaining} onClick={loadMoreCharities} />
                  )}
                </div>
              )}

              {/* ══ REPORTS ══════════════════════════════════════════════════ */}
              {tab === 'reports' && (
                <div className="ap-tab-pane">
                  <div className="ap-section-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <SectionTitle icon="ti-alert-circle" color={AMBER} title="التقارير" badge={reportsTotal || reports.length} />
                      <ViewToggle mode={reportsViewMode} onChange={setReportsViewMode} />
                    </div>
                    <SearchBox value={reportsSearch} onChange={setReportsSearch} placeholder="بحث في التقارير..." />
                  </div>

                  {filteredReports.length === 0 ? (
                    <EmptyState icon="ti-mood-happy" title="لا توجد تقارير حتى الآن" desc="كل شيء يسير على ما يرام!" />
                  ) : reportsViewMode === 'table' ? (
                    <div className="ap-table-wrap">
                      <table className="ap-table">
                        <thead>
                          <tr>
                            <th className="ap-col-hide-sm">رقم التقرير</th>
                            <th>المُرسِل</th>
                            <th className="ap-col-hide-xs">النوع</th>
                            <th>الوصف</th>
                            <th className="ap-col-hide-sm">التاريخ</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredReports.map((r, i) => {
                            const isCharity = r.senderType === 'charity';
                            return (
                              <tr key={r._id} className="ap-table-row-clickable" onClick={() => setReportModal(r)}>
                                <td className="ap-col-hide-sm" style={{ fontWeight: 700, color: 'var(--amber)' }}>#{i + 1}</td>
                                <td>{r.userName || r.charityName || '—'}</td>
                                <td className="ap-col-hide-xs">{isCharity ? 'جمعية' : 'مستخدم'}</td>
                                <td style={{ maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description}</td>
                                <td className="ap-col-hide-sm" style={{ color: 'var(--t3)', fontSize: 12 }}>{fmt(r.createdAt)}</td>
                                <td onClick={e => e.stopPropagation()}>
                                  <button className="ap-eye-btn" onClick={() => setReportModal(r)}>
                                    <i className="ti ti-eye" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="ap-card-grid">
                      {filteredReports.map((r, i) => {
                        const isCharity = r.senderType === 'charity';
                        const senderName = r.userName || r.charityName || '—';
                        return (
                          <div key={r._id} className="ap-report-card" onClick={() => setReportModal(r)}>
                            <div className="ap-report-card-top">
                              <span className="ap-report-num"><i className="ti ti-alert-triangle" />تقرير #{i + 1}</span>
                              <span className="ap-report-date"><i className="ti ti-calendar" />{fmt(r.createdAt)}</span>
                            </div>
                            <div className="ap-report-sender">
                              <div className="ap-report-sender-icon" style={{ background: isCharity ? 'rgba(16,185,129,0.14)' : 'rgba(59,130,246,0.14)', color: isCharity ? TEAL2 : '#3b82f6' }}>
                                <i className={`ti ${isCharity ? 'ti-building' : 'ti-user'}`} />
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, color: 'var(--t1)', fontSize: 13 }}>{senderName}</div>
                                <div style={{ fontSize: 11, color: 'var(--t4)', marginTop: 1 }}>{isCharity ? 'جمعية' : 'مستخدم'}</div>
                              </div>
                            </div>
                            <p className="ap-report-body">{r.description}</p>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                              <button className="ap-card-eye-btn" onClick={e => { e.stopPropagation(); setReportModal(r); }}>
                                <i className="ti ti-eye" /> عرض التقرير
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {hasMoreReports && (
                    <LoadMoreBtn loading={loadingMore === 'reports'} remaining={Math.max(0, reportsTotal - reports.length)} onClick={loadMoreReports} />
                  )}
                </div>
              )}

              {/* ══ AUTOMATION ══════════════════════════════════════════════ */}
              {tab === 'automation' && (
                <div className="ap-tab-pane">
                  <div className="ap-automation-banner">
                    <div className="ap-automation-banner-icon"><i className="ti ti-settings-automation" /></div>
                    <div>
                      <div className="ap-automation-banner-title">التشغيل التلقائي — Cron Jobs</div>
                      <div className="ap-automation-banner-sub">يمكنك تشغيل المهام التلقائية يدويًا من هنا. يتم تشغيلها في الخلفية وفقًا لجدول زمني محدد.</div>
                    </div>
                  </div>

                  <div className="ap-cron-grid">
                    <CronCard icon="ti-bell-ringing" iconBg="rgba(16,185,129,0.14)" iconColor={TEAL2} title="تذكير التبرعات" desc="يرسل تذكيرات للجمعيات بالتبرعات المعلقة التي لم يتم تأكيدها." code="GET /cron/donationReminder" codeBg="rgba(16,185,129,0.08)" codeBorder="rgba(16,185,129,0.24)" codeColor={TEAL2} loading={cronLoading.reminder} btnColor={TEAL2} onRun={runDonationReminder} />
                    <CronCard icon="ti-report-analytics" iconBg="rgba(59,130,246,0.14)" iconColor="#3b82f6" title="تقرير الأدمن" desc="يولّد تقريرًا شاملاً عن نشاط المنصة ويرسله لجميع المسؤولين عبر البريد الإلكتروني." code="GET /cron/adminReport" codeBg="rgba(59,130,246,0.08)" codeBorder="rgba(59,130,246,0.24)" codeColor="#3b82f6" loading={cronLoading.report} btnColor="#3b82f6" onRun={runAdminReport} />
                  </div>

                  <div className="ap-cron-stats-row">
                    {[
                      { icon: 'ti-history',        color: TEAL2,     value: cronLog.length, label: 'عدد مرات التشغيل' },
                      { icon: 'ti-clock',           color: AMBER,     value: lastRun ? new Date(lastRun).toLocaleTimeString('en-US') : '—', label: 'آخر تشغيل' },
                      { icon: 'ti-calendar-event', color: '#3b82f6', value: 'تلقائي', label: 'جدول زمني' },
                    ].map((s, i) => (
                      <div key={i} className="ap-cron-stat">
                        <i className={`ti ${s.icon}`} style={{ color: s.color, fontSize: 22 }} />
                        <div>
                          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)' }}>{s.value}</div>
                          <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>{s.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {cronLog.length > 0 && (
                    <div className="ap-cron-log">
                      <div className="ap-cron-log-header">
                        <SectionTitle icon="ti-list-details" color={TEAL2} title="سجل التنفيذ" badge={cronLog.length} />
                        <button className="ap-cron-log-clear" onClick={() => setCronLog([])}><i className="ti ti-trash" />مسح</button>
                      </div>
                      <div className="ap-cron-log-list">
                        {cronLog.map((log, i) => (
                          <div key={i} className={`ap-cron-log-item ${log.type}`}>
                            <span>{log.type === 'success' ? '✓' : '✗'} {log.text}</span>
                            <span style={{ fontSize: 11, color: 'var(--t4)', flexShrink: 0 }}>{log.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ══ SETTINGS ══════════════════════════════════════════════════ */}
              {tab === 'settings' && (
                <div className="ap-tab-pane">
                  <div className="ap-section-header">
                    <SectionTitle icon="ti-settings" color={TEAL2} title="الإعدادات" />
                  </div>

                  <div className="ap-settings-grid">
                    <div className="ap-settings-card">
                      <div className="ap-settings-card-title">
                        <div className="ap-settings-icon" style={{ background: 'rgba(16,185,129,0.14)', color: TEAL2 }}>
                          <i className="ti ti-user-circle" />
                        </div>
                        الملف الشخصي
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div className="ap-form-group">
                          <label className="ap-form-label">اسم المستخدم</label>
                          <input
                            className="ap-form-input"
                            value={profileForm.userName}
                            onChange={e => setProfileForm(f => ({ ...f, userName: e.target.value }))}
                            placeholder="اسم المستخدم"
                          />
                        </div>
                        <div className="ap-form-group">
                          <label className="ap-form-label">البريد الإلكتروني</label>
                          <input className="ap-form-input" value={user?.email ?? ''} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                        </div>
                        <div className="ap-form-group">
                          <label className="ap-form-label">رقم الهاتف</label>
                          <input
                            className="ap-form-input"
                            value={profileForm.phone}
                            onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                            placeholder="01xxxxxxxxx"
                          />
                        </div>
                        <div className="ap-form-group">
                          <label className="ap-form-label">العنوان</label>
                          <input
                            className="ap-form-input"
                            value={profileForm.address}
                            onChange={e => setProfileForm(f => ({ ...f, address: e.target.value }))}
                            placeholder="المدينة أو المنطقة"
                          />
                        </div>
                        <button
                          className="ap-action-btn approve"
                          style={{ alignSelf: 'flex-start', padding: '8px 18px' }}
                          disabled={settingsSaving}
                          onClick={saveProfile}
                        >
                          {settingsSaving ? <><i className="ti ti-loader-2 ti-spin" /> جاري الحفظ...</> : <><i className="ti ti-check" /> حفظ التغييرات</>}
                        </button>
                      </div>
                    </div>

                    <div className="ap-settings-card">
                      <div className="ap-settings-card-title">
                        <div className="ap-settings-icon" style={{ background: 'rgba(244,63,94,0.14)', color: RED }}>
                          <i className="ti ti-shield-lock" />
                        </div>
                        تغيير كلمة المرور
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div className="ap-form-group">
                          <label className="ap-form-label">كلمة المرور الحالية</label>
                          <input
                            className="ap-form-input"
                            type="password"
                            value={passForm.oldPassword}
                            onChange={e => setPassForm(f => ({ ...f, oldPassword: e.target.value }))}
                            placeholder="••••••••"
                          />
                        </div>
                        <div className="ap-form-group">
                          <label className="ap-form-label">كلمة المرور الجديدة</label>
                          <input
                            className="ap-form-input"
                            type="password"
                            value={passForm.newPassword}
                            onChange={e => setPassForm(f => ({ ...f, newPassword: e.target.value }))}
                            placeholder="••••••••"
                          />
                        </div>
                        <div className="ap-form-group">
                          <label className="ap-form-label">تأكيد كلمة المرور الجديدة</label>
                          <input
                            className="ap-form-input"
                            type="password"
                            value={passForm.confirmPassword}
                            onChange={e => setPassForm(f => ({ ...f, confirmPassword: e.target.value }))}
                            placeholder="••••••••"
                          />
                        </div>
                        <button
                          className="ap-action-btn edit"
                          style={{ alignSelf: 'flex-start', padding: '8px 18px' }}
                          disabled={settingsSaving}
                          onClick={savePassword}
                        >
                          {settingsSaving ? <><i className="ti ti-loader-2 ti-spin" /> جاري الحفظ...</> : <><i className="ti ti-key" /> تغيير كلمة المرور</>}
                        </button>
                      </div>
                    </div>

                    <div className="ap-settings-card">
                      <div className="ap-settings-card-title">
                        <div className="ap-settings-icon" style={{ background: 'rgba(59,130,246,0.14)', color: '#3b82f6' }}>
                          <i className="ti ti-bell" />
                        </div>
                        الإشعارات
                      </div>
                      {[
                        { label: 'إشعارات البريد الإلكتروني', sub: 'تلقي التنبيهات عبر البريد', default: true  },
                        { label: 'تقارير جديدة',              sub: 'إشعار فوري عند ورود تقرير',  default: true  },
                        { label: 'طلبات الانضمام',            sub: 'جمعيات تنتظر الموافقة',       default: false },
                      ].map((item, i) => (
                        <div key={i} className="ap-settings-row">
                          <div>
                            <div className="ap-settings-row-label">{item.label}</div>
                            <div className="ap-settings-row-sub">{item.sub}</div>
                          </div>
                          <label className="ap-toggle">
                            <input type="checkbox" defaultChecked={item.default} />
                            <span className="ap-toggle-slider" />
                          </label>
                        </div>
                      ))}
                    </div>

                    <div className="ap-settings-card">
                      <div className="ap-settings-card-title">
                        <div className="ap-settings-icon" style={{ background: 'rgba(245,158,11,0.14)', color: AMBER }}>
                          <i className="ti ti-server" />
                        </div>
                        النظام
                      </div>
                      
                      <div className="ap-settings-row">
                        <div>
                          <div className="ap-settings-row-label">الوضع الليلي (Dark Mode)</div>
                          <div className="ap-settings-row-sub">تبديل مظهر لوحة التحكم بالكامل</div>
                        </div>
                        <label className="ap-toggle">
                          <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
                          <span className="ap-toggle-slider" />
                        </label>
                      </div>

                      {[
                        { label: 'وضع المطور',      sub: 'عرض السجلات التقنية',    default: false },
                        { label: 'ذاكرة التخزين', sub: 'حفظ الجلسة تلقائياً',    default: true  },
                      ].map((item, i) => (
                        <div key={i} className="ap-settings-row">
                          <div>
                            <div className="ap-settings-row-label">{item.label}</div>
                            <div className="ap-settings-row-sub">{item.sub}</div>
                          </div>
                          <label className="ap-toggle">
                            <input type="checkbox" defaultChecked={item.default} />
                            <span className="ap-toggle-slider" />
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: 'var(--radius)', padding: '20px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>                
                    <div>
                      <div style={{ fontWeight: 800, color: RED, marginBottom: 4, fontSize: 14 }}>منطقة الخطر</div>
                      <div style={{ fontSize: 13, color: 'var(--t3)', lineHeight: 1.6 }}>تسجيل الخروج من جميع الجلسات أو حذف الحساب نهائيًا.</div>
                    </div>
                    <button className="ap-action-btn reject" style={{ padding: '9px 18px', flexShrink: 0 }} onClick={handleLogout}>
                      <i className="ti ti-logout" /> تسجيل الخروج
                    </button>
                  </div>
                </div>
              )}

              {/* ══ AI CHAT ══════════════════════════════════════════════════ */}
              {tab === 'ai-chat' && (
                <div className="ap-ai-chat-container">
                  <AIChatEmbed />
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <MobileNav activeTab={tab} onTabChange={setTab} pendingCount={pendingCount} />

      <Toast msg={toast} />
      <ConfirmModal opts={confirmOpts} loading={confirmLoading} onClose={() => { if (!confirmLoading) setConfirmOpts(null); }} />
      <RejectModal target={rejectTarget} loading={rejectLoading} onClose={() => setRejectTarget(null)} onConfirm={handleReject} />
      <EditCharityModal target={editCharityTarget} loading={actionLoading} setLoading={setActionLoading} onClose={() => setEditCharityTarget(null)} onSaved={(id, form) => setCharities(prev => prev.map(c => c._id === id ? { ...c, ...form } : c))} showMsg={showMsg} />

      {/* User Detail Modal */}
      {userDetailModal && (() => {
        const verified = userDetailModal.isVerified || userDetailModal.verify;
        return (
          <div className="ap-modal-overlay" onClick={() => setUserDetailModal(null)}>
            <div className="ap-modal ap-modal-wide" onClick={e => e.stopPropagation()}>
              <div style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.04) 100%)', padding: '22px 28px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div className="ap-detail-avatar" style={{ width: 52, height: 52, fontSize: 20 }}>{userDetailModal.userName?.slice(0, 1).toUpperCase() ?? '?'}</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--t1)', marginBottom: 3 }}>{userDetailModal.userName}</div>
                    <div style={{ fontSize: 13, color: 'var(--t3)' }}>{userDetailModal.email}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                      <RoleBadge role={userDetailModal.roleType} />
                      <span className="ap-badge" style={{ background: verified ? 'rgba(34,197,94,0.14)' : 'rgba(244,63,94,0.14)', color: verified ? '#22c55e' : RED }}>
                        <i className={`ti ${verified ? 'ti-circle-check' : 'ti-circle-x'}`} style={{ fontSize: 11 }} />
                        {verified ? 'موثق' : 'غير موثق'}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="ap-modal-close-x" onClick={() => setUserDetailModal(null)}><i className="ti ti-x" /></button>
              </div>
              <div className="ap-modal-inner" style={{ paddingTop: 20 }}>
                <div className="ap-detail-section">
                  <DetailRow icon="ti-fingerprint" label="المعرف"       value={userDetailModal._id}                           mono />
                  <DetailRow icon="ti-mail"        label="البريد"       value={userDetailModal.email}                               />
                  {userDetailModal.phone   && <DetailRow icon="ti-phone"   label="الهاتف"    value={userDetailModal.phone}   />}
                  {userDetailModal.address && <DetailRow icon="ti-map-pin" label="العنوان"   value={userDetailModal.address} />}
                  <DetailRow icon="ti-calendar"    label="تاريخ الانضمام" value={fmt(userDetailModal.createdAt)}                    />
                  {userDetailModal.updatedAt && <DetailRow icon="ti-clock-edit" label="آخر تحديث" value={fmt(userDetailModal.updatedAt)} />}
                </div>
                <div className="ap-modal-actions" style={{ marginTop: 18 }}>
                  <button className="ap-modal-cancel" onClick={() => setUserDetailModal(null)}>إغلاق</button>
                  {userDetailModal.roleType !== 'admin' && (
                    <button className="ap-modal-confirm" style={{ background: RED }} onClick={() => { setUserDetailModal(null); handleDeleteUser(userDetailModal._id, userDetailModal.userName); }}>
                      <i className="ti ti-trash" />حذف المستخدم
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Charity Detail Modal */}
      {charityDetailModal && (
        <div className="ap-modal-overlay" onClick={() => setCharityDetailModal(null)}>
          <div className="ap-modal ap-modal-wide" onClick={e => e.stopPropagation()}>
            <div style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(59,130,246,0.04) 100%)', padding: '22px 28px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div className="ap-entity-avatar charity" style={{ width: 52, height: 52, fontSize: 22 }}><i className="ti ti-building-community" /></div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--t1)', marginBottom: 3 }}>{charityDetailModal.charityName}</div>
                  <div style={{ fontSize: 13, color: 'var(--t3)' }}>{charityDetailModal.email}</div>
                  <div style={{ marginTop: 8 }}><StatusBadge status={charityDetailModal.approvalStatus} /></div>
                </div>
              </div>
              <button className="ap-modal-close-x" onClick={() => setCharityDetailModal(null)}><i className="ti ti-x" /></button>
            </div>

            <div className="ap-modal-inner" style={{ paddingTop: 20 }}>
              <div className="ap-detail-section" style={{ marginBottom: 16 }}>
                <DetailRow icon="ti-fingerprint"  label="المعرف"        value={charityDetailModal._id}                     mono />
                <DetailRow icon="ti-map-pin"      label="العنوان"       value={charityDetailModal.address || '—'}                />
                {charityDetailModal.phone         && <DetailRow icon="ti-phone"       label="الهاتف"       value={charityDetailModal.phone}         />}
                {charityDetailModal.licenseNumber && <DetailRow icon="ti-certificate" label="رقم الترخيص"  value={charityDetailModal.licenseNumber} />}
                <DetailRow icon="ti-calendar"     label="تاريخ التسجيل" value={fmt(charityDetailModal.createdAt)}                />
                {charityDetailModal.userId && <DetailRow icon="ti-user" label="معرف المالك" value={charityDetailModal.userId} mono />}
              </div>

              {charityDetailModal.description && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className="ti ti-file-description" style={{ fontSize: 14 }} /> الوصف
                  </div>
                  <div className="ap-report-full-body">{charityDetailModal.description}</div>
                </div>
              )}

              {charityDetailModal.approvalStatus === 'rejected' && charityDetailModal.rejectionReason && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: RED, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className="ti ti-alert-circle" style={{ fontSize: 14 }} /> سبب الرفض
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.8, background: 'rgba(244,63,94,0.06)', borderRadius: 'var(--radius-sm)', padding: 14, border: '1px solid rgba(244,63,94,0.18)' }}>
                    {charityDetailModal.rejectionReason}
                  </div>
                </div>
              )}

              {charityDetailModal.approvalStatus === 'pending' && (
                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                  <button className="ap-action-btn approve" style={{ flex: 1, justifyContent: 'center' }} disabled={!!actionLoading} onClick={() => { setCharityDetailModal(null); handleApprove(charityDetailModal._id, charityDetailModal.charityName); }}>
                    <i className="ti ti-check" />موافقة
                  </button>
                  <button className="ap-action-btn reject" style={{ flex: 1, justifyContent: 'center' }} disabled={!!actionLoading} onClick={() => { setCharityDetailModal(null); setRejectTarget({ id: charityDetailModal._id, name: charityDetailModal.charityName }); }}>
                    <i className="ti ti-x" />رفض
                  </button>
                </div>
              )}
              <div className="ap-modal-actions">
                <button className="ap-modal-cancel" onClick={() => setCharityDetailModal(null)}>إغلاق</button>
                <button className="ap-action-btn edit" style={{ padding: '10px 18px', fontSize: 13 }} onClick={() => { setCharityDetailModal(null); setEditCharityTarget(charityDetailModal); }}>
                  <i className="ti ti-edit" />تعديل
                </button>
                <button className="ap-modal-confirm" style={{ background: RED }} disabled={!!actionLoading} onClick={() => { setCharityDetailModal(null); handleDeleteCharity(charityDetailModal._id, charityDetailModal.charityName); }}>
                  <i className="ti ti-trash" />حذف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Detail Modal */}
      {reportModal && (() => {
        const isCharity = reportModal.senderType === 'charity';
        const senderName = reportModal.userName || reportModal.charityName || '—';
        return (
          <div className="ap-modal-overlay" onClick={() => setReportModal(null)}>
            <div className="ap-modal ap-modal-wide" onClick={e => e.stopPropagation()}>
              <div style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(245,158,11,0.04) 100%)', padding: '22px 28px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 13, background: 'rgba(245,158,11,0.14)', color: AMBER, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                    <i className="ti ti-alert-triangle" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--t1)', marginBottom: 3 }}>تقرير وارد</div>
                    <div style={{ fontSize: 12, color: 'var(--t3)' }}>{fmt(reportModal.createdAt)}</div>
                  </div>
                </div>
                <button className="ap-modal-close-x" onClick={() => setReportModal(null)}><i className="ti ti-x" /></button>
              </div>

              <div className="ap-modal-inner" style={{ paddingTop: 20 }}>
                <div className="ap-detail-section" style={{ marginBottom: 16 }}>
                  <DetailRow icon={isCharity ? 'ti-building' : 'ti-user'} label="المُرسِل" value={senderName} />
                  <DetailRow icon="ti-tag" label="نوع المُرسِل" value={isCharity ? 'جمعية' : 'مستخدم'} />
                  <DetailRow icon="ti-calendar" label="التاريخ" value={fmt(reportModal.createdAt)} />
                  {reportModal.userId && <DetailRow icon="ti-fingerprint" label="معرف المُرسِل" value={reportModal.userId} mono />}
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <i className="ti ti-file-text" style={{ fontSize: 14 }} /> محتوى التقرير
                  </div>
                  <div className="ap-report-full-body">{reportModal.description}</div>
                </div>

                <div className="ap-modal-actions" style={{ marginTop: 16 }}>
                  <button className="ap-modal-cancel" onClick={() => setReportModal(null)}>إغلاق</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}