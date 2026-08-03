import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ChantierStatut, ProspectStatut, ReceptionStatut, ReserveStatut, SavStatut, SituationStatut, VisiteStatut } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { assertTransition } from '../common/utils/workflow';
import { ChangeReserveStatusDto, ChangeSavStatusDto, CompleteVisiteDto, CreateProspectDto, CreateReceptionDto, CreateReserveDto, CreateSavDto, CreateSituationDto, CreateVisiteDto } from './dto';

@Injectable()
export class CommercialService {
  constructor(private readonly prisma: PrismaService) {}

  createProspect(dto: CreateProspectDto) { return this.prisma.prospect.create({ data: { ...dto, dateContact: new Date() } }); }
  findProspects() { return this.prisma.prospect.findMany({ include: { visites: { orderBy: { datePrevue: 'desc' } }, convertedToClient: true }, orderBy: { updatedAt: 'desc' }, take: 100 }); }

  async changeProspectStatus(id: string, statut: ProspectStatut) {
    const prospect = await this.getProspect(id);
    const transitions: Record<ProspectStatut, ProspectStatut[]> = {
      PREMIER_CONTACT: [ProspectStatut.VISITE_PLANIFIEE, ProspectStatut.DEVIS_DEMANDE, ProspectStatut.PERDU],
      VISITE_PLANIFIEE: [ProspectStatut.VISITE_REALISEE, ProspectStatut.PERDU],
      VISITE_REALISEE: [ProspectStatut.CHIFFRAGE, ProspectStatut.DEVIS_DEMANDE, ProspectStatut.PERDU],
      CHIFFRAGE: [ProspectStatut.DEVIS_DEMANDE, ProspectStatut.DEVIS_ENVOYE, ProspectStatut.PERDU],
      DEVIS_DEMANDE: [ProspectStatut.DEVIS_ENVOYE, ProspectStatut.PERDU],
      DEVIS_ENVOYE: [ProspectStatut.NEGOCIATION, ProspectStatut.GAGNE, ProspectStatut.PERDU],
      NEGOCIATION: [ProspectStatut.GAGNE, ProspectStatut.PERDU], GAGNE: [], PERDU: [],
    };
    assertTransition('de prospect', prospect.statut, statut, transitions);
    return this.prisma.prospect.update({ where: { id }, data: { statut } });
  }

  async createVisit(prospectId: string, dto: CreateVisiteDto, userId: string) {
    const prospect = await this.getProspect(prospectId);
    if (prospect.statut === ProspectStatut.GAGNE || prospect.statut === ProspectStatut.PERDU) throw new BadRequestException('Prospect clôturé');
    if (dto.chantierId && !await this.prisma.chantier.findUnique({ where: { id: dto.chantierId } })) throw new NotFoundException('Chantier non trouvé');
    const visite = await this.prisma.visiteTechnique.create({ data: { ...dto, prospectId, createdById: userId } });
    if (prospect.statut === ProspectStatut.PREMIER_CONTACT) await this.prisma.prospect.update({ where: { id: prospectId }, data: { statut: ProspectStatut.VISITE_PLANIFIEE } });
    return visite;
  }

  async completeVisit(id: string, dto: CompleteVisiteDto) {
    const visite = await this.prisma.visiteTechnique.findUnique({ where: { id } });
    if (!visite) throw new NotFoundException('Visite non trouvée');
    if (visite.statut !== VisiteStatut.PLANIFIEE) throw new BadRequestException('Seule une visite planifiée peut être réalisée');
    const updated = await this.prisma.visiteTechnique.update({ where: { id }, data: { ...dto, dateRealisee: dto.dateRealisee ?? new Date(), statut: VisiteStatut.REALISEE } });
    if (visite.prospectId) {
      const prospect = await this.prisma.prospect.findUnique({ where: { id: visite.prospectId } });
      if (prospect?.statut === ProspectStatut.VISITE_PLANIFIEE) await this.prisma.prospect.update({ where: { id: visite.prospectId }, data: { statut: ProspectStatut.VISITE_REALISEE } });
    }
    return updated;
  }

