"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";

type Chantier = Record<string, unknown>;

type ProofRecord = {
  version: "KRITIA-PREUVE-BTP-1";
  generatedAt: string;
  status: "EMPREINTE_LOCALE_NON_HORODATEE";
  chantier: string;
  category: string;
  title: string;
  description: string;
  zone: string;
  observedAt: string;
  author: string;
  file: { name: string; type: string; size: number; sha256: string };
};

const categories = [
  "État avant travaux",
  "Avancement",
  "Livraison",
  "Travaux supplémentaires",
  "Intempérie ou interruption",
  "Désordre visible",
  "Réserve",
  "Levée de réserve",
  "Réception",
];

async function sha256(file: File) {
  const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, "0")).join("");
}

function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function PreuveBtp({ chantiers }: { chantiers: Chantier[] }) {
  const [file, setFile] = useState<File | null>(null);
  const [hash, setHash] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [record, setRecord] = useState<ProofRecord | null>(null);
  const [preview, setPreview] = useState("");
  const [fields, setFields] = useState({ chantier: "", category: categories[0], title: "", description: "", zone: "", observedAt: new Date().toISOString().slice(0, 16), author: "" });

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  const canPreview = useMemo(() => Boolean(file?.type.startsWith("image/") || file?.type === "application/pdf"), [file]);

  async function chooseFile(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0] ?? null;
    if (preview) URL.revokeObjectURL(preview);
    setFile(next);
    setHash("");
    setRecord(null);
    setMessage("");
    setPreview(next ? URL.createObjectURL(next) : "");
    if (!next) return;
    setBusy(true);
    try { setHash(await sha256(next)); }
    catch { setMessage("Votre navigateur n’a pas pu calculer l’empreinte du fichier."); }
    finally { setBusy(false); }
  }

  function createRecord() {
    if (!file || !hash || !fields.title.trim()) {
      setMessage("Ajoutez un fichier, puis renseignez au minimum le titre du constat.");
      return;
    }
    const next: ProofRecord = {
      version: "KRITIA-PREUVE-BTP-1",
      generatedAt: new Date().toISOString(),
      status: "EMPREINTE_LOCALE_NON_HORODATEE",
      ...fields,
      file: { name: file.name, type: file.type || "application/octet-stream", size: file.size, sha256: hash },
    };
    setRecord(next);
    setMessage("Dossier local constitué. Téléchargez le rapport et conservez-le avec le fichier original.");
  }

  function exportJson() {
    if (!record) return;
    download(new Blob([JSON.stringify(record, null, 2)], { type: "application/json" }), `kritia-preuve-${record.file.sha256.slice(0, 12)}.json`);
  }

  function exportPdf() {
    if (!record) return;
    const pdf = new jsPDF();
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(20); pdf.text("KRITIA Preuve BTP", 18, 22);
    pdf.setFontSize(10); pdf.setTextColor(32, 73, 122); pdf.text("LA MEMOIRE TECHNIQUE DU CHANTIER", 18, 30);
    pdf.setTextColor(25, 35, 50); pdf.setFont("helvetica", "normal");
    const lines = [
      `Statut : empreinte locale non horodatee`, `Dossier genere le : ${new Date(record.generatedAt).toLocaleString("fr-FR")}`,
      `Chantier : ${record.chantier || "Non rattache"}`, `Categorie : ${record.category}`, `Titre : ${record.title}`,
      `Zone : ${record.zone || "Non renseignee"}`, `Observation : ${new Date(record.observedAt).toLocaleString("fr-FR")}`,
      `Auteur declare : ${record.author || "Non renseigne"}`, `Fichier original : ${record.file.name}`, `Taille : ${record.file.size} octets`,
      `Type : ${record.file.type}`, "Empreinte SHA-256 :", ...pdf.splitTextToSize(record.file.sha256, 170), "", "Description :", ...pdf.splitTextToSize(record.description || "Aucune", 170),
    ];
    pdf.text(lines, 18, 43);
    pdf.setFontSize(8); pdf.setTextColor(100); pdf.text(pdf.splitTextToSize("KRITIA ne certifie ni le contenu, ni la conformite, ni la responsabilite des personnes. Le fichier n'est pas stocke par KRITIA. Ce rapport n'est pas un jeton d'horodatage qualifie eIDAS.", 170), 18, 275);
    pdf.save(`kritia-preuve-${record.file.sha256.slice(0, 12)}.pdf`);
  }

  async function verify(event: ChangeEvent<HTMLInputElement>) {
    const candidate = event.target.files?.[0];
    if (!candidate || !record) return;
    setBusy(true);
    const candidateHash = await sha256(candidate);
    setMessage(candidateHash === record.file.sha256 ? "Empreinte identique : le fichier sélectionné correspond au dossier." : "Empreinte différente : ce fichier ne correspond pas au dossier constitué.");
    setBusy(false);
    event.target.value = "";
  }

  return (
    <div className="proof-page">
      <section className="proof-hero">
        <div><p className="eyebrow">KRITIA PREUVE BTP</p><h2>La mémoire technique du chantier.</h2><p>Constituez localement un dossier vérifiable sans envoyer votre fichier à KRITIA.</p></div>
        <span className="proof-local-badge">TRAITEMENT LOCAL</span>
      </section>
      <section className="proof-notice"><strong>Confidentialité par conception</strong><span>Le fichier reste dans votre navigateur. Seule son empreinte SHA‑256 est calculée. Aucun original n’est stocké par KRITIA.</span></section>
      <div className="proof-grid">
        <section className="panel proof-form">
          <h3>1. Décrire le constat</h3>
          <div className="form-grid">
            <label>Chantier<select value={fields.chantier} onChange={(e) => setFields({ ...fields, chantier: e.target.value })}><option value="">Sans rattachement</option>{chantiers.map((item, index) => <option key={String(item.id ?? index)} value={String(item.objet ?? item.reference ?? "Chantier")}>{String(item.reference ?? "")} · {String(item.objet ?? "Chantier")}</option>)}</select></label>
            <label>Nature<select value={fields.category} onChange={(e) => setFields({ ...fields, category: e.target.value })}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Titre *<input value={fields.title} onChange={(e) => setFields({ ...fields, title: e.target.value })} placeholder="Ex. fissure observée avant reprise" /></label>
            <label>Zone / ouvrage<input value={fields.zone} onChange={(e) => setFields({ ...fields, zone: e.target.value })} placeholder="Façade nord · baie 02" /></label>
            <label>Date observée<input type="datetime-local" value={fields.observedAt} onChange={(e) => setFields({ ...fields, observedAt: e.target.value })} /></label>
            <label>Auteur déclaré<input value={fields.author} onChange={(e) => setFields({ ...fields, author: e.target.value })} placeholder="Nom de l’intervenant" /></label>
          </div>
          <label>Description<textarea rows={4} value={fields.description} onChange={(e) => setFields({ ...fields, description: e.target.value })} placeholder="Décrivez uniquement les faits visibles et le contexte." /></label>
        </section>
        <section className="panel proof-file">
          <h3>2. Ajouter le fichier original</h3>
          <label className="proof-drop"><input type="file" accept="image/*,application/pdf" onChange={chooseFile} /><b>{file ? file.name : "Choisir une photo ou un PDF"}</b><span>{file ? `${Math.ceil(file.size / 1024)} Ko` : "Le fichier ne quitte pas cet appareil"}</span></label>
          {preview && canPreview && (file?.type === "application/pdf" ? <object data={preview} type="application/pdf" className="proof-preview">Aperçu PDF</object> : <img src={preview} className="proof-preview" alt="Aperçu du constat" />)}
          {hash && <div className="proof-hash"><small>EMPREINTE SHA‑256</small><code>{hash}</code></div>}
          <button className="primary" type="button" disabled={busy} onClick={createRecord}>{busy ? "Calcul en cours…" : "Constituer le dossier local"}</button>
        </section>
      </div>
      {message && <div className="alert proof-message">{message}</div>}
      <section className={`panel proof-result ${record ? "ready" : ""}`}>
        <div><p className="eyebrow">3. CONSERVER ET VÉRIFIER</p><h3>{record ? "Dossier prêt à être conservé" : "Le rapport apparaîtra ici"}</h3><p>Conservez ensemble le fichier original, le rapport PDF et le reçu JSON.</p></div>
        <div className="proof-actions"><button className="secondary compact" disabled={!record} onClick={exportJson}>Télécharger le reçu JSON</button><button className="secondary compact" disabled={!record} onClick={exportPdf}>Télécharger le rapport PDF</button><label className={`secondary compact proof-verify ${!record ? "disabled" : ""}`}>Vérifier un fichier<input type="file" disabled={!record} onChange={verify} /></label></div>
      </section>
      <section className="proof-provider"><strong>Horodatage qualifié eIDAS</strong><p>Le connecteur vers un prestataire qualifié sera activé après contractualisation. Cette version constitue une empreinte locale vérifiable, mais ne prétend pas délivrer un horodatage qualifié.</p><span>PRESTATAIRE À CONFIGURER</span></section>
      <p className="proof-disclaimer">KRITIA ne certifie ni le contenu, ni la conformité des travaux, ni la responsabilité d’une partie. L’utilisateur décrit les faits et reste responsable de la conservation de son dossier.</p>
    </div>
  );
}
