import { useEffect, useState } from "react"

import { PAIS, paisOpuesto, useViajesTransnacionales } from "../../../entities/dispatch"

/**
 * El país del otro lado de la frontera, o cadena vacía si el país no se reconoce.
 *
 * @param {string} [pais] El país base del viaje.
 * @returns {string} El país contrario.
 */
const contrarioDe = (pais) =>
  pais === PAIS.MEXICO || pais === PAIS.USA ? paisOpuesto(pais) : ""

/**
 * El enlace de un viaje con su mitad del otro lado de la frontera.
 *
 * Solo lo usa la edición completa. Cuando el viaje **ya venía enlazado**, no se
 * ofrece la lista: el enlace está hecho y volver a elegir solo permitiría
 * romperlo por accidente. Por eso importa si estaba enlazado *al cargar*, no si
 * lo está ahora mismo.
 *
 * @param {object} parametros Datos del enlace.
 * @param {boolean} parametros.activo Si esta pantalla edita el enlace.
 * @param {object} parametros.datosViaje Los datos del viaje en edición.
 * @param {string} [parametros.anioViaje] Año del viaje, a dos dígitos.
 * @param {boolean} parametros.enlazadoAlCargar Si el viaje ya traía número de cruce.
 * @param {Function} parametros.onCambio Recibe `(campo, valor)` para actualizar el viaje.
 * @returns {{props: object}} Lo que hay que pasarle al formulario general.
 */
export function useEnlaceTransnacional({
  activo,
  datosViaje,
  anioViaje,
  enlazadoAlCargar,
  onCambio,
}) {
  const [esContinuacion, setEsContinuacion] = useState(false)
  const [yaEnlazado, setYaEnlazado] = useState(enlazadoAlCargar)

  useEffect(() => {
    setYaEnlazado(enlazadoAlCargar)
    setEsContinuacion(enlazadoAlCargar)
  }, [enlazadoAlCargar])

  const esTransnacional = datosViaje?.is_transnational === "1"
  const contrario = contrarioDe(datosViaje?.country_code)
  const debeConsultar = activo && esTransnacional && !yaEnlazado && Boolean(anioViaje)

  const { data: viajes = [] } = useViajesTransnacionales(
    debeConsultar ? contrario : "",
    debeConsultar ? anioViaje : "",
  )

  const alCambiarTransnacional = (marcado) => {
    onCambio("is_transnational", marcado ? "1" : "0")
    if (!marcado) {
      setEsContinuacion(false)
      setYaEnlazado(false)
      onCambio("transnational_number", "")
      onCambio("movement_number", "")
    }
  }

  const alCambiarContinuacion = (marcado) => {
    setEsContinuacion(marcado)
    if (!marcado) onCambio("transnational_number", "")
  }

  return {
    props: {
      transnationalTrips: viajes,
      isContinuation: esContinuacion,
      isExistingTransnationalTrip: yaEnlazado,
      onTransnationalChange: alCambiarTransnacional,
      onContinuationChange: alCambiarContinuacion,
    },
  }
}
