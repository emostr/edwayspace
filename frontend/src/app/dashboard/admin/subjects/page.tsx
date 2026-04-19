'use client';

import { useState } from 'react';
import { useGuard } from '@/hooks/useGuard';
import { useToast } from '@/context/ToastContext';
import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { FormField } from '@/components/ui/FormField/FormField';
import { Modal } from '@/components/ui/Modal/Modal';
import { SkeletonCard } from '@/components/ui/Skeleton/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import type { Subject } from '@/lib/types';
import styles from './subjects.module.css';

function EditIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11.5 2.5l2 2L5 13H3v-2L11.5 2.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 9h8l1-9" />
    </svg>
  );
}

export default function AdminSubjectsPage() {
  const authorized = useGuard('ZAVUCH');
  const { showToast } = useToast();

  const { data: subjects, isLoading, refetch } = useApi<Subject[]>('/subjects');

  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  const [editTarget, setEditTarget] = useState<Subject | null>(null);
  const [editName, setEditName] = useState('');
  const [editError, setEditError] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);
  const [deleting, setDeleting] = useState(false);

  if (!authorized) return <SkeletonCard />;

  async function handleCreate() {
    if (!createName.trim()) { setCreateError('Введите название'); return; }
    setCreating(true);
    try {
      await api.post('/subjects', { name: createName.trim() });
      showToast('Предмет добавлен', 'success');
      setCreateOpen(false);
      setCreateName('');
      setCreateError('');
      refetch();
    } catch {
      showToast('Ошибка создания', 'error');
    } finally {
      setCreating(false);
    }
  }

  async function handleEdit() {
    if (!editName.trim()) { setEditError('Введите название'); return; }
    if (!editTarget) return;
    setEditSaving(true);
    try {
      await api.patch(`/subjects/${editTarget.id}`, { name: editName.trim() });
      showToast('Предмет обновлён', 'success');
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
      await api.delete(`/subjects/${deleteTarget.id}`);
      showToast('Предмет удалён', 'success');
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
        <PageHeader title="Предметы" backLink={{ href: '/dashboard/admin', label: 'Управление' }} />
        <Button onClick={() => setCreateOpen(true)}>Добавить предмет</Button>
      </div>

      {isLoading ? (
        <SkeletonCard />
      ) : !subjects || subjects.length === 0 ? (
        <EmptyState message="Предметов нет. Добавьте первый." />
      ) : (
        <div className={styles.list}>
          {subjects.map((s) => (
            <div key={s.id} className={styles.row}>
              <span className={styles.subjectName}>{s.name}</span>
              <div className={styles.actions}>
                <button className={styles.actionBtn} onClick={() => { setEditTarget(s); setEditName(s.name); setEditError(''); }}><EditIcon /></button>
                <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={() => setDeleteTarget(s)}><TrashIcon /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={createOpen}
        onClose={() => { setCreateOpen(false); setCreateName(''); setCreateError(''); }}
        title="Добавить предмет"
        actions={
          <>
            <Button variant="outline" onClick={() => { setCreateOpen(false); setCreateName(''); setCreateError(''); }}>Отмена</Button>
            <Button loading={creating} onClick={handleCreate}>Добавить</Button>
          </>
        }
      >
        <FormField label="Название предмета" required error={createError}>
          <Input type="text" placeholder="Математика" value={createName} onChange={setCreateName} error={!!createError} />
        </FormField>
      </Modal>

      <Modal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Редактировать предмет"
        actions={
          <>
            <Button variant="outline" onClick={() => setEditTarget(null)}>Отмена</Button>
            <Button loading={editSaving} onClick={handleEdit}>Сохранить</Button>
          </>
        }
      >
        <FormField label="Название предмета" required error={editError}>
          <Input type="text" value={editName} onChange={setEditName} error={!!editError} />
        </FormField>
      </Modal>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={`Удалить предмет "${deleteTarget?.name}"?`}
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
        Это действие нельзя отменить.
      </Modal>
    </>
  );
}
