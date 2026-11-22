import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
// Componenti Material 3 (Material Web)
import "@material/web/button/filled-button.js"
import "@material/web/button/filled-tonal-button.js"
import "@material/web/button/outlined-button.js"
import "@material/web/button/text-button.js"
import "@material/web/iconbutton/icon-button.js"
import "@material/web/icon/icon.js"
import "@material/web/ripple/ripple.js"
import "@material/web/progress/linear-progress.js"
import "./index.css"
import { StoreProvider } from "./store"
import { applicaTemaSalvato } from "./components/Shell"
import App from "./App"

applicaTemaSalvato()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>
)
