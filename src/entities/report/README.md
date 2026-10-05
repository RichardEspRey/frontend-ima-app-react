# entities/report

Las gráficas del tablero de Reports, todas de `charts.php`.

## Contenido

- `api/graficas.js` — `GRAFICAS`, `obtenerGrafica`, `useGrafica`, `useGraficas`
- `model/graficas.js` — `aDia`, `aMes`, `etiquetaMes`, `normalizarFinanzas`, `normalizarMantenimiento`, `agruparDieselPorMes`… (7)

Pruebas: `graficas.test.js`.

## Endpoints que consume

| Endpoint | op | Función |
|---|---|---|
| `charts.php` | `chart_` | `obtenerGrafica()` |

## Reglas de negocio

- Las gráficas son una tabla de datos (`GRAFICAS`) con el `op` de cada una: agregar una es agregar una línea, no otra copia del mismo pedido.
- Se piden en paralelo (`useGraficas`): una lenta no retrasa a las demás.
- El diesel llega por carga y se agrupa por mes aquí, no en el JSX (`agruparDieselPorMes`).

## Quién lo usa

`pages/reports`
