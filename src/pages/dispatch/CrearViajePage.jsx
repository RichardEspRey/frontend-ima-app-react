import { useCallback, useEffect, useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Alert, Button, Container, IconButton } from "@mui/material"
import { useLocation, useNavigate } from "react-router-dom"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import CloseIcon from "@mui/icons-material/Close"

import { useCompanias } from "../../entities/company"
import {
  PAIS,
  anioDosDigitos,
  datosInicialesDesdePrograma,
  etapaInicialDesdePrograma,
  paisOpuesto as calcularPaisOpuesto,
  siguienteMovimiento,
  useEliminarProgramacion,
  useSiguienteNumero,
  useViajesTransnacionales,
  valorViajeTransnacional,
} from "../../entities/dispatch"
import { useEquipos } from "../../entities/team"
import { useBodegas } from "../../entities/warehouse"
import { FormulariosViaje, PanelConfiguracionViaje } from "../../features/dispatch"
import { PageHeader, notify } from "../../shared/ui"
import { COLOR } from "../../shared/ui/tokens"

const AVISO_PROGRAMACION =
  "El viaje se creó, pero no se pudo eliminar la programación aprobada. Elimínala manualmente desde el tab de Programación."

/**
 * Alta de un viaje: configuración general y el formulario del país elegido.
 *
 * Puede abrirse en blanco o desde una programación aprobada, que llega en el
 * estado de la navegación y precarga conductor, unidad, caja y primera etapa.
 * Cuando el viaje se crea a partir de una programación, esa programación se
 * elimina: ya se convirtió en viaje y dejarla duplica el trabajo del despacho.
 *
 * @returns {object} La pantalla renderizada.
 */
export default function CrearViajePage() {
  const navigate = useNavigate()
  const location = useLocation()

  const [programacion, setProgramacion] = useState(location.state?.presetTrip ?? null)

  const [pais, setPais] = useState("")
  const [anio, setAnio] = useState(new Date().getFullYear())
  const [equipo, setEquipo] = useState("")

  const [esTransnacional, setEsTransnacional] = useState(false)
  const [esContinuacion, setEsContinuacion] = useState(false)
  const [cruce, setCruce] = useState("")
  const [movimiento, setMovimiento] = useState("")

  const [pestana, setPestana] = useState(0)
  const [versionFormulario, setVersionFormulario] = useState(1)

  const anioApi = anioDosDigitos(anio)
  const paisOpuesto = pais ? calcularPaisOpuesto(pais) : ""

  const { data: companias } = useCompanias()
  const { data: bodegas } = useBodegas()
  const { data: equipos = [] } = useEquipos()
  const { data: numeroViaje = "" } = useSiguienteNumero(pais, anioApi)
  const { data: viajesTransnacionales = [] } = useViajesTransnacionales(
    esTransnacional && esContinuacion ? paisOpuesto : "",
    anioApi,
  )
  const eliminarProgramacion = useEliminarProgramacion()
  const clienteConsultas = useQueryClient()

  const datosIniciales = useMemo(
    () => datosInicialesDesdePrograma(programacion),
    [programacion],
  )

  const etapaInicial = useMemo(
    () => etapaInicialDesdePrograma(programacion, { companias, almacenes: bodegas }),
    [programacion, companias, bodegas],
  )

  useEffect(() => {
    if (pais === PAIS.MEXICO) setPestana(0)
    else if (pais === PAIS.USA && programacion) setPestana(1)
  }, [pais, programacion])

  const limpiarFormulario = useCallback(() => {
    clienteConsultas.invalidateQueries({ queryKey: ["dispatch"] })
    setEsTransnacional(false)
    setEsContinuacion(false)
    setCruce("")
    setMovimiento("")
    setEquipo("")
    setVersionFormulario((version) => version + 1)
  }, [clienteConsultas])

  const alCrearViaje = useCallback(async () => {
    if (programacion?.id) {
      try {
        await eliminarProgramacion.mutateAsync(programacion.id)
      } catch {
        notify.aviso(AVISO_PROGRAMACION, "Aviso")
      }
      setProgramacion(null)
    }
    limpiarFormulario()
  }, [programacion, eliminarProgramacion, limpiarFormulario])

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
    const elegido = viajesTransnacionales.find((viaje) => valorViajeTransnacional(viaje) === valor)
    setMovimiento(siguienteMovimiento(elegido))
  }

  const propsFormulario = {
    key: `viaje-${versionFormulario}`,
    teamId: equipo,
    tripNumber: numeroViaje,
    countryCode: pais,
    tripYear: anio,
    isTransnational: esTransnacional,
    isContinuation: esContinuacion,
    transnationalNumber: cruce,
    movementNumber: movimiento,
    onSuccess: alCrearViaje,
    initialFormDataOverrides: datosIniciales,
    initialStageOverrides: etapaInicial,
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <PageHeader
        seccion="Despacho"
        titulo="Crear Nuevo Viaje"
        descripcion="Configura los parámetros iniciales y selecciona el tipo de operación."
        acciones={
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/admin-trips")}
            sx={{ fontWeight: 600, bgcolor: "white", borderColor: COLOR.BORDE_FUERTE, color: COLOR.TEXTO_SUAVE }}
          >
            Volver a Viajes
          </Button>
        }
      />

      {programacion && (
        <Alert
          severity="info"
          sx={{ mb: 3 }}
          action={
            <IconButton size="small" onClick={() => setProgramacion(null)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          Datos precargados desde la programación de viaje:{" "}
          <strong>{programacion.nombre_compania}</strong>
          {programacion.destino ? ` → ${programacion.destino}` : ""}
          {programacion.salida ? ` — salida ${programacion.salida}` : ""}. Selecciona el país y
          confirma el resto de los datos.
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
        equipos={equipos}
        equipoSeleccionado={equipo}
        onEquipoChange={setEquipo}
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
