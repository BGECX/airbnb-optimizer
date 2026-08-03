import { Module } from '@nestjs/common';
import { ApporteursController } from './apporteurs.controller';
import { ApporteursService } from './apporteurs.service';

@Module({ controllers: [ApporteursController], providers: [ApporteursService] })
export class ApporteursModule {}
