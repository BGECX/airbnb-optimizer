"use client";

import { ChangeEvent, PointerEvent, useEffect, useMemo, useRef, useState } from "react";
import styles from "./VectorLogoStudio.module.css";

type LayerType = "text" | "rect" | "circle" | "path" | "image";
type Layer = {
  id: string;
  name: string;
  type: LayerType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fill: string;
  opacity: number;
  visible: boolean;
  locked: boolean;
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  letterSpacing?: number;
  path?: string;
  href?: string;
};

type Props = { onSendToAi?: (svgDataUrl: string) => void };
type Version = { id: string; name: string; layers: Layer[]; background: string; createdAt: string };
const WIDTH = 800;
const HEIGHT = 500;
const fonts = ["Arial", "Helvetica", "Trebuchet MS", "Georgia", "Palatino", "Times New Roman", "Verdana", "Courier New"];
const icons = [
  { label: "Monogramme", path: "M18 82 50 18l32 64H65L50 50 35 82Z" },
  { label: "Arche", path: "M15 85V48a35 35 0 0 1 70 0v37H65V50a15 15 0 0 0-30 0v35Z" },
  { label: "Hexagone", path: "m50 6 39 22v44L50 94 11 72V28Z" },
  { label: "Pierre", path: "m14 70 9-43L61 10l27 28-6 47-44 10Z" },
  { label: "Compas", path: "M50 6 63 45l31 5-31 6-13 38-13-38-31-6 31-5Z" },
  { label: "Éclat", path: "m50 5 9 34 33-13-25 24 25 24-33-13-9 34-9-34L8 74l25-24L8 26l33 13Z" },
];
const uid = () => Math.random().toString(36).slice(2, 10);
const escapeXml = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const encodeSvg = (svg: string) => `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(svg)))}`;

function initialLayers(): Layer[] {
  return [
    { id: uid(), name: "Accent", type: "rect", x: 300, y: 337, width: 190, height: 12, rotation: 0, fill: "#f59e0b", opacity: 1, visible: true, locked: false },
    { id: uid(), name: "Symbole", type: "path", x: 95, y: 145, width: 165, height: 165, rotation: 0, fill: "#12345b", opacity: 1, visible: true, locked: false, path: icons[1].path },
    { id: uid(), name: "Nom de l’entreprise", type: "text", x: 300, y: 190, width: 420, height: 92, rotation: 0, fill: "#12345b", opacity: 1, visible: true, locked: false, text: "VOTRE ENTREPRISE", fontFamily: "Arial", fontSize: 54, fontWeight: 800, letterSpacing: 1 },
    { id: uid(), name: "Signature", type: "text", x: 302, y: 285, width: 390, height: 48, rotation: 0, fill: "#52657a", opacity: 1, visible: true, locked: false, text: "Votre savoir-faire, notre exigence", fontFamily: "Arial", fontSize: 22, fontWeight: 400, letterSpacing: .4 },
  ];
}

function layerMarkup(layer: Layer) {
  if (!layer.visible) return "";
  const transform = `translate(${layer.x} ${layer.y}) rotate(${layer.rotation} ${layer.width / 2} ${layer.height / 2})`;
  const common = `opacity="${layer.opacity}"`;
  if (layer.type === "text") return `<g transform="${transform}" ${common}><text x="0" y="${layer.fontSize ?? 40}" fill="${layer.fill}" font-family="${escapeXml(layer.fontFamily ?? "Arial")}" font-size="${layer.fontSize ?? 40}" font-weight="${layer.fontWeight ?? 700}" letter-spacing="${layer.letterSpacing ?? 0}">${escapeXml(layer.text ?? "Texte")}</text></g>`;
  if (layer.type === "rect") return `<g transform="${transform}" ${common}><rect width="${layer.width}" height="${layer.height}" rx="${Math.min(12, layer.height / 2)}" fill="${layer.fill}"/></g>`;
  if (layer.type === "circle") return `<g transform="${transform}" ${common}><ellipse cx="${layer.width / 2}" cy="${layer.height / 2}" rx="${layer.width / 2}" ry="${layer.height / 2}" fill="${layer.fill}"/></g>`;
  if (layer.type === "image") return `<g transform="${transform}" ${common}><image href="${layer.href}" width="${layer.width}" height="${layer.height}" preserveAspectRatio="xMidYMid meet"/></g>`;
  return `<g transform="${transform} scale(${layer.width / 100} ${layer.height / 100})" ${common}><path d="${layer.path}" fill="${layer.fill}"/></g>`;
}

