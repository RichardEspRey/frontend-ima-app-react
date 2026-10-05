# entities/autonomy

La autonomía de la flota: cuántas millas recorre cada camión por galón, con sus registros de rendimiento.

## Contenido

- `api/autonomia.js` — `obtenerAutonomia`, `useAutonomia`
- `model/autonomia.js` — `esquemaRegistroAutonomia`, `esquemaAutonomia`, `promedioMpg`, `ultimoRegistro`, `totales`, `normalizarAutonomias`

Pruebas: `autonomia.test.js`.

## Endpoints que consume

| Endpoint | op | Función |
|---|---|---|
| `autonomia.php` | `get_truck_autonomy` | `obtenerAutonomia()` |

## Reglas de negocio

- Los registros llegan del más reciente al más antiguo; `ultimoRegistro` toma el primero sin reordenar.
- `promedioMpg` y `totales` se calculan aquí y no en el JSX, para poder probarlos sin montar la pantalla.

## Pendiente

- `pages/mantenimientos/AutonomiaPage.jsx` pide `autonomia.php` con `fetch` y no usa `useAutonomia`. Conectarla a esta entidad es parte del incremento de su módulo: ver `docs/refactor/PENDIENTES.md`.

## Quién lo usa

**Nadie.** Ver *Pendiente*.
