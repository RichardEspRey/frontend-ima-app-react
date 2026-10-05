# entities/safety

El cumplimiento documental de los viajes: libro electrónico, reporte diesel y reporte PC Miller.

## Contenido

- `api/cumplimiento.js` — `obtenerViajesSafety`, `useViajesSafety`
- `model/cumplimiento.js` — `DOCUMENTOS_REQUERIDOS`, `NOMBRE_DOCUMENTO`, `esquemaViajeSafety`, `tieneDocumento`, `documentosFaltantes`, `cumplimientoCompleto`… (9)

Pruebas: `cumplimiento.test.js`.

## Endpoints que consume

| Endpoint | op | Función |
|---|---|---|
| `safety.php` | `get_safety_trips` | `obtenerViajesSafety()` |

## Reglas de negocio

- Cada documento llega como URL o como `null`; `null` significa que falta, no que haya error.
- `separarPorCumplimiento` alimenta las pestañas de la pantalla y `contarFaltantes` los contadores de cada columna.

## Pendiente

- `pages/safety/SafetyPage.jsx` pide `safety.php` con `fetch`. Conectarla a esta entidad es parte del incremento de su módulo: ver `docs/refactor/PENDIENTES.md`.

## Quién lo usa

**Nadie.** Ver *Pendiente*.
