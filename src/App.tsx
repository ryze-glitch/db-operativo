import { useEffect } from "react"
import { useStore } from "./store"
import { useRotta, vai } from "./router"
import { Icona } from "./components/ui"
import Login from "./pages/Login"
import Home from "./pages/Home"
import Cerca from "./pages/Cerca"
import Comunicazioni from "./pages/Comunicazioni"
import Foglio from "./pages/Foglio"

function Caricamento() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--g-bg)" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div className="g-ring spin" style={{ width: 48, height: 48, borderRadius: 24, padding: 3 }}><div style={{ width: "100%", height: "100%", borderRadius: 21, background: "var(--g-bg)" }} /></div>
        <span className="muted">Verifica in corso…</span>
      </div>
    </div>
  )
}

function ErroreDatabase({ codice }: { codice: string }) {
  const { esci } = useStore()
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--g-bg)", padding: 16 }}>
      <div style={{ maxWidth: 440, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <span style={{ color: "var(--g-red)" }}><Icona n="cloud_off" size={48} /></span>
        <h1 style={{ fontSize: 28, fontWeight: 500 }}>Errore del database</h1>
        <p className="muted">Impossibile caricare il profilo operatore ({codice}). Controlla le regole di Firestore o riprova tra poco.</p>
        <div style={{ display: "flex", gap: 8 }}>
          <md-outlined-button onClick={() => esci()}>Esci</md-outlined-button>
          <md-filled-button onClick={() => location.reload()}><Icona n="refresh" slot="icon" size={18} />Riprova</md-filled-button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const { pronto, user, agente, erroreDb } = useStore()
  const { path, params } = useRotta()

  // Dopo l'accesso, la radice porta alla home
  useEffect(() => {
    if (agente && (path === "/" || path === "")) vai("/home")
  }, [agente, path])

  if (!pronto) return <Caricamento />
  if (user && !agente && erroreDb) return <ErroreDatabase codice={erroreDb} />
  if (!agente) return <Login />

  switch (path) {
    case "/cerca": return <Cerca q={params.get("q") ?? ""} />
    case "/comunicazioni": return <Comunicazioni />
    case "/foglio": return <Foglio params={params} />
    default: return <Home />
  }
}
