'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useGuard } from '@/hooks/useGuard';
import { useToast } from '@/context/ToastContext';
import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Select } from '@/components/ui/Select/Select';
import { Badge } from '@/components/ui/Badge/Badge';
import { Modal } from '@/components/ui/Modal/Modal';
import { FormField } from '@/components/ui/FormField/FormField';
import { CopyButton } from '@/components/CopyButton/CopyButton';
import { SkeletonCard } from '@/components/ui/Skeleton/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState/EmptyState';
import type { User, ClassWithHead } from '@/lib/types';
import styles from './users.module.css';

const ROLE_LABELS: Record<string, string> = {
  STUDENT: 'Ученик',
  TRUSTED_STUDENT: 'Доверенный ученик',
  TEACHER: 'Учитель',
  CLASS_HEAD: 'Классный руководитель',
  ZAVUCH: 'Завуч',
};

const ROLE_BADGE: Record<string, 'outline' | 'accent' | 'muted'> = {
  STUDENT: 'muted',
  TRUSTED_STUDENT: 'accent',
  TEACHER: 'outline',
  CLASS_HEAD: 'accent',
  ZAVUCH: 'accent',
};

const ROLE_FILTER_OPTIONS = [
  { value: '', label: 'Все роли' },
  { value: 'STUDENT', label: 'Ученики' },
  { value: 'TRUSTED_STUDENT', label: 'Доверенные ученики' },
  { value: 'TEACHER', label: 'Учителя' },
  { value: 'CLASS_HEAD', label: 'Классные руководители' },
  { value: 'ZAVUCH', label: 'Завучи' },
];

const ROLE_OPTIONS = ROLE_FILTER_OPTIONS.slice(1);

