import { createContext, useCallback, useContext, useEffect, useState, type CSSProperties, type ReactNode } from "react"
import { useStore } from "@/store"
import { vai } from "@/router"
import { isAdmin, matricolaPura } from "@/model"
import { Icona, Toast } from "./ui"

// ===== Notifiche toast condivise =====
type ToastFn = (msg: string, tipo?: "ok" | "errore") => void
const ToastCtx = createContext<ToastFn>(() => {})
export const useToast = () => useContext(ToastCtx)

// ===== Tema chiaro/scuro =====
const leggiTema = () => { try { return localStorage.getItem("tema") === "chiaro" ? "chiaro" : "scuro" } catch { return "scuro" } }
export function applicaTemaSalvato() { document.documentElement.dataset.tema = leggiTema() }

const turnoAttuale = () => {
  const h = new Date().getHours()
  return h >= 6 && h < 14 ? "Turno mattina" : h >= 14 && h < 22 ? "Turno pomeriggio" : "Turno notte"
}

const voci = [
  { icon: "home", t: "Panoramica", path: "/home" },
  { icon: "campaign", t: "Comunicazioni", path: "/comunicazioni", badge: true },
  { icon: "person_search", t: "Foglio investigativo", path: "/foglio" },
  { icon: "folder", t: "Fascicoli", path: "", lock: "In arrivo" },
  { icon: "shield_lock", t: "Log di sicurezza", path: "", lock: "In arrivo" },
]

const iconaLog = (azione: string) => /elimin/i.test(azione) ? "delete" : /prova/i.test(azione) ? "attach_file" : /comunica/i.test(azione) ? "campaign" : /modific/i.test(azione) ? "edit" : "person_add"

const voce: CSSProperties = { position: "relative", display: "flex", alignItems: "center", gap: 12, minHeight: 40, padding: "0 16px", borderRadius: 20, textDecoration: "none", fontSize: 14, color: "var(--g-text)", border: "none", background: "transparent", cursor: "pointer", width: "100%", textAlign: "left" }