  async convertProspect(id: string) {
    const prospect = await this.getProspect(id);
    if (prospect.convertedToClientId) throw new ConflictException('Prospect déjà converti');
    if (prospect.statut === ProspectStatut.PERDU) throw new BadRequestException('Un prospect perdu ne peut pas être converti');
    return this.prisma.$transaction(async (tx) => {
      const client = await tx.client.create({ data: { type: prospect.type, nom: prospect.nom, telephone: prospect.telephone, email: prospect.email, contactNom: prospect.contactNom } });
      await tx.prospect.update({ where: { id }, data: { statut: ProspectStatut.GAGNE, convertedToClientId: client.id } });
      return client;
    });
  }

  async createReception(chantierId: string, dto: CreateReceptionDto) {
    const chantier = await this.getChantier(chantierId);
    if (chantier.statut !== ChantierStatut.EN_COURS && chantier.statut !== ChantierStatut.TERMINE) throw new BadRequestException('Le chantier doit être en cours ou terminé pour être réceptionné');
    if (await this.prisma.receptionChantier.findUnique({ where: { chantierId } })) throw new ConflictException('Une réception existe déjà pour ce chantier');
    return this.prisma.$transaction(async (tx) => {
      const statut = dto.statut ?? ReceptionStatut.SANS_RESERVE;
      if (statut === ReceptionStatut.RESERVES_LEVEES) throw new BadRequestException('Une réception ne peut pas être créée avec des réserves déjà levées');
      const reception = await tx.receptionChantier.create({ data: { ...dto, statut, chantierId } });
      const chantierStatut = statut === ReceptionStatut.SANS_RESERVE ? ChantierStatut.LIVRE : statut === ReceptionStatut.REFUSEE ? ChantierStatut.EN_COURS : ChantierStatut.TERMINE;
      await tx.chantier.update({ where: { id: chantierId }, data: { statut: chantierStatut, dateFinReelle: statut === ReceptionStatut.REFUSEE ? null : new Date(dto.date) } });
      return reception;
    });
  }

  async addReserve(receptionId: string, dto: CreateReserveDto) {
    const reception = await this.prisma.receptionChantier.findUnique({ where: { id: receptionId } });
    if (!reception) throw new NotFoundException('Réception non trouvée');
    if (reception.statut === ReceptionStatut.REFUSEE) throw new BadRequestException('Impossible d’ajouter une réserve à une réception refusée');
    const reserve = await this.prisma.reserveReception.create({ data: { ...dto, receptionId } });
    if (reception.statut === ReceptionStatut.SANS_RESERVE || reception.statut === ReceptionStatut.RESERVES_LEVEES) await this.prisma.$transaction([
      this.prisma.receptionChantier.update({ where: { id: receptionId }, data: { statut: ReceptionStatut.AVEC_RESERVES } }),
      this.prisma.chantier.update({ where: { id: reception.chantierId }, data: { statut: ChantierStatut.TERMINE } }),
    ]);
    return reserve;
  }

  async changeReserveStatus(id: string, dto: ChangeReserveStatusDto) {
    const reserve = await this.prisma.reserveReception.findUnique({ where: { id }, include: { reception: true } });
    if (!reserve) throw new NotFoundException('Réserve non trouvée');
    const transitions: Record<ReserveStatut, ReserveStatut[]> = { OUVERTE: [ReserveStatut.EN_COURS, ReserveStatut.CONTESTEE], EN_COURS: [ReserveStatut.LEVEE, ReserveStatut.CONTESTEE], CONTESTEE: [ReserveStatut.EN_COURS, ReserveStatut.LEVEE], LEVEE: [] };
    assertTransition('de réserve', reserve.statut, dto.statut, transitions);
    const updated = await this.prisma.reserveReception.update({ where: { id }, data: { ...dto, leveeAt: dto.statut === ReserveStatut.LEVEE ? new Date() : null } });
    const openCount = await this.prisma.reserveReception.count({ where: { receptionId: reserve.receptionId, statut: { not: ReserveStatut.LEVEE } } });
    if (openCount === 0) await this.prisma.$transaction([
      this.prisma.receptionChantier.update({ where: { id: reserve.receptionId }, data: { statut: ReceptionStatut.RESERVES_LEVEES } }),
      this.prisma.chantier.update({ where: { id: reserve.reception.chantierId }, data: { statut: ChantierStatut.LIVRE } }),
    ]);
    return updated;
  }

