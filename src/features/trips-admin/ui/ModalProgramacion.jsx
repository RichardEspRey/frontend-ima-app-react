import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, Grid, IconButton, InputAdornment, InputLabel, MenuItem, Select, Stack, TextField, Tooltip, Typography } from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import CloseIcon from "@mui/icons-material/Close"
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined"
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined"
import PersonOutlineIcon from "@mui/icons-material/PersonOutline"
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined"
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined"

import { estaDisponible, leerValorCaja, valorCaja } from "../../../entities/schedule"
import { COLOR } from "../../../shared/ui/tokens"
import { BloqueEsqueleto, Selector, SelectorBusqueda } from "../../../shared/ui"

const OPCIONES_TIPO_CAJA = [
  { valor: "interna", etiqueta: "Interna" },
  { valor: "externa", etiqueta: "Externa" },
]

const ETIQUETA_SX = {
  color: COLOR.TENUE,
  fontWeight: 700,
  letterSpacing: "0.08em",
  fontSize: "0.68rem",
}

const BOTON_OSCURO_SX = {
  bgcolor: COLOR.TINTA,
  fontWeight: 700,
  borderRadius: 2,
  px: 3,
  textTransform: "none",
  boxShadow: "none",
  "&:hover": { bgcolor: COLOR.TINTA_CLARA, boxShadow: "0 6px 16px rgba(15,23,42,0.22)" },
}

/**
 * El punto verde o rojo que dice si una unidad está libre.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.unidad El camión u operador.
 * @returns {object} El punto renderizado.
 */
function Semaforo({ unidad }) {
  return (
    <Box
      sx={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        bgcolor: estaDisponible(unidad) ? COLOR.EXITO : COLOR.PELIGRO,
        flexShrink: 0,
      }}
    />
  )
}

/**
 * Alta y edición de una programación de viaje.
 *
 * Programar es apartar operador, camión y caja para una salida futura; cuando
 * llega el día, la programación se aprueba y se convierte en viaje.
 *
 * @param {object} props Propiedades del componente.
 * @param {boolean} props.abierto Si el modal se muestra.
 * @param {Function} props.onCerrar Cierra el modal.
 * @param {boolean} props.editando Si se está editando una existente.
 * @param {object} props.formulario Los valores actuales.
 * @param {Function} props.onCampoChange Recibe `(campo, valor)`.
 * @param {string} props.tipoCaja `interna` o `externa`.
 * @param {Function} props.onTipoCajaChange Recibe el tipo elegido.
 * @param {object} props.tablero Camiones, operadores y cajas disponibles.
 * @param {boolean} props.cargandoTablero Si el tablero se está pidiendo.
 * @param {Array} props.opcionesCompania Compañías para el selector.
 * @param {boolean} props.cargandoCompanias Si el catálogo de compañías se está pidiendo.
 * @param {Function} props.onCrearCompania Da de alta una compañía escrita a mano.
 * @param {Function} props.onNuevaCajaExterna Abre el alta de caja externa.
 * @param {Function} props.onGuardar Guarda la programación.
 * @param {boolean} [props.guardando] Si el guardado está en curso.
 * @returns {object} El modal renderizado.
 */
