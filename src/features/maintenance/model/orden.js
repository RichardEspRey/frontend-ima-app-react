/**
 * El tipo de gasto bajo el que entra todo lo del taller.
 *
 * @readonly
 * @type {string}
 */
export const TIPO_GASTO_MANTENIMIENTO = "3"

/**
 * Un concepto vacío, listo para capturar.
 *
 * @returns {object} El concepto.
 */
export const conceptoEnBlanco = () => ({
  categoria: "",
  subcategoria: "",
  descripcion: "",
  precio_unitario: "",
  cantidad: 1,
})

/**
 * Un gasto vacío del servicio, con un concepto ya puesto.
 *
 * @param {string} fecha La fecha de la orden, que sirve de inicial.
 * @returns {object} El gasto.
 */
export const gastoEnBlanco = (fecha) => ({
  clave: `gasto-${Date.now()}-${Math.random()}`,
  pais: "",
  fecha_ticket: fecha,
  fecha_gasto: fecha,
  cantidad_original: "",
  tipo_cambio: "",
  factura: null,
  ticket: null,
  conceptos: [conceptoEnBlanco()],
})

/**
 * Un servicio nacido de un punto de la inspección.
 *
 * El texto del operador llega al tipo de reparación y se puede corregir ahí
 * mismo; lo original queda guardado del lado del servidor.
 *
 * @param {object} punto El punto marcado.
 * @param {object} [inspeccion] La inspección de la que salió.
 * @returns {object} El servicio.
 */
export const servicioDesdePunto = (punto, inspeccion) => ({
  clave: `punto-${punto.clave}`,
  origen: "inspeccion",
  categoria: punto.categoria,
  tipo_reparacion: punto.texto.slice(0, 100),
  tipo_mantenimiento: "Correctivo",
  origen_servicio: "Interno",
  costo_mano_obra: "",
  gastos: [],
  punto: {
    cl_final_id: inspeccion?.cl_final_id,
    viaje_id: inspeccion?.viaje_id,
    categoria: punto.categoria,
    origen_tabla: punto.origen_tabla,
    origen_id: punto.origen_id,
  },
})

/**
 * Un servicio nacido de una reparación que ya estaba pendiente.
 *
 * @param {object} pendiente La reparación.
 * @returns {object} El servicio.
 */
export const servicioDesdePendiente = (pendiente) => ({
  clave: `pendiente-${pendiente.id}`,
  origen: "pendiente",
  categoria: pendiente.categoria,
  tipo_reparacion: (pendiente.descripcion || "").slice(0, 100),
  tipo_mantenimiento: "Correctivo",
  origen_servicio: "Interno",
  costo_mano_obra: "",
  gastos: [],
  punto_id: pendiente.id,
})

/**
 * Un servicio extra, el que el taller agrega y nadie reportó.
 *
 * @returns {object} El servicio.
 */
export const servicioEnBlanco = () => ({
  clave: `extra-${Date.now()}-${Math.random()}`,
  origen: "extra",
  tipo_reparacion: "",
  tipo_mantenimiento: "Correctivo",
  origen_servicio: "Interno",
  costo_mano_obra: "",
  gastos: [],
})

/**
 * Lo que suman los conceptos de un gasto.
 *
 * @param {object} gasto El gasto.
 * @returns {number} Su total.
 */
export const totalDeGasto = (gasto) =>
  gasto.conceptos.reduce(
    (suma, concepto) =>
      suma + (Number(concepto.precio_unitario) || 0) * (Number(concepto.cantidad) || 0),
    0,
  )

/**
 * Lo que suma la orden: mano de obra más gastos de cada servicio.
 *
 * @param {Array.<object>} servicios Los servicios de la orden.
 * @returns {number} El total.
 */
export const totalDeOrden = (servicios = []) =>
  servicios.reduce(
    (suma, servicio) =>
      suma +
      (Number(servicio.costo_mano_obra) || 0) +
      servicio.gastos.reduce((sub, gasto) => sub + totalDeGasto(gasto), 0),
    0,
  )

/**
 * Indica si a un gasto le falta algo para poder darse de alta.
 *
 * Un gasto no se puede crear a medias: sin país no hay moneda, y sin categoría y
 * subcategoría el Administrador de Gastos no lo puede clasificar —y el servidor
 * truena con un error fatal que no deja mensaje—.
 *
 * @param {object} gasto El gasto a revisar.
 * @returns {boolean} `true` si todavía no se puede guardar.
 */
export const gastoIncompleto = (gasto) =>
  !gasto.pais ||
  gasto.conceptos.length === 0 ||
  gasto.conceptos.some(
    (concepto) =>
      !concepto.categoria ||
      !concepto.subcategoria ||
      !concepto.descripcion.trim() ||
      !(Number(concepto.cantidad) > 0),
  )

/**
 * Arma el cuerpo con el que se da de alta el gasto en el Administrador de Gastos.
 *
 * Lleva `omitir_inventario`: la orden ya no consume refacciones del inventario,
 * así que si el gasto lo alimentara, el stock crecería sin que nada lo bajara.
 *
 * @param {object} gasto El gasto capturado.
 * @param {object} contexto Datos de alrededor.
 * @param {string} [contexto.usuarioId] Quién lo captura.
 * @returns {object} El cuerpo para `crearGasto`.
 */
export function cuerpoDelGasto(gasto, { usuarioId }) {
  const esMexico = gasto.pais === "MX"
  const total = totalDeGasto(gasto)

  return {
    generalData: {
      fecha_gasto: gasto.fecha_gasto,
      fecha_ticket: gasto.fecha_ticket,
      pais: gasto.pais,
      moneda: esMexico ? "MXN" : "USD",
      monto_total: total,
      cantidad_original: Number(gasto.cantidad_original) || total,
      tipo_cambio: esMexico ? gasto.tipo_cambio : "",
      id_usuario: usuarioId,
    },
    detailsData: gasto.conceptos.map((concepto) => ({
      id_tipo_gasto: TIPO_GASTO_MANTENIMIENTO,
      id_articulo: null,
      descripcion_articulo: concepto.descripcion.trim(),
      cantidad_articulo: Number(concepto.cantidad) || 0,
      precio_unitario: Number(concepto.precio_unitario) || 0,
      id_categoria_mantenimiento: concepto.categoria || null,
      id_subcategoria_mantenimiento: concepto.subcategoria || null,
    })),
    omitir_inventario: true,
    factura_pdf_file: gasto.factura,
    ticket_jpg_file: gasto.ticket,
  }
}
