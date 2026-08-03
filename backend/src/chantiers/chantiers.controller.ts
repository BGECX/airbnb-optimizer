import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ChantiersService } from './chantiers.service';
import { CreateChantierDto, UpdateChantierDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

type AuthenticatedUser = { sub: string; role: UserRole };

@ApiTags('Chantiers')
@Controller('chantiers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ChantiersController {
  constructor(private chantiersService: ChantiersService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  create(@Body() dto: CreateChantierDto) {
    return this.chantiersService.create(dto);
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto, @CurrentUser() user: AuthenticatedUser) {
    return this.chantiersService.findAll(query, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.chantiersService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.CHEF_CHANTIER)
  update(@Param('id') id: string, @Body() dto: UpdateChantierDto, @CurrentUser() user: AuthenticatedUser) {
    return this.chantiersService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.chantiersService.remove(id);
  }
}
