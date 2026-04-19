import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsString()
  login!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  password!: string;
}
