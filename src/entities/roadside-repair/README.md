# entities/roadside-repair

Las reparaciones en ruta: averías atendidas durante un viaje, con su costo y sus comprobantes.

## Contenido

- `api/reparaciones.js` — `obtenerReparaciones`, `guardarReparacion`, `eliminarDocumento`, `useReparaciones`, `useGuardarReparacion`, `useEliminarDocumentoReparacion`
- `model/reparacion.js` — `esquemaDocumento`, `esquemaReparacion`, `fechaRelevante`, `totalCuadra`, `tieneDocumentos`, `normalizarReparaciones`

Pruebas: `reparacion.test.js`.

## Endpoints que consume

| Endpoint | op | Función |
|---|---|---|
| `roadside_repairs.php` | `getAll` | `obtenerReparaciones()` |
| `roadside_repairs.php` | `save` | `guardarReparacion()` |
| `roadside_repairs.php` | `delete_doc` | `eliminarDocumento()` |

## Reglas de negocio

- `fecha_suceso` es cuándo ocurrió la avería y `fecha_registro` cuándo se capturó. `fecha_suceso` solo viaja si trae valor, para que un cliente que no la manda —la app móvil— no la borre.
- El total lo calcula el backend; aquí solo se detecta si no cuadra.

## Pendiente

- `features/inspections/ui/TablaReparaciones.jsx` y `ReparacionModal.jsx` piden `roadside_repairs.php` con `fetch`. Conectarla a esta entidad es parte del incremento de su módulo: ver `docs/refactor/PENDIENTES.md`.

## Quién lo usa

**Nadie.** Ver *Pendiente*.
