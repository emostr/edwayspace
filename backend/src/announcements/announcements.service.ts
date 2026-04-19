import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Announcement, AnnouncementLevel, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../common/types/jwt-payload';
import { roleSatisfies } from '../common/types/role-hierarchy';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';

@Injectable()
export class AnnouncementsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(me: AuthenticatedUser, dto: CreateAnnouncementDto): Promise<Announcement> {
    if (dto.level === AnnouncementLevel.SCHOOL) {
      if (me.role !== Role.ZAVUCH) {
        throw new ForbiddenException('Only zavuch can post school-wide announcements');
      }
      if (dto.classId) {
        throw new BadRequestException('School-wide announcements must not have classId');
      }
      return this.prisma.announcement.create({
        data: {
          schoolId: me.schoolId!,
          authorId: me.sub,
          level: AnnouncementLevel.SCHOOL,
          classId: null,
          content: dto.content,
        },
      });
    }

    if (!roleSatisfies(me.role, Role.CLASS_HEAD)) {
      throw new ForbiddenException('Only class head or zavuch can post class announcements');
    }
    if (!dto.classId) throw new BadRequestException('classId is required for class announcements');

    const klass = await this.prisma.class.findFirst({
      where: { id: dto.classId, schoolId: me.schoolId! },
    });
    if (!klass) throw new BadRequestException('Class not found in this school');

    return this.prisma.announcement.create({
      data: {
        schoolId: me.schoolId!,
        authorId: me.sub,
        level: AnnouncementLevel.CLASS,
        classId: dto.classId,
        content: dto.content,
      },
    });
  }

  async findForClass(schoolId: string, classId: string): Promise<Announcement[]> {
    const klass = await this.prisma.class.findFirst({ where: { id: classId, schoolId } });
    if (!klass) throw new BadRequestException('Class not found in this school');
    return this.prisma.announcement.findMany({
      where: {
        schoolId,
        OR: [{ level: AnnouncementLevel.SCHOOL }, { classId }],
      },
      include: { author: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(schoolId: string, id: string): Promise<Announcement> {
    const a = await this.prisma.announcement.findFirst({ where: { id, schoolId } });
    if (!a) throw new NotFoundException('Announcement not found');
    return a;
  }

  async remove(me: AuthenticatedUser, id: string): Promise<void> {
    const a = await this.findOne(me.schoolId!, id);
    const isAuthor = a.authorId === me.sub;
    const isZavuch = me.role === Role.ZAVUCH;
    if (!isAuthor && !isZavuch) {
      throw new ForbiddenException('Only author or zavuch can delete');
    }
    await this.prisma.announcement.delete({ where: { id } });
  }
}
