# features/service-order

El Administrador de Órdenes de Servicio: la tabla de órdenes con sus filtros y la pestaña de inventario.

## Contenido

- `ui/TablaInventario.jsx`
- `ui/TablaOrdenes.jsx`

## Cómo funciona

- La unidad de la orden —camión o caja— se resuelve con `nombreUnidad` y `etiquetaUnidad` de `entities/service-order`.

## Pendiente

- `TablaOrdenes.jsx` y `TablaInventario.jsx` hacen `fetch` propio en lugar de usar `useOrdenes` y `useInventario`, que ya existen.
- `TablaOrdenes.jsx` usa `<Grid item xs>`, que MUI 7 ignora.
- No tiene `index.js` ni controlador.

## Quién lo usa

`pages/mantenimientos`
