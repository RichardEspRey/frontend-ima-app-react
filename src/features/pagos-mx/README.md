# features/pagos-mx

El pago por trayecto de los viajes mexicanos: el catálogo de destinos con su monto por viaje.

## Contenido

- `ui/CatalogoTrayectos.jsx` — `CatalogoTrayectos`

## Reglas de negocio

- Un viaje mexicano se paga con el monto en pesos de su trayecto, no por milla.
- Un trayecto no se borra: se desactiva, para que los pagos que ya lo usaron lo sigan nombrando.
- Un trayecto sin monto no se puede usar para autorizar un pago.

La regla de datos y las llamadas viven en `entities/finance` (`model/trayectos.js`, `api/trayectos.js`).
