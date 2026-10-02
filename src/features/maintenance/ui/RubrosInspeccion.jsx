import { Box, Checkbox, Chip, FormControlLabel, Paper, Stack, Typography } from "@mui/material"
import {
  ESTATUS_PUNTO,
  ETIQUETA_ESTATUS,
  agruparPorRubro,
  estaResuelto,
} from "../../../entities/maintenance-point"
import { COLOR } from "../../../shared/ui"

const CARD_RUBRO_SX = {
  p: 2,
  borderRadius: 2,
  border: `1px solid ${COLOR.BORDE}`,
  bgcolor: COLOR.BLANCO,
  minWidth: 280,
  flex: "1 1 300px",
}

const COLOR_ESTATUS = {
  [ESTATUS_PUNTO.EN_PENDIENTES]: { bgcolor: COLOR.INFO_FONDO, color: COLOR.INFO },
  [ESTATUS_PUNTO.CON_ORDEN]: { bgcolor: COLOR.EXITO_FONDO, color: COLOR.EXITO },
  [ESTATUS_PUNTO.DESCARTADO]: { bgcolor: COLOR.PELIGRO_FONDO, color: COLOR.PELIGRO },
}

/**
 * Un punto del checklist con su casilla y, si ya se trabajó, su etiqueta.
 *
 * El punto resuelto no desaparece: se queda a la vista, en gris, con la casilla
 * apagada, y tachado si fue descartado. La inspección se tiene que poder leer
 * completa meses después, incluido lo que se decidió no reparar.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.punto El punto a pintar.
 * @param {boolean} props.marcado Si está seleccionado.
 * @param {Function} props.onAlternar Qué hacer al marcarlo.
 * @returns {object} El renglón renderizado.
 */
function PuntoInspeccion({ punto, marcado, onAlternar }) {
  const resuelto = estaResuelto(punto)
  const descartado = punto.estatus === ESTATUS_PUNTO.DESCARTADO

  const etiqueta =
    punto.estatus === ESTATUS_PUNTO.CON_ORDEN && punto.id_orden
      ? `Orden #${punto.id_orden}`
      : ETIQUETA_ESTATUS[punto.estatus]

  return (
    <FormControlLabel
      sx={{ alignItems: "flex-start", mb: 0.5, ml: 0 }}
      control={
        <Checkbox
          size="small"
          checked={marcado}
          disabled={resuelto}
          onChange={() => onAlternar(punto.clave)}
          sx={{ pt: 0.25 }}
        />
      }
      label={
        <Box sx={{ mt: 0.25 }}>
          <Typography
            variant="body2"
            component="span"
            color={resuelto ? COLOR.TENUE : COLOR.TEXTO}
            sx={descartado ? { textDecoration: "line-through" } : undefined}
          >
            {punto.texto}
          </Typography>
          {resuelto ? (
            <Chip
              size="small"
              label={etiqueta}
              sx={{
                ml: 1,
                height: 18,
                fontSize: "0.65rem",
                fontWeight: 700,
                ...COLOR_ESTATUS[punto.estatus],
              }}
            />
          ) : null}
        </Box>
      }
    />
  )
}

/**
 * Los puntos de una inspección, agrupados por rubro.
 *
 * Solo pinta: quién está seleccionado lo decide el controlador de la pantalla.
 *
 * @param {object} props Propiedades del componente.
 * @param {Array.<object>} props.puntos Los puntos del lado abierto.
 * @param {Array.<string>} props.seleccionados Las claves marcadas.
 * @param {Function} props.onAlternar Marcar o desmarcar un punto.
 * @param {Function} props.onAlternarRubro Marcar o desmarcar un rubro entero.
 * @returns {object} Las tarjetas renderizadas.
 */
export function RubrosInspeccion({ puntos, seleccionados, onAlternar, onAlternarRubro }) {
  const rubros = agruparPorRubro(puntos)

  if (rubros.length === 0) {
    return (
      <Typography variant="body2" sx={{ fontStyle: "italic", color: COLOR.TENUE, py: 2 }}>
        El operador no reportó nada que atender de este lado.
      </Typography>
    )
  }

  return (
    <Stack direction="row" flexWrap="wrap" gap={2}>
      {rubros.map((rubro) => {
        const abiertos = rubro.puntos.filter((punto) => !estaResuelto(punto))
        const claves = abiertos.map((punto) => punto.clave)
        const todos = claves.length > 0 && claves.every((clave) => seleccionados.includes(clave))
        const algunos = !todos && claves.some((clave) => seleccionados.includes(clave))

        return (
          <Paper key={rubro.clave} elevation={0} sx={CARD_RUBRO_SX}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Checkbox
                  size="small"
                  checked={todos}
                  indeterminate={algunos}
                  disabled={claves.length === 0}
                  onChange={() => onAlternarRubro(claves, !todos)}
                  sx={{ p: 0.5 }}
                />
                <Typography fontWeight={800} color={COLOR.TINTA}>
                  {rubro.etiqueta}
                </Typography>
              </Stack>
              <Chip
                size="small"
                label={abiertos.length > 0 ? abiertos.length : "✓"}
                sx={{
                  height: 20,
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  bgcolor: COLOR.RELLENO,
                  color: COLOR.TEXTO_SUAVE,
                }}
              />
            </Stack>

            <Box sx={{ pl: 0.5 }}>
              {rubro.puntos.map((punto) => (
                <PuntoInspeccion
                  key={punto.clave}
                  punto={punto}
                  marcado={seleccionados.includes(punto.clave)}
                  onAlternar={onAlternar}
                />
              ))}
            </Box>
          </Paper>
        )
      })}
    </Stack>
  )
}
