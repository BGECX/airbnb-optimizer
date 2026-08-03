import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BanqueService } from './banque.service';
import { CreateOperationDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Banque')
@Controller('banque')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BanqueController {
  constructor(private banqueService: BanqueService) {}

  @Post('operations')
  @Roles(UserRole.ADMIN, UserRole.COMPTABLE)
  create(@Body() dto: CreateOperationDto, @CurrentUser('sub') userId: string) {
    return this.banqueService.createOperation(dto, userId);
  }

  @Get('operations')
  findAll(@Query('banque') banque?: string) {
    if (banque) return this.banqueService.findByBanque(banque);
    return this.banqueService.findAll();
  }

  @Get('solde/:banque')
  getSolde(@Param('banque') banque: string) {
    return this.banqueService.getSolde(banque);
  }
}
