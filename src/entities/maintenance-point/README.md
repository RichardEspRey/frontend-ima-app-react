# entities/maintenance-point

El flujo de Reparaciones: los puntos que el operador reporta en la inspección final, su destino y las reparaciones que esperan orden.

## Contenido

- `api/puntos.js` — `obtenerInspeccionesMtto`, `obtenerPuntos`, `obtenerPendientes`, `obtenerNomenclaturas`, `useNomenclaturas`, `resolverPuntos`, `descartarPendientes`, `useInspeccionesPorAtender`, `useAvisosDeInspecciones`… (24)
- `model/punto.js` — `UNIDAD`, `ESTATUS_PUNTO`, `ESTATUS_LADO`, `ETIQUETA_ESTATUS`, `RUBROS`, `esPuntoSinFalla`, `esDescartada`, `contarPorAtender`, `avisosDeInspecciones`… (21)

Pruebas: `punto.test.js`.

## Endpoints que consume

| Endpoint | op | Función |
|---|---|---|
| `mtto.php` | `getInspecciones` | `obtenerInspeccionesMtto()` |
| `mtto.php` | `getPuntos` | `obtenerPuntos()` |
| `mtto.php` | `getPendientes` | `obtenerPendientes()` |
| `formularios.php` | `All_CL_Final` | `obtenerNomenclaturas()` |
| `mtto.php` | `resolverPuntos` | `resolverPuntos()` |
| `mtto.php` | `descartarPendientes` | `descartarPendientes()` |
| `mtto.php` | `crearPendiente` | `crearPendiente()` |
| `mtto.php` | `completarLado` | `completarLado()` |
| `mtto.php` | `crearOrden` | `crearOrden()` |

## Reglas de negocio

- Cada punto tiene estado: sin resolver, en pendientes, con orden o descartado. **Un lado no se puede cerrar mientras quede un punto sin resolver**; el servidor lo vuelve a comprobar (`completarLado`).
- Una inspección se trabaja por dos lados, camión y caja: el rubro Remolque es de la caja y los otros cinco del camión (`RUBROS`).
- La campana avisa cada inspección por lado: camión y caja son dos avisos aunque vengan del mismo viaje. Entran las abiertas y las cerradas de los últimos 14 días (`avisosDeInspecciones`).
- Lo que el operador escribe cuando no hay falla («ok», «bien»…) se esconde: eran 64 de 145 renglones en producción (`esPuntoSinFalla`).
- Un punto resuelto se sigue viendo —tachado si se descartó— pero no se puede volver a mandar.
- Las pendientes descartadas siguen llegando en `getPendientes`, con su estatus: se muestran tachadas y no cuentan como vigentes (`esDescartada`, `reparacionesVigentes`).
- El ícono de Mantenimientos del menú cuenta las inspecciones sin cerrar de cada lado (`contarPorAtender`), con la misma caché que la pestaña de inspecciones.
- Las pendientes se agrupan por unidad porque la orden se levanta por unidad (`agruparPorUnidad`).
- La nomenclatura del viaje sale de `All_CL_Final`, no de `trips`: la arma un procedimiento del servidor.
- Resolver un punto mueve inspecciones, puntos y pendientes a la vez; por eso todo cuelga de una llave raíz (`LLAVE_MANTENIMIENTO`).

## Quién lo usa

`components/Sidebar.jsx`, `entities/service-order`, `features/maintenance`
