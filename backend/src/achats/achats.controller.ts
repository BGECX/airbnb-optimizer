import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AchatsService } from './achats.service';
import { CreateCommandeDto, CreateLivraisonDto, CreateFactureFournDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Achats')
@Controller('achats')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AchatsController {
  constructor(private achatsService: AchatsService) {}

  @Post('commandes')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.COMPTABLE)
  createCommande(@Body() dto: CreateCommandeDto) {
    return this.achatsService.createCommande(dto);
  }

  @Get('commandes')
  findAllCommandes() {
    return this.achatsService.findAllCommandes();
  }

  @Post('livraisons')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF_CHANTIER)
  createLivraison(@Body() dto: CreateLivraisonDto) {
    return this.achatsService.createLivraison(dto);
  }

  @Get('livraisons')
  findAllLivraisons() {
    return this.achatsService.findAllLivraisons();
  }

  @Post('factures-fournisseur')
  @Roles(UserRole.ADMIN, UserRole.COMPTABLE)
  createFactureFourn(@Body() dto: CreateFactureFournDto) {
    return this.achatsService.createFactureFourn(dto);
  }

  @Get('factures-fournisseur')
  findAllFacturesFourn() {
    return this.achatsService.findAllFacturesFourn();
  }
}
