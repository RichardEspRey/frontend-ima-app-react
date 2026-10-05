# entities/trip

Los viajes: la lista paginada con sus filtros, las acciones que cambian su estado, la edición con etapas, paradas y documentos, y el resumen financiero.

## Contenido

- `api/edicion.js` — `obtenerViajePorId`, `OP_GUARDADO`, `guardarViajeUpcoming`, `guardarInvoices`, `useViajeUpcoming`, `useGuardarViajeUpcoming`
- `api/resumen.js` — `obtenerResumenViaje`, `useResumenViaje`
- `api/viajes.js` — `ACCION_VIAJE`, `obtenerViajes`, `ejecutarAccionViaje`, `useViajes`, `useAccionViaje`
- `model/edicion.js` — `PREFIJO_ID_NUEVO`, `esNuevo`, `idParaGuardar`, `normalizarTipoDocumento`, `nombreDeArchivo`, `documentoDesdeApi`… (17)
- `model/pestanas.js` — `PESTANAS_VIAJES`, `PESTANA_PROGRAMACION`, `PESTANA_PROXIMOS`, `pestanasPermitidas`, `pestanaDeReemplazo`, `FILTROS_VIAJES`… (8)
- `model/resumen.js` — `totalesViaje`, `utilidadCuadra`, `utilidadNeta`, `etapasDeResumen`, `dieselDeResumen`, `gastosDeResumen`… (7)
- `model/statusCaja.js` — `STATUS_CAJA_POR_PAIS`, `statusCajaDe`, `statusCajaValido`
- `model/viaje.js` — `ESTADO_VIAJE`, `ESTADO_POR_OMISION`, `COLOR_ESTADO_VIAJE`, `colorEstadoViaje`, `TIPO_ETAPA`, `etiquetaTipoEtapa`

Pruebas: `edicion.test.js`, `pestanas.test.js`, `resumen.test.js`, `statusCaja.test.js`.

## Endpoints que consume

| Endpoint | op | Función |
|---|---|---|
| `new_trips.php` | `getById` | `obtenerViajePorId()` |
| `new_trips.php` | `UpdateUpcoming` / `Update` / `Update_complete` | `guardarViajeUpcoming()` |
| `update_invoices.php` | `update_invoices` | `guardarInvoices()` |
| `trips.php` | `trip_summary` | `obtenerResumenViaje()` |
| `new_tripsv2.php` | `getPaginated` | `obtenerViajes()` |
| `new_trips.php` / `new_tripsv2.php` | `—` | `ejecutarAccionViaje()` |

## Reglas de negocio

- Estados: In Coming → In Transit → Almost Over → Completed, o Cancelled (`ESTADO_VIAJE`).
- Las etapas y paradas creadas en el navegador llevan un id provisional (`PREFIJO_ID_NUEVO`) y viajan como `null`: la base les asigna el suyo.
- Hay tres formas de guardar un viaje según la pantalla desde la que se edita (`OP_GUARDADO`).
- Al marcar Almost Over se pide el status de caja: Impo, Expo o Vacio; en EUA no existe Expo (`STATUS_CAJA_POR_PAIS`).
- Las pestañas del administrador dependen de los permisos de cada quien, y si la elegida deja de estar permitida se cae a otra (`pestanasPermitidas`, `pestanaDeReemplazo`).
- La utilidad que manda el backend se comprueba contra sus propios números (`utilidadCuadra`).

## Quién lo usa

`features/trip-edit`, `features/trips-admin`, `pages/dispatch`, `pages/viajes`
