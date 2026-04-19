'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { PageTransition } from '@/components/PageTransition/PageTransition';
import styles from './dashboard.module.css';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/dashboard" className={styles.logo}>
            edway.space Alpha
          </Link>
          <button
            className={`${styles.burger} ${sidebarOpen ? styles.burgerOpen : ''}`}
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Меню"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      <div className={styles.body}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className={styles.content}>
          <main className={styles.main}><PageTransition>{children}</PageTransition></main>
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
      </div>
    </div>
  );
}
