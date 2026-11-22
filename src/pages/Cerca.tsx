import { useMemo } from "react"
import { useStore } from "@/store"
import { vai } from "@/router"
import { calcolaScadenza, capitalizza, COLORE_URGENZA, ordineScadenza } from "@/model"
import { Shell } from "@/components/Shell"
import { AvatarIniziali, BarraScadenza, Icona, PromptBox, Vuoto } from "@/components/ui"

const norm = (t: string) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")

// Ricerca nel foglio investigativo e nelle comunicazioni, presentata in stile conversazione
export default function Cerca({ q }: { q: string }) {
  const { soggetti, annunci } = useStore()

  const r = useMemo(() => {
    const t = norm(q)
    const conScad = soggetti.map((s) => ({ s, sc: calcolaScadenza(s) }))
    let filtro: "scadenza" | "permanenti" | "scaduti" | "testo" = "testo"
    let trovati = conScad
    if (/scaden|48|in scad/.test(t)) { filtro = "scadenza"; trovati = conScad.filter((x) => x.sc.urgenza === "critica" || x.sc.urgenza === "alta") }
    else if (/permanent/.test(t)) { filtro = "permanenti"; trovati = conScad.filter((x) => x.sc.urgenza === "permanente") }
    else if (/scadut/.test(t)) { filtro = "scaduti"; trovati = conScad.filter((x) => x.sc.urgenza === "scaduto") }
    else {
      const parole = t.split(/\s+/).filter(Boolean)
      trovati = conScad.filter(({ s }) => {
        const testo = norm([s.nome, s.motivazione, s.commenti, s.firmaNome, s.dataNascita].join(" "))
        return parole.every((p) => testo.includes(p))
      })
    }
    trovati.sort((a, b) => ordineScadenza(a.sc, b.sc))
    const parole = t.split(/\s+/).filter((p) => p.length > 2)
    const comunicazioni = filtro === "testo" && parole.length ? annunci.filter((a) => parole.some((p) => norm(`${a.titolo} ${a.testo}`).includes(p))) : []
    return { filtro, trovati, comunicazioni }
  }, [q, soggetti, annunci])

  const n = r.trovati.length
  const primo = r.trovati[0]
  const intro = {
    scadenza: n ? <><strong>{n} {n === 1 ? "soggetto scade" : "soggetti scadono"}</strong> entro le prossime 48 ore. Il più urgente è <strong>{primo.s.nome}</strong>, tra {primo.sc.etichetta}.</> : <>Nessuna misura scade nelle prossime 48 ore.</>,
    permanenti: <>Ci sono <strong>{n} {n === 1 ? "soggetto" : "soggetti"}</strong> con misura permanente.</>,
    scaduti: <>Ci sono <strong>{n} {n === 1 ? "misura scaduta" : "misure scadute"}</strong> da rivalutare o rimuovere.</>,
    testo: n ? <>Ho trovato <strong>{n} {n === 1 ? "soggetto" : "soggetti"}</strong> che corrispondono a “{q}”.</> : <>Nessun soggetto corrisponde a “{q}”.</>,
  }[r.filtro]

  return (
    <Shell attiva="/foglio" bottom={
      <div style={{ position: "sticky", bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "16px 16px 20px", background: "linear-gradient(to top, var(--g-bg) 75%, transparent)" }}>
        <PromptBox placeholder="Cerca ancora: nome, motivazione, operatore…" />
        <span className="muted" style={{ fontSize: 12 }}>Risultati dal foglio investigativo e dalle comunicazioni, aggiornati in tempo reale</span>
      </div>
    }>
      <div className="fade-in" style={{ width: 820, maxWidth: "100%", display: "flex", flexDirection: "column", gap: 28, padding: "24px 0 16px" }}>
        <div style={{ alignSelf: "flex-end", maxWidth: "75%", background: "var(--g-raise)", borderRadius: "24px 4px 24px 24px", padding: "12px 20px", fontSize: 16 }}>{q}</div>

        <div style={{ display: "flex", gap: 16 }}>
          <div className="g-ring hide-mobile" style={{ width: 32, height: 32, flex: "none", borderRadius: 16, display: "grid", placeItems: "center" }}>
            <div style={{ width: 28, height: 28, borderRadius: 14, background: "var(--g-bg)", display: "grid", placeItems: "center", color: "var(--g-blue)" }}><Icona n="shield" size={18} fill /></div>
          </div>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 16, fontSize: 16, lineHeight: 1.6 }}>
            <p>{intro}</p>

            {n > 0 && (
              <div style={{ border: "1px solid var(--g-line)", borderRadius: 16, overflowX: "auto" }}>
                <div style={{ minWidth: 600 }}>
                  <div className="g-table-row head" style={{ gridTemplateColumns: "1.5fr 1.3fr 1fr 0.9fr" }}><span>Soggetto</span><span>Motivazione</span><span>Scadenza</span><span>Firma</span></div>
                  {r.trovati.map(({ s, sc }) => (
                    <div key={s.id} className="g-table-row click" style={{ gridTemplateColumns: "1.5fr 1.3fr 1fr 0.9fr" }} onClick={() => vai(`/foglio?apri=${s.id}`)}>
                      <span style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}><AvatarIniziali nome={s.nome} colore={COLORE_URGENZA[sc.urgenza]} size={32} foto={s.fotoUrl} /><span style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis" }}>{s.nome}</span></span>
                      <span className="muted" style={{ paddingRight: 12 }}>{s.motivazione.split(", ").map(capitalizza).join(", ")}</span>
                      <span style={{ paddingRight: 16 }}><BarraScadenza s={sc} /></span>
                      <span className="muted">{s.firmaNome} · {s.firmaMatricola}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {r.comunicazioni.length > 0 && <>
              <p>Ci sono anche <strong>{r.comunicazioni.length} comunicazioni</strong> che parlano di “{q}”:</p>
              {r.comunicazioni.slice(0, 3).map((a) => (
                <button key={a.id} onClick={() => vai("/comunicazioni")} className="g-card" style={{ border: "none", color: "var(--g-text)", textAlign: "left", padding: 16, cursor: "pointer", display: "flex", gap: 12 }}>
                  <md-ripple /><Icona n={a.priorita === "urgente" ? "emergency_home" : "campaign"} style={{ color: a.priorita === "urgente" ? "var(--g-red)" : "var(--g-blue)" }} />
                  <span><strong>{a.titolo}</strong><br /><span className="muted" style={{ fontSize: 14 }}>{a.dataOra}</span></span>
                </button>
              ))}
            </>}

            {n === 0 && r.comunicazioni.length === 0 && <Vuoto icona="search_off" titolo="Nessun risultato" testo="Prova con il nome del soggetto, una motivazione (es. “armi”) oppure “scadenza”, “permanenti”, “scaduti”." />}

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              <md-filled-tonal-button onClick={() => vai("/foglio?nuovo=1")}><Icona n="person_add" slot="icon" size={18} />Nuova identificazione</md-filled-tonal-button>
              <md-outlined-button onClick={() => vai("/foglio")}><Icona n="open_in_new" slot="icon" size={18} />Apri foglio investigativo</md-outlined-button>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  )
}
