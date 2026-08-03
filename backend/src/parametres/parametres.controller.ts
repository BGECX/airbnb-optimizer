import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ParametresService } from './parametres.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CreateAssuranceDto, CreateBanqueDto, CreateTvaDto, UpdateEntrepriseDto, UpdateNumerotationDto } from './dto';

@ApiTags('Paramètres')
@Controller('parametres')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ParametresController {
  constructor(private parametresService: ParametresService) {}

  @Get('entreprise')
  getEntreprise() {
    return this.parametresService.getEntreprise();
  }

  @Patch('entreprise')
  @Roles(UserRole.ADMIN)
  updateEntreprise(@Body() data: UpdateEntrepriseDto) {
    return this.parametresService.updateEntreprise(data);
  }

  @Get('numerotations')
  getNumerotations() {
    return this.parametresService.getNumerotations();
  }

  @Patch('numerotations/:type')
  @Roles(UserRole.ADMIN)
  updateNumerotation(@Param('type') type: string, @Body() data: UpdateNumerotationDto) {
    return this.parametresService.updateNumerotation(type, data);
  }

  @Get('tva')
  getTVAs() {
    return this.parametresService.getTVAs();
  }

  @Post('tva')
  @Roles(UserRole.ADMIN, UserRole.COMPTABLE)
  createTVA(@Body() data: CreateTvaDto) {
    return this.parametresService.createTVA(data);
  }

  @Get('banques')
  getBanques() {
    return this.parametresService.getBanques();
  }

  @Post('banques')
  @Roles(UserRole.ADMIN, UserRole.COMPTABLE)
  createBanque(@Body() data: CreateBanqueDto) {
    return this.parametresService.createBanque(data);
  }

  @Get('assurances')
  getAssurances() {
    return this.parametresService.getAssurances();
  }

  @Post('assurances')
  @Roles(UserRole.ADMIN)
  createAssurance(@Body() data: CreateAssuranceDto) {
    return this.parametresService.createAssurance(data);
  }
}
