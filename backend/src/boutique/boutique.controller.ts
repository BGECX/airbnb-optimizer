import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { BoutiqueService } from "./boutique.service";
import { CompareSupplierQuotesDto } from "./dto";

@ApiTags("Boutique publicitaire")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("boutique")
export class BoutiqueController {
  constructor(private boutique: BoutiqueService) {}
  @Get("status") status() { return this.boutique.status(); }
  @Get("catalogue") catalog() { return this.boutique.catalog(); }
  @Post("devis/comparer")
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  compare(@Body() dto: CompareSupplierQuotesDto) { return this.boutique.compare(dto); }
}
