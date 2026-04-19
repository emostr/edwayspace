'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { getToken, removeToken } from '@/lib/auth';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import styles from '@/app/auth.module.css';

function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Пароль должен содержать не менее 8 символов';
  if (!/[A-Z]/.test(password)) return 'Пароль должен содержать заглавные буквы';
  if (!/[a-z]/.test(password)) return 'Пароль должен содержать строчные буквы';
  if (!/[0-9]/.test(password)) return 'Пароль должен содержать цифры';
  if (!/[^A-Za-z0-9]/.test(password)) return 'Пароль должен содержать специальные символы';
  return null;
}

export default function ChangePasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.push('/login');
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    const validationError = validatePassword(newPassword);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/change-password', { newPassword });
      router.push('/dashboard');
    } catch {
      setError('Не удалось сменить пароль. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <span className={styles.logo}>edway.space Alpha</span>
          <nav className={styles.headerNav}>
            <a
              href="https://edway.space/pages/about.html"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.headerLink}
            >
              О платформе
            </a>
            <a href="/login" className={styles.headerLinkOutline}>
              Войти
            </a>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.card}>
          <p className={styles.badge}>Первый вход</p>
          <h1 className={styles.title}>Смените временный пароль</h1>
          <p className={styles.subtitle}>
            Это необходимо для безопасности вашего аккаунта. После смены вы попадёте в систему.
          </p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Новый пароль</label>
              <Input
                type="password"
                placeholder="Введите новый пароль"
                value={newPassword}
                onChange={setNewPassword}
                autoComplete="new-password"
                disabled={loading}
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Повторите пароль</label>
              <Input
                type="password"
                placeholder="Повторите новый пароль"
                value={confirmPassword}
                onChange={setConfirmPassword}
                autoComplete="new-password"
                disabled={loading}
              />
            </div>

            <div className={styles.hint}>
              <span className={styles.hintIcon}>?</span>
              <span>
                Пароль должен состоять из 8 и более символов, содержать в себе заглавные и строчные буквы (латиницей), цифры, специальные символы
              </span>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <Button type="submit" fullWidth loading={loading} disabled={loading}>
              Сохранить и войти
            </Button>
          </form>
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <span className={styles.footerCopy}>© 2026 edway.space by emostrStudio</span>
          <div className={styles.footerLinks}>
            <a
              href="https://edway.space/pages/about.html"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerLink}
            >
              О платформе
            </a>
            <a
              href="https://edway.space/pages/support.html"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.footerLink}
            >
              Поддержка
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
