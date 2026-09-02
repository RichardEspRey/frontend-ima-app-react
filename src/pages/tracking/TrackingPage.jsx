import { useEffect, useMemo, useState } from "react"
import { Alert, Box, CircularProgress, Stack, Typography } from "@mui/material"

import TankConfigModal from "../../components/TankConfigModal"
import {
  ESPERA_BUSQUEDA_MS,
  MODO_PING,
  buscarLugares,
  filtrarFlota,
  puntoDesdeBusqueda,
  puntoDesdeMapa,
  puntoDesdeUnidad,
  useFlota,
  useGuardarTanque,
  useParadasEtapa,
  useTrazarRuta,
} from "../../entities/tracking"
import { HudPlegado, HudUnidad, ListaUnidades, MapaFlota, TrazadorRuta } from "../../features/tracking"
import { notify } from "../../shared/ui"
import { COLOR } from "../../shared/ui/tokens"

const AVISO_MODO = {
  [MODO_PING.MAPA]: "Haz clic en el mapa para colocar Ping 2",
  [MODO_PING.CAMION]: "Haz clic en otro camión para usarlo como Ping 2",
}

/**
 * Centro de comando: dónde está cada unidad, qué lleva y cuánto le falta.
 *
 * Junta tres cosas que se miran a la vez: la lista de la flota, el mapa con las
 * posiciones, y el detalle de la unidad elegida. Encima de eso hay un trazador
 * que mide la ruta entre una unidad y un segundo punto, que puede ser una
 * dirección, un clic en el mapa u otro camión.
 *
 * @returns {object} La pantalla renderizada.
 */
