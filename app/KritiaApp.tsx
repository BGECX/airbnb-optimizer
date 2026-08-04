"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type RecordValue = Record<string, unknown>;
type Section = "dashboard" | "clients" | "chantiers" | "devis" | "factures" | "dpgf" | "bibliotheque";
type Session = { accessToken: string; user: { firstName?: string; lastName?: string; email?: string; role?: string } };
type ApiRequest = (path: string, options?: RequestInit) => Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any

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
  bibliotheque: [
    { id: "1", reference: "MAC-CHX-001", designation: "Rejointoiement pierre à la chaux", unite: "m²", categorie: "Maçonnerie ancienne", debourseSec: 54.2, prixUnitaireHt: 82.6 },
    { id: "2", reference: "CHA-CHN-014", designation: "Reprise de ferme en chêne", unite: "u", categorie: "Charpente", debourseSec: 1860, prixUnitaireHt: 2840 },
  ],
};

const nav: { id: Section; label: string; glyph: string }[] = [
  { id: "dashboard", label: "Vue d’ensemble", glyph: "⌂" },
  { id: "clients", label: "Clients", glyph: "◎" },
  { id: "chantiers", label: "Chantiers", glyph: "▰" },
  { id: "devis", label: "Devis", glyph: "≡" },
  { id: "factures", label: "Factures", glyph: "€" },
  { id: "dpgf", label: "DPGF & métrés", glyph: "⌗" },
  { id: "bibliotheque", label: "Bibliothèque", glyph: "▦" },
];

const endpoint: Record<Exclude<Section, "dashboard">, string> = {
  clients: "/clients?limit=50", chantiers: "/chantiers?limit=50", devis: "/devis?limit=50", factures: "/factures?limit=50", dpgf: "/dpgf", bibliotheque: "/bibliotheque/ouvrages",
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
  const [resetToken, setResetToken] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedUrl = window.localStorage.getItem("kritia-api-url");
      if (savedUrl) setApiUrl(savedUrl);
      const raw = window.sessionStorage.getItem("kritia-session");
      if (raw) try { setSession(JSON.parse(raw)); } catch { window.sessionStorage.removeItem("kritia-session"); }
      setResetToken(new URLSearchParams(window.location.search).get("resetToken") ?? "");
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
  if (!session && !demo) return <Login apiUrl={apiUrl} setApiUrl={setApiUrl} login={login} register={register} request={api} resetToken={resetToken} demo={() => setDemo(true)} busy={busy} error={error} />;

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
          {section === "dashboard" ? <Dashboard data={data} navigate={setSection} /> : section === "dpgf" ? <DpgfWorkspace rows={data.dpgf} chantiers={data.chantiers} demo={demo} request={api} refresh={loadAll} /> : <DataView section={section} rows={data[section]} data={data} demo={demo} request={api} refresh={loadAll} />}
        </div>
      </section>
    </main>
  );
}

function Login({ apiUrl, setApiUrl, login, register, request, resetToken, demo, busy, error }: { apiUrl: string; setApiUrl: (value: string) => void; login: (event: FormEvent<HTMLFormElement>) => void; register: (event: FormEvent<HTMLFormElement>) => void; request: ApiRequest; resetToken: string; demo: () => void; busy: boolean; error: string }) {
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [resetCompleted, setResetCompleted] = useState(false);
  const [working, setWorking] = useState(false);
  const [localError, setLocalError] = useState("");
  const [notice, setNotice] = useState("");
  async function forgot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); setWorking(true); setLocalError(""); setNotice("");
    try { const result = await request("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email: form.get("email") }) }); setNotice(result.message); }
    catch (reason) { setLocalError(reason instanceof Error ? reason.message : "Demande impossible"); }
    finally { setWorking(false); }
  }
  async function reset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); const password = String(form.get("password") ?? ""); setLocalError(""); setNotice("");
    if (password !== String(form.get("passwordConfirmation") ?? "")) { setLocalError("Les mots de passe ne correspondent pas."); return; }
    setWorking(true);
    try { const result = await request("/auth/reset-password", { method: "POST", body: JSON.stringify({ token: resetToken, password }) }); window.history.replaceState({}, "", window.location.pathname); setNotice(result.message); setResetCompleted(true); setMode("login"); }
    catch (reason) { setLocalError(reason instanceof Error ? reason.message : "Réinitialisation impossible"); }
    finally { setWorking(false); }
  }
  const activeMode = resetToken && !resetCompleted ? "reset" : mode;
  const creating = activeMode === "register"; const forgotten = activeMode === "forgot"; const resetting = activeMode === "reset";
  const submit = creating ? register : forgotten ? forgot : resetting ? reset : login;
  return <main className="login-page"><section className="login-story"><div className="login-brand"><span>K</span> KRITIA</div><div className="story-copy"><p className="eyebrow light">CONSTRUIRE · PILOTER · TRANSMETTRE</p><h1>Le chantier avance.<br />Votre gestion aussi.</h1><p>De la première visite à la réception, gardez la maîtrise des coûts, des équipes et du bâti existant.</p><div className="story-stats"><span><strong>360°</strong>Vision chantier</span><span><strong>1 seul</strong>outil de pilotage</span><span><strong>100%</strong>orienté rénovation</span></div></div><p className="story-quote">« La précision du métré. La clarté du pilotage. »</p></section><section className="login-panel"><form onSubmit={submit}><p className="eyebrow">{creating ? "CRÉATION DE COMPTE" : forgotten ? "ACCÈS AU COMPTE" : resetting ? "NOUVEAU MOT DE PASSE" : "ESPACE SÉCURISÉ"}</p><h2>{creating ? "Rejoindre KRITIA" : forgotten ? "Mot de passe oublié" : resetting ? "Choisissez votre mot de passe" : "Bienvenue sur KRITIA"}</h2><p className="muted">{creating ? "Créez votre accès personnel à KRITIA btp." : forgotten ? "Saisissez votre e-mail pour recevoir un lien valable 30 minutes." : resetting ? "Le nouveau mot de passe remplacera immédiatement l’ancien." : "Connectez-vous à votre espace de gestion."}</p>{(error || localError) && <div className="form-error">{localError || error}</div>}{notice && <div className="form-notice">{notice}</div>}{creating && <div className="name-fields"><label>Prénom<input name="firstName" required autoComplete="given-name" /></label><label>Nom<input name="lastName" required autoComplete="family-name" /></label></div>}{!resetting && <label>Adresse e-mail<input name="email" type="email" placeholder="vous@entreprise.fr" required autoComplete="username" /></label>}{!forgotten && <label>Mot de passe<input name="password" type="password" placeholder="••••••••••••" required minLength={8} autoComplete={creating || resetting ? "new-password" : "current-password"} /></label>}{(creating || resetting) && <><p className="password-rule">8 caractères minimum, avec majuscule, minuscule et chiffre.</p><label>Confirmer le mot de passe<input name="passwordConfirmation" type="password" placeholder="••••••••••••" required minLength={8} autoComplete="new-password" /></label></>}<details><summary>Configuration de l’API</summary><label>Adresse de l’API<input value={apiUrl} onChange={(event) => setApiUrl(event.target.value)} type="url" required /></label></details><button className="primary" disabled={busy || working}>{busy || working ? "Traitement…" : creating ? "Créer mon compte" : forgotten ? "Envoyer le lien" : resetting ? "Enregistrer le nouveau mot de passe" : "Se connecter"}<span>→</span></button>{activeMode === "login" && <button className="auth-switch" type="button" onClick={() => { setMode("forgot"); setLocalError(""); setNotice(""); }}>Mot de passe oublié ?</button>}<button className="auth-switch" type="button" onClick={() => { setMode(activeMode === "register" ? "login" : activeMode === "login" ? "register" : "login"); setLocalError(""); setNotice(""); }}>{activeMode === "register" ? "J’ai déjà un compte" : activeMode === "login" ? "Créer un compte" : "Retour à la connexion"}</button>{activeMode === "login" && <><div className="or"><span>ou</span></div><button className="secondary" type="button" onClick={demo}>Découvrir avec les données de démonstration</button></>}<small className="secure-note">Les liens de réinitialisation sont temporaires et à usage unique.</small></form></section></main>;
}

