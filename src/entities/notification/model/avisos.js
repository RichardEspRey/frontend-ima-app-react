/**
 * Zona horaria con la que se decide la hora de los avisos diarios.
 *
 * Es la de la oficina. Va fija para que el corte de las 10:00 no dependa del
 * reloj de MySQL —que corre en otra zona— ni del de la máquina de cada quien.
 *
 * @type {string}
 */
export const ZONA_AVISOS = "America/Monterrey"

/**
 * A qué hora, en {@link ZONA_AVISOS}, sale el aviso diario de diesel.
 *
 * @type {number}
 */
export const HORA_CORTE_DIESEL = 10

/**
 * Cuántos días se conserva un aviso en la campana.
 *
 * @type {number}
 */
export const DIAS_DE_AVISO_DERIVADO = 14

/**
 * Los tipos de aviso que se calculan en el front, sin tabla en el servidor.
 *
 * @readonly
 * @enum {string}
 */
export const TIPO_AVISO = {
  DIESEL: "diesel",
  MANTENIMIENTO: "mantenimiento",
  PROGRAMACION: "programacion",
  DESPACHO: "despacho",
  DOCUMENTOS: "documentos",
}

const MILISEGUNDOS_POR_DIA = 86400000
const MAXIMO_EN_DETALLE = 3

const dosDigitos = (n) => String(n).padStart(2, "0")
const entero = (valor) => parseInt(valor || 0, 10) || 0
const contar = (n, singular, plural) => `${n} ${n === 1 ? singular : plural}`
const juntar = (partes, separador = " · ") => partes.filter(Boolean).join(separador)

const resumirLista = (elementos) =>
  elementos.length <= MAXIMO_EN_DETALLE
    ? elementos.join(", ")
    : `${elementos.slice(0, MAXIMO_EN_DETALLE).join(", ")} y ${elementos.length - MAXIMO_EN_DETALLE} más`

/**
 * Escribe una fecha como las manda PHP, en la hora de la máquina.
 *
 * Los avisos calculados aquí se mezclan y se ordenan con los del servidor, así
 * que llevan el mismo formato de texto.
 *
 * @param {Date} fecha La fecha a escribir.
 * @returns {string} `AAAA-MM-DD HH:mm:ss`.
 *
 * @example
 * fechaLocal(new Date(2026, 10, 16, 10, 0, 0)) // "2026-11-16 10:00:00"
 */
export function fechaLocal(fecha) {
  return (
    `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())} ` +
    `${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}:${dosDigitos(fecha.getSeconds())}`
  )
}

/**
 * Qué marca el reloj de pared en una zona horaria.
 *
 * @param {Date} fecha El instante.
 * @param {string} [zona] La zona IANA.
 * @returns {{anio: number, mes: number, dia: number, hora: number, minuto: number, segundo: number}} El reloj de esa zona.
 */
export function relojEnZona(fecha, zona = ZONA_AVISOS) {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: zona,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(fecha)
      .map((parte) => [parte.type, parte.value]),
  )

  return {
    anio: Number(partes.year),
    mes: Number(partes.month),
    dia: Number(partes.day),
    hora: Number(partes.hour),
    minuto: Number(partes.minute),
    segundo: Number(partes.second),
  }
}

/**
 * El corte diario vigente: el de hoy si ya dieron las 10, o el de ayer.
 *
 * @param {Date} ahora El instante actual.
 * @param {object} [opciones] Ajustes del corte.
 * @param {string} [opciones.zona] Zona en la que se mide la hora.
 * @param {number} [opciones.hora] Hora del corte en esa zona.
 * @returns {{fecha: string, momento: Date}} El día del corte y el instante exacto en que ocurrió.
 *
 * @example
 * corteDiario(new Date("2026-11-16T15:59:59Z")).fecha // "2026-11-15": en Monterrey son las 9:59
 */
export function corteDiario(ahora, { zona = ZONA_AVISOS, hora = HORA_CORTE_DIESEL } = {}) {
  const reloj = relojEnZona(ahora, zona)
  const yaPaso = reloj.hora >= hora
  const dia = new Date(Date.UTC(reloj.anio, reloj.mes - 1, reloj.dia - (yaPaso ? 0 : 1)))
  const segundosDesdeElCorte =
    (reloj.hora - hora + (yaPaso ? 0 : 24)) * 3600 + reloj.minuto * 60 + reloj.segundo

  return {
    fecha: dia.toISOString().slice(0, 10),
    momento: new Date(ahora.getTime() - segundosDesdeElCorte * 1000),
  }
}

