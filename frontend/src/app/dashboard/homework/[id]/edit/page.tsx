'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { Button } from '@/components/ui/Button/Button';
import { Select } from '@/components/ui/Select/Select';
import { Textarea } from '@/components/ui/Textarea/Textarea';
import { FormField } from '@/components/ui/FormField/FormField';
import { SkeletonCard } from '@/components/ui/Skeleton/Skeleton';
import type { Homework } from '@/lib/types';
import styles from '../../../form.module.css';

interface Props {
  params: Promise<{ id: string }>;
}

export default function HomeworkEditPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast } = useToast();
  const { data: hw, isLoading } = useApi<Homework>(`/homework/${id}`);

  const [content, setContent] = useState('');
  const [deadline, setDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (hw) {
      setContent(hw.content);
      setDeadline(hw.deadline ? hw.deadline.split('T')[0] : '');
    }
  }, [hw]);

  const today = new Date().toISOString().split('T')[0];

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!content.trim() || content.trim().length < 3) e.content = 'Введите текст задания (минимум 3 символа)';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await api.patch(`/homework/${id}`, {
        content: content.trim(),
        deadline: deadline || null,
      });
      showToast('Задание обновлено', 'success');
      router.push(`/dashboard/homework/${id}`);
    } catch {
      showToast('Ошибка сохранения', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <>
        <PageHeader title="Редактировать задание" backLink={{ href: `/dashboard/homework/${id}`, label: 'Назад' }} />
        <div className={styles.form}><SkeletonCard /></div>
      </>
    );
  }

  if (!hw) {
    router.replace('/dashboard/homework');
    return <SkeletonCard />;
  }

  return (
    <>
      <PageHeader
        title="Редактировать задание"
        backLink={{ href: `/dashboard/homework/${id}`, label: 'Назад к заданию' }}
      />
      <form className={styles.form} onSubmit={handleSubmit}>
        <FormField label="Класс">
          <Select options={[{ value: hw.classId, label: hw.subject.name }]} value={hw.classId} onChange={() => {}} disabled />
        </FormField>

        <FormField label="Предмет">
          <Select options={[{ value: hw.subjectId, label: hw.subject.name }]} value={hw.subjectId} onChange={() => {}} disabled />
        </FormField>

        <FormField label="Текст задания" required error={errors.content}>
          <Textarea
            value={content}
            onChange={setContent}
            rows={6}
            error={!!errors.content}
          />
        </FormField>

        <FormField label="Дедлайн">
          <input
            type="date"
            className={styles.dateInput}
            value={deadline}
            min={today}
            onChange={(e) => setDeadline(e.target.value)}
          />
        </FormField>

        <div className={styles.actions}>
          <Button type="submit" loading={submitting}>Сохранить</Button>
          <Button variant="outline" onClick={() => router.back()}>Отмена</Button>
        </div>
      </form>
    </>
  );
}
