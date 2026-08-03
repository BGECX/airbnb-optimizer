import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChantierDto, UpdateChantierDto } from './dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { nextDocumentNumber } from '../common/utils/document-number';

@Injectable()
export class ChantiersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateChantierDto) {
    return this.prisma.$transaction(async (tx) => {
      const reference = await nextDocumentNumber(tx, 'CH');
      return tx.chantier.create({
        data: {
          ...dto,
          dateDebutPrevue: dto.dateDebutPrevue ? new Date(dto.dateDebutPrevue) : undefined,
          dateFinPrevue: dto.dateFinPrevue ? new Date(dto.dateFinPrevue) : undefined,
          reference,
        },
        include: { client: { select: { nom: true } } },
      });
    });
  }

  findAll(query: PaginationQueryDto, user: { sub: string; role: UserRole }) {
    return this.prisma.chantier.findMany({
      where: this.accessWhere(user),
      include: { client: { select: { nom: true } }, responsable: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' },
      skip: query.skip,
      take: query.limit,
    });
  }

  async findOne(id: string, user?: { sub: string; role: UserRole }) {
    const chantier = await this.prisma.chantier.findUnique({
      where: user ? { id, AND: this.accessWhere(user) } : { id },
      include: {
        client: true,
        responsable: { select: { firstName: true, lastName: true } },
        devis: true,
        factures: true,
        photos: true,
        tachesGantt: true,
        lots: true,
      },
    });
    if (!chantier) throw new NotFoundException('Chantier non trouvé ou hors de votre périmètre');
    return chantier;
  }

  async update(id: string, dto: UpdateChantierDto, user: { sub: string; role: UserRole }) {
    await this.assertAccess(id, user);
    return this.prisma.chantier.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOneOrFail(id);
    return this.prisma.chantier.delete({ where: { id } });
  }

  private async findOneOrFail(id: string) {
    const chantier = await this.prisma.chantier.findUnique({ where: { id } });
    if (!chantier) throw new NotFoundException('Chantier non trouvé');
    return chantier;
  }

  private accessWhere(user: { sub: string; role: UserRole }): Prisma.ChantierWhereInput {
    if (([UserRole.ADMIN, UserRole.MANAGER, UserRole.COMPTABLE] as UserRole[]).includes(user.role)) return {};
    if (user.role === UserRole.CHEF_CHANTIER) return { responsableId: user.sub };
    return { planningEntries: { some: { employe: { userId: user.sub } } } };
  }

  private async assertAccess(id: string, user: { sub: string; role: UserRole }) {
    if (!await this.prisma.chantier.findFirst({ where: { id, AND: this.accessWhere(user) }, select: { id: true } })) {
      throw new ForbiddenException('Chantier hors de votre périmètre');
    }
  }
}
