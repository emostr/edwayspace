'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGuard } from '@/hooks/useGuard';
import { useClassId } from '@/hooks/useClassId';
import { useToast } from '@/context/ToastContext';
import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { Button } from '@/components/ui/Button/Button';
import { SkeletonCard } from '@/components/ui/Skeleton/Skeleton';
import { formatDayOfWeek } from '@/lib/format';
import type { ScheduleEntry, Subject } from '@/lib/types';
import styles from './edit.module.css';

const WEEK_DAYS = [1, 2, 3, 4, 5, 6];
const MAX_LESSONS = 8;

type Cell = { entryId: string | null; subjectId: string };

export default function ScheduleEditPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const authorized = useGuard('CLASS_HEAD');
  const { classId } = useClassId();

  const { data: entries, refetch } = useApi<ScheduleEntry[]>(
    classId ? `/schedule?classId=${classId}` : null,
  );
  const { data: subjects } = useApi<Subject[]>('/subjects');

  const [grid, setGrid] = useState<Record<string, Cell>>({});
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (!entries) return;
    const next: Record<string, Cell> = {};
    for (const day of WEEK_DAYS) {
      for (let ln = 1; ln <= MAX_LESSONS; ln++) {
        const key = `${day}-${ln}`;
        const entry = entries.find((e) => e.dayOfWeek === day && e.lessonNumber === ln);
        next[key] = entry ? { entryId: entry.id, subjectId: entry.subjectId } : { entryId: null, subjectId: '' };
      }
    }
    setGrid(next);
  }, [entries]);

  if (!authorized) return <SkeletonCard />;

  async function handleCellChange(day: number, ln: number, subjectId: string) {
    const key = `${day}-${ln}`;
    const current = grid[key];
    if (!current) return;

    setSaving(key);
    try {
      if (!subjectId) {
        if (current.entryId) {
          await api.delete(`/schedule/${current.entryId}`);
          setGrid((g) => ({ ...g, [key]: { entryId: null, subjectId: '' } }));
          refetch();
        }
      } else if (!current.entryId) {
        const created = await api.post<ScheduleEntry>('/schedule', {
          classId,
          subjectId,
          dayOfWeek: day,
          lessonNumber: ln,
        });
        setGrid((g) => ({ ...g, [key]: { entryId: created.id, subjectId: created.subjectId } }));
      } else {
        await api.patch(`/schedule/${current.entryId}`, { subjectId });
        setGrid((g) => ({ ...g, [key]: { ...g[key], subjectId } }));
      }
    } catch {
      showToast('Ошибка сохранения', 'error');
    } finally {
      setSaving(null);
    }
  }

  const subjectOptions = subjects ?? [];

  return (
    <>
      <PageHeader
        title="Редактировать расписание"
        backLink={{ href: '/dashboard/schedule', label: 'Назад к расписанию' }}
      />
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>№</th>
              {WEEK_DAYS.map((d) => (
                <th key={d} className={styles.th}>{formatDayOfWeek(d)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: MAX_LESSONS }, (_, i) => i + 1).map((ln) => (
              <tr key={ln}>
                <td className={styles.tdNum}>{ln}</td>
                {WEEK_DAYS.map((day) => {
                  const key = `${day}-${ln}`;
                  const cell = grid[key];
                  const isSaving = saving === key;
                  return (
                    <td key={day} className={styles.td}>
                      <select
                        className={`${styles.cellSelect} ${isSaving ? styles.cellSaving : ''}`}
                        value={cell?.subjectId ?? ''}
                        onChange={(e) => handleCellChange(day, ln, e.target.value)}
                        disabled={isSaving}
                      >
                        <option value="">—</option>
                        {subjectOptions.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.footer}>
        <Button variant="outline" onClick={() => router.push('/dashboard/schedule')}>Готово</Button>
      </div>
    </>
  );
}
