import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateAssuranceDto,
  CreateBanqueDto,
  CreateTvaDto,
  UpdateEntrepriseDto,
  UpdateNumerotationDto,
} from "./dto";

@Injectable()
export class ParametresService {
  constructor(private prisma: PrismaService) {}

  // Entreprise
  getEntreprise() {
    return this.prisma.parametreEntreprise.findFirst();
  }

  async updateEntreprise(data: UpdateEntrepriseDto) {
    if (data.siret) {
      const siret = data.siret.replace(/\D/g, "");
      if (!/^\d{14}$/.test(siret) || !this.isLuhnValid(siret))
        throw new BadRequestException("Le numéro SIRET est invalide");
      data.siret = siret;
      data.siren = siret.slice(0, 9);
      await this.verifySiretExists(siret);
    }
    if (data.tvaIntra) {
      const vat = data.tvaIntra.replace(/[\s.-]/g, "").toUpperCase();
      const result = await this.verifyTVA(vat);
      if (!result.valid)
        throw new BadRequestException(
          "Le numéro de TVA intracommunautaire est invalide selon VIES",
        );
      data.tvaIntra = vat;
    }
    return this.prisma.parametreEntreprise.upsert({
      where: { id: "default" },
      update: data,
      create: {
        id: "default",
        ...data,
        raisonSociale: data.raisonSociale ?? "Entreprise à configurer",
      },
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

  async verifyTVA(numero: string) {
    const normalized = numero.replace(/[\s.-]/g, "").toUpperCase();
    if (!/^[A-Z]{2}[A-Z0-9]{2,14}$/.test(normalized))
      throw new BadRequestException("Format du numéro de TVA invalide");
    try {
      const response = await fetch(
        "https://ec.europa.eu/taxation_customs/vies/rest-api/check-vat-number",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            accept: "application/json",
            "user-agent": "KRITIA-BTP/1.0 (https://getkritia.com)",
          },
          body: JSON.stringify({
            countryCode: normalized.slice(0, 2),
            vatNumber: normalized.slice(2),
          }),
          signal: AbortSignal.timeout(8000),
        },
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = (await response.json()) as Record<string, unknown>;
      return {
        numero: normalized,
        valid: result.valid === true,
        nom: result.name ?? null,
        adresse: result.address ?? null,
        dateVerification: result.requestDate ?? new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadGatewayException(
        "Le service européen VIES est momentanément indisponible",
      );
    }
  }

  private isLuhnValid(value: string) {
    let sum = 0;
    let alternate = false;
    for (let index = value.length - 1; index >= 0; index -= 1) {
      let digit = Number(value[index]);
      if (alternate) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      alternate = !alternate;
    }
    return sum % 10 === 0;
  }

  private async verifySiretExists(siret: string) {
    try {
      const response = await fetch(
        `https://recherche-entreprises.api.gouv.fr/search?q=${siret}&per_page=1`,
        {
          headers: {
            accept: "application/json",
            "user-agent": "KRITIA-BTP/1.0 (https://getkritia.com)",
          },
          signal: AbortSignal.timeout(6000),
        },
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = (await response.json()) as {
        results?: Array<{
          siege?: { siret?: string };
          matching_etablissements?: Array<{ siret?: string }>;
        }>;
      };
      const found = payload.results?.some(
        (company) =>
          company.siege?.siret === siret ||
          company.matching_etablissements?.some((item) => item.siret === siret),
      );
      if (!found)
        throw new BadRequestException(
          "Ce SIRET est introuvable dans le registre public",
        );
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadGatewayException(
        "Le registre public des entreprises est momentanément indisponible",
      );
    }
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
