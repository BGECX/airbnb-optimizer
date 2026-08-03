import { Module } from '@nestjs/common';
import { RolesGuard } from '../common/guards/roles.guard';
import { ChiffrageAssisteController } from './chiffrage-assiste.controller';
import { ChiffrageAssisteService } from './chiffrage-assiste.service';
@Module({ controllers: [ChiffrageAssisteController], providers: [ChiffrageAssisteService, RolesGuard] })
export class ChiffrageAssisteModule {}
