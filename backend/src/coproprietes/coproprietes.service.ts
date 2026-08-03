import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCoproprieteDto, CreateLotDto, CreateDiagnosticDto, CreateDTGDto, CreateEvenementDto } from './dto';

@Injectable()
export class CoproprietesService {
  constructor(private prisma: PrismaService) {}

  // Copropriétés
  createCopropriete(dto: CreateCoproprieteDto) {
    return this.prisma.copropriete.create({ data: dto });
  }

  findAllCoproprietes() {
    return this.prisma.copropriete.findMany({
      include: { lots: true, diagnostics: true, dtgs: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOneCopropriete(id: string) {
    return this.prisma.copropriete.findUnique({
      where: { id },
      include: {
        lots: true,
        diagnostics: true,
        dtgs: { orderBy: { dateRealisation: 'desc' }, take: 1 },
        evenements: { orderBy: { date: 'desc' } },
      },
    });
  }

  async updateCopropriete(id: string, data: any) {
    await this.findCoproprieteOrFail(id);
    return this.prisma.copropriete.update({ where: { id }, data });
  }

  async removeCopropriete(id: string) {
    await this.findCoproprieteOrFail(id);
    return this.prisma.copropriete.delete({ where: { id } });
  }

  // Lots
  createLot(dto: CreateLotDto) {
    return this.prisma.lot.create({ data: dto });
  }

  findLotsByCopropriete(coproprieteId: string) {
    return this.prisma.lot.findMany({ where: { coproprieteId }, orderBy: { numero: 'asc' } });
  }

  updateLot(id: string, data: any) {
    return this.prisma.lot.update({ where: { id }, data });
  }

  // Diagnostics
  createDiagnostic(dto: CreateDiagnosticDto) {
    return this.prisma.diagnostic.create({ data: dto });
  }

  findDiagnosticsByCopropriete(coproprieteId: string) {
    return this.prisma.diagnostic.findMany({
      where: { coproprieteId },
      orderBy: { dateRealisation: 'desc' },
    });
  }

  // DTG
  createDTG(dto: CreateDTGDto) {
    return this.prisma.dTG.create({ data: dto });
  }

  // Événements historiques
  createEvenement(dto: CreateEvenementDto) {
    return this.prisma.evenementHistorique.create({ data: dto });
  }

  findEvenementsByCopropriete(coproprieteId: string) {
    return this.prisma.evenementHistorique.findMany({
      where: { coproprieteId },
      orderBy: { date: 'desc' },
    });
  }

  private async findCoproprieteOrFail(id: string) {
    const copro = await this.prisma.copropriete.findUnique({ where: { id } });
    if (!copro) throw new NotFoundException('Copropriété non trouvée');
    return copro;
  }
}
