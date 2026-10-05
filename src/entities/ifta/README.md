# entities/ifta

IFTA: millas recorridas y galones comprados por estado de EUA, por periodo y con los viajes que componen cada total.

## Contenido

- `api/ifta.js` — `obtenerPeriodosIfta`, `obtenerTotalesPorEstado`, `obtenerViajesIfta`, `usePeriodosIfta`, `useTotalesPorEstado`
- `model/ifta.js` — `esquemaPeriodoIfta`, `esquemaTotalEstado`, `rendimientoEstado`, `totalesIfta`, `agruparPorAnio`, `normalizarLista`

Pruebas: `ifta.test.js`.

## Endpoints que consume

| Endpoint | op | Función |
|---|---|---|
| `IFTA.php` | `periodos` | `obtenerPeriodosIfta()` |
| `IFTA.php` | `get_ifta_totals_by_state` | `obtenerTotalesPorEstado()` |
| `IFTA.php` | `get_ifta_trips` | `obtenerViajesIfta()` |

## Reglas de negocio

- El número que importa es el rendimiento por estado (millas por galón): el impuesto se paga por la diferencia entre dónde se recorrió y dónde se compró el combustible.
- `periodo` llega vacío en la respuesta real: el corte se decide con `trip_year` y los filtros de fecha.
- Un filtro solo viaja si trae valor: mandar un rango vacío cambiaría el resultado.

## Pendiente

- `pages/safety/IftaPage.jsx` pide `IFTA.php` con `fetch`. Conectarla a esta entidad es parte del incremento de su módulo: ver `docs/refactor/PENDIENTES.md`.

## Quién lo usa

**Nadie.** Ver *Pendiente*.
