// /**
//  * translation utility for backend-generated English notifications to friendly Arabic!
//  */
// export const translateNotification = (msg: string): string => {
//   if (!msg) return '';
//   const m = msg.trim();
//   const lower = m.toLowerCase();

//   if (lower.startsWith('your donation request has been accepted')) {
//     return 'تم قبول طلب تبرعك بنجاح من قِبل الجمعية 🎉';
//   }
//   if (lower.startsWith('your donation request has been rejected')) {
//     return 'للأسف، تم رفض طلب تبرعك من قِبل الجمعية 😔';
//   }
//   if (lower.startsWith('your donation request has been delivered')) {
//     return 'تم تسليم تبرع الخير بنجاح للجمعية المستفيدة 🚚';
//   }
//   if (lower.startsWith('your donation request has been completed')) {
//     return 'اكتملت عملية تبرع الخير بنجاح، شكراً لمساهمتك الكريمة 🌟';
//   }
//   if (lower.startsWith('your charity account has been approved')) {
//     return 'تهانينا! تم تفعيل حساب الجمعية الخاص بك بنجاح، يمكنك الآن البدء باستقبال التبرعات 🏢';
//   }
//   if (lower.startsWith('your charity account has been rejected')) {
//     const reason = msg.split(/reason:/i)[1] || '';
//     return `للأسف، تم رفض حساب الجمعية الخاص بك. السبب: ${reason.trim() || 'غير محدد'}`;
//   }
//   if (lower.startsWith('new donation request created') || lower.startsWith('new donation request')) {
//     return 'تم تسجيل طلب تبرع جديد بالخير في المنطقة 📦';
//   }

//   return msg;
// };

