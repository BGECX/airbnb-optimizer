import { Prisma } from '@prisma/client';

export type DocumentPrefix = 'D' | 'F' | 'CH' | 'AV';

export async function nextDocumentNumber(
  tx: Prisma.TransactionClient,
  prefix: DocumentPrefix,
  date = new Date(),
): Promise<string> {
  const year = date.getUTCFullYear();
  const key = `${prefix}-${year}`;
  const sequence = await tx.documentSequence.upsert({
    where: { key },
    create: { key, value: 1 },
    update: { value: { increment: 1 } },
  });
  return `${key}-${String(sequence.value).padStart(5, '0')}`;
}
