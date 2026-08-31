import { useState } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { crearQueryClient } from "../../shared/api"

/**
 * Monta el cliente de TanStack Query para toda la app.
 *
 * El cliente se crea con `useState` y no como constante de módulo para que cada
 * montaje tenga el suyo: una caché compartida entre tests los vuelve
 * dependientes del orden en que corren.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.children Árbol de la aplicación.
 * @returns {object} El proveedor con sus hijos dentro.
 */
export function QueryProvider({ children }) {
  const [cliente] = useState(crearQueryClient)
  return <QueryClientProvider client={cliente}>{children}</QueryClientProvider>
}