/**
 * translateNotification.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * ترجمة جميع إشعارات الباك إند (الإنجليزية) إلى العربية تلقائياً.
 * يستخدم mapping دقيق + fallback ذكي بالـ keywords.
 * لا يتطلب أي تعديل على الباك إند.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── 1. Mapping دقيق للجمل الكاملة ────────────────────────────────────────────
const EXACT_MAP: Record<string, string> = {
  // Donation status
  'your donation request has been accepted':
    'تم قبول طلب تبرعك بنجاح 🎉',
  'your donation has been accepted':
    'تم قبول تبرعك بنجاح 🎉',
  'your donation request has been rejected':
    'للأسف، تم رفض طلب تبرعك 😔',
  'your donation has been rejected':
    'للأسف، تم رفض تبرعك 😔',
  'your donation request has been delivered':
    'تم تسليم تبرعك للجمعية بنجاح 🚚',
  'your donation has been delivered':
    'تم تسليم تبرعك للجمعية بنجاح 🚚',
  'your donation request has been completed':
    'اكتملت عملية تبرعك بنجاح، شكراً لمساهمتك 🌟',
  'your donation has been completed':
    'اكتملت عملية تبرعك بنجاح، شكراً لمساهمتك 🌟',
  'your donation request is under review':
    'طلب تبرعك قيد المراجعة الآن ⏳',
  'your donation is pending review':
    'طلب تبرعك قيد المراجعة الآن ⏳',
  'new donation request created':
    'تم تسجيل طلب تبرع جديد 📦',
  'new donation request received':
    'وصل طلب تبرع جديد 📦',
  'you have a new donation':
    'لديك تبرع جديد 📦',
  'you have a new donation request':
    'لديك طلب تبرع جديد 📦',

  // Charity account
  'your charity account has been approved':
    'تهانينا! تم قبول حساب الجمعية الخاص بك وتفعيله بنجاح 🏢',
  'your charity has been approved':
    'تهانينا! تم قبول جمعيتك وتفعيلها بنجاح 🏢',
  'your charity account has been rejected':
    'للأسف، تم رفض حساب الجمعية الخاص بك',
  'your charity has been rejected':
    'للأسف، تم رفض جمعيتك',
  'your charity account is under review':
    'جمعيتك قيد المراجعة والتدقيق الآن ⏳',
  'your charity account has been suspended':
    'تم تعليق حساب الجمعية مؤقتاً ⚠️',
  'your charity account has been banned':
    'تم حظر حساب الجمعية ⛔',
  'your charity account has been reactivated':
    'تم إعادة تفعيل حساب الجمعية بنجاح ✅',

  // User account
  'your account has been verified':
    'تم التحقق من حسابك بنجاح ✅',
  'your email has been verified':
    'تم التحقق من بريدك الإلكتروني بنجاح ✅',
  'your account has been suspended':
    'تم تعليق حسابك مؤقتاً ⚠️',
  'your account has been banned':
    'تم حظر حسابك ⛔',
  'your account has been activated':
    'تم تفعيل حسابك بنجاح ✅',
  'your account has been deactivated':
    'تم تعطيل حسابك ⚠️',
  'your account has been deleted':
    'تم حذف حسابك من المنصة',

  // Password & security
  'your password has been changed':
    'تم تغيير كلمة المرور بنجاح 🔐',
  'password changed successfully':
    'تم تغيير كلمة المرور بنجاح 🔐',
  'password reset successfully':
    'تم إعادة تعيين كلمة المرور بنجاح 🔐',
  'your password was reset':
    'تم إعادة تعيين كلمة المرور الخاصة بك 🔐',

  // Reports
  'your report has been received':
    'تم استلام بلاغك وسيتم مراجعته قريباً 📋',
  'your report has been resolved':
    'تم حل بلاغك بنجاح ✅',
  'your report is under review':
    'بلاغك قيد المراجعة الآن 📋',
  'your report has been rejected':
    'للأسف، تم رفض بلاغك',

  // Admin messages
  'you have a new message from admin':
    'لديك رسالة جديدة من المسؤول 📩',
  'new message from admin':
    'رسالة جديدة من المسؤول 📩',
  'admin has sent you a message':
    'أرسل إليك المسؤول رسالة جديدة 📩',

  // System & welcome
  'welcome to the platform':
    'مرحباً بك في منصة عطاء! 👋',
  'welcome to ata platform':
    'مرحباً بك في منصة عطاء! 👋',
  'account created successfully':
    'تم إنشاء حسابك بنجاح في المنصة ✅',
  'registration successful':
    'تم التسجيل بنجاح في منصة عطاء ✅',

  // Reminders
  'you have pending donations':
    'لديك تبرعات قيد الانتظار ⏳',
  'reminder: complete your profile':
    'تذكير: يرجى إكمال بيانات ملفك الشخصي 📝',
  'reminder: verify your email':
    'تذكير: يرجى التحقق من بريدك الإلكتروني 📧',
};

// ── 2. Mapping بالـ keywords (للجمل غير الموجودة في الـ exact map) ─────────────
interface KeywordRule {
  keywords: string[];
  translation: string;
}

const KEYWORD_RULES: KeywordRule[] = [
  // Donation
  { keywords: ['donation', 'accept'],    translation: 'تم قبول تبرعك بنجاح 🎉' },
  { keywords: ['donation', 'reject'],    translation: 'للأسف، تم رفض طلب تبرعك 😔' },
  { keywords: ['donation', 'deliver'],   translation: 'تم تسليم تبرعك للجمعية بنجاح 🚚' },
  { keywords: ['donation', 'complet'],   translation: 'اكتملت عملية تبرعك بنجاح 🌟' },
  { keywords: ['donation', 'pend'],      translation: 'تبرعك قيد المراجعة الآن ⏳' },
  { keywords: ['donation', 'new'],       translation: 'وصل طلب تبرع جديد 📦' },
  { keywords: ['donation', 'cancel'],    translation: 'تم إلغاء طلب التبرع' },
  { keywords: ['donation'],             translation: 'إشعار خاص بتبرعك 📦' },

  // Charity
  { keywords: ['charity', 'approv'],     translation: 'تهانينا! تم قبول جمعيتك 🏢' },
  { keywords: ['charity', 'accept'],     translation: 'تهانينا! تم قبول جمعيتك 🏢' },
  { keywords: ['charity', 'reject'],     translation: 'للأسف، تم رفض جمعيتك' },
  { keywords: ['charity', 'suspend'],    translation: 'تم تعليق حساب الجمعية مؤقتاً ⚠️' },
  { keywords: ['charity', 'ban'],        translation: 'تم حظر حساب الجمعية ⛔' },
  { keywords: ['charity', 'activ'],      translation: 'تم تفعيل حساب الجمعية ✅' },
  { keywords: ['charity', 'pend'],       translation: 'جمعيتك قيد المراجعة ⏳' },
  { keywords: ['charity'],              translation: 'إشعار خاص بالجمعية 🏢' },

  // Account
  { keywords: ['account', 'verif'],      translation: 'تم التحقق من حسابك بنجاح ✅' },
  { keywords: ['account', 'suspend'],    translation: 'تم تعليق حسابك مؤقتاً ⚠️' },
  { keywords: ['account', 'ban'],        translation: 'تم حظر حسابك ⛔' },
  { keywords: ['account', 'activ'],      translation: 'تم تفعيل حسابك ✅' },
  { keywords: ['account', 'delet'],      translation: 'تم حذف حسابك' },
  { keywords: ['account', 'creat'],      translation: 'تم إنشاء حسابك بنجاح ✅' },
  { keywords: ['email', 'verif'],        translation: 'تم التحقق من بريدك الإلكتروني ✅' },

  // Password
  { keywords: ['password', 'change'],    translation: 'تم تغيير كلمة المرور بنجاح 🔐' },
  { keywords: ['password', 'reset'],     translation: 'تم إعادة تعيين كلمة المرور 🔐' },
  { keywords: ['password'],             translation: 'إشعار أمني بكلمة المرور 🔐' },

  // Reports
  { keywords: ['report', 'resolv'],      translation: 'تم حل بلاغك بنجاح ✅' },
  { keywords: ['report', 'receiv'],      translation: 'تم استلام بلاغك 📋' },
  { keywords: ['report', 'review'],      translation: 'بلاغك قيد المراجعة 📋' },
  { keywords: ['report', 'reject'],      translation: 'تم رفض بلاغك' },
  { keywords: ['report'],               translation: 'إشعار خاص بالبلاغات 📋' },

  // Admin
  { keywords: ['admin', 'message'],      translation: 'رسالة جديدة من المسؤول 📩' },
  { keywords: ['admin'],                translation: 'رسالة من إدارة المنصة 📩' },

  // System
  { keywords: ['welcome'],              translation: 'مرحباً بك في منصة عطاء! 👋' },
  { keywords: ['reminder'],             translation: 'تذكير من المنصة 🔔' },
  { keywords: ['system'],               translation: 'إشعار من نظام المنصة ⚙️' },
];

/**
 * ترجمة نص الإشعار من الإنجليزية إلى العربية.
 *
 * الخوارزمية:
 * 1. إذا كانت الرسالة عربية أصلاً → تُرجع كما هي.
 * 2. بحث بالجملة الكاملة في EXACT_MAP (case-insensitive).
 * 3. بحث بـ dynamic prefix مع reason (مثل rejection reason: ...).
 * 4. بحث بالـ keywords في KEYWORD_RULES.
 * 5. Fallback: تُرجع الرسالة الأصلية + ⚠️ لتنبيه المطور.
 */
