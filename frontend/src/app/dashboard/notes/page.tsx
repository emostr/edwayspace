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
import { formatRelative } from '@/lib/format';
import { usePageTitle } from '@/hooks/usePageTitle';
import type { Note } from '@/lib/types';
import styles from './notes.module.css';

const CAN_CREATE = ['TEACHER', 'CLASS_HEAD', 'ZAVUCH', 'TRUSTED_STUDENT'];

export default function NotesPage() {
  usePageTitle('Конспекты');
  const { user } = useAuth();
  const router = useRouter();
  const { classId, classes, setClassId, needsSelector, isLoading: classLoading } = useClassId();
  const canCreate = user && CAN_CREATE.includes(user.role);

  const { data, isLoading } = useApi<Note[]>(
    classId ? `/notes?classId=${classId}` : null,
  );

  const classOptions = classes.map((c) => ({ value: c.id, label: c.name }));

  const header = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
      <PageHeader title="Конспекты" />
      <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
        {needsSelector && (
          <Select options={classOptions} value={classId ?? ''} onChange={setClassId} />
        )}
        {canCreate && (
          <Button onClick={() => router.push('/dashboard/notes/create')}>
            Создать конспект
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
            <div key={i} className={styles.card} style={{ cursor: 'default' }}>
              <SkeletonCard />
            </div>
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState message="Конспектов пока нет" />
      ) : (
        <div className={styles.list}>
          {data.map((note) => (
            <div
              key={note.id}
              className={styles.card}
              onClick={() => router.push(`/dashboard/notes/${note.id}`)}
            >
              <div className={styles.title}>{note.title}</div>
              <div className={styles.subject}>{note.subject.name}</div>
              <div className={styles.author}>
                от {note.author.firstName} {note.author.lastName}
              </div>
              <div className={styles.content}>
                {note.content.length > 120 ? note.content.slice(0, 120) + '…' : note.content}
              </div>
              <div className={styles.createdAt}>{formatRelative(note.createdAt)}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
