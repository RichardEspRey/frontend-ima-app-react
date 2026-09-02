import {
  Box,
  Button,
  Collapse,
  Divider,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined"
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined"
import FilterListIcon from "@mui/icons-material/FilterList"
import NotesOutlinedIcon from "@mui/icons-material/NotesOutlined"
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined"
import SearchIcon from "@mui/icons-material/Search"
import SellOutlinedIcon from "@mui/icons-material/SellOutlined"

import { TODOS } from "../../../entities/expense"
import { SECTION_LABEL_SX } from "../estilos"

const MEDIO = { xs: 12, sm: 6, md: 4 }
const CUARTO = { xs: 12, sm: 6, md: 3 }

const ICONO_SX = { fontSize: 18, color: "#94a3b8" }

/**
 * Un selector de filtro con su icono.
 *
 * @param {object} props Propiedades del componente.
 * @param {string} props.etiqueta Nombre del filtro.
 * @param {string} props.valor Lo elegido.
 * @param {Array.<string>} props.opciones Las opciones.
 * @param {Function} props.onChange Recibe la opción elegida.
 * @param {object} props.icono El icono de la izquierda.
 * @returns {object} El selector renderizado.
 */
function SelectorFiltro({ etiqueta, valor, opciones, onChange, icono }) {
  return (
    <FormControl size="small" fullWidth>
      <InputLabel>{etiqueta}</InputLabel>
      <Select
        value={valor}
        label={etiqueta}
        onChange={(e) => onChange(e.target.value)}
        startAdornment={<InputAdornment position="start">{icono}</InputAdornment>}
      >
        {opciones.map((opcion) => (
          <MenuItem key={opcion} value={opcion}>
            {opcion}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}

/**
 * La barra de filtros del Expense Manager.
 *
 * Los tres selectores de clasificación van encadenados: elegir un tipo acota
 * las categorías, y elegir una categoría acota las subcategorías. La de
 * subcategoría solo aparece si la categoría elegida tiene alguna.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.filtros Lo que hay puesto.
 * @param {Function} props.onFiltroChange Recibe `(campo, valor)`.
 * @param {Function} props.onLimpiar Vacía todos los filtros.
 * @param {boolean} props.abiertos Si el panel está desplegado.
 * @param {Function} props.onAlternar Pliega o despliega el panel.
 * @param {number} props.activos Cuántos filtros están puestos.
 * @param {object} props.opciones Los catálogos ya acotados.
 * @returns {object} La barra renderizada.
 */
export function FiltrosGastos({
  filtros,
  onFiltroChange,
  onLimpiar,
  abiertos,
  onAlternar,
  activos,
  opciones,
}) {
  const { paises, tipos, categorias, subcategorias } = opciones

  return (
    <>
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={onAlternar}
          sx={{
            bgcolor: "white",
            borderColor: activos > 0 ? "#0f172a" : "#cbd5e1",
            color: "#334155",
            fontWeight: 600,
            textTransform: "none",
            borderRadius: 2,
          }}
        >
          {abiertos ? "Ocultar Filtros" : "Mostrar Filtros"}
          {activos > 0 && (
            <Box
              component="span"
              sx={{
                ml: 1,
                minWidth: 20,
                height: 20,
                px: 0.6,
                borderRadius: "10px",
                bgcolor: "#0f172a",
                color: "#fff",
                fontSize: "0.72rem",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {activos}
            </Box>
          )}
        </Button>
      </Box>

      <Collapse in={abiertos}>
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2, border: "1px solid #e2e8f0" }} elevation={0}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="overline" sx={SECTION_LABEL_SX}>
                Búsqueda
              </Typography>
              <Grid container spacing={2} sx={{ mt: 0.25 }}>
                <Grid size={MEDIO}>
                  <TextField
                    label="Buscar"
                    placeholder="ID, país, moneda…"
                    size="small"
                    fullWidth
                    value={filtros.search}
                    onChange={(e) => onFiltroChange("search", e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={ICONO_SX} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid size={MEDIO}>
                  <SelectorFiltro
                    etiqueta="País"
                    valor={filtros.filterCountry}
                    opciones={paises}
                    onChange={(valor) => onFiltroChange("filterCountry", valor)}
                    icono={<PublicOutlinedIcon sx={ICONO_SX} />}
                  />
                </Grid>
                <Grid size={MEDIO}>
                  <TextField
                    label="Descripción"
                    placeholder="Llantas, aceite, filtro…"
                    size="small"
                    fullWidth
                    value={filtros.filterDescription}
                    onChange={(e) => onFiltroChange("filterDescription", e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <NotesOutlinedIcon sx={ICONO_SX} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ borderColor: "#f1f5f9" }} />

            <Box>
              <Typography variant="overline" sx={SECTION_LABEL_SX}>
                Clasificación
              </Typography>
              <Grid container spacing={2} sx={{ mt: 0.25 }}>
                <Grid size={MEDIO}>
                  <SelectorFiltro
                    etiqueta="Tipo de Gasto"
                    valor={filtros.filterType}
                    opciones={tipos}
                    onChange={(valor) => onFiltroChange("filterType", valor)}
                    icono={<SellOutlinedIcon sx={ICONO_SX} />}
                  />
                </Grid>
                <Grid size={MEDIO}>
                  <SelectorFiltro
                    etiqueta="Categoría"
                    valor={filtros.filterCategory}
                    opciones={categorias}
                    onChange={(valor) => onFiltroChange("filterCategory", valor)}
                    icono={<CategoryOutlinedIcon sx={ICONO_SX} />}
                  />
                </Grid>
                <Grid size={MEDIO}>
                  {subcategorias.length > 0 && (
                    <SelectorFiltro
                      etiqueta="Subcategoría"
                      valor={filtros.filterSubcategory}
                      opciones={[TODOS, ...subcategorias]}
                      onChange={(valor) => onFiltroChange("filterSubcategory", valor)}
                      icono={<AccountTreeOutlinedIcon sx={ICONO_SX} />}
                    />
                  )}
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ borderColor: "#f1f5f9" }} />

            <Box>
              <Typography variant="overline" sx={SECTION_LABEL_SX}>
                Periodo
              </Typography>
              <Grid container spacing={2} sx={{ mt: 0.25 }}>
                <Grid size={CUARTO}>
                  <TextField
                    label="Fecha Inicio"
                    type="date"
                    size="small"
                    fullWidth
                    value={filtros.startDate}
                    onChange={(e) => onFiltroChange("startDate", e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid size={CUARTO}>
                  <TextField
                    label="Fecha Fin"
                    type="date"
                    size="small"
                    fullWidth
                    value={filtros.endDate}
                    onChange={(e) => onFiltroChange("endDate", e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Stack direction="row" justifyContent="flex-end">
              <Button
                variant="text"
                disabled={activos === 0}
                onClick={onLimpiar}
                sx={{ textTransform: "none", fontWeight: 600, color: "#64748b" }}
              >
                Limpiar Filtros
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Collapse>
    </>
  )
}
