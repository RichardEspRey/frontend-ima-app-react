import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined"

import { MONEDA_DTOPS, SUBCATEGORIA_DTOPS } from "../../../entities/expense"
import { moneda } from "../../../shared/lib/formato"
import { CampoFecha, COLOR } from "../../../shared/ui"
import { MONTO_MANUAL, useGastoDtops } from "../model/useGastoDtops"

/**
 * Muestra un dato del gasto que no se captura, con su etiqueta.
 *
 * @param {object} props Propiedades del componente.
 * @param {string} props.etiqueta Nombre del campo.
 * @param {string} [props.valor] Lo que se va a guardar.
 * @returns {object} El renglón renderizado.
 */
function Renglon({ etiqueta, valor }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography variant="body2" color="text.secondary">
        {etiqueta}
      </Typography>
      <Typography
        variant="body2"
        fontWeight={600}
        color="text.primary"
        noWrap
        sx={{ maxWidth: 260 }}
      >
        {valor || "—"}
      </Typography>
    </Stack>
  )
}

/**
 * Alta del gasto que acompaña a un DTOPS recién subido a una etapa de cruce.
 *
 * Captura el monto —con botones de importe fijo o uno a mano— y la fecha de
 * pago, y enseña el resto de los datos del gasto antes de registrarlo.
 *
 * @param {object} props Propiedades del componente.
 * @param {boolean} props.abierto Si el modal se muestra.
 * @param {Function} props.onCerrar Cierra el modal sin registrar nada.
 * @param {File} props.archivo El DTOPS, que se guarda como ticket del gasto.
 * @param {string} props.viaje Número de viaje, que va como descripción.
 * @param {boolean} [props.yaExistia] Si la etapa ya traía un DTOPS guardado.
 * @returns {object} El modal renderizado.
 */
export function ModalGastoDtops({ abierto, onCerrar, archivo, viaje, yaExistia = false }) {
  const {
    montos,
    montoElegido,
    elegirMonto,
    montoManual,
    setMontoManual,
    esManual,
    monto,
    montoValido,
    fecha,
    setFecha,
    creador,
    cargandoCatalogos,
    faltaClasificacion,
    puedeGuardar,
    guardando,
    guardar,
  } = useGastoDtops({ archivo, viaje, onListo: onCerrar })

  return (
    <Dialog open={abierto} onClose={guardando ? undefined : onCerrar} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: COLOR.LIENZO, borderBottom: `1px solid ${COLOR.BORDE}` }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <ReceiptLongOutlinedIcon color="primary" />
          <Box>
            <Typography variant="h6" fontWeight={800}>
              Gasto del DTOPS
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Se registra en Expense Manager con este documento como ticket.
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ bgcolor: COLOR.LIENZO }}>
        <Stack spacing={2.5}>
          {yaExistia && (
            <Alert severity="warning">
              Esta etapa ya tenía un DTOPS guardado. Si continúas se registrará otro gasto
              además del anterior.
            </Alert>
          )}

          {faltaClasificacion && (
            <Alert severity="error">
              El catálogo de gastos no trae la subcategoría «{SUBCATEGORIA_DTOPS}». Revísalo, o
              captura el gasto a mano en Expense Manager.
            </Alert>
          )}

          {!viaje && (
            <Alert severity="error">
              El viaje todavía no tiene número, y ese número es la descripción del gasto.
            </Alert>
          )}

          <Box>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Monto ({MONEDA_DTOPS})
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {montos.map((importe) => (
                <Button
                  key={importe}
                  variant={montoElegido === importe ? "contained" : "outlined"}
                  onClick={() => elegirMonto(importe)}
                  sx={{ fontWeight: 700, minWidth: 110 }}
                >
                  {moneda(importe)}
                </Button>
              ))}
              <Button
                variant={esManual ? "contained" : "outlined"}
                color="secondary"
                onClick={() => elegirMonto(MONTO_MANUAL)}
                sx={{ fontWeight: 700, minWidth: 110 }}
              >
                Otro monto
              </Button>
            </Stack>

            {esManual && (
              <TextField
                type="number"
                size="small"
                fullWidth
                autoFocus
                label="Monto manual"
                value={montoManual}
                onChange={(evento) => setMontoManual(evento.target.value)}
                error={montoManual !== "" && !montoValido}
                helperText={
                  montoManual !== "" && !montoValido ? "Tiene que ser un número mayor que cero." : " "
                }
                inputProps={{ min: 0, step: "0.01" }}
                sx={{ mt: 2 }}
              />
            )}
          </Box>

          <CampoFecha value={fecha} onChange={setFecha} label="Payment date" />

          <Divider />

          <Stack spacing={1}>
            <Typography variant="subtitle2" fontWeight={700}>
              Se guarda así
            </Typography>
            <Renglon etiqueta="País" valor="Estados Unidos" />
            <Renglon etiqueta="Moneda" valor={MONEDA_DTOPS} />
            <Renglon etiqueta="Descripción" valor={viaje} />
            <Renglon etiqueta="Cantidad" valor="1" />
            <Renglon etiqueta="Precio unitario" valor={montoValido ? moneda(monto) : null} />
            <Renglon etiqueta="Ticket" valor={archivo?.name} />
            <Renglon etiqueta="Creador" valor={creador} />
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{ px: 3, py: 2, bgcolor: COLOR.LIENZO, borderTop: `1px solid ${COLOR.BORDE}` }}
      >
        <Button onClick={onCerrar} disabled={guardando} color="inherit">
          Omitir
        </Button>
        <Button
          variant="contained"
          onClick={guardar}
          disabled={!puedeGuardar || cargandoCatalogos}
          startIcon={guardando ? <CircularProgress size={18} color="inherit" /> : null}
        >
          {guardando ? "Registrando…" : "Registrar gasto"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
