import { analyseDpgf, rankOuvrages } from './chiffrage-engine';

describe('chiffrage engine', () => {
  it('détecte un diagnostic urgent non chiffré et un total incohérent', () => {
    const result = analyseDpgf([{ id: '1', code: '01', designation: 'Peinture', quantite: 2, prixUnitaireHt: 10, debourseUnitaire: 8, coefficientVente: 1.25, totalVenteHt: 10, isSelected: true }], [{ element: 'MURS_PIERRE', zone: 'Cave', pathologie: 'Fissure', urgence: true }]);
    expect(result.alertes.map((item) => item.code)).toEqual(expect.arrayContaining(['TOTAL_INCOHERENT', 'DIAGNOSTIC_NON_CHIFFRE']));
  });
  it('classe les ouvrages par recouvrement lexical', () => {
    expect(rankOuvrages('enduit chaux mur', [{ id: '1', reference: 'END', designation: 'Enduit traditionnel à la chaux', categorie: 'Façade' }])[0].score).toBeGreaterThan(50);
  });
});
