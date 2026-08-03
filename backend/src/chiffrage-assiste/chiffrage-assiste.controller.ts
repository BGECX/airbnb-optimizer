import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ChiffrageAssisteService } from './chiffrage-assiste.service';

@ApiTags('Aide au chiffrage') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER) @Controller('chiffrage-assiste')
export class ChiffrageAssisteController {
  constructor(private readonly service: ChiffrageAssisteService) {}
  @Post('dpgf/:id/analyser') analyse(@Param('id') id: string, @CurrentUser('sub') userId: string) { return this.service.analyse(id, userId); }
  @Get('dpgf/:id/analyses') history(@Param('id') id: string) { return this.service.history(id); }
  @Get('ouvrages/suggerer') @ApiQuery({ name: 'q' }) suggest(@Query('q') query: string) { return this.service.suggestOuvrages(query); }
  @Get('chantiers/:id/trame') template(@Param('id') id: string) { return this.service.suggestTemplate(id); }
}
