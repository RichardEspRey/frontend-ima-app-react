import { useEffect, useMemo, useState } from "react"
import { useQueries, useQuery } from "@tanstack/react-query"

import { TIPO_REGISTRO, llaveResumen, obtenerResumen } from "../../../entities/expense"
import {
  LLAVE_MANTENIMIENTO,
  LLAVE_SIN_FALLAS,
  LLAVE_SIN_INSPECCION,
  obtenerInspeccionesSinFallas,
  obtenerNomenclaturas,
  obtenerViajesSinInspeccion,
  useRecibeAvisoInspeccion,
} from "../../../entities/maintenance-point"
import {
  avisosDeDespacho,
  avisosDeDiesel,
  avisosDeDocumentos,
  avisosDeProgramacion,
  avisosSinFallas,
  avisosSinInspeccion,
  corteDiario,
  recortarAvisos,
} from "../../../entities/notification"
import { LLAVE_PROGRAMACIONES, obtenerProgramaciones } from "../../../entities/schedule"
import { PESTANA_PROGRAMACION, obtenerViajes } from "../../../entities/trip"
import { PERMISOS, useSesion } from "../../../shared/auth"
import { intervaloSegunVentana, sondear } from "../../../shared/lib/sondeo"

/**
 * El `tabValue` de la pestaña Despacho de Viajes.
 *
 * @type {number}
 */
export const PESTANA_DESPACHO = 1

/**
 * Cada cuánto se revisa si ya dieron las 10:00 del corte de diesel.
 *
 * Revisar no cuesta una petición: solo se mira el reloj. Al servidor se le
 * pregunta una vez por corte.
 *
 * @type {number}
 */
export const INTERVALO_CORTE_MS = 60_000

/**
 * Cada cuánto se piden las inspecciones sin fallas y los viajes sin inspección.
 *
 * @type {number}
 */
export const INTERVALO_MANTENIMIENTO_MS = 5 * 60_000

/**
 * Cada cuánto se piden las programaciones y los viajes en despacho.
 *
 * @type {number}
 */
export const INTERVALO_VIAJES_MS = 2 * 60_000

/**
 * Lo mismo que {@link INTERVALO_VIAJES_MS}, con la ventana oculta.
 *
 * @type {number}
 */
export const INTERVALO_VIAJES_OCULTA_MS = 5 * 60_000

/**
 * Dónde guarda el navegador cuándo vio esta persona cada programación.
 *
 * @param {(string|number)} idUsuario Identificador de la persona.
 * @returns {string} La llave de `localStorage`.
 */
export const llaveProgramacionesVistas = (idUsuario) => `avisos-programacion-${idUsuario}`

/**
 * Dónde guarda el navegador los documentos ya vistos de los viajes en despacho.
 *
 * @param {(string|number)} idUsuario Identificador de la persona.
 * @returns {string} La llave de `localStorage`.
 */
export const llaveDocumentosVistos = (idUsuario) => `avisos-documentos-${idUsuario}`

const leer = (llave, porDefecto) => {
  try {
    return JSON.parse(localStorage.getItem(llave) || "null") ?? porDefecto
  } catch {
    return porDefecto
  }
}

const guardar = (llave, valor) => {
  try {
    localStorage.setItem(llave, JSON.stringify(valor))
  } catch {
    return
  }
}

/**
 * Trae las programaciones y las convierte en avisos fechados.
 *
 * @param {object} parametros Datos de la consulta.
 * @param {(string|number)} parametros.idUsuario De quién es la memoria de lo visto.
 * @param {AbortSignal} [parametros.signal] Señal de cancelación.
 * @returns {Promise.<Array.<object>>} Los avisos de programación.
 */
export async function consultarAvisosDeProgramacion({ idUsuario, signal }) {
  const llave = llaveProgramacionesVistas(idUsuario)
  const programaciones = await obtenerProgramaciones({ signal })
  const { avisos, vistas } = avisosDeProgramacion(programaciones, leer(llave, {}), new Date(), PESTANA_PROGRAMACION)
  guardar(llave, vistas)
  return avisos
}

