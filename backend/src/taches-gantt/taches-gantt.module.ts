import { Module } from '@nestjs/common';
import { TachesGanttService } from './taches-gantt.service';
import { TachesGanttController } from './taches-gantt.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TachesGanttController],
  providers: [TachesGanttService],
})
export class TachesGanttModule {}
