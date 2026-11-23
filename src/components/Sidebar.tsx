import { useState, type CSSProperties } from "react"
import { isAdmin, type Agente, type LogEntry } from "@/model"
import { Icona } from "./ui"

type Props = {
  aperta: boolean
  stretto: boolean
  setAperta: (v: boolean) => void
  attiva: string
  naviga: (p: string) => void
  nonLetti: number
  logs: LogEntry[]
  tema: string
  setTema: (t: "scuro" | "chiaro") => void
  agente: Agente | null
}

const sezioni = [
  { icon: "home", t: "Panoramica", path: "/home" },
  { icon: "campaign", t: "Comunicazioni", path: "/comunicazioni", badge: true },
  { icon: "person_search", t: "Foglio investigativo", path: "/foglio" },
  { icon: "folder", t: "Fascicoli", path: "", lock: "In arrivo" },
  { icon: "shield_lock", t: "Log di sicurezza", path: "", lock: "In arrivo" },
]

export const turnoAttuale = () => {
  const h = new Date().getHours()
  return h >= 6 && h < 14 ? "Turno mattina" : h >= 14 && h < 22 ? "Turno pomeriggio" : "Turno notte"
}
const pathLog = (azione: string) => (/comunica/i.test(azione) ? "/comunicazioni" : "/foglio")
const ora = (l: LogEntry) => new Date(l.timestamp).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })

const riga: CSSProperties = { position: "relative", display: "flex", alignItems: "center", gap: 12, minHeight: 40, padding: "0 12px", borderRadius: 20, fontSize: 14, color: "var(--g-text)", border: "none", background: "transparent", cursor: "pointer", width: "100%", textAlign: "left", font: "inherit" }

const Badge = ({ n }: { n: number }) => n > 0
  ? <span style={{ minWidth: 20, height: 20, padding: "0 6px", borderRadius: 10, background: "#d96570", color: "#fff", fontSize: 12, fontWeight: 600, display: "grid", placeItems: "center" }}>{n}</span>
  : null

function contenitore(p: Props, larghezza: number, extra: CSSProperties = {}): CSSProperties {
  return {
    width: p.stretto ? 312 : larghezza, flex: "none", display: "flex", flexDirection: "column", overflow: "hidden",
    ...(p.stretto ? { position: "fixed", inset: "0 auto 0 0", zIndex: 40, transform: p.aperta ? "none" : "translateX(-100%)", transition: "transform .2s" } : { position: "sticky", top: 0, height: "100vh" }),
    ...extra,
  }
}

// Menu chiuso: binario di sole icone, come Gemini con il menu chiuso
function Binario(p: Props) {
  const pulsante = (icona: string, etichetta: string, onClick: () => void, attivo = false, badge = 0, bloccato = false) => (
    <button key={etichetta} title={etichetta} aria-label={etichetta} disabled={bloccato} onClick={onClick} aria-current={attivo ? "page" : undefined}
      style={{ position: "relative", width: 48, height: 48, borderRadius: 24, border: "none", display: "grid", placeItems: "center", cursor: bloccato ? "default" : "pointer", background: attivo ? "var(--g-active)" : "transparent", color: attivo ? "var(--g-active-fg)" : bloccato ? "var(--g-line)" : "var(--g-muted)" }}>
      {!bloccato && <md-ripple />}<Icona n={icona} fill={attivo} />
      {badge > 0 && <span style={{ position: "absolute", top: 8, right: 8, width: 10, height: 10, borderRadius: 5, background: "#d96570", border: "2px solid var(--g-bg)" }} />}
    </button>
  )
  return (
    <aside style={contenitore(p, 72, { background: "var(--g-bg)", alignItems: "center", padding: "8px 0 12px", gap: 6 })}>
      {pulsante("menu", "Espandi menu", () => p.setAperta(true))}
      {pulsante("edit_square", "Nuova identificazione", () => p.naviga("/foglio?nuovo=1"))}
      <span style={{ width: 24, height: 1, background: "var(--g-line)", margin: "10px 0" }} />
      {sezioni.map((s) => pulsante(s.icon, s.lock ? `${s.t} · ${s.lock}` : s.t, () => s.path && p.naviga(s.path), p.attiva === s.path, s.badge ? p.nonLetti : 0, !!s.lock))}
      <div style={{ marginTop: "auto" }}>
        {pulsante(p.tema === "scuro" ? "light_mode" : "dark_mode", p.tema === "scuro" ? "Tema chiaro" : "Tema scuro", () => p.setTema(p.tema === "scuro" ? "chiaro" : "scuro"))}
      </div>
    </aside>
  )
}

