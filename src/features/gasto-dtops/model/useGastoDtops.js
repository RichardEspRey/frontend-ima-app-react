import { useMemo, useState } from "react"

import {
  CATALOGO_GASTOS,
  MONTOS_DTOPS,
  construirGastoDtops,
  montoDtopsValido,
  resolverClasificacionDtops,
  useCatalogoGastos,
  useCrearGasto,
} from "../../../entities/expense"
import { moneda } from "../../../shared/lib/formato"
import { useSesion } from "../../../shared/auth"
import { aTextoFecha, notify } from "../../../shared/ui"

/**
 * El valor que marca «otro monto» frente a los botones de importe fijo.
 *
 * @type {string}
 */
export const MONTO_MANUAL = "manual"

/**
 * Lleva el estado y el guardado del alta del gasto de un DTOPS.
 *
 * Pide los tres catálogos, resuelve con ellos la clasificación, guarda el
 * monto y la fecha que se capturan, y da de alta el gasto.
 *
 * @param {object} parametros Contexto del documento recién subido.
 * @param {File} parametros.archivo El DTOPS, que se guarda como ticket.
 * @param {string} parametros.viaje Número de viaje, que va como descripción.
 * @param {Function} parametros.onListo Se llama al registrar el gasto.
 * @returns {object} Lo que el modal necesita para pintarse y guardar.
 */
export function useGastoDtops({ archivo, viaje, onListo }) {
  const { usuario } = useSesion()
  const alta = useCrearGasto()

  const { data: tipos = [], isLoading: cargandoTipos } = useCatalogoGastos(CATALOGO_GASTOS.TIPOS)
  const { data: categorias = [], isLoading: cargandoCategorias } = useCatalogoGastos(
    CATALOGO_GASTOS.CATEGORIAS,
  )
  const { data: subcategorias = [], isLoading: cargandoSubcategorias } = useCatalogoGastos(
    CATALOGO_GASTOS.SUBCATEGORIAS,
  )

  const [montoElegido, setMontoElegido] = useState(MONTOS_DTOPS[0])
  const [montoManual, setMontoManual] = useState("")
  const [fecha, setFecha] = useState(() => new Date())

  const cargandoCatalogos = cargandoTipos || cargandoCategorias || cargandoSubcategorias

  const clasificacion = useMemo(
    () => resolverClasificacionDtops(tipos, categorias, subcategorias),
    [tipos, categorias, subcategorias],
  )

  const esManual = montoElegido === MONTO_MANUAL
  const monto = esManual ? montoManual : montoElegido
  const montoValido = montoDtopsValido(monto)
  const fechaTexto = aTextoFecha(fecha)

  const faltaClasificacion = !cargandoCatalogos && !clasificacion
  const puedeGuardar = Boolean(
    montoValido && fechaTexto && viaje && clasificacion && !alta.isPending,
  )

  const guardar = async () => {
    if (!puedeGuardar) return

    try {
      await alta.mutateAsync(
        construirGastoDtops({
          monto,
          fecha: fechaTexto,
          viaje,
          archivo,
          usuarioId: usuario?.id,
          clasificacion,
        }),
      )
      notify.discreto(`Gasto del DTOPS registrado por ${moneda(monto)}`)
      onListo()
    } catch (error) {
      notify.error(error)
    }
  }

  return {
    montos: MONTOS_DTOPS,
    montoElegido,
    elegirMonto: setMontoElegido,
    montoManual,
    setMontoManual,
    esManual,
    monto,
    montoValido,
    fecha,
    setFecha,
    creador: usuario?.name,
    cargandoCatalogos,
    faltaClasificacion,
    puedeGuardar,
    guardando: alta.isPending,
    guardar,
  }
}
