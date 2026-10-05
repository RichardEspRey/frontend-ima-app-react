# entities/tuning

Las afinaciones: cuántas millas lleva cada camión desde la última y su historial.

## Contenido

- `api/afinaciones.js` — `obtenerAfinaciones`, `obtenerHistorial`, `registrarAfinacion`, `actualizarLimite`, `corregirOdometro`, `useAfinaciones`… (10)
- `model/afinacion.js` — `UMBRAL_PROXIMA`, `ESTADO_AFINACION`, `esquemaRegistroDiesel`, `esquemaAfinacion`, `esquemaHistorial`, `progresoAfinacion`… (10)

Pruebas: `afinacion.test.js`.

## Endpoints que consume

| Endpoint | op | Función |
|---|---|---|
| `afinaciones.php` | `get_maintenance_status` | `obtenerAfinaciones()` |
| `afinaciones.php` | `get_history` | `obtenerHistorial()` |
| `afinaciones.php` | `reset_counter` | `registrarAfinacion()` |
| `afinaciones.php` | `update_limit` | `actualizarLimite()` |
| `afinaciones.php` | `correct_odometer` | `corregirOdometro()` |

## Reglas de negocio

- Cada camión tiene un límite de millas; al 80 % la afinación se marca próxima y al pasarlo, vencida (`UMBRAL_PROXIMA`, `ESTADO_AFINACION`).
- La lectura del odómetro sale de las cargas de diesel; una lectura fuera de orden se marca como sospechosa.
- Registrar una afinación reinicia el contador de millas del camión (`reset_counter`).

## Pendiente

- `pages/mantenimientos/AfinacionesPage.jsx` y `AfinacionesHistorialPage.jsx` piden `afinaciones.php` con `fetch`. Conectarla a esta entidad es parte del incremento de su módulo: ver `docs/refactor/PENDIENTES.md`.

## Quién lo usa

**Nadie.** Ver *Pendiente*.
