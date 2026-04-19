import { Injectable, NotFoundException } from '@nestjs/common';
import { Subject } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  create(schoolId: string, dto: CreateSubjectDto): Promise<Subject> {
    return this.prisma.subject.create({ data: { schoolId, name: dto.name } });
  }

  findAll(schoolId: string): Promise<Subject[]> {
    return this.prisma.subject.findMany({ where: { schoolId }, orderBy: { name: 'asc' } });
  }

  async findOne(schoolId: string, id: string): Promise<Subject> {
    const subject = await this.prisma.subject.findFirst({ where: { id, schoolId } });
    if (!subject) throw new NotFoundException('Subject not found');
    return subject;
  }

  async update(schoolId: string, id: string, dto: UpdateSubjectDto): Promise<Subject> {
    await this.findOne(schoolId, id);
    return this.prisma.subject.update({ where: { id }, data: dto });
  }

  async remove(schoolId: string, id: string): Promise<void> {
    await this.findOne(schoolId, id);
    await this.prisma.subject.delete({ where: { id } });
  }
}
