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
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@ApiTags('classes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('classes')
export class ClassesController {
  constructor(private readonly classes: ClassesService) {}

  @Post()
  @Roles(Role.ZAVUCH)
  create(@CurrentUser() me: AuthenticatedUser, @Body() dto: CreateClassDto) {
    return this.classes.create(me.schoolId!, dto);
  }

  @Get()
  findAll(@CurrentUser() me: AuthenticatedUser) {
    return this.classes.findAll(me.schoolId!);
  }

  @Get(':id')
  findOne(@CurrentUser() me: AuthenticatedUser, @Param('id') id: string) {
    return this.classes.findOne(me.schoolId!, id);
  }

  @Patch(':id')
  @Roles(Role.CLASS_HEAD)
  update(
    @CurrentUser() me: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateClassDto,
  ) {
    return this.classes.update(me.schoolId!, id, dto);
  }

  @Delete(':id')
  @Roles(Role.ZAVUCH)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() me: AuthenticatedUser, @Param('id') id: string) {
    return this.classes.remove(me.schoolId!, id);
  }
}
