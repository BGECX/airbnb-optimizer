import { Module } from '@nestjs/common';
import { RolesGuard } from '../common/guards/roles.guard';
import { CommercialController } from './commercial.controller';
import { CommercialService } from './commercial.service';
@Module({ controllers: [CommercialController], providers: [CommercialService, RolesGuard] })
export class CommercialModule {}
