import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

const CLASS_INCLUDE = {
  classHead: { select: { id: true, firstName: true, lastName: true } },
} as const;

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(schoolId: string, dto: CreateClassDto) {
    if (dto.classHeadId) await this.ensureUserInSchool(dto.classHeadId, schoolId);
    return this.prisma.class.create({
      data: { schoolId, name: dto.name, classHeadId: dto.classHeadId ?? null },
      include: CLASS_INCLUDE,
    });
  }

  findAll(schoolId: string) {
    return this.prisma.class.findMany({
      where: { schoolId },
      orderBy: { name: 'asc' },
      include: CLASS_INCLUDE,
    });
  }

  async findOne(schoolId: string, id: string) {
    const klass = await this.prisma.class.findFirst({
      where: { id, schoolId },
      include: CLASS_INCLUDE,
    });
    if (!klass) throw new NotFoundException('Class not found');
    return klass;
  }

  async update(schoolId: string, id: string, dto: UpdateClassDto) {
    await this.findOne(schoolId, id);
    if (dto.classHeadId) await this.ensureUserInSchool(dto.classHeadId, schoolId);
    return this.prisma.class.update({
      where: { id },
      data: { name: dto.name, classHeadId: dto.classHeadId },
      include: CLASS_INCLUDE,
    });
  }

  async remove(schoolId: string, id: string): Promise<void> {
    await this.findOne(schoolId, id);
    await this.prisma.class.delete({ where: { id } });
  }

  private async ensureUserInSchool(userId: string, schoolId: string): Promise<void> {
    const user = await this.prisma.user.findFirst({ where: { id: userId, schoolId } });
    if (!user) throw new BadRequestException('User not found in this school');
  }
}
