import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ChangeAleaStatusDto, ChangeTravailStatusDto, CreateAleaDto, CreateDiagnosticBatiDto, CreateTraceBatiDto, CreateTravailConservatoireDto } from './dto';
import { RenovationService } from './renovation.service';

@ApiTags('Rénovation du bâti ancien') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Controller('chantiers/:chantierId/renovation')
export class RenovationController {
  constructor(private readonly service: RenovationService) {}
  @Get() getDossier(@Param('chantierId') id: string) { return this.service.getDossier(id); }
  @Post('diagnostics') @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF_CHANTIER)
  diagnostic(@Param('chantierId') id: string, @Body() dto: CreateDiagnosticBatiDto, @CurrentUser('sub') userId: string) { return this.service.createDiagnostic(id, dto, userId); }
  @Post('aleas') @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF_CHANTIER)
  alea(@Param('chantierId') id: string, @Body() dto: CreateAleaDto) { return this.service.createAlea(id, dto); }
  @Patch('aleas/:aleaId/statut') @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF_CHANTIER)
  aleaStatus(@Param('chantierId') id: string, @Param('aleaId') aleaId: string, @Body() dto: ChangeAleaStatusDto) { return this.service.changeAleaStatus(id, aleaId, dto.statut); }
  @Post('travaux-conservatoires') @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF_CHANTIER)
  work(@Param('chantierId') id: string, @Body() dto: CreateTravailConservatoireDto) { return this.service.createTravail(id, dto); }
  @Patch('travaux-conservatoires/:travailId/statut') @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF_CHANTIER)
  workStatus(@Param('chantierId') id: string, @Param('travailId') workId: string, @Body() dto: ChangeTravailStatusDto) { return this.service.changeTravailStatus(id, workId, dto.statut); }
  @Post('traces') @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF_CHANTIER, UserRole.COMPAGNON)
  trace(@Param('chantierId') id: string, @Body() dto: CreateTraceBatiDto, @CurrentUser('sub') userId: string) { return this.service.createTrace(id, dto, userId); }
}
