// import { useState, useRef, useEffect, useCallback } from 'react';
// import { useLocation } from 'wouter';
// import { aiApi } from '../services';
// import { useAuth } from '../contexts/AuthContext';
// import '../styles/css/AiChat.css';

// interface Message {
//   role: 'user' | 'bot';
//   text?: string;
//   imageUrls?: string[];
//   isAnalysis?: boolean;
// }

// interface PendingImage {
//   file: File;
//   preview: string;
// }

// const SESSION_KEY = 'ataa_chat_messages';
// const MAX_IMAGES = 5;

// const BASE_SIDEBAR_LINKS = [
//   { href: '/',          icon: 'ti-home',   label: 'الرئيسية' },
//   { href: '/charities', icon: 'ti-heart',  label: 'الجمعيات' },
//   { href: '/settings',  icon: 'ti-settings', label: 'الإعدادات' },
// ];

// function getRoleSidebarLink(roleType?: string) {
//   if (roleType === 'admin')   return { href: '/admin',          icon: 'ti-shield-lock',  label: 'لوحة الإدارة' };
//   if (roleType === 'charity') return { href: '/dashboard',      icon: 'ti-layout-grid',  label: 'لوحة الجمعية' };
//   if (roleType === 'user')    return { href: '/user-dashboard',  icon: 'ti-layout-grid',  label: 'تبرعاتي'       };
//   if (roleType === 'donor')   return { href: '/user-dashboard',  icon: 'ti-layout-grid',  label: 'حسابي'         };
//   return null;
// }

// const SUGGESTION_CARDS = [
//   { icon: 'ti-shirt',         title: 'الملابس المقبولة للتبرع',  sub: 'ما هي أنواع الملابس المناسبة؟'  },
//   { icon: 'ti-map-pin',       title: 'أقرب جمعية خيرية',          sub: 'ابحث عن جمعية بالقرب منك'        },
//   { icon: 'ti-checklist',     title: 'حالة الملابس المطلوبة',     sub: 'ما هي المواصفات المقبولة؟'       },
//   { icon: 'ti-baby-carriage', title: 'تبرع بملابس الأطفال',       sub: 'هل يمكن التبرع بملابس الأطفال؟' },
// ];

// const QUICK_REPLIES = [
//   'هل يمكنك توضيح أكثر؟',
//   'هل أتبرع بأكثر من صنف؟',
//   'ما المستندات المطلوبة؟',
//   'كيف أتابع حالة تبرعي؟',
// ];

// export default function AIChat() {
//   const [messages, setMessages] = useState<Message[]>(() => {
//     try {
//       const saved = sessionStorage.getItem(SESSION_KEY);
//       return saved ? JSON.parse(saved) : [];
//     } catch { return []; }
//   });

//   const [input, setInput]               = useState('');
//   const [loading, setLoading]           = useState(false);
//   const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
//   const [showQuickReplies, setShowQuickReplies] = useState(false);
//   const [sidebarOpen, setSidebarOpen]   = useState(false);

//   const msgsRef    = useRef<HTMLDivElement>(null);
//   const msgsEndRef = useRef<HTMLDivElement>(null);
//   const fileRef    = useRef<HTMLInputElement>(null);
//   const textRef    = useRef<HTMLTextAreaElement>(null);

//   const [location, setLocation] = useLocation();
//   const { user } = useAuth();
//   const roleSidebarLink = getRoleSidebarLink(user?.roleType);
//   const sidebarLinks = roleSidebarLink
//     ? [BASE_SIDEBAR_LINKS[0], roleSidebarLink, ...BASE_SIDEBAR_LINKS.slice(1)]
//     : BASE_SIDEBAR_LINKS;

//   const userInitial = user?.userName?.[0]?.toUpperCase()
//                    || user?.name?.[0]?.toUpperCase()
//                    || 'أ';
//   const userName = user?.userName || user?.name || 'المستخدم';
//   const role = user?.roleType === 'charity' ? 'جمعية خيرية'
//              : user?.roleType === 'admin'   ? 'مدير النظام'
//              : user?.roleType === 'donor'   ? 'متبرع'
//              : 'مستخدم';

