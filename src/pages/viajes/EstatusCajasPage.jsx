import { Box, Button } from "@mui/material"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import RefreshIcon from "@mui/icons-material/Refresh"
import { useNavigate } from "react-router-dom"

import { ModalFianza, TablaEstatusCajas, useTableroCajas } from "../../features/estatus-cajas"
import { COLOR, PageHeader } from "../../shared/ui"

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
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: "100vh", bgcolor: COLOR.LIENZO }}>
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
              sx={{ textTransform: "none" }}
            >
              Volver a Viajes
            </Button>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={() => tablero.recargar()}
              disabled={tablero.recargando}
              sx={{ bgcolor: COLOR.TINTA, textTransform: "none" }}
            >
              Actualizar
            </Button>
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
