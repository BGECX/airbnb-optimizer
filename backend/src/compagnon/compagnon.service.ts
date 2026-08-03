import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CompanionBonDto, CompanionPhotoDto, StartPointageDto, StopPointageDto } from './dto';

@Injectable()
export class CompagnonService {
  constructor(private readonly prisma: PrismaService) {}

  async me(userId: string) {
    const employe = await this.employee(userId);
    const openPointage = await this.prisma.pointage.findFirst({ where: { employeId: employe.id, heureFin: null }, orderBy: { heureDebut: 'desc' } });
    return { employe, openPointage };
  }

  async startPointage(userId: string, dto: StartPointageDto) {
    const employe = await this.employee(userId);
    const duplicate = await this.prisma.pointage.findUnique({ where: { clientSyncId: dto.clientSyncId } });
    if (duplicate) return duplicate;
    if (!await this.prisma.chantier.findUnique({ where: { id: dto.chantierId }, select: { id: true } })) throw new NotFoundException('Chantier non trouvé');
    if (await this.prisma.pointage.findFirst({ where: { employeId: employe.id, heureFin: null } })) throw new BadRequestException('Un pointage est déjà en cours');
    const start = new Date(dto.heureDebut);
    return this.prisma.pointage.create({ data: { ...dto, employeId: employe.id, date: new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate())), isSync: true } });
  }

  async stopPointage(userId: string, id: string, dto: StopPointageDto) {
    const employe = await this.employee(userId);
    const pointage = await this.prisma.pointage.findUnique({ where: { id } });
    if (!pointage || pointage.employeId !== employe.id) throw new NotFoundException('Pointage non trouvé');
    if (pointage.heureFin) return pointage;
    const end = new Date(dto.heureFin);
    const minutes = Math.round((end.getTime() - pointage.heureDebut.getTime()) / 60000);
    if (minutes <= 0 || minutes > 24 * 60) throw new BadRequestException('Durée de pointage invalide');
    return this.prisma.pointage.update({ where: { id }, data: { heureFin: end, dureeMinutes: minutes, isSync: true } });
  }

  async tasks(userId: string) {
    const employe = await this.employee(userId);
    return this.prisma.tacheGantt.findMany({ where: { ressources: { has: employe.id } }, include: { chantier: { select: { reference: true, objet: true } } }, orderBy: { dateDebut: 'asc' } });
  }

  async updateTask(userId: string, id: string, avancement: number) {
    const employe = await this.employee(userId);
    const task = await this.prisma.tacheGantt.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Tâche non trouvée');
    if (!task.ressources.includes(employe.id)) throw new ForbiddenException('Tâche non affectée à cet employé');
    return this.prisma.tacheGantt.update({ where: { id }, data: { avancement } });
  }

  async photo(userId: string, dto: CompanionPhotoDto) {
    await this.employee(userId);
    const duplicate = await this.prisma.photo.findUnique({ where: { clientSyncId: dto.clientSyncId } });
    if (duplicate) return duplicate;
    if (!await this.prisma.chantier.findUnique({ where: { id: dto.chantierId }, select: { id: true } })) throw new NotFoundException('Chantier non trouvé');
    return this.prisma.photo.create({ data: { ...dto, annotations: dto.annotations as Prisma.InputJsonValue, uploadedById: userId, isSync: true } });
  }

  async bon(userId: string, dto: CompanionBonDto) {
    const employe = await this.employee(userId);
    if (dto.chantierId && !await this.prisma.chantier.findUnique({ where: { id: dto.chantierId }, select: { id: true } })) throw new NotFoundException('Chantier non trouvé');
    return this.prisma.bonIntervention.create({ data: { ...dto, employeId: employe.id, demandeurId: userId, numero: `BI-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}` } });
  }

  private async employee(userId: string) {
    const employe = await this.prisma.employe.findUnique({ where: { userId }, select: { id: true, nom: true, prenom: true, fonction: true, isActive: true } });
    if (!employe?.isActive) throw new ForbiddenException('Aucun employé actif lié à ce compte');
    return employe;
  }
}
