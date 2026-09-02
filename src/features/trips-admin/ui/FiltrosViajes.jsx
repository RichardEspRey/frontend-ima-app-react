import {
  Box,
  Button,
  Collapse,
  Divider,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined"
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined"
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined"
import FilterListIcon from "@mui/icons-material/FilterList"
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined"
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined"
import PersonOutlineIcon from "@mui/icons-material/PersonOutline"
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined"
import SwapHorizIcon from "@mui/icons-material/SwapHoriz"
import TripOriginIcon from "@mui/icons-material/TripOrigin"

import { DIRECCION_TODAS } from "../../../entities/trip"
import { COLOR } from "../../../shared/ui/tokens"

const DIRECCIONES = [
  { valor: DIRECCION_TODAS, etiqueta: "Todas las Direcciones" },
  { valor: "Going Up", etiqueta: "Going Up" },
  { valor: "Going Down", etiqueta: "Going Down" },
]

const GRUPOS = [
  {
    titulo: "Identificación",
    campos: [
      { clave: "filterTrip", etiqueta: "Trip Number", icono: ConfirmationNumberOutlinedIcon, ancho: 3 },
      { clave: "filterDriver", etiqueta: "Driver", icono: PersonOutlineIcon, ancho: 3 },
      { clave: "filterTruck", etiqueta: "Truck", icono: LocalShippingOutlinedIcon, ancho: 3 },
      { clave: "filterTrailer", etiqueta: "Trailer", icono: Inventory2OutlinedIcon, ancho: 3 },
    ],
  },
  {
    titulo: "Ruta",
    campos: [
      { clave: "filterOrigin", etiqueta: "Origin", icono: TripOriginIcon, ancho: 4 },
      { clave: "filterDestination", etiqueta: "Destination", icono: PlaceOutlinedIcon, ancho: 4 },
      { clave: "filterDirection", etiqueta: "Direction", icono: SwapHorizIcon, ancho: 4, opciones: DIRECCIONES },
    ],
  },
  {
    titulo: "Otros",
    campos: [
      { clave: "filterCompany", etiqueta: "Company", icono: ApartmentOutlinedIcon, ancho: 4 },
      { clave: "filterCI", etiqueta: "CI", icono: BadgeOutlinedIcon, ancho: 4, permiso: "factura" },
    ],
  },
]

const ETIQUETA_GRUPO_SX = {
  color: COLOR.TENUE,
  fontWeight: 700,
  letterSpacing: "0.08em",
  fontSize: "0.68rem",
}

/**
 * La barra de filtros de la lista de viajes, plegable.
 *
 * Los campos se declaran en una tabla en vez de escribirse uno a uno: eran
 * nueve bloques de JSX casi idénticos que solo cambiaban etiqueta e icono.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.filtros Los valores actuales.
 * @param {Function} props.onFiltroChange Recibe `(campo, valor)`.
 * @param {Function} props.onLimpiar Vacía todos los filtros.
 * @param {boolean} props.abiertos Si el panel está desplegado.
 * @param {Function} props.onAlternar Pliega o despliega el panel.
 * @param {number} props.activos Cuántos filtros están puestos.
 * @param {boolean} props.puedeVerCi Si la persona puede filtrar por CI.
 * @returns {object} La barra renderizada.
 */
export function FiltrosViajes({
  filtros,
  onFiltroChange,
  onLimpiar,
  abiertos,
  onAlternar,
  activos,
  puedeVerCi,
}) {
  return (
    <>
      <Box sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={onAlternar}
          sx={{
            bgcolor: "white",
            borderColor: activos > 0 ? COLOR.TINTA : COLOR.BORDE_FUERTE,
            color: COLOR.TEXTO,
            fontWeight: 600,
            textTransform: "none",
            borderRadius: 2,
          }}
        >
          {abiertos ? "Ocultar Filtros" : "Mostrar Filtros"}
          {activos > 0 && (
            <Box
              component="span"
              sx={{
                ml: 1,
                minWidth: 20,
                height: 20,
                px: 0.6,
                borderRadius: "10px",
                bgcolor: COLOR.TINTA,
                color: COLOR.BLANCO,
                fontSize: "0.72rem",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {activos}
            </Box>
          )}
        </Button>
      </Box>

      <Collapse in={abiertos}>
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2, border: `1px solid ${COLOR.BORDE}` }} elevation={0}>
          <Stack spacing={2.5}>
            {GRUPOS.map((grupo, indice) => {
              const visibles = grupo.campos.filter(
                (campo) => campo.permiso !== "factura" || puedeVerCi,
              )
              if (visibles.length === 0) return null

              return (
                <Box key={grupo.titulo}>
                  {indice > 0 && <Divider sx={{ borderColor: COLOR.RELLENO, mb: 2.5 }} />}
                  <Typography variant="overline" sx={ETIQUETA_GRUPO_SX}>
                    {grupo.titulo}
                  </Typography>

                  <Grid container spacing={2} sx={{ mt: 0.25 }}>
                    {visibles.map((campo) => {
                      const Icono = campo.icono
                      return (
                        <Grid key={campo.clave} size={{ xs: 12, sm: 6, md: campo.ancho }}>
                          <TextField
                            select={Boolean(campo.opciones)}
                            label={campo.etiqueta}
                            size="small"
                            fullWidth
                            value={filtros[campo.clave] ?? ""}
                            onChange={(e) => onFiltroChange(campo.clave, e.target.value)}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Icono sx={{ fontSize: 18, color: COLOR.TENUE }} />
                                </InputAdornment>
                              ),
                            }}
                          >
                            {campo.opciones?.map((opcion) => (
                              <MenuItem key={opcion.valor} value={opcion.valor}>
                                {opcion.etiqueta}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                      )
                    })}
                  </Grid>
                </Box>
              )
            })}

            <Stack direction="row" justifyContent="flex-end">
              <Button
                variant="text"
                disabled={activos === 0}
                sx={{ textTransform: "none", fontWeight: 600, color: COLOR.APAGADO }}
                onClick={onLimpiar}
              >
                Limpiar Filtros
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Collapse>
    </>
  )
}
