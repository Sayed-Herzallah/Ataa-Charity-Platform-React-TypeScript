import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../services';
import ForgotPasswordModal from '../features/auth/ForgotPasswordModal';
import { getRedirectByRole } from '../utils/getRedirectByRole';
import { translateError } from '../utils/translateError';
import '../styles/css/AuthPage.css';
import VerifyEmailPage from './Auth/VerifyEmail';
import PageLoader from '../components/ui/Pageloader';

// ─── Types ────────────────────────────────────────────────────────────────────

type RoleType    = 'user' | 'charity';
type FieldState  = 'valid' | 'invalid' | 'reset';
type ToastType   = 'error' | 'warn' | 'success';

interface ToastState { message: string; type: ToastType; }
interface ToastProps { toast: ToastState | null; onClose: () => void; }
interface WelcomeScreenProps { userName: string; roleType: string; onDone: () => void; }

interface RegisterForm {
  userName:           string;
  email:              string;
  password:           string;
  confirmPassword:    string;
  phone:              string;
  address:            string;
  roleType:           RoleType | '';
  charityName:        string;
  licenseNumber:      string;
  charityDescription: string;
  nationalID:         string;
}

// ─── Validation Rules ─────────────────────────────────────────────────────────

const EMAIL_ADMIN = import.meta.env.ADMIN_EMAIL || '';

