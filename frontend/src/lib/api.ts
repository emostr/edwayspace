import { API_URL } from './constants';
import { getToken, removeToken } from './auth';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

let networkErrorHandler: ((msg: string) => void) | null = null;

export function registerNetworkErrorHandler(handler: (msg: string) => void) {
  networkErrorHandler = handler;
}

async function request<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    networkErrorHandler?.('Ошибка сети. Проверьте подключение.');
    throw new Error('Network error');
  }

  if (response.status === 401) {
    removeToken();
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw Object.assign(new Error(err?.message ?? 'Request failed'), { status: response.status, data: err });
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
  patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
  delete: <T = void>(path: string) => request<T>('DELETE', path),
};