/**
 * Los avisos diarios de diesel: State pending y Fleet One pending acumulados.
 *
 * Sale uno por tipo y por día de corte; lo que está en ceros no avisa.
 *
 * @param {Array.<object>} viajes El resumen por viaje de `getAll_diesel`.
 * @param {{fecha: string, momento: Date}} corte El corte de {@link corteDiario}.
 * @returns {Array.<object>} Cero, uno o dos avisos.
 */
export function avisosDeDiesel(viajes, corte) {
  const creado = fechaLocal(corte.momento)
  const destino = { ruta: "/admin-diesel" }

  const resumen = (campo) => {
    const conPendientes = viajes.filter((viaje) => entero(viaje[campo]) > 0)
    return {
      viajes: conPendientes.length,
      total: conPendientes.reduce((suma, viaje) => suma + entero(viaje[campo]), 0),
    }
  }

  const state = resumen("state_pending_count")
  const fleet = resumen("fleetone_pending_count")
  const avisos = []

  if (state.total > 0) {
    avisos.push({
      id: `diesel-state-${corte.fecha}`,
      tipo: TIPO_AVISO.DIESEL,
      titulo: "State pending",
      subtitulo: `${contar(state.total, "estado pendiente", "estados pendientes")} en ${contar(state.viajes, "viaje", "viajes")}`,
      created_at: creado,
      destino,
    })
  }

  if (fleet.total > 0) {
    avisos.push({
      id: `diesel-fleetone-${corte.fecha}`,
      tipo: TIPO_AVISO.DIESEL,
      titulo: "Fleet One pending",
      subtitulo: `${contar(fleet.total, "ticket pendiente", "tickets pendientes")} en ${contar(fleet.viajes, "viaje", "viajes")}`,
      created_at: creado,
      destino,
    })
  }

  return avisos
}

/**
 * Un aviso por inspección reciente en la que el operador no reportó fallas.
 *
 * Avisa igual si el viaje llevaba caja o no.
 *
 * @param {Array.<object>} inspecciones Las inspecciones sin fallas, con `nomenclatura` si se conoce.
 * @param {Date} ahora Contra qué momento se mide la antigüedad.
 * @returns {Array.<object>} Los avisos de los últimos {@link DIAS_DE_AVISO_DERIVADO} días.
 */
export function avisosSinFallas(inspecciones, ahora) {
  const limite = fechaLocal(new Date(ahora.getTime() - DIAS_DE_AVISO_DERIVADO * MILISEGUNDOS_POR_DIA)).slice(0, 10)

  return inspecciones
    .filter((fila) => String(fila.fecha_creacion || "").slice(0, 10) >= limite)
    .map((fila) => ({
      id: `sin-fallas-${fila.cl_final_id}`,
      tipo: TIPO_AVISO.MANTENIMIENTO,
      titulo: `Inspección sin fallas ${fila.nomenclatura || fila.trip_number || ""}`.trim(),
      subtitulo: juntar([
        fila.no_camion ? `Camión ${fila.no_camion}` : "",
        fila.no_caja ? `Caja ${fila.no_caja}` : "",
        fila.operador,
      ]),
      created_at: fila.fecha_creacion,
      destino: { ruta: "/mantenimiento?pestana=inspecciones&sub=sin-fallas" },
    }))
}

const llaveDeOperador = (nombre) =>
  nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

/**
 * Un aviso por operador que acumula más de un viaje sin inspección.
 *
 * El identificador lleva la cuenta de viajes: cuando se suma otro, es un aviso
 * nuevo y vuelve a sonar.
 *
 * @param {Array.<object>} viajes Los viajes terminados sin inspección.
 * @returns {Array.<object>} Un aviso por operador con dos viajes o más.
 */
