// ─── Admin Panel — Types & Config ────────────────────────────────────────────

import { request } from '../../services/api.client';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface User {
  _id: string;
  userName: string;
  email: string;
  phone?: string;
  address?: string;
  roleType: 'admin' | 'charity' | 'user';
  isVerified?: boolean;
  verify?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Charity {
  _id: string;
  charityName: string;
  email: string;
  phone?: string;
  address: string;
  description?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  licenseNumber?: string;
  rejectionReason?: string;
  createdAt?: string;
  userId?: string;
}

export interface Report {
  _id: string;
  userId?: string;
  userName?: string;
  charityName?: string;
  description: string;
  senderType?: string;
  createdAt: string;
}

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: 'danger' | 'ok';
  icon?: string;
  onConfirm: () => void;
}

// ── UPDATED: added 'settings' and 'ai-chat' tabs ──
export type Tab           = 'overview' | 'users' | 'charities' | 'reports' | 'automation' | 'settings' | 'ai-chat';
export type ViewMode      = 'table' | 'cards';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

// ── Config maps — FIXED for dark theme ───────────────────────────────────────

export const APPROVAL_CFG = {
  pending:  { label: 'معلق',   bg: 'rgba(245,158,11,0.14)',  color: '#f59e0b', dot: '#f59e0b' },
  approved: { label: 'مقبول',  bg: 'rgba(16,185,129,0.14)',  color: '#10b981', dot: '#10b981' },
  rejected: { label: 'مرفوض', bg: 'rgba(244,63,94,0.14)',   color: '#f43f5e', dot: '#f43f5e' },
} as const;

export const ROLE_CFG = {
  admin:   { label: 'أدمن',  bg: 'rgba(167,139,250,0.14)', color: '#a78bfa', icon: '🛡️' },
  charity: { label: 'جمعية', bg: 'rgba(59,130,246,0.14)',  color: '#3b82f6', icon: '🏛️' },
  user:    { label: 'متبرع', bg: 'rgba(16,185,129,0.14)',  color: '#10b981', icon: '👤' },
} as const;

// ── Design tokens ─────────────────────────────────────────────────────────────

export const TEAL   = '#0F6E56';
export const TEAL2  = '#1D9E75';
export const AMBER  = '#f59e0b';
export const GREEN  = '#10b981';
export const RED    = '#f43f5e';
export const BORDER = '#e5e7eb';

// ── API helpers ───────────────────────────────────────────────────────────────

export const apiFetch: typeof request = async (path: string, opts?: any) => {
  const res = await request(path, opts);
  if (import.meta.env?.DEV) {
    console.log(`[apiFetch] ${path}`, res);
  }
  return res;
};

export async function fetchPage<T extends { _id?: string }>(
  basePath: string,
  page: number,
  limit = 10,
): Promise<{ data: T[]; total: number; hasMore: boolean }> {
  try {
    const sep = basePath.includes('?') ? '&' : '?';
    const res = await request<any>(
      `${basePath}${sep}page=${page}&limit=${limit}`
    );

    function findArray(obj: any, depth = 0): T[] | null {
      if (depth > 4) return null;
      if (Array.isArray(obj)) return obj as T[];
      if (!obj || typeof obj !== 'object') return null;
      const priorityKeys = ['Data','data','users','charities','reports','items','list','results','records'];
      for (const key of priorityKeys) {
        if (Array.isArray(obj[key])) return obj[key] as T[];
      }
      for (const key of Object.keys(obj)) {
        const found = findArray(obj[key], depth + 1);
        if (found && found.length > 0) return found;
      }
      return null;
    }

    function findTotal(obj: any, depth = 0): number {
      if (depth > 4) return 0;
      if (!obj || typeof obj !== 'object') return 0;
      const totalKeys = ['Total_Items','totalItems','totalCount','total','count','Total','total_count','TotalItems'];
      for (const key of totalKeys) {
        if (typeof obj[key] === 'number' && obj[key] > 0) return obj[key];
      }
      for (const key of Object.keys(obj)) {
        if (Array.isArray(obj[key])) continue;
        const found = findTotal(obj[key], depth + 1);
        if (found > 0) return found;
      }
      return 0;
    }

    const rawData: T[] = findArray(res) ?? [];
    const total: number = findTotal(res) || rawData.length;
    const loadedSoFar = (page - 1) * limit + rawData.length;
    const hasMore = total > rawData.length ? loadedSoFar < total : rawData.length === limit;

    if (import.meta.env?.DEV) {
      console.log(`[fetchPage] ${basePath} → found ${rawData.length} items, total=${total}, hasMore=${hasMore}`);
    }

    return { data: rawData, total: total || rawData.length, hasMore };
  } catch (error) {
    console.error(`[fetchPage] Error fetching ${basePath}:`, error);
    return { data: [], total: 0, hasMore: false };
  }
}

export function fmt(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric', month: 'short', day: 'numeric',
  }).format(new Date(dateStr));
}