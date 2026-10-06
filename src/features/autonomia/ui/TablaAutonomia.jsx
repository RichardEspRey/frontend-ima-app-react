import { Box, Chip, Typography } from "@mui/material"

import {
  REGISTROS_POR_CAMION,
  nivelRendimiento,
  promedioMpg,
  registrosEnCasillas,
} from "../../../entities/autonomy"
import { soloFecha, decimales } from "../../../shared/lib/formato"
import { COLOR, DataTable } from "../../../shared/ui"
import { COLOR_NIVEL, colorTexto } from "./coloresRendimiento"

const SIN_DATO = <Typography variant="caption" color={COLOR.TENUE}>—</Typography>

/**
 * Una carga dentro de su casilla: rendimiento, galones y fecha.
 *
 * @param {object} props Propiedades del componente.
 * @param {(object|null)} props.registro La carga, o `null` si la casilla está vacía.
 * @returns {object} La casilla renderizada.
 */
function CeldaRegistro({ registro }) {
  if (!registro) return SIN_DATO

  return (
    <Box>
      <Typography fontWeight={700} fontSize={15} color={colorTexto(nivelRendimiento(registro.mpg))}>
        {decimales(registro.mpg)}
      </Typography>
      <Typography variant="caption" display="block" color={COLOR.APAGADO} sx={{ lineHeight: 1.2 }}>
        {decimales(registro.galones, 0)} gal
      </Typography>
      <Typography variant="caption" display="block" color={COLOR.TENUE} fontSize={10}>
        {soloFecha(String(registro.fecha).replace(" ", "T"))}
      </Typography>
    </Box>
  )
}

/**
 * La tabla de autonomía: una fila por camión, sus últimas cargas y el promedio.
 *
 * @param {object} props Propiedades del componente.
 * @param {Array.<object>} props.camiones Las autonomías de la entidad.
 * @param {boolean} props.cargando Si es la primera carga.
 * @param {(string|null)} props.error Mensaje de error, si lo hay.
 * @returns {object} La tabla renderizada.
 */
export function TablaAutonomia({ camiones, cargando, error }) {
  const columnas = [
    {
      id: "unidad",
      label: "Camión",
      ordenable: true,
      valor: (camion) => Number(camion.unidad) || camion.unidad,
      render: (camion) => (
        <Box>
          <Typography fontWeight={700}>{camion.unidad}</Typography>
          <Typography variant="caption" color={COLOR.APAGADO} sx={{ fontFamily: "monospace" }}>
            {camion.placa}
          </Typography>
        </Box>
      ),
    },
    ...Array.from({ length: REGISTROS_POR_CAMION }, (_, i) => ({
      id: `registro-${i}`,
      label: `Registro ${i + 1}`,
      align: "center",
      render: (camion) => <CeldaRegistro registro={registrosEnCasillas(camion)[i]} />,
    })),
    {
      id: "promedio",
      label: "Promedio",
      align: "center",
      ordenable: true,
      valor: (camion) => promedioMpg(camion),
      render: (camion) => {
        const promedio = promedioMpg(camion)
        return (
          <Chip
            label={`${decimales(promedio)} MPG`}
            color={COLOR_NIVEL[nivelRendimiento(promedio)]}
            sx={{ fontWeight: 700, minWidth: 96 }}
          />
        )
      },
    },
  ]

  return (
    <DataTable
      filas={camiones}
      columnas={columnas}
      claveFila="truck_id"
      cargando={cargando}
      error={error}
      vacio="No hay suficientes cargas de más de 100 galones para calcular la autonomía."
    />
  )
}
