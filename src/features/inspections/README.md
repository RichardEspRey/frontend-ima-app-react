# features/inspections

Las tablas y los modales de inspecciones operativas y de reparaciones en ruta.

## Contenido

- `ui/InspeccionModal.jsx`
- `ui/ReparacionModal.jsx`
- `ui/TablaInspecciones.jsx`
- `ui/TablaReparaciones.jsx`

## Pendiente

- Los cuatro componentes hacen `fetch` propio en lugar de usar `entities/inspection` y `entities/roadside-repair`, que ya existen y tienen pruebas.
- `InspeccionModal.jsx` y `ReparacionModal.jsx` pasan de 450 líneas.
- No tiene `index.js` ni controlador: la lógica vive dentro de los componentes.

## Quién lo usa

`pages/mantenimientos`, `pages/safety`, `pages/viajes`
