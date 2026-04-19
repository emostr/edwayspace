export interface Subject {
  id: string;
  name: string;
  schoolId: string;
}

export interface Author {
  id: string;
  firstName: string;
  lastName: string;
}

export interface ScheduleEntry {
  id: string;
  classId: string;
  subjectId: string;
  dayOfWeek: number;
  lessonNumber: number;
  subject: Subject;
}

export interface Homework {
  id: string;
  classId: string;
  subjectId: string;
  authorId: string;
  content: string;
  deadline: string | null;
  createdAt: string;
  subject: Subject;
  author: Author;
}

export interface Note {
  id: string;
  classId: string;
  subjectId: string;
  authorId: string;
  title: string;
  content: string;
  createdAt: string;
  subject: Subject;
  author: Author;
}

export interface Announcement {
  id: string;
  schoolId: string;
  classId: string | null;
  authorId: string;
  content: string;
  level: 'CLASS' | 'SCHOOL';
  createdAt: string;
  author: Author;
}

export interface Class {
  id: string;
  schoolId: string;
  classHeadId: string | null;
  name: string;
}

export interface TeacherAssignment {
  id: string;
  teacherId: string;
  subjectId: string;
  classId: string;
  subject: Subject;
  class: Class;
}

export interface User {
  id: string;
  schoolId: string;
  classId: string | null;
  login: string;
  role: string;
  firstName: string;
  lastName: string;
  mustChangePassword: boolean;
  createdAt: string;
}

export interface ClassWithHead {
  id: string;
  schoolId: string;
  classHeadId: string | null;
  name: string;
  classHead: { id: string; firstName: string; lastName: string } | null;
}

export interface TeacherAssignmentFull {
  id: string;
  teacherId: string;
  subjectId: string;
  classId: string;
  teacher: { id: string; firstName: string; lastName: string };
  subject: { id: string; name: string };
  class: { id: string; name: string };
}