//   useEffect(() => {
//     const handleResize = () => setSidebarOpen(window.innerWidth >= 768);
//     handleResize();
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   useEffect(() => {
//     try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(messages)); }
//     catch { /* quota exceeded */ }
//   }, [messages]);

//   const scrollToBottom = useCallback(() => {
//     requestAnimationFrame(() => {
//       msgsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
//     });
//   }, []);

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages, scrollToBottom]);

//   useEffect(() => {
//     if (!loading && messages.length > 0) {
//       scrollToBottom();
//     }
//   }, [loading, scrollToBottom, messages]);

//   useEffect(() => {
//     setShowQuickReplies(messages.some(m => m.role === 'bot') && !loading);
//   }, [messages, loading]);

//   const toggleSidebar = useCallback(() => setSidebarOpen(p => !p), []);
//   const closeSidebar = useCallback(() => setSidebarOpen(false), []);

//   const sendMessage = async (text: string, images?: PendingImage[]) => {
//     if ((!text.trim() && !images?.length) || loading) return;

//     const imageUrls = images?.map(img => img.preview) || [];

//     setMessages(prev => [
//       ...prev,
//       {
//         role: 'user',
//         text: text.trim() || undefined,
//         imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
//         isAnalysis: images && images.length > 0,
//       }
//     ]);

//     setInput('');
//     setPendingImages([]);
//     if (textRef.current) textRef.current.style.height = 'auto';
//     setLoading(true);

//     try {
//       let reply: string;

//       if (images && images.length > 0) {
//         const fd = new FormData();
//         // ✅ الـ API بيتوقع 'data' كاسم للصور
//         images.forEach((img) => fd.append('data', img.file));
//         // ✅ FIX BUG #3: أرسل message دائماً حتى لو فارغ — Backend يتطلبه مع الصور
//         fd.append('message', text.trim() || 'حلّل هذه الصورة');
//         const res = await aiApi.analysis(fd);
//         // ✅ نجرب كل الحقول الممكنة في الـ response
//         reply = (res as any).result || (res as any).reply || (res as any).message || (res as any).data || 'تم تحليل الصورة، لم يرجع رد واضح.';
//       } else {
//         const res = await aiApi.chat(text);
//         // ✅ نجرب كل الحقول الممكنة في الـ response
//         reply = (res as any).reply || (res as any).message || (res as any).data || (res as any).result || (res as any).response || 'تم إرسال رسالتك.';
//       }

//       setMessages(prev => [...prev, { role: 'bot', text: reply }]);
//     } catch (error) {
//       const errMsg = error instanceof Error ? error.message : 'خطأ غير معروف';
//       console.error('Chat error:', errMsg, error);
//       setMessages(prev => [
//         ...prev,
//         { role: 'bot', text: `⚠️ ${errMsg}` },
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = () => sendMessage(input, pendingImages.length > 0 ? pendingImages : undefined);

//   const handleKeyDown = (e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
//   };

//   const handleAutoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
//     setInput(e.target.value);
//     e.target.style.height = 'auto';
//     e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const files = e.target.files;
//     if (!files || files.length === 0) return;

//     const remainingSlots = MAX_IMAGES - pendingImages.length;

//     if (remainingSlots <= 0) {
//       alert(`وصلت للحد الأقصى: ${MAX_IMAGES} صور`);
//       e.target.value = '';
//       return;
//     }

//     const filesToProcess = Array.from(files).slice(0, remainingSlots);
//     let loadedCount = 0;
//     const newImages: PendingImage[] = [];
//     const errors: string[] = [];

//     filesToProcess.forEach((file) => {
//       if (!file.type.startsWith('image/')) {
//         errors.push(`${file.name} ليس صورة`);
//         loadedCount++;
//         if (loadedCount === filesToProcess.length) finishLoading();
//         return;
//       }

//       if (file.size > 5 * 1024 * 1024) {
//         errors.push(`${file.name} حجمها كبير جداً`);
//         loadedCount++;
//         if (loadedCount === filesToProcess.length) finishLoading();
//         return;
//       }

