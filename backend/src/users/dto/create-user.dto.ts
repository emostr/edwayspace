import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  login?: string;

  @ApiPropertyOptional()
  @IsString()
  firstName!: string;

  @ApiPropertyOptional()
  @IsString()
  lastName!: string;

  @ApiPropertyOptional({ enum: Role })
  @IsEnum(Role)
  role!: Role;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  classId?: string;
}
