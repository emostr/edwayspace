'use client';

import { useRouter } from 'next/navigation';
import { useGuard } from '@/hooks/useGuard';
import { useToast } from '@/context/ToastContext';
import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { Button } from '@/components/ui/Button/Button';
import { SkeletonCard } from '@/components/ui/Skeleton/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import type { TeacherAssignmentFull, User } from '@/lib/types';
import styles from './assignments.module.css';

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M2 2l10 10M12 2L2 12" />
    </svg>
  );
}

export default function AdminAssignmentsPage() {
  const authorized = useGuard('ZAVUCH');
  const router = useRouter();
  const { showToast } = useToast();

  const { data: assignments, isLoading, refetch } = useApi<TeacherAssignmentFull[]>('/teacher-assignments');
  const { data: teachers } = useApi<User[]>('/users');

  if (!authorized) return <SkeletonCard />;

  const teacherUsers = (teachers ?? []).filter((u) =>
    ['TEACHER', 'CLASS_HEAD', 'ZAVUCH'].includes(u.role),
  );

  const grouped = teacherUsers.map((t) => ({
    teacher: t,
    assignments: (assignments ?? []).filter((a) => a.teacherId === t.id),
  })).filter((g) => g.assignments.length > 0);

  const noAssignmentTeachers = teacherUsers.filter(
    (t) => !(assignments ?? []).some((a) => a.teacherId === t.id),
  );

  async function handleRemove(id: string) {
    try {
      await api.delete(`/teacher-assignments/${id}`);
      showToast('Назначение удалено', 'success');
      refetch();
    } catch {
      showToast('Ошибка удаления', 'error');
    }
  }

  const isEmpty = !isLoading && (!assignments || assignments.length === 0);

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
        <PageHeader title="Назначения учителей" backLink={{ href: '/dashboard/admin', label: 'Управление' }} />
        <Button onClick={() => router.push('/dashboard/admin/assignments/create')}>Создать назначение</Button>
      </div>

      {isLoading ? (
        <SkeletonCard />
      ) : isEmpty ? (
        <EmptyState message="Назначений нет. Создайте первое." />
      ) : (
        <div className={styles.list}>
          {grouped.map(({ teacher, assignments: tas }) => (
            <div key={teacher.id} className={styles.teacherCard}>
              <div className={styles.teacherName}>{teacher.lastName} {teacher.firstName}</div>
              <div className={styles.assignmentRows}>
                {tas.map((a) => (
                  <div key={a.id} className={styles.assignmentRow}>
                    <span className={styles.assignmentLabel}>
                      {a.subject.name}<span className={styles.arrow}>→</span>{a.class.name}
                    </span>
                    <button className={styles.removeBtn} onClick={() => handleRemove(a.id)} title="Удалить"><CloseIcon /></button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {noAssignmentTeachers.length > 0 && (
            <div style={{ marginTop: 'var(--space-sm)' }}>
              {noAssignmentTeachers.map((t) => (
                <div key={t.id} className={styles.teacherCard}>
                  <div className={styles.teacherName}>{t.lastName} {t.firstName}</div>
                  <div className={styles.noAssignments}>Нет назначений</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
