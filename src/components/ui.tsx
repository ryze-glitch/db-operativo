import { useEffect, useState, type CSSProperties, type ReactNode } from "react"
import { vai } from "@/router"
import { COLORE_URGENZA, iniziali, type Scadenza } from "@/model"
import { ICONE } from "@/icons"

const svgCache: Record<string, string> = {}
const svg = (n: string, fill: boolean) => {
  const k = fill && ICONE[`${n}-fill`] ? `${n}-fill` : n
  if (!svgCache[k]) svgCache[k] = (ICONE[k] ?? ICONE.help ?? "").replace(/<svg [^>]*viewBox="([^"]+)"[^>]*>/, '<svg xmlns="http://www.w3.org/2000/svg" viewBox="$1" width="100%" height="100%" fill="currentColor">')
  return svgCache[k]
}

export function Icona({ n, size = 24, fill = false, style, slot }: { n: string; size?: number; fill?: boolean; style?: CSSProperties; slot?: string }) {
  return <md-icon aria-hidden="true" slot={slot} style={{ width: size, height: size, "--md-icon-size": `${size}px`, ...style } as CSSProperties} dangerouslySetInnerHTML={{ __html: svg(n, fill) }} />
}

// Casella di ricerca stile Gemini: Invio apre la pagina dei risultati
export function PromptBox({ placeholder, valoreIniziale = "", width = 760, autoFocus = false }: { placeholder: string; valoreIniziale?: string; width?: number; autoFocus?: boolean }) {
  const [q, setQ] = useState(valoreIniziale)
  useEffect(() => setQ(valoreIniziale), [valoreIniziale])
  const invia = () => { if (q.trim()) vai(`/cerca?q=${encodeURIComponent(q.trim())}`) }
  return (
    <form onSubmit={(e) => { e.preventDefault(); invia() }} style={{ width, maxWidth: "100%", background: "var(--g-surface)", borderRadius: 32, padding: "16px 12px 8px 24px", display: "flex", flexDirection: "column", gap: 8 }}>
      <input
        id="cerca-globale" value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} autoFocus={autoFocus} aria-label="Cerca"
        style={{ font: "inherit", fontSize: 16, background: "transparent", border: "none", outline: "none", color: "var(--g-text)", padding: "4px 0" }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: -12 }}>
        <md-icon-button type="button" aria-label="Nuova identificazione" onClick={() => vai("/foglio?nuovo=1")}><Icona n="add" /></md-icon-button>
        <button type="button" className="g-chip" style={{ background: "transparent" }} onClick={() => vai("/cerca?q=scadenza")}><md-ripple /><Icona n="timer" size={20} />In scadenza</button>
        <span className="hide-mobile" style={{ marginLeft: "auto", fontSize: 12, color: "var(--g-muted)", border: "1px solid var(--g-line)", borderRadius: 8, padding: "2px 8px" }}>Ctrl K</span>
        <md-icon-button type="submit" aria-label="Cerca" style={{ marginLeft: 4 }}><Icona n="arrow_upward" /></md-icon-button>
      </div>
    </form>
  )
}

export function Modale({ aperto, onChiudi, titolo, children, larghezza = 640 }: { aperto: boolean; onChiudi: () => void; titolo: string; children: ReactNode; larghezza?: number }) {
  useEffect(() => {
    if (!aperto) return
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") onChiudi() }
    window.addEventListener("keydown", esc)
    return () => window.removeEventListener("keydown", esc)
  }, [aperto, onChiudi])
  if (!aperto) return null
  return (
    <div onMouseDown={(e) => { if (e.target === e.currentTarget) onChiudi() }} style={{ position: "fixed", inset: 0, zIndex: 50, background: "var(--g-scrim)", display: "grid", placeItems: "center", padding: 16 }}>
      <div role="dialog" aria-modal="true" aria-label={titolo} className="fade-in" style={{ width: larghezza, maxWidth: "100%", maxHeight: "calc(100vh - 32px)", overflow: "auto", background: "var(--g-bg)", border: "1px solid var(--g-line)", borderRadius: 28, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <h2 style={{ fontSize: 22, fontWeight: 500, flex: 1 }}>{titolo}</h2>
          <md-icon-button aria-label="Chiudi" onClick={onChiudi}><Icona n="close" /></md-icon-button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function AvatarIniziali({ nome, colore = "var(--g-text)", size = 36, foto }: { nome: string; colore?: string; size?: number; foto?: string }) {
  const [errore, setErrore] = useState(false)
  const url = foto && /^https?:\/\//i.test(foto) && !errore ? foto : ""
  return url
    ? <img src={url} alt="" onError={() => setErrore(true)} style={{ width: size, height: size, borderRadius: size / 2, objectFit: "cover", flex: "none" }} />
    : <span style={{ width: size, height: size, flex: "none", borderRadius: size / 2, background: "var(--g-raise)", color: colore, display: "grid", placeItems: "center", fontSize: size * 0.36, fontWeight: 700 }}>{iniziali(nome)}</span>
}

export function BarraScadenza({ s }: { s: Scadenza }) {
  const c = COLORE_URGENZA[s.urgenza]
  return (
    <span style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ color: c, fontWeight: 600 }}>{s.etichetta}</span>
      <md-linear-progress value={s.progresso} style={{ "--md-linear-progress-active-indicator-color": c, "--md-linear-progress-track-color": "var(--g-raise)" } as CSSProperties} />
    </span>
  )
}

export function Vuoto({ icona, titolo, testo, children }: { icona: string; titolo: string; testo?: string; children?: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "48px 16px", textAlign: "center" }}>
      <span style={{ width: 56, height: 56, borderRadius: 28, background: "var(--g-surface)", display: "grid", placeItems: "center", color: "var(--g-muted)" }}><Icona n={icona} size={28} /></span>
      <span style={{ fontSize: 16, fontWeight: 500 }}>{titolo}</span>
      {testo && <span className="muted" style={{ fontSize: 14, maxWidth: 420 }}>{testo}</span>}
      {children}
    </div>
  )
}

export function Toast({ messaggio, tipo = "ok", onFine }: { messaggio: string | null; tipo?: "ok" | "errore"; onFine: () => void }) {
  useEffect(() => {
    if (!messaggio) return
    const t = setTimeout(onFine, 3500)
    return () => clearTimeout(t)
  }, [messaggio, onFine])
  if (!messaggio) return null
  return (
    <div role="status" className="fade-in" style={{ position: "fixed", left: "50%", bottom: 24, transform: "translateX(-50%)", zIndex: 60, background: tipo === "errore" ? "var(--g-danger-bg)" : "var(--g-text)", color: tipo === "errore" ? "var(--g-danger-fg)" : "var(--g-bg)", padding: "12px 20px", borderRadius: 12, fontSize: 14, display: "flex", alignItems: "center", gap: 10, boxShadow: "0 4px 12px rgba(0,0,0,.3)" }}>
      <Icona n={tipo === "errore" ? "error" : "check_circle"} size={20} />{messaggio}
    </div>
  )
}
