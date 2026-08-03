import { Module } from '@nestjs/common';
import { ComptabiliteService } from './comptabilite.service';
import { ComptabiliteController } from './comptabilite.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ComptabiliteController],
  providers: [ComptabiliteService],
})
export class ComptabiliteModule {}
