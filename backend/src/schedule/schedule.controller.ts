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
import { CreateScheduleEntryDto } from './dto/create-schedule-entry.dto';
import { UpdateScheduleEntryDto } from './dto/update-schedule-entry.dto';
import { ScheduleService } from './schedule.service';

@ApiTags('schedule')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('schedule')
export class ScheduleController {
  constructor(private readonly service: ScheduleService) {}

  @Post()
  @Roles(Role.CLASS_HEAD)
  create(@CurrentUser() me: AuthenticatedUser, @Body() dto: CreateScheduleEntryDto) {
    return this.service.create(me.schoolId!, dto);
  }

  @Get()
  @ApiQuery({ name: 'classId', required: true })
  findByClass(@CurrentUser() me: AuthenticatedUser, @Query('classId') classId: string) {
    return this.service.findByClass(me.schoolId!, classId);
  }

  @Patch(':id')
  @Roles(Role.CLASS_HEAD)
  update(
    @CurrentUser() me: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateScheduleEntryDto,
  ) {
    return this.service.update(me.schoolId!, id, dto);
  }

  @Delete(':id')
  @Roles(Role.CLASS_HEAD)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() me: AuthenticatedUser, @Param('id') id: string) {
    return this.service.remove(me.schoolId!, id);
  }
}
