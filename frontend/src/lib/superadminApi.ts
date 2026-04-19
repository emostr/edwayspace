'use client';

import { API_URL } from './constants';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('superadmin_token');
}

export function saveSuperadminToken(token: string): void {
  localStorage.setItem('superadmin_token', token);
  document.cookie = `superadmin_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`;
}

export function removeSuperadminToken(): void {
  localStorage.removeItem('superadmin_token');
  document.cookie = 'superadmin_token=; path=/; max-age=0';
}

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

async function request<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
    removeSuperadminToken();
    window.location.href = '/superadmin';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw Object.assign(new Error(err?.message ?? 'Request failed'), { status: response.status, data: err });
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const superadminApi = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
  patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
  delete: <T = void>(path: string) => request<T>('DELETE', path),
};
