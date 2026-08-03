import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CommandeStatut, FactureStatut, Prisma, SourceDepense } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AssignSousTraitantDto, CreateDepenseDto, CreateDocumentDto, SetBudgetDto } from './dto';
import { calculateProjectKpis } from './project-finance';

@Injectable()
export class PilotageService {
  constructor(private readonly prisma: PrismaService) {}

  async setBudget(chantierId: string, dto: SetBudgetDto) {
    await this.assertChantier(chantierId);
    return this.prisma.budgetChantier.upsert({
      where: { chantierId_categorie: { chantierId, categorie: dto.categorie } },
      create: { ...dto, chantierId }, update: { montant: dto.montant, commentaire: dto.commentaire },
    });
  }

  async createExpense(chantierId: string, dto: CreateDepenseDto, userId: string) {
    await this.assertChantier(chantierId);
    if (dto.commandeId) {
      const commande = await this.prisma.commande.findUnique({ where: { id: dto.commandeId } });
      if (!commande || commande.chantierId !== chantierId) throw new BadRequestException('La commande doit appartenir au chantier');
    }
    if (dto.factureFournisseurId) {
      const facture = await this.prisma.factureFournisseur.findUnique({ where: { id: dto.factureFournisseurId } });
      if (!facture || facture.chantierId !== chantierId) throw new BadRequestException('La facture fournisseur doit appartenir au chantier');
    }
    const source = dto.source ?? (dto.factureFournisseurId ? SourceDepense.FACTURE_FOURNISSEUR : dto.commandeId ? SourceDepense.COMMANDE : SourceDepense.SAISIE);
    return this.prisma.depenseChantier.create({ data: { ...dto, source, chantierId, createdById: userId } });
  }

  async assignSubcontractor(chantierId: string, dto: AssignSousTraitantDto) {
    await this.assertChantier(chantierId);
    const item = await this.prisma.sousTraitant.findUnique({ where: { id: dto.sousTraitantId } });
    if (!item || !item.isActive) throw new NotFoundException('Sous-traitant actif non trouvé');
    const today = new Date();
    if (!item.urssafValidite || item.urssafValidite < today) throw new BadRequestException('Attestation URSSAF absente ou expirée');
    if (!item.decennaleValidite || item.decennaleValidite < today) throw new BadRequestException('Assurance décennale absente ou expirée');
    return this.prisma.affectationSousTraitant.create({ data: { ...dto, chantierId } });
  }

  async createDocument(chantierId: string, dto: CreateDocumentDto) {
    await this.assertChantier(chantierId);
    const last = await this.prisma.documentChantier.findFirst({ where: { chantierId, nom: dto.nom }, orderBy: { version: 'desc' }, select: { version: true } });
    return this.prisma.documentChantier.create({ data: { ...dto, metadata: dto.metadata as Prisma.InputJsonValue, chantierId, version: (last?.version ?? 0) + 1 } });
  }

  async dashboard(chantierId: string) {
    const chantier = await this.prisma.chantier.findUnique({
      where: { id: chantierId },
      include: {
        budgets: true, depenses: true, sousTraitants: true,
        commandes: { where: { statut: { not: CommandeStatut.ANNULEE } } },
        pointages: { where: { heureFin: { not: null }, validatedAt: { not: null } }, include: { employe: { select: { coutHoraireCharge: true } } } },
        factures: { where: { statut: { not: FactureStatut.ANNULEE } } },
      },
    });
    if (!chantier) throw new NotFoundException('Chantier non trouvé');
    const budget = this.money(chantier.budgets.reduce((sum, item) => sum + Number(item.montant), 0));
    const depenses = this.money(chantier.depenses.reduce((sum, item) => sum + Number(item.montantHt), 0));
    const engagementsAchats = this.money(chantier.commandes.reduce((sum, item) => sum + Number(item.totalHt), 0));
    const engagementsSousTraitance = this.money(chantier.sousTraitants.reduce((sum, item) => sum + Number(item.montantEngageHt), 0));
    const coutMainOeuvre = this.money(chantier.pointages.reduce((sum, item) => sum + ((item.dureeMinutes ?? this.duration(item.heureDebut, item.heureFin!)) / 60) * Number(item.employe.coutHoraireCharge), 0));
    const chiffreAffaires = this.money(chantier.factures.reduce((sum, item) => sum + Number(item.totalHt), 0));
    const kpis = calculateProjectKpis({ budget, depenses, coutMainOeuvre, engagementsAchats, engagementsSousTraitance, chiffreAffaires });
    return {
      chantier: { id: chantier.id, reference: chantier.reference, objet: chantier.objet, avancement: chantier.avancement },
      budget, depenses, coutMainOeuvre, engagementsAchats, engagementsSousTraitance, chiffreAffaires, ...kpis,
    };
  }

  private async assertChantier(id: string) { if (!await this.prisma.chantier.findUnique({ where: { id }, select: { id: true } })) throw new NotFoundException('Chantier non trouvé'); }
  private duration(start: Date, end: Date) { return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000)); }
  private money(value: number) { return Math.round((value + Number.EPSILON) * 100) / 100; }
}