export function avisosSinInspeccion(viajes) {
  const porOperador = new Map()

  for (const viaje of viajes) {
    const operador = String(viaje.operador || "").trim()
    if (!operador) continue
    const llave = llaveDeOperador(operador)
    const grupo = porOperador.get(llave) ?? { operador, viajes: [] }
    grupo.viajes.push(viaje)
    porOperador.set(llave, grupo)
  }

  return [...porOperador]
    .filter(([, grupo]) => grupo.viajes.length > 1)
    .map(([llave, grupo]) => {
      const fechas = grupo.viajes.map((viaje) => String(viaje.creation_date || "")).sort()
      return {
        id: `sin-inspeccion-${llave}-${grupo.viajes.length}`,
        tipo: TIPO_AVISO.MANTENIMIENTO,
        titulo: "Viajes sin inspección",
        subtitulo: `${grupo.operador} · ${grupo.viajes.length} viajes`,
        detalle: resumirLista(grupo.viajes.map((viaje) => viaje.nomenclatura).filter(Boolean)),
        created_at: fechas[fechas.length - 1],
        destino: { ruta: "/mantenimiento?pestana=inspecciones&sub=sin-inspeccion" },
      }
    })
}

const horaCorta = (texto) => {
  const [fecha, hora = ""] = String(texto).split(/[ T]/)
  const [, mes, dia] = fecha.split("-")
  return mes && dia ? `${dia}/${mes}${hora ? ` ${hora.slice(0, 5)}` : ""}` : ""
}

/**
 * Un aviso por viaje programado.
 *
 * `programacion_trips` no guarda cuándo se creó cada renglón, así que la fecha
 * del aviso es la primera vez que esta persona lo vio; `vistas` es esa memoria.
 *
 * @param {Array.<object>} programaciones Lo que devuelve `Programacion_viajes.php`.
 * @param {object} vistas Fecha de primera vista por id de programación.
 * @param {Date} ahora El instante actual.
 * @param {number} pestana El `tabValue` de Programación, para abrirla desde el aviso.
 * @returns {{avisos: Array.<object>, vistas: object}} Los avisos y la memoria actualizada.
 */
export function avisosDeProgramacion(programaciones, vistas, ahora, pestana) {
  const ahoraLocal = fechaLocal(ahora)
  const nuevasVistas = {}

  const avisos = programaciones.map((una) => {
    const creado = vistas?.[una.id] || ahoraLocal
    nuevasVistas[una.id] = creado
    return {
      id: `programacion-${una.id}`,
      tipo: TIPO_AVISO.PROGRAMACION,
      titulo: "Viaje programado",
      subtitulo: juntar([
        una.nombre_compania || una.destino,
        una.truck_unidad ? `Camión ${una.truck_unidad}` : "",
        una.driver_nombre,
      ]),
      detalle: juntar([
        una.destino && una.nombre_compania ? una.destino : "",
        una.salida ? `Sale ${horaCorta(una.salida)}` : "",
      ]),
      created_at: creado,
      destino: { ruta: "/admin-trips", pestanaViajes: pestana },
    }
  })

  return { avisos, vistas: nuevasVistas }
}

/**
 * El nombre de un tipo de documento como se lee en pantalla.
 *
 * @param {string} tipo El `tipo_documento` del servidor.
 * @returns {string} En mayúsculas y sin guiones bajos.
 *
 * @example
 * nombreDeDocumento("orden_retiro") // "ORDEN RETIRO"
 */
export function nombreDeDocumento(tipo) {
  return String(tipo || "").replace(/_/g, " ").trim().toUpperCase()
}

/**
 * Todos los documentos que un viaje tiene adjuntos, de todas sus etapas.
 *
 * Incluye el BL firmado de cada parada, que llega aparte.
 *
 * @param {object} viaje Un viaje de `getPaginated`.
 * @returns {Array.<{id: string, tipo: string}>} Los documentos.
 */
export function documentosDeViaje(viaje) {
  return (viaje.etapas || []).flatMap((etapa) => [
    ...(etapa.documentos_adjuntos || []).map((doc) => ({
      id: String(doc.document_id),
      tipo: doc.tipo_documento,
    })),
    ...(etapa.stops_in_transit || [])
      .filter((parada) => parada.bl_firmado_doc?.document_id)
      .map((parada) => ({ id: String(parada.bl_firmado_doc.document_id), tipo: "bl_firmado" })),
  ])
}

