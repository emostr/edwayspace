import { AnnouncementLevel, PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  await prisma.announcement.deleteMany();
  await prisma.homework.deleteMany();
  await prisma.note.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.teacherAssignment.deleteMany();
  await prisma.user.deleteMany();
  await prisma.class.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.school.deleteMany();

  const superadminHash = await bcrypt.hash('superadmin2026!', 10);
  await prisma.user.upsert({
    where: { login: 'superadmin' },
    update: {},
    create: {
      login: 'superadmin',
      passwordHash: superadminHash,
      role: Role.SUPERADMIN,
      firstName: 'Super',
      lastName: 'Admin',
      mustChangePassword: false,
    },
  });

  const passwordHash = await bcrypt.hash('test123', 10);

  const school = await prisma.school.create({
    data: {
      name: 'Школа №42',
      city: 'Пенза',
      adminEmail: 'admin@school42.ru',
    },
  });

  const [class9A, class9B, class10A] = await Promise.all([
    prisma.class.create({ data: { schoolId: school.id, name: '9А' } }),
    prisma.class.create({ data: { schoolId: school.id, name: '9Б' } }),
    prisma.class.create({ data: { schoolId: school.id, name: '10А' } }),
  ]);

  const [math, russian, physics, informatics, history] = await Promise.all([
    prisma.subject.create({ data: { schoolId: school.id, name: 'Математика' } }),
    prisma.subject.create({ data: { schoolId: school.id, name: 'Русский язык' } }),
    prisma.subject.create({ data: { schoolId: school.id, name: 'Физика' } }),
    prisma.subject.create({ data: { schoolId: school.id, name: 'Информатика' } }),
    prisma.subject.create({ data: { schoolId: school.id, name: 'История' } }),
  ]);

  const baseUser = {
    schoolId: school.id,
    passwordHash,
    mustChangePassword: false,
  };

  const zavuch = await prisma.user.create({
    data: {
      ...baseUser,
      login: 'zavuch',
      firstName: 'Ирина',
      lastName: 'Петрова',
      role: Role.ZAVUCH,
    },
  });

  const klassruk9a = await prisma.user.create({
    data: {
      ...baseUser,
      login: 'klassruk.9a',
      firstName: 'Ольга',
      lastName: 'Смирнова',
      role: Role.CLASS_HEAD,
    },
  });

  const klassruk9b = await prisma.user.create({
    data: {
      ...baseUser,
      login: 'klassruk.9b',
      firstName: 'Наталья',
      lastName: 'Иванова',
      role: Role.CLASS_HEAD,
    },
  });

  await prisma.class.update({ where: { id: class9A.id }, data: { classHeadId: klassruk9a.id } });
  await prisma.class.update({ where: { id: class9B.id }, data: { classHeadId: klassruk9b.id } });

  const teacherMath = await prisma.user.create({
    data: {
      ...baseUser,
      login: 'teacher.math',
      firstName: 'Сергей',
      lastName: 'Кузнецов',
      role: Role.TEACHER,
    },
  });

  const teacherRussian = await prisma.user.create({
    data: {
      ...baseUser,
      login: 'teacher.russian',
      firstName: 'Елена',
      lastName: 'Соколова',
      role: Role.TEACHER,
    },
  });

  const teacherPhysics = await prisma.user.create({
    data: {
      ...baseUser,
      login: 'teacher.physics',
      firstName: 'Андрей',
      lastName: 'Волков',
      role: Role.TEACHER,
    },
  });

  const studentData = [
    { login: 'student.9a.1', firstName: 'Алексей', lastName: 'Новиков', classId: class9A.id },
    { login: 'student.9a.2', firstName: 'Мария', lastName: 'Орлова', classId: class9A.id },
    { login: 'student.9b.1', firstName: 'Дмитрий', lastName: 'Фёдоров', classId: class9B.id },
    { login: 'student.9b.2', firstName: 'Анна', lastName: 'Морозова', classId: class9B.id },
    { login: 'student.10a.1', firstName: 'Илья', lastName: 'Павлов', classId: class10A.id },
    { login: 'student.10a.2', firstName: 'София', lastName: 'Киселёва', classId: class10A.id },
  ];

  for (const s of studentData) {
    await prisma.user.create({
      data: {
        ...baseUser,
        login: s.login,
        firstName: s.firstName,
        lastName: s.lastName,
        classId: s.classId,
        role: Role.STUDENT,
      },
    });
  }

  const trusted9a = await prisma.user.create({
    data: {
      ...baseUser,
      login: 'trusted.9a',
      firstName: 'Виктор',
      lastName: 'Белов',
      classId: class9A.id,
      role: Role.TRUSTED_STUDENT,
    },
  });

  const assignments: Array<{ teacherId: string; subjectId: string; classId: string }> = [
    { teacherId: teacherMath.id, subjectId: math.id, classId: class9A.id },
    { teacherId: teacherMath.id, subjectId: math.id, classId: class9B.id },
    { teacherId: teacherMath.id, subjectId: math.id, classId: class10A.id },
    { teacherId: teacherRussian.id, subjectId: russian.id, classId: class9A.id },
    { teacherId: teacherRussian.id, subjectId: russian.id, classId: class9B.id },
    { teacherId: teacherPhysics.id, subjectId: physics.id, classId: class9A.id },
    { teacherId: teacherPhysics.id, subjectId: physics.id, classId: class10A.id },
  ];
  for (const a of assignments) {
    await prisma.teacherAssignment.create({ data: a });
  }

  const mondayLessons = [
    { subjectId: math.id, lessonNumber: 1 },
    { subjectId: russian.id, lessonNumber: 2 },
    { subjectId: physics.id, lessonNumber: 3 },
    { subjectId: informatics.id, lessonNumber: 4 },
  ];
  for (const l of mondayLessons) {
    await prisma.schedule.create({
      data: { classId: class9A.id, dayOfWeek: 1, ...l },
    });
  }

  await prisma.homework.create({
    data: {
      classId: class9A.id,
      subjectId: math.id,
      authorId: teacherMath.id,
      content: '§12, номера 245–250',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.homework.create({
    data: {
      classId: class9A.id,
      subjectId: russian.id,
      authorId: teacherRussian.id,
      content: 'Упражнение 312, выписать словарные слова',
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.announcement.create({
    data: {
      schoolId: school.id,
      authorId: zavuch.id,
      level: AnnouncementLevel.SCHOOL,
      content: 'В пятницу 18:00 — школьное собрание в актовом зале.',
    },
  });

  console.log('Seed completed.');
  console.log(`Zavuch id: ${zavuch.id}`);
  console.log(`Trusted student id: ${trusted9a.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
