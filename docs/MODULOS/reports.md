# Módulo: Reports e Inicio

Dos pantallas sin relación entre sí más allá de ser las primeras que ve alguien al entrar.

| Ruta | Archivo | Qué hace |
|---|---|---|
| `/reports` | `pages/reports/ReportsPage.jsx` | Seis gráficas: diesel, finanzas y mantenimiento |
| `/home` | `pages/inicio/InicioPage.jsx` | Misión, visión, valores y políticas. **Contenido estático** |

`InicioPage` no llama a la API: es texto y estilos. Por eso no tiene entidad, y por eso el
refactor apenas la toca — no había nada que extraer.

## Entidad

**`entities/report`** — las seis gráficas de `charts.php`.

Todas salen del mismo endpoint cambiando el `op`, así que en vez de seis funciones
idénticas hay una **tabla de datos**: agregar una gráfica es agregar una línea a `GRAFICAS`.

| op | Devuelve |
|---|---|
| `chart_diesel` | `galones`, `monto`, `fecha`, `fleetone` — una fila por carga |
| `chart_diesel_table` | `anio`, `mes`, `total_galones`, `total_monto`, `total_fleetone`, `avg_cost` |
| `chart_diesel_cost` | `id`, `x`, `y` — acepta el parámetro `period` |
| `chart_finances` | `periodo`, `total_rate`, `total_paid` |
| `chart_finances_rts` | Lo mismo que `chart_finances`, distinto origen |
| `chart_maintenance_costs` | `periodo`, `total` |

Claves verificadas contra la API real el 2026-08-31, no supuestas.

## Cosas que sorprenden

- **`chart_diesel` devuelve una fila por carga, no por mes.** La suma mensual la hace
  `agruparDieselPorMes` en el modelo; antes estaba escrita a mano dentro de un `useMemo`
  en el JSX.
- **`chart_diesel_cost` es la única que recibe parámetros** (`period`). Entra en la
  `queryKey`, así que cambiar de periodo trae su propio resultado sin pisar el anterior ni
  volver a pedir lo que ya está cacheado.
- **Los montos llegan como cadena**, igual que en el resto de la API.
- Las seis se piden **en paralelo** con `useGraficas`: una lenta no retrasa a las demás.

## Historial

Migrado en el incremento 7 (2026-08-31).

- `Reports.jsx` estaba **importado dos veces** en `AppRouter`, como `HomeScreen` y como
  `Reports`. El primero no tenía ninguna ruta. Eliminado.
- `Welcome.jsx` se renombró a `InicioPage`: su ruta es `/home` y el menú la llama Inicio;
  el nombre del archivo era el único sitio donde se llamaba Welcome.
- La pantalla pasó de 467 a 348 líneas y perdió 12 `useState`, seis funciones de fetch y
  dos `useEffect`.
