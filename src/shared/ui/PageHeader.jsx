import { Box, Stack, Typography } from "@mui/material"

/**
 * Encabezado de pantalla: título, descripción y acciones a la derecha.
 *
 * Recoge el bloque que hoy está copiado con pequeñas variaciones en casi todas
 * las pantallas, para que el espaciado y la jerarquía tipográfica dejen de
 * depender de qué archivo se copió al crear la siguiente.
 *
 * @param {object} props Propiedades del componente.
 * @param {string} props.titulo Título de la pantalla.
 * @param {string} [props.descripcion] Frase que explica qué se hace aquí.
 * @param {object} [props.acciones] Botones a la derecha.
 * @returns {object} El encabezado renderizado.
 */
export function PageHeader({ titulo, descripcion, acciones }) {
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
        <Typography variant="h4" fontWeight={800} gutterBottom>
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
