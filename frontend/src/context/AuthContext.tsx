'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { LoadingScreen } from '@/components/LoadingScreen/LoadingScreen';
import {
  saveToken,
  removeToken,
  saveUserProfile,
  getUserProfile,
  removeUserProfile,
  isTokenExpired,
  UserProfile,
} from '@/lib/auth';

interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  login: (loginStr: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface LoginResponse {
  accessToken: string;
  mustChangePassword: boolean;
  user: UserProfile;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  function updateUser() {
    const profile = getUserProfile();
    setUser(profile);
  }

  useEffect(() => {
    if (!isTokenExpired()) {
      updateUser();
    }
    setIsLoading(false);
  }, []);

  async function login(loginStr: string, password: string): Promise<void> {
    const data = await api.post<LoginResponse>('/auth/login', { login: loginStr, password });
    saveToken(data.accessToken);
    saveUserProfile(data.user);
    setUser(data.user);
    if (data.mustChangePassword) {
      router.push('/change-password');
    } else {
      router.push('/dashboard');
    }
  }

  function logout(): void {
    removeToken();
    removeUserProfile();
    setUser(null);
    router.push('/login');
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
      <LoadingScreen visible={isLoading} />
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
