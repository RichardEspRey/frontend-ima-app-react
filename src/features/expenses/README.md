# features/expenses

Gastos de viaje y diesel: el resumen por viaje, los registros de un viaje, la edición de uno y el alta manual de diesel.

## Contenido

- `ui/EditorRegistro.jsx` — `EditorRegistro`
- `ui/ModalDieselManual.jsx` — `OBLIGATORIOS_DIESEL`, `cargaEnBlanco`, `ModalDieselManual`
- `ui/RegistrosDeViaje.jsx` — `RegistrosDeViaje`
- `ui/ResumenPorViaje.jsx` — `ResumenPorViaje`

## Cómo funciona

- Gasto y diesel comparten las tres vistas: lo que cambia lo dice el descriptor de `entities/expense/model/tipos.js`, y las columnas se pintan según lo que declaren.

## Quién lo usa

`pages/gastos`
