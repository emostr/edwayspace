'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/hooks/useApi';
import { useTeacherAssignments } from '@/hooks/useTeacherAssignments';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Card } from '@/components/ui/Card/Card';
import { Badge } from '@/components/ui/Badge/Badge';
import { Button } from '@/components/ui/Button/Button';
import { SkeletonCard } from '@/components/ui/Skeleton/Skeleton';
import { formatDate, formatTodayLong, getCurrentDayOfWeek } from '@/lib/format';
import type { ScheduleEntry, Homework, Announcement, Note } from '@/lib/types';
import styles from './page.module.css';

const TEACHER_ROLES = ['TEACHER', 'CLASS_HEAD', 'ZAVUCH'];

export default function DashboardPage() {
  usePageTitle('Главная');
  const { user } = useAuth();
  const router = useRouter();
  const classId = user?.classId ?? null;
  const isTeacher = user && TEACHER_ROLES.includes(user.role);

  const { assignments, classes, isLoading: assignmentsLoading } = useTeacherAssignments();

  const { data: schedule, isLoading: scheduleLoading } = useApi<ScheduleEntry[]>(
    classId ? `/schedule?classId=${classId}` : null,
  );
  const { data: homework, isLoading: hwLoading } = useApi<Homework[]>(
    classId ? `/homework?classId=${classId}` : null,
  );
  const { data: announcements, isLoading: annLoading } = useApi<Announcement[]>(
    classId ? `/announcements?classId=${classId}` : null,
  );
  const { data: notes } = useApi<Note[]>(
    classId ? `/notes?classId=${classId}` : null,
  );

  const todayNum = getCurrentDayOfWeek();
  const todayLessons = schedule?.filter((e) => e.dayOfWeek === todayNum).sort((a, b) => a.lessonNumber - b.lessonNumber) ?? [];

  const recentHw = homework?.slice(0, 3) ?? [];
  const recentAnn = announcements?.slice(0, 3) ?? [];

  if (isTeacher) {
    return (
      <div>
        <h1 className={styles.greeting}>Добро пожаловать, {user?.firstName}!</h1>
        <p className={styles.date}>{formatTodayLong()}</p>

        <div className={styles.grid}>
          <Card accent>
            <div className={styles.cardTitle}>Мои предметы</div>
            {assignmentsLoading ? (
              <SkeletonCard />
            ) : assignments.length === 0 ? (
              <p className={styles.muted}>Нет назначенных предметов</p>
            ) : (
              classes.map((cls) => (
                <div key={cls.id} className={styles.assignClass}>
                  <span className={styles.assignClassName}>{cls.name}</span>
                </div>
              ))
            )}
            <Link href="/dashboard/assignments" className={styles.cardLink}>
              Все предметы →
            </Link>
          </Card>

          {classId && (
            <Card accent>
              <div className={styles.cardTitle}>Расписание на сегодня</div>
              {scheduleLoading ? (
                <SkeletonCard />
              ) : todayNum === 7 ? (
                <p className={styles.muted}>Вам повезло</p>
              ) : todayLessons.length === 0 ? (
                <p className={styles.muted}>Уроков нет</p>
              ) : (
                todayLessons.map((e) => (
                  <div key={e.id} className={styles.lessonRow}>
                    <span className={styles.lessonNum}>{e.lessonNumber}</span>
                    <span className={styles.lessonName}>{e.subject.name}</span>
                  </div>
                ))
              )}
              <Link href="/dashboard/schedule" className={styles.cardLink}>
                Полное расписание →
              </Link>
            </Card>
          )}

          <div className={styles.gridFull}>
            <Card accent>
              <div className={styles.cardTitle}>Быстрые действия</div>
              <div className={styles.quickActions}>
                <Button variant="outline" onClick={() => router.push('/dashboard/homework/create')}>
                  Создать задание
                </Button>
                <Button variant="outline" onClick={() => router.push('/dashboard/notes/create')}>
                  Создать конспект
                </Button>
                {(user?.role === 'CLASS_HEAD' || user?.role === 'ZAVUCH') && (
                  <Button variant="outline" onClick={() => router.push('/dashboard/announcements/create')}>
                    Объявление
                  </Button>
                )}
                {(user?.role === 'CLASS_HEAD' || user?.role === 'ZAVUCH') && classId && (
                  <Button variant="outline" onClick={() => router.push('/dashboard/my-class')}>
                    Мой класс
                  </Button>
                )}
              </div>
            </Card>
          </div>

          {classId && (
            <div className={styles.gridFull}>
              <Card accent>
                <div className={styles.cardTitle}>Объявления</div>
                {annLoading ? (
                  <SkeletonCard />
                ) : recentAnn.length === 0 ? (
                  <p className={styles.muted}>Объявлений нет</p>
                ) : (
                  recentAnn.map((ann) => (
                    <div key={ann.id} className={styles.annItem}>
                      <div className={styles.annMeta}>
                        <Badge variant={ann.level === 'SCHOOL' ? 'outline' : 'accent'}>
                          {ann.level === 'SCHOOL' ? 'Школа' : 'Класс'}
                        </Badge>
                        <span className={styles.annDate}>{formatDate(ann.createdAt)}</span>
                      </div>
                      <div className={styles.annText}>
                        {ann.content.length > 120 ? ann.content.slice(0, 120) + '…' : ann.content}
                      </div>
                    </div>
                  ))
                )}
                <Link href="/dashboard/announcements" className={styles.cardLink}>
                  Все объявления →
                </Link>
              </Card>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className={styles.greeting}>Добро пожаловать, {user?.firstName}!</h1>
      <p className={styles.date}>{formatTodayLong()}</p>

      {!classId && (
        <p className={styles.muted}>Вы не привязаны к классу. Обратитесь к администратору.</p>
      )}

      {classId && (
        <div className={styles.grid}>
          <Card accent>
            <div className={styles.cardTitle}>Расписание на сегодня</div>
            {scheduleLoading ? (
              <SkeletonCard />
            ) : todayNum === 7 ? (
              <p className={styles.muted}>Вам повезло</p>
            ) : todayLessons.length === 0 ? (
              <p className={styles.muted}>Уроков нет</p>
            ) : (
              todayLessons.map((e) => (
                <div key={e.id} className={styles.lessonRow}>
                  <span className={styles.lessonNum}>{e.lessonNumber}</span>
                  <span className={styles.lessonName}>{e.subject.name}</span>
                </div>
              ))
            )}
            <Link href="/dashboard/schedule" className={styles.cardLink}>
              Полное расписание →
            </Link>
          </Card>

          <Card accent>
            <div className={styles.cardTitle}>Домашние задания</div>
            {hwLoading ? (
              <SkeletonCard />
            ) : recentHw.length === 0 ? (
              <p className={styles.muted}>Заданий нет</p>
            ) : (
              recentHw.map((hw) => (
                <div key={hw.id} className={styles.hwItem}>
                  <div className={styles.hwSubject}>{hw.subject.name}</div>
                  <div className={styles.hwPreview}>
                    {hw.content.length > 80 ? hw.content.slice(0, 80) + '…' : hw.content}
                  </div>
                  {hw.deadline && (
                    <div className={styles.hwDeadline}>до {formatDate(hw.deadline)}</div>
                  )}
                </div>
              ))
            )}
            <Link href="/dashboard/homework" className={styles.cardLink}>
              Все задания →
            </Link>
          </Card>

          <Card accent>
            <div className={styles.cardTitle}>Конспекты</div>
            {notes && notes.length > 0 ? (
              notes.slice(0, 3).map((n) => (
                <div key={n.id} className={styles.hwItem}>
                  <div className={styles.hwSubject}>{n.subject.name}</div>
                  <div className={styles.hwPreview}>{n.title}</div>
                </div>
              ))
            ) : (
              <p className={styles.muted}>Конспектов нет</p>
            )}
            <Link href="/dashboard/notes" className={styles.cardLink}>
              Все конспекты →
            </Link>
          </Card>

          <div className={styles.gridFull}>
            <Card accent>
              <div className={styles.cardTitle}>Объявления</div>
              {annLoading ? (
                <SkeletonCard />
              ) : recentAnn.length === 0 ? (
                <p className={styles.muted}>Объявлений нет</p>
              ) : (
                recentAnn.map((ann) => (
                  <div key={ann.id} className={styles.annItem}>
                    <div className={styles.annMeta}>
                      <Badge variant={ann.level === 'SCHOOL' ? 'outline' : 'accent'}>
                        {ann.level === 'SCHOOL' ? 'Школа' : 'Класс'}
                      </Badge>
                      <span className={styles.annDate}>{formatDate(ann.createdAt)}</span>
                    </div>
                    <div className={styles.annText}>
                      {ann.content.length > 120 ? ann.content.slice(0, 120) + '…' : ann.content}
                    </div>
                  </div>
                ))
              )}
              <Link href="/dashboard/announcements" className={styles.cardLink}>
                Все объявления →
              </Link>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
