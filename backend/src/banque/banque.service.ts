import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOperationDto } from './dto';

@Injectable()
export class BanqueService {
  constructor(private prisma: PrismaService) {}

  createOperation(dto: CreateOperationDto, userId: string) {
    return this.prisma.operationBancaire.create({
      data: { ...dto, createdById: userId },
    });
  }

  findAll() {
    return this.prisma.operationBancaire.findMany({
      orderBy: { date: 'desc' },
      take: 100,
    });
  }

  findByBanque(banque: string) {
    return this.prisma.operationBancaire.findMany({
      where: { banque },
      orderBy: { date: 'desc' },
    });
  }

  getSolde(banque: string) {
    return this.prisma.operationBancaire.groupBy({
      by: ['type'],
      where: { banque },
      _sum: { montant: true },
    });
  }
}
