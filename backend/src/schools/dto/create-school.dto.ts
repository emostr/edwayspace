import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class CreateSchoolDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  city!: string;

  @ApiProperty()
  @IsEmail()
  adminEmail!: string;
}
