import { useCallback, useEffect, useState } from "react"
import { Alert, Button, CircularProgress, Container, Paper, Stack, Typography } from "@mui/material"
import { useNavigate, useParams } from "react-router-dom"
import { format, parseISO } from "date-fns"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"

import {
  PAIS,
  anioDosDigitos,
  etapasDesdeApi,
  guardarInvoices,
  paisOpuesto as calcularPaisOpuesto,
  siguienteMovimiento,
  useGuardarViajeUpcoming,
  useViajeUpcoming,
  useViajesTransnacionales,
  valorViajeTransnacional,
} from "../../entities/dispatch"
import { FormulariosViaje, PanelConfiguracionViaje } from "../../features/dispatch"
import { PageHeader, notify } from "../../shared/ui"
import { NORMAL_TRIP_DOCS_BY_COUNTRY, initialBorderCrossingDocs } from "../../utils/tripFormConstants"

const DATOS_VIAJE_VACIOS = {
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

const CAMPOS_CON_FORMATO_PROPIO = ["status", "trip_number", "return_date"]

/**
 * Los tipos de documento que admite una etapa según su tipo y el país.
 *
 * @param {string} tipoEtapa `borderCrossing` o `normalTrip`.
 * @param {string} pais País del viaje.
 * @returns {object} La plantilla de documentos, vacía si el tipo no la define.
 */
function plantillaDocumentos(tipoEtapa, pais) {
  if (tipoEtapa === "borderCrossing") return { ...initialBorderCrossingDocs }
  if (tipoEtapa === "normalTrip") return { ...(NORMAL_TRIP_DOCS_BY_COUNTRY[pais] || {}) }
  return {}
}

/**
 * Una fecha en el formato que espera la API, o `null` si no hay fecha.
 *
 * @param {(Date|null)} fecha La fecha a convertir.
 * @returns {(string|null)} La fecha como `yyyy-MM-dd`.
 */
const fechaApi = (fecha) => (fecha ? format(fecha, "yyyy-MM-dd") : null)

/**
 * Edición de un viaje ya creado que aún no sale (Up Coming).
 *
 * Carga el viaje con sus etapas, documentos y paradas, y guarda todo junto: los
 * campos del viaje, las etapas como JSON, los archivos nuevos y las etapas que
 * el usuario quitó. Las facturas se guardan aparte porque viven en otro
 * endpoint; que fallen no invalida lo demás, así que solo se avisa.
 *
 * @returns {object} La pantalla renderizada.
 */
export default function EditarViajeProximoPage() {
  const { tripId } = useParams()
  const navigate = useNavigate()

  const [pais, setPais] = useState("")
  const [anio, setAnio] = useState(new Date().getFullYear())
  const [numeroViaje, setNumeroViaje] = useState("")
  const [esTransnacional, setEsTransnacional] = useState(false)
  const [esContinuacion, setEsContinuacion] = useState(false)
  const [cruce, setCruce] = useState("")
  const [movimiento, setMovimiento] = useState("")
  const [pestana, setPestana] = useState(0)
  const [versionFormulario, setVersionFormulario] = useState(1)
  const [datosViaje, setDatosViaje] = useState(DATOS_VIAJE_VACIOS)
  const [etapas, setEtapas] = useState([])

  const anioApi = anioDosDigitos(anio)
  const paisOpuesto = pais ? calcularPaisOpuesto(pais) : ""

  const { data: viaje, isLoading, error } = useViajeUpcoming(tripId)
  const { data: viajesTransnacionales = [] } = useViajesTransnacionales(
    esTransnacional && esContinuacion ? paisOpuesto : "",
    anioApi,
  )
  const guardarViaje = useGuardarViajeUpcoming()

  useEffect(() => {
    if (!viaje?.trip) return
    const { trip } = viaje

    setPais(trip.country_code || "")
    setAnio(trip.trip_year ? 2000 + Number(trip.trip_year) : new Date().getFullYear())
    setNumeroViaje(trip.trip_number || "")
    setEsTransnacional(String(trip.is_transnational) === "1")
    setEsContinuacion(Boolean(trip.transnational_number))
    setCruce(trip.transnational_number || "")
    setMovimiento(trip.movement_number || "")
    if ((trip.country_code || "") === PAIS.MEXICO) setPestana(0)

    setDatosViaje({
      ...DATOS_VIAJE_VACIOS,
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
    })

    setEtapas(
      etapasDesdeApi(viaje.etapas, {
        plantillaDocumentos,
        parsearFecha: parseISO,
        pais: trip.country_code,
      }),
    )
  }, [viaje])

  useEffect(() => {
    if (error) notify.error(error)
  }, [error])

  useEffect(() => {
    if (pais === PAIS.MEXICO) setPestana(0)
  }, [pais])

  const guardarCambios = useCallback(async () => {
    const escalares = Object.fromEntries(
      Object.entries(datosViaje)
        .filter(([campo]) => !CAMPOS_CON_FORMATO_PROPIO.includes(campo))
        .map(([campo, valor]) => [campo, valor ?? ""]),
    )

    try {
      const respuesta = await guardarViaje.mutateAsync({
        tripId,
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
  }, [datosViaje, etapas, guardarViaje, navigate, tripId, viaje])

  const alCambiarTransnacional = (activo) => {
    setEsTransnacional(activo)
    if (!activo) {
      setEsContinuacion(false)
      setCruce("")
      setMovimiento("")
    }
  }

  const alCambiarContinuacion = (activo) => {
    setEsContinuacion(activo)
    if (!activo) setCruce("")
  }

  const alElegirCruce = (valor) => {
    setCruce(valor)
    const elegido = viajesTransnacionales.find((v) => valorViajeTransnacional(v) === valor)
    setMovimiento(siguienteMovimiento(elegido))
  }

  const propsFormulario = {
    key: `viaje-${versionFormulario}`,
    tripNumber: numeroViaje,
    countryCode: pais,
    tripYear: anio,
    isTransnational: esTransnacional,
    isContinuation: esContinuacion,
    transnationalNumber: cruce,
    movementNumber: movimiento,
    onSuccess: () => setVersionFormulario((version) => version + 1),
    initialTripData: viaje,
    etapas,
    setEtapas,
    formData: datosViaje,
    setFormData: setDatosViaje,
    onSaveOverride: guardarCambios,
  }

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <CircularProgress />
            <Typography>Cargando viaje...</Typography>
          </Stack>
        </Paper>
      </Container>
    )
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <PageHeader
        seccion="Despacho"
        titulo="Editar Viaje (Up Coming)"
        descripcion="Modifica los parámetros y guarda cambios."
        acciones={
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ fontWeight: 600, bgcolor: "white", borderColor: "#cbd5e1", color: "#475569" }}
          >
            Cancelar
          </Button>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.message}
        </Alert>
      )}

      <PanelConfiguracionViaje
        pais={pais}
        onPaisChange={setPais}
        anio={anio}
        onAnioChange={setAnio}
        numeroViaje={numeroViaje}
        anioDosDigitos={anioApi}
        esTransnacional={esTransnacional}
        onTransnacionalChange={alCambiarTransnacional}
        esContinuacion={esContinuacion}
        onContinuacionChange={alCambiarContinuacion}
        cruceSeleccionado={cruce}
        onCruceChange={alElegirCruce}
        viajesTransnacionales={viajesTransnacionales}
        paisOpuesto={paisOpuesto}
        movimiento={movimiento}
        onMovimientoChange={setMovimiento}
      />

      <FormulariosViaje
        pais={pais}
        pestana={pestana}
        onPestanaChange={setPestana}
        propsFormulario={propsFormulario}
      />
    </Container>
  )
}