const rules = {
  userName:      { re: /^[a-zA-Z\u0621-\u064A][^#&<>"~;$^%{}]{2,29}$/, msg: 'اسم المستخدم: يبدأ بحرف، 3-30 حرف، بدون رموز خاصة',              ok: 'اسم المستخدم مقبول ✓' },
  email:         { re: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.(com|net|edu|org|io)$/, msg: 'صيغة البريد غير صحيحة — يجب أن ينتهي بـ .com أو .net أو .edu', ok: 'البريد الإلكتروني صالح ✓' },
  password:      { re: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/, msg: 'يجب أن تحتوي على: حرف كبير، حرف صغير، رقم، و8 أحرف على الأقل', ok: 'كلمة المرور قوية ✓' },
  phone:         { re: /^(002|\+2)?01[0125][0-9]{8}$/, msg: 'رقم غير صالح — أدخل رقماً مصرياً صحيحاً (مثال: 01012345678)',                  ok: 'رقم الهاتف صالح ✓' },
  address:       { fn: (v: string) => v.length >= 5 && v.length <= 100, msg: 'العنوان يجب أن يكون بين 5 و 100 حرف',                          ok: 'العنوان مقبول ✓' },
  charityName:   { fn: (v: string) => v.length >= 3,  msg: 'اسم الجمعية يجب أن يكون 3 أحرف على الأقل',                                      ok: 'اسم الجمعية مقبول ✓' },
  licenseNumber: { re: /^(?=.{6,20}$)[A-Z0-9]{2,5}[-]?[A-Z0-9]{3,10}[-]?[0-9]{2,6}$/, msg: 'رقم الترخيص غير صالح — يجب أن يكون بصيغة: AB-12345-2023', ok: 'رقم الترخيص صالح ✓' },
  nationalID:    { re: /^\d{14}$/, msg: 'الرقم القومي غير صالح — تأكد من إدخال 14 رقماً صحيحاً',                                             ok: 'الرقم القومي صالح ✓' },
};

const isValidRule = (value: string, rule: { re?: RegExp; fn?: (v: string) => boolean }, field?: string): boolean => {
  if (field === 'email' && EMAIL_ADMIN && value.toLowerCase() === EMAIL_ADMIN.toLowerCase()) return true;
  return rule.fn ? rule.fn(value) : (rule.re?.test(value) ?? false);
};

// ─── Password Strength ────────────────────────────────────────────────────────

const strengthConfigs = [
  { label: 'ضعيفة جداً', color: '#ef4444', pct: 16  },
  { label: 'ضعيفة',      color: '#f97316', pct: 33  },
  { label: 'مقبولة',     color: '#eab308', pct: 50  },
  { label: 'جيدة',       color: '#84cc16', pct: 66  },
  { label: 'قوية',       color: '#22c55e', pct: 83  },
  { label: 'قوية جداً',  color: '#16a34a', pct: 100 },
];

function getStrengthScore(pw: string): number {
  let score = 0;
  if (pw.length >= 8)           score++;
  if (pw.length >= 12)          score++;
  if (/[A-Z]/.test(pw))         score++;
  if (/[a-z]/.test(pw))         score++;
  if (/\d/.test(pw))            score++;
  if (/[^a-zA-Z0-9]/.test(pw))  score++;
  return Math.max(0, Math.min(5, score - 1));
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ toast, onClose }: ToastProps) {
  const [progress, setProgress] = useState(100);
  const duration = 4500;

  useEffect(() => {
    if (!toast?.message) return;
    setProgress(100);
    const step = 100 / (duration / 50);
    const interval = setInterval(() => {
      setProgress(p => {
        const next = p - step;
        if (next <= 0) { clearInterval(interval); return 0; }
        return next;
      });
    }, 50);
    const t = setTimeout(onClose, duration);
    return () => { clearTimeout(t); clearInterval(interval); };
  }, [toast, onClose]);

  if (!toast?.message) return null;

  const configs: Record<ToastType, { icon: string; accent: string; bg: string; textColor: string; border: string }> = {
    error:   { icon: 'fa-circle-xmark',        accent: '#ef4444', bg: '#fff5f5', textColor: '#991b1b', border: '#fecaca' },
    warn:    { icon: 'fa-triangle-exclamation', accent: '#f59e0b', bg: '#fffbeb', textColor: '#92400e', border: '#fde68a' },
    success: { icon: 'fa-circle-check',         accent: '#22c55e', bg: '#f0fdf4', textColor: '#166534', border: '#bbf7d0' },
  };
  const c = configs[toast.type];

  return (
    <div
      className="lp-toast-wrap"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
    >
      <div className="lp-toast-inner">
        <div className="lp-toast-row">
          <div
            className="lp-toast-icon-wrap"
            style={{ background: `${c.accent}20` }}
          >
            <i className={`fa-solid ${c.icon}`} style={{ color: c.accent, fontSize: '14px' }} />
          </div>
          <p className="lp-toast-msg" style={{ color: c.textColor }}>{toast.message}</p>
          <button className="lp-toast-close" onClick={onClose}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
      </div>
      <div className="lp-toast-bar-track" style={{ background: `${c.accent}25` }}>
        <div
          className="lp-toast-bar-fill"
          style={{ width: `${progress}%`, background: c.accent }}
        />
      </div>
    </div>
  );
}

// ─── Welcome Screen ───────────────────────────────────────────────────────────

function WelcomeScreen({ userName, roleType, onDone }: WelcomeScreenProps) {
  const roleLabel: Record<string, { label: string; icon: string; color: string }> = {
    user:    { label: 'متبرع',        icon: 'fa-heart',          color: '#22c55e' },
    charity: { label: 'جمعية خيرية',  icon: 'fa-building',       color: '#3ba8b4' },
    admin:   { label: 'مدير النظام',  icon: 'fa-shield-halved',  color: '#2563eb' },
  };
  const role = roleLabel[roleType] ?? roleLabel['user'];
  const greetingText = roleType === 'admin' ? 'مرحبًا بعودتك' : 'أهلاً وسهلاً';
  const subText = roleType === 'admin'
    ? 'جاهز لإدارة المنصة...'
    : roleType === 'charity'
    ? 'جاهز لإدارة جمعيتك...'
    : 'سيتم تسجيل دخولك الآن...';

  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    document.body.classList.add('lp-hiding-layout');
    
    // Switch to premium fullscreen 3-dot PageLoader after 1.0s of elegant welcome screen card
    const loaderTimer = setTimeout(() => {
      setShowLoader(true);
    }, 1000);

    // End welcome screen and call redirect after 1.0s (card) + 2.0s (loader) = 3.0s total
    const doneTimer = setTimeout(() => {
      document.body.classList.remove('lp-hiding-layout');
      onDone();
    }, 3000);

    return () => {
      document.body.classList.remove('lp-hiding-layout');
      clearTimeout(loaderTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  if (showLoader) {
    return <PageLoader text="جاري الانتقال بأمان..." />;
  }

  return (
    <div className="lp-welcome-screen">
      <div className="lp-welcome-avatar">
        <i className={`fa-solid ${role.icon}`} style={{ color: role.color }} />
        <div className="lp-welcome-pulse" style={{ background: `${role.color}30` }} />
      </div>
      <div className="lp-welcome-text">
        <span className="lp-welcome-greeting">{greetingText}</span>
        <h2 className="lp-welcome-name">{userName || 'بك'} 👋</h2>
      </div>
      <div
        className="lp-welcome-role-chip"
        style={{ borderColor: `${role.color}50`, background: `${role.color}10` }}
      >
        <i className={`fa-solid ${role.icon}`} style={{ color: role.color }} />
        <span style={{ color: role.color }}>{role.label}</span>
      </div>
      <p className="lp-welcome-msg">{subText}</p>
      <div className="lp-welcome-bar-track">
        <div className="lp-welcome-bar-fill" style={{ background: role.color }} />
      </div>
    </div>
  );
}


// ─── Shared UI Atoms ──────────────────────────────────────────────────────────

function EyeBtn({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button type="button" className="lp-eye-btn" onClick={onToggle}>
      <i className={`fa-solid fa-eye${show ? '-slash' : ''}`} />
    </button>
  );
}

function FieldHint({ state, validMsg = '', invalidMsg = '' }: { state: FieldState | null; validMsg?: string; invalidMsg?: string }) {
  if (!state || state === 'reset') return <div className="lp-field-hint" />;
  if (state === 'valid')   return <div className="lp-field-hint lp-hint-success"><i className="fa-solid fa-circle-check" /> {validMsg}</div>;
  return <div className="lp-field-hint lp-hint-error"><i className="fa-solid fa-circle-exclamation" /> {invalidMsg}</div>;
}

function InputGroup({
  type = 'text', id, placeholder, value, onChange, onBlur,
  fieldIcon, fieldState, showEye, eyeShow, onEyeToggle,
  autoComplete, maxLength, inputMode, required,
}: {
  type?: string; id: string; placeholder: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  fieldIcon: string; fieldState: FieldState | null;
  showEye?: boolean; eyeShow?: boolean; onEyeToggle?: () => void;
  autoComplete?: string; maxLength?: number;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  required?: boolean;
}) {
  const stateClass = fieldState === 'valid' ? ' lp-input-valid' : fieldState === 'invalid' ? ' lp-input-invalid' : '';
  return (
    <div className="lp-input-group">
      <input
        type={showEye ? (eyeShow ? 'text' : 'password') : type}
        id={id} placeholder={placeholder} value={value}
        onChange={onChange} onBlur={onBlur}
        required={required} autoComplete={autoComplete}
        maxLength={maxLength} inputMode={inputMode}
        className={`lp-field-input${stateClass}${showEye ? ' lp-has-eye' : ''}`}
      />
      <i className={`${fieldIcon} lp-field-icon`} />
      {showEye && onEyeToggle && <EyeBtn show={!!eyeShow} onToggle={onEyeToggle} />}
      <i className={`fa-solid ${fieldState === 'invalid' ? 'fa-circle-xmark' : 'fa-circle-check'} lp-status-icon`} />
    </div>
  );
}

// ─── Step Progress ────────────────────────────────────────────────────────────

const stepLabels = ['نوع الحساب', 'بياناتك', 'بيانات التواصل'];

function StepProgress({ currentStep, totalSteps = 3 }: { currentStep: number; totalSteps?: number }) {
  return (
    <div className="lp-step-progress">
      <div className="lp-step-dots">
        {Array.from({ length: totalSteps }, (_, i) => {
          const n = i + 1;
          return <div key={n} className={`lp-step-dot${n === currentStep ? ' active' : n < currentStep ? ' done' : ''}`} />;
        })}
      </div>
      <div className="lp-step-labels">
        {stepLabels.map((label, i) => {
          const n = i + 1;
          return (
            <span key={n} className={`lp-step-label${n === currentStep ? ' active' : n < currentStep ? ' done' : ''}`}>
              {label}
            </span>
          );
        })}
      </div>
      <div className="lp-progress-track">
        <div className="lp-progress-fill" style={{ width: `${(currentStep / totalSteps) * 100}%` }} />
      </div>
    </div>
  );
}

// ─── Role Selector Cards ──────────────────────────────────────────────────────

const roleCards = [
  { value: 'user'    as RoleType, label: 'متبرع',        sublabel: 'Donor',   icon: 'fa-heart',            color: '#22c55e', gradient: 'linear-gradient(135deg,#22c55e,#16a34a)', features: ['تقديم تبرعات', 'متابعة التبرعات', 'الوصول للجمعيات'] },
  { value: 'charity' as RoleType, label: 'جمعية خيرية',  sublabel: 'Charity', icon: 'fa-building-columns', color: '#3ba8b4', gradient: 'linear-gradient(135deg,#267880,#3ba8b4)', features: ['إدارة التبرعات', 'لوحة تحكم', 'تحتاج موافقة إدارة'] },
];

function RoleSelector({ selected, onSelect }: { selected: RoleType | ''; onSelect: (r: RoleType) => void }) {
  return (
    <div className="lp-role-selector">
      <p className="lp-role-prompt">اختر نوع حسابك للمتابعة</p>
      <div className="lp-role-cards">
        {roleCards.map(card => {
          const isSel = selected === card.value;
          return (
            <button
              key={card.value} type="button"
              className={`lp-role-card${isSel ? ' lp-role-card--selected' : ''}`}
              onClick={() => onSelect(card.value)}
              style={{ '--card-color': card.color, '--card-gradient': card.gradient } as React.CSSProperties}
            >
              {isSel && <div className="lp-role-check"><i className="fa-solid fa-check" /></div>}
              <div className="lp-role-icon-wrap"><i className={`fa-solid ${card.icon} lp-role-icon`} /></div>
              <div className="lp-role-labels">
                <span className="lp-role-label-ar">{card.label}</span>
                <span className="lp-role-label-en">{card.sublabel}</span>
              </div>
              <ul className="lp-role-features">
                {card.features.map((f, i) => (
                  <li key={i}><i className="fa-solid fa-circle-check lp-feat-icon" /><span>{f}</span></li>
                ))}
              </ul>
              <div className="lp-role-bar" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Login Section ────────────────────────────────────────────────────────────

function LoginSection({
  onForgot,
  onToast,
  setIsTransitioning,
}: {
  onForgot: () => void;
  onToast: (msg: string, type?: ToastType) => void;
  setIsTransitioning: (v: boolean) => void;
}) {
  const { login, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [emailState, setEmailState] = useState<FieldState | null>(null);
  const [pwState, setPwState]       = useState<FieldState | null>(null);
  const [loading, setLoading]       = useState(false);
  const [welcome, setWelcome]       = useState<{ name: string; role: string } | null>(null);
  const [pendingRedirect, setPendingRedirect] = useState('');

  const validateEmailFn = (v: string) => isValidRule(v, rules.email, 'email');
  const validatePw      = (v: string) => isValidRule(v, rules.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailOk = validateEmailFn(email.trim());
    const pwOk    = validatePw(password);
    setEmailState(emailOk ? 'valid' : 'invalid');
    setPwState(pwOk ? 'valid' : 'invalid');
    if (!emailOk) { onToast(rules.email.msg, 'error'); return; }
    if (!pwOk)    { onToast(rules.password.msg, 'error'); return; }
    
    setLoading(true);
    try {
      const trimmedEmail = email.trim().toLowerCase();
      const adminEmail = import.meta.env.ADMIN_EMAIL?.trim().toLowerCase();
      const adminPassword = import.meta.env.ADMIN_PASSWORD;

      // 1. Pre-login secure checks: if the email matches the ADMIN_EMAIL, the password must match the ADMIN_PASSWORD
      if (adminEmail && trimmedEmail === adminEmail) {
        if (password !== adminPassword) {
          throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        }
      }

      const res = await authApi.login({ email: email.trim(), password });
      if (!res.tokens?.accessToken) throw new Error('بيانات التوكن غير مكتملة');
      
      const loggedUser = await login(res.tokens.accessToken, res.tokens.refreshToken, res.user);
      const role       = loggedUser?.roleType || res.user?.roleType || 'user';

      // 2. Post-login secure checks: double check if the user role is admin
      if (role === 'admin' || trimmedEmail === adminEmail) {
        if (!adminEmail || trimmedEmail !== adminEmail || password !== adminPassword) {
          // Force logout and clean up tokens to block unauthorized logins
          logout();
          throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        }
      }

      const name       = loggedUser?.userName || res.user?.userName || loggedUser?.charityName || '';
      const redirect   = getRedirectByRole(role);
      setPendingRedirect(redirect);
      setWelcome({ name, role });
      setIsTransitioning(true);
    } catch (err: unknown) {
      const errMsg = translateError(err);
      if (errMsg.includes('قيد المراجعة')) {
        onToast(errMsg, 'warn');
      } else {
        onToast(errMsg, 'error');
      }
    } finally { setLoading(false); }
  };

  // ✅ رسالة الترحيب موجودة هنا فقط بعد تسجيل الدخول
  if (welcome) {
    return (
      <WelcomeScreen
        userName={welcome.name}
        roleType={welcome.role}
        onDone={() => setLocation(pendingRedirect)}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ width: '100%' }}>
      <h2 className="lp-sec-title">تسجيل الدخول</h2>
      <p className="lp-sec-sub">مرحباً بعودتك! سجل دخولك للمتابعة</p>

      <InputGroup
        type="email" id="login-email" placeholder="البريد الإلكتروني"
        value={email} onChange={e => { setEmail(e.target.value); setEmailState(null); }}
        onBlur={() => setEmailState(validateEmailFn(email.trim()) ? 'valid' : 'invalid')}
        fieldIcon="fa-solid fa-envelope" fieldState={emailState}
        autoComplete="email" required
      />
      <FieldHint state={emailState} validMsg={rules.email.ok} invalidMsg={rules.email.msg} />

      <InputGroup
        id="login-password" placeholder="كلمة المرور"
        value={password} onChange={e => { setPassword(e.target.value); setPwState(null); }}
        onBlur={() => setPwState(validatePw(password) ? 'valid' : 'invalid')}
        fieldIcon="fa-solid fa-lock" fieldState={pwState}
        showEye eyeShow={showPw} onEyeToggle={() => setShowPw(v => !v)}
        autoComplete="current-password" required
      />
      <FieldHint state={pwState} validMsg={rules.password.ok} invalidMsg={rules.password.msg} />

      <a href="#" className="lp-forgot-password" onClick={e => { e.preventDefault(); onForgot(); }}>
        نسيت كلمة المرور؟
      </a>

      <button type="submit" className="lp-btn-primary lp-full-width" disabled={loading}>
        {loading
          ? <><i className="fa-solid fa-spinner fa-spin" /> جاري الدخول...</>
          : <><i className="fa-solid fa-right-to-bracket" /> تسجيل الدخول</>}
      </button>

      <p className="lp-social-text">أو سجل الدخول عبر</p>
      <div className="lp-social-icons">
        <a href="#" className="lp-social-icon" onClick={e => e.preventDefault()}><i className="fa-brands fa-google" /></a>
        <a href="#" className="lp-social-icon" onClick={e => e.preventDefault()}><i className="fa-brands fa-facebook-f" /></a>
        <a href="#" className="lp-social-icon" onClick={e => e.preventDefault()}><i className="fa-brands fa-twitter" /></a>
      </div>
    </form>
  );
}

// ─── Register Section ─────────────────────────────────────────────────────────
// ✅ الـ Fix الرئيسي: form و currentStep بتيجي من الـ parent (AuthPage)
//    عشان لو حصل re-render في الـ parent مش بيضيع الـ state

interface RegisterSectionProps {
  onToast:      (msg: string, type?: ToastType) => void;
  form:         RegisterForm;
  setForm:      React.Dispatch<React.SetStateAction<RegisterForm>>;
  currentStep:  number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}

function RegisterSection({ onToast, form, setForm, currentStep, setCurrentStep }: RegisterSectionProps) {
  const [, setLocation]       = useLocation();
  const { setPendingVerify }   = useAuth();
  const [fieldStates, setFieldStates] = useState<Record<string, FieldState | null>>({});
  const [showPw, setShowPw]           = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [hintMsg, setHintMsg]         = useState<Record<string, string>>({});
  const [loading, setLoading]         = useState(false);

  const strengthScore  = getStrengthScore(form.password);
  const strengthConfig = strengthConfigs[strengthScore];

  // ✅ setField لا تعتمد على form مباشرة — بتستخدم functional update
  const setField = useCallback(
    (k: keyof RegisterForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm(f => ({ ...f, [k]: e.target.value }));
      setFieldStates(p => ({ ...p, [k]: null }));
    },
    [setForm],
  );

  const setFieldState = useCallback((id: string, state: FieldState, customMsg = '') => {
    setFieldStates(p => ({ ...p, [id]: state }));
    if (customMsg) setHintMsg(p => ({ ...p, [id]: customMsg }));
  }, []);

  const validate = (id: string, value: string, ruleKey: keyof typeof rules): boolean => {
    const ok = isValidRule(value, rules[ruleKey]);
    setFieldState(id, ok ? 'valid' : 'invalid');
    return ok;
  };

  // ─── Step Validators ──────────────────────────────────────────────────────

  const validateStep1 = () => {
    if (!form.roleType) { onToast('اختر نوع الحساب أولاً', 'error'); return false; }
    return true;
  };

  const validateStep2 = () => {
    let ok = true;
    const errors: string[] = [];
    if (form.roleType !== 'charity') {
      if (!validate('userName', form.userName.trim(), 'userName')) { ok = false; errors.push(rules.userName.msg); }
    }
    if (!validate('email', form.email.trim(), 'email'))       { ok = false; errors.push(rules.email.msg); }
    if (!validate('password', form.password, 'password'))     { ok = false; errors.push(rules.password.msg); }
    const pwMatch = form.password === form.confirmPassword && !!form.confirmPassword;
    if (!pwMatch) {
      setFieldState('confirmPassword', 'invalid', 'كلمتا المرور غير متطابقتين');
      ok = false; errors.push('كلمتا المرور غير متطابقتين');
    } else {
      setFieldState('confirmPassword', 'valid', 'كلمتا المرور متطابقتان ✓');
    }
    if (!ok) onToast(errors[0], 'error');
    return ok;
  };

  const validateStep3 = () => {
    let ok = true;
    const errors: string[] = [];
    if (!validate('phone',   form.phone.trim(),   'phone'))   { ok = false; errors.push(rules.phone.msg); }
    if (!validate('address', form.address.trim(), 'address')) { ok = false; errors.push(rules.address.msg); }
    if (form.roleType === 'charity') {
      if (!validate('charityName',   form.charityName.trim(), 'charityName'))                         { ok = false; errors.push(rules.charityName.msg); }
      if (!validate('licenseNumber', form.licenseNumber.trim().toUpperCase(), 'licenseNumber'))       { ok = false; errors.push(rules.licenseNumber.msg); }
    }
    if (!ok) onToast(errors[0], 'error');
    return ok;
  };

  // ─── Submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;
    setLoading(true);
    try {
      const base = {
        email:           form.email.trim(),
        password:        form.password,
        confirmPassword: form.confirmPassword,
        phone:           form.phone.trim(),
        address:         form.address.trim(),
      };

      if (form.roleType === 'charity') {
        const charityDesc = form.charityDescription.trim();
        await authApi.register({
          ...base,
          charityName:   form.charityName.trim(),
          roleType:      'charity',
          licenseNumber: form.licenseNumber.trim().toUpperCase(),
          ...(charityDesc ? { charityDescription: charityDesc } : {}),
        });
        setPendingVerify({ email: form.email.trim(), name: form.charityName.trim(), role: 'charity' });
      } else {
        await authApi.register({ ...base, userName: form.userName.trim(), roleType: 'user' });
        setPendingVerify({ email: form.email.trim(), name: form.userName.trim(), role: 'user' });
      }
      setLocation('/verify-email');
    } catch (err: unknown) {
      onToast(translateError(err), 'error');
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <h2 className="lp-sec-title">إنشاء حساب جديد</h2>
      <p className="lp-sec-sub">انضم إلينا وابدأ رحلة العطاء</p>
      <StepProgress currentStep={currentStep} />

      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <div className="lp-wizard-steps">

          {/* ── Step 1: Role ── */}
          {currentStep === 1 && (
            <div className="lp-wizard-step active">
              <RoleSelector
                selected={form.roleType}
                onSelect={role => {
                  setForm(f => ({
                    ...f, roleType: role,
                    userName: '', charityName: '', licenseNumber: '', charityDescription: '', nationalID: '',
                  }));
                  setFieldStates({});
                }}
              />
              <button
                type="button" className="lp-btn-gold lp-full-width"
                onClick={() => { if (validateStep1()) setCurrentStep(2); }}
                style={{ marginTop: '14px' }}
              >
                التالي <i className="fa-solid fa-arrow-left" />
              </button>
            </div>
          )}

          {/* ── Step 2: Basic Info ── */}
          {currentStep === 2 && (
            <div className="lp-wizard-step active">
              {form.roleType && (() => {
                const card = roleCards.find(c => c.value === form.roleType)!;
                return (
                  <div
                    className="lp-selected-role-badge"
                    style={{ background: `${card.color}12`, borderColor: `${card.color}40` }}
                  >
                    <i className={`fa-solid ${card.icon}`} style={{ color: card.color }} />
                    <span style={{ color: card.color, fontWeight: 700 }}>{card.label}</span>
                    <button type="button" onClick={() => setCurrentStep(1)} className="lp-change-role-btn">تغيير</button>
                  </div>
                );
              })()}

              {form.roleType !== 'charity' && (
                <>
                  <InputGroup
                    id="reg-username" placeholder="اسم المستخدم"
                    value={form.userName} onChange={setField('userName')}
                    onBlur={() => validate('userName', form.userName.trim(), 'userName')}
                    fieldIcon="fa-solid fa-user" fieldState={fieldStates['userName'] ?? null}
                    autoComplete="username" required
                  />
                  <FieldHint state={fieldStates['userName'] ?? null} validMsg={rules.userName.ok} invalidMsg={rules.userName.msg} />
                </>
              )}

              <InputGroup
                type="email" id="reg-email" placeholder="البريد الإلكتروني"
                value={form.email} onChange={setField('email')}
                onBlur={() => validate('email', form.email.trim(), 'email')}
                fieldIcon="fa-solid fa-envelope" fieldState={fieldStates['email'] ?? null}
                autoComplete="email" required
              />
              <FieldHint state={fieldStates['email'] ?? null} validMsg={rules.email.ok} invalidMsg={rules.email.msg} />

              <InputGroup
                id="reg-password" placeholder="كلمة المرور"
                value={form.password} onChange={e => setField('password')(e)}
                onBlur={() => validate('password', form.password, 'password')}
                fieldIcon="fa-solid fa-lock" fieldState={fieldStates['password'] ?? null}
                showEye eyeShow={showPw} onEyeToggle={() => setShowPw(v => !v)}
                autoComplete="new-password" required
              />
              {form.password && (
                <div className="lp-password-strength">
                  <div className="lp-strength-track">
                    <div className="lp-strength-fill" style={{ width: `${strengthConfig.pct}%`, background: strengthConfig.color }} />
                  </div>
                  <div className="lp-strength-text" style={{ color: strengthConfig.color }}>
                    قوة كلمة المرور: {strengthConfig.label}
                  </div>
                </div>
              )}
              <FieldHint state={fieldStates['password'] ?? null} validMsg={rules.password.ok} invalidMsg={rules.password.msg} />

              <InputGroup
                id="reg-confirmPassword" placeholder="تأكيد كلمة المرور"
                value={form.confirmPassword} onChange={setField('confirmPassword')}
                onBlur={() => {
                  if (!form.confirmPassword) { setFieldState('confirmPassword', 'reset'); return; }
                  if (form.password === form.confirmPassword) setFieldState('confirmPassword', 'valid', 'كلمتا المرور متطابقتان ✓');
                  else setFieldState('confirmPassword', 'invalid', 'كلمتا المرور غير متطابقتين');
                }}
                fieldIcon="fa-solid fa-lock" fieldState={fieldStates['confirmPassword'] ?? null}
                showEye eyeShow={showConfirm} onEyeToggle={() => setShowConfirm(v => !v)}
                autoComplete="new-password" required
              />
              <FieldHint
                state={fieldStates['confirmPassword'] ?? null}
                validMsg={hintMsg['confirmPassword']  || 'كلمتا المرور متطابقتان ✓'}
                invalidMsg={hintMsg['confirmPassword'] || 'كلمتا المرور غير متطابقتين'}
              />

              <div className="lp-wizard-nav">
                <button type="button" className="lp-btn-outline" onClick={() => setCurrentStep(1)}>
                  <i className="fa-solid fa-arrow-right" /> السابق
                </button>
                <button type="button" className="lp-btn-gold" onClick={() => { if (validateStep2()) setCurrentStep(3); }}>
                  التالي <i className="fa-solid fa-arrow-left" />
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: Contact + Role-Specific ── */}
          {currentStep === 3 && (
            <div className="lp-wizard-step active">
              <InputGroup
                type="tel" id="reg-phone" placeholder="رقم الهاتف (مثال: 01012345678)"
                value={form.phone} onChange={setField('phone')}
                onBlur={() => validate('phone', form.phone.trim(), 'phone')}
                fieldIcon="fa-solid fa-phone" fieldState={fieldStates['phone'] ?? null}
                autoComplete="tel" required
              />
              <FieldHint state={fieldStates['phone'] ?? null} validMsg={rules.phone.ok} invalidMsg={rules.phone.msg} />

              <InputGroup
                id="reg-address" placeholder="العنوان (المدينة والمنطقة)"
                value={form.address} onChange={setField('address')}
                onBlur={() => validate('address', form.address.trim(), 'address')}
                fieldIcon="fa-solid fa-location-dot" fieldState={fieldStates['address'] ?? null}
                autoComplete="street-address" required
              />
              <FieldHint state={fieldStates['address'] ?? null} validMsg={rules.address.ok} invalidMsg={rules.address.msg} />

              {form.roleType === 'charity' && (
                <div className="lp-conditional-field lp-show">
                  <div className="lp-section-divider"><span>بيانات الجمعية</span></div>
                  <InputGroup
                    id="reg-charityName" placeholder="اسم الجمعية"
                    value={form.charityName} onChange={setField('charityName')}
                    onBlur={() => validate('charityName', form.charityName.trim(), 'charityName')}
                    fieldIcon="fa-solid fa-building-columns" fieldState={fieldStates['charityName'] ?? null}
                  />
                  <FieldHint state={fieldStates['charityName'] ?? null} validMsg={rules.charityName.ok} invalidMsg={rules.charityName.msg} />
                  <InputGroup
                    id="reg-licenseNumber" placeholder="رقم الترخيص (مثال: AB-12345-2023)"
                    value={form.licenseNumber} onChange={setField('licenseNumber')}
                    onBlur={() => validate('licenseNumber', form.licenseNumber.trim().toUpperCase(), 'licenseNumber')}
                    fieldIcon="fa-solid fa-id-card" fieldState={fieldStates['licenseNumber'] ?? null}
                  />
                  <FieldHint state={fieldStates['licenseNumber'] ?? null} validMsg={rules.licenseNumber.ok} invalidMsg={rules.licenseNumber.msg} />
                  <div className="lp-input-group">
                    <input
                      type="text" placeholder="وصف الجمعية (اختياري)"
                      value={form.charityDescription}
                      onChange={e => setForm(f => ({ ...f, charityDescription: e.target.value }))}
                      className="lp-field-input"
                    />
                    <i className="fa-solid fa-align-left lp-field-icon" />
                  </div>
                </div>
              )}

              {form.roleType === 'user' && (
                <div className="lp-user-ready-msg">
                  <i className="fa-solid fa-circle-check" />
                  <span>كل شيء جاهز! اضغط سجل الآن للإنهاء</span>
                </div>
              )}

              <div className="lp-wizard-nav">
                <button type="button" className="lp-btn-outline" onClick={() => setCurrentStep(2)}>
                  <i className="fa-solid fa-arrow-right" /> السابق
                </button>
                <button type="submit" className="lp-btn-gold" disabled={loading}>
                  {loading
                    ? <><i className="fa-solid fa-spinner fa-spin" /> جاري التسجيل...</>
                    : <><i className="fa-solid fa-user-plus" /> سجل الآن</>}
                </button>
              </div>
            </div>
          )}

        </div>
      </form>
    </>
  );
}

// ─── ROOT PAGE ────────────────────────────────────────────────────────────────

const INITIAL_FORM: RegisterForm = {
  userName: '', email: '', password: '', confirmPassword: '',
  phone: '', address: '', roleType: '',
  charityName: '', licenseNumber: '', charityDescription: '', nationalID: '',
};

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const {pendingVerify} = useAuth();

const initialMode = (): 'login' | 'signup' => {
  const params = new URLSearchParams(window.location.search);
  return params.get('mode') === 'login' ? 'signup' : 'login';
};
  const [mode, setMode]         = useState<'login' | 'signup'>(initialMode);
  const [showForgot, setShowForgot] = useState(false);
  const [toast, setToast]           = useState<ToastState | null>(null);

  // ✅ الـ Fix: form و currentStep رُفعوا هنا في الـ parent
  // بالتالي Toast re-render مش بيأثر عليهم
  const [registerForm, setRegisterForm]     = useState<RegisterForm>(INITIAL_FORM);
  const [registerStep, setRegisterStep]     = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const showToast  = useCallback((msg: string, type: ToastType = 'error') => setToast({ message: msg, type }), []);
  const closeToast = useCallback(() => setToast(null), []);
  const isSignup   = mode === 'signup' && !showForgot;

  // ✅ لما يتبدل الـ mode لـ login أو signup، نرجع للـ step 1
  const handleSetMode = useCallback((newMode: 'login' | 'signup') => {
    setMode(newMode);
    if (newMode === 'signup') {
      setRegisterStep(1);
    }
  }, []);
    if (pendingVerify) {
    return (
      <div className="lp-body">
        <button className="lp-home-btn" onClick={() => setLocation('/')}>
          <i className="fa-solid fa-house" />
          <span>الرئيسية</span>
        </button>
        <VerifyEmailPage />  {/* ✅ صفحة OTP */}
      </div>
    );
  }

  return (
    <div className="lp-body">
      <Toast toast={toast} onClose={closeToast} />

      {!isTransitioning && (
        <button className="lp-home-btn" onClick={() => setLocation('/')}>
          <i className="fa-solid fa-house" />
          <span className="lp-home-btn-text">الرئيسية</span>
        </button>
      )}

      <div className={`lp-container${isSignup ? ' active' : ''}`}>
        <div className="lp-forms-container">

          {/* ── Login Form ── */}
          <div className="lp-form-wrapper lp-login-form">
            {showForgot
              ? <ForgotPasswordModal
                  onClose={() => setShowForgot(false)}
                  onSwitchToLogin={() => { setShowForgot(false); handleSetMode('login'); }}
                />
              : <LoginSection
                  onForgot={() => setShowForgot(true)}
                  onToast={showToast}
                  setIsTransitioning={setIsTransitioning}
                />
            }
          </div>

          {/* ── Register Form ── */}
          <div className="lp-form-wrapper lp-register-form">
            <RegisterSection
              onToast={showToast}
              form={registerForm}
              setForm={setRegisterForm}
              currentStep={registerStep}
              setCurrentStep={setRegisterStep}
            />
          </div>

        </div>

        {/* ── Side Panel ── */}
        <div className="lp-side-panel">
          <div className="lp-panel-content lp-panel-login-mode">
            <h1>مرحباً بعودتك!</h1>
            <p>ليس لديك حساب بعد؟<br />انضم إلينا اليوم لبدء رحلة العطاء.</p>
            <button className="lp-ghost-btn" onClick={() => handleSetMode('signup')}>تسجيل الدخول</button>
          </div>
          <div className="lp-panel-content lp-panel-register-mode">
            <h1>أهلاً بك في عطاء!</h1>
            <p>لديك حساب بالفعل؟<br />سجل دخولك للمتابعة.</p>
            <button className="lp-ghost-btn" onClick={() => handleSetMode('login')}> إنشاء الحساب</button>
          </div>
        </div>

      </div>
    </div>
  );
}