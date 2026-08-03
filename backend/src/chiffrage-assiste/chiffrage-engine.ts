export type Finding = { niveau: 'BLOQUANT' | 'ALERTE' | 'INFO'; code: string; message: string; posteId?: string };
type Poste = { id: string; code: string; designation: string; quantite: unknown; prixUnitaireHt: unknown; debourseUnitaire: unknown; coefficientVente: unknown; totalVenteHt: unknown; isSelected: boolean; ouvrageId?: string | null };
type Diagnostic = { element: string; zone: string; pathologie: string; urgence: boolean };

const ELEMENT_KEYWORDS: Record<string, string[]> = {
  FONDATIONS: ['fondation', 'sous-oeuvre', 'sous oeuvre'], MURS_PIERRE: ['pierre', 'moellon', 'jointoiement'],
  MACONNERIE: ['maçonnerie', 'maconnerie', 'reprise'], ENDUITS_CHAUX: ['chaux', 'enduit'],
  CHARPENTE: ['charpente', 'poutre'], PLANCHER: ['plancher', 'solive'], COUVERTURE: ['couverture', 'toiture'],
  FACADE: ['façade', 'facade'], MENUISERIE: ['menuiserie', 'fenêtre', 'fenetre'], HUMIDITE: ['humidité', 'humidite', 'drainage', 'ventilation'],
  RESEAUX: ['réseau', 'reseau', 'électricité', 'electricite', 'plomberie'],
};

export function analyseDpgf(postes: Poste[], diagnostics: Diagnostic[]) {
  const alertes: Finding[] = [];
  const selected = postes.filter((poste) => poste.isSelected);
  if (!selected.length) alertes.push({ niveau: 'BLOQUANT', code: 'DPGF_VIDE', message: 'Aucun poste sélectionné' });
  const seen = new Map<string, string>();
  for (const poste of selected) {
    const quantity = Number(poste.quantite); const price = Number(poste.prixUnitaireHt); const cost = Number(poste.debourseUnitaire); const coefficient = Number(poste.coefficientVente);
    if (quantity <= 0) alertes.push({ niveau: 'BLOQUANT', code: 'QUANTITE_NULLE', message: `${poste.code} : quantité nulle`, posteId: poste.id });
    if (price <= 0) alertes.push({ niveau: 'BLOQUANT', code: 'PRIX_NUL', message: `${poste.code} : prix de vente nul`, posteId: poste.id });
    if (coefficient < 1) alertes.push({ niveau: 'ALERTE', code: 'VENTE_SOUS_DEBOURSE', message: `${poste.code} : coefficient inférieur à 1`, posteId: poste.id });
    if (price > 0 && cost >= 0) {
      const marginRate = ((price - cost) / price) * 100;
      if (marginRate < 5) alertes.push({ niveau: 'ALERTE', code: 'MARGE_FAIBLE', message: `${poste.code} : marge inférieure à 5 %`, posteId: poste.id });
      if (marginRate > 80) alertes.push({ niveau: 'ALERTE', code: 'MARGE_ATYPIQUE', message: `${poste.code} : marge supérieure à 80 %`, posteId: poste.id });
    }
    if (Math.abs(Number(poste.totalVenteHt) - quantity * price) > 0.02) alertes.push({ niveau: 'BLOQUANT', code: 'TOTAL_INCOHERENT', message: `${poste.code} : total différent de quantité × prix`, posteId: poste.id });
    const normalized = normalize(poste.designation);
    if (seen.has(normalized)) alertes.push({ niveau: 'ALERTE', code: 'DOUBLON', message: `${poste.code} ressemble à un autre poste`, posteId: poste.id });
    else seen.set(normalized, poste.id);
  }
  const corpus = selected.map((poste) => normalize(`${poste.code} ${poste.designation}`)).join(' ');
  for (const diagnostic of diagnostics) {
    const keywords = ELEMENT_KEYWORDS[diagnostic.element] ?? [];
    if (keywords.length && !keywords.some((keyword) => corpus.includes(normalize(keyword)))) {
      alertes.push({ niveau: diagnostic.urgence ? 'BLOQUANT' : 'ALERTE', code: 'DIAGNOSTIC_NON_CHIFFRE', message: `${diagnostic.zone} : aucun poste identifié pour ${diagnostic.element} (${diagnostic.pathologie})` });
    }
  }
  const scoreCompletude = Math.max(0, 100 - alertes.reduce((score, item) => score + (item.niveau === 'BLOQUANT' ? 20 : item.niveau === 'ALERTE' ? 5 : 0), 0));
  return { alertes, scoreCompletude };
}

export function rankOuvrages(query: string, ouvrages: Array<{ id: string; reference: string; designation: string; categorie?: string | null }>, limit = 10) {
  const queryTokens = new Set(normalize(query).split(' ').filter((token) => token.length > 2));
  return ouvrages.map((ouvrage) => {
    const text = new Set(normalize(`${ouvrage.reference} ${ouvrage.designation} ${ouvrage.categorie ?? ''}`).split(' '));
    const matches = [...queryTokens].filter((token) => text.has(token)).length;
    return { ...ouvrage, score: queryTokens.size ? Math.round(matches / queryTokens.size * 100) : 0 };
  }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score).slice(0, limit);
}

function normalize(value: string) { return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); }
