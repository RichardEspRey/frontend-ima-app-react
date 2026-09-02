import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material"
import { urlSegura } from "../../../shared/security"
import CloseIcon from "@mui/icons-material/Close"
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined"
import FilePresentIcon from "@mui/icons-material/FilePresent"

import {
  categoriasDe,
  colorCategoria,
  fechaVencimiento,
  requisitosDeCategoria,
} from "../../../entities/unit"
import { API_BASE } from "../../../shared/config/env"
import { archivoDelEvento } from "../../../shared/security"

/**
 * Un requisito del expediente dentro del formulario.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.requisito El requisito a capturar.
 * @param {object} [props.documento] Lo que ya hay guardado.
 * @param {boolean} props.tieneArchivoNuevo Si ya se escogió un archivo sin guardar.
 * @param {Function} props.onDocumentoChange Recibe el documento con el cambio.
 * @param {Function} props.onArchivo Recibe el archivo escogido.
 * @returns {object} El campo renderizado.
 */
function CampoRequisito({ requisito, documento = {}, tieneArchivoNuevo, onDocumentoChange, onArchivo }) {
  return (
    <Box sx={{ p: 1.5, bgcolor: "#f1f5f9", borderRadius: 2 }}>
      <Typography variant="caption" fontWeight={700} color="primary.dark">
        {requisito.label}
      </Typography>

      {requisito.tipo === "text" ? (
        <TextField
          size="small"
          fullWidth
          placeholder="Ingresar valor"
          value={documento.valor_texto || ""}
          onChange={(e) => onDocumentoChange({ ...documento, valor_texto: e.target.value })}
          sx={{ mt: 1, bgcolor: "white" }}
        />
      ) : (
        <Stack spacing={1} mt={1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Button
              variant="outlined"
              component="label"
              size="small"
              startIcon={<CloudUploadOutlinedIcon />}
              sx={{ bgcolor: "white" }}
            >
              Subir {tieneArchivoNuevo ? "(1)" : ""}
              <input type="file" hidden onChange={async (e) => { const f = await archivoDelEvento(e); if (f) onArchivo(f) }} />
            </Button>
            {documento.url_pdf && (
              <Tooltip title="Ver Archivo">
                <IconButton
                  size="small"
                  color="info"
                  component="a"
                  href={urlSegura(`${API_BASE}/${documento.url_pdf}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FilePresentIcon />
                </IconButton>
              </Tooltip>
            )}
          </Stack>

          {Number(requisito.tiene_vencimiento) === 1 && (
            <TextField
              type="date"
              size="small"
              fullWidth
              label="Vence"
              InputLabelProps={{ shrink: true }}
              value={fechaVencimiento(documento) ?? ""}
              onChange={(e) =>
                onDocumentoChange({ ...documento, fecha_vencimiento: e.target.value })
              }
              sx={{ bgcolor: "white" }}
            />
          )}
        </Stack>
      )}
    </Box>
  )
}

/**
 * Alta y edición de una unidad, con sus datos y su expediente completo.
 *
 * Los campos de la izquierda salen del descriptor del tipo; los de la derecha,
 * de los requisitos configurados, agrupados por categoría.
 *
 * @param {object} props Propiedades del componente.
 * @param {boolean} props.abierto Si el modal se muestra.
 * @param {Function} props.onCerrar Cierra el modal.
 * @param {object} props.descriptor El descriptor del tipo de unidad.
 * @param {Array} props.requisitos Los requisitos del expediente.
 * @param {object} props.unidad Los datos del formulario.
 * @param {Function} props.onUnidadChange Recibe la unidad con el cambio aplicado.
 * @param {object} props.archivos Los archivos escogidos y aún sin guardar.
 * @param {Function} props.onArchivosChange Recibe los archivos con el cambio.
 * @param {Function} props.onGuardar Guarda la unidad.
 * @param {boolean} [props.guardando] Si el guardado está en curso.
 * @returns {object} El modal renderizado.
 */
export function ModalUnidad({
  abierto,
  onCerrar,
  descriptor,
  requisitos = [],
  unidad,
  onUnidadChange,
  archivos = {},
  onArchivosChange,
  onGuardar,
  guardando,
}) {
  const editando = Boolean(unidad?.[descriptor.campoId])
  const principal = descriptor.columnas.find((columna) => columna.principal)
  const titulo = editando
    ? `${descriptor.etiquetas.tituloEdicion}: ${unidad[principal.clave] ?? ""}`
    : descriptor.etiquetas.tituloAlta

  const cambiarDocumento = (clave, documento) =>
    onUnidadChange({ ...unidad, docs: { ...unidad.docs, [clave]: documento } })

  return (
    <Dialog
      open={abierto}
      onClose={onCerrar}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, height: "90vh" } }}
    >
      <DialogTitle
        sx={{
          bgcolor: "#0f172a",
          color: "white",
          fontWeight: 800,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {titulo}
        <IconButton onClick={onCerrar} size="small" sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, bgcolor: "#f8fafc" }}>
        <Box sx={{ p: 3 }}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>
                1. {descriptor.etiquetas.seccionDatos}
              </Typography>
              <Paper elevation={0} sx={{ p: 2, border: "1px solid #e2e8f0", borderRadius: 2 }}>
                <Stack spacing={2.5}>
                  {descriptor.campos.map((campo) => (
                    <TextField
                      key={campo.clave}
                      label={campo.etiqueta}
                      type={campo.tipo ?? "text"}
                      InputLabelProps={campo.tipo === "date" ? { shrink: true } : undefined}
                      fullWidth
                      size="small"
                      value={unidad?.[campo.clave] ?? ""}
                      onChange={(e) => onUnidadChange({ ...unidad, [campo.clave]: e.target.value })}
                    />
                  ))}
                </Stack>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>
                2. Expediente Dinámico
              </Typography>
              <Grid container spacing={2}>
                {categoriasDe(requisitos).map((categoria) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={categoria}>
                    <Paper
                      elevation={0}
                      sx={{ p: 2, border: "1px solid #e2e8f0", borderRadius: 2, height: "100%" }}
                    >
                      <Typography
                        variant="subtitle2"
                        fontWeight={800}
                        color="#475569"
                        gutterBottom
                        sx={{ borderBottom: `2px solid ${colorCategoria(categoria)}`, pb: 1 }}
                      >
                        {categoria.toUpperCase()}
                      </Typography>

                      <Stack spacing={2} mt={2}>
                        {requisitosDeCategoria(requisitos, categoria).map((requisito) => (
                          <CampoRequisito
                            key={requisito.key_name}
                            requisito={requisito}
                            documento={unidad?.docs?.[requisito.key_name] ?? {}}
                            tieneArchivoNuevo={Boolean(archivos[requisito.key_name])}
                            onDocumentoChange={(doc) => cambiarDocumento(requisito.key_name, doc)}
                            onArchivo={(archivo) =>
                              onArchivosChange({ ...archivos, [requisito.key_name]: archivo })
                            }
                          />
                        ))}
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: "1px solid #e2e8f0", bgcolor: "#f8fafc" }}>
        <Button onClick={onCerrar} sx={{ fontWeight: 600, color: "#64748b" }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disableElevation
          onClick={onGuardar}
          disabled={guardando}
          sx={{ px: 4, py: 1, borderRadius: 2, bgcolor: "#0f172a" }}
        >
          Guardar {descriptor.etiquetas.singular}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