// Menu aperto: pannello flottante arrotondato
function Pannello(p: Props) {
  const [q, setQ] = useState("")
  return (
    <div style={contenitore(p, 312, { padding: p.stretto ? 0 : 8 })}>
      <aside aria-label="Menu" style={{ flex: 1, minHeight: 0, background: "var(--g-side)", borderRadius: p.stretto ? 0 : 28, padding: 12, display: "flex", flexDirection: "column", gap: 2, border: "1px solid color-mix(in srgb, var(--g-line) 50%, transparent)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 4px 12px 8px" }}>
          <span className="g-ring" style={{ width: 32, height: 32, borderRadius: 16, padding: 2, flex: "none" }}><span style={{ width: "100%", height: "100%", borderRadius: 14, background: "var(--g-side)", display: "grid", placeItems: "center", color: "var(--g-blue)" }}><Icona n="local_police" size={18} fill /></span></span>
          <span style={{ fontSize: 16, fontWeight: 500, flex: 1 }}>Squadra Mobile</span>
          <md-icon-button aria-label={p.stretto ? "Chiudi menu" : "Comprimi menu"} onClick={() => p.setAperta(false)}><Icona n={p.stretto ? "close" : "menu"} /></md-icon-button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) { p.naviga(`/cerca?q=${encodeURIComponent(q.trim())}`); setQ("") } }} style={{ display: "flex", alignItems: "center", gap: 8, height: 44, padding: "0 14px", borderRadius: 22, background: "var(--g-bg)", marginBottom: 10 }}>
          <Icona n="search" size={20} style={{ color: "var(--g-muted)" }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cerca" aria-label="Cerca nel terminale" style={{ flex: 1, minWidth: 0, font: "inherit", fontSize: 14, background: "transparent", border: "none", outline: "none", color: "var(--g-text)" }} />
        </form>
        <button onClick={() => p.naviga("/foglio?nuovo=1")} style={{ ...riga, justifyContent: "center", height: 48, background: "var(--g-active)", color: "var(--g-active-fg)", fontWeight: 600, marginBottom: 14 }}>
          <md-ripple /><Icona n="person_add" size={20} />Nuova identificazione
        </button>
        {sezioni.map((s) => {
          const att = p.attiva === s.path
          return (
            <button key={s.t} disabled={!!s.lock} title={s.lock ? `${s.t} · ${s.lock}` : s.t} aria-current={att ? "page" : undefined} onClick={() => s.path && p.naviga(s.path)}
              style={{ ...riga, background: att ? "var(--g-raise)" : "transparent", fontWeight: att ? 600 : 400, color: s.lock ? "var(--g-muted)" : "var(--g-text)", cursor: s.lock ? "default" : "pointer" }}>
              {!s.lock && <md-ripple />}<Icona n={s.icon} fill={att} style={{ color: att ? "var(--g-blue)" : "inherit" }} />
              <span style={{ flex: 1 }}>{s.t}</span>
              {s.badge && <Badge n={p.nonLetti} />}
              {s.lock && <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: "var(--g-raise)" }}>{s.lock}</span>}
            </button>
          )
        })}
        {p.logs.length > 0 && <>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, letterSpacing: "0.06em", color: "var(--g-muted)", padding: "18px 12px 6px" }}><Icona n="history" size={16} />RECENTI</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, overflowY: "auto", minHeight: 0 }}>
            {p.logs.slice(0, 8).map((l) => (
              <button key={l.id} title={`${l.dataOra || ""} · ${l.autore}`} style={{ ...riga, minHeight: 36, fontSize: 13 }} onClick={() => p.naviga(pathLog(l.azione))}>
                <md-ripple /><span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.dettaglio || l.azione}</span>
                <span style={{ fontSize: 11, color: "var(--g-muted)" }}>{ora(l)}</span>
              </button>
            ))}
          </div>
        </>}
        {p.agente && (
          <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 10, padding: 10, borderRadius: 20, background: "var(--g-bg)" }}>
            <span style={{ width: 36, height: 36, borderRadius: 18, background: "#0b57d0", color: "#fff", display: "grid", placeItems: "center", fontWeight: 600, flex: "none" }}>{p.agente.nome.charAt(0).toUpperCase()}</span>
            <span style={{ flex: 1, minWidth: 0, lineHeight: 1.3 }}>
              <span style={{ display: "block", fontSize: 14, fontWeight: 500 }}>{p.agente.nome}</span>
              <span style={{ display: "block", fontSize: 12, color: "var(--g-muted)" }}>{isAdmin(p.agente) ? "Super Admin" : p.agente.grado || "Operatore"} · {turnoAttuale()}</span>
            </span>
            <md-icon-button aria-label={p.tema === "scuro" ? "Tema chiaro" : "Tema scuro"} onClick={() => p.setTema(p.tema === "scuro" ? "chiaro" : "scuro")}><Icona n={p.tema === "scuro" ? "light_mode" : "dark_mode"} /></md-icon-button>
          </div>
        )}
      </aside>
    </div>
  )
}

export function Sidebar(p: Props) {
  return p.aperta || p.stretto ? <Pannello {...p} /> : <Binario {...p} />
}
