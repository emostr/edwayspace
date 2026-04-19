'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSuperadminAuth } from '@/hooks/useSuperadminAuth';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import styles from './superadmin.module.css';

export default function SuperadminLoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, login } = useSuperadminAuth();
  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/superadmin/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(loginValue, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading || isAuthenticated) return null;

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.card}>
          <p className={styles.badge}>СУПЕРАДМИН</p>
          <h1 className={styles.title}>Панель управления</h1>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Логин</label>
              <Input
                type="text"
                placeholder="Введите логин"
                value={loginValue}
                onChange={setLoginValue}
                autoComplete="username"
                disabled={submitting}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Пароль</label>
              <Input
                type="password"
                placeholder="Введите пароль"
                value={password}
                onChange={setPassword}
                autoComplete="current-password"
                disabled={submitting}
              />
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <Button type="submit" fullWidth loading={submitting} disabled={submitting}>
              Войти
            </Button>
          </form>

          <p className={styles.footerNote}>Только для владельца платформы</p>
        </div>
      </main>
    </div>
  );
}
