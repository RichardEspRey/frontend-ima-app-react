import { useEffect, useMemo, useState } from "react"
import { Alert, Box, Button, Stack, Tab, Tabs, Typography } from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import { useNavigate } from "react-router-dom"

import ModalCajaExterna from "../../components/ModalCajaExterna"
import { useCompanias, useCrearCompania } from "../../entities/company"
import {
  NUEVO_LAREDO,
  formularioDesdePrograma,
  posicionDeCamion,
  programacionEnBlanco,
  useEliminarProgramacion,
  useGuardarProgramacion,
  useProgramaciones,
  useTableroProgramacion,
  validarProgramacion,
} from "../../entities/schedule"
import { trazarRuta } from "../../entities/tracking"
import { useCrearCajaExterna } from "../../entities/trailer"
import {
  ACCION_VIAJE,
  PESTANA_PROGRAMACION,
  PESTANA_PROXIMOS,
  filtrosActivos,
  pestanaDeReemplazo,
  pestanasPermitidas,
  useAccionViaje,
  useViajes,
} from "../../entities/trip"
import InspectionModal from "../../features/inspections/ui/InspeccionModal"
import RoadRepairModal from "../../features/inspections/ui/ReparacionModal"
import {
  FiltrosViajes,
  MapaRutaCamion,
  ModalProgramacion,
  TablaProgramaciones,
  TablaViajes,
} from "../../features/trips-admin"
import { useAuthStore } from "../../store/useAuthStore"
import { useViajesFiltrosStore } from "../../store/useViajesFiltrosStore"
import { notify } from "../../shared/ui"
import { COLOR } from "../../shared/ui/tokens"

/**
 * Quiénes pueden abrir la edición sin restricciones.
 *
 * Es una lista de nombres, no un permiso: viene de antes de que existieran los
 * permisos por funcionalidad y sigue igual porque cambiarlo es una decisión de
 * negocio, no del refactor.
 *
 * @type {Set.<string>}
 */
const EDICION_ESPECIAL = new Set(["Blanca", "Angelica", "Israel", "Richard"])

const BOTON_OSCURO_SX = {
  bgcolor: COLOR.TINTA,
  fontWeight: 700,
  borderRadius: 2,
  px: 3,
  py: 1.1,
  textTransform: "none",
  boxShadow: "none",
  transition: "all 0.15s",
  "&:hover": { bgcolor: COLOR.TINTA_CLARA, boxShadow: "0 6px 16px rgba(15,23,42,0.22)" },
}

/**
 * Administrador de viajes: la pantalla central del módulo.
 *
 * Lista los viajes por etapa del ciclo —programados, próximos, en despacho, en
 * ruta y finalizados—, y desde aquí se avanza cada uno: dar salida, marcar casi
 * finalizado, finalizar, reactivar. Qué pestañas se ven depende de los permisos
 * de cada persona.
 *
 * @returns {object} La pantalla renderizada.
 */
