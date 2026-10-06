# entities/safety

El cumplimiento documental de los viajes: libro electrónico, reporte diesel y reporte PC Miller.

## Contenido

- `api/cumplimiento.js` — `obtenerViajesSafety`, `useViajesSafety`
- `model/cumplimiento.js` — `DOCUMENTOS_REQUERIDOS`, `NOMBRE_DOCUMENTO`, `esquemaViajeSafety`, `tieneDocumento`, `documentosFaltantes`, `cumplimientoCompleto`… (10)

Pruebas: `cumplimiento.test.js`.

## Endpoints que consume

| Endpoint | op | Función |
|---|---|---|
| `safety.php` | `get_safety_trips` | `obtenerViajesSafety()` |

## Reglas de negocio

- Cada documento llega como URL o como `null`; `null` significa que falta, no que haya error.
- `separarPorCumplimiento` alimenta las pestañas de la pantalla y `contarFaltantes` los contadores de cada columna.
- La búsqueda encuentra por cualquier parte del número del viaje, sin importar mayúsculas (`filtrarPorNumero`).

## Pendiente

- La subida y el borrado de documentos siguen dentro de `components/DocPreviewModal.jsx` y `components/PCMillerModal.jsx`, con `fetch` propio. La entidad todavía no tiene esas mutaciones.

## Quién lo usa

`features/safety`