const textoDeFaltantes = (viaje) => {
  const faltantes = (viaje.etapas || []).flatMap((etapa) =>
    Array.isArray(etapa.documentos_faltantes_lista) ? etapa.documentos_faltantes_lista : [],
  )
  return faltantes.length > 0
    ? `Faltan ${faltantes.length}: ${faltantes.map(nombreDeDocumento).join(", ")}`
    : "Documentos completos"
}

/**
 * Un aviso por viaje que está en despacho, con los documentos que le faltan.
 *
 * @param {Array.<object>} viajes Los viajes de la pestaña Despacho.
 * @param {number} pestana El `tabValue` de Despacho, para abrirla desde el aviso.
 * @returns {Array.<object>} Los avisos.
 */
export function avisosDeDespacho(viajes, pestana) {
  return viajes.map((viaje) => ({
    id: `despacho-${viaje.trip_id}`,
    tipo: TIPO_AVISO.DESPACHO,
    titulo: `Viaje en despacho ${viaje.trip_number || ""}`.trim(),
    subtitulo: juntar([viaje.truck_unidad ? `Camión ${viaje.truck_unidad}` : "", viaje.driver_nombre]),
    detalle: textoDeFaltantes(viaje),
    created_at: viaje.creation_date,
    destino: { ruta: "/admin-trips", pestanaViajes: pestana },
  }))
}

/**
 * Detecta los documentos que se agregaron a los viajes en despacho.
 *
 * Compara contra lo último que se vio (`base`). Los que entraron juntos a un
 * mismo viaje salen en un solo aviso, que además dice qué sigue faltando. La
 * primera vez —sin `base`— y los viajes que aparecen por primera vez solo se
 * anotan: avisar de documentos que ya estaban sería ruido.
 *
 * @param {Array.<object>} viajes Los viajes de la pestaña Despacho.
 * @param {(object|null)} base Ids de documento conocidos por viaje, o `null` la primera vez.
 * @param {Date} ahora El instante actual; es la fecha que llevan los avisos.
 * @param {number} pestana El `tabValue` de Despacho.
 * @returns {{avisos: Array.<object>, base: object}} Los avisos nuevos y la base actualizada.
 */
export function avisosDeDocumentos(viajes, base, ahora, pestana) {
  const creado = fechaLocal(ahora)
  const nuevaBase = {}
  const avisos = []

  for (const viaje of viajes) {
    const documentos = documentosDeViaje(viaje)
    const llave = String(viaje.trip_id)
    nuevaBase[llave] = documentos.map((doc) => doc.id)
    if (!base?.[llave]) continue

    const conocidos = new Set(base[llave])
    const agregados = documentos.filter((doc) => !conocidos.has(doc.id))
    if (agregados.length === 0) continue

    avisos.push({
      id: `documentos-${llave}-${agregados.map((doc) => doc.id).sort().join("-")}`,
      tipo: TIPO_AVISO.DOCUMENTOS,
      titulo:
        agregados.length === 1
          ? `Documento agregado ${viaje.trip_number || ""}`.trim()
          : `${agregados.length} documentos agregados ${viaje.trip_number || ""}`.trim(),
      subtitulo: agregados.map((doc) => nombreDeDocumento(doc.tipo)).join(", "),
      detalle: textoDeFaltantes(viaje),
      created_at: creado,
      destino: { ruta: "/admin-trips", pestanaViajes: pestana },
    })
  }

  return { avisos, base: nuevaBase }
}

/**
 * Tira los avisos viejos y limita cuántos se guardan.
 *
 * @param {Array.<object>} avisos Los avisos, del más nuevo al más viejo.
 * @param {Date} ahora Contra qué momento se mide la antigüedad.
 * @param {number} [maximo=60] Cuántos conservar como mucho.
 * @returns {Array.<object>} Los que siguen vigentes.
 */
export function recortarAvisos(avisos, ahora, maximo = 60) {
  const limite = fechaLocal(new Date(ahora.getTime() - DIAS_DE_AVISO_DERIVADO * MILISEGUNDOS_POR_DIA))
  return avisos.filter((aviso) => String(aviso.created_at) >= limite).slice(0, maximo)
}
