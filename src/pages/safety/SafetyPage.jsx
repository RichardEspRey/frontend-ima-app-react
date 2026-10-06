import { useState } from "react"
import { Box } from "@mui/material"

import {
  FiltroCumplimiento,
  ModalDocumentoSafety,
  TablaCumplimiento,
  VISTA_CUMPLIMIENTO,
  useCumplimientoViajes,
} from "../../features/safety"
import TablaReparaciones from "../../features/inspections/ui/TablaReparaciones.jsx"
import TablaInspecciones from "../../features/inspections/ui/TablaInspecciones.jsx"
import { BotonActualizar, PAGE_SHELL_SX, PageHeader, Pestanas } from "../../shared/ui"

const PESTANAS = [
  { etiqueta: "Pendientes de Documentación", vista: VISTA_CUMPLIMIENTO.PENDIENTES },
  { etiqueta: "Cumplimiento Completo", vista: VISTA_CUMPLIMIENTO.COMPLETOS },
  { etiqueta: "Reparaciones en Ruta" },
  { etiqueta: "Inspecciones Operativas" },
]

/**
 * Safety y cumplimiento: qué documentación falta en los viajes cerrados.
 *
 * Las dos primeras pestañas son la revisión de documentos de `features/safety`;
 * las dos últimas, las tablas de reparaciones en ruta e inspecciones de
 * `features/inspections`, que también son pantallas propias de mantenimientos.
 *
 * @returns {object} La pantalla.
 */
export default function SafetyPage() {
  const [pestana, setPestana] = useState(0)
  const vista = PESTANAS[pestana].vista ?? VISTA_CUMPLIMIENTO.PENDIENTES
  const cumplimiento = useCumplimientoViajes(vista)
  const esCumplimiento = Boolean(PESTANAS[pestana].vista)

  return (
    <Box sx={PAGE_SHELL_SX}>
      <PageHeader
        seccion="Safety · Cumplimiento"
        titulo="Safety & Cumplimiento"
        descripcion="Control de documentos para viajes completados."
        acciones={
          esCumplimiento && (
            <BotonActualizar
              onActualizar={() => cumplimiento.recargar()}
              actualizando={cumplimiento.recargando}
            />
          )
        }
      />

      <Pestanas valor={pestana} onChange={setPestana} pestanas={PESTANAS} />

      {esCumplimiento && (
        <>
          <FiltroCumplimiento busqueda={cumplimiento.busqueda} onBuscar={cumplimiento.buscar} />
          <TablaCumplimiento
            viajes={cumplimiento.viajes}
            faltantes={cumplimiento.faltantes}
            mostrarFaltantes={vista === VISTA_CUMPLIMIENTO.PENDIENTES}
            cargando={cumplimiento.cargando}
            error={cumplimiento.mensajeError}
            onSubir={cumplimiento.subirDocumento}
            onVer={cumplimiento.verDocumento}
          />
          <ModalDocumentoSafety
            documento={cumplimiento.documento}
            onCerrar={cumplimiento.cerrarDocumento}
            onCambio={cumplimiento.refrescar}
          />
        </>
      )}

      {pestana === 2 && <TablaReparaciones />}
      {pestana === 3 && <TablaInspecciones />}
    </Box>
  )
}
