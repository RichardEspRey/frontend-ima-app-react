import { useCallback, useEffect, useRef, useState } from "react"
import { Box, CircularProgress, Paper, TextField, Typography } from "@mui/material"

import {
  ESPERA_BUSQUEDA_MS,
  buscarLugares,
  nombreCortoDeLugar,
} from "../../../entities/tracking"

const MINIMO_PARA_BUSCAR = 3

/**
 * Un campo de ubicación con sugerencias del mapa.
 *
 * Escribir no fija la ubicación: mientras no se elija una sugerencia, el campo
 * guarda el texto sin coordenadas, y quien calcula la ruta las resuelve
 * entonces. Por eso al teclear se borra la geo que hubiera.
 *
 * @param {object} props Propiedades del componente.
 * @param {string} props.etiqueta Nombre del campo.
 * @param {string} [props.placeholder] Texto de ayuda.
 * @param {object} props.valor La ubicación actual, con `input` y `geo`.
 * @param {Function} props.onChange Recibe la ubicación nueva.
 * @param {object} [props.icono] Icono a la izquierda del campo.
 * @returns {object} El campo renderizado.
 */
export function BuscadorUbicacion({ etiqueta, placeholder, valor, onChange, icono }) {
  const [sugerencias, setSugerencias] = useState([])
  const [abierto, setAbierto] = useState(false)
  const [buscando, setBuscando] = useState(false)
  const espera = useRef(null)
  const contenedor = useRef(null)

  useEffect(() => {
    const alTocarFuera = (evento) => {
      if (contenedor.current && !contenedor.current.contains(evento.target)) setAbierto(false)
    }
    document.addEventListener("mousedown", alTocarFuera)
    return () => document.removeEventListener("mousedown", alTocarFuera)
  }, [])

  useEffect(() => () => clearTimeout(espera.current), [])

  const alEscribir = (texto) => {
    onChange({ input: texto, geo: null })
    clearTimeout(espera.current)

    if (texto.trim().length < MINIMO_PARA_BUSCAR) {
      setSugerencias([])
      setAbierto(false)
      return
    }

    espera.current = setTimeout(async () => {
      setBuscando(true)
      try {
        const lugares = await buscarLugares({ texto, conDetalles: true })
        const opciones = lugares.map((lugar) => ({
          completo: lugar.display_name,
          corto: nombreCortoDeLugar(lugar),
          lat: Number.parseFloat(lugar.lat),
          lon: Number.parseFloat(lugar.lon),
        }))
        setSugerencias(opciones)
        setAbierto(opciones.length > 0)
      } catch {
        setSugerencias([])
      } finally {
        setBuscando(false)
      }
    }, ESPERA_BUSQUEDA_MS)
  }

  const elegir = useCallback(
    (opcion) => {
      onChange({
        input: opcion.corto || opcion.completo,
        geo: { lat: opcion.lat, lon: opcion.lon },
      })
      setSugerencias([])
      setAbierto(false)
    },
    [onChange],
  )

  return (
    <Box ref={contenedor} sx={{ position: "relative" }}>
      <TextField
        label={etiqueta}
        placeholder={placeholder}
        value={valor.input}
        onChange={(evento) => alEscribir(evento.target.value)}
        onFocus={() => sugerencias.length > 0 && setAbierto(true)}
        size="small"
        fullWidth
        slotProps={{
          input: {
            startAdornment: icono,
            endAdornment: buscando ? <CircularProgress size={14} /> : null,
          },
        }}
      />

      {abierto && (
        <Paper
          elevation={6}
          sx={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 1500,
            maxHeight: 230,
            overflowY: "auto",
            borderRadius: 1.5,
          }}
        >
          {sugerencias.map((opcion, indice) => (
            <Box
              key={`${opcion.lat},${opcion.lon}`}
              onMouseDown={() => elegir(opcion)}
              sx={{
                px: 2,
                py: 1,
                cursor: "pointer",
                "&:hover": { bgcolor: "action.hover" },
                borderBottom: indice < sugerencias.length - 1 ? "1px solid #f0f0f0" : "none",
              }}
            >
              <Typography variant="body2" fontWeight={500} noWrap>
                {opcion.corto || opcion.completo}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
                sx={{ display: "block" }}
              >
                {opcion.completo}
              </Typography>
            </Box>
          ))}
        </Paper>
      )}
    </Box>
  )
}
