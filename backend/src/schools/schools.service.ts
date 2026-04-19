import { Injectable, NotFoundException } from '@nestjs/common';
import { School } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';

@Injectable()
export class SchoolsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateSchoolDto): Promise<School> {
    return this.prisma.school.create({ data: dto });
  }

  findAll(): Promise<School[]> {
    return this.prisma.school.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string): Promise<School> {
    const school = await this.prisma.school.findUnique({ where: { id } });
    if (!school) throw new NotFoundException('School not found');
    return school;
  }

  async update(id: string, dto: UpdateSchoolDto): Promise<School> {
    await this.findOne(id);
    return this.prisma.school.update({ where: { id }, data: dto });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.prisma.school.delete({ where: { id } });
  }
}
