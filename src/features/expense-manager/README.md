# features/expense-manager

Expense Manager: la tabla de gastos generales con sus filtros, su orden y el alta de gastos.

## Contenido

- `estilos.js` — `DATEPICKER_CSS`, `money`, `moneyMXN`
- `ui/FiltrosGastos.jsx` — `FiltrosGastos`
- `ui/ModalNuevoGasto.jsx`
- `ui/TablaGastos.jsx` — `TablaGastos`

## Cómo funciona

- El filtrado, el orden y los totales son reglas de `entities/expense`; aquí solo se pintan.
- Los filtros sobreviven a la navegación en `store/useGastosFiltrosStore.js`.

## Pendiente

- `ModalNuevoGasto.jsx` tiene `fetch` propio y pasa de 550 líneas.
- `estilos.js` exporta formatos de dinero que deberían vivir en `shared/lib/formato.js`.

## Quién lo usa

`components/GastoRow.jsx`, `pages/gastos`
