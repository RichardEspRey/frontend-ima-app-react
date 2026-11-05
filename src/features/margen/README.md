# features/margen

Las gráficas del Reporte de Margen de Utilidad.

## Contenido

- `ui/GraficasMargen.jsx` — `GraficasMargen`

## Cómo funciona

- Recibe los viajes que ya calculó la página (Total Tarifa, diesel, pago al chofer y margen) y se queda con los completados.
- La suma por mes y los porcentajes salen de `entities/finance` (`margenPorMes`); aquí solo se dibujan.
- Son las mismas barras de la gráfica del Expense Manager: últimos 12 meses, tooltip por mes. El margen se pinta en verde o en rojo según el signo.

## Quién lo usa

`pages/finanzas`
