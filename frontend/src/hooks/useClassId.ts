'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useApi } from './useApi';
import type { ClassWithHead } from '@/lib/types';

const STUDENT_ROLES = ['STUDENT', 'TRUSTED_STUDENT'];
const TEACHER_ROLES = ['TEACHER', 'CLASS_HEAD', 'ZAVUCH'];

export interface UseClassIdResult {
  classId: string | null;
  classes: { id: string; name: string }[];
  setClassId: (id: string) => void;
  needsSelector: boolean;
  isLoading: boolean;
}

export function useClassId(): UseClassIdResult {
  const { user } = useAuth();
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

  const isTeacherRole = user && TEACHER_ROLES.includes(user.role);

  const { data: allClasses, isLoading } = useApi<ClassWithHead[]>(
    isTeacherRole ? '/classes' : null,
  );

  const classes = useMemo(
    () => (allClasses ?? []).map((c) => ({ id: c.id, name: c.name })),
    [allClasses],
  );

  const defaultClassId = useMemo(() => {
    if (!isTeacherRole) return null;
    const myClass = allClasses?.find((c) => c.classHeadId === user?.id);
    return myClass?.id ?? classes[0]?.id ?? null;
  }, [isTeacherRole, allClasses, classes, user?.id]);

  if (!user) return { classId: null, classes: [], setClassId: () => {}, needsSelector: false, isLoading: false };

  if (STUDENT_ROLES.includes(user.role)) {
    return { classId: user.classId ?? null, classes: [], setClassId: () => {}, needsSelector: false, isLoading: false };
  }

  const classId = selectedClassId ?? defaultClassId;

  return {
    classId,
    classes,
    setClassId: setSelectedClassId,
    needsSelector: classes.length > 1,
    isLoading,
  };
}
