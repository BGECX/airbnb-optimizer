import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ChangeProspectStatusDto, ChangeReserveStatusDto, ChangeSavStatusDto, ChangeSituationStatusDto, CompleteVisiteDto, CreateProspectDto, CreateReceptionDto, CreateReserveDto, CreateSavDto, CreateSituationDto, CreateVisiteDto } from './dto';
import { CommercialService } from './commercial.service';

@ApiTags('Cycle commercial') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Controller('commercial')
export class CommercialController {
  constructor(private readonly service: CommercialService) {}
  @Post('prospects') @Roles(UserRole.ADMIN, UserRole.MANAGER) createProspect(@Body() dto: CreateProspectDto) { return this.service.createProspect(dto); }
  @Get('prospects') @Roles(UserRole.ADMIN, UserRole.MANAGER) prospects() { return this.service.findProspects(); }
  @Patch('prospects/:id/statut') @Roles(UserRole.ADMIN, UserRole.MANAGER) prospectStatus(@Param('id') id: string, @Body() dto: ChangeProspectStatusDto) { return this.service.changeProspectStatus(id, dto.statut); }
  @Post('prospects/:id/visites') @Roles(UserRole.ADMIN, UserRole.MANAGER) visit(@Param('id') id: string, @Body() dto: CreateVisiteDto, @CurrentUser('sub') userId: string) { return this.service.createVisit(id, dto, userId); }
  @Patch('visites/:id/realiser') @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF_CHANTIER) completeVisit(@Param('id') id: string, @Body() dto: CompleteVisiteDto) { return this.service.completeVisit(id, dto); }
  @Post('prospects/:id/convertir') @Roles(UserRole.ADMIN, UserRole.MANAGER) convert(@Param('id') id: string) { return this.service.convertProspect(id); }
  @Post('chantiers/:id/reception') @Roles(UserRole.ADMIN, UserRole.MANAGER) reception(@Param('id') id: string, @Body() dto: CreateReceptionDto) { return this.service.createReception(id, dto); }
  @Post('receptions/:id/reserves') @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF_CHANTIER) reserve(@Param('id') id: string, @Body() dto: CreateReserveDto) { return this.service.addReserve(id, dto); }
  @Patch('reserves/:id/statut') @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF_CHANTIER) reserveStatus(@Param('id') id: string, @Body() dto: ChangeReserveStatusDto) { return this.service.changeReserveStatus(id, dto); }
  @Post('chantiers/:id/sav') @Roles(UserRole.ADMIN, UserRole.MANAGER) sav(@Param('id') id: string, @Body() dto: CreateSavDto) { return this.service.createSav(id, dto); }
  @Patch('sav/:id/statut') @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF_CHANTIER) savStatus(@Param('id') id: string, @Body() dto: ChangeSavStatusDto) { return this.service.changeSavStatus(id, dto); }
  @Post('chantiers/:id/situations') @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.COMPTABLE) situation(@Param('id') id: string, @Body() dto: CreateSituationDto) { return this.service.createSituation(id, dto); }
  @Patch('situations/:id/statut') @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.COMPTABLE) situationStatus(@Param('id') id: string, @Body() dto: ChangeSituationStatusDto) { return this.service.changeSituationStatus(id, dto.statut); }
}
