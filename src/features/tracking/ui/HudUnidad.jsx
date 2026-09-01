import { useEffect, useState } from "react"
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
  Paper,
  Slider,
  Stack,
  Typography,
} from "@mui/material"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import CloseIcon from "@mui/icons-material/Close"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import SettingsIcon from "@mui/icons-material/Settings"
import SpeedIcon from "@mui/icons-material/Speed"

import FuelGauge from "../../../components/FuelGauge"
import {
  CAPACIDAD_POR_OMISION,
  colorEstado,
  lecturaTanqueSospechosa,
  porcentajeTanque,
  tramoActivo,
} from "../../../entities/tracking"
import { ParadasEtapa } from "./ParadasEtapa"

const POSICION = { position: "absolute", top: { xs: 10, md: 20 }, right: { xs: 10, md: 20 }, zIndex: 1000 }

/**
 * La pastilla que queda cuando el HUD se pliega.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.unidad La unidad seleccionada.
 * @param {Function} props.onDesplegar Vuelve a abrir el HUD.
 * @returns {object} La pastilla renderizada.
 */
export function HudPlegado({ unidad, onDesplegar }) {
  return (
    <Paper
      elevation={6}
      onClick={onDesplegar}
      sx={{
        ...POSICION,
        bgcolor: unidad.color,
        color: "white",
        px: 2,
        py: 1,
        borderRadius: 5,
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
        boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
        transition: "0.2s",
        "&:hover": { transform: "scale(1.05)", opacity: 0.9 },
      }}
    >
      <Typography variant="subtitle2" fontWeight={800} sx={{ mr: 1, fontSize: "0.9rem" }}>
        {unidad.name}
      </Typography>
      <KeyboardArrowUpIcon fontSize="small" />
    </Paper>
  )
}

/**
 * El panel flotante con el detalle de la unidad seleccionada.
 *
 * La calibración del tanque se lleva aquí dentro: mientras la persona mueve el
 * control, el refresco automático de la flota no debe pisarle el valor. Monta
 * con `key={unidad.id}` para que cambiar de unidad reinicie el ajuste.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.unidad La unidad seleccionada.
 * @param {Array} props.paradas Las paradas de la etapa activa.
 * @param {boolean} props.paradasCargando Si las paradas se están pidiendo.
 * @param {Function} props.onGuardarTanque Recibe `{truckId, galones, capacidad}`.
 * @param {Function} props.onConfigurar Abre la configuración del tanque.
 * @param {Function} props.onPlegar Pliega el panel.
 * @param {Function} props.onCerrar Deselecciona la unidad.
 * @returns {object} El panel renderizado.
 */
