'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const ROLE_RANK: Record<string, number> = {
  STUDENT: 0,
  TRUSTED_STUDENT: 1,
  TEACHER: 2,
  CLASS_HEAD: 3,
  ZAVUCH: 4,
};

export function useGuard(minRole: string): boolean {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const authorized = !isLoading && !!user && (ROLE_RANK[user.role] ?? 0) >= (ROLE_RANK[minRole] ?? 0);
  const unauthorized = !isLoading && !authorized;

  useEffect(() => {
    if (unauthorized) router.replace('/dashboard');
  }, [unauthorized, router]);

  return authorized;
}
