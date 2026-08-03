import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePhotoDto } from './dto';
import { PhotoPhase, Prisma, UserRole } from '@prisma/client';

@Injectable()
export class PhotosService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePhotoDto, user: { sub: string; role: UserRole }) {
    if (dto.clientSyncId) {
      const existing = await this.prisma.photo.findUnique({ where: { clientSyncId: dto.clientSyncId } });
      if (existing) return existing;
    }
    await this.assertChantierAccess(dto.chantierId, user);
    if (dto.ouvrageId && !await this.prisma.ouvrage.findUnique({ where: { id: dto.ouvrageId }, select: { id: true } })) throw new NotFoundException('Ouvrage non trouvé');
    return this.prisma.photo.create({
      data: { ...dto, annotations: dto.annotations as Prisma.InputJsonValue, uploadedById: user.sub },
      include: { chantier: { select: { objet: true } } },
    });
  }

  findAll(user: { sub: string; role: UserRole }, chantierId?: string, phase?: PhotoPhase, zone?: string) {
    return this.prisma.photo.findMany({
      where: { chantierId, phase, zone: zone ? { contains: zone, mode: 'insensitive' } : undefined, chantier: this.chantierAccessWhere(user) },
      include: { chantier: { select: { objet: true } }, uploadedBy: { select: { firstName: true, lastName: true } } },
      orderBy: { datePrise: 'desc' },
    });
  }

  async findOne(id: string, user?: { sub: string; role: UserRole }) {
    const photo = await this.prisma.photo.findUnique({
      where: { id, chantier: user ? this.chantierAccessWhere(user) : undefined },
      include: { chantier: true, uploadedBy: { select: { firstName: true, lastName: true } } },
    });
    if (!photo) throw new NotFoundException('Photo non trouvée ou hors de votre périmètre');
    return photo;
  }

  async remove(id: string) {
    await this.findOneOrFail(id);
    return this.prisma.photo.delete({ where: { id } });
  }

  private async findOneOrFail(id: string) {
    const photo = await this.prisma.photo.findUnique({ where: { id } });
    if (!photo) throw new NotFoundException('Photo non trouvée');
    return photo;
  }

  private chantierAccessWhere(user: { sub: string; role: UserRole }): Prisma.ChantierWhereInput {
    if (([UserRole.ADMIN, UserRole.MANAGER, UserRole.COMPTABLE] as UserRole[]).includes(user.role)) return {};
    if (user.role === UserRole.CHEF_CHANTIER) return { responsableId: user.sub };
    return { planningEntries: { some: { employe: { userId: user.sub } } } };
  }

  private async assertChantierAccess(chantierId: string, user: { sub: string; role: UserRole }) {
    if (!await this.prisma.chantier.findFirst({ where: { id: chantierId, AND: this.chantierAccessWhere(user) }, select: { id: true } })) {
      throw new ForbiddenException('Chantier hors de votre périmètre');
    }
  }
}
