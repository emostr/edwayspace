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
import { FormField } from '@/components/ui/FormField/FormField';
import { Modal } from '@/components/ui/Modal/Modal';
import { CopyButton } from '@/components/CopyButton/CopyButton';
import { SkeletonCard } from '@/components/ui/Skeleton/Skeleton';
import type { ClassWithHead } from '@/lib/types';
import styles from '../../users/users.module.css';
import formStyles from '../../../form.module.css';

const ROLE_OPTIONS = [
  { value: 'STUDENT', label: 'Ученик' },
  { value: 'TRUSTED_STUDENT', label: 'Доверенный ученик' },
  { value: 'TEACHER', label: 'Учитель' },
  { value: 'CLASS_HEAD', label: 'Классный руководитель' },
  { value: 'ZAVUCH', label: 'Завуч' },
];

const STUDENT_ROLES = ['STUDENT', 'TRUSTED_STUDENT'];

interface CreatedUser {
  login: string;
  temporaryPassword: string;
}

export default function AdminUserCreatePage() {
  const { user: me } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const { data: classes } = useApi<ClassWithHead[]>('/classes');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [classId, setClassId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [created, setCreated] = useState<CreatedUser | null>(null);

  const authorized = useGuard('ZAVUCH');
  if (!authorized) return <SkeletonCard />;

  const classOptions = [
    { value: '', label: 'Выберите класс' },
    ...(classes ?? []).map((c) => ({ value: c.id, label: c.name })),
  ];

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = 'Введите имя';
    if (!lastName.trim()) e.lastName = 'Введите фамилию';
    if (!role) e.role = 'Выберите роль';
    if (STUDENT_ROLES.includes(role) && !classId) e.classId = 'Выберите класс';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await api.post<{ user: unknown; temporaryPassword: string; login: string }>('/users', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role,
        classId: STUDENT_ROLES.includes(role) ? classId : undefined,
      });
      setCreated({ login: res.login, temporaryPassword: res.temporaryPassword });
    } catch {
      showToast('Ошибка создания пользователя', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader title="Создать пользователя" backLink={{ href: '/dashboard/admin/users', label: 'Назад к пользователям' }} />
      <form className={formStyles.form} onSubmit={handleSubmit}>
        <FormField label="Имя" required error={errors.firstName}>
          <Input type="text" placeholder="Иван" value={firstName} onChange={setFirstName} error={!!errors.firstName} />
        </FormField>
        <FormField label="Фамилия" required error={errors.lastName}>
          <Input type="text" placeholder="Иванов" value={lastName} onChange={setLastName} error={!!errors.lastName} />
        </FormField>
        <FormField label="Роль" required error={errors.role}>
          <Select options={ROLE_OPTIONS} value={role} onChange={(v) => { setRole(v); setClassId(''); }} error={!!errors.role} />
        </FormField>
        {STUDENT_ROLES.includes(role) && (
          <FormField label="Класс" required error={errors.classId}>
            <Select options={classOptions} value={classId} onChange={setClassId} error={!!errors.classId} />
          </FormField>
        )}
        <div className={formStyles.actions}>
          <Button type="submit" loading={submitting}>Создать</Button>
          <Button variant="outline" onClick={() => router.back()}>Отмена</Button>
        </div>
      </form>

      <Modal
        isOpen={!!created}
        onClose={() => { setCreated(null); router.push('/dashboard/admin/users'); }}
        title="Пользователь создан"
        actions={
          <Button onClick={() => { setCreated(null); router.push('/dashboard/admin/users'); }}>Готово</Button>
        }
      >
        <p style={{ marginBottom: 'var(--space-sm)', fontSize: 14 }}>Передайте эти данные пользователю лично:</p>
        <div className={styles.credBlock}>
          <div className={styles.credRow}>
            <div><div className={styles.credLabel}>Логин</div><div className={styles.credValue}>{created?.login}</div></div>
            <CopyButton text={created?.login ?? ''} />
          </div>
          <div className={styles.credRow}>
            <div><div className={styles.credLabel}>Временный пароль</div><div className={styles.credValue}>{created?.temporaryPassword}</div></div>
            <CopyButton text={created?.temporaryPassword ?? ''} />
          </div>
        </div>
        <p className={styles.credWarning}>Эти данные показываются только один раз. Сохраните их.</p>
      </Modal>
    </>
  );
}
