import { useState, useRef, useEffect, useCallback } from 'react';
import { aiApi } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/css/AiChat.css';
import '@tabler/icons-webfont/dist/tabler-icons.css';

// ─── نفس Types بتاعة AIChat.tsx ─────────────────────────────────────────────

interface Message {
  role: 'user' | 'bot';
  text?: string;
  imageUrls?: string[];
  isAnalysis?: boolean;
}

interface PendingImage {
  file: File;
  preview: string;
}

// ─── نفس الثوابت بتاعة AIChat.tsx ───────────────────────────────────────────

const MAX_IMAGES = 5;

const SUGGESTION_CARDS = [
  { icon: 'ti-shirt',         title: 'الملابس المقبولة للتبرع',  sub: 'ما هي أنواع الملابس المناسبة؟'  },
  { icon: 'ti-map-pin',       title: 'أقرب جمعية خيرية',          sub: 'ابحث عن جمعية بالقرب منك'        },
  { icon: 'ti-checklist',     title: 'حالة الملابس المطلوبة',     sub: 'ما هي المواصفات المقبولة؟'       },
  { icon: 'ti-baby-carriage', title: 'تبرع بملابس الأطفال',       sub: 'هل يمكن التبرع بملابس الأطفال؟' },
];

const QUICK_REPLIES = [
  'هل يمكنك توضيح أكثر؟',
  'هل أتبرع بأكثر من صنف؟',
  'ما المستندات المطلوبة؟',
  'كيف أتابع حالة تبرعي؟',
];

// ─── AIChatEmbed ─────────────────────────────────────────────────────────────

