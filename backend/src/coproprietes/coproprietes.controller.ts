import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CoproprietesService } from './coproprietes.service';
import { CreateCoproprieteDto, CreateLotDto, CreateDiagnosticDto, CreateDTGDto, CreateEvenementDto, UpdateCoproprieteDto, UpdateLotDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Copropriétés')
@Controller('coproprietes')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class CoproprietesController {
  constructor(private coproprietesService: CoproprietesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  createCopropriete(@Body() dto: CreateCoproprieteDto) {
    return this.coproprietesService.createCopropriete(dto);
  }

  @Get()
  findAll() {
    return this.coproprietesService.findAllCoproprietes();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coproprietesService.findOneCopropriete(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  update(@Param('id') id: string, @Body() data: UpdateCoproprieteDto) {
    return this.coproprietesService.updateCopropriete(id, data);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.coproprietesService.removeCopropriete(id);
  }

  // Lots
  @Post(':id/lots')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  createLot(@Param('id') coproprieteId: string, @Body() dto: CreateLotDto) {
    return this.coproprietesService.createLot({ ...dto, coproprieteId });
  }

  @Get(':id/lots')
  findLots(@Param('id') coproprieteId: string) {
    return this.coproprietesService.findLotsByCopropriete(coproprieteId);
  }

  @Patch('lots/:lotId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  updateLot(@Param('lotId') id: string, @Body() data: UpdateLotDto) {
    return this.coproprietesService.updateLot(id, data);
  }

  // Diagnostics
  @Post(':id/diagnostics')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  createDiagnostic(@Param('id') coproprieteId: string, @Body() dto: CreateDiagnosticDto) {
    return this.coproprietesService.createDiagnostic({ ...dto, coproprieteId });
  }

  @Get(':id/diagnostics')
  findDiagnostics(@Param('id') coproprieteId: string) {
    return this.coproprietesService.findDiagnosticsByCopropriete(coproprieteId);
  }

  // DTG
  @Post(':id/dtgs')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  createDTG(@Param('id') coproprieteId: string, @Body() dto: CreateDTGDto) {
    return this.coproprietesService.createDTG({ ...dto, coproprieteId });
  }

  // Événements
  @Post(':id/evenements')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  createEvenement(@Param('id') coproprieteId: string, @Body() dto: CreateEvenementDto) {
    return this.coproprietesService.createEvenement({ ...dto, coproprieteId });
  }

  @Get(':id/evenements')
  findEvenements(@Param('id') coproprieteId: string) {
    return this.coproprietesService.findEvenementsByCopropriete(coproprieteId);
  }
}
