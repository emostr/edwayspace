'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { decodeJwt } from 'jose';
import { API_URL } from '@/lib/constants';
import { saveSuperadminToken, removeSuperadminToken } from '@/lib/superadminApi';

interface LoginResponse {
  accessToken: string;
  user: { role: string };
}

export function useSuperadminAuth() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('superadmin_token');
    if (token) {
      try {
        const payload = decodeJwt(token);
        const expired = Date.now() / 1000 > (payload.exp ?? 0);
        if (!expired && payload.role === 'SUPERADMIN') {
          setIsAuthenticated(true);
        } else {
          removeSuperadminToken();
        }
      } catch {
        removeSuperadminToken();
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (loginStr: string, password: string): Promise<void> => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login: loginStr, password }),
    });

    if (!res.ok) throw new Error('Неверный логин или пароль');

    const data: LoginResponse = await res.json();
    if (data.user.role !== 'SUPERADMIN') throw new Error('Нет доступа');

    saveSuperadminToken(data.accessToken);
    setIsAuthenticated(true);
    router.push('/superadmin/dashboard');
  }, [router]);

  const logout = useCallback(() => {
    removeSuperadminToken();
    setIsAuthenticated(false);
    router.push('/superadmin');
  }, [router]);

  return { isAuthenticated, isLoading, login, logout };
}
