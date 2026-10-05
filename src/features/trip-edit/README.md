# features/trip-edit

El editor de viaje que comparten la edición normal y la completa: etapas, paradas, documentos y facturas.

## Contenido

- `model/modos.js` — `MODO_EDICION`, `AJUSTES_MODO`, `ajustesDe`, `DOCUMENTOS_SIN_VENCIMIENTO`, `pideVencimiento`, `ESTADOS_FACTURABLES`… (8)
- `model/useEnlaceTransnacional.js` — `useEnlaceTransnacional`
- `ui/EditorViaje.jsx` — `EditorViaje`

## Cómo funciona

- Lo que cambia entre los dos modos de edición está en un descriptor (`AJUSTES_MODO`).
- Una etapa de cruce pasa de In Coming a In Transit al capturarle el CI (`estadoPorCi`).
- Solo se pueden generar facturas en ciertos estados del viaje (`ESTADOS_FACTURABLES`).

## Pendiente

- `EditorViaje.jsx` pasa de 550 líneas.

## Quién lo usa

`pages/viajes`
