import { BadRequestException } from '@nestjs/common';

export type PriceLine = { quantite: number; prixUnitaireHt: number; totalHt?: number };

export function calculateDocumentTotals<T extends PriceLine>(lines: T[], vatRate = 20) {
  if (!lines.length) throw new BadRequestException('Au moins une ligne est obligatoire');
  if (vatRate < 0 || vatRate > 100) throw new BadRequestException('Taux de TVA invalide');

  const normalizedLines = lines.map((line) => {
    if (line.quantite <= 0 || line.prixUnitaireHt < 0) {
      throw new BadRequestException('Quantité ou prix invalide');
    }
    return { ...line, totalHt: roundMoney(line.quantite * line.prixUnitaireHt) };
  });
  const totalHt = roundMoney(normalizedLines.reduce((sum, line) => sum + line.totalHt, 0));
  const totalTva = roundMoney(totalHt * (vatRate / 100));
  return { normalizedLines, totalHt, totalTva, totalTtc: roundMoney(totalHt + totalTva) };
}

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
