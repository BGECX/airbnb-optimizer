import { Module } from "@nestjs/common";
import { BoutiqueController } from "./boutique.controller";
import { BoutiqueService } from "./boutique.service";
import { GelatoConnector } from "./gelato.connector";

@Module({ controllers: [BoutiqueController], providers: [BoutiqueService, GelatoConnector] })
export class BoutiqueModule {}
