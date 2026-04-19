'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import styles from './Sidebar.module.css';

const ROLE_LABELS: Record<string, string> = {
  STUDENT: 'УЧЕНИК',
  TRUSTED_STUDENT: 'ДОВ. УЧЕНИК',
  TEACHER: 'УЧИТЕЛЬ',
  CLASS_HEAD: 'КЛАССРУК',
  ZAVUCH: 'ЗАВУЧ',
};

const ROLE_RANK: Record<string, number> = {
  STUDENT: 0,
  TRUSTED_STUDENT: 1,
  TEACHER: 2,
  CLASS_HEAD: 3,
  ZAVUCH: 4,
};

type RoleName = keyof typeof ROLE_RANK;

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  minRole: RoleName;
}

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 7.5L9 2l7 5.5V16a1 1 0 01-1 1H3a1 1 0 01-1-1V7.5z" />
      <path d="M6.5 17V10.5h5V17" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="14" height="13" rx="1" />
      <path d="M2 7h14" />
      <path d="M6 1v4M12 1v4" />
      <rect x="5" y="10" width="2" height="2" />
      <rect x="9" y="10" width="2" height="2" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 1H4a1 1 0 00-1 1v14a1 1 0 001 1h10a1 1 0 001-1V6l-5-5z" />
      <path d="M10 1v5h5" />
      <path d="M6 10h6M6 13h4" />
    </svg>
  );
}

function NotebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="1" width="12" height="16" rx="1" />
      <path d="M6 5h6M6 8h6M6 11h4" />
      <path d="M3 4h-1M3 9h-1M3 14h-1" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 1a5 5 0 015 5v4l1.5 2.5H2.5L4 10V6a5 5 0 015-5z" />
      <path d="M7 14.5a2 2 0 004 0" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="2" width="12" height="14" rx="1" />
      <path d="M6 2a2 2 0 004 0" />
      <path d="M6 8h6M6 11h4" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="6" r="3" />
      <path d="M1 16a6 6 0 0112 0" />
      <path d="M13 3a3 3 0 010 6" />
      <path d="M17 16a6 6 0 00-4-5.6" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="2.5" />
      <path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.22 3.22l1.42 1.42M13.36 13.36l1.42 1.42M3.22 14.78l1.42-1.42M13.36 4.64l1.42-1.42" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 3H3a1 1 0 00-1 1v10a1 1 0 001 1h4" />
      <path d="M12 13l4-4-4-4" />
      <path d="M16 9H7" />
    </svg>
  );
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Главная', href: '/dashboard', icon: <HomeIcon />, minRole: 'STUDENT' },
  { label: 'Расписание', href: '/dashboard/schedule', icon: <CalendarIcon />, minRole: 'STUDENT' },
  { label: 'Домашние задания', href: '/dashboard/homework', icon: <DocumentIcon />, minRole: 'STUDENT' },
  { label: 'Конспекты', href: '/dashboard/notes', icon: <NotebookIcon />, minRole: 'STUDENT' },
  { label: 'Объявления', href: '/dashboard/announcements', icon: <BellIcon />, minRole: 'STUDENT' },
  { label: 'Мои назначения', href: '/dashboard/assignments', icon: <ClipboardIcon />, minRole: 'TEACHER' },
  { label: 'Мой класс', href: '/dashboard/my-class', icon: <UsersIcon />, minRole: 'CLASS_HEAD' },
  { label: 'Управление', href: '/dashboard/admin', icon: <SettingsIcon />, minRole: 'ZAVUCH' },
];

function isVisible(item: NavItem, userRole: string): boolean {
  const userRank = ROLE_RANK[userRole] ?? 0;
  const itemRank = ROLE_RANK[item.minRole] ?? 0;
  return userRank >= itemRank;
}

function isActive(href: string, pathname: string): boolean {
  if (href === '/dashboard') return pathname === '/dashboard';
  return pathname.startsWith(href);
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    onClose();
  }, [pathname]);

  const initials = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : '';

  const visibleItems = NAV_ITEMS.filter((item) =>
    user ? isVisible(item, user.role) : false,
  );

  return (
    <>
      {isOpen && <div className={styles.overlay} onClick={onClose} />}
      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.userBlock}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.userMeta}>
            <div className={styles.userName}>
              {user?.firstName} {user?.lastName}
            </div>
            <div className={styles.userRole}>
              {user ? (ROLE_LABELS[user.role] ?? user.role) : ''}
            </div>
          </div>
        </div>

        <nav className={styles.nav}>
          {visibleItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={
                isActive(item.href, pathname)
                  ? `${styles.navLink} ${styles.navLinkActive}`
                  : styles.navLink
              }
            >
              <span className={styles.iconWrapper}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.logoutSection}>
          <button className={styles.logoutBtn} onClick={logout}>
            <span className={styles.iconWrapper}><LogoutIcon /></span>
            Выйти
          </button>
        </div>
      </aside>
    </>
  );
}
