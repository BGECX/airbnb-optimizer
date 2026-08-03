import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CompanionBonDto, CompanionPhotoDto, StartPointageDto, StopPointageDto, UpdateTaskProgressDto } from './dto';
import { CompagnonService } from './compagnon.service';

@ApiTags('Application compagnon') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF_CHANTIER, UserRole.COMPAGNON) @Controller('compagnon')
export class CompagnonController {
  constructor(private readonly service: CompagnonService) {}
  @Get('me') me(@CurrentUser('sub') id: string) { return this.service.me(id); }
  @Post('pointages/demarrer') start(@CurrentUser('sub') id: string, @Body() dto: StartPointageDto) { return this.service.startPointage(id, dto); }
  @Patch('pointages/:id/terminer') stop(@CurrentUser('sub') id: string, @Param('id') pointageId: string, @Body() dto: StopPointageDto) { return this.service.stopPointage(id, pointageId, dto); }
  @Get('taches') tasks(@CurrentUser('sub') id: string) { return this.service.tasks(id); }
  @Patch('taches/:id/avancement') progress(@CurrentUser('sub') id: string, @Param('id') taskId: string, @Body() dto: UpdateTaskProgressDto) { return this.service.updateTask(id, taskId, dto.avancement); }
  @Post('photos') photo(@CurrentUser('sub') id: string, @Body() dto: CompanionPhotoDto) { return this.service.photo(id, dto); }
  @Post('bons') bon(@CurrentUser('sub') id: string, @Body() dto: CompanionBonDto) { return this.service.bon(id, dto); }
}
