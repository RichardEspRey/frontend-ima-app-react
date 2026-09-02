# Módulo: Gastos

Dos sistemas de gastos que conviven, cada uno con su endpoint y su forma de trabajar.

| Ruta | Archivo | Familia |
|---|---|---|
| `/admin-gastos-generales` | `pages/gastos/ExpenseManagerPage.jsx` | `save_expense.php` |
| `/edit-expense/:id_gasto` | `pages/gastos/EditarGastoGeneralPage.jsx` | `save_expense.php` |
| `/admin-gastos` | `pages/gastos/GastosViajePage.jsx` | `formularios.php` |
| `/detalle-gastos/:tripId` | `pages/gastos/GastosDeViajePage.jsx` | `formularios.php` |
| `/editor-gastos/:id/:trip_id` | `pages/gastos/EditarGastoPage.jsx` | `formularios.php` |
| `/admin-diesel` | `pages/gastos/DieselPage.jsx` | `formularios.php` |
| `/detalle-diesel/:tripId` | `pages/gastos/DieselDeViajePage.jsx` | `formularios.php` |
| `/editor-diesel/:id/:trip_id` | `pages/gastos/EditarDieselPage.jsx` | `formularios.php` |

## Las dos familias

**Gastos generales** (`save_expense.php`) es el sistema nuevo: una factura o un ticket con
uno o varios conceptos, cada uno con tipo, categoría y subcategoría. Se capturan desde la
aplicación móvil y se administran desde el Expense Manager.

**Gastos de viaje y diesel** (`formularios.php`) es el sistema por viaje: cuánto gastó y
cuánto cargó cada viaje. Tres pantallas —resumen, registros de un viaje, edición de uno—
que existen dos veces, una por familia.

## Entidades y features

- **`entities/expense/model/tipos.js`** — descriptores de gasto y diesel en `formularios.php`.
- **`entities/expense/model/registros.js`** — filtros y pendientes de conciliar.
- **`entities/expense/model/gastos.js`** — filtros, catálogos encadenados y totales del Expense Manager.
- **`entities/expense/model/valores.js`** — las reglas del dinero.
- **`entities/expense/model/orden.js`** — el orden de la tabla.
- **`features/expenses`** — las tres formas compartidas entre gastos de viaje y diesel.
- **`features/expense-manager`** — filtros, tabla, modal de alta y estilos del Expense Manager.

## Reglas de negocio

- **Todos los gastos se guardan convertidos a dólares** en `monto_total`, sea cual sea la
  moneda en que se capturaron. Cuando ese campo viene en cero, el total se calcula sumando
  los conceptos: hay 13 gastos así.
- Un gasto capturado en México trae además **`cantidad_original`**, la cantidad en pesos que
  de verdad se pagó, y **esa es la que vale**. Uno capturado en dólares se convierte con el
  tipo de cambio del día y se marca como convertido, para que en pantalla se distinga de una
  cifra real. Sin tipo de cambio no se inventa un importe: se cuenta aparte.
- Un gasto de varios conceptos **entra en un filtro si cualquiera de ellos coincide**: se
  factura junto pero puede mezclar categorías.
- El tipo de gasto que se lee en la tabla es el del **último** concepto.
- Los tres selectores de clasificación van **encadenados**: el tipo acota las categorías y la
  categoría acota las subcategorías. Si un filtro se queda sin suelo, se limpia solo.
- La **descripción se busca sin acentos**, porque se captura a mano y la mitad llega sin ellos.
- El renglón de totales **solo aparece con algún filtro puesto**: sumar los 1 638 gastos de
  golpe no dice nada; sumar los que se están mirando sí.
- Solo el diesel admite **alta manual**: los gastos se capturan desde la móvil. El registro
  queda marcado como manual para distinguirlo de los que llegan del proveedor.
- El diesel lleva **pendientes de conciliar** contra el estado de cuenta y contra FleetOne.

## Cosas que sorprenden

- **`formularios.php` usa tres claves de respuesta distintas, y ninguna es `data`.** Las
  listas vienen en un campo llamado **`id`** —un arreglo en un campo que se llama id—, un
  registro suelto en **`row`** y dentro de un arreglo de uno, y solo los tickets en `data`.
  `save_expense.php`, en cambio, usa `data` como todo el mundo.
- **La API devuelve los 1 638 gastos de una vez**, con sus conceptos y sus tickets. Filtrar,
  ordenar y paginar se hace en el navegador; no hay ida y vuelta por página.
- Los filtros del Expense Manager viven en un **store de zustand**, no en el componente, para
  que sigan puestos al volver de editar un gasto. Es lo que se hace todo el día desde ahí.
- El resumen de diesel tiene **dos pestañas** —pendientes y completados— y el de gastos no.
  Lo dice el descriptor, no una copia de la pantalla.
- `/new-expense` está en `menuConfig.js` pero **comentado**, y no tiene ruta en el router.

## Lo que se arregló al migrar

- Las tres formas de `formularios.php` estaban escritas dos veces con **68–75 % de líneas
  idénticas**; ahora hay una de cada.
- `GastoRow` recibía `navigate` como propiedad en vez de usar `useNavigate`.
- `renderPantalla`, el ayudante de pruebas, no montaba `QueryClientProvider`. No hacía falta
  mientras las pantallas usaran `fetch` a pelo; en cuanto una usó TanStack Query, la prueba
  que ya existía lo destapó.
