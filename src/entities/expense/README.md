# entities/expense

Los gastos: los generales de Expense Manager (`save_expense.php`), los de viaje y el diesel que llegan del móvil (`formularios.php`), y el gasto que nace de un DTOPS.

## Contenido

- `api/formularios.js` — `obtenerResumen`, `obtenerRegistros`, `obtenerRegistro`, `obtenerTickets`, `guardarRegistro`, `eliminarRegistro`… (14)
- `api/gastos.js` — `obtenerGastos`, `obtenerGasto`, `crearGasto`, `actualizarGasto`, `obtenerCatalogo`, `CATALOGO_GASTOS`… (11)
- `model/dtops.js` — `MONTOS_DTOPS`, `DOCUMENTO_DTOPS`, `SUBCATEGORIA_DTOPS`, `PAIS_DTOPS`, `MONEDA_DTOPS`, `resolverClasificacionDtops`… (9)
- `model/gastos.js` — `TODOS`, `renglonesDe`, `filtrarGastos`, `paisesDe`, `etiquetasDe`, `categoriasDeTipo`… (9)
- `model/orden.js` — `ORDEN_ACCESSORS`, `ordenarGastos`
- `model/registros.js` — `PAIS_REGISTRO`, `esquemaResumenViaje`, `identificadorViaje`, `filtrarResumen`, `totalDe`, `pendientesDe`… (8)
- `model/tipos.js` — `TIPO_REGISTRO`, `CAMPO_RESPUESTA`, `CATALOGO_REGISTRO`, `descriptorDe`
- `model/valores.js` — `esGastoMXN`, `totalDeDetalles`, `totalUSD`, `totalMXN`, `tipoGastoPrincipal`

Pruebas: `dtops.test.js`, `gastos.test.js`, `orden.test.js`, `registros.test.js`.

## Endpoints que consume

| Endpoint | op | Función |
|---|---|---|
| `formularios.php` | `getAll_gastos` / `getAll_diesel` | `obtenerResumen()` |
| `formularios.php` | `get_registers_gasto` / `get_registers_diesel` | `obtenerRegistros()` |
| `formularios.php` | `get_gasto` / `get_diesel` | `obtenerRegistro()` |
| `formularios.php` | `getTickets` | `obtenerTickets()` |
| `formularios.php` | `edit_gasto` / `edit_diesel` | `guardarRegistro()` |
| `formularios.php` | `delete_gasto` / `delete_diesel` | `eliminarRegistro()` |
| `formularios.php` | `add_manual_diesel` | `crearRegistroManual()` |
| `save_expense.php` | `getAllGastos` | `obtenerGastos()` |
| `save_expense.php` | `getGastoById` | `obtenerGasto()` |
| `save_expense.php` | `Alta` | `crearGasto()` |
| `save_expense.php` | `updateExpense` | `actualizarGasto()` |
| `save_expense.php` | `—` | `obtenerCatalogo()` |

## Reglas de negocio

- Todo gasto se guarda convertido a dólares en `monto_total`. Si viene en cero, el total sale de la suma de los renglones (`totalUSD`).
- Un gasto capturado en México trae en `cantidad_original` los pesos que se pagaron de verdad, y esa cifra manda; uno en dólares se convierte con el tipo de cambio y se marca como convertido (`totalMXN`).
- Un gasto de varios renglones entra en un filtro si **cualquiera** de sus renglones coincide.
- El tipo con el que se identifica un gasto de varios renglones es el del **último** renglón: es el criterio con el que la gente ya leía la tabla.
- `formularios.php` usa tres claves distintas según la operación: las listas vienen en `id`, un registro suelto en `row` y solo los tickets en `data` (`CAMPO_RESPUESTA`).
- Gasto y diesel son la misma pantalla tres veces; lo que cambia entre ellos está en un descriptor (`TIPO_REGISTRO`, `CATALOGO_REGISTRO`).
- Un DTOPS genera gasto solo si es el documento de la etapa (no de una parada), es un archivo nuevo y el viaje es de EUA. El gasto queda en EUA, en dólares y con un renglón (`construirGastoDtops`).

## Quién lo usa

`components/GastoRow.jsx`, `features/expense-manager`, `features/expenses`, `features/gasto-dtops`, `features/maintenance`, `hooks/expense_hooks/useFetchCategories.jsx`, `hooks/expense_hooks/useFetchExpenseTypes.jsx`, `hooks/expense_hooks/useFetchSubcategories.jsx`, `pages/gastos`
