import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { aiApi } from '../services';
import { useAuth } from '../contexts/AuthContext';
import '../styles/css/AiChat.css';

// ─── Inline Premium Lucide SVGs ─────────────────────────────────────────────
const BotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8V4H8" />
    <rect width="16" height="12" x="4" y="8" rx="2" />
    <path d="M2 14h2" />
    <path d="M20 14h2" />
    <path d="M15 13v2" />
    <path d="M9 13v2" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ReplyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 17 4 12 9 7" />
    <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
  </svg>
);

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ShareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" x2="12" y1="2" y2="15" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" x2="6" y1="6" y2="18" />
    <line x1="6" x2="18" y1="6" y2="18" />
  </svg>
);

const ImageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" x2="11" y1="2" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

// ─── Interfaces ─────────────────────────────────────────────────────────────
interface Message {
  role: 'user' | 'bot';
  text?: string;
  imageUrls?: string[];
  isAnalysis?: boolean;
  timestamp?: number;
  quoteText?: string;
  quoteSender?: 'bot' | 'user';
  queued?: boolean;
}

interface PendingImage {
  file: File;
  preview: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────
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
  {
    // قميص/shirt icon — ملابس مقبولة للتبرع
    icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width:18, height:18 }}><path d="M20.38 3.46 16 2a1 1 0 0 0-.8.38L12 6 8.8 2.38A1 1 0 0 0 8 2L3.62 3.46a1 1 0 0 0-.62.94V8l3 1v11a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9l3-1V4.4a1 1 0 0 0-.62-.94z"/></svg>,
    title: 'الملابس المقبولة للتبرع',
    sub: 'ما هي أنواع الملابس المناسبة؟',
  },
  {
    // map-pin — أقرب جمعية خيرية
    icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width:18, height:18 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    title: 'أقرب جمعية خيرية',
    sub: 'ابحث عن جمعية بالقرب منك',
  },
  {
    // ruler/tag — حالة الملابس المطلوبة (مواصفات)
    icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width:18, height:18 }}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
    title: 'حالة الملابس المطلوبة',
    sub: 'ما هي المواصفات المقبولة؟',
  },
  {
    // baby/child icon — ملابس الأطفال
    icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width:18, height:18 }}><path d="M9 12h.01M15 12h.01M12 17c2 0 3-1 3-1H9s1 1 3 1z"/><path d="M12 2a5 5 0 0 0-5 5v2a7 7 0 0 0 14 0V7a5 5 0 0 0-5-5z"/><path d="M8 9V7"/><path d="M16 9V7"/></svg>,
    title: 'تبرع بملابس الأطفال',
    sub: 'هل يمكن التبرع بملابس الأطفال؟',
  },
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

  const [input, setInput]                     = useState('');
  const [loading, setLoading]                 = useState(false);
  const [isStreaming, setIsStreaming]         = useState(false);
  const [pendingImages, setPendingImages]     = useState<PendingImage[]>([]);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [sidebarOpen, setSidebarOpen]         = useState(false);
  const [replyingTo, setReplyingTo]           = useState<Message | null>(null);

  // Queue: messages sent while AI is busy
  const messageQueue = useRef<Array<{ text: string; images?: PendingImage[]; replyTo: Message | null }>>([]);
  const isProcessing = useRef(false);
  
  // Feedback states
  const [copiedIdx, setCopiedIdx]             = useState<number | null>(null);
  const [sharedIdx, setSharedIdx]             = useState<number | null>(null);
  const [copiedCodeContent, setCopiedCodeContent] = useState<string | null>(null);

  const msgsRef    = useRef<HTMLDivElement>(null);
  const msgsEndRef = useRef<HTMLDivElement>(null);
  const fileRef    = useRef<HTMLInputElement>(null);
  const textRef    = useRef<HTMLTextAreaElement>(null);
  const stopStreamRef = useRef(false);

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

  const userScrolledUp = useRef(false);
  const userHoveredDuringStream = useRef(false);

  // Scroll to bottom — respects hover-during-stream flag
  const scrollToBottom = useCallback((force = false) => {
    if (!force && userScrolledUp.current) return;
    if (force && userHoveredDuringStream.current) return;
    const container = msgsRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, []);

  useEffect(() => {
    const container = msgsRef.current;
    if (!container) return;
    const handleScroll = () => {
      const distFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
      userScrolledUp.current = distFromBottom > 120;
    };
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-scroll only when a new message is added, NOT on every streaming word
  useEffect(() => {
    if (!isStreaming) scrollToBottom(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  useEffect(() => {
    setShowQuickReplies(messages.some(m => m.role === 'bot') && !loading && !isStreaming);
  }, [messages, loading, isStreaming]);

  const toggleSidebar = useCallback(() => setSidebarOpen(p => !p), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const processMessage = async (text: string, images?: PendingImage[], replyTo?: Message | null, alreadyShown = false) => {
    const imageUrls = images?.map(img => img.preview) || [];

    if (!alreadyShown) {
      setMessages(prev => [
        ...prev,
        {
          role: 'user',
          text: text.trim() || undefined,
          imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
          isAnalysis: images && images.length > 0,
          timestamp: Date.now(),
          quoteText: replyTo ? replyTo.text : undefined,
          quoteSender: replyTo ? (replyTo.role === 'bot' ? 'bot' : 'user') : undefined,
        }
      ]);
    }

    setLoading(true);
    isProcessing.current = true;

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

      setMessages(prev => [...prev, { role: 'bot', text: reply, timestamp: Date.now() }]);

      // ── Streaming simulation ──
      const words = reply.split(' ');
      if (words.length > 4) {
        setLoading(false);
        setIsStreaming(true);
        stopStreamRef.current = false;
        userHoveredDuringStream.current = false;

        setMessages(prev => {
          const msgs = [...prev];
          msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], text: '' };
          return msgs;
        });

        await new Promise<void>((resolve) => {
          let built = '';
          let i = 0;
          const step = () => {
            if (stopStreamRef.current) {
              setMessages(prev => {
                const msgs = [...prev];
                msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], text: reply };
                return msgs;
              });
              setIsStreaming(false);
              stopStreamRef.current = false;
              resolve();
              return;
            }
            if (i >= words.length) {
              setIsStreaming(false);
              resolve();
              return;
            }
            built += (i === 0 ? '' : ' ') + words[i];
            i++;
            setMessages(prev => {
              const msgs = [...prev];
              msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], text: built };
              return msgs;
            });
            // Only scroll during streaming if user hasn't hovered
            if (!userHoveredDuringStream.current) {
              const container = msgsRef.current;
              if (container) container.scrollTop = container.scrollHeight;
            }
            const delay = words[i - 1].length > 6 ? 50 : 30;
            setTimeout(step, delay);
          };
          step();
        });
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'خطأ غير معروف';
      setMessages(prev => [
        ...prev,
        { role: 'bot', text: `⚠️ ${errMsg}`, timestamp: Date.now() },
      ]);
    } finally {
      setLoading(false);
      setIsStreaming(false);
      isProcessing.current = false;
      userHoveredDuringStream.current = false;
      const next = messageQueue.current.shift();
      if (next) {
        processMessage(next.text, next.images, next.replyTo, true);
      }
    }
  };

  const sendMessage = (text: string, images?: PendingImage[]) => {
    if (!text.trim() && !images?.length) return;

    const currentReplyQuote = replyingTo;
    setReplyingTo(null);
    setInput('');
    setPendingImages([]);
    if (textRef.current) textRef.current.style.height = 'auto';

    if (isProcessing.current) {
      messageQueue.current.push({ text, images, replyTo: currentReplyQuote });
      const imageUrls = images?.map(img => img.preview) || [];
      setMessages(prev => [
        ...prev,
        {
          role: 'user',
          text: text.trim() || undefined,
          imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
          isAnalysis: images && images.length > 0,
          timestamp: Date.now(),
          quoteText: currentReplyQuote ? currentReplyQuote.text : undefined,
          quoteSender: currentReplyQuote ? (currentReplyQuote.role === 'bot' ? 'bot' : 'user') : undefined,
          queued: true,
        }
      ]);
      return;
    }

    processMessage(text, images, currentReplyQuote);
  };

  const handleSubmit = () => sendMessage(input, pendingImages.length > 0 ? pendingImages : undefined);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() || pendingImages.length > 0) {
        handleSubmit();
      }
    }
  };

  const handleAutoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 180) + 'px';
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
    setReplyingTo(null);
    sessionStorage.removeItem(SESSION_KEY);
  };

  const handleCopyText = (text: string, idx: number) => {
    const copy = (str: string) => {
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(str);
      }
      const el = document.createElement('textarea');
      el.value = str;
      el.setAttribute('readonly', '');
      el.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
      document.body.appendChild(el);
      el.focus();
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      return Promise.resolve();
    };
    copy(text).finally(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    });
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCodeContent(code);
    setTimeout(() => setCopiedCodeContent(null), 2000);
  };

  const handleShareMessage = async (text: string, idx: number) => {
    const shareText = `رد من مساعد عطاء الذكي:\n\n${text}\n\nتم التوليد بواسطة منصة عطاء الخيرية`;

    const copyToClipboard = (str: string) => {
      // Method 1: modern clipboard API (HTTPS only)
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(str).then(() => true).catch(() => false);
      }
      // Method 2: execCommand fallback (works on HTTP/localhost)
      const el = document.createElement('textarea');
      el.value = str;
      el.setAttribute('readonly', '');
      el.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
      document.body.appendChild(el);
      el.focus();
      el.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(el);
      return Promise.resolve(ok);
    };

    // On mobile try native share sheet first
    if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
      try {
        await navigator.share({ title: 'مساعد عطاء AI', text: shareText });
        setSharedIdx(idx);
        setTimeout(() => setSharedIdx(null), 2000);
        return;
      } catch { /* fall through */ }
    }

    await copyToClipboard(shareText);
    setSharedIdx(idx);
    setTimeout(() => setSharedIdx(null), 2000);
  };

  const canSend = !!(input.trim() || pendingImages.length);
  const isEmpty = messages.length === 0;
  const isBlocked = false; // user can always type and send

  // ─── Custom Premium Markdown and Syntax Highlighting Renderer ──────────────
  const renderMarkdown = (content: string) => {
    if (!content) return null;
    const parts = content.split(/(```[\s\S]*?```)/g);

    return (
      <div className="ac-markdown">
        {parts.map((part, index) => {
          if (part.startsWith('```')) {
            const lines = part.split('\n');
            const langLine = lines[0].replace('```', '').trim();
            const language = langLine || 'code';
            const codeContent = lines.slice(1, lines.length - 1).join('\n');

            const highlightCode = (code: string) => {
              const keywords = /\b(const|let|var|function|return|import|export|from|class|extends|if|else|for|while|try|catch|async|await|new)\b/g;
              const strings = /('(?:\\'|[^'])*'|"(?:\\"|[^"])*"|`(?:\\`|[^`])*`)/g;
              const numbers = /\b(\d+)\b/g;
              const comments = /(\/\*[\s\S]*?\*\/|\/\/.+)$/gm;

              let html = code
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');

              html = html.replace(comments, '<span class="hl-comment">$1</span>');
              html = html.replace(keywords, '<span class="hl-kw">$1</span>');
              html = html.replace(strings, '<span class="hl-str">$1</span>');
              html = html.replace(numbers, '<span class="hl-num">$1</span>');

              return <code className="ac-code-pre" dangerouslySetInnerHTML={{ __html: html }} />;
            };

            return (
              <div key={index} className="ac-code-block">
                <div className="ac-code-header">
                  <span className="ac-code-lang">{language}</span>
                  <button
                    type="button"
                    className="ac-code-copy"
                    onClick={() => handleCopyCode(codeContent)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}>
                      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                    {copiedCodeContent === codeContent ? 'تم نسخ الكود!' : 'نسخ الكود'}
                  </button>
                </div>
                <pre>{highlightCode(codeContent)}</pre>
              </div>
            );
          } else {
            const textLines = part.split('\n');
            return textLines.map((line, lIdx) => {
              if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
                const cleanText = line.replace(/^[\s*-]+/, '').trim();
                return (
                  <ul key={`${index}-${lIdx}`}>
                    <li>{parseInlineFormatting(cleanText)}</li>
                  </ul>
                );
              }
              if (line.trim() === '') return <div key={`${index}-${lIdx}`} style={{ height: '6px' }} />;
              return <p key={`${index}-${lIdx}`}>{parseInlineFormatting(line)}</p>;
            });
          }
        })}
      </div>
    );
  };

  const parseInlineFormatting = (text: string) => {
    const boldParts = text.split(/(\*\*.*?\*\*)/g);
    return boldParts.map((bPart, idx) => {
      if (bPart.startsWith('**') && bPart.endsWith('**')) {
        const cleanBold = bPart.substring(2, bPart.length - 2);
        return <strong key={idx}>{parseInlineCode(cleanBold)}</strong>;
      }
      return parseInlineCode(bPart);
    });
  };

  const parseInlineCode = (text: string) => {
    const codeParts = text.split(/(`.*?`)/g);
    return codeParts.map((cPart, idx) => {
      if (cPart.startsWith('`') && cPart.endsWith('`')) {
        return <code key={idx} className="ac-code inline-code">{cPart.substring(1, cPart.length - 1)}</code>;
      }
      return cPart;
    });
  };

  return (
    <div className="ac-root">
      <div
        className={`ac-overlay${sidebarOpen && window.innerWidth < 768 ? ' visible' : ''}`}
        onClick={closeSidebar}
      />

      {/* Sidebar navigation */}
      <aside className={`ac-sidebar${sidebarOpen ? '' : ' closed'}`}>
        <div className="ac-sb-header">
          <div className="ac-sb-brand">
            <div className="ac-sb-brand-ico">
              <BotIcon />
            </div>
            <div className="ac-sb-brand-info">
              <span className="ac-sb-brand-name">مساعد عطاء</span>
              <span className="ac-sb-brand-sub">ذكاء اصطناعي</span>
            </div>
          </div>
          <button className="ac-sb-close-btn" onClick={closeSidebar} aria-label="إغلاق" type="button">
            <CloseIcon />
          </button>
        </div>

        <button className="ac-new-btn" onClick={clearChat}>
          <EditIcon />
          مسح المحادثة
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
              <i className={`ti ${link.icon}`} aria-hidden="true" style={{ fontSize: 16, flexShrink: 0 }} />
              <span style={{ marginRight: 8 }}>{link.label}</span>
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
        {/* Modern Navbar */}
        <div className="ac-topbar">
          <div className="ac-topbar-left">
            <button
              className="ac-menu-btn"
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); toggleSidebar(); }}
              aria-label="إظهار القائمة"
              type="button"
            >
              <MenuIcon />
            </button>
            <div className="ac-model-badge">
              <span className="ac-badge-dot" />
              مساعد عطاء AI
            </div>
          </div>

          <div className="ac-topbar-right">
            {!isEmpty && (
              <button
                type="button"
                className="ac-clear-btn-nav"
                onClick={clearChat}
                title="مسح المحادثة"
              >
                <TrashIcon />
                <span>مسح المحادثة</span>
              </button>
            )}
            <div className="ac-user-av" title={userName}>
              <UserIcon />
            </div>
          </div>
        </div>

        {/* Message Container */}
        <div
          className={`ac-msgs ${isEmpty ? 'ac-msgs-empty' : ''}`}
          ref={msgsRef}
          onMouseEnter={() => {
            if (isStreaming) {
              userHoveredDuringStream.current = true;
              stopStreamRef.current = true;
            }
          }}
        >
          <div className="ac-msgs-inner">
            {isEmpty ? (
              <div className="ac-welcome">
                <div className="ac-welcome-logo">
                  <BotIcon />
                </div>
                <h2>كيف يمكنني مساعدتك؟</h2>
                <p>اسألني عن الملابس المقبولة أو الجمعيات القريبة أو أرسل صورة ليتم تحليلها فوراً بالذكاء الاصطناعي</p>
                <div className="ac-cards">
                  {SUGGESTION_CARDS.map(c => (
                    <button key={c.title} className="ac-card" onClick={() => sendMessage(c.title)}>
                      <span className="ac-card-ico">{c.icon}</span>
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
                      {m.role === 'bot' ? <BotIcon /> : <UserIcon />}
                    </div>
                    <div className="ac-msg-body">
                      {m.role === 'bot' && <div className="ac-bot-label">مساعد عطاء</div>}
                      
                      {/* Replied to / Quote message bubble structure */}
                      {m.quoteText && (
                        <div className="ac-msg-quote">
                          <span className="ac-quote-sender">
                            {m.quoteSender === 'bot' ? 'مساعد عطاء' : 'الرسالة السابقة'}
                          </span>
                          <p className="ac-quote-body">{m.quoteText}</p>
                        </div>
                      )}

                      {m.imageUrls && m.imageUrls.length > 0 && (
                        <div className="ac-img-gallery">
                          {m.imageUrls.map((imgUrl, idx) => (
                            <div key={idx} className="ac-img-wrap">
                              <img src={imgUrl} alt={`صورة التبرع ${idx + 1}`} />
                            </div>
                          ))}
                        </div>
                      )}

                      {m.isAnalysis && (
                        <span className="ac-analysis-badge">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width:13, height:13 }}><circle cx="12" cy="12" r="10"/><path d="m8 10 3 3 5-5"/></svg>
                          تحليل ذكي
                        </span>
                      )}

                      {m.text && (
                        m.role === 'user' ? (
                          <div className="ac-bubble-user">{m.text}</div>
                        ) : (
                          <div className={`ac-text-bot ${isStreaming && i === messages.length - 1 ? 'ac-text-bot-streaming' : ''}`}>
                            {renderMarkdown(m.text)}
                            {isStreaming && i === messages.length - 1 && <span className="ac-cursor" />}
                          </div>
                        )
                      )}

                      {/* Sleek Action Buttons bar below bubble */}
                      <div className="ac-bubble-actions">
                        <button
                          type="button"
                          className="ac-action-btn"
                          onClick={() => setReplyingTo(m)}
                          title="رد"
                        >
                          <ReplyIcon />
                        </button>
                        <button
                          type="button"
                          className={`ac-action-btn${copiedIdx === i ? ' success' : ''}`}
                          onClick={() => handleCopyText(m.text || '', i)}
                          title="نسخ"
                        >
                          {copiedIdx === i ? <CheckIcon /> : <CopyIcon />}
                        </button>
                        <button
                          type="button"
                          className={`ac-action-btn${sharedIdx === i ? ' success' : ''}`}
                          onClick={() => handleShareMessage(m.text || '', i)}
                          title={sharedIdx === i ? 'تم النسخ!' : 'نسخ للمشاركة'}
                        >
                          {sharedIdx === i ? <CheckIcon /> : <ShareIcon />}
                        </button>
                        {m.timestamp && (
                          <span className="ac-msg-time">
                            {new Date(m.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {i < messages.length - 1 && <div className="ac-sep" />}
                </div>
              ))
            )}

            {/* Custom Streaming loading dots */}
            {loading && (
              <div className="ac-typing-row">
                <div className="ac-av ac-bot">
                  <BotIcon />
                </div>
                <div className="ac-typing"><span /><span /><span /></div>
              </div>
            )}

            {/* Stop streaming button — shown while streaming, hover triggers instant reveal */}
            {isStreaming && (
              <div className="ac-stream-stop-row">
                <button
                  type="button"
                  className="ac-stream-stop-btn"
                  onMouseEnter={() => { stopStreamRef.current = true; }}
                  onClick={() => { stopStreamRef.current = true; }}
                  title="إيقاف التوليد وعرض الرد كاملاً"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
                  إيقاف التوليد
                </button>
              </div>
            )}

            {showQuickReplies && !isEmpty && (
              <div className="ac-qr">
                {QUICK_REPLIES.map(qr => (
                  <button key={qr} className="ac-qr-btn" disabled={isBlocked} onClick={() => sendMessage(qr)}>
                    {qr}
                  </button>
                ))}
              </div>
            )}
            <div ref={msgsEndRef} style={{ height: 10 }} />
          </div>
        </div>

        {/* Input Control Zone */}
        <div className="ac-input-zone">
          <div className="ac-input-inner">
            <div className="ac-input-box">
              {/* Quote Reply bar if active */}
              {replyingTo && (
                <div className="ac-quote-preview">
                  <div className="ac-quote-preview-content">
                    <span className="ac-quote-preview-title">
                      الرد على {replyingTo.role === 'bot' ? 'مساعد عطاء' : 'الرسالة السابقة'}
                    </span>
                    <p className="ac-quote-preview-text">{replyingTo.text}</p>
                  </div>
                  <button
                    type="button"
                    className="ac-quote-preview-close"
                    onClick={() => setReplyingTo(null)}
                    title="إلغاء الرد"
                  >
                    <CloseIcon />
                  </button>
                </div>
              )}

              {pendingImages.length > 0 && (
                <div className="ac-pending">
                  <div className="ac-pending-gallery">
                    {pendingImages.map((img, idx) => (
                      <div key={idx} className="ac-pend-thumb">
                        <img src={img.preview} alt={`معاينة ${idx + 1}`} />
                        <button type="button" className="ac-pend-x" onClick={() => removeImage(idx)} aria-label="حذف الصورة">
                          <CloseIcon />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="ac-pend-label">
                    {pendingImages.length} من {MAX_IMAGES} صور
                    <span>جاهزة للتحليل الفوري</span>
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

              {/* Action row under input */}
              <div className="ac-input-actions-row">
                <div className="ac-input-actions-right">
                  <button
                    type="button"
                    className="ac-img-btn"
                    title={`إرفاق صور (${pendingImages.length}/${MAX_IMAGES})`}
                    aria-label="إرفاق صور"
                    disabled={pendingImages.length >= MAX_IMAGES}
                    onClick={() => fileRef.current?.click()}
                  >
                    <ImageIcon />
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
                    className="ac-send-btn"
                    disabled={!canSend}
                    onClick={handleSubmit}
                    aria-label="إرسال"
                  >
                    <SendIcon />
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
  );
}