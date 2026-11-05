import { useMemo } from "react"
import { Box, Stack, Typography } from "@mui/material"
import { BarChart } from "@mui/x-charts/BarChart"

import { MESES_CORTOS, margenPorMes, mesesMoviles } from "../../../entities/finance"
import { BloqueEsqueleto, SECTION_LABEL_SX } from "../../../shared/ui"
import { COLOR } from "../../../shared/ui/tokens"

/**
 * Un monto en dólares, sin centavos, para los ejes y el tooltip.
 *
 * @param {number} valor El monto.
 * @returns {string} El monto con formato.
 */
const dolares = (valor) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    Number(valor || 0)
  )

/**
 * Un porcentaje con un decimal, o `null` para que el tooltip omita el renglón.
 *
 * @param {?number} valor El porcentaje.
 * @returns {?string} El porcentaje con formato.
 */
const porcentaje = (valor) => (valor == null ? null : `${Number(valor).toFixed(1)}%`)

const PROPS_TOOLTIP = {
  legend: { hidden: false, direction: "row", position: { vertical: "top", horizontal: "right" } },
  tooltip: { trigger: "axis" },
}

/**
 * El encabezado de cada gráfica, igual al de la de gastos.
 *
 * @param {object} props Propiedades del componente.
 * @param {string} props.titulo El título.
 * @param {string} props.descripcion Qué se está midiendo.
 * @returns {object} El encabezado.
 */
function Encabezado({ titulo, descripcion }) {
  return (
    <Box sx={{ mb: 1 }}>
      <Typography variant="overline" sx={SECTION_LABEL_SX}>
        Analítica
      </Typography>
      <Typography variant="h6" fontWeight={700} color={COLOR.TINTA} sx={{ lineHeight: 1.3 }}>
        {titulo}
      </Typography>
      <Typography variant="body2" color={COLOR.APAGADO}>
        {descripcion}
      </Typography>
    </Box>
  )
}

/**
 * Las dos gráficas de Margen: el margen total por mes y cuánto del Total Tarifa
 * se va en diesel y en pago al chofer. Solo cuentan los viajes completados.
 *
 * @param {object} props Propiedades del componente.
 * @param {Array.<object>} props.viajes Los viajes ya calculados de Margen.
 * @param {boolean} [props.cargando] Si todavía no llegan los datos.
 * @returns {object} Las gráficas.
 */
export function GraficasMargen({ viajes, cargando }) {
  const meses = useMemo(() => mesesMoviles(), [])
  const rango = `${MESES_CORTOS[meses[0].mes - 1]} ${meses[0].anio} – ${MESES_CORTOS[meses[11].mes - 1]} ${meses[11].anio}`

  const filas = useMemo(
    () => margenPorMes(viajes.filter((viaje) => viaje.isCompleted), meses),
    [viajes, meses]
  )

  if (cargando) return <BloqueEsqueleto alto={340} conTitulo={false} />

  if (!filas.some((fila) => fila.viajes > 0)) {
    return (
      <Stack alignItems="center" justifyContent="center" height={340}>
        <Typography color="text.secondary">No hay viajes completados entre {rango}.</Typography>
      </Stack>
    )
  }

  return (
    <Stack spacing={4}>
      <Box>
        <Encabezado
          titulo="Margen Total por Mes"
          descripcion="Últimos 12 meses · Suma del margen de los viajes completados, por mes de creación del viaje, en dólares"
        />
        <BarChart
          dataset={filas}
          xAxis={[{ dataKey: "etiqueta", scaleType: "band" }]}
          yAxis={[
            {
              valueFormatter: dolares,
              width: 95,
              colorMap: { type: "piecewise", thresholds: [0], colors: [COLOR.PELIGRO, COLOR.EXITO] },
            },
          ]}
          series={[
            {
              dataKey: "margen",
              label: "Margen",
              valueFormatter: (valor, { dataIndex }) => (filas[dataIndex].viajes ? dolares(valor) : null),
            },
          ]}
          height={380}
          margin={{ top: 20, right: 20, bottom: 30, left: 10 }}
          borderRadius={4}
          slotProps={{ ...PROPS_TOOLTIP, legend: { hidden: true } }}
        />
      </Box>

      <Box>
        <Encabezado
          titulo="Diesel y Pago Driver sobre el Total Tarifa"
          descripcion="Últimos 12 meses · (Costo Diesel ÷ Total Tarifa) × 100 y (Pago Driver ÷ Total Tarifa) × 100, con los totales de cada mes"
        />
        <BarChart
          dataset={filas}
          xAxis={[{ dataKey: "etiqueta", scaleType: "band" }]}
          yAxis={[{ valueFormatter: (valor) => `${valor}%`, width: 60 }]}
          series={[
            { dataKey: "pctDiesel", label: "Costo Diesel", stack: "total", color: COLOR.AVISO, valueFormatter: porcentaje },
            { dataKey: "pctDriver", label: "Pago Driver", stack: "total", color: COLOR.INFO, valueFormatter: porcentaje },
          ]}
          height={380}
          margin={{ top: 20, right: 20, bottom: 30, left: 10 }}
          borderRadius={4}
          slotProps={PROPS_TOOLTIP}
        />
      </Box>
    </Stack>
  )
}
