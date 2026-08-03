import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FacturesService } from './factures.service';
import { CreateAvoirDto, CreateFactureDto, PrepareElectronicInvoiceDto, RegisterPaymentDto, UpdateFactureDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { TransmissionsService } from './transmissions.service';

@ApiTags('Factures')
@Controller('factures')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FacturesController {
  constructor(private facturesService: FacturesService, private transmissionsService: TransmissionsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.COMPTABLE)
  create(@Body() dto: CreateFactureDto, @CurrentUser('sub') userId: string) {
    return this.facturesService.create(dto, userId);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.COMPTABLE)
  findAll(@Query() query: PaginationQueryDto) {
    return this.facturesService.findAll(query);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.COMPTABLE)
  findOne(@Param('id') id: string) {
    return this.facturesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.COMPTABLE)
  update(@Param('id') id: string, @Body() dto: UpdateFactureDto) {
    return this.facturesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.COMPTABLE)
  remove(@Param('id') id: string) {
    return this.facturesService.remove(id);
  }

  @Get(':id/conformite')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.COMPTABLE)
  compliance(@Param('id') id: string) { return this.facturesService.compliance(id); }

  @Post(':id/paiements')
  @Roles(UserRole.ADMIN, UserRole.COMPTABLE)
  payment(@Param('id') id: string, @Body() dto: RegisterPaymentDto) { return this.facturesService.registerPayment(id, dto); }

  @Post(':id/electronique/preparer')
  @Roles(UserRole.ADMIN, UserRole.COMPTABLE)
  prepareElectronic(@Param('id') id: string, @Body() dto: PrepareElectronicInvoiceDto) { return this.facturesService.prepareElectronic(id, dto); }

  @Get('electronique/transmissions/:transmissionId')
  @Roles(UserRole.ADMIN, UserRole.COMPTABLE)
  getTransmission(@Param('transmissionId') transmissionId: string) { return this.transmissionsService.findOne(transmissionId); }

  @Post('electronique/transmissions/:transmissionId/envoyer')
  @Roles(UserRole.ADMIN, UserRole.COMPTABLE)
  sendTransmission(@Param('transmissionId') transmissionId: string) { return this.transmissionsService.send(transmissionId); }

  @Post(':id/avoirs')
  @Roles(UserRole.ADMIN, UserRole.COMPTABLE)
  creditNote(@Param('id') id: string, @Body() dto: CreateAvoirDto) { return this.facturesService.createAvoir(id, dto); }
}
