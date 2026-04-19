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
import { formatDayOfWeek, getCurrentDayOfWeek } from '@/lib/format';
import { usePageTitle } from '@/hooks/usePageTitle';
import type { ScheduleEntry } from '@/lib/types';
import styles from './schedule.module.css';

const WEEK_DAYS = [1, 2, 3, 4, 5, 6];

export default function SchedulePage() {
  usePageTitle('Расписание');
  const { user } = useAuth();
  const router = useRouter();
  const { classId, classes, setClassId, needsSelector, isLoading: classLoading } = useClassId();
  const canEdit = user && (user.role === 'CLASS_HEAD' || user.role === 'ZAVUCH');

  const { data, isLoading } = useApi<ScheduleEntry[]>(
    classId ? `/schedule?classId=${classId}` : null,
  );

  const today = getCurrentDayOfWeek();

  const byDay = WEEK_DAYS.reduce<Record<number, ScheduleEntry[]>>((acc, d) => {
    acc[d] = data?.filter((e) => e.dayOfWeek === d).sort((a, b) => a.lessonNumber - b.lessonNumber) ?? [];
    return acc;
  }, {});

  const classOptions = classes.map((c) => ({ value: c.id, label: c.name }));

  const header = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
      <PageHeader title="Расписание" />
      <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
        {needsSelector && (
          <Select options={classOptions} value={classId ?? ''} onChange={setClassId} />
        )}
        {canEdit && (
          <Button variant="outline" onClick={() => router.push('/dashboard/schedule/edit')}>
            Редактировать
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
        <EmptyState message="Вы не привязаны к классу. Обратитесь к администратору." />
      </>
    );
  }

  return (
    <>
      {header}
      {isLoading ? (
        <div className={styles.grid}>
          {WEEK_DAYS.map((d) => (
            <div key={d} className={styles.dayCard}>
              <SkeletonCard />
            </div>
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState message="Расписание не заполнено" />
      ) : (
        <div className={styles.grid}>
          {WEEK_DAYS.map((d) => (
            <div
              key={d}
              className={`${styles.dayCard} ${d === today ? styles.dayCardToday : ''}`}
            >
              <div className={`${styles.dayTitle} ${d === today ? styles.dayTitleToday : ''}`}>
                {formatDayOfWeek(d)}
                {d === today && ' — сегодня'}
              </div>
              {byDay[d].length === 0 ? (
                <div className={styles.empty}>Нет уроков</div>
              ) : (
                byDay[d].map((e) => (
                  <div key={e.id} className={styles.lessonRow}>
                    <span className={styles.lessonNum}>{e.lessonNumber}</span>
                    <span className={styles.lessonName}>{e.subject.name}</span>
                  </div>
                ))
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
