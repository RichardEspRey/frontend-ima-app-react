# entities/driver

Los conductores activos, para los selectores de los formularios de viaje.

## Contenido

- `api/conductores.js` — `obtenerConductoresActivos`, `useConductoresActivos`

Sin pruebas: no tiene reglas propias, solo peticiones.

## Endpoints que consume

| Endpoint | op | Función |
|---|---|---|
| `drivers.php` | `getDriversActivosComplete` | `obtenerConductoresActivos()` |

## Reglas de negocio

- Se usa solo la operación `getDriversActivosComplete`. La corta devolvía menos gente y se dejó de usar el 2026-09-13, para que ninguna pantalla vea una lista distinta a la de al lado.
- Es un catálogo compartido: se cachea `FRESCURA_CATALOGO_MS`.

## Quién lo usa

`components/BorderCrossingFormNew2.jsx`, `components/TripFormMX.jsx`, `components/TripFormUSA.jsx`, `features/access-manager`, `features/trip-edit`, `pages/accesos`
