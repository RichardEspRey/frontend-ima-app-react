import { Fragment, useState } from "react"
import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import CheckIcon from "@mui/icons-material/Check"
import CloseIcon from "@mui/icons-material/Close"
import { pesos, useGuardarTrayecto } from "../../../entities/finance"
import { CHIP_OK_SX, CHIP_SX, CHIP_WARN_SX, COLOR, describirError } from "../../../shared/ui"

const VACIO = { id: "", nombre: "", monto: "", activo: true }

/**
 * El renglón editable de un trayecto, nuevo o existente.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.edicion Lo que se está capturando.
 * @param {Function} props.onCambio Cambia un campo de la captura.
 * @param {Function} props.onGuardar Guarda la captura.
 * @param {Function} props.onCancelar Descarta la captura.
 * @param {boolean} props.guardando Si hay un guardado en curso.
 * @returns {object} El renglón.
 */
function FilaEdicion({ edicion, onCambio, onGuardar, onCancelar, guardando }) {
  const valida = edicion.nombre.trim() !== "" && edicion.monto !== "" && Number(edicion.monto) >= 0

  return (
    <TableRow>
      <TableCell>
        <TextField
          size="small"
          autoFocus
          fullWidth
          placeholder="Ej. Apodaca"
          value={edicion.nombre}
          onChange={(evento) => onCambio("nombre", evento.target.value)}
        />
      </TableCell>
      <TableCell>
        <TextField
          size="small"
          type="number"
          placeholder="0.00"
          sx={{ width: 160 }}
          value={edicion.monto}
          onChange={(evento) => onCambio("monto", evento.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
            endAdornment: <InputAdornment position="end">MXN</InputAdornment>,
          }}
        />
      </TableCell>
      <TableCell align="center">
        <Switch checked={edicion.activo} onChange={(evento) => onCambio("activo", evento.target.checked)} />
      </TableCell>
      <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
        <IconButton color="success" disabled={!valida || guardando} onClick={onGuardar}>
          <CheckIcon />
        </IconButton>
        <IconButton disabled={guardando} onClick={onCancelar}>
          <CloseIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  )
}

/**
 * El catálogo de trayectos mexicanos y su monto por viaje.
 *
 * Un trayecto no se borra: se desactiva, para que los pagos que ya lo usaron lo sigan
 * nombrando.
 *
 * @param {object} props Propiedades del componente.
 * @param {boolean} props.open Si el diálogo está abierto.
 * @param {Function} props.onClose Cierra el diálogo.
 * @param {Array.<object>} props.trayectos El catálogo.
 * @returns {object} El diálogo.
 */
export function CatalogoTrayectos({ open, onClose, trayectos }) {
  const [edicion, setEdicion] = useState(null)
  const guardar = useGuardarTrayecto()

  const empezar = (trayecto) => {
    guardar.reset()
    setEdicion(trayecto ? { ...trayecto, monto: String(trayecto.monto) } : { ...VACIO })
  }

  const cambiar = (campo, valor) => setEdicion((previa) => ({ ...previa, [campo]: valor }))

  const confirmar = async () => {
    try {
      await guardar.mutateAsync(edicion)
      setEdicion(null)
    } catch {
      return
    }
  }

  const fila = edicion ? (
    <FilaEdicion
      edicion={edicion}
      onCambio={cambiar}
      onGuardar={confirmar}
      onCancelar={() => setEdicion(null)}
      guardando={guardar.isPending}
    />
  ) : null

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>
        Trayectos de México
        <Typography variant="body2" color={COLOR.APAGADO}>
          Cada viaje mexicano se paga con el monto de su trayecto. Cuando salga un destino nuevo, dalo de
          alta aquí con su monto.
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {guardar.isError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {describirError(guardar.error)}
          </Alert>
        ) : null}

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Trayecto</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Monto por viaje</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Activo
              </TableCell>
              <TableCell sx={{ width: 120 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {trayectos.map((trayecto) =>
              edicion?.id === trayecto.id ? (
                <Fragment key={trayecto.id}>{fila}</Fragment>
              ) : (
                <TableRow key={trayecto.id} sx={{ opacity: trayecto.activo ? 1 : 0.5 }}>
                  <TableCell>
                    <Typography fontWeight={700}>{trayecto.nombre}</Typography>
                  </TableCell>
                  <TableCell>
                    {trayecto.monto > 0 ? (
                      <Typography fontWeight={700} color={COLOR.EXITO}>
                        {pesos(trayecto.monto)}
                      </Typography>
                    ) : (
                      <Chip size="small" label="Sin monto" sx={CHIP_WARN_SX} />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={trayecto.activo ? "Activo" : "Inactivo"}
                      sx={trayecto.activo ? CHIP_OK_SX : CHIP_SX}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar">
                      <span>
                        <IconButton size="small" disabled={Boolean(edicion)} onClick={() => empezar(trayecto)}>
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ),
            )}

            {edicion && !edicion.id ? fila : null}

            {trayectos.length === 0 && !edicion ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4, color: COLOR.APAGADO }}>
                  Todavía no hay trayectos.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "space-between", px: 3 }}>
        <Button
          startIcon={<AddIcon />}
          disabled={Boolean(edicion)}
          onClick={() => empezar(null)}
          sx={{ textTransform: "none", fontWeight: 700 }}
        >
          Nuevo trayecto
        </Button>
        <Button onClick={onClose} sx={{ textTransform: "none" }}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
