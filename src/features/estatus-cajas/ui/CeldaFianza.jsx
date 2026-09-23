import { Chip, IconButton, Stack, Tooltip } from "@mui/material"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import UploadFileIcon from "@mui/icons-material/UploadFile"

import { estadoFianza } from "../../../entities/trailer"
import { ESTADO_DOCUMENTO } from "../../../entities/unit"
import { API_BASE } from "../../../shared/config/env"
import { urlSegura } from "../../../shared/security"
import { COLOR } from "../../../shared/ui"

const ASPECTO = {
  [ESTADO_DOCUMENTO.FALTANTE]: {
    etiqueta: "Sin fianza",
    color: COLOR.APAGADO,
    fondo: COLOR.RELLENO,
    borde: COLOR.BORDE,
  },
  [ESTADO_DOCUMENTO.VENCIDO]: {
    etiqueta: "Vencida",
    color: COLOR.PELIGRO,
    fondo: COLOR.PELIGRO_FONDO,
    borde: COLOR.PELIGRO_BORDE,
  },
  [ESTADO_DOCUMENTO.POR_VENCER]: {
    etiqueta: "Vence pronto",
    color: COLOR.AVISO,
    fondo: COLOR.AVISO_FONDO,
    borde: COLOR.AVISO_BORDE,
  },
  [ESTADO_DOCUMENTO.VIGENTE]: {
    etiqueta: "Vigente",
    color: COLOR.EXITO,
    fondo: COLOR.EXITO_FONDO,
    borde: COLOR.EXITO_BORDE,
  },
}

const explicar = (estado, fecha, dias) => {
  if (estado === ESTADO_DOCUMENTO.FALTANTE) return "Esta caja no tiene fianza registrada"
  if (estado === ESTADO_DOCUMENTO.VENCIDO) return `Venció el ${fecha}`
  if (estado === ESTADO_DOCUMENTO.POR_VENCER) return `Vence el ${fecha}, en ${dias} día(s)`
  return `Vigente hasta ${fecha}`
}

/**
 * La fianza de una caja: en qué estado está, cómo verla y cómo reemplazarla.
 *
 * El estado no se decide aquí —lo calcula la entidad con la misma regla del
 * expediente de unidades—; este componente solo le pone color y palabras.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} [props.fianza] La fianza vigente de la caja, si tiene una.
 * @param {Function} props.onSubir Abre el diálogo para subir una nueva.
 * @returns {object} La celda renderizada.
 */
export function CeldaFianza({ fianza, onSubir }) {
  const { estado, fecha, dias } = estadoFianza(fianza)
  const aspecto = ASPECTO[estado] ?? ASPECTO[ESTADO_DOCUMENTO.FALTANTE]

  return (
    <Stack direction="row" spacing={0.5} alignItems="center">
      <Tooltip title={explicar(estado, fecha, dias)}>
        <Chip
          size="small"
          label={aspecto.etiqueta}
          sx={{
            fontWeight: 700,
            color: aspecto.color,
            bgcolor: aspecto.fondo,
            border: `1px solid ${aspecto.borde}`,
          }}
        />
      </Tooltip>

      {fianza?.url_pdf && (
        <Tooltip title="Ver fianza">
          <IconButton
            size="small"
            component="a"
            href={urlSegura(`${API_BASE}/${fianza.url_pdf}`)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <OpenInNewIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}

      <Tooltip title="Subir fianza">
        <IconButton size="small" onClick={onSubir}>
          <UploadFileIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  )
}
