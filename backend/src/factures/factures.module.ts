import { Module } from '@nestjs/common';
import { FacturesService } from './factures.service';
import { FacturesController } from './factures.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RolesGuard } from '../common/guards/roles.guard';
import { PlateformeAgreeeConnector } from './plateforme-agreee.connector';
import { TransmissionsService } from './transmissions.service';
import { PlatformWebhookController } from './platform-webhook.controller';
import { PlatformWebhookVerifier } from './platform-webhook-verifier';

@Module({
  imports: [PrismaModule],
  controllers: [FacturesController, PlatformWebhookController],
  providers: [FacturesService, TransmissionsService, PlateformeAgreeeConnector, PlatformWebhookVerifier, RolesGuard],
})
export class FacturesModule {}