function Dashboard({ data, navigate }: { data: typeof demoData; navigate: (section: Section) => void }) {
  const pipeline = data.devis.reduce((sum, item) => sum + Number(item.totalTtc ?? 0), 0);
  const invoiced = data.factures.reduce((sum, item) => sum + Number(item.totalTtc ?? 0), 0);
  const paid = data.factures.reduce((sum, item) => sum + Number(item.montantPaye ?? 0), 0);
  return <><section className="hero-row"><div><p className="eyebrow">SYNTHÈSE DE L’ACTIVITÉ</p><h2>Bonjour, prêt pour une nouvelle journée&nbsp;?</h2><p>Voici les points qui méritent votre attention.</p></div><button className="primary compact" onClick={() => navigate("devis")}>＋ Nouveau devis</button></section><section className="kpi-grid"><Kpi label="Chantiers actifs" value={data.chantiers.filter((item) => item.statut === "EN_COURS").length} note={`${data.chantiers.length} au total`} accent="orange" /><Kpi label="Devis en portefeuille" value={euro(pipeline)} note={`${data.devis.length} opportunités`} /><Kpi label="Facturé" value={euro(invoiced)} note={`${euro(paid)} encaissé`} /><Kpi label="Reste à encaisser" value={euro(invoiced - paid)} note="À suivre cette semaine" accent="dark" /></section><section className="dashboard-grid"><div className="panel wide"><PanelTitle title="Avancement des chantiers" action="Voir tous" onClick={() => navigate("chantiers")} />{data.chantiers.slice(0, 4).map((item) => <div className="project-line" key={String(item.id)}><div className="project-icon">{String(item.objet ?? "C")[0]}</div><div className="project-name"><strong>{String(item.objet)}</strong><small>{String(item.reference ?? item.ville ?? "Chantier")}</small></div><div className="progress"><span><i style={{ width: `${Number(item.avancement ?? 0)}%` }} /></span><b>{Number(item.avancement ?? 0)}%</b></div><Status value={item.statut} /></div>)}</div><div className="panel"><PanelTitle title="À traiter" action="Tout voir" /><div className="todo-list"><Todo tone="red" title="2 factures à relancer" text="Échéance dépassée" /><Todo tone="orange" title="3 devis en attente" text="Depuis plus de 7 jours" /><Todo tone="blue" title="Réception à préparer" text="Corps de ferme · 12 août" /><Todo tone="green" title="Attestation reçue" text="Sous-traitant validé" /></div></div><div className="panel wide"><PanelTitle title="Activité commerciale" action="Ouvrir les devis" onClick={() => navigate("devis")} /><div className="chart"><div className="chart-scale"><span>80k</span><span>60k</span><span>40k</span><span>20k</span><span>0</span></div><div className="bars">{[42,58,38,72,64,86,68,91,75,82,60,88].map((height, index) => <div key={index}><i style={{ height: `${height}%` }} /><small>{["S36","S37","S38","S39","S40","S41","S42","S43","S44","S45","S46","S47"][index]}</small></div>)}</div></div></div><div className="panel"><PanelTitle title="Marge prévisionnelle" /><div className="margin-donut"><div><strong>28,4%</strong><span>marge moyenne</span></div></div><div className="legend"><span><i className="orange-dot" />Marge brute <b>{euro(82400)}</b></span><span><i />Déboursé <b>{euro(207700)}</b></span></div></div></section></>;
}

