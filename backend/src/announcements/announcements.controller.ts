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
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuthenticatedUser } from '../common/types/jwt-payload';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';

@ApiTags('announcements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly service: AnnouncementsService) {}

  @Post()
  create(@CurrentUser() me: AuthenticatedUser, @Body() dto: CreateAnnouncementDto) {
    return this.service.create(me, dto);
  }

  @Get()
  @ApiQuery({ name: 'classId', required: true })
  findForClass(@CurrentUser() me: AuthenticatedUser, @Query('classId') classId: string) {
    return this.service.findForClass(me.schoolId!, classId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() me: AuthenticatedUser, @Param('id') id: string) {
    return this.service.remove(me, id);
  }
}