export default function TrackingPage() {
  const [busqueda, setBusqueda] = useState("")
  const [seleccionadaId, setSeleccionadaId] = useState(null)
  const [hudPlegado, setHudPlegado] = useState(false)
  const [configurando, setConfigurando] = useState(false)

  const [punto1, setPunto1] = useState(null)
  const [punto2, setPunto2] = useState(null)
  const [modoPunto2, setModoPunto2] = useState(null)
  const [trazo, setTrazo] = useState([])
  const [resumen, setResumen] = useState(null)

  const [textoLugar, setTextoLugar] = useState("")
  const [lugares, setLugares] = useState([])
  const [buscandoLugar, setBuscandoLugar] = useState(false)

  const { data: flota = [], isLoading, error } = useFlota()
  const guardarTanque = useGuardarTanque()
  const trazarRuta = useTrazarRuta()

  const seleccionada = useMemo(
    () => flota.find((unidad) => unidad.id === seleccionadaId) ?? null,
    [flota, seleccionadaId],
  )

  const { data: paradas = [], isFetching: paradasCargando } = useParadasEtapa(seleccionada)

  const visibles = useMemo(() => filtrarFlota(flota, busqueda), [flota, busqueda])

  useEffect(() => {
    if (!punto1?.id) return
    const actualizado = flota.find((unidad) => unidad.id === punto1.id)
    if (actualizado) setPunto1(puntoDesdeUnidad(actualizado))
  }, [flota, punto1?.id])

  useEffect(() => {
    if (!punto2?.id) return
    const actualizado = flota.find((unidad) => unidad.id === punto2.id)
    if (actualizado) setPunto2(puntoDesdeUnidad(actualizado))
  }, [flota, punto2?.id])

  useEffect(() => {
    const consulta = textoLugar.trim()
    if (!consulta) {
      setLugares([])
      return undefined
    }

    const control = new AbortController()
    const espera = setTimeout(async () => {
      setBuscandoLugar(true)
      try {
        setLugares(await buscarLugares({ texto: consulta, signal: control.signal }))
      } catch {
        setLugares([])
      } finally {
        setBuscandoLugar(false)
      }
    }, ESPERA_BUSQUEDA_MS)

    return () => {
      clearTimeout(espera)
      control.abort()
    }
  }, [textoLugar])

  const limpiarBusquedaLugar = () => {
    setTextoLugar("")
    setLugares([])
  }

  const seleccionarUnidad = (unidad) => {
    if (modoPunto2 === MODO_PING.CAMION) {
      if (unidad.id === punto1?.id) return
      setPunto2(puntoDesdeUnidad(unidad))
      setModoPunto2(null)
      return
    }

    setSeleccionadaId(unidad.id)
    setHudPlegado(false)
    setPunto1(puntoDesdeUnidad(unidad))
    setPunto2(null)
    setModoPunto2(null)
    setTrazo([])
    setResumen(null)
  }

  const limpiarRuta = () => {
    setPunto1(null)
    setPunto2(null)
    setModoPunto2(null)
    setTrazo([])
    setResumen(null)
    limpiarBusquedaLugar()
  }

  const cambiarModo = (modo) => {
    setModoPunto2((anterior) => (anterior === modo ? null : modo))
    limpiarBusquedaLugar()
  }

  const elegirLugar = (lugar) => {
    setPunto2(puntoDesdeBusqueda(lugar))
    setModoPunto2(null)
    limpiarBusquedaLugar()
  }

  const clicEnMapa = (latlng) => {
    setPunto2(puntoDesdeMapa(latlng))
    setModoPunto2(null)
  }

  const trazar = async () => {
    try {
      const { coordenadas, resumen: medidas } = await trazarRuta.mutateAsync({
        desde: punto1,
        hasta: punto2,
      })
      setTrazo(coordenadas)
      setResumen(medidas)
    } catch (fallo) {
      setTrazo([])
      setResumen(null)
      notify.aviso(fallo.message, "Sin ruta")
    }
  }

  const guardarTanqueDeUnidad = async (datos) => {
    try {
      await guardarTanque.mutateAsync(datos)
      notify.exito("Telemetría actualizada.")
    } catch (fallo) {
      notify.error(fallo)
    }
  }

  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ height: "calc(100vh - 70px)" }}>
        <CircularProgress />
        <Typography color="text.secondary">Sincronizando satélite y telemetría…</Typography>
      </Stack>
    )
  }

  return (
    <Box
      sx={{
        display: "flex",
        height: "calc(100vh - 70px)",
        width: "100%",
        overflow: "hidden",
        bgcolor: COLOR.LIENZO,
      }}
    >
      <Box
        sx={{
          width: { xs: 300, lg: 380 },
          bgcolor: COLOR.BLANCO,
          borderRight: `1px solid ${COLOR.BORDE}`,
          display: "flex",
          flexDirection: "column",
          zIndex: 2,
        }}
      >
        {error && (
          <Alert severity="error" sx={{ borderRadius: 0 }}>
            {error.message}
          </Alert>
        )}

        {punto1 && (
          <TrazadorRuta
            punto1={punto1}
            punto2={punto2}
            modo={modoPunto2}
            onModoChange={cambiarModo}
            busqueda={textoLugar}
            onBusquedaChange={setTextoLugar}
            resultados={lugares}
            buscando={buscandoLugar}
            onElegirLugar={elegirLugar}
            onTrazar={trazar}
            trazando={trazarRuta.isPending}
            resumen={resumen}
            onLimpiar={limpiarRuta}
          />
        )}

        {AVISO_MODO[modoPunto2] && (
          <Box sx={{ px: 1.5, py: 1, bgcolor: COLOR.AVISO_FONDO, borderBottom: `1px solid ${COLOR.AVISO_BORDE}` }}>
            <Typography variant="caption" color="#7b5e00">
              {AVISO_MODO[modoPunto2]}
            </Typography>
          </Box>
        )}

        <ListaUnidades
          unidades={visibles}
          busqueda={busqueda}
          onBusquedaChange={setBusqueda}
          seleccionada={seleccionada}
          punto1={punto1}
          punto2={punto2}
          onSeleccionar={seleccionarUnidad}
        />
      </Box>

      <Box sx={{ flex: 1, position: "relative" }}>
        {modoPunto2 === MODO_PING.MAPA && (
          <>
            <style>{`.leaflet-container { cursor: crosshair !important; }`}</style>
            <Box
              sx={{
                position: "absolute",
                top: 12,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 1000,
                bgcolor: "#4363d8",
                color: "white",
                px: 2.5,
                py: 1,
                borderRadius: 10,
                boxShadow: "0 2px 10px rgba(0,0,0,.3)",
                pointerEvents: "none",
              }}
            >
              <Typography variant="caption">Haz clic en el mapa para establecer Ping 2</Typography>
            </Box>
          </>
        )}

        <Box sx={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0, zIndex: 1 }}>
          <MapaFlota
            flota={flota}
            seleccionada={seleccionada}
            punto1={punto1}
            punto2={punto2}
            trazo={trazo}
            esperandoClic={modoPunto2 === MODO_PING.MAPA}
            onClicMapa={clicEnMapa}
            onSeleccionar={seleccionarUnidad}
          />
        </Box>

        {seleccionada &&
          (hudPlegado ? (
            <HudPlegado unidad={seleccionada} onDesplegar={() => setHudPlegado(false)} />
          ) : (
            <HudUnidad
              key={seleccionada.id}
              unidad={seleccionada}
              paradas={paradas}
              paradasCargando={paradasCargando}
              onGuardarTanque={guardarTanqueDeUnidad}
              onConfigurar={() => setConfigurando(true)}
              onPlegar={() => setHudPlegado(true)}
              onCerrar={() => setSeleccionadaId(null)}
            />
          ))}
      </Box>

      {seleccionada && configurando && (
        <TankConfigModal
          open={configurando}
          onClose={() => setConfigurando(false)}
          onSave={(truckId, galones, capacidad) =>
            guardarTanqueDeUnidad({ truckId, galones, capacidad })
          }
          truck={seleccionada}
        />
      )}
    </Box>
  )
}
