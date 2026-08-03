import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto, UpdateClientDto } from './dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateClientDto) {
    return this.prisma.client.create({ data: dto });
  }

  findAll(query: PaginationQueryDto) {
    return this.prisma.client.findMany({
      where: { isActive: true },
      orderBy: { nom: 'asc' },
      skip: query.skip,
      take: query.limit,
    });
  }

  findOne(id: string) {
    return this.prisma.client.findUnique({
      where: { id },
      include: {
        devis: { orderBy: { date: 'desc' }, take: 5 },
        factures: { orderBy: { date: 'desc' }, take: 5 },
        chantiers: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
  }

  async update(id: string, dto: UpdateClientDto) {
    await this.findOneOrFail(id);
    return this.prisma.client.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOneOrFail(id);
    return this.prisma.client.update({ where: { id }, data: { isActive: false } });
  }

  private async findOneOrFail(id: string) {
    const client = await this.prisma.client.findUnique({ where: { id } });
    if (!client) throw new NotFoundException('Client non trouvé');
    return client;
  }
}
