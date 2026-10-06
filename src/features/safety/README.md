# features/safety

La revisión de documentos de los viajes cerrados: libro electrónico, reporte diesel y reporte PC Miller, con su subida.

## Contenido

- `model/useCumplimientoViajes.js` — `VISTA_CUMPLIMIENTO`, `useCumplimientoViajes`
- `ui/FiltroCumplimiento.jsx` — `FiltroCumplimiento`
- `ui/ModalDocumentoSafety.jsx` — `ModalDocumentoSafety`
- `ui/TablaCumplimiento.jsx` — `TablaCumplimiento`

## Cómo funciona

- `useCumplimientoViajes` es el controlador: la consulta de `entities/safety`, la búsqueda, qué lista se ve (pendientes o completos), el conteo de faltantes y qué documento está abierto.
- `TablaCumplimiento` pinta los viajes sobre `DataTable`, de 50 en 50, y valida el archivo elegido por su contenido antes de abrir el modal (`archivoDelEvento`).
- `ModalDocumentoSafety` abre el de PC Miller, que además lee el reporte, o la vista previa para los otros dos. Al subir o borrar, invalida la consulta en vez de volver a pedirla a mano.

## Pendiente

- Los dos modales siguen en `components/` con su propio `fetch`; ver el README de `entities/safety`.

## Quién lo usa

`pages/safety`
