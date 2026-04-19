import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AnnouncementLevel } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAnnouncementDto {
  @ApiProperty({ enum: AnnouncementLevel })
  @IsEnum(AnnouncementLevel)
  level!: AnnouncementLevel;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  classId?: string;

  @ApiProperty()
  @IsString()
  content!: string;
}
