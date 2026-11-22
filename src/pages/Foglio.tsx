import { useEffect, useMemo, useState } from "react"
import { addDoc, arrayUnion, collection, deleteDoc, doc, updateDoc } from "firebase/firestore"
import { db } from "@/firebase"
import { useStore } from "@/store"
import { vai } from "@/router"
import { calcolaScadenza, capitalizza, COLORE_URGENZA, DURATE, matricolaPura, MOTIVAZIONI, ordineScadenza, puoModificare, type Soggetto } from "@/model"
import { aggiornaDiscord, eliminaDiscord, inviaDiscord } from "@/discord"
import { Shell, useToast } from "@/components/Shell"
import { AvatarIniziali, BarraScadenza, Icona, Modale, Vuoto } from "@/components/ui"

type Filtro = "tutti" | "scadenza" | "permanenti" | "scaduti"
const vuoto = { nome: "", dataNascita: "", dataApplicazione: new Date().toISOString().slice(0, 10), motivazioni: [] as string[], durata: "PERMANENTE", fotoUrl: "", commenti: "" }

function ModuloSoggetto({ iniziale, onChiudi }: { iniziale: Soggetto | null; onChiudi: () => void }) {
  const { agente, registraLog } = useStore()
  const toast = useToast()
  const [m, setM] = useState(() => iniziale
    ? { nome: iniziale.nome, dataNascita: iniziale.dataNascita, dataApplicazione: iniziale.dataApplicazione || "", motivazioni: iniziale.motivazione ? iniziale.motivazione.split(", ") : [], durata: iniziale.durata, fotoUrl: iniziale.fotoUrl || "", commenti: iniziale.commenti === "//" ? "" : iniziale.commenti || "" }
    : vuoto)
  const [invio, setInvio] = useState(false)
  const [errore, setErrore] = useState("")

  const salva = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agente) return
    if (m.motivazioni.length === 0) { setErrore("Seleziona almeno una motivazione."); return }
    setInvio(true); setErrore("")
    const payload = {
      nome: m.nome.trim().toUpperCase(), dataNascita: m.dataNascita.trim(), dataApplicazione: m.dataApplicazione,
      motivazione: m.motivazioni.join(", "), durata: m.durata, fotoUrl: m.fotoUrl.trim(), commenti: m.commenti.trim() || "//",
      dataInserimento: iniziale?.dataInserimento || new Date().toLocaleDateString("it-IT"),
      firmaNome: iniziale?.firmaNome || agente.nome, firmaMatricola: iniziale?.firmaMatricola || matricolaPura(agente), firmaMatricolaCompleta: iniziale?.firmaMatricolaCompleta || agente.matricola,
    }
    try {
      if (iniziale) {
        await updateDoc(doc(db, "attenzionati", iniziale.id), payload)
        aggiornaDiscord(iniziale.discordMsgId || "", payload)
        registraLog("Modifica", `Identificazione: ${payload.nome}`)
        toast("Modifiche salvate")
      } else {
        const discordMsgId = await inviaDiscord(payload)
        await addDoc(collection(db, "attenzionati"), { ...payload, discordMsgId })
        registraLog("Creazione", `Identificazione: ${payload.nome}`)
        toast(discordMsgId ? "Salvato e inviato su Discord" : "Salvato (invio a Discord non riuscito)")
      }
      onChiudi()
    } catch { setErrore("Salvataggio non riuscito. Riprova.") } finally { setInvio(false) }
  }

  const toggle = (mot: string) => setM({ ...m, motivazioni: m.motivazioni.includes(mot) ? m.motivazioni.filter((x) => x !== mot) : [...m.motivazioni, mot] })

  return (
    <form onSubmit={salva} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
        <label className="g-field" style={{ gridColumn: "1 / -1" }}>Nome e cognome<input required value={m.nome} onChange={(e) => setM({ ...m, nome: e.target.value })} style={{ textTransform: "uppercase" }} /></label>
        <label className="g-field">Data di nascita<input required placeholder="01/01/1990" value={m.dataNascita} onChange={(e) => setM({ ...m, dataNascita: e.target.value })} /></label>
        <label className="g-field">Data di applicazione<input required type="date" value={m.dataApplicazione} onChange={(e) => setM({ ...m, dataApplicazione: e.target.value })} /></label>
        <label className="g-field">Durata dell'attenzione
          <select value={m.durata} onChange={(e) => setM({ ...m, durata: e.target.value })}>{DURATE.map((d) => <option key={d} value={d}>{capitalizza(d)}</option>)}</select>
        </label>
        <label className="g-field">URL foto (facoltativo)<input type="url" placeholder="https://…" value={m.fotoUrl} onChange={(e) => setM({ ...m, fotoUrl: e.target.value })} /></label>
      </div>
      <div className="g-field">Motivazioni
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {MOTIVAZIONI.map((mot) => (
            <button key={mot} type="button" className="g-chip" aria-pressed={m.motivazioni.includes(mot)} onClick={() => toggle(mot)} style={{ height: 36, fontSize: 13 }}>
              <md-ripple />{m.motivazioni.includes(mot) && <Icona n="check" size={16} />}{capitalizza(mot)}
            </button>
          ))}
        </div>
      </div>
      <label className="g-field">Commenti<textarea rows={3} value={m.commenti} onChange={(e) => setM({ ...m, commenti: e.target.value })} /></label>
      {errore && <div role="alert" style={{ background: "var(--g-danger-bg)", color: "var(--g-danger-fg)", borderRadius: 12, padding: "10px 14px", fontSize: 14 }}>{errore}</div>}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <md-text-button type="button" onClick={onChiudi}>Annulla</md-text-button>
        <md-filled-button type="submit" disabled={invio}><Icona n={iniziale ? "save" : "send"} slot="icon" size={18} />{invio ? "Salvataggio…" : iniziale ? "Salva modifiche" : "Salva e invia"}</md-filled-button>
      </div>
    </form>
  )
}

