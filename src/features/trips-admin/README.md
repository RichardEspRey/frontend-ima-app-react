# features/trips-admin

El Administrador de viajes: la tabla de viajes por pestaña con sus filtros, la programación de viajes, el mapa de ruta y el status de caja al cerrar.

## Contenido

- `model/documentos.js` — `documentosFaltantesDeViaje`, `urlDocumento`, `columnasDeTabla`
- `ui/FiltrosViajes.jsx` — `FiltrosViajes`
- `ui/MapaRutaCamion.jsx` — `MapaRutaCamion`
- `ui/ModalProgramacion.jsx` — `ModalProgramacion`
- `ui/ModalStatusCaja.jsx` — `ModalStatusCaja`
- `ui/TablaProgramaciones.jsx` — `TablaProgramaciones`
- `ui/TablaViajes.jsx` — `TablaViajes`

## Cómo funciona

- Las pestañas, los filtros y las acciones son reglas de `entities/trip` y `entities/schedule`.
- `ModalStatusCaja` pregunta el status de la caja antes de marcar un viaje como Almost Over.
- Los filtros sobreviven a la navegación en `store/useViajesFiltrosStore.js`.

## Pendiente

- `pages/viajes/AdminViajesPage.jsx` pasa de 640 líneas: la lógica debería bajar a un controlador de esta feature.

## Quién lo usa

`pages/viajes`
