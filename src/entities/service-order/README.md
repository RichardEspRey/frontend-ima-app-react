# entities/service-order

Las órdenes de servicio del taller con sus servicios anidados.

## Contenido

- `api/ordenes.js` — `obtenerOrdenes`, `obtenerOrden`, `actualizarOrden`, `eliminarOrden`, `useOrden`, `useEliminarOrden`… (13)
- `model/orden.js` — `ESTATUS_ORDEN`, `esquemaOrden`, `esquemaOrdenCompleta`, `origenDeServicio`, `separarManoDeObra`, `etiquetaUnidad`… (15)

Pruebas: `orden.test.js`.

## Endpoints que consume

| Endpoint | op | Función |
|---|---|---|
| `service_order.php` | `getAllOrdersWithDetails` | `obtenerOrdenes()` |
| `mtto.php` | `getOrden` | `obtenerOrden()` |
| `service_order.php` | `UpdateOrder` | `actualizarOrden()` |
| `mtto.php` | `eliminarOrden` | `eliminarOrden()` |
| `service_order.php` | `getTrucks` | `obtenerCamionesDeOrden()` |
| `service_order.php` | `updateDetailStatus` | `cambiarEstatusServicio()` |

## Reglas de negocio

- Estados de orden y de servicio: Abierta, Pendiente, Completado (los tres únicos, verificados contra la API).
- Una orden es de un camión o de una caja, nunca de las dos. `nombreUnidad` es lo que se filtra y `etiquetaUnidad` lo que se muestra («Caja 102»).
- Una orden sin servicios **no** cuenta como completa (`todoCompletado`).
- `tipo_cambio` llega nulo cuando la orden es en pesos.
- Para editar, la orden sale de `mtto.php · getOrden`, que trae el origen de cada servicio y la categoría y el gasto de cada concepto; `getOrderById` no los trae.
- Eliminar una orden regresa sus reparaciones a pendientes; el gasto se queda y el inventario de órdenes viejas no se regresa. Por eso `useEliminarOrden` también invalida el flujo de Reparaciones.

## Quién lo usa

`features/service-order`, `pages/mantenimientos`
