'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import styles from '@/app/auth.module.css';

export default function LoginPage() {
  const { login } = useAuth();
  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(loginValue, password);
    } catch {
      setError('Неверный логин или пароль');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <span className={styles.logo}>edway<span className={styles.dot}>.</span>space</span>
          <nav className={styles.headerNav}>
            <a
              href="https://edway.space/pages/about.html"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.headerLink}
            >
              О платформе
            </a>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.card}>
          <h1 className={styles.title}>Добро пожаловать</h1>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Логин</label>
              <Input
                type="text"
                placeholder="Введите логин"
                value={loginValue}
                onChange={setLoginValue}
                autoComplete="username"
                disabled={loading}
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
                disabled={loading}
              />
            </div>

            <div className={styles.hint}>
              <span className={styles.hintIcon}>?</span>
              <span>
                Первичный доступ предоставляется по постоянному логину и временному паролю, выданному администратором
              </span>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <Button type="submit" fullWidth loading={loading} disabled={loading}>
              Войти
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
