#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
FastAPI Backend — Airbnb Optimizer
Routes:
  POST /analyze  → Diagnostic + Description optimisée
  GET  /health   → Health check
"""

import json
import re
import random
from collections import defaultdict, Counter
from datetime import datetime
from typing import List, Dict, Any, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="Airbnb Optimizer API",
    version="1.0.0",
    description="NLP pipeline + Listing generator for Airbnb/Booking reviews",
)

# CORS — autorise le front Next.js (port 3000) et tout autre origin en dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# MODÈLES PYDANTIC
# ============================================================

class ReviewInput(BaseModel):
    id: int
    note: int
    texte: str

class AnalyzeRequest(BaseModel):
    reviews: List[ReviewInput]
    langue: Optional[str] = "fr"
    logement_info: Optional[Dict[str, Any]] = None


# ============================================================
# CONFIGURATION NLP — Taxonomie & Lexique
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
# FONCTIONS NLP
# ============================================================

def decouper_phrases(texte: str) -> List[str]:
    texte = re.sub(r"\s+", " ", texte.strip())
    phrases = re.split(r"(?<=[.!?])\s+(?=[A-ZÉÈÀÙÇ])", texte)
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
    mots = re.findall(r"[\w']+", phrase.lower())
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
    return {"label": label, "score": round(score_normalise, 3), "mots_cles": mots_trouves}


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


def analyser_avis(avis: Dict) -> Dict[str, Any]:
    texte = avis["texte"]
    phrases = decouper_phrases(texte)
    details_phrases = []
    compteur_themes = defaultdict(lambda: {"positif": 0, "négatif": 0, "neutre": 0, "score_total": 0.0})
    for phrase in phrases:
        themes = detecter_themes(phrase)
        sentiment = analyser_sentiment_phrase(phrase)
        details_phrases.append({"phrase": phrase, "themes": themes, "sentiment": sentiment["label"], "score": sentiment["score"]})
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
        entry = {"theme": theme, "mention_count": mention_count, "sentiment_dominant": sent_dom, "intensite": intensite, "score_agrege": round(score_total, 2)}
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
        key=lambda x: abs(x["score_net"]), reverse=True
    )[:10]
    return {
        "nb_avis_analyses": len(analyses),
        "top_points_forts": [{"theme": k, "mentions": v} for k, v in all_points_forts.most_common(5)],
        "top_points_faibles": [{"theme": k, "mentions": v} for k, v in all_points_faibles.most_common(5)],
        "themes_recurrents": themes_rec,
        "recommandation_prioritaire": "Corriger : " + ", ".join([k for k, _ in all_points_faibles.most_common(3)]) if all_points_faibles else "Aucun point faible majeur détecté"
    }


# ============================================================
# GÉNÉRATEUR DE DESCRIPTION
# ============================================================

TEMPLATES_TITRE = [
    "{type} {charme} en plein {quartier} — {atout_principal}",
    "{type} {qualite} avec {atout_principal} | {quartier}",
    "Séjour {adjectif} dans un {type} {quartier} — {atout_principal}",
    "{type} {standing} · {atout_principal} · {quartier}"
]

TEMPLATES_ACCROCHE = [
    "Bienvenue dans ce {type} {adjectif} situé {localisation}, où {promesse}.",
    "Découvrez ce {type} {qualite} en plein {quartier}. {promesse} pour un séjour inoubliable.",
    "Idéalement situé {localisation}, ce {type} {adjectif} vous offre {promesse}."
]

TEMPLATES_PARAGRAPHES = {
    "emplacement": [
        "L'emplacement est tout simplement {adjectif_emplacement}. Vous êtes à deux pas {detail_emplacement}, avec accès facile aux transports et aux commerces.",
        "Situé en plein {quartier}, ce logement vous place au cœur de l'action. {detail_emplacement} sont accessibles à pied en quelques minutes."
    ],
    "interieur": [
        "À l'intérieur, tout a été pensé pour votre confort. {detail_interieur}.",
        "Le {type} allie {style} et fonctionnalité. {detail_interieur}, pour vous sentir comme chez vous dès votre arrivée."
    ],
    "equipements": [
        "Vous disposez de {liste_equipements}, ainsi que d'une connexion Wi-Fi haut débit idéale pour le télétravail.",
        "Côté équipements, rien ne manque : {liste_equipements} et une connexion internet fiable et rapide."
    ],
    "hote": [
        "Votre hôte est réactif et attentionné, toujours disponible pour vous conseiller les meilleures adresses de {ville}.",
        "L'accueil est chaleureux et personnalisé. Votre hôte connaît {ville} sur le bout des doigts et partage volontiers ses bons plans."
    ],
    "confort": [
        "La literie de qualité hôtelière et le calme absolu garantissent des nuits réparatrices.",
        "Après une journée de visite, profitez d'un intérieur calme et d'une literie premium pour vous ressourcer."
    ]
}


def choisir_template(templates: List[str]) -> str:
    return random.choice(templates)


def generer_titre(insights: Dict, info: Dict) -> str:
    atout = insights["atouts"][0] if insights["atouts"] else "confort optimal"
    atout_court = atout.split(" & ")[0] if " & " in atout else atout
    ctx = {
        "type": info["type"].capitalize(),
        "charme": "charmant",
        "quartier": info["quartier"],
        "atout_principal": atout_court.lower(),
        "qualite": "de qualité",
        "adjectif": "cosy",
        "standing": "premium"
    }
    return choisir_template(TEMPLATES_TITRE).format(**ctx)


def generer_accroche(insights: Dict, info: Dict) -> str:
    promesse = "confort et authenticité"
    if "Emplacement" in str(insights["atouts"]):
        promesse = "une localisation idéale pour explorer la ville à pied"
    elif "Propreté" in str(insights["atouts"]):
        promesse = "une propreté irréprochable et un cadre soigné"
    ctx = {
        "type": info["type"],
        "adjectif": "cosy",
        "qualite": "soigneusement aménagé",
        "quartier": info["quartier"],
        "localisation": "en plein " + info["quartier"],
        "promesse": promesse
    }
    return choisir_template(TEMPLATES_ACCROCHE).format(**ctx)


def generer_corps(insights: Dict, info: Dict) -> str:
    paragraphes = []
    if any("Emplacement" in a or "Localisation" in a for a in insights["atouts"]):
        detail = "des monuments historiques, des restaurants et des transports"
        if "Transports" in str(insights["atouts"]):
            detail += ", à quelques minutes de la gare"
        ctx = {"adjectif_emplacement": "stratégique", "detail_emplacement": detail, "quartier": info["quartier"]}
        paragraphes.append(choisir_template(TEMPLATES_PARAGRAPHES["emplacement"]).format(**ctx))
    style = "charme ancien et modernité"
    if "Décoration" in str(insights["atouts"]):
        style = "une décoration soignée et personnalisée"
    detail_int = "Les espaces sont spacieux (" + info["surface"] + "), lumineux et parfaitement agencés"
    if "Literie" in str(insights["atouts"]):
        detail_int += ", avec une literie hôtelière pour des nuits réparatrices"
    ctx = {"type": info["type"], "style": style, "detail_interieur": detail_int}
    paragraphes.append(choisir_template(TEMPLATES_PARAGRAPHES["interieur"]).format(**ctx))
    equipements = ["cuisine équipée", "Wi-Fi haut débit"]
    if "Équipements" in str(insights["atouts"]):
        equipements.append("tous les équipements essentiels")
    if "Extérieur" in str(insights["atouts"]) or "Vue" in str(insights["atouts"]):
        equipements.append("une terrasse avec vue panoramique")
    if "parking" in str(insights["atouts"]).lower():
        equipements.append("un parking privatif")
    ctx = {"liste_equipements": ", ".join(equipements[:-1]) + " et " + equipements[-1]}
    paragraphes.append(choisir_template(TEMPLATES_PARAGRAPHES["equipements"]).format(**ctx))
    if "Hôte" in str(insights["atouts"]):
        ctx = {"ville": info["ville"].capitalize()}
        paragraphes.append(choisir_template(TEMPLATES_PARAGRAPHES["hote"]).format(**ctx))
    if "Bruit" not in str(insights["problemes"]) and ("Literie" in str(insights["atouts"]) or "Confort" in str(insights["atouts"])):
        paragraphes.append(choisir_template(TEMPLATES_PARAGRAPHES["confort"]))
    return "\n\n".join(paragraphes)


def generer_bullets(insights: Dict, info: Dict) -> List[str]:
    bullets = []
    if any("Emplacement" in a for a in insights["atouts"]):
        bullets.append("Emplacement central : à deux pas du centre historique et des transports")
    if "Propreté" in str(insights["atouts"]):
        bullets.append("Propreté irréprochable garantie à chaque séjour")
    if "Wifi" in str(insights["atouts"]):
        bullets.append("Wi-Fi fibre haut débit — idéal pour télétravailler en toute sérénité")
    if "Literie" in str(insights["atouts"]):
        bullets.append("Literie hôtelière premium pour des nuits réparatrices")
    if "Hôte" in str(insights["atouts"]):
        bullets.append("Hôte réactif et disponible, conseils locaux personnalisés")
    if any("Extérieur" in a or "Vue" in a for a in insights["atouts"]):
        bullets.append("Terrasse privée avec vue dégagée sur les toits de la ville")
    if "parking" in str(insights["atouts"]).lower():
        bullets.append("Parking privatif inclus — fini le stress de la place de stationnement")
    bullets.append(info["surface"] + " · " + str(info["chambres"]) + " chambre(s) · " + str(info["couchages"]) + " couchages")
    return bullets


def generer_recommandations(insights: Dict) -> List[Dict]:
    recs = []
    mapping = {
        "Propreté": {"action": "Renforcer le protocole de nettoyage entre deux séjours", "detail": "Les avis mentionnent des problèmes de propreté. Envisagez un service de ménage professionnel et une checklist de contrôle qualité.", "impact": "Fort"},
        "Climatisation & Chauffage": {"action": "Vérifier et moderniser le système de chauffage/climatisation", "detail": "Des dysfonctionnements (bruit, insuffisance) sont signalés. Une révision par un professionnel ou le remplacement des appareils vieillissants est recommandée.", "impact": "Fort"},
        "Bruit & Calme": {"action": "Améliorer l'insonorisation ou ajouter des équipements anti-bruit", "detail": "Proposer des boules Quiès, un radiateur silencieux, ou mentionner honnêtement le niveau sonore dans l'annonce pour éviter les mauvaises surprises.", "impact": "Moyen"},
        "Wifi & Internet": {"action": "Upgrader la connexion internet ou le routeur", "detail": "Un Wi-Fi capricieux pénalise les voyageurs professionnels. Passez à la fibre si possible et placez le routeur de manière optimale.", "impact": "Fort"},
        "Check-in & Accueil": {"action": "Automatiser et clarifier le processus d'arrivée", "detail": "Envoyer les instructions 24h avant l'arrivée, prévoir une boîte à clé sécurisée ou une serrure connectée.", "impact": "Moyen"},
        "Literie & Confort": {"action": "Investir dans la literie ou le canapé-lit", "detail": "Un couchage inconfortable est un facteur de déception majeur. Privilégiez un matelas de qualité ou un vrai lit plutôt qu'un canapé-lit pour 2 adultes.", "impact": "Fort"},
        "Équipements & Cuisine": {"action": "Compléter et vérifier les équipements annoncés", "detail": "S'assurer que tout ce qui est mentionné dans l'annonce est bien présent et fonctionnel (machine à laver, vaisselle complète, etc.).", "impact": "Moyen"},
        "Transports & Accessibilité": {"action": "Préciser l'accessibilité dans l'annonce", "detail": "Si le quartier est éloigné des transports, valorisez d'autres atouts (parking, calme) et indiquez clairement les distances.", "impact": "Faible"}
    }
    for probleme in insights["problemes"][:5]:
        if probleme in mapping:
            recs.append(mapping[probleme])
        else:
            recs.append({"action": "Investiguer : " + probleme, "detail": "Ce thème revient négativement dans les avis. Analyser les citations pour identifier l'action corrective.", "impact": "Moyen"})
    return recs


def generer_optimized_listing(insights: Dict, info: Dict, langue: str = "fr") -> Dict[str, Any]:
    titre = generer_titre(insights, info)
    accroche = generer_accroche(insights, info)
    corps = generer_corps(insights, info)
    bullets = generer_bullets(insights, info)
    recommandations = generer_recommandations(insights)
    description_complete = accroche + "\n\n" + corps
    mots_cles = [info["quartier"], info["ville"], info["type"], "centre ville", "wifi"]
    if "Propreté" in str(insights["atouts"]):
        mots_cles.append("propre")
    if "Literie" in str(insights["atouts"]):
        mots_cles.append("literie hôtelière")
    return {
        "meta": {
            "version": "1.0-api",
            "date_generation": datetime.now().isoformat(),
            "mode": "template_fastapi",
            "langue": langue,
            "note_moyenne_source": insights["note_moyenne"],
            "nb_avis_source": insights["nb_avis"]
        },
        "listing_optimise": {
            "titre": titre,
            "accroche": accroche,
            "description": description_complete,
            "bullets_points": bullets,
            "mots_cles_seo": list(set(mots_cles))
        },
        "recommandations_proprietaire": recommandations,
        "insights_utilises": {
            "top_atouts": insights["atouts"],
            "top_problemes": insights["problemes"],
            "citations_forts": insights["citations_forts"],
            "citations_faibles": insights["citations_faibles"]
        }
    }


# ============================================================
# ROUTES FASTAPI
# ============================================================

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "airbnb-optimizer-nlp", "version": "1.0.0"}


@app.post("/analyze")
def analyze_reviews(payload: AnalyzeRequest):
    if not payload.reviews or len(payload.reviews) == 0:
        raise HTTPException(status_code=400, detail="Aucun avis fourni")

    # Conversion Pydantic → dict
    raw_reviews = [{"id": r.id, "note": r.note, "texte": r.texte} for r in payload.reviews]

    # 1. Analyse individuelle
    analyses = [analyser_avis(r) for r in raw_reviews]

    # 2. Synthèse globale
    synthese = synthese_globale(analyses)

    diagnostic = {
        "meta": {
            "version": "1.0-api",
            "methode": "lexique_fr + taxonomie_metier",
            "nb_avis": len(raw_reviews)
        },
        "synthese_globale": synthese,
        "analyses_detaillees": analyses
    }

    # 3. Extraction insights pour génération
    notes = [a["note_client"] for a in analyses]
    note_moyenne = round(sum(notes) / len(notes), 1) if notes else 0

    top_forts = synthese["top_points_forts"]
    top_faibles = synthese["top_points_faibles"]

    atouts = [pf["theme"] for pf in top_forts]
    problemes = [pfa["theme"] for pfa in top_faibles]

    citations_forts = {}
    for pf in top_forts:
        for ana in analyses:
            for p in ana.get("points_forts", []):
                if p["theme"] == pf["theme"] and p.get("citations"):
                    citations_forts[pf["theme"]] = p["citations"][0]
                    break
            if pf["theme"] in citations_forts:
                break

    citations_faibles = {}
    for pfa in top_faibles:
        for ana in analyses:
            for p in ana.get("points_faibles", []):
                if p["theme"] == pfa["theme"] and p.get("citations"):
                    citations_faibles[pfa["theme"]] = p["citations"][0]
                    break
            if pfa["theme"] in citations_faibles:
                break

    insights = {
        "note_moyenne": note_moyenne,
        "nb_avis": len(analyses),
        "atouts": atouts,
        "problemes": problemes,
        "citations_forts": citations_forts,
        "citations_faibles": citations_faibles,
        "recommandation_prioritaire": synthese.get("recommandation_prioritaire", "")
    }

    # 4. Logement info (par défaut ou custom)
    logement_info = payload.logement_info or {
        "type": "appartement",
        "surface": "45 m²",
        "chambres": 1,
        "couchages": 2,
        "quartier": "centre historique",
        "ville": "la ville",
        "atouts_bruts": ["terrasse", "vue sur les toits", "parking privatif"]
    }

    # 5. Génération
    optimized = generer_optimized_listing(insights, logement_info, payload.langue)

    return {
        "success": True,
        "diagnostic": diagnostic,
        "optimized": optimized
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
