import { Module } from "@nestjs/common";
import { ParametresService } from "./parametres.service";
import { ParametresController } from "./parametres.controller";
import { PrismaModule } from "../prisma/prisma.module";
import { LogoGeneratorService } from "./logo-generator.service";

@Module({
  imports: [PrismaModule],
  controllers: [ParametresController],
  providers: [ParametresService, LogoGeneratorService],
})
export class ParametresModule {}