export default function AdminViajesPage() {
  const navigate = useNavigate()
  const { userPermissions: permisos, user: usuario } = useAuthStore()

  const esAdmin =
    usuario?.tipo_usuario?.toLowerCase() === "admin" || usuario?.name === "Blanca"
  const puedeEdicionEspecial = EDICION_ESPECIAL.has(usuario?.name)
  const puedeFacturar = esAdmin || permisos?.viajes_invoice_fields === true

  const {
    tabValue: pestana,
    page: pagina,
    rowsPerPage: porPagina,
    showFilters: filtrosAbiertos,
    set: setEstado,
    setFiltro,
    limpiarFiltros,
    ...resto
  } = useViajesFiltrosStore()

  const filtros = useMemo(
    () => ({
      filterTrip: resto.filterTrip,
      filterDriver: resto.filterDriver,
      filterTruck: resto.filterTruck,
      filterTrailer: resto.filterTrailer,
      filterCompany: resto.filterCompany,
      filterOrigin: resto.filterOrigin,
      filterDestination: resto.filterDestination,
      filterDirection: resto.filterDirection,
      filterCI: resto.filterCI,
    }),
    [
      resto.filterTrip,
      resto.filterDriver,
      resto.filterTruck,
      resto.filterTrailer,
      resto.filterCompany,
      resto.filterOrigin,
      resto.filterDestination,
      resto.filterDirection,
      resto.filterCI,
    ],
  )

  const permitidas = useMemo(() => pestanasPermitidas(permisos), [permisos])
  const enProgramacion = pestana === PESTANA_PROGRAMACION

  const [modalProgramacion, setModalProgramacion] = useState(false)
  const [programacionEnEdicion, setProgramacionEnEdicion] = useState(null)
  const [formularioPrograma, setFormularioPrograma] = useState(programacionEnBlanco)
  const [tipoCaja, setTipoCaja] = useState("interna")
  const [modalCajaExterna, setModalCajaExterna] = useState(false)
  const [viajeEnReparacion, setViajeEnReparacion] = useState(null)
  const [viajeEnInspeccion, setViajeEnInspeccion] = useState(null)

  const [rutaSeleccionada, setRutaSeleccionada] = useState(null)
  const [trazo, setTrazo] = useState(null)
  const [posicionCamion, setPosicionCamion] = useState(null)
  const [cargandoRuta, setCargandoRuta] = useState(false)
  const [errorRuta, setErrorRuta] = useState("")

  const consulta = useMemo(
    () => ({ pestana, pagina, porPagina, filtros, usuario }),
    [pestana, pagina, porPagina, filtros, usuario],
  )

  const { data, isFetching, error } = useViajes(consulta, { habilitada: !enProgramacion })
  const accion = useAccionViaje()

  const tablero = useTableroProgramacion(enProgramacion)
  const programaciones = useProgramaciones(enProgramacion)
  const guardarPrograma = useGuardarProgramacion()
  const eliminarPrograma = useEliminarProgramacion()

  const companias = useCompanias()
  const crearCompania = useCrearCompania()
  const crearCajaExterna = useCrearCajaExterna()

  useEffect(() => {
    const reemplazo = pestanaDeReemplazo(permitidas, pestana)
    if (reemplazo !== null) setEstado({ tabValue: reemplazo })
  }, [permitidas, pestana, setEstado])

  useEffect(() => {
    if (enProgramacion) return
    setRutaSeleccionada(null)
    setTrazo(null)
    setPosicionCamion(null)
    setErrorRuta("")
  }, [enProgramacion])

  const opcionesCompania = useMemo(
    () => (companias.data ?? []).map((c) => ({ value: c.company_id, label: c.nombre_compania })),
    [companias.data],
  )

  const viajeParaModal = (viaje) =>
    viaje
      ? {
          trip_id: viaje.trip_id,
          formatted_trip: viaje.trip_number,
          operador: viaje.driver_nombre || "",
          truck_id: viaje.truck_id ? String(viaje.truck_id) : "",
        }
      : null

  const reparacionInicial = useMemo(() => viajeParaModal(viajeEnReparacion), [viajeEnReparacion])
  const inspeccionInicial = useMemo(() => viajeParaModal(viajeEnInspeccion), [viajeEnInspeccion])

  const ejecutar = async ({ accion: cual, tripId, extra, confirmacion, exito }) => {
    if (!tripId) return
    if (confirmacion && !(await notify.confirmar(confirmacion))) return

    try {
      const respuesta = await accion.mutateAsync({ accion: cual, tripId, extra })
      notify.exito(respuesta?.message || exito)
    } catch (fallo) {
      notify.error(fallo)
    }
  }

  const marcarCasiFinalizado = (tripId, numero) =>
    ejecutar({
      accion: ACCION_VIAJE.CASI_FINALIZADO,
      tripId,
      confirmacion: {
        titulo: '¿Marcar como "Casi Finalizado"?',
        mensaje: `Viaje #${numero} será marcado como "Casi Finalizado".`,
        peligroso: false,
      },
      exito: "Viaje marcado como casi finalizado.",
    })

  const finalizar = (tripId, numero) =>
    ejecutar({
      accion: ACCION_VIAJE.FINALIZAR,
      tripId,
      confirmacion: {
        titulo: "¿Finalizar Viaje?",
        mensaje: `Viaje #${numero} será completado.`,
      },
      exito: "Viaje finalizado.",
    })

  const darSalida = (tripId, numero) =>
    ejecutar({
      accion: ACCION_VIAJE.DAR_SALIDA,
      tripId,
      confirmacion: {
        titulo: "¿Confirmar salida?",
        mensaje: `El viaje #${numero} cambiará a "In Transit".`,
        peligroso: false,
      },
      exito: "Salida registrada.",
    })

  const eliminarViaje = (tripId, numero) =>
    ejecutar({
      accion: ACCION_VIAJE.ELIMINAR,
      tripId,
      confirmacion: {
        titulo: "¿Eliminar viaje?",
        mensaje: `El viaje #${numero} será eliminado permanentemente.`,
      },
      exito: "Viaje eliminado.",
    })

  const reactivar = async (tripId, numero) => {
    const enRuta = pestana === 2
    const tipo = enRuta
      ? (await notify.confirmar({
          titulo: "Reactivar Viaje",
          mensaje: `El viaje #${numero} será reactivado para Operadores.`,
          confirmar: "Operadores",
        }))
        ? "operadores"
        : null
      : await notify.elegir({
          titulo: "Reactivar Viaje",
          mensaje: "Selecciona el tipo de reactivación",
          opciones: [
            { valor: "admin", texto: "Administrativos" },
            { valor: "operadores", texto: "Operadores" },
          ],
        })

    if (!tipo) return

    await ejecutar({
      accion: ACCION_VIAJE.REACTIVAR,
      tripId,
      extra: { type: tipo },
      exito: "Viaje reactivado.",
    })
  }

  const abrirModalPrograma = (programacion = null) => {
    if (programacion) {
      const formulario = formularioDesdePrograma(programacion)
      setFormularioPrograma(formulario)
      setTipoCaja(formulario.caja_id.startsWith("e_") ? "externa" : "interna")
      setProgramacionEnEdicion(programacion.id)
    } else {
      setFormularioPrograma(programacionEnBlanco())
      setTipoCaja("interna")
      setProgramacionEnEdicion(null)
    }
    setModalProgramacion(true)
  }

  const cerrarModalPrograma = () => {
    setModalProgramacion(false)
    setFormularioPrograma(programacionEnBlanco())
    setTipoCaja("interna")
    setProgramacionEnEdicion(null)
  }

  const guardarProgramacion = async () => {
    const falta = validarProgramacion(formularioPrograma)
    if (falta) return notify.aviso(falta, "Campos requeridos")

    try {
      const respuesta = await guardarPrograma.mutateAsync({
        formulario: formularioPrograma,
        id: programacionEnEdicion,
      })
      await notify.exito(respuesta?.message || "Programación guardada.")
      cerrarModalPrograma()
    } catch (fallo) {
      notify.error(fallo)
    }
  }

  const borrarProgramacion = async (id) => {
    const confirmado = await notify.confirmar({
      titulo: "¿Eliminar?",
      mensaje: "Se eliminará este viaje programado.",
    })
    if (!confirmado) return

    try {
      await eliminarPrograma.mutateAsync(id)
      if (rutaSeleccionada === id) setRutaSeleccionada(null)
    } catch (fallo) {
      notify.error(fallo)
    }
  }

  const seleccionarRuta = async (programacion) => {
    if (rutaSeleccionada === programacion.id) {
      setRutaSeleccionada(null)
      setTrazo(null)
      setPosicionCamion(null)
      setErrorRuta("")
      return
    }

    const posicion = posicionDeCamion(programacion)
    if (!posicion) {
      return notify.aviso("Este camión no tiene una ubicación registrada.", "Sin ubicación")
    }

    setRutaSeleccionada(programacion.id)
    setPosicionCamion(posicion)
    setTrazo(null)
    setErrorRuta("")
    setCargandoRuta(true)

    try {
      const { coordenadas } = await trazarRuta({ desde: posicion, hasta: NUEVO_LAREDO })
      setTrazo(coordenadas)
    } catch (fallo) {
      setErrorRuta(fallo.message || "Error al calcular la ruta.")
    } finally {
      setCargandoRuta(false)
    }
  }

  const crearCompaniaDesdeSelector = async (nombre) => {
    try {
      const creada = await crearCompania.mutateAsync(nombre)
      setFormularioPrograma((previo) => ({ ...previo, company_id: creada.company_id }))
      notify.exito(`Creado: ${creada.nombre_compania}`)
      return { value: creada.company_id, label: creada.nombre_compania }
    } catch (fallo) {
      notify.error(fallo)
      return undefined
    }
  }

  const guardarCajaExterna = async (datos) => {
    try {
      const caja = await crearCajaExterna.mutateAsync(datos)
      setTipoCaja("externa")
      setFormularioPrograma((previo) => ({ ...previo, caja_id: `e_${caja.caja_externa_id}` }))
      setModalCajaExterna(false)
      notify.exito("Caja externa registrada.")
    } catch (fallo) {
      notify.error(fallo)
    }
  }

  if (permitidas.length === 0) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, minHeight: "100vh", bgcolor: COLOR.LIENZO }}>
        <Typography variant="h4" fontWeight={800} color={COLOR.TINTA} gutterBottom>
          Administrador de Viajes
        </Typography>
        <Alert severity="warning">No tienes privilegios de lectura en este módulo.</Alert>
      </Box>
    )
  }

  const programacionSeleccionada = (programaciones.data ?? []).find(
    (p) => p.id === rutaSeleccionada,
  )

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: "100vh", bgcolor: COLOR.LIENZO }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-end"
        mb={4}
        flexWrap="wrap"
        gap={2}
      >
        <Box>
          <Typography
            variant="overline"
            sx={{
              color: COLOR.TENUE,
              fontWeight: 700,
              letterSpacing: "0.12em",
              fontSize: "0.7rem",
              lineHeight: 1,
            }}
          >
            Viajes · Tiempo Real
          </Typography>
          <Typography
            variant="h4"
            fontWeight={800}
            color={COLOR.TINTA}
            letterSpacing="-0.02em"
            sx={{ mt: 0.25 }}
          >
            Administrador de Viajes
          </Typography>
          <Typography variant="body2" color={COLOR.APAGADO} sx={{ mt: 0.5 }}>
            Gestión y control de despachos, estatus y rutas en tiempo real.
          </Typography>
        </Box>

        {(esAdmin || permisos?.viajes_crear) && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/CrearViaje")}
            sx={BOTON_OSCURO_SX}
          >
            Crear Nuevo Viaje
          </Button>
        )}
      </Stack>

      <Box sx={{ mb: 3, display: "inline-flex", bgcolor: COLOR.RELLENO, borderRadius: 2.5, p: 0.5 }}>
        <Tabs
          value={pestana}
          onChange={(evento, valor) => setEstado({ tabValue: valor, page: 0 })}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          TabIndicatorProps={{ sx: { display: "none" } }}
          sx={{ minHeight: 0, "& .MuiTabs-flexContainer": { gap: 0.5 } }}
        >
          {permitidas.map((tab) => (
            <Tab
              key={tab.id}
              label={tab.etiqueta}
              value={tab.id}
              disableRipple
              sx={{
                minHeight: 36,
                minWidth: 0,
                px: 2.5,
                py: 1,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: "0.85rem",
                textTransform: "none",
                color: COLOR.APAGADO,
                transition: "background-color 0.15s, color 0.15s",
                "&.Mui-selected": { bgcolor: COLOR.TINTA, color: COLOR.BLANCO },
              }}
            />
          ))}
        </Tabs>
      </Box>

      {enProgramacion ? (
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="body2" color={COLOR.APAGADO}>
              {programaciones.isLoading
                ? "Cargando programaciones…"
                : `${programaciones.data?.length ?? 0} viaje${
                    programaciones.data?.length === 1 ? "" : "s"
                  } programado${programaciones.data?.length === 1 ? "" : "s"}`}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => abrirModalPrograma()}
              sx={BOTON_OSCURO_SX}
            >
              Programar Viaje
            </Button>
          </Stack>

          <TablaProgramaciones
            programaciones={programaciones.data}
            cargando={programaciones.isLoading}
            seleccionada={rutaSeleccionada}
            onSeleccionar={seleccionarRuta}
            onAprobar={(programacion) =>
              navigate("/CrearViaje", { state: { presetTrip: programacion } })
            }
            onEditar={abrirModalPrograma}
            onEliminar={borrarProgramacion}
          />

          {rutaSeleccionada && (
            <MapaRutaCamion
              unidad={programacionSeleccionada?.truck_unidad}
              posicionCamion={posicionCamion}
              trazo={trazo}
              cargando={cargandoRuta}
              error={errorRuta}
            />
          )}
        </Box>
      ) : (
        <>
          <FiltrosViajes
            filtros={filtros}
            onFiltroChange={(campo, valor) => setFiltro({ [campo]: valor })}
            onLimpiar={limpiarFiltros}
            abiertos={filtrosAbiertos}
            onAlternar={() => setEstado({ showFilters: !filtrosAbiertos })}
            activos={filtrosActivos(filtros)}
            puedeVerCi={puedeFacturar}
          />

          {error && (
            <Alert severity="error" sx={{ my: 2 }}>
              {error.message}
            </Alert>
          )}

          <TablaViajes
            viajes={data?.viajes}
            total={data?.total ?? 0}
            cargando={isFetching}
            vista={{
              conDocumentos: pestana === PESTANA_PROXIMOS || pestana === 1,
              proximos: pestana === PESTANA_PROXIMOS,
              despacho: pestana === 1,
              enRuta: pestana === 2,
              finalizados: pestana === 3,
              esAdmin,
              puedeEdicionEspecial,
              puedeFacturar,
            }}
            paginacion={{
              pagina,
              porPagina,
              onPaginaChange: (nueva) => setEstado({ page: nueva }),
              onPorPaginaChange: (nuevo) => setEstado({ rowsPerPage: nuevo, page: 0 }),
            }}
            acciones={{
              onEdit: (tripId) =>
                navigate(
                  pestana === PESTANA_PROXIMOS
                    ? `/edit-trip-upcoming/${tripId}`
                    : `/edit-trip/${tripId}`,
                ),
              onSummary: (tripId) => navigate(`/ResumenTrip/${tripId}`),
              onSpecialEdit: (tripId) => navigate(`/edit-trip-complete/${tripId}`),
              onDelete: eliminarViaje,
              onAlmostOver: marcarCasiFinalizado,
              onFinalize: finalizar,
              onReactivate: reactivar,
              onSalida: darSalida,
              onOpenRoadRepair: setViajeEnReparacion,
              onOpenInspection: setViajeEnInspeccion,
            }}
          />
        </>
      )}

      <ModalProgramacion
        abierto={modalProgramacion}
        onCerrar={cerrarModalPrograma}
        editando={programacionEnEdicion !== null}
        formulario={formularioPrograma}
        onCampoChange={(campo, valor) =>
          setFormularioPrograma((previo) => ({ ...previo, [campo]: valor }))
        }
        tipoCaja={tipoCaja}
        onTipoCajaChange={(nuevo) => {
          setTipoCaja(nuevo)
          setFormularioPrograma((previo) => ({ ...previo, caja_id: "" }))
        }}
        tablero={tablero.data}
        cargandoTablero={tablero.isLoading}
        opcionesCompania={opcionesCompania}
        cargandoCompanias={companias.isLoading || crearCompania.isPending}
        onCrearCompania={crearCompaniaDesdeSelector}
        onNuevaCajaExterna={() => setModalCajaExterna(true)}
        onGuardar={guardarProgramacion}
        guardando={guardarPrograma.isPending}
      />

      <ModalCajaExterna
        isOpen={modalCajaExterna}
        onClose={() => setModalCajaExterna(false)}
        onSave={guardarCajaExterna}
      />

      <RoadRepairModal
        open={Boolean(viajeEnReparacion)}
        onClose={() => setViajeEnReparacion(null)}
        onSuccess={() => setViajeEnReparacion(null)}
        initialTrip={reparacionInicial}
      />

      <InspectionModal
        open={Boolean(viajeEnInspeccion)}
        onClose={() => setViajeEnInspeccion(null)}
        onSuccess={() => setViajeEnInspeccion(null)}
        initialTrip={inspeccionInicial}
      />
    </Box>
  )
}
