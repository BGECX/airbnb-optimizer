import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AleaStatut, Prisma, TravailConservatoireStatut } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { assertTransition } from '../common/utils/workflow';
import { CreateAleaDto, CreateDiagnosticBatiDto, CreateTraceBatiDto, CreateTravailConservatoireDto } from './dto';

@Injectable()
export class RenovationService {
  constructor(private readonly prisma: PrismaService) {}

  async getDossier(chantierId: string) {
    await this.assertChantier(chantierId);
    return this.prisma.chantier.findUnique({
      where: { id: chantierId },
      select: {
        id: true, reference: true, objet: true,
        diagnosticsBati: { orderBy: [{ urgence: 'desc' }, { createdAt: 'desc' }] },
        aleas: { orderBy: { detectedAt: 'desc' } },
        travauxConservatoires: { orderBy: { datePrevue: 'asc' } },
        tracesBati: { orderBy: { createdAt: 'desc' } },
      },
    });
  }

  async createDiagnostic(chantierId: string, dto: CreateDiagnosticBatiDto, userId: string) {
    await this.assertChantier(chantierId);
    if (dto.visiteId) {
      const visite = await this.prisma.visiteTechnique.findUnique({ where: { id: dto.visiteId } });
      if (!visite || visite.chantierId !== chantierId) throw new BadRequestException('La visite doit appartenir au chantier');
    }
    return this.prisma.diagnosticBati.create({ data: { ...dto, chantierId, createdById: userId } });
  }

  async createAlea(chantierId: string, dto: CreateAleaDto) {
    await this.assertChantier(chantierId);
    return this.prisma.aleaChantier.create({ data: { ...dto, chantierId } });
  }

  async changeAleaStatus(chantierId: string, id: string, statut: AleaStatut) {
    const item = await this.prisma.aleaChantier.findUnique({ where: { id } });
    if (!item || item.chantierId !== chantierId) throw new NotFoundException('Aléa non trouvé');
    const transitions: Record<AleaStatut, AleaStatut[]> = {
      IDENTIFIE: [AleaStatut.ANALYSE], ANALYSE: [AleaStatut.TRAITE, AleaStatut.ACCEPTE],
      TRAITE: [AleaStatut.CLOTURE], ACCEPTE: [AleaStatut.CLOTURE], CLOTURE: [],
    };
    assertTransition('d’aléa', item.statut, statut, transitions);
    return this.prisma.aleaChantier.update({ where: { id }, data: { statut, resolvedAt: statut === AleaStatut.CLOTURE ? new Date() : null } });
  }

  async createTravail(chantierId: string, dto: CreateTravailConservatoireDto) {
    await this.assertChantier(chantierId);
    if (dto.diagnosticId) {
      const diagnostic = await this.prisma.diagnosticBati.findUnique({ where: { id: dto.diagnosticId } });
      if (!diagnostic || diagnostic.chantierId !== chantierId) throw new BadRequestException('Le diagnostic doit appartenir au chantier');
    }
    return this.prisma.travailConservatoire.create({ data: { ...dto, chantierId } });
  }

  async changeTravailStatus(chantierId: string, id: string, statut: TravailConservatoireStatut) {
    const item = await this.prisma.travailConservatoire.findUnique({ where: { id } });
    if (!item || item.chantierId !== chantierId) throw new NotFoundException('Travail conservatoire non trouvé');
    const transitions: Record<TravailConservatoireStatut, TravailConservatoireStatut[]> = {
      A_FAIRE: [TravailConservatoireStatut.EN_COURS, TravailConservatoireStatut.ANNULE],
      EN_COURS: [TravailConservatoireStatut.REALISE, TravailConservatoireStatut.ANNULE], REALISE: [], ANNULE: [],
    };
    assertTransition('de travail conservatoire', item.statut, statut, transitions);
    return this.prisma.travailConservatoire.update({ where: { id }, data: { statut, dateRealisee: statut === TravailConservatoireStatut.REALISE ? new Date() : null } });
  }

  async createTrace(chantierId: string, dto: CreateTraceBatiDto, userId: string) {
    await this.assertChantier(chantierId);
    return this.prisma.traceBati.create({ data: { ...dto, donnees: dto.donnees as Prisma.InputJsonValue, chantierId, createdById: userId } });
  }

  private async assertChantier(id: string) {
    if (!await this.prisma.chantier.findUnique({ where: { id }, select: { id: true } })) throw new NotFoundException('Chantier non trouvé');
  }
}
