import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { transliterate } from '../common/utils/transliterate';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

export interface CreatedUserResult {
  user: Omit<User, 'passwordHash'>;
  temporaryPassword: string;
  login: string;
}

export interface ResetPasswordResult {
  temporaryPassword: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(schoolId: string, dto: CreateUserDto): Promise<CreatedUserResult> {
    if (dto.classId) {
      const klass = await this.prisma.class.findFirst({ where: { id: dto.classId, schoolId } });
      if (!klass) throw new BadRequestException('Class not found in this school');
    }

    const login = dto.login ?? await this.generateLogin(schoolId, dto.firstName, dto.lastName);

    const existing = await this.prisma.user.findUnique({ where: { login } });
    if (existing) throw new ConflictException('Login already taken');

    const temporaryPassword = this.generatePassword();
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);

    const user = await this.prisma.user.create({
      data: {
        schoolId,
        login,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role,
        classId: dto.classId ?? null,
        passwordHash,
        mustChangePassword: true,
      },
    });

    const { passwordHash: _ph, ...safe } = user;
    return { user: safe, temporaryPassword, login };
  }

  async findAll(schoolId: string, filters: { role?: Role; classId?: string } = {}): Promise<Omit<User, 'passwordHash'>[]> {
    const users = await this.prisma.user.findMany({
      where: {
        schoolId,
        ...(filters.role ? { role: filters.role } : {}),
        ...(filters.classId ? { classId: filters.classId } : {}),
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });
    return users.map(({ passwordHash: _ph, ...rest }) => rest);
  }

  async findOne(schoolId: string, id: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.prisma.user.findFirst({ where: { id, schoolId } });
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash: _ph, ...safe } = user;
    return safe;
  }

  async update(schoolId: string, id: string, dto: UpdateUserDto): Promise<Omit<User, 'passwordHash'>> {
    await this.findOne(schoolId, id);

    if (dto.classId) {
      const klass = await this.prisma.class.findFirst({ where: { id: dto.classId, schoolId } });
      if (!klass) throw new BadRequestException('Class not found in this school');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role,
        classId: dto.classId,
      },
    });
    const { passwordHash: _ph, ...safe } = updated;
    return safe;
  }

  async resetPassword(schoolId: string, id: string): Promise<ResetPasswordResult> {
    await this.findOne(schoolId, id);
    const temporaryPassword = this.generatePassword();
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);
    await this.prisma.user.update({ where: { id }, data: { passwordHash, mustChangePassword: true } });
    return { temporaryPassword };
  }

  async remove(schoolId: string, id: string): Promise<void> {
    await this.findOne(schoolId, id);
    await this.prisma.user.delete({ where: { id } });
  }

  private generatePassword(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
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
