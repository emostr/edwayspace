import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Schedule } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleEntryDto } from './dto/create-schedule-entry.dto';
import { UpdateScheduleEntryDto } from './dto/update-schedule-entry.dto';

@Injectable()
export class ScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  async create(schoolId: string, dto: CreateScheduleEntryDto): Promise<Schedule> {
    await this.ensureSameSchool(schoolId, dto.classId, dto.subjectId);
    return this.prisma.schedule.create({ data: dto });
  }

  async findByClass(schoolId: string, classId: string): Promise<Schedule[]> {
    await this.ensureClassInSchool(schoolId, classId);
    return this.prisma.schedule.findMany({
      where: { classId },
      include: { subject: true },
      orderBy: [{ dayOfWeek: 'asc' }, { lessonNumber: 'asc' }],
    });
  }

  async findOne(schoolId: string, id: string): Promise<Schedule> {
    const entry = await this.prisma.schedule.findFirst({
      where: { id, class: { schoolId } },
    });
    if (!entry) throw new NotFoundException('Schedule entry not found');
    return entry;
  }

  async update(schoolId: string, id: string, dto: UpdateScheduleEntryDto): Promise<Schedule> {
    await this.findOne(schoolId, id);
    if (dto.classId || dto.subjectId) {
      const current = await this.prisma.schedule.findUnique({ where: { id } });
      await this.ensureSameSchool(
        schoolId,
        dto.classId ?? current!.classId,
        dto.subjectId ?? current!.subjectId,
      );
    }
    return this.prisma.schedule.update({ where: { id }, data: dto });
  }

  async remove(schoolId: string, id: string): Promise<void> {
    await this.findOne(schoolId, id);
    await this.prisma.schedule.delete({ where: { id } });
  }

  private async ensureClassInSchool(schoolId: string, classId: string): Promise<void> {
    const klass = await this.prisma.class.findFirst({ where: { id: classId, schoolId } });
    if (!klass) throw new BadRequestException('Class not found in this school');
  }

  private async ensureSameSchool(
    schoolId: string,
    classId: string,
    subjectId: string,
  ): Promise<void> {
    const [klass, subject] = await Promise.all([
      this.prisma.class.findFirst({ where: { id: classId, schoolId } }),
      this.prisma.subject.findFirst({ where: { id: subjectId, schoolId } }),
    ]);
    if (!klass || !subject) {
      throw new BadRequestException('Class or subject not found in this school');
    }
  }
}
