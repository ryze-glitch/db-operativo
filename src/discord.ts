import { WEBHOOK_URL } from "./firebase"

type DatiEmbed = {
  nome: string; dataNascita: string; dataApplicazione: string; motivazione: string; durata: string
  fotoUrl: string; commenti: string; firmaNome: string; firmaMatricola: string
}

// Stesso messaggio del vecchio sito
function costruisciPayload(p: DatiEmbed, modifica: boolean) {
  let campoDurata = ""
  let data = new Date(p.dataApplicazione)
  if (Number.isNaN(data.getTime())) data = new Date()
  const g = p.durata.match(/(\d+) GIORNI/)
  const h = p.durata.match(/(\d+) ORE/)
  if (p.durata === "SCADUTO") campoDurata = "**SCADUTO ⛔**"
  else if (p.durata === "PERMANENTE") campoDurata = "**PERMANENTE 🔴**"
  else if (g) { data.setDate(data.getDate() + Number(g[1])); const ut = Math.floor(data.getTime() / 1000); campoDurata = `<t:${ut}:D> (<t:${ut}:R>)` }
  else if (h) { data.setHours(data.getHours() + Number(h[1])); const ut = Math.floor(data.getTime() / 1000); campoDurata = `<t:${ut}:R>` }

  return {
    embeds: [{
      author: { name: "SISTEMA IDENTIFICATIVO SM - IPRP", icon_url: "https://i.imgur.com/SUM8B5x.png" },
      description: modifica ? "> **Aggiornamento Identificazione Registrata.**\n\n**Dettagli del Soggetto:**" : "> **Nuova Identificazione Registrata.**\n\n**Dettagli del Soggetto:**",
      color: 2446043,
      fields: [
        { name: "> **Nome e Cognome:**", value: `\`${p.nome}\``, inline: true },
        { name: "> **Data di Nascita:**", value: p.dataNascita || "—", inline: true },
        { name: "> **Motivazione:**", value: `\`${p.motivazione}\``, inline: true },
        { name: "> **Scadenza Attenzione:**", value: campoDurata || "—", inline: false },
        { name: "> **Annotazioni:**", value: p.commenti && p.commenti !== "//" ? p.commenti : "Nessuna nota aggiuntiva.", inline: false },
      ],
      image: { url: p.fotoUrl || "https://i.imgur.com/J3T1Kot.png" },
      footer: { text: `Compilato da: ${p.firmaNome} - ${p.firmaMatricola}`, icon_url: "https://i.imgur.com/J3T1Kot.png" },
      timestamp: new Date().toISOString(),
    }],
    components: [{ type: 1, components: [{ type: 2, style: 5, label: "Apri Terminale IPRP", url: "https://ryze-glitch.github.io/db-operativo/", emoji: { name: "🖥️" } }] }],
  }
}

export async function inviaDiscord(p: DatiEmbed): Promise<string> {
  try {
    const res = await fetch(`${WEBHOOK_URL}?wait=true`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(costruisciPayload(p, false)) })
    if (res.ok) return (await res.json()).id ?? ""
  } catch { /* Discord non raggiungibile: il salvataggio prosegue comunque */ }
  return ""
}

export function aggiornaDiscord(msgId: string, p: DatiEmbed) {
  if (!msgId) return
  fetch(`${WEBHOOK_URL}/messages/${msgId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(costruisciPayload(p, true)) }).catch(() => {})
}

export function eliminaDiscord(msgId?: string) {
  if (!msgId) return
  fetch(`${WEBHOOK_URL}/messages/${msgId}`, { method: "DELETE" }).catch(() => {})
}