const STUDENT_ROLES = ['STUDENT', 'TRUSTED_STUDENT'];

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

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();

  const { data: users, isLoading, refetch } = useApi<User[]>('/users');
  const { data: classes } = useApi<ClassWithHead[]>('/classes');

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editClassId, setEditClassId] = useState('');
  const [editSaving, setEditSaving] = useState(false);

  const [resetTarget, setResetTarget] = useState<User | null>(null);
  const [resetResult, setResetResult] = useState<{ login: string; temporaryPassword: string } | null>(null);
  const [resetting, setResetting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const authorized = useGuard('ZAVUCH');
  if (!authorized) return <SkeletonCard />;

  const filtered = (users ?? []).filter((u) => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.firstName.toLowerCase().includes(q) || u.lastName.toLowerCase().includes(q) || u.login.toLowerCase().includes(q);
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  function openEdit(u: User) {
    setEditTarget(u);
    setEditFirstName(u.firstName);
    setEditLastName(u.lastName);
    setEditRole(u.role);
    setEditClassId(u.classId ?? '');
  }

  async function handleEdit() {
    if (!editTarget) return;
    setEditSaving(true);
    try {
      await api.patch(`/users/${editTarget.id}`, {
        firstName: editFirstName,
        lastName: editLastName,
        role: editRole,
        classId: STUDENT_ROLES.includes(editRole) ? (editClassId || null) : null,
      });
      showToast('Пользователь обновлён', 'success');
      setEditTarget(null);
      refetch();
    } catch {
      showToast('Ошибка сохранения', 'error');
    } finally {
      setEditSaving(false);
    }
  }

  async function handleReset() {
    if (!resetTarget) return;
    setResetting(true);
    try {
      const res = await api.patch<{ temporaryPassword: string }>(`/users/${resetTarget.id}/reset-password`, {});
      setResetResult({ login: resetTarget.login, temporaryPassword: res.temporaryPassword });
    } catch {
      showToast('Ошибка сброса пароля', 'error');
    } finally {
      setResetting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/users/${deleteTarget.id}`);
      showToast('Пользователь удалён', 'success');
      setDeleteTarget(null);
      refetch();
    } catch {
      showToast('Ошибка удаления', 'error');
    } finally {
      setDeleting(false);
    }
  }

  const classOptions = [
    { value: '', label: 'Не назначать' },
    ...(classes ?? []).map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
        <PageHeader title="Пользователи" backLink={{ href: '/dashboard/admin', label: 'Управление' }} />
        <Button onClick={() => router.push('/dashboard/admin/users/create')}>Создать пользователя</Button>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.toolbarSearch}>
          <Input type="text" placeholder="Поиск по имени или логину..." value={search} onChange={setSearch} />
        </div>
        <div className={styles.toolbarFilter}>
          <Select options={ROLE_FILTER_OPTIONS} value={roleFilter} onChange={setRoleFilter} />
        </div>
      </div>

      {isLoading ? (
        <SkeletonCard />
      ) : filtered.length === 0 ? (
        <EmptyState message={users?.length === 0 ? 'Пользователей нет. Создайте первого.' : 'Ничего не найдено'} />
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Имя</th>
                <th className={styles.th}>Логин</th>
                <th className={styles.th}>Роль</th>
                <th className={styles.th}>Класс</th>
                <th className={styles.th}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className={styles.tr}>
                  <td className={styles.td}>{u.lastName} {u.firstName}</td>
                  <td className={styles.td}><span style={{ fontFamily: 'monospace', fontSize: 13 }}>{u.login}</span></td>
                  <td className={styles.td}>
                    <Badge variant={ROLE_BADGE[u.role] ?? 'outline'}>{ROLE_LABELS[u.role] ?? u.role}</Badge>
                  </td>
                  <td className={styles.td}>
                    {u.classId ? (
                      <span>{classes?.find((c) => c.id === u.classId)?.name ?? '—'}</span>
                    ) : (
                      <span className={styles.muted}>—</span>
                    )}
                  </td>
                  <td className={styles.td}>
                    <div className={styles.actions}>
                      <button className={styles.actionBtn} onClick={() => openEdit(u)} title="Редактировать"><EditIcon /></button>
                      <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={() => setDeleteTarget(u)} title="Удалить"><TrashIcon /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Редактировать пользователя"
        actions={
          <>
            <button className={styles.resetPwdBtn} onClick={() => { setResetTarget(editTarget); setEditTarget(null); }}>Сбросить пароль</button>
            <Button variant="outline" onClick={() => setEditTarget(null)}>Отмена</Button>
            <Button loading={editSaving} onClick={handleEdit}>Сохранить</Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          <FormField label="Имя" required>
            <Input type="text" value={editFirstName} onChange={setEditFirstName} />
          </FormField>
          <FormField label="Фамилия" required>
            <Input type="text" value={editLastName} onChange={setEditLastName} />
          </FormField>
          <FormField label="Роль" required>
            <Select options={ROLE_OPTIONS} value={editRole} onChange={setEditRole} />
          </FormField>
          {STUDENT_ROLES.includes(editRole) && (
            <FormField label="Класс">
              <Select options={classOptions} value={editClassId} onChange={setEditClassId} />
            </FormField>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={!!resetTarget && !resetResult}
        onClose={() => setResetTarget(null)}
        title="Сбросить пароль?"
        actions={
          <>
            <Button variant="outline" onClick={() => setResetTarget(null)}>Отмена</Button>
            <Button loading={resetting} onClick={handleReset}>Сбросить</Button>
          </>
        }
      >
        Пользователю {resetTarget?.lastName} {resetTarget?.firstName} будет назначен новый временный пароль.
      </Modal>

      <Modal
        isOpen={!!resetResult}
        onClose={() => { setResetTarget(null); setResetResult(null); }}
        title="Пароль сброшен"
        actions={
          <Button onClick={() => { setResetTarget(null); setResetResult(null); }}>Готово</Button>
        }
      >
        <p style={{ marginBottom: 'var(--space-sm)', fontSize: 14 }}>Передайте эти данные пользователю лично:</p>
        <div className={styles.credBlock}>
          <div className={styles.credRow}>
            <div><div className={styles.credLabel}>Логин</div><div className={styles.credValue}>{resetResult?.login}</div></div>
            <CopyButton text={resetResult?.login ?? ''} />
          </div>
          <div className={styles.credRow}>
            <div><div className={styles.credLabel}>Временный пароль</div><div className={styles.credValue}>{resetResult?.temporaryPassword}</div></div>
            <CopyButton text={resetResult?.temporaryPassword ?? ''} />
          </div>
        </div>
        <p className={styles.credWarning}>Эти данные показываются только один раз. Сохраните их.</p>
      </Modal>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title={`Удалить пользователя?`}
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
        Удалить {deleteTarget?.lastName} {deleteTarget?.firstName}? Все его данные (ДЗ, конспекты, объявления) будут удалены.
      </Modal>
    </>
  );
}