function DataView({ section, rows, data, demo, request, refresh }: { section: Exclude<Section, "dashboard" | "dpgf">; rows: RecordValue[]; data: typeof demoData; demo: boolean; request: ApiRequest; refresh: () => void }) {
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<RecordValue | null>(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const config = { clients: ["nom", "type", "ville", "telephone"], chantiers: ["reference", "objet", "ville", "statut", "avancement"], devis: ["numero", "objet", "totalTtc", "statut"], factures: ["numero", "objet", "totalTtc", "montantPaye", "statut"], bibliotheque: ["reference", "designation", "unite", "categorie", "debourseSec", "prixUnitaireHt"] }[section];
  const filtered = rows.filter((row) => !search || Object.values(row).some((value) => String(value ?? "").toLowerCase().includes(search.toLowerCase())));
  return <><section className="hero-row"><div><p className="eyebrow">GESTION · {section.toUpperCase()}</p><h2>{nav.find((item) => item.id === section)?.label}</h2><p>{rows.length} élément{rows.length > 1 ? "s" : ""} dans votre périmètre.</p></div><div className="view-actions"><button className="secondary compact" onClick={refresh}>↻ Actualiser</button><button className="primary compact" onClick={() => setCreating(true)}>＋ Ajouter</button></div></section>{message && <div className="alert">{message}<button onClick={() => setMessage("")}>×</button></div>}<section className="panel table-panel"><div className="table-toolbar"><label>⌕<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Rechercher dans ${section}…`} /></label><span className="toolbar-count">{filtered.length} résultat{filtered.length > 1 ? "s" : ""}</span></div>{filtered.length ? <div className="table-scroll"><table><thead><tr>{config.map((key) => <th key={key}>{label(key)}</th>)}<th /></tr></thead><tbody>{filtered.map((row, index) => <tr key={String(row.id ?? index)} onClick={() => setSelected(row)} className="clickable-row">{config.map((key) => <td key={key}>{key === "statut" ? <Status value={row[key]} /> : key.toLowerCase().includes("total") || key === "montantPaye" || key === "debourseSec" || key === "prixUnitaireHt" ? <strong>{euro(row[key])}</strong> : key === "avancement" ? <span className="mini-progress"><i style={{ width: `${Number(row[key])}%` }} />{String(row[key])}%</span> : String(row[key] ?? "—")}</td>)}<td><button className="row-action" aria-label="Ouvrir la fiche">→</button></td></tr>)}</tbody></table></div> : <div className="empty"><span>◇</span><h3>Aucune donnée accessible</h3><p>Ajoutez un premier élément ou vérifiez le périmètre de votre rôle.</p></div>}</section>{creating && <CreateEntityDialog section={section} data={data} demo={demo} request={request} close={() => setCreating(false)} done={async (text) => { setCreating(false); setMessage(text); await refresh(); }} />}{selected && <EntityDetail section={section} row={selected} close={() => setSelected(null)} />}</>;
}

type CrudSection = Exclude<Section, "dashboard" | "dpgf">;

type AddressSuggestion = { label: string; adresse: string; codePostal: string; ville: string };

async function publicAddressSearch(query: string): Promise<AddressSuggestion[]> {
  const url = new URL("https://data.geopf.fr/geocodage/completion");
  url.searchParams.set("text", query);
  url.searchParams.set("maximumResponses", "6");
  const response = await fetch(url);
  if (!response.ok) throw new Error("Le service national des adresses est indisponible.");
  const payload = await response.json();
  return (payload.results ?? []).map((item: RecordValue) => ({
    label: String(item.fulltext ?? ""),
    adresse: String(item.fulltext ?? "").split(",")[0],
    codePostal: String(item.zipcode ?? ""),
    ville: String(item.city ?? ""),
  }));
}

async function publicCompanySearch(siret: string) {
  const response = await fetch(`https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(siret)}&per_page=1`);
  if (!response.ok) throw new Error("Le registre public des entreprises est indisponible.");
  const payload = await response.json();
  const company = payload.results?.[0];
  if (!company) throw new Error("Aucune entreprise trouvée pour ce SIRET.");
  const establishment = (company.matching_etablissements ?? []).find((item: RecordValue) => item.siret === siret) ?? company.siege ?? {};
  return {
    nom: company.nom_raison_sociale ?? company.nom_complet ?? "",
    siret,
    adresse: establishment.adresse ?? establishment.geo_adresse ?? "",
    codePostal: establishment.code_postal ?? "",
    ville: establishment.libelle_commune ?? "",
  };
}

function AddressFields({ request }: { request: ApiRequest }) {
  const [value, setValue] = useState({ adresse: "", codePostal: "", ville: "" });
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const skipAddressLookup = useRef(false);
  useEffect(() => {
    if (skipAddressLookup.current) { skipAddressLookup.current = false; return; }
    if (value.adresse.trim().length < 3) return;
    const timer = window.setTimeout(() => request(`/clients/recherche/adresses?q=${encodeURIComponent(value.adresse)}`).catch(() => publicAddressSearch(value.adresse)).then(setSuggestions).catch(() => setSuggestions([])), 350);
    return () => window.clearTimeout(timer);
  }, [value.adresse]); // eslint-disable-line react-hooks/exhaustive-deps
  return <><label className="suggestion-field" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setSuggestions([]); }}>Adresse<input name="adresse" autoComplete="off" value={value.adresse} onKeyDown={(event) => { if (event.key === "Escape") setSuggestions([]); }} onChange={(event) => setValue((current) => ({ ...current, adresse: event.target.value }))} />{value.adresse.trim().length >= 3 && suggestions.length > 0 && <span className="suggestion-list">{suggestions.map((item) => <button type="button" key={item.label} onClick={() => { skipAddressLookup.current = true; setValue({ adresse: item.label, codePostal: item.codePostal, ville: item.ville }); setSuggestions([]); }}>{item.label}</button>)}</span>}</label><div className="form-grid"><label>Code postal<input name="codePostal" value={value.codePostal} onChange={(event) => setValue((current) => ({ ...current, codePostal: event.target.value }))} /></label><label>Ville<input name="ville" value={value.ville} onChange={(event) => setValue((current) => ({ ...current, ville: event.target.value }))} /></label></div></>;
}

function InlineClientCreator({ request, onCreated }: { request: ApiRequest; onCreated: (client: RecordValue) => void }) {
  const [client, setClient] = useState({ type: "PARTICULIER", nom: "", siret: "", adresse: "", codePostal: "", ville: "", telephone: "", email: "" });
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");
  const skipAddressLookup = useRef(false);
  useEffect(() => {
    const selectBeforeBlur = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target.closest(".inline-creator .suggestion-list button") : null;
      if (!(target instanceof HTMLButtonElement)) return;
      const item = suggestions.find((suggestion) => suggestion.label === target.textContent?.trim());
      if (!item) return;
      event.preventDefault();
      skipAddressLookup.current = true;
      setClient((current) => ({ ...current, adresse: item.label, codePostal: item.codePostal, ville: item.ville }));
      setSuggestions([]);
    };
    document.addEventListener("pointerdown", selectBeforeBlur, true);
    return () => document.removeEventListener("pointerdown", selectBeforeBlur, true);
  }, [suggestions]);
  useEffect(() => {
    if (skipAddressLookup.current) { skipAddressLookup.current = false; return; }
    if (client.adresse.trim().length < 3) return;
    const timer = window.setTimeout(async () => {
      setMessage("Recherche de l’adresse…");
      try {
        const results = await request(`/clients/recherche/adresses?q=${encodeURIComponent(client.adresse)}`).catch(() => publicAddressSearch(client.adresse));
        setSuggestions(results);
        setMessage(results.length ? "Sélectionnez l’adresse proposée." : "Aucune adresse trouvée.");
      } catch (reason) {
        setSuggestions([]);
        setMessage(reason instanceof Error ? reason.message : "Recherche d’adresse impossible");
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [client.adresse]); // eslint-disable-line react-hooks/exhaustive-deps
  const update = (key: string, value: string) => setClient((current) => ({ ...current, [key]: value }));
  async function lookupSiret() {
    if (!/^\d{14}$/.test(client.siret)) { setMessage("Le SIRET doit contenir 14 chiffres."); return; }
    setWorking(true); setMessage("Recherche de l’entreprise…");
    try {
      const result = await request(`/clients/recherche/entreprises?siret=${client.siret}`).catch(async () => ({ existing: false, company: await publicCompanySearch(client.siret) }));
      if (result.existing) { onCreated(result.client); setMessage("Ce client existait déjà : il a été sélectionné."); return; }
      setClient((current) => ({ ...current, type: "ENTREPRISE", ...result.company }));
      setMessage("Entreprise retrouvée. Vérifiez les informations avant création.");
    } catch (reason) { setMessage(reason instanceof Error ? reason.message : "Recherche impossible"); }
    finally { setWorking(false); }
  }
  useEffect(() => {
    if (client.type !== "ENTREPRISE" || !/^\d{14}$/.test(client.siret)) return;
    const timer = window.setTimeout(lookupSiret, 250);
    return () => window.clearTimeout(timer);
  }, [client.siret, client.type]); // eslint-disable-line react-hooks/exhaustive-deps
  async function create() {
    if (!client.nom.trim()) { setMessage("Indiquez le nom du client."); return; }
    setWorking(true); setMessage("");
    try { const created = await request("/clients", { method: "POST", body: JSON.stringify({ ...client, siret: client.siret || undefined }) }); onCreated(created); setMessage("Client créé et sélectionné dans le devis."); }
    catch (reason) { setMessage(reason instanceof Error ? reason.message : "Création impossible"); }
    finally { setWorking(false); }
  }
  return <section className="inline-creator"><div className="section-heading"><div><strong>Coordonnées du nouveau client</strong><small>La fiche sera enregistrée automatiquement dans Clients.</small></div></div><div className="form-grid"><label>Type<select value={client.type} onChange={(event) => update("type", event.target.value)}><option value="PARTICULIER">Particulier</option><option value="ENTREPRISE">Entreprise</option><option value="COPROPRIETE">Copropriété</option><option value="COLLECTIVITE">Collectivité</option></select></label><label>Nom ou raison sociale<input value={client.nom} onChange={(event) => update("nom", event.target.value)} /></label></div>{client.type === "ENTREPRISE" && <div className="lookup-row"><label>SIRET<input inputMode="numeric" maxLength={14} value={client.siret} onChange={(event) => update("siret", event.target.value.replace(/\D/g, ""))} /></label><button className="secondary compact" type="button" disabled={working} onClick={lookupSiret}>Rechercher le SIRET</button></div>}<label className="suggestion-field" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setSuggestions([]); }}>Adresse<input value={client.adresse} autoComplete="off" onKeyDown={(event) => { if (event.key === "Escape") setSuggestions([]); }} onChange={(event) => update("adresse", event.target.value)} />{client.adresse.trim().length >= 3 && suggestions.length > 0 && <span className="suggestion-list">{suggestions.map((item) => <button type="button" key={item.label} onClick={() => { skipAddressLookup.current = true; setClient((current) => ({ ...current, adresse: item.label, codePostal: item.codePostal, ville: item.ville })); setSuggestions([]); }}>{item.label}</button>)}</span>}</label><div className="form-grid three"><label>Code postal<input value={client.codePostal} onChange={(event) => update("codePostal", event.target.value)} /></label><label>Ville<input value={client.ville} onChange={(event) => update("ville", event.target.value)} /></label><label>Téléphone<input value={client.telephone} onChange={(event) => update("telephone", event.target.value)} /></label></div><label>E-mail<input type="email" value={client.email} onChange={(event) => update("email", event.target.value)} /></label>{message && <p className="form-hint">{message}</p>}<button className="primary compact client-save" type="button" disabled={working} onClick={create}>{working ? "Enregistrement…" : "Enregistrer le client et continuer"}</button></section>;
}

function ClientFormFields({ request }: { request: ApiRequest }) {
  const [client, setClient] = useState({ type: "PARTICULIER", nom: "", siret: "", adresse: "", codePostal: "", ville: "" });
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [message, setMessage] = useState("");
  const skipAddressLookup = useRef(false);
  const update = (key: string, value: string) => setClient((current) => ({ ...current, [key]: value }));
  useEffect(() => {
    if (skipAddressLookup.current) { skipAddressLookup.current = false; return; }
    if (client.adresse.trim().length < 3) return;
    const timer = window.setTimeout(async () => {
      setMessage("Recherche de l’adresse…");
      try {
        const results = await request(`/clients/recherche/adresses?q=${encodeURIComponent(client.adresse)}`).catch(() => publicAddressSearch(client.adresse));
        setSuggestions(results);
        setMessage(results.length ? "Sélectionnez l’adresse proposée." : "Aucune adresse trouvée.");
      } catch (reason) {
        setSuggestions([]);
        setMessage(reason instanceof Error ? reason.message : "Recherche d’adresse impossible");
      }
    }, 350);
    return () => window.clearTimeout(timer);
  }, [client.adresse]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (client.type !== "ENTREPRISE" || !/^\d{14}$/.test(client.siret)) return;
    const timer = window.setTimeout(async () => {
      setMessage("Recherche de l’entreprise…");
      try {
        const result = await request(`/clients/recherche/entreprises?siret=${client.siret}`).catch(async () => ({ existing: false, company: await publicCompanySearch(client.siret) }));
        if (result.existing) { setMessage(`Ce SIRET appartient déjà au client ${String(result.client.nom)}.`); return; }
        setClient((current) => ({ ...current, ...result.company, type: "ENTREPRISE" }));
        setMessage("Entreprise retrouvée et fiche préremplie.");
      } catch (reason) { setMessage(reason instanceof Error ? reason.message : "Recherche impossible"); }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [client.siret, client.type]); // eslint-disable-line react-hooks/exhaustive-deps
  return <><div className="form-grid"><label>Type<select name="type" value={client.type} onChange={(event) => update("type", event.target.value)}><option value="PARTICULIER">Particulier</option><option value="ENTREPRISE">Entreprise</option><option value="COPROPRIETE">Copropriété</option><option value="COLLECTIVITE">Collectivité</option></select></label><label>Nom ou raison sociale<input name="nom" value={client.nom} onChange={(event) => update("nom", event.target.value)} required /></label></div><div className="form-grid"><label>SIRET<input name="siret" inputMode="numeric" maxLength={14} value={client.siret} onChange={(event) => update("siret", event.target.value.replace(/\D/g, ""))} /></label><label>Contact<input name="contactNom" /></label></div>{message && <p className="form-hint">{message}</p>}<label className="suggestion-field" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setSuggestions([]); }}>Adresse<input name="adresse" value={client.adresse} autoComplete="off" onKeyDown={(event) => { if (event.key === "Escape") setSuggestions([]); }} onChange={(event) => update("adresse", event.target.value)} />{client.adresse.trim().length >= 3 && suggestions.length > 0 && <span className="suggestion-list">{suggestions.map((item) => <button type="button" key={item.label} onClick={() => { skipAddressLookup.current = true; setClient((current) => ({ ...current, adresse: item.label, codePostal: item.codePostal, ville: item.ville })); setSuggestions([]); }}>{item.label}</button>)}</span>}</label><div className="form-grid"><label>Code postal<input name="codePostal" value={client.codePostal} onChange={(event) => update("codePostal", event.target.value)} /></label><label>Ville<input name="ville" value={client.ville} onChange={(event) => update("ville", event.target.value)} /></label></div><label>Téléphone<input name="telephone" /></label><label>E-mail<input name="email" type="email" /></label><label>Notes<textarea name="notes" /></label></>;
}

function InlineApporteurCreator({ request, onCreated }: { request: ApiRequest; onCreated: (item: RecordValue) => void }) {
  const [open, setOpen] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  async function submit(button: HTMLButtonElement) {
    const container = button.closest(".apporteur-fields"); if (!container) return;
    const get = (name: string) => (container.querySelector(`[name=${name}]`) as HTMLInputElement | HTMLSelectElement | null)?.value.trim() ?? "";
    if (!get("apporteurNom")) { setError("Indiquez le nom de l’apporteur."); return; }
    setWorking(true); setError("");
    try { const item = await request("/apporteurs", { method: "POST", body: JSON.stringify({ type: get("apporteurType"), nom: get("apporteurNom"), siret: get("apporteurSiret") || undefined, referenceMandat: get("apporteurMandat") || undefined }) }); onCreated(item); setOpen(false); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Création impossible"); }
    finally { setWorking(false); }
  }
  if (!open) return <button className="text-action" type="button" onClick={() => setOpen(true)}>＋ Créer une agence ou un apporteur</button>;
  return <div className="apporteur-fields"><div className="form-grid"><label>Type<select name="apporteurType" defaultValue="AGENCE_IMMOBILIERE"><option value="AGENCE_IMMOBILIERE">Agence immobilière</option><option value="APPORTEUR_AFFAIRES">Apporteur d’affaires</option><option value="ARCHITECTE">Architecte</option><option value="MAITRE_OEUVRE">Maître d’œuvre</option><option value="SYNDIC">Syndic</option><option value="AUTRE">Autre</option></select></label><label>Nom<input name="apporteurNom" /></label></div><div className="form-grid"><label>SIRET<input name="apporteurSiret" inputMode="numeric" maxLength={14} /></label><label>Référence du mandat<input name="apporteurMandat" /></label></div>{error && <p className="form-error">{error}</p>}<div className="inline-buttons"><button type="button" className="secondary compact" onClick={() => setOpen(false)}>Annuler</button><button type="button" className="secondary compact" disabled={working} onClick={(event) => submit(event.currentTarget)}>{working ? "Création…" : "Créer l’apporteur"}</button></div></div>;
}

function CreateEntityDialog({ section, data, demo, request, close, done }: { section: CrudSection; data: typeof demoData; demo: boolean; request: ApiRequest; close: () => void; done: (message: string) => void }) {
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [clientOptions, setClientOptions] = useState<RecordValue[]>(data.clients);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [clientMode, setClientMode] = useState<"existing" | "new">(data.clients.length ? "existing" : "new");
  const [apporteurs, setApporteurs] = useState<RecordValue[]>([]);
  const [selectedApporteurId, setSelectedApporteurId] = useState("");
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 30);
  useEffect(() => {
    if (demo || section !== "devis") return;
    request("/apporteurs").then((items) => setApporteurs(Array.isArray(items) ? items : [])).catch(() => setApporteurs([]));
  }, [demo, section]); // eslint-disable-line react-hooks/exhaustive-deps
  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); const get = (name: string) => String(form.get(name) ?? "").trim(); const num = (name: string) => Number(get(name));
    if (demo) { done("Mode démonstration : formulaire validé, sans écriture dans la base."); return; }
    const line = { designation: get("ligneDesignation"), unite: get("ligneUnite") || "u", quantite: num("ligneQuantite"), prixUnitaireHt: num("lignePrix") };
    const payloads: Record<CrudSection, { path: string; body: Record<string, unknown> }> = {
      clients: { path: "/clients", body: { type: get("type"), nom: get("nom"), siret: get("siret") || undefined, adresse: get("adresse") || undefined, codePostal: get("codePostal") || undefined, ville: get("ville") || undefined, telephone: get("telephone") || undefined, email: get("email") || undefined, contactNom: get("contactNom") || undefined, notes: get("notes") || undefined } },
      chantiers: { path: "/chantiers", body: { clientId: get("clientId"), objet: get("objet"), adresse: get("adresse") || undefined, codePostal: get("codePostal") || undefined, ville: get("ville") || undefined, dateDebutPrevue: get("dateDebutPrevue") || undefined, dateFinPrevue: get("dateFinPrevue") || undefined, montantPrevu: get("montantPrevu") ? num("montantPrevu") : undefined, description: get("description") || undefined } },
      devis: { path: "/devis", body: { clientId: get("clientId"), chantierId: get("chantierId") || undefined, apporteurId: get("apporteurId") || undefined, referenceMandat: get("referenceMandat") || undefined, objet: get("objet"), dateValidite: get("dateValidite"), tauxTva: num("tauxTva"), conditions: get("conditions") || undefined, lignes: [line] } },
      factures: { path: "/factures", body: { clientId: get("clientId"), chantierId: get("chantierId") || undefined, type: get("type"), objet: get("objet"), dateEcheance: get("dateEcheance"), tauxTva: num("tauxTva"), modeReglement: get("modeReglement") || undefined, lignes: [line] } },
      bibliotheque: { path: "/bibliotheque/ouvrages", body: { reference: get("reference"), designation: get("designation"), unite: get("unite"), categorie: get("categorie") || undefined, sousCategorie: get("sousCategorie") || undefined, coefficientVente: num("coefficientVente"), tempsPoseHeures: get("tempsPoseHeures") ? num("tempsPoseHeures") : undefined, descriptionTechnique: get("descriptionTechnique") || undefined, composants: [{ type: get("ressourceType"), designation: get("composantDesignation"), unite: get("composantUnite"), quantite: num("composantQuantite"), prixUnitaire: num("composantPrix"), fournisseur: get("fournisseur") || undefined }] } },
    };
    setWorking(true); setError("");
    const entityName: Record<CrudSection, string> = { clients: "Client", chantiers: "Chantier", devis: "Devis", factures: "Facture", bibliotheque: "Ouvrage" };
    try { const result = await request(payloads[section].path, { method: "POST", body: JSON.stringify(payloads[section].body) }); done(`${entityName[section]} ${String(result.numero ?? result.reference ?? result.nom ?? "")} créé avec succès.`); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Enregistrement impossible"); }
    finally { setWorking(false); }
  }
  const chantierOptions = data.chantiers;
  const dialogTitle: Record<CrudSection, string> = { clients: "Nouveau client", chantiers: "Nouveau chantier", devis: "Nouveau devis", factures: "Nouvelle facture", bibliotheque: "Nouvel ouvrage" };
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && close()}><form className="modal-card entity-form" onSubmit={send}><div className="modal-head"><div><p className="eyebrow">CRÉATION · {section.toUpperCase()}</p><h3>{dialogTitle[section]}</h3></div><button type="button" onClick={close}>×</button></div>
    {section === "clients" && <ClientFormFields request={request} />}
    {section === "chantiers" && <><label>Client<select name="clientId" required defaultValue=""><option value="" disabled>Choisir un client…</option>{clientOptions.map((item) => <option key={String(item.id)} value={String(item.id)}>{String(item.nom)}</option>)}</select></label><label>Objet du chantier<input name="objet" required /></label><AddressFields request={request} /><div className="form-grid"><label>Début prévu<input name="dateDebutPrevue" type="date" /></label><label>Fin prévue<input name="dateFinPrevue" type="date" /></label></div><label>Budget prévisionnel HT<input name="montantPrevu" type="number" min="0" step="0.01" /></label><label>Description<textarea name="description" /></label></>}
    {(section === "devis" || section === "factures") && <>
      <section className="client-block"><div className="section-heading"><div><strong>1. Client facturé</strong><small>Choisissez une fiche existante ou créez le client ici.</small></div></div><div className="client-choice"><button type="button" className={clientMode === "existing" ? "active" : ""} onClick={() => setClientMode("existing")}>Client existant</button><button type="button" className={clientMode === "new" ? "active" : ""} onClick={() => setClientMode("new")}>＋ Nouveau client</button></div>{clientMode === "existing" ? <label>Rechercher et sélectionner le client<select name="clientId" required value={selectedClientId} onChange={(event) => setSelectedClientId(event.target.value)}><option value="" disabled>Choisir un client…</option>{clientOptions.map((item) => <option key={String(item.id)} value={String(item.id)}>{String(item.nom)}</option>)}</select></label> : <InlineClientCreator request={request} onCreated={(client) => { setClientOptions((current) => current.some((item) => item.id === client.id) ? current : [...current, client]); setSelectedClientId(String(client.id)); setClientMode("existing"); }} />}</section>
      <label>Chantier associé — facultatif<select name="chantierId" defaultValue=""><option value="">Sans chantier</option>{chantierOptions.map((item) => <option key={String(item.id)} value={String(item.id)}>{String(item.reference)} · {String(item.objet)}</option>)}</select></label>
      {section === "devis" && <details className="optional-section"><summary>Apporteur, agence ou mandataire <span>Facultatif</span></summary><div className="optional-content"><p className="form-hint">Le client reste le destinataire du devis et de la facture. Le mandataire est enregistré séparément.</p><div className="form-grid"><label>Mandataire<select name="apporteurId" value={selectedApporteurId} onChange={(event) => setSelectedApporteurId(event.target.value)}><option value="">Aucun apporteur</option>{apporteurs.map((item) => <option key={String(item.id)} value={String(item.id)}>{String(item.nom)} · {label(item.type)}</option>)}</select></label><label>Référence du mandat<input name="referenceMandat" /></label></div><InlineApporteurCreator request={request} onCreated={(item) => { setApporteurs((current) => [...current, item]); setSelectedApporteurId(String(item.id)); }} /></div></details>}
      <label>Objet<input name="objet" required /></label><div className="form-grid three">{section === "devis" ? <label>Validité<input name="dateValidite" type="date" defaultValue={tomorrow.toISOString().slice(0, 10)} required /></label> : <><label>Type<select name="type" defaultValue="DEFINITIVE"><option value="DEFINITIVE">Définitive</option><option value="ACOMPTE">Acompte</option><option value="SITUATION">Situation</option></select></label><label>Échéance<input name="dateEcheance" type="date" defaultValue={tomorrow.toISOString().slice(0, 10)} required /></label></>}<label>TVA (%)<input name="tauxTva" type="number" min="0" max="100" step="0.1" defaultValue="20" required /></label></div><fieldset><legend>Première ligne</legend><label>Désignation<input name="ligneDesignation" required /></label><div className="form-grid three"><label>Unité<input name="ligneUnite" defaultValue="u" required /></label><label>Quantité<input name="ligneQuantite" type="number" min="0.01" step="0.001" defaultValue="1" required /></label><label>Prix unitaire HT<input name="lignePrix" type="number" min="0" step="0.01" required /></label></div></fieldset>{section === "devis" ? <label>Conditions<textarea name="conditions" defaultValue="Validité 30 jours." /></label> : <label>Mode de règlement<input name="modeReglement" defaultValue="Virement à 30 jours" /></label>}
    </>}
    {section === "bibliotheque" && <><div className="form-grid three"><label>Référence<input name="reference" required /></label><label>Unité<select name="unite" defaultValue="m²"><option>m²</option><option>ml</option><option>m³</option><option>u</option><option>h</option><option>forfait</option></select></label><label>Coefficient vente<input name="coefficientVente" type="number" min="1" step="0.01" defaultValue="1.35" required /></label></div><label>Désignation de l’ouvrage<input name="designation" required /></label><div className="form-grid"><label>Catégorie<input name="categorie" placeholder="Maçonnerie ancienne" /></label><label>Sous-catégorie<input name="sousCategorie" placeholder="Pierre et chaux" /></label></div><label>Temps de pose (h/unité)<input name="tempsPoseHeures" type="number" min="0" step="0.01" /></label><label>Description technique<textarea name="descriptionTechnique" /></label><fieldset><legend>Premier composant du déboursé</legend><div className="form-grid"><label>Type<select name="ressourceType" defaultValue="MATERIAU"><option value="MATERIAU">Matériau</option><option value="MAIN_OEUVRE">Main-d’œuvre</option><option value="MATERIEL">Matériel</option><option value="SOUS_TRAITANCE">Sous-traitance</option></select></label><label>Désignation<input name="composantDesignation" required /></label></div><div className="form-grid three"><label>Unité<input name="composantUnite" defaultValue="u" required /></label><label>Quantité<input name="composantQuantite" type="number" min="0" step="0.001" defaultValue="1" required /></label><label>Prix unitaire<input name="composantPrix" type="number" min="0" step="0.01" required /></label></div><label>Fournisseur<input name="fournisseur" /></label></fieldset></>}
    {error && <div className="form-error">{error}</div>}<div className="modal-actions"><button className="secondary compact" type="button" onClick={close}>Annuler</button><button className="primary compact" disabled={working || (!demo && (section === "devis" || section === "factures") && !selectedClientId) || (!demo && section === "chantiers" && !clientOptions.length)}>{working ? "Enregistrement…" : "Créer"}</button></div>{!demo && (section === "devis" || section === "factures") && !selectedClientId && <p className="form-hint">Sélectionnez un client existant ou enregistrez le nouveau client pour continuer le devis.</p>}{!demo && section === "chantiers" && !clientOptions.length && <p className="form-error">Créez d’abord un client.</p>}</form></div>;
}

function EntityDetail({ section, row, close }: { section: CrudSection; row: RecordValue; close: () => void }) {
  const hidden = new Set(["id", "createdAt", "updatedAt", "clientId", "chantierId", "createdById"]);
  const entries = Object.entries(row).filter(([key, value]) => !hidden.has(key) && value !== null && value !== undefined && typeof value !== "object");
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && close()}><section className="modal-card detail-card"><div className="modal-head"><div><p className="eyebrow">FICHE · {section.toUpperCase()}</p><h3>{String(row.nom ?? row.objet ?? row.designation ?? row.numero ?? row.reference ?? "Détail")}</h3></div><button onClick={close}>×</button></div><div className="detail-grid">{entries.map(([key, value]) => <div key={key}><small>{label(key)}</small><strong>{key.toLowerCase().includes("total") || key.toLowerCase().includes("prix") || key.toLowerCase().includes("debourse") || key.toLowerCase().includes("montant") ? euro(value) : label(value)}</strong></div>)}</div><div className="modal-actions"><button className="primary compact" onClick={close}>Fermer</button></div></section></div>;
}

type Metre = { id: string; libelle: string; formule?: string; quantite: number };
type Poste = { id: string; code: string; designation: string; unite: string; quantite: number; debourseUnitaire: number; prixUnitaireHt: number; totalVenteHt: number; isSelected: boolean; metres: Metre[] };
type Lot = { id: string; code: string; designation: string; postes: Poste[] };
type DpgfDetail = { id: string; reference: string; nom: string; statut: string; totalDebourseSec: number; totalVenteHt: number; coefficientFraisGeneraux: number; coefficientMarge: number; chantier?: { objet?: string; reference?: string }; lots: Lot[] };

const demoDpgf: DpgfDetail = {
  id: "demo-dpgf", reference: "DPGF-2026-0035", nom: "Rénovation maison de maître", statut: "BROUILLON",
  totalDebourseSec: 52270, totalVenteHt: 86420, coefficientFraisGeneraux: 1.12, coefficientMarge: 1.18,
  chantier: { reference: "CH-2026-0051", objet: "Rénovation maison de maître" },
  lots: [
    { id: "lot-1", code: "01", designation: "Maçonnerie ancienne", postes: [
      { id: "p-1", code: "01.01", designation: "Piquage des enduits ciment", unite: "m²", quantite: 186.4, debourseUnitaire: 16.8, prixUnitaireHt: 25.6, totalVenteHt: 4771.84, isSelected: true, metres: [{ id: "m-1", libelle: "Façades cour et jardin", formule: "(L*H)-OUVERTURES", quantite: 186.4 }] },
      { id: "p-2", code: "01.02", designation: "Rejointoiement pierre à la chaux", unite: "m²", quantite: 186.4, debourseUnitaire: 54.2, prixUnitaireHt: 82.6, totalVenteHt: 15396.64, isSelected: true, metres: [] },
    ] },
    { id: "lot-2", code: "02", designation: "Charpente traditionnelle", postes: [
      { id: "p-3", code: "02.01", designation: "Reprise de fermes en chêne", unite: "u", quantite: 4, debourseUnitaire: 1860, prixUnitaireHt: 2840, totalVenteHt: 11360, isSelected: true, metres: [{ id: "m-2", libelle: "Fermes à reprendre", quantite: 4 }] },
      { id: "p-4", code: "02.02", designation: "Option isolation biosourcée", unite: "m²", quantite: 142, debourseUnitaire: 62, prixUnitaireHt: 94, totalVenteHt: 13348, isSelected: false, metres: [] },
    ] },
  ],
};

function DpgfWorkspace({ rows, chantiers, demo, request, refresh }: { rows: RecordValue[]; chantiers: RecordValue[]; demo: boolean; request: ApiRequest; refresh: () => void }) {
  const [selectedId, setSelectedId] = useState<string>(demo ? demoDpgf.id : String(rows[0]?.id ?? ""));
  const [detail, setDetail] = useState<DpgfDetail | null>(demo ? demoDpgf : null);
  const [editor, setEditor] = useState<"dpgf" | "lot" | "poste" | "metre" | null>(null);
  const [targetLot, setTargetLot] = useState("");
  const [targetPoste, setTargetPoste] = useState("");
  const [message, setMessage] = useState("");
  const [working, setWorking] = useState(false);
  const effectiveSelectedId = selectedId || String(rows[0]?.id ?? "");

  useEffect(() => {
    if (demo || !effectiveSelectedId) return;
    request(`/dpgf/${effectiveSelectedId}`).then(setDetail).catch((reason) => setMessage(reason instanceof Error ? reason.message : "DPGF inaccessible"));
  }, [effectiveSelectedId, demo]); // eslint-disable-line react-hooks/exhaustive-deps

  async function submit(path: string, body: Record<string, unknown>, after?: (result: any) => void) { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (demo) { setMessage("Mode démonstration : les calculs sont visibles, sans modifier la base."); setEditor(null); return; }
    setWorking(true); setMessage("");
    try { const result = await request(path, { method: "POST", body: JSON.stringify(body) }); after?.(result); setEditor(null); await refresh(); if (effectiveSelectedId) setDetail(await request(`/dpgf/${effectiveSelectedId}`)); }
    catch (reason) { setMessage(reason instanceof Error ? reason.message : "Opération impossible"); }
    finally { setWorking(false); }
  }

  async function togglePoste(poste: Poste) {
    if (demo) { setDetail((current) => current ? { ...current, lots: current.lots.map((lot) => ({ ...lot, postes: lot.postes.map((item) => item.id === poste.id ? { ...item, isSelected: !item.isSelected } : item) })) } : current); return; }
    setWorking(true);
    try { await request(`/dpgf/postes/${poste.id}/selection`, { method: "PATCH", body: JSON.stringify({ isSelected: !poste.isSelected }) }); setDetail(await request(`/dpgf/${effectiveSelectedId}`)); }
    catch (reason) { setMessage(reason instanceof Error ? reason.message : "Sélection impossible"); }
    finally { setWorking(false); }
  }

  async function validateDpgf() {
    if (!detail || demo) { setMessage(demo ? "La validation est désactivée dans la démonstration." : "DPGF absente"); return; }
    setWorking(true);
    try { await request(`/dpgf/${detail.id}/statut`, { method: "PATCH", body: JSON.stringify({ statut: "VALIDE" }) }); setDetail(await request(`/dpgf/${detail.id}`)); setMessage("DPGF validée : elle est maintenant figée et prête à devenir un devis."); }
    catch (reason) { setMessage(reason instanceof Error ? reason.message : "Validation impossible"); }
    finally { setWorking(false); }
  }

  async function createDevis() {
    if (!detail || demo) { setMessage(demo ? "La génération du devis est désactivée dans la démonstration." : "DPGF absente"); return; }
    const dateValidite = new Date(); dateValidite.setDate(dateValidite.getDate() + 30);
    setWorking(true); setMessage("");
    try { const devis = await request(`/dpgf/${detail.id}/devis`, { method: "POST", body: JSON.stringify({ dateValidite: dateValidite.toISOString().slice(0, 10), tauxTva: 20, conditions: "Validité 30 jours. Modalités à confirmer avant émission." }) }); setMessage(`Devis ${devis.numero} créé avec succès à partir de la DPGF.`); await refresh(); }
    catch (reason) { setMessage(reason instanceof Error ? reason.message : "Création du devis impossible"); }
    finally { setWorking(false); }
  }

  const allPostes = detail?.lots.flatMap((lot) => lot.postes) ?? [];
  const selected = allPostes.filter((poste) => poste.isSelected);
  const totalVente = selected.reduce((sum, poste) => sum + Number(poste.totalVenteHt), 0);
  const totalDebourse = selected.reduce((sum, poste) => sum + Number(poste.quantite) * Number(poste.debourseUnitaire), 0);
  const marge = totalVente ? ((totalVente - totalDebourse) / totalVente) * 100 : 0;
  const dpgfRows = demo ? [{ ...demoData.dpgf[1], id: demoDpgf.id }] : rows;

  return <div className="dpgf-workspace">
    <section className="hero-row dpgf-hero"><div><p className="eyebrow">CHIFFRAGE · DPGF · MÉTRÉS</p><h2>Construire le prix, poste par poste</h2><p>Lots, ouvrages, quantités, déboursés et marge consolidés avant le devis.</p></div><div className="view-actions"><button className="secondary compact" onClick={refresh}>↻ Actualiser</button><button className="primary compact" onClick={() => setEditor("dpgf")}>＋ Nouvelle DPGF</button></div></section>
    {message && <div className="alert dpgf-alert">{message}<button onClick={() => setMessage("")}>×</button></div>}
    <div className="dpgf-layout">
        <aside className="dpgf-list panel"><div className="panel-title"><h3>Chiffrages</h3><span>{dpgfRows.length}</span></div>{dpgfRows.map((row) => { const id = String(row.id); return <button key={id} className={effectiveSelectedId === id ? "active" : ""} onClick={() => setSelectedId(id)}><span><strong>{String(row.reference ?? row.numero ?? "DPGF")}</strong><small>{String(row.nom ?? row.objet ?? "Sans objet")}</small></span><Status value={row.statut} /></button>; })}{!demo && !rows.length && <div className="dpgf-empty"><strong>Aucun chiffrage</strong><p>Créez d’abord un chantier, puis sa première DPGF.</p></div>}</aside>
      <section className="dpgf-main">
        {detail ? <>
          <div className="panel dpgf-summary"><div><p className="eyebrow">{detail.reference}</p><h3>{detail.nom}</h3><small>{detail.chantier?.reference} · {detail.chantier?.objet}</small></div><div className="dpgf-summary-actions"><Status value={detail.statut} />{detail.statut === "BROUILLON" && <button className="secondary compact" onClick={validateDpgf} disabled={working}>✓ Valider</button>}<button className="primary compact" onClick={createDevis} disabled={detail.statut !== "VALIDE" || working} title={detail.statut !== "VALIDE" ? "Validez la DPGF avant de générer le devis" : "Générer le devis"}>Créer le devis →</button></div></div>
          <div className="dpgf-kpis"><Kpi label="Déboursé sec" value={euro(totalDebourse)} note={`${selected.length} postes retenus`} /><Kpi label="Vente HT" value={euro(totalVente)} note={`FG ×${detail.coefficientFraisGeneraux} · marge ×${detail.coefficientMarge}`} accent="orange" /><Kpi label="Marge brute" value={`${marge.toFixed(1)} %`} note={euro(totalVente - totalDebourse)} accent={marge < 20 ? "dark" : "plain"} /></div>
          <div className="panel dpgf-editor"><div className="table-toolbar"><strong>Décomposition des travaux</strong><span /><button onClick={() => setEditor("lot")} disabled={detail.statut !== "BROUILLON"}>＋ Lot</button><button onClick={() => { setTargetLot(detail.lots[0]?.id ?? ""); setEditor("poste"); }} disabled={!detail.lots.length || detail.statut !== "BROUILLON"}>＋ Poste</button></div>
            {detail.lots.map((lot) => <div className="dpgf-lot" key={lot.id}><div className="lot-heading"><span>{lot.code}</span><strong>{lot.designation}</strong><small>{lot.postes.length} poste{lot.postes.length > 1 ? "s" : ""}</small></div><div className="table-scroll"><table><thead><tr><th>Retenu</th><th>Code · Désignation</th><th>Unité</th><th>Quantité</th><th>Déboursé/u.</th><th>Vente/u.</th><th>Total HT</th><th /></tr></thead><tbody>{lot.postes.map((poste) => <tr key={poste.id} className={!poste.isSelected ? "option-row" : ""}><td><input type="checkbox" checked={poste.isSelected} onChange={() => togglePoste(poste)} disabled={detail.statut !== "BROUILLON" || working} /></td><td><strong>{poste.code}</strong><span className="poste-name">{poste.designation}</span>{poste.metres.length > 0 && <small className="metre-note">⌗ {poste.metres.map((metre) => `${metre.libelle} : ${metre.quantite}`).join(" · ")}</small>}</td><td>{poste.unite}</td><td><strong>{Number(poste.quantite).toLocaleString("fr-FR")}</strong></td><td>{euro(poste.debourseUnitaire)}</td><td>{euro(poste.prixUnitaireHt)}</td><td><strong>{euro(poste.totalVenteHt)}</strong></td><td><button className="row-action" title="Ajouter un métré" onClick={() => { setTargetPoste(poste.id); setEditor("metre"); }} disabled={detail.statut !== "BROUILLON"}>⌗</button></td></tr>)}</tbody></table></div></div>)}
            {!detail.lots.length && <div className="empty"><span>⌗</span><h3>Commencez par un lot</h3><p>Exemple : 01 Maçonnerie, 02 Charpente, 03 Couverture.</p></div>}
          </div>
        </> : <div className="panel empty"><span>⌗</span><h3>Sélectionnez ou créez une DPGF</h3><p>Le chiffrage détaillé apparaîtra ici.</p></div>}
      </section>
    </div>
    {editor && <DpgfDialog kind={editor} detail={detail} chantiers={chantiers} targetLot={targetLot} targetPoste={targetPoste} working={working} close={() => setEditor(null)} submit={submit} setSelectedId={setSelectedId} />}
  </div>;
}

function DpgfDialog({ kind, detail, chantiers, targetLot, targetPoste, working, close, submit, setSelectedId }: { kind: "dpgf" | "lot" | "poste" | "metre"; detail: DpgfDetail | null; chantiers: RecordValue[]; targetLot: string; targetPoste: string; working: boolean; close: () => void; submit: (path: string, body: Record<string, unknown>, after?: (result: any) => void) => void; setSelectedId: (id: string) => void }) { // eslint-disable-line @typescript-eslint/no-explicit-any
  function send(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); const value = (name: string) => String(form.get(name) ?? ""); const number = (name: string) => Number(value(name));
    if (kind === "dpgf") return submit("/dpgf", { chantierId: value("chantierId"), nom: value("nom"), coefficientFraisGeneraux: number("coefficientFraisGeneraux"), coefficientMarge: number("coefficientMarge") }, (result) => setSelectedId(result.id));
    if (kind === "lot") return submit(`/dpgf/${detail?.id}/lots`, { code: value("code"), designation: value("designation"), ordre: number("ordre") });
    if (kind === "poste") return submit(`/dpgf/lots/${value("lotId")}/postes`, { code: value("code"), designation: value("designation"), unite: value("unite"), quantite: number("quantite"), debourseUnitaire: number("debourseUnitaire"), coefficientVente: number("coefficientVente"), type: value("type"), isSelected: true });
    const variables = Object.fromEntries(value("variables").split(";").filter(Boolean).map((entry) => { const [key, raw] = entry.split("="); return [key.trim(), Number(raw)]; }));
    return submit(`/dpgf/postes/${value("posteId")}/metres`, { libelle: value("libelle"), formule: value("formule") || undefined, variables, quantite: value("quantite") ? number("quantite") : undefined, coefficient: number("coefficient") });
  }
  const titles = { dpgf: "Nouvelle DPGF", lot: "Ajouter un lot", poste: "Ajouter un poste", metre: "Ajouter un métré" };
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && close()}><form className="modal-card" onSubmit={send}><div className="modal-head"><div><p className="eyebrow">DPGF & MÉTRÉS</p><h3>{titles[kind]}</h3></div><button type="button" onClick={close}>×</button></div>
    {kind === "dpgf" && <><label>Chantier<select name="chantierId" required defaultValue=""><option value="" disabled>Choisir un chantier…</option>{chantiers.map((chantier) => <option value={String(chantier.id)} key={String(chantier.id)}>{String(chantier.reference)} · {String(chantier.objet)}</option>)}</select></label><label>Nom du chiffrage<input name="nom" required placeholder="Rénovation maison de maître" /></label><div className="form-grid"><label>Coefficient frais généraux<input name="coefficientFraisGeneraux" type="number" min="1" step="0.01" defaultValue="1.12" required /></label><label>Coefficient de marge<input name="coefficientMarge" type="number" min="1" step="0.01" defaultValue="1.18" required /></label></div></>}
    {kind === "lot" && <><div className="form-grid"><label>Code<input name="code" required placeholder="01" /></label><label>Ordre<input name="ordre" type="number" min="0" defaultValue={detail?.lots.length ?? 0} required /></label></div><label>Désignation<input name="designation" required placeholder="Maçonnerie ancienne" /></label></>}
    {kind === "poste" && <><label>Lot<select name="lotId" required defaultValue={targetLot}>{detail?.lots.map((lot) => <option value={lot.id} key={lot.id}>{lot.code} · {lot.designation}</option>)}</select></label><div className="form-grid"><label>Code<input name="code" required placeholder="01.01" /></label><label>Unité<select name="unite" defaultValue="m²"><option>m²</option><option>ml</option><option>m³</option><option>u</option><option>h</option><option>forfait</option></select></label></div><label>Désignation<input name="designation" required placeholder="Rejointoiement pierre à la chaux" /></label><div className="form-grid three"><label>Quantité initiale<input name="quantite" type="number" min="0" step="0.001" defaultValue="0" /></label><label>Déboursé unitaire<input name="debourseUnitaire" type="number" min="0" step="0.01" required /></label><label>Coefficient vente<input name="coefficientVente" type="number" min="1" step="0.01" defaultValue="1.25" required /></label></div><label>Nature<select name="type" defaultValue="BASE"><option value="BASE">Base</option><option value="OPTION">Option</option><option value="VARIANTE">Variante</option></select></label></>}
    {kind === "metre" && <><label>Poste<select name="posteId" required defaultValue={targetPoste}>{detail?.lots.flatMap((lot) => lot.postes).map((poste) => <option value={poste.id} key={poste.id}>{poste.code} · {poste.designation}</option>)}</select></label><label>Libellé du relevé<input name="libelle" required placeholder="Façade cour" /></label><div className="form-grid"><label>Formule<input name="formule" placeholder="(L*H)-OUVERTURES" /></label><label>Variables<input name="variables" placeholder="L=12.4;H=6.2;OUVERTURES=8" /></label></div><div className="form-grid"><label>Ou quantité directe<input name="quantite" type="number" min="0" step="0.001" /></label><label>Coefficient<input name="coefficient" type="number" min="0" step="0.001" defaultValue="1" required /></label></div><p className="form-hint">Utilisez +, −, ×, / et des parenthèses. Les variables sont séparées par des points-virgules.</p></>}
    <div className="modal-actions"><button className="secondary compact" type="button" onClick={close}>Annuler</button><button className="primary compact" disabled={working || (kind === "dpgf" && !chantiers.length)}>{working ? "Enregistrement…" : "Enregistrer"}</button></div>{kind === "dpgf" && !chantiers.length && <p className="form-error">Créez d’abord un chantier pour rattacher cette DPGF.</p>}</form></div>;
}

function Kpi({ label: text, value, note, accent = "plain" }: { label: string; value: string | number; note: string; accent?: string }) { return <article className={`kpi ${accent}`}><p>{text}</p><strong>{value}</strong><small>{note}</small></article>; }
function Status({ value }: { value: unknown }) { const text = String(value ?? "INCONNU"); return <span className={`status status-${text.toLowerCase()}`}>{label(text)}</span>; }
function PanelTitle({ title, action, onClick }: { title: string; action?: string; onClick?: () => void }) { return <div className="panel-title"><h3>{title}</h3>{action && <button onClick={onClick}>{action} →</button>}</div>; }
function Todo({ tone, title, text }: { tone: string; title: string; text: string }) { return <div className="todo"><span className={tone}>!</span><div><strong>{title}</strong><small>{text}</small></div><b>›</b></div>; }
