'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useApi } from '@/hooks/useApi';
import { useClassId } from '@/hooks/useClassId';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { Button } from '@/components/ui/Button/Button';
import { Badge } from '@/components/ui/Badge/Badge';
import { Select } from '@/components/ui/Select/Select';
import { Modal } from '@/components/ui/Modal/Modal';
import { SkeletonCard } from '@/components/ui/Skeleton/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import { formatDateTime } from '@/lib/format';
import { usePageTitle } from '@/hooks/usePageTitle';
import type { Announcement } from '@/lib/types';
import styles from './announcements.module.css';

const CAN_CREATE_CLASS = ['CLASS_HEAD', 'ZAVUCH'];

export default function AnnouncementsPage() {
  usePageTitle('Объявления');
  const { user } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const { classId, classes, setClassId, needsSelector, isLoading: classLoading } = useClassId();
  const canCreate = user && CAN_CREATE_CLASS.includes(user.role);

  const { data, isLoading, refetch } = useApi<Announcement[]>(
    classId ? `/announcements?classId=${classId}` : null,
  );

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const sorted = data
    ? [
        ...data.filter((a) => a.level === 'SCHOOL').sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
        ...data.filter((a) => a.level === 'CLASS').sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      ]
    : [];

  function canDelete(ann: Announcement): boolean {
    if (!user) return false;
    return ann.authorId === user.id || user.role === 'ZAVUCH';
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/announcements/${deleteTarget}`);
      showToast('Объявление удалено', 'success');
      refetch();
    } catch {
      showToast('Ошибка удаления', 'error');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  const classOptions = classes.map((c) => ({ value: c.id, label: c.name }));

  const header = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
      <PageHeader title="Объявления" />
      <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
        {needsSelector && (
          <Select options={classOptions} value={classId ?? ''} onChange={setClassId} />
        )}
        {canCreate && (
          <Button onClick={() => router.push('/dashboard/announcements/create')}>
            Создать объявление
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
            <div key={i} className={styles.card}>
              <SkeletonCard />
            </div>
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState message="Объявлений пока нет" />
      ) : (
        <div className={styles.list}>
          {sorted.map((ann) => (
            <div
              key={ann.id}
              className={`${styles.card} ${ann.level === 'SCHOOL' ? styles.cardSchool : styles.cardClass}`}
            >
              <div className={styles.top}>
                <Badge variant={ann.level === 'SCHOOL' ? 'accent' : 'outline'}>
                  {ann.level === 'SCHOOL' ? 'Школа' : 'Класс'}
                </Badge>
              </div>
              <div className={styles.content}>{ann.content}</div>
              <div className={styles.cardFooter}>
                <div className={styles.meta}>
                  {ann.author.firstName} {ann.author.lastName} · {formatDateTime(ann.createdAt)}
                </div>
                {canDelete(ann) && (
                  <button className={styles.deleteBtn} onClick={() => setDeleteTarget(ann.id)}>
                    Удалить
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Удалить объявление?"
        actions={
          <>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Отмена</Button>
            <button className={styles.deleteBtnModal} onClick={handleDelete} disabled={deleting}>
              {deleting ? '...' : 'Удалить'}
            </button>
          </>
        }
      >
        Это действие нельзя отменить.
      </Modal>
    </>
  );
}
