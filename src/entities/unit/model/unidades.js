import { descriptorDe } from "./tipos"

/**
 * Estados en que puede estar un conductor.
 *
 * Solo los conductores se dan de baja; camiones y cajas se eliminan.
 *
 * @readonly
 * @enum {string}
 */
export const ESTADO_CONDUCTOR = {
  ACTIVO: "Activo",
  BAJA: "Baja",
}

/**
 * El estado de un conductor, tratando el ausente como activo.
 *
 * La columna se agregó después de dar de alta a la plantilla, así que quien no
 * la tiene es porque nunca se le dio de baja.
 *
 * @param {object} conductor El conductor a evaluar.
 * @returns {string} Un valor de `ESTADO_CONDUCTOR`.
 */
export const estadoConductor = (conductor) => conductor?.estado || ESTADO_CONDUCTOR.ACTIVO

/**
 * Filtra una lista de unidades por lo escrito en cada buscador.
 *
 * Cada buscador puede mirar varios campos —el de placa mira la mexicana y la
 * estadounidense—, y una unidad pasa si coincide en alguno de ellos.
 *
 * @param {Array} [unidades] Las unidades a filtrar.
 * @param {Array} [busquedas] Los buscadores del descriptor.
 * @param {object} [texto] Lo escrito en cada buscador, por su clave.
 * @returns {Array} Las unidades que coinciden con todos los buscadores con texto.
 */
export function filtrarUnidades(unidades = [], busquedas = [], texto = {}) {
  return unidades.filter((unidad) =>
    busquedas.every((buscador) => {
      const buscado = String(texto[buscador.clave] ?? "").toLowerCase().trim()
      if (!buscado) return true
      return buscador.campos.some((campo) =>
        String(unidad?.[campo] ?? "").toLowerCase().includes(buscado),
      )
    }),
  )
}

/**
 * Los campos del formulario que se mandan al guardar.
 *
 * Se omiten los vacíos: el backend interpreta la ausencia como "no lo toques",
 * y mandar la cadena vacía borraría lo que ya estaba.
 *
 * @param {string} tipo Un valor de `TIPO_UNIDAD`.
 * @param {object} unidad Los datos del formulario.
 * @returns {object} Solo los campos con valor, más el id si lo hay.
 */
export function camposParaGuardar(tipo, unidad) {
  const { campos, campoId } = descriptorDe(tipo)
  const salida = {}

  if (unidad?.[campoId]) salida[campoId] = unidad[campoId]

  for (const campo of campos) {
    const valor = unidad?.[campo.clave]
    if (valor !== undefined && valor !== null && valor !== "") salida[campo.clave] = valor
  }

  return salida
}

/**
 * Los campos del expediente que se mandan al guardar.
 *
 * Los requisitos de texto viajan como `text_<clave>`, las fechas como
 * `date_<clave>` y los archivos como `file_<clave>`. Es el contrato del backend
 * y no se puede cambiar desde aquí.
 *
 * @param {Array} [requisitos] Los requisitos del expediente.
 * @param {object} [documentos] Lo que hay en el formulario.
 * @param {object} [archivos] Los archivos que se acaban de escoger.
 * @returns {object} Los campos del `FormData`.
 */
export function expedienteParaGuardar(requisitos = [], documentos = {}, archivos = {}) {
  const campos = {}

  for (const requisito of requisitos) {
    const clave = requisito?.key_name
    const doc = documentos?.[clave]

    if (requisito?.tipo === "text" && doc?.valor_texto !== undefined) {
      campos[`text_${clave}`] = doc.valor_texto
      continue
    }

    if (requisito?.tipo === "file") {
      if (doc?.fecha_vencimiento) campos[`date_${clave}`] = String(doc.fecha_vencimiento).split("T")[0]
      if (archivos?.[clave]) campos[`file_${clave}`] = archivos[clave]
    }
  }

  return campos
}

/**
 * Comprueba que estén los campos obligatorios del tipo.
 *
 * @param {string} tipo Un valor de `TIPO_UNIDAD`.
 * @param {object} unidad Los datos del formulario.
 * @returns {(string|null)} Qué falta, en lenguaje de la persona, o `null` si está completo.
 */
export function validarUnidad(tipo, unidad) {
  const { campos } = descriptorDe(tipo)
  const falta = campos.find((campo) => campo.requerido && !unidad?.[campo.clave])
  return falta ? `${falta.etiqueta} es obligatorio.` : null
}
