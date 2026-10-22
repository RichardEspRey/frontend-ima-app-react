import { useEffect, useRef, useState } from "react"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"

import { COLOR } from "../../../shared/ui"
import { LADO_ESCANEO, camposPropuestos, paradaDelLado, valoresMarcados } from "../model/coincidencia"
import { leerDocumentoCarga } from "../model/ocr"

const TEXTOS = {
  [LADO_ESCANEO.ORIGEN]: {
    titulo: "Cargar ORIGEN desde documento",
    fecha: "Fecha Carga",
    bodega: "Bodega Origen",
    ciudad: "Ciudad/Estado Origen",
    zip: "Zip Code Origen",
  },
  [LADO_ESCANEO.DESTINO]: {
    titulo: "Cargar DESTINO desde documento",
    fecha: "Fecha Entrega",
    bodega: "Bodega Destino",
    ciudad: "Ciudad/Estado Destino",
    zip: "Zip Code Destino",
  },
}

/**
 * Un campo propuesto, con su casilla para aplicarlo o no.
 *
 * @param {object} props Propiedades del componente.
 * @param {string} props.etiqueta Nombre del campo.
 * @param {{value: *, checked: boolean}} props.campo Valor y casilla.
 * @param {Function} props.onCambiar Recibe el campo actualizado.
 * @param {string} [props.tipo='text'] Tipo del input.
 * @returns {object} El renglón renderizado.
 */
function CampoPropuesto({ etiqueta, campo, onCambiar, tipo = "text" }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Checkbox
        size="small"
        checked={campo.checked}
        onChange={(evento) => onCambiar({ ...campo, checked: evento.target.checked })}
      />
      <TextField
        label={etiqueta}
        size="small"
        fullWidth
        type={tipo}
        InputLabelProps={tipo !== "text" ? { shrink: true } : undefined}
        value={campo.value || ""}
        onChange={(evento) => onCambiar({ value: evento.target.value, checked: Boolean(evento.target.value) })}
      />
    </Stack>
  )
}

/**
 * Lee una imagen o un PDF y propone bodega, ciudad, zip y fecha para un lado de
 * la etapa.
 *
 * Se puede hacer clic, arrastrar el archivo o pegar una captura con Ctrl+V.
 * Nada se aplica sin revisarse: cada campo lleva su casilla y solo se mandan
 * los marcados.
 *
 * @param {object} props Propiedades del componente.
 * @param {boolean} props.abierto Si el diálogo se muestra.
 * @param {string} [props.lado='origin'] Un valor de `LADO_ESCANEO`.
 * @param {Array.<object>} [props.bodegas] El catálogo de bodegas, `{value, label}`.
 * @param {Function} props.onCerrar Cierra sin aplicar.
 * @param {Function} props.onAplicar Recibe `{warehouse, city, zip, date}` solo con lo marcado;
 *   `warehouse` es una opción del catálogo o `{create: true, name}` para crearla.
 * @returns {object} El diálogo renderizado.
 */
