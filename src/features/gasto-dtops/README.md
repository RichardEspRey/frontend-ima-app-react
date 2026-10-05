# features/gasto-dtops

El alta del gasto de un DTOPS en Expense Manager al subir el documento en una etapa de cruce.

## Contenido

- `model/useGastoDtops.js` — `MONTO_MANUAL`, `useGastoDtops`
- `model/useGastoDtopsPendiente.js` — `useGastoDtopsPendiente`
- `ui/ModalGastoDtops.jsx` — `ModalGastoDtops`

Pruebas: `useGastoDtopsPendiente.test.js`.

## Cómo funciona

- `useGastoDtopsPendiente` espera la subida del DTOPS y decide si ofrecer el alta con la regla de `entities/expense` (`requiereGastoDtops`).
- `useGastoDtops` lleva el estado y el guardado del alta: los dos importes fijos u otro monto.

## Quién lo usa

`components/BorderCrossingFormNew2.jsx`, `pages/viajes`