//       const reader = new FileReader();

//       reader.onload = () => {
//         newImages.push({ file, preview: reader.result as string });
//         loadedCount++;
//         if (loadedCount === filesToProcess.length) finishLoading();
//       };

//       reader.onerror = () => {
//         errors.push(`خطأ في قراءة ${file.name}`);
//         loadedCount++;
//         if (loadedCount === filesToProcess.length) finishLoading();
//       };

//       reader.readAsDataURL(file);
//     });

//     const finishLoading = () => {
//       if (newImages.length > 0) setPendingImages(prev => [...prev, ...newImages]);
//       if (errors.length > 0) console.warn('أخطاء:', errors);
//     };

//     e.target.value = '';
//   };

//   const removeImage = (idx: number) => {
//     setPendingImages(prev => prev.filter((_, i) => i !== idx));
//   };

//   const clearChat = () => {
//     setMessages([]);
//     sessionStorage.removeItem(SESSION_KEY);
//   };

//   const canSend = !!((input.trim() || pendingImages.length) && !loading);
//   const isEmpty = messages.length === 0;

//   return (
//     <>
//       <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css" />

//       <div className="ac-root">

//         <div
//           className={`ac-overlay${sidebarOpen && window.innerWidth < 768 ? ' visible' : ''}`}
//           onClick={closeSidebar}
//         />

//         <aside className={`ac-sidebar${sidebarOpen ? '' : ' closed'}`}>
//           <div className="ac-sb-header">
//             <div className="ac-sb-brand">
//               <div className="ac-sb-brand-ico">
//                 <i className="ti ti-message-chatbot" aria-hidden="true" />
//               </div>
//               <div className="ac-sb-brand-info">
//                 <span className="ac-sb-brand-name">مساعد عطاء</span>
//                 <span className="ac-sb-brand-sub">ذكاء اصطناعي</span>
//               </div>
//             </div>
//             <button className="ac-sb-close-btn" onClick={closeSidebar} aria-label="إغلاق" type="button">
//               <i className="ti ti-x" aria-hidden="true" />
//             </button>
//           </div>

//           <button className="ac-new-btn" onClick={clearChat}>
//             <i className="ti ti-edit" aria-hidden="true" />
//             محادثة جديدة
//           </button>

//           <nav className="ac-sb-nav">
//             <div className="ac-sb-section">التنقل</div>
//             {sidebarLinks.map(link => (
//               <button
//                 key={link.href}
//                 className={`ac-nav-link${location === link.href ? ' active' : ''}`}
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   setLocation(link.href);
//                   if (window.innerWidth < 768) closeSidebar();
//                 }}
//               >
//                 <i className={`ti ${link.icon}`} aria-hidden="true" />
//                 {link.label}
//               </button>
//             ))}
//           </nav>

//           <div className="ac-sb-footer">
//             <div className="ac-sb-footer-av">{userInitial}</div>
//             <div className="ac-sb-footer-info">
//               <div className="ac-sb-footer-name">{userName}</div>
//               <div className="ac-sb-footer-role">{role}</div>
//             </div>
//           </div>
//         </aside>

//         <main className="ac-main">

//           <div className="ac-topbar">
//             <div className="ac-topbar-left">
//               <button
//                 className={`ac-menu-btn${sidebarOpen ? ' active' : ''}`}
//                 onClick={(e) => { e.stopPropagation(); e.preventDefault(); toggleSidebar(); }}
//                 aria-label={sidebarOpen ? 'إخفاء القائمة' : 'إظهار القائمة'}
//                 type="button"
//               >
//                 <i className="ti ti-menu-2" aria-hidden="true" />
//               </button>
//               <div className="ac-model-badge">
//                 <span className="ac-badge-dot" />
//                 عطاء AI
//               </div>
//             </div>
//             <div className="ac-topbar-right">
//               <div className="ac-user-av" title={userName}>{userInitial}</div>
//             </div>
//           </div>

//           <div className="ac-msgs" ref={msgsRef}>
//             <div className="ac-msgs-inner">