function Dettaglio({ s, onModifica, onElimina }: { s: Soggetto; onModifica: () => void; onElimina: () => void }) {
  const { agente, registraLog } = useStore()
  const toast = useToast()
  const [prova, setProva] = useState("")
  const [invio, setInvio] = useState(false)
  const sc = calcolaScadenza(s)
  const modificabile = puoModificare(agente, s)

  const allega = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agente || !prova.trim()) return
    setInvio(true)
    try {
      await updateDoc(doc(db, "attenzionati", s.id), { prove: arrayUnion({ testo: prova.trim(), autore: `${agente.nome} - ${matricolaPura(agente)}`, dataOra: new Date().toLocaleString("it-IT"), ts: Date.now() }) })
      registraLog("Prova allegata", `${s.nome}: ${prova.trim().slice(0, 60)}`)
      setProva(""); toast("Prova allegata")
    } catch { toast("Impossibile allegare la prova", "errore") } finally { setInvio(false) }
  }

  const righe: [string, string][] = [
    ["Nascita", s.dataNascita], ["Applicazione", s.dataApplicazione ? s.dataApplicazione.split("-").reverse().join("/") : "—"], ["Durata", capitalizza(s.durata)],
    ["Inserito il", s.dataInserimento || "—"], ["Firma", `${s.firmaNome || "—"} · ${s.firmaMatricola || ""}`],
  ]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
        <AvatarIniziali nome={s.nome} foto={s.fotoUrl} size={96} colore={COLORE_URGENZA[sc.urgenza]} />
        <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{s.motivazione.split(", ").map((x) => <span key={x} className="g-chip" style={{ height: 30, fontSize: 12, cursor: "default" }}>{capitalizza(x)}</span>)}</div>
          <div style={{ width: 260, maxWidth: "100%" }}><BarraScadenza s={sc} /></div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        {righe.map(([k, v]) => <div key={k} className="g-card" style={{ padding: "10px 14px" }}><div className="muted" style={{ fontSize: 12 }}>{k}</div><div style={{ fontSize: 15 }}>{v}</div></div>)}
      </div>
      {s.commenti && s.commenti !== "//" && <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{s.commenti}</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}><Icona n="attach_file" size={20} />Prove e annotazioni</h3>
        {(s.prove ?? []).length === 0 && <p className="muted" style={{ fontSize: 14 }}>Nessuna prova allegata.</p>}
        {(s.prove ?? []).map((p, i) => (
          <div key={p.ts || i} style={{ borderLeft: "3px solid var(--g-blue)", padding: "6px 12px" }}>
            {/^https?:\/\//i.test(p.testo) ? <a href={p.testo} target="_blank" rel="noopener noreferrer" style={{ color: "var(--g-blue)", wordBreak: "break-all" }}>{p.testo}</a> : <div style={{ whiteSpace: "pre-wrap" }}>{p.testo}</div>}
            <div className="muted" style={{ fontSize: 12 }}>{p.autore} · {p.dataOra}</div>
          </div>
        ))}
        <form onSubmit={allega} style={{ display: "flex", gap: 8, alignItems: "center", background: "var(--g-surface)", borderRadius: 28, padding: "6px 6px 6px 18px" }}>
          <input value={prova} onChange={(e) => setProva(e.target.value)} placeholder="Scrivi una nota o incolla un link a una prova…" aria-label="Nuova prova" style={{ flex: 1, font: "inherit", fontSize: 15, background: "transparent", border: "none", outline: "none", color: "var(--g-text)" }} />
          <md-filled-tonal-button type="submit" disabled={invio || !prova.trim()}><Icona n="add" slot="icon" size={18} />Allega</md-filled-tonal-button>
        </form>
      </div>

      {modificabile && (
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <md-text-button onClick={onElimina}><Icona n="delete" slot="icon" size={18} />Elimina</md-text-button>
          <md-filled-tonal-button onClick={onModifica}><Icona n="edit" slot="icon" size={18} />Modifica</md-filled-tonal-button>
        </div>
      )}
    </div>
  )
}

