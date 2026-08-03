import { BadRequestException } from '@nestjs/common';
import { calculateDocumentTotals } from './document-totals';

describe('calculateDocumentTotals', () => {
  it('recalcule les lignes et la TVA sans faire confiance au total reçu', () => {
    expect(calculateDocumentTotals([{ quantite: 2, prixUnitaireHt: 12.345, totalHt: 1 }], 20)).toEqual({
      normalizedLines: [{ quantite: 2, prixUnitaireHt: 12.345, totalHt: 24.69 }],
      totalHt: 24.69,
      totalTva: 4.94,
      totalTtc: 29.63,
    });
  });

  it('refuse une quantité nulle', () => {
    expect(() => calculateDocumentTotals([{ quantite: 0, prixUnitaireHt: 10 }])).toThrow(BadRequestException);
  });
});
