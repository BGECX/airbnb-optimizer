import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ApporteursService } from './apporteurs.service';
import { CreateApporteurDto } from './dto';

@ApiTags('Apporteurs d’affaires')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('apporteurs')
export class ApporteursController {
  constructor(private service: ApporteursService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.COMPTABLE)
  findAll() { return this.service.findAll(); }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(@Body() dto: CreateApporteurDto) { return this.service.create(dto); }
}
