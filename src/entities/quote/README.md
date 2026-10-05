# entities/quote

Las cotizaciones de viaje: millas, rate y tarifa, y el historial guardado.

## Contenido

- `api/cotizaciones.js` — `obtenerCotizaciones`, `guardarCotizacion`, `eliminarCotizacion`, `useCotizaciones`, `useGuardarCotizacion`, `useEliminarCotizacion`
- `model/cotizacion.js` — `ubicacionVacia`, `cotizacionDesdeApi`, `cotizacionParaGuardar`, `recalcularTarifa`, `millasTotales`

Pruebas: `cotizacion.test.js`.

## Endpoints que consume

| Endpoint | op | Función |
|---|---|---|
| `Cotizaciones.php` | `obtener_todas` | `obtenerCotizaciones()` |
| `Cotizaciones.php` | `guardar` | `guardarCotizacion()` |
| `Cotizaciones.php` | `eliminar` | `eliminarCotizacion()` |

## Reglas de negocio

- `tarifa = rate × millas`: al tocar una cifra se recalcula la que se pueda con las otras dos (`recalcularTarifa`).
- Las millas vacías —las de llegar al origen— se cobran, así que entran en el total (`millasTotales`).
- La API manda números como texto; se convierten al leer (`cotizacionDesdeApi`).

## Quién lo usa

`pages/viajes`
