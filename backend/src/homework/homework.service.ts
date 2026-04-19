import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Homework, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../common/types/jwt-payload';
import { roleSatisfies } from '../common/types/role-hierarchy';
import { CreateHomeworkDto } from './dto/create-homework.dto';
import { UpdateHomeworkDto } from './dto/update-homework.dto';

@Injectable()
export class HomeworkService {
  constructor(private readonly prisma: PrismaService) {}

  async create(me: AuthenticatedUser, dto: CreateHomeworkDto): Promise<Homework> {
    const [klass, subject] = await Promise.all([
      this.prisma.class.findFirst({ where: { id: dto.classId, schoolId: me.schoolId! } }),
      this.prisma.subject.findFirst({ where: { id: dto.subjectId, schoolId: me.schoolId! } }),
    ]);
    if (!klass || !subject) {
      throw new BadRequestException('Class or subject not found in this school');
    }

    if (me.role === Role.TEACHER || me.role === Role.CLASS_HEAD) {
      const assignment = await this.prisma.teacherAssignment.findUnique({
        where: {
          teacherId_subjectId_classId: {
            teacherId: me.sub,
            subjectId: dto.subjectId,
            classId: dto.classId,
          },
        },
      });
      if (!assignment && me.role !== Role.CLASS_HEAD) {
        throw new ForbiddenException('Teacher is not assigned to this class+subject');
      }
      if (!assignment && me.role === Role.CLASS_HEAD && klass.classHeadId !== me.sub) {
        throw new ForbiddenException('Class head can only post for own class or assigned subjects');
      }
    }

    if (me.role === Role.TRUSTED_STUDENT) {
      if (me.classId !== dto.classId) {
        throw new ForbiddenException('Trusted student can only post in own class');
      }
    }

    return this.prisma.homework.create({
      data: {
        classId: dto.classId,
        subjectId: dto.subjectId,
        authorId: me.sub,
        content: dto.content,
        deadline: dto.deadline ?? null,
      },
    });
  }

  async findByClass(schoolId: string, classId: string): Promise<Homework[]> {
    const klass = await this.prisma.class.findFirst({ where: { id: classId, schoolId } });
    if (!klass) throw new BadRequestException('Class not found in this school');
    return this.prisma.homework.findMany({
      where: { classId },
      include: { subject: true, author: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(schoolId: string, id: string): Promise<Homework> {
    const hw = await this.prisma.homework.findFirst({
      where: { id, class: { schoolId } },
      include: { subject: true, author: { select: { id: true, firstName: true, lastName: true } } },
    });
    if (!hw) throw new NotFoundException('Homework not found');
    return hw;
  }

  async update(me: AuthenticatedUser, id: string, dto: UpdateHomeworkDto): Promise<Homework> {
    const hw = await this.findOne(me.schoolId!, id);
    if (hw.authorId !== me.sub) {
      throw new ForbiddenException('Only the author can update this homework');
    }
    return this.prisma.homework.update({ where: { id }, data: dto });
  }

  async remove(me: AuthenticatedUser, id: string): Promise<void> {
    const hw = await this.findOne(me.schoolId!, id);
    const isAuthor = hw.authorId === me.sub;
    const isPrivileged = roleSatisfies(me.role, Role.CLASS_HEAD);
    if (!isAuthor && !isPrivileged) {
      throw new ForbiddenException('Only author or class head / zavuch can delete');
    }
    await this.prisma.homework.delete({ where: { id } });
  }
}
