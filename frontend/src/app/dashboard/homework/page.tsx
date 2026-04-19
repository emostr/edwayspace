'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/hooks/useApi';
import { useClassId } from '@/hooks/useClassId';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { Button } from '@/components/ui/Button/Button';
import { Select } from '@/components/ui/Select/Select';
import { SkeletonCard } from '@/components/ui/Skeleton/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import { formatDate, formatRelative } from '@/lib/format';
import { usePageTitle } from '@/hooks/usePageTitle';
import type { Homework } from '@/lib/types';
import styles from './homework.module.css';

const CAN_CREATE = ['TEACHER', 'CLASS_HEAD', 'ZAVUCH', 'TRUSTED_STUDENT'];

function deadlineClass(deadline: string, s: typeof styles): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const d = new Date(deadline);
  const dl = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (dl < today) return s.deadlineOverdue;
  if (dl.getTime() === today.getTime()) return s.deadlineToday;
  return s.deadline;
}

function deadlineLabel(deadline: string): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const d = new Date(deadline);
  const dl = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (dl.getTime() === today.getTime()) return `Сегодня! ${formatDate(deadline)}`;
  return `Сдать до: ${formatDate(deadline)}`;
}

export default function HomeworkPage() {
  usePageTitle('Домашние задания');
  const { user } = useAuth();
  const router = useRouter();
  const { classId, classes, setClassId, needsSelector, isLoading: classLoading } = useClassId();
  const canCreate = user && CAN_CREATE.includes(user.role);

  const { data, isLoading } = useApi<Homework[]>(
    classId ? `/homework?classId=${classId}` : null,
  );

  const classOptions = classes.map((c) => ({ value: c.id, label: c.name }));

  const header = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
      <PageHeader title="Домашние задания" />
      <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
        {needsSelector && (
          <Select options={classOptions} value={classId ?? ''} onChange={setClassId} />
        )}
        {canCreate && (
          <Button onClick={() => router.push('/dashboard/homework/create')}>
            Создать задание
          </Button>
        )}
      </div>
    </div>
  );

  if (classLoading) return <>{header}<SkeletonCard /></>;

  if (!classId) {
    return (
      <>
        {header}
        <EmptyState message="Вы не привязаны к классу." />
      </>
    );
  }

  return (
    <>
      {header}
      {isLoading ? (
        <div className={styles.list}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.card} style={{ cursor: 'default' }}><SkeletonCard /></div>
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState message="Домашних заданий пока нет" />
      ) : (
        <div className={styles.list}>
          {data.map((hw) => (
            <div key={hw.id} className={styles.card} onClick={() => router.push(`/dashboard/homework/${hw.id}`)}>
              <div className={styles.subject}>{hw.subject.name}</div>
              <div className={styles.author}>от {hw.author.firstName} {hw.author.lastName}</div>
              <div className={styles.content}>{hw.content}</div>
              <div className={styles.meta}>
                {hw.deadline && (
                  <span className={deadlineClass(hw.deadline, styles)}>{deadlineLabel(hw.deadline)}</span>
                )}
                <span className={styles.createdAt}>{formatRelative(hw.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
