import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class CreateNoteDto {
  @ApiProperty()
  @IsUUID()
  classId!: string;

  @ApiProperty()
  @IsUUID()
  subjectId!: string;

  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty()
  @IsString()
  content!: string;
}
