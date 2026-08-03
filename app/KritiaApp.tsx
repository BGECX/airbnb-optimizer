"use client";

import { FormEvent, useEffect, useState } from "react";

type RecordValue = Record<string, unknown>;
type Section = "dashboard" | "clients" | "chantiers" | "devis" | "factures" | "dpgf";
type Session = { accessToken: string; user: { firstName?: string; lastName?: string; email?: string; role?: string } };

const demoData: Record<Exclude<Section, "dashboard">, RecordValue[]> = {
  clients: [
    { id: "1", nom: "SCI des Tilleuls", type: "ENTREPRISE", ville: "Tours", telephone: "02 47 18 24 60" },
    { id: "2", nom: "Maison Bellanger", type: "PARTICULIER", ville: "Amboise", telephone: "06 12 45 78 90" },
    { id: "3", nom: "Domaine de la Roche", type: "ENTREPRISE", ville: "Chinon", telephone: "02 47 93 11 08" },
  ],
  chantiers: [
    { id: "1", reference: "CH-2026-0042", objet: "Réhabilitation corps de ferme", ville: "Chinon", statut: "EN_COURS", avancement: 68 },
    { id: "2", reference: "CH-2026-0048", objet: "Reprise façade pierre & chaux", ville: "Tours", statut: "EN_COURS", avancement: 34 },
    { id: "3", reference: "CH-2026-0051", objet: "Rénovation maison de maître", ville: "Loches", statut: "PREPARATION", avancement: 8 },
  ],
  devis: [
    { id: "1", numero: "D-2026-0187", objet: "Maçonnerie et enduits chaux", totalTtc: 48720, statut: "ACCEPTE" },
    { id: "2", numero: "D-2026-0192", objet: "Réfection charpente traditionnelle", totalTtc: 73240, statut: "ENVOYE" },
    { id: "3", numero: "D-2026-0195", objet: "Travaux conservatoires", totalTtc: 18450, statut: "BROUILLON" },
  ],
  factures: [
    { id: "1", numero: "F-2026-0118", objet: "Situation n°3 — Corps de ferme", totalTtc: 32480, montantPaye: 32480, statut: "PAYEE" },
    { id: "2", numero: "F-2026-0124", objet: "Acompte façade pierre", totalTtc: 14616, montantPaye: 0, statut: "ENVOYEE" },
    { id: "3", numero: "F-2026-0128", objet: "Situation n°1 — Maison de maître", totalTtc: 22140, montantPaye: 0, statut: "BROUILLON" },
  ],
  dpgf: [
    { id: "1", numero: "DPGF-2026-0031", objet: "Corps de ferme — lot principal", totalHt: 142800, statut: "VALIDEE" },
    { id: "2", numero: "DPGF-2026-0035", objet: "Maison de maître", totalHt: 86420, statut: "EN_COURS" },
  ],
};

const nav: { id: Section; label: string; glyph: string }[] = [
  { id: "dashboard", label: "Vue d’ensemble", glyph: "⌂" },
  { id: "clients", label: "Clients", glyph: "◎" },
  { id: "chantiers", label: "Chantiers", glyph: "▰" },
  { id: "devis", label: "Devis", glyph: "≡" },
  { id: "factures", label: "Factures", glyph: "€" },
  { id: "dpgf", label: "DPGF & métrés", glyph: "⌗" },
];

const endpoint: Record<Exclude<Section, "dashboard">, string> = {
  clients: "/clients?limit=50", chantiers: "/chantiers?limit=50", devis: "/devis?limit=50", factures: "/factures?limit=50", dpgf: "/dpgf",
};

const euro = (value: unknown) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(Number(value ?? 0));
const label = (value: unknown) => String(value ?? "—").replaceAll("_", " ").toLowerCase().replace(/^./, (letter) => letter.toUpperCase());

