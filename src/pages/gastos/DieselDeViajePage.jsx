import { useState } from "react"
import { useParams } from "react-router-dom"

import {
  TIPO_REGISTRO,
  descriptorDe,
  useCrearRegistroManual,
} from "../../entities/expense"
import {
  ModalDieselManual,
  OBLIGATORIOS_DIESEL,
  RegistrosDeViaje,
  cargaEnBlanco,
} from "../../features/expenses"
import { useAuthStore } from "../../store/useAuthStore"
import { notify } from "../../shared/ui"

const DESCRIPTOR = descriptorDe(TIPO_REGISTRO.DIESEL)

/**
 * Las cargas de diesel de un viaje, con el alta manual.
 *
 * @returns {object} La pantalla renderizada.
 */
export default function DieselDeViajePage() {
  const { tripId } = useParams()
  const { user: usuario } = useAuthStore()

  const [abierto, setAbierto] = useState(false)
  const [formulario, setFormulario] = useState(cargaEnBlanco)
  const [archivos, setArchivos] = useState([])

  const crear = useCrearRegistroManual(DESCRIPTOR.clave)

  const cerrar = () => {
    setAbierto(false)
    setFormulario(cargaEnBlanco())
    setArchivos([])
  }

  const guardar = async () => {
    const falta = OBLIGATORIOS_DIESEL.find((campo) => !formulario[campo])
    if (falta) {
      return notify.aviso("Odómetro, galones y monto son necesarios.", "Campos requeridos")
    }

    try {
      await crear.mutateAsync({
        registro: {
          trip_id: tripId,
          ...formulario,
          // MySQL no entiende la T que mete el campo datetime-local.
          fecha: formulario.fecha.replace("T", " "),
          created_by: usuario?.name || "Administrador",
          ...Object.fromEntries(archivos.map((archivo, i) => [`manualFiles[${i}]`, archivo])),
        },
      })
      await notify.exito("Carga registrada.")
      cerrar()
    } catch (fallo) {
      notify.error(fallo)
    }
  }

  return (
    <RegistrosDeViaje descriptor={DESCRIPTOR} onAlta={() => setAbierto(true)}>
      <ModalDieselManual
        abierto={abierto}
        onCerrar={cerrar}
        formulario={formulario}
        onCampoChange={(campo, valor) => setFormulario({ ...formulario, [campo]: valor })}
        archivos={archivos}
        onArchivosChange={setArchivos}
        onGuardar={guardar}
        guardando={crear.isPending}
      />
    </RegistrosDeViaje>
  )
}
