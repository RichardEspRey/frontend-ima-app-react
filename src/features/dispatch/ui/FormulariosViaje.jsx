import { Alert, Box, Paper } from "@mui/material"

import BorderCrossingFormNew2 from "../../../components/BorderCrossingFormNew2"
import TripFormMX from "../../../components/TripFormMX"
import TripFormUSA from "../../../components/TripFormUSA"
import { PAIS } from "../../../entities/dispatch"
import { Pestanas } from "../../../shared/ui"

/**
 * Las pestañas de formulario de un viaje, según el país.
 *
 * México solo tiene viaje normal; Estados Unidos añade el cruce fronterizo como
 * primera pestaña. La numeración depende de eso, y estaba resuelta de dos formas
 * distintas en crear y en editar: aquí vive una sola.
 *
 * @param {object} props Propiedades del componente.
 * @param {string} props.pais País base del viaje.
 * @param {number} props.pestana Índice de la pestaña activa.
 * @param {Function} props.onPestanaChange Recibe el índice elegido.
 * @param {object} props.propsFormulario Lo que se pasa al formulario que se dibuje.
 * @returns {object} Las pestañas y el formulario activo.
 */
export function FormulariosViaje({ pais, pestana, onPestanaChange, propsFormulario }) {
  if (!pais) return <Alert severity="info">Selecciona un país para comenzar.</Alert>

  const esCruce = pais === PAIS.USA && pestana === 0
  const esNormalUSA = pais === PAIS.USA && pestana === 1
  const esNormalMX = pais === PAIS.MEXICO && pestana === 0

  return (
    <Box>
      <Paper sx={{ mb: 3 }}>
        <Pestanas
          valor={pestana}
          onChange={onPestanaChange}
          pestanas={[
            ...(pais === PAIS.USA ? [{ etiqueta: 'Cruce Fronterizo (Transfer)' }] : []),
            { etiqueta: 'Viaje Normal (Carretera)' },
          ]}
        />
      </Paper>

      {esCruce && <BorderCrossingFormNew2 {...propsFormulario} />}
      {esNormalUSA && <TripFormUSA {...propsFormulario} />}
      {esNormalMX && <TripFormMX {...propsFormulario} />}
    </Box>
  )
}
