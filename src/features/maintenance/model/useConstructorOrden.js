import { useMemo, useState } from "react"
import { useCrearOrdenMtto } from "../../../entities/maintenance-point"
import { CATALOGO_GASTOS, crearGasto, useCatalogoGastos } from "../../../entities/expense"
import { useSesion } from "../../../shared/auth"
import { notify } from "../../../shared/ui"
import {
  TIPO_GASTO_MANTENIMIENTO,
  cuerpoDelGasto,
  gastoIncompleto,
  servicioDesdePendiente,
  servicioDesdePunto,
  servicioEnBlanco,
  totalDeOrden,
} from "./orden"

const hoy = () => new Date().toISOString().slice(0, 10)

/**
 * El estado y el guardado de la orden que se arma dentro de la pantalla.
 *
 * @param {object} apertura Con qué se abrió: puntos de una inspección o pendientes.
 * @param {Function} onCreada Se llama con `(idOrden, cuantosGastos)` al terminar.
 * @returns {object} Lo que el diálogo necesita pintar y disparar.
 */
export function useConstructorOrden(apertura, onCreada) {
  const { usuario } = useSesion()
  const { inspeccion, lado, puntos = [], pendientes = [], unidadId, etiquetaUnidad } = apertura

  const { data: categorias } = useCatalogoGastos(CATALOGO_GASTOS.CATEGORIAS)
  const { data: subcategorias } = useCatalogoGastos(CATALOGO_GASTOS.SUBCATEGORIAS)
  const crearOrden = useCrearOrdenMtto()

  const [fecha, setFecha] = useState(hoy())
  const [tipoCambio, setTipoCambio] = useState("")
  const [guardando, setGuardando] = useState(false)
  const [servicios, setServicios] = useState(() => [
    ...puntos.map((punto) => servicioDesdePunto(punto, inspeccion)),
    ...pendientes.map(servicioDesdePendiente),
  ])

  const categoriasMtto = useMemo(
    () => (categorias ?? []).filter((c) => String(c.id_tipo_gasto) === TIPO_GASTO_MANTENIMIENTO),
    [categorias],
  )

  const total = useMemo(() => totalDeOrden(servicios), [servicios])
  const clavesEnOrden = servicios.map((servicio) => servicio.clave)

  const cambiarServicio = (clave, actualizado) =>
    setServicios((previos) => previos.map((s) => (s.clave === clave ? actualizado : s)))

  const quitarServicio = (clave) =>
    setServicios((previos) => previos.filter((s) => s.clave !== clave))

  const agregarPendiente = (pendiente) =>
    setServicios((previos) => {
      const nuevo = servicioDesdePendiente(pendiente)
      return previos.some((s) => s.clave === nuevo.clave) ? previos : [...previos, nuevo]
    })

  const guardar = async () => {
    setGuardando(true)

    try {
      // Primero los gastos y al final la orden. Al revés, un gasto que truena
      // deja la orden levantada sin su comprobante; así, lo peor que queda es un
      // gasto en el Administrador de Gastos, que es real: se pagó.
      const conGastos = await Promise.all(
        servicios.map(async (servicio) => ({
          ...servicio,
          gastos: await Promise.all(
            servicio.gastos.map(async (gasto) => {
              const creado = await crearGasto(
                cuerpoDelGasto(gasto, { usuarioId: usuario?.id }),
              )
              return { ...gasto, id_gasto: creado.id_gasto }
            }),
          ),
        })),
      )

      const resultado = await crearOrden.mutateAsync({
        unidadTipo: lado,
        unidadId,
        fecha,
        tipoCambio,
        usuarioId: usuario?.id,
        servicios: conGastos.map((servicio) => ({
          tipo_reparacion: servicio.tipo_reparacion.trim(),
          tipo_mantenimiento: servicio.tipo_mantenimiento,
          origen_servicio: servicio.origen_servicio,
          costo_mano_obra: Number(servicio.costo_mano_obra) || 0,
          punto: servicio.punto,
          punto_id: servicio.punto_id,
          gastos: servicio.gastos.map((gasto) => ({
            id_gasto: gasto.id_gasto,
            conceptos: gasto.conceptos.map((concepto) => ({
              categoria_label: categoriasMtto.find(
                (c) => String(c.value) === String(concepto.categoria),
              )?.label,
              descripcion: concepto.descripcion.trim(),
              precio_unitario: Number(concepto.precio_unitario) || 0,
              cantidad: Number(concepto.cantidad) || 0,
            })),
          })),
        })),
      })

      const cuantos = conGastos.reduce((suma, servicio) => suma + servicio.gastos.length, 0)
      onCreada(resultado.id_orden, cuantos)
    } catch (error) {
      notify.error(error)
    } finally {
      setGuardando(false)
    }
  }

  return {
    lado,
    inspeccion,
    etiquetaUnidad,
    unidadId,
    fecha,
    setFecha,
    tipoCambio,
    setTipoCambio,
    servicios,
    clavesEnOrden,
    categorias: categoriasMtto,
    subcategorias: subcategorias ?? [],
    cambiarServicio,
    quitarServicio,
    agregarPendiente,
    agregarServicio: () => setServicios((previos) => [...previos, servicioEnBlanco()]),
    total,
    guardar,
    guardando,
    puedeGuardar:
      servicios.length > 0 &&
      servicios.every((servicio) => servicio.tipo_reparacion.trim()) &&
      !servicios.some((servicio) => servicio.gastos.some(gastoIncompleto)),
  }
}
