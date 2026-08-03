import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { analyseDpgf, rankOuvrages } from './chiffrage-engine';

const ENGINE_VERSION = 'rules-btp-1.0.0';

@Injectable()
export class ChiffrageAssisteService {
  constructor(private readonly prisma: PrismaService) {}

  async analyse(dpgfId: string, userId: string) {
    const dpgf = await this.prisma.dpgf.findUnique({
      where: { id: dpgfId },
      include: { chantier: { include: { diagnosticsBati: true } }, lots: { include: { postes: true } } },
    });
    if (!dpgf) throw new NotFoundException('DPGF non trouvée');
    const postes = dpgf.lots.flatMap((lot) => lot.postes);
    const { alertes, scoreCompletude } = analyseDpgf(postes, dpgf.chantier.diagnosticsBati);
    const query = [...dpgf.chantier.diagnosticsBati.map((item) => `${item.element} ${item.pathologie}`), ...postes.map((item) => item.designation)].join(' ');
    const suggestions = await this.suggestOuvrages(query);
    const comparaison = await this.compareHistory(dpgfId, postes.filter((item) => item.ouvrageId).map((item) => item.ouvrageId!));
    return this.prisma.analyseChiffrage.create({
      data: { dpgfId, requestedById: userId, engineVersion: ENGINE_VERSION, scoreCompletude, alertes: alertes as unknown as Prisma.InputJsonValue, suggestions: suggestions as unknown as Prisma.InputJsonValue, comparaison: comparaison as unknown as Prisma.InputJsonValue },
    });
  }

  async history(dpgfId: string) {
    if (!await this.prisma.dpgf.findUnique({ where: { id: dpgfId }, select: { id: true } })) throw new NotFoundException('DPGF non trouvée');
    return this.prisma.analyseChiffrage.findMany({ where: { dpgfId }, orderBy: { createdAt: 'desc' }, take: 20 });
  }

  async suggestOuvrages(query: string) {
    if (!query?.trim()) throw new BadRequestException('Recherche obligatoire');
    const ouvrages = await this.prisma.ouvrage.findMany({ where: { isActif: true }, select: { id: true, reference: true, designation: true, categorie: true }, take: 1000 });
    return rankOuvrages(query, ouvrages);
  }

  async suggestTemplate(chantierId: string) {
    const chantier = await this.prisma.chantier.findUnique({ where: { id: chantierId }, include: { diagnosticsBati: true } });
    if (!chantier) throw new NotFoundException('Chantier non trouvé');
    const groups = new Map<string, typeof chantier.diagnosticsBati>();
    for (const item of chantier.diagnosticsBati) groups.set(item.element, [...(groups.get(item.element) ?? []), item]);
    return {
      moteur: ENGINE_VERSION,
      avertissement: 'Trame proposée à valider par un métreur ou conducteur de travaux',
      lots: await Promise.all([...groups.entries()].map(async ([element, diagnostics], ordre) => ({
        code: String(ordre + 1).padStart(2, '0'), designation: element.replace(/_/g, ' '),
        diagnostics: diagnostics.map((item) => ({ zone: item.zone, pathologie: item.pathologie, gravite: item.gravite })),
        ouvragesSuggérés: await this.suggestOuvrages(`${element} ${diagnostics.map((item) => item.pathologie).join(' ')}`),
      }))),
    };
  }

  private async compareHistory(currentDpgfId: string, ouvrageIds: string[]) {
    if (!ouvrageIds.length) return [];
    const historical = await this.prisma.posteDpgf.findMany({ where: { ouvrageId: { in: [...new Set(ouvrageIds)] }, lot: { dpgfId: { not: currentDpgfId } }, isSelected: true }, select: { ouvrageId: true, prixUnitaireHt: true, debourseUnitaire: true, quantite: true } });
    const groups = new Map<string, typeof historical>();
    for (const item of historical) groups.set(item.ouvrageId!, [...(groups.get(item.ouvrageId!) ?? []), item]);
    return [...groups.entries()].map(([ouvrageId, items]) => ({ ouvrageId, occurrences: items.length, prixVenteMoyen: this.average(items.map((item) => Number(item.prixUnitaireHt))), debourseMoyen: this.average(items.map((item) => Number(item.debourseUnitaire))), quantiteTotale: Math.round(items.reduce((sum, item) => sum + Number(item.quantite), 0) * 1000) / 1000 }));
  }

  private average(values: number[]) { return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length * 100) / 100; }
}
