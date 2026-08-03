import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AvoirStatut, CanalTransmission, FactureStatut, FormatFactureElectronique, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAvoirDto, CreateFactureDto, PrepareElectronicInvoiceDto, RegisterPaymentDto, UpdateFactureDto } from './dto';
import { calculateDocumentTotals } from '../common/utils/document-totals';
import { checkInvoiceCompliance } from './invoice-compliance';
import { nextDocumentNumber } from '../common/utils/document-number';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { createInvoiceSnapshot } from './invoice-snapshot';

@Injectable()
export class FacturesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateFactureDto, userId: string) {
    const { lignes, ...data } = dto;

    const { normalizedLines, totalHt, totalTva, totalTtc } = calculateDocumentTotals(lignes, data.tauxTva ?? 20);

    return this.prisma.$transaction(async (tx) => {
      const numero = await nextDocumentNumber(tx, 'F');
      return tx.facture.create({
        data: {
          ...data,
          dateEcheance: new Date(data.dateEcheance),
          datePrestation: data.datePrestation ? new Date(data.datePrestation) : undefined,
          numero, totalHt, totalTva, totalTtc, createdById: userId,
          lignes: { create: normalizedLines },
        },
        include: { lignes: true, client: true },
      });
    });
  }

  findAll(query: PaginationQueryDto) {
    return this.prisma.facture.findMany({
      include: { client: { select: { nom: true } }, chantier: { select: { objet: true } } },
      orderBy: { date: 'desc' },
      skip: query.skip,
      take: query.limit,
    });
  }

  async findOne(id: string) {
    const facture = await this.prisma.facture.findUnique({
      where: { id },
      include: { client: true, chantier: true, lignes: true, avoirs: true },
    });
    if (!facture) throw new NotFoundException('Facture non trouvée');
    return facture;
  }

  async update(id: string, dto: UpdateFactureDto) {
    const current = await this.findOneOrFail(id);
    if (dto.statut && !this.canTransition(current.statut, dto.statut)) {
      throw new BadRequestException(`Transition de facture interdite : ${current.statut} → ${dto.statut}`);
    }
    if (current.statut === FactureStatut.BROUILLON && dto.statut === FactureStatut.ENVOYEE) {
      return this.issue(id, dto.chorusProStatut);
    }
    return this.prisma.facture.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const facture = await this.findOneOrFail(id);
    if (facture.statut !== FactureStatut.BROUILLON) throw new BadRequestException('Seule une facture brouillon peut être supprimée');
    return this.prisma.facture.delete({ where: { id } });
  }

  async compliance(id: string) {
    const facture = await this.prisma.facture.findUnique({ where: { id }, include: { client: true, lignes: true } });
    if (!facture) throw new NotFoundException('Facture non trouvée');
    const entreprise = await this.prisma.parametreEntreprise.findFirst();
    const errors = checkInvoiceCompliance({ entreprise, client: facture.client, facture });
    return { conforme: errors.length === 0, erreurs: errors };
  }

  async registerPayment(id: string, dto: RegisterPaymentDto) {
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM factures WHERE id = ${id} FOR UPDATE`;
      const facture = await tx.facture.findUnique({ where: { id } });
      if (!facture) throw new NotFoundException('Facture non trouvée');
      if (facture.statut === FactureStatut.BROUILLON || facture.statut === FactureStatut.ANNULEE) throw new BadRequestException('Paiement impossible dans cet état');
      const alreadyPaid = Number(facture.montantPaye);
      if (alreadyPaid + dto.montant > Number(facture.totalTtc) + 0.01) throw new BadRequestException('Le paiement dépasse le solde de la facture');
      const montantPaye = Math.round((alreadyPaid + dto.montant) * 100) / 100;
      await tx.paiementFacture.create({ data: { ...dto, date: new Date(dto.date), factureId: id } });
      return tx.facture.update({ where: { id }, data: { montantPaye, statut: montantPaye >= Number(facture.totalTtc) ? FactureStatut.PAYEE : facture.statut }, include: { paiements: true } });
    });
  }

  async prepareElectronic(id: string, dto: PrepareElectronicInvoiceDto) {
    const facture = await this.prisma.facture.findUnique({ where: { id }, include: { client: true, lignes: true } });
    if (!facture) throw new NotFoundException('Facture non trouvée');
    if (!facture.issuedAt || !facture.contentHash || !facture.issuedSnapshot) {
      throw new BadRequestException('La facture doit être émise et figée avant préparation électronique');
    }
    return this.prisma.transmissionElectronique.create({
      data: { factureId: id, format: dto.format ?? FormatFactureElectronique.FACTUR_X, canal: dto.canal ?? CanalTransmission.EXPORT_MANUEL, payloadHash: facture.contentHash, payload: facture.issuedSnapshot as Prisma.InputJsonValue },
    });
  }

  async createAvoir(id: string, dto: CreateAvoirDto) {
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM factures WHERE id = ${id} FOR UPDATE`;
      const facture = await tx.facture.findUnique({ where: { id }, include: { avoirs: true } });
      if (!facture) throw new NotFoundException('Facture non trouvée');
      if (facture.statut === FactureStatut.BROUILLON || facture.statut === FactureStatut.ANNULEE) throw new BadRequestException('Avoir impossible dans cet état');
      const alreadyCredited = facture.avoirs.filter((avoir) => avoir.statut !== AvoirStatut.ANNULE).reduce((sum, avoir) => sum + Number(avoir.montantHt), 0);
      if (alreadyCredited + dto.montantHt > Number(facture.totalHt) + 0.01) throw new BadRequestException('Le montant cumulé des avoirs dépasse la facture');
      const totalTtc = Math.round(dto.montantHt * (1 + Number(facture.tauxTva) / 100) * 100) / 100;
      const numero = await nextDocumentNumber(tx, 'AV');
      return tx.avoir.create({ data: { numero, factureId: id, clientId: facture.clientId, motif: dto.motif, montantHt: dto.montantHt, tauxTva: facture.tauxTva, totalTtc } });
    });
  }

  private async issue(id: string, chorusProStatut?: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM factures WHERE id = ${id} FOR UPDATE`;
      const facture = await tx.facture.findUnique({ where: { id }, include: { client: true, lignes: { orderBy: { ordre: 'asc' } } } });
      if (!facture) throw new NotFoundException('Facture non trouvée');
      if (facture.statut !== FactureStatut.BROUILLON) throw new BadRequestException('La facture a déjà été émise ou annulée');
      const entreprise = await tx.parametreEntreprise.findFirst();
      const errors = checkInvoiceCompliance({ entreprise, client: facture.client, facture });
      if (errors.length) throw new BadRequestException({ message: 'Facture non conforme, émission refusée', erreurs: errors });
      const immutableContent = {
        schema: 'KRITIA_INVOICE_SNAPSHOT_V1',
        entreprise,
        client: facture.client,
        facture: {
          numero: facture.numero, type: facture.type, objet: facture.objet, date: facture.date,
          dateEcheance: facture.dateEcheance, datePrestation: facture.datePrestation,
          adresseFacturation: facture.adresseFacturation, referenceAcheteur: facture.referenceAcheteur,
          categorieOperation: facture.categorieOperation, tauxTva: facture.tauxTva,
          totalHt: facture.totalHt, totalTva: facture.totalTva, totalTtc: facture.totalTtc,
          modeReglement: facture.modeReglement, mentionsLegales: facture.mentionsLegales, lignes: facture.lignes,
        },
      };
      const { snapshot, contentHash } = createInvoiceSnapshot(immutableContent);
      return tx.facture.update({
        where: { id },
        data: { statut: FactureStatut.ENVOYEE, chorusProStatut, issuedAt: new Date(), contentHash, issuedSnapshot: snapshot as Prisma.InputJsonValue },
        include: { client: true, lignes: true },
      });
    });
  }

  private async findOneOrFail(id: string) {
    const facture = await this.prisma.facture.findUnique({ where: { id } });
    if (!facture) throw new NotFoundException('Facture non trouvée');
    return facture;
  }

  private canTransition(from: FactureStatut, to: FactureStatut) {
    if (from === to) return true;
    const transitions: Record<FactureStatut, FactureStatut[]> = {
      BROUILLON: [FactureStatut.ENVOYEE, FactureStatut.ANNULEE],
      ENVOYEE: [FactureStatut.PAYEE, FactureStatut.IMPAYEE, FactureStatut.EN_RETARD, FactureStatut.LITIGE],
      IMPAYEE: [FactureStatut.PAYEE, FactureStatut.EN_RETARD, FactureStatut.LITIGE],
      EN_RETARD: [FactureStatut.PAYEE, FactureStatut.LITIGE],
      LITIGE: [FactureStatut.PAYEE, FactureStatut.IMPAYEE],
      PAYEE: [], ANNULEE: [],
    };
    return transitions[from].includes(to);
  }
}
