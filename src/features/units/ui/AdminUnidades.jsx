import { useMemo, useState } from "react"
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
} from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import SettingsIcon from "@mui/icons-material/Settings"
import ViewColumnIcon from "@mui/icons-material/ViewColumn"

import {
  ESTADO_CONDUCTOR,
  descriptorDe,
  estadoConductor,
  filtrarUnidades,
  requisitosVisibles,
  unidadEnBlanco,
  useCambiarVisibilidadColumna,
  useCrearRequisito,
  useDarDeBaja,
  useEliminarRequisito,
  useEliminarUnidad,
  useGuardarUnidad,
  useUnidades,
  validarUnidad,
} from "../../../entities/unit"
import { useSesion } from "../../../shared/auth"
import { PageHeader, notify } from "../../../shared/ui"
import { ModalBaja } from "./ModalBaja"
import { ModalColumnas } from "./ModalColumnas"
import { ModalRequisitos } from "./ModalRequisitos"
import { ModalUnidad } from "./ModalUnidad"
import { TablaUnidades } from "./TablaUnidades"

const REQUISITO_EN_BLANCO = { label: "", categoria: "USA", tipo: "file", tiene_vencimiento: true }
const BAJA_EN_BLANCO = { motivo: "", fecha: "", observaciones: "" }

// Constante de módulo, no un literal por render: es lo que evita que los
// `useMemo` que dependen de estas listas se recalculen en cada pintado.
const VACIO = []

/**
 * El administrador de un tipo de unidad: lista, expediente y configuración.
 *
 * Es la misma pantalla para camiones, cajas y conductores. Lo que cambia entre
 * las tres lo dice el descriptor del tipo, no una copia del archivo.
 *
 * @param {object} props Propiedades del componente.
 * @param {string} props.tipo Un valor de `TIPO_UNIDAD`.
 * @returns {object} La pantalla renderizada.
 */
