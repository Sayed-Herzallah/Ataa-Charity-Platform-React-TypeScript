// ─── CHARITIES ENDPOINTS ─────────────────────────────────────────────────────

import { request } from '../api.client';
import type { Charity } from '../types';

export const charityApi = {
  /** GET /charity/charities */
  getAll: () =>
    request<{ success: boolean; charities: Charity[]; result?: any }>('/charity/charities'),

  /** GET /charity/:id */
  getById: (id: string) =>
    request<{ success: boolean; charity: Charity }>(`/charity/${id}`),

  /** PATCH /charity/:id — Charity owner or Admin */
  update: (
    id: string,
    body: Partial<{ charityName: string; address: string; description: string }>
  ) =>
    request(`/charity/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  /** DELETE /charity/:id — Admin only */
  delete: (id: string) =>
    request(`/charity/${id}`, { method: 'DELETE' }, false, true),

  /** PATCH /charity/:id/approve — Admin only */
  approve: (id: string) =>
    request(`/charity/${id}/approve`, { method: 'PATCH' }, false, true),

  /** PATCH /charity/:id/reject — Admin only */
  reject: (id: string, reason: string) =>
    request(`/charity/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    }, false, true),
};
