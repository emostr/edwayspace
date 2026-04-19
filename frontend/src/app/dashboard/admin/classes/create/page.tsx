'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGuard } from '@/hooks/useGuard';
import { useToast } from '@/context/ToastContext';
import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { SkeletonCard } from '@/components/ui/Skeleton/Skeleton';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Select } from '@/components/ui/Select/Select';
import { FormField } from '@/components/ui/FormField/FormField';
import type { User } from '@/lib/types';
import styles from '../../../form.module.css';

export default function AdminClassCreatePage() {
  const authorized = useGuard('ZAVUCH');
  const router = useRouter();
  const { showToast } = useToast();
  const { data: teachers } = useApi<User[]>('/users?role=CLASS_HEAD');

  const [name, setName] = useState('');
  const [classHeadId, setClassHeadId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!authorized) return <SkeletonCard />;

  const teacherOptions = [
    { value: '', label: 'Не назначать' },
    ...(teachers ?? []).map((t) => ({ value: t.id, label: `${t.lastName} ${t.firstName}` })),
  ];

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Введите название класса';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await api.post('/classes', { name: name.trim(), classHeadId: classHeadId || null });
      showToast('Класс создан', 'success');
      router.push('/dashboard/admin/classes');
    } catch {
      showToast('Ошибка создания', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader title="Создать класс" backLink={{ href: '/dashboard/admin/classes', label: 'Назад к классам' }} />
      <form className={styles.form} onSubmit={handleSubmit}>
        <FormField label="Название" required error={errors.name}>
          <Input type="text" placeholder="Например: 9Б" value={name} onChange={setName} error={!!errors.name} />
        </FormField>
        <FormField label="Классный руководитель">
          <Select options={teacherOptions} value={classHeadId} onChange={setClassHeadId} />
        </FormField>
        <div className={styles.actions}>
          <Button type="submit" loading={submitting}>Создать</Button>
          <Button variant="outline" onClick={() => router.back()}>Отмена</Button>
        </div>
      </form>
    </>
  );
}
