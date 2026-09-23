import { useEffect, useState } from "react"
import { TextField } from "@mui/material"

import { LARGO_COMENTARIO, recortarComentario } from "../../../entities/trailer"
import { COLOR } from "../../../shared/ui"

const AVISAR_DESDE = LARGO_COMENTARIO - 50

/**
 * La nota libre de una caja, editable dentro de la tabla.
 *
 * Guarda al salir del campo y solo si el texto cambió: una nota se escribe de
 * corrido, y mandar una petición por tecla llenaría la bitácora de versiones a
 * medio escribir. Mientras se escribe, el valor vive aquí; el de la fila manda
 * en cuanto llega uno nuevo del servidor.
 *
 * @param {object} props Propiedades del componente.
 * @param {(string|null)} props.comentario Lo que hay guardado para esta caja.
 * @param {boolean} [props.deshabilitado=false] Apaga el campo mientras se guarda.
 * @param {Function} props.onGuardar `(texto) => void` al salir del campo con cambios.
 * @returns {object} El campo renderizado.
 */
export function CeldaComentario({ comentario, deshabilitado = false, onGuardar }) {
  const guardado = comentario ?? ""
  const [texto, setTexto] = useState(guardado)

  useEffect(() => setTexto(guardado), [guardado])

  const guardarSiCambio = () => {
    const limpio = recortarComentario(texto)
    if (limpio !== guardado) onGuardar(limpio)
  }

  return (
    <TextField
      size="small"
      multiline
      maxRows={3}
      value={texto}
      disabled={deshabilitado}
      placeholder="Sin comentarios"
      onChange={(evento) => setTexto(evento.target.value.slice(0, LARGO_COMENTARIO))}
      onBlur={guardarSiCambio}
      inputProps={{ maxLength: LARGO_COMENTARIO }}
      helperText={texto.length > AVISAR_DESDE ? `${texto.length}/${LARGO_COMENTARIO}` : undefined}
      sx={{ minWidth: 260, bgcolor: COLOR.BLANCO }}
    />
  )
}
