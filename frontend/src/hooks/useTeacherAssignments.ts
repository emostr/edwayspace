'use client';

import { useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useApi } from './useApi';
import type { TeacherAssignment } from '@/lib/types';

interface AssignmentOption {
  id: string;
  name: string;
}

interface UseTeacherAssignmentsResult {
  assignments: TeacherAssignment[];
  classes: AssignmentOption[];
  subjects: AssignmentOption[];
  getSubjectsForClass: (classId: string) => AssignmentOption[];
  getClassesForSubject: (subjectId: string) => AssignmentOption[];
  isLoading: boolean;
}

export function useTeacherAssignments(): UseTeacherAssignmentsResult {
  const { user } = useAuth();

  const { data, isLoading } = useApi<TeacherAssignment[]>(
    user ? `/teacher-assignments?teacherId=${user.id}` : null,
  );

  const assignments = data ?? [];

  const classes = useMemo<AssignmentOption[]>(() => {
    const seen = new Set<string>();
    return assignments
      .filter((a) => {
        if (seen.has(a.classId)) return false;
        seen.add(a.classId);
        return true;
      })
      .map((a) => ({ id: a.classId, name: a.class.name }));
  }, [assignments]);

  const subjects = useMemo<AssignmentOption[]>(() => {
    const seen = new Set<string>();
    return assignments
      .filter((a) => {
        if (seen.has(a.subjectId)) return false;
        seen.add(a.subjectId);
        return true;
      })
      .map((a) => ({ id: a.subjectId, name: a.subject.name }));
  }, [assignments]);

  const getSubjectsForClass = useMemo(
    () =>
      (classId: string): AssignmentOption[] => {
        const seen = new Set<string>();
        return assignments
          .filter((a) => {
            if (a.classId !== classId || seen.has(a.subjectId)) return false;
            seen.add(a.subjectId);
            return true;
          })
          .map((a) => ({ id: a.subjectId, name: a.subject.name }));
      },
    [assignments],
  );

  const getClassesForSubject = useMemo(
    () =>
      (subjectId: string): AssignmentOption[] => {
        const seen = new Set<string>();
        return assignments
          .filter((a) => {
            if (a.subjectId !== subjectId || seen.has(a.classId)) return false;
            seen.add(a.classId);
            return true;
          })
          .map((a) => ({ id: a.classId, name: a.class.name }));
      },
    [assignments],
  );

  return { assignments, classes, subjects, getSubjectsForClass, getClassesForSubject, isLoading };
}
