export interface ReviewInput {
  id: number;
  note: number;
  texte: string;
}

export interface SentimentResult {
  label: string;
  score: number;
  mots_cles: [string, number][];
}

export interface ThemeEntry {
  theme: string;
  mention_count: number;
  sentiment_dominant: string;
  intensite: string;
  score_agrege: number;
  citations?: string[];
}

export interface AvisAnalysis {
  avis_id: number;
  note_client: number;
  sentiment_global: string;
  score_confiance: number;
  points_forts: ThemeEntry[];
  points_faibles: ThemeEntry[];
  themes_principaux: ThemeEntry[];
  detail_phrases: {
    phrase: string;
    themes: string[];
    sentiment: string;
    score: number;
  }[];
}

export interface SyntheseGlobale {
  nb_avis_analyses: number;
  top_points_forts: { theme: string; mentions: number }[];
  top_points_faibles: { theme: string; mentions: number }[];
  themes_recurrents: {
    theme: string;
    mentions_pos: number;
    mentions_neg: number;
    score_net: number;
  }[];
  recommandation_prioritaire: string;
}

export interface DiagnosticData {
  meta: {
    version: string;
    methode: string;
    nb_avis: number;
  };
  synthese_globale: SyntheseGlobale;
  analyses_detaillees: AvisAnalysis[];
}

export interface OptimizedListing {
  meta: {
    version: string;
    date_generation: string;
    mode: string;
    langue: string;
    note_moyenne_source: number;
    nb_avis_source: number;
  };
  listing_optimise: {
    titre: string;
    accroche: string;
    description: string;
    bullets_points: string[];
    mots_cles_seo: string[];
  };
  recommandations_proprietaire: {
    action: string;
    detail: string;
    impact: string;
  }[];
  insights_utilises: {
    top_atouts: string[];
    top_problemes: string[];
    citations_forts: Record<string, string>;
    citations_faibles: Record<string, string>;
  };
}

export interface ApiResponse {
  success: boolean;
  diagnostic: DiagnosticData;
  optimized: OptimizedListing;
  error?: string;
}


export type PlanKey = "starter" | "pro";