/**
 * Trae los viajes en despacho y saca sus avisos: el viaje y sus documentos nuevos.
 *
 * Los avisos de documentos no existen en el servidor: salen de comparar contra
 * lo último que esta persona vio, y por eso se guardan en el navegador.
 *
 * @param {object} parametros Datos de la consulta.
 * @param {object} parametros.usuario Quién consulta.
 * @param {AbortSignal} [parametros.signal] Señal de cancelación.
 * @returns {Promise.<Array.<object>>} Los avisos de despacho y de documentos.
 */
export async function consultarAvisosDeDespacho({ usuario, signal }) {
  const llave = llaveDocumentosVistos(usuario.id)
  const { viajes } = await obtenerViajes({
    pestana: PESTANA_DESPACHO,
    pagina: 0,
    porPagina: 100,
    filtros: { filterDirection: "All" },
    usuario,
    signal,
  })

  const ahora = new Date()
  const guardado = leer(llave, { base: null, avisos: [] })
  const { avisos: nuevos, base } = avisosDeDocumentos(viajes, guardado.base, ahora, PESTANA_DESPACHO)
  const deDocumentos = recortarAvisos([...nuevos, ...(guardado.avisos ?? [])], ahora)
  guardar(llave, { base, avisos: deDocumentos })

  return [...avisosDeDespacho(viajes, PESTANA_DESPACHO), ...deDocumentos]
}

/**
 * El día del corte de diesel vigente, que cambia solo al dar las 10:00.
 *
 * @returns {{fecha: string, momento: Date}} El corte de `corteDiario`.
 */
function useCorteDeDiesel() {
  const [corte, setCorte] = useState(() => corteDiario(new Date()))

  useEffect(
    () =>
      sondear(
        () => {
          const actual = corteDiario(new Date())
          setCorte((previo) => (previo.fecha === actual.fecha ? previo : actual))
        },
        { visibleMs: INTERVALO_CORTE_MS, alIniciar: false },
      ),
    [],
  )

  return corte
}

/**
 * Los avisos que se calculan en el front con datos que la API ya devuelve.
 *
 * Son cuatro fuentes, cada una para quien le toca:
 *
 * - **Diesel**, para quien ve Gastos diesel: State pending y Fleet One pending
 *   acumulados, una vez al día a las 10:00 de Monterrey.
 * - **Mantenimiento**, para los suscritos a Inspecciones: las inspecciones sin
 *   fallas y los operadores con más de un viaje sin inspección.
 * - **Programación**, para quien ve esa pestaña: cada viaje programado.
 * - **Despacho**, para quien ve esa pestaña: cada viaje que entra y cada tanda
 *   de documentos que se le agrega.
 *
 * Lo usan el aviso emergente y la campana; comparten caché, así que montarlo dos
 * veces no duplica peticiones.
 *
 * @returns {{fuentes: Array.<{id: string, avisos: Array.<object>, cargados: boolean}>, avisos: Array.<object>}}
 *   Cada fuente por separado —para anunciar solo lo nuevo de cada una— y todos los avisos juntos.
 */
