import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddComposantDto, CreateOuvrageDto, UpdatePrixOuvrageDto } from './dto';

@Injectable()
export class BibliothequeService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(recherche?: string) {
    return this.prisma.ouvrage.findMany({
      where: recherche ? { OR: [
        { reference: { contains: recherche, mode: 'insensitive' } },
        { designation: { contains: recherche, mode: 'insensitive' } },
        { categorie: { contains: recherche, mode: 'insensitive' } },
      ] } : { isActif: true },
      include: { composants: { orderBy: { ordre: 'asc' } } },
      orderBy: { designation: 'asc' },
      take: 100,
    });
  }

  async findOne(id: string) {
    const ouvrage = await this.prisma.ouvrage.findUnique({
      where: { id },
      include: { composants: { orderBy: { ordre: 'asc' } }, historiquesPrix: { orderBy: { dateEffet: 'desc' }, take: 25 } },
    });
    if (!ouvrage) throw new NotFoundException('Ouvrage non trouvé');
    return ouvrage;
  }

  async create(dto: CreateOuvrageDto) {
    if (await this.prisma.ouvrage.findUnique({ where: { reference: dto.reference } })) throw new ConflictException('Référence ouvrage déjà utilisée');
    const { composants, ...data } = dto;
    const debourseSec = this.calculateCost(composants);
    const coefficientVente = dto.coefficientVente ?? 1;
    const prixUnitaireHt = this.money(debourseSec * coefficientVente);
    return this.prisma.ouvrage.create({
      data: {
        ...data,
        debourseSec,
        coefficientVente,
        prixUnitaireHt,
        composants: { create: composants.map((composant, ordre) => ({ ...composant, ordre })) },
        historiquesPrix: { create: { prixAchat: debourseSec, prixVente: prixUnitaireHt, commentaire: 'Création de l’ouvrage' } },
      },
      include: { composants: true, historiquesPrix: true },
    });
  }

  async addComponent(id: string, dto: AddComposantDto) {
    await this.findOne(id);
    await this.prisma.composantOuvrage.create({ data: { ...dto, ouvrageId: id } });
    return this.recalculate(id);
  }

  async updatePrice(id: string, dto: UpdatePrixOuvrageDto) {
    await this.findOne(id);
    const coefficientVente = dto.prixAchat > 0 ? dto.prixVente / dto.prixAchat : 1;
    return this.prisma.ouvrage.update({
      where: { id },
      data: {
        debourseSec: dto.prixAchat,
        prixUnitaireHt: dto.prixVente,
        coefficientVente,
        historiquesPrix: { create: dto },
      },
      include: { historiquesPrix: { orderBy: { dateEffet: 'desc' }, take: 25 } },
    });
  }

  private async recalculate(id: string) {
    const composants = await this.prisma.composantOuvrage.findMany({ where: { ouvrageId: id } });
    const ouvrage = await this.prisma.ouvrage.findUnique({ where: { id } });
    if (!ouvrage) throw new NotFoundException('Ouvrage non trouvé');
    const debourseSec = this.calculateCost(composants.map((item) => ({ ...item, quantite: Number(item.quantite), prixUnitaire: Number(item.prixUnitaire), tauxPerte: Number(item.tauxPerte) })));
    const prixUnitaireHt = this.money(debourseSec * Number(ouvrage.coefficientVente));
    return this.prisma.ouvrage.update({
      where: { id },
      data: { debourseSec, prixUnitaireHt, historiquesPrix: { create: { prixAchat: debourseSec, prixVente: prixUnitaireHt, commentaire: 'Recalcul de la composition' } } },
      include: { composants: true, historiquesPrix: { orderBy: { dateEffet: 'desc' }, take: 25 } },
    });
  }

  private calculateCost(composants: Array<{ quantite: number; prixUnitaire: number; tauxPerte?: number }>) {
    return this.money(composants.reduce((sum, item) => sum + item.quantite * item.prixUnitaire * (1 + (item.tauxPerte ?? 0) / 100), 0));
  }
  private money(value: number) { return Math.round((value + Number.EPSILON) * 100) / 100; }
}