export function Shell({ attiva, children, bottom }: { attiva: string; children: ReactNode; bottom?: ReactNode }) {
  const { agente, annunci, letti, logs, esci } = useStore()
  const [tema, setTema] = useState(leggiTema)
  const [stretto, setStretto] = useState(() => window.innerWidth < 900)
  const [aperta, setAperta] = useState(() => window.innerWidth >= 900)
  const [menuProfilo, setMenuProfilo] = useState(false)
  const [toast, setToast] = useState<{ m: string; t: "ok" | "errore" } | null>(null)
  const mostraToast = useCallback<ToastFn>((m, t = "ok") => setToast({ m, t }), [])

  useEffect(() => {
    const f = () => { const s = window.innerWidth < 900; setStretto(s); if (s) setAperta(false) }
    window.addEventListener("resize", f)
    return () => window.removeEventListener("resize", f)
  }, [])
  useEffect(() => {
    document.documentElement.dataset.tema = tema
    try { localStorage.setItem("tema", tema) } catch { /* ignora */ }
  }, [tema])
  useEffect(() => {
    const f = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); const el = document.getElementById("cerca-globale"); if (el) el.focus(); else vai("/home") } }
    window.addEventListener("keydown", f)
    return () => window.removeEventListener("keydown", f)
  }, [])

  const nonLetti = annunci.filter((a) => !letti.includes(a.id)).length
  const naviga = (p: string) => { vai(p); if (stretto) setAperta(false) }
  const larghezza = aperta ? 288 : 72

  const sidebar = (
    <aside style={{ width: stretto ? 288 : larghezza, flex: "none", background: "var(--g-side)", display: "flex", flexDirection: "column", padding: "12px 12px 16px", gap: 4, transition: "width .2s", overflow: "hidden", ...(stretto ? { position: "fixed", inset: "0 auto 0 0", zIndex: 40, transform: aperta ? "none" : "translateX(-100%)", transition: "transform .2s" } : { position: "sticky", top: 0, height: "100vh" }) }}>
      <md-icon-button aria-label={aperta ? "Comprimi menu" : "Espandi menu"} style={{ margin: "0 0 20px 4px" }} onClick={() => setAperta(!aperta)}><Icona n="menu" /></md-icon-button>
      <button onClick={() => naviga("/foglio?nuovo=1")} style={{ ...voce, background: "var(--g-raise)", alignSelf: "flex-start", width: aperta || stretto ? "auto" : 48, height: 44, padding: aperta || stretto ? "0 20px 0 14px" : "0 12px", color: "var(--g-muted)", fontWeight: 500 }}>
        <md-ripple /><Icona n="edit_square" />{(aperta || stretto) && "Nuova identificazione"}
      </button>
      <div style={{ height: 16 }} />
      {voci.map((v) => {
        const att = attiva === v.path
        const espansa = aperta || stretto
        return (
          <button key={v.t} disabled={!!v.lock} title={v.lock ? `${v.t} · ${v.lock}` : v.t} onClick={() => v.path && naviga(v.path)} aria-current={att ? "page" : undefined}
            style={{ ...voce, background: att ? "var(--md-sys-color-secondary-container)" : "transparent", color: att ? "var(--md-sys-color-on-secondary-container)" : v.lock ? "var(--g-muted)" : "var(--g-text)", fontWeight: att ? 600 : 400, cursor: v.lock ? "default" : "pointer", padding: espansa ? "0 16px" : "0 12px" }}>
            {!v.lock && <md-ripple />}<Icona n={v.icon} fill={att} />
            {espansa && <span style={{ flex: 1 }}>{v.t}</span>}
            {v.badge && nonLetti > 0 && <span style={{ minWidth: 20, height: 20, padding: "0 6px", borderRadius: 10, background: "#d96570", color: "#fff", fontSize: 12, fontWeight: 600, display: "grid", placeItems: "center", ...(espansa ? {} : { position: "absolute", top: 2, left: 30 }) }}>{nonLetti}</span>}
            {v.lock && espansa && <Icona n="lock" size={18} />}
          </button>
        )
      })}
      {(aperta || stretto) && logs.length > 0 && <>
        <div style={{ fontSize: 14, fontWeight: 500, padding: "24px 16px 8px" }}>Recenti</div>
        {logs.slice(0, 6).map((l) => (
          <div key={l.id} title={`${l.dataOra} · ${l.autore}`} style={{ ...voce, cursor: "default" }}>
            <Icona n={iconaLog(l.azione)} size={18} style={{ color: "var(--g-muted)" }} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.dettaglio || l.azione}</span>
          </div>
        ))}
      </>}
      <button onClick={() => setTema(tema === "scuro" ? "chiaro" : "scuro")} style={{ ...voce, marginTop: "auto", padding: aperta || stretto ? "0 16px" : "0 12px" }}>
        <md-ripple /><Icona n={tema === "scuro" ? "light_mode" : "dark_mode"} />{(aperta || stretto) && (tema === "scuro" ? "Tema chiaro" : "Tema scuro")}
      </button>
    </aside>
  )

  return (
    <ToastCtx.Provider value={mostraToast}>
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--g-bg)" }}>
        {sidebar}
        {stretto && aperta && <div onClick={() => setAperta(false)} style={{ position: "fixed", inset: 0, zIndex: 30, background: "var(--g-scrim)" }} />}

        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <header style={{ position: "sticky", top: 0, zIndex: 20, background: "var(--g-bg)", display: "flex", alignItems: "center", gap: 8, height: 64, padding: "0 12px 0 16px" }}>
            {stretto && <md-icon-button aria-label="Apri menu" onClick={() => setAperta(true)}><Icona n="menu" /></md-icon-button>}
            <button onClick={() => vai("/home")} style={{ background: "none", border: "none", color: "var(--g-text)", fontSize: 22, cursor: "pointer", padding: "0 8px" }}>Squadra Mobile</button>
            <span className="hide-mobile" style={{ color: "var(--g-muted)", fontSize: 14 }}>{turnoAttuale()}</span>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, position: "relative" }}>
              <span style={{ position: "relative" }}>
                <md-icon-button aria-label="Comunicazioni" onClick={() => vai("/comunicazioni")}><Icona n="notifications" /></md-icon-button>
                {nonLetti > 0 && <span style={{ position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: 4, background: "#d96570" }} />}
              </span>
              <button aria-label="Profilo" onClick={() => setMenuProfilo(!menuProfilo)} className="g-ring" style={{ width: 40, height: 40, borderRadius: 20, padding: 2, border: "none", cursor: "pointer" }}>
                <span style={{ width: "100%", height: "100%", borderRadius: 18, background: "#0b57d0", color: "#fff", display: "grid", placeItems: "center", fontWeight: 600, border: "2px solid var(--g-bg)" }}>{(agente?.nome || "?").charAt(0).toUpperCase()}</span>
              </button>
              {menuProfilo && agente && (
                <div className="fade-in" style={{ position: "absolute", top: 52, right: 0, width: 300, background: "var(--g-surface)", borderRadius: 24, padding: 16, display: "flex", flexDirection: "column", gap: 12, boxShadow: "0 8px 24px rgba(0,0,0,.35)", zIndex: 30 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ width: 48, height: 48, borderRadius: 24, background: "#0b57d0", color: "#fff", display: "grid", placeItems: "center", fontSize: 20, fontWeight: 600 }}>{agente.nome.charAt(0).toUpperCase()}</span>
                    <div><div style={{ fontWeight: 600 }}>{agente.nome}</div><div className="muted" style={{ fontSize: 13 }}>{isAdmin(agente) ? "Super Admin" : agente.grado || "Operatore P.D.S."} · {matricolaPura(agente)}</div></div>
                  </div>
                  <div className="muted" style={{ fontSize: 13 }}>{agente.email}</div>
                  <md-outlined-button onClick={() => { setMenuProfilo(false); esci() }}><Icona n="logout" slot="icon" size={18} />Esci</md-outlined-button>
                </div>
              )}
            </div>
          </header>
          <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "0 16px" }} onClick={() => menuProfilo && setMenuProfilo(false)}>{children}</main>
          {bottom}
        </div>
      </div>
      <Toast messaggio={toast?.m ?? null} tipo={toast?.t} onFine={() => setToast(null)} />
    </ToastCtx.Provider>
  )
}
