import { ConflictException, HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { LogoCreditTransactionType, LogoGenerationStatus, Prisma } from "@prisma/client";
import { createHash } from "crypto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class LogoCreditsService {
  private static readonly WELCOME_CREDITS = 3;
  private static readonly PILOT_CREDITS = 10;

  constructor(private prisma: PrismaService) {}

  async balance(userId: string) {
    return this.prisma.$transaction(async (tx) => {
      let account = await tx.logoCreditAccount.upsert({
        where: { userId },
        update: {},
        create: { userId, balance: LogoCreditsService.WELCOME_CREDITS },
      });

      await tx.logoCreditTransaction.createMany({
        data: [{
          userId,
          amount: LogoCreditsService.WELCOME_CREDITS,
          type: LogoCreditTransactionType.WELCOME,
          reference: `welcome:${userId}`,
          description: "Crédits de bienvenue",
          balanceAfter: account.balance,
        }],
        skipDuplicates: true,
      });

      const pilotReference = `pilot-bonus-2026:${userId}`;
      const created = await tx.logoCreditTransaction.createMany({
        data: [{
          userId,
          amount: LogoCreditsService.PILOT_CREDITS,
          type: LogoCreditTransactionType.ADMIN_ADJUSTMENT,
          reference: pilotReference,
          description: "Bonus pilote KRITIA — essais du générateur de logo",
          balanceAfter: account.balance,
        }],
        skipDuplicates: true,
      });

      if (created.count === 1) {
        account = await tx.logoCreditAccount.update({
          where: { userId },
          data: { balance: { increment: LogoCreditsService.PILOT_CREDITS } },
        });
        await tx.logoCreditTransaction.update({
          where: { reference: pilotReference },
          data: { balanceAfter: account.balance },
        });
      }

      return {
        balance: account.balance,
        includedOnSignup: LogoCreditsService.WELCOME_CREDITS,
        pilotBonus: LogoCreditsService.PILOT_CREDITS,
      };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }

  async history(userId: string) {
    await this.balance(userId);
    return this.prisma.logoCreditTransaction.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 100 });
  }

  async reserve(userId: string, prompt: string, cost = 1) {
    await this.balance(userId);
    return this.prisma.$transaction(async (tx) => {
      const changed = await tx.logoCreditAccount.updateMany({ where: { userId, balance: { gte: cost } }, data: { balance: { decrement: cost } } });
      if (changed.count !== 1) throw new HttpException("Crédits logo insuffisants.", HttpStatus.PAYMENT_REQUIRED);
      const account = await tx.logoCreditAccount.findUniqueOrThrow({ where: { userId } });
      const generation = await tx.logoGeneration.create({ data: { userId, provider: "OPENAI", model: "gpt-image-2", promptDigest: createHash("sha256").update(prompt).digest("hex"), creditCost: cost } });
      await tx.logoCreditTransaction.create({ data: { userId, amount: -cost, type: LogoCreditTransactionType.GENERATION, reference: `generation:${generation.id}`, description: "Réservation d'une génération IA", balanceAfter: account.balance } });
      return { generationId: generation.id, balance: account.balance };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }

  async complete(userId: string, generationId: string) {
    const result = await this.prisma.logoGeneration.updateMany({ where: { id: generationId, userId, status: LogoGenerationStatus.RESERVED }, data: { status: LogoGenerationStatus.COMPLETED, completedAt: new Date() } });
    if (result.count !== 1) throw new ConflictException("La génération n'est plus réservable.");
  }

  async refund(userId: string, generationId: string, errorCode: string) {
    return this.prisma.$transaction(async (tx) => {
      const generation = await tx.logoGeneration.findFirst({ where: { id: generationId, userId } });
      if (!generation) throw new NotFoundException("Génération inconnue.");
      if (generation.status !== LogoGenerationStatus.RESERVED) return;
      await tx.logoGeneration.update({ where: { id: generationId }, data: { status: LogoGenerationStatus.REFUNDED, errorCode, completedAt: new Date() } });
      const account = await tx.logoCreditAccount.update({ where: { userId }, data: { balance: { increment: generation.creditCost } } });
      await tx.logoCreditTransaction.create({ data: { userId, amount: generation.creditCost, type: LogoCreditTransactionType.REFUND, reference: `refund:${generationId}`, description: "Remboursement automatique après échec IA", balanceAfter: account.balance } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }
}
