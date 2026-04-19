import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateTeacherAssignmentDto {
  @ApiProperty()
  @IsUUID()
  teacherId!: string;

  @ApiProperty()
  @IsUUID()
  subjectId!: string;

  @ApiProperty()
  @IsUUID()
  classId!: string;
}
