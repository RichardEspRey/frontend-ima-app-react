import {
  Box,
  InputAdornment,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material"
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation"
import SearchIcon from "@mui/icons-material/Search"
import WarningAmberIcon from "@mui/icons-material/WarningAmber"

import { lecturaTanqueSospechosa, porcentajeTanque } from "../../../entities/tracking"
import { COLOR_PUNTO_1, COLOR_PUNTO_2 } from "./iconos"
import { COLOR } from "../../../shared/ui/tokens"

const TANQUE_BAJO = 20

/**
 * La lista lateral de unidades, con su buscador.
 *
 * Cada tarjeta se colorea según el papel que juega la unidad: extremo de una
 * ruta que se está trazando, o simplemente la seleccionada.
 *
 * @param {object} props Propiedades del componente.
 * @param {Array} props.unidades Las unidades a listar, ya filtradas.
 * @param {string} props.busqueda Lo que hay escrito en el buscador.
 * @param {Function} props.onBusquedaChange Recibe lo que se escribe.
 * @param {object} [props.seleccionada] La unidad seleccionada.
 * @param {object} [props.punto1] Primer extremo de la ruta.
 * @param {object} [props.punto2] Segundo extremo de la ruta.
 * @param {Function} props.onSeleccionar Recibe la unidad que se tocó.
 * @returns {object} La lista renderizada.
 */
export function ListaUnidades({
  unidades = [],
  busqueda,
  onBusquedaChange,
  seleccionada,
  punto1,
  punto2,
  onSeleccionar,
}) {
  return (
    <>
      <Box sx={{ p: 2, borderBottom: `1px solid ${COLOR.BORDE}`, bgcolor: COLOR.TINTA, color: "white" }}>
        <Typography variant="h6" fontWeight={800}>
          Centro de Comando
        </Typography>
        <Typography variant="caption" sx={{ opacity: 0.7 }}>
          Rastreo Satelital &amp; Telemetría Activa
        </Typography>

        <TextField
          fullWidth
          size="small"
          placeholder="Buscar unidad..."
          value={busqueda}
          onChange={(e) => onBusquedaChange(e.target.value)}
          sx={{ mt: 2, bgcolor: "rgba(255,255,255,0.1)", borderRadius: 1, "& input": { color: "white" } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "white" }} fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", p: 1 }}>
        {unidades.map((unidad) => {
          const llenado = porcentajeTanque(unidad.current_fuel, unidad.tank_capacity)
          const sospechosa = lecturaTanqueSospechosa(unidad)
          const esPunto1 = punto1?.id === unidad.id
          const esPunto2 = punto2?.id === unidad.id
          const esSeleccionada = seleccionada?.id === unidad.id

          return (
            <Paper
              key={unidad.id}
              elevation={0}
              onClick={() => onSeleccionar(unidad)}
              sx={{
                p: 1.5,
                mb: 1,
                cursor: "pointer",
                border: "1px solid",
                borderColor: esPunto1
                  ? COLOR_PUNTO_1
                  : esPunto2
                    ? COLOR_PUNTO_2
                    : esSeleccionada
                      ? COLOR.INFO
                      : COLOR.BORDE,
                bgcolor: esPunto1
                  ? "#eef5ff"
                  : esPunto2
                    ? COLOR.PELIGRO_FONDO
                    : esSeleccionada
                      ? COLOR.INFO_FONDO
                      : "white",
                transition: "0.2s",
                "&:hover": { borderColor: "#93c5fd" },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box sx={{ width: 6, height: 40, bgcolor: unidad.color, borderRadius: 1 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2" fontWeight={800} color={COLOR.TINTA}>
                      {unidad.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      color={unidad.speed > 0 ? COLOR.EXITO : COLOR.APAGADO}
                    >
                      {unidad.speed > 0 ? `${unidad.speed} km/h` : "Detenido"}
                    </Typography>
                  </Stack>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{ mt: 0.5, lineHeight: 1.2 }}
                  >
                    {unidad.address}
                  </Typography>

                  {unidad.truck_id && (
                    <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}>
                      <LocalGasStationIcon
                        sx={{ fontSize: 14, color: llenado < TANQUE_BAJO ? COLOR.PELIGRO : COLOR.APAGADO }}
                      />
                      <LinearProgress
                        variant="determinate"
                        value={llenado}
                        sx={{
                          flexGrow: 1,
                          height: 6,
                          borderRadius: 3,
                          bgcolor: COLOR.BORDE,
                          "& .MuiLinearProgress-bar": {
                            bgcolor: llenado < TANQUE_BAJO ? COLOR.PELIGRO : COLOR.EXITO,
                          },
                        }}
                      />
                      {sospechosa && (
                        <Tooltip title={`Lectura imposible: ${unidad.current_fuel} gal en un tanque de ${unidad.tank_capacity}`}>
                          <WarningAmberIcon sx={{ fontSize: 15, color: COLOR.AVISO }} />
                        </Tooltip>
                      )}
                    </Box>
                  )}
                </Box>
              </Stack>
            </Paper>
          )
        })}
      </Box>
    </>
  )
}
