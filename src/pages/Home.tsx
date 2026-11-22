import { useMemo } from "react"
import { useStore } from "@/store"
import { vai } from "@/router"
import { calcolaScadenza } from "@/model"
import { Shell } from "@/components/Shell"
import { Icona, PromptBox } from "@/components/ui"

export default function Home() {
  const { agente, soggetti, annunci, letti } = useStore()
  const nome = agente?.nome.split(" ")[0] || ""

  const dati = useMemo(() => {
    const conScad = soggetti.map((s) => ({ s, sc: calcolaScadenza(s) }))
    const attivi = conScad.filter((x) => x.sc.urgenza !== "scaduto")
    const in48 = conScad.filter((x) => x.sc.urgenza === "critica" || x.sc.urgenza === "alta").sort((a, b) => a.sc.msRimanenti - b.sc.msRimanenti)
    const permanenti = conScad.filter((x) => x.sc.urgenza === "permanente")
    const daLeggere = annunci.filter((a) => !letti.includes(a.id))
    const urgente = daLeggere.find((a) => a.priorita === "urgente") ?? daLeggere[0]
    return { attivi, in48, permanenti, daLeggere, urgente }
  }, [soggetti, annunci, letti])

  const suggerimenti = [
    { icon: "person_add", t: "Nuova identificazione", col: "#4285f4", path: "/foglio?nuovo=1" },
    { icon: "timer", t: "Chi scade entro 48 ore", col: "#f9ab00", path: "/cerca?q=scadenza" },
    { icon: "campaign", t: dati.urgente ? "Leggi le direttive" : "Comunicazioni", col: "#d96570", path: "/comunicazioni" },
    { icon: "attach_file", t: "Allega una prova", col: "#9b72cb", path: "/foglio" },
  ]

  const card = [
    dati.urgente
      ? { tag: `${dati.urgente.priorita === "urgente" ? "URGENTE" : "DA LEGGERE"} · ${dati.urgente.dataOra?.split(", ")[1]?.slice(0, 5) ?? ""}`, t: dati.urgente.titolo, icon: "emergency_home", col: "var(--g-red)", path: "/comunicazioni" }
      : { tag: "COMUNICAZIONI", t: "Nessuna direttiva da leggere. Sei in pari.", icon: "mark_email_read", col: "var(--g-green)", path: "/comunicazioni" },
    dati.in48.length
      ? { tag: "IN SCADENZA", t: dati.in48.slice(0, 2).map((x) => `${x.s.nome} tra ${x.sc.etichetta}`).join(", ") + (dati.in48.length > 2 ? ` e altri ${dati.in48.length - 2}` : ""), icon: "timer", col: "var(--g-yellow)", path: "/cerca?q=scadenza" }
      : { tag: "IN SCADENZA", t: "Nessuna misura scade nelle prossime 48 ore.", icon: "timer", col: "var(--g-yellow)", path: "/foglio" },
    { tag: "FOGLIO", t: `${dati.attivi.length} soggetti attivi, ${dati.permanenti.length} con misura permanente`, icon: "person_search", col: "var(--g-blue)", path: "/foglio" },
    { tag: "FASCICOLI", t: "La sezione fascicoli d'indagine è in arrivo.", icon: "folder_open", col: "var(--g-purple)", path: "" },
  ]

  return (
    <Shell attiva="/home">
      <div className="fade-in" style={{ width: 760, maxWidth: "100%", display: "flex", flexDirection: "column", gap: 28, paddingTop: "min(14vh, 120px)", paddingBottom: 48 }}>
        <div>
          <h1 className="g-gradient" style={{ fontSize: "clamp(36px, 6vw, 56px)", fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.1 }}>Ciao, {nome}</h1>
          <p style={{ fontSize: "clamp(36px, 6vw, 56px)", fontWeight: 500, letterSpacing: "-0.02em", lineHeight: 1.1, color: "var(--g-line)" }}>Da dove iniziamo?</p>
        </div>

        <PromptBox placeholder="Cerca un soggetto, una direttiva o una motivazione" autoFocus />

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {suggerimenti.map((s) => (
            <button key={s.t} className="g-chip" onClick={() => vai(s.path)}><md-ripple /><Icona n={s.icon} size={20} style={{ color: s.col }} />{s.t}</button>
          ))}
        </div>

        <div style={{ marginTop: 24 }}>
          <div className="muted" style={{ fontSize: 14, fontWeight: 500, marginBottom: 12 }}>Da non perdere oggi</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12 }}>
            {card.map((c) => (
              <button key={c.tag} onClick={() => c.path && vai(c.path)} className="g-card" style={{ height: 196, padding: 16, display: "flex", flexDirection: "column", textAlign: "left", border: "none", color: "var(--g-text)", cursor: c.path ? "pointer" : "default", opacity: c.path ? 1 : 0.7 }}>
                {c.path && <md-ripple />}
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: c.col }}>{c.tag}</span>
                <span style={{ fontSize: 16, lineHeight: 1.4, marginTop: 8, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical" }}>{c.t}</span>
                <span style={{ marginTop: "auto", alignSelf: "flex-end", width: 40, height: 40, borderRadius: 20, background: "var(--g-bg)", display: "grid", placeItems: "center" }}><Icona n={c.icon} style={{ color: c.col }} /></span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  )
}
