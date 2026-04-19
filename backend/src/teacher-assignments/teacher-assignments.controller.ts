import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
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
import { CreateTeacherAssignmentDto } from './dto/create-teacher-assignment.dto';
import { TeacherAssignmentsService } from './teacher-assignments.service';

@ApiTags('teacher-assignments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('teacher-assignments')
export class TeacherAssignmentsController {
  constructor(private readonly service: TeacherAssignmentsService) {}

  @Post()
  @Roles(Role.ZAVUCH)
  create(@CurrentUser() me: AuthenticatedUser, @Body() dto: CreateTeacherAssignmentDto) {
    return this.service.create(me.schoolId!, dto);
  }

  @Get()
  @ApiQuery({ name: 'teacherId', required: false })
  @ApiQuery({ name: 'classId', required: false })
  findAll(
    @CurrentUser() me: AuthenticatedUser,
    @Query('teacherId') teacherId?: string,
    @Query('classId') classId?: string,
  ) {
    return this.service.findAll(me.schoolId!, { teacherId, classId });
  }

  @Get(':id')
  findOne(@CurrentUser() me: AuthenticatedUser, @Param('id') id: string) {
    return this.service.findOne(me.schoolId!, id);
  }

  @Delete(':id')
  @Roles(Role.ZAVUCH)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() me: AuthenticatedUser, @Param('id') id: string) {
    return this.service.remove(me.schoolId!, id);
  }
}
