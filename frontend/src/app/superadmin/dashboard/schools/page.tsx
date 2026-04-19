'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import { superadminApi } from '@/lib/superadminApi';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { FormField } from '@/components/ui/FormField/FormField';
import { Modal } from '@/components/ui/Modal/Modal';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import overviewStyles from '../overview.module.css';

interface SchoolItem {
  id: string;
  name: string;
  city: string;
  adminEmail: string;
  createdAt: string;
  _count: { users: number; classes: number };
}

export default function SuperadminSchoolsPage() {
  const { showToast } = useToast();
  const [schools, setSchools] = useState<SchoolItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    const data = await superadminApi.get<SchoolItem[]>('/superadmin/schools');
    setSchools(data);
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

  return (
    <>
      <div className={overviewStyles.sectionHeader}>
        <PageHeader title="Школы" />
        <Button onClick={() => setModalOpen(true)}>Добавить школу</Button>
      </div>

      <div className={overviewStyles.schoolList}>
        {schools.length === 0 && (
          <div className={overviewStyles.emptyState}>Школ пока нет. Добавьте первую.</div>
        )}
        {schools.map((s) => (
          <div key={s.id} className={overviewStyles.schoolCard}>
            <div className={overviewStyles.schoolInfo}>
              <div className={overviewStyles.schoolName}>{s.name}</div>
              <div className={overviewStyles.schoolCity}>{s.city}</div>
              <div className={overviewStyles.schoolMeta}>
                {s._count.users} пользователей · {s._count.classes} классов
              </div>
            </div>
            <div className={overviewStyles.schoolRight}>
              <span className={overviewStyles.schoolDate}>
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
        actions={<Button onClick={handleCreate} loading={submitting}>Создать</Button>}
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