function makeSvg(layers: Layer[], background: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}">${background !== "transparent" ? `<rect width="${WIDTH}" height="${HEIGHT}" fill="${background}"/>` : ""}${layers.map(layerMarkup).join("")}</svg>`;
}

export default function VectorLogoStudio({ onSendToAi }: Props) {
  const [layers, setLayers] = useState<Layer[]>(initialLayers);
  const [selectedId, setSelectedId] = useState<string | null>(layers[2]?.id ?? null);
  const [background, setBackground] = useState("#ffffff");
  const [past, setPast] = useState<Layer[][]>([]);
  const [future, setFuture] = useState<Layer[][]>([]);
  const [error, setError] = useState("");
  const [versions, setVersions] = useState<Version[]>([]);
  const drag = useRef<{ id: string; startX: number; startY: number; x: number; y: number; before: Layer[] } | null>(null);
  const canvasRef = useRef<SVGSVGElement>(null);
  const selected = layers.find((layer) => layer.id === selectedId) ?? null;
  const svg = useMemo(() => makeSvg(layers, background), [layers, background]);

  const commit = (next: Layer[] | ((current: Layer[]) => Layer[])) => {
    setLayers((current) => {
      const value = typeof next === "function" ? next(current) : next;
      setPast((items) => [...items.slice(-29), current]);
      setFuture([]);
      return value;
    });
  };
  const patchSelected = (patch: Partial<Layer>) => selectedId && commit((current) => current.map((layer) => layer.id === selectedId ? { ...layer, ...patch } : layer));
  const undo = () => setPast((items) => {
    const previous = items.at(-1);
    if (!previous) return items;
    setFuture((next) => [layers, ...next].slice(0, 30));
    setLayers(previous);
    return items.slice(0, -1);
  });
  const redo = () => setFuture((items) => {
    const next = items[0];
    if (!next) return items;
    setPast((previous) => [...previous, layers].slice(-30));
    setLayers(next);
    return items.slice(1);
  });

  useEffect(() => {
    const keyboard = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") { event.preventDefault(); event.shiftKey ? redo() : undo(); return; }
      if ((event.key === "Delete" || event.key === "Backspace") && selectedId) { event.preventDefault(); commit((current) => current.filter((layer) => layer.id !== selectedId)); setSelectedId(null); return; }
      const delta = event.shiftKey ? 10 : 1;
      if (selected && !selected.locked && ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
        event.preventDefault();
        patchSelected({ x: selected.x + (event.key === "ArrowLeft" ? -delta : event.key === "ArrowRight" ? delta : 0), y: selected.y + (event.key === "ArrowUp" ? -delta : event.key === "ArrowDown" ? delta : 0) });
      }
    };
    window.addEventListener("keydown", keyboard);
    return () => window.removeEventListener("keydown", keyboard);
  });

  const addLayer = (type: LayerType, extra: Partial<Layer> = {}) => {
    const layer: Layer = { id: uid(), name: type === "text" ? "Nouveau texte" : type === "circle" ? "Forme ronde" : type === "path" ? "Symbole" : "Forme", type, x: 280, y: 205, width: type === "text" ? 300 : 110, height: type === "text" ? 70 : 110, rotation: 0, fill: "#12345b", opacity: 1, visible: true, locked: false, text: "NOUVEAU TEXTE", fontFamily: "Arial", fontSize: 42, fontWeight: 700, letterSpacing: 0, ...extra };
    commit((current) => [...current, layer]); setSelectedId(layer.id);
  };
  const pointerDown = (event: PointerEvent<SVGGElement>, layer: Layer) => {
    event.stopPropagation(); setSelectedId(layer.id);
    if (layer.locked) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { id: layer.id, startX: event.clientX, startY: event.clientY, x: layer.x, y: layer.y, before: layers };
  };
  const pointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (!drag.current || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect(), scaleX = WIDTH / rect.width, scaleY = HEIGHT / rect.height;
    const { id, startX, startY, x, y } = drag.current;
    setLayers((current) => current.map((layer) => layer.id === id ? { ...layer, x: Math.round(x + (event.clientX - startX) * scaleX), y: Math.round(y + (event.clientY - startY) * scaleY) } : layer));
  };
  const pointerUp = () => {
    if (!drag.current) return;
    setPast((items) => [...items.slice(-29), drag.current!.before]); setFuture([]); drag.current = null;
  };
  const moveLayer = (direction: -1 | 1) => selectedId && commit((current) => {
    const index = current.findIndex((layer) => layer.id === selectedId), next = Math.max(0, Math.min(current.length - 1, index + direction));
    if (index < 0 || index === next) return current;
    const copy = [...current], [item] = copy.splice(index, 1); copy.splice(next, 0, item); return copy;
  });
  const duplicate = () => selected && addLayer(selected.type, { ...selected, id: uid(), name: `${selected.name} copie`, x: selected.x + 18, y: selected.y + 18 });
  const align = (kind: "left" | "center" | "right" | "top" | "middle" | "bottom") => {
    if (!selected || selected.locked) return;
    const patch: Partial<Layer> = {};
    if (kind === "left") patch.x = 0;
    if (kind === "center") patch.x = Math.round((WIDTH - selected.width) / 2);
    if (kind === "right") patch.x = WIDTH - selected.width;
    if (kind === "top") patch.y = 0;
    if (kind === "middle") patch.y = Math.round((HEIGHT - selected.height) / 2);
    if (kind === "bottom") patch.y = HEIGHT - selected.height;
    patchSelected(patch);
  };
  const saveVersion = (name = `Version ${versions.length + 1}`) => setVersions((current) => [{ id: uid(), name, layers: structuredClone(layers), background, createdAt: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) }, ...current].slice(0, 12));
  const restoreVersion = (version: Version) => { setPast((items) => [...items.slice(-29), layers]); setLayers(structuredClone(version.layers)); setBackground(version.background); setFuture([]); setSelectedId(null); };
  const createPaletteVariant = (primary: string, accent: string) => {
    const sourceColors = [...new Set(layers.filter((layer) => layer.type !== "image").map((layer) => layer.fill))];
    const recolored = layers.map((layer) => ({ ...layer, fill: layer.fill === sourceColors[0] ? primary : layer.fill === sourceColors[1] ? accent : layer.fill }));
    setPast((items) => [...items.slice(-29), layers]); setLayers(recolored); setFuture([]);
  };
  const downloadSvg = () => {
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" })), link = document.createElement("a");
    link.href = url; link.download = "logo-kritia-studio.svg"; link.click(); URL.revokeObjectURL(url);
  };
  const downloadPng = () => {
    const image = new Image(); image.onload = () => { const canvas = document.createElement("canvas"); canvas.width = WIDTH * 2; canvas.height = HEIGHT * 2; const context = canvas.getContext("2d"); if (!context) return; context.scale(2, 2); context.drawImage(image, 0, 0, WIDTH, HEIGHT); const link = document.createElement("a"); link.href = canvas.toDataURL("image/png"); link.download = "logo-kritia-studio.png"; link.click(); }; image.src = encodeSvg(svg);
  };
  const exportPdf = () => {
    const popup = window.open("", "_blank", "width=1000,height=720");
    if (!popup) { setError("Autorisez les fenêtres surgissantes pour exporter le PDF."); return; }
    popup.document.write(`<!doctype html><html><head><title>Logo KRITIA Studio</title><style>@page{size:A4 landscape;margin:15mm}body{margin:0;display:grid;place-items:center;height:180mm}svg{max-width:100%;max-height:100%}</style></head><body>${svg}<script>window.onload=()=>setTimeout(()=>window.print(),150)</script></body></html>`);
    popup.document.close();
  };
  const importSvg = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; setError(""); if (!file) return;
    if (file.size > 1024 * 1024) { setError("Le SVG ne doit pas dépasser 1 Mo."); return; }
    const reader = new FileReader(); reader.onload = () => { const text = String(reader.result || ""); const unsafe = /<(?:script|foreignObject|iframe|object|embed)[\s>]/i.test(text) || /\son\w+\s*=/i.test(text) || /javascript:/i.test(text); if (!/^\s*(?:<\?xml[^>]*>\s*)?<svg[\s>]/i.test(text) || unsafe) { setError("Ce SVG est invalide ou contient des éléments non autorisés."); return; } addLayer("image", { name: file.name, x: 100, y: 75, width: 600, height: 350, href: encodeSvg(text) }); }; reader.readAsText(file);
  };

  return <section className={styles.studio}>
    <div className={styles.head}><div><h3>Studio vectoriel</h3><p>Composez un logo précis à partir d’objets indépendants et exportez-le sans perte de qualité.</p></div><span className={styles.badge}>SVG professionnel</span></div>
    <div className={styles.toolbar}>
      <button type="button" onClick={() => addLayer("text")}>T Texte</button><button type="button" onClick={() => addLayer("rect")}>▭ Rectangle</button><button type="button" onClick={() => addLayer("circle")}>● Ellipse</button>
      <div className={styles.symbolMenu}>{icons.map((icon) => <button type="button" key={icon.label} title={icon.label} onClick={() => addLayer("path", { name: icon.label, path: icon.path })}>◇ {icon.label}</button>)}</div>
      <div className={styles.alignTools}><button type="button" title="Aligner à gauche" onClick={() => align("left")}>⫷</button><button type="button" title="Centrer horizontalement" onClick={() => align("center")}>↔</button><button type="button" title="Aligner à droite" onClick={() => align("right")}>⫸</button><button type="button" title="Aligner en haut" onClick={() => align("top")}>⌃</button><button type="button" title="Centrer verticalement" onClick={() => align("middle")}>↕</button><button type="button" title="Aligner en bas" onClick={() => align("bottom")}>⌄</button></div>
      <span className={styles.spacer}/><button type="button" disabled={!past.length} onClick={undo}>↶ Annuler</button><button type="button" disabled={!future.length} onClick={redo}>↷ Rétablir</button>
    </div>
    <div className={styles.workspace}>
      <aside className={styles.layers}><strong>Calques</strong>{[...layers].reverse().map((layer) => <button type="button" key={layer.id} className={layer.id === selectedId ? styles.activeLayer : ""} onClick={() => setSelectedId(layer.id)}><span>{layer.visible ? "◉" : "○"}</span><span>{layer.name}</span><small>{layer.locked ? "🔒" : ""}</small></button>)}<div className={styles.layerActions}><button type="button" onClick={() => moveLayer(1)}>↑</button><button type="button" onClick={() => moveLayer(-1)}>↓</button><button type="button" onClick={duplicate}>Dupliquer</button><button type="button" onClick={() => { if (selectedId) commit((current) => current.filter((layer) => layer.id !== selectedId)); setSelectedId(null); }}>Supprimer</button></div></aside>
      <main className={styles.canvasWrap}>
        <div className={styles.canvasTools}><label>Fond <input type="color" value={background === "transparent" ? "#ffffff" : background} onChange={(event) => setBackground(event.target.value)}/></label><button type="button" onClick={() => setBackground(background === "transparent" ? "#ffffff" : "transparent")}>{background === "transparent" ? "Fond blanc" : "Fond transparent"}</button><span>800 × 500</span></div>
        <svg ref={canvasRef} className={styles.canvas} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} onPointerDown={() => setSelectedId(null)}>
          {background !== "transparent" && <rect width={WIDTH} height={HEIGHT} fill={background}/>}<defs><pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#dbe3ea" strokeWidth=".6"/></pattern></defs>{background === "transparent" && <rect width={WIDTH} height={HEIGHT} fill="url(#grid)"/>}
          {layers.map((layer) => layer.visible && <g key={layer.id} onPointerDown={(event) => pointerDown(event, layer)} transform={`translate(${layer.x} ${layer.y}) rotate(${layer.rotation} ${layer.width / 2} ${layer.height / 2})`} opacity={layer.opacity} className={styles.artwork}>
            {layer.type === "text" && <text x="0" y={layer.fontSize ?? 40} fill={layer.fill} fontFamily={layer.fontFamily} fontSize={layer.fontSize} fontWeight={layer.fontWeight} letterSpacing={layer.letterSpacing}>{layer.text}</text>}
            {layer.type === "rect" && <rect width={layer.width} height={layer.height} rx={Math.min(12, layer.height / 2)} fill={layer.fill}/>} {layer.type === "circle" && <ellipse cx={layer.width / 2} cy={layer.height / 2} rx={layer.width / 2} ry={layer.height / 2} fill={layer.fill}/>} {layer.type === "path" && <path d={layer.path} fill={layer.fill} transform={`scale(${layer.width / 100} ${layer.height / 100})`}/>} {layer.type === "image" && <image href={layer.href} width={layer.width} height={layer.height} preserveAspectRatio="xMidYMid meet"/>}
          </g>) }
          {selected && selected.visible && <g pointerEvents="none" transform={`translate(${selected.x} ${selected.y}) rotate(${selected.rotation} ${selected.width / 2} ${selected.height / 2})`}><rect width={selected.width} height={selected.height} fill="none" stroke="#2563eb" strokeWidth="2" strokeDasharray="7 5"/><circle cx={selected.width} cy={selected.height} r="7" fill="#fff" stroke="#2563eb" strokeWidth="3"/></g>}
        </svg>
      </main>
      <aside className={styles.properties}><strong>Propriétés</strong>{selected ? <>
        <label>Nom du calque<input value={selected.name} onChange={(event) => patchSelected({ name: event.target.value })}/></label>{selected.type === "text" && <><label>Texte<textarea value={selected.text} onChange={(event) => patchSelected({ text: event.target.value })}/></label><label>Police<select value={selected.fontFamily} onChange={(event) => patchSelected({ fontFamily: event.target.value })}>{fonts.map((font) => <option key={font}>{font}</option>)}</select></label><div className={styles.two}><label>Taille<input type="number" min="8" max="180" value={selected.fontSize} onChange={(event) => patchSelected({ fontSize: Number(event.target.value) })}/></label><label>Graisse<select value={selected.fontWeight} onChange={(event) => patchSelected({ fontWeight: Number(event.target.value) })}><option value="400">Normal</option><option value="600">Semi-gras</option><option value="700">Gras</option><option value="800">Extra-gras</option></select></label></div></>}
        <div className={styles.two}><label>X<input type="number" value={selected.x} onChange={(event) => patchSelected({ x: Number(event.target.value) })}/></label><label>Y<input type="number" value={selected.y} onChange={(event) => patchSelected({ y: Number(event.target.value) })}/></label><label>Largeur<input type="number" min="1" value={selected.width} onChange={(event) => patchSelected({ width: Number(event.target.value) })}/></label><label>Hauteur<input type="number" min="1" value={selected.height} onChange={(event) => patchSelected({ height: Number(event.target.value) })}/></label></div>
        <label>Rotation <span>{selected.rotation}°</span><input type="range" min="-180" max="180" value={selected.rotation} onChange={(event) => patchSelected({ rotation: Number(event.target.value) })}/></label><label>Opacité <span>{Math.round(selected.opacity * 100)}%</span><input type="range" min="0" max="1" step=".05" value={selected.opacity} onChange={(event) => patchSelected({ opacity: Number(event.target.value) })}/></label><label>Couleur<input type="color" value={selected.fill} onChange={(event) => patchSelected({ fill: event.target.value })}/></label>
        <div className={styles.toggles}><button type="button" onClick={() => patchSelected({ visible: !selected.visible })}>{selected.visible ? "Masquer" : "Afficher"}</button><button type="button" onClick={() => patchSelected({ locked: !selected.locked })}>{selected.locked ? "Déverrouiller" : "Verrouiller"}</button></div>
      </> : <p>Sélectionnez un objet sur le canevas ou dans les calques.</p>}</aside>
    </div>
    <div className={styles.designShelf}><div><strong>Variantes couleur</strong><div className={styles.palettes}>{[["#12345b","#f59e0b"],["#0f3d3e","#ef8354"],["#252422","#eb5e28"],["#1f2937","#10b981"],["#4c1d95","#f472b6"]].map(([primary, accent]) => <button type="button" key={primary} title="Appliquer cette palette" onClick={() => createPaletteVariant(primary, accent)}><i style={{ background: primary }}/><i style={{ background: accent }}/></button>)}</div></div><div className={styles.versionHistory}><strong>Historique des versions</strong><button type="button" onClick={() => saveVersion()}>＋ Enregistrer l’état</button>{versions.length ? <select defaultValue="" onChange={(event) => { const version = versions.find((item) => item.id === event.target.value); if (version) restoreVersion(version); event.target.value = ""; }}><option value="" disabled>Restaurer une version…</option>{versions.map((version) => <option key={version.id} value={version.id}>{version.name} · {version.createdAt}</option>)}</select> : <small>Aucune version enregistrée</small>}</div></div>
    {error && <p className={styles.error}>{error}</p>}
    <div className={styles.footer}><label className={styles.upload}>Importer un SVG<input type="file" accept=".svg,image/svg+xml" onChange={importSvg}/></label><button type="button" onClick={downloadSvg}>Télécharger SVG</button><button type="button" onClick={exportPdf}>Exporter PDF</button><button type="button" onClick={downloadPng}>Télécharger PNG HD</button>{onSendToAi && <button type="button" className={styles.aiButton} onClick={() => onSendToAi(encodeSvg(svg))}>✦ Améliorer avec l’IA</button>}</div>
  </section>;
}
