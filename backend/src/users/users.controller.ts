import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuthenticatedUser } from '../common/types/jwt-payload';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Post()
  @Roles(Role.CLASS_HEAD)
  create(@CurrentUser() me: AuthenticatedUser, @Body() dto: CreateUserDto) {
    return this.users.create(me.schoolId!, dto);
  }

  @Get()
  @ApiQuery({ name: 'role', required: false, enum: Role })
  @ApiQuery({ name: 'classId', required: false })
  findAll(
    @CurrentUser() me: AuthenticatedUser,
    @Query('role') role?: Role,
    @Query('classId') classId?: string,
  ) {
    return this.users.findAll(me.schoolId!, { role, classId });
  }

  @Get(':id')
  findOne(@CurrentUser() me: AuthenticatedUser, @Param('id') id: string) {
    return this.users.findOne(me.schoolId!, id);
  }

  @Patch(':id')
  @Roles(Role.CLASS_HEAD)
  update(
    @CurrentUser() me: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.users.update(me.schoolId!, id, dto);
  }

  @Patch(':id/reset-password')
  @Roles(Role.ZAVUCH)
  resetPassword(@CurrentUser() me: AuthenticatedUser, @Param('id') id: string) {
    return this.users.resetPassword(me.schoolId!, id);
  }

  @Delete(':id')
  @Roles(Role.ZAVUCH)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() me: AuthenticatedUser, @Param('id') id: string) {
    return this.users.remove(me.schoolId!, id);
  }
}
