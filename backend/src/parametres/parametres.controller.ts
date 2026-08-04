import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { ParametresService } from "./parametres.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { UserRole } from "@prisma/client";
import {
  CreateAssuranceDto,
  CreateBanqueDto,
  CreateTvaDto,
  GenerateLogoDto,
  UpdateEntrepriseDto,
  UpdateNumerotationDto,
  VerifyVatDto,
} from "./dto";
import { LogoGeneratorService } from "./logo-generator.service";
import { LogoCreditsService } from "./logo-credits.service";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("Paramètres")
@Controller("parametres")
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ParametresController {
  constructor(
    private parametresService: ParametresService,
    private logoGenerator: LogoGeneratorService,
    private logoCredits: LogoCreditsService,
  ) {}

  @Get("logo/ia/status")
  @Roles(UserRole.ADMIN)
  getLogoGeneratorStatus() {
    return this.logoGenerator.status();
  }

  @Post("logo/ia/generer")
  generateLogo(@CurrentUser("userId") userId: string, @Body() data: GenerateLogoDto) {
    return this.logoGenerator.generate(userId, data);
  }

  @Get("logo/credits")
  getLogoCredits(@CurrentUser("userId") userId: string) { return this.logoCredits.balance(userId); }

  @Get("logo/credits/historique")
  getLogoCreditHistory(@CurrentUser("userId") userId: string) { return this.logoCredits.history(userId); }

  @Get("entreprise")
  getEntreprise() {
    return this.parametresService.getEntreprise();
  }

  @Patch("entreprise")
  @Roles(UserRole.ADMIN)
  updateEntreprise(@Body() data: UpdateEntrepriseDto) {
    return this.parametresService.updateEntreprise(data);
  }

  @Get("numerotations")
  getNumerotations() {
    return this.parametresService.getNumerotations();
  }

  @Patch("numerotations/:type")
  @Roles(UserRole.ADMIN)
  updateNumerotation(
    @Param("type") type: string,
    @Body() data: UpdateNumerotationDto,
  ) {
    return this.parametresService.updateNumerotation(type, data);
  }

  @Get("tva")
  getTVAs() {
    return this.parametresService.getTVAs();
  }

  @Post("tva/verifier")
  verifyTVA(@Body() data: VerifyVatDto) {
    return this.parametresService.verifyTVA(data.numero);
  }

  @Post("tva")
  @Roles(UserRole.ADMIN, UserRole.COMPTABLE)
  createTVA(@Body() data: CreateTvaDto) {
    return this.parametresService.createTVA(data);
  }

  @Get("banques")
  getBanques() {
    return this.parametresService.getBanques();
  }

  @Post("banques")
  @Roles(UserRole.ADMIN, UserRole.COMPTABLE)
  createBanque(@Body() data: CreateBanqueDto) {
    return this.parametresService.createBanque(data);
  }

  @Get("assurances")
  getAssurances() {
    return this.parametresService.getAssurances();
  }

  @Post("assurances")
  @Roles(UserRole.ADMIN)
  createAssurance(@Body() data: CreateAssuranceDto) {
    return this.parametresService.createAssurance(data);
  }
}
