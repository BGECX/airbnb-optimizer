import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ComptabiliteService } from './comptabilite.service';
import { CreateDeclarationTvaDto, CreateEcritureDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Comptabilité')
@Controller('comptabilite')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ComptabiliteController {
  constructor(private comptabiliteService: ComptabiliteService) {}

  @Post('tva')
  @Roles(UserRole.ADMIN, UserRole.COMPTABLE)
  createDeclaration(@Body() dto: CreateDeclarationTvaDto) {
    return this.comptabiliteService.createDeclarationTVA(dto);
  }

  @Get('tva')
  findAllDeclarations() {
    return this.comptabiliteService.findAllDeclarations();
  }

  @Post('ecritures')
  @Roles(UserRole.ADMIN, UserRole.COMPTABLE)
  createEcriture(@Body() dto: CreateEcritureDto) {
    return this.comptabiliteService.createEcriture(dto);
  }

  @Get('ecritures')
  findAllEcritures(@Query('journal') journal?: string) {
    if (journal) return this.comptabiliteService.findEcrituresByJournal(journal);
    return this.comptabiliteService.findAllEcritures();
  }

  @Get('stats')
  getStats() {
    return this.comptabiliteService.getStats();
  }
}
