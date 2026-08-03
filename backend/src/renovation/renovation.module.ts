import { Module } from '@nestjs/common';
import { RolesGuard } from '../common/guards/roles.guard';
import { RenovationController } from './renovation.controller';
import { RenovationService } from './renovation.service';
@Module({ controllers: [RenovationController], providers: [RenovationService, RolesGuard] })
export class RenovationModule {}