//               {isEmpty ? (
//                 <div className="ac-welcome">
//                   <div className="ac-welcome-logo">
//                     <i className="ti ti-robot" aria-hidden="true" />
//                   </div>
//                   <h2>كيف يمكنني مساعدتك؟</h2>
//                   <p>اسألني عن التبرع بالملابس أو أرسل صورة لأحللها فورًا بالذكاء الاصطناعي</p>
//                   <div className="ac-cards">
//                     {SUGGESTION_CARDS.map(c => (
//                       <button key={c.title} className="ac-card" onClick={() => sendMessage(c.title)}>
//                         <span className="ac-card-ico"><i className={`ti ${c.icon}`} aria-hidden="true" /></span>
//                         <span className="ac-card-title">{c.title}</span>
//                         <span className="ac-card-sub">{c.sub}</span>
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               ) : (
//                 messages.map((m, i) => (
//                   <div key={i}>
//                     <div className={`ac-row ${m.role === 'user' ? 'ac-user' : 'ac-bot'}`}>
//                       <div className={`ac-av ${m.role === 'user' ? 'ac-user' : 'ac-bot'}`}>
//                         {m.role === 'bot' ? <i className="ti ti-robot" aria-hidden="true" /> : userInitial}
//                       </div>
//                       <div className="ac-msg-body">
//                         {m.role === 'bot' && <div className="ac-bot-label">مساعد عطاء</div>}
//                         {m.imageUrls && m.imageUrls.length > 0 && (
//                           <div className="ac-img-gallery">
//                             {m.imageUrls.map((imgUrl, idx) => (
//                               <div key={idx} className="ac-img-wrap">
//                                 <img src={imgUrl} alt={`صورة ${idx + 1}`} />
//                               </div>
//                             ))}
//                           </div>
//                         )}
//                         {m.isAnalysis && (
//                           <span className="ac-analysis-badge">
//                             <i className="ti ti-zoom-scan" style={{ fontSize: 14 }} aria-hidden="true" />
//                             تحليل بالذكاء الاصطناعي
//                           </span>
//                         )}
//                         {m.text && (
//                           m.role === 'user'
//                             ? <div className="ac-bubble-user">{m.text}</div>
//                             : <div className="ac-text-bot">{m.text}</div>
//                         )}
//                       </div>
//                     </div>
//                     {i < messages.length - 1 && <div className="ac-sep" />}
//                   </div>
//                 ))
//               )}

//               {loading && (
//                 <div className="ac-typing-row">
//                   <div className="ac-av ac-bot">
//                     <i className="ti ti-robot" aria-hidden="true" />
//                   </div>
//                   <div className="ac-typing"><span /><span /><span /></div>
//                 </div>
//               )}

//               {showQuickReplies && !isEmpty && (
//                 <div className="ac-qr">
//                   {QUICK_REPLIES.map(qr => (
//                     <button key={qr} className="ac-qr-btn" disabled={loading} onClick={() => sendMessage(qr)}>
//                       {qr}
//                     </button>
//                   ))}
//                 </div>
//               )}

//               <div ref={msgsEndRef} style={{ height: 10 }} />
//             </div>
//           </div>

//           <div className="ac-input-zone">
//             <div className="ac-input-inner">
//               <div className="ac-input-box">

//                 {pendingImages.length > 0 && (
//                   <div className="ac-pending">
//                     <div className="ac-pending-gallery">
//                       {pendingImages.map((img, idx) => (
//                         <div key={idx} className="ac-pend-thumb">
//                           <img src={img.preview} alt={`معاينة ${idx + 1}`} />
//                           <button type="button" className="ac-pend-x" onClick={() => removeImage(idx)} aria-label="حذف الصورة">
//                             <i className="ti ti-x" aria-hidden="true" />
//                           </button>
//                         </div>
//                       ))}
//                     </div>
//                     <div className="ac-pend-label">
//                       {pendingImages.length} من {MAX_IMAGES} صور
//                       <span>جاهزة للتحليل بالذكاء الاصطناعي</span>
//                     </div>
//                   </div>
//                 )}

//                 <div className="ac-input-row">
//                   <textarea
//                     ref={textRef}
//                     className="ac-textarea"
//                     placeholder="اكتب رسالتك هنا..."
//                     value={input}
//                     rows={1}
//                     disabled={false}
//                     onChange={handleAutoResize}
//                     onKeyDown={handleKeyDown}
//                   />
//                   <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFileChange} />
//                   <button
//                     type="button"
//                     className="ac-icon-btn ac-img-btn"
//                     title={`إرفاق صور (${pendingImages.length}/${MAX_IMAGES})`}
//                     aria-label="إرفاق صور"
//                     disabled={loading || pendingImages.length >= MAX_IMAGES}
//                     onClick={() => fileRef.current?.click()}
//                   >
//                     <i className="ti ti-photo-up" aria-hidden="true" />
//                   </button>
//                   <button
//                     type="button"
//                     className="ac-icon-btn ac-send-btn"
//                     disabled={!canSend}
//                     onClick={handleSubmit}
//                     aria-label="إرسال"
//                   >
//                     <i className="ti ti-send-2" aria-hidden="true" />
//                   </button>
//                 </div>

//               </div>
//               <div className="ac-hint">
//                 <kbd>Enter</kbd> للإرسال &nbsp;•&nbsp; <kbd>Shift+Enter</kbd> لسطر جديد
//               </div>
//             </div>
//           </div>

//         </main>
//       </div>
//     </>
//   );
// }
import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { aiApi } from '../services';
import { useAuth } from '../contexts/AuthContext';
import '../styles/css/AiChat.css';

interface Message {
  role: 'user' | 'bot';
  text?: string;
  imageUrls?: string[];
  isAnalysis?: boolean;
  timestamp?: number;
}

interface PendingImage {
  file: File;
  preview: string;
}

const SESSION_KEY = 'ataa_chat_messages';
const MAX_IMAGES = 5;

const BASE_SIDEBAR_LINKS = [
  { href: '/',          icon: 'ti-home',   label: 'الرئيسية' },
  { href: '/charities', icon: 'ti-heart',  label: 'الجمعيات' },
  { href: '/settings',  icon: 'ti-settings', label: 'الإعدادات' },
];

function getRoleSidebarLink(roleType?: string) {
  if (roleType === 'admin')   return { href: '/admin',          icon: 'ti-shield-lock',  label: 'لوحة الإدارة' };
  if (roleType === 'charity') return { href: '/dashboard',      icon: 'ti-layout-grid',  label: 'لوحة الجمعية' };
  if (roleType === 'user')    return { href: '/user-dashboard',  icon: 'ti-layout-grid',  label: 'تبرعاتي'       };
  if (roleType === 'donor')   return { href: '/user-dashboard',  icon: 'ti-layout-grid',  label: 'حسابي'         };
  return null;
}

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

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [input, setInput]               = useState('');
  const [loading, setLoading]           = useState(false);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [copiedIdx, setCopiedIdx]       = useState<number | null>(null);

  const msgsRef    = useRef<HTMLDivElement>(null);
  const msgsEndRef = useRef<HTMLDivElement>(null);
  const fileRef    = useRef<HTMLInputElement>(null);
  const textRef    = useRef<HTMLTextAreaElement>(null);

  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const roleSidebarLink = getRoleSidebarLink(user?.roleType);
  const sidebarLinks = roleSidebarLink
    ? [BASE_SIDEBAR_LINKS[0], roleSidebarLink, ...BASE_SIDEBAR_LINKS.slice(1)]
    : BASE_SIDEBAR_LINKS;

  const userInitial = user?.userName?.[0]?.toUpperCase()
                   || user?.name?.[0]?.toUpperCase()
                   || 'أ';
  const userName = user?.userName || user?.name || 'المستخدم';
  const role = user?.roleType === 'charity' ? 'جمعية خيرية'
             : user?.roleType === 'admin'   ? 'مدير النظام'
             : user?.roleType === 'donor'   ? 'متبرع'
             : 'مستخدم';

  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth >= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(messages)); }
    catch { /* quota exceeded */ }
  }, [messages]);

  // ── الـ scroll container الحقيقي هو .ac-msgs ──
  const userScrolledUp = useRef(false);

  // دالة scroll مباشرة على الـ container بدون scrollIntoView البطيء
  const scrollToBottom = useCallback((force = false) => {
    if (!force && userScrolledUp.current) return;
    const container = msgsRef.current;
    if (!container) return;
    // instant بدل smooth عشان يتابع live typing
    container.scrollTop = container.scrollHeight;
  }, []);

  // detect لو المستخدم سكرول لفوق يدوياً — نوقف auto scroll
  useEffect(() => {
    const container = msgsRef.current;
    if (!container) return;
    const handleScroll = () => {
      const distFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      userScrolledUp.current = distFromBottom > 100;
    };
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // رسالة جديدة وصلت
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role === 'bot') userScrolledUp.current = false;
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // أثناء loading: scroll كل 80ms عشان typing indicator يتابع
  useEffect(() => {
    if (!loading) {
      scrollToBottom(true);
      return;
    }
    userScrolledUp.current = false;
    const interval = setInterval(() => scrollToBottom(true), 80);
    return () => clearInterval(interval);
  }, [loading, scrollToBottom]);

  useEffect(() => {
    setShowQuickReplies(messages.some(m => m.role === 'bot') && !loading);
  }, [messages, loading]);

  const toggleSidebar = useCallback(() => setSidebarOpen(p => !p), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

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
        timestamp: Date.now(),
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
        // ✅ الـ API بيتوقع 'data' كاسم للصور
        images.forEach((img) => fd.append('data', img.file));
        // ✅ FIX BUG #3: أرسل message دائماً حتى لو فارغ — Backend يتطلبه مع الصور
        fd.append('message', text.trim() || 'حلّل هذه الصورة');
        const res = await aiApi.analysis(fd);
        // ✅ نجرب كل الحقول الممكنة في الـ response
        reply = (res as any).result || (res as any).reply || (res as any).message || (res as any).data || 'تم تحليل الصورة، لم يرجع رد واضح.';
      } else {
        const res = await aiApi.chat(text);
        // ✅ نجرب كل الحقول الممكنة في الـ response
        reply = (res as any).reply || (res as any).message || (res as any).data || (res as any).result || (res as any).response || 'تم إرسال رسالتك.';
      }

      setMessages(prev => [...prev, { role: 'bot', text: reply, timestamp: Date.now() }]);

      // ── Streaming simulation ──
      const words = reply.split(' ');
      if (words.length > 4) {
        setLoading(false);
        setMessages(prev => {
          const msgs = [...prev];
          msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], text: '' };
          return msgs;
        });
        let built = '';
        let i = 0;
        const step = () => {
          if (i >= words.length) return;
          built += (i === 0 ? '' : ' ') + words[i];
          i++;
          setMessages(prev => {
            const msgs = [...prev];
            msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], text: built };
            return msgs;
          });
          scrollToBottom(true);
          setTimeout(step, words[i - 1].length > 6 ? 55 : 35);
        };
        step();
        return;
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'خطأ غير معروف';
      console.error('Chat error:', errMsg, error);
      setMessages(prev => [
        ...prev,
        { role: 'bot', text: `⚠️ ${errMsg}`, timestamp: Date.now() },
      ]);
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

  const clearChat = () => {
    setMessages([]);
    sessionStorage.removeItem(SESSION_KEY);
  };

  const canSend = !!((input.trim() || pendingImages.length) && !loading);
  const isEmpty = messages.length === 0;

  return (
    <>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css" />

      <div className="ac-root">

        <div
          className={`ac-overlay${sidebarOpen && window.innerWidth < 768 ? ' visible' : ''}`}
          onClick={closeSidebar}
        />

        <aside className={`ac-sidebar${sidebarOpen ? '' : ' closed'}`}>
          <div className="ac-sb-header">
            <div className="ac-sb-brand">
              <div className="ac-sb-brand-ico">
                <i className="ti ti-message-chatbot" aria-hidden="true" />
              </div>
              <div className="ac-sb-brand-info">
                <span className="ac-sb-brand-name">مساعد عطاء</span>
                <span className="ac-sb-brand-sub">ذكاء اصطناعي</span>
              </div>
            </div>
            <button className="ac-sb-close-btn" onClick={closeSidebar} aria-label="إغلاق" type="button">
              <i className="ti ti-x" aria-hidden="true" />
            </button>
          </div>

          <button className="ac-new-btn" onClick={clearChat}>
            <i className="ti ti-edit" aria-hidden="true" />
            محادثة جديدة
          </button>

          <nav className="ac-sb-nav">
            <div className="ac-sb-section">التنقل</div>
            {sidebarLinks.map(link => (
              <button
                key={link.href}
                className={`ac-nav-link${location === link.href ? ' active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setLocation(link.href);
                  if (window.innerWidth < 768) closeSidebar();
                }}
              >
                <i className={`ti ${link.icon}`} aria-hidden="true" />
                {link.label}
              </button>
            ))}
          </nav>

          <div className="ac-sb-footer">
            <div className="ac-sb-footer-av">{userInitial}</div>
            <div className="ac-sb-footer-info">
              <div className="ac-sb-footer-name">{userName}</div>
              <div className="ac-sb-footer-role">{role}</div>
            </div>
          </div>
        </aside>

        <main className="ac-main">

          <div className="ac-topbar">
            <div className="ac-topbar-left">
              <button
                className={`ac-menu-btn${sidebarOpen ? ' active' : ''}`}
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); toggleSidebar(); }}
                aria-label={sidebarOpen ? 'إخفاء القائمة' : 'إظهار القائمة'}
                type="button"
              >
                <i className="ti ti-menu-2" aria-hidden="true" />
              </button>
              <div className="ac-model-badge">
                <span className="ac-badge-dot" />
                عطاء AI
              </div>
            </div>
            <div className="ac-topbar-right">
              <div className="ac-user-av" title={userName}>{userInitial}</div>
            </div>
          </div>

          <div className="ac-msgs" ref={msgsRef}>
            <div className="ac-msgs-inner">

              {isEmpty ? (
                <div className="ac-welcome">
                  <div className="ac-welcome-logo">
                    <i className="ti ti-robot" aria-hidden="true" />
                  </div>
                  <h2>كيف يمكنني مساعدتك؟</h2>
                  <p>اسألني عن التبرع بالملابس أو أرسل صورة لأحللها فورًا بالذكاء الاصطناعي</p>
                  <div className="ac-cards">
                    {SUGGESTION_CARDS.map(c => (
                      <button key={c.title} className="ac-card" onClick={() => sendMessage(c.title)}>
                        <span className="ac-card-ico"><i className={`ti ${c.icon}`} aria-hidden="true" /></span>
                        <span className="ac-card-title">{c.title}</span>
                        <span className="ac-card-sub">{c.sub}</span>
                      </button>
                    ))}
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                          {m.timestamp && (
                            <span style={{ fontSize: 10.5, color: 'var(--t3)', opacity: 0.7 }}>
                              {new Date(m.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </span>
                          )}
                          {m.role === 'bot' && m.text && (
                            <button
                              title="نسخ"
                              onClick={() => {
                                navigator.clipboard?.writeText(m.text || '');
                                setCopiedIdx(i);
                                setTimeout(() => setCopiedIdx(null), 1800);
                              }}
                              style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                fontSize: 12, color: copiedIdx === i ? 'var(--br)' : 'var(--t3)',
                                padding: '2px 5px', borderRadius: 5,
                                transition: 'color 0.15s',
                                display: 'flex', alignItems: 'center', gap: 3,
                              }}
                            >
                              <i className={`ti ${copiedIdx === i ? 'ti-check' : 'ti-copy'}`} />
                              {copiedIdx === i ? 'تم النسخ' : ''}
                            </button>
                          )}
                        </div>
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
                    disabled={false}
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

        </main>
      </div>
    </>
  );
}