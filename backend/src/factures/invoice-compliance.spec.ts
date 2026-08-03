import { checkInvoiceCompliance } from './invoice-compliance';

describe('checkInvoiceCompliance', () => {
  it('accepte un dossier minimal complet', () => {
    expect(checkInvoiceCompliance({ entreprise: { raisonSociale: 'KRITIA', siret: '123', adresse: 'Paris' }, client: { nom: 'Client', adresse: 'Lyon' }, facture: { numero: 'F-1', objet: 'Travaux', dateEcheance: new Date(), lignes: [{}], totalTtc: 120 } })).toEqual([]);
  });
  it('énumère les données absentes sans produire un faux Factur-X', () => {
    expect(checkInvoiceCompliance({ facture: {} })).toContain('SIRET émetteur manquant');
  });
});
