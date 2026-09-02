import { useEffect, useState } from "react"
import { Box, Paper, Skeleton, Stack, TableCell, TableRow } from "@mui/material"
import { BORDE, COLOR, RADIO } from "./tokens"
import { useIdioma } from "../i18n"

/**
 * Milisegundos que se espera antes de mostrar un esqueleto.
 *
 * Una respuesta que llega en 90 ms no necesita anuncio: el esqueleto aparecería
 * y desaparecería antes de que a nadie le diera tiempo de leerlo, y ese parpadeo
 * se percibe como un error, no como progreso. Por debajo de este umbral la
 * pantalla simplemente no cambia.
 *
 * @readonly
 * @type {number}
 */
export const RETRASO_CARGA_MS = 250

/**
 * Indica si ya toca mostrar el estado de carga.
 *
 * Separa "está cargando" de "hay que avisar que está cargando", que no son lo
 * mismo. La bajada es inmediata: en cuanto llegan los datos se pintan, sin
 * esperar a que se cumpla ningún tiempo mínimo.
 *
 * @param {boolean} cargando Si la petición sigue en curso.
 * @param {number} [retraso=RETRASO_CARGA_MS] Cuánto esperar antes de avisar.
 * @returns {boolean} `true` cuando conviene mostrar el esqueleto.
 *
 * @example
 * const mostrar = useCargaVisible(isLoading)
 * if (mostrar) return <TarjetasEsqueleto />
 */
export function useCargaVisible(cargando, retraso = RETRASO_CARGA_MS) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!cargando) {
      setVisible(false)
      return undefined
    }
    const temporizador = setTimeout(() => setVisible(true), retraso)
    return () => clearTimeout(temporizador)
  }, [cargando, retraso])

  return visible
}

/**
 * Anuncio de carga para lectores de pantalla.
 *
 * Un esqueleto es una pista **visual**: quien navega con lector de pantalla no
 * ve nada y se queda sin saber que la pantalla está trabajando. Este texto no se
 * ve pero sí se lee, y es también lo que buscan las pruebas.
 *
 * @param {object} props Propiedades del componente.
 * @param {string} [props.children] Qué anunciar; por omisión, el texto de carga
 *   del catálogo, en el idioma activo.
 * @returns {object} El anuncio renderizado.
 */
export function AnuncioCarga({ children }) {
  const { t } = useIdioma()

  return (
    <Box
      component="span"
      role="status"
      aria-live="polite"
      sx={{
        position: "absolute",
        width: 1,
        height: 1,
        overflow: "hidden",
        clip: "rect(0 0 0 0)",
        whiteSpace: "nowrap",
      }}
    >
      {children ?? t("estado.cargando")}
    </Box>
  )
}

/**
 * Una barra gris con la forma del texto que va a llegar.
 *
 * @param {object} props Propiedades del componente.
 * @param {(number|string)} [props.ancho='100%'] Ancho de la barra.
 * @param {number} [props.alto=16] Alto en píxeles.
 * @returns {object} La barra renderizada.
 */
export const Barra = ({ ancho = "100%", alto = 16 }) => (
  <Skeleton
    variant="rounded"
    height={alto}
    sx={{ bgcolor: COLOR.RELLENO, width: ancho, maxWidth: "100%" }}
  />
)

/**
 * Filas de esqueleto para el cuerpo de una tabla.
 *
 * Ocupan el mismo sitio que ocuparán los datos, así que la tabla no da el salto
 * que da un spinner centrado cuando se sustituye por diez filas. Por eso el
 * relleno vertical de la celda y el número de filas importan: si el esqueleto es
 * más bajo o más corto que lo que llega, el salto vuelve, solo que más pequeño.
 *
 * Los anchos van en `em` y no en porcentaje: mientras se carga no hay datos, así
 * que las columnas se encogen al ancho de su encabezado y un 70 % de la columna
 * «ID» es una astilla de cuatro píxeles. En `em` la barra mide lo que mediría el
 * texto, y el `maxWidth` impide que desborde una columna estrecha. Varían entre
 * celdas para que parezca texto y no un patrón.
 *
 * @param {object} props Propiedades del componente.
 * @param {number} props.columnas Cuántas celdas por fila.
 * @param {number} [props.filas=5] Cuántas filas pintar. Conviene pasarle el
 *   tamaño de página real para que la tabla no cambie de alto al llegar los datos.
 * @returns {object} Las filas renderizadas.
 *
 * @example
 * <TableBody>{cargando && <FilasEsqueleto columnas={6} />}</TableBody>
 */
