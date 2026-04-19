'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGuard } from '@/hooks/useGuard';
import { useToast } from '@/context/ToastContext';
import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Select } from '@/components/ui/Select/Select';
import { FormField } from '@/components/ui/FormField/FormField';
import { Modal } from '@/components/ui/Modal/Modal';
import { SkeletonCard } from '@/components/ui/Skeleton/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import type { ClassWithHead, User } from '@/lib/types';
import styles from './classes.module.css';

export default function AdminClassesPage() {
  const authorized = useGuard('ZAVUCH');
  const router = useRouter();
  const { showToast } = useToast();

  const { data: classes, isLoading, refetch } = useApi<ClassWithHead[]>('/classes');
  const { data: teachers } = useApi<User[]>('/users?role=CLASS_HEAD');

  const [editTarget, setEditTarget] = useState<ClassWithHead | null>(null);
  const [editName, setEditName] = useState('');
  const [editHeadId, setEditHeadId] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<ClassWithHead | null>(null);
  const [deleting, setDeleting] = useState(false);

  if (!authorized) return <SkeletonCard />;

  const teacherOptions = [
    { value: '', label: 'Не назначать' },
    ...(teachers ?? []).map((t) => ({ value: t.id, label: `${t.lastName} ${t.firstName}` })),
  ];

  function openEdit(cls: ClassWithHead) {
    setEditTarget(cls);
    setEditName(cls.name);
    setEditHeadId(cls.classHeadId ?? '');
  }

  async function handleEdit() {
    if (!editTarget) return;
    setEditSaving(true);
    try {
      await api.patch(`/classes/${editTarget.id}`, {
        name: editName.trim(),
        classHeadId: editHeadId || null,
      });
      showToast('Класс обновлён', 'success');
      setEditTarget(null);
      refetch();
    } catch {
      showToast('Ошибка сохранения', 'error');
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/classes/${deleteTarget.id}`);
      showToast('Класс удалён', 'success');
      setDeleteTarget(null);
      refetch();
    } catch {
      showToast('Ошибка удаления', 'error');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
        <PageHeader title="Классы" backLink={{ href: '/dashboard/admin', label: 'Управление' }} />
        <Button onClick={() => router.push('/dashboard/admin/classes/create')}>Создать класс</Button>
      </div>

      {isLoading ? (
        <SkeletonCard />
      ) : !classes || classes.length === 0 ? (
        <EmptyState message="Классов нет. Создайте первый." />
      ) : (
        <div className={styles.list}>
          {classes.map((cls) => (
            <div key={cls.id} className={styles.card}>
              <div className={styles.className}>{cls.name}</div>
              <div className={styles.classHead}>
                {cls.classHead
                  ? `Классный руководитель: ${cls.classHead.lastName} ${cls.classHead.firstName}`
                  : 'Классный руководитель не назначен'}
              </div>
              <div className={styles.cardActions}>
                <Button variant="outline" onClick={() => openEdit(cls)}>Редактировать</Button>
                <button className={styles.deleteBtn} onClick={() => setDeleteTarget(cls)}>Удалить</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Редактировать класс"
        actions={
          <>
            <Button variant="outline" onClick={() => setEditTarget(null)}>Отмена</Button>
            <Button loading={editSaving} onClick={handleEdit}>Сохранить</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          <FormField label="Название" required>
            <Input type="text" value={editName} onChange={setEditName} />
          </FormField>
          <FormField label="Классный руководитель">
            <Select options={teacherOptions} value={editHeadId} onChange={setEditHeadId} />
          </FormField>
        </div>
      </Modal>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={`Удалить класс ${deleteTarget?.name}?`}
        actions={
          <>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Отмена</Button>
            <button
              style={{ background: 'var(--danger)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', fontFamily: 'inherit', fontSize: 15, fontWeight: 600, padding: '14px 36px', cursor: 'pointer' }}
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? '...' : 'Удалить'}
            </button>
          </>
        }
      >
        Все ученики, расписание и данные класса будут удалены.
      </Modal>
    </>
  );
}
