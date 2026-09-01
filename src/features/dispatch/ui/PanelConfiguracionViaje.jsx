import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import CalendarTodayIcon from "@mui/icons-material/CalendarToday"
import GroupIcon from "@mui/icons-material/Group"
import LanguageIcon from "@mui/icons-material/Language"
import LocalShippingIcon from "@mui/icons-material/LocalShipping"
import NumbersIcon from "@mui/icons-material/Numbers"

import {
  PAIS,
  etiquetaViajeTransnacional,
  valorViajeTransnacional,
} from "../../../entities/dispatch"

/**
 * Configuración común a crear y editar un viaje: país, año, número y cruce.
 *
 * Crear y editar mostraban este mismo panel desde dos archivos distintos, así
 * que un campo añadido en uno no aparecía en el otro. El único que cambia es el
 * equipo, que solo se asigna al crear: se dibuja si se pasan los equipos.
 *
 * @param {object} props Propiedades del componente.
 * @param {string} props.pais País base del viaje.
 * @param {Function} props.onPaisChange Recibe el país elegido.
 * @param {number} props.anio Año del viaje, completo.
 * @param {Function} props.onAnioChange Recibe el año elegido.
 * @param {string} props.numeroViaje Número asignado por la API.
 * @param {string} props.anioDosDigitos El año como lo usa la API.
 * @param {boolean} props.esTransnacional Si el viaje cruza la frontera.
 * @param {Function} props.onTransnacionalChange Recibe si es transnacional.
 * @param {boolean} props.esContinuacion Si continúa un viaje del otro país.
 * @param {Function} props.onContinuacionChange Recibe si es continuación.
 * @param {string} props.cruceSeleccionado Viaje del otro país con el que se enlaza.
 * @param {Function} props.onCruceChange Recibe el viaje elegido.
 * @param {Array} props.viajesTransnacionales Viajes del país opuesto.
 * @param {string} props.paisOpuesto El país del otro lado.
 * @param {string} props.movimiento Número de movimiento dentro del cruce.
 * @param {Function} props.onMovimientoChange Recibe el movimiento escrito.
 * @param {Array} [props.equipos] Equipos a los que se puede asignar el viaje.
 * @param {string} [props.equipoSeleccionado] Equipo elegido.
 * @param {Function} [props.onEquipoChange] Recibe el equipo elegido.
 * @returns {object} El panel renderizado.
 */
export function PanelConfiguracionViaje({
  pais,
  onPaisChange,
  anio,
  onAnioChange,
  numeroViaje,
  anioDosDigitos,
  esTransnacional,
  onTransnacionalChange,
  esContinuacion,
  onContinuacionChange,
  cruceSeleccionado,
  onCruceChange,
  viajesTransnacionales = [],
  paisOpuesto,
  movimiento,
  onMovimientoChange,
  equipos,
  equipoSeleccionado = "",
  onEquipoChange,
}) {
  const asignaEquipo = Boolean(equipos)

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
      <Typography
        variant="h6"
        fontWeight={700}
        gutterBottom
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        <LocalShippingIcon color="primary" /> Configuración General
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={3} alignItems="flex-start">
        <Grid size={{ xs: 12, md: 3 }}>
          <TextField
            select
            label="País Base"
            value={pais}
            onChange={(e) => onPaisChange(e.target.value)}
            fullWidth
            size="small"
            InputProps={{ startAdornment: <LanguageIcon fontSize="small" sx={{ mr: 1 }} /> }}
          >
            <MenuItem value={PAIS.MEXICO}>México (MX)</MenuItem>
            <MenuItem value={PAIS.USA}>Estados Unidos (US)</MenuItem>
          </TextField>
        </Grid>

        <Grid size={{ xs: 12, md: 2 }}>
          <TextField
            label="Año"
            type="number"
            value={anio}
            onChange={(e) => onAnioChange(Number(e.target.value))}
            fullWidth
            size="small"
            InputProps={{ startAdornment: <CalendarTodayIcon fontSize="small" sx={{ mr: 1 }} /> }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: asignaEquipo ? 4 : 7 }}>
          <TextField
            label="Trip Number"
            value={numeroViaje}
            fullWidth
            size="small"
            disabled
            helperText={
              pais && numeroViaje
                ? `ID Final: ${pais}${anioDosDigitos}-${numeroViaje}`
                : "Seleccione país y año"
            }
            InputProps={{ startAdornment: <NumbersIcon fontSize="small" sx={{ mr: 1 }} /> }}
          />
        </Grid>

        {asignaEquipo && (
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              select
              label="Asignar a Equipo"
              value={equipoSeleccionado}
              onChange={(e) => onEquipoChange(e.target.value)}
              fullWidth
              size="small"
              InputProps={{ startAdornment: <GroupIcon fontSize="small" sx={{ mr: 1 }} /> }}
            >
              <MenuItem value="">
                <em>-- Visible para todos --</em>
              </MenuItem>
              {equipos.map((equipo) => (
                <MenuItem key={equipo.team_id} value={equipo.team_id}>
                  {equipo.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        )}

        <Grid size={{ xs: 12 }}>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: "#f8f9fa", borderRadius: 2 }}>
            <Stack spacing={1}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={esTransnacional}
                    onChange={(e) => onTransnacionalChange(e.target.checked)}
                  />
                }
                label="Viaje transnacional"
              />

              {esTransnacional && (
                <Box sx={{ pl: 3 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={esContinuacion}
                        onChange={(e) => onContinuacionChange(e.target.checked)}
                        size="small"
                      />
                    }
                    label={`Continuación (${paisOpuesto})`}
                  />

                  {esContinuacion && (
                    <TextField
                      select
                      label={`Vincular con Viaje ${paisOpuesto}`}
                      value={cruceSeleccionado}
                      onChange={(e) => onCruceChange(e.target.value)}
                      fullWidth
                      size="small"
                      margin="dense"
                    >
                      <MenuItem value="">-- Seleccione --</MenuItem>
                      {viajesTransnacionales.map((viaje) => (
                        <MenuItem key={viaje.trip_id} value={valorViajeTransnacional(viaje)}>
                          {etiquetaViajeTransnacional(viaje)}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}

                  <TextField
                    label="Movimiento"
                    value={movimiento}
                    onChange={(e) => onMovimientoChange(e.target.value)}
                    fullWidth
                    size="small"
                    margin="dense"
                    placeholder="Opcional"
                  />
                </Box>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  )
}
