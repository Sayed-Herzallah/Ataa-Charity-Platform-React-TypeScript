// ─── DONATIONS ENDPOINTS ─────────────────────────────────────────────────────

import { request } from '../api.client';
import type { Donation } from '../types';

export const donorApi = {
  /**
   * POST /donor — FormData
   * Fields: type, size, quantity, condition, description?, images[]
   * Donation is distributed to all charities — no charityId needed
   */
  create: (formData: FormData) =>
    request('/donor', { method: 'POST', body: formData }, true),

  /** GET /donor — returns { success, donations } — no pagination params supported */
  getMyDonations: () =>
    request<{ success: boolean; donations?: Donation[]; Data?: Donation[] }>('/donor?limit=1000'),
};