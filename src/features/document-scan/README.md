# features/document-scan

El lector de documentos de carga —rate confirmation, BOL, pickup sheet— que llena el origen o el destino de una etapa.

## Contenido

- `model/documentoCarga.js` — `agruparRenglones`, `interpretarDocumentoCarga`, `leerFecha`, `leerHora`, `puntaje`, `combinarParadas`
- `model/ocr.js` — `leerDocumentoCarga`
- `model/coincidencia.js` — `LADO_ESCANEO`, `CAMPOS_DE_ETAPA`, `bodegaParecida`, `paradaDelLado`, `camposPropuestos`, `valoresMarcados`, `cambiosDeEtapa`
- `ui/ModalLeerDocumento.jsx` — `ModalLeerDocumento`

Pruebas: `documentoCarga.test.js`, `coincidencia.test.js`.

## Cómo funciona

- Un PDF con texto se lee directo con pdf.js; una imagen o un PDF escaneado pasan por Tesseract (`tesseract.js`), que se carga solo al usarse. La primera vez descarga el idioma.
- El texto se arma en renglones por posición y se interpreta por reglas: tablas primero, secciones con etiqueta después. Solo reconoce direcciones de EUA (ciudad, estado de dos letras y zip).
- Nada se aplica sin revisar: cada campo trae su casilla. Una bodega que no está en el catálogo se ofrece para crear, pero sin marcar.
- Es el porte de `604de69` (Richard): las reglas se compararon contra el original con las mismas entradas y dan lo mismo.

## Quién lo usa

`components/trip-form/StageCard.jsx`
