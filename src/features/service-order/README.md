# features/service-order

El Administrador de Órdenes de Servicio: la tabla de órdenes con sus filtros, la pestaña de inventario y los servicios editables de una orden.

## Contenido

- `ui/FilaOrden.jsx` — `FilaOrden`
- `ui/ServiciosDeOrden.jsx` — `ServiciosDeOrden`
- `ui/TablaInventario.jsx`
- `ui/TablaOrdenes.jsx`

## Cómo funciona

- La unidad de la orden —camión o caja— se resuelve con `nombreUnidad` y `etiquetaUnidad` de `entities/service-order`.
- Cada fila tiene Editar y Eliminar. Eliminar pide confirmación y avisa que las reparaciones regresan a pendientes y el gasto se queda.
- `ServiciosDeOrden` pinta los servicios que la orden ya tiene, con su origen y sus conceptos; la página de edición los compone con el alta de servicios nuevos.

## Pendiente

- `TablaOrdenes.jsx` y `TablaInventario.jsx` hacen `fetch` propio en lugar de usar `useOrdenes` y `useInventario`, que ya existen.
- No tiene controlador.

## Quién lo usa

`pages/mantenimientos`
