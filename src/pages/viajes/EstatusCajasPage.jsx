import { Box, Button } from "@mui/material"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import { useNavigate } from "react-router-dom"

import { ModalFianza, TablaEstatusCajas, useTableroCajas } from "../../features/estatus-cajas"
import { BotonActualizar, GHOST_BTN_SX, PAGE_SHELL_SX, PageHeader } from "../../shared/ui"

/**
 * Estatus de cajas: dónde está cada caja y con qué viaje.
 *
 * Lo automático —el viaje en turno, su operador, la dirección de la etapa y el
 * broker— se calcula al consultar, así que no envejece. Lo que se captura aquí
 * pisa a lo automático mientras la caja siga en el mismo viaje.
 *
 * @returns {object} La pantalla renderizada.
 */
export default function EstatusCajasPage() {
  const navigate = useNavigate()
  const tablero = useTableroCajas()

  return (
    <Box sx={PAGE_SHELL_SX}>
      <PageHeader
        seccion="Viajes · Unidades"
        titulo="Estatus de cajas"
        descripcion={`Dónde está cada caja y con qué viaje. ${tablero.resumen.cargadas} cargadas · ${tablero.resumen.vacias} vacías.`}
        acciones={
          <>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate("/admin-trips")}
              sx={GHOST_BTN_SX}
            >
              Volver a Viajes
            </Button>
            <BotonActualizar onActualizar={() => tablero.recargar()} actualizando={tablero.recargando} />
          </>
        }
      />

      <TablaEstatusCajas
        cajas={tablero.cajas}
        cargando={tablero.cargando}
        error={tablero.mensajeError}
        guardandoId={tablero.guardandoId}
        onCapturar={tablero.capturar}
        onSubirFianza={tablero.pedirFianza}
      />

      <ModalFianza
        caja={tablero.fianzaEnModal}
        guardando={tablero.subiendoFianza}
        onCancelar={tablero.cerrarFianza}
        onConfirmar={tablero.subirFianzaElegida}
      />
    </Box>
  )
}
