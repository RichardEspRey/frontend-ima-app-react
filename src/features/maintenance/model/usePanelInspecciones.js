import { useMemo, useState } from "react"
import {
  ESTATUS_PUNTO,
  UNIDAD,
  useCompletarLado,
  useInspeccionesMtto,
  useNomenclaturas,
  usePuntos,
  useResolverPuntos,
} from "../../../entities/maintenance-point"
import { useSesion } from "../../../shared/auth"
import { notify, usePaginacion } from "../../../shared/ui"
import {
  SIN_FILTROS_INSPECCION,
  deLaPestana,
  filtrarInspecciones,
  hayFiltros as tieneFiltros,
} from "./filtros"

/**
 * El estado y las acciones de la lista de inspecciones.
 *
 * Existe para que `PanelInspecciones` sea solo JSX: aquí viven las consultas, la
 * selección de puntos, los filtros y la paginación. Nada de esto se repite en la
 * pantalla de pendientes, que tiene su propio controlador.
 *
 * @returns {object} Lo que la pantalla necesita pintar y disparar.
 */
export function usePanelInspecciones() {
  const { usuario } = useSesion()

  const [lado, setLado] = useState(UNIDAD.CAMION)
  const [verCompletadas, setVerCompletadas] = useState(false)
  const [abierta, setAbierta] = useState(null)
  const [seleccionados, setSeleccionados] = useState([])
  const [filtros, setFiltros] = useState(SIN_FILTROS_INSPECCION)
  const [apertura, setApertura] = useState(null)

  const consulta = useInspeccionesMtto(lado)
  const { data: nomenclaturas } = useNomenclaturas()
  const puntosConsulta = usePuntos(abierta, lado)

  const resolver = useResolverPuntos()
  const cerrar = useCompletarLado()

  const conNomenclatura = useMemo(
    () =>
      (consulta.data ?? []).map((fila) => ({
        ...fila,
        nomenclatura: nomenclaturas?.get(String(fila.viaje_id)) ?? "",
      })),
    [consulta.data, nomenclaturas],
  )

  const filtradas = useMemo(
    () => filtrarInspecciones(deLaPestana(conNomenclatura, verCompletadas), filtros, lado),
    [conNomenclatura, verCompletadas, filtros, lado],
  )

  const paginacion = usePaginacion(filtradas)

  const puntos = puntosConsulta.data ?? []
  const filaAbierta = conNomenclatura.find((fila) => fila.viaje_id === abierta)
  const elegidos = puntos.filter((punto) => seleccionados.includes(punto.clave))
  const sinResolver = puntos.filter((punto) => punto.estatus === ESTATUS_PUNTO.SIN_RESOLVER).length

  const reiniciar = () => {
    setAbierta(null)
    setSeleccionados([])
    paginacion.irAPagina(0)
  }

  const cambiarFiltro = (campo, valor) => {
    setFiltros((previos) => ({ ...previos, [campo]: valor }))
    reiniciar()
  }

  const abrir = (fila) => {
    setSeleccionados([])
    setAbierta((actual) => (actual === fila.viaje_id ? null : fila.viaje_id))
  }

  const alternar = (clave) =>
    setSeleccionados((previos) =>
      previos.includes(clave) ? previos.filter((otra) => otra !== clave) : [...previos, clave],
    )

  const alternarRubro = (claves, encender) =>
    setSeleccionados((previos) =>
      encender
        ? [...new Set([...previos, ...claves])]
        : previos.filter((clave) => !claves.includes(clave)),
    )

  const aplicar = async (estatus) => {
    const items = elegidos.map((punto) => ({
      cl_final_id: filaAbierta?.cl_final_id,
      viaje_id: abierta,
      categoria: punto.categoria,
      origen_tabla: punto.origen_tabla,
      origen_id: punto.origen_id,
      unidad_tipo: punto.unidad_tipo,
      truck_id: filaAbierta?.truck_id,
      caja_id: filaAbierta?.caja_id,
      descripcion: punto.texto,
    }))

    try {
      await resolver.mutateAsync({ items, estatus, usuarioId: usuario?.id })
      setSeleccionados([])
    } catch (error) {
      notify.error(error)
    }
  }

  const descartar = async () => {
    const confirmado = await notify.confirmar({
      titulo: `¿Descartar ${elegidos.length} punto(s)?`,
      mensaje: "No entran a ninguna orden ni quedan pendientes: se guardan como descartados.",
      confirmar: "Sí, descartar",
    })

    if (confirmado) aplicar(ESTATUS_PUNTO.DESCARTADO)
  }

  const completar = async () => {
    try {
      await cerrar.mutateAsync({
        clFinalId: filaAbierta?.cl_final_id,
        viajeId: abierta,
        lado,
        usuarioId: usuario?.id,
      })
      setAbierta(null)
    } catch (error) {
      notify.error(error, "Falta resolver puntos")
    }
  }

  return {
    lado,
    cambiarLado: (valor) => {
      setLado(valor)
      reiniciar()
    },
    verCompletadas,
    cambiarPestana: (valor) => {
      setVerCompletadas(valor)
      reiniciar()
    },
    filtros,
    cambiarFiltro,
    limpiarFiltros: () => {
      setFiltros(SIN_FILTROS_INSPECCION)
      reiniciar()
    },
    hayFiltros: tieneFiltros(filtros),
    consulta,
    filtradas,
    paginacion,
    abierta,
    abrir,
    cargandoPuntos: puntosConsulta.isLoading,
    puntos,
    filaAbierta,
    seleccionados,
    elegidos,
    alternar,
    alternarRubro,
    sinResolver,
    mandarAPendientes: () => aplicar(ESTATUS_PUNTO.EN_PENDIENTES),
    descartar,
    completar,
    apertura,
    abrirOrden: () =>
      setApertura({
        inspeccion: filaAbierta,
        lado,
        puntos: elegidos,
        unidadId: lado === UNIDAD.CAJA ? filaAbierta?.caja_id : filaAbierta?.truck_id,
        etiquetaUnidad: lado === UNIDAD.CAJA ? filaAbierta?.no_caja : filaAbierta?.no_camion,
      }),
    cerrarOrden: () => setApertura(null),
    ordenCreada: (idOrden, gastos) => {
      setApertura(null)
      setSeleccionados([])
      notify.exito(
        gastos > 0
          ? `Se levantó la orden #${idOrden} y su gasto quedó en el Administrador de Gastos.`
          : `Se levantó la orden #${idOrden}.`,
        "Orden creada",
      )
    },
    guardando: resolver.isPending || cerrar.isPending,
  }
}
