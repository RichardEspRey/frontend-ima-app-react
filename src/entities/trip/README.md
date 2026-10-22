# entities/trip

Los viajes: la lista paginada con sus filtros, las acciones que cambian su estado, la edición con etapas, paradas y documentos, y el resumen financiero.

## Contenido

- `api/edicion.js` — `obtenerViajePorId`, `OP_GUARDADO`, `guardarViajeUpcoming`, `guardarInvoices`, `useViajeUpcoming`, `useGuardarViajeUpcoming`
- `api/resumen.js` — `obtenerResumenViaje`, `useResumenViaje`
- `api/ruta.js` — `obtenerRutaViaje`, `useRutaViaje`
- `api/viajes.js` — `ACCION_VIAJE`, `obtenerViajes`, `ejecutarAccionViaje`, `useViajes`, `useAccionViaje`
- `model/edicion.js` — `PREFIJO_ID_NUEVO`, `esNuevo`, `idParaGuardar`, `normalizarTipoDocumento`, `nombreDeArchivo`, `documentoDesdeApi`… (17)
- `model/pestanas.js` — `PESTANAS_VIAJES`, `PESTANA_PROGRAMACION`, `PESTANA_PROXIMOS`, `pestanasPermitidas`, `pestanaDeReemplazo`, `FILTROS_VIAJES`… (8)
- `model/resumen.js` — `totalesViaje`, `utilidadCuadra`, `utilidadNeta`, `etapasDeResumen`, `dieselDeResumen`, `gastosDeResumen`… (7)
- `model/finalizacion.js` — `ahoraParaCampo`, `validarFechasFinalizacion`, `cuerpoFinalizacion`
- `model/ruta.js` — `esquemaRutaViaje`, `esquemaTramo`, `puntosDeRuta`
- `model/statusCaja.js` — `STATUS_CAJA_POR_PAIS`, `statusCajaDe`, `statusCajaValido`, `registraStatusCaja`
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
| `new_trips.php` | `getTripRoute` | `obtenerRutaViaje()` |

## Reglas de negocio

- Estados: In Coming → In Transit → Almost Over → Completed, o Cancelled (`ESTADO_VIAJE`).
- Las etapas y paradas creadas en el navegador llevan un id provisional (`PREFIJO_ID_NUEVO`) y viajan como `null`: la base les asigna el suyo.
- Hay tres formas de guardar un viaje según la pantalla desde la que se edita (`OP_GUARDADO`).
- Al marcar Almost Over se pide el status de caja: Impo, Expo o Vacio; en EUA no existe Expo (`STATUS_CAJA_POR_PAIS`). Con caja externa no se pide: el viaje se marca directo (`registraStatusCaja`).
- Finalizar un viaje pide la fecha de inicio y la final; la final no puede ser futura y el inicio va antes (`validarFechasFinalizacion`). `FinalizeTrip` las recibe como `fecha_inicio` y `fecha_finalizacion`.
- Con esas fechas el servidor arma, con Wialon, la ruta que hizo la unidad (`getTripRoute`).
- Las pestañas del administrador dependen de los permisos de cada quien, y si la elegida deja de estar permitida se cae a otra (`pestanasPermitidas`, `pestanaDeReemplazo`).
- La utilidad que manda el backend se comprueba contra sus propios números (`utilidadCuadra`).

## Quién lo usa

`features/trip-edit`, `features/trips-admin`, `pages/dispatch`, `pages/viajes`