export function FilasEsqueleto({ columnas, filas = 5 }) {
  const anchos = ["5em", "3.5em", "6em", "4em", "7em", "4.5em"]

  return (
    <>
      {Array.from({ length: filas }, (_, fila) => (
        <TableRow key={fila}>
          {Array.from({ length: columnas }, (_, celda) => (
            <TableCell key={celda} sx={{ py: 2 }}>
              {fila === 0 && celda === 0 && <AnuncioCarga />}
              <Barra ancho={anchos[(fila + celda) % anchos.length]} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )
}

/**
 * Tarjetas de esqueleto, para las pantallas que muestran una rejilla o una lista.
 *
 * @param {object} props Propiedades del componente.
 * @param {number} [props.cantidad=6] Cuántas tarjetas pintar.
 * @param {number} [props.alto=132] Alto de cada tarjeta.
 * @param {boolean} [props.conIcono=true] Si reserva el círculo del icono.
 * @returns {object} Las tarjetas renderizadas.
 */
export function TarjetasEsqueleto({ cantidad = 6, alto = 132, conIcono = true }) {
  return (
    <Stack spacing={2}>
      <AnuncioCarga />
      {Array.from({ length: cantidad }, (_, i) => (
        <Paper
          key={i}
          elevation={0}
          sx={{ p: 2.5, border: BORDE, borderRadius: `${RADIO.NORMAL}px`, minHeight: alto }}
        >
          <Stack direction="row" spacing={2} alignItems="flex-start">
            {conIcono && (
              <Skeleton
                variant="circular"
                width={40}
                height={40}
                sx={{ bgcolor: COLOR.RELLENO, flexShrink: 0 }}
              />
            )}
            <Stack spacing={1.2} sx={{ flex: 1 }}>
              <Barra ancho="45%" alto={18} />
              <Barra ancho="85%" />
              <Barra ancho="65%" />
            </Stack>
          </Stack>
        </Paper>
      ))}
    </Stack>
  )
}

/**
 * Un bloque de esqueleto para un panel: una gráfica, un mapa o un resumen.
 *
 * @param {object} props Propiedades del componente.
 * @param {number} [props.alto=350] Alto del bloque.
 * @param {boolean} [props.conTitulo=true] Si reserva la línea del título.
 * @returns {object} El bloque renderizado.
 */
export function BloqueEsqueleto({ alto = 350, conTitulo = true }) {
  return (
    <Box>
      <AnuncioCarga />
      {conTitulo && (
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <Skeleton variant="rounded" width={4} height={24} sx={{ bgcolor: COLOR.BORDE }} />
          <Barra ancho={220} alto={20} />
        </Stack>
      )}
      <Skeleton
        variant="rounded"
        height={alto}
        sx={{ bgcolor: COLOR.RELLENO, borderRadius: `${RADIO.NORMAL}px` }}
      />
    </Box>
  )
}

/**
 * El esqueleto de una pantalla entera: encabezado, filtros y tabla.
 *
 * Para el primer pintado, cuando todavía no hay nada en pantalla y un spinner
 * solo dice "espera" sin decir a qué.
 *
 * @param {object} props Propiedades del componente.
 * @param {number} [props.columnas=5] Columnas de la tabla que va a llegar.
 * @param {number} [props.filas=6] Filas a insinuar.
 * @returns {object} La pantalla renderizada.
 */
export function PantallaEsqueleto({ columnas = 5, filas = 6 }) {
  return (
    <Box>
      <AnuncioCarga />
      <Stack spacing={1} sx={{ mb: 4 }}>
        <Barra ancho={140} alto={12} />
        <Barra ancho={320} alto={34} />
        <Barra ancho={460} />
      </Stack>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Skeleton variant="rounded" width={160} height={44} sx={{ bgcolor: COLOR.RELLENO }} />
        <Skeleton variant="rounded" width={140} height={44} sx={{ bgcolor: COLOR.RELLENO }} />
      </Stack>

      <Paper elevation={0} sx={{ border: BORDE, borderRadius: `${RADIO.NORMAL}px`, p: 2 }}>
        <Stack spacing={2}>
          {Array.from({ length: filas }, (_, fila) => (
            <Stack key={fila} direction="row" spacing={2}>
              {Array.from({ length: columnas }, (_, celda) => (
                <Barra key={celda} ancho={celda === 0 ? "18%" : "100%"} />
              ))}
            </Stack>
          ))}
        </Stack>
      </Paper>
    </Box>
  )
}
