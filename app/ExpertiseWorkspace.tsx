"use client";

import { useMemo, useState } from "react";
import { jsPDF } from "jspdf";

type Item = { id: string; zone: string; nature: string; observation: string; analysis: string };
type Chantier = Record<string, unknown>;

const blankItem = (): Item => ({ id: crypto.randomUUID(), zone: "", nature: "", observation: "", analysis: "" });

export default function ExpertiseWorkspace({ chantiers }: { chantiers: Chantier[] }) {
  const [step, setStep] = useState(1);
  const [validated, setValidated] = useState(false);
  const [message, setMessage] = useState("");
  const [items, setItems] = useState<Item[]>([blankItem()]);
  const [mission, setMission] = useState({ reference: `EXP-${new Date().getFullYear()}-001`, title: "", chantier: "", expert: "", qualification: "", client: "", opposingParty: "", meetingAt: new Date().toISOString().slice(0, 16), purpose: "", documents: "", methodology: "Examen visuel des éléments accessibles et analyse des pièces communiquées.", conclusion: "", reservations: "" });

  const completeObservations = useMemo(() => items.filter((item) => item.observation.trim()), [items]);
  function updateItem(id: string, key: keyof Item, value: string) { setItems((current) => current.map((item) => item.id === id ? { ...item, [key]: value } : item)); setValidated(false); }
  function field(key: keyof typeof mission, value: string) { setMission({ ...mission, [key]: value }); setValidated(false); }

  function validateReport() {
    if (!mission.title.trim() || !mission.expert.trim() || !completeObservations.length) {
      setMessage("Renseignez le titre, l’expert auteur et au moins une constatation factuelle."); return;
    }
    setValidated(true); setMessage("Rapport validé par l’expert auteur. Toute modification le replacera en projet.");
  }

  function exportPdf() {
    if (!validated) { setMessage("L’expert doit valider explicitement le rapport avant son export définitif."); return; }
    const pdf = new jsPDF(); let y = 20;
    const line = (text: string, bold = false, size = 10) => { pdf.setFont("helvetica", bold ? "bold" : "normal"); pdf.setFontSize(size); const wrapped = pdf.splitTextToSize(text || "—", 174); if (y + wrapped.length * 5 > 278) { pdf.addPage(); y = 20; } pdf.text(wrapped, 18, y); y += wrapped.length * 5 + 3; };
    line("KRITIA EXPERTISE", true, 20); line("RAPPORT VALIDÉ PAR LE PROFESSIONNEL AUTEUR", true, 9);
    line(`${mission.reference} · ${mission.title}`, true, 14); line(`Expert auteur : ${mission.expert}${mission.qualification ? ` · ${mission.qualification}` : ""}`);
    line(`Réunion / constat : ${new Date(mission.meetingAt).toLocaleString("fr-FR")}`); line(`Mission : ${mission.purpose}`); line(`Demandeur : ${mission.client}`); line(`Autre partie : ${mission.opposingParty}`);
    line("Méthodologie", true, 12); line(mission.methodology);
    line("Constatations et analyses du professionnel", true, 12);
    completeObservations.forEach((item, index) => { line(`${index + 1}. ${item.nature || "Constatation"} — ${item.zone || "Zone non précisée"}`, true); line(`Fait observé : ${item.observation}`); if (item.analysis) line(`Analyse saisie par l’expert : ${item.analysis}`); });
    line("Conclusion de l’expert", true, 12); line(mission.conclusion); if (mission.reservations) { line("Réserves et limites", true, 12); line(mission.reservations); }
    line("Déclaration", true, 11); line("Ce rapport a été renseigné et validé par le professionnel identifié ci-dessus. KRITIA est un outil de collecte, de structuration et de mise en forme ; KRITIA n’est ni l’auteur de l’expertise ni le validateur de ses conclusions.");
    pdf.save(`${mission.reference || "rapport-expertise"}.pdf`);
  }

  return <div className="expertise-page">
    <section className="expertise-hero"><div><p className="eyebrow">KRITIA EXPERTISE</p><h2>Du terrain au rapport, sans perdre le fil.</h2><p>L’expert collecte, analyse, valide et signe ses propres conclusions.</p></div><span className={validated ? "report-state validated" : "report-state"}>{validated ? "VALIDÉ PAR L’EXPERT" : "PROJET NON VALIDÉ"}</span></section>
    <nav className="expertise-steps" aria-label="Étapes du rapport">{["Mission", "Parties", "Constatations", "Analyse & rapport"].map((label, index) => <button key={label} className={step === index + 1 ? "active" : ""} onClick={() => setStep(index + 1)}><b>{index + 1}</b>{label}</button>)}</nav>
    {message && <div className="alert expertise-message">{message}<button onClick={() => setMessage("")}>×</button></div>}
    {step === 1 && <section className="panel expertise-panel"><h3>Cadre de la mission</h3><div className="form-grid"><label>Référence<input value={mission.reference} onChange={(e) => field("reference", e.target.value)} /></label><label>Intitulé *<input value={mission.title} onChange={(e) => field("title", e.target.value)} placeholder="Ex. constat de désordres en façade" /></label><label>Dossier BTP lié<select value={mission.chantier} onChange={(e) => field("chantier", e.target.value)}><option value="">Aucun</option>{chantiers.map((item, i) => <option key={String(item.id ?? i)}>{String(item.reference ?? "")} · {String(item.objet ?? "Chantier")}</option>)}</select></label><label>Date de réunion<input type="datetime-local" value={mission.meetingAt} onChange={(e) => field("meetingAt", e.target.value)} /></label><label className="full">Objet de la mission<textarea rows={4} value={mission.purpose} onChange={(e) => field("purpose", e.target.value)} placeholder="Définissez précisément la mission confiée au professionnel." /></label></div></section>}
    {step === 2 && <section className="panel expertise-panel"><h3>Auteur et parties</h3><div className="form-grid"><label>Expert auteur *<input value={mission.expert} onChange={(e) => field("expert", e.target.value)} /></label><label>Qualification / spécialité<input value={mission.qualification} onChange={(e) => field("qualification", e.target.value)} /></label><label>Demandeur<input value={mission.client} onChange={(e) => field("client", e.target.value)} /></label><label>Autre partie / représentant<input value={mission.opposingParty} onChange={(e) => field("opposingParty", e.target.value)} /></label><label className="full">Documents communiqués<textarea rows={5} value={mission.documents} onChange={(e) => field("documents", e.target.value)} placeholder="Plans, marchés, devis, courriers, procès-verbaux…" /></label></div></section>}
    {step === 3 && <section className="expertise-observations"><div className="panel-title"><div><h3>Constatations factuelles</h3><p>Une ligne par zone ou désordre observé.</p></div><button className="primary compact" onClick={() => setItems([...items, blankItem()])}>＋ Ajouter</button></div>{items.map((item, index) => <article className="panel observation-card" key={item.id}><header><strong>Constatation {index + 1}</strong>{items.length > 1 && <button onClick={() => setItems(items.filter((candidate) => candidate.id !== item.id))}>Supprimer</button>}</header><div className="form-grid"><label>Zone / ouvrage<input value={item.zone} onChange={(e) => updateItem(item.id, "zone", e.target.value)} /></label><label>Nature<input value={item.nature} onChange={(e) => updateItem(item.id, "nature", e.target.value)} placeholder="Fissure, humidité, déformation…" /></label><label className="full">Faits visibles *<textarea rows={3} value={item.observation} onChange={(e) => updateItem(item.id, "observation", e.target.value)} placeholder="Décrire sans interpréter : dimensions, aspect, position, étendue…" /></label><label className="full">Analyse rédigée par l’expert<textarea rows={3} value={item.analysis} onChange={(e) => updateItem(item.id, "analysis", e.target.value)} placeholder="Analyse professionnelle, hypothèses et limites." /></label></div><p className="observation-link">◉ Les photos et empreintes pourront être jointes depuis KRITIA Preuve BTP.</p></article>)}</section>}
    {step === 4 && <section className="panel expertise-panel"><h3>Analyse et validation finale</h3><div className="form-grid"><label className="full">Méthodologie<textarea rows={3} value={mission.methodology} onChange={(e) => field("methodology", e.target.value)} /></label><label className="full">Conclusion de l’expert<textarea rows={7} value={mission.conclusion} onChange={(e) => field("conclusion", e.target.value)} placeholder="Conclusion rédigée et assumée par le professionnel." /></label><label className="full">Réserves et limites<textarea rows={4} value={mission.reservations} onChange={(e) => field("reservations", e.target.value)} placeholder="Éléments non accessibles, pièces manquantes, investigations complémentaires…" /></label></div><div className="expertise-declaration"><strong>Responsabilité éditoriale</strong><p>KRITIA structure les informations saisies. Le professionnel reste seul auteur et responsable de ses constatations, analyses, conclusions et préconisations.</p></div><div className="expertise-actions"><button className="secondary" onClick={() => { setValidated(false); setMessage("Projet conservé dans cette session. La sauvegarde serveur sera ajoutée dans la prochaine étape."); }}>Conserver comme projet</button><button className="primary" onClick={validateReport}>Valider comme expert auteur</button><button className="primary" disabled={!validated} onClick={exportPdf}>Télécharger le rapport PDF</button></div></section>}
    <div className="step-navigation"><button className="secondary compact" disabled={step === 1} onClick={() => setStep(step - 1)}>← Précédent</button><button className="primary compact" disabled={step === 4} onClick={() => setStep(step + 1)}>Suivant →</button></div>
  </div>;
}
