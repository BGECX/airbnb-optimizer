import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTacheDto, UpdateTacheDto } from './dto';

@Injectable()
export class TachesGanttService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateTacheDto, userId: string) {
    return this.prisma.tacheGantt.create({
      data: { ...dto, createdById: userId },
      include: { chantier: { select: { objet: true } } },
    });
  }

  findAll() {
    return this.prisma.tacheGantt.findMany({
      include: { chantier: { select: { objet: true } } },
      orderBy: { dateDebut: 'asc' },
    });
  }

  findByChantier(chantierId: string) {
    return this.prisma.tacheGantt.findMany({
      where: { chantierId },
      orderBy: { dateDebut: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.tacheGantt.findUnique({
      where: { id },
      include: { chantier: true },
    });
  }

  async update(id: string, dto: UpdateTacheDto) {
    await this.findOneOrFail(id);
    return this.prisma.tacheGantt.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOneOrFail(id);
    return this.prisma.tacheGantt.delete({ where: { id } });
  }

  private async findOneOrFail(id: string) {
    const tache = await this.prisma.tacheGantt.findUnique({ where: { id } });
    if (!tache) throw new NotFoundException('Tâche non trouvée');
    return tache;
  }
}
