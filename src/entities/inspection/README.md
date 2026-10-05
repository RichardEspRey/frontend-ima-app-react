# entities/inspection

Las inspecciones operativas hechas a un camión en ruta, con sus violaciones, sus multas y sus documentos.

## Contenido

- `api/inspecciones.js` — `obtenerInspecciones`, `guardarInspeccion`, `obtenerDescripciones`, `eliminarDocumento`, `useInspecciones`, `useDescripciones`… (8)
- `model/inspeccion.js` — `esquemaReporte`, `esquemaInspeccion`, `sinMulta`, `cuentaViolaciones`, `totalCuadra`, `normalizarInspecciones`

Pruebas: `inspeccion.test.js`.

## Endpoints que consume

| Endpoint | op | Función |
|---|---|---|
| `inspecciones.php` | `getAll` | `obtenerInspecciones()` |
| `inspecciones.php` | `save` | `guardarInspeccion()` |
| `inspecciones.php` | `get_descriptions` | `obtenerDescripciones()` |
| `inspecciones.php` | `delete_doc` | `eliminarDocumento()` |

## Reglas de negocio

- La multa se divide en lo que paga IMA y lo que paga el conductor; el `total` lo calcula el backend y aquí solo se comprueba que cuadre (`totalCuadra`).
- Los reportes llegan ya parseados en `reportes`; `reportes_json` es lo mismo como texto y no se toca.

## Pendiente

- `features/inspections` pide `inspecciones.php` con `fetch`. Conectarla a esta entidad es parte del incremento de su módulo: ver `docs/refactor/PENDIENTES.md`.

## Quién lo usa

**Nadie.** Ver *Pendiente*.
