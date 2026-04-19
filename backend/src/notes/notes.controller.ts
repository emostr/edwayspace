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
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NotesService } from './notes.service';

@ApiTags('notes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notes')
export class NotesController {
  constructor(private readonly service: NotesService) {}

  @Post()
  @Roles(Role.TRUSTED_STUDENT)
  create(@CurrentUser() me: AuthenticatedUser, @Body() dto: CreateNoteDto) {
    return this.service.create(me, dto);
  }

  @Get()
  @ApiQuery({ name: 'classId', required: true })
  findByClass(@CurrentUser() me: AuthenticatedUser, @Query('classId') classId: string) {
    return this.service.findByClass(me.schoolId!, classId);
  }

  @Get(':id')
  findOne(@CurrentUser() me: AuthenticatedUser, @Param('id') id: string) {
    return this.service.findOne(me.schoolId!, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() me: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateNoteDto,
  ) {
    return this.service.update(me, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() me: AuthenticatedUser, @Param('id') id: string) {
    return this.service.remove(me, id);
  }
}
