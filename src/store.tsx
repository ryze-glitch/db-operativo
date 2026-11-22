import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { onAuthStateChanged, signOut, type User } from "firebase/auth"
import { addDoc, collection, getDocs, limit, onSnapshot, orderBy, query, where } from "firebase/firestore"
import { auth, db } from "./firebase"
import { matricolaPura, type Agente, type Annuncio, type LogEntry, type Soggetto } from "./model"

type Stato = {
  pronto: boolean
  user: User | null
  agente: Agente | null
  erroreDb: string | null
  soggetti: Soggetto[]
  annunci: Annuncio[]
  logs: LogEntry[]
  letti: string[]
  segnaLetto: (id: string) => void
  registraLog: (azione: string, dettaglio: string) => Promise<void>
  esci: () => Promise<void>
}

const Ctx = createContext<Stato | null>(null)
export const useStore = () => {
  const s = useContext(Ctx)
  if (!s) throw new Error("useStore fuori dal provider")
  return s
}

const leggiLetti = (): string[] => {
  try { return JSON.parse(localStorage.getItem("annunciLetti") || "[]") } catch { return [] }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [pronto, setPronto] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [agente, setAgente] = useState<Agente | null>(null)
  const [erroreDb, setErroreDb] = useState<string | null>(null)
  const [soggetti, setSoggetti] = useState<Soggetto[]>([])
  const [annunci, setAnnunci] = useState<Annuncio[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [letti, setLetti] = useState<string[]>(leggiLetti)

  // Autenticazione: l'utente deve esistere anche nella collezione "agenti"
  useEffect(() => onAuthStateChanged(auth, async (u) => {
    setErroreDb(null)
    if (!u) { setUser(null); setAgente(null); setPronto(true); return }
    try {
      const snap = await getDocs(query(collection(db, "agenti"), where("email", "==", u.email)))
      if (snap.empty) { await signOut(auth); setUser(null); setAgente(null) }
      else { setUser(u); setAgente(snap.docs[0].data() as Agente) }
    } catch (e) {
      setUser(u); setAgente(null)
      setErroreDb((e as { code?: string }).code || "errore sconosciuto")
    }
    setPronto(true)
  }), [])

  // Dati in tempo reale, solo dopo l'accesso
  useEffect(() => {
    if (!agente) return
    const stop = [
      onSnapshot(collection(db, "attenzionati"), (s) => setSoggetti(s.docs.map((d) => ({ id: d.id, ...d.data() }) as Soggetto))),
      onSnapshot(query(collection(db, "annunci"), orderBy("timestamp", "desc")), (s) => setAnnunci(s.docs.map((d) => ({ id: d.id, ...d.data() }) as Annuncio))),
      onSnapshot(query(collection(db, "logs"), orderBy("timestamp", "desc"), limit(30)), (s) => setLogs(s.docs.map((d) => ({ id: d.id, ...d.data() }) as LogEntry))),
    ]
    return () => stop.forEach((f) => f())
  }, [agente])

  // Disconnessione automatica dopo 15 minuti di inattività
  useEffect(() => {
    if (!user) return
    let t = 0
    const reset = () => { clearTimeout(t); t = window.setTimeout(() => signOut(auth), 15 * 60_000) }
    const eventi = ["mousemove", "keydown", "click", "scroll", "touchstart"]
    eventi.forEach((e) => window.addEventListener(e, reset, { passive: true }))
    reset()
    return () => { clearTimeout(t); eventi.forEach((e) => window.removeEventListener(e, reset)) }
  }, [user])

  const valore = useMemo<Stato>(() => ({
    pronto, user, agente, erroreDb, soggetti, annunci, logs, letti,
    segnaLetto: (id) => setLetti((l) => {
      if (l.includes(id)) return l
      const n = [...l, id]
      try { localStorage.setItem("annunciLetti", JSON.stringify(n)) } catch { /* storage non disponibile */ }
      return n
    }),
    registraLog: async (azione, dettaglio) => {
      if (!agente) return
      try {
        await addDoc(collection(db, "logs"), { azione, dettaglio, autore: `${agente.nome} - ${matricolaPura(agente)}`, timestamp: Date.now(), dataOra: new Date().toLocaleString("it-IT") })
      } catch { /* il log non deve bloccare l'azione */ }
    },
    esci: () => signOut(auth),
  }), [pronto, user, agente, erroreDb, soggetti, annunci, logs, letti])

  return <Ctx.Provider value={valore}>{children}</Ctx.Provider>
}
