import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateSchoolDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsEmail()
  @IsOptional()
  adminEmail?: string;
}
