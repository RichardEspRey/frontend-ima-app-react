# Módulo: Mantenimientos

**El módulo más grande del proyecto**: 11 pantallas, 2 777 líneas y 6 endpoints distintos.
No es un módulo, son varios que comparten sección en el menú, y por eso se migra en tres
partes (9a, 9b, 9c en `docs/refactor/05-INCREMENTOS.md`).

## 9a — Órdenes de servicio e inventario · migrado

| Ruta | Archivo |
|---|---|
| `/admin-service-order` · `/view-inventory` | `pages/mantenimientos/OrdenesServicioPage.jsx` |
| `/new-service-order` | `pages/mantenimientos/NuevaOrdenPage.jsx` |
| `/editar-orden/:orderId` | `pages/mantenimientos/EditarOrdenPage.jsx` |

`OrdenesServicioPage` es un contenedor de dos pestañas, que viven en
`features/service-order/ui/`: `TablaOrdenes` y `TablaInventario`.

### Entidades

- **`entities/service-order`** — `service_order.php`
- **`entities/inventory`** — `inventory.php`

| Endpoint | op | Qué hace |
|---|---|---|
| `service_order.php` | `getAllOrdersWithDetails` | Órdenes **con sus servicios anidados** |
| `service_order.php` | `getOrderById` | Una orden, para editarla |
| `service_order.php` | `getTrucks` | Camiones, ya con forma `{value, label}` |
| `service_order.php` | `AltaOrden` / `UpdateOrder` | Alta y edición |
| `service_order.php` | `updateDetailStatus` | Cambia el estatus de un servicio |
| `inventory.php` | `getFullInventoryList` | Inventario cruzado con sus categorías |

### Reglas de negocio

- Una orden y cada uno de sus servicios están en `Abierta`, `Pendiente` o `Completado`.
  Verificado contra las 345 órdenes reales: no hay más valores.
- Una orden **sin servicios no cuenta como completada**: no hay nada hecho todavía.
- `tipo_cambio` viene nulo en las órdenes en pesos. **No es 0.**
- Cada pestaña declara el permiso que la habilita, así que un usuario solo ve las suyas y
  la primera visible se selecciona sola.

### Cosas que sorprenden

- **El `op` del inventario es `getFullInventoryList`, no `getAll`.** `inventory.php`
  responde "Operación no válida" ante cualquier otra.
- **Los servicios vienen anidados** dentro de cada orden en una sola llamada: expandir una
  fila no dispara otra petición.
- **Hay artículos sin nombre en el inventario**, uno de ellos con stock 1. Son datos reales
  de producción. Se conservan y se marcan con `sinNombre()`: descartarlos escondería
  existencias. La pantalla ya los pinta como "Sin nombre".
- `NuevaOrdenPage` y `EditarOrdenPage` comparten más de la mitad de su código (336 líneas
  distintas de 848). **Candidatas a fusionarse**, pendiente para el incremento de
  deduplicación.

## 9b — Afinaciones y autonomía · migrado

| Ruta | Archivo |
|---|---|
| `/afinaciones` | `pages/mantenimientos/AfinacionesPage.jsx` |
| `/registros-afinaciones` | `pages/mantenimientos/AfinacionesHistorialPage.jsx` |
| `/autonomia` | `pages/mantenimientos/AutonomiaPage.jsx` |

### Entidades

- **`entities/tuning`** — `afinaciones.php`
- **`entities/autonomy`** — `autonomia.php`

| op | Qué hace |
|---|---|
| `get_maintenance_status` | Estado de afinación de cada camión, con sus últimas cargas |
| `get_history` | Afinaciones ya registradas |
| `reset_counter` | Registra una afinación y reinicia el contador |
| `update_limit` | Cambia cada cuántas millas se afina un camión |
| `correct_odometer` | Corrige una lectura mal capturada |
| `get_truck_autonomy` | Rendimiento por camión, con registros anidados |

### Reglas de negocio

- Un camión está **al día**, **próxima** (80 % del límite o más) o **vencida** (100 % o más).
- El límite es por camión, no global: se cambia con `update_limit`.
- `millas_acumuladas` **las calcula el backend**. La entidad las toma tal cual y no las
  recalcula: hacerlo daría dos verdades que pueden discrepar.
- El promedio de MPG **ignora los registros con rendimiento 0**: son cargas sin recorrido
  asociado y hundían el promedio sin que nada hubiera pasado.

### Cosas que sorprenden

- **Hay lecturas de odómetro mal capturadas en producción.** Un registro tiene 149 946
  entre valores de 1,5 millones — un dígito perdido al teclear. Por eso existe
  `correct_odometer`, y por eso la entidad tiene `lecturasSospechosas()`, que compara cada
  lectura contra **sus dos vecinos**: así distingue un error de captura de un odómetro que
  de verdad se reinició.
- Las tres operaciones de escritura no aparecían al buscar `append('op', …)` en la
  pantalla: van por una función común que recibe el `op` como parámetro.

## 9c — pendiente

Reparaciones en ruta + Inspecciones (`roadside_repairs.php`, `inspecciones.php`,
`formularios.php`). Van al final porque son lo que Emiliano tocó más reciente.
