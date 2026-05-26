import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { usersApi } from '../services';

interface AuthContextType {
  user: any;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (accessToken: string, refreshToken?: string, userData?: any) => Promise<any>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  pendingVerify: { email: string; name: string; role: 'user' | 'charity' | 'admin' } | null;
  setPendingVerify: (pending: { email: string; name: string; role: 'user' | 'charity' | 'admin' } | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isLoggedIn: false,
  login: async () => {},
  logout: () => {},
  refreshUser: async () => {},
  pendingVerify: null,
  setPendingVerify: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingVerify, setPendingVerify] = useState<{ email: string; name: string; role: 'user' | 'charity' | 'admin' } | null>(null);

  // ✅ دالة واحدة فقط لاستخراج الـ user من أي format يرجعه الـ Backend
  const decodeJwtPayload = useCallback((token: string): any => {
    try {
      const [, payload] = token.split('.');
      if (!payload) return null;
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(normalized)
          .split('')
          .map(char => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
          .join('')
      );
      return JSON.parse(json);
    } catch {
      return null;
    }
  }, []);

  const normalizeRole = useCallback((role: any): 'user' | 'charity' | 'admin' => {
    const normalized = String(role || '').toLowerCase().trim().replace(/\s+/g, '');
    if (normalized === 'admin' || normalized === 'مدير') return 'admin';
    if (normalized === 'charity' || normalized === 'charityorganization' || normalized === 'جمعية') return 'charity';
    return 'user';
  }, []);

  const normalizeUser = useCallback((userData: any, token?: string): any => {
    if (!userData && !token) return null;
    const tokenData = token ? decodeJwtPayload(token) : null;
    const merged = { ...(tokenData || {}), ...(userData || {}) };
    return {
      ...merged,
      _id: merged._id || merged.id || merged.userId,
      roleType: normalizeRole(merged.roleType || merged.role || merged.userRole || merged.type),
    };
  }, [decodeJwtPayload, normalizeRole]);

  const extractUser = useCallback((data: any): any => {
    return (
      data?.user ||
      data?.finder ||
      data?.account ||
      data?.data?.user ||
      data?.data?.finder ||
      data?.result?.user ||
      data?.result?.finder ||
      data?.data ||
      data?.result ||
      null
    );
  }, []);

  // ✅ عند أول تحميل — لو في توكن محفوظ جيب بيانات المستخدم
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      try {
        const d = await usersApi.getProfile();
        const userData = extractUser(d);
        
        if (userData) {
          // ✅ نقبل الـ user حتى لو roleType مش موجود — نستخدم 'user' كـ default
          const normalizedUser = normalizeUser(userData, token);
          setUser(normalizedUser);
        } else if (decodeJwtPayload(token)) {
          setUser(normalizeUser(null, token));
        } else {
          // لو مرجعش بيانات خالص، احذف التوكن
          console.warn('⚠️ initAuth: no user data returned, clearing tokens');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      } catch (error) {
        console.error('❌ Auth init error:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setIsLoading(false);
      }
    };
    
    initAuth();
  }, [decodeJwtPayload, extractUser, normalizeUser]);

  // ✅ دالة اللوجين — واحدة فقط
  const login = async (accessToken: string, refreshToken?: string, userData?: any) => {
    // ✅ أول حاجة نخزن التوكنات
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    } else {
      localStorage.removeItem('refreshToken');
    }

    // لو جاي بيانات المستخدم من برا، استخدمها فورًا بدون ما نطلب البروفايل
    if (userData) {
      const normalizedUser = normalizeUser(userData, accessToken);
      setUser(normalizedUser);
      return normalizedUser;
    }

    // لو مفيش بيانات، اطلب البروفايل من الـ API
    try {
      const d = await usersApi.getProfile();
      const fetchedUser = extractUser(d);
      
      if (fetchedUser) {
        const normalizedUser = normalizeUser(fetchedUser, accessToken);
        setUser(normalizedUser);
        return normalizedUser;
      }
    } catch (error) {
      console.error('❌ Login: Failed to fetch full profile after login', error);
      // ✅ مش نحذف التوكن — التوكن اتخزن صح، مشكلة في جلب البروفايل بس
    }

    const tokenUser = normalizeUser(null, accessToken);
    if (tokenUser) {
      setUser(tokenUser);
      return tokenUser;
    }

    return null;
  };

  // ✅ دالة اللوجاوت
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  // ✅ دالة الريفرش
  const refreshUser = async () => {
    try {
      const d = await usersApi.getProfile();
      const userData = extractUser(d);
      if (userData) {
        const normalizedUser = normalizeUser(userData, localStorage.getItem('accessToken') || undefined);
        setUser(normalizedUser);
      }
    } catch (error) {
      console.error('❌ refreshUser error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isLoggedIn: !!user, login, logout, refreshUser, pendingVerify, setPendingVerify }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