export function translateNotification(msg: string): string {
  if (!msg) return '';

  const trimmed = msg.trim();

  // ── إذا كانت عربية أصلاً (أكثر من 40% عربي) ───────────────────────────────
  const arabicChars = (trimmed.match(/[\u0600-\u06FF]/g) || []).length;
  if (arabicChars / trimmed.length > 0.4) return trimmed;

  const lower = trimmed.toLowerCase();

  // ── 1. Exact match ────────────────────────────────────────────────────────
  for (const [key, value] of Object.entries(EXACT_MAP)) {
    if (lower === key || lower.startsWith(key)) return value;
  }

  // ── 2. Rejection with dynamic reason ─────────────────────────────────────
  const rejectionWithReason = lower.match(
    /your charity account has been rejected[\s.,]*(?:reason[:\s]+(.+))?/i
  );
  if (rejectionWithReason) {
    const reason = rejectionWithReason[1]?.trim();
    return reason
      ? `للأسف، تم رفض حساب الجمعية. السبب: ${reason}`
      : 'للأسف، تم رفض حساب الجمعية';
  }

  const donationRejection = lower.match(
    /your donation (?:request )?has been rejected[\s.,]*(?:reason[:\s]+(.+))?/i
  );
  if (donationRejection) {
    const reason = donationRejection[1]?.trim();
    return reason
      ? `للأسف، تم رفض تبرعك. السبب: ${reason}`
      : 'للأسف، تم رفض تبرعك 😔';
  }

  // ── 3. Keyword rules ──────────────────────────────────────────────────────
  for (const rule of KEYWORD_RULES) {
    if (rule.keywords.every(kw => lower.includes(kw))) {
      return rule.translation;
    }
  }

  // ── 4. Fallback ───────────────────────────────────────────────────────────
  // تُرجع الرسالة كما هي مع علامة تنبيه (لتسهيل اكتشاف الرسائل غير المترجمة)
  return `${trimmed} ⚠️`;
}

/**
 * ترجمة عنوان الإشعار (title) — أقصر وأكثر إيجازاً من message
 */
export function translateNotificationTitle(title: string): string {
  if (!title) return '';

  const arabicChars = (title.match(/[\u0600-\u06FF]/g) || []).length;
  if (arabicChars / title.length > 0.4) return title;

  const lower = title.toLowerCase().trim();

  const TITLE_MAP: Record<string, string> = {
    'donation accepted':         'تم قبول التبرع',
    'donation rejected':         'تم رفض التبرع',
    'donation delivered':        'تم تسليم التبرع',
    'donation completed':        'اكتمل التبرع',
    'donation pending':          'تبرع قيد المراجعة',
    'new donation':              'تبرع جديد',
    'charity approved':          'جمعية مقبولة',
    'charity rejected':          'جمعية مرفوضة',
    'charity suspended':         'جمعية موقوفة',
    'account verified':          'تم توثيق الحساب',
    'account suspended':         'حساب موقوف',
    'password changed':          'تغيير كلمة المرور',
    'report resolved':           'تم حل البلاغ',
    'new report':                'بلاغ جديد',
    'admin message':             'رسالة من الإدارة',
    'system notification':       'إشعار من النظام',
    'welcome':                   'مرحباً بك',
    'reminder':                  'تذكير',
  };

  for (const [key, value] of Object.entries(TITLE_MAP)) {
    if (lower.includes(key)) return value;
  }

  return title;
}

export default translateNotification;