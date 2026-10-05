# entities/trailer

Las cajas: las propias y las externas para los formularios de viaje, el tablero de estatus y la fianza.

## Contenido

- `api/cajas.js` — `obtenerCajasActivas`, `useCajasActivas`, `obtenerCajasActivasCompletas`, `useCajasActivasCompletas`
- `api/cajasExternas.js` — `obtenerCajasExternasActivas`, `useCajasExternasActivas`, `crearCajaExterna`, `useCrearCajaExterna`
- `api/estatusCajas.js` — `REFRESCO_TABLERO_MS`, `obtenerEstatusCajas`, `useEstatusCajas`, `guardarEstatusCaja`, `useGuardarEstatusCaja`
- `api/fianzas.js` — `subirFianza`, `useSubirFianza`
- `model/estatusCaja.js` — `UBICACION_CAJA`, `UBICACIONES_CAJA`, `OBSERVACION_CAJA`, `OBSERVACIONES_CAJA`, `LARGO_COMENTARIO`, `recortarComentario`… (11)

Pruebas: `estatusCaja.test.js`.

## Endpoints que consume

| Endpoint | op | Función |
|---|---|---|
| `cajas.php` | `getCajasActivas` | `obtenerCajasActivas()` |
| `cajas.php` | `getCajasActivasComplete` | `obtenerCajasActivasCompletas()` |
| `caja_externa.php` | `getCajasExternasActivas` | `obtenerCajasExternasActivas()` |
| `caja_externa.php` | `Alta` | `crearCajaExterna()` |
| `cajas_estatus.php` | `getEstatusCajas` | `obtenerEstatusCajas()` |
| `cajas_estatus.php` | `saveEstatusCaja` | `guardarEstatusCaja()` |
| `cajas_docs.php` | `Alta` | `subirFianza()` |

## Reglas de negocio

- Ubicación y observación son listas cerradas (`UBICACION_CAJA`, `OBSERVACION_CAJA`). PENSION USA, MANTENIMIENTO, AGENCIA ADUANAL, CARGANDO y DESCARGANDO solo se capturan a mano: el endpoint nunca las calcula.
- Lo automático —viaje en turno, operador, dirección y broker— lo calcula el endpoint al consultar y no se guarda. Lo capturado vale hasta que la caja cambie de etapa; el comentario no caduca.
- El comentario se recorta a 300 caracteres, el largo de la columna, en el campo, en el envío y en la base (`LARGO_COMENTARIO`).
- Cargadas y vacías se cuentan cada una por su nombre: cargando y descargando no entran en ninguna (`contarPorObservacion`).
- La fianza usa la misma regla de vencimiento que el expediente de unidades (`estadoDocumento` de `entities/unit`). En la base aparece como `Fianza` y `FIANZA`.

## Quién lo usa

`components/BorderCrossingFormNew2.jsx`, `components/TripFormMX.jsx`, `components/TripFormUSA.jsx`, `features/estatus-cajas`, `features/maintenance`, `features/trip-edit`, `pages/viajes`
