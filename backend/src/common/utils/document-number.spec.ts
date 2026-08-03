import { nextDocumentNumber } from './document-number';

describe('nextDocumentNumber', () => {
  it('incrémente atomiquement une séquence annuelle', async () => {
    const upsert = jest.fn().mockResolvedValue({ key: 'F-2026', value: 42 });
    const tx = { documentSequence: { upsert } } as never;

    await expect(nextDocumentNumber(tx, 'F', new Date('2026-12-31T23:00:00Z'))).resolves.toBe('F-2026-00042');
    expect(upsert).toHaveBeenCalledWith({
      where: { key: 'F-2026' },
      create: { key: 'F-2026', value: 1 },
      update: { value: { increment: 1 } },
    });
  });

  it('sépare les séquences devis et facture', async () => {
    const upsert = jest.fn().mockResolvedValue({ key: 'D-2027', value: 1 });
    const tx = { documentSequence: { upsert } } as never;

    await expect(nextDocumentNumber(tx, 'D', new Date('2027-01-01T00:00:00Z'))).resolves.toBe('D-2027-00001');
  });

  it('génère aussi les références chantier', async () => {
    const upsert = jest.fn().mockResolvedValue({ key: 'CH-2026', value: 7 });
    const tx = { documentSequence: { upsert } } as never;
    await expect(nextDocumentNumber(tx, 'CH', new Date('2026-08-02T00:00:00Z'))).resolves.toBe('CH-2026-00007');
  });
});
