import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DevisStatut, FactureType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDevisDto, TransformDevisDto, UpdateDevisDto } from './dto';
import { calculateDocumentTotals } from '../common/utils/document-totals';
import { nextDocumentNumber } from '../common/utils/document-number';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Injectable()
export class DevisService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDevisDto, userId: string) {
    const { lignes, ...data } = dto;

    const { normalizedLines, totalHt, totalTva, totalTtc } = calculateDocumentTotals(lignes, data.tauxTva ?? 20);

    return this.prisma.$transaction(async (tx) => {
      const numero = await nextDocumentNumber(tx, 'D');
      return tx.devis.create({
        data: { ...data, dateValidite: new Date(data.dateValidite), numero, totalHt, totalTva, totalTtc, createdById: userId, lignes: { create: normalizedLines } },
        include: { lignes: true, client: true, apporteur: true },
      });
    });
  }

  findAll(query: PaginationQueryDto) {
    return this.prisma.devis.findMany({
      include: { client: { select: { nom: true } }, apporteur: { select: { nom: true, type: true } }, lignes: true },
      orderBy: { date: 'desc' },
      skip: query.skip,
      take: query.limit,
    });
  }

  async findOne(id: string) {
    const devis = await this.prisma.devis.findUnique({
      where: { id },
      include: { client: true, apporteur: true, chantier: true, lignes: true, createdBy: { select: { firstName: true, lastName: true } } },
    });
    if (!devis) throw new NotFoundException('Devis non trouvé');
    return devis;
  }

  async update(id: string, dto: UpdateDevisDto) {
    const current = await this.findOneOrFail(id);
    const modifiesContent = dto.objet !== undefined || dto.conditions !== undefined;
    if (modifiesContent && current.statut !== DevisStatut.BROUILLON) {
      throw new BadRequestException('Le contenu d’un devis émis est immuable ; créez une nouvelle version');
    }
    if (dto.statut && !this.canTransition(current.statut, dto.statut)) {
      throw new BadRequestException(`Transition de devis interdite : ${current.statut} → ${dto.statut}`);
    }
    return this.prisma.devis.update({
      where: { id },
      data: dto,
      include: { lignes: true },
    });
  }

  async remove(id: string) {
    const current = await this.findOneOrFail(id);
    if (current.statut !== DevisStatut.BROUILLON) throw new BadRequestException('Seul un devis brouillon peut être supprimé');
    return this.prisma.devis.delete({ where: { id } });
  }

  async transformToFacture(id: string, dto: TransformDevisDto, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const devis = await tx.devis.findUnique({ where: { id }, include: { lignes: true, facture: true } });
      if (!devis) throw new NotFoundException('Devis non trouvé');
      if (devis.facture) throw new BadRequestException('Ce devis a déjà été transformé en facture');
      if (devis.statut !== DevisStatut.ACCEPTE) throw new BadRequestException('Seul un devis accepté peut être transformé');

      const claimed = await tx.devis.updateMany({ where: { id, statut: DevisStatut.ACCEPTE }, data: { statut: DevisStatut.TRANSFORME } });
      if (claimed.count !== 1) throw new BadRequestException('Le devis a déjà été transformé');
      const numero = await nextDocumentNumber(tx, 'F');
      return tx.facture.create({
        data: {
          numero,
          sourceDevisId: devis.id,
          clientId: devis.clientId,
          chantierId: devis.chantierId,
          type: dto.type ?? FactureType.DEFINITIVE,
          objet: devis.objet,
          dateEcheance: new Date(dto.dateEcheance),
          tauxTva: devis.tauxTva,
          totalHt: devis.totalHt,
          totalTva: devis.totalTva,
          totalTtc: devis.totalTtc,
          modeReglement: dto.modeReglement,
          createdById: userId,
          lignes: { create: devis.lignes.map(({ ordre, designation, unite, quantite, prixUnitaireHt, totalHt }) => ({ ordre, designation, unite, quantite, prixUnitaireHt, totalHt })) },
        },
        include: { lignes: true, client: true, sourceDevis: true },
      });
    });
  }

  private async findOneOrFail(id: string) {
    const devis = await this.prisma.devis.findUnique({ where: { id } });
    if (!devis) throw new NotFoundException('Devis non trouvé');
    return devis;
  }

  private canTransition(from: DevisStatut, to: DevisStatut) {
    if (from === to) return true;
    const transitions: Record<DevisStatut, DevisStatut[]> = {
      BROUILLON: [DevisStatut.ENVOYE],
      ENVOYE: [DevisStatut.RELANCE, DevisStatut.ACCEPTE, DevisStatut.REFUSE, DevisStatut.EXPIRE],
      RELANCE: [DevisStatut.ACCEPTE, DevisStatut.REFUSE, DevisStatut.EXPIRE],
      ACCEPTE: [DevisStatut.TRANSFORME],
      REFUSE: [], TRANSFORME: [], EXPIRE: [],
    };
    return transitions[from].includes(to);
  }
}
