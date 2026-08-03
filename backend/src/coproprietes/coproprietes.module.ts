import { Module } from '@nestjs/common';
import { CoproprietesService } from './coproprietes.service';
import { CoproprietesController } from './coproprietes.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CoproprietesController],
  providers: [CoproprietesService],
})
export class CoproprietesModule {}
