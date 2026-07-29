#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
POC NLP — Diagnostic d'avis Airbnb/Booking
10 avis -> JSON structuré (points forts, points faibles, thématiques)
Méthode : lexique FR + taxonomie métier (rapide, 0 dépendance lourde)
Option Transformers / OpenAI en commentaires
"""

import json
import re
from collections import defaultdict, Counter
from typing import List, Dict, Any

# ============================================================
# CONFIGURATION — Taxonomie métier & Lexique
# ============================================================

TAXONOMIE_THEMES = {
    "Propreté": ["propre", "propreté", "impeccable", "moisi", "moisissure", "sale", "draps", "vaisselle", "nettoyage", "hygiène", "poussière"],
    "Literie & Confort": ["lit", "literie", "drap", "oreiller", "matelas", "canapé-lit", "confortable", "inconfortable", "couchage", "dormir"],
    "Emplacement & Localisation": ["emplacement", "localisation", "situer", "situé", "centre", "quartier", "proximité", "à deux pas", "stratégique", "adresse"],
    "Wifi & Internet": ["wifi", "internet", "connexion", "débit", "réseau", "travailler à distance", "télétravail"],
    "Check-in & Accueil": ["check-in", "arrivée", "clé", "accès", "instruction", "accueil", "réactif", "disponible"],
    "Équipements & Cuisine": ["cuisine", "équipement", "machine à laver", "lave-linge", "frigo", "réfrigérateur", "micro-ondes", "cafetière", "vaisselle", "ustensile"],
    "Bruit & Calme": ["bruit", "silencieux", "calme", "tranquille", "rue", "infernal", "insonorisé", "boules Quiès"],
    "Climatisation & Chauffage": ["climatisation", "chauffage", "chaud", "froid", "température", "ventilateur", "radiateur"],
    "Hôte & Communication": ["hôte", "propriétaire", "répondre", "message", "sympathique", "adorable", "communication", "disponibilité"],
    "Rapport qualité-prix": ["rapport qualité-prix", "cher", "abordable", "prix", "économique", "bon marché", "coût"],
    "Transports & Accessibilité": ["métro", "bus", "transport", "gare", "autoroute", "parking", "marcher", "accessible"],
    "Décoration & Ambiance": ["décoration", "ambiance", "décor", "cosy", "charme", "moderne", "ancien", "lumineux"],
    "Extérieur & Vue": ["terrasse", "balcon", "vue", "jardin", "extérieur", "toit", "patio"]
}

MOTS_POSITIFS = {
    "parfait", "impeccable", "idéal", "excellent", "magnifique", "superbe", "génial", "magique",
    "adore", "adorable", "sympathique", "réactif", "rapide", "confortable", "propre", "spacieux",
    "fonctionnel", "équipé", "stratégique", "recommande", "pépite", "atout", "plus", "qualité",
    "irréprochable", "divin", "silencieux", "calme", "facile", "agréable", "beau", "belle", "bon",
    "bonne", "très bon", "parfaitement", "vivement", "ravie", "ravi", "satisfait", "content",
    "heureux", "préférée", "préféré"
}

MOTS_NEGATIFS = {
    "déçu", "déception", "catastrophe", "horrible", "affreux", "insuffisant", "chaotique",
    "sale", "moisi", "moisissure", "inconfortable", "bruit", "bruyant", "infernal", "capricieux",
    "ridicule", "mauvais", "mauvaise", "problème", "problèmes", "fuir", "éviter", "pas propre",
    "manquait", "manque", "absent", "froid", "insuffisant", "défectueux", "cassé", "lent",
    "impossible", "difficile", "pénible", "désagréable", "moyen", "correct sans plus", "bémol",
    "regret", "dommage", "mal", "mal desservi", "odeur", "sentait", "tabac"
}

INTENSIFIEURS = {
    "très": 1.5, "extrêmement": 2.0, "absolument": 2.0, "vraiment": 1.5, "trop": 1.5,
    "quasiment": 1.3, "totalement": 1.8, "complètement": 1.8, "super": 1.4,
    "vivement": 1.5, "ridicule": 1.5, "infernal": 2.0
}

NEGATIONS = {"pas", "non", "ne", "n'", "sans", "aucun", "aucune", "guère", "jamais", "plus"}


# ============================================================
# FONCTIONS UTILITAIRES
# ============================================================

def decouper_phrases(texte: str) -> List[str]:
    texte = re.sub(r'\s+', ' ', texte.strip())
    phrases = re.split(r'(?<=[.!?])\s+(?=[A-ZÉÈÀÙÇ])', texte)
    return [p.strip() for p in phrases if len(p.strip()) > 10]


def detecter_themes(phrase: str) -> List[str]:
    phrase_lower = phrase.lower()
    themes_trouves = []
    for theme, mots_cles in TAXONOMIE_THEMES.items():
        for mot in mots_cles:
            if mot.lower() in phrase_lower:
                themes_trouves.append(theme)
                break
    return themes_trouves


def analyser_sentiment_phrase(phrase: str) -> Dict[str, Any]:
    mots = re.findall(r"\b[\w']+\b", phrase.lower())
    score = 0.0
    mots_trouves = []

    i = 0
    while i < len(mots):
        mot = mots[i]
        coeff = 1.0

        if i > 0 and mots[i-1] in INTENSIFIEURS:
            coeff = INTENSIFIEURS[mots[i-1]]

        negation_active = any(m in NEGATIONS for m in mots[max(0, i-3):i])

        if mot in MOTS_POSITIFS:
            val = 1.0 * coeff
            if negation_active:
                val = -val
            score += val
            mots_trouves.append((mot, val))
        elif mot in MOTS_NEGATIFS:
            val = -1.0 * coeff
            if negation_active:
                val = -val
            score += val
            mots_trouves.append((mot, val))

        i += 1

    if score > 0.3:
        label = "positif"
    elif score < -0.3:
        label = "négatif"
    else:
        label = "neutre"

    score_normalise = max(-1.0, min(1.0, score / max(len(mots) * 0.1, 1)))

    return {
        "label": label,
        "score": round(score_normalise, 3),
        "mots_cles": mots_trouves
    }


def extraire_citations(texte: str, theme: str, sentiment: str) -> List[str]:
    phrases = decouper_phrases(texte)
    citations = []
    for phrase in phrases:
        themes = detecter_themes(phrase)
        if theme in themes:
            sent = analyser_sentiment_phrase(phrase)
            if sent["label"] == sentiment and len(phrase) > 15:
                citations.append(phrase)
    return citations[:3]


# ============================================================
# PIPELINE PRINCIPAL
# ============================================================

def analyser_avis(avis: Dict) -> Dict[str, Any]:
    texte = avis["texte"]
    phrases = decouper_phrases(texte)

    details_phrases = []
    compteur_themes = defaultdict(lambda: {"positif": 0, "négatif": 0, "neutre": 0, "score_total": 0.0})

    for phrase in phrases:
        themes = detecter_themes(phrase)
        sentiment = analyser_sentiment_phrase(phrase)

        details_phrases.append({
            "phrase": phrase,
            "themes": themes,
            "sentiment": sentiment["label"],
            "score": sentiment["score"]
        })

        for theme in themes:
            compteur_themes[theme][sentiment["label"]] += 1
            compteur_themes[theme]["score_total"] += sentiment["score"]

    points_forts = []
    points_faibles = []
    themes_principaux = []

    for theme, stats in sorted(compteur_themes.items(), key=lambda x: x[1]["score_total"], reverse=True):
        score_total = stats["score_total"]
        mention_count = stats["positif"] + stats["négatif"] + stats["neutre"]

        if stats["positif"] > stats["négatif"]:
            sent_dom = "positif"
        elif stats["négatif"] > stats["positif"]:
            sent_dom = "négatif"
        else:
            sent_dom = "neutre"

        if abs(score_total) > 1.5:
            intensite = "forte"
        elif abs(score_total) > 0.5:
            intensite = "moyenne"
        else:
            intensite = "faible"

        entry = {
            "theme": theme,
            "mention_count": mention_count,
            "sentiment_dominant": sent_dom,
            "intensite": intensite,
            "score_agrege": round(score_total, 2)
        }

        if sent_dom == "positif" and score_total > 0:
            entry["citations"] = extraire_citations(texte, theme, "positif")
            points_forts.append(entry)
        elif sent_dom == "négatif" and score_total < 0:
            entry["citations"] = extraire_citations(texte, theme, "négatif")
            points_faibles.append(entry)
        else:
            entry["citations"] = []

        themes_principaux.append(entry)

    scores = [d["score"] for d in details_phrases]
    score_moyen = sum(scores) / len(scores) if scores else 0

    if score_moyen > 0.2:
        sent_global = "positif"
    elif score_moyen < -0.2:
        sent_global = "négatif"
    else:
        sent_global = "mitigé"

    return {
        "avis_id": avis["id"],
        "note_client": avis["note"],
        "sentiment_global": sent_global,
        "score_confiance": round(abs(score_moyen), 3),
        "points_forts": points_forts[:5],
        "points_faibles": points_faibles[:5],
        "themes_principaux": sorted(themes_principaux, key=lambda x: abs(x["score_agrege"]), reverse=True)[:8],
        "detail_phrases": details_phrases
    }


def synthese_globale(analyses: List[Dict]) -> Dict[str, Any]:
    all_themes = defaultdict(lambda: {"positif": 0, "négatif": 0, "neutre": 0, "score": 0.0})
    all_points_forts = Counter()
    all_points_faibles = Counter()

    for ana in analyses:
        for pf in ana["points_forts"]:
            all_points_forts[pf["theme"]] += pf["mention_count"]
            all_themes[pf["theme"]]["positif"] += pf["mention_count"]
            all_themes[pf["theme"]]["score"] += pf["score_agrege"]
        for pfa in ana["points_faibles"]:
            all_points_faibles[pfa["theme"]] += pfa["mention_count"]
            all_themes[pfa["theme"]]["négatif"] += pfa["mention_count"]
            all_themes[pfa["theme"]]["score"] += pfa["score_agrege"]

    themes_rec = sorted(
        [{"theme": k, "mentions_pos": v["positif"], "mentions_neg": v["négatif"], "score_net": round(v["score"], 2)}
         for k, v in all_themes.items()],
        key=lambda x: abs(x["score_net"]),
        reverse=True
    )[:10]

    return {
        "nb_avis_analyses": len(analyses),
        "top_points_forts": [{"theme": k, "mentions": v} for k, v in all_points_forts.most_common(5)],
        "top_points_faibles": [{"theme": k, "mentions": v} for k, v in all_points_faibles.most_common(5)],
        "themes_recurrents": themes_rec,
        "recommandation_prioritaire": "Corriger : " + ", ".join([k for k, _ in all_points_faibles.most_common(3)]) if all_points_faibles else "Aucun point faible majeur détecté"
    }


# ============================================================
# DONNÉES DE TEST
# ============================================================

JEU_ESSAI = [
    {
        "id": 1,
        "note": 5,
        "texte": "Séjour absolument parfait ! L'appartement était d'une propreté impeccable, la literie de qualité hôtelière et l'emplacement idéal à deux pas du centre historique. L'hôte a été très réactif et sympathique. Je recommande vivement !"
    },
    {
        "id": 2,
        "note": 2,
        "texte": "Déçu par notre séjour. Le wifi ne fonctionnait quasiment pas, impossible de travailler à distance. La salle de bain avait une odeur de moisi et le chauffage était insuffisant en plein hiver. Le check-in a été chaotique car nous n'avons pas reçu les instructions à temps."
    },
    {
        "id": 3,
        "note": 4,
        "texte": "Très bon rapport qualité-prix. L'appartement est spacieux, bien équipé avec une cuisine fonctionnelle. Seul bémol : le bruit de la rue la nuit à cause des bars à proximité. Prévoyez des boules Quiès ! Sinon tout était parfait."
    },
    {
        "id": 4,
        "note": 1,
        "texte": "Catastrophe. L'appartement ne correspondait pas aux photos, il y avait des traces de moisissure dans la douche et les draps n'étaient pas propres. Nous avons dû changer d'hôtel au bout d'une nuit. Le propriétaire n'a même pas daigné répondre à nos messages. À fuir."
    },
    {
        "id": 5,
        "note": 5,
        "texte": "Une pépite ! La décoration est magnifique, on se sent comme chez soi. La terrasse avec vue sur les toits est un vrai plus. Emplacement stratégique pour visiter la ville à pied. Hôte adorable qui nous a donné plein de bonnes adresses. Nous reviendrons sans hésiter."
    },
    {
        "id": 6,
        "note": 3,
        "texte": "Séjour moyen. L'appartement est bien situé et la climatisation fonctionne bien, ce qui est appréciable en été. En revanche, la vaisselle était sale à notre arrivée et il manquait du papier toilette. Le canapé-lit est vraiment inconfortable pour deux adultes."
    },
    {
        "id": 7,
        "note": 4,
        "texte": "Excellente localisation dans un quartier vivant mais calme. Le logement est fonctionnel et propre. Le wifi est rapide, parfait pour le télétravail. Le lit principal est confortable. Petit regret : pas de machine à laver alors que c'était indiqué dans l'annonce."
    },
    {
        "id": 8,
        "note": 2,
        "texte": "Pas à la hauteur des attentes. Le quartier est mal desservi par les transports en commun, il faut marcher 20 minutes pour trouver un métro. L'appartement sentait le tabac froid. La douche avait une pression d'eau ridicule. Le propriétaire a mis 3 heures à répondre quand la clé ne fonctionnait pas."
    },
    {
        "id": 9,
        "note": 5,
        "texte": "Séjour magique ! L'hôte a pensé à tous les détails : café, thé, guide personnalisé, adaptateurs de prise. La propreté est irréprochable, la literie divine et le silence absolu la nuit. Emplacement parfait entre la gare et le centre. C'est devenu notre adresse préférée dans cette ville."
    },
    {
        "id": 10,
        "note": 3,
        "texte": "Correct sans plus. Le logement est grand et bien agencé, mais le chauffage fait un bruit infernal toute la nuit. La connexion internet est capricieuse. Par contre le parking privatif est un vrai atout et l'accès est très facile depuis l'autoroute."
    }
]


# ============================================================
# EXÉCUTION
# ============================================================

if __name__ == "__main__":
    print("=" * 60)
    print("POC NLP — Diagnostic d'avis Airbnb/Booking")
    print("=" * 60)

    analyses = []
    for avis in JEU_ESSAI:
        resultat = analyser_avis(avis)
        analyses.append(resultat)
        print(f"\nAvis #{avis['id']} (Note: {avis['note']}/5) — Sentiment: {resultat['sentiment_global'].upper()}")
        print(f"   Points forts  : {[p['theme'] for p in resultat['points_forts']]}")
        print(f"   Points faibles: {[p['theme'] for p in resultat['points_faibles']]}")

    synthese = synthese_globale(analyses)

    output_final = {
        "meta": {
            "version": "1.0-poc",
            "methode": "lexique_fr + taxonomie_metier",
            "nb_avis": len(JEU_ESSAI)
        },
        "synthese_globale": synthese,
        "analyses_detaillees": analyses
    }

    with open("diagnostic_avis.json", "w", encoding="utf-8") as f:
        json.dump(output_final, f, ensure_ascii=False, indent=2)

    print("\n" + "=" * 60)
    print("SYNTHÈSE GLOBALE")
    print("=" * 60)
    print(f"Avis analysés      : {synthese['nb_avis_analyses']}")
    print(f"Top points forts   : {synthese['top_points_forts']}")
    print(f"Top points faibles : {synthese['top_points_faibles']}")
    print(f"Priorité action    : {synthese['recommandation_prioritaire']}")
    print(f"\nExport JSON complet : diagnostic_avis.json")
