'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useGuard } from '@/hooks/useGuard';
import { useClassId } from '@/hooks/useClassId';
import { useToast } from '@/context/ToastContext';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { Button } from '@/components/ui/Button/Button';
import { Textarea } from '@/components/ui/Textarea/Textarea';
import { Select } from '@/components/ui/Select/Select';
import { FormField } from '@/components/ui/FormField/FormField';
import { SkeletonCard } from '@/components/ui/Skeleton/Skeleton';
import styles from '../../form.module.css';

const LEVEL_OPTIONS = [
  { value: 'CLASS', label: 'Классное' },
  { value: 'SCHOOL', label: 'Школьное' },
];

export default function AnnouncementCreatePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const authorized = useGuard('CLASS_HEAD');
  const { classId } = useClassId();

  const isZavuch = user?.role === 'ZAVUCH';

  const [level, setLevel] = useState<string>(isZavuch ? 'SCHOOL' : 'CLASS');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!authorized) return <SkeletonCard />;

  const levelOptions = isZavuch ? LEVEL_OPTIONS : LEVEL_OPTIONS.filter((o) => o.value === 'CLASS');

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!content.trim() || content.trim().length < 3) e.content = 'Введите текст объявления (минимум 3 символа)';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = { content: content.trim(), level };
      if (level === 'CLASS') body.classId = classId;
      await api.post('/announcements', body);
      showToast('Объявление опубликовано', 'success');
      router.push('/dashboard/announcements');
    } catch {
      showToast('Ошибка публикации', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader title="Создать объявление" backLink={{ href: '/dashboard/announcements', label: 'Назад к объявлениям' }} />
      <form className={styles.form} onSubmit={handleSubmit}>
        {isZavuch && (
          <FormField label="Уровень" required>
            <Select options={levelOptions} value={level} onChange={setLevel} />
          </FormField>
        )}

        <FormField label="Текст объявления" required error={errors.content}>
          <Textarea value={content} onChange={setContent} placeholder="Текст объявления..." rows={6} error={!!errors.content} />
        </FormField>

        <div className={styles.actions}>
          <Button type="submit" loading={submitting}>Опубликовать</Button>
          <Button variant="outline" onClick={() => router.back()}>Отмена</Button>
        </div>
      </form>
    </>
  );
}