export function useAvisosDerivados() {
  const { usuario, can } = useSesion()
  const idUsuario = usuario?.id
  const conSesion = Boolean(idUsuario)

  const veDiesel = conSesion && can(PERMISOS.GASTOS_DIESEL)
  const veProgramacion = conSesion && can(PERMISOS.VIAJES_TAB_PROGRAMACION)
  const veDespacho = conSesion && can(PERMISOS.VIAJES_TAB_DESPACHO)
  const recibeInspecciones = useRecibeAvisoInspeccion(idUsuario)

  const corte = useCorteDeDiesel()
  const diesel = useQuery({
    queryKey: [...llaveResumen(TIPO_REGISTRO.DIESEL), "avisos", corte.fecha],
    queryFn: ({ signal }) => obtenerResumen({ tipo: TIPO_REGISTRO.DIESEL, signal }),
    select: (viajes) => avisosDeDiesel(viajes, corte),
    enabled: veDiesel,
    staleTime: Infinity,
    meta: { silencioso: true },
  })

  const [sinFallas, sinInspeccion] = useQueries({
    queries: [
      { queryKey: LLAVE_SIN_FALLAS, queryFn: ({ signal }) => obtenerInspeccionesSinFallas({ signal }) },
      { queryKey: LLAVE_SIN_INSPECCION, queryFn: ({ signal }) => obtenerViajesSinInspeccion({ signal }) },
    ].map((consulta) => ({
      ...consulta,
      enabled: recibeInspecciones,
      refetchInterval: INTERVALO_MANTENIMIENTO_MS,
      refetchIntervalInBackground: true,
      meta: { silencioso: true },
    })),
  })
  const { data: nomenclaturas } = useQuery({
    queryKey: [...LLAVE_MANTENIMIENTO, "nomenclaturas"],
    queryFn: ({ signal }) => obtenerNomenclaturas({ signal }),
    enabled: recibeInspecciones,
    staleTime: INTERVALO_MANTENIMIENTO_MS,
    meta: { silencioso: true },
  })

  const programacion = useQuery({
    queryKey: [...LLAVE_PROGRAMACIONES, "avisos", idUsuario],
    queryFn: ({ signal }) => consultarAvisosDeProgramacion({ idUsuario, signal }),
    enabled: veProgramacion,
    refetchInterval: intervaloSegunVentana(INTERVALO_VIAJES_MS, INTERVALO_VIAJES_OCULTA_MS),
    refetchIntervalInBackground: true,
    staleTime: 0,
    meta: { silencioso: true },
  })

  const despacho = useQuery({
    queryKey: ["viajes", "avisos-despacho", idUsuario],
    queryFn: ({ signal }) => consultarAvisosDeDespacho({ usuario, signal }),
    enabled: veDespacho,
    refetchInterval: intervaloSegunVentana(INTERVALO_VIAJES_MS, INTERVALO_VIAJES_OCULTA_MS),
    refetchIntervalInBackground: true,
    staleTime: 0,
    meta: { silencioso: true },
  })

  const deMantenimiento = useMemo(() => {
    if (!recibeInspecciones) return []
    const conNomenclatura = (sinFallas.data ?? []).map((fila) => ({
      ...fila,
      nomenclatura: nomenclaturas?.get(String(fila.viaje_id)) ?? "",
    }))
    return [...avisosSinFallas(conNomenclatura, new Date()), ...avisosSinInspeccion(sinInspeccion.data ?? [])]
  }, [recibeInspecciones, sinFallas.data, sinInspeccion.data, nomenclaturas])

  return useMemo(() => {
    const fuentes = [
      { id: "diesel", avisos: veDiesel ? (diesel.data ?? []) : [], cargados: veDiesel && diesel.isSuccess },
      {
        id: "mantenimiento",
        avisos: deMantenimiento,
        cargados: recibeInspecciones && sinFallas.isSuccess && sinInspeccion.isSuccess,
      },
      {
        id: "programacion",
        avisos: veProgramacion ? (programacion.data ?? []) : [],
        cargados: veProgramacion && programacion.isSuccess,
      },
      { id: "despacho", avisos: veDespacho ? (despacho.data ?? []) : [], cargados: veDespacho && despacho.isSuccess },
    ]
    return { fuentes, avisos: fuentes.flatMap((fuente) => fuente.avisos) }
  }, [
    veDiesel,
    diesel.data,
    diesel.isSuccess,
    deMantenimiento,
    recibeInspecciones,
    sinFallas.isSuccess,
    sinInspeccion.isSuccess,
    veProgramacion,
    programacion.data,
    programacion.isSuccess,
    veDespacho,
    despacho.data,
    despacho.isSuccess,
  ])
}
