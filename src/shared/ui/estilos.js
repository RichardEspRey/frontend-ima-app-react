import { BORDE, COLOR, RADIO, RELLENO_PANTALLA, SOMBRA, TIPO } from "./tokens"

/**
 * El contenedor de una pantalla completa.
 *
 * @readonly
 */
export const PAGE_SHELL_SX = {
  p: RELLENO_PANTALLA,
  minHeight: "100vh",
  bgcolor: COLOR.LIENZO,
}

/**
 * La etiqueta pequeña en mayúsculas que rotula una sección.
 *
 * @readonly
 */
export const SECTION_LABEL_SX = {
  ...TIPO.ETIQUETA,
  color: COLOR.TENUE,
}

/**
 * La misma etiqueta, con más espaciado, para el rótulo sobre el título.
 *
 * @readonly
 */
export const PAGE_OVERLINE_SX = {
  ...SECTION_LABEL_SX,
  letterSpacing: "0.12em",
  fontSize: "0.7rem",
  lineHeight: 1,
}

/** @readonly */
export const PAGE_TITLE_SX = { mt: 0.25 }

/** @readonly */
export const CARD_SX = {
  p: 3,
  borderRadius: 2,
  border: BORDE,
}

/** @readonly */
export const DIALOG_PAPER_SX = { borderRadius: 3, overflow: "hidden" }

/** @readonly */
export const DIALOG_TITLE_SX = {
  bgcolor: COLOR.BLANCO,
  borderBottom: BORDE,
  px: RELLENO_PANTALLA,
  py: 2.5,
}

/** @readonly */
export const DIALOG_CONTENT_SX = {
  bgcolor: COLOR.LIENZO,
  p: RELLENO_PANTALLA,
}

/** @readonly */
export const DIALOG_ACTIONS_SX = {
  px: RELLENO_PANTALLA,
  py: 2.5,
  bgcolor: COLOR.BLANCO,
  borderTop: BORDE,
  gap: 1,
}

/** @readonly */
export const SECTION_ICON_SX = { color: COLOR.APAGADO }

/** @readonly */
export const SECTION_TITLE_SX = { fontWeight: 700, color: COLOR.TINTA }

/** @readonly */
export const HEADER_ROW_SX = {
  bgcolor: COLOR.CABECERA,
  borderBottom: BORDE,
}

/** @readonly */
export const HEADER_CELL_SX = {
  ...TIPO.CABECERA_TABLA,
  color: COLOR.TENUE,
  borderBottom: "none",
}

/** @readonly */
export const TABLE_CONTAINER_SX = {
  border: BORDE,
  borderRadius: 2,
  overflowX: "auto",
}

/** @readonly */
export const PAGINATION_BOX_SX = {
  bgcolor: COLOR.BLANCO,
  border: BORDE,
  borderTop: "none",
  borderBottomLeftRadius: RADIO.NORMAL,
  borderBottomRightRadius: RADIO.NORMAL,
}

/** @readonly */
export const PAGINATION_SX = {
  color: COLOR.TEXTO_SUAVE,
  ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": {
    fontSize: "0.8rem",
  },
}

/** @readonly */
export const TABS_WRAPPER_SX = {
  mb: 3,
  display: "inline-flex",
  bgcolor: COLOR.RELLENO,
  borderRadius: 2.5,
  p: 0.5,
}

/** @readonly */
export const TAB_SX = {
  minHeight: 36,
  minWidth: 0,
  px: 2.5,
  py: 1,
  borderRadius: 2,
  fontWeight: 600,
  fontSize: "0.85rem",
  textTransform: "none",
  color: COLOR.APAGADO,
  transition: "background-color 0.15s, color 0.15s",
  "&.Mui-selected": { bgcolor: COLOR.TINTA, color: COLOR.BLANCO },
}

/** @readonly */
export const CHIP_SX = {
  height: 22,
  fontSize: "0.7rem",
  fontWeight: 700,
  letterSpacing: "0.04em",
  textTransform: "none",
}

/** @readonly */
export const CHIP_OK_SX = {
  ...CHIP_SX,
  bgcolor: COLOR.EXITO_FONDO,
  color: COLOR.EXITO,
  border: `1px solid ${COLOR.EXITO_BORDE}`,
}

/** @readonly */
export const CHIP_DANGER_SX = {
  ...CHIP_SX,
  bgcolor: COLOR.PELIGRO_FONDO,
  color: COLOR.PELIGRO,
  border: `1px solid ${COLOR.PELIGRO_BORDE}`,
}

/**
 * Un chip de aviso, para lo que no está mal pero pide atención.
 *
 * @readonly
 */
export const CHIP_WARN_SX = {
  ...CHIP_SX,
  bgcolor: COLOR.AVISO_FONDO,
  color: COLOR.AVISO,
  border: `1px solid ${COLOR.AVISO_BORDE}`,
}

/**
 * Un chip informativo, sin carga de bueno ni malo.
 *
 * @readonly
 */
export const CHIP_INFO_SX = {
  ...CHIP_SX,
  bgcolor: COLOR.INFO_FONDO,
  color: COLOR.INFO,
  border: `1px solid ${COLOR.INFO_BORDE}`,
}

/** @readonly */
export const ICON_BTN_SX = {
  border: BORDE,
  bgcolor: COLOR.BLANCO,
  color: COLOR.TEXTO_SUAVE,
  "&:hover": { bgcolor: COLOR.LIENZO, borderColor: COLOR.BORDE_FUERTE },
}

/** @readonly */
export const CELL_STRONG_SX = { color: COLOR.TINTA, fontWeight: 600 }

/** @readonly */
export const CELL_SX = { color: COLOR.TEXTO }

/** @readonly */
export const CELL_MUTED_SX = { color: COLOR.TEXTO_SUAVE }

/** @readonly */
export const DARK_BTN_SX = {
  bgcolor: COLOR.TINTA,
  fontWeight: 700,
  borderRadius: 2,
  px: 3,
  py: 1.1,
  textTransform: "none",
  boxShadow: SOMBRA.NINGUNA,
  transition: "all 0.15s",
  "&:hover": { bgcolor: COLOR.TINTA_CLARA, boxShadow: SOMBRA.FLOTANTE },
  "&.Mui-disabled": { bgcolor: COLOR.BORDE_FUERTE, color: COLOR.BLANCO },
}

/** @readonly */
export const GHOST_BTN_SX = {
  bgcolor: COLOR.BLANCO,
  borderColor: COLOR.BORDE_FUERTE,
  color: COLOR.TEXTO,
  fontWeight: 600,
  textTransform: "none",
  borderRadius: 2,
  px: 2.5,
  py: 1.1,
}

/** @readonly */
export const INPUT_SX = { borderRadius: 2 }
