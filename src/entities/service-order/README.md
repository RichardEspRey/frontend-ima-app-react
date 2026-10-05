# entities/service-order

Las órdenes de servicio del taller con sus servicios anidados.

## Contenido

- `api/ordenes.js` — `obtenerOrdenes`, `obtenerOrden`, `obtenerCamionesDeOrden`, `cambiarEstatusServicio`, `useOrdenes`, `useCamionesDeOrden`… (7)
- `model/orden.js` — `ESTATUS_ORDEN`, `esquemaServicio`, `esquemaOrden`, `normalizarOrdenes`, `nombreUnidad`, `etiquetaUnidad`… (9)

Pruebas: `orden.test.js`.

## Endpoints que consume

| Endpoint | op | Función |
|---|---|---|
| `service_order.php` | `getAllOrdersWithDetails` | `obtenerOrdenes()` |
| `service_order.php` | `getOrderById` | `obtenerOrden()` |
| `service_order.php` | `getTrucks` | `obtenerCamionesDeOrden()` |
| `service_order.php` | `updateDetailStatus` | `cambiarEstatusServicio()` |

## Reglas de negocio

- Estados de orden y de servicio: Abierta, Pendiente, Completado (los tres únicos, verificados contra la API).
- Una orden es de un camión o de una caja, nunca de las dos. `nombreUnidad` es lo que se filtra y `etiquetaUnidad` lo que se muestra («Caja 102»).
- Una orden sin servicios **no** cuenta como completa (`todoCompletado`).
- `tipo_cambio` llega nulo cuando la orden es en pesos.

## Quién lo usa

`components/OrderRow.jsx`, `features/service-order`
