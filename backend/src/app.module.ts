import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { DevisModule } from './devis/devis.module';
import { FacturesModule } from './factures/factures.module';
import { ChantiersModule } from './chantiers/chantiers.module';
import { TachesGanttModule } from './taches-gantt/taches-gantt.module';
import { PhotosModule } from './photos/photos.module';
import { PersonnelModule } from './personnel/personnel.module';
import { ParametresModule } from './parametres/parametres.module';
import { CoproprietesModule } from './coproprietes/coproprietes.module';
import { AchatsModule } from './achats/achats.module';
import { BanqueModule } from './banque/banque.module';
import { ComptabiliteModule } from './comptabilite/comptabilite.module';
import { DpgfModule } from './dpgf/dpgf.module';
import { BibliothequeModule } from './bibliotheque/bibliotheque.module';
import { RenovationModule } from './renovation/renovation.module';
import { CommercialModule } from './commercial/commercial.module';
import { PilotageModule } from './pilotage/pilotage.module';
import { CompagnonModule } from './compagnon/compagnon.module';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { ChiffrageAssisteModule } from './chiffrage-assiste/chiffrage-assiste.module';
import { HealthModule } from './health/health.module';
import { RedisModule } from './redis/redis.module';
import { ObservabilityModule } from './observability/observability.module';
import { RequestObservabilityInterceptor } from './observability/request-observability.interceptor';
import { ApporteursModule } from './apporteurs/apporteurs.module';

function validateEnvironment(config: Record<string, unknown>) {
  const secret = String(config.JWT_SECRET || '');
  if (secret.length < 32) throw new Error('JWT_SECRET doit contenir au moins 32 caractères');
  if (!config.DATABASE_URL) throw new Error('DATABASE_URL est obligatoire');
  if (config.REDIS_URL) {
    const redisUrl = new URL(String(config.REDIS_URL));
    if (!['redis:', 'rediss:'].includes(redisUrl.protocol)) throw new Error('REDIS_URL doit utiliser redis:// ou rediss://');
  }
  if (config.PA_SUBMIT_URL || config.PA_API_KEY || config.PA_PROVIDER_NAME) {
    if (!config.PA_SUBMIT_URL || !config.PA_API_KEY || !config.PA_PROVIDER_NAME) throw new Error('PA_SUBMIT_URL, PA_API_KEY et PA_PROVIDER_NAME doivent être configurés ensemble');
    const url = new URL(String(config.PA_SUBMIT_URL));
    if (url.protocol !== 'https:' && !['localhost', '127.0.0.1'].includes(url.hostname)) throw new Error('PA_SUBMIT_URL doit utiliser HTTPS');
  }
  if (config.PA_WEBHOOK_SECRET && String(config.PA_WEBHOOK_SECRET).length < 32) throw new Error('PA_WEBHOOK_SECRET doit contenir au moins 32 caractères');
  if (config.METRICS_TOKEN && String(config.METRICS_TOKEN).length < 32) throw new Error('METRICS_TOKEN doit contenir au moins 32 caractères');
  if (config.SMTP_HOST || config.SMTP_USER || config.SMTP_PASSWORD) {
    if (!config.SMTP_HOST || !config.SMTP_USER || !config.SMTP_PASSWORD) throw new Error('SMTP_HOST, SMTP_USER et SMTP_PASSWORD doivent être configurés ensemble');
  }
  if (config.PUBLIC_APP_URL && new URL(String(config.PUBLIC_APP_URL)).protocol !== 'https:') throw new Error('PUBLIC_APP_URL doit utiliser HTTPS');
  return config;
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
    PrismaModule,
    RedisModule,
    ObservabilityModule,
    AuthModule,
    UsersModule,
    ClientsModule,
    ApporteursModule,
    DevisModule,
    FacturesModule,
    ChantiersModule,
    TachesGanttModule,
    PhotosModule,
    PersonnelModule,
    ParametresModule,
    CoproprietesModule,
    AchatsModule,
    BanqueModule,
    ComptabiliteModule,
    DpgfModule,
    BibliothequeModule,
    RenovationModule,
    CommercialModule,
    PilotageModule,
    CompagnonModule,
    ChiffrageAssisteModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: RequestObservabilityInterceptor },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
  ],
})
export class AppModule {}
