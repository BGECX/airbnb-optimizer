import { Module } from '@nestjs/common';
import { DpgfController } from './dpgf.controller';
import { DpgfService } from './dpgf.service';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({ controllers: [DpgfController], providers: [DpgfService, RolesGuard] })
export class DpgfModule {}
