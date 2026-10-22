# features/maintenance

La pantalla Reparaciones: inspecciones por lado, reparaciones pendientes por unidad y la orden de servicio que se arma desde ellas.

## Contenido

- `model/filtros.js` — `SIN_FILTROS_INSPECCION`, `SIN_FILTROS_PENDIENTE`, `ORIGENES`, `hayFiltros`, `deLaPestana`, `filtrarInspecciones`… (7)
- `model/orden.js` — `conceptoEnBlanco`, `gastoEnBlanco`, `servicioDesdePunto`, `servicioDesdePendiente`, `servicioEnBlanco`… (9)
- `model/useConstructorOrden.js` — `useConstructorOrden`
- `model/usePanelInspecciones.js` — `usePanelInspecciones`
- `model/usePanelPendientes.js` — `usePanelPendientes`
- `ui/BarraFiltros.jsx` — `BarraFiltros`
- `ui/ConstructorOrden.jsx` — `ConstructorOrden`
- `ui/FilaInspeccion.jsx` — `FilaInspeccion`
- `ui/FilaUnidadPendiente.jsx` — `FilaUnidadPendiente`
- `ui/GastoServicio.jsx` — `GastoServicio`
- `ui/ModalPendienteManual.jsx` — `ModalPendienteManual`
- `ui/PanelInspecciones.jsx` — `PanelInspecciones`
- `ui/PanelPendientes.jsx` — `PanelPendientes`
- `ui/RubrosInspeccion.jsx` — `RubrosInspeccion`
- `ui/ServicioOrden.jsx` — `ServicioOrden`

## Cómo funciona

- Tres controladores, uno por panel: `usePanelInspecciones`, `usePanelPendientes` y `useConstructorOrden`.
- La orden lleva un servicio por reparación; cada servicio puede llevar su mano de obra y su gasto, que nace completo y entra al Administrador de Gastos sin alimentar el inventario.
- El texto del operador se puede editar al armar la orden; el original se conserva.
- Los conceptos del gasto se clasifican solo por categoría; la subcategoría va nula.
- Descartar una pendiente va por id (`descartarPendientes`), así que también sirve con las levantadas a mano. La descartada se queda en la lista, tachada, y ya no se puede elegir ni ofrecer en otra orden.
- La alta manual de pendientes ofrece todos los camiones y cajas activos, no solo los disponibles.
- La paginación de pendientes cuenta unidades, no reparaciones.

## Quién lo usa

`pages/mantenimientos`
