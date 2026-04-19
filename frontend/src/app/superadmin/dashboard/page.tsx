'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import { superadminApi } from '@/lib/superadminApi';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { FormField } from '@/components/ui/FormField/FormField';
import { Modal } from '@/components/ui/Modal/Modal';
import styles from './overview.module.css';

interface Stats {
  totalSchools: number;
  totalUsers: number;
  totalClasses: number;
  schoolsThisMonth: number;
}

interface SchoolItem {
  id: string;
  name: string;
  city: string;
  adminEmail: string;
  createdAt: string;
  _count: { users: number; classes: number };
}

export default function SuperadminOverviewPage() {
  const { showToast } = useToast();
  const [stats, setStats] = useState<Stats | null>(null);
  const [schools, setSchools] = useState<SchoolItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    const [s, sch] = await Promise.all([
      superadminApi.get<Stats>('/superadmin/stats'),
      superadminApi.get<SchoolItem[]>('/superadmin/schools'),
    ]);
    setStats(s);
    setSchools(sch);
  }, []);

  useEffect(() => { load(); }, [load]);

  function resetForm() {
    setName('');
    setCity('');
    setAdminEmail('');
    setErrors({});
  }

  async function handleCreate(e?: React.FormEvent) {
    e?.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Введите название';
    if (!city.trim()) errs.city = 'Введите город';
    if (!adminEmail.trim()) errs.adminEmail = 'Введите email';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      await superadminApi.post('/superadmin/schools', { name: name.trim(), city: city.trim(), adminEmail: adminEmail.trim() });
      showToast('Школа создана', 'success');
      setModalOpen(false);
      resetForm();
      load();
    } catch {
      showToast('Ошибка создания школы', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const STAT_CARDS = [
    { label: 'Всего школ', value: stats?.totalSchools ?? 0 },
    { label: 'Всего пользователей', value: stats?.totalUsers ?? 0 },
    { label: 'Всего классов', value: stats?.totalClasses ?? 0 },
    { label: 'Школ за месяц', value: stats?.schoolsThisMonth ?? 0 },
  ];

  return (
    <>
      <div className={styles.statsGrid}>
        {STAT_CARDS.map((s) => (
          <div key={s.label} className={styles.statCard}>
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Школы</h2>
        <Button onClick={() => setModalOpen(true)}>Добавить школу</Button>
      </div>

      <div className={styles.schoolList}>
        {schools.length === 0 && (
          <div className={styles.emptyState}>Школ пока нет. Добавьте первую.</div>
        )}
        {schools.map((s) => (
          <div key={s.id} className={styles.schoolCard}>
            <div className={styles.schoolInfo}>
              <div className={styles.schoolName}>{s.name}</div>
              <div className={styles.schoolCity}>{s.city}</div>
              <div className={styles.schoolMeta}>
                {s._count.users} пользователей · {s._count.classes} классов
              </div>
            </div>
            <div className={styles.schoolRight}>
              <span className={styles.schoolDate}>
                {new Date(s.createdAt).toLocaleDateString('ru-RU')}
              </span>
              <Link href={`/superadmin/dashboard/schools/${s.id}`}>
                <Button variant="outline">Открыть</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); resetForm(); }}
        title="Добавить школу"
        actions={
          <Button onClick={handleCreate} loading={submitting}>Создать</Button>
        }
      >
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          <FormField label="Название школы" required error={errors.name}>
            <Input type="text" placeholder="Школа №1" value={name} onChange={setName} error={!!errors.name} />
          </FormField>
          <FormField label="Город" required error={errors.city}>
            <Input type="text" placeholder="Москва" value={city} onChange={setCity} error={!!errors.city} />
          </FormField>
          <FormField label="Email администратора" required error={errors.adminEmail}>
            <Input type="email" placeholder="admin@school.ru" value={adminEmail} onChange={setAdminEmail} error={!!errors.adminEmail} />
          </FormField>
        </form>
      </Modal>
    </>
  );
}
