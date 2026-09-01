import { useCallback, useEffect, useMemo, useState } from "react"
import { Alert, Box, CircularProgress, Container } from "@mui/material"
import { useNavigate, useParams } from "react-router-dom"
import { format, parseISO } from "date-fns"

import EditTripHeader from "../../../components/EditTripForm/EditTripHeader"
import ModalsContainer from "../../../components/EditTripForm/ModalsContainer"
import StageList from "../../../components/EditTripForm/StageList"
import InvoiceModal from "../../../components/InvoiceModal"
import GeneralTripInfo from "../../../components/trip-form/GeneralTripInfo"
import GeneralTripInfoComplete from "../../../components/trip-form/GeneralTripInfoComplete"

import { useCompanias, useCrearCompania } from "../../../entities/company"
import { useConductoresActivos, useConductoresActivosCompletos } from "../../../entities/driver"
import { useCajasActivas, useCajasActivasCompletas, useCajasExternasActivas, useCrearCajaExterna } from "../../../entities/trailer"
import {
  etapasDesdeApi,
  guardarInvoices,
  useGuardarViajeUpcoming,
  useViajeUpcoming,
} from "../../../entities/trip"
import { useCamionesActivos, useCamionesActivosCompletos } from "../../../entities/truck"
import { useBodegas, useCrearBodega } from "../../../entities/warehouse"
import { notify } from "../../../shared/ui"
import { initialBorderCrossingDocs, NORMAL_TRIP_DOCS_BY_COUNTRY } from "../../../utils/tripFormConstants"
import { admiteFacturas, ajustesDe, estadoPorCi, pideVencimiento } from "../model/modos"
import { useEnlaceTransnacional } from "../model/useEnlaceTransnacional"

const VIAJE_EN_BLANCO = {
  trip_number: "",
  driver_id: "",
  driver_id_second: "",
  driver_nombre: "",
  driver_second_nombre: "",
  truck_id: "",
  truck_unidad: "",
  caja_id: "",
  caja_no_caja: "",
  caja_externa_id: "",
  caja_externa_no_caja: "",
  return_date: null,
  status: "",
  country_code: "",
}

const TRANSNACIONAL_EN_BLANCO = {
  is_transnational: "0",
  transnational_number: "",
  movement_number: "",
}

const CAMPOS_CON_FORMATO_PROPIO = ["status", "trip_number", "return_date"]

/**
 * La plantilla de documentos de una etapa, según su tipo y el país del viaje.
 *
 * @param {string} tipoEtapa `borderCrossing` o `normalTrip`.
 * @param {string} pais País del viaje.
 * @returns {object} Los tipos de documento admitidos.
 */
function plantillaDocumentos(tipoEtapa, pais) {
  if (tipoEtapa === "borderCrossing") return { ...initialBorderCrossingDocs }
  if (tipoEtapa === "normalTrip") return { ...(NORMAL_TRIP_DOCS_BY_COUNTRY[pais] || {}) }
  return {}
}

/**
 * Una fecha en el formato de la API, o `null`.
 *
 * @param {(Date|null)} fecha La fecha.
 * @returns {(string|null)} La fecha como `yyyy-MM-dd`.
 */
const fechaApi = (fecha) => (fecha ? format(fecha, "yyyy-MM-dd") : null)

/**
 * Edición de un viaje ya en curso, con sus etapas, documentos y paradas.
 *
 * Hay dos pantallas que hacen esto y eran **el mismo archivo copiado**: 97 % de
 * líneas idénticas, medido. Lo único que las distinguía era qué se puede editar
 * —la completa no tiene restricciones y además enlaza viajes transnacionales—,
 * de qué catálogos se sirve y con qué operación guarda. Todo eso lo dice ahora
 * el modo.
 *
 * @param {object} props Propiedades del componente.
 * @param {string} props.modo Un valor de `MODO_EDICION`.
 * @returns {object} La pantalla renderizada.
 */
