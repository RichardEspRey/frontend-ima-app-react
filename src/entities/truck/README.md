# entities/truck

Los camiones activos, para los selectores de los formularios de viaje.

## Contenido

- `api/camiones.js` — `obtenerCamionesActivos`, `useCamionesActivos`, `obtenerCamionesActivosCompletos`, `useCamionesActivosCompletos`

Sin pruebas: no tiene reglas propias, solo peticiones.

## Endpoints que consume

| Endpoint | op | Función |
|---|---|---|
| `trucks.php` | `getTrucksActivos` | `obtenerCamionesActivos()` |
| `trucks.php` | `getTrucksActivosComplete` | `obtenerCamionesActivosCompletos()` |

## Reglas de negocio

- Dos operaciones: la corta para los selectores y la completa (`getTrucksActivosComplete`) para la edición completa de viaje, que necesita más campos.

## Quién lo usa

`components/BorderCrossingFormNew2.jsx`, `components/TripFormMX.jsx`, `components/TripFormUSA.jsx`, `features/maintenance`, `features/trip-edit`
