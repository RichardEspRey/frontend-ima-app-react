import { useMemo, useState } from "react"
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt"
import CloseIcon from "@mui/icons-material/Close"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import FmdGoodIcon from "@mui/icons-material/FmdGood"
import HistoryIcon from "@mui/icons-material/History"
import LocalShippingIcon from "@mui/icons-material/LocalShipping"
import PlaceIcon from "@mui/icons-material/Place"
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong"
import SaveIcon from "@mui/icons-material/Save"
import SearchIcon from "@mui/icons-material/Search"

import {
  millasTotales,
  recalcularTarifa,
  ubicacionVacia,
  useCotizaciones,
  useEliminarCotizacion,
  useGuardarCotizacion,
} from "../../entities/quote"
import { trazarRuta, ubicarLugar } from "../../entities/tracking"
import {
  BloqueResumen,
  BuscadorUbicacion,
  FilaResumen,
  HistorialCotizaciones,
  MapaCotizacion,
  ResumenCotizacion,
  dolares,
  millas as formatearMillas,
} from "../../features/cotizador"
import { notify } from "../../shared/ui"

const TITULO_SX = { textTransform: "uppercase", letterSpacing: 0.5 }

/**
 * Resuelve dónde está una ubicación, buscándola si hace falta.
 *
 * Si se eligió de la lista ya trae coordenadas; si se escribió a mano, se busca
 * en ese momento.
 *
 * @param {object} ubicacion La ubicación del formulario.
 * @returns {Promise.<{lat: number, lon: number}>} Dónde está.
 * @throws {Error} Si el campo está vacío o el lugar no existe.
 */
async function resolver(ubicacion) {
  if (!ubicacion.input.trim()) throw new Error("Hay campos de ubicación vacíos")
  return ubicacion.geo ?? ubicarLugar(ubicacion.input)
}

/**
 * Cotizador de viajes: cuánto se cobra por llevar una carga de A a B.
 *
 * Calcula las millas del recorrido —incluidas las que el camión hace vacío para
 * llegar a la carga, que también se cobran— y cruza tarifa, millas y precio por
 * milla: se puede entrar por cualquiera de los tres y los otros se ajustan.
 *
 * @returns {object} La pantalla renderizada.
 */