  async createSav(chantierId: string, dto: CreateSavDto) {
    const chantier = await this.prisma.chantier.findUnique({ where: { id: chantierId }, include: { reception: true } });
    if (!chantier) throw new NotFoundException('Chantier non trouvé');
    if (!chantier.reception) throw new BadRequestException('Une réception est obligatoire avant ouverture d’un SAV');
    return this.prisma.savTicket.create({ data: { ...dto, chantierId, receptionId: chantier.reception.id, numero: `SAV-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}` } });
  }

  async changeSavStatus(id: string, dto: ChangeSavStatusDto) {
    const sav = await this.prisma.savTicket.findUnique({ where: { id } });
    if (!sav) throw new NotFoundException('Ticket SAV non trouvé');
    const transitions: Record<SavStatut, SavStatut[]> = {
      OUVERT: [SavStatut.QUALIFIE, SavStatut.REJETE], QUALIFIE: [SavStatut.PLANIFIE, SavStatut.REJETE],
      PLANIFIE: [SavStatut.EN_COURS], EN_COURS: [SavStatut.RESOLU], RESOLU: [SavStatut.CLOTURE, SavStatut.EN_COURS], CLOTURE: [], REJETE: [],
    };
    assertTransition('de SAV', sav.statut, dto.statut, transitions);
    if (dto.statut === SavStatut.RESOLU && !dto.resolution) throw new BadRequestException('La résolution est obligatoire');
    return this.prisma.savTicket.update({ where: { id }, data: { ...dto, resoluAt: dto.statut === SavStatut.RESOLU ? new Date() : sav.resoluAt } });
  }

  async createSituation(chantierId: string, dto: CreateSituationDto) {
    await this.getChantier(chantierId);
    if (new Date(dto.periodeFin) < new Date(dto.periodeDebut)) throw new BadRequestException('Période de situation invalide');
    const maxRate = Number(process.env.MAX_RETENUE_GARANTIE_RATE ?? 5);
    const taux = dto.tauxRetenue ?? 0;
    if (taux > maxRate) throw new BadRequestException(`Taux de retenue supérieur au plafond configuré (${maxRate} %)`);
    const retenue = this.money(dto.totalHt * taux / 100);
    return this.prisma.$transaction(async (tx) => {
      const situation = await tx.situation.create({ data: { chantierId, numero: `SIT-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`, periodeDebut: dto.periodeDebut, periodeFin: dto.periodeFin, totalHt: dto.totalHt, retenueGarantie: retenue, netAPayer: this.money(dto.totalHt - retenue) } });
      if (retenue > 0) await tx.retenueGarantie.create({ data: { chantierId, situationId: situation.id, montant: retenue, taux } });
      return situation;
    });
  }

  async changeSituationStatus(id: string, statut: SituationStatut) {
    const situation = await this.prisma.situation.findUnique({ where: { id } });
    if (!situation) throw new NotFoundException('Situation non trouvée');
    const transitions: Record<SituationStatut, SituationStatut[]> = { ETABLIE: [SituationStatut.ENVOYEE], ENVOYEE: [SituationStatut.PAYEE, SituationStatut.IMPAYEE], IMPAYEE: [SituationStatut.PAYEE], PAYEE: [] };
    assertTransition('de situation', situation.statut, statut, transitions);
    return this.prisma.situation.update({ where: { id }, data: { statut, datePaiement: statut === SituationStatut.PAYEE ? new Date() : null } });
  }

  private async getProspect(id: string) { const item = await this.prisma.prospect.findUnique({ where: { id } }); if (!item) throw new NotFoundException('Prospect non trouvé'); return item; }
  private async getChantier(id: string) { const item = await this.prisma.chantier.findUnique({ where: { id } }); if (!item) throw new NotFoundException('Chantier non trouvé'); return item; }
  private money(value: number) { return Math.round((value + Number.EPSILON) * 100) / 100; }
}
