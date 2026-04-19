import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateSchoolDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsEmail()
  adminEmail!: string;
}
