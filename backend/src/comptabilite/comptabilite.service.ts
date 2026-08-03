import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDeclarationTvaDto, CreateEcritureDto } from './dto';

@Injectable()
export class ComptabiliteService {
  constructor(private prisma: PrismaService) {}

  // Déclarations TVA
  createDeclarationTVA(dto: CreateDeclarationTvaDto) {
    return this.prisma.declarationTVA.create({ data: dto });
  }

  findAllDeclarations() {
    return this.prisma.declarationTVA.findMany({ orderBy: { periode: 'desc' } });
  }

  // Écritures comptables (FEC)
  createEcriture(dto: CreateEcritureDto) {
    return this.prisma.ecritureComptable.create({ data: dto });
  }

  findAllEcritures() {
    return this.prisma.ecritureComptable.findMany({
      orderBy: { date: 'desc' },
      take: 500,
    });
  }

  findEcrituresByJournal(journal: string) {
    return this.prisma.ecritureComptable.findMany({
      where: { journal },
      orderBy: { date: 'desc' },
    });
  }

  // Stats
  async getStats() {
    const [ca, charges] = await Promise.all([
      this.prisma.facture.aggregate({ _sum: { totalHt: true }, where: { statut: 'PAYEE' } }),
      this.prisma.factureFournisseur.aggregate({ _sum: { totalHt: true } }),
    ]);
    return {
      caTotal: ca._sum.totalHt || 0,
      chargesTotal: charges._sum.totalHt || 0,
    };
  }
}
