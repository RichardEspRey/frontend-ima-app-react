import { useMemo } from "react"
import { Typography } from "@mui/material"

import {
  OBSERVACIONES_CAJA,
  UBICACIONES_CAJA,
} from "../../../entities/trailer"
import { COLOR, DataTable } from "../../../shared/ui"
import { CeldaComentario } from "./CeldaComentario"
import { CeldaFianza } from "./CeldaFianza"
import { SelectCelda } from "./SelectCelda"

const SIN_DATO = (
  <Typography variant="body2" color={COLOR.TENUE}>
    —
  </Typography>
)

/**
 * El tablero de cajas: una fila por caja interna.
 *
 * Solo pinta. Las dos columnas capturables avisan hacia arriba y no guardan
 * nada por su cuenta, y el estado de la fianza lo decide la entidad.
 *
 * @param {object} props Propiedades del componente.
 * @param {Array.<object>} props.cajas Las cajas a mostrar.
 * @param {boolean} [props.cargando=false] Si la consulta sigue en curso.
 * @param {(string|null)} [props.error] Mensaje de error, si la consulta falló.
 * @param {(number|null)} [props.guardandoId] Caja cuyo guardado está en curso.
 * @param {Function} props.onCapturar `({caja, campo, valor}) => void` al elegir en un combo.
 * @param {Function} props.onSubirFianza `(caja) => void` al pedir subir una fianza.
 * @returns {object} La tabla renderizada.
 */
export function TablaEstatusCajas({
  cajas,
  cargando = false,
  error,
  guardandoId,
  onCapturar,
  onSubirFianza,
}) {
  const columnas = useMemo(
    () => [
      {
        id: "no_caja",
        label: "Cajas",
        ordenable: true,
        render: (caja) => (
          <>
            <Typography fontWeight={800} color={COLOR.TINTA}>
              {caja.no_caja}
            </Typography>
            {caja.trip_number && (
              <Typography variant="caption" color={COLOR.APAGADO}>
                Viaje {caja.trip_number}
              </Typography>
            )}
          </>
        ),
      },
      {
        id: "operador",
        label: "Operador",
        ordenable: true,
        render: (caja) =>
          caja.operador ? (
            <Typography variant="body2" color={COLOR.TEXTO}>
              {caja.operador}
            </Typography>
          ) : (
            SIN_DATO
          ),
      },
      {
        id: "ubicacion",
        label: "Ubicación",
        ordenable: true,
        render: (caja) => (
          <SelectCelda
            valor={caja.ubicacion}
            opciones={UBICACIONES_CAJA}
            deshabilitado={guardandoId === caja.caja_id}
            vacio="Sin ubicación"
            onChange={(valor) => onCapturar({ caja, campo: "ubicacion", valor })}
          />
        ),
      },
      {
        id: "observacion",
        label: "Observación",
        ordenable: true,
        render: (caja) => (
          <SelectCelda
            valor={caja.observacion}
            opciones={OBSERVACIONES_CAJA}
            deshabilitado={guardandoId === caja.caja_id}
            vacio="Sin observación"
            ancho={145}
            onChange={(valor) => onCapturar({ caja, campo: "observacion", valor })}
          />
        ),
      },
      {
        id: "fianza",
        label: "Fianza",
        render: (caja) => (
          <CeldaFianza fianza={caja.fianza} onSubir={() => onSubirFianza(caja)} />
        ),
      },
      {
        id: "broker",
        label: "Broker",
        ordenable: true,
        render: (caja) =>
          caja.broker ? (
            <Typography variant="body2" color={COLOR.TEXTO}>
              {caja.broker}
            </Typography>
          ) : (
            SIN_DATO
          ),
      },
      {
        id: "comentario",
        label: "Comentarios",
        render: (caja) => (
          <CeldaComentario
            comentario={caja.comentario}
            deshabilitado={guardandoId === caja.caja_id}
            onGuardar={(texto) => onCapturar({ caja, campo: "comentario", valor: texto })}
          />
        ),
      },
    ],
    [guardandoId, onCapturar, onSubirFianza],
  )

  return (
    <DataTable
      filas={cajas}
      columnas={columnas}
      claveFila="caja_id"
      cargando={cargando}
      error={error}
      vacio="No hay cajas que mostrar."
    />
  )
}
