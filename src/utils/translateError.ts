/**
 * Utility to translate English API and Network error messages to clean, professional, and natural Arabic sentences.
 * This ensures no English error text is ever shown to the user in toast notifications or error badges.
 */
export function translateError(error: any): string {
  if (!error) return 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى.';
  
  let msg = '';
  if (typeof error === 'string') {
    msg = error;
  } else if (error instanceof Error) {
    msg = error.message;
  } else if (error.response?.data?.message) {
    msg = error.response.data.message;
  } else if (error.message) {
    msg = error.message;
  } else {
    msg = String(error);
  }

  const lowercaseMsg = msg.toLowerCase().trim();

  // 1. Network & Server Errors
  if (lowercaseMsg.includes('network error') || lowercaseMsg.includes('failed to fetch')) {
    return 'فشل الاتصال بالشبكة! يرجى التحقق من اتصالك بالإنترنت .';
  }
  if (lowercaseMsg.includes('server error') || lowercaseMsg.includes('500') || lowercaseMsg.includes('internal server')) {
    return 'حدث خطأ في خادم المنصة الرئيسي! يرجى المحاولة مرة أخرى لاحقًا.';
  }

  // 2. Authentication & Authorization Errors
  if (lowercaseMsg.includes('unauthorized') || lowercaseMsg.includes('not authenticated') || lowercaseMsg.includes('token expired') || lowercaseMsg.includes('jwt expired') || lowercaseMsg.includes('no token')) {
    return 'انتهت صلاحية الجلسة أو غير مصرح بالدخول! يرجى إعادة تسجيل الدخول للمتابعة.';
  }
  if (lowercaseMsg.includes('invalid credentials') || lowercaseMsg.includes('incorrect password') || lowercaseMsg.includes('wrong password') || lowercaseMsg.includes('password is incorrect') || lowercaseMsg.includes('email or password')) {
    return 'البريد الإلكتروني أو كلمة المرور غير صحيحة، يرجى التحقق وإعادة المحاولة.';
  }
  if (lowercaseMsg.includes('access denied') || lowercaseMsg.includes('forbidden') || lowercaseMsg.includes('403')) {
    return 'عذرًا، ليس لديك الصلاحية الكافية للوصول إلى هذه الصفحة أو تنفيذ هذا الإجراء!';
  }

  // 3. User & Registration Errors
  if (lowercaseMsg.includes('email already exists') || lowercaseMsg.includes('email already registered') || lowercaseMsg.includes('email in use') || lowercaseMsg.includes('user already exists')) {
    return 'البريد الإلكتروني مسجل بالفعل بالمنصة! يرجى تسجيل الدخول أو استخدام بريد آخر.';
  }
  if (lowercaseMsg.includes('user not found') || lowercaseMsg.includes('no user found') || lowercaseMsg.includes('account not found')) {
    return 'المستخدم غير موجود بالمنصة أو تم حذف الحساب!';
  }

  // 4. Validation Errors
  if (lowercaseMsg.includes('validation failed') || lowercaseMsg.includes('invalid input') || lowercaseMsg.includes('required')) {
    return 'يرجى التأكد من ملء جميع الحقول المطلوبة بشكل صحيح ومطابقة الشروط.';
  }

  // 5. Special Platform States (Charity approval states)
  if (lowercaseMsg.includes('pending') || lowercaseMsg.includes('not approved') || lowercaseMsg.includes('under review')) {
    return 'حساب الجمعية الخاص بك قيد المراجعة والتدقيق حالياً من قِبل المشرفين، سيتم إعلامك بالقبول قريباً.';
  }
  if (lowercaseMsg.includes('reject') || lowercaseMsg.includes('refused')) {
    return 'عذرًا، لقد تم رفض طلب تسجيل هذا الحساب من قِبل الإدارة. يرجى مراجعة الدعم الفني.';
  }

  // 6. Generic Cleanups for common English expressions
  if (lowercaseMsg.includes('something went wrong')) {
    return 'حدث خطأ غير متوقع أثناء المعالجة، يرجى المحاولة مجدداً.';
  }

  // Fallback: If it's already in Arabic or is a custom message, return as is.
  return msg;
}
