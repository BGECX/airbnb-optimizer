import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CanalTransmission, Prisma, TransmissionStatut } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { createInvoiceSnapshot } from './invoice-snapshot';
import { PlateformeAgreeeConnector } from './plateforme-agreee.connector';
import { PlatformCallbackDto, PlatformCallbackStatus } from './dto/platform-callback.dto';

@Injectable()
export class TransmissionsService {
  constructor(private readonly prisma: PrismaService, private readonly connector: PlateformeAgreeeConnector) {}

  async findOne(id: string) {
    const transmission = await this.prisma.transmissionElectronique.findUnique({
      where: { id },
      include: { tentatives: { orderBy: { createdAt: 'desc' } }, preuves: { orderBy: { receivedAt: 'desc' } } },
    });
    if (!transmission) throw new NotFoundException('Transmission électronique non trouvée');
    return transmission;
  }

  async send(id: string) {
    const transmission = await this.prisma.transmissionElectronique.findUnique({ where: { id } });
    if (!transmission) throw new NotFoundException('Transmission électronique non trouvée');
    if (transmission.canal !== CanalTransmission.PLATEFORME_AGREEE) throw new BadRequestException('Cette transmission n’est pas destinée à une plateforme agréée');
    if (transmission.statut !== TransmissionStatut.PREPAREE && transmission.statut !== TransmissionStatut.ERREUR) {
      throw new BadRequestException('Cette transmission est déjà en cours ou envoyée');
    }
    const claimed = await this.prisma.transmissionElectronique.updateMany({
      where: { id, statut: { in: [TransmissionStatut.PREPAREE, TransmissionStatut.ERREUR] } },
      data: { statut: TransmissionStatut.EN_COURS, erreur: null, lastAttemptAt: new Date(), attemptCount: { increment: 1 } },
    });
    if (claimed.count !== 1) throw new BadRequestException('Transmission déjà prise en charge');

    const startedAt = Date.now();
    try {
      const result = await this.connector.submit({ transmissionId: id, format: transmission.format, payloadHash: transmission.payloadHash, payload: transmission.payload });
      const { contentHash: empreinte } = createInvoiceSnapshot(result.receipt);
      return await this.prisma.$transaction(async (tx) => {
        await tx.tentativeTransmission.create({ data: { transmissionId: id, success: true, codeHttp: result.httpStatus, dureeMs: Date.now() - startedAt } });
        await tx.preuveTransmission.create({ data: { transmissionId: id, type: 'ACCUSE_DEPOT', empreinte, contenu: result.receipt as Prisma.InputJsonValue } });
        return tx.transmissionElectronique.update({
          where: { id },
          data: { statut: TransmissionStatut.ENVOYEE, provider: result.provider, identifiantExterne: result.externalId, sentAt: new Date() },
          include: { tentatives: true, preuves: true },
        });
      });
    } catch (error) {
      const message = error instanceof Error ? error.message.slice(0, 500) : 'Erreur de transmission';
      await this.prisma.$transaction([
        this.prisma.tentativeTransmission.create({ data: { transmissionId: id, success: false, erreur: message, dureeMs: Date.now() - startedAt } }),
        this.prisma.transmissionElectronique.update({ where: { id }, data: { statut: TransmissionStatut.ERREUR, erreur: message } }),
      ]);
      throw error;
    }
  }

  async recordCallback(eventId: string, dto: PlatformCallbackDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const transmission = await tx.transmissionElectronique.findUnique({ where: { identifiantExterne: dto.externalId } });
        if (!transmission) throw new NotFoundException('Transmission externe non reconnue');
        const { contentHash: empreinte } = createInvoiceSnapshot(dto);
        await tx.preuveTransmission.create({
          data: {
            transmissionId: transmission.id,
            type: `STATUT_${dto.status}`,
            empreinte,
            contenu: dto as unknown as Prisma.InputJsonValue,
            externalEventId: eventId,
            occurredAt: dto.occurredAt,
          },
        });
        if (transmission.statut === TransmissionStatut.ACCEPTEE && dto.status !== PlatformCallbackStatus.ACCEPTEE) {
          return { received: true, ignored: true, reason: 'Une transmission acceptée ne peut pas régresser' };
        }
        const nextStatus: Record<PlatformCallbackStatus, TransmissionStatut> = {
          ACCEPTEE: TransmissionStatut.ACCEPTEE,
          REJETEE: TransmissionStatut.REJETEE,
          ERREUR: TransmissionStatut.ERREUR,
        };
        await tx.transmissionElectronique.update({
          where: { id: transmission.id },
          data: {
            statut: nextStatus[dto.status],
            acknowledgedAt: new Date(dto.occurredAt),
            erreur: dto.status === PlatformCallbackStatus.ACCEPTEE ? null : JSON.stringify(dto.details ?? {}).slice(0, 500),
          },
        });
        return { received: true, transmissionId: transmission.id, statut: nextStatus[dto.status] };
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return { received: true, duplicate: true };
      throw error;
    }
  }
}
