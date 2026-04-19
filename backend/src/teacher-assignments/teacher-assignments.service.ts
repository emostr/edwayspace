import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { TeacherAssignment } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTeacherAssignmentDto } from './dto/create-teacher-assignment.dto';

@Injectable()
export class TeacherAssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(schoolId: string, dto: CreateTeacherAssignmentDto): Promise<TeacherAssignment> {
    await this.ensureSameSchool(schoolId, dto);

    const exists = await this.prisma.teacherAssignment.findUnique({
      where: {
        teacherId_subjectId_classId: {
          teacherId: dto.teacherId,
          subjectId: dto.subjectId,
          classId: dto.classId,
        },
      },
    });
    if (exists) throw new ConflictException('Assignment already exists');

    return this.prisma.teacherAssignment.create({ data: dto });
  }

  findAll(
    schoolId: string,
    filters: { teacherId?: string; classId?: string },
  ): Promise<TeacherAssignment[]> {
    return this.prisma.teacherAssignment.findMany({
      where: {
        teacher: { schoolId },
        ...(filters.teacherId ? { teacherId: filters.teacherId } : {}),
        ...(filters.classId ? { classId: filters.classId } : {}),
      },
      include: { teacher: true, subject: true, class: true },
    });
  }

  async findOne(schoolId: string, id: string): Promise<TeacherAssignment> {
    const assignment = await this.prisma.teacherAssignment.findFirst({
      where: { id, teacher: { schoolId } },
    });
    if (!assignment) throw new NotFoundException('Assignment not found');
    return assignment;
  }

  async remove(schoolId: string, id: string): Promise<void> {
    await this.findOne(schoolId, id);
    await this.prisma.teacherAssignment.delete({ where: { id } });
  }

  async isTeacherAssigned(teacherId: string, subjectId: string, classId: string): Promise<boolean> {
    const a = await this.prisma.teacherAssignment.findUnique({
      where: { teacherId_subjectId_classId: { teacherId, subjectId, classId } },
    });
    return !!a;
  }

  private async ensureSameSchool(schoolId: string, dto: CreateTeacherAssignmentDto): Promise<void> {
    const [teacher, subject, klass] = await Promise.all([
      this.prisma.user.findFirst({ where: { id: dto.teacherId, schoolId } }),
      this.prisma.subject.findFirst({ where: { id: dto.subjectId, schoolId } }),
      this.prisma.class.findFirst({ where: { id: dto.classId, schoolId } }),
    ]);
    if (!teacher || !subject || !klass) {
      throw new BadRequestException('Teacher, subject or class not found in this school');
    }
  }
}
