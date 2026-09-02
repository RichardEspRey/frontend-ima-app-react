import { useMemo, useState } from "react"
import {
  Alert,
  Box,
  Chip,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import FilterListIcon from "@mui/icons-material/FilterList"
import { useQuery } from "@tanstack/react-query"

import TankConfigModal from "../../components/TankConfigModal"
import UnitCard from "../../components/UnitCard"
import {
  ESTATUS_SIN_VIAJE,
  ESTATUS_TABLERO,
  ESTATUS_TODOS,
  filtrarPorEstatus,
  lecturaTanqueSospechosa,
  obtenerTablero,
  useGuardarTanque,
} from "../../entities/tracking"
import { PageHeader, notify, TarjetasEsqueleto } from "../../shared/ui"
import { COLOR } from "../../shared/ui/tokens"

/**
 * Tablero de combustible: niveles, autonomía y estatus de cada unidad.
 *
 * Es la misma telemetría que alimenta el mapa, vista como fichas en vez de como
 * mapa, para revisar la flota de un vistazo sin buscar unidad por unidad.
 *
 * @returns {object} La pantalla renderizada.
 */
export default function TableroCombustiblePage() {
  const [estatus, setEstatus] = useState(ESTATUS_TODOS)
  const [enConfiguracion, setEnConfiguracion] = useState(null)

  const { data: unidades = [], isLoading } = useQuery({
    queryKey: ["tracking", "tablero"],
    queryFn: ({ signal }) => obtenerTablero({ signal }),
  })

  const guardarTanque = useGuardarTanque()

  const visibles = useMemo(() => filtrarPorEstatus(unidades, estatus), [unidades, estatus])

  // El indicador acota lo que dibuja, así que una lectura imposible se ve como
  // un tanque lleno o vacío perfectamente normal. Se nombra aquí para que quien
  // mire el tablero sepa de qué unidades no fiarse.
  const sospechosas = useMemo(() => unidades.filter(lecturaTanqueSospechosa), [unidades])

  const guardar = async (truckId, galones, capacidad) => {
    try {
      await guardarTanque.mutateAsync({ truckId, galones, capacidad })
      notify.exito("Telemetría actualizada.")
      return true
    } catch (fallo) {
      notify.error(fallo)
      return false
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        seccion="Unidades"
        titulo="Tablero de Combustible"
        descripcion="Monitoreo de niveles, autonomía y estatus de viajes activos."
        acciones={
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip label="Tiempo Real" color="success" size="small" variant="outlined" />
            <TextField
              select
              label="Filtrar por Estatus"
              size="small"
              value={estatus}
              onChange={(e) => setEstatus(e.target.value)}
              sx={{ minWidth: 220 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterListIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            >
              {ESTATUS_TABLERO.map((opcion) => (
                <MenuItem key={opcion} value={opcion}>
                  {opcion === ESTATUS_SIN_VIAJE ? "Sin Viaje Asignado" : opcion}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        }
      />

      {sospechosas.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Lecturas de tanque imposibles en{" "}
          {sospechosas.length === 1 ? "la unidad" : "las unidades"}{" "}
          {sospechosas.map((u) => u.unidad).join(", ")}:{" "}
          {sospechosas
            .map((u) => `${u.current_fuel} gal en un tanque de ${u.tank_capacity}`)
            .join("; ")}
          . El nivel que se dibuja está acotado; el dato de origen está mal.
        </Alert>
      )}

      {isLoading ? (
        <TarjetasEsqueleto cantidad={8} alto={150} />
      ) : (
        <Grid container spacing={3}>
          {visibles.map((unidad) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={unidad.truck_id}>
              <UnitCard truck={unidad} onUpdate={guardar} onConfig={setEnConfiguracion} />
            </Grid>
          ))}

          {visibles.length === 0 && (
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 4, textAlign: "center", bgcolor: COLOR.LIENZO }}>
                <Typography color="text.secondary">
                  No hay unidades con el estatus &quot;{estatus}&quot;
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      <TankConfigModal
        open={Boolean(enConfiguracion)}
        onClose={() => setEnConfiguracion(null)}
        onSave={guardar}
        truck={enConfiguracion}
      />
    </Box>
  )
}
