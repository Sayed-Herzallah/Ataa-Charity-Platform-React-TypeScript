import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import '../../styles/css/donationForm.css';
import { donorApi } from './../../services/endpoints/donations';

// ─── Types ────────────────────────────────────────────────────────────────────
type FormState = {
  type: string;
  size: string;
  quantity: number;
  condition: string;
  notes: string;
};

type Action =
  | { type: 'set'; key: keyof FormState; value: string | number }
  | { type: 'reset' };

type ImageItem = { id: string; file: File; url: string };

interface DonationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_IMAGES = 5;
const MAX_FILE_MB = 5;

const DONATION_TYPES = [
  { value: 'رجالي', label: 'رجالي', icon: 'ti-shirt',    sub: 'ملابس، قمصان، بدل، إلخ' },
  { value: 'حريمي', label: 'حريمي', icon: 'ti-hanger',   sub: 'فساتين، ملابس حريمي، إلخ' },
  { value: 'أطفال', label: 'أطفال', icon: 'ti-mood-kid', sub: 'ملابس أطفال وحديثي الولادة' },
];

// ✅ مطابق تماماً لما يقبله الباك إند — لا يوجد "مقاس حر"
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL'];

// ✅ القيم مطابقة تماماً لما يقبله الباك إند: جديدة، ممتازة، جيدة، مقبولة
const CONDITIONS = [
  { value: 'جديدة',  label: 'جديد',  desc: 'ببطاقة الأسعار أو في العبوة الأصلية ولم تُستعمل قط' },
  { value: 'ممتازة', label: 'ممتاز', desc: 'شبه جديدة تماماً، استعملت مرات معدودة ولا يوجد بها عيوب' },
  { value: 'جيدة',   label: 'جيد',   desc: 'بحالة جيدة جداً، مغسولة ومكوية وخالية من التمزق أو التلف' },
  { value: 'مقبولة', label: 'مقبول', desc: 'صالحة للاستخدام وبحالة مقبولة ولكن تظهر عليها آثار الاستعمال' },
];

// ✅ للتحقق قبل الإرسال — يجب أن تتطابق مع قائمة الباك إند
const VALID_TYPES      = ['رجالي', 'حريمي', 'أطفال'] as const;
const VALID_SIZES      = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL'] as const;
const VALID_CONDITIONS = ['جديدة', 'ممتازة', 'جيدة', 'مقبولة'] as const;

const INITIAL_FORM: FormState = {
  type: '',
  size: '',
  quantity: 1,
  condition: '',
  notes: '',
};

