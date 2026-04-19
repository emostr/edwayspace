import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSchoolAdminDto {
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  lastName!: string;
}
