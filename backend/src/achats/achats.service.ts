import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommandeDto, CreateLivraisonDto, CreateFactureFournDto } from './dto';

@Injectable()
export class AchatsService {
  constructor(private prisma: PrismaService) {}

  // Commandes
  async createCommande(dto: CreateCommandeDto) {
    const numero = await this.generateNumero('CMD');
    const { lignes, ...data } = dto;
    const totalHt = lignes.reduce((sum, l) => sum + Number(l.totalHt), 0);
    const totalTva = totalHt * 0.2;
    return this.prisma.commande.create({
      data: {
        ...data,
        numero,
        totalHt,
        totalTva,
        totalTtc: totalHt + totalTva,
        lignes: { create: lignes },
      },
      include: { lignes: true, fournisseur: true },
    });
  }

  findAllCommandes() {
    return this.prisma.commande.findMany({
      include: { fournisseur: true, chantier: { select: { objet: true } } },
      orderBy: { date: 'desc' },
    });
  }

  // Livraisons
  createLivraison(dto: CreateLivraisonDto) {
    return this.prisma.livraison.create({
      data: dto,
      include: { commande: true },
    });
  }

  findAllLivraisons() {
    return this.prisma.livraison.findMany({
      include: { commande: true },
      orderBy: { date: 'desc' },
    });
  }

  // Factures fournisseur
  createFactureFourn(dto: CreateFactureFournDto) {
    return this.prisma.factureFournisseur.create({
      data: dto,
      include: { fournisseur: true },
    });
  }

  findAllFacturesFourn() {
    return this.prisma.factureFournisseur.findMany({
      include: { fournisseur: true },
      orderBy: { date: 'desc' },
    });
  }

  private async generateNumero(prefix: string): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.commande.count({ where: { numero: { startsWith: `${prefix}-${year}` } } });
    return `${prefix}-${year}-${String(count + 1).padStart(3, '0')}`;
  }
}
