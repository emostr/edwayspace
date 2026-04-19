'use client';

import { useRouter } from 'next/navigation';
import { useGuard } from '@/hooks/useGuard';
import { useApi } from '@/hooks/useApi';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { SkeletonCard } from '@/components/ui/Skeleton/Skeleton';
import { usePageTitle } from '@/hooks/usePageTitle';
import type { User, ClassWithHead, Subject, TeacherAssignmentFull } from '@/lib/types';
import styles from './admin.module.css';

interface AdminCard {
  title: string;
  description: string;
  href: string;
  count: number | null;
  icon: React.ReactNode;
}

function UsersIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="7" r="4" />
      <path d="M2 21a8 8 0 0116 0" />
      <path d="M19 8a3 3 0 010 6" />
      <path d="M23 21a5 5 0 00-5-5" />
    </svg>
  );
}

function ClassIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="1" />
      <path d="M8 21h8M12 17v4" />
      <path d="M7 8h10M7 11h6" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  );
}

export default function AdminPage() {
  const router = useRouter();

  const { data: users } = useApi<User[]>('/users');
  const { data: classes } = useApi<ClassWithHead[]>('/classes');
  const { data: subjects } = useApi<Subject[]>('/subjects');
  const { data: assignments } = useApi<TeacherAssignmentFull[]>('/teacher-assignments');

  usePageTitle('Управление');
  const authorized = useGuard('ZAVUCH');
  if (!authorized) return <SkeletonCard />;

  const cards: AdminCard[] = [
    { title: 'Пользователи', description: 'Создание аккаунтов, управление ролями', href: '/dashboard/admin/users', count: users?.length ?? null, icon: <UsersIcon /> },
    { title: 'Классы', description: 'Управление классами, назначение классных руководителей', href: '/dashboard/admin/classes', count: classes?.length ?? null, icon: <ClassIcon /> },
    { title: 'Предметы', description: 'Список предметов школы', href: '/dashboard/admin/subjects', count: subjects?.length ?? null, icon: <BookIcon /> },
    { title: 'Назначения', description: 'Привязка учителей к предметам и классам', href: '/dashboard/admin/assignments', count: assignments?.length ?? null, icon: <LinkIcon /> },
  ];

  return (
    <>
      <PageHeader title="Управление" />
      <div className={styles.grid}>
        {cards.map((card) => (
          <div key={card.href} className={styles.card} onClick={() => router.push(card.href)}>
            <div className={styles.cardTop}>
              <div className={styles.iconWrap}>{card.icon}</div>
              {card.count !== null && <div className={styles.count}>{card.count}</div>}
            </div>
            <div className={styles.cardTitle}>{card.title}</div>
            <div className={styles.cardDesc}>{card.description}</div>
          </div>
        ))}
      </div>
    </>
  );
}
