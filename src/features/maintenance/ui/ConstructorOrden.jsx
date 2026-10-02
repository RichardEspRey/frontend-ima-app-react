import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import SaveIcon from "@mui/icons-material/Save"
import CloseIcon from "@mui/icons-material/Close"
import { UNIDAD, usePendientes } from "../../../entities/maintenance-point"
import {
  CARD_SX,
  COLOR,
  DARK_BTN_SX,
  DIALOG_ACTIONS_SX,
  DIALOG_CONTENT_SX,
  DIALOG_PAPER_SX,
  DIALOG_TITLE_SX,
  SECTION_LABEL_SX,
} from "../../../shared/ui"
import { useConstructorOrden } from "../model/useConstructorOrden"
import { ServicioOrden } from "./ServicioOrden"

/**
 * Lo que la unidad ya traía pendiente, para que no se quede fuera de la orden.
 *
 * Es la pregunta que hoy nadie hace porque implicaba abrir el Excel: si el
 * camión entra a taller, lo que se le debía de antes se repara ahora.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.orden El controlador del constructor.
 * @returns {object} El aviso, o nada si la unidad no debe nada.
 */
function PendientesPrevios({ orden }) {
  const { data: pendientes } = usePendientes(orden.lado)

  const deLaUnidad = (pendientes ?? []).filter(
    (pendiente) =>
      String(orden.lado === UNIDAD.CAJA ? pendiente.caja_id : pendiente.truck_id) ===
      String(orden.unidadId),
  )

  if (deLaUnidad.length === 0) return null

  return (
    <Alert severity="warning" sx={{ mb: 2 }}>
      <Typography fontWeight={700} sx={{ mb: 1 }}>
        {orden.lado === UNIDAD.CAJA ? "Esta caja" : "Este camión"} trae {deLaUnidad.length}{" "}
        reparación(es) pendiente(s). Marca las que entran a esta orden.
      </Typography>
      {deLaUnidad.map((pendiente) => (
        <FormControlLabel
          key={pendiente.id}
          sx={{ display: "block", ml: 0 }}
          control={
            <Checkbox
              size="small"
              checked={orden.clavesEnOrden.includes(`pendiente-${pendiente.id}`)}
              onChange={(evento) =>
                evento.target.checked
                  ? orden.agregarPendiente(pendiente)
                  : orden.quitarServicio(`pendiente-${pendiente.id}`)
              }
            />
          }
          label={<Typography variant="body2">{pendiente.descripcion}</Typography>}
        />
      ))}
    </Alert>
  )
}

/**
 * El resumen de la orden, pegado al costado mientras se captura.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.orden El controlador del constructor.
 * @returns {object} El panel de resumen.
 */
function ResumenOrden({ orden }) {
  return (
    <Paper
      elevation={0}
      sx={{
        ...CARD_SX,
        bgcolor: COLOR.BLANCO,
        width: { xs: "100%", md: 320 },
        flexShrink: 0,
        position: { md: "sticky" },
        top: 16,
      }}
    >
      <Typography variant="overline" sx={SECTION_LABEL_SX}>
        Detalle de orden
      </Typography>

      <Stack spacing={1} sx={{ mt: 1.5, mb: 2 }}>
        {orden.servicios.length === 0 ? (
          <Typography variant="body2" sx={{ fontStyle: "italic", color: COLOR.TENUE }}>
            No hay servicios en la orden.
          </Typography>
        ) : null}

        {orden.servicios.map((servicio, indice) => (
          <Stack key={servicio.clave} direction="row" justifyContent="space-between" spacing={1}>
            <Typography variant="body2" color={COLOR.TEXTO} noWrap sx={{ maxWidth: 180 }}>
              {indice + 1}. {servicio.tipo_reparacion || "Sin descripción"}
            </Typography>
            <Chip
              size="small"
              label={servicio.gastos.length ? `${servicio.gastos.length} gasto(s)` : "MO"}
              sx={{ height: 18, fontSize: "0.65rem" }}
            />
          </Stack>
        ))}
      </Stack>

      <Divider />

      <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mt: 2 }}>
        <Typography variant="body2" color={COLOR.APAGADO}>
          Total
        </Typography>
        <Typography variant="h5" fontWeight={800} color={COLOR.TINTA}>
          ${orden.total.toFixed(2)}
        </Typography>
      </Stack>
    </Paper>
  )
}