export default function KritiaApp() {
  const [section, setSection] = useState<Section>("dashboard");
  const [session, setSession] = useState<Session | null>(null);
  const [demo, setDemo] = useState(false);
  const [apiUrl, setApiUrl] = useState("https://api.getkritia.com/api");
  const [data, setData] = useState(demoData);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedUrl = window.localStorage.getItem("kritia-api-url");
      if (savedUrl) setApiUrl(savedUrl);
      const raw = window.sessionStorage.getItem("kritia-session");
      if (raw) try { setSession(JSON.parse(raw)); } catch { window.sessionStorage.removeItem("kritia-session"); }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (session) void loadAll();
  }, [session]); // eslint-disable-line react-hooks/exhaustive-deps

  async function api(path: string, options: RequestInit = {}) {
    const response = await fetch(`${apiUrl.replace(/\/$/, "")}${path}`, {
      ...options,
      headers: { "content-type": "application/json", ...(session?.accessToken ? { authorization: `Bearer ${session.accessToken}` } : {}), ...options.headers },
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(Array.isArray(body.message) ? body.message.join(" · ") : body.message || `Erreur ${response.status}`);
    return body;
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    try {
      window.localStorage.setItem("kritia-api-url", apiUrl);
      const result = await api("/auth/login", { method: "POST", body: JSON.stringify({ email: form.get("email"), password: form.get("password") }) });
      const next = { accessToken: result.accessToken, user: result.user } as Session;
      window.sessionStorage.setItem("kritia-session", JSON.stringify(next));
      setSession(next);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Connexion impossible"); }
    finally { setBusy(false); }
  }

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    if (password !== String(form.get("passwordConfirmation") ?? "")) { setError("Les mots de passe ne correspondent pas."); setBusy(false); return; }
    try {
      window.localStorage.setItem("kritia-api-url", apiUrl);
      const result = await api("/auth/register", { method: "POST", body: JSON.stringify({ email: form.get("email"), password, firstName: form.get("firstName"), lastName: form.get("lastName") }) });
      const next = { accessToken: result.accessToken, user: result.user } as Session;
      window.sessionStorage.setItem("kritia-session", JSON.stringify(next));
      setSession(next);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Inscription impossible"); }
    finally { setBusy(false); }
  }

  async function loadAll() {
    setBusy(true); setError("");
    const sections = Object.keys(endpoint) as (Exclude<Section, "dashboard">)[];
    const results = await Promise.allSettled(sections.map((key) => api(endpoint[key])));
    setData((current) => ({ ...current, ...Object.fromEntries(results.map((result, index) => [sections[index], result.status === "fulfilled" && Array.isArray(result.value) ? result.value : []])) }));
    if (results.every((result) => result.status === "rejected")) setError("Aucune donnée accessible avec ce rôle. Vérifiez l’API et les autorisations.");
    setBusy(false);
  }

  function logout() { window.sessionStorage.removeItem("kritia-session"); setSession(null); setDemo(false); setSection("dashboard"); }
  if (!session && !demo) return <Login apiUrl={apiUrl} setApiUrl={setApiUrl} login={login} register={register} demo={() => setDemo(true)} busy={busy} error={error} />;

  const currentUser = session?.user ?? { firstName: "Bruno", lastName: "Martin", role: "ADMIN" };
  const title = nav.find((item) => item.id === section)?.label ?? "Vue d’ensemble";

  return (
    <main className="app-shell">
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="brand"><span className="brand-mark">K</span><span><span className="brand-name">KRITIA<small className="product-name">btp</small></span><small className="brand-tagline">PILOTAGE BTP</small></span></div>
        <nav aria-label="Navigation principale">
          <p className="nav-caption">ESPACE DE TRAVAIL</p>
          {nav.map((item) => <button key={item.id} className={section === item.id ? "active" : ""} onClick={() => { setSection(item.id); setMenuOpen(false); }}><span>{item.glyph}</span>{item.label}{item.id === "chantiers" && <b>{data.chantiers.length}</b>}</button>)}
        </nav>
        <div className="sidebar-foot"><div className="help-card"><span>?</span><strong>Besoin d’aide ?</strong><p>Consultez le guide KRITIA ou contactez votre administrateur.</p></div><div className="version">KRITIA V1 · environnement {demo ? "démo" : "connecté"}</div></div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <button className="menu-toggle" aria-label="Ouvrir le menu" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
          <div><p className="eyebrow">Lundi 3 août 2026</p><h1>{title}</h1></div>
          <div className="top-actions"><span className={`connection ${demo ? "demo" : ""}`}>{demo ? "Mode démonstration" : "API connectée"}</span><button className="notification" aria-label="Notifications">●</button><button className="profile" onClick={logout}><span>{String(currentUser.firstName ?? "K")[0]}{String(currentUser.lastName ?? "")[0]}</span><div><strong>{currentUser.firstName} {currentUser.lastName}</strong><small>{label(currentUser.role)}</small></div><i>⌄</i></button></div>
        </header>

        <div className="content">
          {error && <div className="alert">{error}<button onClick={() => setError("")}>×</button></div>}
          {busy && <div className="loading-line" />}
          {section === "dashboard" ? <Dashboard data={data} navigate={setSection} /> : <DataView section={section} rows={data[section]} demo={demo} refresh={loadAll} />}
        </div>
      </section>
    </main>
  );
}

function Login({ apiUrl, setApiUrl, login, register, demo, busy, error }: { apiUrl: string; setApiUrl: (value: string) => void; login: (event: FormEvent<HTMLFormElement>) => void; register: (event: FormEvent<HTMLFormElement>) => void; demo: () => void; busy: boolean; error: string }) {
  const [creating, setCreating] = useState(false);
  return <main className="login-page"><section className="login-story"><div className="login-brand"><span>K</span> KRITIA</div><div className="story-copy"><p className="eyebrow light">CONSTRUIRE · PILOTER · TRANSMETTRE</p><h1>Le chantier avance.<br />Votre gestion aussi.</h1><p>De la première visite à la réception, gardez la maîtrise des coûts, des équipes et du bâti existant.</p><div className="story-stats"><span><strong>360°</strong>Vision chantier</span><span><strong>1 seul</strong>outil de pilotage</span><span><strong>100%</strong>orienté rénovation</span></div></div><p className="story-quote">« La précision du métré. La clarté du pilotage. »</p></section><section className="login-panel"><form onSubmit={creating ? register : login}><p className="eyebrow">{creating ? "CRÉATION DE COMPTE" : "ESPACE SÉCURISÉ"}</p><h2>{creating ? "Rejoindre KRITIA" : "Bienvenue sur KRITIA"}</h2><p className="muted">{creating ? "Créez votre accès personnel à KRITIA btp." : "Connectez-vous à votre espace de gestion."}</p>{error && <div className="form-error">{error}</div>}{creating && <div className="name-fields"><label>Prénom<input name="firstName" required autoComplete="given-name" /></label><label>Nom<input name="lastName" required autoComplete="family-name" /></label></div>}<label>Adresse e-mail<input name="email" type="email" placeholder="vous@entreprise.fr" required autoComplete="username" /></label><label>Mot de passe<input name="password" type="password" placeholder="••••••••••••" required minLength={8} autoComplete={creating ? "new-password" : "current-password"} /></label>{creating && <><p className="password-rule">8 caractères minimum, avec majuscule, minuscule et chiffre.</p><label>Confirmer le mot de passe<input name="passwordConfirmation" type="password" placeholder="••••••••••••" required minLength={8} autoComplete="new-password" /></label></>}<details><summary>Configuration de l’API</summary><label>Adresse de l’API<input value={apiUrl} onChange={(event) => setApiUrl(event.target.value)} type="url" required /></label></details><button className="primary" disabled={busy}>{busy ? "Traitement…" : creating ? "Créer mon compte" : "Se connecter"}<span>→</span></button><button className="auth-switch" type="button" onClick={() => setCreating(!creating)}>{creating ? "J’ai déjà un compte" : "Créer un compte"}</button>{!creating && <><div className="or"><span>ou</span></div><button className="secondary" type="button" onClick={demo}>Découvrir avec les données de démonstration</button></>}<small className="secure-note">Session conservée uniquement dans cet onglet.</small></form></section></main>;
}

function Dashboard({ data, navigate }: { data: typeof demoData; navigate: (section: Section) => void }) {
  const pipeline = data.devis.reduce((sum, item) => sum + Number(item.totalTtc ?? 0), 0);
  const invoiced = data.factures.reduce((sum, item) => sum + Number(item.totalTtc ?? 0), 0);
  const paid = data.factures.reduce((sum, item) => sum + Number(item.montantPaye ?? 0), 0);
  return <><section className="hero-row"><div><p className="eyebrow">SYNTHÈSE DE L’ACTIVITÉ</p><h2>Bonjour, prêt pour une nouvelle journée&nbsp;?</h2><p>Voici les points qui méritent votre attention.</p></div><button className="primary compact" onClick={() => navigate("devis")}>＋ Nouveau devis</button></section><section className="kpi-grid"><Kpi label="Chantiers actifs" value={data.chantiers.filter((item) => item.statut === "EN_COURS").length} note={`${data.chantiers.length} au total`} accent="orange" /><Kpi label="Devis en portefeuille" value={euro(pipeline)} note={`${data.devis.length} opportunités`} /><Kpi label="Facturé" value={euro(invoiced)} note={`${euro(paid)} encaissé`} /><Kpi label="Reste à encaisser" value={euro(invoiced - paid)} note="À suivre cette semaine" accent="dark" /></section><section className="dashboard-grid"><div className="panel wide"><PanelTitle title="Avancement des chantiers" action="Voir tous" onClick={() => navigate("chantiers")} />{data.chantiers.slice(0, 4).map((item) => <div className="project-line" key={String(item.id)}><div className="project-icon">{String(item.objet ?? "C")[0]}</div><div className="project-name"><strong>{String(item.objet)}</strong><small>{String(item.reference ?? item.ville ?? "Chantier")}</small></div><div className="progress"><span><i style={{ width: `${Number(item.avancement ?? 0)}%` }} /></span><b>{Number(item.avancement ?? 0)}%</b></div><Status value={item.statut} /></div>)}</div><div className="panel"><PanelTitle title="À traiter" action="Tout voir" /><div className="todo-list"><Todo tone="red" title="2 factures à relancer" text="Échéance dépassée" /><Todo tone="orange" title="3 devis en attente" text="Depuis plus de 7 jours" /><Todo tone="blue" title="Réception à préparer" text="Corps de ferme · 12 août" /><Todo tone="green" title="Attestation reçue" text="Sous-traitant validé" /></div></div><div className="panel wide"><PanelTitle title="Activité commerciale" action="Ouvrir les devis" onClick={() => navigate("devis")} /><div className="chart"><div className="chart-scale"><span>80k</span><span>60k</span><span>40k</span><span>20k</span><span>0</span></div><div className="bars">{[42,58,38,72,64,86,68,91,75,82,60,88].map((height, index) => <div key={index}><i style={{ height: `${height}%` }} /><small>{["S36","S37","S38","S39","S40","S41","S42","S43","S44","S45","S46","S47"][index]}</small></div>)}</div></div></div><div className="panel"><PanelTitle title="Marge prévisionnelle" /><div className="margin-donut"><div><strong>28,4%</strong><span>marge moyenne</span></div></div><div className="legend"><span><i className="orange-dot" />Marge brute <b>{euro(82400)}</b></span><span><i />Déboursé <b>{euro(207700)}</b></span></div></div></section></>;
}

function DataView({ section, rows, demo, refresh }: { section: Exclude<Section, "dashboard">; rows: RecordValue[]; demo: boolean; refresh: () => void }) {
  const config = { clients: ["nom", "type", "ville", "telephone"], chantiers: ["reference", "objet", "ville", "statut", "avancement"], devis: ["numero", "objet", "totalTtc", "statut"], factures: ["numero", "objet", "totalTtc", "montantPaye", "statut"], dpgf: ["numero", "objet", "totalHt", "statut"] }[section];
  return <><section className="hero-row"><div><p className="eyebrow">GESTION · {section.toUpperCase()}</p><h2>{nav.find((item) => item.id === section)?.label}</h2><p>{rows.length} élément{rows.length > 1 ? "s" : ""} dans votre périmètre.</p></div><div className="view-actions"><button className="secondary compact" onClick={refresh}>↻ Actualiser</button><button className="primary compact" title={demo ? "Action désactivée en démonstration" : "Disponible dans la prochaine itération"}>＋ Ajouter</button></div></section><section className="panel table-panel"><div className="table-toolbar"><label>⌕<input placeholder={`Rechercher dans ${section}…`} /></label><button>Filtres</button><button>Exporter</button></div>{rows.length ? <div className="table-scroll"><table><thead><tr>{config.map((key) => <th key={key}>{label(key)}</th>)}<th /></tr></thead><tbody>{rows.map((row, index) => <tr key={String(row.id ?? index)}>{config.map((key) => <td key={key}>{key === "statut" ? <Status value={row[key]} /> : key.toLowerCase().includes("total") || key === "montantPaye" ? <strong>{euro(row[key])}</strong> : key === "avancement" ? <span className="mini-progress"><i style={{ width: `${Number(row[key])}%` }} />{String(row[key])}%</span> : String(row[key] ?? "—")}</td>)}<td><button className="row-action">•••</button></td></tr>)}</tbody></table></div> : <div className="empty"><span>◇</span><h3>Aucune donnée accessible</h3><p>Ajoutez un premier élément ou vérifiez le périmètre de votre rôle.</p></div>}</section></>;
}

function Kpi({ label: text, value, note, accent = "plain" }: { label: string; value: string | number; note: string; accent?: string }) { return <article className={`kpi ${accent}`}><p>{text}</p><strong>{value}</strong><small>{note}</small></article>; }
function Status({ value }: { value: unknown }) { const text = String(value ?? "INCONNU"); return <span className={`status status-${text.toLowerCase()}`}>{label(text)}</span>; }
function PanelTitle({ title, action, onClick }: { title: string; action?: string; onClick?: () => void }) { return <div className="panel-title"><h3>{title}</h3>{action && <button onClick={onClick}>{action} →</button>}</div>; }
function Todo({ tone, title, text }: { tone: string; title: string; text: string }) { return <div className="todo"><span className={tone}>!</span><div><strong>{title}</strong><small>{text}</small></div><b>›</b></div>; }
