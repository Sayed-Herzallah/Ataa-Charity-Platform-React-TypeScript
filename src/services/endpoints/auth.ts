// ─── AUTH ENDPOINTS ───────────────────────────────────────────────────────────

import { request } from '../api.client';
import type { LoginResponse, RegisterResponse } from '../types';

export const authApi = {

  register: (body: {
    // Required for all roles
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
    address: string;
    roleType: 'user' | 'charity' | 'admin';
    // user + admin
    userName?: string;
    // charity only
    charityName?: string;
    charityDescription?: string;
    licenseNumber?: string;
    // admin only — capital D as in the API
    nationalID?: string;
  }) =>
    request<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: async (body: { email: string; password: string }) => {
    const data = await request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const tokens = data?.tokens || {
      accessToken: data?.accessToken || data?.token,
      refreshToken: data?.refreshToken || data?.refresh,
    };

    const user =
      data?.user ||
      data?.finder ||
      data?.account ||
      data?.data?.user ||
      data?.data?.finder ||
      data?.result?.user ||
      data?.result?.finder ||
      (data?.data && !data.data.accessToken && !data.data.token ? data.data : null);

    return {
      ...data,
      tokens,
      user,
    } as LoginResponse;
  },

  verifyEmail: (body: { email: string; code: string }) =>
    request('/auth/verifyEmail', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  forgetPassword: (body: { email: string }) =>
    request('/auth/forgetPassword', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  forgotPassword: (body: { email: string }) =>
    request('/auth/forgetPassword', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  resendVerification: (body: { email: string }) =>
    request('/auth/resendVerification', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  resetPassword: (body: {
    email: string;
    code: string;
    password: string;
    confirmPassword: string;
  }) =>
    request('/auth/resetPassword', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  refreshToken: (refreshToken: string) =>
    request('/auth/refreshToken', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),
};