export function ModalProgramacion({
  abierto,
  onCerrar,
  editando,
  formulario,
  onCampoChange,
  tipoCaja,
  onTipoCajaChange,
  tablero,
  cargandoTablero,
  opcionesCompania = [],
  cargandoCompanias,
  onCrearCompania,
  onNuevaCajaExterna,
  onGuardar,
  guardando,
}) {
  const { camiones = [], operadores = [], cajas = [], cajasExternas = [] } = tablero ?? {}

  const nombreOperador = (id) =>
    operadores.find((o) => String(o.driver_id) === String(id))?.nombre ?? "-"

  const unidadCamion = (id) =>
    camiones.find((c) => String(c.truck_id) === String(id))?.unidad ?? "-"

  const etiquetaCaja = (valor) => {
    if (!valor) return "-"
    const { id, externa } = leerValorCaja(valor)
    const lista = externa ? cajasExternas : cajas
    const campo = externa ? "caja_externa_id" : "caja_id"
    return lista.find((c) => String(c[campo]) === id)?.no_caja ?? valor
  }

  const hayResumen = formulario.operador_id || formulario.camion_id || formulario.caja_id

  return (
    <Dialog
      open={abierto}
      onClose={onCerrar}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle
        sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", pb: 1 }}
      >
        <Box>
          <Typography variant="overline" sx={ETIQUETA_SX}>
            Programación de Viajes
          </Typography>
          <Typography variant="h6" fontWeight={800} color={COLOR.TINTA} sx={{ mt: -0.25 }}>
            {editando ? "Editar Viaje Programado" : "Programar Viaje"}
          </Typography>
        </Box>
        <IconButton size="small" onClick={onCerrar} sx={{ mt: 0.5 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {cargandoTablero ? (
          <BloqueEsqueleto alto={220} conTitulo={false} />
        ) : (
          <Stack spacing={2.5} sx={{ mt: 0.5 }}>
            {hayResumen && (
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                flexWrap="wrap"
                sx={{ p: 1.5, bgcolor: COLOR.LIENZO, border: `1px solid ${COLOR.BORDE}`, borderRadius: 2 }}
              >
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color={formulario.operador_id ? COLOR.TINTA : COLOR.BORDE_FUERTE}
                >
                  {formulario.operador_id ? nombreOperador(formulario.operador_id) : "Operador"}
                </Typography>
                <ArrowForwardIcon sx={{ fontSize: 14, color: COLOR.BORDE_FUERTE }} />
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color={formulario.camion_id ? COLOR.TINTA : COLOR.BORDE_FUERTE}
                >
                  {formulario.camion_id ? unidadCamion(formulario.camion_id) : "Camión"}
                </Typography>
                <ArrowForwardIcon sx={{ fontSize: 14, color: COLOR.BORDE_FUERTE }} />
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color={formulario.caja_id ? COLOR.TINTA : COLOR.BORDE_FUERTE}
                >
                  {formulario.caja_id ? etiquetaCaja(formulario.caja_id) : "Caja"}
                </Typography>
              </Stack>
            )}

            <Box>
              <Typography variant="overline" sx={ETIQUETA_SX}>
                Recursos
              </Typography>

              <Grid container spacing={2} sx={{ mt: 0.25 }}>
                <Grid size={{ xs: 12 }}>
                  <FormControl fullWidth>
                    <InputLabel id="operador" shrink>
                      Operador
                    </InputLabel>
                    <SelectorBusqueda
                      labelId="operador"
                      displayEmpty
                      notched
                      label="Operador"
                      value={formulario.operador_id}
                      onChange={(e) => onCampoChange("operador_id", e.target.value)}
                      startAdornment={
                        <InputAdornment position="start">
                          <PersonOutlineIcon sx={{ fontSize: 20, color: COLOR.TENUE, ml: 0.5 }} />
                        </InputAdornment>
                      }
                      renderValue={(valor) =>
                        valor ? (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Semaforo
                              unidad={operadores.find((o) => String(o.driver_id) === valor)}
                            />
                            {nombreOperador(valor)}
                          </Box>
                        ) : (
                          <Typography color="text.disabled" variant="body1">
                            Selecciona un operador
                          </Typography>
                        )
                      }
                    >
                      {operadores.map((operador) => (
                        <MenuItem key={operador.driver_id} value={String(operador.driver_id)}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Semaforo unidad={operador} />
                            {operador.nombre}
                          </Box>
                        </MenuItem>
                      ))}
                    </SelectorBusqueda>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel id="camion" shrink>
                      Camión
                    </InputLabel>
                    <SelectorBusqueda
                      labelId="camion"
                      displayEmpty
                      notched
                      label="Camión"
                      value={formulario.camion_id}
                      onChange={(e) => onCampoChange("camion_id", e.target.value)}
                      startAdornment={
                        <InputAdornment position="start">
                          <LocalShippingOutlinedIcon
                            sx={{ fontSize: 20, color: COLOR.TENUE, ml: 0.5 }}
                          />
                        </InputAdornment>
                      }
                      renderValue={(valor) => {
                        if (!valor) {
                          return (
                            <Typography color="text.disabled" variant="body1">
                              Selecciona un camión
                            </Typography>
                          )
                        }
                        const camion = camiones.find((c) => String(c.truck_id) === valor)
                        return (
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Semaforo unidad={camion} />
                            <Box>
                              <Typography variant="body2" lineHeight={1.2}>
                                {camion?.unidad}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Dist. Nv Laredo: {camion?.dist_nv_l ?? "N/A"}
                              </Typography>
                            </Box>
                          </Box>
                        )
                      }}
                    >
                      {camiones.map((camion) => (
                        <MenuItem key={camion.truck_id} value={String(camion.truck_id)}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Semaforo unidad={camion} />
                            <Box>
                              <Typography variant="body2" lineHeight={1.2}>
                                {camion.unidad}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Dist. Nv Laredo: {camion.dist_nv_l ?? "N/A"}
                              </Typography>
                            </Box>
                          </Box>
                        </MenuItem>
                      ))}
                    </SelectorBusqueda>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                    <ApartmentOutlinedIcon sx={{ fontSize: 18, color: COLOR.TENUE }} />
                    <Typography variant="body2" fontWeight={600} color={COLOR.TEXTO}>
                      Compañía
                    </Typography>
                  </Stack>
                  <SelectorBusqueda permitirCrear
                    value={
                      opcionesCompania.find((opcion) => opcion.value === formulario.company_id) ??
                      null
                    }
                    onChange={(elegida) => onCampoChange("company_id", elegida?.value || "")}
                    onCrear={onCrearCompania}
                    options={opcionesCompania}
                    isLoading={cargandoCompanias}
                    isClearable
                    placeholder="Seleccionar/Crear compañía..."
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.25 }}>
                    <Inventory2OutlinedIcon sx={{ fontSize: 18, color: COLOR.TENUE }} />
                    <Typography variant="body2" fontWeight={600} color={COLOR.TEXTO}>
                      Caja
                    </Typography>
                    <Selector
                      valor={tipoCaja}
                      onChange={onTipoCajaChange}
                      opciones={OPCIONES_TIPO_CAJA}
                      sx={{ ml: "auto" }}
                    />
                  </Stack>

                  <Stack direction="row" spacing={1}>
                    <FormControl fullWidth>
                      <InputLabel id="caja" shrink>
                        {tipoCaja === "interna" ? "Caja Interna" : "Caja Externa"}
                      </InputLabel>
                      <SelectorBusqueda
                        labelId="caja"
                        displayEmpty
                        notched
                        label={tipoCaja === "interna" ? "Caja Interna" : "Caja Externa"}
                        value={formulario.caja_id}
                        onChange={(e) => onCampoChange("caja_id", e.target.value)}
                        renderValue={(valor) =>
                          valor ? (
                            etiquetaCaja(valor)
                          ) : (
                            <Typography color="text.disabled" variant="body1">
                              Selecciona una caja {tipoCaja}
                            </Typography>
                          )
                        }
                      >
                        {tipoCaja === "interna" ? (
                          cajas.length === 0 ? (
                            <MenuItem disabled value="">
                              No hay cajas internas disponibles
                            </MenuItem>
                          ) : (
                            cajas.map((caja) => (
                              <MenuItem
                                key={valorCaja(caja.caja_id, false)}
                                value={valorCaja(caja.caja_id, false)}
                              >
                                {caja.no_caja}
                                {caja.no_placa ? ` — ${caja.no_placa}` : ""}
                              </MenuItem>
                            ))
                          )
                        ) : cajasExternas.length === 0 ? (
                          <MenuItem disabled value="">
                            No hay cajas externas registradas
                          </MenuItem>
                        ) : (
                          cajasExternas.map((caja) => (
                            <MenuItem
                              key={valorCaja(caja.caja_externa_id, true)}
                              value={valorCaja(caja.caja_externa_id, true)}
                            >
                              {caja.no_caja}
                              {caja.placas ? ` — ${caja.placas}` : ""}
                            </MenuItem>
                          ))
                        )}
                      </SelectorBusqueda>
                    </FormControl>

                    {tipoCaja === "externa" && (
                      <Tooltip title="Registrar nueva caja externa">
                        <Button
                          variant="outlined"
                          onClick={onNuevaCajaExterna}
                          sx={{ minWidth: 44, px: 0, borderColor: COLOR.BORDE_FUERTE, color: COLOR.TINTA, borderRadius: 2 }}
                        >
                          <AddIcon fontSize="small" />
                        </Button>
                      </Tooltip>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ borderColor: COLOR.RELLENO }} />

            <Box>
              <Typography variant="overline" sx={ETIQUETA_SX}>
                Detalles del Viaje
              </Typography>

              <Grid container spacing={2} sx={{ mt: 0.25 }}>
                <Grid size={{ xs: 12 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                    <PlaceOutlinedIcon sx={{ fontSize: 18, color: COLOR.TENUE }} />
                    <Typography variant="body2" fontWeight={600} color={COLOR.TEXTO}>
                      Destino
                    </Typography>
                  </Stack>
                  <TextField
                    fullWidth
                    size="small"
                    value={formulario.destino}
                    onChange={(e) => onCampoChange("destino", e.target.value)}
                    placeholder="Escribe el destino..."
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    label="Salida"
                    type="datetime-local"
                    fullWidth
                    value={formulario.salida}
                    onChange={(e) => onCampoChange("salida", e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ScheduleOutlinedIcon sx={{ fontSize: 20, color: COLOR.TENUE }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
        <Button onClick={onCerrar} color="inherit" sx={{ textTransform: "none", fontWeight: 600 }}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={onGuardar} disabled={guardando} sx={BOTON_OSCURO_SX}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
