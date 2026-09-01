import { Box, Divider, Paper, Stack, Typography } from "@mui/material"
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong"

const TITULO_SX = { textTransform: "uppercase", letterSpacing: 0.5 }

/**
 * Un importe en dólares, o una raya si no hay dato.
 *
 * @param {*} valor La cantidad.
 * @returns {string} El importe formateado.
 */
export const dolares = (valor) =>
  valor !== "" && valor !== null && valor !== undefined
    ? `$${Number.parseFloat(valor).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
    : "—"

/**
 * Una distancia en millas, o una raya si no hay dato.
 *
 * @param {*} valor Las millas.
 * @returns {string} La distancia formateada.
 */
export const millas = (valor) =>
  valor !== null && valor !== undefined && valor !== ""
    ? `${Number.parseFloat(valor).toLocaleString("en-US", { maximumFractionDigits: 1 })} mi`
    : "—"

/**
 * Una fila del resumen: concepto a la izquierda, valor a la derecha.
 *
 * @param {object} props Propiedades del componente.
 * @param {string} props.etiqueta El concepto.
 * @param {*} props.valor Lo que vale.
 * @param {boolean} [props.destacada] Si va en negrita, para los totales.
 * @returns {object} La fila renderizada.
 */
export function FilaResumen({ etiqueta, valor, destacada }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ py: 0.6 }}>
      <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0, mr: 1 }}>
        {etiqueta}
      </Typography>
      <Typography
        variant="body2"
        fontWeight={destacada ? 700 : 500}
        sx={{ textAlign: "right", wordBreak: "break-word", maxWidth: "60%" }}
      >
        {valor || "—"}
      </Typography>
    </Stack>
  )
}

/**
 * Un bloque del resumen, con su título.
 *
 * @param {object} props Propiedades del componente.
 * @param {string} props.titulo Nombre del bloque.
 * @param {object} props.children Las filas.
 * @returns {object} El bloque renderizado.
 */
export function BloqueResumen({ titulo, children }) {
  return (
    <>
      <Typography variant="caption" fontWeight={700} color="primary" sx={TITULO_SX}>
        {titulo}
      </Typography>
      <Box sx={{ mt: 1, mb: 2 }}>{children}</Box>
    </>
  )
}

/**
 * El panel de resumen de la cotización en curso.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.ubicaciones Origen, destino y origen del camión.
 * @param {object} props.distancias Millas del viaje y vacías.
 * @param {object} props.cifras Tarifa, millas y rate.
 * @returns {object} El panel renderizado.
 */
export function ResumenCotizacion({ ubicaciones, distancias, cifras }) {
  const { millasViaje, millasVacias } = distancias
  const hayDistancias = millasViaje !== null || millasVacias !== null

  return (
    <Paper
      elevation={0}
      sx={{ flex: "0 0 250px", p: 3, borderRadius: 2, border: "1px solid #e0e0e0" }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2.5 }}>
        <ReceiptLongIcon sx={{ color: "primary.main" }} />
        <Typography variant="subtitle1" fontWeight={700}>
          Resumen
        </Typography>
      </Stack>

      <BloqueResumen titulo="Ruta">
        <FilaResumen etiqueta="Origen" valor={ubicaciones.origen.input} />
        <FilaResumen etiqueta="Destino" valor={ubicaciones.destino.input} />
        {ubicaciones.origenCamion.input && (
          <FilaResumen etiqueta="Origen Camión" valor={ubicaciones.origenCamion.input} />
        )}
      </BloqueResumen>

      {hayDistancias && (
        <>
          <Divider sx={{ my: 1.5 }} />
          <BloqueResumen titulo="Distancias">
            {millasViaje !== null && (
              <FilaResumen etiqueta="Millas de Viaje" valor={millas(millasViaje)} />
            )}
            {millasVacias !== null && (
              <FilaResumen etiqueta="Millas Vacías" valor={millas(millasVacias)} />
            )}
            {millasViaje !== null && (
              <FilaResumen
                etiqueta="Total Millas"
                valor={millas(millasViaje + (millasVacias ?? 0))}
                destacada
              />
            )}
          </BloqueResumen>
        </>
      )}

      <Divider sx={{ my: 1.5 }} />
      <BloqueResumen titulo="Cotización">
        <FilaResumen etiqueta="Tarifa" valor={dolares(cifras.tarifa)} />
        <FilaResumen etiqueta="Millas" valor={cifras.millas ? millas(cifras.millas) : "—"} />
        <FilaResumen
          etiqueta="Rate"
          valor={cifras.rate ? `$${Number.parseFloat(cifras.rate).toFixed(4)}/mi` : "—"}
          destacada
        />
      </BloqueResumen>
    </Paper>
  )
}
