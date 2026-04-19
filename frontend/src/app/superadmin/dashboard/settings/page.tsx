'use client';

import { useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { superadminApi } from '@/lib/superadminApi';
import { PageHeader } from '@/components/ui/PageHeader/PageHeader';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { FormField } from '@/components/ui/FormField/FormField';
import styles from './settings.module.css';

export default function SuperadminSettingsPage() {
  const { showToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!currentPassword) errs.currentPassword = 'Введите текущий пароль';
    if (newPassword.length < 8) errs.newPassword = 'Минимум 8 символов';
    if (newPassword !== confirmPassword) errs.confirmPassword = 'Пароли не совпадают';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      await superadminApi.post('/superadmin/change-password', { currentPassword, newPassword });
      showToast('Пароль изменён', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      showToast('Неверный текущий пароль', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader title="Настройки" />
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Смена пароля</h3>
        <form className={styles.form} onSubmit={handleSubmit}>
          <FormField label="Текущий пароль" required error={errors.currentPassword}>
            <Input type="password" value={currentPassword} onChange={setCurrentPassword} error={!!errors.currentPassword} />
          </FormField>
          <FormField label="Новый пароль" required error={errors.newPassword}>
            <Input type="password" value={newPassword} onChange={setNewPassword} error={!!errors.newPassword} />
          </FormField>
          <FormField label="Повторите пароль" required error={errors.confirmPassword}>
            <Input type="password" value={confirmPassword} onChange={setConfirmPassword} error={!!errors.confirmPassword} />
          </FormField>
          <div className={styles.actions}>
            <Button type="submit" loading={submitting}>Сохранить</Button>
          </div>
        </form>
      </div>
    </>
  );
}
