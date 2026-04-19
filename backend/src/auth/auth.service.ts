import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from '../common/types/jwt-payload';

export interface LoginResult {
  accessToken: string;
  mustChangePassword: boolean;
  user: {
    id: string;
    login: string;
    firstName: string;
    lastName: string;
    role: User['role'];
    schoolId: string | null;
    classId: string | null;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(login: string, password: string): Promise<LoginResult> {
    const user = await this.prisma.user.findUnique({ where: { login } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const payload: JwtPayload = {
      sub: user.id,
      schoolId: user.schoolId,
      role: user.role,
      classId: user.classId,
    };
    const accessToken = await this.jwt.signAsync(payload);

    return {
      accessToken,
      mustChangePassword: user.mustChangePassword,
      user: {
        id: user.id,
        login: user.login,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        schoolId: user.schoolId,
        classId: user.classId,
      },
    };
  }

  async changePassword(userId: string, newPassword: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash, mustChangePassword: false },
    });
  }
}