export function EditorViaje({ modo }) {
  const { tripId } = useParams()
  const navigate = useNavigate()
  const ajustes = ajustesDe(modo)

  const [datosViaje, setDatosViaje] = useState(() => ({
    ...VIAJE_EN_BLANCO,
    ...(ajustes.editaTransnacional ? TRANSNACIONAL_EN_BLANCO : {}),
  }))
  const [etapas, setEtapas] = useState([])
  const [modoConductores, setModoConductores] = useState("individual")
  const [tipoCaja, setTipoCaja] = useState("interna")

  const [documentoEnModal, setDocumentoEnModal] = useState({
    stageIndex: null,
    docType: null,
    stopIndex: null,
  })
  const [modalDocumento, setModalDocumento] = useState(false)
  const [modalCajaExterna, setModalCajaExterna] = useState(false)
  const [modalFactura, setModalFactura] = useState(false)
  const [etapaParaFactura, setEtapaParaFactura] = useState(null)

  const { data: viaje, isLoading, error } = useViajeUpcoming(tripId)
  const guardarViaje = useGuardarViajeUpcoming()

  const conductoresNormales = useConductoresActivos()
  const conductoresCompletos = useConductoresActivosCompletos()
  const camionesNormales = useCamionesActivos()
  const camionesCompletos = useCamionesActivosCompletos()
  const cajasNormales = useCajasActivas()
  const cajasCompletas = useCajasActivasCompletas()

  const conductores = ajustes.catalogosCompletos ? conductoresCompletos : conductoresNormales
  const camiones = ajustes.catalogosCompletos ? camionesCompletos : camionesNormales
  const cajas = ajustes.catalogosCompletos ? cajasCompletas : cajasNormales

  const cajasExternas = useCajasExternasActivas()
  const companias = useCompanias()
  const bodegas = useBodegas()

  const crearCompania = useCrearCompania()
  const crearBodega = useCrearBodega()
  const crearCajaExterna = useCrearCajaExterna()

  useEffect(() => {
    if (!viaje?.trip) return
    const { trip } = viaje

    setDatosViaje({
      ...VIAJE_EN_BLANCO,
      trip_number: trip.trip_number || "",
      driver_id: trip.driver_id || "",
      driver_id_second: trip.driver_id_second || "",
      driver_nombre: trip.driver_nombre || "",
      driver_second_nombre: trip.driver_second_nombre || "",
      truck_id: trip.truck_id || "",
      truck_unidad: trip.truck_unidad || "",
      caja_id: trip.caja_id || "",
      caja_no_caja: trip.caja_no_caja || "",
      caja_externa_id: trip.caja_externa_id || "",
      caja_externa_no_caja: trip.caja_externa_no_caja || "",
      return_date: trip.return_date ? parseISO(trip.return_date) : null,
      status: trip.status || "In Transit",
      country_code: trip.country_code || "",
      ...(ajustes.editaTransnacional
        ? {
            is_transnational: trip.is_transnational || "0",
            transnational_number: trip.transnational_number || "",
            movement_number: trip.movement_number || "",
          }
        : {}),
    })

    setModoConductores(trip.driver_id_second ? "team" : "individual")
    setTipoCaja(trip.caja_externa_id ? "externa" : "interna")

    setEtapas(
      etapasDesdeApi(viaje.etapas, {
        plantillaDocumentos,
        parsearFecha: parseISO,
        pais: trip.country_code,
      }),
    )
  }, [viaje, ajustes.editaTransnacional])

  useEffect(() => {
    if (error) notify.error(error)
  }, [error])

  const cambiarCampo = useCallback((campo, valor) => {
    setDatosViaje((previos) => ({ ...previos, [campo]: valor }))
  }, [])

  const enlace = useEnlaceTransnacional({
    activo: ajustes.editaTransnacional,
    datosViaje,
    anioViaje: viaje?.trip?.trip_year,
    enlazadoAlCargar: Boolean(viaje?.trip?.transnational_number),
    onCambio: cambiarCampo,
  })

  const cambiarModoConductores = (nuevo) => {
    setModoConductores(nuevo)
    if (nuevo === "individual") {
      cambiarCampo("driver_id_second", "")
      cambiarCampo("driver_second_nombre", "")
    }
  }

  const cambiarTipoCaja = (nuevo) => {
    setTipoCaja(nuevo)
    cambiarCampo(nuevo === "interna" ? "caja_externa_id" : "caja_id", "")
  }

  const cambiarEtapa = (indice, campo, valor) => {
    setEtapas((previas) => {
      const copia = [...previas]
      copia[indice] = { ...copia[indice], [campo]: valor }
      if (campo === "ci_number" && copia[indice].stageType === "borderCrossing") {
        copia[indice].estatus = estadoPorCi(valor)
      }
      return copia
    })
  }

  const cambiarParada = (iEtapa, iParada, campo, valor) => {
    setEtapas((previas) => {
      const copia = [...previas]
      const paradas = [...copia[iEtapa].stops_in_transit]
      paradas[iParada] = { ...paradas[iParada], [campo]: valor }
      copia[iEtapa] = { ...copia[iEtapa], stops_in_transit: paradas }
      return copia
    })
  }

  const agregarParada = (indice) => {
    setEtapas((previas) => {
      const copia = [...previas]
      const paradas = [...(copia[indice].stops_in_transit || [])]
      paradas.push({
        stop_id: `new-stop-${Date.now()}`,
        location: "",
        stop_order: paradas.length + 1,
        bl_firmado_doc: null,
        time_of_delivery: "",
      })
      copia[indice] = { ...copia[indice], stops_in_transit: paradas }
      return copia
    })
  }

  const eliminarParada = async (iEtapa, iParada) => {
    if (!(await notify.confirmar({ titulo: "¿Eliminar Parada?" }))) return
    setEtapas((previas) => {
      const copia = [...previas]
      copia[iEtapa] = {
        ...copia[iEtapa],
        stops_in_transit: copia[iEtapa].stops_in_transit.filter((_, i) => i !== iParada),
      }
      return copia
    })
  }

  const agregarEtapa = (tipo) => {
    const nueva = {
      trip_stage_id: `new-stage-${Date.now()}`,
      stageType: tipo,
      invoice_number: "",
      origin: "",
      destination: "",
      estatus: tipo === "borderCrossing" ? "In Coming" : "In Transit",
      documentos: plantillaDocumentos(tipo, datosViaje.country_code),
      stops_in_transit: [],
      comments: "",
      loading_date: null,
      delivery_date: null,
      date_of_departure: null,
    }
    setEtapas((previas) =>
      [...previas, nueva].map((etapa, i) => ({ ...etapa, stage_number: i + 1 })),
    )
  }

  const eliminarEtapa = async (indice) => {
    if (etapas.length <= 1) return notify.aviso("Debe haber al menos una etapa.")
    if (!(await notify.confirmar({ titulo: "¿Eliminar Etapa?" }))) return
    setEtapas((previas) =>
      previas.filter((_, i) => i !== indice).map((etapa, i) => ({ ...etapa, stage_number: i + 1 })),
    )
  }

  const abrirModalDocumento = (tipoDocumento, iEtapa, iParada = null) => {
    setDocumentoEnModal({ stageIndex: iEtapa, docType: tipoDocumento, stopIndex: iParada })
    setModalDocumento(true)
  }

  const guardarDocumento = (datos) => {
    const { stageIndex, docType, stopIndex } = documentoEnModal

    setEtapas((previas) => {
      const copia = [...previas]
      const etapa = { ...copia[stageIndex] }

      const nuevo = {
        fileName: datos.fileName,
        vencimiento: datos.vencimiento,
        file: datos.file,
        hasNewFile: Boolean(datos.file),
        serverPath: null,
      }

      if (stopIndex !== null) {
        const paradas = [...etapa.stops_in_transit]
        nuevo.document_id = paradas[stopIndex][docType]?.document_id || null
        paradas[stopIndex] = { ...paradas[stopIndex], [docType]: nuevo }
        etapa.stops_in_transit = paradas
      } else {
        nuevo.document_id = etapa.documentos[docType]?.document_id || null
        etapa.documentos = { ...etapa.documentos, [docType]: nuevo }
      }

      copia[stageIndex] = etapa
      return copia
    })

    setModalDocumento(false)
  }

  const documentoActual = () => {
    const { stageIndex, docType, stopIndex } = documentoEnModal
    if (stageIndex === null || !etapas[stageIndex]) return null
    return stopIndex !== null
      ? etapas[stageIndex].stops_in_transit?.[stopIndex]?.[docType]
      : etapas[stageIndex].documentos[docType]
  }

  const abrirModalFactura = (indice) => {
    if (!admiteFacturas(datosViaje.status)) {
      return notify.aviso(
        "Los Invoices solo se pueden generar para viajes En Ruta o Finalizados.",
        "No permitido",
      )
    }

    const etapa = etapas[indice]
    if (String(etapa.trip_stage_id).startsWith("new")) {
      return notify.aviso(
        "Esta etapa aún no está guardada en el servidor. Guarda el viaje antes de generar su invoice.",
        "Guarda el viaje primero",
      )
    }

    setEtapaParaFactura(etapa)
    setModalFactura(true)
  }

  const guardarFactura = ({ stageId, invoice_number, invoice_file_path }) => {
    setEtapas((previas) =>
      previas.map((etapa) =>
        String(etapa.trip_stage_id) === String(stageId)
          ? { ...etapa, invoice_number, invoice_file_path, has_invoice_generado: true }
          : etapa,
      ),
    )
  }

  const crearEnCatalogo = async (mutacion, nombre, iEtapa, campo, leerId, leerNombre) => {
    try {
      const creado = await mutacion.mutateAsync(nombre)
      const id = leerId(creado)
      if (iEtapa === null) cambiarCampo(campo, id)
      else cambiarEtapa(iEtapa, campo, id)
      notify.exito(`Creado: ${leerNombre(creado)}`)
      return { value: id, label: leerNombre(creado) }
    } catch (fallo) {
      notify.error(fallo)
      return undefined
    }
  }

  const guardarCajaExterna = async (datosCaja) => {
    try {
      const caja = await crearCajaExterna.mutateAsync(datosCaja)
      cambiarCampo("caja_externa_id", caja.caja_externa_id)
      cambiarCampo("caja_externa_no_caja", caja.no_caja)
      cambiarCampo("caja_id", "")
      setModalCajaExterna(false)
      notify.exito("Caja creada.")
    } catch (fallo) {
      notify.error(fallo)
    }
  }

  const guardarCambios = async () => {
    if (!datosViaje.driver_id || !datosViaje.truck_id) {
      return notify.aviso("Driver y Truck son obligatorios.")
    }

    const escalares = Object.fromEntries(
      Object.entries(datosViaje)
        .filter(([campo]) => !CAMPOS_CON_FORMATO_PROPIO.includes(campo))
        .map(([campo, valor]) => [campo, valor ?? ""]),
    )

    try {
      const respuesta = await guardarViaje.mutateAsync({
        tripId,
        op: ajustes.op,
        datosViaje: {
          ...escalares,
          trip_number: datosViaje.trip_number || "",
          return_date: datosViaje.return_date ? format(datosViaje.return_date, "yyyy-MM-dd") : "",
        },
        etapas,
        etapasIniciales: viaje?.etapas,
        formatearFecha: fechaApi,
      })

      try {
        await guardarInvoices({ tripId, etapas })
      } catch (fallo) {
        console.warn("No se pudieron guardar las facturas:", fallo)
      }

      await notify.exito(respuesta?.message || "Los cambios se guardaron.", "Guardado")
      navigate("/admin-trips")
    } catch (fallo) {
      notify.error(fallo)
    }
  }

  const opciones = useMemo(
    () => ({
      drivers: (conductores.data ?? []).map((d) => ({ value: d.driver_id, label: d.nombre })),
      trucks: (camiones.data ?? []).map((t) => ({ value: t.truck_id, label: t.unidad })),
      trailers: (cajas.data ?? []).map((c) => ({ value: c.caja_id, label: c.no_caja })),
      externalTrailers: (cajasExternas.data ?? []).map((c) => ({
        value: c.caja_externa_id,
        label: c.no_caja,
      })),
      companies: (companias.data ?? []).map((c) => ({
        value: c.company_id,
        label: c.nombre_compania,
      })),
      warehouses: (bodegas.data ?? []).map((w) => ({
        value: w.warehouse_id,
        label: w.nombre_almacen,
      })),
    }),
    [conductores.data, camiones.data, cajas.data, cajasExternas.data, companias.data, bodegas.data],
  )

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) return <Alert severity="error">{error.message}</Alert>

  const bloqueado = datosViaje.status === "Completed"
  const InfoGeneral = ajustes.editaTransnacional ? GeneralTripInfoComplete : GeneralTripInfo

  return (
    <Container maxWidth="xl" sx={{ py: 3, pb: 10 }}>
      <EditTripHeader
        formData={datosViaje}
        tripId={tripId}
        handleSaveChanges={guardarCambios}
        navigate={navigate}
      />

      <InfoGeneral
        formData={datosViaje}
        handleFormChange={cambiarCampo}
        tripMode={modoConductores}
        handleTripModeChange={cambiarModoConductores}
        trailerType={tipoCaja}
        handleTrailerTypeChange={cambiarTipoCaja}
        isFormDisabled={bloqueado}
        options={opciones}
        loadingStates={{
          drivers: conductores.isLoading,
          trucks: camiones.isLoading,
          trailers: cajas.isLoading,
          externalTrailers: cajasExternas.isLoading,
        }}
        setIsModalCajaExternaOpen={setModalCajaExterna}
        {...(ajustes.editaTransnacional ? enlace.props : {})}
      />

      <StageList
        etapas={etapas}
        handleStageChange={cambiarEtapa}
        eliminarEtapa={eliminarEtapa}
        agregarParadaEnRuta={agregarParada}
        eliminarParadaEnRuta={eliminarParada}
        handleStopChange={cambiarParada}
        abrirModal={abrirModalDocumento}
        isFormDisabled={bloqueado}
        options={opciones}
        creators={{
          createCompany: (valor, iEtapa, campo) =>
            crearEnCatalogo(
              crearCompania,
              valor,
              iEtapa,
              campo,
              (c) => c?.company_id,
              (c) => c?.nombre_compania,
            ),
          createWarehouse: (valor, iEtapa, campo) =>
            crearEnCatalogo(
              crearBodega,
              valor,
              iEtapa,
              campo,
              (w) => w?.warehouse_id,
              (w) => w?.nombre_almacen,
            ),
        }}
        loadingStates={{
          companies: companias.isLoading || crearCompania.isPending,
          warehouses: bodegas.isLoading || crearBodega.isPending,
        }}
        agregarNuevaEtapa={agregarEtapa}
        handleOpenInvoiceModal={abrirModalFactura}
      />

      <ModalsContainer
        modalAbierto={modalDocumento}
        setModalAbierto={setModalDocumento}
        setModalTarget={setDocumentoEnModal}
        handleGuardarDocumento={guardarDocumento}
        modalTarget={documentoEnModal}
        getCurrentDocValueForModal={documentoActual}
        mostrarFechaVencimientoModal={pideVencimiento(documentoEnModal.docType)}
        isModalCajaExternaOpen={modalCajaExterna}
        setIsModalCajaExternaOpen={setModalCajaExterna}
        handleSaveExternalCaja={guardarCajaExterna}
      />

      <InvoiceModal
        isOpen={modalFactura}
        onClose={() => setModalFactura(false)}
        stageData={etapaParaFactura}
        tripData={datosViaje}
        onSaveInvoice={guardarFactura}
      />
    </Container>
  )
}
