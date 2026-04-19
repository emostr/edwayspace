'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/context/ToastContext';
import { superadminApi } from '@/lib/superadminApi';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { FormField } from '@/components/ui/FormField/FormField';
import { Modal } from '@/components/ui/Modal/Modal';
import { CopyButton } from '@/components/CopyButton/CopyButton';
import styles from './school.module.css';

interface SchoolDetail {
  id: string;
  name: string;
  city: string;
  adminEmail: string;
  createdAt: string;
  _count: { users: number; classes: number; subjects: number };
}

interface CreatedAdmin {
  login: string;
  tempPassword: string;
}

export default function SuperadminSchoolDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { showToast } = useToast();

  const [school, setSchool] = useState<SchoolDetail | null>(null);

  const [editName, setEditName] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [saving, setSaving] = useState(false);

  const [adminFirstName, setAdminFirstName] = useState('');
  const [adminLastName, setAdminLastName] = useState('');
  const [adminErrors, setAdminErrors] = useState<Record<string, string>>({});
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [createdAdmin, setCreatedAdmin] = useState<CreatedAdmin | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    const data = await superadminApi.get<SchoolDetail>(`/superadmin/schools/${id}`);
    setSchool(data);
    setEditName(data.name);
    setEditCity(data.city);
    setEditEmail(data.adminEmail);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function handleSave() {
    setSaving(true);
    try {
      await superadminApi.patch(`/superadmin/schools/${id}`, {
        name: editName.trim(),
        city: editCity.trim(),
        adminEmail: editEmail.trim(),
      });
      showToast('Сохранено', 'success');
      load();
    } catch {
      showToast('Ошибка сохранения', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateAdmin(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!adminFirstName.trim()) errs.firstName = 'Введите имя';
    if (!adminLastName.trim()) errs.lastName = 'Введите фамилию';
    setAdminErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setCreatingAdmin(true);
    try {
      const res = await superadminApi.post<{ login: string; tempPassword: string }>(
        `/superadmin/schools/${id}/admin`,
        { firstName: adminFirstName.trim(), lastName: adminLastName.trim() },
      );
      setCreatedAdmin(res);
      setAdminFirstName('');
      setAdminLastName('');
      setAdminErrors({});
      load();
    } catch {
      showToast('Ошибка создания завуча', 'error');
    } finally {
      setCreatingAdmin(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await superadminApi.delete(`/superadmin/schools/${id}`);
      showToast('Школа удалена', 'success');
      router.push('/superadmin/dashboard');
    } catch {
      showToast('Ошибка удаления', 'error');
    } finally {
      setDeleting(false);
    }
  }

  if (!school) return null;

  return (
    <>
      <PageHeader
        title={school.name}
        subtitle={school.city}
        backLink={{ href: '/superadmin/dashboard/schools', label: 'Назад к школам' }}
      />

      <div className={styles.statsRow}>
        {[
          { label: 'Пользователей', value: school._count.users },
          { label: 'Классов', value: school._count.classes },
          { label: 'Предметов', value: school._count.subjects },
        ].map((s) => (
          <div key={s.label} className={styles.statCard}>
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Создать завуча школы</h3>
        <p className={styles.sectionDesc}>Завуч получит логин и временный пароль. Передайте их лично.</p>
        <form className={styles.sectionForm} onSubmit={handleCreateAdmin}>
          <FormField label="Имя" required error={adminErrors.firstName}>
            <Input type="text" placeholder="Иван" value={adminFirstName} onChange={setAdminFirstName} error={!!adminErrors.firstName} />
          </FormField>
          <FormField label="Фамилия" required error={adminErrors.lastName}>
            <Input type="text" placeholder="Иванов" value={adminLastName} onChange={setAdminLastName} error={!!adminErrors.lastName} />
          </FormField>
          <div className={styles.sectionActions}>
            <Button type="submit" loading={creatingAdmin}>Создать завуча</Button>
          </div>
        </form>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Редактировать</h3>
        <div className={styles.sectionForm}>
          <FormField label="Название">
            <Input type="text" value={editName} onChange={setEditName} />
          </FormField>
          <FormField label="Город">
            <Input type="text" value={editCity} onChange={setEditCity} />
          </FormField>
          <FormField label="Email администратора">
            <Input type="email" value={editEmail} onChange={setEditEmail} />
          </FormField>
          <div className={styles.sectionActions}>
            <Button onClick={handleSave} loading={saving}>Сохранить</Button>
          </div>
        </div>
      </div>

      <div className={`${styles.section} ${styles.dangerSection}`}>
        <h3 className={styles.sectionTitle}>Удаление школы</h3>
        <p className={styles.sectionDesc}>
          Удаление школы необратимо. Будут удалены все пользователи, классы, домашние задания и другие данные.
        </p>
        <button className={styles.dangerBtn} onClick={() => setDeleteModalOpen(true)}>
          Удалить школу
        </button>
      </div>

      <Modal
        isOpen={!!createdAdmin}
        onClose={() => setCreatedAdmin(null)}
        title="Завуч создан"
        actions={<Button onClick={() => setCreatedAdmin(null)}>Готово</Button>}
      >
        <p style={{ marginBottom: 'var(--space-sm)', fontSize: 14 }}>
          Передайте эти данные завучу лично:
        </p>
        <div className={styles.credBlock}>
          <div className={styles.credRow}>
            <div>
              <div className={styles.credLabel}>Логин</div>
              <div className={styles.credValue}>{createdAdmin?.login}</div>
            </div>
            <CopyButton text={createdAdmin?.login ?? ''} />
          </div>
          <div className={styles.credRow}>
            <div>
              <div className={styles.credLabel}>Временный пароль</div>
              <div className={styles.credValue}>{createdAdmin?.tempPassword}</div>
            </div>
            <CopyButton text={createdAdmin?.tempPassword ?? ''} />
          </div>
        </div>
        <p className={styles.credWarning}>Сохраните пароль — он показывается только один раз</p>
      </Modal>

      <Modal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeleteConfirm(''); }}
        title="Удаление школы"
        actions={
          <Button
            onClick={handleDelete}
            loading={deleting}
            disabled={deleteConfirm !== school.name}
          >
            Удалить
          </Button>
        }
      >
        <p style={{ marginBottom: 'var(--space-sm)', fontSize: 14 }}>
          Введите название школы для подтверждения:
        </p>
        <Input
          type="text"
          placeholder={school.name}
          value={deleteConfirm}
          onChange={setDeleteConfirm}
        />
      </Modal>
    </>
  );
}
