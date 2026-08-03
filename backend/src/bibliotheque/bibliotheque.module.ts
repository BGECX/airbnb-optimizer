import { Module } from '@nestjs/common';
import { BibliothequeController } from './bibliotheque.controller';
import { BibliothequeService } from './bibliotheque.service';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({ controllers: [BibliothequeController], providers: [BibliothequeService, RolesGuard] })
export class BibliothequeModule {}
