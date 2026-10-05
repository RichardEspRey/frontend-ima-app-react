# features/estatus-cajas

El tablero de Estatus de cajas: dónde está cada caja, si va cargada, su fianza, su broker y su comentario. Es la plantilla de `docs/CREAR-UNA-PANTALLA.md`.

## Contenido

- `model/useTableroCajas.js` — `useTableroCajas`
- `ui/CeldaComentario.jsx` — `CeldaComentario`
- `ui/CeldaFianza.jsx` — `CeldaFianza`
- `ui/ModalFianza.jsx` — `ModalFianza`
- `ui/SelectCelda.jsx` — `SelectCelda`
- `ui/TablaEstatusCajas.jsx` — `TablaEstatusCajas`
- `ui/coloresEstatus.js` — `COLORES_ESTATUS_CAJA`

## Cómo funciona

- `useTableroCajas` es el controlador: la consulta, las dos mutaciones, quién captura y qué diálogo está abierto. La página solo compone.
- La captura usa actualización optimista: el combo responde al instante y se revierte si la API falla.
- El tablero se refresca cada 5 minutos con la ventana al frente; el refresco no vacía la tabla.
- Los colores de cada estado viven aquí (`coloresEstatus.js`), no en la entidad: son decisión de esta pantalla. `SelectCelda` recibe el mapa y lo usan las dos columnas.

## Quién lo usa

`pages/viajes`
