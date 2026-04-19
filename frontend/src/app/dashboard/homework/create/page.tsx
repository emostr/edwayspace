'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useGuard } from '@/hooks/useGuard';
import { useToast } from '@/context/ToastContext';
import { useTeacherAssignments } from '@/hooks/useTeacherAssignments';
import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { Button } from '@/components/ui/Button/Button';
import { Select } from '@/components/ui/Select/Select';
import { Textarea } from '@/components/ui/Textarea/Textarea';
import { FormField } from '@/components/ui/FormField/FormField';
import { SkeletonCard } from '@/components/ui/Skeleton/Skeleton';
import type { Subject } from '@/lib/types';
import styles from '../../form.module.css';

export default function HomeworkCreatePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const { classes, getSubjectsForClass, isLoading: assignmentsLoading } = useTeacherAssignments();
  const { data: allSubjects } = useApi<Subject[]>(
    user?.role === 'TRUSTED_STUDENT' ? '/subjects' : null,
  );

  const isTrustedStudent = user?.role === 'TRUSTED_STUDENT';

  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [content, setContent] = useState('');
  const [deadline, setDeadline] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isTrustedStudent && user?.classId) {
      setClassId(user.classId);
    }
  }, [isTrustedStudent, user?.classId]);

  useEffect(() => {
    if (!isTrustedStudent && classes.length === 1) {
      setClassId(classes[0].id);
    }
  }, [classes, isTrustedStudent]);

  useEffect(() => {
    const subjects = isTrustedStudent
      ? (allSubjects ?? []).map((s) => ({ id: s.id, name: s.name }))
      : getSubjectsForClass(classId);
    if (subjects.length === 1) setSubjectId(subjects[0].id);
    else setSubjectId('');
  }, [classId, isTrustedStudent, allSubjects, getSubjectsForClass]);

  const authorized = useGuard('TRUSTED_STUDENT');
  if (!authorized) return <SkeletonCard />;

  const subjectOptions = isTrustedStudent
    ? (allSubjects ?? []).map((s) => ({ value: s.id, label: s.name }))
    : getSubjectsForClass(classId).map((s) => ({ value: s.id, label: s.name }));

  const today = new Date().toISOString().split('T')[0];

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!classId) e.classId = 'Выберите класс';
    if (!subjectId) e.subjectId = 'Выберите предмет';
    if (!content.trim() || content.trim().length < 3) e.content = 'Введите текст задания (минимум 3 символа)';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await api.post('/homework', {
        classId,
        subjectId,
        content: content.trim(),
        deadline: deadline || undefined,
      });
      showToast('Домашнее задание опубликовано', 'success');
      router.push('/dashboard/homework');
    } catch {
      showToast('Ошибка публикации', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Создать задание"
        backLink={{ href: '/dashboard/homework', label: 'Назад к заданиям' }}
      />
      <form className={styles.form} onSubmit={handleSubmit}>
        {!isTrustedStudent && (
          <FormField label="Класс" required error={errors.classId}>
            <Select
              options={classes.map((c) => ({ value: c.id, label: c.name }))}
              value={classId}
              onChange={setClassId}
              placeholder="Выберите класс"
              disabled={assignmentsLoading}
            />
          </FormField>
        )}

        <FormField label="Предмет" required error={errors.subjectId}>
          <Select
            options={subjectOptions}
            value={subjectId}
            onChange={setSubjectId}
            placeholder="Выберите предмет"
            disabled={!isTrustedStudent && !classId}
          />
        </FormField>

        <FormField label="Текст задания" required error={errors.content}>
          <Textarea
            value={content}
            onChange={setContent}
            placeholder="Введите задание..."
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
          <Button type="submit" loading={submitting}>Опубликовать</Button>
          <Button variant="outline" onClick={() => router.back()}>Отмена</Button>
        </div>
      </form>
    </>
  );
}
