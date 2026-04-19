import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuthenticatedUser } from '../common/types/jwt-payload';
import { SuperadminService } from './superadmin.service';
import { CreateSchoolDto } from './dto/create-school.dto';
import { UpdateSchoolDto } from './dto/update-school.dto';
import { CreateSchoolAdminDto } from './dto/create-school-admin.dto';
import { SuperadminChangePasswordDto } from './dto/change-password.dto';

@ApiTags('superadmin')
@ApiBearerAuth()
@Controller('superadmin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPERADMIN)
export class SuperadminController {
  constructor(private readonly service: SuperadminService) {}

  @Get('stats')
  getStats() {
    return this.service.getStats();
  }

  @Get('schools')
  findAllSchools() {
    return this.service.findAllSchools();
  }

  @Post('schools')
  createSchool(@Body() dto: CreateSchoolDto) {
    return this.service.createSchool(dto);
  }

  @Get('schools/:id')
  findSchool(@Param('id') id: string) {
    return this.service.findSchool(id);
  }

  @Patch('schools/:id')
  updateSchool(@Param('id') id: string, @Body() dto: UpdateSchoolDto) {
    return this.service.updateSchool(id, dto);
  }

  @Delete('schools/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteSchool(@Param('id') id: string) {
    return this.service.deleteSchool(id);
  }

  @Post('schools/:id/admin')
  createSchoolAdmin(@Param('id') id: string, @Body() dto: CreateSchoolAdminDto) {
    return this.service.createSchoolAdmin(id, dto);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  changePassword(@CurrentUser() user: AuthenticatedUser, @Body() dto: SuperadminChangePasswordDto) {
    return this.service.changePassword(user.sub, dto);
  }
}
