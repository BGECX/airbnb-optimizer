import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AssignSousTraitantDto, CreateDepenseDto, CreateDocumentDto, SetBudgetDto } from './dto';
import { PilotageService } from './pilotage.service';

@ApiTags('Pilotage chantier') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Controller('chantiers/:chantierId/pilotage')
export class PilotageController {
  constructor(private readonly service: PilotageService) {}
  @Get() dashboard(@Param('chantierId') id: string) { return this.service.dashboard(id); }
  @Put('budgets') @Roles(UserRole.ADMIN, UserRole.MANAGER) budget(@Param('chantierId') id: string, @Body() dto: SetBudgetDto) { return this.service.setBudget(id, dto); }
  @Post('depenses') @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.COMPTABLE) expense(@Param('chantierId') id: string, @Body() dto: CreateDepenseDto, @CurrentUser('sub') userId: string) { return this.service.createExpense(id, dto, userId); }
  @Post('sous-traitants') @Roles(UserRole.ADMIN, UserRole.MANAGER) subcontractor(@Param('chantierId') id: string, @Body() dto: AssignSousTraitantDto) { return this.service.assignSubcontractor(id, dto); }
  @Post('documents') @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF_CHANTIER) document(@Param('chantierId') id: string, @Body() dto: CreateDocumentDto) { return this.service.createDocument(id, dto); }
}
