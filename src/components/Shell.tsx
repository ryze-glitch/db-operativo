import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"
import { useStore } from "@/store"
import { vai } from "@/router"
import { isAdmin, matricolaPura } from "@/model"
import { Icona, Toast } from "./ui"
import { Sidebar, turnoAttuale } from "./Sidebar"

// ===== Notifiche toast condivise =====
type ToastFn = (msg: string, tipo?: "ok" | "errore") => void
const ToastCtx = createContext<ToastFn>(() => {})
export const useToast = () => useContext(ToastCtx)

// ===== Tema chiaro/scuro =====
const leggiTema = () => { try { return localStorage.getItem("tema") === "chiaro" ? "chiaro" : "scuro" } catch { return "scuro" } }
export function applicaTemaSalvato() { document.documentElement.dataset.tema = leggiTema() }

export function Shell({ attiva, children, bottom }: { attiva: string; children: ReactNode; bottom?: ReactNode }) {
  const { agente, annunci, letti, logs, esci } = useStore()
  const [tema, setTema] = useState<"scuro" | "chiaro">(leggiTema)
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

  return (
    <ToastCtx.Provider value={mostraToast}>
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--g-bg)" }}>
        <Sidebar aperta={aperta} stretto={stretto} setAperta={setAperta} attiva={attiva} naviga={naviga} nonLetti={nonLetti} logs={logs} tema={tema} setTema={setTema} agente={agente} />
        {stretto && aperta && <div onClick={() => setAperta(false)} style={{ position: "fixed", inset: 0, zIndex: 30, background: "var(--g-scrim)" }} />}

        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <header style={{ position: "sticky", top: 0, zIndex: 20, background: "var(--g-bg)", display: "flex", alignItems: "center", gap: 8, height: 64, padding: "0 12px 0 16px" }}>
            {stretto && <md-icon-button aria-label="Apri menu" onClick={() => setAperta(true)}><Icona n="menu" /></md-icon-button>}
            {/* Con il pannello aperto nome e turno sono già nel menu */}
            {(!aperta || stretto) && <>
              <button onClick={() => vai("/home")} style={{ background: "none", border: "none", color: "var(--g-text)", fontSize: 22, cursor: "pointer", padding: "0 8px" }}>Squadra Mobile</button>
              <span className="hide-mobile" style={{ color: "var(--g-muted)", fontSize: 14 }}>{turnoAttuale()}</span>
            </>}
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
