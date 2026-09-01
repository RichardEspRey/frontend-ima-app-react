import { Box, Stack, Typography } from "@mui/material"
import { PAGE_OVERLINE_SX, PAGE_TITLE_SX, SECTION_TITLE_SX } from "./estilos"

/**
 * Encabezado de pantalla: título, descripción y acciones a la derecha.
 *
 * Recoge el bloque que hoy está copiado con pequeñas variaciones en casi todas
 * las pantallas, para que el espaciado y la jerarquía tipográfica dejen de
 * depender de qué archivo se copió al crear la siguiente.
 *
 * Usa los mismos tokens que el Expense Manager y el Administrador de viajes: un
 * `overline` gris en mayúsculas espaciadas sobre el título. Así las pantallas
 * migradas se ven de la misma familia sin que cada una copie el bloque.
 *
 * @param {object} props Propiedades del componente.
 * @param {string} props.titulo Título de la pantalla.
 * @param {string} [props.seccion] Texto pequeño sobre el título, en mayúsculas.
 * @param {string} [props.descripcion] Frase que explica qué se hace aquí.
 * @param {object} [props.acciones] Botones a la derecha.
 * @returns {object} El encabezado renderizado.
 */
export function PageHeader({ titulo, seccion, descripcion, acciones }) {
  return (
    <Box
      sx={{
        mb: 4,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 2,
        flexWrap: "wrap",
      }}
    >
      <Box>
        {seccion && (
          <Typography variant="overline" sx={PAGE_OVERLINE_SX}>
            {seccion}
          </Typography>
        )}
        <Typography variant="h4" fontWeight={800} sx={{ ...PAGE_TITLE_SX, ...SECTION_TITLE_SX }} gutterBottom>
          {titulo}
        </Typography>
        {descripcion && (
          <Typography variant="body1" color="text.secondary">
            {descripcion}
          </Typography>
        )}
      </Box>
      {acciones && (
        <Stack direction="row" spacing={2} flexWrap="wrap">
          {acciones}
        </Stack>
      )}
    </Box>
  )
}