function Contenuto({ params }: { params: URLSearchParams }) {
  const { agente, soggetti, registraLog } = useStore()
  const toast = useToast()
  const [filtro, setFiltro] = useState<Filtro>("tutti")
  const [testo, setTesto] = useState("")
  const [modulo, setModulo] = useState<{ aperto: boolean; s: Soggetto | null }>({ aperto: false, s: null })
  const [dettaglioId, setDettaglioId] = useState<string | null>(null)
  const [daEliminare, setDaEliminare] = useState<Soggetto | null>(null)

  // Parametri dell'indirizzo: #/foglio?nuovo=1 oppure #/foglio?apri=<id>
  useEffect(() => {
    if (params.get("nuovo")) setModulo({ aperto: true, s: null })
    const apri = params.get("apri")
    if (apri) setDettaglioId(apri)
  }, [params])
  const chiudiTutto = () => { setModulo({ aperto: false, s: null }); setDettaglioId(null); if (params.toString()) vai("/foglio") }

  const conScad = useMemo(() => soggetti.map((s) => ({ s, sc: calcolaScadenza(s) })).sort((a, b) => ordineScadenza(a.sc, b.sc)), [soggetti])
  const conta = {
    tutti: conScad.length,
    scadenza: conScad.filter((x) => x.sc.urgenza === "critica" || x.sc.urgenza === "alta").length,
    permanenti: conScad.filter((x) => x.sc.urgenza === "permanente").length,
    scaduti: conScad.filter((x) => x.sc.urgenza === "scaduto").length,
  }
  const t = testo.trim().toLowerCase()
  const lista = conScad.filter(({ s, sc }) =>
    (filtro === "tutti" || (filtro === "scadenza" ? sc.urgenza === "critica" || sc.urgenza === "alta" : filtro === "permanenti" ? sc.urgenza === "permanente" : sc.urgenza === "scaduto"))
    && (!t || `${s.nome} ${s.motivazione} ${s.firmaNome}`.toLowerCase().includes(t)))
  const dettaglio = soggetti.find((s) => s.id === dettaglioId) ?? null

  const elimina = async () => {
    if (!daEliminare) return
    const s = daEliminare
    try {
      await deleteDoc(doc(db, "attenzionati", s.id))
      eliminaDiscord(s.discordMsgId)
      registraLog("Eliminazione", `Identificazione: ${s.nome}`)
      toast("Identificazione eliminata")
    } catch { toast("Eliminazione non riuscita", "errore") }
    setDaEliminare(null); chiudiTutto()
  }

  return (
    <div className="fade-in" style={{ width: 1040, maxWidth: "100%", display: "flex", flexDirection: "column", gap: 20, padding: "24px 0 48px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 36, fontWeight: 500, letterSpacing: "-0.01em" }}>Foglio investigativo</h1>
          <p className="muted" style={{ marginTop: 4 }}>Identificazioni e soggetti sotto osservazione</p>
        </div>
        <md-filled-button onClick={() => setModulo({ aperto: true, s: null })}><Icona n="person_add" slot="icon" size={18} />Nuova identificazione</md-filled-button>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        {([["tutti", "Tutti"], ["scadenza", "In scadenza"], ["permanenti", "Permanenti"], ["scaduti", "Scaduti"]] as const).map(([k, l]) => (
          <button key={k} className="g-chip" aria-pressed={filtro === k} onClick={() => setFiltro(k)}><md-ripple />{filtro === k && <Icona n="check" size={18} />}{l} · {conta[k]}</button>
        ))}
        <label style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, height: 40, padding: "0 16px", borderRadius: 20, background: "var(--g-surface)", minWidth: 240, flex: "0 1 320px" }}>
          <Icona n="search" size={20} style={{ color: "var(--g-muted)" }} />
          <input value={testo} onChange={(e) => setTesto(e.target.value)} placeholder="Filtra per nome o motivazione" aria-label="Filtra soggetti" style={{ flex: 1, minWidth: 0, font: "inherit", fontSize: 14, background: "transparent", border: "none", outline: "none", color: "var(--g-text)" }} />
        </label>
      </div>

      {lista.length === 0
        ? <Vuoto icona="person_search" titolo={soggetti.length ? "Nessun soggetto in questa vista" : "Nessun soggetto registrato"} testo={soggetti.length ? "Cambia filtro o testo di ricerca." : "Registra la prima identificazione per iniziare."}>
            {!soggetti.length && <md-filled-tonal-button style={{ marginTop: 8 }} onClick={() => setModulo({ aperto: true, s: null })}><Icona n="person_add" slot="icon" size={18} />Nuova identificazione</md-filled-tonal-button>}
          </Vuoto>
        : (
          <div style={{ border: "1px solid var(--g-line)", borderRadius: 16, overflowX: "auto" }}>
            <div style={{ minWidth: 760 }}>
              <div className="g-table-row head" style={{ gridTemplateColumns: "1.6fr 1.4fr 1fr 0.9fr 96px" }}><span>Soggetto</span><span>Motivazione</span><span>Scadenza</span><span>Firma</span><span /></div>
              {lista.map(({ s, sc }) => (
                <div key={s.id} className="g-table-row click" style={{ gridTemplateColumns: "1.6fr 1.4fr 1fr 0.9fr 96px" }} onClick={() => setDettaglioId(s.id)}>
                  <span style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                    <AvatarIniziali nome={s.nome} foto={s.fotoUrl} colore={COLORE_URGENZA[sc.urgenza]} size={40} />
                    <span style={{ minWidth: 0 }}><span style={{ display: "block", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.nome}</span><span className="muted" style={{ fontSize: 12 }}>Nato il {s.dataNascita}</span></span>
                  </span>
                  <span style={{ display: "flex", flexWrap: "wrap", gap: 4, paddingRight: 12 }}>{s.motivazione.split(", ").slice(0, 2).map((x) => <span key={x} style={{ fontSize: 12, padding: "3px 10px", borderRadius: 12, background: "var(--g-raise)" }}>{capitalizza(x)}</span>)}{s.motivazione.split(", ").length > 2 && <span className="muted" style={{ fontSize: 12 }}>+{s.motivazione.split(", ").length - 2}</span>}</span>
                  <span style={{ paddingRight: 16 }}><BarraScadenza s={sc} /></span>
                  <span className="muted">{s.firmaNome} · {s.firmaMatricola}</span>
                  <span style={{ display: "flex", justifyContent: "flex-end" }} onClick={(e) => e.stopPropagation()}>
                    {puoModificare(agente, s) && <>
                      <md-icon-button aria-label={`Modifica ${s.nome}`} onClick={() => setModulo({ aperto: true, s })}><Icona n="edit" /></md-icon-button>
                      <md-icon-button aria-label={`Elimina ${s.nome}`} onClick={() => setDaEliminare(s)}><Icona n="delete" /></md-icon-button>
                    </>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      <Modale aperto={modulo.aperto} onChiudi={chiudiTutto} titolo={modulo.s ? `Modifica · ${modulo.s.nome}` : "Nuova identificazione"} larghezza={720}>
        <ModuloSoggetto key={modulo.s?.id ?? "nuovo"} iniziale={modulo.s} onChiudi={chiudiTutto} />
      </Modale>
      <Modale aperto={!!dettaglio && !modulo.aperto} onChiudi={chiudiTutto} titolo={dettaglio?.nome ?? ""} larghezza={720}>
        {dettaglio && <Dettaglio s={dettaglio} onModifica={() => setModulo({ aperto: true, s: dettaglio })} onElimina={() => setDaEliminare(dettaglio)} />}
      </Modale>
      <Modale aperto={!!daEliminare} onChiudi={() => setDaEliminare(null)} titolo="Eliminare l'identificazione?" larghezza={440}>
        <p className="muted">L'identificazione di <strong style={{ color: "var(--g-text)" }}>{daEliminare?.nome}</strong> verrà eliminata definitivamente, insieme al messaggio su Discord.</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <md-text-button onClick={() => setDaEliminare(null)}>Annulla</md-text-button>
          <md-filled-button onClick={elimina} style={{ "--md-filled-button-container-color": "var(--md-sys-color-error)", "--md-filled-button-label-text-color": "var(--md-sys-color-on-error)" } as React.CSSProperties}><Icona n="delete" slot="icon" size={18} />Elimina</md-filled-button>
        </div>
      </Modale>
    </div>
  )
}

export default function Foglio({ params }: { params: URLSearchParams }) {
  return <Shell attiva="/foglio"><Contenuto params={params} /></Shell>
}