/**
 * La orden de servicio, armada sin salir de la pantalla de mantenimiento.
 *
 * Un servicio por reparación, como lo trabaja el taller: la orden agrupa, pero
 * cada arreglo se sigue por separado.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.apertura Con qué se abrió: puntos o pendientes.
 * @param {Function} props.onCerrar Cerrar sin guardar.
 * @param {Function} props.onCreada Recibe `(idOrden, cuantosGastos)`.
 * @returns {object} El diálogo renderizado.
 */
export function ConstructorOrden({ apertura, onCerrar, onCreada }) {
  const orden = useConstructorOrden(apertura, onCreada)
  const esCaja = orden.lado === UNIDAD.CAJA

  return (
    <Dialog
      open
      onClose={orden.guardando ? undefined : onCerrar}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: DIALOG_PAPER_SX }}
    >
      <DialogTitle sx={DIALOG_TITLE_SX}>
        <Box>
          <Typography variant="overline" sx={SECTION_LABEL_SX}>
            Mantenimiento · {esCaja ? "Caja" : "Camión"} {orden.etiquetaUnidad}
          </Typography>
          <Typography variant="h5" fontWeight={800} color={COLOR.TINTA}>
            Nueva Orden de Servicio
          </Typography>
          <Typography variant="body2" color={COLOR.APAGADO}>
            Un servicio por cada reparación.
            {orden.inspeccion?.trip_number
              ? ` Del viaje ${orden.inspeccion.trip_number}.`
              : " De las reparaciones pendientes."}
          </Typography>
        </Box>
        <Button
          onClick={onCerrar}
          disabled={orden.guardando}
          startIcon={<CloseIcon />}
          color="inherit"
          sx={{ textTransform: "none" }}
        >
          Cerrar
        </Button>
      </DialogTitle>

      <DialogContent sx={DIALOG_CONTENT_SX}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems="flex-start">
          <Box sx={{ flex: "1 1 auto", minWidth: 0, width: "100%" }}>
            <Paper elevation={0} sx={{ ...CARD_SX, bgcolor: COLOR.BLANCO, mb: 2 }}>
              <Typography variant="overline" sx={SECTION_LABEL_SX}>
                Datos generales
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
                <TextField
                  size="small"
                  label={esCaja ? "Caja" : "Camión"}
                  value={orden.etiquetaUnidad || ""}
                  disabled
                  sx={{ width: 140 }}
                />
                <TextField
                  size="small"
                  type="date"
                  label="Fecha"
                  InputLabelProps={{ shrink: true }}
                  value={orden.fecha}
                  onChange={(evento) => orden.setFecha(evento.target.value)}
                  sx={{ width: 180 }}
                />
                <TextField
                  size="small"
                  type="number"
                  label="Tipo de cambio (opcional)"
                  value={orden.tipoCambio}
                  onChange={(evento) => orden.setTipoCambio(evento.target.value)}
                  sx={{ width: 200 }}
                />
              </Stack>
            </Paper>

            <PendientesPrevios orden={orden} />

            {orden.servicios.map((servicio, indice) => (
              <ServicioOrden
                key={servicio.clave}
                servicio={servicio}
                indice={indice}
                fecha={orden.fecha}
                categorias={orden.categorias}
                subcategorias={orden.subcategorias}
                onCambiar={(actualizado) => orden.cambiarServicio(servicio.clave, actualizado)}
                onEliminar={() => orden.quitarServicio(servicio.clave)}
              />
            ))}

            <Button
              startIcon={<AddIcon />}
              onClick={orden.agregarServicio}
              sx={{ textTransform: "none", fontWeight: 700 }}
            >
              Agregar otro servicio
            </Button>
          </Box>

          <ResumenOrden orden={orden} />
        </Stack>
      </DialogContent>

      <DialogActions sx={DIALOG_ACTIONS_SX}>
        <Button onClick={onCerrar} color="inherit" disabled={orden.guardando}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={orden.guardar}
          disabled={orden.guardando || !orden.puedeGuardar}
          sx={DARK_BTN_SX}
        >
          {orden.guardando ? "Guardando…" : "Guardar orden"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
