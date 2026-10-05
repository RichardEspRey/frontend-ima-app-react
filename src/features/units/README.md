# features/units

El administrador de unidades —camiones, cajas y conductores— con su expediente de documentos.

## Contenido

- `ui/AdminUnidades.jsx` — `AdminUnidades`
- `ui/EstadoDocumento.jsx` — `EstadoDocumento`
- `ui/ModalBaja.jsx` — `ModalBaja`
- `ui/ModalColumnas.jsx` — `ModalColumnas`
- `ui/ModalRequisitos.jsx` — `ModalRequisitos`
- `ui/ModalUnidad.jsx` — `ModalUnidad`
- `ui/TablaUnidades.jsx` — `TablaUnidades`

## Cómo funciona

- Un solo `AdminUnidades` para los tres tipos: lo que cambia lo dice el descriptor de `entities/unit` (patrón shell + descriptores).
- Los requisitos y las columnas visibles del expediente se configuran desde la propia pantalla.

## Quién lo usa

`pages/unidades`
