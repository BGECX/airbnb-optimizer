import { Module } from '@nestjs/common';
import { BanqueService } from './banque.service';
import { BanqueController } from './banque.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BanqueController],
  providers: [BanqueService],
})
export class BanqueModule {}
