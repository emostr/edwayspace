'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Select } from '@/components/ui/Select/Select';
import { Textarea } from '@/components/ui/Textarea/Textarea';
import { FormField } from '@/components/ui/FormField/FormField';
import { SkeletonCard } from '@/components/ui/Skeleton/Skeleton';
import type { Note } from '@/lib/types';
import styles from '../../../form.module.css';

interface Props {
  params: Promise<{ id: string }>;
}

export default function NoteEditPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const { showToast } = useToast();
  const { data: note, isLoading } = useApi<Note>(`/notes/${id}`);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [note]);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!title.trim()) e.title = 'Введите заголовок';
    if (!content.trim() || content.trim().length < 3) e.content = 'Введите текст конспекта (минимум 3 символа)';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await api.patch(`/notes/${id}`, { title: title.trim(), content: content.trim() });
      showToast('Конспект обновлён', 'success');
      router.push(`/dashboard/notes/${id}`);
    } catch {
      showToast('Ошибка сохранения', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <>
        <PageHeader title="Редактировать конспект" backLink={{ href: `/dashboard/notes/${id}`, label: 'Назад' }} />
        <div className={styles.form}><SkeletonCard /></div>
      </>
    );
  }

  if (!note) {
    router.replace('/dashboard/notes');
    return <SkeletonCard />;
  }

  return (
    <>
      <PageHeader title="Редактировать конспект" backLink={{ href: `/dashboard/notes/${id}`, label: 'Назад к конспекту' }} />
      <form className={styles.form} onSubmit={handleSubmit}>
        <FormField label="Предмет">
          <Select options={[{ value: note.subjectId, label: note.subject.name }]} value={note.subjectId} onChange={() => {}} disabled />
        </FormField>

        <FormField label="Заголовок" required error={errors.title}>
          <Input type="text" value={title} onChange={setTitle} error={!!errors.title} />
        </FormField>

        <FormField label="Текст конспекта" required error={errors.content}>
          <Textarea value={content} onChange={setContent} rows={8} error={!!errors.content} />
        </FormField>

        <div className={styles.actions}>
          <Button type="submit" loading={submitting}>Сохранить</Button>
          <Button variant="outline" onClick={() => router.back()}>Отмена</Button>
        </div>
      </form>
    </>
  );
}
