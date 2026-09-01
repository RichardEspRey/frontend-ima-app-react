import { Box, Button, CircularProgress, InputAdornment, Paper, Stack, TextField, Typography } from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"

import { MODO_PING } from "../../../entities/tracking"
import { COLOR_PUNTO_1, COLOR_PUNTO_2 } from "./iconos"

const MODOS = [
  { modo: MODO_PING.BUSQUEDA, texto: "Búsqueda", activo: "Búsqueda" },
  { modo: MODO_PING.MAPA, texto: "En el mapa", activo: "Clic mapa…" },
  { modo: MODO_PING.CAMION, texto: "2° camión", activo: "Eligiendo…" },
]

/**
 * Un extremo de la ruta, con su número y su nombre.
 *
 * @param {object} props Propiedades del componente.
 * @param {string} props.numero El número del punto.
 * @param {string} props.color Color del círculo.
 * @param {string} props.nombre Cómo se llama el punto.
 * @returns {object} La fila renderizada.
 */
function FilaPunto({ numero, color, nombre }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
      <Box
        sx={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          bgcolor: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: 12,
          fontWeight: "bold",
          flexShrink: 0,
        }}
      >
        {numero}
      </Box>
      <Typography variant="caption" color="#333">
        {nombre}
      </Typography>
    </Stack>
  )
}

/**
 * El panel que traza la ruta entre la unidad elegida y un segundo punto.
 *
 * El segundo punto se pone de tres maneras: buscando una dirección, haciendo
 * clic en el mapa, o eligiendo otro camión.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.punto1 Primer extremo, siempre una unidad.
 * @param {object} [props.punto2] Segundo extremo, si ya se puso.
 * @param {string} [props.modo] Modo activo para colocar el segundo punto.
 * @param {Function} props.onModoChange Recibe el modo elegido.
 * @param {string} props.busqueda Lo escrito en el buscador de direcciones.
 * @param {Function} props.onBusquedaChange Recibe lo que se escribe.
 * @param {Array} props.resultados Los lugares encontrados.
 * @param {boolean} props.buscando Si la búsqueda está en curso.
 * @param {Function} props.onElegirLugar Recibe el lugar elegido.
 * @param {Function} props.onTrazar Traza la ruta entre los dos puntos.
 * @param {boolean} props.trazando Si la ruta se está calculando.
 * @param {object} [props.resumen] Distancia y duración de la ruta trazada.
 * @param {Function} props.onLimpiar Descarta la ruta y los dos puntos.
 * @returns {object} El panel renderizado.
 */
export function TrazadorRuta({
  punto1,
  punto2,
  modo,
  onModoChange,
  busqueda,
  onBusquedaChange,
  resultados = [],
  buscando,
  onElegirLugar,
  onTrazar,
  trazando,
  resumen,
  onLimpiar,
}) {
  return (
    <Box sx={{ p: 1.5, bgcolor: "#f0f4ff", borderBottom: `2px solid ${COLOR_PUNTO_1}` }}>
      <Typography variant="subtitle2" fontWeight={700} color={COLOR_PUNTO_1} mb={1}>
        Trazador de ruta
      </Typography>

      <FilaPunto numero="1" color={COLOR_PUNTO_1} nombre={punto1.name} />

      {punto2 ? (
        <FilaPunto numero="2" color={COLOR_PUNTO_2} nombre={punto2.name} />
      ) : (
        <Box mb={0.5}>
          <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
            Seleccionar Ping 2:
          </Typography>

          <Stack direction="row" spacing={0.5}>
            {MODOS.map((opcion) => (
              <Button
                key={opcion.modo}
                size="small"
                onClick={() => onModoChange(opcion.modo)}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  px: 0.5,
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "none",
                  bgcolor: modo === opcion.modo ? COLOR_PUNTO_1 : "#e8eaf6",
                  color: modo === opcion.modo ? "white" : COLOR_PUNTO_1,
                  "&:hover": { bgcolor: modo === opcion.modo ? COLOR_PUNTO_1 : "#dfe3f5" },
                }}
              >
                {modo === opcion.modo ? opcion.activo : opcion.texto}
              </Button>
            ))}
          </Stack>

          {modo === MODO_PING.BUSQUEDA && (
            <Box sx={{ mt: 1, position: "relative" }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Escribe una dirección..."
                value={busqueda}
                onChange={(e) => onBusquedaChange(e.target.value)}
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 16, color: COLOR_PUNTO_1 }} />
                    </InputAdornment>
                  ),
                  endAdornment: buscando ? (
                    <InputAdornment position="end">
                      <CircularProgress size={14} sx={{ color: COLOR_PUNTO_1 }} />
                    </InputAdornment>
                  ) : null,
                }}
                sx={{ bgcolor: "white", borderRadius: 1 }}
              />

              {resultados.length > 0 && (
                <Paper
                  elevation={6}
                  sx={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    zIndex: 20,
                    maxHeight: 200,
                    overflowY: "auto",
                    mt: 0.5,
                    borderRadius: 1,
                  }}
                >
                  {resultados.map((lugar) => (
                    <Box
                      key={lugar.place_id ?? `${lugar.lat},${lugar.lon}`}
                      onClick={() => onElegirLugar(lugar)}
                      sx={{
                        px: 1.5,
                        py: 0.75,
                        cursor: "pointer",
                        borderBottom: "1px solid #f1f5f9",
                        "&:hover": { bgcolor: "#eef5ff" },
                        "&:last-child": { borderBottom: "none" },
                      }}
                    >
                      <Typography
                        variant="caption"
                        display="block"
                        color="#1e293b"
                        fontWeight={600}
                        sx={{ lineHeight: 1.3, fontSize: "0.68rem" }}
                      >
                        {lugar.display_name}
                      </Typography>
                    </Box>
                  ))}
                </Paper>
              )}
            </Box>
          )}
        </Box>
      )}

      {punto2 && (
        <Button
          fullWidth
          onClick={onTrazar}
          disabled={trazando}
          sx={{
            mt: 0.75,
            py: 1,
            fontSize: "13px",
            fontWeight: 700,
            textTransform: "none",
            bgcolor: "#3cb44b",
            color: "white",
            "&:hover": { bgcolor: "#34a041" },
            "&.Mui-disabled": { bgcolor: "#aaa", color: "white" },
          }}
        >
          {trazando ? "Trazando…" : "Trazar ruta"}
        </Button>
      )}

      {resumen && (
        <Box sx={{ mt: 1, p: 1.5, bgcolor: "white", borderRadius: 1, border: "1px solid #c5cae9" }}>
          <Typography variant="caption" fontWeight={700} display="block" mb={0.5}>
            Resumen de ruta
          </Typography>
          <Typography variant="caption" display="block">
            Distancia: <strong>{resumen.distancia} km</strong>
          </Typography>
          <Typography variant="caption" display="block">
            Duración estimada: <strong>{resumen.duracion} min</strong>
          </Typography>
        </Box>
      )}

      <Button
        fullWidth
        onClick={onLimpiar}
        sx={{
          mt: 1,
          color: "#999",
          border: "1px solid #ddd",
          textTransform: "none",
          fontSize: "12px",
        }}
      >
        Limpiar ruta
      </Button>
    </Box>
  )
}
