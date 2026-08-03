import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeDto, UpdateEmployeDto, CreateContratDto, CreatePointageDto, CreateBonDto } from './dto';

@Injectable()
export class PersonnelService {
  constructor(private prisma: PrismaService) {}

  // Employés
  createEmploye(dto: CreateEmployeDto) {
    return this.prisma.employe.create({ data: dto });
  }

  findAllEmployes() {
    return this.prisma.employe.findMany({
      where: { isActive: true },
      include: { contrats: { orderBy: { dateDebut: 'desc' }, take: 1 } },
      orderBy: { nom: 'asc' },
    });
  }

  findOneEmploye(id: string) {
    return this.prisma.employe.findUnique({
      where: { id },
      include: { contrats: true, pointages: { orderBy: { date: 'desc' }, take: 10 } },
    });
  }

  async updateEmploye(id: string, dto: UpdateEmployeDto) {
    await this.findEmployeOrFail(id);
    return this.prisma.employe.update({ where: { id }, data: dto });
  }

  async removeEmploye(id: string) {
    await this.findEmployeOrFail(id);
    return this.prisma.employe.update({ where: { id }, data: { isActive: false } });
  }

  // Contrats
  createContrat(dto: CreateContratDto, userId: string) {
    return this.prisma.contrat.create({
      data: { ...dto, createdById: userId },
      include: { employe: true },
    });
  }

  findContratsByEmploye(employeId: string) {
    return this.prisma.contrat.findMany({
      where: { employeId },
      orderBy: { dateDebut: 'desc' },
    });
  }

  // Pointages
  createPointage(dto: CreatePointageDto) {
    return this.prisma.pointage.create({ data: dto });
  }

  findPointagesByEmploye(employeId: string) {
    return this.prisma.pointage.findMany({
      where: { employeId },
      orderBy: { date: 'desc' },
    });
  }

  async validatePointage(id: string, userId: string) {
    const pointage = await this.prisma.pointage.findUnique({ where: { id } });
    if (!pointage) throw new NotFoundException('Pointage non trouvé');
    if (!pointage.heureFin || !pointage.dureeMinutes) throw new BadRequestException('Le pointage doit être terminé avant validation');
    return this.prisma.pointage.update({ where: { id }, data: { validatedAt: new Date(), validatedById: userId } });
  }

  // Bons d'intervention
  createBon(dto: CreateBonDto, userId: string) {
    const numero = `BI-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    return this.prisma.bonIntervention.create({
      data: { ...dto, numero, demandeurId: userId },
    });
  }

  findAllBons() {
    return this.prisma.bonIntervention.findMany({
      include: { demandeur: { select: { firstName: true, lastName: true } }, employe: { select: { nom: true, prenom: true } } },
      orderBy: { dateDemande: 'desc' },
    });
  }

  // Planning
  findPlanningByDate(date: string) {
    return this.prisma.planningEntry.findMany({
      where: { date: new Date(date) },
      include: { employe: { select: { nom: true, prenom: true } } },
    });
  }

  private async findEmployeOrFail(id: string) {
    const employe = await this.prisma.employe.findUnique({ where: { id } });
    if (!employe) throw new NotFoundException('Employé non trouvé');
    return employe;
  }
}
