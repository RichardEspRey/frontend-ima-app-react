# features/cotizador

El cotizador de viajes: buscar origen y destino, trazar la ruta en el mapa, calcular la tarifa y guardar la cotización.

## Contenido

- `ui/BuscadorUbicacion.jsx` — `BuscadorUbicacion`
- `ui/HistorialCotizaciones.jsx` — `HistorialCotizaciones`
- `ui/MapaCotizacion.jsx` — `COLOR_COTIZACION`, `MapaCotizacion`
- `ui/ResumenCotizacion.jsx` — `dolares`, `millas`, `FilaResumen`, `BloqueResumen`, `ResumenCotizacion`

## Cómo funciona

- La tarifa se recalcula con la regla de `entities/quote` y la ruta con `entities/tracking`; aquí solo vive la interfaz.

## Pendiente

- `pages/viajes/CotizadorPage.jsx` todavía tiene `fetch` propio y pasa de 580 líneas: la lógica debería bajar a un controlador de esta feature.

## Quién lo usa

`pages/viajes`
