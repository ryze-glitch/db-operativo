# Squadra Mobile · Database operativo IPRP

Terminale della Squadra Mobile: accesso, panoramica, ricerca, comunicazioni e foglio investigativo.
Interfaccia in stile Gemini costruita con React, Vite e i componenti Material 3 di Google (Material Web); dati e accesso su Firebase.

## Pubblicazione
Ogni merge su `main` compila il sito e lo pubblica su GitHub Pages
(workflow `.github/workflows/pages.yml`). Le pull request eseguono solo la compilazione come controllo.

Impostazione richiesta una sola volta: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Sviluppo in locale
```bash
npm install
npm run dev      # anteprima su http://localhost:5173
npm run build    # controllo dei tipi e compilazione in dist/
```

## Dati su Firebase (progetto `db-operativo`)
- **Authentication**: accesso con email e password (gli utenti si creano da *Authentication → Users*).
- **Firestore**, collezioni:
  - `agenti`: `email`, `nome`, `matricola` (es. `SM-001`), `admin` (`true` per gli amministratori), `grado` facoltativo. L'email deve coincidere con quella dell'utente.
  - `attenzionati`: identificazioni del foglio investigativo (nome, nascita, applicazione, motivazione, durata, foto, commenti, firma, prove, id del messaggio Discord).
  - `annunci`: comunicazioni del comando (titolo, priorità `normale`/`alta`/`urgente`, testo, autore, data).
  - `logs`: registro delle azioni.

## Struttura
- `src/pages/` — Accesso, Home, Ricerca, Comunicazioni, Foglio investigativo
- `src/components/` — struttura (barra laterale, intestazione) e componenti comuni
- `src/store.tsx` — sessione e dati in tempo reale
- `src/model.ts` — tipi, scadenze, permessi
- `src/discord.ts` — messaggi al canale Discord
