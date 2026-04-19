'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { Button } from '@/components/ui/Button/Button';
import { Modal } from '@/components/ui/Modal/Modal';
import { SkeletonCard } from '@/components/ui/Skeleton/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import { formatDate, formatDateTime } from '@/lib/format';
import type { Homework } from '@/lib/types';
import styles from './detail.module.css';

interface Props {
  params: Promise<{ id: string }>;
}

function deadlineStyle(deadline: string, baseStyle: string): string {
  if (new Date(deadline) < new Date()) return styles.deadlineOverdue;
  return baseStyle;
}

export default function HomeworkDetailPage({ params }: Props) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const { data, isLoading } = useApi<Homework>(`/homework/${id}`);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canEdit = data && user && data.authorId === user.id;
  const canDelete = data && user && (
    data.authorId === user.id ||
    user.role === 'CLASS_HEAD' ||
    user.role === 'ZAVUCH'
  );

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.delete(`/homework/${id}`);
      showToast('Задание удалено', 'success');
      router.push('/dashboard/homework');
    } catch {
      showToast('Ошибка удаления', 'error');
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Домашнее задание"
        backLink={{ href: '/dashboard/homework', label: 'Назад к заданиям' }}
      />
      {isLoading ? (
        <div className={styles.card}><SkeletonCard /></div>
      ) : !data ? (
        <EmptyState message="Задание не найдено" />
      ) : (
        <>
          <div className={styles.card}>
            <div className={styles.subject}>{data.subject.name}</div>
            <div className={styles.meta}>
              <span className={styles.author}>от {data.author.firstName} {data.author.lastName}</span>
              {data.deadline && (
                <span className={deadlineStyle(data.deadline, styles.deadline)}>
                  Сдать до: {formatDate(data.deadline)}
                </span>
              )}
              <span className={styles.createdAt}>{formatDateTime(data.createdAt)}</span>
            </div>
            <div className={styles.content}>{data.content}</div>

            {(canEdit || canDelete) && (
              <div className={styles.cardActions}>
                {canEdit && (
                  <Button variant="outline" onClick={() => router.push(`/dashboard/homework/${id}/edit`)}>
                    Редактировать
                  </Button>
                )}
                {canDelete && (
                  <button className={styles.deleteBtn} onClick={() => setDeleteOpen(true)}>
                    Удалить
                  </button>
                )}
              </div>
            )}
          </div>

          <Modal
            isOpen={deleteOpen}
            onClose={() => setDeleteOpen(false)}
            title="Удалить задание?"
            actions={
              <>
                <Button variant="outline" onClick={() => setDeleteOpen(false)}>Отмена</Button>
                <button className={styles.deleteBtnModal} onClick={handleDelete} disabled={deleting}>
                  {deleting ? '...' : 'Удалить'}
                </button>
              </>
            }
          >
            Это действие нельзя отменить.
          </Modal>
        </>
      )}
    </>
  );
}
