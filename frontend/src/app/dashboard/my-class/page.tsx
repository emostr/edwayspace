'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useGuard } from '@/hooks/useGuard';
import { useApi } from '@/hooks/useApi';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { Button } from '@/components/ui/Button/Button';
import { SkeletonCard } from '@/components/ui/Skeleton/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import { formatDayOfWeek, getCurrentDayOfWeek } from '@/lib/format';
import type { User, ClassWithHead, ScheduleEntry, Homework, Note } from '@/lib/types';
import styles from './my-class.module.css';

export default function MyClassPage() {
  const { user } = useAuth();
  const router = useRouter();

  const authorized = useGuard('CLASS_HEAD');

  const { data: classes, isLoading: classesLoading } = useApi<ClassWithHead[]>(
    authorized ? '/classes' : null,
  );

  const myClass = classes?.find((c) => c.classHeadId === user?.id) ?? null;
  const classId = myClass?.id ?? null;

  const { data: students, isLoading: studentsLoading } = useApi<User[]>(
    classId ? `/users?classId=${classId}` : null,
  );
  const { data: schedule } = useApi<ScheduleEntry[]>(
    classId ? `/schedule?classId=${classId}` : null,
  );
  const { data: homework } = useApi<Homework[]>(
    classId ? `/homework?classId=${classId}` : null,
  );
  const { data: notes } = useApi<Note[]>(
    classId ? `/notes?classId=${classId}` : null,
  );

  if (!authorized) return <SkeletonCard />;
  if (classesLoading) return <SkeletonCard />;

  if (!myClass) return (
    <>
      <PageHeader title="Мой класс" />
      <EmptyState message="Вы не являетесь классным руководителем ни одного класса." />
    </>
  );

  const today = getCurrentDayOfWeek();
  const todaySchedule = schedule
    ?.filter((e) => e.dayOfWeek === today)
    .sort((a, b) => a.lessonNumber - b.lessonNumber) ?? [];

  const studentList = students?.filter((u) => u.role === 'STUDENT' || u.role === 'TRUSTED_STUDENT') ?? [];

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
        <PageHeader title={`Мой класс — ${myClass.name}`} />
        <Button variant="outline" onClick={() => router.push('/dashboard/schedule/edit')}>
          Расписание
        </Button>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{studentList.length}</div>
          <div className={styles.statLabel}>Учеников</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{homework?.length ?? 0}</div>
          <div className={styles.statLabel}>Заданий</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{notes?.length ?? 0}</div>
          <div className={styles.statLabel}>Конспектов</div>
        </div>
      </div>

      {todaySchedule.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Сегодня — {formatDayOfWeek(today)}</div>
          <div className={styles.scheduleList}>
            {todaySchedule.map((e) => (
              <div key={e.id} className={styles.scheduleRow}>
                <span className={styles.lessonNum}>{e.lessonNumber}</span>
                <span className={styles.lessonName}>{e.subject.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Ученики</div>
        {studentsLoading ? (
          <SkeletonCard />
        ) : studentList.length === 0 ? (
          <EmptyState message="Учеников нет" />
        ) : (
          <div className={styles.studentList}>
            {studentList.map((s) => (
              <div key={s.id} className={styles.studentRow}>
                <span className={styles.studentName}>{s.lastName} {s.firstName}</span>
                {s.role === 'TRUSTED_STUDENT' && (
                  <span className={styles.trustedBadge}>Доверенный</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