export default function CotizadorPage() {
  const [cifras, setCifras] = useState({ tarifa: "", millas: "", rate: "" })

  const [origen, setOrigen] = useState(ubicacionVacia)
  const [destino, setDestino] = useState(ubicacionVacia)
  const [origenCamion, setOrigenCamion] = useState(ubicacionVacia)
  const [paradas, setParadas] = useState([])

  const [trazoViaje, setTrazoViaje] = useState(null)
  const [trazoVacio, setTrazoVacio] = useState(null)
  const [puntos, setPuntos] = useState(null)
  const [millasViaje, setMillasViaje] = useState(null)
  const [millasVacias, setMillasVacias] = useState(null)

  const [calculando, setCalculando] = useState(false)
  const [error, setError] = useState("")

  const [historialAbierto, setHistorialAbierto] = useState(false)
  const [modalGuardar, setModalGuardar] = useState(false)
  const [nombre, setNombre] = useState("")

  const [vistaPrevia, setVistaPrevia] = useState(null)
  const [trazoPrevioViaje, setTrazoPrevioViaje] = useState(null)
  const [trazoPrevioVacio, setTrazoPrevioVacio] = useState(null)
  const [puntosPrevios, setPuntosPrevios] = useState(null)
  const [cargandoPrevia, setCargandoPrevia] = useState(false)

  const historial = useCotizaciones()
  const guardar = useGuardarCotizacion()
  const eliminar = useEliminarCotizacion()

  const cambiarCifra = (campo, valor) =>
    setCifras((previas) => recalcularTarifa(previas, campo, valor))

  const agregarParada = () => setParadas((previas) => [...previas, ubicacionVacia()])
  const quitarParada = (indice) =>
    setParadas((previas) => previas.filter((_, i) => i !== indice))
  const cambiarParada = (indice, ubicacion) =>
    setParadas((previas) => previas.map((p, i) => (i === indice ? ubicacion : p)))

  const etiquetas = useMemo(
    () => ({
      origen: origen.input,
      destino: destino.input,
      camion: origenCamion.input,
      paradas: paradas.filter((p) => p.input.trim()).map((p) => p.input),
    }),
    [origen.input, destino.input, origenCamion.input, paradas],
  )

  const calcular = async () => {
    if (!origen.input || !destino.input) {
      setError("Ingresa origen y destino para calcular millas.")
      return
    }

    setCalculando(true)
    setError("")
    setTrazoViaje(null)
    setTrazoVacio(null)
    setPuntos(null)
    setMillasViaje(null)
    setMillasVacias(null)

    try {
      const conTexto = paradas.filter((p) => p.input.trim() !== "")
      const [geoOrigen, geoDestino, ...geoParadas] = await Promise.all([
        resolver(origen),
        resolver(destino),
        ...conTexto.map(resolver),
      ])

      const ruta = await trazarRuta({
        desde: geoOrigen,
        hasta: geoDestino,
        intermedios: geoParadas,
      })
      setTrazoViaje(ruta.coordenadas)
      setMillasViaje(ruta.resumen.millas)

      let vacias = 0
      let geoCamion = null

      if (origenCamion.input.trim()) {
        geoCamion = await resolver(origenCamion)
        const rutaVacia = await trazarRuta({ desde: geoCamion, hasta: geoOrigen })
        vacias = rutaVacia.resumen.millas
        setTrazoVacio(rutaVacia.coordenadas)
        setMillasVacias(vacias)
      }

      setPuntos({
        origen: geoOrigen,
        paradas: geoParadas,
        destino: geoDestino,
        camion: geoCamion,
      })

      const total = millasTotales(ruta.resumen.millas, vacias)
      setCifras((previas) => recalcularTarifa(previas, "millas", total.toFixed(0)))
    } catch (fallo) {
      setError(fallo.message || "Error al calcular distancias.")
    } finally {
      setCalculando(false)
    }
  }

  const confirmarGuardado = async () => {
    const limpio = nombre.trim()
    if (!limpio) return

    try {
      await guardar.mutateAsync({
        nombre: limpio,
        origen,
        destino,
        origenCamion,
        paradas,
        millasViaje,
        millasVacias,
        millas: cifras.millas,
        tarifa: cifras.tarifa,
        rate: cifras.rate,
      })
      notify.exito("Cotización guardada.")
    } catch (fallo) {
      notify.error(fallo)
    } finally {
      setModalGuardar(false)
      setNombre("")
    }
  }

  const abrirCotizacion = async (cotizacion) => {
    setVistaPrevia(cotizacion)
    setHistorialAbierto(false)
    setTrazoPrevioViaje(null)
    setTrazoPrevioVacio(null)
    setPuntosPrevios(null)
    setCargandoPrevia(true)

    try {
      const geoParadas = cotizacion.paradas.filter((p) => p.geo).map((p) => p.geo)
      const ruta = await trazarRuta({
        desde: cotizacion.origen.geo,
        hasta: cotizacion.destino.geo,
        intermedios: geoParadas,
      })
      setTrazoPrevioViaje(ruta.coordenadas)

      if (cotizacion.origenCamion?.geo) {
        const rutaVacia = await trazarRuta({
          desde: cotizacion.origenCamion.geo,
          hasta: cotizacion.origen.geo,
        })
        setTrazoPrevioVacio(rutaVacia.coordenadas)
      }

      setPuntosPrevios({
        origen: cotizacion.origen.geo,
        paradas: geoParadas,
        destino: cotizacion.destino.geo,
        camion: cotizacion.origenCamion?.geo ?? null,
      })
    } catch (fallo) {
      console.warn("No se pudo calcular la ruta de la cotización guardada:", fallo)
    } finally {
      setCargandoPrevia(false)
    }
  }

  const borrarCotizacion = async (id) => {
    try {
      await eliminar.mutateAsync(id)
      if (vistaPrevia?.id === id) setVistaPrevia(null)
    } catch (fallo) {
      notify.error(fallo)
    }
  }

  return (
    <Box sx={{ p: 3, bgcolor: "#f4f6f8", minHeight: "100vh" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Cotizador de viajes
          </Typography>
          <Box sx={{ width: 44, height: 3, bgcolor: "primary.main", mt: 0.75, borderRadius: 1 }} />
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<HistoryIcon />}
            onClick={() => {
              setHistorialAbierto(true)
              historial.refetch()
            }}
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: 1.5 }}
          >
            Historial
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={() => setModalGuardar(true)}
            disableElevation
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: 1.5 }}
          >
            Guardar
          </Button>
        </Stack>
      </Stack>

      <Box sx={{ display: "flex", gap: 2.5, alignItems: "flex-start", flexWrap: "wrap" }}>
        <Paper
          elevation={0}
          sx={{ flex: "0 0 300px", p: 3, borderRadius: 2, border: "1px solid #e0e0e0" }}
        >
          <Typography
            variant="subtitle2"
            fontWeight={700}
            color="text.secondary"
            sx={{ mb: 2, ...TITULO_SX }}
          >
            Ruta
          </Typography>

          <Stack spacing={2}>
            <BuscadorUbicacion
              etiqueta="Origen"
              placeholder="Ciudad o código postal"
              valor={origen}
              onChange={setOrigen}
              icono={<FmdGoodIcon sx={{ mr: 1, color: "success.main", fontSize: 18 }} />}
            />

            {paradas.map((parada, indice) => (
              <Stack key={indice} direction="row" spacing={0.5} alignItems="flex-start">
                <Box sx={{ flex: 1 }}>
                  <BuscadorUbicacion
                    etiqueta={`Parada ${indice + 1}`}
                    placeholder="Ciudad o código postal"
                    valor={parada}
                    onChange={(ubicacion) => cambiarParada(indice, ubicacion)}
                    icono={<PlaceIcon sx={{ mr: 1, color: "#f59e0b", fontSize: 18 }} />}
                  />
                </Box>
                <IconButton
                  size="small"
                  onClick={() => quitarParada(indice)}
                  sx={{ color: "error.light", mt: 0.5, flexShrink: 0 }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Stack>
            ))}

            <Button
              size="small"
              variant="outlined"
              startIcon={<AddLocationAltIcon />}
              onClick={agregarParada}
              sx={{
                textTransform: "none",
                alignSelf: "flex-start",
                borderStyle: "dashed",
                color: "#f59e0b",
                borderColor: "#f59e0b",
                "&:hover": { borderColor: "#d97706", borderStyle: "dashed" },
              }}
            >
              Agregar Parada
            </Button>

            <BuscadorUbicacion
              etiqueta="Destino"
              placeholder="Ciudad o código postal"
              valor={destino}
              onChange={setDestino}
              icono={<FmdGoodIcon sx={{ mr: 1, color: "error.main", fontSize: 18 }} />}
            />

            <BuscadorUbicacion
              etiqueta="Origen Camión"
              placeholder="Ciudad o CP — millas vacías"
              valor={origenCamion}
              onChange={setOrigenCamion}
              icono={<LocalShippingIcon sx={{ mr: 1, color: "primary.main", fontSize: 18 }} />}
            />

            <Button
              variant="contained"
              startIcon={
                calculando ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />
              }
              onClick={calcular}
              disabled={calculando}
              disableElevation
              sx={{ textTransform: "none", fontWeight: 600, borderRadius: 1.5 }}
            >
              {calculando ? "Calculando..." : "Buscar Millas"}
            </Button>

            {error && (
              <Typography variant="caption" color="error">
                {error}
              </Typography>
            )}
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Typography
            variant="subtitle2"
            fontWeight={700}
            color="text.secondary"
            sx={{ mb: 2, ...TITULO_SX }}
          >
            Cotización
          </Typography>

          <Stack spacing={2}>
            <TextField
              label="Tarifa ($)"
              type="number"
              value={cifras.tarifa}
              onChange={(e) => cambiarCifra("tarifa", e.target.value)}
              size="small"
              fullWidth
            />
            <TextField
              label="Millas"
              type="number"
              value={cifras.millas}
              onChange={(e) => cambiarCifra("millas", e.target.value)}
              size="small"
              fullWidth
            />
            <TextField
              label="Rate ($/mi)"
              type="number"
              value={cifras.rate}
              onChange={(e) => cambiarCifra("rate", e.target.value)}
              size="small"
              fullWidth
            />
          </Stack>
        </Paper>

        <MapaCotizacion
          trazoViaje={trazoViaje}
          trazoVacio={trazoVacio}
          puntos={puntos}
          etiquetas={etiquetas}
        />

        <ResumenCotizacion
          ubicaciones={{ origen, destino, origenCamion }}
          distancias={{ millasViaje, millasVacias }}
          cifras={cifras}
        />
      </Box>

      {vistaPrevia && (
        <Paper elevation={0} sx={{ mt: 2.5, p: 3, borderRadius: 2, border: "1px solid #e0e0e0" }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            sx={{ mb: 2 }}
          >
            <Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <ReceiptLongIcon sx={{ color: "primary.main" }} />
                <Typography variant="subtitle1" fontWeight={700}>
                  {vistaPrevia.nombre}
                </Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Guardada el {new Date(vistaPrevia.guardadaEn).toLocaleString("es-MX")}
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setVistaPrevia(null)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap", mb: 2 }}>
            <Box sx={{ flex: "1 1 220px" }}>
              <BloqueResumen titulo="Ruta">
                <FilaResumen etiqueta="Origen" valor={vistaPrevia.origen?.input} />
                {vistaPrevia.paradas
                  ?.filter((parada) => parada.input?.trim())
                  .map((parada, indice) => (
                    <FilaResumen
                      key={parada.input}
                      etiqueta={`Parada ${indice + 1}`}
                      valor={parada.input}
                    />
                  ))}
                <FilaResumen etiqueta="Destino" valor={vistaPrevia.destino?.input} />
                {vistaPrevia.origenCamion?.input && (
                  <FilaResumen etiqueta="Origen Camión" valor={vistaPrevia.origenCamion.input} />
                )}
              </BloqueResumen>
            </Box>

            <Box sx={{ flex: "1 1 220px" }}>
              <BloqueResumen titulo="Distancias">
                <FilaResumen
                  etiqueta="Millas de Viaje"
                  valor={formatearMillas(vistaPrevia.millasViaje)}
                />
                <FilaResumen
                  etiqueta="Millas Vacías"
                  valor={formatearMillas(vistaPrevia.millasVacias)}
                />
                {vistaPrevia.millasViaje != null && (
                  <FilaResumen
                    etiqueta="Total Millas"
                    valor={formatearMillas(
                      millasTotales(vistaPrevia.millasViaje, vistaPrevia.millasVacias),
                    )}
                    destacada
                  />
                )}
              </BloqueResumen>
            </Box>

            <Box sx={{ flex: "1 1 220px" }}>
              <BloqueResumen titulo="Cotización">
                <FilaResumen etiqueta="Tarifa" valor={dolares(vistaPrevia.tarifa)} />
                <FilaResumen etiqueta="Millas" valor={formatearMillas(vistaPrevia.millas)} />
                <FilaResumen
                  etiqueta="Rate"
                  valor={
                    vistaPrevia.rate ? `$${Number.parseFloat(vistaPrevia.rate).toFixed(4)}/mi` : "—"
                  }
                  destacada
                />
              </BloqueResumen>
            </Box>
          </Box>

          {cargandoPrevia && (
            <Stack alignItems="center" sx={{ py: 2 }}>
              <CircularProgress size={24} />
            </Stack>
          )}

          <MapaCotizacion
            clave={vistaPrevia.id}
            trazoViaje={trazoPrevioViaje}
            trazoVacio={trazoPrevioVacio}
            puntos={puntosPrevios}
            etiquetas={{
              origen: vistaPrevia.origen?.input,
              destino: vistaPrevia.destino?.input,
              camion: vistaPrevia.origenCamion?.input,
              paradas: vistaPrevia.paradas?.map((parada) => parada.input),
            }}
            alto={360}
            conMarco={false}
          />
        </Paper>
      )}

      <Dialog open={modalGuardar} onClose={() => setModalGuardar(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Guardar cotización</DialogTitle>
        <DialogContent>
          <TextField
            label="Nombre de la cotización"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            fullWidth
            autoFocus
            size="small"
            sx={{ mt: 1 }}
            onKeyDown={(e) => {
              if (e.key === "Enter") confirmarGuardado()
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalGuardar(false)} sx={{ textTransform: "none" }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            disableElevation
            onClick={confirmarGuardado}
            disabled={!nombre.trim() || guardar.isPending}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <HistorialCotizaciones
        abierto={historialAbierto}
        onCerrar={() => setHistorialAbierto(false)}
        cotizaciones={historial.data}
        cargando={historial.isFetching}
        error={historial.error ? "No se pudo cargar el historial." : ""}
        onElegir={abrirCotizacion}
        onEliminar={borrarCotizacion}
      />
    </Box>
  )
}
