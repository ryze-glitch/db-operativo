import { useState } from "react"
import { signInWithEmailAndPassword, signOut } from "firebase/auth"
import { collection, getDocs, query, where } from "firebase/firestore"
import { auth, db } from "@/firebase"
import { Icona } from "@/components/ui"

const reparti = [
  { nome: "Squadra Mobile", stato: "" },
  { nome: "D.I.G.O.S.", stato: "In sviluppo" },
  { nome: "N.O.S.", stato: "In arrivo" },
]

function messaggioErrore(code: string) {
  switch (code) {
    case "auth/invalid-credential": case "auth/invalid-login-credentials": case "auth/wrong-password": case "auth/user-not-found":
      return "Email o password non corretti."
    case "auth/invalid-email": return "Formato email non valido."
    case "auth/missing-password": return "Inserisci la password."
    case "auth/user-disabled": return "Account disabilitato. Contatta il comando."
    case "auth/too-many-requests": return "Troppi tentativi falliti. Riprova tra qualche minuto."
    case "auth/operation-not-allowed": return "Accesso con email/password non attivo in Firebase (Authentication → Sign-in method)."
    case "auth/network-request-failed": return "Impossibile contattare i server di autenticazione."
    default: return `Errore durante l'accesso (${code || "sconosciuto"}).`
  }
}

export default function Login({ erroreDb }: { erroreDb?: string | null }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errore, setErrore] = useState<string | null>(erroreDb ? `Errore del database (${erroreDb}).` : null)
  const [attesa, setAttesa] = useState(false)

  const accedi = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrore(null); setAttesa(true)
    try {
      const { user } = await signInWithEmailAndPassword(auth, email.trim(), password)
      const snap = await getDocs(query(collection(db, "agenti"), where("email", "==", user.email)))
      if (snap.empty) {
        await signOut(auth)
        setErrore(`Accesso negato: l'email ${user.email} non è registrata tra gli agenti. Contatta il comando.`)
      }
    } catch (err) {
      setPassword("")
      setErrore(messaggioErrore((err as { code?: string }).code || ""))
    } finally {
      setAttesa(false)
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--g-bg)", display: "grid", placeItems: "center", padding: 16 }}>
      <form onSubmit={accedi} className="fade-in" style={{ width: 440, maxWidth: "100%", display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="g-ring" style={{ width: 64, height: 64, borderRadius: 32, padding: 3, alignSelf: "center" }}>
          <div style={{ width: "100%", height: "100%", borderRadius: 30, background: "var(--g-bg)", display: "grid", placeItems: "center", color: "var(--g-blue)" }}><Icona n="local_police" size={32} fill /></div>
        </div>
        <div style={{ textAlign: "center" }}>
          <h1 className="g-gradient" style={{ fontSize: 40, fontWeight: 500, letterSpacing: "-0.02em" }}>Squadra Mobile</h1>
          <p className="muted" style={{ fontSize: 16, marginTop: 6 }}>Accedi per iniziare il turno</p>
        </div>

        <div role="radiogroup" aria-label="Reparto" style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {reparti.map((r) => (
            <button key={r.nome} type="button" role="radio" aria-checked={!r.stato} disabled={!!r.stato} className="g-chip" aria-pressed={!r.stato} title={r.stato || undefined} style={{ opacity: r.stato ? 0.55 : 1, cursor: r.stato ? "default" : "pointer" }}>
              {!r.stato ? <Icona n="check" size={18} /> : <Icona n="lock" size={16} />}{r.nome}
            </button>
          ))}
        </div>

        <div style={{ background: "var(--g-surface)", borderRadius: 28, padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          <label className="g-field">Email
            <input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ background: "var(--g-bg)" }} />
          </label>
          <label className="g-field">Password
            <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} style={{ background: "var(--g-bg)" }} />
          </label>
          {errore && (
            <div role="alert" style={{ display: "flex", gap: 10, alignItems: "flex-start", background: "var(--g-danger-bg)", color: "var(--g-danger-fg)", borderRadius: 14, padding: "12px 14px", fontSize: 14 }}>
              <Icona n="error" size={20} />{errore}
            </div>
          )}
          <md-filled-button type="submit" disabled={attesa} style={{ height: 48 }}>
            {attesa ? <Icona n="progress_activity" size={20} style={{ marginRight: 8 }} /> : null}{attesa ? "Verifica in corso…" : "Accedi"}
          </md-filled-button>
        </div>
        <p className="muted" style={{ textAlign: "center", fontSize: 12 }}>Accesso riservato al personale autorizzato IPRP.</p>
      </form>
    </div>
  )
}
