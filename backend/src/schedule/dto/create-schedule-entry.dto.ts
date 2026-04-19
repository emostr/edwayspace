import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Max, Min } from 'class-validator';

export class CreateScheduleEntryDto {
  @ApiProperty()
  @IsUUID()
  classId!: string;

  @ApiProperty()
  @IsUUID()
  subjectId!: string;

  @ApiProperty({ minimum: 1, maximum: 6 })
  @IsInt()
  @Min(1)
  @Max(6)
  dayOfWeek!: number;

  @ApiProperty({ minimum: 1, maximum: 12 })
  @IsInt()
  @Min(1)
  @Max(12)
  lessonNumber!: number;
}
