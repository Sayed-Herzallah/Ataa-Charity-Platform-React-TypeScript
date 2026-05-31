// // ─── HTTP Client — token without "Bearer" prefix + automatic refresh ──────────

// const BASE_URL = import.meta.env.VITE_API_URL || 'https://ataa-charity-platform.vercel.app';

// function getToken(): string | null {
//   return localStorage.getItem('accessToken');
// }

// function getRefreshToken(): string | null {
//   return localStorage.getItem('refreshToken');
// }

// async function refreshAccessToken(): Promise<string | null> {
//   const refreshToken = getRefreshToken();
//   if (!refreshToken) return null;

//   try {
//     const res = await fetch(`${BASE_URL}/auth/refreshToken`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ refreshToken }),
//     });

//     if (!res.ok) return null;

//     const data = await res.json();

//     // Backend returns: { tokens: { accessToken, refreshToken? } }
//     const newToken = data?.tokens?.accessToken;
//     if (!newToken) return null;

//     localStorage.setItem('accessToken', newToken);

//     const newRefresh = data?.tokens?.refreshToken;
//     if (newRefresh) {
//       localStorage.setItem('refreshToken', newRefresh);
//     }

//     return newToken;
//   } catch (error) {
//     console.error('❌ Token refresh failed:', error);
//     return null;
//   }
// }

// export async function request<T = any>(
//   path: string,
//   options: RequestInit = {},
//   isFormData = false,
//   requiresAuth = false
// ): Promise<T> {
//   const token = getToken();

//   const headers: Record<string, string> = {};

//   // No Content-Type for FormData — browser sets it automatically with boundary
//   if (!isFormData) {
//     headers['Content-Type'] = 'application/json';
//   }

//   // Send token WITHOUT "Bearer" prefix — matches backend expectation
//   if (token) {
//     headers['Authorization'] = token;
//   }

//   let res = await fetch(`${BASE_URL}${path}`, {
//     ...options,
//     headers: { ...headers, ...(options.headers as Record<string, string> || {}) },
//   });

//   // If 401 and we have a token — attempt refresh
//   if (res.status === 401 && token) {
//     const newToken = await refreshAccessToken();

//     if (newToken) {
//       res = await fetch(`${BASE_URL}${path}`, {
//         ...options,
//         headers: {
//           ...headers,
//           Authorization: newToken,
//           ...(options.headers as Record<string, string> || {}),
//         },
//       });
//     } else {
//       localStorage.removeItem('accessToken');
//       localStorage.removeItem('refreshToken');

//       if (requiresAuth) {
//         window.location.href = '/';
//       }

//       throw new Error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجددًا');
//     }
//   }

//   // Parse response
//   const contentType = res.headers.get('content-type');
//   let data: any;
//   try {
//     data = contentType?.includes('application/json')
//       ? await res.json()
//       : { success: res.ok, message: await res.text() };
//   } catch {
//     data = { success: res.ok, message: 'فشل في قراءة الرد' };
//   }

//   if (!res.ok) {
//     console.error(`❌ API Error [${res.status}] ${path}:`, data);

//     const raw =
//       data?.message ||
//       data?.error ||
//       data?.msg ||
//       data?.errors ||
//       data?.detail ||
//       null;

//     let msg: string;
//     if (!raw) {
//       if (res.status === 400)      msg = 'بيانات غير صحيحة، تحقق من المدخلات';
//       else if (res.status === 401) msg = 'غير مصرح، يرجى تسجيل الدخول';
//       else if (res.status === 403) msg = 'ليس لديك صلاحية للقيام بهذا الإجراء';
//       else if (res.status === 404) msg = 'المورد المطلوب غير موجود';
//       else if (res.status === 409) msg = 'البريد الإلكتروني أو رقم الهاتف مستخدم بالفعل';
//       else if (res.status === 500) msg = 'خطأ في الخادم، يرجى المحاولة لاحقاً';
//       else                         msg = `حدث خطأ (${res.status})`;
//     } else if (Array.isArray(raw)) {
//       const first = raw[0];
//       msg = typeof first === 'string' ? first : first?.message || JSON.stringify(first);
//     } else if (typeof raw === 'object') {
//       msg = raw?.message || raw?.msg || JSON.stringify(raw);
//     } else {
//       msg = String(raw);
//     }

