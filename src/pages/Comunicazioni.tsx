import { useState } from "react"
import { addDoc, collection, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/firebase"
import { useStore } from "@/store"
import { isAdmin } from "@/model"
import { Shell, useToast } from "@/components/Shell"
import { Icona, Modale, Vuoto } from "@/components/ui"

const PRIORITA: Record<string, { etichetta: string; icona: string; colore: string }> = {
  urgente: { etichetta: "Urgente", icona: "emergency_home", colore: "var(--g-red)" },
  alta: { etichetta: "Alta", icona: "flag", colore: "var(--g-yellow)" },
  normale: { etichetta: "Normale", icona: "info", colore: "var(--g-blue)" },
}

function Contenuto() {
  const { agente, annunci, letti, segnaLetto, registraLog } = useStore()
  const toast = useToast()
  const [filtro, setFiltro] = useState<"tutte" | "daleggere" | "urgenti">("tutte")
  const [nuova, setNuova] = useState(false)
  const [modulo, setModulo] = useState({ titolo: "", priorita: "normale", testo: "" })
  const [invio, setInvio] = useState(false)
  const admin = isAdmin(agente)

  const lista = annunci.filter((a) => filtro === "tutte" || (filtro === "daleggere" ? !letti.includes(a.id) : a.priorita === "urgente"))
  const nonLetti = annunci.filter((a) => !letti.includes(a.id)).length

  const pubblica = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agente) return
    setInvio(true)
    try {
      await addDoc(collection(db, "annunci"), { ...modulo, titolo: modulo.titolo.trim(), testo: modulo.testo.trim(), autore: `${agente.nome} - ${agente.grado || "Admin"}`, timestamp: Date.now(), dataOra: new Date().toLocaleString("it-IT") })
      registraLog("Comunicazione", `Pubblicata: ${modulo.titolo.trim()}`)
      toast("Comunicazione pubblicata")
      setModulo({ titolo: "", priorita: "normale", testo: "" }); setNuova(false)
    } catch { toast("Pubblicazione non riuscita", "errore") } finally { setInvio(false) }
  }

  const elimina = async (id: string, titolo: string) => {
    if (!confirm(`Eliminare la comunicazione “${titolo}”?`)) return
    try { await deleteDoc(doc(db, "annunci", id)); registraLog("Eliminazione", `Comunicazione: ${titolo}`); toast("Comunicazione eliminata") } catch { toast("Eliminazione non riuscita", "errore") }
  }

  return (
    <div className="fade-in" style={{ width: 820, maxWidth: "100%", display: "flex", flexDirection: "column", gap: 20, padding: "24px 0 48px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 36, fontWeight: 500, letterSpacing: "-0.01em" }}>Comunicazioni</h1>
          <p className="muted" style={{ marginTop: 4 }}>{nonLetti ? `${nonLetti} da leggere` : "Sei in pari con tutte le direttive"}</p>
        </div>
        {admin && <md-filled-button onClick={() => setNuova(true)}><Icona n="edit" slot="icon" size={18} />Nuova comunicazione</md-filled-button>}
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {([["tutte", `Tutte · ${annunci.length}`], ["daleggere", `Da leggere · ${nonLetti}`], ["urgenti", "Urgenti"]] as const).map(([k, t]) => (
          <button key={k} className="g-chip" aria-pressed={filtro === k} onClick={() => setFiltro(k)}><md-ripple />{filtro === k && <Icona n="check" size={18} />}{t}</button>
        ))}
      </div>

      {lista.length === 0 && <Vuoto icona="mark_email_read" titolo="Nessuna comunicazione" testo={filtro === "tutte" ? "Le direttive del comando compariranno qui." : "Niente in questa vista."} />}

      {lista.map((a) => {
        const p = PRIORITA[a.priorita] ?? PRIORITA.normale
        const letta = letti.includes(a.id)
        const urgente = a.priorita === "urgente"
        return (
          <article key={a.id} className="g-card" style={{ padding: 20, display: "flex", gap: 16, background: urgente && !letta ? "var(--g-danger-bg)" : "var(--g-surface)", color: urgente && !letta ? "var(--g-danger-fg)" : "var(--g-text)" }}>
            <span style={{ width: 40, height: 40, flex: "none", borderRadius: 20, background: "var(--g-bg)", display: "grid", placeItems: "center", color: p.colore }}><Icona n={p.icona} /></span>
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, letterSpacing: "0.06em", fontWeight: 600 }}>
                <span style={{ color: p.colore }}>{p.etichetta.toUpperCase()}</span>
                <span style={{ opacity: 0.75 }}>· {a.autore} · {a.dataOra}</span>
                {!letta && <span style={{ width: 8, height: 8, borderRadius: 4, background: "#d96570", marginLeft: 4 }} aria-label="Non letta" />}
              </div>
              <h2 style={{ fontSize: 20, fontWeight: letta ? 500 : 600 }}>{a.titolo}</h2>
              <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, opacity: 0.9 }}>{a.testo}</p>
              <div style={{ display: "flex", gap: 8, marginTop: 6, marginLeft: -12 }}>
                {!letta && <md-text-button onClick={() => segnaLetto(a.id)}><Icona n="check" slot="icon" size={18} />Segna come letto</md-text-button>}
                {admin && <md-text-button onClick={() => elimina(a.id, a.titolo)}><Icona n="delete" slot="icon" size={18} />Elimina</md-text-button>}
              </div>
            </div>
          </article>
        )
      })}

      <Modale aperto={nuova} onChiudi={() => setNuova(false)} titolo="Nuova comunicazione">
        <form onSubmit={pubblica} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <label className="g-field">Oggetto<input required value={modulo.titolo} onChange={(e) => setModulo({ ...modulo, titolo: e.target.value })} /></label>
          <label className="g-field">Priorità
            <select value={modulo.priorita} onChange={(e) => setModulo({ ...modulo, priorita: e.target.value })}>
              <option value="normale">Normale</option><option value="alta">Alta</option><option value="urgente">Urgente</option>
            </select>
          </label>
          <label className="g-field">Messaggio<textarea required rows={5} value={modulo.testo} onChange={(e) => setModulo({ ...modulo, testo: e.target.value })} /></label>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <md-text-button type="button" onClick={() => setNuova(false)}>Annulla</md-text-button>
            <md-filled-button type="submit" disabled={invio}><Icona n="send" slot="icon" size={18} />Pubblica</md-filled-button>
          </div>
        </form>
      </Modale>
    </div>
  )
}

export default function Comunicazioni() {
  return <Shell attiva="/comunicazioni"><Contenuto /></Shell>
}
