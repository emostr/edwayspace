'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSuperadminAuth } from '@/hooks/useSuperadminAuth';
import { PageTransition } from '@/components/PageTransition/PageTransition';
import styles from './dashboard.module.css';

const NAV_ITEMS = [
  { href: '/superadmin/dashboard', label: 'Обзор', exact: true },
  { href: '/superadmin/dashboard/schools', label: 'Школы' },
  { href: '/superadmin/dashboard/settings', label: 'Настройки' },
];

export default function SuperadminDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading, logout } = useSuperadminAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/superadmin');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) return null;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerLeft}>
            <span className={styles.logo}>edway.space</span>
            <span className={styles.headerBadge}>SUPERADMIN</span>
          </div>
          <button className={styles.logoutBtn} onClick={logout}>Выйти</button>
        </div>
      </header>

      <div className={styles.body}>
        <nav className={styles.sidebar}>
          {NAV_ITEMS.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className={styles.content}>
          <main className={styles.main}>
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </div>
    </div>
  );
}
