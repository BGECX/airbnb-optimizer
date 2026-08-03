import { createInvoiceSnapshot } from './invoice-snapshot';

describe('createInvoiceSnapshot', () => {
  it('produit la même empreinte indépendamment de l’ordre des propriétés', () => {
    const first = createInvoiceSnapshot({ total: 120, client: { nom: 'A', id: '1' } });
    const second = createInvoiceSnapshot({ client: { id: '1', nom: 'A' }, total: 120 });
    expect(first.contentHash).toBe(second.contentHash);
  });

  it('détecte toute modification du contenu', () => {
    expect(createInvoiceSnapshot({ total: 120 }).contentHash).not.toBe(createInvoiceSnapshot({ total: 121 }).contentHash);
  });
});