export function HudUnidad({
  unidad,
  paradas,
  paradasCargando,
  onGuardarTanque,
  onConfigurar,
  onPlegar,
  onCerrar,
}) {
  const [galones, setGalones] = useState(unidad.current_fuel)
  const [ajustado, setAjustado] = useState(false)

  useEffect(() => {
    if (!ajustado) setGalones(unidad.current_fuel)
  }, [unidad.current_fuel, ajustado])

  const capacidad = unidad.tank_capacity || CAPACIDAD_POR_OMISION
  const tramo = tramoActivo(unidad)
  const sospechosa = lecturaTanqueSospechosa(unidad)

  const guardar = () => {
    onGuardarTanque({ truckId: unidad.truck_id, galones, capacidad: unidad.tank_capacity })
    setAjustado(false)
  }

  return (
    <Paper
      elevation={6}
      sx={{
        ...POSICION,
        width: { xs: 290, sm: 320, md: 340, lg: 360 },
        borderRadius: 3,
        overflow: "hidden",
        maxHeight: "calc(100% - 40px)",
        overflowY: "auto",
      }}
    >
      <Box
        sx={{
          bgcolor: unidad.color,
          p: { xs: 1.5, md: 2 },
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, fontSize: { xs: "1.2rem", md: "1.5rem" } }}>
            {unidad.name}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            Placa: {unidad.placa}
          </Typography>
        </Box>

        <Stack direction="row" spacing={0.5}>
          {unidad.truck_id && (
            <IconButton
              size="small"
              onClick={onConfigurar}
              sx={{ color: "white", bgcolor: "rgba(0,0,0,0.2)", "&:hover": { bgcolor: "rgba(0,0,0,0.4)" } }}
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          )}
          <IconButton
            size="small"
            onClick={onPlegar}
            sx={{ color: "white", bgcolor: "rgba(0,0,0,0.2)", "&:hover": { bgcolor: "rgba(0,0,0,0.4)" } }}
          >
            <KeyboardArrowDownIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={onCerrar}
            sx={{ color: "white", bgcolor: "rgba(0,0,0,0.2)", "&:hover": { bgcolor: "rgba(0,0,0,0.4)" } }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      <Box sx={{ p: { xs: 1.5, md: 2 } }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2, p: 1, bgcolor: "#f8fafc", borderRadius: 2, border: "1px dashed #cbd5e1" }}
        >
          <Typography variant="caption" fontWeight={700} color="#475569">
            {unidad.trip_number ? `Viaje: #${unidad.trip_number}` : "Unidad Libre"}
          </Typography>
          {unidad.trip_number && (
            <Chip
              label={unidad.status}
              size="small"
              sx={{
                height: 20,
                fontSize: "0.65rem",
                fontWeight: 800,
                color: "white",
                bgcolor: colorEstado(unidad.status),
              }}
            />
          )}
        </Stack>

        {unidad.current_stage_number && (
          <Box sx={{ mb: 2, p: 1.5, bgcolor: "#eff6ff", borderRadius: 2, border: "1px solid #bfdbfe" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
              <Typography variant="caption" fontWeight={800} color="#1d4ed8">
                Etapa {unidad.current_stage_number}
              </Typography>
              {unidad.current_stop && (
                <Chip
                  label="En ruta a parada"
                  size="small"
                  sx={{ height: 18, fontSize: "0.6rem", bgcolor: "#f59e0b", color: "white", fontWeight: "bold" }}
                />
              )}
            </Stack>

            <Typography variant="caption" display="block" color="#334155" fontWeight={600}>
              {tramo.origen} ➔ {tramo.destino}
            </Typography>
            {tramo.destinoFinal && (
              <Typography variant="caption" display="block" color="#64748b" sx={{ mt: 0.3 }}>
                Destino final: {tramo.destinoFinal}
              </Typography>
            )}

            <ParadasEtapa paradas={paradas} cargando={paradasCargando} />
          </Box>
        )}

        <Stack spacing={1.5} sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <LocationOnIcon sx={{ color: "#ef4444", fontSize: 20, mt: 0.2 }} />
            <Typography
              variant="body2"
              color="#334155"
              fontWeight={600}
              lineHeight={1.3}
              sx={{ wordBreak: "break-word" }}
            >
              {unidad.address}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <SpeedIcon sx={{ color: "#3b82f6", fontSize: 20 }} />
            <Typography variant="body2" color="#334155" fontWeight={700}>
              {unidad.speed} km/h
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <AccessTimeIcon sx={{ color: "#94a3b8", fontSize: 20 }} />
            <Typography variant="caption" color="#64748b">
              Últ. act: {unidad.timestamp ? new Date(unidad.timestamp * 1000).toLocaleTimeString() : "---"}
            </Typography>
          </Stack>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {unidad.truck_id ? (
          <Box>
            <Typography variant="subtitle2" fontWeight={800} color="#0f172a" mb={1} textAlign="center">
              Niveles y Autonomía
            </Typography>

            {sospechosa && (
              <Alert severity="warning" sx={{ mb: 1, py: 0, fontSize: "0.7rem" }}>
                El tanque reporta {unidad.current_fuel} gal con capacidad para {unidad.tank_capacity}.
              </Alert>
            )}

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mb: 1,
                transform: { xs: "scale(0.85)", md: "scale(1)" },
                transformOrigin: "top center",
              }}
            >
              <FuelGauge
                percent={porcentajeTanque(galones, unidad.tank_capacity)}
                value={galones}
                capacity={unidad.tank_capacity}
              />
            </Box>

            <Box sx={{ mb: 1, px: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                  Calibración Manual (Galones)
                </Typography>
                {ajustado && (
                  <Button
                    size="small"
                    variant="contained"
                    onClick={guardar}
                    sx={{ minWidth: 50, py: 0, fontSize: "0.6rem", height: 20, bgcolor: "#0f172a" }}
                  >
                    Guardar
                  </Button>
                )}
              </Stack>
              <Slider
                value={Math.min(galones, capacidad)}
                min={0}
                max={capacidad}
                onChange={(evento, valor) => {
                  setGalones(valor)
                  setAjustado(true)
                }}
                size="small"
                sx={{ color: porcentajeTanque(galones, capacidad) < 20 ? "#ef4444" : "#3b82f6" }}
              />
            </Box>

            <Grid container spacing={1} sx={{ pt: 1, borderTop: "1px dashed #e2e8f0" }}>
              <Grid size={{ xs: 6 }} sx={{ textAlign: "center", borderRight: "1px solid #e2e8f0" }}>
                <Typography variant="caption" color="#64748b" display="block" fontWeight={600}>
                  Rendimiento
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight={800}
                  color="#3b82f6"
                  sx={{ fontSize: { xs: "1rem", md: "1.25rem" } }}
                >
                  {unidad.avg_mpg > 0 ? Number(unidad.avg_mpg).toFixed(2) : "--"}{" "}
                  <span style={{ fontSize: "0.5em" }}>MPG</span>
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }} sx={{ textAlign: "center" }}>
                <Typography variant="caption" color="#64748b" display="block" fontWeight={600}>
                  Alcance
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight={800}
                  color="#10b981"
                  sx={{ fontSize: { xs: "1rem", md: "1.25rem" } }}
                >
                  {unidad.estimated_range > 0 ? Number(unidad.estimated_range).toFixed(0) : "--"}{" "}
                  <span style={{ fontSize: "0.5em" }}>mi</span>
                </Typography>
              </Grid>
            </Grid>
          </Box>
        ) : (
          <Box sx={{ p: 1.5, textAlign: "center", bgcolor: "#f1f5f9", borderRadius: 2 }}>
            <Typography variant="caption" color="#64748b" fontWeight={600}>
              Telemetría no disponible. Unidad no registrada internamente.
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  )
}
