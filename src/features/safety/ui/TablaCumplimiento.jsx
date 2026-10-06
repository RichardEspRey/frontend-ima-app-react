import { useRef, useState } from "react"
import { Chip, Typography } from "@mui/material"

import { DocumentCell } from "../../../components/DocumentCell.jsx"
import { DOCUMENTOS_REQUERIDOS, NOMBRE_DOCUMENTO, tieneDocumento } from "../../../entities/safety"
import { archivoDelEvento } from "../../../shared/security"
import { CHIP_DANGER_SX, COLOR, DataTable } from "../../../shared/ui"

const POR_PAGINA = 50

/**
 * Los viajes con el estado de sus tres documentos, y la subida de cada uno.
 *
 * @param {object} props Propiedades del componente.
 * @param {Array.<object>} props.viajes Los viajes de la lista que se está viendo.
 * @param {object} props.faltantes Cuántos viajes carecen de cada documento.
 * @param {boolean} props.mostrarFaltantes Si los encabezados llevan el conteo de faltantes.
 * @param {boolean} props.cargando Si es la primera carga.
 * @param {(string|null)} props.error Mensaje de error, si lo hay.
 * @param {Function} props.onSubir `(viaje, tipo, archivo) => void`.
 * @param {Function} props.onVer `(viaje, tipo) => void`.
 * @returns {object} La tabla renderizada.
 */
export function TablaCumplimiento({ viajes, faltantes, mostrarFaltantes, cargando, error, onSubir, onVer }) {
  const entrada = useRef(null)
  const [destino, setDestino] = useState(null)

  const pedirArchivo = (viaje, tipo) => {
    setDestino({ viaje, tipo })
    entrada.current?.click()
  }

  const recibirArchivo = async (evento) => {
    const archivo = await archivoDelEvento(evento)
    if (archivo && destino) onSubir(destino.viaje, destino.tipo, archivo)
  }

  const columnas = [
    {
      id: "trip_number",
      label: "Trip #",
      ordenable: true,
      render: (viaje) => (
        <>
          <Typography variant="body2" fontWeight={700} color={COLOR.TINTA}>
            {viaje.trip_number}
          </Typography>
          {viaje.driver_nombre && (
            <Typography variant="caption" display="block" color={COLOR.APAGADO}>
              {viaje.driver_nombre}
            </Typography>
          )}
        </>
      ),
    },
    ...Object.values(DOCUMENTOS_REQUERIDOS).map((tipo) => ({
      id: tipo,
      label: (
        <>
          {NOMBRE_DOCUMENTO[tipo]}
          {mostrarFaltantes && faltantes[tipo] > 0 && (
            <Chip size="small" label={`${faltantes[tipo]} faltan`} sx={{ ...CHIP_DANGER_SX, ml: 1 }} />
          )}
        </>
      ),
      render: (viaje) => (
        <DocumentCell
          isUploaded={tieneDocumento(viaje, tipo)}
          docName={NOMBRE_DOCUMENTO[tipo]}
          onUpload={() => pedirArchivo(viaje, tipo)}
          onView={() => onVer(viaje, tipo)}
        />
      ),
    })),
  ]

  return (
    <>
      <input
        type="file"
        ref={entrada}
        hidden
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={recibirArchivo}
      />
      <DataTable
        filas={viajes}
        columnas={columnas}
        claveFila="trip_id"
        cargando={cargando}
        error={error}
        vacio="No se encontraron viajes. Ajusta la búsqueda o revisa la otra pestaña."
        porPagina={POR_PAGINA}
      />
    </>
  )
}
