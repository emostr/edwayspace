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
import { Select } from '@/components/ui/Select/Select';
import { FormField } from '@/components/ui/FormField/FormField';
import type { User, Subject, ClassWithHead } from '@/lib/types';
import styles from '../../../form.module.css';

export default function AdminAssignmentCreatePage() {
  const authorized = useGuard('ZAVUCH');
  const router = useRouter();
  const { showToast } = useToast();

  const { data: teachers } = useApi<User[]>('/users');
  const { data: subjects } = useApi<Subject[]>('/subjects');
  const { data: classes } = useApi<ClassWithHead[]>('/classes');

  const [teacherId, setTeacherId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [classId, setClassId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!authorized) return <SkeletonCard />;

  const teacherOptions = [
    { value: '', label: 'Выберите учителя' },
    ...(teachers ?? [])
      .filter((u) => ['TEACHER', 'CLASS_HEAD', 'ZAVUCH'].includes(u.role))
      .map((t) => ({ value: t.id, label: `${t.lastName} ${t.firstName}` })),
  ];

  const subjectOptions = [
    { value: '', label: 'Выберите предмет' },
    ...(subjects ?? []).map((s) => ({ value: s.id, label: s.name })),
  ];

  const classOptions = [
    { value: '', label: 'Выберите класс' },
    ...(classes ?? []).map((c) => ({ value: c.id, label: c.name })),
  ];

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!teacherId) e.teacherId = 'Выберите учителя';
    if (!subjectId) e.subjectId = 'Выберите предмет';
    if (!classId) e.classId = 'Выберите класс';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await api.post('/teacher-assignments', { teacherId, subjectId, classId });
      showToast('Назначение создано', 'success');
      router.push('/dashboard/admin/assignments');
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      if (status === 409) {
        showToast('Такое назначение уже существует', 'error');
      } else {
        showToast('Ошибка создания', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader title="Создать назначение" backLink={{ href: '/dashboard/admin/assignments', label: 'Назад к назначениям' }} />
      <form className={styles.form} onSubmit={handleSubmit}>
        <FormField label="Учитель" required error={errors.teacherId}>
          <Select options={teacherOptions} value={teacherId} onChange={setTeacherId} error={!!errors.teacherId} />
        </FormField>
        <FormField label="Предмет" required error={errors.subjectId}>
          <Select options={subjectOptions} value={subjectId} onChange={setSubjectId} error={!!errors.subjectId} />
        </FormField>
        <FormField label="Класс" required error={errors.classId}>
          <Select options={classOptions} value={classId} onChange={setClassId} error={!!errors.classId} />
        </FormField>
        <div className={styles.actions}>
          <Button type="submit" loading={submitting}>Назначить</Button>
          <Button variant="outline" onClick={() => router.back()}>Отмена</Button>
        </div>
      </form>
    </>
  );
}
