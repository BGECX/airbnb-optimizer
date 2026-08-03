import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DpgfStatut, PosteDpgfType } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { nextDocumentNumber } from '../common/utils/document-number';
import { ConvertDpgfToDevisDto, CreateDpgfDto, CreateLotDpgfDto, CreateMetreDto, CreatePosteDpgfDto } from './dto';
import { evaluateMetreFormula } from './metre-calculator';

@Injectable()
export class DpgfService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDpgfDto, userId: string) {
    const chantier = await this.prisma.chantier.findUnique({ where: { id: dto.chantierId }, select: { id: true } });
    if (!chantier) throw new NotFoundException('Chantier non trouvé');
    return this.prisma.dpgf.create({
      data: {
        ...dto,
        reference: `DPGF-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`,
        createdById: userId,
      },
    });
  }

  async findAll() {
    return this.prisma.dpgf.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        chantier: { select: { id: true, reference: true, objet: true } },
        _count: { select: { lots: true } },
      },
    });
  }

  async findOne(id: string) {
    const dpgf = await this.prisma.dpgf.findUnique({
      where: { id },
      include: {
        chantier: { select: { id: true, reference: true, objet: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
        lots: {
          orderBy: { ordre: 'asc' },
          include: {
            postes: {
              orderBy: { ordre: 'asc' },
              include: { metres: { orderBy: { createdAt: 'asc' } }, ouvrage: true },
            },
          },
        },
      },
    });
    if (!dpgf) throw new NotFoundException('DPGF non trouvée');
    return dpgf;
  }

  async addLot(dpgfId: string, dto: CreateLotDpgfDto) {
    await this.assertDraft(dpgfId);
    if (dto.parentId) {
      const parent = await this.prisma.lotDpgf.findUnique({ where: { id: dto.parentId } });
      if (!parent || parent.dpgfId !== dpgfId) throw new BadRequestException('Le sous-lot doit appartenir à la même DPGF');
    }
    return this.prisma.lotDpgf.create({ data: { ...dto, dpgfId } });
  }

  async addPoste(lotId: string, dto: CreatePosteDpgfDto) {
    const lot = await this.prisma.lotDpgf.findUnique({ where: { id: lotId }, include: { dpgf: true } });
    if (!lot) throw new NotFoundException('Lot DPGF non trouvé');
    if (lot.dpgf.statut !== DpgfStatut.BROUILLON) throw new BadRequestException('Une DPGF validée ou archivée est en lecture seule');

    const ouvrage = dto.ouvrageId ? await this.prisma.ouvrage.findUnique({ where: { id: dto.ouvrageId } }) : null;
    if (dto.ouvrageId && !ouvrage) throw new NotFoundException('Ouvrage non trouvé');
    const debourseUnitaire = dto.debourseUnitaire ?? Number(ouvrage?.debourseSec ?? 0);
    const coefficientVente = dto.coefficientVente ?? Number(ouvrage?.coefficientVente ?? 1);
    const prixUnitaireHt = this.money(debourseUnitaire * coefficientVente * Number(lot.dpgf.coefficientFraisGeneraux) * Number(lot.dpgf.coefficientMarge));
    const quantite = dto.quantite ?? 0;

    const poste = await this.prisma.posteDpgf.create({
      data: {
        ...dto,
        lotId,
        quantite,
        debourseUnitaire,
        coefficientVente,
        prixUnitaireHt,
        margeUnitaire: this.money(prixUnitaireHt - debourseUnitaire),
        totalDebourse: this.money(quantite * debourseUnitaire),
        totalVenteHt: this.money(quantite * prixUnitaireHt),
        type: dto.type ?? PosteDpgfType.BASE,
      },
    });
    await this.recalculateDpgf(lot.dpgfId);
    return poste;
  }

  async addMetre(posteId: string, dto: CreateMetreDto) {
    const poste = await this.prisma.posteDpgf.findUnique({ where: { id: posteId }, include: { lot: { include: { dpgf: true } } } });
    if (!poste) throw new NotFoundException('Poste DPGF non trouvé');
    if (poste.lot.dpgf.statut !== DpgfStatut.BROUILLON) throw new BadRequestException('Une DPGF validée ou archivée est en lecture seule');
    const coefficient = dto.coefficient ?? 1;
    const variables = this.validateVariables(dto.variables ?? {});
    let quantite = dto.quantite;
    if (dto.formule) quantite = evaluateMetreFormula(dto.formule, variables) * coefficient;
    if (quantite === undefined && [dto.longueur, dto.largeur, dto.hauteur].some((value) => value !== undefined)) {
      quantite = [dto.longueur, dto.largeur, dto.hauteur].filter((value): value is number => value !== undefined).reduce((value, dimension) => value * dimension, 1) * coefficient;
    }
    if (quantite === undefined || !Number.isFinite(quantite) || quantite < 0) throw new BadRequestException('Quantité ou formule de métré obligatoire');

    const metre = await this.prisma.metre.create({ data: { ...dto, variables, coefficient, quantite: this.quantity(quantite), posteId } });
    await this.recalculatePoste(posteId);
    await this.recalculateDpgf(poste.lot.dpgfId);
    return metre;
  }

  async selectPoste(posteId: string, isSelected: boolean) {
    const poste = await this.prisma.posteDpgf.findUnique({ where: { id: posteId }, include: { lot: true } });
    if (!poste) throw new NotFoundException('Poste DPGF non trouvé');
    await this.assertDraft(poste.lot.dpgfId);
    const updated = await this.prisma.posteDpgf.update({ where: { id: posteId }, data: { isSelected } });
    await this.recalculateDpgf(poste.lot.dpgfId);
    return updated;
  }

  async changeStatus(id: string, statut: DpgfStatut) {
    const dpgf = await this.prisma.dpgf.findUnique({ where: { id }, include: { lots: { include: { postes: true } } } });
    if (!dpgf) throw new NotFoundException('DPGF non trouvée');
    if (dpgf.statut === DpgfStatut.ARCHIVE) throw new BadRequestException('Une DPGF archivée est définitive');
    if (statut === DpgfStatut.VALIDE && !dpgf.lots.some((lot) => lot.postes.length > 0)) throw new BadRequestException('Impossible de valider une DPGF vide');
    if (dpgf.statut === DpgfStatut.VALIDE && statut === DpgfStatut.BROUILLON) throw new BadRequestException('Créez une nouvelle version au lieu de dévalider la DPGF');
    await this.recalculateDpgf(id);
    return this.prisma.dpgf.update({ where: { id }, data: { statut } });
  }

  async convertToDevis(id: string, dto: ConvertDpgfToDevisDto, userId: string) {
    const dpgf = await this.prisma.dpgf.findUnique({
      where: { id },
      include: { devis: true, chantier: true, lots: { include: { postes: { where: { isSelected: true }, orderBy: { ordre: 'asc' } } } } },
    });
    if (!dpgf) throw new NotFoundException('DPGF non trouvée');
    if (dpgf.statut !== DpgfStatut.VALIDE) throw new BadRequestException('La DPGF doit être validée avant création du devis');
    if (dpgf.devis) throw new BadRequestException('Un devis existe déjà pour cette version de DPGF');
    const postes = dpgf.lots.flatMap((lot) => lot.postes);
    if (!postes.length) throw new BadRequestException('Aucun poste sélectionné à facturer');
    const totalHt = this.money(postes.reduce((sum, poste) => sum + Number(poste.totalVenteHt), 0));
    const tauxTva = dto.tauxTva ?? 20;
    const totalTva = this.money(totalHt * tauxTva / 100);
    return this.prisma.$transaction(async (tx) => {
      const numero = await nextDocumentNumber(tx, 'D');
      return tx.devis.create({
        data: {
          numero,
          clientId: dpgf.chantier.clientId,
          chantierId: dpgf.chantierId,
          dpgfId: dpgf.id,
          objet: dpgf.nom,
          dateValidite: dto.dateValidite,
          tauxTva,
          totalHt,
          totalTva,
          totalTtc: this.money(totalHt + totalTva),
          conditions: dto.conditions,
          createdById: userId,
          lignes: { create: postes.map((poste, ordre) => ({
            ordre,
            designation: `${poste.code} — ${poste.designation}`,
            unite: poste.unite,
            quantite: poste.quantite,
            prixUnitaireHt: poste.prixUnitaireHt,
            totalHt: poste.totalVenteHt,
          })) },
        },
        include: { lignes: true, client: true, chantier: true },
      });
    });
  }

  async recalculateDpgf(dpgfId: string) {
    const postes = await this.prisma.posteDpgf.findMany({ where: { lot: { dpgfId }, isSelected: true } });
    return this.prisma.dpgf.update({
      where: { id: dpgfId },
      data: {
        totalDebourseSec: this.money(postes.reduce((sum, poste) => sum + Number(poste.totalDebourse), 0)),
        totalVenteHt: this.money(postes.reduce((sum, poste) => sum + Number(poste.totalVenteHt), 0)),
      },
    });
  }

  private async recalculatePoste(posteId: string) {
    const poste = await this.prisma.posteDpgf.findUnique({ where: { id: posteId }, include: { metres: true } });
    if (!poste) throw new NotFoundException('Poste DPGF non trouvé');
    const quantite = this.quantity(poste.metres.reduce((sum, metre) => sum + Number(metre.quantite), 0));
    return this.prisma.posteDpgf.update({
      where: { id: posteId },
      data: {
        quantite,
        totalDebourse: this.money(quantite * Number(poste.debourseUnitaire)),
        totalVenteHt: this.money(quantite * Number(poste.prixUnitaireHt)),
      },
    });
  }

  private async assertDraft(id: string) {
    const dpgf = await this.prisma.dpgf.findUnique({ where: { id }, select: { statut: true } });
    if (!dpgf) throw new NotFoundException('DPGF non trouvée');
    if (dpgf.statut !== DpgfStatut.BROUILLON) throw new BadRequestException('Une DPGF validée ou archivée est en lecture seule');
  }

  private validateVariables(variables: Record<string, number>) {
    for (const [name, value] of Object.entries(variables)) {
      if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name) || !Number.isFinite(Number(value))) throw new BadRequestException(`Variable de métré invalide : ${name}`);
    }
    return variables;
  }

  private money(value: number) { return Math.round((value + Number.EPSILON) * 100) / 100; }
  private quantity(value: number) { return Math.round((value + Number.EPSILON) * 1000) / 1000; }
}
