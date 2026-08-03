import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApporteurDto } from './dto';

@Injectable()
export class ApporteursService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.apporteurAffaires.findMany({ where: { isActive: true }, orderBy: { nom: 'asc' } });
  }

  async create(dto: CreateApporteurDto) {
    if (dto.siret && await this.prisma.apporteurAffaires.findUnique({ where: { siret: dto.siret } })) {
      throw new ConflictException('Un apporteur existe déjà avec ce SIRET');
    }
    return this.prisma.apporteurAffaires.create({ data: dto });
  }
}
