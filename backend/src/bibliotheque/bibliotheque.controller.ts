import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { BibliothequeService } from './bibliotheque.service';
import { AddComposantDto, CreateOuvrageDto, UpdatePrixOuvrageDto } from './dto';

@ApiTags('Bibliothèque d’ouvrages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('bibliotheque/ouvrages')
export class BibliothequeController {
  constructor(private readonly service: BibliothequeService) {}

  @Get()
  findAll(@Query('recherche') recherche?: string) { return this.service.findAll(recherche); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post() @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(@Body() dto: CreateOuvrageDto) { return this.service.create(dto); }

  @Post(':id/composants') @Roles(UserRole.ADMIN, UserRole.MANAGER)
  addComponent(@Param('id') id: string, @Body() dto: AddComposantDto) { return this.service.addComponent(id, dto); }

  @Post(':id/prix') @Roles(UserRole.ADMIN, UserRole.MANAGER)
  updatePrice(@Param('id') id: string, @Body() dto: UpdatePrixOuvrageDto) { return this.service.updatePrice(id, dto); }
}
