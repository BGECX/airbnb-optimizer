import { Module } from '@nestjs/common';
import { RolesGuard } from '../common/guards/roles.guard';
import { CompagnonController } from './compagnon.controller';
import { CompagnonService } from './compagnon.service';
@Module({ controllers: [CompagnonController], providers: [CompagnonService, RolesGuard] })
export class CompagnonModule {}
