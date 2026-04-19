'use client';

import { useAuth } from '@/context/AuthContext';
import { useGuard } from '@/hooks/useGuard';
import { useTeacherAssignments } from '@/hooks/useTeacherAssignments';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { Badge } from '@/components/ui/Badge/Badge';
import { SkeletonCard } from '@/components/ui/Skeleton/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import styles from './assignments.module.css';

export default function AssignmentsPage() {
  const { user } = useAuth();
  const { assignments, classes, getSubjectsForClass, isLoading } = useTeacherAssignments();

  const authorized = useGuard('TEACHER');
  if (!authorized) return <SkeletonCard />;

  return (
    <>
      <PageHeader title="Мои назначения" />
      {isLoading ? (
        <div className={styles.list}>
          {[1, 2].map((i) => <div key={i} className={styles.card}><SkeletonCard /></div>)}
        </div>
      ) : assignments.length === 0 ? (
        <EmptyState message="У вас пока нет назначений. Обратитесь к завучу." />
      ) : (
        <>
          <div className={styles.list}>
            {classes.map((cls) => {
              const subjects = getSubjectsForClass(cls.id);
              if (subjects.length === 0) return null;
              return (
                <div key={cls.id} className={styles.card}>
                  <div className={styles.className}>{cls.name}</div>
                  <div className={styles.subjects}>
                    {subjects.map((s) => (
                      <Badge key={s.id} variant="accent">{s.name}</Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <p className={styles.hint}>Назначения управляются завучем в разделе Управление</p>
        </>
      )}
    </>
  );
}
