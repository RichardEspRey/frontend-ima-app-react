import { useMemo, useState } from "react"
import {
  ESTATUS_PUNTO,
  UNIDAD,
  agruparPorUnidad,
  useCrearPendiente,
  usePendientes,
  useResolverPuntos,
} from "../../../entities/maintenance-point"
import { useSesion } from "../../../shared/auth"
import { notify, usePaginacion } from "../../../shared/ui"
import { SIN_FILTROS_PENDIENTE, filtrarPendientes, hayFiltros as tieneFiltros } from "./filtros"

/**
 * El estado y las acciones de las reparaciones pendientes.
 *
 * La paginación cuenta **unidades**, no reparaciones: cada renglón es un camión
 * con todo lo que se le debe junto, y partir una unidad entre dos páginas haría
 * que alguien levante una orden sin ver el resto.
 *
 * @returns {object} Lo que la pantalla necesita pintar y disparar.
 */
export function usePanelPendientes() {
  const { usuario } = useSesion()

  const [lado, setLado] = useState(UNIDAD.CAMION)
  const [elegidos, setElegidos] = useState([])
  const [filtros, setFiltros] = useState(SIN_FILTROS_PENDIENTE)
  const [apertura, setApertura] = useState(null)
  const [altaAbierta, setAltaAbierta] = useState(false)

  const consulta = usePendientes(lado)
  const resolver = useResolverPuntos()
  const levantar = useCrearPendiente()

  const filtrados = useMemo(
    () => filtrarPendientes(consulta.data ?? [], filtros, lado),
    [consulta.data, filtros, lado],
  )

  const unidades = useMemo(() => agruparPorUnidad(filtrados, lado), [filtrados, lado])
  const paginacion = usePaginacion(unidades, { porPagina: 25 })

  const elegidosDe = (unidad) => unidad.reparaciones.filter((r) => elegidos.includes(r.id))

  const alternar = (id) =>
    setElegidos((previos) =>
      previos.includes(id) ? previos.filter((otro) => otro !== id) : [...previos, id],
    )

  const alternarUnidad = (unidad, encender) => {
    const ids = unidad.reparaciones.map((r) => r.id)
    setElegidos((previos) =>
      encender ? [...new Set([...previos, ...ids])] : previos.filter((id) => !ids.includes(id)),
    )
  }

  const cambiarFiltro = (campo, valor) => {
    setFiltros((previos) => ({ ...previos, [campo]: valor }))
    paginacion.irAPagina(0)
  }

  const descartar = async (unidad) => {
    const seleccion = elegidosDe(unidad)

    const confirmado = await notify.confirmar({
      titulo: `¿Descartar ${seleccion.length} reparación(es)?`,
      mensaje: "Dejan de aparecer en el reporte y no entran a ninguna orden.",
      confirmar: "Sí, descartar",
    })
    if (!confirmado) return

    try {
      await resolver.mutateAsync({
        items: seleccion.map((reparacion) => ({
          viaje_id: reparacion.viaje_id,
          categoria: reparacion.categoria,
          origen_tabla: reparacion.origen_tabla,
          origen_id: reparacion.origen_id,
          unidad_tipo: reparacion.unidad_tipo,
          truck_id: reparacion.truck_id,
          caja_id: reparacion.caja_id,
          descripcion: reparacion.descripcion,
        })),
        estatus: ESTATUS_PUNTO.DESCARTADO,
        usuarioId: usuario?.id,
      })
      setElegidos([])
    } catch (error) {
      notify.error(error)
    }
  }

  const guardarManual = async (datos) => {
    try {
      await levantar.mutateAsync({ ...datos, usuarioId: usuario?.id })
      setAltaAbierta(false)
      setLado(datos.unidadTipo)
    } catch (error) {
      notify.error(error)
    }
  }

  return {
    lado,
    cambiarLado: (valor) => {
      setLado(valor)
      setElegidos([])
      paginacion.irAPagina(0)
    },
    filtros,
    cambiarFiltro,
    limpiarFiltros: () => {
      setFiltros(SIN_FILTROS_PENDIENTE)
      paginacion.irAPagina(0)
    },
    hayFiltros: tieneFiltros(filtros),
    consulta,
    totalFiltrado: filtrados.length,
    totalUnidades: unidades.length,
    paginacion,
    elegidos,
    elegidosDe,
    alternar,
    alternarUnidad,
    descartar,
    apertura,
    abrirOrden: (unidad) =>
      setApertura({
        lado,
        unidadId: unidad.unidadId,
        etiquetaUnidad: unidad.etiqueta,
        pendientes: elegidosDe(unidad),
      }),
    cerrarOrden: () => setApertura(null),
    ordenCreada: (idOrden, gastos) => {
      setApertura(null)
      setElegidos([])
      notify.exito(
        gastos > 0
          ? `Se levantó la orden #${idOrden} y su gasto quedó en el Administrador de Gastos.`
          : `Se levantó la orden #${idOrden}.`,
        "Orden creada",
      )
    },
    altaAbierta,
    abrirAlta: () => setAltaAbierta(true),
    cerrarAlta: () => setAltaAbierta(false),
    guardarManual,
    guardando: resolver.isPending || levantar.isPending,
  }
}
