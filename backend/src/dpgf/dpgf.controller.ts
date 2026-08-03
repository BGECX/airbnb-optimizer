import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ChangeDpgfStatusDto, ConvertDpgfToDevisDto, CreateDpgfDto, CreateLotDpgfDto, CreateMetreDto, CreatePosteDpgfDto, SelectPosteDto } from './dto';
import { DpgfService } from './dpgf.service';

@ApiTags('DPGF & métrés')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('dpgf')
export class DpgfController {
  constructor(private readonly service: DpgfService) {}

  @Post() @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(@Body() dto: CreateDpgfDto, @CurrentUser('sub') userId: string) { return this.service.create(dto, userId); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post(':id/lots') @Roles(UserRole.ADMIN, UserRole.MANAGER)
  addLot(@Param('id') id: string, @Body() dto: CreateLotDpgfDto) { return this.service.addLot(id, dto); }

  @Post('lots/:lotId/postes') @Roles(UserRole.ADMIN, UserRole.MANAGER)
  addPoste(@Param('lotId') lotId: string, @Body() dto: CreatePosteDpgfDto) { return this.service.addPoste(lotId, dto); }

  @Post('postes/:posteId/metres') @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF_CHANTIER)
  addMetre(@Param('posteId') posteId: string, @Body() dto: CreateMetreDto) { return this.service.addMetre(posteId, dto); }

  @Patch('postes/:posteId/selection') @Roles(UserRole.ADMIN, UserRole.MANAGER)
  selectPoste(@Param('posteId') posteId: string, @Body() dto: SelectPosteDto) { return this.service.selectPoste(posteId, dto.isSelected); }

  @Patch(':id/statut') @Roles(UserRole.ADMIN, UserRole.MANAGER)
  changeStatus(@Param('id') id: string, @Body() dto: ChangeDpgfStatusDto) { return this.service.changeStatus(id, dto.statut); }

  @Post(':id/devis') @Roles(UserRole.ADMIN, UserRole.MANAGER)
  convertToDevis(@Param('id') id: string, @Body() dto: ConvertDpgfToDevisDto, @CurrentUser('sub') userId: string) {
    return this.service.convertToDevis(id, dto, userId);
  }
}
