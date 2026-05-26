import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { usersApi, donorApi, notificationApi, charityApi, Charity, Donation, Notification, request } from '../services';
import { statusLabel, formatDate } from '../lib/utils';
import RatingModal from '../features/rating/RatingModal';

// ─── Validation Regexes ──────────────────────────────────────────────────────
const nameRegex = /^[a-zA-Z\u0621-\u064A][^#&<>"~;$^%{}]{2,29}$/;
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/;
const phoneRegex = /^(002|\+2)?01[0125][0-9]{8}$/;
const licenseRegex = /^(?=.{6,20}$)[A-Z0-9]{2,5}[-]?[A-Z0-9]{3,10}[-]?[0-9]{2,6}$/;

interface ValidationErrors {
  userName?: string;
  phone?: string;
  charityName?: string;
  address?: string;
  description?: string;
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

type Tab = 'profile' | 'password' | 'donations' | 'notifications' | 'danger';

export default function Settings() {
  const { user, logout, refreshUser, isLoading } = useAuth();
  const [tab, setTab] = useState<Tab>('profile');
  const [profileForm, setProfileForm] = useState({ userName: '', phone: '', address: '' });
  const [charityProfile, setCharityProfile] = useState<Charity | null>(null);
  const [charityForm, setCharityForm] = useState({ charityName: '', address: '', description: '' });
  const [passForm, setPassForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [donations, setDonations] = useState<Donation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [ratingDonation, setRatingDonation] = useState<Donation | null>(null);
  const [profileErrors, setProfileErrors] = useState<ValidationErrors>({});
  const [passErrors, setPassErrors] = useState<ValidationErrors>({});
  // Eye toggle state for password fields
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({ userName: user.userName || '', phone: user.phone || '', address: user.address || '' });
      if (user.roleType === 'charity') {
        request('/users/profile').then((d: any) => {
          const c = d?.finder || d?.user || d?.data;
          if (c) {
            setCharityProfile(c as any);
            setCharityForm({
              charityName: c.charityName || '',
              address: c.address || '',
              description: c.description || '',
            });
            setProfileForm(f => ({ ...f, phone: c.phone || user.phone || '' }));
          }
        }).catch(() => {});
      }
    }
  }, [user]);

  useEffect(() => {
    if (tab === 'donations') {
      setLoadingData(true);
      donorApi.getMyDonations().then(d => setDonations(d.donations || [])).catch(() => {}).finally(() => setLoadingData(false));
    }
    if (tab === 'notifications') {
      setLoadingData(true);
      notificationApi.getAll().then((d: any) => setNotifications(d.notifications || d.data?.Data || d.data || [])).catch(() => {}).finally(() => setLoadingData(false));
    }
  }, [tab]);

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3500);
  };

  // ─── Profile Validation ──────────────────────────────────────────────────
  const validateProfile = (): boolean => {
    const errs: ValidationErrors = {};
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

  const validateCharityProfile = (): boolean => {
    const errs: ValidationErrors = {};
    if (!charityForm.charityName || charityForm.charityName.trim().length < 3 || charityForm.charityName.trim().length > 30) {
      errs.charityName = 'اسم الجمعية يجب أن يكون بين 3 و 30 حرفاً';
    }
    if (!profileForm.phone) {
      errs.phone = 'رقم الهاتف مطلوب';
    } else if (!phoneRegex.test(profileForm.phone)) {
      errs.phone = 'رقم غير صالح — أدخل رقماً مصرياً صحيحاً (مثال: 01012345678)';
    }
    if (!charityForm.address || charityForm.address.trim().length < 5 || charityForm.address.trim().length > 100) {
      errs.address = 'العنوان يجب أن يكون بين 5 و 100 حرف';
    }
    if (charityForm.description && (charityForm.description.trim().length < 10 || charityForm.description.trim().length > 500)) {
      errs.description = 'الوصف يجب أن يكون بين 10 و 500 حرف';
    }
    setProfileErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validatePassword = (): boolean => {
    const errs: ValidationErrors = {};
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

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProfile()) return;
    setSaving(true);
    try {
      await usersApi.updateProfile(profileForm);
      await refreshUser();
      showMsg('success', 'تم تحديث الملف الشخصي بنجاح');
    } catch (err: unknown) {
      showMsg('error', err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setSaving(false);
    }
  };

  const saveCharityProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!charityProfile) return;
    if (!validateCharityProfile()) return;
    setSaving(true);
    try {
      await charityApi.update(charityProfile._id, charityForm);
      if (profileForm.phone !== (user?.phone || '')) {
        await usersApi.updateProfile({ phone: profileForm.phone });
        await refreshUser();
      }
      showMsg('success', 'تم تحديث بيانات الجمعية بنجاح');
    } catch (err: unknown) {
      showMsg('error', err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword()) return;
    setSaving(true);
    try {
      await usersApi.changePassword(passForm);
      setPassForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      showMsg('success', 'تم تغيير كلمة المرور بنجاح');
    } catch (err: unknown) {
      showMsg('error', err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setSaving(false);
    }
  };

  const markNotifRead = async (id: string) => {
    try {
      await notificationApi.markRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, status: 'read' as const } : n));
    } catch {}
  };

  const deleteAccount = async () => {
    if (!confirm('هل أنت متأكد من حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه.')) return;
    try {
      await usersApi.deleteAccount();
      logout();
    } catch (err: unknown) {
      showMsg('error', err instanceof Error ? err.message : 'حدث خطأ أثناء الحذف');
    }
  };

  if (isLoading) return <div className="settings-wrapper"><div className="spinner"><div className="spinner-ring" /></div></div>;

  if (!user) {
    return (
      <div className="settings-wrapper">
        <div className="empty-state" style={{ paddingTop: 120 }}>
          <div className="empty-icon">🔒</div>
          <p style={{ marginBottom: 20 }}>يجب تسجيل الدخول للوصول للإعدادات</p>
          <Link href="/" className="btn-primary" style={{ display: 'inline-flex' }}>العودة للرئيسية</Link>
        </div>
      </div>
    );
  }

  const navItems: { id: Tab; icon: string; label: string; danger?: boolean }[] = [
    { id: 'profile', icon: user.roleType === 'charity' ? '🏛️' : '👤', label: user.roleType === 'charity' ? 'بيانات الجمعية' : 'الملف الشخصي' },
    { id: 'password', icon: '🔑', label: 'كلمة المرور' },
    ...(user.roleType === 'user' ? [{ id: 'donations' as Tab, icon: '📦', label: 'تبرعاتي' }] : []),
    { id: 'notifications', icon: '🔔', label: 'الإشعارات' },
    { id: 'danger', icon: '⚠️', label: 'منطقة الخطر', danger: true },
  ];

  const roleLabel = user.roleType === 'charity' ? 'جمعية خيرية' : user.roleType === 'admin' ? 'مدير' : 'متبرع';

  // Helper: field error display
  const FieldError = ({ msg: errMsg }: { msg?: string }) =>
    errMsg ? (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6, marginTop: 5,
        color: '#ef4444', fontSize: 12, fontWeight: 500,
        background: 'rgba(239,68,68,0.07)', borderRadius: 6,
        padding: '5px 10px', border: '1px solid rgba(239,68,68,0.18)',
      }}>
        <i className="fa-solid fa-circle-exclamation" style={{ fontSize: 11 }} />
        {errMsg}
      </div>
    ) : null;

  const inputErrStyle = (hasErr?: string): React.CSSProperties =>
    hasErr ? { border: '1.5px solid #ef4444', boxShadow: '0 0 0 3px rgba(239,68,68,0.10)' } : {};

  return (
    <div className="settings-wrapper">
      <div className="page-header">
        <div className="page-header-inner">
          <div className="page-header-icon">⚙️</div>
          <div>
            <h1>إعدادات الحساب</h1>
            <p>إدارة معلوماتك الشخصية وإعدادات حسابك</p>
          </div>
        </div>
      </div>

      {msg && (
        <div style={{ maxWidth: 'var(--container-max)', width: '90%', margin: '16px auto 0' }}>
          <div className={msg.type === 'success' ? 'modal-success' : 'modal-error'}>{msg.text}</div>
        </div>
      )}

      <div className="settings-layout">
        <div className="settings-nav">
          <div className="settings-nav-card">
            <div className="settings-nav-user">
              <div className="settings-nav-avatar">{user.userName?.[0]?.toUpperCase() || '👤'}</div>
              <h3>{user.userName}</h3>
              <p>{user.email}</p>
              <span className="settings-nav-role">{roleLabel}</span>
            </div>
            <div className="settings-nav-links">
              {navItems.map(n => (
                <button
                  key={n.id}
                  className={`nav-link-item${tab === n.id ? ' active' : ''}${n.danger ? ' danger' : ''}`}
                  onClick={() => setTab(n.id)}
                >
                  <span className="n-icon">{n.icon}</span>
                  {n.label}
                </button>
              ))}
              <button className="nav-link-item danger" onClick={logout}>
                <span className="n-icon">🚪</span>
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>

        <div className="settings-content">
          {/* Profile */}
          <div className={`settings-section${tab === 'profile' ? ' active' : ''}`}>
            <div className="section-card">
              <div className="section-card-header">
                <span className="section-card-title">
                  {user.roleType === 'charity' ? '🏛️ بيانات الجمعية' : '👤 الملف الشخصي'}
                </span>
              </div>
              {user.roleType === 'charity' ? (
                <form onSubmit={saveCharityProfile}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>اسم الجمعية <span style={{ color: '#ef4444' }}>*</span></label>
                      <input
                        value={charityForm.charityName}
                        onChange={e => { setCharityForm(f => ({ ...f, charityName: e.target.value })); setProfileErrors(er => ({ ...er, charityName: '' })); }}
                        placeholder="اسم الجمعية"
                        style={inputErrStyle(profileErrors.charityName)}
                      />
                      <FieldError msg={profileErrors.charityName} />
                    </div>
                    <div className="form-group">
                      <label>البريد الإلكتروني</label>
                      <input value={user.email} disabled style={{ background: 'var(--neutral-100)', cursor: 'not-allowed' }} />
                    </div>
                    <div className="form-group">
                      <label>رقم الهاتف</label>
                      <input
                        value={profileForm.phone}
                        onChange={e => { setProfileForm(f => ({ ...f, phone: e.target.value })); setProfileErrors(er => ({ ...er, phone: '' })); }}
                        placeholder="01xxxxxxxxx"
                        style={inputErrStyle(profileErrors.phone)}
                      />
                      <FieldError msg={profileErrors.phone} />
                    </div>
                    <div className="form-group">
                      <label>نوع الحساب</label>
                      <input value="جمعية خيرية" disabled style={{ background: 'var(--neutral-100)', cursor: 'not-allowed' }} />
                    </div>
                    <div className="form-group">
                      <label>رقم الترخيص</label>
                      <input value={user.licenseNumber || 'غير متوفر'} disabled style={{ background: 'var(--neutral-100)', cursor: 'not-allowed', opacity: 0.8 }} />
                    </div>
                    <div className="form-group">
                      <label>حالة التوثيق والتوظيف</label>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: user.verify ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                        color: user.verify ? '#10b981' : '#ef4444',
                        padding: '10px 14px', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 700,
                        border: `1.5px solid ${user.verify ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: user.verify ? '#10b981' : '#ef4444' }} />
                        {user.verify ? 'موثق رسميًا ✓' : 'تحت المراجعة والتوثيق'}
                      </div>
                    </div>
                    <div className="form-group">
                      <label>تاريخ التسجيل</label>
                      <input value={user.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'} disabled style={{ background: 'var(--neutral-100)', cursor: 'not-allowed', opacity: 0.8 }} />
                    </div>
                    <div className="form-group form-full">
                      <label>العنوان</label>
                      <input
                        value={charityForm.address}
                        onChange={e => { setCharityForm(f => ({ ...f, address: e.target.value })); setProfileErrors(er => ({ ...er, address: '' })); }}
                        placeholder="مدينتك أو منطقتك"
                        style={inputErrStyle(profileErrors.address)}
                      />
                      <FieldError msg={profileErrors.address} />
                    </div>
                    <div className="form-group form-full">
                      <label>وصف الجمعية</label>
                      <textarea
                        value={charityForm.description}
                        onChange={e => { setCharityForm(f => ({ ...f, description: e.target.value })); setProfileErrors(er => ({ ...er, description: '' })); }}
                        placeholder="أدخل وصفاً موجزاً عن الجمعية وأهدافها (10-500 حرف)"
                        rows={4}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--r-md)', border: `1.5px solid ${profileErrors.description ? '#ef4444' : 'var(--neutral-200)'}`, fontSize: 14, resize: 'vertical', fontFamily: 'inherit', background: 'var(--surface)', color: 'var(--text-primary)' }}
                      />
                      <div style={{ fontSize: 11, color: 'var(--neutral-400)', textAlign: 'left', marginTop: 3 }}>{charityForm.description.length} / 500</div>
                      <FieldError msg={profileErrors.description} />
                    </div>
                  </div>
                  <div style={{ marginTop: 20 }}>
                    <button type="submit" className="btn-save" disabled={saving}>
                      {saving ? '⏳ جاري الحفظ...' : '💾 حفظ بيانات الجمعية'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={saveProfile}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>الاسم <span style={{ color: '#ef4444' }}>*</span></label>
                      <input
                        value={profileForm.userName}
                        onChange={e => { setProfileForm(f => ({ ...f, userName: e.target.value })); setProfileErrors(er => ({ ...er, userName: '' })); }}
                        placeholder="اسمك الكامل"
                        style={inputErrStyle(profileErrors.userName)}
                      />
                      <FieldError msg={profileErrors.userName} />
                    </div>
                    <div className="form-group">
                      <label>البريد الإلكتروني</label>
                      <input value={user.email} disabled style={{ background: 'var(--neutral-100)', cursor: 'not-allowed' }} />
                    </div>
                    <div className="form-group">
                      <label>رقم الهاتف</label>
                      <input
                        value={profileForm.phone}
                        onChange={e => { setProfileForm(f => ({ ...f, phone: e.target.value })); setProfileErrors(er => ({ ...er, phone: '' })); }}
                        placeholder="01xxxxxxxxx"
                        style={inputErrStyle(profileErrors.phone)}
                      />
                      <FieldError msg={profileErrors.phone} />
                    </div>
                    <div className="form-group">
                      <label>نوع الحساب</label>
                      <input value={roleLabel} disabled style={{ background: 'var(--neutral-100)', cursor: 'not-allowed' }} />
                    </div>
                    <div className="form-group">
                      <label>معرّف الحساب (ID)</label>
                      <input value={user._id || '—'} disabled style={{ background: 'var(--neutral-100)', cursor: 'not-allowed', opacity: 0.8, fontFamily: 'monospace', fontSize: 12 }} />
                    </div>
                    <div className="form-group">
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        الرقم القومي
                        <span style={{ fontSize: 10, background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '2px 7px', borderRadius: 5, fontWeight: 700 }}>سري</span>
                      </label>
                      <input value={(user as any).nationalID || 'غير مسجّل'} disabled style={{ background: 'var(--neutral-100)', cursor: 'not-allowed', opacity: 0.8, fontFamily: 'monospace', letterSpacing: 2 }} />
                    </div>
                    <div className="form-group">
                      <label>توثيق البريد الإلكتروني</label>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: user.verify ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                        color: user.verify ? '#10b981' : '#ef4444',
                        padding: '10px 14px', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 700,
                        border: `1.5px solid ${user.verify ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: user.verify ? '#10b981' : '#ef4444' }} />
                        {user.verify ? 'البريد موثق ✓' : 'البريد غير موثق'}
                      </div>
                    </div>
                    <div className="form-group">
                      <label>تاريخ الانضمام</label>
                      <input value={user.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'} disabled style={{ background: 'var(--neutral-100)', cursor: 'not-allowed', opacity: 0.8 }} />
                    </div>
                    <div className="form-group form-full">
                      <label>العنوان</label>
                      <input
                        value={profileForm.address}
                        onChange={e => { setProfileForm(f => ({ ...f, address: e.target.value })); setProfileErrors(er => ({ ...er, address: '' })); }}
                        placeholder="مدينتك أو منطقتك"
                        style={inputErrStyle(profileErrors.address)}
                      />
                      <FieldError msg={profileErrors.address} />
                    </div>
                  </div>
                  <div style={{ marginTop: 20 }}>
                    <button type="submit" className="btn-save" disabled={saving}>
                      {saving ? '⏳ جاري الحفظ...' : '💾 حفظ التغييرات'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Password */}
          <div className={`settings-section${tab === 'password' ? ' active' : ''}`}>
            <div className="section-card">
              <div className="section-card-header">
                <span className="section-card-title">🔑 تغيير كلمة المرور</span>
              </div>
              <form onSubmit={savePassword}>
                <div className="form-grid">
                  <div className="form-group form-full">
                    <label>كلمة المرور الحالية <span style={{ color: '#ef4444' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showOldPass ? 'text' : 'password'}
                        value={passForm.oldPassword}
                        onChange={e => { setPassForm(f => ({ ...f, oldPassword: e.target.value })); setPassErrors(er => ({ ...er, oldPassword: '' })); }}
                        placeholder="••••••••"
                        style={{ ...inputErrStyle(passErrors.oldPassword), paddingLeft: 38 }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPass(v => !v)}
                        style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neutral-400)', fontSize: 14, padding: 4 }}
                        title={showOldPass ? 'إخفاء' : 'إظهار'}
                      >
                        <i className={`fa-solid fa-eye${showOldPass ? '-slash' : ''}`} />
                      </button>
                    </div>
                    <FieldError msg={passErrors.oldPassword} />
                  </div>
                  <div className="form-group form-full">
                    <label>كلمة المرور الجديدة <span style={{ color: '#ef4444' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        value={passForm.newPassword}
                        onChange={e => { setPassForm(f => ({ ...f, newPassword: e.target.value })); setPassErrors(er => ({ ...er, newPassword: '' })); }}
                        placeholder="••••••••"
                        style={{ ...inputErrStyle(passErrors.newPassword), paddingLeft: 38 }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(v => !v)}
                        style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neutral-400)', fontSize: 14, padding: 4 }}
                        title={showNewPass ? 'إخفاء' : 'إظهار'}
                      >
                        <i className={`fa-solid fa-eye${showNewPass ? '-slash' : ''}`} />
                      </button>
                    </div>
                    <FieldError msg={passErrors.newPassword} />
                  </div>
                  <div className="form-group form-full">
                    <label>تأكيد كلمة المرور الجديدة <span style={{ color: '#ef4444' }}>*</span></label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showConfirmPass ? 'text' : 'password'}
                        value={passForm.confirmPassword}
                        onChange={e => { setPassForm(f => ({ ...f, confirmPassword: e.target.value })); setPassErrors(er => ({ ...er, confirmPassword: '' })); }}
                        placeholder="••••••••"
                        style={{ ...inputErrStyle(passErrors.confirmPassword), paddingLeft: 38 }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(v => !v)}
                        style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neutral-400)', fontSize: 14, padding: 4 }}
                        title={showConfirmPass ? 'إخفاء' : 'إظهار'}
                      >
                        <i className={`fa-solid fa-eye${showConfirmPass ? '-slash' : ''}`} />
                      </button>
                    </div>
                    <FieldError msg={passErrors.confirmPassword} />
                  </div>
                </div>
                <div style={{ marginTop: 20 }}>
                  <button type="submit" className="btn-save" disabled={saving}>
                    {saving ? '⏳ جاري الحفظ...' : '🔑 تغيير كلمة المرور'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Donations */}
          <div className={`settings-section${tab === 'donations' ? ' active' : ''}`}>
            <div className="section-card">
              <div className="section-card-header">
                <span className="section-card-title">📦 تبرعاتي</span>
              </div>
              {loadingData ? (
                <div className="spinner"><div className="spinner-ring" /></div>
              ) : donations.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📦</div>
                  <p>لا توجد تبرعات بعد</p>
                </div>
              ) : (
                <div className="donations-list">
                  {donations.map(d => {
                    const { label, cls } = statusLabel(d.status);
                    return (
                      <div key={d._id} className="donation-item">
                        <div className="donation-icon">👕</div>
                        <div className="donation-info">
                          <h4>{d.type} — {d.size}</h4>
                          <p>{d.quantity} قطعة | {d.condition} | {formatDate(d.createdAt)}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span className={`donation-status status-badge ${cls}`}>{label}</span>
                          {d.status === 'delivered' && (
                            <button
                              className="btn-sm"
                              style={{ fontSize: 12, padding: '5px 12px' }}
                              onClick={() => setRatingDonation(d)}
                              title="قيّم التبرع"
                            >
                              ⭐ تقييم
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Notifications */}
          <div className={`settings-section${tab === 'notifications' ? ' active' : ''}`}>
            <div className="section-card">
              <div className="section-card-header">
                <span className="section-card-title">🔔 الإشعارات</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {notifications.filter(n => n.status === 'unread').length > 0 && (
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#0ec97f', background: 'rgba(14,201,127,0.1)', padding: '3px 9px', borderRadius: 6, border: '1px solid rgba(14,201,127,0.2)' }}>
                      {notifications.filter(n => n.status === 'unread').length} غير مقروء
                    </span>
                  )}
                  {notifications.filter(n => n.status === 'unread').length > 0 && (
                    <button
                      style={{ fontSize: 12, color: 'var(--neutral-500)', background: 'none', border: '1px solid var(--neutral-200)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}
                      onClick={async () => {
                        const unread = notifications.filter(n => n.status === 'unread');
                        await Promise.allSettled(unread.map(n => notificationApi.markRead(n._id)));
                        setNotifications(prev => prev.map(n => ({ ...n, status: 'read' as const })));
                      }}
                    >✓ تحديد الكل كمقروء</button>
                  )}
                </div>
              </div>
              {loadingData ? (
                <div className="spinner"><div className="spinner-ring" /></div>
              ) : notifications.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🔔</div>
                  <p>لا توجد إشعارات</p>
                </div>
              ) : (
                <div className="notif-list">
                  {notifications.map(n => (
                    <div
                      key={n._id}
                      className={`notif-item${n.status === 'unread' ? ' unread' : ''}`}
                      style={{ display: 'flex', alignItems: 'flex-start', gap: 10, justifyContent: 'space-between' }}
                      onClick={() => n.status === 'unread' && markNotifRead(n._id)}
                    >
                      <div className={`notif-dot${n.status === 'read' ? ' read' : ''}`} style={{ marginTop: 6, flexShrink: 0 }} />
                      <div className="notif-text" style={{ flex: 1 }}>
                        {(n as any).title && <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 2 }}>{(n as any).title}</div>}
                        <h4 style={{ margin: 0, fontSize: 13 }}>{(n as any).content || n.message || '—'}</h4>
                        <span className="notif-time">{new Date(n.createdAt).toLocaleString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                      </div>
                      <button
                        title="حذف"
                        onClick={e => { e.stopPropagation(); notificationApi.delete(n._id).then(() => setNotifications(prev => prev.filter(x => x._id !== n._id))).catch(() => {}); }}
                        style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 7, border: '1px solid var(--neutral-200)', background: 'none', cursor: 'pointer', color: 'var(--neutral-400)', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}
                      >
                        <i className="fa-solid fa-xmark" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className={`settings-section${tab === 'danger' ? ' active' : ''}`}>
            <div className="danger-zone-wrapper">
              {/* تسجيل الخروج */}
              <div className="danger-card danger-card--logout">
                <div className="danger-card-icon">🚪</div>
                <div className="danger-card-body">
                  <h3>تسجيل الخروج</h3>
                  <p>سيتم تسجيل خروجك من الحساب. يمكنك الدخول مجدداً في أي وقت.</p>
                </div>
                <button className="btn-danger btn-danger--soft" onClick={logout}>
                  تسجيل الخروج
                </button>
              </div>

              {/* حذف الحساب */}
              <div className="danger-card danger-card--delete">
                <div className="danger-card-icon">🗑️</div>
                <div className="danger-card-body">
                  <h3>⚠️ حذف الحساب نهائيًا</h3>
                  <p>هذا الإجراء <strong>لا يمكن التراجع عنه</strong>. سيتم حذف جميع بياناتك وتبرعاتك بشكل نهائي ودائم.</p>
                </div>
                <button className="btn-danger" onClick={deleteAccount}>
                  حذف حسابي نهائيًا
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {ratingDonation && (
        <RatingModal
          donationId={ratingDonation._id}
          donationType={ratingDonation.type}
          charityName={
            typeof ratingDonation.charityId === 'object'
              ? ratingDonation.charityId.charityName
              : undefined
          }
          onClose={() => setRatingDonation(null)}
          onSuccess={() => {
            setRatingDonation(null);
            showMsg('success', 'شكرًا! تم إرسال تقييمك بنجاح ✨');
          }}
        />
      )}
    </div>
  );
}