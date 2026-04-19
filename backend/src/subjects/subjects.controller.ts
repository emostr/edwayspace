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
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuthenticatedUser } from '../common/types/jwt-payload';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { SubjectsService } from './subjects.service';

@ApiTags('subjects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjects: SubjectsService) {}

  @Post()
  @Roles(Role.ZAVUCH)
  create(@CurrentUser() me: AuthenticatedUser, @Body() dto: CreateSubjectDto) {
    return this.subjects.create(me.schoolId!, dto);
  }

  @Get()
  findAll(@CurrentUser() me: AuthenticatedUser) {
    return this.subjects.findAll(me.schoolId!);
  }

  @Get(':id')
  findOne(@CurrentUser() me: AuthenticatedUser, @Param('id') id: string) {
    return this.subjects.findOne(me.schoolId!, id);
  }

  @Patch(':id')
  @Roles(Role.ZAVUCH)
  update(
    @CurrentUser() me: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateSubjectDto,
  ) {
    return this.subjects.update(me.schoolId!, id, dto);
  }

  @Delete(':id')
  @Roles(Role.ZAVUCH)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() me: AuthenticatedUser, @Param('id') id: string) {
    return this.subjects.remove(me.schoolId!, id);
  }
}
