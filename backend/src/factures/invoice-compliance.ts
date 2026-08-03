export function checkInvoiceCompliance(input: {
  entreprise?: { raisonSociale?: string; siret?: string; adresse?: string; tvaIntra?: string | null } | null;
  client?: { nom?: string; adresse?: string | null; siret?: string | null } | null;
  facture: { numero?: string; objet?: string; dateEcheance?: Date | string; datePrestation?: Date | string | null; adresseFacturation?: string | null; lignes?: unknown[]; totalTtc?: unknown };
}) {
  const errors: string[] = [];
  if (!input.entreprise?.raisonSociale) errors.push('raison sociale émetteur manquante');
  if (!input.entreprise?.siret) errors.push('SIRET émetteur manquant');
  if (!input.entreprise?.adresse) errors.push('adresse émetteur manquante');
  if (!input.client?.nom) errors.push('nom client manquant');
  if (!input.client?.adresse && !input.facture.adresseFacturation) errors.push('adresse de facturation client manquante');
  if (!input.facture.numero) errors.push('numéro de facture manquant');
  if (!input.facture.objet) errors.push('objet manquant');
  if (!input.facture.dateEcheance) errors.push('date d’échéance manquante');
  if (!input.facture.lignes?.length) errors.push('aucune ligne de facture');
  if (Number(input.facture.totalTtc) < 0) errors.push('total TTC invalide');
  return errors;
}