export function ModalLeerDocumento({ abierto, lado = LADO_ESCANEO.ORIGEN, bodegas = [], onCerrar, onAplicar }) {
  const [estado, setEstado] = useState(null)
  const [error, setError] = useState("")
  const [resultado, setResultado] = useState(null)
  const [campos, setCampos] = useState(null)
  const entrada = useRef(null)
  const textos = TEXTOS[lado]

  const reiniciar = () => {
    setEstado(null)
    setError("")
    setResultado(null)
    setCampos(null)
  }

  const cerrar = () => {
    reiniciar()
    onCerrar()
  }

  const procesar = async (archivo) => {
    if (!archivo) return
    reiniciar()
    setEstado({ texto: "Procesando…", progreso: null })
    try {
      const leido = await leerDocumentoCarga(archivo, (texto, progreso) => setEstado({ texto, progreso }))
      const parada = paradaDelLado(leido, lado)
      if (!parada) {
        setError("No se encontraron datos reconocibles. Revisa el texto detectado o intenta con una imagen más nítida.")
      }
      setResultado({ ...leido, parada })
      setCampos(camposPropuestos(parada, bodegas))
    } catch (fallo) {
      setError(fallo.message || "No se pudo leer el documento.")
    } finally {
      setEstado(null)
    }
  }

  const procesarRef = useRef(procesar)
  procesarRef.current = procesar

  useEffect(() => {
    if (!abierto) return undefined
    const alPegar = (evento) => {
      const imagen = [...(evento.clipboardData?.items || [])].find((i) => i.type.startsWith("image/"))
      if (imagen) {
        evento.preventDefault()
        procesarRef.current(imagen.getAsFile())
      }
    }
    window.addEventListener("paste", alPegar)
    return () => window.removeEventListener("paste", alPegar)
  }, [abierto])

  const cambiarCampo = (clave) => (valor) => setCampos((previos) => ({ ...previos, [clave]: valor }))

  const aplicar = () => {
    onAplicar(valoresMarcados(campos))
    cerrar()
  }

  const opcionesBodega = campos?.warehouse.value?.create ? [campos.warehouse.value, ...bodegas] : bodegas
  const marcados = campos ? Object.keys(valoresMarcados(campos)).length : 0

  return (
    <Dialog open={abierto} onClose={cerrar} maxWidth="sm" fullWidth>
      <DialogTitle>{textos.titulo}</DialogTitle>
      <DialogContent dividers>
        <Box
          onClick={() => !estado && entrada.current?.click()}
          onDragOver={(evento) => evento.preventDefault()}
          onDrop={(evento) => {
            evento.preventDefault()
            procesar(evento.dataTransfer.files?.[0])
          }}
          sx={{
            border: `2px dashed ${COLOR.INFO_BORDE}`,
            borderRadius: 2,
            p: campos ? 1.5 : 4,
            textAlign: "center",
            cursor: estado ? "default" : "pointer",
            bgcolor: COLOR.INFO_FONDO,
            mb: 2,
          }}
        >
          <CloudUploadIcon color="primary" sx={{ fontSize: campos ? 24 : 40 }} />
          <Typography variant="body2">
            {campos ? "Subir otro documento" : "Haz clic, arrastra una imagen/PDF o pega una captura (Ctrl+V)"}
          </Typography>
          <input
            ref={entrada}
            type="file"
            hidden
            accept="image/*,application/pdf"
            onChange={(evento) => {
              procesar(evento.target.files?.[0])
              evento.target.value = ""
            }}
          />
        </Box>

        {estado ? (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {estado.texto}
            </Typography>
            <LinearProgress
              variant={estado.progreso == null ? "indeterminate" : "determinate"}
              value={(estado.progreso || 0) * 100}
            />
          </Box>
        ) : null}

        {error ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}

        {campos ? (
          <>
            <Alert severity="info" sx={{ mb: 2, py: 0 }}>
              Revisa y corrige los datos. Solo se aplican los campos marcados.
            </Alert>
            {resultado.parada?.name ? (
              <Typography variant="caption" color={COLOR.APAGADO} component="div" sx={{ mb: 1.5 }}>
                Nombre detectado: <b>{resultado.parada.name}</b>
                {resultado.parada.time ? (
                  <>
                    {" "}
                    · Hora: <b>{resultado.parada.time}</b>
                  </>
                ) : null}
              </Typography>
            ) : null}

            <Stack spacing={1.5}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Checkbox
                  size="small"
                  checked={campos.warehouse.checked}
                  onChange={(evento) =>
                    cambiarCampo("warehouse")({ ...campos.warehouse, checked: evento.target.checked })
                  }
                />
                <Autocomplete
                  fullWidth
                  size="small"
                  options={opcionesBodega}
                  value={campos.warehouse.value}
                  isOptionEqualToValue={(opcion, valor) => (opcion.create ? valor.create : opcion.value === valor.value)}
                  onChange={(_, valor) => cambiarCampo("warehouse")({ value: valor, checked: Boolean(valor) })}
                  renderInput={(parametros) => <TextField {...parametros} label={textos.bodega} />}
                />
              </Stack>
              <CampoPropuesto etiqueta={textos.ciudad} campo={campos.city} onCambiar={cambiarCampo("city")} />
              <CampoPropuesto etiqueta={textos.zip} campo={campos.zip} onCambiar={cambiarCampo("zip")} />
              <CampoPropuesto
                etiqueta={textos.fecha}
                tipo="date"
                campo={campos.date}
                onCambiar={cambiarCampo("date")}
              />
            </Stack>

            <Accordion disableGutters sx={{ mt: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2">Texto detectado</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box
                  component="pre"
                  sx={{ m: 0, fontSize: 12, whiteSpace: "pre-wrap", maxHeight: 240, overflow: "auto", userSelect: "text" }}
                >
                  {resultado.rawText || "(vacío)"}
                </Box>
              </AccordionDetails>
            </Accordion>
          </>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={cerrar}>Cancelar</Button>
        <Button variant="contained" disabled={!marcados} onClick={aplicar}>
          Aplicar {marcados ? `(${marcados})` : ""}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
