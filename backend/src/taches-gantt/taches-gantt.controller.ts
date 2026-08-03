import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TachesGanttService } from './taches-gantt.service';
import { CreateTacheDto, UpdateTacheDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Tâches Gantt')
@Controller('taches-gantt')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TachesGanttController {
  constructor(private tachesService: TachesGanttService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF_CHANTIER)
  create(@Body() dto: CreateTacheDto, @CurrentUser('sub') userId: string) {
    return this.tachesService.create(dto, userId);
  }

  @Get()
  findAll(@Query('chantierId') chantierId?: string) {
    if (chantierId) return this.tachesService.findByChantier(chantierId);
    return this.tachesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tachesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF_CHANTIER)
  update(@Param('id') id: string, @Body() dto: UpdateTacheDto) {
    return this.tachesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF_CHANTIER)
  remove(@Param('id') id: string) {
    return this.tachesService.remove(id);
  }
}