// ─── Reducer ──────────────────────────────────────────────────────────────────
function formReducer(state: FormState, action: Action): FormState {
  switch (action.type) {
    case 'set':
      return { ...state, [action.key]: action.value } as FormState;
    case 'reset':
      return INITIAL_FORM;
    default:
      return state;
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DonationForm({ onSuccess, onCancel }: DonationFormProps): JSX.Element {
  const [form, dispatch]           = useReducer(formReducer, INITIAL_FORM);
  const [images, setImages]        = useState<ImageItem[]>([]);
  const [dragOver, setDragOver]    = useState(false);
  const [touched, setTouched]      = useState<Record<string, boolean>>({});
  const [globalError, setGlobalError] = useState<string>('');
  const [loading, setLoading]      = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [successSubmitted, setSuccessSubmitted] = useState(false);
  const [summaryData, setSummaryData] = useState<FormState | null>(null);

  const fileRef = useRef<HTMLInputElement | null>(null);

  // ── Derived active preset ──
  const activePreset = useMemo(() => {
    if (form.quantity === 1)  return '1';
    if (form.quantity === 3)  return '3';
    if (form.quantity === 5)  return '5';
    if (form.quantity === 20) return '20';
    return 'custom';
  }, [form.quantity]);

  // ── Cleanup object URLs on unmount ──
  useEffect(() => {
    return () => { images.forEach(i => URL.revokeObjectURL(i.url)); };
  }, [images]);

  const setField = useCallback((k: keyof FormState, v: string | number) => {
    dispatch({ type: 'set', key: k, value: v });
  }, []);

  // Auto-save draft logic
  useEffect(() => {
    const draft = {
      formType: form.type,
      formSize: form.size,
      formQuantity: form.quantity,
      formCondition: form.condition,
      formNotes: form.notes,
    };
    try {
      localStorage.setItem('ap_donation_draft', JSON.stringify(draft));
    } catch {}
  }, [form.type, form.size, form.quantity, form.condition, form.notes]);

  // Restore draft on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('ap_donation_draft');
      if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        if (draft.formType) setField('type', draft.formType);
        if (draft.formSize) setField('size', draft.formSize);
        if (draft.formQuantity) setField('quantity', Number(draft.formQuantity) || 1);
        if (draft.formCondition) setField('condition', draft.formCondition);
        if (draft.formNotes) setField('notes', draft.formNotes);
      }
    } catch (e) {
      console.warn('Failed to restore donation draft:', e);
    }
  }, [setField]);

  const touch = useCallback((key: string) =>
    setTouched(prev => ({ ...prev, [key]: true })), []);

  const dec = useCallback(() => {
    setField('quantity', Math.max(1, form.quantity - 1));
  }, [form.quantity, setField]);

  const inc = useCallback(() => {
    setField('quantity', Math.min(9999, form.quantity + 1));
  }, [form.quantity, setField]);

  // ── Image handlers ──
  const addFiles = useCallback((files: FileList | File[]) => {
    const arr = Array.from(files).filter(
      f => f.type.startsWith('image/') && f.size <= MAX_FILE_MB * 1024 * 1024
    );
    if (arr.length === 0) {
      setGlobalError(`اختر صور PNG/JPG بحجم أقل من ${MAX_FILE_MB}MB`);
      return;
    }
    const space = MAX_IMAGES - images.length;
    if (space <= 0) {
      setGlobalError(`الحد الأقصى ${MAX_IMAGES} صور`);
      return;
    }
    const allowed = arr.slice(0, space);
    const items = allowed.map(f => ({
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      file: f,
      url: URL.createObjectURL(f),
    }));
    setImages(prev => [...prev, ...items]);
    setGlobalError('');
  }, [images.length]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) addFiles(e.target.files);
    e.currentTarget.value = '';
  };

  const removeImage = useCallback((id: string) => {
    setImages(prev => {
      const found = prev.find(p => p.id === id);
      if (found) URL.revokeObjectURL(found.url);
      return prev.filter(p => p.id !== id);
    });
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files);
  };

  // ── Validation errors ──
  const errors = useMemo(() => ({
    type:      !form.type      ? 'يرجى اختيار نوع قطع التبرع' : '',
    size:      !form.size      ? 'يرجى اختيار مقاس قطع التبرع' : '',
    condition: !form.condition ? 'يرجى تحديد حالة التبرع' : '',
    quantity:  form.quantity < 1 ? 'الكمية لا يمكن أن تكون أقل من 1' : '',
    images:    images.length === 0 ? 'يرجى إضافة صورة واحدة على الأقل لتوضيح حالة التبرع' : '',
  }), [form, images.length]);

  const stepValidated = useMemo(() => {
    if (currentStep === 1) return !!(form.type && form.size);
    if (currentStep === 2) return form.quantity >= 1;
    if (currentStep === 3) return !!form.condition;
    if (currentStep === 4) return images.length >= 1;
    return false;
  }, [currentStep, form, images.length]);

  const nextStep = useCallback(() => {
    if (currentStep === 1) setTouched(t => ({ ...t, type: true, size: true }));
    if (currentStep === 2) setTouched(t => ({ ...t, quantity: true }));
    if (currentStep === 3) setTouched(t => ({ ...t, condition: true }));

    if (stepValidated) {
      setCurrentStep(s => Math.min(4, s + 1));
      setGlobalError('');
    } else {
      setGlobalError('يرجى تعبئة الحقول المطلوبة للانتقال للخطوة التالية');
    }
  }, [currentStep, stepValidated]);

  const prevStep = useCallback(() => {
    setCurrentStep(s => Math.max(1, s - 1));
    setGlobalError('');
  }, []);

  const resetForm = useCallback(() => {
    images.forEach(i => URL.revokeObjectURL(i.url));
    setImages([]);
    dispatch({ type: 'reset' });
    setTouched({});
    setGlobalError('');
    setCurrentStep(1);
    setSuccessSubmitted(false);
    setSummaryData(null);
    try {
      localStorage.removeItem('ap_donation_draft');
    } catch {}
  }, [images]);

  // ── Form Submit ──
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    setTouched({ type: true, size: true, condition: true, quantity: true, images: true });

    const safeQuantity = Math.max(1, Math.min(9999, Number(form.quantity) || 1));

    // التحقق من الصور
    if (images.length === 0) {
      setGlobalError('❌ يرجى رفع صورة واحدة على الأقل لتوضيح حالة قطع التبرع للجمعية');
      return;
    }

    // التحقق من الحقول المطلوبة (مع الرجوع للخطوة المناسبة)
    if (!form.type) {
      setGlobalError('❌ يرجى اختيار نوع قطع التبرع (رجالي / حريمي / أطفال)');
      setCurrentStep(1);
      return;
    }
    if (!form.size) {
      setGlobalError('❌ يرجى اختيار مقاس قطع التبرع');
      setCurrentStep(1);
      return;
    }
    if (!form.condition) {
      setGlobalError('❌ يرجى تحديد حالة التبرع (جديدة / ممتازة / جيدة / مقبولة)');
      setCurrentStep(3);
      return;
    }

    // التحقق من صحة القيم مقارنةً بما يقبله الباك إند
    if (!(VALID_TYPES as readonly string[]).includes(form.type)) {
      setGlobalError(`❌ نوع التبرع "${form.type}" غير مقبول. المقبول: رجالي، حريمي، أطفال`);
      setCurrentStep(1);
      return;
    }
    if (!(VALID_SIZES as readonly string[]).includes(form.size)) {
      setGlobalError(`❌ المقاس "${form.size}" غير مقبول. المقاسات: XS, S, M, L, XL, XXL, 3XL, 4XL, 5XL`);
      setCurrentStep(1);
      return;
    }
    if (!(VALID_CONDITIONS as readonly string[]).includes(form.condition)) {
      setGlobalError(`❌ حالة التبرع "${form.condition}" غير مقبولة. المقبول: جديدة، ممتازة، جيدة، مقبولة`);
      setCurrentStep(3);
      return;
    }

    setLoading(true);
    setGlobalError('');

    try {
      const fd = new FormData();
      fd.append('type',     form.type.trim());
      fd.append('size',     form.size.trim());
      fd.append('quantity', String(safeQuantity));
      fd.append('condition', form.condition.trim());
      if (form.notes.trim()) fd.append('description', form.notes.trim());
      images.slice(0, MAX_IMAGES).forEach(it => fd.append('images', it.file, it.file.name));

      // Debug log — يظهر في Developer Console (F12)
      console.log('📦 FormData → POST /donor');
      console.log('  type      :', form.type);
      console.log('  size      :', form.size);
      console.log('  quantity  :', safeQuantity);
      console.log('  condition :', form.condition);
      console.log('  images    :', images.length, 'ملف');

      await donorApi.create(fd);

      try {
        localStorage.removeItem('ap_donation_draft');
      } catch {}

      setSummaryData({ ...form, quantity: safeQuantity });
      setLoading(false);
      setSuccessSubmitted(true);

    } catch (err: unknown) {
      const message = err instanceof Error
        ? err.message
        : 'حدث خطأ أثناء إرسال طلب التبرع';
      console.error('❌ Donation submit error:', err);
      setGlobalError(`❌ ${message}`);
      setLoading(false);
    }
  }, [form, images]);

  const progressPercentage = useMemo(() => {
    if (successSubmitted) return 100;
    return (currentStep / 4) * 100;
  }, [currentStep, successSubmitted]);

  const stepTitles = [
    'التصنيف والمقاس',
    'تحديد أعداد التبرع',
    'حالة الجودة والوصف',
    'إثبات الحالة بالصور',
  ];

  // ─── Success Screen ────────────────────────────────────────────────────────
  if (successSubmitted && summaryData) {
    return (
      <div className="ap-success-card animate-up" dir="rtl">
        <div className="ap-success-icon-wrap">
          <i className="ti ti-check" />
        </div>
        <h2 className="ap-success-title">تم تقديم تبرعك بنجاح!</h2>
        <p className="ap-success-msg">
          شكراً لمساهمتك النبيلة. تم إرسال التبرع لجميع الجمعيات الخيرية الشريكة وجاري مراجعته الآن للقبول والتوثيق.
        </p>

        <div className="ap-notion-summary-box">
          <div className="ap-notion-summary-header">ملخص تبرع الخير</div>
          <div className="ap-notion-summary-list">
            <div className="ap-notion-summary-item">
              <span className="ap-notion-summary-label">👕 نوع التبرع</span>
              <span className="ap-notion-summary-val">{summaryData.type}</span>
            </div>
            <div className="ap-notion-summary-item">
              <span className="ap-notion-summary-label">📏 مقاس القطع</span>
              <span className="ap-notion-summary-val">{summaryData.size}</span>
            </div>
            <div className="ap-notion-summary-item">
              <span className="ap-notion-summary-label">📦 كمية الملابس</span>
              <span className="ap-notion-summary-val">{summaryData.quantity} قطع</span>
            </div>
            <div className="ap-notion-summary-item">
              <span className="ap-notion-summary-label">⭐ جودة التوريد</span>
              <span className="ap-notion-summary-val">
                {CONDITIONS.find(c => c.value === summaryData.condition)?.label || summaryData.condition}
              </span>
            </div>
            {summaryData.notes && (
              <div className="ap-notion-summary-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
                <span className="ap-notion-summary-label">📝 تفاصيل إضافية</span>
                <span className="ap-notion-summary-val" style={{ fontSize: 12, color: 'var(--t3)', fontWeight: 500, background: 'var(--surface3, rgba(255,255,255,0.05))', padding: '6px 10px', borderRadius: 8, width: '100%', border: '1px solid var(--border, rgba(255,255,255,0.08))' }}>
                  {summaryData.notes}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="ap-success-actions">
          <button
            type="button"
            className="ap-btn-prev"
            onClick={() => { resetForm(); if (onSuccess) onSuccess(); }}
          >
            العودة للرئيسية
          </button>
          <button type="button" className="ap-btn-next" onClick={resetForm}>
            <i className="ti ti-plus" />
            إضافة تبرع آخر جديد
          </button>
        </div>
      </div>
    );
  }

  // ─── Wizard Form ───────────────────────────────────────────────────────────
  return (
    <div className="donation-form" dir="rtl">

      {/* Top guided stepper component (Stripe/Airbnb style) */}
      <div className="ap-stepper-wrap">
        <div className="ap-stepper-steps">
          {[
            { step: 1, label: 'التصنيف والمقاس', icon: 'ti-shirt' },
            { step: 2, label: 'الكمية والقطع', icon: 'ti-package' },
            { step: 3, label: 'الجودة والوصف', icon: 'ti-star' },
            { step: 4, label: 'إرفاق الصور', icon: 'ti-camera' },
          ].map((item, idx) => {
            const isCompleted = currentStep > item.step;
            const isActive = currentStep === item.step;
            return (
              <React.Fragment key={item.step}>
                <div className={`ap-stepper-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                  <div 
                    className="ap-stepper-circle" 
                    onClick={() => {
                      if (item.step < currentStep) setCurrentStep(item.step);
                    }}
                    style={{ cursor: item.step < currentStep ? 'pointer' : 'default' }}
                  >
                    {isCompleted ? <i className="ti ti-check" /> : <i className={`ti ${item.icon}`} />}
                  </div>
                  <span className="ap-stepper-label">{item.label}</span>
                </div>
                {idx < 3 && (
                  <div className={`ap-stepper-line ${currentStep > item.step ? 'filled' : ''}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {globalError && (
        <div className="global-error" role="alert">
          <i className="ti ti-alert-circle" /> {globalError}
        </div>
      )}

      {/* ─ STEP 1: Category & Size ─ */}
      {currentStep === 1 && (
        <div className="ap-wizard-step" key="step-1">
          <div className="ap-wizard-group">
            <div className="ap-wizard-group-title">
              <i className="ti ti-shirt" />
              <span>ما هو تصنيف ونوع التبرع؟</span>
            </div>

            <div className="form-group">
              <label className="ap-form-label">تصنيف قطع الملابس <span className="req">*</span></label>
              <div className="ap-category-grid">
                {DONATION_TYPES.map(t => {
                  const active = form.type === t.value;
                  return (
                    <div
                      key={t.value}
                      className={`ap-category-card ${active ? 'active' : ''}`}
                      onClick={() => { setField('type', t.value); touch('type'); }}
                    >
                      <div className="ap-category-icon-wrap">
                        <i className={`ti ${t.icon}`} />
                      </div>
                      <div className="ap-category-title">{t.label}</div>
                      <div className="ap-category-sub">{t.sub}</div>
                      {active && <span className="ap-category-checkmark">✓</span>}
                    </div>
                  );
                })}
              </div>
              {touched.type && errors.type && (
                <div className="field-error" role="alert">
                  <i className="ti ti-alert-triangle" /> {errors.type}
                </div>
              )}
            </div>
          </div>

          <div className="ap-wizard-group">
            <div className="ap-wizard-group-title">
              <i className="ti ti-ruler-2" />
              <span>ما هو المقاس المتوفر؟</span>
            </div>

            <div className="form-group">
              <label className="ap-form-label">اختر المقاس المطلوب <span className="req">*</span></label>
              <div className="ap-size-grid">
                {SIZES.map(s => {
                  const active = form.size === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      className={`ap-size-pill ${active ? 'active' : ''}`}
                      onClick={() => { setField('size', s); touch('size'); }}
                    >
                      <i className="ti ti-tag" style={{ fontSize: '10px', opacity: active ? 1 : 0.4, transition: 'all 0.2s' }} />
                      <span>{s}</span>
                    </button>
                  );
                })}
              </div>
              {touched.size && errors.size && (
                <div className="field-error" role="alert">
                  <i className="ti ti-alert-triangle" /> {errors.size}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─ STEP 2: Quantity ─ */}
      {currentStep === 2 && (
        <div className="ap-wizard-step" key="step-2">
          <div className="ap-wizard-group">
            <div className="ap-wizard-group-title">
              <i className="ti ti-package" />
              <span>حدد كمية القطع المراد تقديمها للتبرع</span>
            </div>

            <div className="form-group">
              <label className="ap-form-label">الكمية الإجمالية للملابس <span className="req">*</span></label>
              <div className="ap-presets-row">
                {[
                  { val: '1',     label: 'قطعة واحدة',   count: 1  },
                  { val: '3',     label: '٣ قطع',         count: 3  },
                  { val: '5',     label: '٥ قطع',         count: 5  },
                  { val: '20',    label: '٢٠ قطعة',       count: 20 },
                  { val: 'custom',label: 'عدد مخصص...', count: form.quantity },
                ].map(p => {
                  const active = activePreset === p.val;
                  return (
                    <button
                      key={p.val}
                      type="button"
                      className={`ap-preset-btn ${active ? 'active' : ''}`}
                      onClick={() => {
                        if (p.val !== 'custom') {
                          setField('quantity', p.count);
                        } else if ([1, 3, 5, 20].includes(form.quantity)) {
                          setField('quantity', 6);
                        }
                        touch('quantity');
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
                  <button type="button" className="qty-btn" onClick={dec} aria-label="نقص">
                    <i className="ti ti-minus" />
                  </button>
                  <input
                    className="qty-input"
                    type="number"
                    value={form.quantity}
                    min={1}
                    max={9999}
                    onChange={e => setField('quantity', Math.max(1, Math.min(9999, Number(e.target.value || 1))))}
                    onBlur={() => touch('quantity')}
                  />
                  <button type="button" className="qty-btn" onClick={inc} aria-label="زود">
                    <i className="ti ti-plus" />
                  </button>
                </div>
              )}
              {touched.quantity && errors.quantity && (
                <div className="field-error"><i className="ti ti-alert-triangle" /> {errors.quantity}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─ STEP 3: Condition & Notes ─ */}
      {currentStep === 3 && (
        <div className="ap-wizard-step" key="step-3">
          <div className="ap-wizard-group">
            <div className="ap-wizard-group-title">
              <i className="ti ti-star" />
              <span>ما هي حالة وجودة قطع التبرع؟</span>
            </div>

            <div className="form-group">
              <label className="ap-form-label">حالة جودة التوريد <span className="req">*</span></label>
              <div className="ap-condition-grid">
                {CONDITIONS.map(c => {
                  const active = form.condition === c.value;
                  return (
                    <div
                      key={c.value}
                      className={`ap-condition-card ${active ? 'active' : ''}`}
                      onClick={() => { setField('condition', c.value); touch('condition'); }}
                    >
                      <div className="ap-condition-dot-wrap">
                        <span className="ap-condition-dot" />
                      </div>
                      <div className="ap-condition-info">
                        <span className="ap-condition-name">{c.label}</span>
                        <span className="ap-condition-desc">{c.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {touched.condition && errors.condition && (
                <div className="field-error" role="alert">
                  <i className="ti ti-alert-triangle" /> {errors.condition}
                </div>
              )}
            </div>
          </div>

          <div className="ap-wizard-group">
            <div className="ap-wizard-group-title">
              <i className="ti ti-notes" />
              <span>تفاصيل إضافية (اختياري)</span>
            </div>

            <div className="form-group">
              <label className="ap-form-label" htmlFor="notes">اكتب أي تفاصيل أخرى تود إعلام الجمعية بها</label>
              <div className="ap-floating-group">
                <textarea
                  id="notes"
                  className="ap-form-textarea"
                  style={{ minHeight: 96, resize: 'vertical' }}
                  placeholder="اكتب تفاصيل إضافية (مثلاً: ماركة الملابس، خامات ممتازة، مغسولة ومجهزة)..."
                  value={form.notes}
                  onChange={e => setField('notes', e.target.value)}
                  maxLength={500}
                  rows={3}
                />
                <div style={{ fontSize: 11, color: 'var(--t4)', textAlign: 'left', marginTop: 4, fontFamily: 'monospace' }}>
                  {form.notes.length}/500
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─ STEP 4: Images ─ */}
      {currentStep === 4 && (
        <div className="ap-wizard-step" key="step-4">
          <div className="ap-wizard-group">
            <div className="ap-wizard-group-title">
              <i className="ti ti-camera" />
              <span>أرفق صوراً توضيحية لقطع التبرع</span>
            </div>

            <div className="form-group">
              <label className="ap-form-label">الصور التوثيقية للقطع (تساعد في تسريع القبول) <span className="req">*</span></label>
              <div
                className={`upload-area ${dragOver ? 'dragover' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && fileRef.current) fileRef.current.click(); }}
              >
                <div className="upload-inner">
                  <div className="upload-ico">
                    <i className="ti ti-cloud-upload" />
                  </div>
                  <div className="upload-text">انقر لرفع صورة أو اسحبها هنا</div>
                  <div className="upload-hint">
                    PNG, JPG حتى {MAX_FILE_MB}MB (يمكنك اختيار أكثر من صورة، بحد أقصى {MAX_IMAGES} صور)
                  </div>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                </div>
              </div>

              {touched.images && errors.images && (
                <div className="field-error" role="alert">
                  <i className="ti ti-alert-triangle" /> {errors.images}
                </div>
              )}

              {images.length > 0 && (
                <div className="preview-grid" aria-live="polite">
                  {images.map((it, i) => (
                    <div className="preview-item animate-up" key={it.id}>
                      <img src={it.url} alt={`معاينة ${i + 1}`} />
                      <button
                        type="button"
                        className="preview-rm"
                        onClick={e => { e.stopPropagation(); removeImage(it.id); }}
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

      {/* ─ Navigation Row ─ */}
      <div className="ap-wizard-nav-row">
        {currentStep === 1 ? (
          <button
            type="button"
            className="ap-btn-prev"
            onClick={() => { resetForm(); if (onCancel) onCancel(); }}
          >
            <i className="ti ti-arrow-right" />
            إلغاء وإغلاق
          </button>
        ) : (
          <button type="button" className="ap-btn-prev" onClick={prevStep}>
            <i className="ti ti-arrow-right" />
            الخطوة السابقة
          </button>
        )}

        {currentStep < 4 ? (
          <button
            type="button"
            className="ap-btn-next"
            onClick={nextStep}
            disabled={!stepValidated}
          >
            الخطوة التالية
            <i className="ti ti-arrow-left" />
          </button>
        ) : (
          <button
            type="button"
            className="ap-btn-next"
            onClick={handleSubmit}
            disabled={loading || !stepValidated}
          >
            {loading ? (
              <>
                <i className="ti ti-loader-2 ti-spin" />
                جاري إرسال تبرعك...
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
    </div>
  );
}