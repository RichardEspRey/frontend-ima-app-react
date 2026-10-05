# entities/schedule

La programación de viajes: el tablero de disponibilidad de camiones, operadores y cajas, y las programaciones pendientes de convertirse en viaje.

## Contenido

- `api/programacion.js` — `obtenerTableroProgramacion`, `obtenerProgramaciones`, `guardarProgramacion`, `eliminarProgramacion`, `useTableroProgramacion`, `useProgramaciones`… (8)
- `model/programacion.js` — `NUEVO_LAREDO`, `PREFIJO_CAJA`, `valorCaja`, `leerValorCaja`, `programacionEnBlanco`, `formularioDesdePrograma`… (10)

Pruebas: `programacion.test.js`.

## Endpoints que consume

| Endpoint | op | Función |
|---|---|---|
| `Programacion_viajes.php` | `dashboard` | `obtenerTableroProgramacion()` |
| `Programacion_viajes.php` | `getAll` | `obtenerProgramaciones()` |
| `Programacion_viajes.php` | `insert` / `update` | `guardarProgramacion()` |
| `Programacion_viajes.php` | `delete` | `eliminarProgramacion()` |

## Reglas de negocio

- Las distancias se miden contra el patio de Nuevo Laredo (`NUEVO_LAREDO`).
- El selector mezcla cajas propias y externas, cuyos ids se repiten entre tablas: el prefijo las separa (`PREFIJO_CAJA`, `valorCaja`).
- Al guardar, la caja viaja en un campo u otro según su flota; el que no aplica va **vacío**, no ausente, porque así se borra la asignación anterior.
- Una unidad que ya está en un viaje sale como no disponible.

## Quién lo usa

`features/trips-admin`, `pages/viajes`