export function AdminUnidades({ tipo }) {
  const descriptor = descriptorDe(tipo)
  const { esTotal: esAdministrador } = useSesion()

  const [busqueda, setBusqueda] = useState({})
  const [pestana, setPestana] = useState(0)
  const [ocultasLocales, setOcultasLocales] = useState([])

  const [unidadEnEdicion, setUnidadEnEdicion] = useState(null)
  const [archivos, setArchivos] = useState({})
  const [requisitoNuevo, setRequisitoNuevo] = useState(REQUISITO_EN_BLANCO)
  const [conductorEnBaja, setConductorEnBaja] = useState(null)
  const [datosBaja, setDatosBaja] = useState(BAJA_EN_BLANCO)
  const [modalRequisitos, setModalRequisitos] = useState(false)
  const [modalColumnas, setModalColumnas] = useState(false)

  const { data, isLoading, error } = useUnidades(tipo)
  const requisitos = data?.requisitos ?? VACIO
  const unidades = data?.unidades ?? VACIO

  const guardar = useGuardarUnidad(tipo)
  const eliminar = useEliminarUnidad(tipo)
  const baja = useDarDeBaja(tipo)
  const crearRequisito = useCrearRequisito(tipo)
  const eliminarRequisito = useEliminarRequisito(tipo)
  const cambiarColumna = useCambiarVisibilidadColumna(tipo)

  const porEstado = useMemo(() => {
    if (!descriptor.conBaja) return unidades
    const buscado = pestana === 0 ? ESTADO_CONDUCTOR.ACTIVO : ESTADO_CONDUCTOR.BAJA
    return unidades.filter((unidad) => estadoConductor(unidad) === buscado)
  }, [descriptor.conBaja, unidades, pestana])

  const visibles = useMemo(
    () => filtrarUnidades(porEstado, descriptor.busquedas, busqueda),
    [porEstado, descriptor.busquedas, busqueda],
  )

  const columnas = useMemo(
    () => requisitosVisibles(requisitos, ocultasLocales),
    [requisitos, ocultasLocales],
  )

  const activos = unidades.filter((u) => estadoConductor(u) === ESTADO_CONDUCTOR.ACTIVO).length
  const bajas = unidades.length - activos

  const abrirEditor = (unidad = null) => {
    setUnidadEnEdicion(unidad ? { ...unidad } : unidadEnBlanco(tipo))
    setArchivos({})
  }

  const guardarUnidad = async () => {
    const falta = validarUnidad(tipo, unidadEnEdicion)
    if (falta) return notify.aviso(falta)

    try {
      await guardar.mutateAsync({ unidad: unidadEnEdicion, requisitos, archivos })
      setUnidadEnEdicion(null)
      setArchivos({})
      notify.exito(`${descriptor.etiquetas.singular} guardado.`)
    } catch (fallo) {
      notify.error(fallo)
    }
  }

  const eliminarUnidad = async (id) => {
    const confirmado = await notify.confirmar({
      titulo: descriptor.etiquetas.confirmarBorrado,
      mensaje: "Esta acción no se puede deshacer.",
    })
    if (!confirmado) return

    try {
      await eliminar.mutateAsync({ id })
      notify.exito(`${descriptor.etiquetas.singular} eliminado.`)
    } catch (fallo) {
      notify.error(fallo)
    }
  }

  const confirmarBaja = async () => {
    if (!datosBaja.motivo || !datosBaja.fecha) {
      return notify.aviso("El motivo y la fecha son obligatorios.", "Faltan datos")
    }

    try {
      await baja.mutateAsync({ id: conductorEnBaja[descriptor.campoId], ...datosBaja })
      setConductorEnBaja(null)
      setDatosBaja(BAJA_EN_BLANCO)
      notify.exito("Conductor dado de baja.")
    } catch (fallo) {
      notify.error(fallo)
    }
  }

  const agregarRequisito = async () => {
    if (!requisitoNuevo.label) return notify.aviso("Asigna un nombre al requisito.")

    try {
      await crearRequisito.mutateAsync({ requisito: requisitoNuevo })
      setRequisitoNuevo(REQUISITO_EN_BLANCO)
      notify.exito("Requisito creado.")
    } catch (fallo) {
      notify.error(fallo)
    }
  }

  const quitarRequisito = async (requisito) => {
    const confirmado = await notify.confirmar({
      titulo: `¿Eliminar "${requisito.label}"?`,
      mensaje: "Los documentos ya subidos siguen guardados; lo que desaparece es la exigencia.",
    })
    if (!confirmado) return

    try {
      await eliminarRequisito.mutateAsync({ keyName: requisito.key_name })
    } catch (fallo) {
      notify.error(fallo)
    }
  }

  const alternarColumna = async (requisito) => {
    if (!descriptor.columnasPersistidas) {
      setOcultasLocales((previas) =>
        previas.includes(requisito.key_name)
          ? previas.filter((clave) => clave !== requisito.key_name)
          : [...previas, requisito.key_name],
      )
      return
    }

    try {
      await cambiarColumna.mutateAsync({
        keyName: requisito.key_name,
        oculto: !Number(requisito.oculto_en_tabla),
      })
    } catch (fallo) {
      notify.error(fallo)
    }
  }

  if (isLoading) {
    return (
      <Box p={5} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: "100vh", bgcolor: "#f8fafc" }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error.message}
        </Alert>
      )}

      <PageHeader
        seccion="IMA Manager"
        titulo={descriptor.etiquetas.titulo}
        descripcion={descriptor.etiquetas.descripcion}
        acciones={
          <>
            {esAdministrador && (
              <>
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<ViewColumnIcon />}
                  onClick={() => setModalColumnas(true)}
                >
                  Columnas
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<SettingsIcon />}
                  onClick={() => setModalRequisitos(true)}
                >
                  Requisitos
                </Button>
              </>
            )}
            <Button
              variant="contained"
              disableElevation
              startIcon={<AddIcon />}
              onClick={() => abrirEditor(null)}
              sx={{ bgcolor: "#0f172a", "&:hover": { bgcolor: "#334155" } }}
            >
              {descriptor.etiquetas.alta}
            </Button>
          </>
        }
      />

      <Paper
        elevation={0}
        sx={{ mb: 3, border: "1px solid #e2e8f0", borderRadius: 3, overflow: "hidden" }}
      >
        {descriptor.conBaja && (
          <Box sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "white" }}>
            <Tabs value={pestana} onChange={(evento, valor) => setPestana(valor)}>
              <Tab label={`Activos (${activos})`} />
              <Tab label={`Bajas (${bajas})`} />
            </Tabs>
          </Box>
        )}

        <Stack direction="row" spacing={2} sx={{ p: 2, flexWrap: "wrap" }}>
          {descriptor.busquedas.map((buscador) => (
            <TextField
              key={buscador.clave}
              label={buscador.etiqueta}
              size="small"
              variant="outlined"
              value={busqueda[buscador.clave] ?? ""}
              onChange={(e) => setBusqueda({ ...busqueda, [buscador.clave]: e.target.value })}
              sx={{ width: 250 }}
            />
          ))}
        </Stack>
      </Paper>

      <TablaUnidades
        descriptor={descriptor}
        unidades={visibles}
        requisitos={columnas}
        onEditar={abrirEditor}
        onEliminar={eliminarUnidad}
        onDarDeBaja={(conductor) => {
          setConductorEnBaja(conductor)
          setDatosBaja(BAJA_EN_BLANCO)
        }}
      />

      <ModalColumnas
        abierto={modalColumnas}
        onCerrar={() => setModalColumnas(false)}
        descriptor={descriptor}
        requisitos={requisitos}
        ocultasLocales={ocultasLocales}
        onAlternar={alternarColumna}
      />

      <ModalRequisitos
        abierto={modalRequisitos}
        onCerrar={() => setModalRequisitos(false)}
        descriptor={descriptor}
        requisitos={requisitos}
        nuevo={requisitoNuevo}
        onNuevoChange={setRequisitoNuevo}
        onCrear={agregarRequisito}
        onEliminar={quitarRequisito}
        guardando={crearRequisito.isPending}
      />

      {unidadEnEdicion && (
        <ModalUnidad
          abierto
          onCerrar={() => setUnidadEnEdicion(null)}
          descriptor={descriptor}
          requisitos={requisitos}
          unidad={unidadEnEdicion}
          onUnidadChange={setUnidadEnEdicion}
          archivos={archivos}
          onArchivosChange={setArchivos}
          onGuardar={guardarUnidad}
          guardando={guardar.isPending}
        />
      )}

      {conductorEnBaja && (
        <ModalBaja
          abierto
          onCerrar={() => setConductorEnBaja(null)}
          conductor={conductorEnBaja}
          datos={datosBaja}
          onDatosChange={setDatosBaja}
          onConfirmar={confirmarBaja}
          guardando={baja.isPending}
        />
      )}
    </Box>
  )
}
