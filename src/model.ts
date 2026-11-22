// Tipi dei documenti Firestore e logica di dominio (scadenze, permessi)

export type Agente = { email: string; nome: string; matricola: string; admin?: boolean | string; grado?: string }

export type Prova = { testo: string; autore: string; dataOra: string; ts: number }

export type Soggetto = {
  id: string
  nome: string
  dataNascita: string
  dataApplicazione?: string
  motivazione: string
  durata: string
  fotoUrl?: string
  commenti?: string
  dataInserimento?: string
  firmaNome?: string
  firmaMatricola?: string
  firmaMatricolaCompleta?: string
  discordMsgId?: string
  prove?: Prova[]
}

export type Annuncio = { id: string; titolo: string; priorita: "normale" | "alta" | "urgente" | string; testo: string; autore?: string; timestamp?: number; dataOra?: string }

export type LogEntry = { id: string; azione: string; dettaglio: string; autore: string; timestamp: number; dataOra: string }

export const MOTIVAZIONI = [
  "SPARATORIA", "ARMI IN VISTA", "MISURA CAUTELARE", "DETERRENTE ALLA PUBBLICA SICUREZZA",
  "ASSOCIAZIONE A DELINQUERE", "POSSIBILE ASSOCIAZIONE", "VENDITA DI ARMI", "FASCICOLO IN CORSO",
]

export const DURATE = ["PERMANENTE", "60 GIORNI", "30 GIORNI", "15 GIORNI", "10 GIORNI", "5 GIORNI", "24 ORE", "12 ORE", "SCADUTO"]

export const isAdmin = (a: Agente | null) => !!a && (a.admin === true || String(a.admin || "").toLowerCase().startsWith("s"))

export const matricolaPura = (a: Agente) => (String(a.matricola || "").includes("-") ? String(a.matricola).split("-").pop()! : String(a.matricola || ""))

export const puoModificare = (a: Agente | null, s: Soggetto) => isAdmin(a) || (!!a && a.matricola === s.firmaMatricolaCompleta)

export type Urgenza = "critica" | "alta" | "media" | "permanente" | "scaduto"

export type Scadenza = { urgenza: Urgenza; etichetta: string; progresso: number; fine: Date | null; msRimanenti: number }

const ORA = 3600_000

// Calcola la scadenza di una misura a partire da data di applicazione e durata
export function calcolaScadenza(s: Pick<Soggetto, "durata" | "dataApplicazione">, ora = Date.now()): Scadenza {
  const durata = String(s.durata || "").toUpperCase()
  if (durata === "PERMANENTE") return { urgenza: "permanente", etichetta: "Permanente", progresso: 1, fine: null, msRimanenti: Infinity }
  if (durata === "SCADUTO") return { urgenza: "scaduto", etichetta: "Scaduto", progresso: 1, fine: null, msRimanenti: -1 }
  const g = durata.match(/(\d+)\s*GIORNI/)
  const h = durata.match(/(\d+)\s*ORE/)
  const totale = g ? Number(g[1]) * 24 * ORA : h ? Number(h[1]) * ORA : 0
  const inizio = s.dataApplicazione ? new Date(s.dataApplicazione).getTime() : NaN
  if (!totale || Number.isNaN(inizio)) return { urgenza: "media", etichetta: durata ? durata.toLowerCase() : "—", progresso: 0, fine: null, msRimanenti: Infinity }
  const fine = inizio + totale
  const rim = fine - ora
  if (rim <= 0) return { urgenza: "scaduto", etichetta: "Scaduto", progresso: 1, fine: new Date(fine), msRimanenti: rim }
  const ore = Math.ceil(rim / ORA)
  const etichetta = ore < 24 ? `${ore} ${ore === 1 ? "ora" : "ore"}` : `${Math.ceil(ore / 24)} ${Math.ceil(ore / 24) === 1 ? "giorno" : "giorni"}`
  const urgenza: Urgenza = rim <= 24 * ORA ? "critica" : rim <= 48 * ORA ? "alta" : "media"
  return { urgenza, etichetta, progresso: Math.min(1, Math.max(0, (ora - inizio) / totale)), fine: new Date(fine), msRimanenti: rim }
}

export const COLORE_URGENZA: Record<Urgenza, string> = {
  critica: "var(--g-red)", alta: "var(--g-yellow)", media: "var(--g-green)", permanente: "var(--g-purple)", scaduto: "var(--g-muted)",
}

export const iniziali = (nome: string) => nome.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase() || "?"

export const capitalizza = (t: string) => (t ? t.charAt(0) + t.slice(1).toLowerCase() : t)

// Ordine di visualizzazione: prima chi scade prima, poi i permanenti, in fondo gli scaduti
export const ordineScadenza = (a: Scadenza, b: Scadenza) => {
  const peso = (x: Scadenza) => (x.urgenza === "scaduto" ? 2 : x.urgenza === "permanente" ? 1 : 0)
  return peso(a) - peso(b) || (a.msRimanenti - b.msRimanenti) || 0
}
