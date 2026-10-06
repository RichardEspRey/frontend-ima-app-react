import { Box, InputAdornment, Paper, TextField, Typography } from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"

import { CARD_SX, COLOR, SECTION_LABEL_SX } from "../../../shared/ui"

/**
 * El buscador de viajes por número.
 *
 * @param {object} props Propiedades del componente.
 * @param {string} props.busqueda Lo escrito.
 * @param {Function} props.onBuscar `(texto) => void`.
 * @returns {object} El filtro renderizado.
 */
export function FiltroCumplimiento({ busqueda, onBuscar }) {
  return (
    <Paper elevation={0} sx={{ ...CARD_SX, mb: 3 }}>
      <Typography variant="overline" sx={SECTION_LABEL_SX}>
        Filtros de búsqueda
      </Typography>
      <Box sx={{ mt: 1.5 }}>
        <TextField
          size="small"
          placeholder="Buscar por Trip #..."
          value={busqueda}
          onChange={(evento) => onBuscar(evento.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: COLOR.TENUE }} />
                </InputAdornment>
              ),
              sx: { bgcolor: COLOR.BLANCO, minWidth: 300 },
            },
          }}
        />
      </Box>
    </Paper>
  )
}
