import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DevisService } from './devis.service';
import { CreateDevisDto, TransformDevisDto, UpdateDevisDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@ApiTags('Devis')
@Controller('devis')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DevisController {
  constructor(private devisService: DevisService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(@Body() dto: CreateDevisDto, @CurrentUser('sub') userId: string) {
    return this.devisService.create(dto, userId);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.COMPTABLE, UserRole.CHEF_CHANTIER)
  findAll(@Query() query: PaginationQueryDto) {
    return this.devisService.findAll(query);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.COMPTABLE, UserRole.CHEF_CHANTIER)
  findOne(@Param('id') id: string) {
    return this.devisService.findOne(id);
  }

  @Post(':id/facture')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.COMPTABLE)
  transformToFacture(@Param('id') id: string, @Body() dto: TransformDevisDto, @CurrentUser('sub') userId: string) {
    return this.devisService.transformToFacture(id, dto, userId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  update(@Param('id') id: string, @Body() dto: UpdateDevisDto) {
    return this.devisService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  remove(@Param('id') id: string) {
    return this.devisService.remove(id);
  }
}
