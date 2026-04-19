import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AnnouncementsModule } from './announcements/announcements.module';
import { AuthModule } from './auth/auth.module';
import { ClassesModule } from './classes/classes.module';
import { SuperadminRouteGuard } from './common/guards/superadmin-route.guard';
import { HomeworkModule } from './homework/homework.module';
import { NotesModule } from './notes/notes.module';
import { PrismaModule } from './prisma/prisma.module';
import { ScheduleModule } from './schedule/schedule.module';
import { SchoolsModule } from './schools/schools.module';
import { SubjectsModule } from './subjects/subjects.module';
import { SuperadminModule } from './superadmin/superadmin.module';
import { TeacherAssignmentsModule } from './teacher-assignments/teacher-assignments.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    SchoolsModule,
    UsersModule,
    ClassesModule,
    SubjectsModule,
    TeacherAssignmentsModule,
    ScheduleModule,
    HomeworkModule,
    NotesModule,
    AnnouncementsModule,
    SuperadminModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: SuperadminRouteGuard },
  ],
})
export class AppModule {}
