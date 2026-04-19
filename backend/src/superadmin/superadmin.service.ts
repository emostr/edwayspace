import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { transliterate } from '../common/utils/transliterate';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { CreateSchoolAdminDto } from './dto/create-school-admin.dto';
import { SuperadminChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class SuperadminService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalSchools, totalUsers, totalClasses, schoolsThisMonth] = await Promise.all([
      this.prisma.school.count(),
      this.prisma.user.count({ where: { role: { not: Role.SUPERADMIN } } }),
      this.prisma.class.count(),
      this.prisma.school.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    ]);

    return { totalSchools, totalUsers, totalClasses, schoolsThisMonth };
  }

  async findAllSchools() {
    return this.prisma.school.findMany({
      include: { _count: { select: { users: true, classes: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findSchool(id: string) {
    const school = await this.prisma.school.findUnique({
      where: { id },
      include: {
        _count: { select: { users: true, classes: true, subjects: true } },
        users: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: { id: true, login: true, firstName: true, lastName: true, role: true, createdAt: true },
        },
      },
    });
    if (!school) throw new NotFoundException('School not found');
    return school;
  }

  async createSchool(dto: CreateSchoolDto) {
    return this.prisma.school.create({ data: dto });
  }

  async updateSchool(id: string, dto: UpdateSchoolDto) {
    await this.findSchool(id);
    return this.prisma.school.update({ where: { id }, data: dto });
  }

  async deleteSchool(id: string) {
    await this.findSchool(id);
    await this.prisma.school.delete({ where: { id } });
  }

  async createSchoolAdmin(schoolId: string, dto: CreateSchoolAdminDto) {
    await this.findSchool(schoolId);

    const login = await this.generateLogin(schoolId, dto.firstName, dto.lastName);
    const tempPassword = this.generatePassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const user = await this.prisma.user.create({
      data: {
        schoolId,
        login,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: Role.ZAVUCH,
        passwordHash,
        mustChangePassword: true,
      },
    });

    const { passwordHash: _ph, ...safe } = user;
    return { user: safe, tempPassword, login };
  }

  async changePassword(userId: string, dto: SuperadminChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) throw new BadRequestException('Неверный текущий пароль');

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  }

  private generatePassword(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$';
    return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  private async generateLogin(schoolId: string, firstName: string, lastName: string): Promise<string> {
    const base = `${transliterate(lastName)}.${transliterate(firstName).charAt(0)}`;
    const existing = await this.prisma.user.findMany({
      where: { schoolId, login: { startsWith: base } },
      select: { login: true },
    });
    const taken = new Set(existing.map((u) => u.login));
    if (!taken.has(base)) return base;
    let i = 2;
    while (taken.has(`${base}${i}`)) i++;
    return `${base}${i}`;
  }
}
