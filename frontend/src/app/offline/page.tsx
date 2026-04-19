'use client';

import styles from './offline.module.css';

export default function OfflinePage() {
  return (
    <div className={styles.wrap}>
      <div className={styles.logo}>edway<span className={styles.dot}>.</span>space</div>
      <svg className={styles.icon} width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 24C8 15.2 15.2 8 24 8s16 7.2 16 16" />
        <path d="M24 8v4M8 24H4M44 24h-4M24 40v4" />
        <circle cx="24" cy="24" r="6" />
        <path d="M34 34l8 8M34 42l8-8" stroke="var(--danger)" />
      </svg>
      <div className={styles.title}>Нет подключения</div>
      <div className={styles.sub}>Проверьте интернет-соединение и попробуйте снова</div>
      <button className={styles.btn} onClick={() => window.location.reload()}>Обновить</button>
    </div>
  );
}
