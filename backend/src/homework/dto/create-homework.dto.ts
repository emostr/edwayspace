import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateHomeworkDto {
  @ApiProperty()
  @IsUUID()
  classId!: string;

  @ApiProperty()
  @IsUUID()
  subjectId!: string;

  @ApiProperty()
  @IsString()
  content!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  deadline?: Date;
}
