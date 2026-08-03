import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PersonnelService } from './personnel.service';
import { CreateEmployeDto, UpdateEmployeDto, CreateContratDto, CreatePointageDto, CreateBonDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '@prisma/client';

@ApiTags('Personnel')
@Controller('personnel')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PersonnelController {
  constructor(private personnelService: PersonnelService) {}

  // Employés
  @Post('employes')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  createEmploye(@Body() dto: CreateEmployeDto) {
    return this.personnelService.createEmploye(dto);
  }

  @Get('employes')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF_CHANTIER)
  findAllEmployes() {
    return this.personnelService.findAllEmployes();
  }

  @Get('employes/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF_CHANTIER)
  findOneEmploye(@Param('id') id: string) {
    return this.personnelService.findOneEmploye(id);
  }

  @Patch('employes/:id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  updateEmploye(@Param('id') id: string, @Body() dto: UpdateEmployeDto) {
    return this.personnelService.updateEmploye(id, dto);
  }

  @Delete('employes/:id')
  @Roles(UserRole.ADMIN)
  removeEmploye(@Param('id') id: string) {
    return this.personnelService.removeEmploye(id);
  }

  // Contrats
  @Post('contrats')
  @Roles(UserRole.ADMIN)
  createContrat(@Body() dto: CreateContratDto, @CurrentUser('sub') userId: string) {
    return this.personnelService.createContrat(dto, userId);
  }

  @Get('employes/:id/contrats')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  findContrats(@Param('id') employeId: string) {
    return this.personnelService.findContratsByEmploye(employeId);
  }

  // Pointages
  @Post('pointages')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF_CHANTIER)
  createPointage(@Body() dto: CreatePointageDto) {
    return this.personnelService.createPointage(dto);
  }

  @Get('employes/:id/pointages')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF_CHANTIER)
  findPointages(@Param('id') employeId: string) {
    return this.personnelService.findPointagesByEmploye(employeId);
  }

  @Patch('pointages/:id/valider')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF_CHANTIER)
  validatePointage(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.personnelService.validatePointage(id, userId);
  }

  // Bons
  @Post('bons')
  createBon(@Body() dto: CreateBonDto, @CurrentUser('sub') userId: string) {
    return this.personnelService.createBon(dto, userId);
  }

  @Get('bons')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF_CHANTIER)
  findAllBons() {
    return this.personnelService.findAllBons();
  }

  // Planning
  @Get('planning')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF_CHANTIER)
  findPlanning(@Query('date') date: string) {
    return this.personnelService.findPlanningByDate(date);
  }
}
