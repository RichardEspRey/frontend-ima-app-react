# entities/inventory

El inventario del taller: refacciones y consumibles con su categoría y existencias.

## Contenido

- `api/inventario.js` — `obtenerInventario`, `useInventario`
- `model/articulo.js` — `esquemaArticulo`, `normalizarArticulos`, `sinNombre`, `estaAgotado`, `agruparPorCategoria`

Pruebas: `articulo.test.js`.

## Endpoints que consume

| Endpoint | op | Función |
|---|---|---|
| `inventory.php` | `getFullInventoryList` | `obtenerInventario()` |

## Reglas de negocio

- La operación se llama `getFullInventoryList`; `inventory.php` responde «Operación no válida» ante cualquier otra.
- Hay artículos sin nombre en la base: se marcan (`sinNombre`) para poder limpiarlos sin esconder sus existencias.
- El gasto que nace de una orden de servicio no alimenta el inventario (`omitir_inventario`).

## Pendiente

- `features/service-order/ui/TablaInventario.jsx` pide `inventory.php` con `fetch`. Conectarla a esta entidad es parte del incremento de su módulo: ver `docs/refactor/PENDIENTES.md`.

## Quién lo usa

**Nadie.** Ver *Pendiente*.