//     throw new Error(msg || 'حدث خطأ غير متوقع');
//   }

//   return data as T;
// }

// ─── HTTP Client — token without "Bearer" prefix + automatic refresh ──────────
import { loadingEvents } from '../utils/loadingEvents';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://ataa-charity-platform.vercel.app';

function getToken(): string | null {
  return localStorage.getItem('accessToken');
}

function getRefreshToken(): string | null {
  return localStorage.getItem('refreshToken');
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${BASE_URL}/auth/refreshToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) return null;

    const data = await res.json();

    // Backend returns: { tokens: { accessToken, refreshToken? } }
    const newToken = data?.tokens?.accessToken;
    if (!newToken) return null;

    localStorage.setItem('accessToken', newToken);

    const newRefresh = data?.tokens?.refreshToken;
    if (newRefresh) {
      localStorage.setItem('refreshToken', newRefresh);
    }

    return newToken;
  } catch (error) {
    console.error('❌ Token refresh failed:', error);
    return null;
  }
}

export async function request<T = any>(
  path: string,
  options: RequestInit = {},
  isFormData = false,
  requiresAuth = false
): Promise<T> {
  loadingEvents.start();
  try {
    const token = getToken();

    const headers: Record<string, string> = {};

    // No Content-Type for FormData — browser sets it automatically with boundary
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    // Send token WITHOUT "Bearer" prefix — matches backend expectation
    if (token) {
      headers['Authorization'] = token;
    }

    let res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: { ...headers, ...(options.headers as Record<string, string> || {}) },
    });

    // If 401 and we have a token — attempt refresh
    if (res.status === 401 && token) {
      const newToken = await refreshAccessToken();

      if (newToken) {
        res = await fetch(`${BASE_URL}${path}`, {
          ...options,
          headers: {
            ...headers,
            Authorization: newToken,
            ...(options.headers as Record<string, string> || {}),
          },
        });
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');

        if (requiresAuth) {
          window.location.href = '/';
        }

        throw new Error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجددًا');
      }
    }

    // Parse response
    const contentType = res.headers.get('content-type');
    let data: any;
    try {
      data = contentType?.includes('application/json')
        ? await res.json()
        : { success: res.ok, message: await res.text() };
    } catch {
      data = { success: res.ok, message: 'فشل في قراءة الرد' };
    }

    if (!res.ok) {
      console.error(`❌ API Error [${res.status}] ${path}:`, data);

      const raw =
        data?.message ||
        data?.error ||
        data?.msg ||
        data?.errors ||
        data?.detail ||
        null;

      let msg: string;
      if (!raw) {
        if (res.status === 400)      msg = 'بيانات غير صحيحة، تحقق من المدخلات';
        else if (res.status === 401) msg = 'غير مصرح، يرجى تسجيل الدخول';
        else if (res.status === 403) msg = 'ليس لديك صلاحية للقيام بهذا الإجراء';
        else if (res.status === 404) msg = 'المورد المطلوب غير موجود';
        else if (res.status === 409) msg = 'البريد الإلكتروني أو رقم الهاتف مستخدم بالفعل';
        else if (res.status === 500) msg = 'خطأ في الخادم، يرجى المحاولة لاحقاً';
        else                         msg = `حدث خطأ (${res.status})`;
      } else if (Array.isArray(raw)) {
        msg = raw.map((e: any) =>
          typeof e === 'string' ? e : e?.message || e?.msg || JSON.stringify(e)
        ).join(' | ');
      } else if (typeof raw === 'object') {
        msg = raw?.message || raw?.msg || JSON.stringify(raw);
      } else {
        msg = String(raw);
      }

      throw new Error(msg || 'حدث خطأ غير متوقع');
    }

    return data as T;
  } finally {
    loadingEvents.stop();
  }
}