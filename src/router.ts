import { useEffect, useState } from "react"

// Router minimale basato su hash (#/home, #/cerca?q=...): funziona su GitHub Pages senza configurazioni
export type Rotta = { path: string; params: URLSearchParams }

const leggi = (): Rotta => {
  const h = location.hash.replace(/^#/, "") || "/"
  const [path, qs = ""] = h.split("?")
  return { path: path || "/", params: new URLSearchParams(qs) }
}

export function useRotta() {
  const [r, setR] = useState(leggi)
  useEffect(() => {
    const f = () => { setR(leggi()); window.scrollTo(0, 0) }
    window.addEventListener("hashchange", f)
    return () => window.removeEventListener("hashchange", f)
  }, [])
  return r
}

export const vai = (path: string) => { location.hash = path }
