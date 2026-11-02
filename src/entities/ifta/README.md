# entities/ifta

IFTA: millas recorridas y galones comprados por estado de EUA, por periodo y con los viajes que componen cada total.

## Contenido

- `api/ifta.js` — `obtenerPeriodosIfta`, `obtenerTotalesPorEstado`, `obtenerViajesIfta`, `usePeriodosIfta`, `useTotalesPorEstado`
- `model/ifta.js` — `esquemaPeriodoIfta`, `esquemaTotalEstado`, `rendimientoEstado`, `totalesIfta`, `agruparPorAnio`, `normalizarLista`, `PERIODO_VACIO`, `etiquetaPeriodo`, `filtrosTotalesIfta`, `totalConAjuste`, `periodosDisponibles`, `filtrarPeriodos`, `llavePeriodo`

Pruebas: `ifta.test.js`, `filtros.test.js`.

## Endpoints que consume

| Endpoint | op | Función |
|---|---|---|
| `IFTA.php` | `periodos` | `obtenerPeriodosIfta()` |
| `IFTA.php` | `get_ifta_totals_by_state` | `obtenerTotalesPorEstado()` |
| `IFTA.php` | `get_ifta_trips` | `obtenerViajesIfta()` |
| `IFTA.php` | `get_ifta_trips_by_state` | la página (`fetch`) |
| `IFTA.php` | `periodo_trips` | la página (`fetch`) |

## Reglas de negocio

- El número que importa es el rendimiento por estado (millas por galón): el impuesto se paga por la diferencia entre dónde se recorrió y dónde se compró el combustible.
- `periodo` es el trimestre (`Q1`–`Q4`); llega vacío en el diesel sin periodo asignado, y se filtra aparte con `PERIODO_VACIO`.
- Las millas por estado se filtran por fechas **o** por rango de viajes, nunca ambos. El número de viaje se reinicia cada año, así que el rango lleva el año en dos dígitos (`filtrosTotalesIfta`).
- Las millas se pueden ajustar a mano por estado antes de exportar el PDF; el ajuste no se guarda (`totalConAjuste`).
- Un filtro solo viaja si trae valor: mandar un rango vacío cambiaría el resultado.

## Pendiente

- `pages/safety/IftaPage.jsx` pide `IFTA.php` con `fetch`. Conectarla a esta entidad es parte del incremento de su módulo: ver `docs/refactor/PENDIENTES.md`.

## Quién lo usa

`pages/safety/IftaPage.jsx` usa las reglas de `model/`; la parte de `api/` todavía no. Ver *Pendiente*.
