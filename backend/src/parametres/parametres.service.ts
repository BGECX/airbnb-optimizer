import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssuranceDto, CreateBanqueDto, CreateTvaDto, UpdateEntrepriseDto, UpdateNumerotationDto } from './dto';

@Injectable()
export class ParametresService {
  constructor(private prisma: PrismaService) {}

  // Entreprise
  getEntreprise() {
    return this.prisma.parametreEntreprise.findFirst();
  }

  updateEntreprise(data: UpdateEntrepriseDto) {
    return this.prisma.parametreEntreprise.upsert({
      where: { id: 'default' },
      update: data,
      create: { id: 'default', ...data, raisonSociale: data.raisonSociale ?? 'Entreprise à configurer' },
    });
  }

  // Numérotation
  getNumerotations() {
    return this.prisma.parametreNumerotation.findMany();
  }

  updateNumerotation(type: string, data: UpdateNumerotationDto) {
    return this.prisma.parametreNumerotation.upsert({
      where: { type },
      update: data,
      create: { type, ...data },
    });
  }

  // TVA
  getTVAs() {
    return this.prisma.parametreTVA.findMany();
  }

  createTVA(data: CreateTvaDto) {
    return this.prisma.parametreTVA.create({ data });
  }

  // Banques
  getBanques() {
    return this.prisma.parametreBanque.findMany();
  }

  createBanque(data: CreateBanqueDto) {
    return this.prisma.parametreBanque.create({ data });
  }

  // Assurances
  getAssurances() {
    return this.prisma.assurance.findMany();
  }

  createAssurance(data: CreateAssuranceDto) {
    return this.prisma.assurance.create({ data });
  }
}
