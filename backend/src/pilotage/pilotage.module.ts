import { Module } from '@nestjs/common';
import { RolesGuard } from '../common/guards/roles.guard';
import { PilotageController } from './pilotage.controller';
import { PilotageService } from './pilotage.service';
@Module({ controllers: [PilotageController], providers: [PilotageService, RolesGuard] })
export class PilotageModule {}
