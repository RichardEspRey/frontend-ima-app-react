import { Tooltip, Typography } from "@mui/material"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import ErrorIcon from "@mui/icons-material/Error"
import HelpOutlineIcon from "@mui/icons-material/HelpOutline"
import WarningIcon from "@mui/icons-material/Warning"

import { ESTADO_DOCUMENTO, estadoDocumento } from "../../../entities/unit"
import { API_BASE } from "../../../shared/config/env"

/**
 * El estado de un documento del expediente, en una celda de tabla.
 *
 * Un documento vigente es además el enlace para abrirlo; los demás estados no
 * llevan a ninguna parte porque no hay nada que abrir.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.requisito El requisito que se exige.
 * @param {object} [props.documento] Lo que la unidad tiene subido.
 * @returns {object} El icono o el texto que corresponda.
 */
export function EstadoDocumento({ requisito, documento }) {
  const { estado, fecha } = estadoDocumento(requisito, documento)

  if (estado === ESTADO_DOCUMENTO.TEXTO) {
    return (
      <Typography variant="body2" fontWeight={600} color="primary" noWrap>
        {documento.valor_texto}
      </Typography>
    )
  }

  if (estado === ESTADO_DOCUMENTO.FALTANTE) {
    return requisito?.tipo === "text" ? (
      <Typography variant="body2" color="text.disabled">
        -
      </Typography>
    ) : (
      <Tooltip title="Faltante">
        <HelpOutlineIcon sx={{ color: "#cbd5e1" }} />
      </Tooltip>
    )
  }

  if (estado === ESTADO_DOCUMENTO.VENCIDO) {
    return (
      <Tooltip title={`Vencido: ${fecha}`}>
        <ErrorIcon color="error" />
      </Tooltip>
    )
  }

  if (estado === ESTADO_DOCUMENTO.POR_VENCER) {
    return (
      <Tooltip title={`Vence pronto: ${fecha}`}>
        <WarningIcon color="warning" />
      </Tooltip>
    )
  }

  return (
    <Tooltip title={fecha ? `Vigente hasta ${fecha}` : "Archivo adjunto"}>
      <a
        href={`${API_BASE}/${documento.url_pdf}`}
        target="_blank"
        rel="noreferrer"
        style={{ color: "inherit" }}
      >
        <CheckCircleIcon color="success" sx={{ "&:hover": { opacity: 0.7 } }} />
      </a>
    </Tooltip>
  )
}