export default function AIChatEmbed() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]               = useState('');
  const [loading, setLoading]           = useState(false);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [showQuickReplies, setShowQuickReplies] = useState(false);

  const msgsRef    = useRef<HTMLDivElement>(null);
  const msgsEndRef = useRef<HTMLDivElement>(null);
  const fileRef    = useRef<HTMLInputElement>(null);
  const textRef    = useRef<HTMLTextAreaElement>(null);

  const { user } = useAuth();

  const userInitial = (
    user?.userName?.[0] ||
    user?.name?.[0] ||
    user?.email?.[0] ||
    'أ'
  ).toUpperCase();

  // ── Scroll ──────────────────────────────────────────────────────────────────

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      msgsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!loading && messages.length > 0) scrollToBottom();
  }, [loading, scrollToBottom, messages]);

  useEffect(() => {
    setShowQuickReplies(messages.some(m => m.role === 'bot') && !loading);
  }, [messages, loading]);

  // ── Send ────────────────────────────────────────────────────────────────────

  const sendMessage = async (text: string, images?: PendingImage[]) => {
    if ((!text.trim() && !images?.length) || loading) return;

    const imageUrls = images?.map(img => img.preview) || [];

    setMessages(prev => [
      ...prev,
      {
        role: 'user',
        text: text.trim() || undefined,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
        isAnalysis: images && images.length > 0,
      }
    ]);

    setInput('');
    setPendingImages([]);
    if (textRef.current) textRef.current.style.height = 'auto';
    setLoading(true);

    try {
      let reply: string;

      if (images && images.length > 0) {
        const fd = new FormData();
        images.forEach((img) => fd.append('data', img.file));
        fd.append('message', text.trim() || 'حلّل هذه الصورة');
        const res = await aiApi.analysis(fd);
        reply = (res as any).result || (res as any).reply || (res as any).message || (res as any).data || 'تم تحليل الصورة، لم يرجع رد واضح.';
      } else {
        const res = await aiApi.chat(text);
        reply = (res as any).reply || (res as any).message || (res as any).data || (res as any).result || (res as any).response || 'تم إرسال رسالتك.';
      }

      setMessages(prev => [...prev, { role: 'bot', text: reply }]);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'خطأ غير معروف';
      setMessages(prev => [...prev, { role: 'bot', text: `⚠️ ${errMsg}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => sendMessage(input, pendingImages.length > 0 ? pendingImages : undefined);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  const handleAutoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = MAX_IMAGES - pendingImages.length;
    if (remainingSlots <= 0) {
      alert(`وصلت للحد الأقصى: ${MAX_IMAGES} صور`);
      e.target.value = '';
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    let loadedCount = 0;
    const newImages: PendingImage[] = [];
    const errors: string[] = [];

    filesToProcess.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name} ليس صورة`);
        loadedCount++;
        if (loadedCount === filesToProcess.length) finishLoading();
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        errors.push(`${file.name} حجمها كبير جداً`);
        loadedCount++;
        if (loadedCount === filesToProcess.length) finishLoading();
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        newImages.push({ file, preview: reader.result as string });
        loadedCount++;
        if (loadedCount === filesToProcess.length) finishLoading();
      };
      reader.onerror = () => {
        errors.push(`خطأ في قراءة ${file.name}`);
        loadedCount++;
        if (loadedCount === filesToProcess.length) finishLoading();
      };
      reader.readAsDataURL(file);
    });

    const finishLoading = () => {
      if (newImages.length > 0) setPendingImages(prev => [...prev, ...newImages]);
      if (errors.length > 0) console.warn('أخطاء:', errors);
    };

    e.target.value = '';
  };

  const removeImage = (idx: number) => {
    setPendingImages(prev => prev.filter((_, i) => i !== idx));
  };

  const clearChat = () => setMessages([]);

  const canSend = !!((input.trim() || pendingImages.length) && !loading);
  const isEmpty = messages.length === 0;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {/* wrapper مخصص للـ embed — بدون height:100dvh بتاعة ac-main */}
      <div className="ac-embed-root" style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0, overflow: "hidden" }}>

        {/* Topbar مصغر داخل الـ tab */}
        <div className="ac-topbar" style={{ borderBottom: '1.5px solid var(--ac-border, #e5e7eb)' }}>
          <div className="ac-topbar-left">
            <div className="ac-model-badge">
              <span className="ac-badge-dot" />
              مساعد عطاء AI
            </div>
            <div style={{ fontSize: 11, color: 'var(--ac-text3, #9ca3af)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 6px rgba(34,197,94,0.6)' }} />
              متصل
            </div>
          </div>
          <div className="ac-topbar-right" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              type="button"
              onClick={clearChat}
              title="محادثة جديدة"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ac-text3, #9ca3af)', display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, padding: '4px 8px', borderRadius: 8, transition: 'all 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--br-pale, rgba(16,163,127,0.1))')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <i className="ti ti-edit" aria-hidden="true" style={{ fontSize: 16 }} />
              <span style={{ fontSize: 11 }}>جديد</span>
            </button>
            <div className="ac-user-av" title={user?.userName || 'المستخدم'} style={{ background: 'var(--br, #10a37f)', color: '#fff', boxShadow: '0 2px 8px rgba(16,163,127,0.35)' }}>{userInitial}</div>
          </div>
        </div>

        {/* Messages */}
        <div className="ac-msgs" ref={msgsRef}>
          <div className="ac-msgs-inner">

            {isEmpty ? (
              <div className="ac-welcome">
                <div className="ac-welcome-logo">
                  <i className="ti ti-robot" aria-hidden="true" />
                </div>
                <h2>مرحباً، كيف أساعدك؟</h2>
                <p>مساعدك الذكي لإدارة التبرعات. يمكنك سؤالي أو إرسال صورة لتحليلها فوراً بالذكاء الاصطناعي</p>
                <div className="ac-cards">
                  {SUGGESTION_CARDS.map(c => (
                    <button key={c.title} className="ac-card" onClick={() => sendMessage(c.title)}>
                      <span className="ac-card-ico"><i className={`ti ${c.icon}`} aria-hidden="true" /></span>
                      <span className="ac-card-title">{c.title}</span>
                      <span className="ac-card-sub">{c.sub}</span>
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: 24, display: 'flex', gap: 16, alignItems: 'center', color: 'var(--ac-text3, #9ca3af)', fontSize: 11.5 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <i className="ti ti-photo" style={{ fontSize: 13 }} />
                    تحليل الصور
                  </span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <i className="ti ti-brain" style={{ fontSize: 13 }} />
                    ذكاء اصطناعي
                  </span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <i className="ti ti-clock" style={{ fontSize: 13 }} />
                    24/7
                  </span>
                </div>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i}>
                  <div className={`ac-row ${m.role === 'user' ? 'ac-user' : 'ac-bot'}`}>
                    <div className={`ac-av ${m.role === 'user' ? 'ac-user' : 'ac-bot'}`}>
                      {m.role === 'bot' ? <i className="ti ti-robot" aria-hidden="true" /> : userInitial}
                    </div>
                    <div className="ac-msg-body">
                      {m.role === 'bot' && <div className="ac-bot-label">مساعد عطاء</div>}
                      {m.imageUrls && m.imageUrls.length > 0 && (
                        <div className="ac-img-gallery">
                          {m.imageUrls.map((imgUrl, idx) => (
                            <div key={idx} className="ac-img-wrap">
                              <img src={imgUrl} alt={`صورة ${idx + 1}`} />
                            </div>
                          ))}
                        </div>
                      )}
                      {m.isAnalysis && (
                        <span className="ac-analysis-badge">
                          <i className="ti ti-zoom-scan" style={{ fontSize: 14 }} aria-hidden="true" />
                          تحليل بالذكاء الاصطناعي
                        </span>
                      )}
                      {m.text && (
                        m.role === 'user'
                          ? <div className="ac-bubble-user">{m.text}</div>
                          : <div className="ac-text-bot">{m.text}</div>
                      )}
                    </div>
                  </div>
                  {i < messages.length - 1 && <div className="ac-sep" />}
                </div>
              ))
            )}

            {loading && (
              <div className="ac-typing-row">
                <div className="ac-av ac-bot">
                  <i className="ti ti-robot" aria-hidden="true" />
                </div>
                <div className="ac-typing"><span /><span /><span /></div>
              </div>
            )}

            {showQuickReplies && !isEmpty && (
              <div className="ac-qr">
                {QUICK_REPLIES.map(qr => (
                  <button key={qr} className="ac-qr-btn" disabled={loading} onClick={() => sendMessage(qr)}>
                    {qr}
                  </button>
                ))}
              </div>
            )}

            <div ref={msgsEndRef} style={{ height: 10 }} />
          </div>
        </div>

        {/* Input Zone */}
        <div className="ac-input-zone">
          <div className="ac-input-inner">
            <div className="ac-input-box">

              {pendingImages.length > 0 && (
                <div className="ac-pending">
                  <div className="ac-pending-gallery">
                    {pendingImages.map((img, idx) => (
                      <div key={idx} className="ac-pend-thumb">
                        <img src={img.preview} alt={`معاينة ${idx + 1}`} />
                        <button type="button" className="ac-pend-x" onClick={() => removeImage(idx)} aria-label="حذف الصورة">
                          <i className="ti ti-x" aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="ac-pend-label">
                    {pendingImages.length} من {MAX_IMAGES} صور
                    <span>جاهزة للتحليل بالذكاء الاصطناعي</span>
                  </div>
                </div>
              )}

              <div className="ac-input-textarea-row">
                <textarea
                  ref={textRef}
                  className="ac-textarea"
                  placeholder="اكتب رسالتك هنا..."
                  value={input}
                  rows={1}
                  onChange={handleAutoResize}
                  onKeyDown={handleKeyDown}
                />
                <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFileChange} />
              </div>

              <div className="ac-input-actions-row">
                <div className="ac-input-actions-right">
                  <button
                    type="button"
                    className="ac-icon-btn ac-img-btn"
                    title={`إرفاق صور (${pendingImages.length}/${MAX_IMAGES})`}
                    aria-label="إرفاق صور"
                    disabled={loading || pendingImages.length >= MAX_IMAGES}
                    onClick={() => fileRef.current?.click()}
                  >
                    <i className="ti ti-photo-up" aria-hidden="true" />
                  </button>
                </div>

                <div className="ac-input-actions-center">
                  <div className="ac-input-model-badge">
                    <span className="ac-input-badge-dot" />
                    عطاء AI
                  </div>
                </div>

                <div className="ac-input-actions-left">
                  <button
                    type="button"
                    className="ac-icon-btn ac-send-btn"
                    disabled={!canSend}
                    onClick={handleSubmit}
                    aria-label="إرسال"
                  >
                    <i className="ti ti-send-2" aria-hidden="true" />
                  </button>
                </div>
              </div>

            </div>
            <div className="ac-hint">
              <kbd>Enter</kbd> للإرسال &nbsp;•&nbsp; <kbd>Shift+Enter</kbd> لسطر جديد
            </div>
          </div>
        </div>

      </div>
    </>
  );
}