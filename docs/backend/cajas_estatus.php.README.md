# cajas_estatus.php

Endpoint de la pantalla Estatus de cajas. Se sube al mismo directorio donde viven
`cajas_docs.php` y `conexion.php`.

## Confirmado contra producción (2026-09-21)

- `caja_trips_status(id, trip_id, status enum('Impo','Expo','Vacio'))` — es la tabla que
  escribe `Crud_caja_trips_status('I', trip_id, status)` desde el `add_status_caja_trips`
  de `new_tripsv2.php`. El `LEFT JOIN` de `getEstatusCajas` quedó como estaba.
- `conexion.php` va en minúsculas: el hosting es Linux y distingue mayúsculas.
- La fianza vigente es la fila de `cajas_documents` con `status = 1`; el procedimiento
  `crud_caja_docs` apaga la anterior. Por eso se ordena por `status DESC, doc_id DESC`
  y no por `fecha_vencimiento`.
- `tipo_documento` está en la base como `Fianza` y como `FIANZA`: la comparación va con
  `UPPER()`.
- La tabla `caja_estatus` ya está creada en producción.

## Pendiente

Probar en Chrome contra la base real y después portarlo al refactor.
