import { BadGatewayException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto, UpdateClientDto } from './dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateClientDto) {
    if (dto.siret && await this.prisma.client.findUnique({ where: { siret: dto.siret } })) {
      throw new ConflictException('Un client existe déjà avec ce SIRET');
    }
    return this.prisma.client.create({ data: { ...dto, siren: dto.siret?.slice(0, 9) } });
  }

  async searchCompany(siret: string) {
    const existing = await this.prisma.client.findUnique({ where: { siret } });
    if (existing) return { existing: true, client: existing };
    try {
      const response = await fetch(`https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(siret)}&per_page=1`, {
        headers: { accept: 'application/json', 'user-agent': 'KRITIA-BTP/1.0 (https://getkritia.com)' },
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json() as { results?: Array<Record<string, any>> };
      const company = payload.results?.[0];
      if (!company) throw new NotFoundException('Aucune entreprise publique trouvée pour ce SIRET');
      const establishment = (company.matching_etablissements ?? []).find((item: Record<string, unknown>) => item.siret === siret) ?? company.siege ?? {};
      return {
        existing: false,
        company: {
          nom: company.nom_raison_sociale ?? company.nom_complet,
          siret,
          siren: company.siren,
          adresse: establishment.adresse ?? establishment.geo_adresse,
          codePostal: establishment.code_postal,
          ville: establishment.libelle_commune,
          activitePrincipale: establishment.activite_principale ?? company.activite_principale,
          etatAdministratif: establishment.etat_administratif,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new BadGatewayException('Le registre public des entreprises est momentanément indisponible');
    }
  }

  async searchAddresses(query: string) {
    try {
      const url = new URL('https://data.geopf.fr/geocodage/completion');
      url.searchParams.set('text', query);
      url.searchParams.set('maximumResponses', '6');
      const response = await fetch(url, { headers: { accept: 'application/json', 'user-agent': 'KRITIA-BTP/1.0 (https://getkritia.com)' }, signal: AbortSignal.timeout(5000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json() as { results?: Array<Record<string, unknown>> };
      return (payload.results ?? []).map((item) => ({
        label: item.fulltext,
        adresse: String(item.fulltext ?? '').split(',')[0],
        codePostal: item.zipcode,
        ville: item.city,
        latitude: item.y,
        longitude: item.x,
      }));
    } catch {
      throw new BadGatewayException('Le service national des adresses est momentanément indisponible');
    }
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
