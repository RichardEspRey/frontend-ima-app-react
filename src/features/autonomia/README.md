# features/autonomia

La pantalla de Autonomía: el rendimiento en millas por galón de cada camión, carga por carga y en promedio.

## Contenido

- `model/useAutonomiaFlota.js` — `useAutonomiaFlota`
- `ui/TablaAutonomia.jsx` — `TablaAutonomia`
- `ui/coloresRendimiento.js` — `COLOR_NIVEL`, `colorTexto`

## Cómo funciona

- `useAutonomiaFlota` es el controlador: solo la consulta de `entities/autonomy`, aplanada.
- `TablaAutonomia` usa `DataTable`: cinco columnas de registro generadas desde `REGISTROS_POR_CAMION` y el promedio ordenable.
- El color de cada nivel de rendimiento vive aquí (`coloresRendimiento.js`); el umbral que lo decide es de la entidad.

## Quién lo usa

`pages/mantenimientos`
